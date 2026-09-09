#!/usr/bin/env python3
"""Structural checks for the Motus / PlatenHyperspeed animation system."""

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent
html = (ROOT / "index.html").read_text(encoding="utf-8")


def must(cond, msg):
    if not cond:
        print("FAIL:", msg)
        return False
    print("OK:  ", msg)
    return True


ok = True

ok &= must("var PlatenHyperspeed" in html, "PlatenHyperspeed IIFE exists")
ok &= must("window.PlatenHyperspeed = PlatenHyperspeed" in html, "PlatenHyperspeed is exported on window")
ok &= must('id="btn-hyperspeed"' in html and "PlatenHyperspeed.toggle()" in html, "studio Motus toggle is wired")
ok &= must("function fsToggleMotus()" in html and "function fsCycleMotusMode()" in html, "fullscreen Motus controls exist")
ok &= must("PlatenHyperspeed.setMode('flux')" in html, "FLUX mode is selectable")
ok &= must("PlatenHyperspeed.setMode('moire')" in html, "MOIRÉ mode is selectable")
ok &= must("PlatenHyperspeed.setMode('iso_col')" in html, "ELEVATE / iso_col mode is selectable")

ok &= must('id="c1-hs"' in html and 'id="c2-hs"' in html and 'id="c3-hs"' in html, "hyperspeed canvases exist for all panels")
ok &= must('class="platen-anim-canvas"' in html, "HS canvases use the animation-layer class")
ok &= must(html.count('class="platen-anim-canvas"') == 3, "all three HS canvases carry platen-anim-canvas")
ok &= must(".platen-anim-canvas.motus-running" in html, "running Motus canvas is forced visible")
ok &= must("opacity: 1 !important" in html and "motus-running" in html, "running Motus canvas beats inline opacity:0")
ok &= must("svg.motus-active" in html and "z-index: 1" in html, "Motus-active SVG stays under the anim canvas")
ok &= must("svg.motus-active .platen-artwork" in html, "Motus hides static SVG artwork while the canvas runs")

ok &= must("function _showAnimCanvas" in html and "function _hideAnimCanvas" in html, "show/hide helpers exist")
ok &= must("function _armFrame" in html, "RAF is armed through a single helper")
ok &= must("function _pauseAll" in html and "function _resumeAll" in html, "pause/resume helpers exist")
ok &= must("visibilitychange" in html and "_pauseAll()" in html, "tab hide pauses Motus")
ok &= must("document.hidden" in html, "background-tab guard is present")
ok &= must("function _panelIds" in html and "activePanels()" in html, "toggle uses visible panels only")
ok &= must("function _flowersFor" in html, "flower lookup checks both Motus stores")
ok &= must("function _hasEntries" in html and "if (!_hasEntries(id)) return" in html, "start no-ops without flower entries")
ok &= must("_showAnimCanvas(id, cvs)" in html, "start reveals the anim canvas")
ok &= must("_hideAnimCanvas(id, cvs)" in html, "stop hides the anim canvas")
ok &= must("_armFrame(id)" in html, "start/frame schedule through _armFrame")

ok &= must("typewriter_comma" in html and "ISO_GLYPHS" in html, "ELEVATE glyphs use MOTIF_PATHS keys")
ok &= must("function _isoGlyphKey" in html, "iso glyph lookup is centralized")
ok &= must("['comma', 'dot', 'plus', 'x', 'asterisk'" not in html, "legacy short iso glyph keys are gone")

ok &= must("pause: function ()" in html and "resume: function ()" in html, "public pause/resume API exists")
ok &= must("getMode: function ()" in html, "getMode remains on the public API")
ok &= must("_panelIds().forEach" in html, "mode changes restart only active panels")

# Gallery-removal footgun: Motus must animate the studio plate, not a solo/saved selection.
hs = html.split("var PlatenHyperspeed = (function ()", 1)[1].split("window.PlatenHyperspeed = PlatenHyperspeed", 1)[0]
ok &= must("activeGalleryIndex" not in hs, "Motus traits/seed no longer follow the saved solo selection")
ok &= must("curatedGallery" not in hs, "Motus does not read flower/traits from the removed gallery viewer")

# Render still zeros HS opacity — Motus must restore it.
ok &= must("canvasHS.style.opacity = '0'" in html or "canvasHS.style.opacity = \"0\"" in html, "render still hides HS while rebuilding SVG")
ok &= must("cvs.style.opacity = '1'" in html or "opacity = '1'" in html, "Motus start restores canvas opacity")

