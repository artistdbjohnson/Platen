#!/usr/bin/env python3
"""Structural checks for locked S2 unboxed struck-only chips + hairline baseline."""

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
ok &= must("function flowerInkHex(" in html, "flowerInkHex reads f.c / cell.col.c")
ok &= must("function struckInkHexes(" in html, "struckInkHexes collects unique struck inks")
ok &= must("function paletteInkHexesByRank(" in html, "fallback ranks unique palette .c by .r")
ok &= must("function plateInkHexes(" in html, "plateInkHexes prefers struck, else fallback")
ok &= must("function s2UnboxedLayout(" in html, "s2UnboxedLayout places chips under SEED in the UR void")
ok &= must("function appendS2Unboxed(" in html, "appendS2Unboxed draws unboxed chips + baseline")

ok &= must(html.count("appendS2Unboxed(headerG,") == 2, "S2 is attached on both live and worker colophon paths")
ok &= must("flowers: flowers" in html, "archival worker path paints chips from the flower set")
ok &= must("function appendS2Chamber(" not in html, "boxed appendS2Chamber is gone")
ok &= must("function s2ChamberLayout(" not in html, "boxed s2ChamberLayout is gone")

resolve = fn_body("resolvePaletteEntry")
ok &= must("palettes[chromeName]" in resolve, "palette path uses PALETTES[resolvedChrome]")
ok &= must("typeof paletteEntry === 'function'" in resolve, "function palettes are called with the plate seed")
ok &= must("paletteEntry(seed)" in resolve, "function palettes receive seed")
ok &= must("palettes.panar" in resolve, "unknown chrome falls back to panar")

flower = fn_body("flowerInkHex")
ok &= must("item.c" in flower, "struck helper takes f.c")
ok &= must("item.col.c" in flower, "struck helper also takes cell.col.c")
ok &= must("getRenderColor" in flower, "struck hexes pass through the glyph paint helper")

struck = fn_body("struckInkHexes")
ok &= must("counts[key]" in struck, "struck helper tallies strike counts")
ok &= must("firstSeen" in struck, "ties keep first-seen order")
ok &= must("out.length < 5" in struck, "struck chips cap at five")
ok &= must("pad" not in struck.lower(), "struck helper does not pad unused palette entries")

rank = fn_body("paletteInkHexesByRank")
ok &= must("item.r" in rank, "empty-flower fallback sorts palette .c by .r")
ok &= must("hexes.length < 5" in rank, "fallback chips cap at five")

plate = fn_body("plateInkHexes")
ok &= must("struckInkHexes(flowers)" in plate, "plate chips prefer the struck flower set")
ok &= must("inkHexesFromPalette(resolvePaletteEntry" in plate, "struck chips are gated by the live PALETTES helpers")
ok &= must("paletteInkHexesByRank" in plate, "empty flowers fall back to ranked palette .c")
ok &= must("slice(0, 5)" not in plate, "does not use full unique palette + slice(0,5)")

layout = fn_body("s2UnboxedLayout")
ok &= must("for (var r = 3; r <= 7; r++)" in layout, "void starts after LEVEL 1–5 text")
ok &= must("rightCol - leftCol < 10" in layout, "narrow colophons skip instead of overlapping LEVEL")
ok &= must("lastIndexOf('SEED')" in layout, "chips align under the SEED title")
ok &= must("chipCount" in layout, "chip row width follows the struck count, not a forced five")

draw = fn_body("appendS2Unboxed")
ok &= must("opts.flowers" in draw, "draw reads the live flower set")
ok &= must("s2-unboxed" in draw and "s2-chip" in draw, "unboxed group and square chips exist")
ok &= must("s2-baseline" in draw, "hairline signature baseline exists")
ok &= must("s2-register" not in draw, "no chamber register rect")
ok &= must("s2-divider" not in draw, "no chamber divider")
ok &= must("s2-chamber" not in draw, "no boxed chamber class")
ok &= must("createElementNS(svgNS, 'text')" not in draw, "unboxed draw creates no text nodes")
ok &= must(not re.search(r"SIGN(ATURE)?", draw), "no SIGN / SIGNATURE label")
ok &= must("SEED" not in draw and "DATE" not in draw, "does not restate SEED or DATE")
ok &= must("ENGINE" not in draw and "SYMMETRY" not in draw, "does not restate params")
ok &= must("stroke-width', '1'" in draw and "non-scaling-stroke" in draw, "baseline stays a hairline")
ok &= must("data-ink" in draw, "each chip records its struck hex")
ok &= must("#272013" not in draw and "#1D1D1D" not in draw, "no hard-coded chip colors")

ok &= must('class="s2-chamber"' not in html, "no leftover s2-chamber chrome in the studio")
ok &= must('class="s2-unboxed"' not in html.split("<body", 1)[0], "no rosy UI chrome for S2 in the studio markup")

if not ok:
    sys.exit(1)
print("\nAll S2 unboxed structural checks passed.")
