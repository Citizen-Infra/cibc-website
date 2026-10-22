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

// Interface explanations below describe documented capabilities, not outcomes
// or usage claims. Demonstration data is synthetic and is labelled in the UI.
export const siteCopy = {
  headline: 'We build tools that let communities act together.',
  introduction: 'We build, learn, and teach how to use modern tools and protocols that serve mutualism and solidarity.',
  guideLabel: 'Explore what the tools do',
  projectsTitle: 'What we build',
  projectsIntroduction: 'Tools, experiments, and shared knowledge. Open a project to use it or learn more.',
  nextTitle: 'Where to go next',
  nextIntroduction: 'Read, meet, contribute, or support the work.',
};

export const toolExamples = [
  {
    project: 'avails',
    task: 'Find a time',
    title: 'Share a link. Find a time to meet.',
    description: 'Create a scheduling poll and share its link. Everyone marks when they are free; you choose the time that works for the group.',
    note: 'Participants can respond without an account. Polls are stored through ATProto, under the creator’s identity.',
    action: 'Open Avails',
    exampleLabel: 'Illustrative availability, not a live poll. Each cell shows how many of three people are free.',
    readExample: 'Read this example',
    explanation: 'All three people are free on Tuesday at 11:00 and Wednesday at 12:00. No poll is created and no information is sent.',
  },
  {
    project: 'allotment',
    task: 'Select a panel',
    title: 'Draw a representative group by lottery.',
    description: 'Import a candidate pool, set representation targets, and run a reproducible draw. Review the selected panel and the audit record.',
    note: 'Hand the cohort to a deliberation tool or export it as CSV or JSON. Candidate data stays with the operator’s deployment.',
    action: 'Open Allotment',
    exampleLabel: 'Illustrative 12-seat panel, not a real draw. No candidate data is used.',
    stages: ['Candidate pool', 'Representation targets', 'Panel and audit record'],
    target: 'Example target',
    result: 'Example panel',
    areas: ['Area A', 'Area B'],
    audit: 'A recorded input hash and random seed make the draw reproducible.',
  },
  {
    project: 'book-power',
    task: 'Use a book’s methods',
    title: 'Bring a book’s methods into your work.',
    description: 'Find a tool grounded in a real book. Inspect its source and installation instructions, then use it with a compatible AI assistant.',
    note: 'Book Power catalogs MCP servers and agent skills. Source books, authors, and distribution terms remain visible; some entries require an access request.',
    action: 'Browse Book Power',
    exampleLabel: 'An illustrative question and a real tool name, not an AI response.',
    questionLabel: 'A question you might bring',
    question: 'What should we examine before launching a participatory budgeting process?',
    book: 'Plurality',
    authors: 'E. Glen Weyl, Audrey Tang, and the Plurality Community · 2024',
    methodLabel: 'One of the book-powered tools',
    method: 'plurality.assess_plural_design(…)',
    explanation: 'The book supplies the framework. The tool makes that framework available to the assistant when it is relevant to your question.',
  },
];

export const availability = {
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  shortDays: ['Mon', 'Tue', 'Wed', 'Thu'],
  rows: [
    { time: '10:00', counts: [1, 2, 1, 0] },
    { time: '11:00', counts: [2, 3, 2, 1] },
    { time: '12:00', counts: [1, 2, 3, 2] },
    { time: '13:00', counts: [0, 1, 2, 1] },
  ],
};
