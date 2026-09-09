#!/usr/bin/env python3
"""Structural checks for the Platen Generate / mobile UX pass."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
engines = (ROOT / "js" / "platen-engines.js").read_text(encoding="utf-8")


def must(cond, msg):
    if not cond:
        print("FAIL:", msg)
        return False
    print("OK:  ", msg)
    return True


ok = True

ok &= must('id="btn-generate"' in html, "desktop Generate button exists")
ok &= must('id="btn-generate-mobile"' in html, "mobile Generate button exists")
ok &= must('id="btn-randomize"' in html, "Randomize control preserved")
ok &= must('id="btn-regen"' in html, "Regenerate control preserved")
ok &= must(html.count('id="btn-generate"') == 1, "desktop Generate id is unique")
ok &= must(html.count('id="btn-generate-mobile"') == 1, "mobile Generate id is unique")
ok &= must(html.count('id="btn-randomize"') == 1, "Randomize id is unique")
ok &= must(html.count('id="btn-regen"') == 1, "Regenerate id is unique")

gen = re.search(r'<button[^>]+id="btn-generate"[^>]*>', html)
mob = re.search(r'<button[^>]+id="btn-generate-mobile"[^>]*>', html)
ok &= must(gen and 'onclick="randomize()"' in gen.group(0), "desktop Generate calls randomize()")
ok &= must(mob and 'onclick="randomize()"' in mob.group(0), "mobile Generate calls randomize()")

ok &= must("function randomize()" in html, "randomize() engine hook unchanged")
ok &= must("function regenerate()" in html, "regenerate() engine hook unchanged")
ok &= must("TRAITS.symmetry = SYMMETRY_OPTS" in html, "randomize still picks new parameters")
ok &= must("RENDER_SEED = Math.floor(Math.random()" in html, "seed roll still happens")

ok &= must("class=\"btn-generate\"" in html or "class='btn-generate'" in html or "class=\"btn-generate\"" in html, "primary generate class present")
ok &= must("canvas-generate-strip" in html and 'id="btn-generate-canvas"' in html, "canvas-adjacent Generate strip exists")
ok &= must("position: sticky" in html and "canvas-generate-strip" in html, "phone Generate is sticky-top next to the canvas")
ok &= must("min-height: 52px" in html, "mobile generate touch target is at least 52px")
ok &= must("min-height: 44px" in html, "secondary / form controls have 44px targets")
ok &= must("advanced-fold" in html and "More controls" in html, "advanced controls are secondary on mobile")
ok &= must("New seed: same parameters, new seed." in html, "Regenerate relabeled as New seed")
ok &= must("Save to gallery" in html, "Curate relabeled as Save to gallery")
ok &= must("btn-png-mobile" in html and "btn-png-dock" in html, "PNG download sits next to Generate")
ok &= must("about-fold" in html and "Read the manifesto" in html, "manifesto is tucked on mobile")

ok &= must("0.082" in html and "10 CPI" in html and "6 LPI" in html, "Olympia SM3 specs still documented")
ok &= must("function calcMotifWeight" in engines, "motif weight path still present")
ok &= must("function engineRadialWave" in engines and "switch (engine)" in engines, "engines file still contains generative cases")
ok &= must("function _budgetIsoExtrusions" in html, "isometric SVG node budget exists")
ok &= must("MAX_LIVE_SVG_NODES" in html and "MAX_ISO_STEPS_PER_GLYPH" in html, "live SVG caps are defined")
ok &= must("createElementNS(svgNS, \"use\")" in html or "createElementNS(svgNS, 'use')" in html, "repeated motifs use SVG <use> to cut memory")
ok &= must("SVG serialize skipped" in html, "oversized SVG rasterize is guarded")
ok &= must("MAX_RASTERIZE_NODES" in html, "Image-decode rasterize has a lower cap than live SVG")
ok &= must("overflow-x: visible" in html and "flex-wrap: wrap" in html, "mobile btn-group wraps instead of hidden-scroll")
ok &= must("Aw, Snap" in html or "SIGKILL" in html, "crash root cause is documented next to the budget")

# Iso-step sampler must keep column height while capping node count.
def sample_iso(steps, max_steps):
    if len(steps) <= max_steps:
        return steps
    out = []
    last = len(steps) - 1
    for si in range(max_steps):
        idx = round(si * last / (max_steps - 1))
        if not out or out[-1] != steps[idx]:
            out.append(steps[idx])
    return out

tall = list(range(90))
sampled = sample_iso(tall, 16)
ok &= must(len(sampled) <= 16 and sampled[0] == 0 and sampled[-1] == 89, "iso sampler keeps first/last and stays at 16 steps")

# The UX pass must not rewrite the engine switch.
ok &= must(len(engines) > 50000, "platen-engines.js still a full engine file")

if not ok:
    sys.exit(1)
print("\nAll Generate UX structural checks passed.")
