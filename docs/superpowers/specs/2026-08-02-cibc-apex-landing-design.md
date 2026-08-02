# CIBC apex landing page — design

**Date:** 2026-08-02 · **Repo:** `Citizen-Infra/cibc-website` · **Domain:** `citizeninfra.org`

## Goal

A single Astro page at the `citizeninfra.org` apex that acts as **CIBC's front door** — who the collective is, what it builds, and how to join or back it — routing to CIBC's existing surfaces rather than duplicating them.

## Context

CIBC bought `citizeninfra.org` on 2026-08-02. The wiki moved to `wiki.citizeninfra.org` the same day. The apex currently serves a **GoDaddy parking page**, which is live on CIBC's public domain.

`cibc-brain/decisions/2026-08-02-citizeninfra-domain-map.md` recorded the apex as "reserved, use deferred, interim redirect to the wiki." **This supersedes that** — the apex gets a real page instead of a redirect. The decision doc should get a `## Hindsight` append once this ships.

## Decisions taken

1. **The apex is CIBC's front door**, not the movement's. The wiki already owns "what is citizen infrastructure" and opens with that framing plus its own card grid. The apex owns the *collective*; the wiki owns the *idea*. This is the non-duplication rule made concrete.
2. **Primary CTA is "Join the club."** Contributors, not money, are the binding constraint — the Season 2 retrospective found the club rests on one person. The join path already exists and works: a live Harmonica onboarding session (11 participants) that ends by issuing the Telegram invite.
3. **Brand the apex now; the wiki stays vanilla for now.** Accepts a visible seam on click-through. Keeps this small, kills the parking page today, and gives Megan a live reference for the kit.
4. **Repo is `cibc-website`** — consistent with `cibc-brain` and `CIBC-Branding` in the org, and with `book-power-website` in the workspace.

## Architecture

**New public repo `Citizen-Infra/cibc-website`.** Minimal Astro, no UI framework, no CMS. Local clone at `~/claude-project/cibc-website/`.

Not inside the wiki repo: Starlight owns that project's routing and theme, its branch protection is calibrated for content contributors, and the apex needs the brand kit without fighting a docs theme.

**Deploy:** Netlify (CIBC convention — Vercel is reserved for Harmonica), git-connected, building on push to `main`. Custom domain `citizeninfra.org` with `www.citizeninfra.org` as an alias.

### Brand kit integration — mirror, do not flatten

`tokens.css` declares `@font-face` with a **relative** path, `../fonts/gulax/gulax-regular.woff2`. Vendor the branding repo's directory structure so the file stays **byte-identical to Megan's source**:

```
public/brand/tokens/tokens.css      ← copied verbatim, never edited
public/brand/fonts/gulax/gulax-regular.woff2
public/brand/fonts/gulax/gulax-regular.ttf
```

Copying `tokens.css` flat and patching the path is how a design system quietly forks. Mirroring keeps re-sync a copy rather than a merge.

`tokens.css` also `@import`s Space Grotesk, Aldrich and JetBrains Mono from Google Fonts. Accepted as-is for v1; self-hosting is a later optimisation, not a launch blocker.

All colour, type, spacing and radius values come from the `--color-*` / `--font-*` / `--text-*` / `--space-*` / `--radius-*` variables. No hardcoded values. No gradients, no shadows — the kit's stated rules.

## Page structure

One page, five bands.

1. **Header** — CIBC wordmark, no nav.
2. **Hero** — eyebrow, display headline, one supporting sentence, two buttons: `Join the club` (primary, clay) and `Back us` (secondary, outline).
3. **What we build** — flat cream cards, one per project, each linking out.
4. **Where to go next** — wiki, Telegram, events, recordings, code.
5. **Footer** — Open Collective, GitHub, brand credit to Megan Ducote (CC BY-SA 4.0).

## Copy and its provenance

