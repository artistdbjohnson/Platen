#!/usr/bin/env python3
"""Structural checks: pull-from-top reloads the page without stealing mid-page scroll."""

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

style = html.split("<style>", 1)[1].split("</style>", 1)[0]
bind = html.split("function bindPullToRefresh", 1)[-1]
if bind == html:
    bind = html.split("(function bindPullToRefresh()", 1)[-1]
bind = bind.split("function showConfirmRemovePopup", 1)[0]

ok &= must('id="pull-refresh-cue"' in html, "quiet refresh cue element exists")
ok &= must('class="pull-refresh-cue"' in html, "cue uses pull-refresh-cue class")
ok &= must("hidden" in html.split('id="pull-refresh-cue"', 1)[1][:80], "cue starts hidden")
ok &= must("release to refresh" in html, "cue copy includes release to refresh")
ok &= must("refreshing" in bind, "refreshing copy is set while reloading")

ok &= must("function bindPullToRefresh" in html or "(function bindPullToRefresh()" in html, "pull-to-refresh binder exists")
ok &= must("window.location.reload()" in bind, "release reloads the window")
ok &= must("platen_curated_gallery" not in bind, "pull refresh does not wipe the curated gallery")
ok &= must("PlatenDB.clear" not in bind, "pull refresh does not clear PlatenDB")

ok &= must("touchstart" in bind and "touchmove" in bind and "touchend" in bind, "touch start/move/end are bound")
ok &= must("passive: false" in bind, "touchmove can preventDefault only while pulling")
ok &= must("e.preventDefault()" in bind, "pulling at top can suppress native overscroll")
ok &= must("scrollTop" in bind and "scrollY" in bind, "handler reads scrollTop / scrollY")
ok &= must("> 2" in bind, "arms only when scrollers are at top (≈ 0)")

ok &= must("saved-solo" in bind and "is-open" in bind, "solo modal blocks pull-to-refresh")
ok &= must("cd-items" in bind, "open parameter pickers block pull-to-refresh")
ok &= must("motus-dropdown" in bind, "open Motus picker blocks pull-to-refresh")
ok &= must("fullscreen-active" in bind, "fullscreen HUD blocks pull-to-refresh")
ok &= must("Math.abs(dx)" in bind and "HORIZ" in bind, "horizontal gestures disarm the pull")
ok &= must("e.touches.length !== 1" in bind, "multi-touch / pinch does not arm refresh")

cue = re.search(r'\.pull-refresh-cue\s*\{([^}]+)\}', style)
ok &= must(bool(cue), ".pull-refresh-cue CSS rule exists")
if cue:
    body = cue.group(1)
    ok &= must("JetBrains Mono" in body, "cue uses JetBrains Mono")
    ok &= must("text-transform: lowercase" in body, "cue is lowercase")
    ok &= must("pointer-events: none" in body, "cue does not steal hits")
    ok &= must("spinner" not in body.lower(), "cue has no spinner chrome")
    ok &= must("10px" in body or "11px" in body, "cue is a thin type size")

ok &= must(
    "html[data-theme=\"light\"] .pull-refresh-cue" in style
    and "background: #ffffff !important" in style.split('html[data-theme="light"] .pull-refresh-cue', 1)[-1][:220],
    "index cue is #000 on #fff so it stays readable over a black plate",
)
ok &= must("animation:" not in (cue.group(1) if cue else ""), "cue has no spinner animation")

# Product surfaces stay wired.
ok &= must("function generateNewPiece()" in html, "Generate remains")
ok &= must('id="btn-curate"' in html and "function setSaveButtonsState" in html, "Save remains")
ok &= must('id="btn-hyperspeed"' in html and "PlatenHyperspeed.toggle()" in html, "Motus remains")
ok &= must("function savePNG()" in html, "PNG download remains")
ok &= must("function openSavedSolo" in html, "solo modal remains")
ok &= must("className = 'cd-items'" in html, "parameter pickers remain")

if not ok:
    sys.exit(1)
print("\nAll pull-to-refresh structural checks passed.")
