#!/usr/bin/env node
/**
 * Runtime proof: solo paints SVG; download is archival PNG; masonry stays JPEG.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const PORT = 8765;
const OUT = path.join(ROOT, 'solo-download-proof.json');
const PUPPETEER_ROOT = '/tmp/platen-puppeteer';

function must(cond, msg) {
  console.log((cond ? 'OK:  ' : 'FAIL:') + ' ' + msg);
  if (!cond) process.exitCode = 1;
  return cond;
}

function ensurePuppeteer() {
  const candidate = path.join(PUPPETEER_ROOT, 'node_modules', 'puppeteer-core');
  if (fs.existsSync(candidate)) return candidate;
  console.log('Installing puppeteer-core…');
  const r = spawnSync('npm', ['install', '--no-save', '--prefix', PUPPETEER_ROOT, 'puppeteer-core@24.2.0'], {
    stdio: 'inherit',
  });
  if (r.status !== 0) throw new Error('npm install puppeteer-core failed');
  return candidate;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const file = path.join(ROOT, urlPath.replace(/^\/+/, ''));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const ext = path.extname(file);
    const types = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

async function main() {
  ensurePuppeteer();
  const puppeteer = require(path.join(PUPPETEER_ROOT, 'node_modules', 'puppeteer-core'));
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1280, height: 1800 },
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(45000);
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.exportSvgAsArchivalImage === 'function');

    const result = await page.evaluate(async () => {
      const letterW = (77 + 8) * 16;
      const letterH = (58 + 8) * 26.6667;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${letterW} ${letterH}" width="${letterW}" height="${letterH}">
        <g class="platen-artwork">
          <path d="M 180 220 L 1180 220 L 1180 520 L 180 520 Z" fill="#ffffff"/>
          <text x="680" y="900" font-size="160" fill="#ffffff" text-anchor="middle" font-family="Courier, monospace">PLATEN</text>
          <text x="680" y="1100" font-size="72" fill="#ffffff" text-anchor="middle" font-family="Courier, monospace">ARCHIVAL</text>
        </g>
      </svg>`;
      const tinyJpg = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBUQEBIVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAADBAECBQYAB//EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGlA//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//Z';
      const art = {
        id: 1,
        seed: 700024,
        traits: { canvas: 'black', symmetry: 'quad', space: 'isometric', engine: 'radial' },
        layout: 'grid_us_letter',
        svgs: [svg],
        previews: [tinyJpg],
      };
      window.curatedGallery = [art];
      if (typeof renderSavedInline === 'function') renderSavedInline();
      const masonryImg = document.querySelector('#saved-inline-grid img');
      const masonrySvg = document.querySelector('#saved-inline-grid svg');
      openSavedSolo(0);
      const solo = document.getElementById('saved-solo-plate');
      const soloSvg = solo && solo.querySelector('svg');
      const soloImg = solo && solo.querySelector('img');

      const captured = await new Promise((resolve) => {
        const orig = window.downloadBlob;
        window.downloadBlob = function (blob, filename) {
          const reader = new FileReader();
          reader.onload = function () {
            const bytes = new Uint8Array(reader.result);
            resolve({
              filename: filename,
              type: blob.type,
              size: blob.size,
              sig: Array.from(bytes.slice(0, 8)),
              w: (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19],
              h: (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23],
            });
            window.downloadBlob = orig;
          };
          reader.readAsArrayBuffer(blob);
        };
        downloadSavedSolo();
        setTimeout(function () { resolve({ error: 'timeout' }); }, 25000);
      });

      // Slug FAIL path: Save stored '' in svgs[] but the live plate is still on screen.
      const denseArt = {
        id: 992735,
        seed: 992735,
        traits: { canvas: 'black', symmetry: 'quad', space: 'isometric', engine: 'radial', motif: 'typewriter', chromes: 'x' },
        layout: 'grid_us_letter',
        svgs: [''],
        previews: [tinyJpg],
      };
      window.RENDER_SEED = 992735;
      RENDER_SEED = 992735;
      window.RESOLVED_TRAITS = denseArt.traits;
      const live = document.getElementById('s1');
      if (live) live.outerHTML = svg.replace('<svg', '<svg id="s1"');
      window.curatedGallery = [denseArt];
      renderSavedInline();
      const emptyMasonryImg = !!document.querySelector('#saved-inline-grid img');
      const emptyMasonrySvg = !!document.querySelector('#saved-inline-grid svg');
      openSavedSolo(0);
      await new Promise(function (r) { setTimeout(r, 80); });
      const emptySolo = document.getElementById('saved-solo-plate');
      const emptySoloSvg = emptySolo && emptySolo.querySelector('svg');
      const emptySoloImg = emptySolo && emptySolo.querySelector('img');
      const emptySoloText = (emptySolo && emptySolo.textContent) || '';

      const recovered = await new Promise((resolve) => {
        const orig = window.downloadBlob;
        window.downloadBlob = function (blob, filename) {
          const reader = new FileReader();
          reader.onload = function () {
            const bytes = new Uint8Array(reader.result);
            resolve({
              filename: filename,
              type: blob.type,
              size: blob.size,
              w: (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19],
              h: (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23],
            });
            window.downloadBlob = orig;
          };
          reader.readAsArrayBuffer(blob);
        };
        downloadSavedSolo();
        setTimeout(function () { resolve({ error: 'timeout' }); }, 25000);
      });

      const hs = window.PlatenHyperspeed || (window.PlatenHyperspeed = {});
      const prevActive = hs.isActive;
      const prevPaused = hs.isPaused;
      hs.isActive = function () { return true; };
      hs.isPaused = function () { return false; };
      let blockedCalls = 0;
      const origBlob = window.downloadBlob;
      window.downloadBlob = function () { blockedCalls += 1; };
      const blocked = !!(window.guardMotusImageExport && guardMotusImageExport());
      const cueVisible = !document.getElementById('motus-download-cue-solo').hasAttribute('hidden');
      downloadSavedSolo();
      savePNG();
      window.downloadBlob = origBlob;
      hs.isActive = prevActive;
      hs.isPaused = prevPaused;
      if (typeof syncMotusDownloadCues === 'function') syncMotusDownloadCues();

      return {
        masonryHasImg: !!(masonryImg && String(masonryImg.src).indexOf('image/jpeg') !== -1),
        masonryHasSvg: !!masonrySvg,
        soloHasSvg: !!(soloSvg && soloSvg.querySelector('text, path')),
        soloHasImg: !!soloImg,
        soloTag: soloSvg ? soloSvg.tagName.toLowerCase() : null,
        svgBtnHidden: document.getElementById('saved-solo-download-svg').hasAttribute('hidden'),
        download: captured,
        emptySnapMasonryImg: emptyMasonryImg,
        emptySnapMasonrySvg: emptyMasonrySvg,
        emptySnapSoloSvg: !!(emptySoloSvg && emptySoloSvg.querySelector('text, path')),
        emptySnapSoloImg: !!emptySoloImg,
        emptySnapSoloText: emptySoloText.slice(0, 80),
        emptySnapDownload: recovered,
        motusBlocked: blocked,
        motusBlockedCalls: blockedCalls,
        motusCueVisible: cueVisible,
      };
    });

    fs.writeFileSync(OUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result, null, 2));

    const pngSig = [137, 80, 78, 71, 13, 10, 26, 10];
    must(result.masonryHasImg && !result.masonryHasSvg, 'masonry still uses the JPEG thumb');
    must(result.soloHasSvg && !result.soloHasImg, 'solo plate contains SVG, not the JPEG');
    must(!result.svgBtnHidden, 'Download SVG control is shown when a snapshot exists');
    must(result.download && !result.download.error, 'solo download produced a blob');
    must(result.download && result.download.type === 'image/png', 'blob mime is image/png');
    must(result.download && result.download.sig && result.download.sig.join(',') === pngSig.join(','), 'blob has a PNG signature');
    must(result.download && Math.max(result.download.w, result.download.h) >= 2550, 'long edge is archival (>= 2550)');
    must(result.download && result.download.size > 50 * 1024, 'blob is larger than the 76KB thumb');
    must(result.download && /\.png$/i.test(result.download.filename), 'filename ends in .png');
    must(result.emptySnapMasonryImg && !result.emptySnapMasonrySvg, 'dense/empty-snap masonry still uses the JPEG');
    must(result.emptySnapSoloSvg && !result.emptySnapSoloImg, 'empty snap recovers a live SVG in solo, not seed text or JPEG');
    must(result.emptySnapDownload && !result.emptySnapDownload.error, 'empty-snap solo download produced a blob');
    must(result.emptySnapDownload && result.emptySnapDownload.type === 'image/png', 'empty-snap download mime is image/png');
    must(result.emptySnapDownload && Math.max(result.emptySnapDownload.w, result.emptySnapDownload.h) >= 2550, 'empty-snap download is archival');
    must(result.emptySnapDownload && result.emptySnapDownload.size > 50 * 1024, 'empty-snap download is not the 76KB thumb');
    must(result.motusBlocked && result.motusBlockedCalls === 0, 'Motus ON blocks image download and does not start a blob');
    must(result.motusCueVisible, 'Motus ON shows the pause-motus cue');
  } finally {
    await browser.close().catch(() => {});
    server.close();
  }

  if (process.exitCode) {
    console.error('\nRuntime solo download proof failed.');
    process.exit(1);
  }
  console.log('\nRuntime solo download proof passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
