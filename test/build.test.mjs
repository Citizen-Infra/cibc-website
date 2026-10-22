// Assertions against the BUILT output, not the source. Run: npm run build && npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { projects } from '../src/data/projects.js';

const html = () => readFileSync('dist/index.html', 'utf8');
const privacy = () => readFileSync('dist/privacy/my-community/index.html', 'utf8');
const css = () => readdirSync('dist/_astro').filter((name) => name.endsWith('.css'))
  .map((name) => readFileSync(`dist/_astro/${name}`, 'utf8')).join('\n')
  + [...html().matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('\n');

test('brand kit is vendored with the mirrored structure', () => {
  assert.ok(existsSync('dist/brand/tokens/tokens.css'), 'tokens.css must ship');
  assert.ok(existsSync('dist/brand/fonts/gulax/gulax-regular.woff2'), 'gulax woff2 must ship');
  assert.ok(existsSync('dist/brand/fonts/gulax/OFL.txt'), 'OFL licence must ship with the font');
});

test('Open Index loads local fonts, not the old kit or a font service', () => {
  const h = html();
  assert.doesNotMatch(h, /href="\/brand\/tokens\/tokens\.css"/);
  assert.doesNotMatch(h + css(), /fonts\.(googleapis|gstatic)\.com/);
  assert.match(h, /href="\/fonts\/public-sans-latin-normal\.woff2"/);
  assert.ok(existsSync('dist/fonts/public-sans-latin-normal.woff2'));
  assert.ok(existsSync('dist/fonts/public-sans-latin-italic.woff2'));
  assert.ok(existsSync('dist/fonts/OFL-Public-Sans.txt'));
  assert.match(css(), /Public Sans/);
  assert.doesNotMatch(css(), /Gulax|Space Grotesk/);
});

test('tokens.css is unmodified — relative font path intact', () => {
  const css = readFileSync('dist/brand/tokens/tokens.css', 'utf8');
  assert.match(css, /\.\.\/fonts\/gulax\/gulax-regular\.woff2/,
    'the relative @font-face path must survive vendoring');
});

test('the full club name leads the hero above the approved copy and both CTAs', () => {
  const h = html();
  const heading = h.match(/<h1 id="page-title">([\s\S]*?)<\/h1>/)?.[1];
  assert.ok(heading);
  assert.equal(heading.replace(/<[^>]+>/g, ''), 'Citizen InfrastructureBuilders Club');
  assert.match(heading, /Infra<wbr\s*\/?\s*>structure/);
  assert.match(h, /We build tools that let communities act together\./);
  assert.match(h, /modern tools and protocols\s+that serve mutualism and solidarity/);
  assert.match(h, /href="https:\/\/app\.harmonica\.chat\/chat\?s=hst_5a179a83a29c"/);
  assert.match(h, /href="https:\/\/opencollective\.com\/citizen-infra"/);
});

test('semantic normal, hover, active and focus roles reach the build', () => {
  const styles = css();
  for (const token of ['--cibc-color-on-action', '--cibc-color-action-hover',
    '--cibc-color-action-active', '--cibc-color-focus', '--cibc-color-surface-strong',
    '--cibc-color-link-inverse-hover', '--cibc-color-focus-inverse',
    '--cibc-color-focus-on-vivid', '--cibc-duration-fast']) {
    assert.ok(styles.includes(token), `${token} must ship`);
  }
  assert.match(styles, /focus-visible/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(styles, /forced-colors/);
});

test('all seven projects render, including Book Power and Dear Neighbors', () => {
  const h = html();
  for (const name of ['Avails', 'Allotment', 'My Community', 'Dear Neighbors',
    'Community Admin', 'Citizen Infra Wiki', 'Book Power']) {
    assert.ok(h.includes(name), `${name} must appear in the grid`);
  }
  assert.match(h, /href="https:\/\/bookpower\.org"/,
    'Book Power links out — the stewardship clause made visible');
  assert.match(h, /chromewebstore\.google\.com\/detail\/dear-neighbors/,
    'Dear Neighbors links to its store listing — the one installable in a click');
});

test('no entry links to a placeholder or superseded host', () => {
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

test('page styles use the single foundation rather than literal palette values', () => {
  const source = readFileSync('src/styles/site.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(source, /#[0-9a-f]{3,8}\b/i);
  assert.match(css(), /--cibc-color-page:/);
});

test('the homepage has one main landmark, one H1, and unique IDs', () => {
  const h = html();
  assert.equal((h.match(/<main\b/g) || []).length, 1);
  assert.equal((h.match(/<h1\b/g) || []).length, 1);
  const ids = [...h.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.match(h, /href="#main"/);
});

test('all seven projects have direct links and native description disclosures without script', () => {
  const h = html();
  const index = h.match(/<ul class="project-list">([\s\S]*?)<\/ul>/)?.[1];
  assert.ok(index);
  assert.equal((index.match(/<li>/g) || []).length, 7);
  for (const project of projects) {
    assert.ok(index.includes(`href="${project.href}">${project.name}</a>`));
    assert.ok(index.includes(`aria-describedby="project-${project.id}">${project.purpose}</summary>`));
    assert.ok(index.includes(project.blurb));
  }
  assert.equal((index.match(/<details class="project-details">/g) || []).length, 7);
  assert.doesNotMatch(h, /<script|role="tab|data-tool-guide|example-avails|availability-table|Illustrative availability|not a real draw/);
});

test('composition uses the display scale, large supporting text and responsive unboxed index', () => {
  const source = readFileSync('src/styles/site.css', 'utf8');
  assert.match(source, /\.intro h1\s*\{[^}]*font-size: var\(--cibc-text-display\)/);
  assert.match(source, /\.project-details\s*\{[^}]*font-size: var\(--cibc-text-ui\)/);
  assert.match(source, /\.project-list\s*\{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(source, /\.project-list, \.next-layout\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(source, /body\s*\{[^}]*overflow-wrap: anywhere/);
  assert.match(source, /\.club-name-word\s*\{[^}]*display: inline-block;[^}]*max-width: 100%/);
  assert.match(source, /repeat\(auto-fit, minmax\(min\(100%, 12rem\), 1fr\)\)/);
  assert.doesNotMatch(source, /overflow-x:\s*hidden|height:\s*(?:844|900)px|font-size:\s*(?:0\.|1rem)/);
});

test('design process metadata never reaches the built pages', () => {
  assert.doesNotMatch(html() + privacy(), /Direction contract|SEED REFERENCE|seed:[\da-f]{16}|FINISH:|OWN-WORLD|impeccable\/mocks/);
});

test('the permissions table scrolls in a labelled keyboard-focusable region', () => {
  const styles = readFileSync('src/styles/site.css', 'utf8');
  assert.match(styles, /\.table-scroll\s*\{[^}]*position:\s*relative;[^}]*overflow-x:\s*auto/);
  assert.match(privacy(), /class="table-scroll" role="region" tabindex="0" aria-label="Extension permissions"/);
  assert.match(privacy(), /<th scope="col">Permission<\/th>/);
});

test('favicon and social-preview PNGs ship at their declared dimensions', () => {
  for (const [name, width, height] of [
    ['favicon-16.png', 16, 16], ['favicon-32.png', 32, 32],
    ['apple-touch-icon.png', 180, 180], ['og-image.png', 1200, 630],
  ]) {
    const image = readFileSync(`dist/${name}`);
    assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(image.toString('ascii', 12, 16), 'IHDR');
    assert.equal(image.readUInt32BE(16), width, `${name}: width`);
    assert.equal(image.readUInt32BE(20), height, `${name}: height`);
  }
});

test('both pages declare local favicons and absolute share-image metadata', () => {
  for (const page of [html(), privacy()]) {
    assert.match(page, /rel="icon" href="\/favicon-32\.png"/);
    assert.match(page, /rel="icon" href="\/favicon-16\.png"/);
    assert.match(page, /rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
    assert.match(page, /property="og:image" content="https:\/\/citizeninfra\.org\/og-image\.png"/);
    assert.match(page, /property="og:image:width" content="1200"/);
    assert.match(page, /property="og:image:height" content="630"/);
    assert.match(page, /name="twitter:card" content="summary_large_image"/);
    assert.match(page, /name="twitter:image" content="https:\/\/citizeninfra\.org\/og-image\.png"/);
    assert.match(page, /property="og:image:alt" content="Citizen Infrastructure Builders Club/);
  }
});

test('navigation and footer use the approved names and destinations', () => {
  for (const page of [html(), privacy()]) {
    const navigation = page.match(/<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(navigation, 'main navigation exists');
    assert.match(navigation, /class="button button-support" href="https:\/\/opencollective\.com\/citizen-infra">Support<\/a>/);
    assert.match(navigation, />Join the club<\/a>/);
    assert.doesNotMatch(navigation, /wiki\.citizeninfra\.org|>Tools<|>Wiki</);
    const footer = page.match(/<footer class="site-footer"[^>]*>([\s\S]*?)<\/footer>/)?.[1];
    assert.ok(footer);
    assert.match(footer, /href="https:\/\/opencollective\.com\/citizen-infra">Support<\/a>/);
    assert.doesNotMatch(footer, /wiki\.citizeninfra\.org|Back us/);
    assert.doesNotMatch(page, />The wiki<|Back us/);
  }
  const next = html().match(/<section class="next-section[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(next);
  assert.doesNotMatch(next, /wiki\.citizeninfra\.org/);
  assert.match(next, /href="https:\/\/opencollective\.com\/citizen-infra">Support<\/a>/);
  assert.match(html(), /href="https:\/\/wiki\.citizeninfra\.org">Citizen Infra Wiki<\/a>/);
});
