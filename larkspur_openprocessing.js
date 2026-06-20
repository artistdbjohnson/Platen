// ╭────────────────────────────────────────────────────────────────╮
// │  LARKSPUR · by douglxss                                        │
// │  OpenProcessing Edition · White ink · Black canvas · 9:16      │
// │  Spacebar / click = re-roll  ·  S = Axidraw SVG export        │
// │  github.com/artistdbjohnson/Larkspur                           │
// ╰────────────────────────────────────────────────────────────────╯

// ── Grid & layout ───────────────────────────────────────────────
var W = 78, H = 148;      // grid dimensions (cells) - default 9:16
var currentLayout = 'panel'; // 'panel' (9:16), 'banner' (16:9), 'square' (1:1)
var SIZE = 16;             // live site cell size in SVG units
var rSIZE = 14;            // flower render size in SVG units

var MARGIN = 24;
var PANEL_W, PANEL_H;     // canvas pixel dimensions of the panel
var globalScale;           // SVG-unit → canvas-pixel scale
var flowerScale;           // composite flower path → canvas-pixel scale

// ── Larkspur (3-petal) — actual FLOWER_PATH from index.html, fits ~0-20 unit box
var FLOWER_D = 'M 13.358,16.789 C 13.877,15.908 14.180,14.884 14.180,13.786 C 14.180,12.136 13.493,8.618 12.397,5.547 C 13.537,4.455 14.624,3.589 15.398,3.255 C 15.661,3.141 15.974,3.286 16.051,3.563 C 16.693,5.843 15.600,14.917 13.358,16.789 M 11.023,16.604 C 9.541,18.059 7.222,18.071 5.706,16.749 C 4.877,16.022 4.341,14.965 4.341,13.786 C 4.341,10.833 6.378,4.047 7.919,2.293 C 8.106,2.080 8.445,2.077 8.633,2.290 C 10.172,4.036 12.219,10.776 12.219,13.786 C 12.219,14.899 11.759,15.903 11.023,16.604 M 2.941,16.138 C 1.401,14.472 0.028,5.993 0.706,3.552 C 0.783,3.273 1.096,3.128 1.358,3.243 C 2.105,3.571 3.138,4.405 4.248,5.466 C 3.272,8.186 1.742,13.407 2.941,16.138 M 16.029,1.180 C 14.826,1.180 13.237,2.204 11.651,3.627 C 10.698,1.540 9.542,0.000 8.296,0.000 C 7.061,0.000 5.914,1.511 4.966,3.567 C 3.740,2.474 1.404,0.627 -0.082,1.337 C -3.020,2.747 -1.121,13.437 0.278,16.398 C 1.288,18.533 3.398,19.780 5.367,19.782 L 10.182,19.782 L 10.182,19.774 C 13.018,19.836 15.097,18.361 16.030,16.398 C 17.511,13.268 20.036,1.180 16.029,1.180';

// ── Quatrefoil — exact path from larkspur-core.js MOTIF_PATHS
var QUATREFOIL_D = 'M 15.12,10.63 c -0.34,-0.29 -0.74,-0.50 -1.16,-0.63 c 0.42,-0.13 0.82,-0.34 1.16,-0.63 c 1.06,-0.91 2.35,-4.62 2.86,-6.17 c 0.05,-0.14 0.03,-0.27 -0.04,-0.38 c -0.08,-0.12 -0.23,-0.17 -0.40,-0.14 c -1.61,0.27 -5.47,1.00 -6.52,1.91 c -0.52,0.45 -0.86,1.03 -1.00,1.65 c -0.15,-0.62 -0.48,-1.21 -1.00,-1.65 c -1.06,-0.91 -4.92,-1.64 -6.52,-1.91 c -0.18,-0.03 -0.32,0.02 -0.40,0.14 c -0.07,0.10 -0.09,0.24 -0.04,0.38 c 0.51,1.55 1.80,5.26 2.86,6.17 c 0.34,0.29 0.74,0.50 1.16,0.63 c -0.42,0.13 -0.82,0.34 -1.16,0.63 c -1.06,0.91 -2.35,4.62 -2.86,6.17 c -0.05,0.14 -0.03,0.27 0.04,0.38 c 0.07,0.10 0.18,0.15 0.31,0.15 c 0.03,0 0.06,0.00 0.09,-0.01 c 1.61,-0.27 5.47,-1.00 6.52,-1.91 c 0.52,-0.45 0.86,-1.03 1.00,-1.65 c 0.15,0.62 0.48,1.21 1.00,1.65 c 1.06,0.91 4.92,1.64 6.52,1.91 c 0.03,0.01 0.06,0.01 0.09,0.01 c 0.13,0 0.24,-0.05 0.31,-0.15 c 0.07,-0.10 0.09,-0.24 0.04,-0.38 C 17.47,15.25 16.17,11.54 15.12,10.63 Z M 10,8.5 a 1.5,1.5 0 1,0 0,3 a 1.5,1.5 0 1,0 0,-3 Z';

// ── Tatreez Cross-Stitch — solid thick X
var TATREEZ_D = 'M 2,6 L 6,2 L 10,6 L 14,2 L 18,6 L 14,10 L 18,14 L 14,18 L 10,14 L 6,18 L 2,14 L 6,10 Z';

// ── Christian Ichthus — fish symbol
var ICHTHUS_D = 'M19.370 7.130C17.927 10.077 14.599 12.874 10.900 13.817 7.218 14.755 3.257 13.880 0.474 9.740L0.000 10.000c5.900 8.600 16.810 4.626 19.900 -2.295z M19.370 12.870C17.927 9.923 14.599 7.126 10.900 6.183 7.218 5.245 3.257 6.120 0.474 10.260L0.000 10.000c5.900 -8.600 16.810 -4.626 19.900 2.295z';

// ── Viana Heart — traditional PortugueseCoracao de Viana
var VIANA_HEART_D = 'M10 19C4 13 4 8 10 8C16 8 16 13 10 19 M10 8C8 6 8 2 10 1C12 2 12 6 10 8';


// ── Active motif — 'larkspur', 'quatrefoil', or 'tatreez' (M key toggles)
var currentMotif = 'larkspur';

// ── Mathematical motifs (inspiration: DESIGN≒FORMULA)
var LISSAJOUS_D = '';
var ROSE_D = '';
var SPIROGRAPH_D = '';
var PHYLLOTAXIS_D = '';
var SUPERFORMULA_D = '';
var HARMONOGRAPH_D = '';

function updateMathMotifs(seed) {
    var prng = makePRNG(seed + 987654);

    // 1. Lissajous
    var a = prng.rin(1, 6);
    var b = prng.rin(1, 6);
    if (a === b && a > 1) b--;
    var delta = prng.rfl(0, Math.PI);
    var lissPoints = [];
    var steps = 180;
    for (var i = 0; i <= steps; i++) {
        var t = (i / steps) * 2 * Math.PI * Math.max(a, b);
        var x = 10 + 9 * Math.sin(a * t + delta);
        var y = 10 + 9 * Math.sin(b * t);
        lissPoints.push(x.toFixed(3) + ',' + y.toFixed(3));
    }
    LISSAJOUS_D = 'M ' + lissPoints.join(' L ') + ' Z';

    // 2. Rose
    var n = prng.rin(1, 8);
    var d = prng.rin(1, 4);
    if (n === d) { n = 5; d = 2; }
    var k = n / d;
    var rosePoints = [];
    var rsteps = 360;
    var maxTheta = 2 * Math.PI * d;
    for (var j = 0; j <= rsteps; j++) {
        var theta = (j / rsteps) * maxTheta;
        var r = 9 * Math.cos(k * theta);
        var rx = 10 + r * Math.cos(theta);
        var ry = 10 + r * Math.sin(theta);
        rosePoints.push(rx.toFixed(3) + ',' + ry.toFixed(3));
    }
    ROSE_D = 'M ' + rosePoints.join(' L ') + ' Z';

    // 3. Spirograph (Hypotrochoid)
    var R = prng.rin(8, 15);
    var r_sp = prng.rin(3, 7);
    if (r_sp >= R) r_sp = R - 2;
    var d_sp = prng.rfl(r_sp * 0.4, r_sp * 1.2);
    // gcd calculation
    var g = 1;
    for (var val = 1; val <= Math.min(R, r_sp); val++) {
        if (R % val === 0 && r_sp % val === 0) g = val;
    }
    var spsteps = 360;
    var spPoints = [];
    var maxSpTheta = 2 * Math.PI * (r_sp / g);
    var maxPossible = Math.abs(R - r_sp) + Math.abs(d_sp);
    if (maxPossible === 0) maxPossible = 1;
    for (var k_sp = 0; k_sp <= spsteps; k_sp++) {
        var th = (k_sp / spsteps) * maxSpTheta;
        var sx = (R - r_sp) * Math.cos(th) + d_sp * Math.cos(((R - r_sp) / r_sp) * th);
        var sy = (R - r_sp) * Math.sin(th) - d_sp * Math.sin(((R - r_sp) / r_sp) * th);
        sx = 10 + (sx / maxPossible) * 9;
        sy = 10 + (sy / maxPossible) * 9;
        spPoints.push(sx.toFixed(3) + ',' + sy.toFixed(3));
    }
    SPIROGRAPH_D = 'M ' + spPoints.join(' L ') + ' Z';

    // 4. Phyllotaxis
    var phylPoints = [];
    var pCount = 80;
    for (var p = 0; p < pCount; p++) {
        var pTheta = p * 137.5 * Math.PI / 180;
        var pr = 9 * Math.sqrt(p) / Math.sqrt(pCount);
        var px = 10 + pr * Math.cos(pTheta);
        var py = 10 + pr * Math.sin(pTheta);
        phylPoints.push(px.toFixed(3) + ',' + py.toFixed(3));
    }
    PHYLLOTAXIS_D = 'M ' + phylPoints.join(' L ');

    // 5. Superformula
    var sf_m = prng.rin(3, 10);
    var sf_n1 = prng.rfl(0.5, 5);
    var sf_n2 = prng.rfl(0.5, 5);
    var sf_n3 = prng.rfl(0.5, 5);
    var sfsteps = 240;
    var sfPoints = [];
    var maxR = 0;
    var tempR = [];
    for (var sfi = 0; sfi <= sfsteps; sfi++) {
        var sf_th = (sfi / sfsteps) * 2 * Math.PI;
        var t1 = Math.abs(Math.cos(sf_m * sf_th / 4.0));
        var t2 = Math.abs(Math.sin(sf_m * sf_th / 4.0));
        var rad = Math.pow(Math.pow(t1, sf_n2) + Math.pow(t2, sf_n3), -1.0 / sf_n1);
        if (rad > maxR) maxR = rad;
        tempR.push(rad);
    }
    if (maxR === 0) maxR = 1;
    for (var sfi = 0; sfi <= sfsteps; sfi++) {
        var sf_th = (sfi / sfsteps) * 2 * Math.PI;
        var rad = (tempR[sfi] / maxR) * 9;
        var sfx = 10 + rad * Math.cos(sf_th);
        var sfy = 10 + rad * Math.sin(sf_th);
        sfPoints.push(sfx.toFixed(3) + ',' + sfy.toFixed(3));
    }
    SUPERFORMULA_D = 'M ' + sfPoints.join(' L ') + ' Z';

    // 6. Harmonograph
    var h_f1 = prng.rin(1, 4);
    var h_f2 = prng.rin(1, 4);
    var h_d1 = prng.rfl(0.01, 0.05);
    var h_d2 = prng.rfl(0.01, 0.05);
    var h_p1 = prng.rfl(0, Math.PI);
    var h_p2 = prng.rfl(0, Math.PI);
    var hsteps = 300;
    var hPoints = [];
    var maxH = 0;
    var tempH = [];
    for (var hi = 0; hi <= hsteps; hi++) {
        var ht = (hi / hsteps) * 50;
        var hx = Math.sin(h_f1 * ht + h_p1) * Math.exp(-h_d1 * ht);
        var hy = Math.sin(h_f2 * ht + h_p2) * Math.exp(-h_d2 * ht);
        var h_dist = Math.sqrt(hx * hx + hy * hy);
        if (h_dist > maxH) maxH = h_dist;
        tempH.push({ x: hx, y: hy });
    }
    if (maxH === 0) maxH = 1;
    for (var hi = 0; hi <= hsteps; hi++) {
        var hx = 10 + (tempH[hi].x / maxH) * 9;
        var hy = 10 + (tempH[hi].y / maxH) * 9;
        hPoints.push(hx.toFixed(3) + ',' + hy.toFixed(3));
    }
    HARMONOGRAPH_D = 'M ' + hPoints.join(' L ');
}

