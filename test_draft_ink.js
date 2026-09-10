#!/usr/bin/env node
/**
 * Prove draft swatches resolve ink the same way the worker does,
 * including seed-dependent function palettes.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const core = fs.readFileSync(path.join(__dirname, "js/platen-core.js"), "utf8");
const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");

function extractFn(name) {
  const start = html.indexOf("function " + name);
  if (start < 0) throw new Error("missing " + name);
  let i = html.indexOf("{", start);
  let depth = 0;
  for (; i < html.length; i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  throw new Error("unclosed " + name);
}

const sandbox = { console, window: {} };
vm.createContext(sandbox);
vm.runInContext(core + "\nwindow.PALETTES = PALETTES;", sandbox);
vm.runInContext(
  extractFn("resolvePaletteEntry") + "\n" + extractFn("inkHexesFromPalette"),
  sandbox
);

function must(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("OK:  ", msg);
}

const chopin = sandbox.inkHexesFromPalette(
  sandbox.resolvePaletteEntry("chopin", 1)
);
must(chopin.length >= 3, "static chopin palette yields ink hexes");
must(
  chopin.every((c) => /^#[0-9A-Fa-f]{6}$/.test(c)),
  "chopin hexes are real #rrggbb values"
);
must(chopin.indexOf("#C02F2C") !== -1, "chopin includes ribbon red used on the plate");

const a = sandbox.inkHexesFromPalette(sandbox.resolvePaletteEntry("spectrum", 4242));
const b = sandbox.inkHexesFromPalette(sandbox.resolvePaletteEntry("spectrum", 98989));
must(a.length >= 3, "spectrum(seed A) resolves to ink hexes");
must(b.length >= 3, "spectrum(seed B) resolves to ink hexes");
must(
  a.every((c) => /^#[0-9A-Fa-f]{3,8}$/.test(c)),
  "spectrum hexes are real color tokens"
);
must(JSON.stringify(a) !== JSON.stringify(b), "function palette ink follows the draft seed");

const workerWay = sandbox.PALETTES.spectrum(777);
const helperWay = sandbox.resolvePaletteEntry("spectrum", 777);
must(
  JSON.stringify(sandbox.inkHexesFromPalette(workerWay)) ===
    JSON.stringify(sandbox.inkHexesFromPalette(helperWay)),
  "helper matches worker paletteEntry(seed) then .c hex list"
);

const missing = sandbox.inkHexesFromPalette(sandbox.resolvePaletteEntry("not-a-chrome", 1));
must(missing.length > 0, "unknown chrome falls back to panar ink, not empty dots");

console.log("\nAll draft-ink runtime checks passed.");
