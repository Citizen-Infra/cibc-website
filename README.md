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

`npm test` runs against `dist/`, so build first. It asserts the vendored brand
kit survived, both contrast overrides shipped, every destination is linked, no
superseded personal domain crept back in, and each page carries its own
canonical.

## The brand kit is vendored, not authored

`public/brand/` mirrors [`Citizen-Infra/CIBC-Branding`](https://github.com/Citizen-Infra/CIBC-Branding).
`tokens/tokens.css` is byte-identical to upstream and **must never be edited** —
its `@font-face` uses a relative `../fonts/gulax/` path, so the `tokens/` and
`fonts/` sibling structure is load-bearing. Copying it flat and patching the
path is how a design system quietly forks.

Every override lives in `public/styles/site.css` and carries a comment saying
why. `site.css` is served from `public/` and linked *after* `tokens.css` rather
than bundled, so the cascade order the overrides depend on is visible in the
HTML and assertable by a test.

To re-sync: re-copy the files, then `npm test` — a test asserts the relative
font path survived.

## Three accessibility findings against the kit

All raised upstream on `CIBC-Branding`; a fix there benefits every CIBC surface.

| Kit element | Contrast | Status here |
|---|---|---|
| `.btn--primary` — cream on clay | 3.07:1 | Overridden to ink on clay, 4.50:1 |
| `--color-text-muted` on page/card | 3.94:1 / 4.44:1 | Overridden to `#70675C`, 4.56:1 / 5.15:1 |
| `.eyebrow` — clay on paper | 2.72:1 | Not used on this site |

AA needs 4.5:1, and none of these qualify as large text.

## Content

All copy and URLs live in `src/data/projects.js` and `src/data/links.js`.
Change them there, nowhere else.

## The privacy policy

`/privacy/my-community` publishes the My Community extension's privacy policy,
required by its Chrome Web Store listing
([my-community#90](https://github.com/Citizen-Infra/my-community/issues/90)).
The source of truth is `docs/privacy-policy.md` in that repo; this is the
published rendering, and the two must be updated together.

## A note on checking this page visually

Headless Chromium on Windows clamps the window to a minimum width, so
`--window-size=360` lays the page out wider and crops the capture — it looks
exactly like a horizontal overflow that is not there. To measure a real narrow
viewport, load the page in a `360px` iframe and read
`documentElement.scrollWidth` against `innerWidth`. Also pass
`--virtual-time-budget`, or the screenshot catches fallback fonts before Gulax
loads.
