// Assertions against the BUILT output, not the source. Run: npm run build && npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = () => readFileSync('dist/index.html', 'utf8');
const privacy = () => readFileSync('dist/privacy/my-community/index.html', 'utf8');

test('brand kit is vendored with the mirrored structure', () => {
  assert.ok(existsSync('dist/brand/tokens/tokens.css'), 'tokens.css must ship');
  assert.ok(existsSync('dist/brand/fonts/gulax/gulax-regular.woff2'), 'gulax woff2 must ship');
  assert.ok(existsSync('dist/brand/fonts/gulax/OFL.txt'), 'OFL licence must ship with the font');
});

test('tokens.css is referenced before site.css', () => {
  const h = html();
  const tokensAt = h.indexOf('/brand/tokens/tokens.css');
  const siteAt = h.indexOf('/styles/site.css');
  assert.ok(tokensAt > -1, 'tokens.css must be linked');
  assert.ok(siteAt > tokensAt, 'site.css must come after tokens.css so overrides win');
});

test('tokens.css is unmodified — relative font path intact', () => {
  const css = readFileSync('dist/brand/tokens/tokens.css', 'utf8');
  assert.match(css, /\.\.\/fonts\/gulax\/gulax-regular\.woff2/,
    'the relative @font-face path must survive vendoring');
});

test('hero carries the approved copy and both CTAs', () => {
  const h = html();
  assert.match(h, /We build tools that let communities act together\./);
  assert.match(h, /modern tools and protocols\s+that serve mutualism and solidarity/);
  assert.match(h, /href="https:\/\/app\.harmonica\.chat\/chat\?s=hst_5a179a83a29c"/);
  assert.match(h, /href="https:\/\/opencollective\.com\/citizen-infra"/);
});

test('both documented contrast overrides reach the build', () => {
  const css = readFileSync('dist/styles/site.css', 'utf8');
  assert.match(css, /\.btn--primary\s*\{\s*color:\s*var\(--color-text\)/,
    'the ink-on-clay button override must ship');
  assert.match(css, /--color-text-muted:\s*#70675C/i,
    'the darkened muted-text override must ship');
});

test('all seven projects render, including Book Power and Dear Neighbors', () => {
  const h = html();
  for (const name of ['Avails', 'Allotment', 'My Community', 'Dear Neighbors',
    'Community Admin', 'The wiki', 'Book Power']) {
    assert.ok(h.includes(name), `${name} must appear in the grid`);
  }
  assert.match(h, /href="https:\/\/bookpower\.org"/,
    'Book Power links out — the stewardship clause made visible');
  assert.match(h, /chromewebstore\.google\.com\/detail\/dear-neighbors/,
    'Dear Neighbors links to its store listing — the one installable in a click');
});

test('no card links to a dead, placeholder, or superseded host', () => {
  const h = html();
  assert.doesNotMatch(h, /href="#"/);
  assert.doesNotMatch(h, /example\.com/);
  // The personal domains these replaced. Reintroducing one would put a
  // personal host on CIBC's own front door (cibc-brain#30).
  assert.doesNotMatch(h, /avails\.zhgnv\.com/);
  assert.doesNotMatch(h, /admin\.zhgnv\.com/);
});

test('all seven destinations appear as links', () => {
  const h = html();
  for (const href of [
    'https://app.harmonica.chat/chat?s=hst_5a179a83a29c',
    'https://opencollective.com/citizen-infra',
    'https://wiki.citizeninfra.org',
    'https://t.me/citizen_infra',
    'https://luma.com/cibc',
    'https://www.youtube.com/@CitizenInfra',
    'https://github.com/Citizen-Infra',
  ]) {
    assert.ok(h.includes(`href="${href}"`), `${href} must be linked`);
  }
});

test('footer credits the brand kit under its licence', () => {
  const h = html();
  assert.match(h, /Megan Ducote/);
  assert.match(h, /CC BY-SA 4\.0/);
});

test('the privacy page builds and carries the working contact address', () => {
  const p = privacy();
  assert.match(p, /Privacy Policy — My Community/);
  assert.match(p, /hello@citizeninfra\.org/);
  // citizeninfra.org receives; the hyphenated domain is the Bluesky handle.
  // Publishing a contact on a domain with no MX would be worse than none.
  assert.doesNotMatch(p, /hello@citizen-infra\.org/);
  assert.doesNotMatch(p, /noreply@/, 'a send-only address must never be the contact');
});

test('the privacy page is reachable from the site', () => {
  assert.match(html(), /href="\/privacy\/my-community"/,
    'the footer must link the policy, or the store URL is orphaned');
});

test('every page sets its own canonical, not the homepage', () => {
  assert.match(html(), /<link rel="canonical" href="https:\/\/citizeninfra\.org\/">/);
  assert.match(privacy(),
    /<link rel="canonical" href="https:\/\/citizeninfra\.org\/privacy\/my-community">/,
    'a shared canonical would point the store at the wrong page');
});

test('no raw hex colour leaked into the page styles', () => {
  const css = readFileSync('dist/styles/site.css', 'utf8');
  // Strip comments first: the deviation notes quote hex values on purpose.
  const code = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const hex = code.match(/#[0-9A-Fa-f]{6}/g) || [];
  // The one intentional value is the muted-text override, which is a token
  // definition rather than a hardcoded use.
  const unexpected = hex.filter((h) => h.toUpperCase() !== '#70675C');
  assert.deepEqual(unexpected, [],
    `colours must come from tokens; found ${unexpected.join(', ')}`);
});
