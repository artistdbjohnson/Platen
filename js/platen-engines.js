// PLATEN · by douglxss · github.com/artistdbjohnson/Platen
// ── ENGINE WEIGHT CALCULATOR ───────────────────────────────────────────────────────────────

function engineRadialWave(x, y, w, h) {
    var dx = x - w / 2;
    var dy = y - h / 2;
    var d = Math.sqrt(dx * dx + dy * dy);
    var f1 = 0.15, f2 = 0.18;
    var w1 = Math.sin(d * f1);
    var w2 = Math.sin(d * f2);
    var wt = (w1 + w2) * 0.5;
    return Math.min(1.0, Math.max(0.0, (wt + 1.0) * 0.5));
}

function engineFlowField(x, y, w, h) {
    var angle = Math.sin(x * 0.05) * Math.cos(y * 0.05) * Math.PI;
    var vx = Math.cos(angle);
    var vy = Math.sin(angle);
    var val = Math.sin(x * vx * 0.1 + y * vy * 0.1);
    return Math.min(1.0, Math.max(0.0, (val + 1.0) * 0.5));
}

function engineLatticeResonance(x, y, w, h) {
    var grid1 = Math.sin(x * 0.2) * Math.sin(y * 0.2);
    var grid2 = Math.sin((x + 10) * 0.22) * Math.sin((y + 5) * 0.22);
    var moire = (grid1 + grid2) * 0.5;
    return Math.min(1.0, Math.max(0.0, (moire + 1.0) * 0.5));
}

function engineReactionDiffusion(x, y, w, h) {
    var val1 = Math.sin(x * 0.15) * Math.cos(y * 0.15);
    var val2 = Math.cos(x * 0.07 + y * 0.07);
    var val3 = Math.sin(x * 0.04 - y * 0.04);
    var combined = (val1 + val2 + val3) / 3.0;
    var turing = 1.0 / (1.0 + Math.exp(-10.0 * (combined - 0.1)));
    return Math.min(1.0, Math.max(0.0, turing));
}

function engineLogSpiral(x, y, w, h) {
    var dx = x - w / 2;
    var dy = y - h / 2;
    var angle = Math.atan2(dy, dx);
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r < 0.0001) r = 0.0001;
    var spiralVal = Math.sin(5.0 * angle - 3.0 * Math.log(r));
    return Math.min(1.0, Math.max(0.0, (spiralVal + 1.0) * 0.5));
}

function engineHyperbolicTiling(x, y, w, h) {
    var hw = w / 2.0;
    var hh = h / 2.0;
    if (hw === 0) hw = 1.0;
    if (hh === 0) hh = 1.0;
    var dx = (x - hw) / hw;
    var dy = (y - hh) / hh;
    var r = Math.sqrt(dx * dx + dy * dy);
    if (r >= 1.0) r = 0.999;
    var hypDist = Math.log((1.0 + r) / (1.0 - r));
    var tile = Math.sin(hypDist * 6.0 + Math.atan2(dy, dx) * 8.0);
    return Math.min(1.0, Math.max(0.0, (tile + 1.0) * 0.5));
}

function engineVoronoiField(x, y, w, h) {
    var numSeeds = 8;
    var minDist = Infinity;
    var secondMinDist = Infinity;
    for (var si = 0; si < numSeeds; si++) {
        var seedX = (Math.sin(si * 123.456) * 0.5 + 0.5) * w;
        var seedY = (Math.cos(si * 789.101) * 0.5 + 0.5) * h;
        var dist = Math.sqrt((x - seedX) * (x - seedX) + (y - seedY) * (y - seedY));
        if (dist < minDist) {
            secondMinDist = minDist;
            minDist = dist;
        } else if (dist < secondMinDist) {
            secondMinDist = dist;
        }
    }
    var cellEdge = secondMinDist - minDist;
    var maxRange = Math.max(w, h) * 0.15;
    if (maxRange === 0) maxRange = 1.0;
    var vVal = cellEdge / maxRange;
    return Math.min(1.0, Math.max(0.0, vVal));
}

function engineStandingWave(x, y, w, h) {
    var a1 = 0, a2 = Math.PI / 3.0, a3 = 2.0 * Math.PI / 3.0;
    var w1 = Math.sin(x * Math.cos(a1) * 0.15 + y * Math.sin(a1) * 0.15);
    var w2 = Math.sin(x * Math.cos(a2) * 0.15 + y * Math.sin(a2) * 0.15);
    var w3 = Math.sin(x * Math.cos(a3) * 0.15 + y * Math.sin(a3) * 0.15);
    var superposed = (w1 + w2 + w3) / 3.0;
    return Math.min(1.0, Math.max(0.0, (superposed + 1.0) * 0.5));
}

function engineTangentField(x, y, w, h) {
    var t1 = Math.tan(x * 0.05 + y * 0.05);
    var t2 = Math.tan(x * 0.05 - y * 0.05);
    var sum = Math.sin(t1 + t2);
    return Math.min(1.0, Math.max(0.0, (sum + 1.0) * 0.5));
}

function engineNoiseField(x, y, w, h) {
    var val = 0.0;
    var freq = 0.05;
    var amp = 1.0;
    for (var oct = 0; oct < 3; oct++) {
        var n = Math.sin(x * freq + y * 0.02) * Math.cos(y * freq - x * 0.01);
        val += n * amp;
        freq *= 2.1;
        amp *= 0.5;
    }
    return Math.min(1.0, Math.max(0.0, (val / 1.75 + 1.0) * 0.5));
}

