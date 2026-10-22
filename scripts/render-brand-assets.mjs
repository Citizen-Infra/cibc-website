// Procedurally authored Open Manual assets. No image-generation service,
// screenshot of the website, stock artwork, or production dependency required.
// Pass an installed playwright-core module when it is not locally available:
// node scripts/render-brand-assets.mjs --playwright-module /path/to/playwright-core/index.mjs
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { siteCopy } from '../src/data/projects.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const argument = process.argv.indexOf('--playwright-module');
const modulePath = argument >= 0 ? process.argv[argument + 1] : null;
const { chromium } = await import(modulePath ? pathToFileURL(resolve(modulePath)).href : 'playwright-core');
const tokens = await readFile(new URL(import.meta.resolve('@citizen-infra/design-system/tokens.css')), 'utf8');
const font = await readFile(resolve(root, 'public/fonts/public-sans-latin-normal.woff2'));
const escape = text => text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const css = `@font-face{font-family:"Public Sans";src:url('/font.woff2') format('woff2');font-weight:400 700;font-style:normal;font-display:block}*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%}body{font-family:var(--cibc-font-sans);font-synthesis:none} ${tokens}`;
const mark = `<div class="mark" aria-label="CIBC"><span>C</span><span>I</span><span>B</span><span>C</span></div>`;
const page = (style, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CIBC Open Manual artwork</title><style>${css}${style}</style></head><body>${body}</body></html>`;
const icon = page(`
body{background:var(--cibc-color-action);color:var(--cibc-color-on-action)}
.mark{width:512px;height:512px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;align-items:center;justify-items:center;padding:38px 44px 44px;gap:0;font-size:212px;font-weight:700;line-height:1;letter-spacing:-.025em}
`, mark);
const social = page(`
body{width:1200px;height:630px;padding:54px 64px;background:var(--cibc-color-page);color:var(--cibc-color-text);display:flex;flex-direction:column;justify-content:space-between}
header{display:flex;align-items:start;justify-content:space-between}
.wordmark{font-weight:700;font-size:27px;line-height:1.22;letter-spacing:-.025em}
.mark{width:76px;height:76px;display:grid;grid-template-columns:1fr 1fr;align-items:center;justify-items:center;padding:7px 9px 9px;background:var(--cibc-color-action);color:var(--cibc-color-on-action);font-size:30px;font-weight:700;line-height:1;letter-spacing:-.025em}
h1{margin:22px 0 30px;max-width:1050px;font-size:68px;font-weight:700;line-height:1.08;letter-spacing:-.025em;text-wrap:balance}
footer{display:flex;align-items:center;justify-content:space-between;gap:26px;border-top:1px solid var(--cibc-color-control-border);padding-top:27px;font-size:21px;line-height:1.5}
.address{padding:10px 17px;background:var(--cibc-color-accent);color:var(--cibc-color-on-accent);font-weight:600;white-space:nowrap}
.description{max-width:670px;color:var(--cibc-color-text-secondary);text-align:right}
`, `<header><div class="wordmark">Citizen Infrastructure<br>Builders Club</div>${mark}</header><h1>${escape(siteCopy.headline)}</h1><footer><span class="address">citizeninfra.org</span><span class="description">Scheduling, fair selection, community tools,<br>and shared knowledge.</span></footer>`);

const server = createServer((request, response) => {
  const route = new URL(request.url, 'http://localhost').pathname;
  if (route === '/font.woff2') { response.setHeader('Content-Type', 'font/woff2'); response.end(font); }
  else if (route === '/icon' || route === '/social') { response.setHeader('Content-Type', 'text/html'); response.end(route === '/icon' ? icon : social); }
  else { response.writeHead(404); response.end('Not found'); }
});
await new Promise(done => server.listen(0, '127.0.0.1', done));
const port = server.address().port;
console.log(JSON.stringify({ owner: 'CIBC brand asset renderer', pid: process.pid, port }));
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  const canvasPage = await context.newPage();
  await canvasPage.goto(`http://127.0.0.1:${port}/icon`, { waitUntil: 'load' });
  await canvasPage.evaluate(() => document.fonts.ready);
  if (!await canvasPage.evaluate(() => document.fonts.check('700 212px "Public Sans"'))) throw new Error('Public Sans did not load');
  const master = await canvasPage.screenshot({ type: 'png', animations: 'disabled' });
  const outputs = [
    ['favicon-16.png', 16],
    ['favicon-32.png', 32],
    ['apple-touch-icon.png', 180],
  ];
  for (const [filename, size] of outputs) {
    const data = await canvasPage.evaluate(async ({ input, size }) => {
      const image = new Image(); image.src = `data:image/png;base64,${input}`; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
      const drawing = canvas.getContext('2d'); drawing.imageSmoothingEnabled = true; drawing.imageSmoothingQuality = 'high';
      drawing.drawImage(image, 0, 0, size, size);
      return canvas.toDataURL('image/png').split(',')[1];
    }, { input: master.toString('base64'), size });
    await writeFile(resolve(root, 'public', filename), Buffer.from(data, 'base64'));
  }
  await context.close();
  const socialContext = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const socialPage = await socialContext.newPage();
  await socialPage.goto(`http://127.0.0.1:${port}/social`, { waitUntil: 'load' });
  await socialPage.evaluate(() => document.fonts.ready);
  const dimensions = await socialPage.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
  if (dimensions.width !== 1200 || dimensions.height !== 630) throw new Error(`Artwork overflow: ${JSON.stringify(dimensions)}`);
  await socialPage.screenshot({ path: resolve(root, 'public/og-image.png'), animations: 'disabled' });
  await socialContext.close();
  await mkdir(resolve(root, 'assets/brand'), { recursive: true });
  await writeFile(resolve(root, 'assets/brand/provenance.json'), JSON.stringify({
    authoring: 'Procedurally typeset original artwork; no generative image model or external image assets.',
    renderer: 'scripts/render-brand-assets.mjs',
    font: 'public/fonts/public-sans-latin-normal.woff2',
    fontSHA256: createHash('sha256').update(font).digest('hex'),
    paletteSource: '@citizen-infra/design-system/tokens.css',
    tokensSHA256: createHash('sha256').update(tokens).digest('hex'),
    headlineSource: 'src/data/projects.js#siteCopy.headline',
    headline: siteCopy.headline,
    images: [...outputs.map(([file, size]) => ({ file: `public/${file}`, width: size, height: size })), { file: 'public/og-image.png', width: 1200, height: 630 }],
    fontLicence: 'public/fonts/OFL-Public-Sans.txt',
    note: 'Re-rendering resets embedded raster provenance; embed source descriptions again before delivery.'
  }, null, 2) + '\n');
} finally {
  if (browser) await browser.close();
  await new Promise(done => server.close(done));
  console.log(JSON.stringify({ cleanup: 'Owned Chrome, contexts and renderer server closed', port }));
}
