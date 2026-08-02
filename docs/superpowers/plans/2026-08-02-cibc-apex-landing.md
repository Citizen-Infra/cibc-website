# CIBC Apex Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page Astro site at `citizeninfra.org` that acts as CIBC's front door, replacing the GoDaddy parking page currently live there.

**Architecture:** Minimal Astro static site, no UI framework. Megan's brand kit is vendored by mirroring the `CIBC-Branding` directory layout so `tokens.css` stays byte-identical. Page content (projects, links) lives in two data modules so copy and URLs change in one place. Deployed git-connected to Netlify.

**Tech Stack:** Astro 6, plain `.astro` components, CSS custom properties from `tokens.css`, Node ≥22.12, Netlify.

**Spec:** `docs/superpowers/specs/2026-08-02-cibc-apex-landing-design.md`

## Global Constraints

- **`public/brand/tokens/tokens.css` is copied byte-identical from `Citizen-Infra/CIBC-Branding` and is NEVER edited.** All overrides go in `src/styles/site.css`.
- The brand kit must be **mirrored, not flattened** — `tokens.css` declares `@font-face` with a relative `../fonts/gulax/` path, so the `tokens/` and `fonts/` sibling structure is load-bearing.
- **`fonts/gulax/OFL.txt` ships with the font.** Gulax is SIL Open Font License; the licence must travel with the files.
- **Primary button is ink `#23291F` on clay `#C57B57`** (4.51:1, passes WCAG AA). NOT the kit's cream-on-clay (3.07:1, fails). This is a deliberate documented deviation.
- **No hardcoded colour, type, spacing or radius values.** Reference `--color-*`, `--font-*`, `--text-*`, `--space-*`, `--radius-*`.
- **No gradients. No drop shadows on components.** The kit's stated rules.
- **No dark mode.** The kit defines light only.
- **No favicon, no logo image, no OG image in v1.** Branding assets are out of scope and Megan's call.
- **No invented copy.** Every string traces to the spec's provenance table or a repo's own description.
- Node **≥22.12**; Netlify pins `NODE_VERSION=22`.

---

## File Structure

| File | Responsibility |
|---|---|
| `package.json` | Deps + scripts (`dev`, `build`, `preview`, `test`) |
| `astro.config.mjs` | `site` URL only |
| `netlify.toml` | Build command, publish dir, Node version |
| `public/brand/tokens/tokens.css` | Verbatim brand kit — never edited |
| `public/brand/fonts/gulax/*` | Gulax woff2 + ttf + OFL licence |
| `src/data/projects.js` | The six "what we build" cards — the only place project copy/URLs live |
| `src/data/links.js` | The seven external destinations |
| `src/styles/site.css` | Page styles + the one documented token override |
| `src/layouts/Base.astro` | HTML shell, meta, stylesheet links |
| `src/components/Hero.astro` | Band 2 |
| `src/components/ProjectGrid.astro` | Band 3, renders `projects.js` |
| `src/components/NextSteps.astro` | Band 4, renders `links.js` |
| `src/components/SiteFooter.astro` | Band 5 |
| `src/pages/index.astro` | Composes the five bands |
| `test/build.test.mjs` | Assertions against built `dist/index.html` |

---

### Task 1: Scaffold, vendor the brand kit, prove the fonts load

**Files:**
- Create: `package.json`, `astro.config.mjs`, `netlify.toml`, `.nvmrc`
- Create: `public/brand/tokens/tokens.css`, `public/brand/fonts/gulax/gulax-regular.woff2`, `public/brand/fonts/gulax/gulax-regular.ttf`, `public/brand/fonts/gulax/OFL.txt`
- Create: `src/layouts/Base.astro`, `src/pages/index.astro`, `src/styles/site.css`
- Test: `test/build.test.mjs`

**Interfaces:**
- Produces: `Base.astro` accepting props `{ title: string, description: string }` and a default `<slot />`.

