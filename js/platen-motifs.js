// PLATEN · by douglxss · github.com/artistdbjohnson/Platen
// ── MOTIF PRIMITIVES ─────────────────────────────────────────────────────────
// Each returns a weight contribution for cell (x,y) on grid (w,h).
// Inspired by Mordvinian embroidery stitch patterns.

// 1. Diagonal band: weight when (x+y) mod period < thickness → creates / lines
function motifDiagonal(x, y, period, thickness) {
    var phase = safeMod(x + y, period);
    if (phase < thickness) {
        // Gradient from 1.0 down to 0.6 within the thickness
        return 1.0 - (phase / thickness) * 0.4;
    }
    return 0;
}

// 2. Anti-diagonal band: weight when (x-y) mod period < thickness → creates \ lines
function motifAntiDiag(x, y, period, thickness) {
    var phase = safeMod(x - y, period);
    if (phase < thickness) {
        // Gradient from 1.0 down to 0.6 within the thickness
        return 1.0 - (phase / thickness) * 0.4;
    }
    return 0;
}

// 3. Chevron: diagonal + anti-diagonal with fold at midpoint
function motifChevron(x, y, w, period, amplitude) {
    var fold = Math.abs(x - w / 2);
    var phase = safeMod(fold + y, period);
    if (phase < amplitude) {
        // Multi-level weight to trigger color variety
        if (phase < amplitude * 0.3) return 1.0;
        if (phase < amplitude * 0.7) return 0.7;
        return 0.4;
    }
    return 0;
}

// 4. Diamond: Manhattan distance from center < radius
function motifDiamond(x, y, cx, cy, radius, ringWidth) {
    var dist = Math.abs(x - cx) + Math.abs(y - cy);
    if (ringWidth > 0) {
        var phase = safeMod(dist, radius);
        if (phase < ringWidth) {
            return 1.0 - (phase / ringWidth) * 0.5; // Outer ring gradient
        }
        return 0;
    }
    if (dist < radius) {
        // Tiered interior weights
        if (dist < radius * 0.4) return 1.0;
        if (dist < radius * 0.7) return 0.7;
        return 0.4;
    }
    return 0;
}

// 5. Stepped edge: creates castellated/meander border patterns
function motifStepped(x, y, step, thickness, axis) {
    var offset = safeMod(Math.floor(y / step), 2) * Math.floor(step / 2);
    if (axis === 1) offset = safeMod(Math.floor(x / step), 2) * Math.floor(step / 2);
    var coord = axis === 0 ? x : y;

    var phase = safeMod(coord + offset, step);
    if (phase < thickness) {
        // Core line (1.0) and shadow line (0.4)
        return phase < thickness * 0.4 ? 1.0 : 0.4;
    }
    return 0;
}

// 6. S-curve / scroll: sinusoidal offset creates interlocking S shapes
function motifScroll(x, y, w, amplitude, freq) {
    var center = w / 2;
    var wave = center + amplitude * Math.sin(y * freq * Math.PI / 40);
    var dist = Math.abs(x - wave);
    return dist < amplitude * 0.4 ? 1 : 0;
}

// 7. Cross / rosette: radial cross from center point
function motifCross(x, y, cx, cy, armW, armL) {
    var dx = Math.abs(x - cx), dy = Math.abs(y - cy);
    var onH = dx < armL && dy < armW;
    var onV = dy < armL && dx < armW;
    if (onH && onV) return 1.0; // Nexus
    if (onH || onV) return 0.6; // Arms
    return 0;
}

// 8. Duckfoot: splayed triplet from a point (Mordvin protective mark)
function motifDuckfoot(x, y, cx, cy, spread, len) {
    var dx = x - cx, dy = y - cy;
    if (dy < 0 || dy > len) return 0;
    var t = dy / len;
    // Three splayed toes
    var toe1 = Math.abs(dx - t * spread) < 1.5;
    var toe2 = Math.abs(dx) < 1.5;
    var toe3 = Math.abs(dx + t * spread) < 1.5;
    if (toe2) return 1.0; // Center toe stronger
    if (toe1 || toe3) return 0.7; // Side toes
    return 0;
}

// 9. Brick: offset rectangular grid like masonry
function motifBrick(x, y, brickW, brickH) {
    var row = Math.floor(y / brickH);
    var offset = safeMod(row, 2) * Math.floor(brickW / 2);
    var inMortarX = safeMod(x + offset, brickW) < 1;
    var inMortarY = safeMod(y, brickH) < 1;
    return (inMortarX || inMortarY) ? 0 : 1;
}

// 10. Lattice: intersecting diagonals creating X-crossing grid
function motifLattice(x, y, period, thickness) {
    var d1 = safeMod(x + y, period) < thickness;
    var d2 = safeMod(x - y, period) < thickness;
    if (d1 && d2) return 1.0; // Crossings
    if (d1 || d2) return 0.6; // Isolated lines
    return 0;
}