function whichMotifD() {
    if (currentMotif === 'ichthus') return ICHTHUS_D;
    if (currentMotif === 'quatrefoil') return QUATREFOIL_D;
    if (currentMotif === 'tatreez') return TATREEZ_D;
    if (currentMotif === 'viana_heart') return VIANA_HEART_D;
    if (currentMotif === 'lissajous') return LISSAJOUS_D;
    if (currentMotif === 'rose') return ROSE_D;
    if (currentMotif === 'spirograph') return SPIROGRAPH_D;
    if (currentMotif === 'phyllotaxis') return PHYLLOTAXIS_D;
    if (currentMotif === 'superformula') return SUPERFORMULA_D;
    if (currentMotif === 'harmonograph') return HARMONOGRAPH_D;
    return FLOWER_D;
}

var flowerCmds = [];



// ── Engine list — matches live site ENGINE_OPTS (minus 'random') ─────────────────
// All 61 engines — those without a dedicated case use chevron/lattice/diagonal combos
var ENGINE_LIST = [
    'adama', 'adire', 'argyle', 'arraiolos', 'art_deco', 'asanoha', 'axonometric', 'azulejo', 'blueprint', 'bogolan',
    'bricolage', 'brutalist', 'castelo_branco', 'cherokee', 'chiefs', 'chipaz', 'circuit', 'collage', 'cubist',
    'current', 'cypress_hills', 'dazzler', 'flow', 'framed_vista', 'fret_bands', 'glitch', 'interlace', 'kagome',
    'kanzemizu', 'kente', 'kepe', 'kikkou', 'kishtima', 'kolya', 'kshtir', 'kuba', 'kudo', 'malevich',
    'mastor', 'matsukawa', 'mondrian', 'narmuny', 'navajo', 'optical_box', 'orak', 'pakshats', 'panoramic_dunes',
    'panks', 'pre_columbian', 'pulay', 'flowing_contours', 'flowing_streams', 'seigaiha', 'serape_net', 'sermat', 'sermat-kudo', 'shippo', 'shiprock',
    'sierra_sunset', 'spider_cross', 'stolz', 'structural', 'tangents', 'tol', 'ved', 'verena', 'viana', 'virma',
    'wari', 'woodcut', 'yagasuri', 'yoshiwara'
];



var currentEngine = '';
var currentSeed = 0;
var flowers = [];          // [{x, y, wt (0-1), flip}]
var whiteOnly = false;     // W key — full bright white, no greyscale

// ── Zoom / Pan state (matches live site: 1x–8x, drag pans, dblclick resets) ──
var viewZoom = 1.0;
var viewPanX = 0;
var viewPanY = 0;
var _dragging = false;
var _dragStartX, _dragStartY, _dragStartPanX, _dragStartPanY;


// ────────────────────────────────────────────────────────────────
function setup() {
    // Match live site: svgW = (w+8)*size, svgH = (h+8)*size
    var svgW = (W + 8) * SIZE;   // 1376
    var svgH = (H + 8) * SIZE;   // 2496
    var scaleToFit = min((windowWidth - MARGIN * 2) / svgW,
        (windowHeight - MARGIN * 2 - 20) / svgH,
        1.0);
    createCanvas(round(svgW * scaleToFit + MARGIN * 2),
        round(svgH * scaleToFit + MARGIN * 2 + 20));
    globalScale = scaleToFit;
    flowerScale = (rSIZE / 20.0) * globalScale;  // rSize/20 = 0.7 for 20-unit path
    PANEL_W = round(svgW * globalScale);
    PANEL_H = round(svgH * globalScale);

    flowerCmds = parseSVGCmds(whichMotifD());

    reroll();
}

function setAspectRatio(mode) {
    currentLayout = mode;
    if (mode === 'panel') { W = 78; H = 148; }
    else if (mode === 'banner') { W = 148; H = 83; }
    else if (mode === 'square') { W = 108; H = 108; }
    setup(); 
    reroll();
    redraw();
}

function windowResized() {
    setup();
    redraw();
}

// ────────────────────────────────────────────────────────────────
function draw() {
    background(21, 18, 16);

    var ctx = drawingContext;
    ctx.save();
    // Apply zoom towards canvas centre, then pan
    var cx = width / 2, cy = height / 2;
    ctx.translate(cx + viewPanX, cy + viewPanY);
    ctx.scale(viewZoom, viewZoom);
    ctx.translate(-cx, -cy);

    // Panel background
    fill(12, 10, 18); noStroke();
    rect(MARGIN, MARGIN, PANEL_W, PANEL_H);
    drawFlowers();

    ctx.restore();

    // Label — always in screen space, outside zoom transform
    fill(255, 180); noStroke(); textSize(10); textAlign(CENTER);
    var zoomHint = viewZoom > 1.01 ? '  [×' + viewZoom.toFixed(1) + ']' : '';
    var modeLabel = (whiteOnly ? '[WHITE]  ' : '') + currentMotif + '  ·  ' + currentEngine + '  ·  #' + currentSeed + zoomHint;
    text(modeLabel, MARGIN + PANEL_W / 2, MARGIN + PANEL_H + 14);

    noLoop();
}

function keyPressed() {
    if (key === ' ') { reroll(); redraw(); }
    if (key === 's' || key === 'S') exportSVG();
    if (key === 'm' || key === 'M') {
        var opts = ['ichthus', 'larkspur', 'quatrefoil', 'tatreez', 'viana_heart', 'lissajous', 'rose', 'spirograph', 'phyllotaxis', 'superformula', 'harmonograph'];
        currentMotif = opts[(opts.indexOf(currentMotif) + 1) % opts.length];
        flowerCmds = parseSVGCmds(whichMotifD());
        redraw();
    }
    if (key === 'a' || key === 'A') {
        var layouts = ['panel', 'banner', 'square'];
        var next = layouts[(layouts.indexOf(currentLayout) + 1) % 3];
        setAspectRatio(next);
    }
    if (key === 'w' || key === 'W') { whiteOnly = !whiteOnly; redraw(); }
    if (key === 'r' || key === 'R') { viewZoom = 1; viewPanX = 0; viewPanY = 0; redraw(); } // reset zoom
}

function mousePressed() {
    // Start drag for pan
    _dragging = true;
    _dragStartX = mouseX; _dragStartY = mouseY;
    _dragStartPanX = viewPanX; _dragStartPanY = viewPanY;
}
function mouseDragged() {
    viewPanX = _dragStartPanX + (mouseX - _dragStartX);
    viewPanY = _dragStartPanY + (mouseY - _dragStartY);
    redraw();
    return false; // prevent default
}
function mouseReleased() {
    // Only reroll if not a real drag (moved < 5px) and zoom is at 1x
    var moved = dist(mouseX, mouseY, _dragStartX, _dragStartY);
    if (moved < 5 && viewZoom < 1.05) { reroll(); redraw(); }
    _dragging = false;
}
function doubleClicked() {
    viewZoom = 1; viewPanX = 0; viewPanY = 0; redraw();
}
function mouseWheel(e) {
    var delta = e.delta > 0 ? -0.15 : 0.15;
    var oldZoom = viewZoom;
    viewZoom = Math.min(Math.max(viewZoom + delta, 1.0), 8.0);
    // Zoom towards cursor (match live site behaviour)
    var zoomRatio = viewZoom / oldZoom;
    viewPanX = mouseX - zoomRatio * (mouseX - viewPanX);
    viewPanY = mouseY - zoomRatio * (mouseY - viewPanY);
    redraw();
    return false; // prevent page scroll
}

// ────────────────────────────────────────────────────────────────
// REROLL — mirrors the worker pipeline exactly
// ────────────────────────────────────────────────────────────────
function reroll() {
    currentEngine = ENGINE_LIST[floor(random(ENGINE_LIST.length))];
    currentSeed = floor(random(999999));
    updateMathMotifs(currentSeed);
    flowers = computeGrid(currentEngine, currentSeed);
    flowerCmds = parseSVGCmds(whichMotifD());
}

function computeGrid(eng, seed) {
    var prng = makePRNG(seed);
    var params = generatePatternParams(eng, prng, W, H);

    // Pass 1: raw weights for every grid cell
    var rawWt = new Array(W * H);
    var wMax = -Infinity;
    for (var cy = 0; cy < H; cy++) {
        for (var cx = 0; cx < W; cx++) {
            var baseWt = calcMotifWeight(cx, cy, W, H, eng, params);
            var jitter = baseWt > 0 ? (((cx * 37 + cy * 13) % 100) / 400.0) : 0;
            var wt = baseWt + jitter;
            rawWt[cy * W + cx] = wt;
            if (wt > wMax) wMax = wt;
        }
    }

    // Pass 2: normalise and collect placed flowers
    var wRange = (wMax < 0.05) ? 1 : wMax;
    var out = [];
    for (var cy2 = 0; cy2 < H; cy2++) {
        for (var cx2 = 0; cx2 < W; cx2++) {
            var norm = rawWt[cy2 * W + cx2] / wRange;
            if (norm > 0.07) {
                out.push({
                    x: cx2, y: cy2,
                    wt: norm,
                    flip: shouldFlip(cx2, cy2, W, H),
                    rot: (function () {
                        if (eng === 'flowing_streams') {
                            var dxSum = 0, tWt = 0;
                            params.streams.forEach(function (s) {
                                var yOff = 0, slope = 0;
                                s.frequencies.forEach(function (f) {
                                    var arg = cx2 * f.freq + f.phase;
                                    yOff += Math.sin(arg) * f.amp;
                                    slope += Math.cos(arg) * f.amp * f.freq;
                                });
                                var dist = mabs(cy2 - (s.baseY + yOff));
                                if (dist < s.width) { var inf = 1.0 - dist / s.width; dxSum += slope * inf; tWt += inf; }
                            });
                            if (tWt > 0) return Math.atan2(dxSum / tWt, 1) * (180 / Math.PI);
                        } else if (eng === 'flowing_contours') {
                            var dzdx_c = 0, dzdy_c = 0;
                            params.waves.forEach(function (w2) {
                                var arg = cx2 * w2.fx + cy2 * w2.fy + w2.ph;
                                var deriv = Math.cos(arg) * w2.amp;
                                dzdx_c += deriv * w2.fx; dzdy_c += deriv * w2.fy;
                            });
                            // Tangent vector is (-dz/dy, dz/dx)
                            return Math.atan2(dzdx_c, -dzdy_c) * (180 / Math.PI);
                        }
                        return (currentMotif === 'ichthus' && ((cx2 * 17 + cy2 * 7) % 100 < 40)) ? 90 : 0;
                    })()
                });
            }
        }
    }
    return out;
}

