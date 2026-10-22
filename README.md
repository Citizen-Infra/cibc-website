# cibc-website

The Citizen Infrastructure Builders Club front door — [citizeninfra.org](https://citizeninfra.org).

A static Astro website using the Open Manual identity. Netlify builds `main` according to `netlify.toml`.

## Develop and check

Requires Node ≥22.12.

```sh
npm ci
npm run dev
npm run build
npm test
```

Build before testing: the assertions inspect `dist/` as well as the installed foundation. Tests cover the approved copy, seven project destinations, privacy route/canonicals, progressive examples, local assets, and semantic contrast/state roles. Automated checks do not constitute full WCAG certification.

## Shared foundation

`src/layouts/Base.astro` imports `@citizen-infra/design-system/tokens.css` from [Citizen-Infra/design-system](https://github.com/Citizen-Infra/design-system), pinned in both package manifests to immutable HTTPS Git revision `0671af3fdd6e45c649718bdcab0c6da4562372d2`. There is no separate local token authority or npm-registry dependency for the foundation.

`src/styles/site.css` owns website-specific composition and component treatments. Serving copies of Public Sans and the four PNG brand assets remain under `public/` to keep their URLs stable; tests require byte identity with the pinned dependency. Fonts and brand assets load locally, not through a runtime CDN. The site is light-only; available dark foundation tokens do not imply a website theme switch.

To update, choose an explicit new foundation revision, update both manifests, refresh any changed serving copies with their licences/provenance, and run a clean install, build, and tests. Inspect affected rendered states whenever values or assets change. Other CIBC projects adopt the shared source independently; publishing this website does not migrate them.

## Content and interaction

Project names, purposes, original blurbs, canonical URLs, and the three illustrative examples live in `src/data/projects.js`. Other destinations live in `src/data/links.js`.

`ToolGuide.astro` progressively enhances ordinary anchors and visible sections into keyboard-accessible tabs. Without JavaScript all examples remain readable. Example data is explicitly synthetic: the website does not create polls, execute a draw, or send AI requests. Wide data tables scroll within labelled keyboard-focusable regions rather than requiring smaller text or hidden document overflow.

## Privacy policy

`/privacy/my-community` renders the extension policy required by its Chrome Web Store listing. The source of truth remains `my-community/docs/privacy-policy.md`; policy-content changes must be coordinated there. The Open Manual redesign changes presentation, not that policy's text or date.

## Assets and licences

The site supplies 16/32px favicons, a 180px Apple touch icon, and a 1200×630 social-preview PNG, with OG/Twitter metadata on both pages. Source and notices: [`assets/brand/README.md`](assets/brand/README.md).

Public Sans font binaries retain their SIL Open Font License under `public/fonts/`. Newly authored shared Open Manual assets are MIT-licensed in the design-system repository. Legacy `public/brand/` files remain unmodified with their original licence history and attribution, but are not loaded by the current presentation. Do not relicense or silently modify those legacy files.