// 11. Polyline: horizontal zigzag stroke
function motifPolyline(x, y, period, amplitude, thickness) {
    var phase = safeMod(x, period);
    var peak = (phase < period / 2) ? (phase * 2 * amplitude / period) : (amplitude * 2 - phase * 2 * amplitude / period);
    var dist = Math.abs(safeMod(y, amplitude * 2) - peak);
    if (dist < thickness) {
        // Gradient within the stroke
        return 1.0 - (dist / thickness) * 0.5;
    }
    return 0;
}

// 12. Rosette: radial petal/flower form — concentric lobes around center (catalog p103, p107)
function motifRosette(x, y, cx, cy, radius, petals, thickness) {
    var dx = x - cx, dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius * 1.3) return 0;
    var angle = Math.atan2(dy, dx);
    var petalPhase = Math.cos(angle * petals);
    var petalR = radius * (0.5 + 0.5 * petalPhase);
    var delta = Math.abs(dist - petalR);
    if (delta < thickness) {
        return 1.0 - (delta / thickness) * 0.6;
    }
    return 0;
}

// 13. Meander: Greek key / fret — stepped square spiral (catalog p132, p135)
function motifMeander(x, y, period, width, depth) {
    var px = safeMod(x, period);
    var py = safeMod(y, period);
    var half = Math.floor(period / 2);

    var wt = 0;
    // Outer frame
    if (px < width || py < width || px >= period - width || py >= period - width) wt = 1.0;

    // Inner spiral arm
    if (px >= half - width && px < half + width && py >= width && py < half + width) wt = 0.8;
    if (py >= half - width && py < half + width && px >= half && px < period - width) wt = 0.8;

    // Depth modulation for nested feel
    if (depth > 1) {
        var qp = Math.floor(period / 3);
        var qx = safeMod(x, qp);
        var qy = safeMod(y, qp);
        if (qx < width || qy < width) wt = Math.max(wt, 0.4);
    }
    return wt;
}

// 14. HexLattice: hexagonal honeycomb tiling for field tessellations (catalog p172)
function motifHexLattice(x, y, cellSize, wallThick) {
    var row = Math.floor(y / (cellSize * 0.866));
    var offset = safeMod(row, 2) * (cellSize / 2);
    var cx = safeMod(x + offset, cellSize) - cellSize / 2;
    var cy = safeMod(y, cellSize * 0.866) - cellSize * 0.433;
    // Hex distance approximation
    var hx = Math.abs(cx);
    var hy = Math.abs(cy);
    var hexDist = Math.max(hx, (hx / 2 + hy * 0.866));
    var delta = Math.abs(hexDist - cellSize * 0.4);
    if (delta < wallThick) {
        return 1.0 - (delta / wallThick) * 0.5;
    }
    return 0;
}

// 15. Tie-Dye Ring: irregular fuzzy concentric rings (Wari shibori)
function motifTieDyeRing(x, y, cx, cy, radius, thickness, fuzz) {
    var dx = x - cx, dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    // add some jaggedness based on angle
    var angle = Math.atan2(dy, dx);
    dist += Math.cos(angle * fuzz) * (radius * 0.15);
    var delta = Math.abs(dist - radius);
    if (delta < thickness) {
        // Irregular weight for fuzzy feel
        return 1.0 - (delta / thickness) * 0.4 - (Math.random() * 0.2);
    }
    return 0;
}

// 16. Stepped Diamond: Navajo-style stepped center motif
function motifSteppedDiamond(x, y, cx, cy, radius, stepSize) {
    var dx = Math.abs(x - cx);
    var dy = Math.abs(y - cy);
    // Quantize the coordinates to create steps
    var sx = Math.floor(dx / stepSize) * stepSize;
    var sy = Math.floor(dy / stepSize) * stepSize;
    var rawDist = sx + sy;
    if (rawDist <= radius) {
        // Tiered weights based on step-depth
        if (rawDist < radius * 0.3) return 1.0;
        if (rawDist < radius * 0.6) return 0.7;
        return 0.4;
    }
    return 0;
}

// 17. Serrated Band: Zig-zag horizontal division (Navajo)
function motifSerratedBand(x, y, cy, amplitude, period) {
    var phase = safeMod(x, period);
    var peak = (phase < period / 2) ? (phase * 2 * amplitude / period) : (amplitude * 2 - phase * 2 * amplitude / period);
    var expectedY = cy - amplitude + peak;
    var dist = Math.abs(y - expectedY);
    if (dist <= 2) {
        return 1.0 - (dist / 2) * 0.5;
    }
    return 0;
}

