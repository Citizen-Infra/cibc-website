import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';

const revision = '0671af3fdd6e45c649718bdcab0c6da4562372d2';
const spec = `git+https://github.com/Citizen-Infra/design-system.git#${revision}`;
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const tokens = new URL(import.meta.resolve('@citizen-infra/design-system/tokens.css'));
const dependencyRoot = new URL('./', tokens);
const hash = data => createHash('sha256').update(data).digest('hex');

test('the shared foundation is pinned to one full HTTPS Git revision in manifest and lock', () => {
  assert.equal(pkg.dependencies['@citizen-infra/design-system'], spec);
  assert.equal(lock.packages[''].dependencies['@citizen-infra/design-system'], spec);
  assert.equal(lock.packages['node_modules/@citizen-infra/design-system'].resolved, spec);
  const installed = JSON.parse(readFileSync(new URL('package.json', dependencyRoot), 'utf8'));
  assert.equal(installed.name, '@citizen-infra/design-system');
  assert.equal(installed.version, lock.packages['node_modules/@citizen-infra/design-system'].version);
});

test('the layout consumes the installed token export with no independent local copy', () => {
  const layout = readFileSync('src/layouts/Base.astro', 'utf8');
  assert.match(layout, /import '@citizen-infra\/design-system\/tokens\.css'/);
  assert.doesNotMatch(layout, /docs\/design\/foundations\/tokens\.css/);
  assert.equal(existsSync('docs/design/foundations/tokens.css'), false);
  assert.match(readFileSync(tokens, 'utf8'), /--cibc-color-page:/);
});

test('locally served font files and their licence match the pinned foundation', () => {
  for (const name of ['public-sans-latin-normal.woff2', 'public-sans-latin-italic.woff2', 'OFL-Public-Sans.txt']) {
    assert.equal(hash(readFileSync(`public/fonts/${name}`)), hash(readFileSync(new URL(`fonts/${name}`, dependencyRoot))), `${name} must match the immutable dependency`);
  }
});

test('the serving copies of brand assets match the pinned foundation', () => {
  for (const name of ['favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.png']) {
    assert.equal(hash(readFileSync(`public/${name}`)), hash(readFileSync(new URL(`brand/${name}`, dependencyRoot))), `${name} must match the immutable dependency`);
  }
});

test('the local authoring tool resolves the pinned palette rather than a removed snapshot', () => {
  const renderer = readFileSync('scripts/render-brand-assets.mjs', 'utf8');
  assert.match(renderer, /import\.meta\.resolve\('@citizen-infra\/design-system\/tokens\.css'\)/);
  assert.doesNotMatch(renderer, /readFile\(resolve\(root, 'docs\/design\/foundations\/tokens\.css'\)/);
});
