# Artyping (Mechanical Typewriter Art Technique)

This skill encodes the concrete, mechanical procedures of typewriter-based ornamental rendering as documented in Julius Nelson's *Artyping* (1940) and Edgar A. Flanagan's *A Treatise on Ornamental Typewriting* (1938, Gregg Publishing). It translates secretarial vernacular constraints into programmatic rendering operations.

---

## 1. Density Through Overstriking (Blended / Multi-Lettered Layering)

### Mechanical Procedure
Overstriking builds tonal ramps and composite decorative motifs by striking different glyphs sequentially in the same cell (without carriage advance) to create "blended" units.
- In physical typing: Strike character A ➔ backspace ➔ strike character B.
- First documented overlay: The hyphen-period border, represented as formula `- .` (strike a line of hyphens, return carriage without line feed, strike periods over them).

### Sequence & Glyph Mappings
Tonal ramps and border units are constructed from specific overlays:

| Target Density / Ornament | Composition Sequence | Cumulative Glyphs | Mechanical Formula |
| :--- | :--- | :--- | :--- |
| **0 (Background)** | ` ` | (none) | Clean paper |
| **1 (Light)** | `.` | `.` | `.` |
| **2 (Blended Light)** | `-` ➔ `.` | `-` + `.` | `- .` (Hyphen-Period) |
| **3 (Diagonal Textured)**| `_` ➔ `/` | `_` + `/` | `_ /` (Underscore-Slash) |
| **4 (Medium Lattice)** | `i` ➔ `u` | `i` + `u` | `i u` |
| **5 (Solid Block)** | `m` ➔ `w` ➔ `o` ➔ `I` | `m` + `w` + `o` + `I` | `m w o I` |

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

## 5. Composition Layout & Typographic Display Rules

### The Optical Center Principle
- Any centered matter on the page must rest slightly above the mathematical center (placed at the **optical center**), otherwise it will visually appear to be too low.
- Vertical offset: Shift centered blocks upward by approximately $5\%$ of total page height.

### Typographic Indentions
The four classical styles of ornamental layout indention:
1. **Hanging Indention:** First line full width, subsequent lines indented at left.
2. **Squared Indention:** Block margins completely square.
3. **Diagonal Indention:** Each sequential line indented further than the previous line.
4. **Half Diamond Indention (Inverted Pyramid):** Lines centered and progressively narrower.

### Boxed Side Headings
- Headings placed inline with text blocks, enclosed with a border box (e.g., repeating asterisks `*` or colons `:`), maintaining vertical column alignment with the body margin.
