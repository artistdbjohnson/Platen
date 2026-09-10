#!/usr/bin/env python3
"""Structural checks for Platen sparse light / dark chrome."""

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

ok &= must("platen_ui_mode" in html, "preference is persisted as platen_ui_mode")
ok &= must("function applyTheme(" in html and "function isIndexMode(" in html, "applyTheme / isIndexMode exist")
ok &= must("function normalizeUiMode(" in html, "normalizeUiMode maps studio/index to dark/light")
ok &= must("function toggleTheme(" in html and "function syncThemeToggle(" in html, "toggleTheme still exists and syncs labels")
ok &= must('localStorage.setItem(\'platen_ui_mode\'' in html or 'localStorage.setItem("platen_ui_mode"' in html, "applyTheme writes localStorage")
ok &= must("localStorage.getItem('platen_ui_mode')" in html, "boot script reads platen_ui_mode before paint")
ok &= must("setAttribute('data-theme', 'light')" in html, "light mode sets data-theme=light")
ok &= must("setAttribute('data-theme', next)" in html, "dark/light writes data-theme from the normalized key")
ok &= must("setAttribute('data-theme', next)" in html, "applyTheme writes data-theme light/dark")
boot = html.split("<script>", 1)[1].split("</script>", 1)[0]
ok &= must(
    "mode === 'studio'" in boot or 'mode === "studio"' in boot,
    "pre-paint boot honors saved studio as dark",
)
ok &= must(
    "mode === 'dark'" in boot and "next = (mode === 'studio' || mode === 'dark') ? 'dark' : 'light'" in boot,
    "missing platen_ui_mode boots light, not dark",
)
ok &= must(
    "mode === 'studio' || mode === 'index'" in boot,
    "boot migrates old studio/index keys on read",
)
ok &= must(
    'data-theme="light"' in html.split("<head>", 1)[0] and 'data-ui="light"' in html.split("<head>", 1)[0],
    "html tag paints light before any script so first visit has no dark flash",
)
ok &= must("class=\"brand-lockup\"" in html and "PLATEN BY DGLXSS" in html, "brand lockup keeps exact PLATEN BY DGLXSS casing")
ok &= must(
    '">auto cycle</span>' in html and "text-transform: uppercase" not in html.split('">auto cycle</span>')[0][-180:],
    "auto cycle label has no inline uppercase",
)
ok &= must(
    "include bg texture" in html
    and "text-transform: uppercase" not in html.split("include bg texture")[0][-180:],
    "include bg texture label is lowercase",
)
ok &= must(">verso</button>" in html and ">recto</button>" in html, "flip labels are verso/recto")
ok &= must("btn.textContent = 'verso'" in html and "btn.textContent = 'recto'" in html, "layout sync keeps flip labels lowercase")
ok &= must(
    "text-transform: lowercase !important" in html
    and re.search(r'\.btn-flip[^{]*\{[^}]*text-transform:\s*lowercase', html) is not None,
    "flip chrome is forced lowercase, not exempted",
)
ok &= must(
    "text-transform: lowercase !important" in html
    and ".brand-lockup" in html,
    "chrome is lowercase with a brand-lockup exception",
)
ok &= must(
    ".generate-dock > .ui-mode-nav" in html
    and ".generate-dock > .btn-generate" in html,
    "mobile hides the duplicate dock generate / mode block",
)
ok &= must("function thinLockMarkup" in html and "lock-mark" in html, "palette lock uses a thin line mark, not emoji")
ok &= must("🔒" not in html and "🔓" not in html and "💎" not in html, "rosy chrome has no lock/gem emoji")
ok &= must(
    re.search(r'\.trait-label\s*\{[^}]*font-size:\s*8px', html)
    and re.search(r'\.trait-select\s*\{[^}]*font-size:\s*8px', html),
    "parameter labels and values are 8px, smaller than primary actions",
)
ok &= must(
    "#palette-lock-details" in html
    and "font-size: 8px !important" in html,
    "lock helper copy is secondary 8px",
)
ok &= must("class=\"ui-mode-nav\"" in html and 'data-ui-mode="dark"' in html and 'data-ui-mode="light"' in html, "dark / light text toggle is in the markup")
ok &= must(html.count('data-ui-mode="light"') >= 3, "light toggle is available in more than one column")
ok &= must(html.count(">dark</button>") >= 3 and html.count(">light</button>") >= 3, "toggle copy is lowercase dark / light")
ok &= must('data-ui-mode="studio"' not in html and 'data-ui-mode="index"' not in html, "studio / index labels are gone from the toggle")
ok &= must("☀︎ Toggle Theme" not in html, "sun-pill theme button copy is gone")
ok &= must("☼" not in html and "☾" not in html, "toggle has no sun/moon emoji")

light = re.search(r'\[data-theme="light"\]\s*\{([^}]+)\}', html)
ok &= must(bool(light), "light token block exists")
if light:
    tokens = light.group(1)
    ok &= must("--bg: #ffffff" in tokens or "--bg: #fff" in tokens, "light background token is pure white")
    ok &= must("--text: #000000" in tokens or "--text: #000" in tokens, "light text token is pure black")
    ok &= must("#f5f5f5" not in tokens, "light tokens no longer use gray page fill")
    ok &= must("#A0A1A7" not in tokens and "#383A42" not in tokens, "light tokens drop gray syntax colors")
    ok &= must("--code-kw: #000000" in tokens or "--code-kw: #000" in tokens, "light code tokens are black")