# Neighboring systems must stay intact.
ok &= must('id="btn-generate"' in html and "function randomize()" in html, "Generate/randomize remains")
ok &= must('id="btn-curate"' in html and "function setSaveButtonsState" in html, "Save remains")
ok &= must("function renderSavedInline" in html and "function openSavedSolo" in html, "masonry/solo modal remains")
ok &= must("MAX_LIVE_SVG_NODES" in html and "MAX_RASTERIZE_NODES" in html, "OOM guards remain")
ok &= must("function _budgetIsoExtrusions" in html, "isometric node budget remains")

# Toggle must not keep spinning hidden banner panels on the default layout.
toggle_fn = html.split("toggle: function () {", 1)[1].split("setMode: function", 1)[0]
ok &= must("[1, 2, 3]" not in toggle_fn, "toggle no longer hardcodes all three panels")
ok &= must("_panelIds()" in toggle_fn, "toggle asks activePanels() for who to start")

# ELEVATE motion quality — mechanical field, latch, ink, hitch clamp.
ok &= must("function _mechEase" in html, "mechanical platen easing exists")
ok &= must("function _isoLatchLevel" in html, "glyph slug latch exists")
ok &= must("function _isoField" in html, "ELEVATE field is centralized")
ok &= must("function _ribbonInk" in html, "shared ribbon-ink helper exists")
ok &= must("ISO_DENSITY" in html, "five-band density map exists")
ok &= must("ISO_VARIANTS" in html, "SM3 variant keys stay available")
ok &= must("typewriter_slash" in html and "typewriter_dash" in html and "typewriter_square" in html,
           "slash/dash/square remain typewriter_* keys")
ok &= must("f.py_steps" in hs and "yCoords = f.py_steps.slice()" in hs,
           "Motus columns reuse the plate's budgeted py_steps")
ok &= must("if (dt > 0.048) dt = 0.048" in html, "RAF hitch clamp absorbs long frames")

iso = html.split("} else if (_animMode === 'iso_col') {", 1)[1].split(
    "} else if (false && _animMode === 'plotter')", 1
)[0]
ok &= must("* 72" not in iso, "ELEVATE no longer uses the harsh ±36px linear span")
ok &= must("(f - 0.5) * 34" in iso, "ELEVATE elevation is about one strike-step")
ok &= must("_isoField(e, iso_t, stag)" in iso, "ELEVATE uses the eased mechanical field")
ok &= must("_isoGlyphKey(f, e.pathKey, e, t, glyphSet)" in iso, "ELEVATE latches glyphs through the 5-band set")
ok &= must("(f - 0.5) * 0.05" in iso, "ELEVATE scale is a perspective whisper")
ok &= must("_ribbonInk(f, e.isoInk)" in iso, "ELEVATE uses ribbon ink instead of flat alpha 1")
ok &= must("isoRegX" in iso, "ELEVATE carries imperfect registration")
ok &= must("0.15" not in iso.replace("0.15 * factor", ""), "ELEVATE dropped the 15% scale pulse")

flux = html.split("} else if (_animMode === 'flux') {", 1)[1].split("ctx.globalAlpha = Math.min(hyperspeedBase", 1)[0]
ok &= must("t * 50.0" not in flux, "FLUX no longer uses 50Hz electronic vibration")
ok &= must("t * 35.0" not in flux, "FLUX no longer uses 35Hz sparkle")
ok &= must("wave * 7.2" in flux, "FLUX flow amplitude is weightier, not 10px drift")

moire = html.split("if (_animMode === 'moire') {", 1)[1].split("} else if (_animMode === 'iso_col') {", 1)[0]
ok &= must("_isoLatchLevel" in moire, "MOIRÉ shares the glyph latch (no band popping)")
ok &= must("_mechEase" in moire, "MOIRÉ eases the interference field")
ok &= must("* 8.0" not in moire, "MOIRÉ shift is no longer the 8px shove")
ok &= must("_ribbonInk" in moire, "MOIRÉ uses the same ribbon ink language")

# Pause / layering contract from PR #6 must still hold after the quality pass.
ok &= must("function _pauseAll" in html and "visibilitychange" in html, "tab-hide pause remains")
ok &= must("cvs.style.zIndex = '3'" in html, "anim canvas z-index remains 3")
ok &= must("svg.style.zIndex = '1'" in html, "Motus-active SVG z-index remains 1")

if not ok:
    sys.exit(1)
print("\nAll Motus structural checks passed.")

# Runtime math for easing / latch / ribbon (node).
import subprocess
motion = subprocess.run(
    ["node", str(ROOT / "test_motus_motion.js")],
    cwd=ROOT,
)
if motion.returncode != 0:
    sys.exit(motion.returncode)
