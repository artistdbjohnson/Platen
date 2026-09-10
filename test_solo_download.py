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
ok &= must("function ensureSavedPlateSvg" in html and "function liveSvgMatchingArt" in html, "empty snaps recover a vector from live plate or rebuild")
ok &= must("function rebuildSavedPlateSvg" in html and "s-solo-rebuild" in html, "dense plates re-render into an offscreen SVG")
ok &= must("serializePlateSvg" in html.split("function curateArtwork", 1)[1].split("function generateNewPiece", 1)[0], "Save tries to serialize even when over the mark budget")
ok &= must("ensureSavedPlateSvg" in html.split("function openSavedSolo", 1)[1].split("function closeSavedSolo", 1)[0], "solo open recovers a vector when the stored snap is empty")
ok &= must("ensureSavedPlateSvg" in html.split("function downloadSavedSolo()", 1)[1].split("window.downloadSavedSolo", 1)[0], "solo download recovers a vector before archival PNG")
paint_fn = html.split("function paintSavedPlate", 1)[1].split("function renderSavedInline", 1)[0]
ok &= must("if (wantVector)" in paint_fn and "previewUrl" in paint_fn.split("if (wantVector)", 1)[1], "vector branch is explicit")
vector_branch = paint_fn.split("if (wantVector)", 1)[1].split("if (previewUrl)", 1)[0]
ok &= must("img" not in vector_branch and "previewUrl" not in vector_branch, "solo vector path never paints the 480 JPEG")
ok &= must("PLATEN_EXPORT_DPI = 300" in html and "PLATEN_EXPORT_MIN_LONG_EDGE = 3300" in html, "printable size floor remains")
ok &= must("saveAsImage('png')" in html, "Export Download PNG still uses saveAsImage")
ok &= must("svg.classList.remove('motus-active')" in html, "Motus OFF leaves the live SVG visible")
ok &= must("function isMotusBlockingExport" in html and "function guardMotusImageExport" in html, "Motus ON blocks image export")
ok &= must("pause motus to download" in html and "motus-download-cue" in html, "quiet inline cue explains the block")
ok &= must("isActive()" in html.split("function isMotusBlockingExport", 1)[1].split("function saveAsImage", 1)[0], "block uses PlatenHyperspeed.isActive")
ok &= must("isPaused()" in html.split("function isMotusBlockingExport", 1)[1].split("function saveAsImage", 1)[0], "paused Motus is allowed to download")
ok &= must("guardMotusImageExport" in html.split("function savePNG()", 1)[1].split("function saveJPG()", 1)[0], "savePNG guards while Motus is on")
ok &= must("guardMotusImageExport" in html.split("function saveJPG()", 1)[1].split("function saveTriptych", 1)[0], "saveJPG guards while Motus is on")
ok &= must("guardMotusImageExport" in html.split("function saveAsImage(format)", 1)[1].split("function savePNG()", 1)[0], "saveAsImage guards while Motus is on")
ok &= must("guardMotusImageExport" in html.split("function downloadSavedSolo()", 1)[1].split("window.downloadSavedSolo", 1)[0], "solo archival download guards while Motus is on")
ok &= must("ensureSavedPlateSvg" in html and "s-solo-rebuild" in html, "Slug empty-snap recovery remains")

if not ok:
    sys.exit(1)
print("\nAll solo archival download checks passed.")
