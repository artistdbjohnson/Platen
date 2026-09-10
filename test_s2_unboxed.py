#!/usr/bin/env python3
"""Structural checks for the locked S2 unboxed chips + hairline baseline."""

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


def fn_body(name):
    start = html.find("function " + name)
    if start < 0:
        return ""
    i = html.find("{", start)
    depth = 0
    for j in range(i, len(html)):
        if html[j] == "{":
            depth += 1
        elif html[j] == "}":
            depth -= 1
            if depth == 0:
                return html[start : j + 1]
    return ""


ok = True

ok &= must("function resolvePaletteEntry(" in html, "resolvePaletteEntry matches the engine palette path")
ok &= must("function inkHexesFromPalette(" in html, "inkHexesFromPalette reads .c / hex strokes")
ok &= must("function plateInkHexes(" in html, "plateInkHexes slices the live chrome to five chips")
ok &= must("function s2UnboxedLayout(" in html, "s2UnboxedLayout places chips under SEED in the UR void")
ok &= must("function appendS2Unboxed(" in html, "appendS2Unboxed draws unboxed chips + baseline")

ok &= must(html.count("appendS2Unboxed(headerG,") == 2, "S2 is attached on both live and worker colophon paths")
ok &= must("function appendS2Chamber(" not in html, "boxed appendS2Chamber is gone")
ok &= must("function s2ChamberLayout(" not in html, "boxed s2ChamberLayout is gone")

resolve = fn_body("resolvePaletteEntry")
ok &= must("palettes[chromeName]" in resolve, "palette path uses PALETTES[resolvedChrome]")
ok &= must("typeof paletteEntry === 'function'" in resolve, "function palettes are called with the plate seed")
ok &= must("paletteEntry(seed)" in resolve, "function palettes receive seed")
ok &= must("palettes.panar" in resolve, "unknown chrome falls back to panar")

ink = fn_body("inkHexesFromPalette")
ok &= must("item.c" in ink, "ink helper takes .c hex strokes")
ok &= must("item.hex" in ink, "ink helper also accepts .hex")

plate = fn_body("plateInkHexes")
ok &= must("slice(0, 5)" in plate, "plate chips are capped at five")

layout = fn_body("s2UnboxedLayout")
ok &= must("for (var r = 3; r <= 7; r++)" in layout, "void starts after LEVEL 1–5 text")
ok &= must("rightCol - leftCol < 10" in layout, "narrow colophons skip instead of overlapping LEVEL")
ok &= must("lastIndexOf('SEED')" in layout, "chips align under the SEED title")

draw = fn_body("appendS2Unboxed")
ok &= must("s2-unboxed" in draw and "s2-chip" in draw, "unboxed group and square chips exist")
ok &= must("s2-baseline" in draw, "hairline signature baseline exists")
ok &= must("s2-register" not in draw, "no chamber register rect")
ok &= must("s2-divider" not in draw, "no chamber divider")
ok &= must("s2-chamber" not in draw, "no boxed chamber class")
ok &= must("createElementNS(svgNS, 'text')" not in draw, "unboxed draw creates no text nodes")
ok &= must(
    not re.search(r"SIGN(ATURE)?", draw),
    "no SIGN / SIGNATURE label",
)
ok &= must("SEED" not in draw and "DATE" not in draw, "does not restate SEED or DATE")
ok &= must("ENGINE" not in draw and "SYMMETRY" not in draw, "does not restate params")
ok &= must("stroke-width', '1'" in draw and "non-scaling-stroke" in draw, "baseline stays a hairline")
ok &= must("data-ink" in draw, "each chip records its engine hex")

ok &= must("class=\"s2-chamber\"" not in html, "no leftover s2-chamber chrome in the studio")
ok &= must("class=\"s2-unboxed\"" not in html.split("<body", 1)[0], "no rosy UI chrome for S2 in the studio markup")

if not ok:
    sys.exit(1)
print("\nAll S2 unboxed structural checks passed.")