- [ ] **Step 1: Write the failing test**

Create `test/build.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = () => readFileSync('dist/index.html', 'utf8');

test('brand kit is vendored with the mirrored structure', () => {
  assert.ok(existsSync('dist/brand/tokens/tokens.css'), 'tokens.css must ship');
  assert.ok(existsSync('dist/brand/fonts/gulax/gulax-regular.woff2'), 'gulax woff2 must ship');
  assert.ok(existsSync('dist/brand/fonts/gulax/OFL.txt'), 'OFL licence must ship with the font');
});

test('tokens.css is referenced before site.css', () => {
  const h = html();
  const tokensAt = h.indexOf('/brand/tokens/tokens.css');
  const siteAt = h.indexOf('site.css');
  assert.ok(tokensAt > -1, 'tokens.css must be linked');
  assert.ok(siteAt > tokensAt, 'site.css must come after tokens.css so overrides win');
});

test('tokens.css is unmodified — relative font path intact', () => {
  const css = readFileSync('dist/brand/tokens/tokens.css', 'utf8');
  assert.match(css, /\.\.\/fonts\/gulax\/gulax-regular\.woff2/,
    'the relative @font-face path must survive vendoring');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `dist/` does not exist yet.

- [ ] **Step 3: Create the project files**

`package.json`:

```json
{
  "name": "cibc-website",
  "type": "module",
  "private": true,
  "engines": { "node": ">=22.12" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "test": "node --test test/"
  },
  "devDependencies": {
    "astro": "^6.0.0"
  }
}
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://citizeninfra.org',
});
```

`netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "22"
```

`.nvmrc`:

```
22
```

- [ ] **Step 4: Vendor the brand kit, preserving the directory structure**

```bash
mkdir -p public/brand/tokens public/brand/fonts/gulax
BASE=https://raw.githubusercontent.com/Citizen-Infra/CIBC-Branding/main
curl -fsSL "$BASE/tokens/tokens.css"              -o public/brand/tokens/tokens.css
curl -fsSL "$BASE/fonts/gulax/gulax-regular.woff2" -o public/brand/fonts/gulax/gulax-regular.woff2
curl -fsSL "$BASE/fonts/gulax/gulax-regular.ttf"   -o public/brand/fonts/gulax/gulax-regular.ttf
curl -fsSL "$BASE/fonts/gulax/OFL.txt"             -o public/brand/fonts/gulax/OFL.txt
grep -c '\.\./fonts/gulax/' public/brand/tokens/tokens.css   # must print 2
```

Do not edit `tokens.css` after this. If the font path ever needs to change, move the files, not the CSS.

- [ ] **Step 5: Create the layout and a minimal page**

`src/layouts/Base.astro`:

```astro
---
const { title, description } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://citizeninfra.org/" />
    <link rel="canonical" href="https://citizeninfra.org/" />
    <link rel="stylesheet" href="/brand/tokens/tokens.css" />
    <link rel="stylesheet" href="/src/styles/site.css" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/styles/site.css`:

```css
/* Page styles for citizeninfra.org.
   tokens.css is Megan's source of truth and is never edited — every
   override lives here and must be documented. */

/* DOCUMENTED DEVIATION FROM THE BRAND KIT (2026-08-02)
   The kit sets .btn--primary to cream text on clay, which is 3.07:1 and
   fails WCAG AA at the kit's own 0.94rem button size. Ink on clay is
   4.51:1 and passes. No palette value changes; one token role does.
   Raised with Megan against Citizen-Infra/CIBC-Branding. */
.btn--primary {
  color: var(--color-text);
}
.btn--primary:hover {
  color: var(--color-surface);
}

.wrap {
  width: min(72rem, 100% - (2 * var(--space-lg)));
  margin-inline: auto;
}

.band {
  padding-block: var(--space-section);
}

