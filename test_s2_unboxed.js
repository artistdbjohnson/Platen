#!/usr/bin/env node
/**
 * Runtime proof: S2 chips are struck-only specimen inks, not a full palette legend.
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
    extractFn("flowerInkHex"),
    extractFn("struckInkHexes"),
    extractFn("paletteInkHexesByRank"),
    extractFn("plateInkHexes"),
    extractFn("s2UnboxedLayout"),
    extractFn("appendS2Unboxed"),
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

function hexesOf(name) {
  return sandbox.inkHexesFromPalette(sandbox.resolvePaletteEntry(name, 1));
}

const ribbon = hexesOf("typewriter_ribbon_multicolored");
const micron = hexesOf("micron_plotter");
const black = hexesOf("typewriter_black");
must(ribbon.length >= 6, "fat chrome typewriter_ribbon_multicolored has more than five palette entries");
must(micron.length >= 10, "fat chrome micron_plotter has a large unused palette");
must(black.length >= 3, "sparse chrome typewriter_black still has unused palette entries");

// Struck-only: descending count, first-seen ties, f.c and cell.col.c, no pad, cap 5.
const struckFlowers = [
  { c: "#B82E2E" },
  { col: { c: "#18181A" } },
  { c: "#B82E2E" },
  { c: "#236B3B" },
  { c: "#18181A" },
  { c: "#B82E2E" },
  { c: "#E8B723" },
];
const struck = sandbox.struckInkHexes(struckFlowers);
must(
  JSON.stringify(struck) ===
    JSON.stringify(["#B82E2E", "#18181A", "#236B3B", "#E8B723"]),
  "struck order is count desc, then first-seen; both f.c and cell.col.c count"
);
must(struck.length === 4, "N<5 is correct when fewer inks were struck");
must(
  struck.every((hex) => micron.indexOf(hex) !== -1),
  "struck hexes are real micron_plotter engine inks"
);
must(
  JSON.stringify(sandbox.plateInkHexes({ chromes: "micron_plotter" }, 1, struckFlowers)) ===
    JSON.stringify(struck),
  "plateInkHexes returns struck specimen, not the 17-color micron legend"
);
must(
  sandbox.plateInkHexes({ chromes: "micron_plotter" }, 1, struckFlowers).length < micron.length,
  "fat chrome chips are a struck subset, not the full palette"
);

const padded = sandbox.plateInkHexes({ chromes: "micron_plotter" }, 1, struckFlowers);
must(
  padded.length === struck.length,
  "unused palette entries are not padded onto the chip row"
);

const many = [];
const extras = ["#18181A", "#B82E2E", "#2B4570", "#236B3B", "#633924", "#5A3B73", "#CF597E"];
extras.forEach((hex, i) => {
  for (var n = 0; n < extras.length - i; n++) many.push({ c: hex });
});
const capped = sandbox.struckInkHexes(many);
must(capped.length === 5, "more than five unique struck inks still cap at five");
must(capped[0] === "#18181A", "highest strike count leads the row");

const sparseFlowers = [
  { c: "#1D1D1D" },
  { c: "#1D1D1D" },
  { col: { c: "#1D1D1D" } },
];
const sparse = sandbox.plateInkHexes({ chromes: "typewriter_black" }, 7, sparseFlowers);
must(sparse.length === 1, "sparse chrome with one struck ink yields one chip");
must(sparse[0] === "#1D1D1D", "sparse chip is the struck carbon black, not unused greys");
must(
  JSON.stringify(sparse) !== JSON.stringify(sandbox.paletteInkHexesByRank({ chromes: "typewriter_black" }, 7)),
  "sparse struck set is not the ranked full typewriter_black legend"
);

const fatRibbonFlowers = [
  { c: "#F9D949" },
  { c: "#1D1D1D" },
  { c: "#1D1D1D" },
  { c: "#7C2A24" },
  { c: "#1D1D1D" },
];
const fatRibbon = sandbox.plateInkHexes(
  { chromes: "typewriter_ribbon_multicolored" },
  11,
  fatRibbonFlowers
);
must(
  JSON.stringify(fatRibbon) === JSON.stringify(["#1D1D1D", "#F9D949", "#7C2A24"]),
  "fat ribbon chips match struck hexes in count/first-seen order"
);
must(fatRibbon.length === 3, "fat ribbon does not invent teal/sepia/blue unused inks");
must(
  fatRibbon.length < ribbon.length,
  "fat chrome specimen is shorter than the ribbon palette legend"
);

const emptyFallback = sandbox.plateInkHexes({ chromes: "bogolan" }, 1, []);
must(emptyFallback.length === 5, "empty flowers fall back to ranked palette .c, cap 5");
must(
  JSON.stringify(emptyFallback) ===
    JSON.stringify(["#272013", "#392f1b", "#a9a599", "#8c7c57", "#4b3f23"]),
  "bogolan fallback is unique .c sorted by descending .r, first-seen ties"
);
must(
  JSON.stringify(sandbox.plateInkHexes({ chromes: "bogolan" }, 1, null)) ===
    JSON.stringify(emptyFallback),
  "missing flower set uses the same empty-flower fallback"
);

const workerWay = sandbox.PALETTES.spectrum(777);
const helperWay = sandbox.resolvePaletteEntry("spectrum", 777);
must(
  JSON.stringify(sandbox.inkHexesFromPalette(workerWay)) ===
    JSON.stringify(sandbox.inkHexesFromPalette(helperWay)),
  "helper matches worker paletteEntry(seed) then .c hex list"
);

const title =
  "PLATEN" +
  " ".repeat(25) +
  "-  BY DGLXSS  -" +
  " ".repeat(20) +
  "SEED #4242";
const headerData = {
  lines: [
    "",
    title,
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

const us = sandbox.s2UnboxedLayout(headerData, 77, 16, 26.6667, false, 5);
must(!!us, "US-letter colophon has room for unboxed chips");
must(us.x > (43 + 4) * 16, "chips sit to the right of the LEVEL block");
must(us.y >= 2 * 26.6667, "chips sit under the SEED title row");
must(us.baseY < 9 * 26.6667 + 24, "baseline stays above the DATE line");
must(us.chip > 0, "chips are sized as squares");

const seedIdx = headerData.lines[1].lastIndexOf("SEED");
const seedX = (seedIdx + 4) * 16;
must(Math.abs(us.x - seedX) < 1, "chip row starts under SEED");

const tight = {
  lines: headerData.lines.map((line, i) =>
    i >= 3 && i <= 7 ? line.slice(0, 39).padEnd(39, "X") : line
  ),
};
must(sandbox.s2UnboxedLayout(tight, 39, 16, 16, false, 5) == null, "narrow LEVEL-full sheets skip S2");

const parent = el("g");
const drawn = sandbox.appendS2Unboxed(parent, {
  dc: sandbox.document,
  svgNS: "http://www.w3.org/2000/svg",
  headerData,
  hW: 77,
  hSizeX: 16,
  hSizeY: 26.6667,
  isGraphPaper: false,
  traits: { chromes: "micron_plotter" },
  seed: 4242,
  inkColor: "#1a1a1a",
  flowers: struckFlowers,
});

must(!!drawn, "appendS2Unboxed returns an unboxed group");
must(drawn.attrs.class === "s2-unboxed", "root group is s2-unboxed");
must(
  drawn.children.every((c) => c.attrs.class !== "s2-register"),
  "no chamber register rect"
);
must(
  drawn.children.every((c) => c.attrs.class !== "s2-divider"),
  "no chamber divider"
);
must(
  drawn.children.filter((c) => c.name === "rect").length === struck.length,
  "only struck chip rects are drawn — no chamber box, no padded extras"
);
must(drawn.children.some((c) => c.attrs.class === "s2-baseline"), "hairline baseline is present");

const chips = drawn.children.filter((c) => c.attrs.class === "s2-chip");
must(chips.length === 4, "fat micron specimen draws four struck squares");
must(
  chips.every((c) => c.attrs.width === c.attrs.height),
  "every chip is square"
);
must(
  chips.map((c) => c.attrs.fill).join(" ") === struck.join(" "),
  "chip fills are the struck micron hexes"
);

const baseline = drawn.children.find((c) => c.attrs.class === "s2-baseline");
must(baseline && baseline.name === "line", "baseline is a line, not a rect");
must(baseline.attrs["stroke-width"] === "1", "baseline is a 1px hairline");
must(baseline.attrs["vector-effect"] === "non-scaling-stroke", "baseline stays hairline when scaled");
must(
  Number(baseline.attrs.y1) > Number(chips[0].attrs.y) + Number(chips[0].attrs.height),
  "baseline sits beneath the chips"
);

must(
  drawn.children.every((c) => c.name !== "text"),
  "unboxed group contains no text"
);
must(!JSON.stringify(drawn).includes("SIGN"), "serialized group has no SIGN label");

const sparseParent = el("g");
const sparseDrawn = sandbox.appendS2Unboxed(sparseParent, {
  dc: sandbox.document,
  svgNS: "http://www.w3.org/2000/svg",
  headerData,
  hW: 77,
  hSizeX: 16,
  hSizeY: 26.6667,
  isGraphPaper: false,
  traits: { chromes: "typewriter_black" },
  seed: 7,
  inkColor: "#1a1a1a",
  flowers: sparseFlowers,
});
const sparseChips = sparseDrawn.children.filter((c) => c.attrs.class === "s2-chip");
must(sparseChips.length === 1, "sparse chrome draws one struck square");
must(sparseChips[0].attrs.fill === "#1D1D1D", "sparse chip fill is the struck hex");

const panelBox = sandbox.s2UnboxedLayout(headerData, 78, 16, 16, false, 3);
must(!!panelBox, "standard 78-col colophon also receives unboxed S2");

console.log("\nAll S2 unboxed struck-specimen checks passed.");
