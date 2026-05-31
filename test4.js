
        function onAnimThresh(v) {
            LarkspurAnimate.setBrightThresh(parseFloat(v) / 100.0);
            var el = document.getElementById('anim-thresh-val');
            if (el) el.textContent = v;
        }

        function toggleRecord() {
            var speed = LarkspurAnimate.getSpeed();
            LarkspurRecorder.toggle(speed);
        }

        // â”€â”€ Larkspur Key Animation Engine (AE Hyperspeed) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
        var LarkspurKeyAnim = (function() {
            var isKeyAnimOn = false;
            var _animatedPaths = [];
            var _rafId = null; // Unused in pure CSS mode but kept for compat
            var USE_CANVAS_OVERLAY = false;
            var _mappedPaths = [];
            var _canvasCtx = null;
            var _bgColor = '#111111';
            var _animCanvasOverride = null;
            var _cachedSVGs = {};
            var NUM_GROUPS = 32;

            // Simple fast deterministic hash
            function hash(seed) {
                var x = Math.sin(seed * 12.9898) * 43758.5453;
                return x - Math.floor(x);
            }

            // Inject CSS once for ultra-fast CSS keyframe animations (Zero JS overhead)
            if (!document.getElementById('keyanim-css')) {
                var style = document.createElement('style');
                style.id = 'keyanim-css';
                var css = '';
                var duration = 1.0; // 1 second loop
                var frames = 32;
                var probability = 47;
                var pctPerFrame = 100 / frames;
                
                for (var g = 0; g < NUM_GROUPS; g++) {
                    css += '@keyframes kf-g' + g + ' {\n';
                    for (var f = 0; f <= frames; f++) {
                        var pct = (f * pctPerFrame).toFixed(2);
                        if (f === frames) pct = '100'; // ensure 100% cap
                        var seed = (g * 999) + f;
                        var rnd = hash(seed) * 100;
                        var vis = (rnd < probability) ? 'visible' : 'hidden';
                        css += '  ' + pct + '% { visibility: ' + vis + '; }\n';
                    }
                    css += '}\n';
                    css += '.keyanim-g' + g + ' { animation: kf-g' + g + ' ' + duration + 's infinite step-end !important; }\n';
                }
                style.textContent = css;
                document.head.appendChild(style);
            }

            function setupCanvasOverlay() {
                var wrap = document.getElementById('canvas-wrap');
                if (!wrap) return false;
                
                if (!_canvasOverlay) {
                    _canvasOverlay = document.createElement('canvas');
                    _canvasOverlay.id = 'keyanim-overlay-canvas';
                    _canvasOverlay.style.position = 'absolute';
                    _canvasOverlay.style.top = '0';
                    _canvasOverlay.style.left = '0';
                    _canvasOverlay.style.pointerEvents = 'none';
                    _canvasOverlay.style.zIndex = '999';
                    wrap.style.position = 'relative';
                    wrap.appendChild(_canvasOverlay);
                }
                
                var rect = wrap.getBoundingClientRect();
                _canvasOverlay.width = rect.width;
                _canvasOverlay.height = rect.height;
                _canvasOverlay.style.width = rect.width + 'px';
                _canvasOverlay.style.height = rect.height + 'px';
                
                _canvasCtx = _canvasOverlay.getContext('2d');
                
                if (TRAITS.canvas === 'white') _bgColor = '#ffffff';
                else if (TRAITS.canvas === 'tan') _bgColor = '#f2ecd8';
                else if (TRAITS.canvas === 'olive') _bgColor = '#3c4033';
                else if (TRAITS.canvas === 'graph_paper') _bgColor = '#ffffff';
                else _bgColor = '#1a1724'; // standard black
                
                return true;
            }

            function applyAnimation() {
                var panels = activePanels();
                if (!panels.length) return;
                
                // Clear old state
                stopAnimation();
                isKeyAnimOn = true;

                // Virtualised Animation Layering cache
                var isTriptych = (currentLayout.indexOf('triptych') !== -1 || currentLayout === 'banner_16_9' || currentLayout === 'banner_1_1' || currentLayout === 'banner_us_letter' && panels.length > 1);

                var colorCounts = {};
                var allPaths = [];

                panels.forEach(function(pid) {
                    var svg = document.getElementById('s' + pid);
                    if (!svg) return;
                    
                    if (isTriptych && !_cachedSVGs[pid]) {
                        _cachedSVGs[pid] = svg.cloneNode(true);
                    }

                    // Exclude text or bg rects
                    var paths = Array.from(svg.querySelectorAll('path[fill]'));
                    paths.forEach(function(p) {
                        var c = p.getAttribute('fill') || '#000000';
                        if (c === 'none') c = p.getAttribute('stroke') || '#000000';
                        
                        if (!colorCounts[c]) colorCounts[c] = { count: 0 };
                        colorCounts[c].count++;
                        
                        allPaths.push({ path: p, color: c, svg: svg, pid: pid });
                    });
                });

                if (allPaths.length === 0) {
                    console.log('[LarkspurKeyAnim] No paths found');
                    return;
                }

                // Sort colors by dominance (highest count first)
                var colorKeys = Object.keys(colorCounts);
                colorKeys.sort(function(a, b) {
                    return colorCounts[b].count - colorCounts[a].count;
                });

                var targetPaths = [];

                if (colorKeys.length >= 2) {
                    var targetColor = colorKeys[1]; // 2nd most dominant
                    console.log('[LarkspurKeyAnim] 2nd most dominant color: ' + targetColor + ' (Count: ' + colorCounts[targetColor].count + ')');
                    
                    allPaths.forEach(function(item) {
                        if (item.color === targetColor) targetPaths.push(item);
                    });
                    
                    // No artificial cap. Animate ALL motifs of this color to create color rivers.
                } else {
                    // Monochrome (only 1 color)
                    var rndCap = Math.floor(allPaths.length * 0.33); // Animate roughly 33%
                    console.log('[LarkspurKeyAnim] Monochrome. Randomly selecting ' + rndCap + ' motifs across canvas.');
                    
                    var isBlack = false;
                    if (colorKeys[0] && colorKeys[0].startsWith('#')) {
                        var c = colorKeys[0];
                        var r = parseInt(c.substr(1,2), 16);
                        var g = parseInt(c.substr(3,2), 16);
                        var b = parseInt(c.substr(5,2), 16);
                        if (r <= 65 && g <= 65 && b <= 65 && Math.abs(r-g) <= 15 && Math.abs(r-b) <= 15) {
                            isBlack = true;
                        }
                    }
                    
                    if (isBlack && TRAITS.canvas !== 'tan') {
                        console.log('[LarkspurKeyAnim] Monochrome black detected. Temporarily switching canvas to tan.');
                        _animCanvasOverride = TRAITS.canvas;
                        TRAITS.canvas = 'tan';
                        if (typeof updateCanvasTexture === 'function') updateCanvasTexture();
                    }
                    
                    var pool = allPaths.slice();
                    pool.sort(function() { return 0.5 - Math.random(); });
                    targetPaths = pool.slice(0, Math.min(rndCap, pool.length));
                }

                    var targetSet = new Set(targetPaths.map(function(item) { return item.path; }));

                    if (isTriptych) {
                        // Generate static background image for each panel
                        panels.forEach(function(pid) {
                            var svg = document.getElementById('s' + pid);
                            var staticPaths = allPaths.filter(function(item) { return item.pid == pid && !targetSet.has(item.path); });
                            
                            var newSvg = svg.cloneNode(false);
                            var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                            staticPaths.forEach(function(item) {
                                g.appendChild(item.path.cloneNode(true));
                            });
                            newSvg.appendChild(g);
                            
                            var str = new XMLSerializer().serializeToString(newSvg);
                            var blob = new Blob([str], { type: 'image/svg+xml' });
                            var url = URL.createObjectURL(blob);
                            
                            var panelDiv = document.getElementById('panel-' + pid);
                            if (panelDiv) {
                                panelDiv.dataset.originalBg = panelDiv.style.backgroundImage || '';
                                if (panelDiv.style.backgroundImage && panelDiv.style.backgroundImage !== 'none') {
                                    panelDiv.style.backgroundImage = 'url("' + url + '"), ' + panelDiv.style.backgroundImage;
                                } else {
                                    panelDiv.style.backgroundImage = 'url("' + url + '")';
                                }
                                panelDiv.dataset.staticSvgUrl = url;
                            }
                            
                            // Remove static paths from active DOM to save compositor
                            staticPaths.forEach(function(item) {
                                if (item.path.parentNode) item.path.parentNode.removeChild(item.path);
                            });
                        });
                    }

                    _animatedPaths = targetPaths.map(function(item) {
                        var g = Math.floor(Math.random() * NUM_GROUPS);
                        var currentClass = item.path.getAttribute('class') || '';
                        var cleanClass = currentClass.replace(/keyanim-path/g, '').replace(/keyanim-g\d+/g, '').trim();
                        item.path.setAttribute('class', (cleanClass + ' keyanim-path keyanim-g' + g).trim());
                        return { path: item.path, originalClass: cleanClass };
                    });
                
                if (_animatedPaths.length > 0 || _mappedPaths.length > 0) {
                    // CSS animations handle the rendering directly, no RAF loop required
                }
            }

            function stopAnimation() {
                if (_animCanvasOverride !== null) {
                    TRAITS.canvas = _animCanvasOverride;
                    if (typeof updateCanvasTexture === 'function') updateCanvasTexture();
                    _animCanvasOverride = null;
                }
                
                for (var i = 0; i < _animatedPaths.length; i++) {
                    var item = _animatedPaths[i];
                    if (item.path && item.path.parentNode) {
                        item.path.setAttribute('class', item.originalClass);
                        item.path.style.visibility = '';
                        item.path.style.opacity = '';
                    }
                }
                
                // Restore triptych cached SVGs
                var panels = activePanels();
                panels.forEach(function(pid) {
                    var panelDiv = document.getElementById('panel-' + pid);
                    if (panelDiv && panelDiv.dataset.staticSvgUrl) {
                        URL.revokeObjectURL(panelDiv.dataset.staticSvgUrl);
                        panelDiv.style.backgroundImage = panelDiv.dataset.originalBg || '';
                        panelDiv.dataset.staticSvgUrl = '';
                    }
                    
                    if (_cachedSVGs && _cachedSVGs[pid]) {
                        var svg = document.getElementById('s' + pid);
                        if (svg && svg.parentNode) {
                            svg.parentNode.replaceChild(_cachedSVGs[pid].cloneNode(true), svg);
                        }
                    }
                });
                _cachedSVGs = {}; // Clear cache

                _animatedPaths = [];
                _mappedPaths = [];
            }

            return {
                toggle: function() {
                    isKeyAnimOn = !isKeyAnimOn;
                    if (isKeyAnimOn) {
                        applyAnimation();
                    } else {
                        stopAnimation();
                    }
                    return isKeyAnimOn;
                },
                isOn: function() { return isKeyAnimOn; },
                refresh: function() { if (isKeyAnimOn) applyAnimation(); }
            };
        })();

