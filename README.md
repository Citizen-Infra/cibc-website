# cibc-website

The Citizen Infrastructure Builders Club front door — [citizeninfra.org](https://citizeninfra.org).

A static Astro website using the Open Index identity. Netlify builds `main` according to `netlify.toml`.

## Develop and check

Requires Node ≥22.12.

```sh
npm ci
npm run dev
npm run build
npm test
```

Build before testing: the assertions inspect `dist/` as well as the installed foundation. Tests cover the club-name heading, approved copy, seven project destinations and native disclosures, privacy route/canonicals, local assets, and semantic contrast/state roles. Automated checks do not constitute full WCAG certification.

## Shared foundation

`src/layouts/Base.astro` imports `@citizen-infra/design-system/tokens.css` from [Citizen-Infra/design-system](https://github.com/Citizen-Infra/design-system), pinned in both package manifests to immutable HTTPS Git revision `6df5682711d11d1dde20453d0e06a78aca48b34f` (`0.2.0-draft.1`). There is no separate local token authority or npm-registry dependency for the foundation. The browser theme colour is read from the same token source at build time.

`src/styles/site.css` owns website-specific composition and component treatments. Serving copies of Public Sans and the four PNG brand assets remain under `public/` to keep their URLs stable; tests require byte identity with the pinned dependency. Fonts and brand assets load locally, not through a runtime CDN. The site is light-only; available dark foundation tokens do not imply a website theme switch.

To update, choose an explicitly authorized new foundation revision, update both manifests, clean-install, then run `node scripts/sync-foundation-assets.mjs` to refresh serving copies and upstream provenance. Build and test afterward. The helper copies bytes; artwork authoring belongs upstream, not in a duplicate website renderer. Inspect affected rendered states whenever values or assets change. Other CIBC projects adopt the shared source independently; publishing this website does not migrate them.

## Content and interaction

Project names, purposes, original blurbs, canonical URLs, and approved club copy live in `src/data/projects.js`. Other destinations live in `src/data/links.js`.

The yellow introduction centres the full club name. The blue unboxed index links directly to all seven projects; each visible purpose is a native `details`/`summary` disclosure for its original full description. Everything works without client JavaScript. Support and Join the club are the main navigation; Citizen Infra Wiki stays in the project index, not the navbar or footer groups. Coral participation and mint footer sections continue the large-type treatment.

Supporting type uses the foundation's 20–22px-equivalent range, body 22–24px, and display 48–88px. Rem-based sizes retain browser text preferences. Long content wraps rather than hiding document overflow; the privacy permissions table scrolls within a labelled, keyboard-focusable region.

## Privacy policy

`/privacy/my-community` renders the extension policy required by its Chrome Web Store listing. The source of truth remains `my-community/docs/privacy-policy.md`; policy-content changes must be coordinated there. The Open Index rebuild changes presentation and table accessibility, not that policy's text or date.

## Assets and licences

The site supplies 16/32px favicons, a 180px Apple touch icon, and a 1200×630 social-preview PNG, with OG/Twitter metadata on both pages. Source and notices: [`assets/brand/README.md`](assets/brand/README.md).

Public Sans font binaries retain their SIL Open Font License under `public/fonts/`. Newly authored shared Open Index assets are MIT-licensed in the design-system repository. Legacy `public/brand/` files remain unmodified with their original licence history and attribution, but are not loaded by the current presentation. Do not relicense or silently modify those legacy files.
