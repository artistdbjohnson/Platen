#!/usr/bin/env node
/**
 * Runtime checks for ELEVATE mechanical helpers extracted from index.html.
 */
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function extractFn(name) {
  const start = html.indexOf('function ' + name);
  if (start < 0) throw new Error('missing ' + name);
  let i = html.indexOf('{', start);
  let depth = 0;
  for (; i < html.length; i++) {
    if (html[i] === '{') depth++;
    else if (html[i] === '}') {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  throw new Error('unclosed ' + name);
}

const src = [
  extractFn('_mechEase'),
  extractFn('_isoLevelFromF'),
  extractFn('_isoLatchLevel'),
  extractFn('_ribbonInk'),
].join('\n');

const fns = new Function(src + '; return { _mechEase, _isoLevelFromF, _isoLatchLevel, _ribbonInk };')();
const { _mechEase, _isoLevelFromF, _isoLatchLevel, _ribbonInk } = fns;

function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
  console.log('OK:  ', msg);
}

assert(_mechEase(0) === 0 && _mechEase(1) === 1, 'ease endpoints pin to 0/1');
assert(_mechEase(0.5) === 0.5, 'ease midpoint stays 0.5 (symmetric)');
assert(_mechEase(0.25) < 0.25, 'ease is slow out of rest (weighty start)');
assert(_mechEase(0.75) > 0.75, 'ease commits through the mid-stroke');

assert(_isoLevelFromF(0.2) === 0 && _isoLevelFromF(0.4) === 1, 'five-band floors match getTypewriterGlyphs');
assert(_isoLevelFromF(0.6) === 2 && _isoLevelFromF(0.7) === 3 && _isoLevelFromF(0.9) === 4, 'upper density bands map');

const e = {};
assert(_isoLatchLevel(e, 0.9, 0) === 4, 'first sample latches immediately');
assert(_isoLatchLevel(e, 0.2, 0.05) === 4, 'short dwell does not pop down five bands');
assert(_isoLatchLevel(e, 0.2, 0.30) === 3, 'after dwell, slug steps one band only');
assert(_isoLatchLevel(e, 0.2, 0.55) === 2, 'second dwell steps again — mechanical, not flicker');

const inkLo = _ribbonInk(0, 0);
const inkHi = _ribbonInk(1, 1);
assert(inkLo >= 0.62 && inkLo < 0.8, 'starved ribbon still has mass');
assert(inkHi <= 1 && inkHi > 0.9, 'full ribbon stays near opaque');
assert(inkHi > inkLo, 'ink density tracks field weight');

console.log('\nAll Motus motion math checks passed.');
