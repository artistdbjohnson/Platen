const fs = require('fs');

let lines = fs.readFileSync('larkspur.html', 'utf8').split('\n');

// Arrays are 0-indexed, so line N is lines[N-1]
// We delete from bottom to top to preserve indices of earlier targets

// 4. Delete PRNG, motifs, calcMotifWeight, generatePatternParams (Lines 1129-2200)
lines.splice(1128, 2200 - 1129 + 1);

// 3. Delete CHROME_DESCS and ENGINE_DESCS (Lines 999-1025)
lines.splice(998, 1025 - 999 + 1);

// 2. Delete SYMMETRY_OPTS through CANVAS_OPTS (Lines 947-952)
lines.splice(946, 952 - 947 + 1);

// 1. Delete PALETTES and PEN_MAP (Lines 448-937)
lines.splice(447, 937 - 448 + 1);

// Inject script tags right before the main <script> tag (Line 389 originally, meaning index 388)
lines.splice(388, 0,
    '    <script src="js/larkspur-core.js"></script>',
    '    <script src="js/larkspur-motifs.js"></script>',
    '    <script src="js/larkspur-engines.js"></script>'
);

fs.writeFileSync('larkspur.html', lines.join('\n'));
console.log('Successfully spliced larkspur.html');
