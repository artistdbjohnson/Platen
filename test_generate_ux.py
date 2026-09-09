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
can = re.search(r'<button[^>]+id="btn-generate-canvas"[^>]*>', html)
ok &= must(gen and 'onclick="generateNewPiece()"' in gen.group(0), "desktop Generate kicks generation then scrolls to studio")
ok &= must(mob and 'onclick="generateNewPiece()"' in mob.group(0), "mobile Generate kicks generation then scrolls to studio")
ok &= must(can and 'onclick="generateNewPiece()"' in can.group(0), "sticky canvas Generate kicks generation then scrolls to studio")

ok &= must("function randomize()" in html, "randomize() engine hook unchanged")
ok &= must("function regenerate()" in html, "regenerate() engine hook unchanged")
ok &= must("function generateNewPiece()" in html, "Generate buttons go through generateNewPiece()")
ok &= must("function scrollStudioIntoView()" in html, "studio scroll helper exists")
gen_new = html.split("function generateNewPiece", 1)[1].split("function ", 1)[0]
ok &= must("randomize()" in gen_new and "scrollStudioIntoView()" in gen_new, "generateNewPiece randomizes then scrolls")
ok &= must("openGalleryModal" not in gen_new and "gallery-modal" not in gen_new, "Generate scroll does not open a gallery modal")
ok &= must("showPlatenToast" not in gen_new, "Generate scroll does not open a toast")
scroll_studio = html.split("function scrollStudioIntoView", 1)[1].split("function ", 1)[0]
ok &= must("scrollIntoView" in scroll_studio, "studio helper uses calm scrollIntoView")
ok &= must("studio-canvas" in scroll_studio or "col-canvas" in scroll_studio, "studio helper targets the canvas / generate chrome")
ok &= must('id="studio-canvas"' in html, "canvas column is the studio scroll target")
ok &= must('onclick="generateNewPiece()"' in html and html.count('onclick="generateNewPiece()"') == 3, "exactly the three Generate buttons scroll back to studio")
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
ok &= must("about-fold" in html and ">About</summary>" in html, "about fold is labeled About")
ok &= must("Read the manifesto" not in html, "manifesto summary label is gone")
ok &= must(not re.search(r'manifesto', html, re.I), "no user-facing manifesto copy remains")
about_summary_css = re.search(r'\.about-fold-summary \{([^}]+)\}', html)
ok &= must(
    about_summary_css and "display: none" not in about_summary_css.group(1) and "display: flex" in about_summary_css.group(1),
    "About summary is a visible tappable control on desktop and mobile",
)
desktop_unfold = re.search(r'@media \(min-width: 901px\) \{(.*?)\n        \}', html, re.S)
ok &= must(bool(desktop_unfold), "desktop unfold media query exists")
if desktop_unfold:
    ok &= must(
        ".about-fold" not in desktop_unfold.group(1) and ".about-fold-body" not in desktop_unfold.group(1),
        "desktop does not unwrap About into an always-open manifesto column",
    )
