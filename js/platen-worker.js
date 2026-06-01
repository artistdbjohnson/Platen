// PLATEN · by douglxss · github.com/artistdbjohnson/Platen
// Import the extracted modules for configuration, motifs, and generating parameters

// Added cache-busting for development
importScripts('platen-core.js?t=' + Date.now(), 'platen-motifs.js?t=' + Date.now(), 'platen-engines.js?t=' + Date.now());

onmessage = function (e) {
    var data = e.data;
    var traits = data.traits;
    var w = data.w || 78;
    var h = data.h || 148;
    var id = data.id || 1;
    var RENDER_SEED = data.seed;

    // Palette selection — supports both static arrays and dynamic generator functions
    var paletteEntry = PALETTES[traits.chromes] || PALETTES.panar;
    var cls = (typeof paletteEntry === 'function') ? paletteEntry(RENDER_SEED) : paletteEntry;
    var totalRatio = 0;
    for (var k = 0; k < cls.length; k++) totalRatio += cls[k].r;


    function rc(t) {
        for (var i = 0; i < cls.length; i++) {
            if (t < cls[i].r) return cls[i];
            t -= cls[i].r;
        }
        return cls[0]; // fallback
    }

    // Hybrid flower inversion
    function shouldFlipFlower(fx, fy) {
        var cx = w / 2, cy = h / 2;
        var baseFlip = false;
        switch (traits.symmetry) {
            case 'none': baseFlip = false; break;
            case 'vertical': baseFlip = fx >= cx; break;
            case 'horizontal': baseFlip = fy >= cy; break;
            case 'both': baseFlip = (fx >= cx) !== (fy >= cy); break;
            case 'diagonal': baseFlip = (fx / w) > (fy / h); break;
            case 'rotational': baseFlip = (fx >= cx) !== (fy >= cy); break;
            case 'quad': baseFlip = (fx >= cx) !== (fy >= cy); break;
            case 'kaleidoscope':
                var angle = Math.atan2(fy - cy, fx - cx);
                var sector = Math.floor(((angle + Math.PI) / (2 * Math.PI)) * 8);
                baseFlip = sector % 2 === 1;
                break;
            case 'glide':
                baseFlip = Math.floor(fy / (h / 8)) % 2 === 1;
                break;
            case 'radial':
                var rdx = fx - cx, rdy = fy - cy;
                var dist = Math.sqrt(rdx * rdx + rdy * rdy);
                var ring = Math.floor(dist / (Math.max(w, h) / 8));
                baseFlip = ring % 2 === 1;
                break;
        }
        // 12% deterministic scatter
        var scatter = ((fx * 7919 + fy * 6271) % 100);
        if (scatter < 12) baseFlip = !baseFlip;
        return baseFlip;
    }

    // Hyperbolic warp
    function warp(px, py) {
        if (traits.space !== 'hyperbolic') return [px, py];
        var cx = w / 2, cy = h / 2;
        var dx = (px - cx) / cx, dy = (py - cy) / cy;
        var r = Math.sqrt(dx * dx + dy * dy);
        var sc = r < 0.95 ? 1 / (1 - r * 0.35) : 4;
        return [cx + dx * sc * cx * 0.68, cy + dy * sc * cy * 0.68];
    }

    function irl(c) { c.run++; if (c.prev) irl(c.prev); }

    // Seed search
    var bestResult = null;
    var bestDist = Infinity;
    var bestSeed = 0;
    var searchSeed = RENDER_SEED + (id - 1) * 37;
    var attempts = 0, MAX_ATTEMPTS = 600;

    // Motif-based pattern parameters
    var patPRNG = makePRNG(RENDER_SEED + id * 1009);
    var patternType = traits.engine || 'mastor';
    var motifParams = generatePatternParams(traits.engine, patPRNG, w, h);

    while (attempts++ < MAX_ATTEMPTS) {
        var grid = [];
        for (var xi = 0; xi < w; xi++) {
            grid[xi] = [];
            for (var yi = 0; yi < h; yi++)
                grid[xi][yi] = { x: xi, y: yi, col: null, c: null, run: 0, prev: null };
        }

        var prng = makePRNG(searchSeed);
        var rfl = prng.rfl, rin = prng.rin;

        // Plane perturbation lines (Internal search)
        var pls = [];
        for (var pi = 0; pi < 3; pi++) {
            var o = rin(0, 1);
            pls.push([rfl(0, o ? h : w), o, rfl(8, 25)]);
        }

        // Pass 1: raw weights
        var rawWt = [];
        var wMin = Infinity, wMax = -Infinity;
        for (var cy = 0; cy < h; cy++) {
            for (var cx = 0; cx < w; cx++) {
                var wp = warp(cx, cy);
                var p = [wp[0], wp[1]], d;
                var qq = [cx + 16, cy + 16];
                for (var pli = 0; pli < pls.length; pli++) {
                    var pl = pls[pli];
                    d = (Math.abs(p[pl[1]] - pl[0]) + 1) / pl[2];
                    if (d < 1) {
                        p[0] = d * p[0] + (1 - d) * qq[0];
                        p[1] = d * p[1] + (1 - d) * qq[1];
                    }
                }
                var baseWt = calcMotifWeight(Math.round(p[0]), Math.round(p[1]), w, h, patternType, motifParams);
                // Dither/Jitter: Add small deterministic noise to spread colors across palette segments
                var jitter = baseWt > 0 ? (((cx * 37 + cy * 13) % 100) / 400.0) : 0;
                rawWt.push(baseWt + jitter);
                if (baseWt + jitter > wMax) wMax = baseWt + jitter;
            }
        }

        // Pass 2: normalize
        // We GROUND normalization to 0 so that background (0) maps to bottom of palette
        // and intentional weights map consistently to their density levels.
        var wMin = 0;
        var isFlat = (wMax - wMin) < 0.05;
        var wRange = isFlat ? 1 : (wMax - wMin);
        var ri2 = 0;
        for (var cy2 = 0; cy2 < h; cy2++) {
            for (var cx2 = 0; cx2 < w; cx2++) {
                var norm = (rawWt[ri2++] - wMin) / wRange;

                if (isFlat) {
                    // Flat field recovery: assign random noise
                    if (rfl() < 0.2) {
                        grid[cx2][cy2].col = rc(Math.floor(totalRatio / 2));
                        grid[cx2][cy2].wt = rfl() * 0.6 + 0.2; // non-zero height weight so it extrudes in isometric mode!
                    }
                } else {
                    // Skip the bottom ~7% of weights as background to let the raw canvas show through
                    if (norm > 0.07) {
                        grid[cx2][cy2].wt = norm;
                        if (traits.chromes === 'typewriter_black_red' || traits.chromes === 'typewriter_ribbon_multicolored') {
                            // Pseudo-random selection from the palette using coordinates and searchSeed
                            var hVal = Math.abs(cx2 * 31 + cy2 * 73 + searchSeed) % 1009;
                            var randRatio = (hVal / 1009.0) * totalRatio;
                            grid[cx2][cy2].col = rc(randRatio);
                        } else {
                            var c = Math.floor(norm * (totalRatio - 0.001)); // Map correctly to ratio sums
                            grid[cx2][cy2].col = rc(c);
                        }
                    }
                }
            }
        }

        // Apply symmetry
        var sym = traits.symmetry;
        if (sym === 'horizontal' || sym === 'both') {
            for (var sy = 0; sy < h; sy++)
                for (var sx = 0; sx < Math.floor(w / 2); sx++) {
                    grid[w - 1 - sx][sy].col = grid[sx][sy].col;
                    grid[w - 1 - sx][sy].wt = grid[sx][sy].wt;
                }
        }
        if (sym === 'vertical' || sym === 'both') {
            for (var sy2 = 0; sy2 < Math.floor(h / 2); sy2++)
                for (var sx2 = 0; sx2 < w; sx2++) {
                    grid[sx2][h - 1 - sy2].col = grid[sx2][sy2].col;
                    grid[sx2][h - 1 - sy2].wt = grid[sx2][sy2].wt;
                }
        }
        if (sym === 'diagonal') {
            for (var dy2 = 0; dy2 < h; dy2++)
                for (var dx2 = 0; dx2 < w; dx2++) {
                    var mx = Math.min(Math.floor(dx2 * h / w), h - 1);
                    var my = Math.min(Math.floor(dy2 * w / h), w - 1);
                    grid[dx2][dy2].col = grid[my][mx].col;
                    grid[dx2][dy2].wt = grid[my][mx].wt;
                }
        }
        if (sym === 'rotational') {
            for (var ry2 = 0; ry2 < h; ry2++)
                for (var rx2 = 0; rx2 < w; rx2++) {
                    var rrx = w - 1 - rx2, rry = h - 1 - ry2;
                    if (ry2 * w + rx2 > rry * w + rrx) {
                        grid[rx2][ry2].col = grid[rrx][rry].col;
                        grid[rx2][ry2].wt = grid[rrx][rry].wt;
                    }
                }
        }
        if (sym === 'quad') {
            var hw2 = Math.floor(w / 2), hh2 = Math.floor(h / 2);
            for (var qy = 0; qy < hh2; qy++)
                for (var qx = 0; qx < hw2; qx++) {
                    grid[w - 1 - qx][qy].col = grid[qx][qy].col;
                    grid[w - 1 - qx][qy].wt = grid[qx][qy].wt;
                    grid[qx][h - 1 - qy].col = grid[qx][qy].col;
                    grid[qx][h - 1 - qy].wt = grid[qx][qy].wt;
                    grid[w - 1 - qx][h - 1 - qy].col = grid[qx][qy].col;
                    grid[w - 1 - qx][h - 1 - qy].wt = grid[qx][qy].wt;
                }
        }

        // Count flowers
        var a = 0;
        for (var fy = 0; fy < h; fy++) {
            for (var fx = 0; fx < w; fx++) {
                if (grid[fx][fy].col) a++;
            }
        }

        // Track best result
        var curDist = 0;
        if (isFlat) {
            // Flat fields (monochromatic noise) are penalized heavily so we keep searching
            curDist = 10000;
        } else if (a < 600) {
            curDist = 1200 - a; // Penalize lack of flowers more
        } else if (a > 8000) {
            curDist = (a - 8000) * 0.5; // High density is better than blank
        } else {
            curDist = 0;
        }

        if (curDist < bestDist || bestResult === null) {
            bestDist = curDist;
            bestSeed = searchSeed;
            // Capture this grid's output
            var iterationResults = [];
            for (var fy3 = 0; fy3 < h; fy3++) {
                for (var fx3 = 0; fx3 < w; fx3++) {
                    var cell = grid[fx3][fy3];
                    if (cell.col) {
                        var wp3 = warp(cell.x, cell.y);
                        // Local cell scale (Jacobian of warp). In planar warp is identity → sc=1.
                        // In hyperbolic sc > 1 toward edges, < 1 toward centre. Capped at 3.5.
                        var _wp3dx = warp(cell.x + 1, cell.y);
                        var maxSc = traits.space === 'hyperbolic' ? 1.2 : 3.5;
                        var _sc = Math.min(Math.hypot(_wp3dx[0] - wp3[0], _wp3dx[1] - wp3[1]), maxSc);
                        
                        // Prevent typewriter glyphs from stretching in hyperbolic space
                        if (traits.space === 'hyperbolic' && (traits.motif === 'typewriter' || traits.motif === 'typewriter_classic' || traits.motif === 'chopin')) {
                            _sc = 1.0; 
                        }
                        
                        var rot = (function () {
                                if (traits.engine === 'river_flow') {
                                    // Calculate tangent of the flow at this point
                                    var dxSum = 0;
                                    var totalWt = 0;
                                    motifParams.streams.forEach(function (s) {
                                        var yOffset = 0;
                                        var slope = 0;
                                        s.frequencies.forEach(function (f) {
                                            var arg = fx3 * f.freq + f.phase;
                                            yOffset += Math.sin(arg) * f.amp;
                                            slope += Math.cos(arg) * f.amp * f.freq;
                                        });
                                        var curveY = s.baseY + yOffset;
                                        var dist = Math.abs(fy3 - curveY);
                                        if (dist < s.width) {
                                            var influence = 1.0 - (dist / s.width);
                                            dxSum += slope * influence;
                                            totalWt += influence;
                                        }
                                    });
                                    if (totalWt > 0) {
                                        var avgSlope = dxSum / totalWt;
                                        return Math.atan2(avgSlope, 1) * (180 / Math.PI);
                                    }
                                } else if (traits.engine === 'flowing_contours') {
                                    // Calculate gradient of the 2D scalar field: nabla Z = (dz/dx, dz/dy)
                                    var dzdx = 0;
                                    var dzdy = 0;
                                    motifParams.waves.forEach(function (w2) {
                                        var arg = fx3 * w2.fx + fy3 * w2.fy + w2.ph;
                                        var deriv = Math.cos(arg) * w2.amp;
                                        dzdx += deriv * w2.fx;
                                        dzdy += deriv * w2.fy;
                                    });
                                    // Tangent vector along the contour is (-dz/dy, dz/dx)
                                    return Math.atan2(dzdx, -dzdy) * (180 / Math.PI);
                                }
                                return (traits.motif === 'ichthus' && ((fx3 * 17 + fy3 * 7) % 100 < 40)) ? 90 : 0;
                            })();

                        iterationResults.push({
                            x: wp3[0], y: wp3[1],
                            c: cell.col.c,
                            wt: cell.wt, // Normalized weight (0..1) from grid
                            sc: _sc,     // local cell scale factor for hyperbolic fitting
                            flip: shouldFlipFlower(fx3, fy3),
                            rot: rot
                        });
                        
                        if (traits.motif === 'chopin') {
                            // Find a contrasting color from the palette array `cls`
                            var contrastColor = cell.col.c;
                            for (var cidx = 0; cidx < cls.length; cidx++) {
                                if (cls[cidx].c !== cell.col.c) {
                                    contrastColor = cls[cidx].c;
                                    break;
                                }
                            }
                            // Calculate a secondary warp with an offset (half a character width)
                            var wp3_offset = warp(cell.x + 0.5, cell.y + 0.5);
                            iterationResults.push({
                                x: wp3_offset[0], y: wp3_offset[1],
                                c: contrastColor,
                                wt: 1.0 - cell.wt, // Invert the weight for different text character selection
                                sc: _sc,
                                flip: !shouldFlipFlower(fx3, fy3),
                                rot: rot
                            });
                        }
                    }
                }
            }
            bestResult = iterationResults;
        }

        if (bestDist === 0) break;
        searchSeed++;
    }

    postMessage({
        id: id,
        flowers: bestResult,
        flowerCount: bestResult.length,
        seed: bestSeed,
        attempts: attempts
    });
};