// 18. Multi-Lattice: Thick, multi-line argyle lattice (French lace)
function motifMultiLattice(x, y, period, thickness, lines, spacing) {
    var wt = 0;
    var d1 = safeMod(x + y, period);
    var d2 = safeMod(x - y, period);

    for (var i = 0; i < lines; i++) {
        var offset = (i - Math.floor(lines / 2)) * spacing;
        var weightForLine = 1.0 - (i / lines) * 0.4; // Varied line weights

        if (Math.abs(d1 - (thickness / 2) - offset) < thickness / 2) wt = Math.max(wt, weightForLine);
        if (Math.abs(d2 - (thickness / 2) - offset) < thickness / 2) wt = Math.max(wt, weightForLine);
        // wrapping logic for offsets
        if (Math.abs(d1 - period - (thickness / 2) - offset) < thickness / 2) wt = Math.max(wt, weightForLine);
        if (Math.abs(d2 - period - (thickness / 2) - offset) < thickness / 2) wt = Math.max(wt, weightForLine);
    }
    return wt;
}

// 19. Scallop Edge: vertical lacy border (French lace)
function motifScallopEdge(x, y, cx, radius, period) {
    var dy = safeMod(y, period) - period / 2;
    var dx = x - cx;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dx > 0 && dist < radius) {
        // Gradient from 1.0 down to 0.4
        return 1.0 - (dist / radius) * 0.6;
    }
    return 0;
}

// 20. Star Grid: Islamic 8-point star and cross interlace
function motifStarGrid(x, y, period, ringR, thickness) {
    var cx = safeMod(x + period / 2, period) - period / 2;
    var cy = safeMod(y + period / 2, period) - period / 2;

    // Cross
    var onCross = (Math.abs(cx) < thickness && Math.abs(cy) < ringR) ||
        (Math.abs(cy) < thickness && Math.abs(cx) < ringR);
    // X (diagonals)
    var onX = (Math.abs(cx - cy) < thickness && Math.abs(cx) < ringR * 0.7) ||
        (Math.abs(cx + cy) < thickness && Math.abs(cx) < ringR * 0.7);

    // Diamond frame
    var dDia = Math.abs(cx) + Math.abs(cy);
    var onDia = Math.abs(dDia - ringR) < thickness;

    // Square frame
    var onSq = Math.abs(Math.max(Math.abs(cx), Math.abs(cy)) - ringR * 0.8) < thickness;

    if (onCross || onX) return 1.0;
    if (onDia) return 0.75;
    if (onSq) return 0.5;
    return 0;
}

// 21. Seigaiha: Japanese continuous overlapping sine waves (vectors)
function motifSeigaiha(x, y, period, amp, rowSpacing, stripeSpacing, thickness) {
    var approxRow = Math.floor(y / rowSpacing);
    var foundDy = -1;

    var bestR = 0;

    // Search rows from bottom-up (higher y drawn on top of lower y)
    for (var ro = 2; ro >= -2; ro--) {
        var r = approxRow + ro;
        var phaseOff = (safeMod(r, 2) === 0) ? 0 : (period / 2); // Stagger alternate rows

        // Base Y for the wave crest (crest points up, so lower Y)
        var waveY = r * rowSpacing - amp * Math.cos((x + phaseOff) / period * Math.PI * 2);

        if (y >= waveY) {
            // Inside this wave body
            foundDy = y - waveY;
            bestR = r;
            break;
        }
    }

    if (foundDy < 0) return 0;

    // Draw regular internal stripes parallel to the wave
    var phaseDist = safeMod(foundDy, stripeSpacing);
    if (phaseDist < thickness || (stripeSpacing - phaseDist) < thickness) {
        return 0.5 + 0.25 * safeMod(Math.abs(bestR), 3);
    }
    return 0;
}

// 22. Asanoha: Hemp leaf star lattice
function motifAsanoha(x, y, period, thickness) {
    // Hexagonal base coordinates
    var h = period * 0.866; // Height of equilateral triangle
    var row = Math.floor(y / h);
    var offset = safeMod(row, 2) * (period / 2);

    // Local coordinates within the hex/triangle cell
    var cx = safeMod(x + offset, period);
    var cy = safeMod(y, h);

    // Main axes
    var onHoriz = Math.abs(cy - h / 2) < thickness;
    var distDiag1 = Math.abs((cx * 0.866) + (cy * 0.5) - (period * 0.433));
    var distDiag2 = Math.abs((cx * 0.866) - (cy * 0.5) + (period * 0.433));
    var onDiag1 = safeMod(distDiag1, period * 0.866 / 2) < thickness;
    var onDiag2 = safeMod(distDiag2, period * 0.866 / 2) < thickness;

    // Fill logic: Detect if inside one of the 6 triangular "leaves"
    // Calculate distance from center of the hex cell
    var dx = cx - period / 2;
    var dy = cy - h / 2;
    var angle = Math.atan2(dy, dx);
    var dist = Math.sqrt(dx * dx + dy * dy);

    // Normalize angle to [0, 2pi]
    if (angle < 0) angle += Math.PI * 2;

    // Asanoha has 6-fold symmetry, find which 60-degree sector we are in
    var sector = Math.floor(angle / (Math.PI / 3));
    var sectorAngle = safeMod(angle, Math.PI / 3) - Math.PI / 6;

    // Triangular leaf fill: Inside a certain radius and narrow angle
    var leafFill = 0;
    if (dist < period * 0.4 && Math.abs(sectorAngle) < 0.2) {
        leafFill = 0.5 + 0.2 * (1.0 - dist / (period * 0.4));
    }

    if (onHoriz || onDiag1 || onDiag2) return 1.0;
    if (leafFill > 0) return leafFill;
    return 0;
}

