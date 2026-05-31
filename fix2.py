with open('js/larkspur-animate.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if 'function rasterizeFromFlowers(panelId, callback) {' in line:
        start_idx = i
    if 'function uploadTexture(gl, texture, img) {' in line:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    del lines[start_idx:end_idx]

    new_code = '''    function rasterizeFromFlowers(panelId, callback) {
        var panel = document.getElementById(panelId);
        var svgEl = panel ? panel.querySelector('svg') : null;
        var svgW = 1440;
        var svgH = (svgEl && svgEl.viewBox) ? (svgEl.viewBox.baseVal.height * 1440 / svgEl.viewBox.baseVal.width) : 2560;
        if (svgW < 10 || svgH < 10) { svgW = 1440; svgH = 2560; }

        var cols = Math.ceil(svgW / 16) + 8;
        var rows = Math.ceil(svgH / 16) + 8;
        var groupData = new Uint8Array(cols * rows);

        var panelNum = parseInt(panelId.replace('panel', ''), 10);
        var flowers = (typeof _lastFlowers !== 'undefined') ? _lastFlowers[panelNum] : null;
        if (!flowers || flowers.length === 0) {
            callback(null);
            return;
        }

        var traits = (typeof RESOLVED_TRAITS !== 'undefined' && RESOLVED_TRAITS) ? RESOLVED_TRAITS : TRAITS;
        var mName = traits.motif;
        if (mName === 'larkspur-flower') mName = 'larkspur';

        var size = 16, rSize = 14; 
        var dpr = window.devicePixelRatio || 1;
        var sc = rSize / 20;

        var osc = document.createElement('canvas');
        osc.width = svgW * dpr;
        osc.height = svgH * dpr;
        var ctx = osc.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, svgW, svgH);

        var colorCounts = {};
        for (var i = 0; i < flowers.length; i++) {
            var c = flowers[i].c || '#ffffff';
            if (!colorCounts[c]) colorCounts[c] = { count: 0 };
            colorCounts[c].count++;
        }
        var colorKeys = Object.keys(colorCounts);
        colorKeys.sort(function(a, b) { return colorCounts[b].count - colorCounts[a].count; });

        var targetColor = null;
        var rndCap = 0;
        if (colorKeys.length >= 2) {
            targetColor = colorKeys[1];
        } else {
            rndCap = Math.floor(flowers.length * 0.33);
        }

        var targetIndices = new Set();
        if (!targetColor && rndCap > 0) {
            var pool = [];
            for (var i=0; i<flowers.length; i++) pool.push(i);
            pool.sort(function() { return 0.5 - Math.random(); });
            for (var i=0; i<Math.min(rndCap, pool.length); i++) targetIndices.add(pool[i]);
        }

        var pathCache = {};
        function getPathObj(mName) {
            if (pathCache[mName]) return pathCache[mName];
            var pStr = (typeof MOTIF_PATHS !== 'undefined') ? MOTIF_PATHS[mName] : null;
            if (!pStr) return null;
            var po = new Path2D(pStr);
            pathCache[mName] = po;
            return po;
        }

        var allPaths = svgEl ? svgEl.querySelectorAll('path[fill]') : [];
        if (allPaths.length !== flowers.length) {
            var pArr = Array.from(svgEl ? svgEl.querySelectorAll('path') : []);
            allPaths = pArr.filter(p => {
                var f = p.getAttribute('fill');
                return f && f !== 'none' || p.getAttribute('stroke') && p.getAttribute('stroke') !== 'none';
            });
        }

        var pathIdx = 0;
        for (var i = 0; i < flowers.length; i++) {
            var f = flowers[i];
            var c = f.c || '#ffffff';
            
            var currentMotifName = mName;
            if (traits.motif === 'typewriter') {
                if (f.wt < 0.20) continue;
                var _glyphSet;
                switch (traits.symmetry) {
                    case 'rotational': case 'radial': case 'kaleidoscope': case 'quad':
                        _glyphSet = ['typewriter_comma', 'typewriter_dot', 'typewriter_plus', 'typewriter_x', 'typewriter_asterisk']; break;
                    case 'diagonal': case 'glide':
                        _glyphSet = ['typewriter_comma', 'typewriter_dot', 'typewriter_slash', 'typewriter_x', 'typewriter_hash']; break;
                    case 'horizontal':
                        _glyphSet = ['typewriter_comma', 'typewriter_dash', 'typewriter_plus', 'typewriter_x', 'typewriter_hash']; break;
                    default:
                        _glyphSet = ['typewriter_comma', 'typewriter_dot', 'typewriter_plus', 'typewriter_x', 'typewriter_hash'];
                }
                var _levelIdx;
                if (f.wt < 0.36) _levelIdx = 0;
                else if (f.wt < 0.51) _levelIdx = 1;
                else if (f.wt < 0.66) _levelIdx = 2;
                else if (f.wt < 0.81) _levelIdx = 3;
                else _levelIdx = 4;
                var _inkRoll = ((f.x * 17 + f.y * 31) % 100) / 100;
                if (_inkRoll < 0.12 && _levelIdx > 0) _levelIdx--;
                currentMotifName = _glyphSet[_levelIdx];
            } else if (traits.motif === 'stars_and_stripes') {
                if (c.toUpperCase() === '#002868' || c.toUpperCase() === '#FFFFFF') currentMotifName = 'star';
                else currentMotifName = 'stripes';
            }

            var pathObj = getPathObj(currentMotifName);
            if (!pathObj) continue;
            
            var isFlicker = false;
            if (targetColor) {
                isFlicker = (c === targetColor);
            } else {
                isFlicker = targetIndices.has(i);
            }

            if (allPaths[pathIdx]) {
                allPaths[pathIdx].style.visibility = isFlicker ? 'hidden' : 'visible';
            }
            pathIdx++;

            if (!isFlicker) continue;

            var groupID = Math.floor(Math.random() * 32);
            var gx = f.x + 4;
            var gy = f.y + 4;
            if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                groupData[gy * cols + gx] = groupID;
            }

            ctx.globalAlpha = 1.0;
            var px = gx * size;
            var py = gy * size;

            ctx.save();
            ctx.translate(px + 1, py + 1);
            ctx.scale(sc, sc);

            if (f.flip) {
                ctx.translate(10, 10);
                ctx.rotate(Math.PI);
                ctx.translate(-10, -10);
            }
            if (f.rot) {
                ctx.translate(10, 10);
                ctx.rotate(f.rot * Math.PI / 180);
                ctx.translate(-10, -10);
            }

            ctx.fillStyle = f.c || '#ffffff';

            if (traits.motif === 'ichthus' && !traits.solid) {
                ctx.strokeStyle = f.c || '#ffffff';
                ctx.lineWidth = 2.4; 
                ctx.stroke(pathObj);
            } else if (traits.motif === 'quatrefoil' || traits.motif === 'tatreez') {
                ctx.fill(pathObj, 'evenodd');
            } else {
                ctx.fill(pathObj);
            }
            ctx.restore();
        }

        console.log('[LarkspurAnimate] Rasterized ' + flowers.length + ' motifs for ' + panelId);
        callback({ canvas: osc, data: groupData, cols: cols, rows: rows });
    }
'''
    
    lines.insert(start_idx, new_code)
    
    with open('js/larkspur-animate.js', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print("Replaced rasterizeFromFlowers successfully")
