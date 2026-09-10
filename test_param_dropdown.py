#!/usr/bin/env python3
"""Structural checks: parameter dropdowns fill the trait value column."""

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
populate = html.split("function populateSelect", 1)[1].split("function updateTraitBar", 1)[0]

ok &= must(
    "wrapper.style.width = '240px'" not in html
    and 'wrapper.style.width = "240px"' not in html,
    "populateSelect no longer hard-codes a 240px dropdown width",
)
ok &= must(
    "wrapper.style.width = '100%'" in populate or 'wrapper.style.width = "100%"' in populate,
    "populateSelect sizes the custom dropdown to 100% of the value column",
)
ok &= must(
    "wrapper.style.maxWidth = '100%'" in populate or 'wrapper.style.maxWidth = "100%"' in populate,
    "populateSelect caps dropdown width at the value column",
)
ok &= must(
    "wrapper.style.minWidth = '0'" in populate or 'wrapper.style.minWidth = "0"' in populate,
    "populateSelect lets the dropdown shrink inside the 2-col grid",
)

dd = re.search(r'\.custom-dropdown\s*\{([^}]+)\}', style)
ok &= must(bool(dd), ".custom-dropdown CSS rule exists")
if dd:
    body = dd.group(1)
    ok &= must("width: 100%" in body, ".custom-dropdown is width 100%")
    ok &= must("max-width: 100%" in body, ".custom-dropdown is max-width 100%")
    ok &= must("min-width: 0" in body, ".custom-dropdown can shrink (min-width 0)")
    ok &= must("240px" not in body, ".custom-dropdown CSS has no fixed 240px")

sel = re.search(r'\.cd-selected\s*\{([^}]+)\}', style)
ok &= must(bool(sel), ".cd-selected CSS rule exists")
if sel:
    body = sel.group(1)
    ok &= must("width: 100%" in body, ".cd-selected is width 100%")
    ok &= must("text-align: right" in body, ".cd-selected stays right-aligned")
    ok &= must(
        "font-weight: 500" in body or "font-weight: 600" in body,
        ".cd-selected is slightly bold",
    )

items = re.search(r'\.cd-items\s*\{([^}]+)\}', style)
ok &= must(bool(items), ".cd-items CSS rule exists")
if items:
    body = items.group(1)
    ok &= must("width: 100%" in body or "max-width: 100%" in body, "dropdown panel fits the column")

ok &= must(
    "grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr)" in style,
    "trait rows stay a 2-col grid",
)

# populateSelect still builds the picker and syncs the selected label.
ok &= must("className = 'custom-dropdown'" in populate, "populateSelect still wraps a custom-dropdown")
ok &= must("className = 'cd-selected trait-select'" in populate, "populateSelect still builds .cd-selected")
ok &= must("className = 'cd-items'" in populate, "populateSelect still builds the options panel")
ok &= must(
    "optionsContainer.style.display = isVisible ? 'none' : 'block'" in populate,
    "click still toggles the options panel open/close",
)
ok &= must(
    "document.querySelectorAll('.cd-items')" in populate,
    "opening one picker still closes the others",
)
ok &= must(
    "customSelected.textContent = sel.options[sel.selectedIndex].textContent" in populate,
    "populateSelect still syncs the visible value from the native select",
)
ok &= must(
    "sel.dispatchEvent(new Event('change'))" in populate,
    "picking an option still fires the native change handler",
)

# Product constraints: engines / Motus / export untouched.
ok &= must("function randomize()" in html and 'id="btn-generate"' in html, "Generate remains")
ok &= must("PlatenHyperspeed" in html and "iso_col" in html, "Motus / Elevate remain")
ok &= must("function savePNG()" in html and 'id="btn-out-png"' in html, "PNG export remains")
ok &= must("PLATEN BY DGLXSS" in html, "brand line keeps exact caps")

if not ok:
    sys.exit(1)
print("\nAll parameter-dropdown structural checks passed.")