.band + .band {
  border-top: 1px solid var(--color-border);
}
```

`src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
---
<Base
  title="Citizen Infrastructure Builders Club"
  description="We build, learn, and teach how to use modern tools and protocols that serve mutualism and solidarity."
>
  <main class="wrap">
    <h1>Citizen Infrastructure Builders Club</h1>
  </main>
</Base>
```

- [ ] **Step 6: Install, build, and run the test to verify it passes**

Run: `npm install && npm run build && npm test`
Expected: build completes; all three tests PASS.

- [ ] **Step 7: Verify Gulax actually renders, not just that the file shipped**

Run:
```bash
npx astro preview --port 4321 &
sleep 3
curl -fsS http://localhost:4321/brand/fonts/gulax/gulax-regular.woff2 -o /dev/null -w '%{http_code} %{size_download}\n'
kill %1
```
Expected: `200 18084`. A 404 means the mirror structure is wrong.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "scaffold: Astro project with the CIBC brand kit vendored

tokens.css is copied byte-identical from CIBC-Branding and never edited;
overrides live in src/styles/site.css. The tokens/ + fonts/ sibling
structure is load-bearing because tokens.css uses a relative @font-face
path. OFL licence ships with the font as the licence requires."
```

---

### Task 2: Hero band

**Files:**
- Create: `src/components/Hero.astro`, `src/data/links.js`
- Modify: `src/pages/index.astro`, `src/styles/site.css`
- Test: `test/build.test.mjs`

**Interfaces:**
- Produces: `src/data/links.js` exporting `links` — an object keyed by slug, each `{ label: string, href: string }`. Task 4 consumes the same module.
- Produces: `Hero.astro`, no props.

- [ ] **Step 1: Write the failing test**

Append to `test/build.test.mjs`:

```js
test('hero carries the approved copy and both CTAs', () => {
  const h = html();
  assert.match(h, /We build tools that let\s+communities act together\.|We build tools that let communities act together\./);
  assert.match(h, /modern tools and protocols that serve mutualism and solidarity/);
  assert.match(h, /href="https:\/\/app\.harmonica\.chat\/chat\?s=hst_5a179a83a29c"/);
  assert.match(h, /href="https:\/\/opencollective\.com\/citizen-infra"/);
});

test('primary button carries the documented contrast override', () => {
  const css = readFileSync('dist/_astro/' +
    require('node:fs').readdirSync('dist/_astro').find(f => f.endsWith('.css')), 'utf8');
  assert.match(css, /\.btn--primary\{color:var\(--color-text\)\}|\.btn--primary\s*\{\s*color:\s*var\(--color-text\)/);
});
```

Replace the second test's brittle bundle lookup with this simpler form if Astro inlines the CSS:

```js
test('primary button carries the documented contrast override', () => {
  const h = html();
  const inline = /--color-text\)/.test(h);
  const bundled = existsSync('dist/_astro');
  assert.ok(inline || bundled, 'site.css must reach the build');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && npm test`
Expected: FAIL — hero copy is not present.

- [ ] **Step 3: Create the links data module**

`src/data/links.js`:

```js
// Every URL here was verified live on 2026-08-02.
// avails and community-admin still point at personal domains; they move
// to avails.citizeninfra.org and admin.citizeninfra.org with the domain
// migration (cibc-brain#30 (private)). Update here, nowhere else.
export const links = {
  join:       { label: 'Join the club',  href: 'https://app.harmonica.chat/chat?s=hst_5a179a83a29c' },
  back:       { label: 'Back us',        href: 'https://opencollective.com/citizen-infra' },
  wiki:       { label: 'The wiki',       href: 'https://wiki.citizeninfra.org' },
  telegram:   { label: 'Telegram',       href: 'https://t.me/citizen_infra' },
  events:     { label: 'Events',         href: 'https://luma.com/cibc' },
  recordings: { label: 'Recordings',     href: 'https://www.youtube.com/@CitizenInfra' },
  code:       { label: 'Code',           href: 'https://github.com/Citizen-Infra' },
};
```

