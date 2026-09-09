#!/usr/bin/env python3
"""Structural checks for Platen index / light mode."""

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

ok &= must("platen_ui_mode" in html, "index preference is persisted as platen_ui_mode")
ok &= must("function applyTheme(" in html and "function isIndexMode(" in html, "applyTheme / isIndexMode exist")
ok &= must("function toggleTheme(" in html and "function syncThemeToggle(" in html, "toggleTheme still exists and syncs labels")
ok &= must('localStorage.setItem(\'platen_ui_mode\'' in html or 'localStorage.setItem("platen_ui_mode"' in html, "applyTheme writes localStorage")
ok &= must("localStorage.getItem('platen_ui_mode')" in html, "boot script reads platen_ui_mode before paint")
ok &= must('data-ui' in html and "setAttribute('data-ui', 'index')" in html, "index mode sets data-ui=index")
ok &= must("setAttribute('data-theme', 'light')" in html, "index mode keeps data-theme=light for existing night checks")
ok &= must("class=\"ui-mode-nav\"" in html and 'data-ui-mode="studio"' in html and 'data-ui-mode="index"' in html, "studio / index text toggle is in the markup")
ok &= must(html.count('data-ui-mode="index"') >= 3, "index toggle is available in more than one column")
ok &= must("☀︎ Toggle Theme" not in html, "sun-pill theme button copy is gone")

light = re.search(r'\[data-theme="light"\]\s*\{([^}]+)\}', html)
ok &= must(bool(light), "light / index token block exists")
if light:
    tokens = light.group(1)
    ok &= must("--bg: #ffffff" in tokens or "--bg: #fff" in tokens, "index background token is pure white")
    ok &= must("--text: #000000" in tokens or "--text: #000" in tokens, "index text token is pure black")
    ok &= must("#f5f5f5" not in tokens, "index tokens no longer use gray page fill")
    ok &= must("#A0A1A7" not in tokens and "#383A42" not in tokens, "index tokens drop gray syntax colors")
    ok &= must("--code-kw: #000000" in tokens or "--code-kw: #000" in tokens, "index code tokens are black")

index_css = html.split("INDEX / LIGHT MODE", 1)[1].split("</style>", 1)[0] if "INDEX / LIGHT MODE" in html else ""
ok &= must(bool(index_css), "index CSS block is present")
if index_css:
    hexes = set(re.findall(r"#[0-9A-Fa-f]{3,8}", index_css))
    ok &= must(hexes <= {"#ffffff", "#000000", "#fff", "#000"}, "index CSS uses only #ffffff / #000000")
    ok &= must("#171717" not in index_css and "#666" not in index_css and "#1a1a1a" not in index_css, "index CSS has no soft gray foreground")

ok &= must("html[data-theme=\"light\"]" in html and "JetBrains Mono" in html, "index mode forces JetBrains Mono")
ok &= must(
    "html[data-theme=\"light\"] button" in html
    and "background: transparent !important" in html
    and "border: none !important" in html,
    "index mode strips button fill and border chrome",
)
ok &= must(
    "html[data-theme=\"light\"] button.active" in html
    and "text-decoration: underline !important" in html
    and "box-shadow: none !important" in html,
    "index selected state is underline / weight, not a box",
)
ok &= must(
    "html[data-theme=\"light\"] .cd-selected" in html
    and "html[data-theme=\"light\"] .cd-items" in html,
    "index mode restyles parameter dropdowns as text",
)
ok &= must(
    "html[data-theme=\"light\"] .fs-hud" in html
    and "html[data-theme=\"light\"] .saved-solo-backdrop" in html,
    "index mode covers fullscreen HUD and saved solo chrome",
)

# Existing product surfaces must remain wired — chrome only.
ok &= must('id="btn-generate"' in html and "function randomize()" in html, "Generate / randomize remains")
ok &= must('id="btn-curate"' in html and "function setSaveButtonsState" in html, "Save remains")
ok &= must('id="btn-hyperspeed"' in html and "PlatenHyperspeed.toggle()" in html, "Motus toggle remains")
ok &= must("PlatenHyperspeed.setMode('iso_col')" in html, "Elevate / iso_col remains selectable")
ok &= must("function savePNG()" in html and 'id="btn-out-png"' in html, "PNG export remains")
ok &= must("function renderSavedInline" in html and "function openSavedSolo" in html, "masonry / solo remains")
ok &= must("getAttribute('data-theme') !== 'light'" in html, "verso / night paper still keys off data-theme")

# No leftover sun-button label on the theme control.
theme_btn = re.search(r'<button[^>]+id="btn-theme"[^>]*>', html)
ok &= must(theme_btn and "ui-mode-link" in theme_btn.group(0), "btn-theme is now a text mode link")

if not ok:
    sys.exit(1)
print("\nAll index-mode structural checks passed.")
