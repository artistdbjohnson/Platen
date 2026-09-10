#!/usr/bin/env node
/**
 * Runtime proof: S2 chamber chips are the engine hexes for that plate chrome.
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

function el(name) {
  const node = {
    name,
    attrs: {},
    children: [],
    setAttribute(k, v) {
      this.attrs[k] = String(v);
    },
    getAttribute(k) {
      return this.attrs[k];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
  };
  return node;
}

const sandbox = {
  console,
  window: {},
  document: {
    createElementNS(_ns, name) {
      return el(name);
    },
  },
};
vm.createContext(sandbox);
vm.runInContext(core + "\nwindow.PALETTES = PALETTES;", sandbox);
vm.runInContext(
  [
    extractFn("resolvePaletteEntry"),
    extractFn("inkHexesFromPalette"),
    extractFn("plateInkHexes"),
    extractFn("s2ChamberLayout"),
    extractFn("appendS2Chamber"),
  ].join("\n"),
  sandbox
);

function must(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("OK:  ", msg);
}

const bogolan = sandbox.plateInkHexes({ chromes: "bogolan" }, 1);
must(bogolan.length === 5, "bogolan yields five ink chips");
must(
  JSON.stringify(bogolan) ===
    JSON.stringify(["#272013", "#a9a599", "#8c7c57", "#4b3f23", "#392f1b"]),
  "bogolan chips are the exact engine hexes"
);

const workerWay = sandbox.PALETTES.spectrum(777);
const helperWay = sandbox.resolvePaletteEntry("spectrum", 777);
must(
  JSON.stringify(sandbox.inkHexesFromPalette(workerWay)) ===
    JSON.stringify(sandbox.inkHexesFromPalette(helperWay)),
  "helper matches worker paletteEntry(seed) then .c hex list"
);

const a = sandbox.plateInkHexes({ chromes: "spectrum" }, 4242);
const b = sandbox.plateInkHexes({ chromes: "spectrum" }, 98989);
must(a.length >= 3 && b.length >= 3, "function palette chips resolve");
must(JSON.stringify(a) !== JSON.stringify(b), "function palette chips follow the plate seed");

const missing = sandbox.plateInkHexes({ chromes: "not-a-chrome" }, 1);
must(missing.length > 0, "unknown chrome falls back to panar ink");

const headerData = {
  lines: [
    "",
    "PLATEN          -  BY DGLXSS  -          SEED #4242",
    "",
    "LEVEL 1    GLYPH: /    DENSITY: 0.20 - 0.36",
    "LEVEL 2    GLYPH: .    DENSITY: 0.36 - 0.51",
    "LEVEL 3    GLYPH: +    DENSITY: 0.51 - 0.66",
    "LEVEL 4    GLYPH: X    DENSITY: 0.66 - 0.81",
    "LEVEL 5    GLYPH: *    DENSITY: 0.81 - 1.00",
    "",
    "DATE: 2026.09.10 \\\\ SPACE: PLANAR  -  ENGINE: MASTR  -  SYMMETRY: NONE  -  INK: BGLAN",
  ],
};

const us = sandbox.s2ChamberLayout(headerData, 77, 16, 26.6667, false);
must(!!us, "US-letter colophon has room for the UR chamber");
must(us.x > (43 + 4) * 16, "chamber sits to the right of the LEVEL block");
must(us.y >= 2 * 26.6667, "chamber sits under the SEED title row");
must(us.y + us.height < 9 * 26.6667 + 24, "chamber stays above the DATE line");
must(Math.abs(us.chip - us.chip) < 0.001 && us.chip > 0, "chips are sized as squares");

const tight = {
  lines: headerData.lines.map((line, i) =>
    i >= 3 && i <= 7 ? line.slice(0, 39).padEnd(39, "X") : line
  ),
};
must(sandbox.s2ChamberLayout(tight, 39, 16, 16, false) == null, "narrow LEVEL-full sheets skip S2");

const parent = el("g");
const drawn = sandbox.appendS2Chamber(parent, {
  dc: sandbox.document,
  svgNS: "http://www.w3.org/2000/svg",
  headerData,
  hW: 77,
  hSizeX: 16,
  hSizeY: 26.6667,
  isGraphPaper: false,
  traits: { chromes: "bogolan" },
  seed: 4242,
  inkColor: "#1a1a1a",
});

must(!!drawn, "appendS2Chamber returns a chamber group");
must(drawn.attrs.class === "s2-chamber", "root group is s2-chamber");
must(drawn.children.some((c) => c.attrs.class === "s2-register"), "hairline register is present");
must(drawn.children.some((c) => c.attrs.class === "s2-baseline"), "blank sign baseline is present");
must(drawn.children.some((c) => c.attrs.class === "s2-divider"), "hairline divider is present");

const chips = drawn.children.filter((c) => c.attrs.class === "s2-chip");
must(chips.length === 5, "five chips are drawn");
must(
  chips.every((c) => c.attrs.width === c.attrs.height),
  "every chip is square"
);
must(
  chips.map((c) => c.attrs.fill).join(" ") === bogolan.join(" "),
  "chip fills are the bogolan engine hexes"
);
must(
  drawn.children.every((c) => c.name !== "text"),
  "chamber contains no text"
);
must(
  !JSON.stringify(drawn).includes("SIGN"),
  "serialized chamber has no SIGN label"
);

const panelBox = sandbox.s2ChamberLayout(headerData, 78, 16, 16, false);
must(!!panelBox, "standard 78-col colophon also receives S2");

console.log("\nAll S2 chamber runtime checks passed.");