Every line is either sourced from existing CIBC material or marked as new for review. Nothing is invented as fact.

| Slot | Text | Provenance |
|---|---|---|
| Eyebrow | Citizen Infrastructure Builders Club | Existing name |
| Headline | We build tools that let communities act together. | **New — not yet approved as copy.** It appeared inside the option preview Artem selected on 2026-08-02, which is not the same as sign-off on the wording. Treat as a placeholder to confirm or replace. |
| Sub | We build, learn, and teach how to use modern tools and protocols that serve mutualism and solidarity. | **Verbatim** from cibc.notion.site |

The wiki's tagline "Technology for collective action" is **deliberately not reused** — it is the wiki's line, and reusing it recreates the duplication this design exists to avoid.

Project one-liners are taken from each repo's own GitHub description or README, not rewritten as marketing copy.

## What goes in "What we build" — and why Book Power is on the list

Avails · Allotment · My Community · Community Admin · the wiki · **Book Power**

Book Power lives in a personal org on its own domain, `bookpower.org`. It is included deliberately.

The 2026-07-24 decision established that **CIBC's scope is stewardship, not the org or hosting boundary**, and named Book Power as the case that proves it. The 2026-08-02 domain decision repeated the rule for the new domain and admitted the clause has **no enforcement** — it lives in a file and nowhere in the infrastructure.

This page is the first place that clause gets tested. A "what we build" list that silently omits Book Power because it is not on `citizeninfra.org` would make the domain the boundary, one layer below the GitHub-org boundary that was already rejected.

**Flagged for review:** if Book Power should not appear here, that is a real answer, but it should be a decision rather than an omission — and it would mean the stewardship clause needs revisiting.

## Links (all verified live 2026-08-02)

| Destination | URL |
|---|---|
| Join the club | `https://app.harmonica.chat/chat?s=hst_5a179a83a29c` |
| Back us | `https://opencollective.com/citizen-infra` |
| Wiki | `https://wiki.citizeninfra.org` |
| Telegram | `https://t.me/citizen_infra` |
| Events | `https://luma.com/cibc` |
| Recordings | `https://www.youtube.com/@CitizenInfra` |
| Code | `https://github.com/Citizen-Infra` |

## Accessibility — one finding against the brand kit

The kit specifies the primary button as cream text on clay `#C57B57` at `--text-body-sm` (0.94rem, weight 600).

| Combination | Ratio | WCAG AA (4.5:1 normal text) |
|---|---|---|
| Cream `#FBF6EA` on clay `#C57B57` | **3.07:1** | Fails |
| Cream on accent-deep `#A8623F` (hover) | **4.34:1** | Fails |
| **Ink `#23291F` on clay `#C57B57`** | **4.51:1** | **Passes** |

0.94rem is not "large text" under WCAG (that needs 18.66px bold or 24px), so the 3:1 allowance does not apply.

**Build with ink on clay.** It changes no palette value and touches one token role. **Raise it to Megan as a finding on her kit rather than a silent divergence** — she owns the identity, and a fix in `tokens.css` benefits every CIBC surface, not just this page.

## Out of scope

No CMS, blog, analytics, newsletter signup, or i18n. No dark mode — the kit defines light only, and authoring dark tokens would be inventing identity that is not ours to author.

## Verification

- Clean `npm run build`
- Every external link returns 2xx
- Contrast re-checked on the built page, not just on the tokens
- Layout at 360, 768 and 1280 px
- Rendered check of the built page before the domain is pointed

## Follow-ups this creates

- Append `## Hindsight` to `cibc-brain/decisions/2026-08-02-citizeninfra-domain-map.md` — the apex is no longer deferred
- Raise the button-contrast finding with Megan against `Citizen-Infra/CIBC-Branding`
- Add `cibc-website` to `claude-config/docs/deployments.md`
- Point `citizeninfra.org` + `www` at Netlify, replacing the GoDaddy forward planned in `avails#144`
