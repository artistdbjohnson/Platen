# Larkspur: Generative Art Engine Skill File

This document defines the specialized developmental skill and operational protocol for **Larkspur**, a high-fidelity generative art engine built for vintage typewriter emulation, geometric halftoning, and physical pen plotting (Axidraw). 

This file serves as a permanent, absolute manual for developers and AI coding agents to preserve the mathematical, physical, and aesthetic integrity of the Larkspur engine across all future feature additions and refactors.

---

## 1. Core Codebase Architecture

The Larkspur project is organized into modular files designed for high performance, concurrent worker execution, and robust SVG output formatting:

* **[index.html](file:///c:/Work/Douglxss/Douglxss%20Projects/Antigravity/Larkspurs/index.html)** — The main user interface, control panel, viewport renderer, and coordinator. Contains:
  * Responsive CSS styling for grid and banner layouts (including US Letter `8.5x11` at 8.5/11 aspect ratios).
  * SVG construction logic, manual grid number generation, and DocumentFragment swap mechanics.
  * Worker Pool Coordinator (spawns and reuse of concurrent background workers).
  * Shortening algorithms for engine metadata labels (5-letter truncation dicts).
* **[js/larkspur-core.js](file:///c:/Work/Douglxss/Douglxss%20Projects/Antigravity/Larkspurs/js/larkspur-core.js)** — The shared core configuration database. Contains:
  * `PALETTES` — Master color plates with relative frequency ratios.
  * `MOTIF_PATHS` — High-fidelity SVG path representations for standard motifs (quatrefoil, tatreez, ichthus, typewriter dot, typewriter x, typewriter hash).
  * Pen mapping lookup lists matching hex colors to physical plotter pens (e.g., Faber-Castell 199 Black, 223 Dark Red, 156 Cobalt Green, 188 Sanguine, etc.).
* **[js/larkspur-worker.js](file:///c:/Work/Douglxss/Douglxss%20Projects/Antigravity/Larkspurs/js/larkspur-worker.js)** — Web Worker script executing CPU-heavy generative mathematics. Computes:
  * Hyperbolic space warps, coordinate perturbations, and multi-axis symmetries (glide, kaleidoscope, radial, etc.).
  * Jitter and deterministic dither scatter algorithms.
  * Density distribution normalization mapping.
* **[js/larkspur-engines.js](file:///c:/Work/Douglxss/Douglxss%20Projects/Antigravity/Larkspurs/js/larkspur-engines.js)** — Generative scalar field math routines (`calcMotifWeight`) that drive visual layouts (e.g., `circuit`, `river_flow`, `flowing_contours`, `kente`, etc.).
* **[js/larkspur-recorder.js](file:///c:/Work/Douglxss/Douglxss%20Projects/Antigravity/Larkspurs/js/larkspur-recorder.js)** — Dynamic DOM canvas recorder capturing visual animations.
* **[js/larkspur-animate.js](file:///c:/Work/Douglxss/Douglxss%20Projects/Antigravity/Larkspurs/js/larkspur-animate.js)** — Orchestrates smooth transitions and interactive micro-animations in the UI.

---

## 2. The Typewriter Engine: Mathematical & Physical Rules

The `typewriter` motif emulates a mechanical typewriter creating high-fidelity generative halftone art. Because these SVGs are directly compiled into vector paths for physical pen plotting, **strict rules must never be violated**:

### Rule 2.1 — Absolute Font Size Lock (The 11pt Directive)
> [!IMPORTANT]
> **NEVER MODIFY THE TYPEWRITER HEADER FONT-SIZE.**
> The typewriter header `<text>` elements in `index.html` must remain strictly locked at a static, unscaled **`11pt`** in SVG user space:
> ```javascript
> textEl.setAttribute("font-size", "11pt");
> ```
> * **Why:** When plotting via an Axidraw, the plotter interprets coordinates as physical dimensions. Scaling this value in code ruins physical character pitch parity, destroying the authentic vintage look of real typewritten characters on a page.
> * **Visual Screen Scaling:** While the inline SVG attribute is locked at `"11pt"` to preserve physical plot parity, layout-specific CSS overrides inside the dashboard's `<style>` block visually scale the text on screen. This guarantees that on your browser viewport, the typewriter header appears at a perfectly consistent visual height regardless of whether standard grid `39x51` or `8.5x11` is active!

### Rule 2.2 — Layout Mathematics & Margins
Typewriter art supports two main layouts, which must perfectly map characters to horizontal columns (Characters Per Inch - CPI) and vertical lines (Lines Per Inch - LPI):

1. **Standard Grid (`grid_39_51`):**
   * Grid dimensions: `w = 39`, `h = 51`.
   * Cell sizing: `sizeX = 16`, `sizeY = 16` (Square cells).
2. **US Letter (`grid_us_letter`):**
   * Emulates a physical **8.5" x 11"** sheet at standard Pica typewriter settings (10 CPI, 6 LPI) with `0.4"` margins:
   * Grid dimensions: `w = 77` columns (7.7 inches printable width), `h = 58` lines.
   * Total SVG dimensions: `85` total columns width, `66` total lines height (Margins = `4` columns on left/right, `4` columns on top/bottom).
   * Cell sizing: **`sizeX = 16`** (10 CPI character spacing), **`sizeY = 26.6667`** (6 LPI vertical line spacing).
   * **Why:** Real typewriters have rectangular character boxes (taller than they are wide). `sizeY = 26.6667` maintains the exact mechanical vertical feed advance relative to character width!

### Rule 2.3 — Halftone Density Thresholds
Typewriter shading operates on a 3-tier halftone impact layout driven by the localized scalar density field `f.wt`:

| Halftone Class | Glyph | Density Range | Mechanical Description |
| :--- | :---: | :---: | :--- |
| **IMPACT: LIGHT** | `.` | `0.20` to `0.50` | Dot Halftone (faint background shading) |
| **IMPACT: MEDIUM** | `X` | `0.50` to `0.80` | Cross Halftone (mid-tone fill) |
| **IMPACT: HEAVY** | `#` | `0.80` to `1.00` | Hash Halftone (dense ink overlap shadow) |

* Densities below `0.20` are skipped completely, allowing the textured paper backing (canvas) to breathe through.

### Rule 2.4 — Pure Carbon Black Monochrome Palette
The `typewriter_black` palette is dedicated to pure, high-fidelity monochrome plotting:
* It must consist **entirely** of neutral carbon black/grey shades (`#1D1D1D`, `#111111`, `#333333`, `#121212`).
* **NO RED OR BROWN ACCENTS ARE ALLOWED** in the monochrome palette. The weathered carbon bleed accent must be `#121212`, which translates physically to a single deep black pen (e.g. Faber-Castell 199) for all glyph layers, eliminating unneeded pen changes on the Axidraw.

---

## 3. Metadata Header Layout & Alignment

Every typewriter render generates an authentic 8-line vintage telemetry header at the top of the canvas. The header rows must align cleanly across all layouts:

1. **Title (Line 1):** Centered and padded dynamically using `·` separators to span exactly from column `1` to column `w`.
2. **Impact Legend (Lines 2, 3, 4):** Left-aligned, detailing the typewriter halftone classes.
    * Legend content is responsive:
     * Wide layouts (`w >= 44`): Full renamed format (`LEVEL 1      GLYPH  .   DENSITY 0.20    TO 0.50`).
     * Standard layouts (`w < 44`): Standard renamed format (`LEVEL 1  GLYPH .  DENSITY 0.20  TO 0.50`).
     * Compact layouts (`w < 38`): Compact renamed format (`L1   GLYPH .   DEN 0.20 - 0.50`).
3. **Empty Spacing (Lines 5, 6, 7):** Blank rows to mimic traditional paper margins.
4. **Telemetry Line (Line 8):** Bottom metadata displaying `DATE`, `ENGINE`, `SYMMETRY`, and `INK` (Chrome).
   * Engine name must be formatted using a strict **5-letter dictionary truncation** (e.g. `circuit` ➔ `CRCIT`, `mastor` ➔ `MASTR`, `axonometric` ➔ `AXNMT`) to ensure it fits perfectly inside narrow layouts without clipping.

---

## 4. Axidraw Physical Pen Mapping Protocol

When rendering SVGs for plotter consumption, Larkspur maps hex colors to physical Faber-Castell and Sakura Gelly Roll pens:

| Hex Color | Color Name | Physical Pen Equivalent | Chrome Usage |
| :---: | :--- | :--- | :--- |
| **`#1D1D1D`** | Carbon Black | Faber-Castell 199 Black | Standard Typewriter Black |
| **`#121212`** | Stark Deep Black | Faber-Castell 199 Black | Monochrome Weathered Bleed |
| **`#7C2A24`** | Red Carbon | Faber-Castell 223 Dark Red | Bi-Color Ribbon Accent |
| **`#1B4D3E`** | Carbon Teal | Faber-Castell 156 Cobalt Green | Ribbon Color Accent |
| **`#8D5B4C`** | Aged Sepia | Faber-Castell 188 Sanguine | Ribbon Color Accent |
| **`#4E3629`** | Walnut Brown | Faber-Castell 177 Walnut Brown | Tan Grid Numbers & Ribbon Bleed |

---

## 5. Developer Workflow & Release Checklist

Before committing any modifications or creating tags in the Larkspur repository, you **MUST** run this validation checklist:

- [ ] **Typewriter Font Size:** Verify that `index.html` line setting `font-size` for typewriter text is exactly `"11pt"`.
- [ ] **Indentation Integrity:** Ensure all SVGs are generated with precise, clean indentation to prevent rendering glitches on high-resolution displays.
- [ ] **Monochrome Color Checks:** Open `js/larkspur-core.js` and verify that the `typewriter_black` palette contains zero warm/red colors. The bleed must remain `#121212`.
- [ ] **Label Length Limiters:** Test with a small viewport (`w = 32`). Verify that both the engine labels and the impact legends wrap or truncate cleanly without clipping or text overlapping.
- [ ] **Worker Concurrent Safety:** Verify that worker pool creation does not leak active worker references. When resetting the grid, always call `WorkerPool.push(worker)` to prevent process accumulation.

---

## 6. Recent Development History (May 2026)

This section documents key design interventions and fixes implemented in **May 2026** (Conversation ID: `0bd57f00-6c52-469d-8746-907ade254cd9`) to maintain continuity across future agent sessions:

### 6.1 — The Typewriter 11pt Font Size Lock
* **Intervention:** Re-established and locked the raw inline `<text>` font-size at `11pt` in SVG user space for both the standard grid (`39x51`) and US Letter (`8.5x11`) typewriter views.
* **Rationale:** Preserves 1:1 physical plotter character grid dimensions when parsed by the Axidraw pen plotter. Screen responsiveness is handled dynamically via CSS overrides.

### 6.2 — Preservation of Organic Layouts (Straightening Revert)
* **Intervention:** Reverted straightening edits of typewriter line vectors to the original organic state.
* **Rationale:** The organic, imperfect alignment of typewritten text lines is highly intentional and essential to emulating genuine vintage mechanical typewriters. Straightening destroyed this authentic visual aesthetic. 

### 6.3 — dummy Commit Vercel Deploy Triggering
* **Intervention:** Leveraged a forward-advancing harmless comment commit (`d9a6f39`) to trigger Vercel rebuilds.
* **Rationale:** Hard Git pointer rollbacks (force-pushes) do not trigger Vercel GitHub webhooks. Forward-advancing dummy commits ensure instant automated deployments.

### 6.4 — Aspect-Ratio-Preserving PNG & Triptych Export Clipping Fix
* **Intervention:** Resolved top-edge clipping of the telemetry header text (`L A R K S P U R ...`) during PNG and Triptych image downloads.
* **Mechanics:** 
  1. Clones the SVG element inside `savePNG` and `saveTriptych` during export.
  2. Wraps all cloned SVG child elements in a `<g transform="translate(0, 16)">` translated group.
  3. This shifts the entire layout down by `16px` only inside the image viewport, giving the top header text perfect clearance and 100% preventing any clipping without changing the actual page layout, aspect ratio, or physical plotting coordinates.