function shouldFlip(fx, fy, w, h) {
    var scatter = ((fx * 7919 + fy * 6271) % 100);
    return scatter < 50;   // simple 50/50 for playground
}

// ────────────────────────────────────────────────────────────────
// DRAWING
// ────────────────────────────────────────────────────────────────
function drawFlowers() {
    var ctx = drawingContext;
    ctx.save();
    ctx.beginPath();
    ctx.rect(MARGIN, MARGIN, PANEL_W, PANEL_H);
    ctx.clip();

    for (var i = 0; i < flowers.length; i++) {
        var f = flowers[i];
        // Match live site: px = (f.x + 4) * SIZE + 1, then × globalScale
        var px = MARGIN + ((f.x + 4) * SIZE + 1) * globalScale;
        var py = MARGIN + ((f.y + 4) * SIZE + 1) * globalScale;
        // Alpha: full white when whiteOnly, otherwise weight 0.07→1 maps to 0.15→0.9
        var alpha = whiteOnly ? 1.0 : constrain(map(f.wt, 0.07, 1, 0.15, 0.9), 0.15, 0.9);


        ctx.save();
        ctx.translate(px, py);
        ctx.scale(flowerScale, flowerScale);
        if (f.flip) { ctx.translate(10, 10); ctx.rotate(Math.PI); ctx.translate(-10, -10); }
        if (f.rot) { ctx.translate(10, 10); ctx.rotate(f.rot * Math.PI / 180); ctx.translate(-10, -10); }

        ctx.beginPath();
        for (var c = 0; c < flowerCmds.length; c++) {
            var cmd = flowerCmds[c];
            if (cmd.type === 'M') ctx.moveTo(cmd.pts[0], cmd.pts[1]);
            else if (cmd.type === 'L') ctx.lineTo(cmd.pts[0], cmd.pts[1]);
            else if (cmd.type === 'C') ctx.bezierCurveTo(cmd.pts[0], cmd.pts[1], cmd.pts[2], cmd.pts[3], cmd.pts[4], cmd.pts[5]);
            else if (cmd.type === 'Z') ctx.closePath();
        }
        ctx.closePath();
        var isLineMotif = (currentMotif === 'phyllotaxis' || currentMotif === 'harmonograph');
        if (isLineMotif || currentMotif === 'ichthus') {
            ctx.strokeStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }
        if (!isLineMotif) {
            ctx.fillStyle = 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
            ctx.fill(currentMotif === 'quatrefoil' ? 'evenodd' : 'nonzero');
        }

        ctx.restore();
    }
    ctx.restore();
}

