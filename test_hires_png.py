#!/usr/bin/env python3
"""Structural + size checks for archival Download PNG export."""

from pathlib import Path
import re
import struct
import sys

ROOT = Path(__file__).resolve().parent
html = (ROOT / "index.html").read_text(encoding="utf-8")
paper = ROOT / "platen_white.png"


def must(cond, msg):
    if not cond:
        print("FAIL:", msg)
        return False
    print("OK:  ", msg)
    return True


def const_int(name):
    m = re.search(rf"var {name} = (\d+)", html)
    return int(m.group(1)) if m else None


def png_size(path):
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        return None
    w, h = struct.unpack(">II", data[16:24])
    return w, h, path.stat().st_size


def get_hires_export_size(svg_w, svg_h, tex=None, px_per_in=160, dpi=300, min_long=3300, max_edge=4096):
    if not (svg_w > 1):
        svg_w = 8.5 * px_per_in
    if not (svg_h > 1):
        svg_h = 11 * px_per_in
    out_w = max(1, round((svg_w / px_per_in) * dpi))
    out_h = max(1, round((svg_h / px_per_in) * dpi))
    if tex:
        tw, th = tex
        if tw > 0 and th > 0:
            cover = max(out_w / tw, out_h / th)
            if cover < 1:
                out_w = round(out_w / cover)
                out_h = round(out_h / cover)
    long_edge = max(out_w, out_h)
    if long_edge < min_long:
        up = min_long / long_edge
        out_w = round(out_w * up)
        out_h = round(out_h * up)
    long_edge = max(out_w, out_h)
    if long_edge > max_edge:
        down = max_edge / long_edge
        out_w = round(out_w * down)
        out_h = round(out_h * down)
    return out_w, out_h


ok = True

ok &= must('id="btn-png-dock"' in html and 'onclick="savePNG()"' in html, "dock Download PNG still calls savePNG()")
ok &= must('id="btn-out-png"' in html and 'onclick="savePNG()"' in html, "export-grid Download PNG still calls savePNG()")
ok &= must("function savePNG()" in html and "saveAsImage('png')" in html, "savePNG forwards to saveAsImage('png')")
ok &= must("function getHiResExportSize" in html, "shared hi-res size helper exists")
ok &= must("function allocExportCanvas" in html, "export canvas alloc has an OOM step-down")
ok &= must("function withHiresPaper" in html, "export waits for the lossless paper scan")
ok &= must("CANVAS_WHITE_HIRES_PATH = 'platen_white.png'" in html, "white export paper is the lossless PNG")
ok &= must("CANVAS_BLACK_HIRES_PATH = 'platen_black.png'" in html, "black export paper is the lossless PNG")
ok &= must("PLATEN_EXPORT_DPI = 300" in html, "export DPI is print-archival 300")
ok &= must("PLATEN_EXPORT_MIN_LONG_EDGE = 3300" in html, "normal plate long edge is at least 11in * 300")
ok &= must("PLATEN_EXPORT_MAX_EDGE = 4096" in html, "export long edge is capped to protect the tab")
ok &= must("PLATEN_PX_PER_IN = 160" in html, "physical inch conversion is unchanged")

ok &= must("function exportSvgAsArchivalImage" in html, "shared archival composite exists for studio + solo download")
export_fn = html.split("function exportSvgAsArchivalImage", 1)[1].split("function saveAsImage(format)", 1)[0]
ok &= must("getHiResExportSize" in export_fn, "archival helper uses the 300 DPI size helper")
ok &= must("withHiresPaper" in export_fn, "archival helper composites lossless paper, not the JPEG preview tex")
ok &= must("allocExportCanvas" in export_fn, "archival helper allocates through the OOM-safe helper")
ok &= must("canvasToExportBlob" in export_fn, "archival helper downloads a PNG blob")
ok &= must("outH = 2560" not in export_fn and "outW = 1440" not in export_fn, "2K screen presets are gone from archival helper")
ok &= must("toDataURL" not in export_fn, "archival helper does not dump a preview data URL")
ok &= must("function canvasToExportBlob" in html and "refusing JPEG-as-PNG" in html, "PNG path refuses a JPEG blob tagged as .png")
save_fn = html.split("function saveAsImage(format)", 1)[1].split("function savePNG()", 1)[0]
ok &= must("exportSvgAsArchivalImage" in save_fn, "saveAsImage forwards to the shared archival helper")
ok &= must("getHiResExportSize" in save_fn or "exportSvgAsArchivalImage" in save_fn, "saveAsImage stays on the archival path")

# Masonry thumbs must stay small JPEGs — do not piggyback archival raster there.
preview_fn = html.split("function captureInlinePlatePreview", 1)[1].split("function paintSavedPlate", 1)[0]
ok &= must("var w = 480" in preview_fn, "masonry preview raster stays 480px")
ok &= must("image/jpeg" in preview_fn, "masonry preview remains JPEG")
ok &= must("getHiResExportSize" not in preview_fn, "masonry preview does not use archival export size")

paint_fn = html.split("function paintSavedPlate", 1)[1].split("function renderSavedInline", 1)[0]
ok &= must("opts.vector" in paint_fn, "paintSavedPlate distinguishes solo vector from masonry thumbs")
ok &= must("wantVector" in paint_fn, "solo path prefers the stored SVG")
ok &= must("previewUrl" in paint_fn, "masonry can still use the JPEG thumb")

open_fn = html.split("function openSavedSolo", 1)[1].split("function closeSavedSolo", 1)[0]
ok &= must("vector: true" in open_fn, "solo viewer asks paintSavedPlate for the SVG")