// 23. Shippo: Seven Treasures interlocking circles
function motifShippo(x, y, radius, thickness) {
    // Shippo spacing is based on overlapping circles where centers are exactly 'radius' apart
    var gridX = radius;
    var gridY = radius;

    var cx1 = Math.floor(x / gridX) * gridX;
    var cy1 = Math.floor(y / gridY) * gridY;

    var overlaps = 0;
    var edge = false;

    // Test the 4 nearest circle centers
    for (var i = 0; i <= 1; i++) {
        for (var j = 0; j <= 1; j++) {
            var cX = cx1 + i * gridX;
            var cY = cy1 + j * gridY;
            var dist = Math.sqrt((x - cX) * (x - cX) + (y - cY) * (y - cY));

            if (dist < radius) overlaps++;
            if (Math.abs(dist - radius) < thickness) edge = true;
        }
    }

    if (edge) return 1.0;
    if (overlaps >= 3) return 0.8; // High nexus
    if (overlaps === 2) return 0.5; // Lens
    if (overlaps === 1) return 0.2; // Circle interior
    return 0;
}

// 24. Kikkou: Tortoiseshell Hexagons (with optional inner nested hex)
function motifKikkou(x, y, radius, thickness, innerOffset) {
    var hexH = radius * 1.732; // height of hexagon (pointy topped)

    // Hex grid coordinates
    var col = Math.floor(x / (radius * 1.5));
    var rowOffset = safeMod(col, 2) * (hexH / 2);
    var cy = Math.floor((y - rowOffset) / hexH) * hexH + rowOffset + hexH / 2;
    var cx = col * (radius * 1.5) + radius;

    var dx = Math.abs(x - cx);
    var dy = Math.abs(y - cy);

    // Hexagon distance formula (pointy top)
    var hexDist = Math.max(dx, dx / 2 + dy * 0.866);

    // Outer shell line
    if (Math.abs(hexDist - radius) < thickness) return 1.0;

    // Inner nested shell line
    if (innerOffset > 0 && Math.abs(hexDist - (radius - innerOffset)) < thickness) return 0.8;

    // Fill zones
    if (hexDist < (radius - innerOffset) && innerOffset > 0) {
        return 0.4; // Center fill
    }

    if (hexDist < radius && hexDist > (radius - innerOffset) && innerOffset > 4) {
        return 0.6; // Ring fill
    }

    return 0;
}

// 25. Yagasuri: Arrow Feathers (vertical zig-zags)
function motifYagasuri(x, y, colWidth, rowHeight, thickness) {
    var col = Math.floor(x / colWidth);
    var cx = safeMod(x, colWidth);

    // Alternate direction of the arrow per column
    var dir = safeMod(col, 2) === 0 ? 1 : -1;

    // The zig-zag shape
    var normalizedX = dir === 1 ? cx : (colWidth - cx);
    var phaseY = safeMod(y + (normalizedX * rowHeight / colWidth), rowHeight);

    // Solid chevron fill (roughly 40% of the row height)
    var fillWidth = rowHeight * 0.4;
    if (phaseY < fillWidth) {
        // Gradient or tiered weight within the chevron
        return 0.5 + 0.5 * (1.0 - phaseY / fillWidth);
    }

    // Secondary line for definition
    if (Math.abs(phaseY - fillWidth * 1.2) < thickness) return 0.3;

    return 0;
}

// 26. Serrated Diamond (Navajo Eye-Dazzler)
function motifSerratedDiamond(x, y, cx, cy, radius, stepSize) {
    var dx = Math.abs(x - cx);
    var dy = Math.abs(y - cy);

    // Quantize the coordinates to create steps
    var sx = Math.floor(dx / stepSize) * stepSize;
    var sy = Math.floor(dy / stepSize) * stepSize;

    var dist = sx + sy;
    if (dist <= radius) {
        // Tiered weights based on step-depth
        if (dist > radius - stepSize) return 1.0;
        if (dist > radius - stepSize * 2) return 0.7;
        return 0.4;
    }
    return 0;
}

// 27. Serrated Band (Zig-zag horizontal division)
function motifSerratedBand(x, y, cy, amplitude, period) {
    var phase = safeMod(x, period);
    var peak = (phase < period / 2) ? (phase * 2 * amplitude / period) : (amplitude * 2 - phase * 2 * amplitude / period);
    var expectedY = cy - amplitude + peak;
    var dist = Math.abs(y - expectedY);

    if (dist <= 2) {
        // Gradient for color variety
        return 1.0 - (dist / 2) * 0.5;
    }
    return 0;
}