// ────────────────────────────────────────────────────────────────
// SVG PATH PARSER — handles absolute M/C/Z and relative m/c/z
// Arc 'a' commands (used for quatrefoil centre hole) are drawn
// as a moveTo so evenodd fill punches the hole correctly.
// ────────────────────────────────────────────────────────────────
function parseSVGCmds(d) {
    var cmds = [];
    var parts = d.match(/[MmCcLlZzAa]|[-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?/g);
    var cx = 0, cy = 0; // current point
    var arcDone = false; // emit circle bezier only once per subpath
    var i = 0;
    while (i < parts.length) {
        var t = parts[i++];
        if (t === 'M') {
            cx = parseFloat(parts[i++]); cy = parseFloat(parts[i++]);
            cmds.push({ type: 'M', pts: [cx, cy] });
            arcDone = false; // reset for new subpath
        } else if (t === 'm') {
            cx += parseFloat(parts[i++]); cy += parseFloat(parts[i++]);
            cmds.push({ type: 'M', pts: [cx, cy] });
            arcDone = false;
        } else if (t === 'L') {
            cx = parseFloat(parts[i++]); cy = parseFloat(parts[i++]);
            cmds.push({ type: 'L', pts: [cx, cy] });
        } else if (t === 'l') {
            cx += parseFloat(parts[i++]); cy += parseFloat(parts[i++]);
            cmds.push({ type: 'L', pts: [cx, cy] });
        } else if (t === 'C') {
            var x1 = parseFloat(parts[i++]), y1 = parseFloat(parts[i++]);
            var x2 = parseFloat(parts[i++]), y2 = parseFloat(parts[i++]);
            var xe = parseFloat(parts[i++]), ye = parseFloat(parts[i++]);
            cmds.push({ type: 'C', pts: [x1, y1, x2, y2, xe, ye] });
            cx = xe; cy = ye;
        } else if (t === 'c') {
            // relative cubic — convert to absolute
            var rx1 = parseFloat(parts[i++]), ry1 = parseFloat(parts[i++]);
            var rx2 = parseFloat(parts[i++]), ry2 = parseFloat(parts[i++]);
            var rxe = parseFloat(parts[i++]), rye = parseFloat(parts[i++]);
            cmds.push({ type: 'C', pts: [cx + rx1, cy + ry1, cx + rx2, cy + ry2, cx + rxe, cy + rye] });
            cx += rxe; cy += rye;
        } else if (t === 'Z' || t === 'z') {
            cmds.push({ type: 'Z', pts: [] });
        } else if (t === 'a' || t === 'A') {
            // Circular arc — compute center, emit full bezier-circle subpath
            // so evenodd fill punches the hole. Only emit once per circle
            // (the quatrefoil uses two semicircle arcs to make one full circle).
            var arx = parseFloat(parts[i++]), ary = parseFloat(parts[i++]);
            parseFloat(parts[i++]); // x-rotation (ignore)
            var lArc = parseFloat(parts[i++]), sweep = parseFloat(parts[i++]);
            var adx = parseFloat(parts[i++]), ady = parseFloat(parts[i++]);
            var ex = (t === 'A') ? adx : cx + adx;
            var ey = (t === 'A') ? ady : cy + ady;

            if (arx === ary && arx > 0 && !arcDone) {
                // Compute circle center from SVG arc formula
                var r = arx;
                var halfCx = (cx + ex) / 2, halfCy = (cy + ey) / 2;
                var dx2 = (cx - ex) / 2, dy2 = (cy - ey) / 2;
                var hLen = Math.sqrt(Math.max(0, r * r - (dx2 * dx2 + dy2 * dy2)));
                var normLen = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                var ux = (normLen > 0) ? -dy2 / normLen : 0;
                var uy = (normLen > 0) ? dx2 / normLen : 0;
                var sign2 = ((lArc === 1) !== (sweep === 1)) ? 1 : -1;
                var ccx = halfCx + sign2 * hLen * ux;
                var ccy = halfCy + sign2 * hLen * uy;
                // Bezier circle approximation (k = 0.5523)
                var k = r * 0.5523;
                cmds.push({ type: 'M', pts: [ccx, ccy - r] });
                cmds.push({ type: 'C', pts: [ccx + k, ccy - r, ccx + r, ccy - k, ccx + r, ccy] });
                cmds.push({ type: 'C', pts: [ccx + r, ccy + k, ccx + k, ccy + r, ccx, ccy + r] });
                cmds.push({ type: 'C', pts: [ccx - k, ccy + r, ccx - r, ccy + k, ccx - r, ccy] });
                cmds.push({ type: 'C', pts: [ccx - r, ccy - k, ccx - k, ccy - r, ccx, ccy - r] });
                cmds.push({ type: 'Z', pts: [] });
                arcDone = true; // skip the second semicircle arc
            }
            cx = ex; cy = ey;
        }
    }
    return cmds;
}

// ────────────────────────────────────────────────────────────────
// AXIDRAW SVG EXPORT — 3 Inkscape layers by density
// Heavy (wt > 0.7) · Medium (0.35–0.7) · Light (< 0.35)
// Assign different pen colors per layer in Inkscape before plotting
// ────────────────────────────────────────────────────────────────
function exportSVG() {
    var sw = W * SIZE, sh = H * SIZE;
    var sc = rSIZE / 20.0;

    // Define layers: [id, label, wt min, wt max]
    var LAYERS = [
        { id: 'layer-heavy', label: 'Heavy (Pen 1)', min: 0.70, max: 1.00 },
        { id: 'layer-medium', label: 'Medium (Pen 2)', min: 0.35, max: 0.70 },
        { id: 'layer-light', label: 'Light (Pen 3)', min: 0.07, max: 0.35 }
    ];

    var svg = '<?xml version="1.0" encoding="UTF-8"?>\n';
    svg += '<svg xmlns="http://www.w3.org/2000/svg"';
    svg += ' xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"';
    svg += ' width="' + sw + '" height="' + sh + '"';
    svg += ' viewBox="0 0 ' + sw + ' ' + sh + '">\n';
    svg += '  <rect width="' + sw + '" height="' + sh + '" fill="black"/>\n';

    for (var li = 0; li < LAYERS.length; li++) {
        var lyr = LAYERS[li];
        svg += '  <g id="' + lyr.id + '"';
        svg += ' inkscape:label="' + lyr.label + '"';
        svg += ' inkscape:groupmode="layer">\n';

        for (var i = 0; i < flowers.length; i++) {
            var f = flowers[i];
            if (f.wt < lyr.min || f.wt >= lyr.max) continue;
            var px = (f.x + 4) * SIZE + 1;
            var py = (f.y + 4) * SIZE + 1;
            var xform = 'translate(' + px + ',' + py + ') scale(' + sc + ')';
            if (f.flip) xform += ' rotate(180,10,10)';
            var isLine = (currentMotif === 'phyllotaxis' || currentMotif === 'harmonograph');
            if (isLine) {
                svg += '    <path d="' + whichMotifD() + '" fill="none" stroke="white" stroke-width="1.2"';
            } else {
                svg += '    <path d="' + whichMotifD() + '" fill="white" stroke="none"';
            }
            svg += ' transform="' + xform + '"/>\n';
        }
        svg += '  </g>\n';
    }

    svg += '</svg>';
    var blob = new Blob([svg], { type: 'image/svg+xml' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'larkspur-' + currentEngine + '-' + currentSeed + '.svg';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}


// ── PRNG — Park-Miller (matches larkspur-core.js exactly) ──────
function makePRNG(s) {
    var P = 2147483647;
    s = ((s + 1590398727) % P);
    if (s <= 0) s += P - 1;
    var t = s;
    function nxt() { t = (t * 16807) % P; return t; }
    nxt();
    return {
        rfl: function (a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return (nxt() - 1) / (P - 1) * (b - a) + a; },
        rin: function (a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return ((nxt() - 1) % (b - a + 1)) + a; }
    };
}

function safeMod(a, b) { return ((a % b) + b) % b; }
function mfloor(n) { return Math.floor(n); }
function mabs(n) { return Math.abs(n); }
function msqrt(n) { return Math.sqrt(n); }
function mmin(a, b) { return Math.min(a, b); }
function mmax(a, b) { return Math.max(a, b); }

// ── MOTIF PRIMITIVES ────────────────────────────────────────────
function motifDiagonal(x, y, p, t) { var ph = safeMod(x + y, p); return ph < t ? 1 - (ph / t) * 0.4 : 0; }
function motifAntiDiag(x, y, p, t) { var ph = safeMod(x - y, p); return ph < t ? 1 - (ph / t) * 0.4 : 0; }
function motifChevron(x, y, w, p, a) { var f = mabs(x - w / 2), ph = safeMod(f + y, p); return ph < a ? (ph < a * 0.3 ? 1 : ph < a * 0.7 ? 0.7 : 0.4) : 0; }
function motifDiamond(x, y, cx, cy, r, rw) {
    var d = mabs(x - cx) + mabs(y - cy);
    if (rw > 0) { var ph = safeMod(d, r); return ph < rw ? 1 - (ph / rw) * 0.5 : 0; }
    return d < r ? (d < r * 0.4 ? 1 : d < r * 0.7 ? 0.7 : 0.4) : 0;
}
function motifStepped(x, y, s, t, ax) {
    var off = safeMod(mfloor(y / s), 2) * mfloor(s / 2);
    if (ax === 1) off = safeMod(mfloor(x / s), 2) * mfloor(s / 2);
    var c = ax === 0 ? x : y, ph = safeMod(c + off, s);
    return ph < t ? (ph < t * 0.4 ? 1 : 0.4) : 0;
}
function motifScroll(x, y, w, a, f) { var wv = w / 2 + a * Math.sin(y * f * Math.PI / 40); return mabs(x - wv) < a * 0.4 ? 1 : 0; }
function motifLattice(x, y, p, t) { var d1 = safeMod(x + y, p) < t, d2 = safeMod(x - y, p) < t; return d1 && d2 ? 1 : (d1 || d2 ? 0.6 : 0); }
function motifSteppedDiamond(x, y, cx, cy, r, ss) {
    var sdx = mfloor(mabs(x - cx) / ss) * ss, sdy = mfloor(mabs(y - cy) / ss) * ss;
    return (sdx + sdy < r) ? (sdx + sdy < r * 0.5 ? 1 : 0.6) : 0;
}
function motifSerratedBand(x, y, cy, a, p) {
    var zy = cy + a * ((safeMod(x, p) < p / 2) ? safeMod(x, p) * 2 / p : (2 - safeMod(x, p) * 2 / p)) - a / 2;
    return mabs(y - zy) < 2 ? 1 : 0;
}
function motifKagome(x, y, p, t, dr, dw) {
    var wt = motifDiagonal(x, y, p, t) + motifAntiDiag(x, y, p, t);
    if (safeMod(y, p) < t) wt += 0.8;
    var cx = mfloor(x / p) * p + p / 2, cy = mfloor(y / p) * p + p / 2;
    var dx = x - cx, dy = y - cy, d = msqrt(dx * dx + dy * dy);
    if (mabs(d - dr) < 1.5 && dw) wt += dw;
    return mmin(wt, 1.5);
}
function motifAsanoha(x, y, p, t) {
    var hp = p / 2, cx = mfloor(x / p) * p + hp, cy = mfloor(y / p) * p + hp;
    var lx = x - cx, ly = y - cy, wt = 0;
    if (safeMod(x + y, p) < t || safeMod(x - y, p) < t) wt += 0.8;
    if (mabs(lx) < t / 2 || mabs(ly) < t / 2) wt += 0.6;
    var d = mabs(lx) + mabs(ly); if (mabs(d - hp * 0.6) < t) wt += 0.5;
    return mmin(wt, 1.5);
}
function motifSeigaiha(x, y, p, a, rs, ss, t) {
    var wt = 0, row = mfloor(y / rs);
    var ox = (safeMod(row, 2) === 0) ? 0 : p / 2;
    var cx = mfloor((x + ox) / p) * p - ox + p / 2, cy = row * rs;
    for (var r = 0; r < 3; r++) { var rr = a - r * ss; if (rr <= 0) break; var dx = x - cx, dy = y - cy, d = msqrt(dx * dx + dy * dy); if (mabs(d - rr) < t && dy <= 0) wt += 0.8 - r * 0.2; }
    return mmin(wt, 1.5);
}
function motifShippo(x, y, r, t) {
    var wt = 0, d = r * 2, cx = mfloor(x / d) * d, cy = mfloor(y / d) * d;
    for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) { var dx = x - (cx + i * d), dy = y - (cy + j * d); if (mabs(msqrt(dx * dx + dy * dy) - r) < t) wt += 0.7; }
    return mmin(wt, 1.5);
}
function motifKikkou(x, y, r, t, io) {
    var h = r * msqrt(3), col = mfloor(x / (r * 1.5)), row = mfloor(y / h);
    var cx = col * r * 1.5 + r, cy = row * h + (safeMod(col, 2) === 0 ? 0 : h / 2) + h / 2;
    var dx = mabs(x - cx), dy = mabs(y - cy);
    var d = mmax(dx * 2 / 3 + dy * msqrt(3) / 3, dy * 2 * msqrt(3) / 3);
    var wt = 0; if (mabs(d - r) < t) wt += 1; if (io > 0 && mabs(d - r * io / r) < t * 0.7) wt += 0.5;
    return mmin(wt, 1.5);
}
function motifPixelSmear(x, y, cx, cy, len, ang, th) {
    var dx = x - cx, dy = y - cy;
    var nx = dx * Math.cos(-ang) - dy * Math.sin(-ang), ny = dx * Math.sin(-ang) + dy * Math.cos(-ang);
    if (mabs(ny) < 1 && nx > 0 && nx < len) { var n = safeMod((mfloor(cx * 13 + cy * 7)) * 157, 100) / 100; if (n > th) return 0.4 + 0.6 * (1 - nx / len); }
    return 0;
}
function motifBitBlock(x, y, cx, cy, sz, wt) {
    if (mabs(x - cx) < sz && mabs(y - cy) < sz) { var qx = mfloor(x / 4) * 4, qy = mfloor(y / 4) * 4; if (safeMod(qx * 19 + qy * 23, 10) < 4) return wt; }
    return 0;
}
function motifCellularBlocks(x, y, cells, cs) {
    if (!cells || !cells.length) return 0;
    var qx = mfloor(x / cs) * cs, qy = mfloor(y / cs) * cs, md = Infinity, cw = 0;
    for (var i = 0; i < cells.length; i++) { var c = cells[i], dx = qx - c.cx, dy = qy - c.cy; var d = dx * dx + dy * dy + safeMod(mfloor(qx * 13 + qy * 23), 100) / 100 * (cs * cs * 2); if (d < md) { md = d; cw = c.wt; } }
    return cw;
}
function motifCross(x, y, cx, cy, armW, armL) {
    var dx = mabs(x - cx), dy = mabs(y - cy);
    return (dx < armW && dy < armL) || (dy < armW && dx < armL) ? 1 : 0;
}
function motifSerratedDiamond(x, y, cx, cy, r, ss) {
    var dx = mfloor(mabs(x - cx) / ss) * ss, dy2 = mfloor(mabs(y - cy) / ss) * ss;
    var d = dx + dy2;
    return (d >= r - ss && d <= r) ? 1 : 0;
}

// ── CALC MOTIF WEIGHT (matches larkspur-engines.js) ─────────────
function calcMotifWeight(x, y, w, h, eng, P) {
    x = safeMod(x, w); y = safeMod(y, h); var wt = 0;
    switch (eng) {
        // ▸ Japanese
        case 'kagome':
            wt += motifKagome(x, y, P.period, P.thickness, P.dotR, P.dotWt) * P.kagomeWt; break;
        case 'asanoha':
            wt += motifAsanoha(x, y, P.period, P.thickness) * P.starWt; break;
        case 'seigaiha':
            wt += motifSeigaiha(x, y, P.period, P.amp, P.rowSpacing, P.stripeSpacing, P.thickness) * P.waveWt; break;
        case 'shippo':
            wt += motifShippo(x, y, P.radius, P.thickness) * P.circleWt;
            if (P.hasStar) wt += motifLattice(x, y, P.radius, P.thickness) * P.starWt * 0.5; break;
        case 'kikkou':
            wt += motifKikkou(x, y, P.radius, P.thickness, P.innerOffset) * P.hexWt; break;

        // ▸ African
        case 'kente': {
            var si = mfloor(x / P.stripW), ay = y + si * (P.blockH / 3), sp = safeMod(x, P.stripW);
            if (sp < P.seamW || sp > P.stripW - P.seamW) { if (safeMod(sp, 2) === 0) wt += P.seamWt; }
            else {
                var bi = mfloor(ay / P.blockH), mt = safeMod(si + bi, 4);
                var lx = sp - P.stripW / 2, ly = mabs(safeMod(ay, P.blockH) - P.blockH / 2);
                if (mt === 0) wt += motifLattice(lx, ly, P.cP, P.cT) * P.cWt;
                else if (mt === 1) { if (safeMod(ly, P.wP) < P.wT) wt += P.wWt; }
                else if (mt === 2) wt += motifStepped(lx, ly, P.sP, P.sT, 0) * P.sWt;
                else { if (mabs(lx) < P.stripW * 0.4 && ly < P.blockH * 0.4) wt += P.bWt; }
            } break;
        }
        case 'bogolan': {
            var isVert = P.orientation === 1;
            var pc = isVert ? x : y, sc = isVert ? y : x;
            var si2 = mfloor(pc / P.stripW), sp2 = safeMod(pc, P.stripW);
            var mo = P.motifs[safeMod(si2, P.motifs.length)];
            if (sp2 < P.borderT || sp2 > P.stripW - P.borderT) wt += P.borderWt;
            else {
                if (mo.type === 0) wt += motifChevron(sc, sp2, P.stripW, mo.p1, mo.p2) * mo.wt;
                else if (mo.type === 1) { var dcx = safeMod(sc, mo.p1) - mo.p1 / 2, dcy = sp2 - P.stripW / 2; if (mabs(dcx) + mabs(dcy) < mo.p2) wt += mo.wt; }
                else if (mo.type === 2) { var ccx = safeMod(sc, mo.p1) - mo.p1 / 2, ccy = sp2 - P.stripW / 2; if (mabs(ccx) < mo.p2 || mabs(ccy) < mo.p2) wt += mo.wt; }
                else { if (safeMod(sc, mo.p1) < mo.p2) wt += mo.wt; }
            } break;
        }

        // ▸ Navajo
        case 'navajo': {
            var bandY = safeMod(y, P.bandH);
            var bIdx = safeMod(mfloor(y / P.bandH), P.bands.length);
            var band = P.bands[bIdx];
            if (band.type === 0 && mabs(bandY - P.bandH / 2) < band.diaR) {
                wt += motifSteppedDiamond(x, y, w / 2, y, band.diaR, band.stepSz) * band.wt;
                wt += motifSteppedDiamond(x, y, w * 0.15, y, band.diaR * 0.5, band.stepSz) * band.wt * 0.8;
                wt += motifSteppedDiamond(x, y, w * 0.85, y, band.diaR * 0.5, band.stepSz) * band.wt * 0.8;
            } else if (band.type === 1) {
                wt += motifSerratedBand(x, y, y, band.amp, band.period) * band.wt;
            } else {
                wt += motifChevron(x, y, w, band.period, band.amp) * band.wt;
            }
            if (bandY < P.stripeT) wt += P.stripeWt;
            break;
        }

        // ▸ Other
        case 'glitch': {
            if (P.cells && P.cells.length) wt += motifCellularBlocks(x, y, P.cells, P.cellSize);
            var ty = mfloor(y / P.tearH), to = safeMod(ty * 157, P.tearMax), gx = safeMod(x + to, w);
            for (var s0 = 0; s0 < P.smears.length; s0++) { var sm = P.smears[s0]; wt += motifPixelSmear(gx, y, sm.cx, sm.cy, sm.len, sm.angle, sm.thresh) * sm.wt; }
            for (var b0 = 0; b0 < P.blocks.length; b0++) { var bl0 = P.blocks[b0]; wt += motifBitBlock(gx, y, bl0.cx, bl0.cy, bl0.size, bl0.wt) * bl0.wt; }
            if (safeMod(mfloor(gx * 13 + y * 23), 100) < P.spikeFreq) wt += P.spikeWt;
            if (safeMod(y, P.scanP) < P.scanT) wt += P.scanWt; break;
        }
        case 'mondrian':
            for (var ri = 0; ri < P.rects.length; ri++) {
                var r = P.rects[ri];
                if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) {
                    var bxr = x - r.x, byr = y - r.y;
                    if (bxr < r.bw || bxr >= r.w - r.bw || byr < r.bw || byr >= r.h - r.bw) wt += r.borderWt; else wt += r.fillWt;
                }
            } break;
        case 'flow':
            for (var s3 = 0; s3 < P.scrolls.length; s3++) { var sc2 = P.scrolls[s3]; wt += motifScroll(x, y, w, sc2[0], sc2[1]) * sc2[2]; }
            for (var d3 = 0; d3 < P.diamonds.length; d3++) { var dd = P.diamonds[d3]; wt += motifDiamond(x, y, dd[0], dd[1], dd[2], dd[3]) * dd[4]; }
            if (safeMod(x + y, P.dP) < P.dT) wt += P.dWt; break;
        case 'azulejo':
            var tx = safeMod(x, P.tileSize), ty = safeMod(y, P.tileSize);
            var tcx = P.tileSize / 2, tcy = P.tileSize / 2;
            wt += motifDiamond(x, y, x - tx + tcx, y - ty + tcy, P.medR, P.medT) * P.medWt;
            var nearestCornerX = x - tx + (tx > tcx ? P.tileSize : 0);
            var nearestCornerY = y - ty + (ty > tcy ? P.tileSize : 0);
            var distCorner = Math.sqrt(Math.pow(x - nearestCornerX, 2) + Math.pow(y - nearestCornerY, 2));
            if (mabs(distCorner - P.cornerR) < P.cornerT) wt += P.cornerWt;
            if (distCorner < P.cornerInnerR) wt += P.cornerInnerWt;
            if (tx < P.grout || ty < P.grout) wt += P.groutWt; break;

        case 'arraiolos':
            wt += motifSteppedDiamond(x, y, w / 2, h / 2, P.centerR, P.stepSz) * P.centerWt;
            var bxA = mmin(x, w - 1 - x), byA = mmin(y, h - 1 - y);
            var borderDistA = mmin(bxA, byA);
            if (borderDistA > P.b1Start && borderDistA < P.b1End) wt += motifStepped(x, y, P.b1Step, P.b1T, 0) * P.b1Wt;
            if (borderDistA > P.b2Start && borderDistA < P.b2End) { if (safeMod(x + y, P.b2P) < P.b2T) wt += P.b2Wt; }
            if (borderDistA > P.b1End && borderDistA < w / 2 - P.centerR) wt += motifLattice(x, y, P.fieldP, P.fieldT) * P.fieldWt; break;

        case 'viana':
            var bandIdx = safeMod(mfloor(y / P.bandH), P.bands.length);
            var bV = P.bands[bandIdx];
            if (bV.type === 0) wt += motifChevron(x, y, w, bV.p1, bV.p2) * bV.wt;
            else if (bV.type === 1) { var rowCxV = safeMod(x, bV.p1) - bV.p1 / 2; if (mabs(rowCxV) + mabs(safeMod(y, P.bandH) - P.bandH / 2) < bV.p2) wt += bV.wt; }
            else if (bV.type === 2) { if (mabs(safeMod(y, P.bandH) - P.bandH / 2) < bV.p1) wt += bV.wt; }
            else wt += motifLattice(x, y, bV.p1, bV.p2) * bV.wt;
            if (safeMod(y, P.bandH) < P.sepT) wt += P.sepWt; break;

        case 'castelo_branco':
            for (var cs1 = 0; cs1 < P.scrolls.length; cs1++) { var scC = P.scrolls[cs1]; wt += motifScroll(x, y, w, scC.amp, scC.period) * scC.wt; }
            for (var cf1 = 0; cf1 < P.flowers.length; cf1++) { var flC = P.flowers[cf1]; wt += motifRosette(x, y, flC.cx, flC.cy, flC.r, flC.petals, flC.sharp) * flC.wt; }
            var trunkX = w / 2 + Math.sin(y / P.trunkP) * P.trunkAmp;
            if (mabs(x - trunkX) < P.trunkT) wt += P.trunkWt; break;

        case 'stolz':
            for (var b3 = 0; b3 < P.blocks.length; b3++) {
                var bl = P.blocks[b3];
                if (x >= bl.x && x < bl.x + bl.w && y >= bl.y && y < bl.y + bl.h) {
                    if (bl.type === 0) wt += bl.wtMain;
                    else if (bl.type === 1) wt += (safeMod(y, bl.sd) < bl.sd / 2) ? bl.wtMain : bl.wtSub;
                    else if (bl.type === 2) wt += (safeMod(x, bl.sd) < bl.sd / 2) ? bl.wtMain : bl.wtSub;
                    else { var lx2 = x - bl.x, ly2 = y - bl.y; wt += (lx2 / bl.w + ly2 / bl.h < 1) ? bl.wtMain : bl.wtSub; }
                }
            } break;

        // ▸ Mordvinian (new engines)
        case 'tol':
            for (var c0 = 0; c0 < P.layers.length; c0++) { var ly = P.layers[c0]; wt += motifChevron(x, y, w, ly[0], ly[1]) * ly[2]; } break;
        case 'mastor':
            for (var d0 = 0; d0 < P.diamonds.length; d0++) { var dm = P.diamonds[d0]; wt += motifDiamond(x, y, dm[0], dm[1], dm[2], dm[3]) * dm[4]; }
            wt += motifDiagonal(x, y, P.diagP, P.diagT) * P.diagWt;
            wt += motifAntiDiag(x, y, P.adiagP, P.adiagT) * P.adiagWt; break;
        case 'virma': {
            var bxv = mmin(x, w - 1 - x), byv = mmin(y, h - 1 - y), bd = mmin(bxv, byv);
            if (bd < P.borderW) { wt += motifStepped(x, y, P.step, P.stepT, 0) * P.stepWt; wt += motifStepped(x, y, P.step2, P.stepT2, 1) * P.stepWt2; }
            else if (bd < P.borderW + P.innerW) { wt += motifChevron(x, y, w, P.innerP, P.innerA) * P.innerWt; }
            else { wt += motifDiamond(x, y, w / 2, h / 2, P.centralR, P.centralRing) * P.centralWt; }
            break;
        }
        case 'ved':
            for (var sv = 0; sv < P.scrolls.length; sv++) { var sc3 = P.scrolls[sv]; wt += motifScroll(x, y, w, sc3[0], sc3[1]) * sc3[2]; }
            wt += motifStepped(x, y, P.bandStep, P.bandT, 0) * P.bandWt; break;
        case 'kepe': {
            var pkY = safeMod(y, P.peakH), pkX = safeMod(x, P.peakW);
            var slope = pkY < P.peakH / 2 ? pkX < pkY * P.peakW / P.peakH : pkX < (P.peakH - pkY) * P.peakW / P.peakH;
            if (slope) wt += P.peakWt;
            wt += motifStepped(x, y, P.fillStep, P.fillT, 0) * P.fillWt;
            wt += motifDiamond(x, y, w / 2, h / 2, P.crownR, P.crownRing) * P.crownWt; break;
        }
        case 'kolya': {
            var cSz = P.cornerSize;
            var bxk = mmin(x, w - 1 - x), byk = mmin(y, h - 1 - y);
            if (bxk < cSz && byk < cSz) { if (safeMod(mfloor(bxk / P.fillW) + mfloor(byk / P.fillW), 2) === 0) wt += P.cornerWt; }
            wt += motifChevron(x, y, w, P.chevP, P.chevA) * P.chevWt;
            if (bxk < P.edgeW || byk < P.edgeW) wt += P.edgeWt; break;
        }
        case 'sermat':
            for (var ci2 = 0; ci2 < P.centers.length; ci2++) {
                var ctr = P.centers[ci2];
                wt += motifCross(x, y, ctr[0], ctr[1], P.armW, P.armL) * P.weights[safeMod(ci2, P.weights.length)];
            }
            wt += motifDiamond(x, y, w / 2, h / 2, P.ringR, P.ringW) * P.ringWt; break;
        case 'chipaz':
            for (var ri2 = 0; ri2 < P.rays.length; ri2++) { var ray = P.rays[ri2]; wt += motifCross(x, y, ray[0], ray[1], ray[2], ray[3]) * ray[4]; }
            wt += motifDiamond(x, y, w / 2, h / 2, P.sunR, P.sunRing) * P.sunWt;
            wt += motifLattice(x, y, P.glowP, P.glowT) * P.glowWt; break;
        case 'dazzler':
            for (var dl = P.layers; dl > 0; dl--) {
                var layR = dl * P.layerSpacing;
                wt += motifSerratedDiamond(x, y, w / 2, h / 2, layR, P.stepSize) * P.dazzleWt * (0.5 + 0.5 * (dl / P.layers));
            } break;
        case 'verena': {
            // Bold diagonal parallelogram bands (Loewensberg style)
            for (var vi = 0; vi < P.bands.length; vi++) {
                var vb = P.bands[vi];
                var ca = Math.cos(-vb.angle), sa = Math.sin(-vb.angle);
                var vrx = (x - vb.cx) * ca - (y - vb.cy) * sa;
                var vry = (x - vb.cx) * sa + (y - vb.cy) * ca;
                if (mabs(vry) < vb.hw && mabs(vrx) < vb.hl) wt += vb.wt;
            } break;
        }

        case 'cypress_hills':
            // Sky background implicit 0
            if (msqrt(Math.pow(x - P.sunX, 2) + Math.pow(y - P.sunY, 2)) < P.sunR) wt += P.sunWt;
            for (var hi = 0; hi < P.hills.length; hi++) {
                var hll = P.hills[hi];
                var hY = hll.baseY + Math.sin(x / hll.period + hll.phase) * hll.amp;
                if (y > mfloor(hY / hll.step) * hll.step) wt += hll.wt;
            }
            for (var ti = 0; ti < P.trees.length; ti++) {
                var tr = P.trees[ti];
                if (x > tr.x - tr.w / 2 && x < tr.x + tr.w / 2 && y > tr.y - tr.h && y < tr.y) {
                    var tgW = mfloor(((tr.y - y) / tr.h * (tr.w / 2)) / 4) * 4;
                    if (mabs(x - tr.x) < tgW) wt += tr.wt;
                }
            } break;

        case 'sierra_sunset':
            var sbH = mfloor((h / 2) / P.skyBands);
            if (y < h / 2 && mfloor(y / sbH) % 2 === 0) wt += P.skyWt;
            for (var mi = 0; mi < P.mountains.length; mi++) {
                var mnt = P.mountains[mi];
                var phX = safeMod(x, mnt.period) / mnt.period;
                var chV = phX < 0.5 ? phX * 2 : (1 - phX) * 2;
                var mY = mfloor((mnt.baseY - chV * mnt.amp) / mnt.step) * mnt.step;
                if (y > mY) {
                    if (y < mY + mnt.thick) wt += mnt.wt * 1.5;
                    else if ((x + y) % 8 < 4) wt += mnt.wt;
                }
            } break;

        case 'panoramic_dunes':
            if (y < h / 2) {
                var swy = mfloor(h / 2 / P.windLines);
                if (safeMod(y, swy) < 2) wt += P.windWt;
            }
            for (var di = 0; di < P.dunes.length; di++) {
                var dn = P.dunes[di];
                var dY = dn.baseY + Math.sin(x / dn.period + dn.phase) * dn.amp + Math.cos(x / (dn.period * 0.5)) * (dn.amp * 0.3);
                if (y > dY && y < dY + dn.thick) wt += dn.wt;
                else if (y >= dY + dn.thick) wt += dn.wt * 0.2;
            } break;

        case 'framed_vista':
            var inVig = x > P.borderW && x < w - P.borderW && y > P.borderW && y < h - P.borderW;
            if (inVig) {
                var vx = x - P.borderW, vy = y - P.borderW, vw = w - 2 * P.borderW, vh = h - 2 * P.borderW;
                if (vx < P.innerBorderT || vx > vw - P.innerBorderT || vy < P.innerBorderT || vy > vh - P.innerBorderT) wt += P.innerBorderWt;
                else {
                    if (msqrt(Math.pow(vx - P.vigSunX, 2) + Math.pow(vy - P.vigSunY, 2)) < P.vigSunR) wt += P.vigSunWt;
                    for (var vi = 0; vi < P.vigHills.length; vi++) if (vy > P.vigHills[vi].baseY + Math.sin(vx / P.vigHills[vi].period) * P.vigHills[vi].amp) wt += P.vigHills[vi].wt;
                    for (var vt = 0; vt < P.vigTrees.length; vt++) {
                        var vtr = P.vigTrees[vt];
                        if (vx > vtr.x - vtr.w / 2 && vx < vtr.x + vtr.w / 2 && vy > vtr.y - vtr.h && vy < vtr.y && (vx - vtr.x + vtr.y - vy) % 6 < 3) wt += vtr.wt;
                    }
                }
            } else {
                wt += P.borderWt * 0.5;
                if (P.cornerType === 0 && (safeMod(x, 20) < 5 || safeMod(y, 20) < 5)) wt += P.cornerWt;
                else if (P.cornerType === 1 && mmin(x, w - x) < P.borderW && mmin(y, h - y) < P.borderW && msqrt(Math.pow(safeMod(x, P.borderW) - P.borderW / 2, 2) + Math.pow(safeMod(y, P.borderW) - P.borderW / 2, 2)) < P.borderW * 0.4) wt += P.cornerWt;
                else if (P.cornerType === 2 && mfloor(x / 15) % 2 === mfloor(y / 15) % 2) wt += P.cornerWt;
            } break;
        // ▸ Missing engine compositions (built from available primitives)
        // ---- band / diagonal group ----
        case 'adama': case 'cherokee': case 'narmuny': case 'pre_columbian':
        case 'shiprock': case 'structural': case 'woodcut':
            for (var ni = 0; ni < P.bands.length; ni++) { var nb = P.bands[ni]; wt += motifChevron(x, y, w, nb[0], nb[1]) * nb[2]; }
            wt += motifStepped(x, y, P.stepP, P.stepT, 0) * P.stepWt; break;
        // ---- lattice/grid group ----
        case 'argyle': case 'bricolage': case 'interlace': case 'kishtima': case 'matsukawa':
        case 'structural2': case 'wari': case 'yoshiwara': case 'kuba':
            wt += motifLattice(x, y, P.latP, P.latT) * P.latWt;
            wt += motifDiamond(x, y, w / 2, h / 2, P.ringR, P.ringT) * P.ringWt; break;
        // ---- rotational / radial group ----
        case 'art_deco': case 'axonometric': case 'blueprint': case 'circuit':
        case 'kshtir': case 'orak': case 'tangents':
            for (var ai = 0; ai < P.rings.length; ai++) { var ar = P.rings[ai]; wt += motifDiamond(x, y, w / 2, h / 2, ar[0], ar[1]) * ar[2]; }
            wt += motifDiagonal(x, y, P.diagP, P.diagT) * P.diagWt; break;
        // ---- stripe / band alternate ----
        case 'adire': case 'fret_bands': case 'kanzemizu': case 'optical_box':
        case 'pulay': case 'serape_net': case 'yagasuri':
            if (safeMod(mfloor(y / P.bandH), 2) === 0) {
                wt += motifDiagonal(x, y, P.diagP, P.diagT) * P.main;
            } else {
                wt += motifAntiDiag(x, y, P.diagP, P.diagT) * P.main;
            }
            if (safeMod(y, P.bandH) < P.stripeT) wt += P.stripeWt; break;
        // ---- panks / panelled ----
        case 'panks': case 'pakshats':
            wt += motifCross(x, y, w / 2, h / 2, P.armW, P.armL) * P.crossWt;
            wt += motifLattice(x, y, P.latP, P.latT) * P.latWt; break;
        // ---- collage / patchwork ----
        case 'collage': case 'cubist':
            var ptype = safeMod(mfloor(x / P.sz) * 7 + mfloor(y / P.sz) * 13, 4);
            if (ptype === 0) wt += motifDiagonal(x, y, P.diagP, P.diagT) * P.main;
            else if (ptype === 1) wt += motifChevron(x, y, w, P.diagP, P.diagT) * P.main;
            else if (ptype === 2) wt += motifLattice(x, y, P.latP, P.latT) * P.latWt;
            else if (safeMod(x, P.sz) < P.sz * 0.1 || safeMod(y, P.sz) < P.sz * 0.1) wt += P.main;
            break;
        // ---- glitch variants ----
        case 'brutalist': case 'malevich': case 'suprematism':
            for (var mi3 = 0; mi3 < P.rects.length; mi3++) {
                var rr = P.rects[mi3];
                if (x >= rr.x && x < rr.x + rr.w && y >= rr.y && y < rr.y + rr.h) wt += rr.wt;
            } break;
        // ---- current / flow variants ----
        case 'current': case 'spider_cross': case 'chiefs':
            wt += motifSerratedBand(x, y, h / 2, P.amp, P.period) * P.main;
            wt += motifDiamond(x, y, w / 2, h / 2, P.ringR, 0) * P.ringWt; break;
        // ---- kudo / brick ----
        case 'kudo':
            // brick-like: alternating offset rows
            var bRow = mfloor(y / P.bH), bOff = safeMod(bRow, 2) * mfloor(P.bW / 2);
            var bx2 = safeMod(x + bOff, P.bW);
            if (bx2 < P.mortar || safeMod(y, P.bH) < P.mortar) wt += P.bWt; break;
        // ---- sermat-kudo blended ----
        case 'sermat-kudo':
            for (var ci3 = 0; ci3 < P.centers.length; ci3++) { var ct = P.centers[ci3]; wt += motifCross(x, y, ct[0], ct[1], P.armW, P.armL) * P.weights[safeMod(ci3, P.weights.length)]; }
            wt += motifDiamond(x, y, w / 2, h / 2, P.ringR, P.ringW) * P.ringWt; break;
        case 'flowing_streams':
            P.streams.forEach(function (s) {
                var yOff = 0;
                s.frequencies.forEach(function (f) { yOff += Math.sin(x * f.freq + f.phase) * f.amp; });
                var dist = Math.abs(y - (s.baseY + yOff));
                if (dist < s.width) wt += s.wt * (1.0 - dist / s.width);
            }); break;
        case 'flowing_contours':
            var val = 0;
            P.waves.forEach(function (w2) { var arg = x * w2.fx + y * w2.fy + w2.ph; val += Math.sin(arg) * w2.amp; });
            var normVal = safeMod(val, P.interval);
            var dist2 = mabs(normVal - P.interval / 2);
            if (dist2 < P.thick) wt += P.wt * (1.0 - dist2 / P.thick);
            break;
    }
    return wt;
}

// ── GENERATE PATTERN PARAMS (matches larkspur-engines.js) ────────
function generatePatternParams(eng, prng, w, h) {
    var P = {}, rf = function (a, b) { return prng.rfl(a, b); }, ri = function (a, b) { return prng.rin(a, b); };
    switch (eng) {
        // ▸ Japanese
        case 'kagome':
            P.period = ri(30, 80); P.thickness = mfloor(P.period * rf(0.08, 0.18));
            P.dotR = mfloor(P.period * rf(0.1, 0.25)); P.dotWt = (rf() > 0.3) ? rf(3, 8) : 0;

            P.kagomeWt = rf(4, 9); break;
        case 'asanoha':
            P.period = mfloor(w * rf(0.12, 0.28)); P.thickness = ri(2, 4); P.starWt = rf(5, 10); break;
        case 'seigaiha':
            P.period = mfloor(w * rf(0.15, 0.4)); P.amp = P.period * rf(0.15, 0.35);
            P.rowSpacing = P.amp * rf(0.7, 1.4); P.thickness = ri(1, 3);
            P.stripeSpacing = P.thickness * ri(3, 7); P.waveWt = rf(3, 8); break;
        case 'shippo':
            P.radius = mfloor(w * rf(0.12, 0.25)); P.thickness = ri(2, 4); P.circleWt = rf(5, 10);
            P.hasStar = rf() > 0.5 ? 1 : 0; P.starWt = rf(3, 7); break;
        case 'kikkou':
            P.radius = mfloor(w * rf(0.08, 0.2)); P.thickness = ri(2, 4); P.hexWt = rf(6, 12);
            P.innerOffset = ri(0, 1) === 1 ? ri(6, 15) : 0; P.innerWt = P.innerOffset > 0 ? rf(4, 9) : 0; break;

        // ▸ African
        case 'kente':
            P.stripW = mfloor(w / ri(6, 15)); P.blockH = mfloor(P.stripW * rf(1.0, 2.5));
            P.seamW = ri(2, 6); P.seamWt = rf(5, 12);
            P.cP = ri(6, 14); P.cT = ri(3, 7); P.cWt = rf(4, 9);
            P.wP = ri(4, 10); P.wT = ri(1, 3); P.wWt = rf(3, 8);
            P.sP = ri(6, 14); P.sT = ri(2, 6); P.sWt = rf(4, 9); P.bWt = rf(2, 6); break;
        case 'bogolan':
            P.orientation = ri(0, 1); P.stripW = mfloor((P.orientation === 1 ? w : h) / ri(3, 9));
            P.motifs = []; for (var bi = 0; bi < ri(2, 5); bi++) P.motifs.push({ type: ri(0, 3), p1: ri(20, 60), p2: ri(4, 15), wt: rf(4, 9) });
            P.borderT = ri(2, 8); P.borderWt = rf(5, 12); break;

        // ▸ Navajo
        case 'navajo':
            P.bandH = mfloor(h / ri(3, 7)); var nbn = ri(3, 7);
            P.bands = [];
            for (var nbi = 0; nbi < nbn; nbi++) P.bands.push({ type: ri(0, 2), diaR: mfloor(P.bandH * rf(0.3, 0.45)), stepSz: ri(2, 6), amp: ri(4, 15), period: ri(20, 50), wt: rf(4, 9) });
            P.bands[mfloor(nbn / 2)].type = 0;
            P.stripeT = ri(2, 8); P.stripeWt = rf(3, 8); break;
        case 'dazzler':
            P.radius = mfloor(mmin(w, h) * rf(0.3, 0.5)); P.stepSize = ri(2, 8); P.dazzleWt = rf(6, 12);
            P.layers = ri(3, 7); P.layerSpacing = mfloor(P.radius / P.layers); break;

        // ▸ Other
        case 'glitch':
            P.tearH = ri(10, 50); P.tearMax = ri(5, 40); P.spikeFreq = ri(1, 5); P.spikeWt = rf(10, 20);
            P.scanP = ri(4, 10); P.scanT = ri(1, 3); P.scanWt = rf(2, 6);
            P.smears = []; for (var si = 0; si < ri(5, 12); si++) P.smears.push({ cx: mfloor(w * rf()), cy: mfloor(h * rf()), len: ri(40, 150), angle: rf() < 0.5 ? Math.PI / 2 : 0, thresh: rf(0.3, 0.7), wt: rf(5, 12) });
            P.blocks = []; for (var bli = 0; bli < ri(3, 8); bli++) P.blocks.push({ cx: mfloor(w * rf()), cy: mfloor(h * rf()), size: ri(20, 60), wt: rf(6, 15) });
            P.cells = []; for (var ci = 0; ci < ri(10, 25); ci++) P.cells.push({ cx: mfloor(w * rf()), cy: mfloor(h * rf()), wt: rf(0, 30) });
            P.cellSize = ri(2, 8); break;
        case 'mondrian':
            P.rects = []; var q = [[0, 0, w, h, 0]];
            while (q.length) {
                var cc = q.shift(), cw2 = cc[2] - cc[0], ch2 = cc[3] - cc[1];
                if (cc[4] > 3 || cw2 < 8 || ch2 < 8 || rf() < 0.15) { P.rects.push({ x: cc[0], y: cc[1], w: cw2, h: ch2, bw: ri(1, 3), borderWt: rf(10, 20), fillWt: rf() < 0.4 ? rf(2, 8) : 0 }); }
                else if (rf() < 0.5) { var sx = cc[0] + ri(mfloor(cw2 * 0.3), mfloor(cw2 * 0.7)); q.push([cc[0], cc[1], sx, cc[3], cc[4] + 1]); q.push([sx, cc[1], cc[2], cc[3], cc[4] + 1]); }
                else { var sy = cc[1] + ri(mfloor(ch2 * 0.3), mfloor(ch2 * 0.7)); q.push([cc[0], cc[1], cc[2], sy, cc[4] + 1]); q.push([cc[0], sy, cc[2], cc[3], cc[4] + 1]); }
            } break;
        case 'flow':
            P.scrolls = []; for (var fs = 0; fs < ri(2, 5); fs++) P.scrolls.push([rf(5, 20), rf(0.5, 3), rf(3, 8)]);
            P.diamonds = []; for (var fd = 0; fd < ri(2, 5); fd++) P.diamonds.push([mfloor(w * rf()), mfloor(h * rf()), ri(10, 30), ri(1, 5), rf(3, 8)]);
            P.dP = ri(8, 20); P.dT = ri(1, 3); P.dWt = rf(3, 8); break;
        case 'stolz':
            P.blocks = []; var gw = ri(3, 6), gh = ri(4, 8), bw3 = mfloor(w / gw), bh3 = mfloor(h / gh);
            for (var gx = 0; gx < gw; gx++) for (var gy = 0; gy < gh; gy++)
                P.blocks.push({ x: gx * bw3, y: gy * bh3, w: bw3, h: bh3, type: ri(0, 3), sd: ri(2, 6), wtMain: rf(5, 20), wtSub: rf(1, 8) }); break;

        // ▸ Mordvinian (new)
        case 'tol':
            P.layers = []; for (var tl = 0; tl < ri(2, 5); tl++) P.layers.push([ri(6, 30), ri(2, 8), rf(2, 8)]); break;
        case 'mastor':
            P.diamonds = []; for (var md = 0; md < ri(2, 5); md++) P.diamonds.push([mfloor(w / 2 + rf(-w * 0.2, w * 0.2)), mfloor(h / 2 + rf(-h * 0.2, h * 0.2)), ri(10, 40), ri(1, 5), rf(3, 8)]);
            P.diagP = ri(4, 16); P.diagT = ri(1, mfloor(P.diagP / 2)); P.diagWt = rf(1, 4);
            P.adiagP = ri(4, 16); P.adiagT = ri(1, mfloor(P.adiagP / 2)); P.adiagWt = rf(1, 4); break;
        case 'virma':
            P.borderW = ri(5, 15); P.step = ri(3, 10); P.stepT = ri(1, mmax(2, mfloor(P.step / 2))); P.stepWt = rf(3, 8);
            P.step2 = ri(3, 10); P.stepT2 = ri(1, mmax(2, mfloor(P.step2 / 2))); P.stepWt2 = rf(2, 6);
            P.innerW = ri(5, 15); P.innerP = ri(8, 20); P.innerA = ri(2, 6); P.innerWt = rf(3, 7);
            P.centralR = ri(15, 35); P.centralRing = ri(2, 6); P.centralWt = rf(3, 8); break;
        case 'ved':
            P.scrolls = []; for (var vs = 0; vs < ri(2, 5); vs++) P.scrolls.push([rf(5, 20), rf(0.5, 3), rf(3, 8)]);
            P.bandStep = ri(4, 12); P.bandT = ri(1, mmax(2, mfloor(P.bandStep / 2))); P.bandWt = rf(1, 4); break;
        case 'kepe':
            P.peakH = ri(8, 20); P.peakW = ri(6, 16); P.peakWt = rf(3, 8);
            P.fillStep = ri(3, 8); P.fillT = ri(1, mmax(2, mfloor(P.fillStep / 2))); P.fillWt = rf(2, 5);
            P.crownR = ri(15, 35); P.crownRing = ri(2, 5); P.crownWt = rf(2, 6); break;
        case 'kolya':
            P.cornerSize = ri(15, mfloor(mmin(w, h) * 0.4)); P.fillP = ri(8, 20); P.fillW = ri(1, 3); P.cornerWt = rf(3, 8);
            P.chevP = ri(6, 16); P.chevA = ri(2, 6); P.chevWt = rf(2, 5); P.edgeW = ri(2, 6); P.edgeWt = rf(2, 5); break;
        case 'sermat': {
            var nc = ri(3, 8); P.centers = []; P.weights = [];
            var spX = w / (Math.ceil(Math.sqrt(nc)) + 1), spY = h / (Math.ceil(nc / Math.ceil(Math.sqrt(nc))) + 1);
            for (var sci = 0; sci < nc; sci++) {
                var col = sci % Math.ceil(Math.sqrt(nc)), row = mfloor(sci / Math.ceil(Math.sqrt(nc)));
                P.centers.push([mfloor(spX * (col + 1) + rf(-spX * 0.2, spX * 0.2)), mfloor(spY * (row + 1) + rf(-spY * 0.2, spY * 0.2))]);
                P.weights.push(rf(3, 8));
            }
            P.armW = ri(2, 5); P.armL = ri(4, 12); P.ringR = ri(8, 25); P.ringW = ri(1, 4); P.ringWt = rf(2, 6); break;
        }
        case 'chipaz': {
            var nr = ri(4, 8); P.rays = [];
            for (var cri = 0; cri < nr; cri++) {
                var ang = cri * Math.PI * 2 / nr, dist = rf(10, 35);
                P.rays.push([mfloor(w / 2 + Math.cos(ang) * dist), mfloor(h / 2 + Math.sin(ang) * dist * (h / w)), ri(1, 3), ri(3, 10), rf(3, 8)]);
            }
            P.sunR = ri(12, 30); P.sunRing = ri(2, 5); P.sunWt = rf(3, 8);
            P.glowP = ri(6, 16); P.glowT = ri(1, 3); P.glowWt = rf(1, 3); break;
        }
        case 'azulejo':
            P.tileSize = ri(20, mfloor(mmin(w, h) * 0.4)); P.medR = mfloor(P.tileSize * rf(0.2, 0.4)); P.medT = ri(2, 6); P.medWt = rf(5, 12);
            P.cornerR = mfloor(P.tileSize * rf(0.3, 0.6)); P.cornerT = ri(2, 5); P.cornerWt = rf(4, 9);
            P.cornerInnerR = mfloor(P.cornerR * rf(0.4, 0.7)); P.cornerInnerWt = rf(3, 8);
            P.grout = ri(2, 6); P.groutWt = rf(6, 15); break;
        case 'arraiolos':
            P.centerR = mfloor(mmin(w, h) * rf(0.15, 0.25)); P.stepSz = ri(3, 8); P.centerWt = rf(6, 12);
            var b1W = mfloor(mmin(w, h) * rf(0.08, 0.15));
            P.b1Start = mfloor(mmin(w, h) * rf(0.02, 0.05)); P.b1End = P.b1Start + b1W;
            P.b1Step = ri(4, 10); P.b1T = mfloor(P.b1Step / 2) || 1; P.b1Wt = rf(5, 10);
            P.b2Start = P.b1End + ri(4, 10); P.b2End = P.b2Start + ri(10, 30);
            P.b2P = ri(6, 14); P.b2T = ri(1, 4); P.b2Wt = rf(4, 8);
            P.fieldP = ri(6, 16); P.fieldT = ri(1, 3); P.fieldWt = rf(2, 6); break;
        case 'viana':
            P.bandH = ri(15, 50); P.sepT = ri(2, 6); P.sepWt = rf(5, 10); P.bands = [];
            var nVb = ri(3, 7);
            for (var vi = 0; vi < nVb; vi++) {
                var typ = ri(0, 3);
                P.bands.push({ type: typ, p1: typ === 0 ? ri(10, 30) : typ === 1 ? ri(15, 40) : typ === 2 ? ri(2, 10) : ri(8, 20), p2: typ === 0 ? ri(4, 12) : typ === 1 ? mfloor(P.bandH * rf(0.2, 0.4)) : typ === 2 ? 0 : ri(1, 4), wt: rf(4, 10) });
            } break;
        case 'castelo_branco':
            var nSc = ri(3, 8); P.scrolls = [];
            for (var sci = 0; sci < nSc; sci++) P.scrolls.push({ amp: rf(10, w * 0.3), period: rf(0.5, 3), wt: rf(4, 9) });
            var nFl = ri(4, 12); P.flowers = [];
            for (var fli = 0; fli < nFl; fli++) P.flowers.push({ cx: mfloor(rf(0, w)), cy: mfloor(rf(0, h)), r: ri(15, 40), petals: ri(4, 8), sharp: rf() > 0.5 ? 1 : 0, wt: rf(5, 12) });
            P.trunkP = ri(40, 150); P.trunkAmp = ri(10, 50); P.trunkT = ri(4, 12); P.trunkWt = rf(6, 15); break;
        case 'verena': {
            // Loewensberg diagonal bands
            var nVB = ri(5, 11), diag = rf() > 0.5 ? 1 : -1;
            P.bands = [];
            for (var vbi = 0; vbi < nVB; vbi++) {
                var baseAng = diag * rf(0.2, 0.7) + (rf() > 0.7 ? Math.PI / 2 : 0);
                P.bands.push({
                    cx: rf(-w * 0.1, w * 1.1), cy: rf(-h * 0.1, h * 1.1),
                    angle: baseAng + rf(-0.15, 0.15),
                    hw: rf(15, 60), hl: rf(w * 0.4, w * 1.2),
                    wt: rf(4, 10)
                });
            } break;
        }

        case 'cypress_hills':
            P.hills = []; for (var chi = 0; chi < ri(3, 6); chi++) P.hills.push({ amp: ri(20, 80), period: ri(50, 200), phase: rf(0, Math.PI * 2), baseY: ri(mfloor(h * 0.4), mfloor(h * 0.9)), step: ri(4, 12), wt: rf(4, 12) });
            P.trees = []; for (var cti = 0; cti < ri(5, 15); cti++) P.trees.push({ x: ri(mfloor(w * 0.1), mfloor(w * 0.9)), y: ri(mfloor(h * 0.3), mfloor(h * 0.7)), h: ri(40, 120), w: ri(15, 40), wt: rf(8, 15) });
            P.sunR = ri(20, 60); P.sunX = ri(mfloor(w * 0.2), mfloor(w * 0.8)); P.sunY = ri(mfloor(h * 0.1), mfloor(h * 0.3)); P.sunWt = rf(5, 12); break;
        case 'sierra_sunset':
            P.mountains = []; for (var ssi = 0; ssi < ri(4, 8); ssi++) P.mountains.push({ baseY: ri(mfloor(h * 0.3), mfloor(h * 0.8)), period: ri(80, 250), amp: ri(30, 100), thick: ri(10, 30), step: ri(5, 15), wt: rf(5, 14) });
            P.skyBands = ri(4, 10); P.skyWt = rf(2, 6); break;
        case 'panoramic_dunes':
            P.dunes = []; for (var pdi = 0; pdi < ri(4, 9); pdi++) P.dunes.push({ baseY: ri(mfloor(h * 0.4), mfloor(h * 0.9)), period: ri(150, 400), amp: ri(40, 120), phase: rf(0, Math.PI * 2), thick: ri(15, 40), wt: rf(6, 12) });
            P.windLines = ri(10, 30); P.windWt = rf(1, 4); break;
        case 'framed_vista':
            P.borderW = mfloor(mmin(w, h) * rf(0.1, 0.25)); P.borderWt = rf(8, 15); P.innerBorderT = ri(4, 12); P.innerBorderWt = rf(5, 10);
            P.vigHills = []; for (var fhi = 0; fhi < 3; fhi++) P.vigHills.push({ baseY: ri(mfloor(h * 0.5), mfloor(h * 0.8)), period: ri(40, 100), amp: ri(10, 40), wt: rf(4, 9) });
            P.vigTrees = []; for (var fti = 0; fti < 4; fti++) P.vigTrees.push({ x: ri(P.borderW + 10, w - P.borderW - 10), y: ri(mfloor(h * 0.4), mfloor(h * 0.7)), h: ri(20, 60), w: ri(10, 20), wt: rf(6, 12) });
            P.vigSunR = ri(15, 30); P.vigSunX = mfloor(w / 2) + ri(-40, 40); P.vigSunY = ri(P.borderW + 20, mfloor(h * 0.4)); P.vigSunWt = rf(5, 10);
            P.cornerType = ri(0, 2); P.cornerWt = rf(6, 12); break;

        // ▸ Groups for new engines
        // ---- band/diagonal group ----
        case 'adama': case 'cherokee': case 'narmuny': case 'pre_columbian':
        case 'shiprock': case 'structural': case 'woodcut':
            P.bands = []; for (var ngi = 0; ngi < ri(2, 5); ngi++) P.bands.push([ri(6, 30), ri(2, 8), rf(2, 8)]);
            P.stepP = ri(4, 14); P.stepT = ri(1, 4); P.stepWt = rf(2, 6); break;
        // ---- lattice/grid group ----
        case 'argyle': case 'bricolage': case 'interlace': case 'kishtima':
        case 'matsukawa': case 'wari': case 'yoshiwara': case 'kuba':
            P.latP = ri(10, 40); P.latT = ri(2, 6); P.latWt = rf(4, 10);
            P.ringR = ri(8, 30); P.ringT = ri(1, 4); P.ringWt = rf(2, 6); break;
        // ---- rotational/radial group ----
        case 'art_deco': case 'axonometric': case 'blueprint': case 'circuit':
        case 'kshtir': case 'orak': case 'tangents':
            P.rings = []; for (var rgi = 0; rgi < ri(2, 6); rgi++) P.rings.push([ri(10, mfloor(mmin(w, h) * 0.5)), ri(1, 4), rf(3, 10)]);
            P.diagP = ri(6, 20); P.diagT = ri(1, 4); P.diagWt = rf(2, 6); break;
        // ---- stripe/alternate group ----
        case 'adire': case 'fret_bands': case 'kanzemizu': case 'optical_box':
        case 'pulay': case 'serape_net': case 'yagasuri':
            P.bandH = ri(10, 40); P.diagP = ri(6, 20); P.diagT = ri(1, 4);
            P.main = rf(4, 10); P.stripeT = ri(2, 6); P.stripeWt = rf(2, 6); break;
        // ---- panelled group ----
        case 'panks': case 'pakshats':
            P.armW = ri(2, 8); P.armL = ri(6, 30); P.crossWt = rf(4, 10);
            P.latP = ri(10, 30); P.latT = ri(1, 4); P.latWt = rf(2, 6); break;
        // ---- patchwork/collage group ----
        case 'collage': case 'cubist':
            P.sz = ri(15, 40); P.diagP = ri(6, 20); P.diagT = ri(1, 4);
            P.latP = ri(8, 20); P.latT = ri(1, 3); P.latWt = rf(3, 8); P.main = rf(4, 10); break;
        // ---- rect/block group ----
        case 'brutalist': case 'malevich': case 'suprematism':
            P.rects = []; for (var bri = 0; bri < ri(4, 10); bri++) {
                var rx = mfloor(w * rf()), ry = mfloor(h * rf()), rw = ri(5, mfloor(w * 0.4)), rh = ri(5, mfloor(h * 0.4));
                P.rects.push({ x: rx, y: ry, w: rw, h: rh, wt: rf(4, 12) });
            } break;
        // ---- current/chiefs/spider group ----
        case 'current': case 'spider_cross': case 'chiefs':
            P.amp = ri(4, 20); P.period = ri(15, 50); P.main = rf(4, 10);
            P.ringR = ri(10, 35); P.ringWt = rf(3, 8); break;
        // ---- kudo/brick group ----
        case 'kudo':
            P.bW = ri(10, 25); P.bH = ri(5, 14); P.mortar = ri(1, 3); P.bWt = rf(5, 12); break;
        // ---- sermat-kudo blended ----
        case 'sermat-kudo':
            P.centers = []; for (var skci = 0; skci < ri(3, 8); skci++) P.centers.push([mfloor(w * rf()), mfloor(h * rf())]);
            P.armW = ri(2, 6); P.armL = ri(5, 20);
            P.weights = [rf(3, 8), rf(5, 12), rf(2, 6), rf(4, 9)];
            P.ringR = ri(10, 30); P.ringW = ri(1, 4); P.ringWt = rf(2, 6); break;
        case 'flowing_streams':
            P.streams = []; var nRs = ri(4, 9);
            for (var rsi = 0; rsi < nRs; rsi++) {
                var nF = ri(2, 4), fr = [];
                for (var rfi = 0; rfi < nF; rfi++) fr.push({ freq: rf(0.01, 0.04), amp: rf(15, 60), phase: rf(0, Math.PI * 2) });
                P.streams.push({ baseY: ri(-50, h + 50), width: rf(20, 80), wt: rf(6, 15), frequencies: fr });
            } break;
        case 'flowing_contours':
            P.waves = []; var nW = ri(3, 5);
            for (var iW = 0; iW < nW; iW++) {
                var ang = rf(0, Math.PI * 2);
                var freq = rf(0.015, 0.045);
                P.waves.push({ fx: Math.cos(ang) * freq, fy: Math.sin(ang) * freq, amp: rf(20, 50), ph: rf(0, Math.PI * 2) });
            }
            P.interval = rf(30, 70); P.thick = rf(3, 8); P.wt = rf(6, 15); break;
    }
    return P;
}