// Returns total motif weight for cell (x,y) based on engine type + params.
function calcMotifWeight(x, y, w, h, engine, params) {
    // Global coordinate wrapping: Ensure all engines tile correctly
    x = safeMod(x, w);
    y = safeMod(y, h);
    var wt = 0;
    switch (engine) {
        case 'railyard':
            // Railyard / shipping container yard - tracks with staggered ribbed containers
            var trackY = safeMod(y, params.trackSpacing);
            var isTrack = trackY < 4 || trackY > params.trackSpacing - 4;
            
            if (isTrack) {
                // Railroad tracks
                if (safeMod(x, 8) < 2) wt += params.trackWt * 1.5; // cross ties
                else wt += params.trackWt; // rails
            } else {
                // Containers on tracks
                var trackIdx = Math.floor(y / params.trackSpacing);
                var offset = safeMod(trackIdx * 193, params.containerLength); // Stagger containers by track
                var carX = safeMod(x + offset, params.containerLength + params.containerGap);
                
                var paddingY = params.trackSpacing * 0.15;
                if (carX < params.containerLength && trackY > paddingY && trackY < params.trackSpacing - paddingY) {
                    wt += params.trainWt; // Container body
                    // Corrugated container ridges
                    if (safeMod(x, 8) < 4) wt += params.trainWt * 0.4;
                } else {
                    wt += params.yardWt; // Empty concrete yard
                }
            }
            break;

        case 'adire':
            wt = engineReactionDiffusion(x, y, w, h) * (params.waveWt || 8.0);
            break;

        case 'kente':
            // Asante staggered sequence blocks
            var stripIdx = Math.floor(x / params.stripW);
            var stripOffset = stripIdx * (params.blockH / 3); // Stagger strips vertically
            var adjustedY = y + stripOffset;

            var stripPhaseX = safeMod(x, params.stripW);

            // Thick seams separating strips
            if (stripPhaseX < params.seamW || stripPhaseX > params.stripW - params.seamW) {
                if (safeMod(stripPhaseX, 2) === 0) wt += params.seamWt; // dashed/stitch effect
            } else {
                // Inside the strip - sequence blocks
                var blockIdx = Math.floor(adjustedY / params.blockH);
                var motifType = safeMod(stripIdx + blockIdx, 4); // Alternate 4 patterns

                var localX = stripPhaseX - params.stripW / 2;
                var localY = Math.abs(safeMod(adjustedY, params.blockH) - params.blockH / 2);

                if (motifType === 0) {
                    // tightly packed checkered
                    wt += motifLattice(localX, localY, params.cP, params.cT) * params.cWt;
                } else if (motifType === 1) {
                    // dense parallel weft lines
                    if (safeMod(localY, params.wP) < params.wT) wt += params.wWt;
                } else if (motifType === 2) {
                    // stepped block steps
                    wt += motifStepped(localX, localY, params.sP, params.sT, 0) * params.sWt;
                } else {
                    // solid block
                    if (Math.abs(localX - params.stripW / 2) < params.stripW * 0.4 && Math.abs(localY - params.blockH / 2) < params.blockH * 0.4) {
                        wt += params.bWt;
                    }
                }
            }
            break;

        case 'bogolan':
            // Mudcloth - distinct horizontal or vertical strips containing geometric repetitions
            var isVert = params.orientation === 1;
            var primaryCoord = isVert ? x : y;
            var secondaryCoord = isVert ? y : x;

            var stripIdx2 = Math.floor(primaryCoord / params.stripW);
            var stripPhase = safeMod(primaryCoord, params.stripW);

            var bogolanMotifType = safeMod(stripIdx2, params.motifs.length);
            var mo = params.motifs[bogolanMotifType];

            if (stripPhase < params.borderT || stripPhase > params.stripW - params.borderT) {
                wt += params.borderWt;
            } else {
                if (mo.type === 0) {
                    wt += motifChevron(secondaryCoord, stripPhase, params.stripW, mo.p1, mo.p2) * mo.wt;
                } else if (mo.type === 1) {
                    var dcx = safeMod(secondaryCoord, mo.p1) - mo.p1 / 2;
                    var dcy = stripPhase - params.stripW / 2;
                    if (Math.abs(dcx) + Math.abs(dcy) < mo.p2) wt += mo.wt;
                } else if (mo.type === 2) {
                    var ccx = safeMod(secondaryCoord, mo.p1) - mo.p1 / 2;
                    var ccy = stripPhase - params.stripW / 2;
                    if (Math.abs(ccx) < mo.p2 || Math.abs(ccy) < mo.p2) wt += mo.wt;
                } else {
                    if (safeMod(secondaryCoord, mo.p1) < mo.p2) wt += mo.wt;
                }
            }
            break;

        case 'kuba':
            // Raffia weave - dense, irregular orthogonal patches
            var pcx = Math.floor(x / params.patchSize);
            var pcy = Math.floor(y / params.patchSize);
            var pType = safeMod(pcx * 13 + pcy * 29, 5);
            var ix = safeMod(x, params.patchSize);
            var iy = safeMod(y, params.patchSize);

            if (pType === 0) wt += motifMeander(x, y, params.mP, params.mT, 1) * params.mWt;
            else if (pType === 1) wt += motifMeander(y, x, params.mP, params.mT, 1) * params.mWt;
            else if (pType === 2) wt += motifStepped(x, y, params.sP, params.sT, 0) * params.sWt;
            else if (pType === 3) wt += motifStepped(x, y, params.sP, params.sT, 1) * params.sWt;
            else wt += motifLattice(x, y, params.mP, params.mT) * params.mWt * 0.7;

            if (ix < params.bT || iy < params.bT) wt += params.bWt;
            break;

        case 'wari':
            // Patchwork checks + tie-dye rings
            var px = Math.floor(x / params.patchW);
            var py = Math.floor(y / params.patchH);
            var patchType = safeMod(px * 3 + py * 7, 3); // pseudo-random deterministic

            if (patchType === 0) {
                // Tie-dye center ring
                var cx2 = (px + 0.5) * params.patchW;
                var cy2 = (py + 0.5) * params.patchH;
                wt += motifTieDyeRing(x, y, cx2, cy2, params.ringR, params.ringT, params.fuzz) * params.ringWt;
            } else if (patchType === 1) {
                // Diagonal steps
                wt += motifStepped(x, y, params.step, params.stepT, 0) * params.stepWt;
            } else {
                // Checkerboard / grid
                wt += motifLattice(x, y, params.gridP, params.gridT) * params.gridWt;
            }

            // Seams
            if (safeMod(x, params.patchW) < params.seamT || safeMod(y, params.patchH) < params.seamT) {
                wt += params.seamWt;
            }
            break;

        case 'navajo':
            // Horizontal bands with stepped diamonds
            var bandY = safeMod(y, params.bandH);
            var bIdx = safeMod(Math.floor(y / params.bandH), params.bands.length);
            var band = params.bands[bIdx];

            if (band.type === 0 && Math.abs(bandY - params.bandH / 2) < band.diaR) {
                // Central Stepped Diamond
                wt += motifSteppedDiamond(x, y, w / 2, y, band.diaR, band.stepSz) * band.wt;
                // Flanking side diamonds
                wt += motifSteppedDiamond(x, y, w * 0.15, y, band.diaR * 0.5, band.stepSz) * band.wt * 0.8;
                wt += motifSteppedDiamond(x, y, w * 0.85, y, band.diaR * 0.5, band.stepSz) * band.wt * 0.8;
            } else if (band.type === 1) {
                // Serrated line
                wt += motifSerratedBand(x, y, y, band.amp, band.period) * band.wt;
            } else {
                // Chevrons (water)
                wt += motifChevron(x, y, w, band.period, band.amp) * band.wt;
            }

            // Demarcation stripes
            if (bandY < params.stripeT) wt += params.stripeWt;
            break;

        case 'spider_cross':
            // Transitional Spider Woman Cross centered in a diamond/border
            var scx = w / 2;
            var scy = h / 2;
            var sdx = x - scx;
            var sdy = y - scy;

            // Central motif
            wt += motifSpiderCross(sdx, sdy, params.crossSize, params.crossSize, params.crossT) * params.crossWt;

            // Terraced zig-zag borders at top/bottom
            wt += motifSerratedBand(x, y, params.bandT, params.borderAmp, params.borderPeriod) * params.borderWt;
            wt += motifSerratedBand(x, y, h - params.bandT, params.borderAmp, params.borderPeriod) * params.borderWt;

            // Background horizontal striping
            if (safeMod(y, params.bandT * 2) < params.bandT) wt += params.bgWt;
            break;

        case 'fret_bands':
            // Classic Navajo Fretwork and Meander hooks inside horizontal bands
            var fretBandY = safeMod(y, params.bandH);
            var isFretBand = safeMod(Math.floor(y / params.bandH), 2) === 0;

            if (isFretBand) {
                // Fretwork hook logic
                wt += motifTerracedFret(x, y, params.fretPeriodX, params.fretPeriodY, params.fretSteps, params.fretT) * params.fretWt;
            } else {
                // Plain or striped spacer band
                if (safeMod(y, params.stripeT * 2) < params.stripeT) wt += params.stripeWt;
            }

            // Demarcation stripes between bands
            if (fretBandY < params.stripeT) wt += params.stripeWt * 1.5;
            break;

        case 'optical_box':
            wt = engineRadialWave(x, y, w, h) * (params.boxWt || 8.0);
            break;

        case 'serape_net':
            // Edge-to-edge terraced chevron netting forming diamonds
            var netY = safeMod(y, params.netAmp * 2);

            // Upwards chevron
            wt += motifTerracedChevron(x, netY, params.netPeriod, params.netAmp, params.netSteps) * params.netWt;

            // Downwards chevron (offset by amplitude to form diamonds)
            var downY = safeMod(y + params.netAmp, params.netAmp * 2);
            wt += motifTerracedChevron(x + params.netPeriod / 2, downY, params.netPeriod, params.netAmp, params.netSteps) * params.netWt;

            // Faint horizontal background stripes
            if (safeMod(y, params.stripeH) < params.stripeH / 2) wt += params.stripeWt;
            break;

        case 'argyle':
            wt = engineLatticeResonance(x, y, w, h) * (params.argyleWt || 8.0);
            break;

        case 'interlace':
            wt = engineHyperbolicTiling(x, y, w, h) * (params.starWt || 8.0);
            break;

        case 'seigaiha':
            wt = engineStandingWave(x, y, w, h) * (params.waveWt || 8.0);
            break;

        case 'asanoha':
            wt = engineHyperbolicTiling(x, y, w, h) * (params.starWt || 8.0);
            break;

        case 'shippo':
            wt = engineHyperbolicTiling(x, y, w, h) * (params.circleWt || 8.0);
            break;

        case 'kikkou':
            // Japanese Tortoiseshell (hexagonal grid)
            // Motif returns 1.0 (shell), 0.8 (inner shell), 0.6 (ring fill), 0.4 (center fill)
            wt += motifKikkou(x, y, params.radius, params.thickness, params.innerOffset) * params.hexWt;
            break;

        case 'yagasuri':
            // Japanese Arrow Feathers (vertical alternating zig-zags)
            // Motif now returns a gradient chevron fill
            wt += motifYagasuri(x, y, params.colWidth, params.rowHeight, params.thickness) * params.arrowWt;
            // Vertical separation strips
            if (safeMod(x, params.colWidth) < params.sepThickness) {
                wt += params.sepWt;
            }
            break;

        case 'kagome':
            // Japanese Basket Weave (tri-axial hexagonal)
            wt += motifKagome(x, y, params.period, params.thickness, params.dotR, params.dotWt) * params.kagomeWt;
            break;

        case 'kanzemizu':
            wt = engineStandingWave(x, y, w, h) * (params.waveWt || 8.0);
            break;

        case 'yoshiwara':
            // Japanese Interlocking Fretwork Chains
            wt += motifYoshiwara(x, y, params.periodX, params.periodY, params.links, params.thickness) * params.fretWt;
            break;

        case 'matsukawa':
            wt = engineLatticeResonance(x, y, w, h) * (params.pineWt || 8.0);
            break;

        case 'dazzler':
            wt = engineRadialWave(x, y, w, h) * (params.dazzleWt || 8.0);
            break;

        case 'chiefs':
            // Navajo Chief's Blanket: Moki stripes background
            wt += motifSerratedBand(x, y, y, params.mokiAmp, params.mokiPeriod) * params.mokiWt;
            // Overlay 9-point structured stepped diamonds
            wt += motifChiefsDiamond(x, y, w, h, params.centerR, params.edgeR, params.cornerR, params.stepSize) * params.diamondWt;
            break;

        case 'sermat':
            wt = engineVoronoiField(x, y, w, h) * (params.ringWt || 8.0);
            break;

        case 'tol':
            // Fire — chevron flames climbing upward
            for (var chi = 0; chi < params.layers.length; chi++) {
                var ly = params.layers[chi];
                wt += motifChevron(x, y, w, ly[0], ly[1]) * ly[2];
            }
            break;

        case 'mastor':
            // Land — concentric diamond rings + diagonal fill
            for (var di = 0; di < params.diamonds.length; di++) {
                var dm = params.diamonds[di];
                wt += motifDiamond(x, y, dm[0], dm[1], dm[2], dm[3]) * dm[4];
            }
            wt += motifDiagonal(x, y, params.diagP, params.diagT) * params.diagWt;
            wt += motifAntiDiag(x, y, params.adiagP, params.adiagT) * params.adiagWt;
            break;

        case 'virma':
            // Forest frame — stepped border with interior growth
            var bx = Math.min(x, w - 1 - x);
            var by = Math.min(y, h - 1 - y);
            var borderDist = Math.min(bx, by);
            if (borderDist < params.borderW) {
                wt += motifStepped(x, y, params.step, params.stepT, 0) * params.stepWt;
                wt += motifStepped(x, y, params.step2, params.stepT2, 1) * params.stepWt2;
            }
            if (borderDist >= params.borderW && borderDist < params.borderW + params.innerW) {
                wt += motifChevron(x, y, w, params.innerP, params.innerA) * params.innerWt;
            }
            if (borderDist >= params.borderW + params.innerW) {
                wt += motifDiamond(x, y, w / 2, h / 2, params.centralR, params.centralRing) * params.centralWt;
            }
            break;

        case 'ved':
            // Water — interlocking S-curves
            for (var si = 0; si < params.scrolls.length; si++) {
                var sc = params.scrolls[si];
                wt += motifScroll(x, y, w, sc[0], sc[1]) * sc[2];
            }
            wt += motifStepped(x, y, params.bandStep, params.bandT, 0) * params.bandWt;
            break;

        case 'chipaz':
            wt = engineRadialWave(x, y, w, h) * (params.sunWt || 8.0);
            break;

        case 'kudo':
            // House — brick masonry + rectangular partitions
            wt += motifBrick(x, y, params.brickW, params.brickH) * params.brickWt;
            for (var ki = 0; ki < params.rooms.length; ki++) {
                var rm = params.rooms[ki];
                if (x >= rm[0] && x < rm[0] + rm[2] && y >= rm[1] && y < rm[1] + rm[3]) {
                    wt += rm[4];
                }
            }
            wt += motifStepped(x, y, params.frameStep, params.frameT, 0) * params.frameWt;
            break;

        case 'pulay':
            // Waist belt — horizontal bands with different motifs per band
            var bandIdx = safeMod(Math.floor(y / params.bandH), params.bands.length);
            var b = params.bands[bandIdx];
            if (b.type === 0) wt += motifDiagonal(x, y, b.p1, b.p2) * b.wt;
            else if (b.type === 1) wt += motifChevron(x, y, w, b.p1, b.p2) * b.wt;
            else if (b.type === 2) wt += motifPolyline(x, y, b.p1, b.p2, b.p3) * b.wt;
            else if (b.type === 3) wt += motifLattice(x, y, b.p1, b.p2) * b.wt;
            else wt += motifStepped(x, y, b.p1, b.p2, 0) * b.wt;
            // Duckfoot accents between bands
            for (var pi2 = 0; pi2 < params.feet.length; pi2++) {
                var ft = params.feet[pi2];
                wt += motifDuckfoot(x, y, ft[0], ft[1], ft[2], ft[3]) * ft[4];
            }
            break;

        case 'sermat-kudo':
            wt = engineVoronoiField(x, y, w, h) * (params.ringWt || 8.0);
            break;

        case 'kepe':
            // Crown/headdress — sawtooth peaks + stepped fill (catalog p122, p158-162)
            var peakY = safeMod(y, params.peakH);
            var peakX = safeMod(x, params.peakW);
            var peakSlope = peakY < params.peakH / 2 ? peakX < peakY * params.peakW / params.peakH : peakX < (params.peakH - peakY) * params.peakW / params.peakH;
            if (peakSlope) wt += params.peakWt;
            wt += motifStepped(x, y, params.fillStep, params.fillT, 0) * params.fillWt;
            wt += motifDiamond(x, y, w / 2, h / 2, params.crownR, params.crownRing) * params.crownWt;
            break;

        case 'panks':
            // Petal/blossom — floral rosettes (catalog p107)
            for (var pki = 0; pki < params.flowers.length; pki++) {
                var fl = params.flowers[pki];
                wt += motifRosette(x, y, fl[0], fl[1], fl[2], fl[3], fl[4]) * fl[5];
            }
            wt += motifDiamond(x, y, w / 2, h / 2, params.stemR, params.stemRing) * params.stemWt;
            break;

        case 'kishtima':
            wt = engineLatticeResonance(x, y, w, h) * (params.tileWt || 8.0);
            break;

        case 'kshtir':
            wt = engineLogSpiral(x, y, w, h) * (params.armWt || 8.0);
            break;

        case 'narmuny':
            // Border/edge — decorative horizontal band strips (catalog p152-155)
            var zoneY = safeMod(y, params.zoneH);
            var zoneIdx = safeMod(Math.floor(y / params.zoneH), params.zones.length);
            var zone = params.zones[zoneIdx];
            if (zone.motif === 0) wt += motifChevron(x, y, w, zone.p1, zone.p2) * zone.wt;
            else if (zone.motif === 1) wt += motifDiagonal(x, y, zone.p1, zone.p2) * zone.wt;
            else if (zone.motif === 2) wt += motifLattice(x, y, zone.p1, zone.p2) * zone.wt;
            else if (zone.motif === 3) wt += motifDiamond(x, y, w / 2, y, zone.p1, zone.p2) * zone.wt;
            else wt += motifStepped(x, y, zone.p1, zone.p2, 0) * zone.wt;
            // Separator lines between zones
            if (zoneY < params.sepT) wt += params.sepWt;
            break;

        case 'pakshats':
            // Interlocking — Greek key meander at multiple scales (catalog p115, p135)
            for (var psi = 0; psi < params.layers.length; psi++) {
                var ml = params.layers[psi];
                wt += motifMeander(x, y, ml[0], ml[1], ml[2]) * ml[3];
            }
            wt += motifStepped(x, y, params.accentStep, params.accentT, 1) * params.accentWt;
            break;

        case 'kolya':
            // Corner/angle — triangular meander-filled V-shapes (catalog p162)
            var cornerDist = Math.min(x, y, w - 1 - x, h - 1 - y);
            var inCorner = cornerDist < params.cornerSize;
            if (inCorner) {
                wt += motifMeander(x, y, params.fillP, params.fillW, params.fillD) * params.cornerWt;
                wt += motifChevron(x, y, w, params.chevP, params.chevA) * params.chevWt;
            }
            // Edge frame
            if (cornerDist < params.edgeW) wt += params.edgeWt;
            break;

        case 'tangents':
            // Modernist geometric nodes and connections (Constructivist/Suprematist)
            // Draw edges first (background level)
            for (var e = 0; e < params.edges.length; e++) {
                var edge = params.edges[e];
                var n1 = params.nodes[edge[0]];
                var n2 = params.nodes[edge[1]];
                wt += motifTangentSegment(x, y, n1.x, n1.y, n1.r, n2.x, n2.y, n2.r) * params.edgeWt;
            }
            // Draw nodes and markings
            for (var n = 0; n < params.nodes.length; n++) {
                var node = params.nodes[n];
                var dxn = x - node.x, dyn = y - node.y;
                if (dxn * dxn + dyn * dyn < node.r * node.r) {
                    wt += params.nodeWt;
                }

                // Construction markings
                var markType = node.mark === 1 ? 'plus' : (node.mark === 2 ? 'minus' : (node.mark === 3 ? 'circle' : ''));
                if (markType) {
                    wt += motifModernistConstruct(x, y, node.x, node.y, node.r, markType) * params.constructWt;
                }
            }
            // Background draft grid
            if (safeMod(x, params.gridP) < 0.6 || safeMod(y, params.gridP) < 0.6) {
                wt += params.gridWt;
            }
            break;

        case 'structural':
            // Architectural nested frames and staggered partitions
            for (var ri = 0; ri < params.rects.length; ri++) {
                var r = params.rects[ri];
                // Check if (x,y) is inside this architectural block
                if (x >= r.x1 && x < r.x2 && y >= r.y1 && y < r.y2) {
                    var mdx1 = x - r.x1, mdx2 = r.x2 - 1 - x;
                    var mdy1 = y - r.y1, mdy2 = r.y2 - 1 - y;
                    var structuralMinDist = Math.min(mdx1, mdx2, mdy1, mdy2);

                    // 1. Nested frame/border logic
                    for (var fi = 0; fi < r.frames.length; fi++) {
                        var frame = r.frames[fi];
                        if (structuralMinDist >= frame.start && structuralMinDist < frame.end) {
                            wt += frame.wt;
                        }
                    }

                    // 2. Internal hatching/drafting lines
                    if (r.hatch) {
                        var hCoord = x * r.hS + y * r.hC;
                        if (safeMod(hCoord, r.hP) < r.hT) {
                            wt += r.hWt;
                        }
                    }

                    // 3. Base density for the block
                    wt += r.baseWt;
                }
            }
            // Background master grid (structural draft)
            if (safeMod(x, params.masterGridP) < 0.8 || safeMod(y, params.masterGridP) < 0.8) {
                wt += params.masterGridWt;
            }
            break;

        case 'adama':
            // Earth / Southwest: Layered strata with geometric motifs
            var stratumIdx = safeMod(Math.floor(y / params.stratumH), params.strata.length);
            var stratum = params.strata[stratumIdx];
            var phaseY = safeMod(y, params.stratumH);

            // 1. Global stratum texture (fine lattice or stippling)
            wt += motifLattice(x, y, params.texP, params.texT) * params.texWt;

            // 2. Stratum-specific motif
            if (stratum.type === 0) {
                // Stepped diamonds
                wt += motifSteppedDiamond(x, y, (Math.floor(x / stratum.p1) + 0.5) * stratum.p1, y, stratum.p3, stratum.p4) * stratum.wt;
            } else if (stratum.type === 1) {
                // Serrated bands
                wt += motifSerratedBand(x, y, y, stratum.p1, stratum.p2) * stratum.wt;
            } else if (stratum.type === 2) {
                // Chevrons
                wt += motifChevron(x, y, w, stratum.p1, stratum.p2) * stratum.wt;
            } else if (stratum.type === 3) {
                // Horizontal stripes / bands
                if (phaseY < stratum.p1) wt += stratum.wt;
            } else {
                // Concentric optical boxes (Southwest eye-dazzler style)
                wt += motifOpticalBox(x - (Math.floor(x / stratum.p1) + 0.5) * stratum.p1, y - phaseY + params.stratumH / 2, stratum.p2, stratum.p3, stratum.p4, stratum.p5) * stratum.wt;
            }

            // 3. Stratum boundaries
            if (phaseY < params.sepT) wt += params.sepWt;
            break;

        case 'orak':
            // Cosmic Surrealism: Warped checkerboards, rays, and token paths
            var orakX = x - w / 2;
            var orakY = y - h / 2;

            // 1. Central Sun & Rays
            var sunDist = Math.sqrt(orakX * orakX + orakY * orakY);
            if (sunDist < params.sunR) wt += params.sunWt;

            params.rays.forEach(function (ray) {
                wt += motifRadialRay(x, y, w / 2, h / 2, ray.angle, ray.width) * ray.wt;
            });

            // 2. Warped Checkerboard fields
            params.warps.forEach(function (wp) {
                wt += motifCheckerWarp(x, y, wp.cx, wp.cy, wp.r, wp.skew) * wp.wt;
            });

            // 3. Cosmic Token Paths (Ribbons)
            params.paths.forEach(function (pth) {
                wt += motifTokenPath(x, y, pth.cx, pth.cy, pth.r, pth.freq, pth.rot) * pth.wt;
            });

            // 4. Background stardust (subtle noise)
            if (safeMod(x * 31 + y * 37, 100) < 5) wt += params.dustWt;
            break;

        case 'glitch':
            wt = engineReactionDiffusion(x, y, w, h) * (params.scanWt || 8.0);
            break;

        case 'azulejo':
            // Portuguese Tile Grid (Azulejo)
            var tx = safeMod(x, params.tileSize);
            var ty = safeMod(y, params.tileSize);
            var tcx = params.tileSize / 2;
            var tcy = params.tileSize / 2;
            wt += motifDiamond(x, y, x - tx + tcx, y - ty + tcy, params.medR, params.medT) * params.medWt;
            var nearestCornerX = x - tx + (tx > tcx ? params.tileSize : 0);
            var nearestCornerY = y - ty + (ty > tcy ? params.tileSize : 0);
            var distCorner = Math.sqrt(Math.pow(x - nearestCornerX, 2) + Math.pow(y - nearestCornerY, 2));
            if (Math.abs(distCorner - params.cornerR) < params.cornerT) wt += params.cornerWt;
            if (distCorner < params.cornerInnerR) wt += params.cornerInnerWt;
            if (tx < params.grout || ty < params.grout) wt += params.groutWt;
            break;

        case 'arraiolos':
            // Portuguese Arraiolos Rug Geometry
            wt += motifSteppedDiamond(x, y, w / 2, h / 2, params.centerR, params.stepSz) * params.centerWt;
            var bxA = Math.min(x, w - 1 - x);
            var byA = Math.min(y, h - 1 - y);
            var borderDistA = Math.min(bxA, byA);
            if (borderDistA > params.b1Start && borderDistA < params.b1End) {
                wt += motifStepped(x, y, params.b1Step, params.b1T, 0) * params.b1Wt;
            }
            if (borderDistA > params.b2Start && borderDistA < params.b2End) {
                if (safeMod(x + y, params.b2P) < params.b2T) wt += params.b2Wt;
            }
            if (borderDistA > params.b1End && borderDistA < w / 2 - params.centerR) {
                wt += motifLattice(x, y, params.fieldP, params.fieldT) * params.fieldWt;
            }
            break;

        case 'viana':
            // Viana do Castelo Folk Embroidery
            var bandIdx = safeMod(Math.floor(y / params.bandH), params.bands.length);
            var bV = params.bands[bandIdx];
            if (bV.type === 0) {
                wt += motifChevron(x, y, w, bV.p1, bV.p2) * bV.wt;
            } else if (bV.type === 1) {
                var rowCxV = safeMod(x, bV.p1) - bV.p1 / 2;
                if (Math.abs(rowCxV) + Math.abs(safeMod(y, params.bandH) - params.bandH / 2) < bV.p2) wt += bV.wt;
            } else if (bV.type === 2) {
                if (Math.abs(safeMod(y, params.bandH) - params.bandH / 2) < bV.p1) wt += bV.wt;
            } else {
                wt += motifLattice(x, y, bV.p1, bV.p2) * bV.wt;
            }
            if (safeMod(y, params.bandH) < params.sepT) wt += params.sepWt;
            break;

        case 'castelo_branco':
            // Castelo Branco Embroidery
            params.scrolls.forEach(function (sc) {
                wt += motifScroll(x, y, w, sc.amp, sc.period) * sc.wt;
            });
            params.flowers.forEach(function (fl) {
                wt += motifRosette(x, y, fl.cx, fl.cy, fl.r, fl.petals, fl.sharp) * fl.wt;
            });
            var trunkX = w / 2 + Math.sin(y / params.trunkP) * params.trunkAmp;
            if (Math.abs(x - trunkX) < params.trunkT) wt += params.trunkWt;
            break;

        case 'stolz':
            // Bauhaus Architectural Grid

            params.blocks.forEach(function (b) {
                if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {

                    if (b.type === 0) {
                        // Solid Block
                        wt += b.wtMain;
                    } else if (b.type === 1) {
                        // Horizontal Stripes
                        if (safeMod(y, b.stripeDens) < (b.stripeDens / 2)) {
                            wt += b.wtMain;
                        } else {
                            wt += b.wtSub;
                        }
                    } else if (b.type === 2) {
                        // Vertical Stripes
                        if (safeMod(x, b.stripeDens) < (b.stripeDens / 2)) {
                            wt += b.wtMain;
                        } else {
                            wt += b.wtSub;
                        }
                    } else if (b.type === 3) {
                        // Geometric Triangles (split diagonally)
                        var relX = (x - b.x) / b.w;
                        var relY = (y - b.y) / b.h;
                        var inTriangle = false;

                        if (b.triDir === 0 && relX + relY < 1) inTriangle = true;       // Top-Left
                        else if (b.triDir === 1 && relX > relY) inTriangle = true;      // Top-Right
                        else if (b.triDir === 2 && relX + relY > 1) inTriangle = true;  // Bottom-Right
                        else if (b.triDir === 3 && relX < relY) inTriangle = true;      // Bottom-Left

                        if (inTriangle) wt += b.wtMain;
                        else wt += b.wtSub;
                    } else if (b.type === 4) {
                        // Half Circles
                        var cx = b.x + (b.w / 2);
                        var cy = b.y + (b.h / 2);
                        var radius = Math.min(b.w, b.h) / 2;
                        var dx = x - cx;
                        var dy = y - cy;

                        if (dx * dx + dy * dy < radius * radius) {
                            if (dy < 0) wt += b.wtMain; // Top half
                            else wt += b.wtSub; // Bottom half
                        }
                    }
                }
            });
            break;

        case 'metropolis':
            // Architectural City Grid
            params.buildings.forEach(function (b) {
                var innerX = x - b.x;
                var innerY = y - b.y;

                if (innerX >= b.margin && innerX < b.w - b.margin && innerY >= b.margin && innerY < b.h - b.margin) {
                    if (b.type === 'solid') {
                        wt += b.wt;
                    } else if (b.type === 'windows') {
                        // Checkered window pattern
                        var wx = Math.floor(innerX / b.winW);
                        var wy = Math.floor(innerY / b.winH);
                        if ((wx + wy) % 2 === 0) wt += b.wt;
                        else wt += b.wt * 0.4; // Boost window base
                    } else if (b.type === 'slabs') {
                        // Horizontal bands/slabs
                        if (Math.floor(innerY / b.slabH) % 2 === 0) wt += b.wt;
                        else wt += b.wt * 0.2; // Add light weight between slabs
                    } else if (b.type === 'pillars') {
                        // Vertical pillars
                        if (Math.floor(innerX / b.pillW) % 4 !== 0) wt += b.wt;
                        else wt += b.wt * 0.2;
                    }
                }
            });

            // Layer in large Districts for baseline density
            if (params.districts) {
                params.districts.forEach(function (d) {
                    if (x >= d.x && x < d.x + d.w && y >= d.y && y < d.y + d.h) {
                        wt += d.wt;
                    }
                });
            }
            break;

        case 'pre_columbian':
            // Stepped geometry and zig-zag borders
            params.steps.forEach(function (stp) {
                var dxs = Math.abs(x - stp.x);
                var dys = Math.abs(y - stp.y);

                // Creates a stepped L-shape or pyramid form depending on math
                if (dxs < stp.size && dys < stp.size) {
                    var outerStep = Math.floor(Math.max(dxs, dys) / stp.stepSize);
                    var innerStep = Math.floor(Math.min(dxs, dys) / stp.stepSize);

                    if (safeMod(outerStep + innerStep, 2) === 0) {
                        wt += stp.wt;
                    }
                }
            });

            params.borders.forEach(function (bdr) {
                // Sharp zig-zag based on triangle wave
                var triWave = Math.abs(safeMod(x, bdr.period) - bdr.period / 2) / (bdr.period / 2);
                var zzy = bdr.y + (triWave * 2 - 1) * bdr.amp;
                if (Math.abs(y - zzy) < bdr.thick) {
                    wt += bdr.wt;
                }
            });
            break;

        case 'cubist':
            // Overlapping slabs, split moons, and undulating waves
            // 1. Base Slabs
            params.slabs.forEach(function (s) {
                if (x >= s.x1 && x < s.x2 && y >= s.y1 && y < s.y2) {
                    wt += s.wt;
                }
            });

            // 2. Abstract Waves
            params.waves.forEach(function (wav) {
                var wy = wav.y + Math.sin(x / wav.period) * wav.amp;
                if (Math.abs(y - wy) < wav.thick) {
                    wt += wav.wt;
                }
            });

            // 3. Split Moons (Abstract geometry intersecting)
            params.moons.forEach(function (moon) {
                var dxm = x - moon.cx;
                var dym = y - moon.cy;
                if (dxm * dxm + dym * dym < moon.r * moon.r) {
                    if (moon.isVerticalSplit) {
                        if (dxm < 0) wt += moon.leftWt;
                        else wt += moon.rightWt;
                    } else {
                        if (dym < 0) wt += moon.leftWt;
                        else wt += moon.rightWt;
                    }
                }
            });
            break;

        case 'art_deco':
            // Geometric nested lines/L-shapes and zig-zag corners
            params.lines.forEach(function (l) {
                for (var s = 0; s < l.steps; s++) {
                    var offset = s * l.spacing;
                    // Draw an L-shape (two segments)
                    var seg1Wt = motifWireTrace(x, y, l.x1 + offset, l.y1 + offset, l.x1 + offset, l.y2 + offset, l.thick);
                    var seg2Wt = motifWireTrace(x, y, l.x1 + offset, l.y2 + offset, l.x2 + offset, l.y2 + offset, l.thick);

                    if (seg1Wt > 0 || seg2Wt > 0) {
                        wt += l.wt;
                    }

                    if (l.isZigzag) {
                        // Add a zig-zag segment connected to the end
                        var zzWt = motifTraceZigZag(x, y, l.x2 + offset, l.y2 + offset, l.x2 + offset, l.y2 + offset + 50, 5, 10, l.thick);
                        if (zzWt > 0) wt += l.wt;
                    }
                }
            });

            if (params.bgStripe.active) {
                if (Math.abs(y - params.bgStripe.y) < params.bgStripe.h) {
                    // Add subtle nested horizontal lines
                    if (safeMod(y, 4) < 2) wt += params.bgStripe.wt;
                }
            }

            if (params.cornerTriangles.active) {
                // Nested triangles in the corners (e.g. top-left)
                for (var ts = 0; ts < params.cornerTriangles.steps; ts++) {
                    var tSize = params.cornerTriangles.size - (ts * (params.cornerTriangles.size / params.cornerTriangles.steps));
                    if (x < tSize && y < tSize && (x + y) > (tSize - 3) && (x + y) < (tSize + 3)) {
                        wt += params.cornerTriangles.wt;
                    }
                    if (w - x < tSize && y < tSize && ((w - x) + y) > (tSize - 3) && ((w - x) + y) < (tSize + 3)) {
                        wt += params.cornerTriangles.wt;
                    }
                    if (x < tSize && h - y < tSize && (x + (h - y)) > (tSize - 3) && (x + (h - y)) < (tSize + 3)) {
                        wt += params.cornerTriangles.wt;
                    }
                    if (w - x < tSize && h - y < tSize && ((w - x) + (h - y)) > (tSize - 3) && ((w - x) + (h - y)) < (tSize + 3)) {
                        wt += params.cornerTriangles.wt;
                    }
                }
            }
            break;

        case 'brutalist':
            // High variety monolithic slabs with concrete and rebar
            params.slabs.forEach(function (s) {
                if (x >= s.x1 && x < s.x2 && y >= s.y1 && y < s.y2) {
                    var dx = Math.min(x - s.x1, s.x2 - 1 - x);
                    var dy = Math.min(y - s.y1, s.y2 - 1 - y);
                    var edgeDist = Math.min(dx, dy);

                    // Base slab weight + distance modifier for variation
                    wt += s.wt + (edgeDist / 10.0);

                    // Concrete "pitting" / texture
                    var pit = safeMod(Math.floor(x * 37 + y * 41), 100);
                    if (pit < 8) wt -= 5;
                    if (pit > 92) wt += 5;
                }
            });
            // Rebar lines (staggered weights)
            params.rebar.forEach(function (r) {
                if (r.axis === 'h' && Math.abs(y - r.pos) < 2) wt += r.wt * (safeMod(x, 20) < 10 ? 1.0 : 0.5);
                if (r.axis === 'v' && Math.abs(x - r.pos) < 2) wt += r.wt * (safeMod(y, 20) < 10 ? 1.0 : 0.5);
            });
            break;

        case 'axonometric':
            // 3D Isometric volumes with shading variety
            params.volumes.forEach(function (v) {
                var vwt = v.wt; // Base weight for this volume
                // Top (Brightest)
                wt += motifAxonPlane(x, y, v.cx, v.cy, v.w, v.h, 0, 0, vwt * 2.5);
                // Left (Medium)
                wt += motifAxonPlane(x, y, v.cx - v.w * 0.433, v.cy + v.h * 0.25, v.w, v.h, 0, 1, vwt * 1.8);
                // Right (Darkest)
                wt += motifAxonPlane(x, y, v.cx + v.w * 0.433, v.cy + v.h * 0.25, v.w, v.h, 0, 2, vwt * 1.2);
            });
            break;

        case 'blueprint':
        case 'blueprint_cyan':
            // High-fidelity blueprint with ghostly notations
            params.lines.forEach(function (l) {
                if (Math.abs(x - l.x) < 1.2 || Math.abs(y - l.y) < 1.2) {
                    wt += l.wt * (safeMod(x + y, 6) < 3 ? 1.4 : 0.8);
                }
            });
            params.marks.forEach(function (m) {
                wt += motifDraftingMark(x, y, m.cx, m.cy, m.size, m.type) * m.wt;
            });
            // Denser technical hatching
            if (safeMod(x - y, 40) < 1.0) wt += 3.0;
            // Multi-tier background grid
            if (safeMod(x + 10, 50) < 0.8 || safeMod(y + 10, 50) < 0.8) wt += 6.0;
            if (safeMod(x + 10, 200) < 1.5 || safeMod(y + 10, 200) < 1.5) wt += 10.0;
            break;

        case 'circuit':
            // Dynamic Integrated Circuitry
            params.traces.forEach(function (t) {
                var traceWt = motifWireTrace(x, y, t.x1, t.y1, t.x2, t.y2, t.thick) * t.wt;
                if (traceWt > 0) {
                    // Signal "pulses" along traces
                    var pulse = safeMod(Math.floor(x + y + t.phase), 20);
                    wt += traceWt * (pulse < 5 ? 1.5 : 1.0);
                }
            });
            params.chips.forEach(function (c) {
                if (x >= c.x1 && x < c.x2 && y >= c.y1 && y < c.y2) {
                    wt += c.wt;
                    // Chip internal core
                    if (Math.abs(x - (c.x1 + c.x2) / 2) < 5 && Math.abs(y - (c.y1 + c.y2) / 2) < 5) wt += 10;
                    // "Pin" markers
                    if (safeMod(x, 6) < 2 && (y === c.y1 || y === c.y2 - 1)) wt += 15;
                }
            });
            break;

        case 'malevich':
            // Suprematist dynamic geometric abstraction
            params.shapes.forEach(function (s) {
                wt += motifSuprematist(x, y, s.cx, s.cy, s.type, s.size, s.rot, s.wt);
            });
            break;

        case 'mondrian':
            // Piet Mondrian / De Stijl - structural primary blocks
            for (var mi = 0; mi < params.slabs.length; mi++) {
                var s = params.slabs[mi];
                if (x >= s.x1 && x < s.x2 && y >= s.y1 && y < s.y2) {
                    var dx = Math.min(x - s.x1, s.x2 - 1 - x);
                    var dy = Math.min(y - s.y1, s.y2 - 1 - y);
                    if (dx < params.lineT || dy < params.lineT) {
                        wt += params.lineWt;
                    } else {
                        wt += s.wt;
                    }
                    break;
                }
            }
            break;

        case 'shiprock':
            // High-contrast Navajo Dazzler - serrated bands
            for (var bi = 0; bi < params.bands.length; bi++) {
                var b = params.bands[bi];
                if (x >= b.x1 && x < b.x2) {
                    var sx = x - b.x1;
                    var sw = b.x2 - b.x1;
                    var period = params.period;
                    var phase = Math.abs((y % period) - (period / 2)) * params.serration;
                    if (sx > phase && sx < sw - phase) {
                        wt += b.wt;
                        break;
                    }
                }
            }
            break;

        case 'cherokee':
            // Tsalagi Double-weave Basketry - interlocking steps
            var step = params.step;
            var gx = Math.floor(x / step);
            var gy = Math.floor(y / step);
            if ((gx + gy) % 2 === 0) {
                if (((x + y) / (step * 0.8)) % 2 < 1) wt += params.wtHeavy;
                else wt += params.wtLight;
            } else {
                if (((x - y + 1000) / (step * 0.8)) % 2 < 1) wt += params.wtHeavy;
                else wt += params.wtLight;
            }
            break;

        case 'woodcut':
            // Chiseled / Woodblock Carving - tapered directional gouges
            for (var gi = 0; gi < params.gouges.length; gi++) {
                var g = params.gouges[gi];
                // Distance to line segment
                var dx = x - g.x1;
                var dy = y - g.y1;
                var dpx = g.x2 - g.x1;
                var dpy = g.y2 - g.y1;
                var t = Math.max(0, Math.min(1, (dx * dpx + dy * dpy) / (dpx * dpx + dpy * dpy)));
                var nearestX = g.x1 + t * dpx;
                var nearestY = g.y1 + t * dpy;
                var dist = Math.sqrt((x - nearestX) * (x - nearestX) + (y - nearestY) * (y - nearestY));

                // Taper: thinner at ends
                var taper = Math.sin(t * Math.PI);
                var radius = g.width * taper;

                if (dist < radius) {
                    wt += g.wt;
                    break;
                }
            }
            break;

        case 'collage':
            // Textile Collage - overlapping scraps and stitching
            params.scraps.forEach(function (s) {
                // Rotated rect check
                var dx = x - s.cx;
                var dy = y - s.cy;
                var cos = Math.cos(-s.rot);
                var sin = Math.sin(-s.rot);
                var rx = dx * cos - dy * sin;
                var ry = dx * sin + dy * cos;

                if (Math.abs(rx) < s.w / 2 && Math.abs(ry) < s.h / 2) {
                    // Inside scrap - add subtle "fray" at edges
                    var edgeDist = Math.min(s.w / 2 - Math.abs(rx), s.h / 2 - Math.abs(ry));
                    if (edgeDist < 1.5) wt += s.wt * 0.7; // Frayed edge
                    else wt += s.wt;
                }
            });
            // Stitching
            params.stitches.forEach(function (st) {
                var dx = x - st.x1;
                var dy = y - st.y1;
                var dpx = st.x2 - st.x1;
                var dpy = st.y2 - st.y1;
                var t = Math.max(0, Math.min(1, (dx * dpx + dy * dpy) / (dpx * dpx + dpy * dpy)));
                var nx = st.x1 + t * dpx;
                var ny = st.y1 + t * dpy;
                var d = Math.sqrt((x - nx) * (x - nx) + (y - ny) * (y - ny));
                if (d < 0.8) wt += st.wt;
            });
            break;

        case 'bricolage':
            // Mixed Media Bricolage
            // 1. Skewed Patches
            params.patches.forEach(function (p) {
                var dx = x - p.cx;
                var dy = y - p.cy;
                var cos = Math.cos(-p.rot);
                var sin = Math.sin(-p.rot);
                var rx = dx * cos - dy * sin;
                var ry = dx * sin + dy * cos;
                if (Math.abs(rx) < p.w / 2 && Math.abs(ry) < p.h / 2) wt += p.wt;

                // Heavy Edge Stitching around the patch
                var edgeDist = Math.min(p.w / 2 - Math.abs(rx), p.h / 2 - Math.abs(ry));
                if (edgeDist > 0 && edgeDist < 3.5) {
                    // Create dashed hash lines along the edge
                    if ((rx + ry) % p.stitchGap < p.stitchLen) {
                        wt += p.stitchWt;
                    }
                }
            });
            // 2. Blobs / Applique circles
            params.blobs.forEach(function (b) {
                var dx = x - b.cx;
                var dy = y - b.cy;
                var distSq = dx * dx + dy * dy;
                if (distSq < b.rSq) wt += b.wt;
            });
            // 3. Chaotic thread squiggles
            params.threads.forEach(function (th) {
                var dx = x - th.cx;
                var dy = y - th.cy;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (Math.abs(dist - th.r) < 0.6) {
                    // It's on the circle path. Add some dash rhythm to look like thread
                    var ang = Math.atan2(dy, dx);
                    if (Math.abs(Math.sin(ang * th.dashes)) > 0.4) {
                        wt += th.wt;
                    }
                }
            });
            break;

        case 'flow':
            wt = engineFlowField(x, y, w, h) * (params.streams[0] ? params.streams[0].wt : 8.0);
            break;

        case 'river_flow':
            wt = engineFlowField(x, y, w, h) * (params.streams[0] ? params.streams[0].wt : 8.0);
            break;

        case 'flowing_contours':
            wt = engineFlowField(x, y, w, h) * (params.wt || 8.0);
            break;

        case 'current':
            // Directional band stack — parallel bands with block subdivision
            // Rotate coordinates by dominant angle
            var ca = Math.cos(params.angle);
            var sa = Math.sin(params.angle);
            var rx = x * ca + y * sa;
            var ry = -x * sa + y * ca;

            // Find which band we're in
            var bandAccum = 0;
            var inBand = false;
            for (var bi = 0; bi < params.bands.length; bi++) {
                var band = params.bands[bi];
                if (ry >= bandAccum && ry < bandAccum + band.w) {
                    inBand = true;
                    // Subdivide along the band into blocks
                    var blockIdx = Math.floor(rx / band.blockLen);
                    var blockPhase = safeMod(blockIdx + bi, 4);
                    if (blockPhase === 0) wt += band.wt;
                    else if (blockPhase === 1) wt += band.wt * 0.7;
                    else if (blockPhase === 2) wt += band.wt * 0.4;
                    else wt += band.wt * 0.15;
                    break;
                }
                bandAccum += band.w + params.gap;
            }
            // Small accent blocks in gaps
            if (!inBand) {
                var gapBlock = safeMod(Math.floor(rx / 8) + Math.floor(ry / 5), 7);
                if (gapBlock < 2) wt += 3;
            }
            break;
        case 'verena': {
            // Verena Loewensberg — bold diagonal parallelogram bands
            // Each band: point-in-parallelogram test via rotated coords
            for (var vi = 0; vi < params.bands.length; vi++) {
                var vb = params.bands[vi];
                var ca = Math.cos(-vb.angle), sa = Math.sin(-vb.angle);
                var rx = (x - vb.cx) * ca - (y - vb.cy) * sa;
                var ry = (x - vb.cx) * sa + (y - vb.cy) * ca;
                if (Math.abs(ry) < vb.hw && Math.abs(rx) < vb.hl) {
                    wt += vb.wt;
                }
            }
            break;
        }

        case 'cypress_hills':
            // Sky background logic implicitly zero wt
            // Sun
            if (Math.sqrt(Math.pow(x - params.sunX, 2) + Math.pow(y - params.sunY, 2)) < params.sunR) {
                wt += params.sunWt;
            }

            // Hills (background to foreground)
            for (var i = 0; i < params.hills.length; i++) {
                var hill = params.hills[i];
                var hY = hill.baseY + Math.sin(x / hill.period + hill.phase) * hill.amp;
                // Quantize to stepped look typical of embroidery
                hY = Math.floor(hY / hill.step) * hill.step;
                if (y > hY) {
                    wt += hill.wt; // Additive weight creates layering effect
                }
            }

            // Cypress Trees
            for (var i = 0; i < params.trees.length; i++) {
                var tree = params.trees[i];
                // Tree bounding box check
                if (x > tree.x - tree.w / 2 && x < tree.x + tree.w / 2 && y > tree.y - tree.h && y < tree.y) {
                    // Stepped triangular shape
                    var dy = tree.y - y; // distance from bottom
                    var targetW = (dy / tree.h) * (tree.w / 2); // triangle width at this height
                    targetW = Math.floor(targetW / 4) * 4; // step the triangle
                    if (Math.abs(x - tree.x) < targetW) {
                        wt += tree.wt;
                    }
                }
            }
            break;

        case 'sierra_sunset':
            // Sky gradient bands
            var skyBandH = Math.floor((h / 2) / params.skyBands);
            if (y < h / 2 && Math.floor(y / skyBandH) % 2 === 0) {
                wt += params.skyWt;
            }

            // Mountains
            for (var i = 0; i < params.mountains.length; i++) {
                var m = params.mountains[i];
                // Sawtooth/chevron math
                var phaseX = safeMod(x, m.period) / m.period; // 0 to 1
                var chevronY = phaseX < 0.5 ? phaseX * 2 : (1 - phaseX) * 2; // 0 to 1 to 0
                var mY = m.baseY - chevronY * m.amp;
                mY = Math.floor(mY / m.step) * m.step; // stepped

                if (y > mY) {
                    // Outlines for mountains
                    if (y < mY + m.thick) {
                        wt += m.wt * 1.5; // Darker peak/outline
                    } else if ((x + y) % 8 < 4) { // hatching fill
                        wt += m.wt;
                    }
                }
            }
            break;

        case 'panoramic_dunes':
            // Wind lines in sky
            if (y < h / 2) {
                var swy = Math.floor(h / 2 / params.windLines); // simplified
                if (safeMod(y, swy) < 2) {
                    wt += params.windWt;
                }
            }

            // Dunes
            for (var i = 0; i < params.dunes.length; i++) {
                var d = params.dunes[i];
                // Smooth sine waves combining two frequencies for natural curves
                var dY = d.baseY + Math.sin(x / d.period + d.phase) * d.amp + Math.cos(x / (d.period * 0.5)) * (d.amp * 0.3);

                // Draw as thick sweeping ribbons rather than solid fills
                if (y > dY && y < dY + d.thick) {
                    wt += d.wt;
                } else if (y >= dY + d.thick) {
                    wt += d.wt * 0.2; // slight base fill
                }
            }
            break;

        case 'rolling_hills':
            wt = engineStandingWave(x, y, w, h) * (params.contourWt || 8.0);
            break;

        case 'framed_vista':
            // Check if in border or vignette
            var inVignette = x > params.borderW && x < w - params.borderW && y > params.borderW && y < h - params.borderW;

            if (inVignette) {
                // translate coordinates for vignette
                var vx = x - params.borderW;
                var vy = y - params.borderW;
                var vw = w - 2 * params.borderW;
                var vh = h - 2 * params.borderW;

                // Inner frame
                if (vx < params.innerBorderT || vx > vw - params.innerBorderT || vy < params.innerBorderT || vy > vh - params.innerBorderT) {
                    wt += params.innerBorderWt;
                } else {
                    // Vignette content
                    if (Math.sqrt(Math.pow(vx - params.vigSunX, 2) + Math.pow(vy - params.vigSunY, 2)) < params.vigSunR) {
                        wt += params.vigSunWt;
                    }
                    for (var i = 0; i < params.vigHills.length; i++) {
                        var vhll = params.vigHills[i];
                        if (vy > vhll.baseY + Math.sin(vx / vhll.period) * vhll.amp) {
                            wt += vhll.wt;
                        }
                    }
                    for (var i = 0; i < params.vigTrees.length; i++) {
                        var vt = params.vigTrees[i];
                        if (vx > vt.x - vt.w / 2 && vx < vt.x + vt.w / 2 && vy > vt.y - vt.h && vy < vt.y) {
                            if ((vx - vt.x + vt.y - vy) % 6 < 3) wt += vt.wt; // checkerboard tree
                        }
                    }
                }
            } else {
                // In border
                wt += params.borderWt * 0.5; // base border fill

                // Add decoration
                var bDist = Math.min(x, w - x, y, h - y);
                if (params.cornerType === 0) {
                    // meander
                    if (safeMod(x, 20) < 5 || safeMod(y, 20) < 5) wt += params.cornerWt;
                } else if (params.cornerType === 1) {
                    // rosettes in border corners
                    if (Math.min(x, w - x) < params.borderW && Math.min(y, h - y) < params.borderW) {
                        if (Math.sqrt(Math.pow(safeMod(x, params.borderW) - params.borderW / 2, 2) + Math.pow(safeMod(y, params.borderW) - params.borderW / 2, 2)) < params.borderW * 0.4) {
                            wt += params.cornerWt;
                        }
                    }
                } else {
                    // stepped diagonal border
                    if (Math.floor(x / 15) % 2 === Math.floor(y / 15) % 2) wt += params.cornerWt;
                }
            }
            break;

        case 'maximalism':
            wt = engineNoiseField(x, y, w, h) * (params.fieldWt || 8.0);
            break;

        // ── ARTYPING ENGINES (Nelson / Flanagan ornamental typewriting) ──────

        case 'artyping_landscape': {
            // Sky gradient: top 28% is a gentle sine-wave atmosphere
            var skyFraction = 0.28;
            var skyY = skyFraction * h;
            if (y < skyY) {
                // Sun disk
                var sunX = params.sunX, sunY = params.sunY;
                var sunR = params.sunR;
                var dSun = Math.sqrt((x - sunX) * (x - sunX) + (y - sunY) * (y - sunY));
                if (dSun < sunR) {
                    wt = params.skyHeavyWt;
                } else {
                    // Atmosphere bands: faint horizontal ripples
                    var skyBand = Math.sin((y / skyY) * Math.PI * params.skyFreq) * 0.5 + 0.5;
                    wt = skyBand * params.skyLightWt;
                }
            } else {
                // Mountain range: N overlapping serrated ridges
                var terrainY = y - skyY;
                var terrainH = h - skyY;
                var totalMtWt = 0;
                for (var mi = 0; mi < params.numMountains; mi++) {
                    var mBase   = params.mountains[mi].baseY * terrainH;
                    var mPeriod = params.mountains[mi].period;
                    var mAmp    = params.mountains[mi].amp   * terrainH;
                    var mPhase  = params.mountains[mi].phase;
                    var mWt     = params.mountains[mi].wt;
                    // Serrated ridge line: high-frequency saw applied to slow sine
                    var slowSine   = Math.sin(x / mPeriod + mPhase);
                    var fastSaw    = Math.sin(x / (mPeriod * 0.15) + mPhase * 3) * 0.25;
                    var ridgeY     = mBase + (slowSine + fastSaw) * mAmp;
                    if (terrainY > ridgeY) {
                        // Texture density: denser lower, lighter at ridgeline
                        var depthFrac = Math.min(1.0, (terrainY - ridgeY) / (terrainH * 0.35));
                        var noiseVal  = engineNoiseField(x, terrainY, w, terrainH);
                        totalMtWt += mWt * (0.4 + depthFrac * 0.6) * (0.7 + noiseVal * 0.3);
                    }
                }
                wt = Math.min(totalMtWt, params.terrainMaxWt);
            }
            break;
        }

        case 'artyping_flower': {
            var fcx = w / 2, fcy = h / 2;
            var fdx = x - fcx, fdy = y - fcy;
            var fDist = Math.sqrt(fdx * fdx + fdy * fdy);
            var fAngle = Math.atan2(fdy, fdx);
            var maxR = Math.min(w, h) * 0.46;

            // Stem: a thin vertical trunk below center
            var stemW = params.stemW;
            if (Math.abs(x - fcx) < stemW && y > fcy) {
                // Leaf buds branching off stem
                var stemFrac = (y - fcy) / (h - fcy);
                var leafBulge = Math.sin(stemFrac * Math.PI * 3) * params.leafAmp;
                if (Math.abs(x - fcx) < stemW + leafBulge) wt = params.stemWt;
            }

            // Petals: angular sine-wave perturbed spiral envelope
            if (fDist < maxR) {
                var nPetals = params.numPetals;
                // Petal envelope: r at this angle
                var petalR = maxR * (0.45 + 0.55 * Math.pow(Math.abs(Math.sin(nPetals * 0.5 * fAngle)), params.petalSharpness));
                // Spiral inward refinement
                var spiralR = petalR * (1.0 - 0.18 * Math.log(1.0 + fDist / maxR));

                if (fDist < spiralR) {
                    var radialFrac = fDist / spiralR;
                    // Core: dense center — lightens toward petal tips
                    var petalDensity = Math.pow(1.0 - radialFrac, params.densityFalloff);
                    // Petal vein: high-frequency lines along petal length
                    var vein = 0.5 + 0.5 * Math.sin(radialFrac * Math.PI * params.veinFreq + fAngle * nPetals);
                    wt = petalDensity * params.petalMaxWt * (0.5 + vein * 0.5);
                }

                // Second ring of petals (inner layer — offset by half a petal)
                if (params.hasInnerRing) {
                    var innerAngle = fAngle + Math.PI / nPetals;
                    var innerPetalR = maxR * 0.52 * (0.3 + 0.7 * Math.pow(Math.abs(Math.sin(nPetals * 0.5 * innerAngle)), params.petalSharpness + 0.5));
                    if (fDist < innerPetalR * 0.72) {
                        var innerFrac = fDist / (innerPetalR * 0.72);
                        wt = Math.max(wt, Math.pow(1.0 - innerFrac, params.densityFalloff + 0.5) * params.petalMaxWt * 0.75);
                    }
                }
            }
            break;
        }

        case 'artyping_abstract': {
            // Three abstract sub-styles: choose by seed-derived style index
            var abStyle = params.abstractStyle;
            if (abStyle === 0) {
                // Rhythmic field: repeating character grid with rectangular holes
                var fieldPeriodX = params.fieldPeriodX, fieldPeriodY = params.fieldPeriodY;
                var inHole = false;
                for (var hi = 0; hi < params.holes.length; hi++) {
                    var hole = params.holes[hi];
                    if (x >= hole.x && x < hole.x + hole.w && y >= hole.y && y < hole.y + hole.h) {
                        inHole = true;
                        break;
                    }
                }
                if (!inHole) {
                    var fx2 = safeMod(x, fieldPeriodX) / fieldPeriodX;
                    var fy2 = safeMod(y, fieldPeriodY) / fieldPeriodY;
                    var dist2Center = Math.sqrt((fx2 - 0.5) * (fx2 - 0.5) + (fy2 - 0.5) * (fy2 - 0.5));
                    if (dist2Center < params.dotRadius) {
                        wt = params.fieldWtAbs * (1.0 - dist2Center / params.dotRadius);
                    }
                }
            } else if (abStyle === 1) {
                // Constructivist lines: sparse diagonal stripes + border boxes
                var diagPeriod = params.diagPeriod;
                var linePhase = (x - y);
                if (safeMod(linePhase, diagPeriod) < params.lineThickness) {
                    wt = params.lineWt;
                }
                // Alt diagonal
                var linePhase2 = x + y;
                if (safeMod(linePhase2, diagPeriod * 1.5) < params.lineThickness * 0.7) {
                    wt = Math.max(wt, params.lineWt * 0.7);
                }
                // Box frame border
                var bDist3 = Math.min(x, w - 1 - x, y, h - 1 - y);
                if (bDist3 < params.boxBorderT || (bDist3 > params.boxInnerGap && bDist3 < params.boxInnerGap + 2)) {
                    wt = params.lineWt * 1.2;
                }
            } else {
                // Overtyped splatter: scattered cluster stamps using deterministic scatter
                for (var ci2 = 0; ci2 < params.clusters.length; ci2++) {
                    var cl = params.clusters[ci2];
                    var clDx = x - cl.cx;
                    var clDy = y - cl.cy;
                    var clDist = Math.sqrt(clDx * clDx + clDy * clDy);
                    if (clDist < cl.r) {
                        var splatDensity = (1.0 - clDist / cl.r);
                        // Noise texture inside cluster
                        var splatNoise = engineNoiseField(x + cl.cx * 0.1, y + cl.cy * 0.1, w, h);
                        wt = Math.max(wt, splatDensity * cl.wt * (0.6 + splatNoise * 0.4));
                    }
                }
            }
            break;
        }
    }
    return wt;
}

