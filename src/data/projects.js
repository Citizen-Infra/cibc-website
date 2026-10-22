// Blurbs are each project's own description, not new marketing copy.
//
// Book Power is included deliberately. CIBC's scope is stewardship, not the
// GitHub org or the hosting boundary (cibc-brain, 2026-07-24), and the domain
// decision repeated that rule for citizeninfra.org while admitting the clause
// has no enforcement anywhere in the infrastructure. A "what we build" list
// that quietly dropped Book Power because it sits on bookpower.org would make
// the domain the boundary — one layer below the org boundary already rejected.
// This page is where that clause becomes visible instead of merely written.
//
// Avails and Community Admin moved to citizeninfra.org on 2026-08-02/03; the
// spec was written before that and still named the personal domains. Both new
// hosts verified serving before being used here.
export const projects = [
  {
    id: 'avails',
    purpose: 'Arrange a meeting',
    name: 'Avails',
    blurb: 'ATProto-powered group scheduling — an open-source LettuceMeet alternative.',
    href: 'https://avails.citizeninfra.org',
  },
  {
    id: 'allotment',
    purpose: 'Select a representative group',
    name: 'Allotment',
    blurb: 'A self-hostable fair-sortition engine: draws a representative mini-public by auditable lottery.',
    href: 'https://allotment-production.up.railway.app',
  },
  {
    id: 'my-community',
    purpose: 'Follow your communities',
    name: 'My Community',
    blurb: 'Your community dashboard as a new tab — Bluesky feeds, digests, and participation opportunities.',
    href: 'https://github.com/Citizen-Infra/my-community/releases/latest',
  },
  {
    id: 'dear-neighbors',
    purpose: 'Connect with your neighborhood',
    name: 'Dear Neighbors',
    blurb: 'Neighborhood dashboard as a new tab — community-curated local news + participation opportunities.',
    // The only project here already on the Chrome Web Store, so it links to the
    // listing rather than a repo: it is the one a visitor can install in a click.
    href: 'https://chromewebstore.google.com/detail/dear-neighbors/mofcajnlfddkgiibgodmdhghfiakgdab',
  },
  {
    id: 'community-admin',
    purpose: 'Organize a community',
    name: 'Community Admin',
    blurb: 'Shared admin platform for community organisers to manage participation opportunities.',
    href: 'https://admin.citizeninfra.org',
  },
  {
    id: 'wiki',
    purpose: 'Explore the ideas and methods',
    name: 'Citizen Infra Wiki',
    blurb: 'Citizen Infrastructure — a free, public resource for citizens.',
    href: 'https://wiki.citizeninfra.org',
  },
  {
    id: 'book-power',
    purpose: 'Use a book’s methods',
    name: 'Book Power',
    blurb: 'Books as tools for AI agents.',
    href: 'https://bookpower.org',
  },
];

export const siteCopy = {
  headline: 'We build tools that let communities act together.',
  introduction: 'We build, learn, and teach how to use modern tools and protocols that serve mutualism and solidarity.',
  projectsTitle: 'What we build',
  projectsIntroduction: 'Tools, experiments, and shared knowledge. Open a project to use it or learn more.',
  nextTitle: 'Where to go next',
  nextIntroduction: 'Read, meet, contribute, or support the work.',
};