// 27. Chief's Blanket Layout (Navajo Classic Period)
// Overlays a structured 9-point diamond arrangement over Moki stripes
function motifChiefsDiamond(x, y, w, h, centerR, edgeR, cornerR, stepSize) {
    var wt = 0;

    // Center Diamond
    wt += motifSerratedDiamond(x, y, w / 2, h / 2, centerR, stepSize);

    // Left/Right Edge Half-Diamonds
    wt += motifSerratedDiamond(x, y, 0, h / 2, edgeR, stepSize);
    wt += motifSerratedDiamond(x, y, w, h / 2, edgeR, stepSize);

    // Top/Bottom Edge Half-Diamonds
    wt += motifSerratedDiamond(x, y, w / 2, 0, edgeR, stepSize);
    wt += motifSerratedDiamond(x, y, w / 2, h, edgeR, stepSize);

    // Corner Quarter-Diamonds
    wt += motifSerratedDiamond(x, y, 0, 0, cornerR, stepSize);
    wt += motifSerratedDiamond(x, y, w, 0, cornerR, stepSize);
    wt += motifSerratedDiamond(x, y, 0, h, cornerR, stepSize);
    wt += motifSerratedDiamond(x, y, w, h, cornerR, stepSize);

    return wt;
}

// ── KAGOME (Tri-Axial Hexagonal Basket Weave) ──────────────────────────────
function motifKagome(x, y, period, thickness, dotR, dotWt) {
    var wt = 0;
    var h = period;
    var sq32 = 0.86602540378;
    var d1 = y;
    var d2 = x * sq32 + y * 0.5;
    var d3 = -x * sq32 + y * 0.5;

    // Offset by 1/3 to form the kagome loops instead of triangular grid
    var offset = h / 3;

    var dist1 = Math.abs(safeMod(d1 - offset + h / 2, h) - h / 2);
    var dist2 = Math.abs(safeMod(d2 - offset + h / 2, h) - h / 2);
    var dist3 = Math.abs(safeMod(d3 - offset + h / 2, h) - h / 2);

    if (dist1 < thickness / 2 || dist2 < thickness / 2 || dist3 < thickness / 2) {
        wt = 1;
    } else if (dotWt > 0 && dotR > 0) {
        // Inner hexagon centers are at the un-offset tri-axial nodes
        var c1 = Math.abs(safeMod(d1 + h / 2, h) - h / 2);
        var c2 = Math.abs(safeMod(d2 + h / 2, h) - h / 2);
        var c3 = Math.abs(safeMod(d3 + h / 2, h) - h / 2);
        var rSq = (c1 * c1 + c2 * c2 + c3 * c3) * 0.66666666666;
        if (rSq < dotR * dotR) {
            wt = dotWt;
        }
    }
    return wt;
}

// ── KANZEMIZU (Stippled Swirling Water) ───────────────────────────────────
function motifKanzemizu(x, y, periodY, waveLengths, amps, maskT, dotR, dotP) {
    var waveY = 0;
    for (var i = 0; i < waveLengths.length; i++) {
        waveY += Math.sin(x / waveLengths[i] * Math.PI * 2) * amps[i];
    }
    var d = Math.abs(safeMod(y - waveY + periodY / 2, periodY) - periodY / 2);

    if (d < maskT) {
        // Hexagonal dot grid masking
        var sq32 = 0.86602540378;
        var h = dotP * sq32;
        var row = Math.round(y / h);
        var y_c = row * h;
        var offset = (row % 2 === 0) ? 0 : dotP / 2;
        var col = Math.round((x - offset) / dotP);
        var x_c = col * dotP + offset;

        var dx = x - x_c;
        var dy = y - y_c;
        if (dx * dx + dy * dy < dotR * dotR) {
            return 0.5 + 0.25 * safeMod(row * 7 + col * 11, 3);
        }
    }
    return 0;
}

// ── YOSHIWARA (Interlocking Fretwork Chains) ───────────────────────────────
function motifYoshiwara(x, y, periodX, periodY, links, thickness) {
    var wt = 0;
    var cy = safeMod(y, periodY) - periodY / 2;

    var linkSpace = periodX / links;
    var linkIndex = Math.floor(x / linkSpace);
    var localX = safeMod(x, linkSpace) - linkSpace / 2;

    var isTop = (linkIndex % 2 === 0);

    // Vary weight to utilize multiple colors from the palette
    var baseWt = 1.0 + (linkIndex % 2) * 0.5;

    // Central connecting bar
    if (Math.abs(cy) < thickness / 2) wt = baseWt;

    var uHeight = periodY * 0.35;
    var uWidth = linkSpace * 0.7;

    // Vertical legs of the 'U'
    if (Math.abs(Math.abs(localX) - uWidth / 2) < thickness / 2) {
        if (isTop && cy < 0 && cy > -uHeight) wt = baseWt;
        if (!isTop && cy > 0 && cy < uHeight) wt = baseWt;
    }

    // Horizontal cap of the 'U'
    if (Math.abs(localX) <= uWidth / 2) {
        if (isTop && Math.abs(cy - (-uHeight)) < thickness / 2) wt = baseWt;
        if (!isTop && Math.abs(cy - uHeight) < thickness / 2) wt = baseWt;
    }

    return wt;
}