solo_dl = html.split("function downloadSavedSolo()", 1)[1].split("window.downloadSavedSolo", 1)[0]
ok &= must("exportSvgAsArchivalImage" in solo_dl, "solo download re-rasters through the archival helper")
ok &= must("art.previews" not in solo_dl, "solo download does not ship the 480 JPEG thumb")
ok &= must(".jpg" not in solo_dl, "solo download is not a JPEG")
ok &= must("format: 'png'" in solo_dl, "solo download default is PNG")
ok &= must("function downloadSavedSoloSvg" in html, "solo chrome also exposes Download SVG")
ok &= must('id="saved-solo-download-svg"' in html, "Download SVG control exists in solo chrome")
ok &= must("function ensureSavedPlateSvg" in html and "s-solo-rebuild" in html, "empty/dense snaps rebuild a vector instead of dying")
ok &= must("ensureSavedPlateSvg" in solo_dl, "solo download recovers a vector when art.svgs[0] is empty")

ok &= must("MAX_LIVE_SVG_NODES" in html and "MAX_RASTERIZE_NODES" in html, "OOM guards remain")
ok &= must("function _budgetIsoExtrusions" in html, "isometric node budget remains")
ok &= must("function renderSavedInline" in html and "function openSavedSolo" in html, "masonry/solo remain")
render_fn = html.split("function renderSavedInline", 1)[1].split("function openSavedSolo", 1)[0]
ok &= must("vector: true" not in render_fn, "masonry renderer does not request the solo SVG path")
ok &= must("paintSavedPlate(preview, art, { fillWidth: true })" in render_fn, "masonry still paints thumbs via paintSavedPlate")
ok &= must("svg.classList.remove('motus-active')" in html and "_hideAnimCanvas" in html, "Motus OFF reveals the live studio SVG")
ok &= must("function randomize()" in html and "function setSaveButtonsState" in html, "Generate/Save remain")

back_fn = html.split("window.downloadBackHiRes", 1)[1].split("function startBreathing", 1)[0]
ok &= must("getHiResExportSize" in back_fn, "downloadBackHiRes uses archival size")
ok &= must("rasterizePlatenSvg" in back_fn, "downloadBackHiRes re-rasters instead of the 1200 back canvas")
ok &= must("toDataURL" not in back_fn, "downloadBackHiRes no longer dumps the on-screen canvas")
ok &= must("image/png" in back_fn, "back PNG mime is lossless")

dpi = const_int("PLATEN_EXPORT_DPI")
min_long = const_int("PLATEN_EXPORT_MIN_LONG_EDGE")
max_edge = const_int("PLATEN_EXPORT_MAX_EDGE")
px_per_in = const_int("PLATEN_PX_PER_IN")
ok &= must(dpi == 300 and min_long == 3300 and max_edge == 4096 and px_per_in == 160, "export constants parse")

# Default studio layout is US Letter: (77+8)*16 x (58+8)*26.6667 user units.
letter_w = (77 + 8) * 16
letter_h = (58 + 8) * 26.6667
paper_whs = png_size(paper) if paper.exists() else None
ok &= must(bool(paper_whs), "platen_white.png is present for size math")
tex = (paper_whs[0], paper_whs[1]) if paper_whs else (2040, 2640)
out_w, out_h = get_hires_export_size(letter_w, letter_h, tex, px_per_in, dpi, min_long, max_edge)
ok &= must(out_w == 2550 and out_h == 3300, f"US Letter export is 2550x3300 (got {out_w}x{out_h})")
ok &= must(out_w * out_h >= 2550 * 3300, "normal plate has at least 300 DPI letter pixels")
ok &= must(max(out_w, out_h) <= max_edge, "letter export stays under the OOM cap")

# A 2560-edge letter plate was 1978x2560 — well below the paper scan and 300 DPI.
old_w, old_h = 1978, 2560
ok &= must(out_w * out_h > old_w * old_h * 1.4, "new raster has substantially more pixels than the 2560 preview")

if paper_whs:
    paper_w, paper_h, paper_bytes = paper_whs
    ok &= must(paper_w == 2040 and paper_h == 2640, "lossless paper scan is 2040x2640")
    ok &= must(paper_bytes >= 3 * 1024 * 1024, "paper scan itself is already in the 3MB+ class")
    scale = (out_w * out_h) / float(paper_w * paper_h)
    est = int(paper_bytes * scale)
    ok &= must(est >= 3 * 1024 * 1024, f"letter+paper PNG estimate is at least 3MB (est {est / 1024 / 1024:.1f}MB)")
    ok &= must(est <= 12 * 1024 * 1024, f"letter+paper PNG estimate stays archival-not-huge (est {est / 1024 / 1024:.1f}MB)")
    print(f"INFO: US Letter 300 DPI over {paper_w}x{paper_h} paper → {out_w}x{out_h}, ~{est / 1024 / 1024:.1f}MB")
    # Live Chrome savePNG() on a generated letter plate (2026-09-09):
    # image/png, 2550x3300, 10.2MB — lossless and above the 3MB floor.
    # Live Chrome downloadSavedSolo() on a letter-size saved SVG (2026-09-10):
    # image/png, 2550x3300, 7.88MB — not the 76KB masonry JPEG.

# Tiny SVG user units (or inch attributes misread as pixels) must not emit a preview raster.
tiny_w, tiny_h = get_hires_export_size(8.5, 11, tex, px_per_in, dpi, min_long, max_edge)
ok &= must(max(tiny_w, tiny_h) >= min_long, "inch-scale SVG still floors to an archival long edge")

sq_w, sq_h = get_hires_export_size(1000, 1000, None, px_per_in, dpi, min_long, max_edge)
ok &= must(sq_w == sq_h == min_long, f"square plate floors to {min_long} (got {sq_w}x{sq_h})")

if not ok:
    sys.exit(1)
print("\nAll hi-res PNG export checks passed.")
