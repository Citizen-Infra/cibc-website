# Open Manual brand assets

Original procedural typography in the approved CIBC visual language. The favicon is a two-by-two **C I / B C** arrangement in Public Sans bold, white on petrol. The social image uses the full club name, approved headline, domain, and factual functionality categories—not a screenshot, live activity report, or adoption claim.

| Serving file under `public/` | Dimensions |
|---|---|
| `favicon-16.png` | 16×16 |
| `favicon-32.png` | 32×32 |
| `apple-touch-icon.png` | 180×180 |
| `og-image.png` | 1200×630 |

## Source and notices

The canonical shared assets are in [Citizen-Infra/design-system](https://github.com/Citizen-Infra/design-system), at the revision pinned by the website's package manifests. Tests require serving copies to match that dependency. New shared artwork is MIT-licensed; Public Sans binaries retain their own SIL Open Font License and source/hash record under `public/fonts/`. Legacy CIBC brand-kit attribution and licences remain separate.

`provenance.json` and the PNGs' embedded descriptions retain the original authoring inputs and relative paths as historical origin. They are not claims that the former local token snapshot is still authoritative.

The retained website authoring source is `scripts/render-brand-assets.mjs`; it resolves the installed token export, local Public Sans, and approved headline. It uses an explicitly available Playwright Core installation and installed Google Chrome, with no image-generation service or consumer install hooks:

```sh
node scripts/render-brand-assets.mjs --playwright-module /path/to/playwright-core/index.mjs
```

Its owned loopback server and Chrome process close on completion/failure. Regeneration replaces the four named generated files and their manifest; re-embed accurate procedural-source metadata before delivery. Shared asset updates belong upstream and should be adopted through an explicit new pin rather than silently diverging local serving copies.

## Integration

`Base.astro` declares local icon sizes, an Apple touch icon, an absolute social-image URL with type/dimensions/text alternatives, and corresponding Twitter metadata. Page titles/descriptions/canonicals remain route-specific. The privacy route intentionally shares the generic club image without changing its policy text.

Built-file tests check PNG signatures/dimensions and both pages' metadata. Assets have been visually inspected, including actual-size icons on light/dark surroundings; local browser checks decoded all four as opaque, non-blank PNGs at their intended sizes. Platform-specific unfurls and caches may vary independently after deployment.
