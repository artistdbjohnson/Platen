#!/usr/bin/env python3
"""Structural checks: phones must not inherit the desktop 3-column shell."""

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

# Default .index-grid (before any min-width: 901px) must be a column stack,
# not the 480px + 480px desktop tracks. Those tracks inflate iOS viewports.
default_grid = re.search(r'\.index-grid\s*\{([^}]+)\}', style)
ok &= must(bool(default_grid), "default .index-grid rule exists")
if default_grid:
    body = default_grid.group(1)
    ok &= must("display: flex" in body, "default index-grid is flex, not desktop grid")
    ok &= must("flex-direction: column" in body, "default index-grid stacks in one column")
    ok &= must("480px" not in body, "default index-grid does not declare 480px tracks")
    ok &= must("100vw" not in body, "default index-grid uses width 100%, not 100vw")

desktop_shell = [
    m for m in re.finditer(
        r'@media \(min-width: 901px\) \{',
        style,
    )
]
ok &= must(bool(desktop_shell), "desktop min-width: 901px query exists")

# The 480+480 grid may only appear inside a min-width: 901px block.
for m in re.finditer(r'grid-template-columns:\s*480px 480px 1fr', style):
    before = style[: m.start()]
    last_min = before.rfind("@media (min-width: 901px)")
    last_max = max(before.rfind("@media (max-width: 900px)"), before.rfind("@media (max-device-width"))
    ok &= must(
        last_min > last_max,
        "480px + 480px tracks sit inside min-width: 901px, not the default or a 900px query",
    )

ok &= must(
    "max-device-width: 900px" in style,
    "phone stack also keys off max-device-width so an inflated CSS viewport still matches",
)
ok &= must(
    "classList.add('is-phone')" in html or 'classList.add("is-phone")' in html,
    "boot script marks real phones from screen.width before first paint",
)
ok &= must(
    "function syncPhoneLayoutClass" in html and "html.is-phone .index-grid" in html,
    "is-phone class forces the single-column stack over an inflated desktop grid",
)
ok &= must(
    "html.is-phone .index-grid" in style
    and "grid-template-columns: none !important" in style,
    "is-phone kills leftover desktop grid tracks",
)
ok &= must(
    "html.is-phone .col-about" in style and "height: auto !important" in style,
    "is-phone clears 100dvh column heights that create the empty gap above Saved",
)

# Desktop shell still intact at ≥901px.
desktop_blocks = re.findall(r'@media \(min-width: 901px\) \{(.*?)(?=\n        @media|\n        html\.is-phone|\n    </style>)', style, re.S)
ok &= must(
    any("grid-template-columns: 480px 480px 1fr" in block for block in desktop_blocks),
    "desktop ≥901px still uses the 3-column 480px + 480px + 1fr grid",
)
ok &= must(
    any(re.search(r'\.col-about\s*\{[^}]*height:\s*100dvh', block) for block in desktop_blocks),
    "desktop ≥901px still gives about/controls 100dvh",
)

# Product constraints must stay wired.
ok &= must("function generateNewPiece()" in html and "scrollStudioIntoView()" in html, "Generate snap remains")
ok &= must("PlatenHyperspeed" in html and "iso_col" in html, "Motus / Elevate remain")
ok &= must("PLATEN_EXPORT_DPI = 300" in html, "300 DPI PNG export remains")
ok &= must(
    'html[data-theme="light"] #canvas-wrap' in html
    and "box-shadow: none !important" in style,
    "index plate still has no drop shadow",
)
ok &= must("PLATEN BY DGLXSS" in html and "brand-lockup" in html, "brand line keeps exact caps")
ok &= must(
    "html[data-theme=\"light\"] .generate-dock > .btn-generate" in style
    and "display: none !important" in style,
    "index+phone hides the second Generate/Save in the dock",
)
ok &= must(
    ".col-about > .ui-mode-nav" in style and ".ui-mode-section" in style,
    "extra studio/index navs can be hidden so only one placement remains",
)
boot = html.split("<script>", 1)[1].split("</script>", 1)[0]
ok &= must("mode === 'studio'" in boot, "first visit with no platen_ui_mode boots index/light")

if not ok:
    sys.exit(1)
print("\nAll mobile-stack structural checks passed.")