// ── MATSUKAWA (Pine Bark Stepped Diamond Lattice) ────────────────────────
function motifMatsukawa(x, y, periodX, periodY, steps, thickness) {
    var cx = Math.abs(safeMod(x, periodX) - periodX / 2);
    var cy = Math.abs(safeMod(y, periodY) - periodY / 2);

    var stepW = (periodX / 2) / steps;
    var stepH = (periodY / 2) / steps;

    var gx = Math.floor(cx / stepW);
    var gy = Math.floor(cy / stepH);

    // Diagonal bounding stair-step
    if (gx + gy === steps - 1) {
        var localX = cx - gx * stepW;
        var localY = cy - gy * stepH;
        if (Math.abs(localX - stepW) < thickness / 2 || Math.abs(localY - stepH) < thickness / 2) {
            return 1;
        }
    } else if (gx + gy === steps) {
        var lx = cx - gx * stepW;
        var ly = cy - gy * stepH;
        if (Math.abs(lx) < thickness / 2 || Math.abs(ly) < thickness / 2) {
            return 0.5; // Lower weight for inner step to trigger a secondary color
        }
    }

    return 0;
}

// ── SPIDER WOMAN CROSS (Navajo Transitional) ─────────────────────────────
function motifSpiderCross(x, y, w, h, t) {
    var ax = Math.abs(x);
    var ay = Math.abs(y);
    var isV = ax < t && ay < h;
    var isH = ay < t && ax < w;

    // Outer corner blocks mapping
    var t2 = t * 2.5;
    var isC = (ax > t && ax < t2) && (ay > t && ay < t2);

    if (isV && isH) return 1.0; // central intersection
    if (isC) return 0.4;        // open corners
    if (isV || isH) return 0.8; // arms

    return 0;
}

// ── OPTICAL BOX (Moqui/Serape Concentric Tunnels) ────────────────────────
function motifOpticalBox(x, y, w, h, steps, t) {
    var cx = Math.abs(x);
    var cy = Math.abs(y);

    if (cx > w || cy > h) return 0;

    var stepW = w / steps;
    var stepH = h / steps;

    var ring = Math.max(Math.floor(cx / stepW), Math.floor(cy / stepH));
    var onEdgeX = Math.abs(cx - ring * stepW) < t;
    var onEdgeY = Math.abs(cy - ring * stepH) < t;

    if (onEdgeX || onEdgeY) {
        return 1.0 - (ring / steps) * 0.5; // topological depth
    }

    return 0;
}

// ── TERRACED FRET (Navajo Fretwork Bands) ────────────────────────────────
function motifTerracedFret(x, y, periodX, periodY, steps, t) {
    var cx = safeMod(x, periodX) - periodX / 2;
    var cy = safeMod(y, periodY) - periodY / 2;

    // We want a meandering stepped hook.
    var stepW = periodX / 2 / steps;
    var stepH = periodY / 2 / steps;
    var gx = Math.floor(Math.abs(cx) / stepW);
    var gy = Math.floor(Math.abs(cy) / stepH);

    // Diagonal stepping pattern
    if (gx === gy) {
        var lx = Math.abs(cx) - gx * stepW;
        var ly = Math.abs(cy) - gy * stepH;
        if (Math.abs(lx) < t || Math.abs(ly) < t) return 1.0;
    } else if (Math.abs(gx - gy) === 1) {
        return 0.6; // adjacent step shadow
    }

    return 0;
}

// ── TERRACED CHEVRON (Classic Serape Net) ────────────────────────────────
function motifTerracedChevron(x, y, period, amp, steps) {
    var px = safeMod(x, period);
    var zz = (px < period / 2) ? (px / (period / 2)) : (2.0 - px / (period / 2));

    // Quantize zig-zag into steps
    var steppedZz = Math.floor(zz * steps) / steps;
    var expectedY = (steppedZz - 0.5) * amp * 2;

    var dy = Math.abs(y - expectedY);
    var stepH = (amp * 2) / steps;

    if (dy < stepH * 0.8) return 1.0;
    if (dy < stepH * 1.6) return 0.5; // secondary shadow band

    return 0;
}

// ── TANGENT SEGMENT (Modernist geometric link) ──────────────────────────
function motifTangentSegment(x, y, x1, y1, r1, x2, y2, r2) {
    var dx = x2 - x1, dy = y2 - y1;
    var d2 = dx * dx + dy * dy;
    if (d2 < 0.001) {
        var distO = Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
        return distO < r1 ? 1 : 0;
    }

    var t = ((x - x1) * dx + (y - y1) * dy) / d2;
    t = Math.max(0, Math.min(1, t));

    var cx = x1 + t * dx;
    var cy = y1 + t * dy;

    var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
    var r = r1 + t * (r2 - r1);

    return dist < r ? 1 : 0;
}