sync_fn = html.split("function syncAdvancedFold", 1)[1].split("function ", 1)[0]
ok &= must(
    "about-fold" not in sync_fn,
    "resize sync does not force About open on desktop",
)
ok &= must('id="params-fold"' in html and "params-fold-summary" in html, "Parameters collapse on first-visit mobile")
ok &= must('id="platen-toast"' not in html and "function showPlatenToast" not in html, "floating Saved toast is removed")
ok &= must("function highlightNewestGalleryCard" in html, "new saved card is highlighted after Save")
ok &= must("function revealNewestSavedCuration" in html, "Save refreshes the inline saved list")
ok &= must("revealNewestSavedCuration('Saved')" in html, "successful Save calls inline reveal")
reveal_fn = html.split("function revealNewestSavedCuration", 1)[1].split("function ", 1)[0]
ok &= must("openGalleryModal" not in reveal_fn and "gallery-modal" not in reveal_fn, "Save reveal never mentions a gallery modal")
ok &= must("showPlatenToast" not in reveal_fn, "Save reveal does not show a toast over masonry")
ok &= must("renderSavedInline()" in reveal_fn and "highlightNewestGalleryCard()" in reveal_fn, "reveal refreshes the inline list then highlights")
ok &= must('id="saved-creations"' in html and 'id="saved-inline-grid"' in html, "inline saved-creations section exists below studio chrome")
ok &= must("scroll down to view saved creations" not in html, "scroll-down cue is gone")
ok &= must("function updateSavedCount" in html and "1 saved" in html, "saved creations cue is a count")
ok &= must("function renderSavedInline" in html, "inline saved list renderer exists")
ok &= must("function captureInlinePlatePreview" in html and "previews: previews" in html, "Save stores a full-plate preview for the masonry")
ok &= must("saved-masonry-col" in html and "function savedMasonryColumnCount" in html, "saved creations pack into waterfall columns")
ok &= must("align-items: flex-start" in html, "masonry columns keep natural heights instead of equal rows")
ok &= must("savedMasonryColumnCount" in html and ">= 901" in html, "desktop masonry uses more columns than phone")
ok &= must("Math.min(savedMasonryColumnCount()" in html, "masonry does not keep an empty last column")
ok &= must(".saved-inline-item" in html and "border-radius: 0" in html and "object-fit: contain" in html, "full plates keep natural aspect without rounded crops")
ok &= must("saved-inline-meta" not in html, "inline saved list is full plates, not metadata cards")
ok &= must("saved-inline-remove" not in html, "masonry plates have no boxed X delete overlays")
render_fn = html.split("function renderSavedInline", 1)[1].split("function ", 1)[0]
ok &= must("openSavedSolo" in render_fn, "clicking a masonry plate opens the solo viewer")
ok &= must("saved-inline-remove" not in render_fn and "✕" not in render_fn, "masonry renderer does not paint delete overlays")
ok &= must('id="saved-solo"' in html and "function openSavedSolo" in html and "function closeSavedSolo" in html, "solo plate viewer exists")
ok &= must("saved-solo-backdrop" in html and "saved-solo-plate" in html, "solo viewer is one plate on a dark backdrop")
ok &= must("saved-solo-download" in html and "saved-solo-remove" in html and "saved-solo-close" in html, "solo chrome is close, download, and remove")
ok &= must('id="gallery-modal"' not in html and 'id="gallery-detail-modal"' not in html, "gallery modal and gallery viewer surfaces are removed")
ok &= must("gallery viewer" not in html, "gallery viewer header chrome is gone")
ok &= must("function openGalleryModal" not in html and "function toggleGalleryModal" not in html, "Gallery no longer opens a second surface")
ok &= must("function openGalleryDetail" not in html and "function closeGalleryDetail" not in html, "gallery viewer functions are deleted")
ok &= must("function renderGalleryGrid" not in html and "downloadGalleryPNG" not in html, "modal gallery grid and viewer downloads are gone")
ok &= must("function scrollToSavedCreations" in html and 'onclick="scrollToSavedCreations()"' in html, "Gallery control only scrolls to the inline masonry")
ok &= must("openGalleryDetail" not in html, "masonry plates cannot open a gallery viewer")
ok &= must("data-newest-save" in html, "newest curated card is marked for highlight")
ok &= must("saved-inline-grid" in html and "scrollIntoView" in html, "Save highlights the inline plate, not a modal takeover")
def css_order(block, selector):
    m = re.search(rf'{re.escape(selector)}\s*\{{[^}}]*\border:\s*(\d+)', block)
    return int(m.group(1)) if m else None


mobile_stack = re.search(r'@media \(max-width: 900px\) \{(.*?)\n        \}', html, re.S)
ok &= must(bool(mobile_stack), "mobile stack media query exists")
if mobile_stack:
    stack = mobile_stack.group(1)
    canvas_ord = css_order(stack, ".col-canvas")
    strip_ord = css_order(stack, ".canvas-generate-strip")
    controls_ord = css_order(stack, ".col-controls")
    saved_ord = css_order(stack, ".saved-creations")
    ok &= must(canvas_ord == 1 and strip_ord == 2, "mobile canvas then Generate/Save strip")
    ok &= must(controls_ord == 4, "mobile params and more-controls stay in the menu chrome")
    ok &= must(
        saved_ord is not None and saved_ord > controls_ord,
        "saved masonry starts after Parameters / More controls",
    )
ok &= must("position: sticky" in html and "canvas-generate-strip" in html, "Generate/Save strip stays sticky")

# Late mobile repair must win over the desktop 100dvh column heights.
col_about_100 = list(re.finditer(r'\.col-about\s*\{[^}]*height:\s*100dvh', html, re.S))
col_controls_100 = list(re.finditer(r'\.col-controls\s*\{[^}]*height:\s*100dvh', html, re.S))
ok &= must(bool(col_about_100) and bool(col_controls_100), "desktop about/controls still use 100dvh")
late_mobile_queries = list(re.finditer(r'@media \(max-width: 900px\) \{', html))
ok &= must(len(late_mobile_queries) >= 3, "a late mobile stack-repair media query exists")
if late_mobile_queries and col_about_100:
    last_mobile = html[late_mobile_queries[-1].start(): late_mobile_queries[-1].start() + 2800]
    last_about_100_at = col_about_100[-1].start()
    last_mobile_at = late_mobile_queries[-1].start()
    ok &= must(last_mobile_at > last_about_100_at, "mobile height:auto repair comes after desktop 100dvh")
    ok &= must(".col-about" in last_mobile and "height: auto" in last_mobile, "late mobile query resets about/controls to height:auto")
    ok &= must("flex-shrink: 0" in last_mobile, "mobile stack children do not shrink inside the 100dvh scrollport")
    ok &= must("min-height: 64px" in last_mobile, "sticky Generate has room for the randomize subtitle")
    ok &= must(".btn-generate-sub" in last_mobile and "line-height: 1.2" in last_mobile, "randomize subtitle has its own line-height")
    ok &= must(".saved-creations-head" in last_mobile and "background: var(--bg)" in last_mobile, "saved header sits on an opaque background")
    ok &= must(".about-fold-summary" in last_mobile and "background: var(--bg)" in last_mobile, "About summary sits on an opaque background")
    ok &= must("[data-tooltip]::after" in last_mobile and "display: none" in last_mobile, "mobile tooltips cannot stick over About")
ok &= must(".btn-generate-sub" in html and "line-height: 1.2" in html, "Generate subtitle line-height is set")
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
