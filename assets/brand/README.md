# Open Index brand assets

Original procedural typography from the shared CIBC foundation. The favicon is a two-by-two **C I / B C** arrangement in Public Sans bold, white on strong blue. The social image leads with the full club name on yellow, the approved headline, and a blue field with Build. Learn. Teach. and the club domain—not a screenshot, live activity report, or adoption claim.

| Serving file under `public/` | Dimensions |
|---|---|
| `favicon-16.png` | 16×16 |
| `favicon-32.png` | 32×32 |
| `apple-touch-icon.png` | 180×180 |
| `og-image.png` | 1200×630 |

## Source and notices

The canonical shared assets are in [Citizen-Infra/design-system](https://github.com/Citizen-Infra/design-system), at the revision pinned by the website's package manifests. Tests require serving copies to match that dependency. New shared artwork is MIT-licensed; Public Sans binaries retain their own SIL Open Font License and source/hash record under `public/fonts/`. Legacy CIBC brand-kit attribution and licences remain separate.

`provenance.json` is a byte-identical copy of the pinned dependency's upstream manifest. Its relative paths describe the design-system source tree, not this website. The PNGs retain upstream embedded authored-source descriptions; font and palette hashes match the installed foundation.

After adopting an explicitly authorized new foundation pin and installing it, refresh serving copies with:

```sh
node scripts/sync-foundation-assets.mjs
```

This helper copies the four PNGs, normal/italic fonts, OFL notice and upstream manifest from the installed dependency. It does not render images, run a browser, or access the network. The former independent website renderer is removed to prevent stale artwork. Authoring and source-description embedding belong upstream in the shared repository's `scripts/render-brand-assets.mjs`; copy updates through an explicit new pin rather than silently diverging local serving files.

## Integration

`Base.astro` declares local icon sizes, an Apple touch icon, an absolute social-image URL with type/dimensions/text alternatives, and corresponding Twitter metadata. Page titles/descriptions/canonicals remain route-specific. The privacy route intentionally shares the generic club image without changing its policy text.

Built-file tests check PNG signatures/dimensions and both pages' metadata; dependency tests require byte identity and matching provenance. The shared v0.2 artwork was visually reviewed upstream. Platform-specific unfurls and caches remain separate from local delivery checks and may vary after deployment.