// ── MODERNIST CONSTRUCTION (Constructivist markings) ────────────────────
function motifModernistConstruct(x, y, cx, cy, radius, type) {
    var dx = Math.abs(x - cx), dy = Math.abs(y - cy);
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (type === 'circle') {
        return Math.abs(dist - radius) < 1.0 ? 0.3 : 0;
    } else if (type === 'plus') {
        var onCross = (dx < 4 && dy < 0.6) || (dy < 4 && dx < 0.6);
        return onCross ? 0.6 : 0;
    } else if (type === 'minus') {
        var onLine = dx < 4 && dy < 0.6;
        return onLine ? 0.6 : 0;
    }
    return 0;
}

// ── ORAK MOTIFS (Cosmic Surrealism) ───────────────────────────────────────

// 31. Warped Checkerboard (Spherical/Fisheye)
function motifCheckerWarp(x, y, cx, cy, radius, skew) {
    var dx = x - cx, dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) return 0;

    // Warp coordinates based on distance from center (Fisheye effect)
    var factor = Math.pow(dist / radius, skew);
    var angle = Math.atan2(dy, dx);

    var wx = Math.cos(angle) * factor * 20;
    var wy = Math.sin(angle) * factor * 20;

    var check = (Math.floor(wx) + Math.floor(wy)) % 2 === 0;
    if (check) {
        return 0.8 + 0.2 * (1.0 - dist / radius);
    }
    return 0;
}

// 32. Celestial Ray (Radiating beams)
function motifRadialRay(x, y, cx, cy, angle, width) {
    var dx = x - cx, dy = y - cy;
    var a = Math.atan2(dy, dx);
    var diff = Math.abs(safeMod(a - angle + Math.PI, Math.PI * 2) - Math.PI);

    if (diff < width) {
        var dist = Math.sqrt(dx * dx + dy * dy);
        return (1.0 - diff / width) * Math.min(1.0, dist / 10);
    }
    return 0;
}

// 33. Token Path (Seed/Bottle shapes along a curve)
function motifTokenPath(x, y, cx, cy, r, freq, rot) {
    var dx = x - cx, dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.atan2(dy, dx) + rot;

    // The "river" path
    var pathR = r + Math.sin(angle * freq) * (r * 0.2);
    var dPath = Math.abs(dist - pathR);

    if (dPath < 4) {
        // Individual tokens along the path
        var step = Math.PI * 2 / 24;
        var onToken = Math.abs(safeMod(angle, step)) < step * 0.3;
        if (onToken) return 1.0;
        return 0.3; // Connecting "string"
    }
    return 0;
}

// ── GLITCH MOTIFS (Data Corruption) ───────────────────────────────────────

// 34. Pixel Smear (Pixel Sorting simulation)
function motifPixelSmear(x, y, cx, cy, len, angle, thresh) {
    var dx = x - cx;
    var dy = y - cy;

    // Rotate coordinates to align with the smear angle
    var nx = dx * Math.cos(-angle) - dy * Math.sin(-angle);
    var ny = dx * Math.sin(-angle) + dy * Math.cos(-angle);

    if (Math.abs(ny) < 1.0 && nx > 0 && nx < len) {
        // Pseudo-random noise to create "shredded" look
        var seed = Math.floor(cx * 13 + cy * 7 + Math.floor(ny * 10));
        var noise = safeMod(seed * 157, 100) / 100;

        if (noise > thresh) {
            // Gradient along the smear
            return 0.4 + 0.6 * (1.0 - nx / len);
        }
    }
    return 0;
}

// 35. Bit Block (Low-bit quantization)
function motifBitBlock(x, y, cx, cy, size, weight) {
    var dx = Math.abs(x - cx);
    var dy = Math.abs(y - cy);

    if (dx < size && dy < size) {
        // Quantize coordinates within the block
        var qx = Math.floor(x / 4) * 4;
        var qy = Math.floor(y / 4) * 4;
        var qseed = Math.floor(qx * 19 + qy * 23);
        if (safeMod(qseed, 10) < 4) return weight;
        return 0;
    }
    return 0;
}

// 36. Cellular Blocks (Blocky Voronoi / Camouflage noise)
function motifCellularBlocks(x, y, cells, cellSize) {
    if (!cells || cells.length === 0) return 0;

    // Quantize coordinates to create blocky/pixelated edges
    var qx = Math.floor(x / cellSize) * cellSize;
    var qy = Math.floor(y / cellSize) * cellSize;

    var minDist = Infinity;
    var closestWt = 0;

    for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        // Use Euclidean distance with quantized coordinates
        var dx = qx - c.cx;
        var dy = qy - c.cy;
        var dist = dx * dx + dy * dy;

        // Add a tiny bit of deterministic noise to break up boundaries naturally
        var noise = safeMod(Math.floor(qx * 13 + qy * 23), 100) / 100.0 * (cellSize * cellSize * 2);
        dist += noise;

        if (dist < minDist) {
            minDist = dist;
            closestWt = c.wt;
        }
    }

    return closestWt;
}

