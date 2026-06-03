// PLATEN · by douglxss · github.com/artistdbjohnson/Platen
// Import the extracted modules for configuration, motifs, and generating parameters

importScripts('platen-core.js', 'platen-motifs.js', 'platen-engines.js');

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

    // Moire-specific parameters derived deterministically from RENDER_SEED
    var moireTheta = (3 + (RENDER_SEED % 1000) / 1000 * 4) * Math.PI / 180;
    var moireDriftRate = 0.0008 + (RENDER_SEED % 500) / 500 * 0.0015;
    var moireBandsPerLine = 8 + (RENDER_SEED % 800) / 800 * 8;
    var moireHasPass3 = (RENDER_SEED % 3 !== 0);

    function edgeNoise(cx, cy, si, RENDER_SEED) {
        var n = ((cx * 7331 + cy * 5003 + si * 1999 + RENDER_SEED) % 1000) / 1000;
        return (n - 0.5) * 2.5;
    }

    var moireStrips = [];
    var numStrips = 3 + (RENDER_SEED % 4);

    var gravX = w * (0.35 + ((RENDER_SEED * 2017) % 1000) / 1000 * 0.30);
    var gravY = h * (0.35 + ((RENDER_SEED * 3011) % 1000) / 1000 * 0.30);

    for (var si = 0; si < numStrips; si++) {
        var orientSeed = (RENDER_SEED * (si + 17) * 4789) % 100;
        var orient = "ACCENT";
        if (orientSeed < 40) orient = "VERTICAL";
        else if (orientSeed < 75) orient = "HORIZONTAL";
        
        var stripW, stripH, rawX, rawY;
        if (orient === "VERTICAL") {
            stripW = 8 + Math.floor(((RENDER_SEED * (si + 7) * 2311) % 1000) / 1000 * 15);
            stripH = Math.floor(h * (0.45 + ((RENDER_SEED * (si + 11) * 997) % 1000) / 1000 * 0.45));
            rawX = Math.floor(((RENDER_SEED * (si + 3) * 1733) % 1000) / 1000 * w);
            rawY = Math.floor(((RENDER_SEED * (si + 5) * 1453) % 1000) / 1000 * h);
        } else if (orient === "HORIZONTAL") {
            stripW = 30 + Math.floor(((RENDER_SEED * (si + 7) * 2311) % 1000) / 1000 * 41);
            stripH = 4 + Math.floor(((RENDER_SEED * (si + 11) * 997) % 1000) / 1000 * 11);
            rawX = Math.floor(((RENDER_SEED * (si + 3) * 1733) % 1000) / 1000 * w);
            rawY = Math.floor(((RENDER_SEED * (si + 5) * 1453) % 1000) / 1000 * h);
        } else {
            stripW = 3 + Math.floor(((RENDER_SEED * (si + 7) * 2311) % 1000) / 1000 * 8);
            stripH = 4 + Math.floor(((RENDER_SEED * (si + 11) * 997) % 1000) / 1000 * 9);
            rawX = Math.floor(((RENDER_SEED * (si + 3) * 1733) % 1000) / 1000 * w);
            rawY = Math.floor(((RENDER_SEED * (si + 5) * 1453) % 1000) / 1000 * h);
        }

        var finalX = rawX * 0.5 + gravX * 0.5;
        var finalY = rawY * 0.5 + gravY * 0.5;

        var stripX0 = Math.max(0, Math.floor(finalX - stripW / 2));
        var stripX1 = Math.min(w - 1, stripX0 + stripW);
        var stripY0 = Math.max(0, Math.floor(finalY - stripH / 2));
        var stripY1 = Math.min(h - 1, stripY0 + stripH);

        // Safety bounds validation and fallback to center-covering layout if invalid or too narrow
        var width = stripX1 - stripX0;
        var height = stripY1 - stripY0;
        var isInvalid = false;
        if (orient === "VERTICAL" && (width < 6 || height < 10 || stripX1 <= 0 || stripX0 >= w)) {
            isInvalid = true;
        } else if (orient === "HORIZONTAL" && (height < 4 || width < 15 || stripY1 <= 0 || stripY0 >= h)) {
            isInvalid = true;
        } else if (width < 3 || height < 3 || stripX1 <= 0 || stripX0 >= w || stripY1 <= 0 || stripY0 >= h) {
            isInvalid = true;
        }

        if (isInvalid) {
            if (orient === "VERTICAL") {
                stripX0 = Math.floor(w * 0.35);
                stripX1 = Math.ceil(w * 0.65);
                stripY0 = 0;
                stripY1 = h - 1;
            } else if (orient === "HORIZONTAL") {
                stripX0 = 0;
                stripX1 = w - 1;
                stripY0 = Math.floor(h * 0.35);
                stripY1 = Math.ceil(h * 0.65);
            } else {
                stripX0 = Math.floor(w * 0.25);
                stripX1 = Math.ceil(w * 0.75);
                stripY0 = Math.floor(h * 0.25);
                stripY1 = Math.ceil(h * 0.75);
            }
        }

        moireStrips.push({ 
            x0: stripX0, x1: stripX1, 
            y0: stripY0, y1: stripY1,
            phase: si
        });
    }


    function getMinGlyphs(traits) {
        if (traits.space === 'moire') return 400;
        var series = (typeof ENGINE_METADATA !== 'undefined' && ENGINE_METADATA[traits.engine]) ? ENGINE_METADATA[traits.engine].series : 'FIELD';
        if (series === 'SCATTER') return 400;
        if (series === 'FIELD') return 1200;
        if (series === 'SOLID') return 1000;
        return 900;
    }

    function getMinZones(traits) {
        if (traits.space === 'moire') return 0;
        var series = (typeof ENGINE_METADATA !== 'undefined' && ENGINE_METADATA[traits.engine]) ? ENGINE_METADATA[traits.engine].series : 'FIELD';
        if (series === 'SCATTER') return 4;
        if (series === 'FIELD') return 10;
        if (series === 'SOLID') return 8;
        return 8;
    }

    function applySymmetryAndFloor(grid) {
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

    // ── TASK 1: DENSITY SPACING FLOOR ──
    // Enforce spacing globally: clear cells within a Chebyshev distance of 1 of higher-weight cells.
    var candidates = [];
    if (traits.space !== 'moire' && 
        traits.space !== 'planar' && 
        traits.space !== 'polar' &&
        traits.space !== 'hyperbolic') {
        for (var xi = 0; xi < w; xi++) {
            for (var yi = 0; yi < h; yi++) {
                if (grid[xi][yi].col) {
                    candidates.push(grid[xi][yi]);
                }
            }
        }
    }
    // Sort candidates by weight descending, with a deterministic tie-breaker to preserve symmetry
    candidates.sort(function (a, b) {
        if (Math.abs(b.wt - a.wt) > 0.0001) {
            return b.wt - a.wt;
        }
        return (a.x * 1000 + a.y) - (b.x * 1000 + b.y);
    });

    var cleared = [];
    for (var xi = 0; xi < w; xi++) {
        cleared[xi] = [];
    }

    for (var ci = 0; ci < candidates.length; ci++) {
        var cell = candidates[ci];
        if (cleared[cell.x][cell.y]) {
            cell.col = null;
            cell.wt = 0;
            continue;
        }
        // Mark all 8 immediate neighbors as cleared, with coordinate wrapping
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                var nx = safeMod(cell.x + dx, w);
                var ny = safeMod(cell.y + dy, h);
                cleared[nx][ny] = true;
            }
        }
    }

    }

    function generateIterationResults(grid) {
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

                    var level = 0;
                    if (cell.wt < 0.36) level = 0;
                    else if (cell.wt < 0.51) level = 1;
                    else if (cell.wt < 0.66) level = 2;
                    else if (cell.wt < 0.81) level = 3;
                    else level = 4;

                    iterationResults.push({
                        x: wp3[0], y: wp3[1],
                        c: cell.col.c,
                        wt: cell.wt, // Normalized weight (0..1) from grid
                        sc: _sc,     // local cell scale factor for hyperbolic fitting
                        flip: shouldFlipFlower(fx3, fy3),
                        rot: rot,
                        level: level
                    });

                    if (traits.space === 'planar' && cell.col) {
                        // Multi-pass moire overlay for planar space (3 or 4 passes based on RENDER_SEED)
                        var numPasses = 3 + (RENDER_SEED % 2);
                        for (var pi = 0; pi < numPasses; pi++) {
                            var angle = (pi / numPasses) * Math.PI * 2 + moireTheta;
                            var magnitude = 1.0 + ((RENDER_SEED * (pi + 5) * 131) % 100) / 100 * 1.5;
                            var offX = Math.cos(angle) * magnitude;
                            var offY = Math.sin(angle) * magnitude;

                            var overlayX = fx3 + offX + (fy3 * moireDriftRate * 5);
                            var overlayY = fy3 + offY;

                            if (overlayY >= 0 && overlayY < h && overlayX >= 0 && overlayX < w) {
                                var wp3o = warp(overlayX, overlayY);
                                var moireContrast = cell.col.c;
                                var colorIdx = (pi + 1) % cls.length;
                                if (cls[colorIdx] && cls[colorIdx].c !== cell.col.c) {
                                    moireContrast = cls[colorIdx].c;
                                } else if (cls[(colorIdx + 1) % cls.length]) {
                                    moireContrast = cls[(colorIdx + 1) % cls.length].c;
                                }

                                var passWt = Math.max(0.1, cell.wt * (1.0 - (pi / numPasses) * 0.15));

                                iterationResults.push({
                                    x: wp3o[0],
                                    y: wp3o[1],
                                    c: moireContrast,
                                    wt: passWt,
                                    sc: _sc,
                                    flip: (pi % 2 === 0) ? shouldFlipFlower(fx3, fy3) : !shouldFlipFlower(fx3, fy3),
                                    rot: rot + (pi * 5),
                                    level: level
                                });
                            }
                        }
                    }

                    if (traits.space === 'polar' && cell.col) {
                        // Multi-pass moire overlay for polar space (3 or 4 passes based on RENDER_SEED)
                        var numPasses = 3 + (RENDER_SEED % 2);
                        for (var pi = 0; pi < numPasses; pi++) {
                            var angle = (pi / numPasses) * Math.PI * 2 + moireTheta;
                            var magnitude = 0.8 + ((RENDER_SEED * (pi + 5) * 131) % 100) / 100 * 1.2;
                            var offX = Math.cos(angle) * magnitude;
                            var offY = Math.sin(angle) * magnitude;

                            var overlayX = fx3 + offX + (fy3 * moireDriftRate * 5);
                            var overlayY = fy3 + offY;

                            if (overlayY >= 0 && overlayY < h && overlayX >= 0 && overlayX < w) {
                                var wp3o = warp(overlayX, overlayY);
                                var moireContrast = cell.col.c;
                                var colorIdx = (pi + 1) % cls.length;
                                if (cls[colorIdx] && cls[colorIdx].c !== cell.col.c) {
                                    moireContrast = cls[colorIdx].c;
                                } else if (cls[(colorIdx + 1) % cls.length]) {
                                    moireContrast = cls[(colorIdx + 1) % cls.length].c;
                                }

                                var passWt = Math.max(0.1, cell.wt * (1.0 - (pi / numPasses) * 0.15));

                                iterationResults.push({
                                    x: wp3o[0],
                                    y: wp3o[1],
                                    c: moireContrast,
                                    wt: passWt,
                                    sc: _sc,
                                    flip: (pi % 2 === 0) ? shouldFlipFlower(fx3, fy3) : !shouldFlipFlower(fx3, fy3),
                                    rot: rot + (pi * 5),
                                    level: level
                                });
                            }
                        }
                    }

                    if (traits.space === 'hyperbolic' && cell.col) {
                        // Multi-pass moire overlay for hyperbolic space (3 or 4 passes based on RENDER_SEED)
                        var numPasses = 3 + (RENDER_SEED % 2);
                        for (var pi = 0; pi < numPasses; pi++) {
                            var angle = (pi / numPasses) * Math.PI * 2 + moireTheta;
                            var magnitude = 1.0 + ((RENDER_SEED * (pi + 5) * 131) % 100) / 100 * 1.5;
                            var offX = Math.cos(angle) * magnitude;
                            var offY = Math.sin(angle) * magnitude;

                            var overlayX = fx3 + offX + (fy3 * moireDriftRate * 5);
                            var overlayY = fy3 + offY;

                            if (overlayY >= 0 && overlayY < h && overlayX >= 0 && overlayX < w) {
                                var wp3o = warp(overlayX, overlayY);
                                var moireContrast = cell.col.c;
                                var colorIdx = (pi + 1) % cls.length;
                                if (cls[colorIdx] && cls[colorIdx].c !== cell.col.c) {
                                    moireContrast = cls[colorIdx].c;
                                } else if (cls[(colorIdx + 1) % cls.length]) {
                                    moireContrast = cls[(colorIdx + 1) % cls.length].c;
                                }

                                var passWt = Math.max(0.1, cell.wt * (1.0 - (pi / numPasses) * 0.15));

                                iterationResults.push({
                                    x: wp3o[0],
                                    y: wp3o[1],
                                    c: moireContrast,
                                    wt: passWt,
                                    sc: _sc,
                                    flip: (pi % 2 === 0) ? shouldFlipFlower(fx3, fy3) : !shouldFlipFlower(fx3, fy3),
                                    rot: rot + (pi * 5),
                                    level: level
                                });
                            }
                        }
                    }

                    if (traits.space === 'moire' && cell.col) {
                        var numPasses = 4 + (RENDER_SEED % 3);

                        for (var pi = 0; pi < numPasses; pi++) {
                            var angle = (pi / numPasses) * Math.PI * 2
                                + moireTheta 
                                + ((RENDER_SEED * (pi + 3) * 1447) % 1000) / 1000 * 0.6;

                            var magnitude = 1.5 + 
                                ((RENDER_SEED * (pi + 7) * 2239) % 1000) / 1000 * 2.5;

                            var offX = Math.cos(angle) * magnitude;
                            var offY = Math.sin(angle) * magnitude;

                            var passX = fx3 + offX;
                            var passY = fy3 + offY;

                            if (passY < 0 || passY >= h || passX < 0 || passX >= w) continue;

                            var passColor = cell.col.c;
                            var colorIdx = pi % cls.length;
                            if (cls[colorIdx] && cls[colorIdx].c !== cell.col.c) {
                                passColor = cls[colorIdx].c;
                            } else if (cls[(colorIdx + 1) % cls.length]) {
                                passColor = cls[(colorIdx + 1) % cls.length].c;
                            }

                            var passWt = Math.max(0.1, 
                                cell.wt * (1.0 - (pi / numPasses) * 0.25)
                            );

                            var wp3p = warp(passX, passY);
                            iterationResults.push({
                                x: wp3p[0],
                                y: wp3p[1],
                                c: passColor,
                                wt: passWt,
                                sc: _sc,
                                flip: (pi % 2 === 0) 
                                    ? shouldFlipFlower(fx3, fy3) 
                                    : !shouldFlipFlower(fx3, fy3),
                                rot: (rot || 0) + (pi * 3),
                                level: level
                            });
                        }

                        var numGhosts = 1 + (RENDER_SEED % 2);
                        // 1 or 2 ghost passes per cell

                        for (var gi = 0; gi < numGhosts; gi++) {
                            var ghostAngle = ((RENDER_SEED * (gi + 23) * 3761) 
                                % 1000) / 1000 * Math.PI * 2;
                            var ghostMag = 5.0 + 
                                ((RENDER_SEED * (gi + 11) * 2953) % 1000) 
                                / 1000 * 3.0;
                            // Ghost magnitude: 5 to 8 cells.
                            
                            var ghostX = fx3 + Math.cos(ghostAngle) * ghostMag;
                            var ghostY = fy3 + Math.sin(ghostAngle) * ghostMag;
                            
                            if (ghostY < 0 || ghostY >= h || 
                                ghostX < 0 || ghostX >= w) continue;
                            
                            // Ghost weight: very light, 15% to 30% of source.
                            var ghostWt = cell.wt * (0.15 + 
                                ((fx3 * 13 + fy3 * 7) % 100) / 100 * 0.15);
                            
                            // Ghost color: primary ink color, not contrast.
                            var wp3g = warp(ghostX, ghostY);
                            iterationResults.push({
                                x: wp3g[0],
                                y: wp3g[1],
                                c: cell.col.c,
                                wt: ghostWt,
                                sc: _sc,
                                flip: shouldFlipFlower(fx3, fy3),
                                rot: (rot || 0) + (gi * 7),
                                level: 0
                            });
                        }
                    }
                    
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
                            rot: rot,
                            level: level
                        });
                    }
                }
            }
        }
        return iterationResults;
    }

    function reRenderWithThreshold(grid, rawWt, wMin, wRange, isFlat, threshold, seed) {
        var ri2 = 0;
        var prng = makePRNG(seed);
        var rfl = prng.rfl;
        
        for (var cy2 = 0; cy2 < h; cy2++) {
            for (var cx2 = 0; cx2 < w; cx2++) {
                grid[cx2][cy2].col = null;
                grid[cx2][cy2].wt = 0;
                var norm = (rawWt[ri2++] - wMin) / wRange;

                if (isFlat) {
                    if (rfl() < 0.2) {
                        grid[cx2][cy2].col = rc(Math.floor(totalRatio / 2));
                        grid[cx2][cy2].wt = rfl() * 0.6 + 0.2;
                    }
                } else {
                    if (norm > threshold) {
                        grid[cx2][cy2].wt = norm;
                        if (traits.chromes === 'typewriter_black_red' || traits.chromes === 'typewriter_ribbon_multicolored') {
                            var hVal = Math.abs(cx2 * 31 + cy2 * 73 + seed) % 1009;
                            var randRatio = (hVal / 1009.0) * totalRatio;
                            grid[cx2][cy2].col = rc(randRatio);
                        } else {
                            var c = Math.floor(norm * (totalRatio - 0.001));
                            grid[cx2][cy2].col = rc(c);
                        }
                    }
                }
            }
        }
        applySymmetryAndFloor(grid);
        return generateIterationResults(grid);
    }

    function runSearchIteration(currentSeed) {
        var grid = [];
        for (var xi = 0; xi < w; xi++) {
            grid[xi] = [];
            for (var yi = 0; yi < h; yi++)
                grid[xi][yi] = { x: xi, y: yi, col: null, c: null, run: 0, prev: null };
        }

        var prng = makePRNG(currentSeed);
        var rfl = prng.rfl, rin = prng.rin;
        // Plane perturbation lines (Internal search)
        var pls = [];
        for (var pi = 0; pi < 3; pi++) {
            var o = rin(0, 1);
            pls.push([rfl(0, o ? h : w), o, rfl(8, 25)]);
        }

        // Pass 1: raw weights
        var rawWt = [];
        var wMax = -Infinity;
        for (var cy = 0; cy < h; cy++) {
            for (var cx = 0; cx < w; cx++) {
                if (traits.space === 'planar') {
                    var p = [cx, cy], d;
                    var qq = [cx + 16, cy + 16];
                    for (var pli = 0; pli < pls.length; pli++) {
                        var pl = pls[pli];
                        d = (Math.abs(p[pl[1]] - pl[0]) + 1) / pl[2];
                        if (d < 1) {
                            p[0] = d * p[0] + (1 - d) * qq[0];
                            p[1] = d * p[1] + (1 - d) * qq[1];
                        }
                    }
                    var engineWeight = calcMotifWeight(Math.round(p[0]), Math.round(p[1]), w, h, patternType, motifParams);

                    // MOIRE produces its strongest effect with two-color split ribbon palettes.
                    // typewriter_black_red and typewriter_ribbon_multicolored are the natural pairings.
                    baseWt = engineWeight;
                } else if (traits.space === 'moire') {
                    var p = [cx, cy], d;
                    var qq = [cx + 16, cy + 16];
                    for (var pli = 0; pli < pls.length; pli++) {
                        var pl = pls[pli];
                        d = (Math.abs(p[pl[1]] - pl[0]) + 1) / pl[2];
                        if (d < 1) {
                            p[0] = d * p[0] + (1 - d) * qq[0];
                            p[1] = d * p[1] + (1 - d) * qq[1];
                        }
                    }
                    var engineWeight = calcMotifWeight(Math.round(p[0]), Math.round(p[1]), w, h, patternType, motifParams);

                    var stripCount = 0;
                    for (var si2 = 0; si2 < moireStrips.length; si2++) {
                        var ms = moireStrips[si2];
                        if (cx >= ms.x0 + edgeNoise(cx, cy, ms.phase, RENDER_SEED) && 
                            cx <= ms.x1 - edgeNoise(cx, cy, ms.phase, RENDER_SEED) && 
                            cy >= ms.y0 + edgeNoise(cx, cy, ms.phase, RENDER_SEED) && 
                            cy <= ms.y1 - edgeNoise(cx, cy, ms.phase, RENDER_SEED)) {
                            stripCount++;
                        }
                    }

                    if (stripCount === 0) {
                        baseWt = 0;
                    } else if (stripCount === 1) {
                        baseWt = Math.max(0.15, engineWeight);
                    } else {
                        var rawWtVal = Math.min(1.0, engineWeight * (1.0 + (stripCount - 1) * 1.2));
                        baseWt = Math.max(0.25, rawWtVal);
                    }
                } else {
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
                    baseWt = calcMotifWeight(Math.round(p[0]), Math.round(p[1]), w, h, patternType, motifParams);
                }

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
                    var normThreshold = 
                        (traits.space === 'moire') ? 0.02 :
                        (traits.space === 'planar') ? 0.02 :
                        (traits.space === 'polar') ? 0.02 :
                        (traits.space === 'hyperbolic') ? 0.02 : 0.07;
                    if (norm > normThreshold) {
                        grid[cx2][cy2].wt = norm;
                        if (traits.chromes === 'typewriter_black_red' || traits.chromes === 'typewriter_ribbon_multicolored') {
                            // Pseudo-random selection from the palette using coordinates and currentSeed
                            var hVal = Math.abs(cx2 * 31 + cy2 * 73 + currentSeed) % 1009;
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


        applySymmetryAndFloor(grid);

        // Count flowers
        var a = 0;
        var zoneW = Math.ceil(w / 4);
        var zoneH = Math.ceil(h / 4);
        var zones = [];
        for (var zi = 0; zi < 16; zi++) zones[zi] = false;

        for (var fy = 0; fy < h; fy++) {
            for (var fx = 0; fx < w; fx++) {
                if (grid[fx][fy].col) {
                    a++;
                    var zx = Math.floor(fx / zoneW);
                    var zy = Math.floor(fy / zoneH);
                    zones[zy * 4 + zx] = true;
                }
            }
        }
        var zonesOccupied = zones.filter(Boolean).length;

        // Track best result
        var curDist = 0;
        var minGlyphs = (traits.space === 'moire' || 
                         traits.space === 'planar' ||
                         traits.space === 'polar' ||
                         traits.space === 'hyperbolic') 
                         ? 80 : 600;
        var minPenalty = (traits.space === 'moire' || 
                          traits.space === 'planar' ||
                          traits.space === 'polar' ||
                          traits.space === 'hyperbolic') 
                          ? 200 : 1200;
        var maxGlyphs = (traits.space === 'moire') ? 150000 : 
                        (traits.space === 'planar' || 
                         traits.space === 'polar' ||
                         traits.space === 'hyperbolic') 
                         ? 20000 : 8000;
        
        if (isFlat) {
            curDist = 10000;
        } else if (a < minGlyphs) {
            curDist = minPenalty - a;
        } else if (a > maxGlyphs) {
            curDist = (a - maxGlyphs) * 0.5;
        } else {
            curDist = 0;
        }

        var minZones = getMinZones(traits);
        if (zonesOccupied < minZones) {
            curDist += (minZones - zonesOccupied) * 150;
        }

        return { grid: grid, rawWt: rawWt, wMin: wMin, wRange: wRange, isFlat: isFlat, a: a, dist: curDist, zonesOccupied: zonesOccupied };
    }

    var bestGrid = null, bestRawWt = null, bestWMin = 0, bestWRange = 1, bestIsFlat = false;

    while (attempts++ < MAX_ATTEMPTS) {
        var res = runSearchIteration(searchSeed);

        if (res.dist < bestDist || bestResult === null) {
            bestDist = res.dist;
            bestSeed = searchSeed;
            bestGrid = res.grid;
            bestRawWt = res.rawWt;
            bestWMin = res.wMin;
            bestWRange = res.wRange;
            bestIsFlat = res.isFlat;
            bestResult = generateIterationResults(bestGrid);
        }

        if (bestDist === 0) break;
        searchSeed++;
    }

    var EXTENDED_ATTEMPTS = 200;
    if (bestDist > 300 && traits.space !== 'moire') {
        var extraAttempts = 0;
        while (extraAttempts++ < EXTENDED_ATTEMPTS && bestDist > 300) {
            var res = runSearchIteration(searchSeed);
            if (res.dist < bestDist) {
                bestDist = res.dist;
                bestSeed = searchSeed;
                bestGrid = res.grid;
                bestRawWt = res.rawWt;
                bestWMin = res.wMin;
                bestWRange = res.wRange;
                bestIsFlat = res.isFlat;
                bestResult = generateIterationResults(bestGrid);
            }
            if (bestDist === 0) break;
            searchSeed++;
            attempts++;
        }
    }

    var finalCount = bestResult ? bestResult.length : 0;
    var qualityMin = getMinGlyphs(traits);

    if (finalCount < qualityMin) {
        var boostThresholds = (traits.space === 'moire') ? [0.01, 0.005, 0.0] : [0.05, 0.03, 0.01];
        for (var bi = 0; bi < boostThresholds.length; bi++) {
            var boostResult = reRenderWithThreshold(
                bestGrid, bestRawWt, bestWMin, bestWRange, bestIsFlat, boostThresholds[bi], bestSeed
            );
            if (boostResult.length >= qualityMin) {
                bestResult = boostResult;
                break;
            }
        }
    }

    postMessage({
        id: id,
        flowers: bestResult,
        flowerCount: bestResult.length,
        seed: bestSeed,
        attempts: attempts
    });
};
