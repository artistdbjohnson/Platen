#!/usr/bin/env node
/**
 * Runtime: generateNewPiece must preserve RESOLVED_TRAITS (no random re-roll).
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

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

function must(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exit(1);
  }
  console.log("OK:  ", msg);
}

const calls = [];
const sandbox = {
  window: {
    RESOLVED_TRAITS: {
      motif: "typewriter",
      chromes: "chopin",
      symmetry: "rotational",
    },
  },
  _lastRenderState: "stale-key",
  renderAll: function (preserveTraits) {
    calls.push({
      preserveTraits: preserveTraits,
      resolved: sandbox.window.RESOLVED_TRAITS
        ? sandbox.window.RESOLVED_TRAITS.motif
        : null,
    });
  },
  scrollStudioIntoView: function () {},
};
vm.createContext(sandbox);
vm.runInContext(extractFn("generateNewPiece"), sandbox);

sandbox.generateNewPiece();
must(calls.length === 1, "generate with RESOLVED_TRAITS calls renderAll once");
must(calls[0].preserveTraits === true, "generate passes preserveTraits=true when resolved traits exist");
must(sandbox._lastRenderState === null, "generate still clears _lastRenderState so the plate redraws");

sandbox.window.RESOLVED_TRAITS = null;
sandbox._lastRenderState = "stale-again";
sandbox.generateNewPiece();
must(calls.length === 2, "generate without RESOLVED_TRAITS still renders once");
must(
  calls[1].preserveTraits === undefined || calls[1].preserveTraits === false,
  "first resolve path does not pass preserveTraits"
);
must(sandbox._lastRenderState === null, "unresolved generate still clears _lastRenderState");

must(html.indexOf("function randomize()") !== -1, "randomize remains");
must(html.indexOf("function regenerate()") !== -1, "new seed remains");

console.log("\nAll generate-preserve runtime checks passed.");