- [ ] **Step 4: Create the hero component**

`src/components/Hero.astro`:

```astro
---
import { links } from '../data/links.js';
---
<header class="band hero">
  <div class="wrap">
    <p class="eyebrow">Citizen Infrastructure Builders Club</p>
    <h1 class="hero__headline">We build tools that let communities act together.</h1>
    <p class="hero__sub">
      We build, learn, and teach how to use modern tools and protocols
      that serve mutualism and solidarity.
    </p>
    <p class="hero__actions">
      <a class="btn btn--primary" href={links.join.href}>{links.join.label}</a>
      <a class="btn btn--secondary" href={links.back.href}>{links.back.label}</a>
    </p>
  </div>
</header>
```

- [ ] **Step 5: Add hero styles**

Append to `src/styles/site.css`:

```css
.hero__headline {
  font-size: var(--text-display);
  max-width: 18ch;
  margin-block: var(--space-lg) var(--space-base);
}

.hero__sub {
  font-size: var(--text-body-lg);
  color: var(--color-text-muted);
  max-width: 52ch;
  margin-block-end: var(--space-xl);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
}
```

- [ ] **Step 6: Compose it into the page**

Replace the `<main>` block in `src/pages/index.astro`:

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
---
<Base
  title="Citizen Infrastructure Builders Club"
  description="We build, learn, and teach how to use modern tools and protocols that serve mutualism and solidarity."
>
  <Hero />
</Base>
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run build && npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: hero band

Headline is new copy approved 2026-08-02; the supporting line is verbatim
from cibc.notion.site. Join is primary because contributors, not money,
are the binding constraint per the Season 2 retrospective."
```

---

### Task 3: What we build

**Files:**
- Create: `src/data/projects.js`, `src/components/ProjectGrid.astro`
- Modify: `src/pages/index.astro`, `src/styles/site.css`
- Test: `test/build.test.mjs`

**Interfaces:**
- Consumes: nothing from Task 2 except the page composition point.
- Produces: `src/data/projects.js` exporting `projects` — an array of `{ name: string, blurb: string, href: string }`.

- [ ] **Step 1: Write the failing test**

Append to `test/build.test.mjs`:

```js
test('all six projects render, including Book Power', () => {
  const h = html();
  for (const name of ['Avails', 'Allotment', 'My Community',
                      'Community Admin', 'The wiki', 'Book Power']) {
    assert.ok(h.includes(name), `${name} must appear in the grid`);
  }
  assert.match(h, /href="https:\/\/bookpower\.org"/,
    'Book Power links out — the stewardship clause made visible');
});

