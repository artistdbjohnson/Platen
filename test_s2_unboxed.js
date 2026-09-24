#!/usr/bin/env node
/**
 * Runtime proof: S2 chips are the exact unique inks struck on the plate.
 * Chip count and hex set match the struck stroke hexes. No cap, no invented pads.
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
    extractFn("plateInkHexes"),
    extractFn("s2ChipFill"),
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

function sameHexSet(a, b) {
  const norm = (list) => list.map((h) => String(h).toUpperCase()).sort();
  const sa = norm(a);
  const sb = norm(b);
  return sa.length === sb.length && sa.every((h, i) => h === sb[i]);
}

function assertRenderedPlate(label, traits, seed, flowers) {
  const strokes = sandbox.struckInkHexes(flowers);
  const plate = sandbox.plateInkHexes(traits, seed, flowers);
  must(
    JSON.stringify(plate) === JSON.stringify(strokes),
    label + ": plate hex list === unique struck stroke hexes"
  );
  must(plate.length === strokes.length, label + ": chip count === unique struck count");
  must(sameHexSet(plate, strokes), label + ": chip hex set === unique struck stroke hex set");
  const parent = el("g");
  const drawn = sandbox.appendS2Unboxed(parent, {
    dc: sandbox.document,
    svgNS: "http://www.w3.org/2000/svg",
    headerData,
    hW: 77,
    hSizeX: 16,
    hSizeY: 26.6667,
    isGraphPaper: false,
    traits,
    seed,
    inkColor: "#1a1a1a",
    flowers,
  });
  must(!!drawn, label + ": rendered plate draws the unboxed chip group");
  const chips = drawn.children.filter((c) => c.attrs.class === "s2-chip");
  must(chips.length === strokes.length, label + ": drawn chip count === unique struck count");
  must(
    chips.map((c) => c.attrs.fill).join(" ") === strokes.join(" "),
    label + ": drawn fills are the struck hex strings"
  );
  must(
    chips.every((c) => c.attrs.fill === c.attrs["data-ink"]),
    label + ": data-ink matches the stroke hex"
  );
  const exported = chips.map((c) => sandbox.s2ChipFill(c));
  must(
    exported.join(" ") === strokes.join(" "),
    label + ": PNG/plotter s2ChipFill === unique struck stroke hexes"
  );
  must(sameHexSet(exported, strokes), label + ": export hex set === struck stroke hex set");
  return { strokes, chips, drawn };
}

// Struck-only: descending count, first-seen ties, f.c and cell.col.c, no pad, no cap.
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
  struck.every((hex) => micron.some((p) => p.toUpperCase() === hex.toUpperCase())),
  "struck micron chips are .c hexes from resolvePaletteEntry / inkHexesFromPalette"
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
const uncapped = sandbox.struckInkHexes(many);
must(uncapped.length === extras.length, "seventh unique struck ink is kept — no cap at five");
must(
  JSON.stringify(uncapped) === JSON.stringify(extras),
  "every struck hex is returned, highest count first"
);
must(uncapped[0] === "#18181A", "highest strike count leads the row");

const sparseFlowers = [
  { c: "#1D1D1D" },
  { c: "#1D1D1D" },
  { col: { c: "#1D1D1D" } },
];
const sparse = sandbox.plateInkHexes({ chromes: "typewriter_black" }, 7, sparseFlowers);
must(sparse.length === 1, "sparse chrome with one struck ink yields one chip");
must(sparse[0] === "#1D1D1D", "sparse chip is the struck carbon black, not unused greys");
must(
  sparse.length < black.length,
  "sparse struck set is not the full typewriter_black legend"
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
must(
  fatRibbon.every((hex) => ribbon.some((p) => p.toUpperCase() === hex.toUpperCase())),
  "fat ribbon chips are .c hexes from the live PALETTES helpers"
);
must(
  sparse.every((hex) => black.some((p) => p.toUpperCase() === hex.toUpperCase())),
  "sparse chips are .c hexes from the live PALETTES helpers"
);

const alien = sandbox.plateInkHexes(
  { chromes: "typewriter_black" },
  7,
  [{ c: "#FF00AA" }, { c: "#1D1D1D" }]
);
must(
  JSON.stringify(alien) === JSON.stringify(["#1D1D1D"]),
  "non-palette hexes are dropped; chips stay on the engine .c path"
);

const accent = sandbox.plateInkHexes(
  { chromes: "chopin" },
  3,
  [{ c: "#543355" }, { c: "#543355" }, { col: { c: "#543355" } }]
);
must(
  JSON.stringify(accent) === JSON.stringify(["#543355"]),
  "chopin overlap purple still chips when struck — variant flag does not gate ink"
);

const emptyFlowers = sandbox.plateInkHexes({ chromes: "bogolan" }, 1, []);
must(emptyFlowers.length === 0, "empty flowers show zero chips — no palette pads");
must(
  sandbox.plateInkHexes({ chromes: "bogolan" }, 1, null).length === 0,
  "missing flower set shows zero chips"
);
must(
  sandbox.plateInkHexes({ chromes: "typewriter_black" }, 7, [{ c: "#FF00AA" }]).length === 0,
  "an off-palette strike is not replaced with unused palette inks"
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
must(us.n === 5 && us.rows === 1, "five chips stay one row at the preferred size");
must(
  Math.abs(us.chip - Math.min(16 * 1.2, 20)) < 0.001,
  "a short row keeps the preferred chip size"
);

const dozen = [
  "#18181A", "#B82E2E", "#2B4570", "#236B3B", "#633924", "#5A3B73",
  "#CF597E", "#6B1F2B", "#1A4731", "#1C2638", "#1F5799", "#68A635",
];
const dozenFlowers = [];
dozen.forEach((hex, i) => {
  for (let n = 0; n < dozen.length - i; n++) dozenFlowers.push({ c: hex });
});
assertRenderedPlate("twelve struck inks", { chromes: "micron_plotter" }, 4242, dozenFlowers);

const allMicronFlowers = [];
micron.forEach((hex, i) => {
  for (let n = 0; n < micron.length - i; n++) allMicronFlowers.push({ c: hex });
});
assertRenderedPlate("full micron plate", { chromes: "micron_plotter" }, 4242, allMicronFlowers);
assertRenderedPlate("four struck micron", { chromes: "micron_plotter" }, 1, struckFlowers);
assertRenderedPlate("one struck carbon", { chromes: "typewriter_black" }, 7, sparseFlowers);

const dozenBox = sandbox.s2UnboxedLayout(headerData, 77, 16, 26.6667, false, 12);
must(!!dozenBox && dozenBox.n === 12 && dozenBox.rows === 1, "twelve chips stay on one US-letter row");

const squareBox = sandbox.s2UnboxedLayout(headerData, 58, 16, 16, false, 17);
must(!!squareBox && squareBox.n === 17, "square colophon keeps every micron strike");

const wrapped = sandbox.s2UnboxedLayout(headerData, 55, 16, 16, false, 40);
must(!!wrapped && wrapped.n === 40, "forty chips are laid out without dropping one");
must(wrapped.rows > 1, "a long row wraps instead of truncating");
must(wrapped.cols * wrapped.rows >= 40, "wrap grid has a cell for every chip");

const emptyParent = el("g");
must(
  sandbox.appendS2Unboxed(emptyParent, {
    dc: sandbox.document,
    svgNS: "http://www.w3.org/2000/svg",
    headerData,
    hW: 77,
    hSizeX: 16,
    hSizeY: 26.6667,
    isGraphPaper: false,
    traits: { chromes: "bogolan" },
    seed: 1,
    inkColor: "#1a1a1a",
    flowers: [],
  }) == null,
  "zero struck inks draw zero chips"
);
must(emptyParent.children.length === 0, "empty strike list adds no chip group");

const mixedCase = sandbox.struckInkHexes([{ c: "#B82E2E" }, { c: "#b82e2e" }, { c: "#B82E2E" }]);
must(
  mixedCase.length === 1 && mixedCase[0] === "#B82E2E",
  "case variants collapse to the first struck string"
);

console.log("\nAll S2 unboxed struck-specimen checks passed.");
