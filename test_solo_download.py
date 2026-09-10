#!/usr/bin/env python3
"""Structural checks: solo view is SVG; solo download is archival PNG."""

from pathlib import Path
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

ok &= must("function paintSavedPlate" in html and "wantVector" in html, "solo/masonry paint paths are split")
ok &= must("vector: true" in html.split("function openSavedSolo", 1)[1].split("function closeSavedSolo", 1)[0], "openSavedSolo paints SVG")
ok &= must("vector: true" not in html.split("function renderSavedInline", 1)[1].split("function openSavedSolo", 1)[0], "masonry does not force SVG")

preview_fn = html.split("function captureInlinePlatePreview", 1)[1].split("function paintSavedPlate", 1)[0]
ok &= must("var w = 480" in preview_fn and "image/jpeg" in preview_fn, "masonry thumbs stay 480 JPEG")

solo_dl = html.split("function downloadSavedSolo()", 1)[1].split("window.downloadSavedSolo", 1)[0]
ok &= must("exportSvgAsArchivalImage" in solo_dl and "format: 'png'" in solo_dl, "solo download is archival PNG")
ok &= must("art.previews" not in solo_dl and ".jpg" not in solo_dl, "solo download never uses the thumb JPEG")
ok &= must("function downloadSavedSoloSvg" in html and 'id="saved-solo-download-svg"' in html, "Download SVG remains a separate control")
ok &= must("function exportSvgAsArchivalImage" in html and "function canvasToExportBlob" in html, "shared printable PNG pipeline exists")
ok &= must("PLATEN_EXPORT_DPI = 300" in html and "PLATEN_EXPORT_MIN_LONG_EDGE = 3300" in html, "printable size floor remains")
ok &= must("saveAsImage('png')" in html, "Export Download PNG still uses saveAsImage")
ok &= must("svg.classList.remove('motus-active')" in html, "Motus OFF leaves the live SVG visible")

if not ok:
    sys.exit(1)
print("\nAll solo archival download checks passed.")