// ── ENGINE PARAMETER GENERATOR ───────────────────────────────────────────────
// Uses PRNG to create parameters for each Mordvinian engine.
function generatePatternParams(engine, prng, w, h) {
    var rfl = prng.rfl, rin = prng.rin;
    var params = {};

    switch (engine) {
        case 'bogolan':
            params.orientation = rin(0, 1);
            params.stripW = Math.floor((params.orientation === 1 ? w : h) / rin(3, 9));
            var numMotifs = rin(2, 5);
            params.motifs = [];
            for (var bi = 0; bi < numMotifs; bi++) {
                params.motifs.push({
                    type: rin(0, 3),
                    p1: rin(20, 60),
                    p2: rin(4, 15),
                    wt: rfl(4, 9)
                });
            }
            params.borderT = rin(2, 8);
            params.borderWt = rfl(5, 12);
            break;

        case 'kuba':
            params.patchSize = rin(20, 80);
            // Generate specific meander and stepped params to map tightly
            params.mP = rin(10, 30);
            params.mT = rin(1, 4);
            params.mWt = rfl(3, 8);
            params.sP = rin(10, 30);
            params.sT = rin(2, 6);
            params.sWt = rfl(4, 9);
            params.bT = rin(2, 6);
            params.bWt = rfl(5, 12);
            break;

        case 'wari':
            params.patchW = Math.floor(w / rin(3, 6)); // 3 to 6 columns
            params.patchH = Math.floor(h / rin(4, 8)); // 4 to 8 rows
            params.ringR = rin(10, Math.floor(params.patchW * 0.4));
            params.ringT = rin(2, 6);
            params.fuzz = rin(6, 16); // frequency of tie-dye bleeding
            params.ringWt = rfl(4, 9);
            params.step = rin(4, 12);
            params.stepT = rin(1, 4);
            params.stepWt = rfl(2, 5);
            params.gridP = rin(6, 14);
            params.gridT = rin(1, 3);
            params.gridWt = rfl(2, 5);
            params.seamT = rin(1, 4);
            params.seamWt = rfl(3, 7);
            break;

        case 'navajo':
            params.bandH = Math.floor(h / rin(3, 7)); // 3 to 7 big bands
            var nbands = rin(3, 7);
            params.bands = [];
            for (var nbi = 0; nbi < nbands; nbi++) {
                params.bands.push({
                    type: rin(0, 2),
                    diaR: Math.floor(params.bandH * rfl(0.3, 0.45)),
                    stepSz: rin(2, 6),
                    amp: rin(4, 15),
                    period: rin(20, 50),
                    wt: rfl(4, 9)
                });
            }
            // At least one diamond band
            params.bands[Math.floor(nbands / 2)].type = 0;

            params.stripeT = rin(2, 8);
            params.stripeWt = rfl(3, 8);
            break;

        case 'spider_cross':
            params.crossSize = Math.floor(Math.min(w, h) * rfl(0.5, 0.8));
            params.crossT = rin(Math.floor(params.crossSize * 0.1), Math.floor(params.crossSize * 0.2));
            params.crossWt = rfl(5, 12);
            params.borderAmp = rin(10, 30);
            params.borderPeriod = rin(30, 80);
            params.borderWt = rfl(3, 8);
            params.bandT = rin(4, 12);
            params.bgWt = rfl(1, 4);
            break;

        case 'fret_bands':
            var numFBands = rin(3, 8);
            params.bandH = Math.floor(h / numFBands);
            params.fretPeriodX = rin(40, 100);
            params.fretPeriodY = Math.floor(params.bandH * rfl(0.6, 0.9));
            params.fretSteps = rin(3, 6);
            params.fretT = rin(2, 6);
            params.fretWt = rfl(6, 12);
            params.stripeT = rin(2, 5);
            params.stripeWt = rfl(3, 8);
            break;

        case 'optical_box':
            params.boxW = Math.floor(w * rfl(0.7, 0.9));
            params.boxH = Math.floor(h * rfl(0.7, 0.9));
            params.steps = rin(5, 12);
            params.boxT = rin(2, 6);
            params.boxWt = rfl(5, 10);
            params.stripeT = rin(2, 8);
            params.stripeP = rin(10, 30);
            params.bgWt = rfl(2, 6);
            break;

        case 'serape_net':
            params.netPeriod = Math.floor(w / rin(1, 4));
            params.netAmp = Math.floor(h / rin(3, 8));
            params.netSteps = rin(4, 10);
            params.netWt = rfl(6, 12);
            params.stripeH = rin(10, 30);
            params.stripeWt = rfl(2, 5);
            break;

        case 'argyle':
            params.borderW = Math.floor(w * rfl(0.1, 0.25));
            params.scallopR = rin(15, 40);
            params.scallopP = rin(30, 80);
            params.laceWt = rfl(3, 7);

            params.latP = rin(30, 80); // large lattice
            params.latT = rin(2, 5);
            params.latL = rin(2, 4); // 2-4 lines
            params.latSpc = params.latT * rin(2, 4);
            params.argyleWt = rfl(4, 8);

            params.dotR = rin(3, 8);
            params.dotWt = rfl(2, 6);
            break;

        case 'interlace':
            params.starP = rin(30, 100); // grid period
            params.starR = Math.floor(params.starP * rfl(0.35, 0.45)); // radius of shapes
            params.starT = rin(2, 8); // thickness of strapwork
            params.starWt = rfl(4, 9);
            break;

        case 'sermat':
            var nc = rin(3, 8);
            params.centers = [];
            params.weights = [];
            var spacingX = w / (Math.ceil(Math.sqrt(nc)) + 1);
            var spacingY = h / (Math.ceil(nc / Math.ceil(Math.sqrt(nc))) + 1);
            for (var i = 0; i < nc; i++) {
                var col = i % Math.ceil(Math.sqrt(nc));
                var row = Math.floor(i / Math.ceil(Math.sqrt(nc)));
                params.centers.push([
                    Math.floor(spacingX * (col + 1) + rfl(-spacingX * 0.2, spacingX * 0.2)),
                    Math.floor(spacingY * (row + 1) + rfl(-spacingY * 0.2, spacingY * 0.2))
                ]);
                params.weights.push(rfl(3, 8));
            }
            params.armW = rin(2, 5);
            params.armL = rin(4, 12);
            params.ringR = rin(8, 25);
            params.ringW = rin(1, 4);
            params.ringWt = rfl(2, 6);
            break;

        case 'tol':
            var nl = rin(2, 5);
            params.layers = [];
            for (var j = 0; j < nl; j++) {
                params.layers.push([
                    rin(6, 30),       // period
                    rin(2, 8),        // amplitude
                    rfl(2, 8)         // weight
                ]);
            }
            break;

        case 'mastor':
            var nd = rin(2, 5);
            params.diamonds = [];
            for (var k = 0; k < nd; k++) {
                params.diamonds.push([
                    Math.floor(w / 2 + rfl(-w * 0.2, w * 0.2)),
                    Math.floor(h / 2 + rfl(-h * 0.2, h * 0.2)),
                    rin(10, 40),
                    rin(1, 5),
                    rfl(3, 8)
                ]);
            }
            params.diagP = rin(4, 16);
            params.diagT = rin(1, Math.floor(params.diagP / 2));
            params.diagWt = rfl(1, 4);
            params.adiagP = rin(4, 16);
            params.adiagT = rin(1, Math.floor(params.adiagP / 2));
            params.adiagWt = rfl(1, 4);
            break;

        case 'virma':
            params.borderW = rin(5, 15);
            params.step = rin(3, 10);
            params.stepT = rin(1, Math.max(2, Math.floor(params.step / 2)));
            params.stepWt = rfl(3, 8);
            params.step2 = rin(3, 10);
            params.stepT2 = rin(1, Math.max(2, Math.floor(params.step2 / 2)));
            params.stepWt2 = rfl(2, 6);
            params.innerW = rin(5, 15);
            params.innerP = rin(8, 20);
            params.innerA = rin(2, 6);
            params.innerWt = rfl(3, 7);
            params.centralR = rin(15, 35);
            params.centralRing = rin(2, 6);
            params.centralWt = rfl(3, 8);
            break;

        case 'ved':
            var ns = rin(2, 5);
            params.scrolls = [];
            for (var m = 0; m < ns; m++) {
                params.scrolls.push([
                    rfl(5, 20),
                    rfl(0.5, 3),
                    rfl(3, 8)
                ]);
            }
            params.bandStep = rin(4, 12);
            params.bandT = rin(1, Math.max(2, Math.floor(params.bandStep / 2)));
            params.bandWt = rfl(1, 4);
            break;

        case 'chipaz':
            // Sun god — radiating crosses + concentric diamond + lattice glow
            var nr = rin(4, 8);
            params.rays = [];
            for (var ri = 0; ri < nr; ri++) {
                var angle = ri * Math.PI * 2 / nr;
                var dist = rfl(10, 35);
                params.rays.push([
                    Math.floor(w / 2 + Math.cos(angle) * dist),
                    Math.floor(h / 2 + Math.sin(angle) * dist * (h / w)),
                    rin(1, 3),   // armW
                    rin(3, 10),  // armL
                    rfl(3, 8)    // weight
                ]);
            }
            params.sunR = rin(12, 30);
            params.sunRing = rin(2, 5);
            params.sunWt = rfl(3, 8);
            params.glowP = rin(6, 16);
            params.glowT = rin(1, 3);
            params.glowWt = rfl(1, 3);
            break;

        case 'kudo':
            // House — brick masonry + room partitions
            params.brickW = rin(4, 12);
            params.brickH = rin(3, 8);
            params.brickWt = rfl(2, 5);
            var nRooms = rin(3, 8);
            params.rooms = [];
            for (var ri2 = 0; ri2 < nRooms; ri2++) {
                params.rooms.push([
                    rin(0, w - 10),      // x
                    rin(0, h - 10),      // y
                    rin(8, 25),           // width
                    rin(8, 30),           // height
                    rfl(2, 7)             // weight
                ]);
            }
            params.frameStep = rin(4, 10);
            params.frameT = rin(1, Math.max(2, Math.floor(params.frameStep / 2)));
            params.frameWt = rfl(1, 4);
            break;

        case 'pulay':
            // Waist belt — horizontal bands with varied motifs
            params.bandH = rin(8, 25);
            var nBands = rin(3, 7);
            params.bands = [];
            for (var bi2 = 0; bi2 < nBands; bi2++) {
                var btype = rin(0, 4);
                params.bands.push({
                    type: btype,
                    p1: rin(4, 16),
                    p2: rin(1, 6),
                    p3: rin(1, 3),
                    wt: rfl(3, 8)
                });
            }
            // Duckfoot accents
            var nFeet = rin(2, 6);
            params.feet = [];
            for (var fi = 0; fi < nFeet; fi++) {
                params.feet.push([
                    rin(5, w - 5),   // cx
                    rin(5, h - 10),  // cy
                    rfl(3, 10),      // spread
                    rin(4, 12),      // length
                    rfl(3, 7)        // weight
                ]);
            }
            break;

        case 'sermat-kudo':
            // Pattern-house — blend 2-3 engines
            var bases = ['wari', 'navajo', 'argyle', 'interlace', 'seigaiha', 'sermat', 'tol', 'mastor', 'virma', 'ved', 'chipaz', 'kudo', 'pulay', 'kepe', 'panks', 'kishtima', 'kshtir', 'narmuny', 'pakshats', 'kolya', 'bogolan', 'kuba', 'adire', 'kente'];
            var nmix = rin(2, 3);
            params.mix = [];
            var used = {};
            for (var q = 0; q < nmix; q++) {
                var pick;
                do { pick = bases[rin(0, bases.length - 1)]; } while (used[pick]);
                used[pick] = true;
                var subPrng = makePRNG(prng.rin(1, 999999));
                params.mix.push({
                    engine: pick,
                    params: generatePatternParams(pick, subPrng, w, h),
                    weight: rfl(0.3, 1.0)
                });
            }
            break;

        case 'kepe':
            // Crown/headdress — sawtooth peaks
            params.peakH = rin(8, 20);
            params.peakW = rin(6, 16);
            params.peakWt = rfl(3, 8);
            params.fillStep = rin(3, 8);
            params.fillT = rin(1, Math.max(2, Math.floor(params.fillStep / 2)));
            params.fillWt = rfl(2, 5);
            params.crownR = rin(15, 35);
            params.crownRing = rin(2, 5);
            params.crownWt = rfl(2, 6);
            break;

        case 'panks':
            // Petal/blossom — floral rosettes
            var nFlowers = rin(3, 7);
            params.flowers = [];
            for (var pfi = 0; pfi < nFlowers; pfi++) {
                params.flowers.push([
                    rin(10, w - 10),     // cx
                    rin(10, h - 10),     // cy
                    rin(8, 25),           // radius
                    rin(3, 8) * 2,        // petals (even number)
                    rin(1, 4),            // thickness
                    rfl(3, 8)             // weight
                ]);
            }
            params.stemR = rin(20, 40);
            params.stemRing = rin(2, 5);
            params.stemWt = rfl(1, 4);
            break;

        case 'kishtima':
            // Pattern/ornament — all-over field tessellation
            params.tileType = rin(0, 1);
            params.tileP = rin(8, 24);
            params.tileT = rin(1, 3);
            params.tileWt = rfl(3, 7);
            params.nodeP = rin(6, 18);
            params.nodeSz = rin(1, 3);
            params.nodeOff = rin(0, params.nodeP);
            params.nodeWt = rfl(2, 6);
            params.fieldR = rin(20, 45);
            params.fieldRing = rin(2, 5);
            params.fieldWt = rfl(1, 3);
            break;

        case 'kshtir':
            // Spindle/whorl — rotational pinwheel
            params.armCount = rin(3, 6);
            params.armWidth = rfl(0.3, 1.2);
            params.armLen = rfl(w * 0.3, w * 0.6);
            params.spiralTwist = rfl(0.02, 0.1);
            params.armWt = rfl(4, 9);
            params.bgP = rin(10, 24);
            params.bgW = rin(1, 3);
            params.bgD = rin(1, 2);
            params.bgWt = rfl(0.5, 2);
            break;

        case 'narmuny':
            // Border/edge — decorative horizontal band strips
            params.zoneH = rin(6, 18);
            var nZones = rin(3, 7);
            params.zones = [];
            for (var nzi = 0; nzi < nZones; nzi++) {
                params.zones.push({
                    motif: rin(0, 4),
                    p1: rin(4, 16),
                    p2: rin(1, 6),
                    wt: rfl(3, 8)
                });
            }
            params.sepT = rin(1, 3);
            params.sepWt = rfl(2, 6);
            break;

        case 'pakshats':
            // Interlocking — Greek key meander layers
            var nLayers = rin(2, 4);
            params.layers = [];
            for (var pli = 0; pli < nLayers; pli++) {
                params.layers.push([
                    rin(10, 30),   // period
                    rin(1, 3),     // width
                    rin(1, 2),     // depth
                    rfl(3, 8)      // weight
                ]);
            }
            params.accentStep = rin(4, 12);
            params.accentT = rin(1, Math.max(2, Math.floor(params.accentStep / 2)));
            params.accentWt = rfl(1, 3);
            break;

        case 'kolya':
            // Corner/angle — triangular fills
            params.cornerSize = rin(15, Math.floor(Math.min(w, h) * 0.4));
            params.fillP = rin(8, 20);
            params.fillW = rin(1, 3);
            params.fillD = rin(1, 2);
            params.cornerWt = rfl(3, 8);
            params.chevP = rin(6, 16);
            params.chevA = rin(2, 6);
            params.chevWt = rfl(2, 5);
            params.edgeW = rin(2, 6);
            params.edgeWt = rfl(2, 5);
            break;

        case 'railyard':
            params.trackSpacing = rin(40, 100);
            params.containerLength = params.trackSpacing * rfl(1.5, 3.5);
            params.containerGap = rin(10, 40);
            params.trainWt = rfl(4, 10);
            params.trackWt = rfl(2, 6);
            params.yardWt = rfl(0, 2);
            break;

        case 'adire':
            params.cellSize = rin(60, 150);
            params.ringR = Math.floor(params.cellSize * rfl(0.2, 0.4));
            params.ringT = rin(3, 8);
            params.fuzz = rin(10, 30);
            params.ringWt = rfl(4, 10);
            params.waveP = rin(15, 35);
            params.waveT = rfl(0.1, 0.3);
            params.waveWt = rfl(3, 7);
            params.lP = rin(10, 25);
            params.lT = rin(2, 6);
            params.lWt = rfl(3, 8);
            params.bleed = rin(5, 15);
            params.bleedWt = rfl(5, 12);
            break;

        case 'seigaiha':
            params.period = Math.floor(w * rfl(0.15, 0.4));
            params.amp = params.period * rfl(0.15, 0.35);
            params.rowSpacing = params.amp * rfl(0.7, 1.4);
            params.thickness = rin(1, 3);
            params.stripeSpacing = params.thickness * rin(3, 7);
            params.waveWt = rfl(3, 8);
            break;

        case 'asanoha':
            params.period = Math.floor(w * rfl(0.12, 0.28));
            params.thickness = rin(2, 4);
            params.starWt = rfl(5, 10);
            break;

        case 'shippo':
            params.radius = Math.floor(w * rfl(0.12, 0.25));
            params.thickness = rin(2, 4);
            params.circleWt = rfl(5, 10);
            // Optional nested star
            params.hasStar = (rfl() > 0.5) ? 1 : 0;
            params.starRadius = params.radius * rfl(0.2, 0.4);
            params.starWt = rfl(3, 7);
            break;

        case 'kikkou':
            params.radius = Math.floor(w * rfl(0.08, 0.2));
            params.thickness = rin(2, 4);
            params.hexWt = rfl(6, 12);
            // Inner nested hexagon (hanabishi) - make it more common and larger
            params.innerOffset = rin(0, 1) === 1 ? rin(6, 15) : 0;
            params.innerWt = params.innerOffset > 0 ? rfl(4, 9) : 0;
            break;

        case 'yagasuri':
            params.colWidth = Math.floor(w * rfl(0.08, 0.15));
            params.rowHeight = Math.floor(params.colWidth * rfl(1.0, 2.0));
            params.thickness = rin(2, 6);
            params.arrowWt = rfl(6, 12);
            // Vertical separation lines
            params.sepThickness = rin(2, 4);
            params.sepWt = rfl(4, 8);
            break;

        case 'kagome':
            params.period = rin(30, 80); // spacing between parallel lines
            params.thickness = Math.floor(params.period * rfl(0.08, 0.18));
            // Inner dot (hex center)
            params.dotR = Math.floor(params.period * rfl(0.1, 0.25));
            params.dotWt = (Math.random() > 0.3) ? rfl(3, 8) : 0;
            params.kagomeWt = rfl(4, 9);
            break;

        case 'kanzemizu':
            params.periodY = rin(60, 150); // spacing between parallel rivers
            params.maskT = Math.floor(params.periodY * rfl(0.4, 0.7)); // width of the river band
            params.dotP = rin(4, 10); // stippling dot grid pitch
            params.dotR = Math.max(1, Math.floor(params.dotP * rfl(0.3, 0.5))); // dot radius
            params.waveLengths = [rin(100, 300), rin(50, 150)]; // composite sine waves
            params.amps = [rin(20, 60), rin(10, 30)]; // wave amplitudes
            params.waveWt = rfl(3, 8);
            break;

        case 'yoshiwara':
            params.periodY = rin(40, 100);
            params.periodX = params.periodY * rfl(1.5, 3.0);
            params.links = rin(2, 6) * 2; // must be even for interlocking chains
            params.thickness = Math.floor(params.periodY * rfl(0.08, 0.15));
            params.fretWt = rfl(4, 9);
            break;

        case 'matsukawa':
            params.periodX = rin(80, 200);
            params.periodY = Math.floor(params.periodX * rfl(0.6, 1.2));
            params.steps = rin(2, 5); // Number of zigzag steps
            params.thickness = rin(2, 6);
            params.pineWt = rfl(5, 10);
            break;

        case 'dazzler':
            // High-energy concentric, serrated diamonds (Navajo Transitional period)
            // One large central diamond dominating the canvas
            params.radius = Math.floor(Math.min(w, h) * rfl(0.3, 0.5));
            params.stepSize = rin(2, 8); // Serration block size (quantization)
            params.dazzleWt = rfl(6, 12); // High weight for intense contrast

            // Multiple concentric layers
            params.layers = rin(3, 7);
            params.layerSpacing = Math.floor(params.radius / params.layers);
            break;

        case 'chiefs':
            // Phase II/III Chief's Blanket layout (Navajo Classic period)
            // Background horizontal Moki stripes
            params.mokiPeriod = rin(6, 15);
            params.mokiAmp = 0; // Straight stripes, no wave
            params.mokiWt = rfl(3, 7);

            // 9-Point Diamond arrangement
            params.centerR = Math.floor(Math.min(w, h) * rfl(0.15, 0.25));
            params.edgeR = Math.floor(params.centerR * rfl(0.5, 0.8));
            params.cornerR = Math.floor(params.centerR * rfl(0.3, 0.5));
            params.stepSize = rin(4, 12); // Coarser steps than Dazzler
            params.diamondWt = rfl(8, 14); // Dominant motif
            break;

        case 'kente':
            params.stripW = Math.floor(w / rin(6, 15)); // Narrow, numerous strips
            params.blockH = Math.floor(params.stripW * rfl(1.0, 2.5)); // Rectangular sequence blocks
            params.seamW = rin(2, 6);
            params.seamWt = rfl(5, 12);
            params.cP = rin(6, 14); // dense checkered
            params.cT = rin(3, 7);
            params.cWt = rfl(4, 9);
            params.wP = rin(4, 10); // dense weft
            params.wT = rin(1, 3);
            params.wWt = rfl(3, 8);
            params.sP = rin(6, 14); // stepped
            params.sT = rin(2, 6);
            params.sWt = rfl(4, 9);
            params.bWt = rfl(2, 6);
            break;

        case 'tangents':
            // Modernist geometric layout parameters
            var nNodesT = rin(4, 10);
            params.nodes = [];
            for (var niT = 0; niT < nNodesT; niT++) {
                params.nodes.push({
                    x: rfl(w * 0.1, w * 0.9),
                    y: rfl(h * 0.1, h * 0.9),
                    r: rfl(w * 0.05, w * 0.15),
                    mark: rin(0, 3) // 0: none, 1: plus, 2: minus, 3: circle
                });
            }
            params.edges = [];
            for (var eiT = 0; eiT < nNodesT - 1; eiT++) {
                // sequential path
                params.edges.push([eiT, eiT + 1]);
                // random branching
                if (rfl() < 0.4) {
                    params.edges.push([eiT, rin(0, nNodesT - 1)]);
                }
            }
            params.nodeWt = rfl(12, 18);
            params.edgeWt = rfl(10, 15);
            params.constructWt = rfl(3, 7);
            params.gridP = rin(30, 60);
            params.gridWt = rfl(0.5, 2.0);
            break;

        case 'structural':
            // Architectural partitioning
            params.rects = [];
            var sStack = [{ x1: 0, y1: 0, x2: w, y2: h, d: 0 }];
            var sMaxDepth = rin(3, 5);

            while (sStack.length > 0) {
                var sCurr = sStack.pop();
                var srw = sCurr.x2 - sCurr.x1;
                var srh = sCurr.y2 - sCurr.y1;

                // Probability of splitting decreases with depth
                var sSplitProb = sCurr.d === 0 ? 1 : (sCurr.d < sMaxDepth ? 0.7 : 0);
                if (rfl() < sSplitProb && srw > 10 && srh > 10) {
                    var sSplitVert = srw > srh ? true : (srh > srw ? false : rfl() < 0.5);
                    if (sSplitVert) {
                        var ssx = sCurr.x1 + Math.floor(srw * rfl(0.3, 0.7));
                        sStack.push({ x1: sCurr.x1, y1: sCurr.y1, x2: ssx, y2: sCurr.y2, d: sCurr.d + 1 });
                        sStack.push({ x1: ssx, y1: sCurr.y1, x2: sCurr.x2, y2: sCurr.y2, d: sCurr.d + 1 });
                    } else {
                        var ssy = sCurr.y1 + Math.floor(srh * rfl(0.3, 0.7));
                        sStack.push({ x1: sCurr.x1, y1: sCurr.y1, x2: sCurr.x2, y2: ssy, d: sCurr.d + 1 });
                        sStack.push({ x1: sCurr.x1, y1: ssy, x2: sCurr.x2, y2: sCurr.y2, d: sCurr.d + 1 });
                    }
                } else {
                    // Leaf rectangle - finalize as a structural block
                    var sR = {
                        x1: sCurr.x1, y1: sCurr.y1, x2: sCurr.x2, y2: sCurr.y2,
                        baseWt: rfl(0, 3),
                        frames: []
                    };

                    // Add 1-4 nested frames
                    var sNumFrames = rin(1, 4);
                    var sfStart = 0;
                    for (var sfi = 0; sfi < sNumFrames; sfi++) {
                        var sfThick = rin(1, 3);
                        var sfGap = rin(1, 4);
                        sR.frames.push({
                            start: sfStart,
                            end: sfStart + sfThick,
                            wt: rfl(4, 12)
                        });
                        sfStart += sfThick + sfGap;
                    }

                    // Optional hatching
                    if (rfl() < 0.4) {
                        sR.hatch = true;
                        var sAngle = rfl(0, Math.PI);
                        sR.hS = Math.sin(sAngle);
                        sR.hC = Math.cos(sAngle);
                        sR.hP = rfl(3, 10); // period
                        sR.hT = rfl(0.5, 2); // thickness
                        sR.hWt = rfl(3, 8);
                    }
                    params.rects.push(sR);
                }
            }
            params.masterGridP = rin(10, 40);
            params.masterGridWt = rfl(1, 3);
            break;

        case 'adama':
            // Earth / Southwest strata parameters
            params.stratumH = rin(Math.floor(h / 6), Math.floor(h / 3));
            var nStrata = Math.ceil(h / params.stratumH) + 1;
            params.strata = [];
            for (var asi = 0; asi < nStrata; asi++) {
                params.strata.push({
                    type: rin(0, 4),
                    p1: rin(60, 150), // Column period or band period
                    p2: rin(20, 60),  // Dot radius or box width
                    p3: rin(30, 80),  // Box height or diaR
                    p4: rin(3, 8),    // Step size
                    p5: rin(2, 5),    // Box layers
                    wt: rfl(5, 12)    // Weight
                });
            }
            params.texP = rin(6, 14);
            params.texT = rin(1, 4);
            params.texWt = rfl(2, 6);
            params.sepT = rin(2, 6);
            params.sepWt = rfl(4, 10);
            break;

        case 'orak':
            // Parameter generator for Cosmic Surrealism
            params.sunR = rin(20, 50);
            params.sunWt = rfl(8, 15);
            params.dustWt = rfl(1, 4);

            params.rays = [];
            var numRays = rin(3, 8);
            for (var ri = 0; ri < numRays; ri++) {
                params.rays.push({
                    angle: rfl(0, Math.PI * 2),
                    width: rfl(0.1, 0.3),
                    wt: rfl(4, 10)
                });
            }

            params.warps = [];
            var numWarps = rin(1, 3);
            for (var wi = 0; wi < numWarps; wi++) {
                params.warps.push({
                    cx: Math.floor(w * rfl(0.2, 0.8)),
                    cy: Math.floor(h * rfl(0.2, 0.8)),
                    r: rin(100, 300),
                    skew: rfl(0.5, 2.0),
                    wt: rfl(5, 12)
                });
            }

            params.paths = [];
            var numPaths = rin(2, 4);
            for (var pi = 0; pi < numPaths; pi++) {
                params.paths.push({
                    cx: w / 2,
                    cy: h / 2,
                    r: rin(50, 200),
                    freq: rin(3, 8),
                    rot: rfl(0, Math.PI * 2),
                    wt: rfl(6, 12)
                });
            }
            break;

        case 'glitch':
            // Glitch parameter generator
            params.tearH = rin(10, 50);
            params.tearMax = rin(5, 40);
            params.spikeFreq = rin(1, 5);
            params.spikeWt = rfl(10, 20);
            params.scanP = rin(4, 10);
            params.scanT = rin(1, 3);
            params.scanWt = rfl(2, 6);

            params.smears = [];
            var numSmears = rin(5, 15);
            for (var si = 0; si < numSmears; si++) {
                params.smears.push({
                    cx: Math.floor(w * rfl()),
                    cy: Math.floor(h * rfl()),
                    len: rin(40, 150),
                    angle: rfl() < 0.5 ? Math.PI / 2 : 0, // Vertical or Horizontal
                    thresh: rfl(0.3, 0.7),
                    wt: rfl(5, 12)
                });
            }

            params.blocks = [];
            var numBlocks = rin(3, 8);
            for (var bi = 0; bi < numBlocks; bi++) {
                params.blocks.push({
                    cx: Math.floor(w * rfl()),
                    cy: Math.floor(h * rfl()),
                    size: rin(20, 60),
                    wt: rfl(6, 15)
                });
            }

            params.cells = [];
            var numCells = rin(10, 25);
            for (var ci = 0; ci < numCells; ci++) {
                // Determine cellular camouflage zone coordinates and their color mapped weight
                params.cells.push({
                    cx: Math.floor(w * rfl()),
                    cy: Math.floor(h * rfl()),
                    wt: rfl(0, 30) // Weight spread maps uniquely to chrome palettes
                });
            }
            params.cellSize = rin(2, 8); // Quantized block size for cellular output
            break;

        case 'art_deco':
            params.lines = [];
            var numLines = rin(3, 7);
            for (var l = 0; l < numLines; l++) {
                params.lines.push({
                    x1: rin(w * 0.1, w * 0.9),
                    y1: rin(h * 0.1, h * 0.9),
                    x2: rin(w * 0.1, w * 0.9),
                    y2: rin(h * 0.1, h * 0.9),
                    steps: rin(3, 8),
                    spacing: rin(5, 15),
                    thick: rin(1, 4),
                    isZigzag: rfl() > 0.6,
                    wt: rfl(8, 15)
                });
            }
            params.bgStripe = {
                active: rfl() > 0.5,
                y: rin(h * 0.05, h * 0.95),
                h: rin(10, 40),
                wt: rfl(3, 6)
            };
            params.cornerTriangles = {
                active: rfl() > 0.3,
                size: rin(20, 60),
                steps: rin(3, 6),
                wt: rfl(10, 20)
            };
            break;

        case 'cubist':
            params.slabs = [];
            var numCubistSlabs = rin(4, 9);
            for (var cs = 0; cs < numCubistSlabs; cs++) {
                var cw = rin(w * 0.15, w * 0.4);
                var ch = rin(h * 0.15, h * 0.4);
                params.slabs.push({
                    x1: rin(0, w - cw),
                    y1: rin(0, h - ch),
                    x2: 0, y2: 0,
                    wt: rfl(7, 14)
                });
                params.slabs[cs].x2 = params.slabs[cs].x1 + cw;
                params.slabs[cs].y2 = params.slabs[cs].y1 + ch;
            }
            params.moons = [];
            var numMoons = rin(2, 5);
            for (var cm = 0; cm < numMoons; cm++) {
                params.moons.push({
                    cx: rin(w * 0.1, w * 0.9),
                    cy: rin(h * 0.1, h * 0.9),
                    r: rin(15, 45),
                    isVerticalSplit: rfl() > 0.5,
                    leftWt: rfl(10, 15),
                    rightWt: rfl(2, 6)
                });
            }
            params.waves = [];
            var numWaves = rin(1, 3);
            for (var cw2 = 0; cw2 < numWaves; cw2++) {
                params.waves.push({
                    y: rin(h * 0.2, h * 0.8),
                    amp: rin(10, 30),
                    period: rin(50, 150),
                    thick: rin(15, 30),
                    wt: rfl(8, 12)
                });
            }
            break;

        case 'pre_columbian':
            params.steps = [];
            var numSteps = rin(3, 8);
            for (var ps = 0; ps < numSteps; ps++) {
                params.steps.push({
                    x: rin(0, w),
                    y: rin(0, h),
                    size: rin(40, 100),
                    stepSize: rin(10, 25),
                    direction: rfl() > 0.5 ? 1 : -1,
                    wt: rfl(10, 15)
                });
            }
            params.borders = [];
            var numBorders = rin(2, 4);
            for (var pb = 0; pb < numBorders; pb++) {
                params.borders.push({
                    y: rin(h * 0.1, h * 0.9),
                    amp: rin(15, 30),
                    period: rin(20, 50),
                    thick: rin(8, 20),
                    wt: rfl(8, 12)
                });
            }
            break;

        case 'stolz':
            params.blocks = [];
            var cols = rin(3, 7);
            var rows = rin(3, 7);
            var cStep = w / cols;
            var rStep = h / rows;

            for (var c = 0; c < cols; c++) {
                for (var r = 0; r < rows; r++) {
                    if (rfl() > 0.8) continue;

                    var bx = (c * cStep) + rin(-cStep * 0.1, cStep * 0.1);
                    var by = (r * rStep) + rin(-rStep * 0.1, rStep * 0.1);
                    var bw = cStep * rfl(0.8, 1.2);
                    var bh = rStep * rfl(0.8, 1.2);

                    var bType = rin(0, 4);

                    params.blocks.push({
                        x: bx,
                        y: by,
                        w: Math.max(20, bw),
                        h: Math.max(20, bh),
                        type: bType,
                        stripeDens: rin(5, 15),
                        triDir: rin(0, 3),
                        wtMain: rfl(8, 15),
                        wtSub: rfl(4, 10)
                    });
                }
            }
            break;

        case 'metropolis':
            params.buildings = [];
            // "Mega-tropolis" configuration: Much higher grid resolution
            var gridX = rin(12, 24);
            var gridY = rin(20, 40);
            var stepX = w / gridX;
            var stepY = h / gridY;

            for (var gi = 0; gi < gridX; gi++) {
                for (var gj = 0; gj < gridY; gj++) {
                    // Maximum occupancy for the "Mega" look
                    if (rfl() > 0.98) continue; 

                    var bW = stepX * rfl(0.85, 1.05); // Allow some slight overlap/tight fit
                    var bH = stepY * rfl(0.85, 1.05);
                    var bTypes = ['solid', 'windows', 'slabs', 'pillars'];
                    
                    params.buildings.push({
                        x: gi * stepX + (stepX - bW) / 2,
                        y: gj * stepY + (stepY - bH) / 2,
                        w: bW,
                        h: bH,
                        margin: rfl(0.5, 2), // Tighter streets
                        type: bTypes[rin(0, 3)],
                        winW: rin(2, 4),
                        winH: rin(2, 4),
                        slabH: rin(3, 8),
                        pillW: rin(1, 3),
                        wt: rfl(10, 18) // Higher base weight
                    });
                }
            }

            // Generate "Districts" (Mega-blocks) for layered baseline density
            params.districts = [];
            var numDistricts = rin(2, 4);
            for (var di = 0; di < numDistricts; di++) {
                var dw = rin(w * 0.3, w * 0.7);
                var dh = rin(h * 0.3, h * 0.7);
                params.districts.push({
                    x: rin(0, w - dw),
                    y: rin(0, h - dh),
                    w: dw,
                    h: dh,
                    wt: rfl(5, 12)
                });
            }
            break;

        case 'brutalist':
            params.slabs = [];
            var numSlabs = rin(3, 6);
            for (var sli = 0; sli < numSlabs; sli++) {
                var sw = rin(w * 0.2, w * 0.5);
                var sh = rin(h * 0.2, h * 0.5);
                params.slabs.push({
                    x1: rin(0, w - sw),
                    y1: rin(0, h - sh),
                    x2: 0, y2: 0,
                    wt: rfl(8, 15)
                });
                params.slabs[sli].x2 = params.slabs[sli].x1 + sw;
                params.slabs[sli].y2 = params.slabs[sli].y1 + sh;
            }
            params.rebar = [];
            var numRebar = rin(5, 12);
            for (var ri = 0; ri < numRebar; ri++) {
                params.rebar.push({
                    axis: rfl() < 0.5 ? 'h' : 'v',
                    pos: rin(0, w),
                    wt: rfl(5, 12)
                });
            }
            break;

        case 'axonometric':
            params.volumes = [];
            var numVols = rin(3, 5);
            for (var vi = 0; vi < numVols; vi++) {
                params.volumes.push({
                    cx: rin(w * 0.2, w * 0.8),
                    cy: rin(h * 0.2, h * 0.8),
                    w: rin(40, 100),
                    h: rin(40, 100),
                    wt: rfl(10, 15)
                });
            }
            break;

        case 'blueprint':
        case 'blueprint_cyan':
            params.lines = [];
            var nLines = rin(12, 25); // Denser lines
            for (var li = 0; li < nLines; li++) {
                params.lines.push({
                    x: rin(0, w),
                    y: rin(0, h),
                    wt: rfl(8, 15)
                });
            }
            params.marks = [];
            var nMarks = rin(20, 40); // More notations
            for (var mi = 0; mi < nMarks; mi++) {
                params.marks.push({
                    cx: rin(0, w),
                    cy: rin(0, h),
                    size: rin(10, 30),
                    type: rin(0, 2), // Plus, Circle, Arrow
                    wt: rfl(10, 20)
                });
            }
            break;

        case 'circuit':
            params.traces = [];
            var nTraces = rin(10, 20);
            for (var ti = 0; ti < nTraces; ti++) {
                params.traces.push({
                    x1: rin(0, w), y1: rin(0, h),
                    x2: rin(0, w), y2: rin(0, h),
                    thick: rin(1, 3),
                    wt: rfl(8, 15)
                });
            }
            params.chips = [];
            var nChips = rin(2, 5);
            for (var ci = 0; ci < nChips; ci++) {
                var cw = rin(30, 80);
                var ch = rin(30, 80);
                params.chips.push({
                    x1: rin(0, w - cw),
                    y1: rin(0, h - ch),
                    x2: 0, y2: 0,
                    wt: rfl(12, 18)
                });
                params.chips[ci].x2 = params.chips[ci].x1 + cw;
                params.chips[ci].y2 = params.chips[ci].y1 + ch;
            }
            break;

        case 'malevich':
            params.shapes = [];
            var nShapes = rin(5, 12);
            for (var si = 0; si < nShapes; si++) {
                params.shapes.push({
                    cx: rin(0, w),
                    cy: rin(0, h),
                    type: rin(0, 3), // Square, Circle, Beam, Cross
                    size: rin(20, 120),
                    rot: rfl(0, Math.PI * 2),
                    wt: rfl(10, 35) // High dynamic range for colors
                });
            }
            break;

        case 'mondrian':
            params.lineT = rin(2, 5);
            params.lineWt = 150; // maps to Black (end of palette)
            params.slabs = [];
            function subMondrian(x1, y1, x2, y2, d) {
                var sw = x2 - x1, sh = y2 - y1;
                if (d <= 0 || (sw < 60 && sh < 60)) {
                    var cIdx = rin(0, 15);
                    var cWt = 75; // default white (index 3)
                    if (cIdx === 0) cWt = 10; // red (index 0)
                    else if (cIdx === 1) cWt = 30; // blue (index 1)
                    else if (cIdx === 2) cWt = 42;  // yellow (index 2)
                    params.slabs.push({ x1: x1, y1: y1, x2: x2, y2: y2, wt: cWt });
                    return;
                }
                if (sw > sh) {
                    var sp = x1 + rin(Math.floor(sw * 0.2), Math.floor(sw * 0.8));
                    subMondrian(x1, y1, sp, y2, d - 1);
                    subMondrian(sp, y1, x2, y2, d - 1);
                } else {
                    var sp = y1 + rin(Math.floor(sh * 0.2), Math.floor(sh * 0.8));
                    subMondrian(x1, y1, x2, sp, d - 1);
                    subMondrian(x1, sp, x2, y2, d - 1);
                }
            }
            subMondrian(0, 0, w, h, rin(4, 6));
            break;

        case 'shiprock':
            params.period = rin(12, 24);
            params.serration = rfl(0.8, 1.5);
            params.bands = [];
            var numBands = rin(3, 6);
            for (var bi = 0; bi < numBands; bi++) {
                var bandW = rin(10, 25);
                var bx = rin(0, w - bandW);
                params.bands.push({ x1: bx, x2: bx + bandW, wt: rin(15, 45) });
            }
            break;

        case 'cherokee':
            params.step = rin(8, 16);
            params.wtHeavy = rin(30, 60);
            params.wtLight = rin(10, 20);
            break;

        case 'woodcut':
            params.gouges = [];
            var numGouges = rin(40, 80);
            var isVertical = rin(0, 1);
            for (var gi = 0; gi < numGouges; gi++) {
                var x1 = rin(0, w);
                var y1 = rin(0, h);
                var angle = isVertical ? rfl(-0.1, 0.1) : rfl(1.4, 1.6);
                var len = rin(20, 100);
                var x2 = x1 + Math.cos(angle) * len;
                var y2 = y1 + Math.sin(angle) * len;
                params.gouges.push({
                    x1: x1, y1: y1, x2: x2, y2: y2,
                    width: rfl(1.5, 4),
                    wt: rin(30, 70)
                });
            }
            break;

        case 'collage':
            // Textile Collage - random overlapping scraps and stitching
            params.scraps = [];
            var numScraps = rin(6, 12);
            for (var i = 0; i < numScraps; i++) {
                params.scraps.push({
                    cx: rin(0, w),
                    cy: rin(0, h),
                    w: rin(40, 120),
                    h: rin(40, 120),
                    rot: rfl(0, Math.PI * 2),
                    wt: rin(10, 80)
                });
            }
            params.stitches = [];
            var numStitchLines = rin(10, 20);
            for (var j = 0; j < numStitchLines; j++) {
                var sx1 = rin(0, w), sy1 = rin(0, h);
                var slen = rin(15, 60);
                var sang = rfl(0, Math.PI * 2);
                params.stitches.push({
                    x1: sx1, y1: sy1,
                    x2: sx1 + Math.cos(sang) * slen,
                    y2: sy1 + Math.sin(sang) * slen,
                    wt: 90 // High weight for distinct thread
                });
            }
            break;

        case 'bricolage':
            params.patches = [];
            params.blobs = [];
            params.threads = [];

            // 1. Irregular/Skewed paper and fabric patches with heavy embroidered edges
            var nPatches = rin(5, 10);
            for (var pi = 0; pi < nPatches; pi++) {
                params.patches.push({
                    cx: rin(0, w), cy: rin(0, h),
                    w: rin(30, 90), h: rin(30, 90),
                    rot: rfl(-0.5, 0.5), // slight misalignments
                    wt: rin(15, 60),
                    stitchWt: 95, // Heavy black/orange thread
                    stitchGap: rfl(4, 8),
                    stitchLen: rfl(2, 4)
                });
            }
            // 2. Applique Blobs / Dye circles
            var nBlobs = rin(3, 7);
            for (var bi = 0; bi < nBlobs; bi++) {
                var r = rin(10, 35);
                params.blobs.push({
                    cx: rin(0, w), cy: rin(0, h),
                    rSq: r * r,
                    wt: rin(40, 85)
                });
            }
            // 3. Chaotic wandering/circular threads
            var nThreads = rin(8, 15);
            for (var ti = 0; ti < nThreads; ti++) {
                params.threads.push({
                    cx: rin(0, w), cy: rin(0, h),
                    r: rin(10, 40),
                    dashes: rin(8, 20), // Number of stitches around the circle
                    wt: 98 // Extreme weight for contrast
                });
            }
            break;

        case 'flow':
            // Curved ribbon flow field
            var nStreams = rin(6, 14);
            params.streams = [];
            for (var si = 0; si < nStreams; si++) {
                var halfW = rin(3, 18);
                params.streams.push({
                    baseY: rin(-20, h + 20),
                    amp: rin(10, Math.floor(h * 0.3)),
                    freq: rfl(0.01, 0.08),
                    phase: rfl(0, Math.PI * 2),
                    angle: rfl(-0.5, 0.5),
                    halfW: halfW,
                    segLen: rin(5, 25),
                    wt: rfl(3, 9)
                });
            }
            break;

        case 'river_flow':
            // Organic multi-frequency water streams
            params.streams = [];
            var nRs = rin(4, 9);
            for (var rsi = 0; rsi < nRs; rsi++) {
                var nFreqs = rin(2, 4);
                var freqs = [];
                for (var rfi = 0; rfi < nFreqs; rfi++) {
                    freqs.push({
                        freq: rfl(0.01, 0.04),
                        amp: rfl(15, 60),
                        phase: rfl(0, Math.PI * 2)
                    });
                }
                params.streams.push({
                    baseY: rin(-50, h + 50),
                    width: rfl(20, 80),
                    wt: rfl(6, 15),
                    frequencies: freqs
                });
            }
            break;

        case 'flowing_contours':
            // 2D scalar field components (low-frequency waves)
            params.waves = [];
            var nW = rin(3, 5);
            for (var iW = 0; iW < nW; iW++) {
                var ang = rfl(0, Math.PI * 2);
                var freq = rfl(0.015, 0.045);
                params.waves.push({ fx: Math.cos(ang) * freq, fy: Math.sin(ang) * freq, amp: rfl(20, 50), ph: rfl(0, Math.PI * 2) });
            }
            params.interval = rfl(30, 70);
            params.thick = rfl(3, 8);
            params.wt = rfl(6, 15);
            break;

        case 'current':
            // Directional band stack
            params.angle = rfl(-0.4, 0.4); // Dominant direction (near-horizontal)
            var angleChoice = rin(0, 2);
            if (angleChoice === 1) params.angle += Math.PI / 2; // vertical variant
            else if (angleChoice === 2) params.angle += Math.PI / 4; // diagonal variant
            params.gap = rin(1, 4);
            var nBands = rin(8, 25);
            params.bands = [];
            for (var bi = 0; bi < nBands; bi++) {
                params.bands.push({
                    w: rin(3, 20),
                    blockLen: rin(8, 40),
                    wt: rfl(3, 9)
                });
            }
            break;
        case 'azulejo':
            params.tileSize = rin(20, Math.floor(Math.min(w, h) * 0.4));
            params.medR = Math.floor(params.tileSize * rfl(0.2, 0.4));
            params.medT = rin(2, 6);
            params.medWt = rfl(5, 12);
            params.cornerR = Math.floor(params.tileSize * rfl(0.3, 0.6));
            params.cornerT = rin(2, 5);
            params.cornerWt = rfl(4, 9);
            params.cornerInnerR = Math.floor(params.cornerR * rfl(0.4, 0.7));
            params.cornerInnerWt = rfl(3, 8);
            params.grout = rin(2, 6);
            params.groutWt = rfl(6, 15);
            break;

        case 'arraiolos':
            params.centerR = Math.floor(Math.min(w, h) * rfl(0.15, 0.25));
            params.stepSz = rin(3, 8);
            params.centerWt = rfl(6, 12);
            var b1W = Math.floor(Math.min(w, h) * rfl(0.08, 0.15));
            params.b1Start = Math.floor(Math.min(w, h) * rfl(0.02, 0.05));
            params.b1End = params.b1Start + b1W;
            params.b1Step = rin(4, 10);
            params.b1T = Math.floor(params.b1Step / 2) || 1;
            params.b1Wt = rfl(5, 10);
            params.b2Start = params.b1End + rin(4, 10);
            params.b2End = params.b2Start + rin(10, 30);
            params.b2P = rin(6, 14);
            params.b2T = rin(1, 4);
            params.b2Wt = rfl(4, 8);
            params.fieldP = rin(6, 16);
            params.fieldT = rin(1, 3);
            params.fieldWt = rfl(2, 6);
            break;

        case 'viana':
            params.bandH = rin(15, 50);
            params.sepT = rin(2, 6);
            params.sepWt = rfl(5, 10);
            params.bands = [];
            var nVb = rin(3, 7);
            for (var vi = 0; vi < nVb; vi++) {
                var typ = rin(0, 3);
                params.bands.push({
                    type: typ,
                    p1: typ === 0 ? rin(10, 30) : typ === 1 ? rin(15, 40) : typ === 2 ? rin(2, 10) : rin(8, 20),
                    p2: typ === 0 ? rin(4, 12) : typ === 1 ? Math.floor(params.bandH * rfl(0.2, 0.4)) : typ === 2 ? 0 : rin(1, 4),
                    wt: rfl(4, 10)
                });
            }
            break;

        case 'castelo_branco':
            var nSc = rin(3, 8);
            params.scrolls = [];
            for (var sci = 0; sci < nSc; sci++) {
                params.scrolls.push({ amp: rfl(10, w * 0.3), period: rfl(0.5, 3), wt: rfl(4, 9) });
            }
            var nFl = rin(4, 12);
            params.flowers = [];
            for (var fli = 0; fli < nFl; fli++) {
                params.flowers.push({
                    cx: Math.floor(rfl(0, w)), cy: Math.floor(rfl(0, h)),
                    r: rin(15, 40), petals: rin(4, 8), sharp: rfl() > 0.5 ? 1 : 0,
                    wt: rfl(5, 12)
                });
            }
            params.trunkP = rin(40, 150);
            params.trunkAmp = rin(10, 50);
            params.trunkT = rin(4, 12);
            params.trunkWt = rfl(6, 15);
            break;

        case 'verena': {
            // Loewensberg diagonal bands — 5-10 bold sweeping parallelogram strips
            var nBands = rin(5, 11);
            params.bands = [];
            var diagonal = rfl(0, 1) > 0.5 ? 1 : -1; // overall diagonal direction
            for (var vbi = 0; vbi < nBands; vbi++) {
                var baseAngle = diagonal * rfl(0.2, 0.7) + (rfl(0, 1) > 0.7 ? Math.PI / 2 : 0);
                params.bands.push({
                    cx: rfl(-w * 0.1, w * 1.1),
                    cy: rfl(-h * 0.1, h * 1.1),
                    angle: baseAngle + rfl(-0.15, 0.15), // slight angle variation per band
                    hw: rfl(15, 60),   // half-width (thickness of band)
                    hl: rfl(w * 0.4, w * 1.2), // half-length (span)
                    wt: rfl(4, 10)
                });
            }
            break;
        }

        case 'cypress_hills':
            // Rolling stepped hills with prominent cypress trees
            params.hills = [];
            var nHills = rin(3, 6);
            for (var i = 0; i < nHills; i++) {
                params.hills.push({
                    amp: rin(20, 80),
                    period: rin(50, 200),
                    phase: rfl(0, Math.PI * 2),
                    baseY: rin(Math.floor(h * 0.4), Math.floor(h * 0.9)),
                    step: rin(4, 12),
                    wt: rfl(4, 12)
                });
            }
            params.trees = [];
            var nTrees = rin(5, 15);
            for (var i = 0; i < nTrees; i++) {
                params.trees.push({
                    x: rin(Math.floor(w * 0.1), Math.floor(w * 0.9)),
                    y: rin(Math.floor(h * 0.3), Math.floor(h * 0.7)),
                    h: rin(40, 120),
                    w: rin(15, 40),
                    wt: rfl(8, 15)
                });
            }
            params.sunR = rin(20, 60);
            params.sunX = rin(Math.floor(w * 0.2), Math.floor(w * 0.8));
            params.sunY = rin(Math.floor(h * 0.1), Math.floor(h * 0.3));
            params.sunWt = rfl(5, 12);
            break;

        case 'sierra_sunset':
            // Layered chevron mountains descending into a valley
            params.mountains = [];
            var nRanges = rin(4, 8);
            for (var i = 0; i < nRanges; i++) {
                params.mountains.push({
                    baseY: rin(Math.floor(h * 0.3), Math.floor(h * 0.8)),
                    period: rin(80, 250),
                    amp: rin(30, 100),
                    thick: rin(10, 30),
                    step: rin(5, 15),
                    wt: rfl(5, 14)
                });
            }
            params.skyBands = rin(4, 10);
            params.skyWt = rfl(2, 6);
            break;

        case 'rolling_hills':
            // Recursive hill formations + topographic contour parameters
            params.hills = [];
            var nHills = rin(3, 8);
            for (var i = 0; i < nHills; i++) {
                params.hills.push({
                    amp: rin(20, 100),
                    period: rin(80, 400),
                    phase: rfl(0, Math.PI * 2)
                });
            }
            params.interval = rin(15, 35); // Moderate intervals
            params.thickness = rfl(3, 8); // Standard lines
            params.contourWt = rfl(18, 32); // Balanced weight

            // Foreground field parameters
            params.fieldH = h * rfl(0.20, 0.45); // Standard field area
            params.fieldWt = rfl(10, 20);
            params.flowerSpc = rin(8, 16); // Normal spacing
            params.flowerDensity = rin(40, 70); // Balanced coverage
            params.flowerWt = rfl(20, 40);
            break;

        case 'panoramic_dunes':
            // Sweeping s-curves mimicking wind-blown sand
            params.dunes = [];
            var nDunes = rin(4, 9);
            for (var i = 0; i < nDunes; i++) {
                params.dunes.push({
                    baseY: rin(Math.floor(h * 0.4), Math.floor(h * 0.9)),
                    period: rin(150, 400),
                    amp: rin(40, 120),
                    phase: rfl(0, Math.PI * 2),
                    thick: rin(15, 40), // Creates the sweeping ribbon feel
                    wt: rfl(6, 12)
                });
            }
            params.windLines = rin(10, 30);
            params.windWt = rfl(1, 4);
            break;

        case 'framed_vista':
            // A central landscape vignette with a heavy stepped/floral border
            params.borderW = Math.floor(Math.min(w, h) * rfl(0.1, 0.25));
            params.borderWt = rfl(8, 15);
            params.innerBorderT = rin(4, 12);
            params.innerBorderWt = rfl(5, 10);

            // Vignette contents
            params.vigHills = [];
            for (var i = 0; i < 3; i++) {
                params.vigHills.push({
                    baseY: rin(Math.floor(h * 0.5), Math.floor(h * 0.8)),
                    period: rin(40, 100),
                    amp: rin(10, 40),
                    wt: rfl(4, 9)
                });
            }
            params.vigTrees = [];
            for (var i = 0; i < 4; i++) {
                params.vigTrees.push({
                    x: rin(params.borderW + 10, w - params.borderW - 10),
                    y: rin(Math.floor(h * 0.4), Math.floor(h * 0.7)),
                    h: rin(20, 60),
                    w: rin(10, 20),
                    wt: rfl(6, 12)
                });
            }
            params.vigSunR = rin(15, 30);
            params.vigSunX = Math.floor(w / 2) + rin(-40, 40);
            params.vigSunY = rin(params.borderW + 20, Math.floor(h * 0.4));
            params.vigSunWt = rfl(5, 10);

            // Decoration in the border
            params.cornerType = rin(0, 2); // 0=meander, 1=flower, 2=steps
            params.cornerWt = rfl(6, 12);
            break;

        case 'maximalism':
            // ── Intentional Maximalism parameter generation ───────────────────────

            // 1. PSYCHEDELIC COLOR FIELDS — overlapping sine waves at varied angles
            params.fields = [];
            var numFields = rin(3, 6);
            params.fieldAmpSum = 0;
            for (var mfi = 0; mfi < numFields; mfi++) {
                var fAmp = rfl(0.5, 2.0);
                params.fields.push({
                    angle: rfl(0, Math.PI),       // wave sweep direction
                    period: rfl(15, 60),           // wavelength
                    phase: rfl(0, Math.PI * 2),    // phase offset
                    amp: fAmp
                });
                params.fieldAmpSum += fAmp;
            }
            params.fieldThreshold = rfl(0.35, 0.55); // how much of the field shows
            params.fieldWt = rfl(4, 8);

            // 2. TERRAZZO SCATTER — pseudo-random chip distribution
            params.terrSeed = rin(100, 9999);
            params.terrMod = rin(60, 200);         // hash modulus (lower = denser)
            params.terrDensity = rin(2, 8);        // threshold within mod
            params.terrSpacing = rin(6, 16);       // chip grid spacing
            params.terrR = rin(2, 5);              // chip radius
            params.terrWt = rfl(3, 7);

            // 3. BOLD GEOMETRIC BLOCKS — large structural forms
            params.geoBlocks = [];
            var numBlocks = rin(3, 8);
            for (var mgi = 0; mgi < numBlocks; mgi++) {
                var gType = rin(0, 2); // 0=rect, 1=circle, 2=diagonal
                var gBlock = { type: gType, wt: rfl(4, 10) };
                if (gType === 0) {
                    // Rectangle block
                    gBlock.x = rin(5, w - 20);
                    gBlock.y = rin(5, h - 20);
                    gBlock.w = rin(15, Math.floor(w * 0.4));
                    gBlock.h = rin(15, Math.floor(h * 0.3));
                    gBlock.thickness = rin(3, 8);
                } else if (gType === 1) {
                    // Circle/arc
                    gBlock.cx = rin(10, w - 10);
                    gBlock.cy = rin(10, h - 10);
                    gBlock.r = rin(10, Math.floor(Math.min(w, h) * 0.3));
                    gBlock.thickness = rin(3, 7);
                } else {
                    // Diagonal slash
                    gBlock.x = rin(0, w);
                    gBlock.y = rin(0, h);
                    var dAngle = rfl(0, Math.PI);
                    gBlock.dirX = Math.cos(dAngle);
                    gBlock.dirY = Math.sin(dAngle);
                    gBlock.len = rin(20, Math.floor(Math.max(w, h) * 0.5));
                    gBlock.thickness = rin(3, 8);
                }
                params.geoBlocks.push(gBlock);
            }

            // 4. SQUIGGLE THREADS — meandering organic curves
            params.squiggles = [];
            var numSquiggles = rin(5, 14);
            for (var msi = 0; msi < numSquiggles; msi++) {
                params.squiggles.push({
                    orient: rin(0, 1),             // 0=horizontal, 1=vertical
                    base: rin(5, (rin(0, 1) === 0 ? h : w) - 5),
                    freq: rfl(8, 30),              // sine frequency
                    amp: rfl(5, 25),               // sine amplitude
                    thick: rin(1, 4),              // line thickness
                    wt: rfl(2, 6)
                });
            }

            // 5. DENSE BORDER CRUST — decorative frame band
            params.borderW = rin(6, Math.floor(Math.min(w, h) * 0.12));
            params.borderBaseWt = rfl(4, 8);
            params.borderCheck = rin(3, 8);        // checkerboard micro-pattern size
            params.borderPatternWt = rfl(2, 5);
            params.borderEdgeWt = rfl(3, 7);
            break;

        // ── ARTYPING ENGINE PARAMS ───────────────────────────────────────────

        case 'artyping_landscape':
            // Sky atmosphere
            params.skyFreq     = rfl(2, 5);          // sine-band count across sky
            params.skyLightWt  = rfl(1.5, 4.0);      // faint atmosphere weight
            params.skyHeavyWt  = rfl(6.0, 10.0);     // sun disk weight
            params.sunX        = rfl(w * 0.2, w * 0.8);
            params.sunY        = rfl(h * 0.02, h * 0.18);
            params.sunR        = rfl(3, 8);
            // Mountain ranges
            params.numMountains = rin(2, 4);
            params.mountains    = [];
            for (var lmi = 0; lmi < params.numMountains; lmi++) {
                params.mountains.push({
                    baseY:  rfl(0.05 + lmi * 0.18, 0.22 + lmi * 0.22), // fraction of terrain height
                    period: rfl(w * 0.12, w * 0.38),
                    amp:    rfl(0.06, 0.22),
                    phase:  rfl(0, Math.PI * 2),
                    wt:     rfl(3.5, 9.0 - lmi * 1.2)  // foreground mountains heavier
                });
            }
            params.terrainMaxWt = rfl(8.0, 14.0);
            break;

        case 'artyping_flower':
            params.numPetals      = rin(5, 9);             // 5, 6, 7, 8, or 9-petal roses
            params.petalSharpness = rfl(0.4, 1.4);         // 1 = round, 0.4 = sharp
            params.densityFalloff = rfl(0.6, 1.8);         // gradient from core to tip
            params.petalMaxWt     = rfl(8.0, 13.0);
            params.veinFreq       = rfl(4.0, 10.0);        // texture lines per petal
            params.hasInnerRing   = rfl() > 0.4;           // 60% chance of inner ring
            params.stemW          = rfl(1.2, 2.8);
            params.stemWt         = rfl(5.0, 10.0);
            params.leafAmp        = rfl(1.5, 4.0);
            break;

        case 'artyping_abstract':
            params.abstractStyle = rin(0, 2);  // 0=rhythmic, 1=constructivist, 2=splatter
            if (params.abstractStyle === 0) {
                params.fieldPeriodX = rin(5, 12);
                params.fieldPeriodY = rin(5, 12);
                params.dotRadius    = rfl(0.28, 0.48);
                params.fieldWtAbs   = rfl(7, 12);
                params.holes        = [];
                var numHoles = rin(2, 5);
                for (var ahi = 0; ahi < numHoles; ahi++) {
                    var hw = rin(8, Math.floor(w * 0.3));
                    var hh = rin(6, Math.floor(h * 0.2));
                    params.holes.push({ x: rin(0, w - hw), y: rin(0, h - hh), w: hw, h: hh });
                }
            } else if (params.abstractStyle === 1) {
                params.diagPeriod   = rin(12, 28);
                params.lineThickness= rfl(1.5, 4.0);
                params.lineWt       = rfl(6, 12);
                params.boxBorderT   = rin(2, 5);
                params.boxInnerGap  = rin(8, 20);
            } else {
                params.clusters = [];
                var numClusters = rin(4, 10);
                for (var aci = 0; aci < numClusters; aci++) {
                    params.clusters.push({
                        cx: rfl(w * 0.1, w * 0.9),
                        cy: rfl(h * 0.1, h * 0.9),
                        r:  rfl(4, Math.min(w, h) * 0.22),
                        wt: rfl(5, 12)
                    });
                }
            }
            break;
    }
    return params;
}

