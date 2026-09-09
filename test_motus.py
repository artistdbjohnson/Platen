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
ok &= must("togglePause: function ()" in html, "public togglePause API exists")
ok &= must("isPaused: function ()" in html, "public isPaused API exists")
ok &= must("var _userPaused" in html, "explicit user pause is distinct from tab-hide")
ok &= must("else if (!_userPaused) _resumeAll()" in html, "tab show does not unpause an explicit pause")
ok &= must("function _syncPlayPauseUI" in html, "play/pause labels sync from one helper")
ok &= must('id="btn-motus-play-pause"' in html, "studio Motus play/pause sits next to the toggle")
ok &= must("class=\"motus-play-pause\"" in html or "class='motus-play-pause'" in html, "studio play/pause uses whisper chrome class")
ok &= must('id="saved-solo-play-pause"' in html, "solo chrome has play/pause")
ok &= must("saved-solo-play-pause" in html and "saved-solo-close" in html, "solo play/pause lives in the existing chrome row")
ok &= must("onclick=\"PlatenHyperspeed.togglePause()\"" in html, "play/pause buttons call togglePause")
ok &= must(html.count('id="fs-btn-play-pause"') == 1, "fullscreen Play/Pause remains the single autocycle control")
ok &= must("function fsTogglePlayPause()" in html and "startAuto()" in html, "fullscreen Play/Pause still drives autocycle")
ok &= must("getMode: function ()" in html, "getMode remains on the public API")
ok &= must("_panelIds().forEach" in html, "mode changes restart only active panels")
ok &= must("if (_userPaused)" in html and "_frame(id)" in html, "start paints a frozen frame when user-paused")

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

if not ok:
    sys.exit(1)
print("\nAll Motus structural checks passed.")
