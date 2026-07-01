// Shared FAQ data — kept in a separate file (no "use client") so both the
// server component (FAQSchema) and the client component (FAQSection) can
// import it without crossing the React Server Components module boundary.

export const FAQ_DATA = [
  {
    question: "What’s the turnaround from brief to live?",
    answer:
      "Minimum two weeks from signed agreement to first placement. That gives us time to receive your brief, script the read, get your sign-off, and slot it into the production schedule. For event-specific blocks, we work backwards from the event start date — if you’re booking the Tour de France block, you want to be confirmed at least four weeks out. Rush slots exist if something comes up and you need to move fast.",
  },
  {
    question: "Can I see audience data before committing?",
    answer:
      "Yes. Full audience report is available on request — demographics, household income, purchase intent, geographic split, device breakdown, the works. We don’t put every number on the page because some of it requires context. Fill in the form above and we’ll send it over. No commitment required to see the data.",
  },
  {
    question: "Do you have category restrictions?",
    answer:
      "A few. We don’t work with brands whose core business is at odds with the sport — so no fast food, no tobacco, nothing that would make Anthony cringe to read out loud. We do apply a one-brand-per-category rule for long-term partners, and we’ll flag if a category is already taken before you go through the booking process. If you’re not sure whether your brand fits, ask.",
  },
  {
    question: "What does success look like?",
    answer:
      "Depends on what you’re tracking, and we’ll ask you that upfront. Some brands track promo code redemptions. Some track site traffic from show notes. Some want the association with the audience and know their sales cycle is long. We’ll agree what we’re measuring before anything goes live, and we’ll send you the numbers when it’s done. Honest conversation upfront means no awkward one afterwards.",
  },
];
