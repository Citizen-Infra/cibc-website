import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';

const revision = '6df5682711d11d1dde20453d0e06a78aca48b34f';
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
  assert.equal(installed.version, '0.2.0-draft.1');
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

test('the explicit sync helper copies upstream artwork and provenance without an independent renderer', () => {
  assert.equal(existsSync('scripts/render-brand-assets.mjs'), false);
  const helper = readFileSync('scripts/sync-foundation-assets.mjs', 'utf8');
  assert.match(helper, /import\.meta\.resolve\('@citizen-infra\/design-system\/tokens\.css'\)/);
  assert.match(helper, /copyFile/);
  assert.doesNotMatch(helper, /playwright|chromium|createServer/);
  assert.equal(hash(readFileSync('assets/brand/provenance.json')), hash(readFileSync(new URL('brand/provenance.json', dependencyRoot))));
  const provenance = JSON.parse(readFileSync('assets/brand/provenance.json', 'utf8'));
  assert.equal(provenance.tokensSHA256, hash(readFileSync(tokens)));
});
