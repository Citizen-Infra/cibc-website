
## 2026-08-02 — repo created, spec and plan written
- **Done:** New repo for the citizeninfra.org apex. Ran brainstorming → spec → plan; committed both. Filed #1 (build tracker), #2 (Dear Neighbors), #3 (favicon/OG needs Megan), plus CIBC-Branding#1 for a WCAG failure in the brand kit.
- **Decisions:** Apex = CIBC's front door, wiki owns the idea; primary CTA "Join the club" → the live Harmonica onboarding session; brand now, wiki stays vanilla, seam accepted; Book Power included in the grid because omitting it would make the domain the boundary the stewardship decision rejected.
- **State:** Nothing built. Spec and plan committed, six tasks, no code.
- **Next:** Execute #1 — subagent-driven or inline. Deferred by Artem to a later day.

## 2026-08-03 — v1 built and merged
- **Done:** Executed the plan — five bands, brand kit vendored byte-identical, 13 assertions against built output, every destination 200. Added `/privacy/my-community` (not in the original scope, but the blocker on MC's store listing). Added Dear Neighbors to the grid.
- **Decisions:** `site.css` served from `public/` and linked after tokens, so the override order is explicit and assertable rather than an implicit build artifact. Dropped the hero eyebrow — it repeated the wordmark and the kit's `.eyebrow` is 2.72:1.
- **State:** Merged, not deployed. Found a second contrast failure the spec missed (`--color-text-muted`, most of the body copy) — three findings now on CIBC-Branding#1.
- **Next:** Netlify site + DNS cutover, both dashboard jobs. Then the GoDaddy parking page on the apex is gone.

## 2026-08-04 — apex live; the parking page is gone
- **Done:** Netlify site `citizeninfra` created and deployed, custom domains attached, GitHub repo linked (a push now builds). Cloudflare apex cut over: deleted two proxied A records at `13.248.243.5`/`76.223.105.230` (AWS Global Accelerator = GoDaddy parking), created a proxied CNAME to `citizeninfra.netlify.app`. Added `netlify.toml` redirects for `www` and the `.netlify.app` host, then took over the four hyphenated-domain rules from cibc-wiki.
- **Decisions:** Proxied rather than DNS-only, matching `wiki.` which already works against a Netlify origin. `force = true` + `:splat` copied from the wiki's file rather than rediscovered — `/privacy/my-community` is the Chrome Web Store URL and must survive a redirect.
- **State:** `citizeninfra.org` 200 with a valid cert; `www`, `citizeninfra.netlify.app`, `citizen-infra.org` and `www.citizen-infra.org` all 301 to it; MX/SPF/DKIM untouched (16 → 15 zone records). cibc-brain#30 closed.
- **Next:** Favicon + OG image still need Megan (#3). CIBC-Branding#1 contrast findings still open.