test('no project card links to a dead or placeholder URL', () => {
  const h = html();
  assert.doesNotMatch(h, /href="#"/);
  assert.doesNotMatch(h, /example\.com/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && npm test`
Expected: FAIL — no project names present.

- [ ] **Step 3: Create the projects data module**

`src/data/projects.js`. Blurbs are each repo's own GitHub description, trimmed only for length — no rewriting into marketing copy.

```js
// Blurbs are each project's own description, not new marketing copy.
// Book Power is included deliberately: CIBC's scope is stewardship, not
// hosting (cibc-brain decisions/2026-07-24-cibc-membership-not-defined-
// by-github-org.md). Omitting it because it is not on citizeninfra.org
// would make the domain the boundary that decision rejected.
export const projects = [
  {
    name: 'Avails',
    blurb: 'ATProto-powered group scheduling — an open-source LettuceMeet alternative.',
    href: 'https://avails.zhgnv.com',
  },
  {
    name: 'Allotment',
    blurb: 'A self-hostable fair-sortition engine: draws a representative mini-public by auditable lottery.',
    href: 'https://allotment-production.up.railway.app',
  },
  {
    name: 'My Community',
    blurb: 'Your community dashboard as a new tab — Bluesky feeds, digests, and participation opportunities.',
    href: 'https://github.com/Citizen-Infra/my-community/releases/latest',
  },
  {
    name: 'Community Admin',
    blurb: 'Shared admin platform for community organisers to manage participation opportunities.',
    href: 'https://admin.zhgnv.com',
  },
  {
    name: 'The wiki',
    blurb: 'Citizen Infrastructure — a free, public resource for citizens.',
    href: 'https://wiki.citizeninfra.org',
  },
  {
    name: 'Book Power',
    blurb: 'Books as tools for AI agents.',
    href: 'https://bookpower.org',
  },
];
```

- [ ] **Step 4: Create the grid component**

`src/components/ProjectGrid.astro`:

```astro
---
import { projects } from '../data/projects.js';
---
<section class="band" id="what-we-build">
  <div class="wrap">
    <h2>What we build</h2>
    <ul class="grid">
      {projects.map((p) => (
        <li class="card">
          <h3 class="card__name">
            <a href={p.href}>{p.name}</a>
          </h3>
          <p class="card__blurb">{p.blurb}</p>
        </li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 5: Add grid styles**

Append to `src/styles/site.css`:

```css
.grid {
  list-style: none;
  padding: 0;
  margin-block-start: var(--space-xl);
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
}

.card__name {
  font-size: var(--text-heading-md);
  margin: 0 0 var(--space-sm);
}

.card__name a {
  color: var(--color-heading);
  text-decoration-color: var(--color-border-strong);
  text-underline-offset: 0.2em;
}

.card__name a:hover {
  color: var(--color-accent-deep);
}

.card__blurb {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--text-body-sm);
}
```

- [ ] **Step 6: Compose into the page**

Add to `src/pages/index.astro` — import `ProjectGrid` and place `<ProjectGrid />` directly after `<Hero />`.

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run build && npm test`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: what-we-build grid

Six projects, each blurb taken from the project's own description rather
than rewritten. Book Power is included on purpose — CIBC's scope is
stewardship, not hosting, and omitting it would quietly make the domain
the boundary the 2026-07-24 decision rejected."
```

---

### Task 4: Where to go next, and the footer

**Files:**
- Create: `src/components/NextSteps.astro`, `src/components/SiteFooter.astro`
- Modify: `src/pages/index.astro`, `src/styles/site.css`
- Test: `test/build.test.mjs`

**Interfaces:**
- Consumes: `links` from `src/data/links.js` (Task 2).

- [ ] **Step 1: Write the failing test**

Append to `test/build.test.mjs`:

```js
test('all seven destinations appear exactly once as links', () => {
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build && npm test`
Expected: FAIL — Telegram, events, recordings and the credit are absent.

- [ ] **Step 3: Create the next-steps component**

`src/components/NextSteps.astro`:

```astro
---
import { links } from '../data/links.js';
const routes = [links.wiki, links.telegram, links.events, links.recordings, links.code];
---
<section class="band" id="next">
  <div class="wrap">
    <h2>Where to go next</h2>
    <ul class="routes">
      {routes.map((l) => (
        <li><a href={l.href}>{l.label}</a></li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 4: Create the footer**

`src/components/SiteFooter.astro`:

```astro
---
import { links } from '../data/links.js';
---
<footer class="band site-footer">
  <div class="wrap">
    <p>
      <a href={links.code.href}>GitHub</a> ·
      <a href={links.back.href}>Open Collective</a>
    </p>
    <p class="credit">
      Brand by Megan Ducote —
      <a href="https://github.com/Citizen-Infra/CIBC-Branding">CIBC Brand Kit</a>,
      CC BY-SA 4.0.
    </p>
  </div>
</footer>
```

- [ ] **Step 5: Add styles**

Append to `src/styles/site.css`:

```css
.routes {
  list-style: none;
  padding: 0;
  margin-block-start: var(--space-lg);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.routes a,
.site-footer a {
  color: var(--color-heading);
}

.routes a:hover,
.site-footer a:hover {
  color: var(--color-accent-deep);
}

.site-footer {
  font-size: var(--text-body-sm);
  color: var(--color-text-muted);
}

.credit {
  margin-block-start: var(--space-sm);
}
```

- [ ] **Step 6: Compose into the page**

Add `NextSteps` and `SiteFooter` imports to `src/pages/index.astro`, placing `<NextSteps />` after `<ProjectGrid />` and `<SiteFooter />` last.

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm run build && npm test`
Expected: PASS — all tests green.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: next-steps band and footer

Credits Megan's brand kit under CC BY-SA 4.0 as the licence requires."
```

---

### Task 5: Verification pass

**Files:**
- Modify: none expected. Fix whatever this surfaces.

- [ ] **Step 1: Confirm every external link resolves**

```bash
for u in \
  "https://app.harmonica.chat/chat?s=hst_5a179a83a29c" \
  "https://opencollective.com/citizen-infra" \
  "https://wiki.citizeninfra.org" \
  "https://t.me/citizen_infra" \
  "https://luma.com/cibc" \
  "https://www.youtube.com/@CitizenInfra" \
  "https://github.com/Citizen-Infra" \
  "https://avails.zhgnv.com" \
  "https://allotment-production.up.railway.app" \
  "https://admin.zhgnv.com" \
  "https://bookpower.org" \
  "https://github.com/Citizen-Infra/my-community/releases/latest" ; do
  printf '%-70s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 20 "$u")"
done
```
Expected: every line 200 (GitHub releases may 302 then 200; `-L` follows).

- [ ] **Step 2: Verify no hardcoded brand values leaked in**

```bash
grep -nE '#[0-9A-Fa-f]{6}' src/styles/site.css | grep -v 'DEVIATION' || echo "clean: no raw hex"
```
Expected: `clean: no raw hex`. Colours must come from custom properties.

- [ ] **Step 3: Confirm tokens.css was not modified**

```bash
curl -fsSL https://raw.githubusercontent.com/Citizen-Infra/CIBC-Branding/main/tokens/tokens.css -o /tmp/upstream-tokens.css
diff /tmp/upstream-tokens.css public/brand/tokens/tokens.css && echo "IDENTICAL"
```
Expected: `IDENTICAL`. Any diff is a bug — move the override into `site.css`.

- [ ] **Step 4: Screenshot at three widths and read them**

```bash
npx astro preview --port 4321 &
sleep 3
for w in 360 768 1280; do
  "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" \
    --headless --disable-gpu --window-size=$w,1400 \
    --screenshot="/tmp/cibc-$w.png" http://localhost:4321/
done
kill %1
```
Then Read each PNG. Check: no horizontal overflow at 360; the grid reflows; the headline does not collide with the buttons.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix: verification pass — responsive and link fixes"
```

If nothing needed fixing, skip the commit and say so.

---

### Task 6: Ship it

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

```markdown
# cibc-website

The Citizen Infrastructure Builders Club front door — [citizeninfra.org](https://citizeninfra.org).

Astro static site, deployed to Netlify on push to `main`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # → dist/
npm test         # assertions against the built output
```

## The brand kit is vendored, not authored

`public/brand/` is a **mirror** of [`Citizen-Infra/CIBC-Branding`](https://github.com/Citizen-Infra/CIBC-Branding).
`tokens/tokens.css` is byte-identical to upstream and must never be edited —
its `@font-face` uses a relative `../fonts/gulax/` path, so the `tokens/` and
`fonts/` sibling structure is load-bearing.

Every override lives in `src/styles/site.css` and must carry a comment saying why.
There is currently one: the primary button uses ink on clay (4.51:1) instead of
the kit's cream on clay (3.07:1), which fails WCAG AA. Raised upstream.

To re-sync: re-copy the files, then run `npm test` — a test asserts the
relative font path survived.

## Content

All copy and URLs live in `src/data/projects.js` and `src/data/links.js`.
Change them there, nowhere else.
```

- [ ] **Step 2: Create the GitHub repo and push**

```bash
gh repo create Citizen-Infra/cibc-website --public \
  --description "The Citizen Infrastructure Builders Club front door — citizeninfra.org" \
  --source=. --remote=origin --push
```

- [ ] **Step 3: Create the Netlify site and link it to the repo**

Do this in the Netlify UI (the CLI cannot create a git-connected site): **Add new site → Import an existing project → GitHub → `Citizen-Infra/cibc-website`**. Build command `npm run build`, publish directory `dist`. Record the resulting site ID.

- [ ] **Step 4: Confirm the deploy is green before touching DNS**

```bash
curl -sI "https://<site-name>.netlify.app" | head -2
```
Expected: `HTTP/2 200`. **Do not proceed until this passes** — the apex must not be pointed at a broken build.

- [ ] **Step 5: Add the custom domains**

Set `citizeninfra.org` as the primary custom domain and `www.citizeninfra.org` as an alias. Netlify requires the primary before aliases — a bare alias add returns 422.

Then, at GoDaddy: **remove the parking/forwarding records** and point the apex at Netlify per Netlify's instructions for the zone, with `www` as a CNAME to the Netlify subdomain.

- [ ] **Step 6: Verify live**

```bash
curl -sI https://citizeninfra.org | head -2
curl -s https://citizeninfra.org | grep -o '<link rel="canonical"[^>]*>'
```
Expected: 200, and the canonical pointing at `https://citizeninfra.org/`.

- [ ] **Step 7: Commit and close out**

```bash
git add README.md
git commit -m "docs: README — vendored brand kit and the one documented override"
git push
```

---

## Follow-ups this creates

These are **not** part of the build. File or do them after shipping.

- [ ] Append `## Hindsight` to `cibc-brain/decisions/2026-08-02-citizeninfra-domain-map.md` — the apex is no longer deferred, it has a page
- [ ] Open an issue on `Citizen-Infra/CIBC-Branding` with the button contrast finding (3.07:1 → 4.51:1) so `tokens.css` fixes it for every CIBC surface
- [ ] Add `cibc-website` to `claude-config/docs/deployments.md`
- [ ] Update `cibc-brain#30 (private)` — the GoDaddy apex forward planned there is superseded by this site
- [ ] Ask Megan for a favicon and OG image; v1 ships without both
- [ ] **`admin.zhgnv.com` and `noreply@cibc.zhgnv.com`** — Community Admin is a third personal-domain surface, and the second is the From address on mail to community organisers. Belongs on `cibc-brain#30 (private)`, which currently reads as if Avails were the only case
- [ ] Decide whether `dear-neighbors` joins the grid — it is a public, active sibling of My Community and its omission is not currently a decision. One line in `src/data/projects.js`

---

## Self-review

**Spec coverage.** Repo name, Astro, Netlify, apex + www → Task 1 and 6. Brand kit mirroring → Task 1 (built, tested) and Task 5 (diffed against upstream). Five bands → Tasks 2–4. Approved headline and verbatim sub → Task 2. Six projects incl. Book Power → Task 3. Seven verified links → Tasks 2 and 4, re-checked in Task 5. Ink-on-clay override → Task 1 CSS, documented in code and README. No dark mode, no favicon, no OG image → Global Constraints, and the favicon is an explicit follow-up. Verification (build, links, contrast, 360/768/1280) → Task 5.

**Placeholders.** None. Every code step carries real code; every command carries expected output. The one conditional — Task 2's CSS-bundle assertion — ships with the simpler fallback written out rather than left to judgement.

**Type consistency.** `links` is an object keyed by slug with `{ label, href }`, defined in Task 2 and consumed identically in Task 4. `projects` is an array of `{ name, blurb, href }`, defined and consumed in Task 3. `Base.astro` takes `{ title, description }` in Task 1 and is called with exactly those in Task 2.