// ── STRUCTURAL ENHANCEMENTS (Architecture & Engineering) ──────────────────

// 36. Axonometric Plane (Isometric Projection Face with Shading & Variety)
function motifAxonPlane(x, y, cx, cy, w, h, angle, type, baseWt) {
    var dx = x - cx;
    var dy = y - cy;

    // Simple isometric skew
    var isoX, isoY;
    if (type === 0) { // Top
        isoX = (dx - dy) * 0.866;
        isoY = (dx + dy) * 0.5;
    } else if (type === 1) { // Left
        isoX = dx;
        isoY = dy - dx * 0.5;
    } else { // Right
        isoX = dx;
        isoY = dy + dx * 0.5;
    }

    if (Math.abs(isoX) < w / 2 && Math.abs(isoY) < h / 2) {
        // Expanded weight range based on type + position
        var shade = 1.0;
        if (type === 1) shade = 0.6;
        if (type === 2) shade = 0.3;

        // Internal edge gradient to add color depth
        var edgeDist = Math.min(w / 2 - Math.abs(isoX), h / 2 - Math.abs(isoY));
        var gradient = 0.8 + 0.2 * (edgeDist / 10);

        return baseWt * shade * Math.min(1.0, gradient);
    }
    return 0;
}

// 37. Drafting Mark (Technical symbols)
function motifDraftingMark(x, y, cx, cy, size, type) {
    var dx = Math.abs(x - cx);
    var dy = Math.abs(y - cy);
    var dist = Math.sqrt(dx * dx + dy * dy);

    if (type === 0) { // Plus/Cross hair
        if ((dx < 1.0 && dy < size) || (dy < 1.0 && dx < size)) return 1.0;
    } else if (type === 1) { // Circle
        if (Math.abs(dist - size) < 1.2) return 1.0;
    } else if (type === 2) { // Leader line / Arrow stub
        if (dx === dy && dx < size) return 1.0;
    }
    return 0;
}

// 38. Wire Trace (Orthogonal path with 45-deg corners)
function motifWireTrace(x, y, x1, y1, x2, y2, thickness) {
    // Orthogonal trace logic: go horizontal then vertical
    // For simplicity, check if x,y lies on the path (x1,y1) -> (x2,y1) -> (x2,y2)
    var onHoriz = Math.abs(y - y1) < thickness && ((x >= x1 && x <= x2) || (x >= x2 && x <= x1));
    var onVert = Math.abs(x - x2) < thickness && ((y >= y1 && y <= y2) || (y >= y2 && y <= y1));

    if (onHoriz || onVert) return 1.0;
    return 0;
}

// 39. ZigZag Trace
function motifTraceZigZag(x, y, x1, y1, x2, y2, freq, amp, thick) {
    // Basic line distance
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx * dx + dy * dy);
    if (len < 0.1) return 0;

    // Project point onto line
    var t = ((x - x1) * dx + (y - y1) * dy) / (len * len);
    if (t < 0 || t > 1) return 0;

    // Normal distance
    var nx = x - (x1 + t * dx);
    var ny = y - (y1 + t * dy);
    var dist = Math.sqrt(nx * nx + ny * ny);

    // Zig-zag offset
    // Sine wave approximation of zigzag:
    var phase = safeMod(t * len, freq * 2);
    var zz = Math.abs(phase - freq) / freq * amp * 2 - amp; // triangle wave from -amp to +amp

    // check distance to offset line
    if (Math.abs(dist - Math.abs(zz)) < thick) return 1.0;
    return 0;
}

// 40. Suprematist (Malevich-style geometric abstraction)
function motifSuprematist(x, y, cx, cy, type, size, rot, wt) {
    var dx = x - cx;
    var dy = y - cy;

    // Rotation
    var cos = Math.cos(-rot);
    var sin = Math.sin(-rot);
    var nx = dx * cos - dy * sin;
    var ny = dx * sin + dy * cos;

    if (type === 0) { // Square
        if (Math.abs(nx) < size / 2 && Math.abs(ny) < size / 2) return wt;
    } else if (type === 1) { // Circle
        if (Math.sqrt(nx * nx + ny * ny) < size / 2) return wt;
    } else if (type === 2) { // Long Rect / Beam
        if (Math.abs(nx) < size && Math.abs(ny) < size / 6) return wt;
    } else if (type === 3) { // Cross
        if ((Math.abs(nx) < size / 2 && Math.abs(ny) < size / 8) ||
            (Math.abs(ny) < size / 2 && Math.abs(nx) < size / 8)) return wt;
    }
    return 0;
}