// ── ENGINE METADATA REGISTRY (Task 2 & Task 3) ──
var ENGINE_METADATA = {
    adama: { complexity: 4, series: 'FIELD' },
    adire: { complexity: 5, series: 'FIELD' },
    argyle: { complexity: 4, series: 'FIELD' },
    arraiolos: { complexity: 4, series: 'FIELD' },
    art_deco: { complexity: 3, series: 'SOLID' },
    asanoha: { complexity: 4, series: 'FIELD' },
    axonometric: { complexity: 5, series: 'SOLID' },
    azulejo: { complexity: 4, series: 'FIELD' },
    blueprint: { complexity: 3, series: 'SOLID' },
    blueprint_cyan: { complexity: 3, series: 'SOLID' },
    bogolan: { complexity: 4, series: 'FIELD' },
    bricolage: { complexity: 3, series: 'SOLID' },
    brutalist: { complexity: 2, series: 'SOLID' },
    castelo_branco: { complexity: 5, series: 'SCATTER' },
    cherokee: { complexity: 4, series: 'FIELD' },
    chiefs: { complexity: 4, series: 'FIELD' },
    chipaz: { complexity: 4, series: 'SCATTER' },
    circuit: { complexity: 5, series: 'SCATTER' },
    collage: { complexity: 3, series: 'SOLID' },
    cubist: { complexity: 3, series: 'SOLID' },
    current: { complexity: 5, series: 'SCATTER' },
    cypress_hills: { complexity: 4, series: 'FIELD' },
    dazzler: { complexity: 4, series: 'FIELD' },
    flow: { complexity: 5, series: 'FIELD' },
    flowing_contours: { complexity: 4, series: 'FIELD' },
    framed_vista: { complexity: 3, series: 'SOLID' },
    fret_bands: { complexity: 4, series: 'FIELD' },
    glitch: { complexity: 5, series: 'SCATTER' },
    interlace: { complexity: 4, series: 'FIELD' },
    kagome: { complexity: 4, series: 'FIELD' },
    kanzemizu: { complexity: 4, series: 'FIELD' },
    kente: { complexity: 4, series: 'FIELD' },
    kepe: { complexity: 4, series: 'FIELD' },
    kikkou: { complexity: 4, series: 'FIELD' },
    kishtima: { complexity: 4, series: 'FIELD' },
    kolya: { complexity: 4, series: 'FIELD' },
    kshtir: { complexity: 4, series: 'SCATTER' },
    kuba: { complexity: 4, series: 'FIELD' },
    kudo: { complexity: 2, series: 'SOLID' },
    malevich: { complexity: 3, series: 'SOLID' },
    mastor: { complexity: 4, series: 'FIELD' },
    matsukawa: { complexity: 4, series: 'FIELD' },
    maximalism: { complexity: 5, series: 'FIELD' },
    metropolis: { complexity: 4, series: 'SOLID' },
    mondrian: { complexity: 3, series: 'SOLID' },
    narmuny: { complexity: 4, series: 'FIELD' },
    navajo: { complexity: 4, series: 'FIELD' },
    optical_box: { complexity: 4, series: 'FIELD' },
    orak: { complexity: 5, series: 'SCATTER' },
    pakshats: { complexity: 4, series: 'FIELD' },
    panks: { complexity: 4, series: 'SCATTER' },
    panoramic_dunes: { complexity: 3, series: 'SOLID' },
    pre_columbian: { complexity: 3, series: 'SOLID' },
    pulay: { complexity: 3, series: 'FIELD' },
    river_flow: { complexity: 5, series: 'SCATTER' },
    rolling_hills: { complexity: 5, series: 'SOLID' },
    seigaiha: { complexity: 4, series: 'FIELD' },
    serape_net: { complexity: 4, series: 'FIELD' },
    sermat: { complexity: 4, series: 'SCATTER' },
    'sermat-kudo': { complexity: 5, series: 'FIELD' },
    shippo: { complexity: 4, series: 'FIELD' },
    shiprock: { complexity: 4, series: 'FIELD' },
    sierra_sunset: { complexity: 3, series: 'SOLID' },
    spider_cross: { complexity: 4, series: 'SCATTER' },
    stolz: { complexity: 5, series: 'SOLID' },
    structural: { complexity: 5, series: 'SOLID' },
    tangents: { complexity: 5, series: 'SCATTER' },
    tol: { complexity: 3, series: 'FIELD' },
    ved: { complexity: 3, series: 'FIELD' },
    verena: { complexity: 3, series: 'FIELD' },
    viana: { complexity: 4, series: 'FIELD' },
    virma: { complexity: 4, series: 'FIELD' },
    wari: { complexity: 4, series: 'FIELD' },
    woodcut: { complexity: 2, series: 'SOLID' },
    yagasuri: { complexity: 4, series: 'FIELD' },
    yoshiwara: { complexity: 3, series: 'SOLID' },
    artyping_landscape: { complexity: 4, series: 'SCENE' },
    artyping_flower:    { complexity: 5, series: 'SCENE' },
    artyping_abstract:  { complexity: 3, series: 'SCENE' }
};

