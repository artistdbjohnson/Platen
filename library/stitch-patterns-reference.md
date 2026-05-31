# Stitch Patterns Reference Library

**Source:** `C:\Work\Douglxss\Douglxss Projects\Antigravity\Larkspurs\stitch Patterns.pdf`  
**Added:** 2026-02-18  
**Purpose:** Pattern vocabulary for Larkspur Quine engine — to be used as inspiration for PRNG-driven geometric pattern generation.

---

## Intent

The stitch patterns in this PDF are the reference vocabulary for building our own pattern library. The goal is to blend these patterns the same way the Quine engine blends its line segments, pole attractors, and rectangles — using the PRNG to select, weight, and combine pattern primitives.

## Pattern Types to Implement

Based on common embroidery/stitch pattern vocabularies, the following pattern primitives map well to the Quine engine's `lns` (line segments), `pls` (pole attractors), and `rts` (rectangles):

### Geometric Primitives (→ `lns` bands)
- **Chevron / Herringbone** — alternating diagonal bands, axis-flipping at midpoint
- **Diamond / Argyle** — crossing diagonal bands at 45°, creates diamond lattice
- **Stripe / Tartan** — parallel bands at regular intervals, both axes
- **Wave / Ripple** — sinusoidal band offsets (approximate with stepped lns)
- **Brick / Offset** — staggered horizontal bands with half-step offset per row

### Attractor Patterns (→ `pls` poles)
- **Radial / Sunburst** — poles at center pulling outward
- **Vortex** — poles offset from center creating spiral pull
- **Corner anchors** — poles at 4 corners creating pinched field

### Fill Patterns (→ `rts` rectangles)
- **Medallion** — large central rectangle with smaller corner fills
- **Border** — thin rectangles along edges
- **Scattered** — random small rectangles across field

---

## Implementation Plan

In `larkspur-quine.html`, the `patPRNG` already generates `lns` randomly. Next steps:

1. **Named pattern presets** — encode the above as named `lns` templates
2. **Pattern blending** — mix 2-3 named patterns using weighted PRNG selection
3. **Stitch-inspired weights** — use the PDF's specific patterns as `lns` weight values

## PDF Location
`C:\Work\Douglxss\Douglxss Projects\Antigravity\Larkspurs\stitch Patterns.pdf`

> **Note:** PDF could not be auto-read (binary compressed). User to provide screenshots of specific patterns to implement. Screenshots can be dropped into chat for direct analysis.
