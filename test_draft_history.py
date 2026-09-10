#!/usr/bin/env python3
"""Structural checks: draft history stores the plate that was actually rendered."""

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

ok &= must("function checkAndSaveDraft" in html, "draft save helper exists")
ok &= must("function renderDraftHistoryUI" in html, "draft list renderer exists")
ok &= must("function loadDraftIntoWorkspace" in html, "draft restore exists")
ok &= must("function clearDraftHistory" in html, "clear drafts exists")
ok &= must("platen_draft_history" in html, "drafts persist in localStorage")
ok &= must("history.slice(0, 24)" in html, "history keeps the last 24")

save = html.split("function checkAndSaveDraft", 1)[1].split("function renderDraftHistoryUI", 1)[0]
ok &= must("RESOLVED_TRAITS" in save, "draft save reads resolved traits, not TRAITS placeholders")
ok &= must("JSON.stringify(TRAITS)" not in save or "RESOLVED_TRAITS" in save.split("JSON.stringify")[0], "draft snapshot prefers the resolved render pass")
ok &= must("source.chromes === 'random'" in save, "unresolved random chrome is not stored")
ok &= must("ink:" in save or "ink =" in save, "draft record stores resolved ink hexes")
ok &= must("function resolvePaletteEntry" in html, "palette resolve helper exists")
ok &= must("paletteEntry(seed)" in html, "function palettes are called with the draft seed")
ok &= must("function inkHexesFromPalette" in html, "ink hex extractor exists")
ok &= must("item.c" in html.split("function inkHexesFromPalette", 1)[1][:800], "ink extractor reads palette .c hexes")

restore = html.split("function loadDraftIntoWorkspace", 1)[1].split("function clearDraftHistory", 1)[0]
ok &= must("RENDER_SEED = draft.seed" in restore, "restore writes the draft seed")
ok &= must("TRAITS = JSON.parse(JSON.stringify(draft.traits))" in restore, "restore writes draft traits")
ok &= must("currentLayout = draft.layout" in restore, "restore writes draft layout")
ok &= must("renderAll()" in restore, "restore re-renders the plate")
ok &= must("_lastRenderState = null" in restore, "restore forces a deterministic replay")
ok &= must("_loadingDraft = true" in restore, "restore does not invent a stale history row")

ui = html.split("function renderDraftHistoryUI", 1)[1].split("function loadDraftIntoWorkspace", 1)[0]
ok &= must("resolveDraftInkHexes" in ui, "swatches use the seed-resolved ink list")
ok &= must("palette.strokes" not in ui, "swatch path no longer only reads static .strokes")
ok &= must("draft-history-dot" in ui, "swatches are sparse dots")
ok &= must("borderRadius = '4px'" not in ui, "rows are not painted as boxed cards in JS")
ok &= must("rgba(255,255,255,0.01)" not in ui, "rows do not use gray card fills")

style = html.split("<style>", 1)[1].split("</style>", 1)[0]
ok &= must(".draft-history-row" in style and "border: none" in style, "draft rows follow sparse chrome")
ok &= must(".draft-history-dot" in style, "dot chrome exists")

ok &= must("function randomize()" in html, "randomize remains")
ok &= must("function regenerate()" in html, "new seed remains")
ok &= must("function generateNewPiece()" in html, "generate remains")
ok &= must("if (typeof checkAndSaveDraft === 'function') checkAndSaveDraft()" in html, "successful renders append a draft")

if not ok:
    sys.exit(1)
print("\nAll draft-history structural checks passed.")
