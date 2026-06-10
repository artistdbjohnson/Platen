# Artyping (Mechanical Typewriter Art Technique)

This skill encodes the concrete, mechanical procedures of typewriter-based ornamental rendering as documented in Julius Nelson's *Artyping* (1940) and related manuals. It translates secretarial vernacular constraints into programmatic rendering operations.

---

## 1. Density Through Overstriking (Additive Compositing)

### Mechanical Procedure
Overstriking builds tonal ramps by striking the same cell multiple times, either with the same glyph or with a sequence of differing glyphs, without advancing the carriage (using the backspace key). 
- In physical typing: Strike first character ➔ backspace ➔ strike second character ➔ backspace ➔ strike third character.
- The ink layers additively to increase the stroke weight and visual density of the cell, closing open counter-spaces in the characters.

### Sequence & Glyph Mappings
Tonal ramps are constructed from specific glyph sets based on their ink coverage and counter-space preservation:

| Target Density | Composition Sequence | Cumulative Glyphs | Visual Result |
| :--- | :--- | :--- | :--- |
| **0 (Background)** | ` ` | (none) | Clean paper |
| **1 (Light)** | `.` | `.` | Fine stipple |
| **2 (Light-Medium)**| `,` ➔ `-` | `,` + `-` | Faux colon / textured dash |
| **3 (Medium)** | `i` ➔ `u` | `i` + `u` | Vertical/horizontal box cross |
| **4 (Medium-Heavy)**| `u` ➔ `i` ➔ `x` | `u` + `i` + `x` | Blocky lattice fill |
| **5 (Heavy/Solid)** | `m` ➔ `w` ➔ `o` ➔ `I` | `m` + `w` + `o` + `I` | Near-solid carbon black block |

### Rendering Engine Mapping
- **WebGL/SVG Layer:** Map to multiple `<path>` elements layered within the same cell coordinates.
- **Blending:** Render with additive opacity (or overlapping solid fills with subtle mechanical offsets to simulate strike variance).

---

## 2. Variable-Line-Spacer Fill (Vertical Sub-Character Positioning)

### Mechanical Procedure
Exploits the typewriter's variable line spacer (platen release clutch) to rotate the platen by fractional amounts instead of a full line space.
- In physical typing: Release platen clutch ➔ roll platen up/down fractionally (e.g., $1/2$ or $1/3$ line space) ➔ strike glyphs.
- This allows vertical character overlap, closing the horizontal white gaps between rows caused by standard line spacing.

### Sequence & Glyph Mappings
- **Glyphs:** Fills typically use flat-topped or wide glyphs like `m`, `w`, `-`, `_`, or `x`.
- **Vertical Offset:** $\Delta y = \pm 0.5 \times \text{cellHeight}$ (for half-spacing) or $\Delta y = \pm 0.33 \times \text{cellHeight}$ (for fine fills).

### Rendering Engine Mapping
- Translate the rendering target $y$-coordinate: $y_{render} = y_{row} \times \text{sizeY} + \delta y$ where $\delta y \in \{ -0.5, -0.33, 0.33, 0.5 \} \times \text{sizeY}$.
- Must bypass standard grid row ceilings in layout constraints.

---

## 3. Half-Spacing (Horizontal Sub-Character Positioning)

### Mechanical Procedure
Uses half-space mechanisms (holding the spacebar down halfway while striking, or using a dedicated half-space key) to shift the horizontal coordinate of a strike.
- In physical typing: Depress spacebar halfway ➔ strike character ➔ release.
- This allows characters to be squeezed horizontally or placed at a diagonal angle steeper than the standard column width allows.

### Sequence & Glyph Mappings
- **Glyphs:** Diagonals use `/`, `\`, `l`, or `x`. Smooth curves use `(`, `)`, `c`, or `o`.
- **Horizontal Offset:** $\Delta x = \pm 0.5 \times \text{cellWidth}$.

### Rendering Engine Mapping
- Translate the rendering target $x$-coordinate: $x_{render} = x_{col} \times \text{sizeX} + \delta x$ where $\delta x \in \{ -0.5, 0.5 \} \times \text{sizeX}$.
- Resolves spacing collisions by allowing overlap at sub-grid offsets.

---

## 4. Shading by Distance (Halftone/Dithering Principle)

### Mechanical Procedure
Building variable spatial density of characters across a region so that the viewer's eye resolves the discrete glyph patterns into a continuous tonal gradient when viewed at a distance.
- In physical typing: Distributing character density (e.g., using `.` for light, `x` for medium, `m` for dark) in structured arrays or varying clusters.

### Sequence & Glyph Mappings
- **Stippled Shade:** Sparse grids of `.` or `,`.
- **Linear Shade:** Alternating vertical lines of `l` or `i` separated by spaces.
- **Cross-Hatched Shade:** Grids of `x` or `/` combined with `\`.

### Rendering Engine Mapping
- Convert local grayscale weights into spatial density variations using dithering matrices (e.g., Bayer or Floyd-Steinberg) that select glyph representation or cluster size rather than simple local glyph swaps.

---

## 5. Border, Ornament, and Lettering Construction

### Border and Ornament Construction
Repeating sequences of character primitives to construct geometric enclosing boxes, page borders, and decorative dividers:
- **Horizontal Borders:** E.g., `mwmwmw`, `o-o-o-o`, `/ \ / \ / \`.
- **Vertical Borders:** E.g., repeating `I`, `x` overtyped with `o`, or `H` stacked vertically.
- **Diagonal Corners:** Emulated using diagonal strokes `/` or `\` offset by half-spacing.

### Cut-Out/Silhouette Technique
Creating shapes by typing character sequences that form sharp outlines, then filling the interior using high-density overstrikes, leaving the negative space completely blank.

### Lettering Systems (Vernacular Alphabets)
Building large display letterforms out of standard monospace keys:
- **Block Letters:** Built using grids of capital `M`, `H`, or `W`.
- **Serif Imitations:** Adding dashes `-` or underscores `_` at the top and bottom terminations of block structures built of vertical bars `I` or `l`.