dark = re.search(r'\[data-theme="dark"\]\s*\{([^}]+)\}', html)
ok &= must(bool(dark), "dark token block exists")
if dark:
    tokens = dark.group(1)
    ok &= must("--bg: #000000" in tokens or "--bg: #000" in tokens, "dark background token is pure black")
    ok &= must("--text: #ffffff" in tokens or "--text: #fff" in tokens, "dark text token is pure white")
    ok &= must("#151515" not in tokens and "#DEE4D7" not in tokens, "dark tokens drop leftover studio gray")
    ok &= must("#f5f5f5" not in tokens and "#A0A1A7" not in tokens, "dark tokens have no gray")
    ok &= must("--code-kw: #ffffff" in tokens or "--code-kw: #fff" in tokens, "dark code tokens are white")

chrome_css = html.split("INDEX / LIGHT MODE", 1)[1].split("</style>", 1)[0] if "INDEX / LIGHT MODE" in html else ""
ok &= must(bool(chrome_css), "sparse chrome CSS block is present")
if chrome_css:
    hexes = set(re.findall(r"#[0-9A-Fa-f]{3,8}", chrome_css))
    ok &= must(hexes <= {"#ffffff", "#000000", "#fff", "#000"}, "sparse chrome CSS uses only #fff / #000 if it uses hex at all")
    ok &= must("#171717" not in chrome_css and "#666" not in chrome_css and "#1a1a1a" not in chrome_css, "sparse chrome has no soft gray foreground")
    ok &= must("-webkit-text-fill-color: var(--text)" in chrome_css, "sparse UI text fill follows the theme token")
    ok &= must(
        "html[data-theme=\"light\"]" in html and "JetBrains Mono" in chrome_css,
        "sparse chrome forces JetBrains Mono on div chrome",
    )
    ok &= must("html[data-theme=\"dark\"]" in chrome_css, "dark mode shares the sparse chrome rules")

ok &= must("#171717" not in html.split("[data-theme=\"light\"]", 1)[1].split("</style>", 1)[0] if "[data-theme=\"light\"]" in html else True, "light stylesheet never uses #171717")

ok &= must("html[data-theme=\"light\"]" in html and "JetBrains Mono" in html, "light mode forces JetBrains Mono")
ok &= must(
    "html[data-theme=\"dark\"]" in html
    and "background: transparent !important" in html
    and "border: none !important" in html,
    "sparse chrome strips button fill and border",
)
ok &= must(
    "button.active" in chrome_css
    and "text-decoration: underline !important" in chrome_css
    and "box-shadow: none !important" in chrome_css,
    "selected state is underline / weight, not a box",
)
ok &= must(
    ".cd-selected" in chrome_css
    and ".cd-items" in chrome_css,
    "sparse chrome restyles parameter dropdowns as text",
)

# Selected parameter values: slightly bold, not underlined.
param_selected = None
for m in re.finditer(
    r'\.trait-select,\s*[^/{]*\.cd-selected\s*\{([^}]+)\}',
    html,
):
    block = m.group(1)
    if "font-weight" in block and "text-decoration" in block:
        param_selected = block
        break
ok &= must(param_selected is not None, "parameter selected-value rule exists")
if param_selected:
    ok &= must(
        "text-decoration: none" in param_selected,
        "selected parameter values are not underlined",
    )
    ok &= must(
        "text-decoration: underline" not in param_selected,
        "selected parameter values do not use underline chrome",
    )
    ok &= must(
        "font-weight: 500" in param_selected or "font-weight: 600" in param_selected,
        "selected parameter values are slightly bold",
    )
ok &= must(
    ".fs-hud" in chrome_css
    and ".saved-solo-backdrop" in chrome_css,
    "sparse chrome covers fullscreen HUD and saved solo",
)
ok &= must(
    "#canvas-wrap" in chrome_css
    and ".platen-panel" in chrome_css
    and ".platen-face" in chrome_css
    and "box-shadow: none !important" in chrome_css,
    "sparse chrome kills plate box-shadow on canvas-wrap / platen-panel / platen-face",
)
ok &= must(
    "targetEl.style.boxShadow = 'none'" in html
    or 'targetEl.style.boxShadow = "none"' in html,
    "US Letter paper shadow is skipped in both sparse themes",
)
ok &= must(
    "indexPlate ? 'none' : '0 8px 24px rgba(0,0,0,0.06)'" not in html
    and 'indexPlate ? "none" : "0 8px 24px rgba(0,0,0,0.06)"' not in html,
    "studio-only plate drop shadow is gone",
)

# Existing product surfaces must remain wired — chrome only.
ok &= must('id="btn-generate"' in html and "function randomize()" in html, "Generate / randomize remains")
ok &= must('id="btn-curate"' in html and "function setSaveButtonsState" in html, "Save remains")
ok &= must('id="btn-hyperspeed"' in html and "PlatenHyperspeed.toggle()" in html, "Motus toggle remains")
ok &= must("PlatenHyperspeed.setMode('iso_col')" in html, "Elevate / iso_col remains selectable")
ok &= must("function savePNG()" in html and 'id="btn-out-png"' in html, "PNG export remains")
ok &= must("function renderSavedInline" in html and "function openSavedSolo" in html, "masonry / solo remains")
ok &= must("getAttribute('data-theme') !== 'light'" in html, "verso / night paper still keys off data-theme")

theme_btn = re.search(r'<button[^>]+id="btn-theme"[^>]*>', html)
ok &= must(theme_btn and "ui-mode-link" in theme_btn.group(0) and "light" in theme_btn.group(0), "btn-theme is a text light mode link")

if not ok:
    sys.exit(1)
print("\nAll index-mode structural checks passed.")
