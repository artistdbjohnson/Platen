#!/usr/bin/env python3
"""Structural checks for the locked S2 chamber on the plate SVG."""

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
ok &= must("function s2ChamberLayout(" in html, "s2ChamberLayout places the UR void beside LEVEL")
ok &= must("function appendS2Chamber(" in html, "appendS2Chamber draws the specimen register")

ok &= must(html.count("appendS2Chamber(headerG,") == 2, "S2 is attached on both live and worker colophon paths")

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

layout = fn_body("s2ChamberLayout")
ok &= must("for (var r = 3; r <= 7; r++)" in layout, "void starts after LEVEL 1–5 text")
ok &= must("rightCol - leftCol < 10" in layout, "narrow colophons skip the chamber instead of overlapping LEVEL")

draw = fn_body("appendS2Chamber")
ok &= must("s2-chamber" in draw and "s2-register" in draw, "chamber + hairline register classes exist")
ok &= must("s2-chip" in draw and "s2-baseline" in draw, "chips and blank sign baseline exist")
ok &= must("s2-divider" in draw, "optional hairline divider is present")
ok &= must("createElementNS(svgNS, 'text')" not in draw, "chamber draws no text nodes")
ok &= must(
    not re.search(r"SIGN(ATURE)?", draw),
    "no SIGN / SIGNATURE label in the chamber",
)
ok &= must("SEED" not in draw and "DATE" not in draw, "chamber does not restate SEED or DATE")
ok &= must("ENGINE" not in draw and "SYMMETRY" not in draw, "chamber does not restate params")
ok &= must("stroke-width', '1'" in draw and "non-scaling-stroke" in draw, "register stays a hairline")
ok &= must("data-ink" in draw, "each chip records its engine hex")

ok &= must("class=\"s2-chamber\"" not in html.split("<body", 1)[0], "no rosy UI chrome for S2 in the studio markup")

if not ok:
    sys.exit(1)
print("\nAll S2 chamber structural checks passed.")
