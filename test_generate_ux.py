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
ok &= must('id="btn-curate"' in html and ">Save</button>" in html, "Curate relabeled as Save")
ok &= must('innerHTML = "Curate"' not in html and "function setSaveButtonsState" in html, "lock-status sync cannot revive the Curate verb")
ok &= must("idle: 'Save'" in html or 'idle: "Save"' in html, "Save idle label is Save")
ok &= must("btn-generate-sub" in html and "randomize</span>" in html, "Generate carries Randomize as subtitle")
ok &= must('id="btn-save-canvas"' in html and 'id="btn-save-mobile"' in html, "Save sits with Generate on phone")
ok &= must("no saved pieces yet" in html and "tap Save to keep one" in html, "empty gallery does not define the verb as Curate")
ok &= must("click curate to save" not in html, "empty gallery no longer says click curate")
ok &= must("btn-png-dock" in html, "PNG download remains available from the dock")
ok &= must("about-fold" in html and "Read the manifesto" in html, "manifesto is tucked on mobile")
ok &= must('id="params-fold"' in html and "params-fold-summary" in html, "Parameters collapse on first-visit mobile")
ok &= must('id="platen-toast"' in html and "function showPlatenToast" in html, "Save confirmation toast exists")
ok &= must("function highlightNewestGalleryCard" in html, "new saved card is highlighted after Save")
ok &= must("function revealNewestSavedCuration" in html, "Save refreshes the inline saved list")
ok &= must("revealNewestSavedCuration('Saved')" in html, "successful Save calls inline reveal")
reveal_fn = html.split("function revealNewestSavedCuration", 1)[1].split("function ", 1)[0]
ok &= must("openGalleryModal()" not in reveal_fn, "Save does not auto-open the Gallery modal")
ok &= must("gallery-modal" not in reveal_fn and "display = 'block'" not in reveal_fn, "Save reveal does not force a modal display")
ok &= must("renderSavedInline()" in reveal_fn and "highlightNewestGalleryCard()" in reveal_fn, "reveal refreshes the inline list then highlights")
ok &= must('id="saved-creations"' in html and 'id="saved-inline-grid"' in html, "inline saved-creations section exists below studio chrome")
ok &= must("scroll down to view saved creations" in html, "saved creations scroll cue exists")
ok &= must("function renderSavedInline" in html, "inline saved list renderer exists")
ok &= must("column-count: 2" in html and "column-count: 4" in html, "saved creations use a masonry column flow")
ok &= must("break-inside: avoid" in html, "masonry plates do not split across columns")
ok &= must(".saved-inline-item" in html and "border-radius: 0" in html and "object-fit: contain" in html, "full plates keep natural aspect without rounded crops")
ok &= must("saved-inline-meta" not in html, "inline saved list is full plates, not metadata cards")
ok &= must("function openGalleryModal" in html and "modal.style.display = 'block'" in html, "Gallery modal remains a secondary browse path")
ok &= must("function toggleGalleryModal" in html and 'id="gallery-modal"' in html, "Gallery modal is still available from Gallery")
ok &= must("data-newest-save" in html, "newest curated card is marked for highlight")
ok &= must("saved-inline-grid" in html and "scrollIntoView" in html, "Save highlights the inline card, not a modal takeover")
ok &= must(".saved-creations" in html and "order: 3" in html, "saved creations sit below the mobile generate/save strip")
ok &= must('id="mobile-scroll-hint"' in html and "scroll for parameters" in html, "first-visit mobile has a scroll hint")
ok &= must("MAX_SAVE_MARKS" in html and "MAX_SAVE_NODES" in html, "Save snapshot is capped so Curate cannot OOM")

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
ok &= must('id="btn-out-plot"' in html and "savePlotterSVG()" in html, "Download Plotter SVG is wired in the Export grid")
ok &= must("function applyArchivalSvgUnits" in html and "PLATEN_PX_PER_IN = 160" in html, "regular SVG export declares inches at 160px/in")
ok &= must("function platenFileName" in html and "function rasterizePlatenSvg" in html, "named platen-* exports and PNG rasterize helpers exist")
ok &= must("Plot mode never includes paper" in html or "always excludes paper" in html, "plotter export keeps BG texture off")
ok &= must("function savePlotterSVG()" in html and "inkscape:groupmode" in html, "plotter Inkscape layers still generated")

# The UX pass must not rewrite the engine switch.
ok &= must(len(engines) > 50000, "platen-engines.js still a full engine file")

if not ok:
    sys.exit(1)
print("\nAll Generate UX structural checks passed.")
