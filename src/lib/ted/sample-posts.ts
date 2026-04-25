// Seed content used by POST /api/admin/ted/seed-samples — lets an admin click
// "Seed sample posts" on /admin/ted and immediately see drafts in their
// approvals inbox to try out the review flow. Idempotent via stable keys.

export interface SamplePromptSeed {
  pillar: string;
  scheduledFor: string; // YYYY-MM-DD (future date)
  body: string;
}

export interface SampleWelcomeSeed {
  memberEmail: string;
  firstName: string;
  persona: string;
  draftBody: string;
}

export interface SampleSurfaceSeed {
  skoolPostId: string;
  threadUrl: string;
  threadAuthor: string;
  threadTitle: string;
  threadBody: string;
  surfaceType: "tag" | "link" | "summary";
  body: string;
}

function addDays(daysFromToday: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export const SAMPLE_PROMPTS: SamplePromptSeed[] = [
  // ── Week 1 — one per pillar, sitting in the upcoming 7 days ─────────────
  {
    pillar: "monday",
    scheduledFor: addDays(1),
    body: `Question for the group.

If you had to pick one — your Z2 rides done properly, or your intervals done properly — which would you drop?

Seiler said on the podcast that amateurs get it backwards. Grind the easy days. Coast the hard ones.

Curious what you'd do if you genuinely had to choose. And why.

— Ted`,
  },
  {
    pillar: "tuesday",
    scheduledFor: addDays(2),
    body: `60g of carbs an hour used to be the ceiling. Ben Healy won at the Tour on 140.

Podlogar's been saying the gut trains like any other tissue — weeks, not days. And most amateurs never try.

When's the last time you pushed past 80g on a long ride? What happened?

— Ted`,
  },
  {
    pillar: "wednesday",
    scheduledFor: addDays(3),
    body: `The hip hinge is the most under-trained movement for cyclists.

Not squats. Not crunches. Hinging.

Deadlift, RDL, kettlebell swing — whichever version you can own without your back rounding.

What's one S&C habit you started and actually kept?

— Ted`,
  },
  {
    pillar: "thursday",
    scheduledFor: addDays(4),
    body: `One bad week of sleep kills a block that took two months to build.

Most riders know this. Most still override it on a Tuesday night when Netflix is more appealing than bed.

What's the recovery habit that looked optional until you lost it?

— Ted`,
  },
  {
    pillar: "friday",
    scheduledFor: addDays(5),
    body: `The unwritten rule I still get wrong sometimes — you don't half-wheel the group-ride leader.

Did it twice in Wicklow last spring. Got a proper look the second time. Fair enough.

What's one you wish someone had told you earlier?

— Ted`,
  },
  {
    pillar: "saturday",
    scheduledFor: addDays(6),
    body: `Dan Lorang on Wednesday's ep: "Most amateurs don't have a VO2 problem. They have a fatigue-resistance problem."

His framing on what actually limits age-group riders is the opposite of what we keep testing for.

Does that track with you? Or is it letting the coaches off the hook?

— Ted`,
  },
  {
    pillar: "sunday",
    scheduledFor: addDays(7),
    body: `Rain over most of Europe this weekend. Heat wave apparently in the States.

What did you ride? And what did you learn?

— Ted`,
  },

  // ── Week 2 — second option per pillar so the reviewer can compare voices ──
  {
    pillar: "monday",
    scheduledFor: addDays(8),
    body: `Coaching question — serious one.

Would you rather coach your former self at 25, or your current self?

Different info, different stubbornness, different stakes. Stephen Seiler told Anthony that the hardest thing about coaching isn't the programme. It's the person.

What would you do differently if you had your old self in front of you?

— Ted`,
  },
  {
    pillar: "tuesday",
    scheduledFor: addDays(9),
    body: `Ran a fasted ride on Saturday and bonked at hour two.

Knew better. Did it anyway.

The "train low" idea has been mangled beyond recognition at amateur level. Wakefield is pretty clear — it's a pro-level tool, not a weekend habit.

When did fasted riding actually work for you? When did it backfire?

— Ted`,
  },
  {
    pillar: "wednesday",
    scheduledFor: addDays(10),
    body: `Back pain on the bike is almost never a back problem.

It's a hip problem. Or a glute that's switched off. Or a saddle position that forces you to round through the lumbar to breathe.

Most fit-ups fix the saddle and ignore the muscle work that should have happened years earlier.

What did it take for you to fix yours?

— Ted`,
  },
  {
    pillar: "thursday",
    scheduledFor: addDays(11),
    body: `HRV is the most misused number in amateur training.

Joe Friel's take — a single-day score tells you almost nothing. The trend over two weeks is the only thing worth looking at.

Does your HRV actually change what you do? Or is it a vibe check before a hard session?

— Ted`,
  },
  {
    pillar: "friday",
    scheduledFor: addDays(12),
    body: `First real ride in the rain. First time your hands stopped working.

Those are the rides you remember ten years later.

I've still got the jersey I wore on one of them. Smells like the wash that got stuck in a drawer. Absolutely precious.

What's the ride that stuck?

— Ted`,
  },
];

export const SAMPLE_WELCOMES: SampleWelcomeSeed[] = [
  {
    memberEmail: "sample-alice@example.com",
    firstName: "Alice",
    persona: "listener",
    draftBody: `Welcome in, Alice. Good to have you.

Quick way to get value here — drop a reply with (1) where you're riding, (2) what you're working on, (3) one thing you'd like to get better at.

People will pile in. That's how this place works.

— Ted`,
  },
  {
    memberEmail: "sample-sean@example.com",
    firstName: "Seán",
    persona: "comeback",
    draftBody: `Seán, welcome.

Saw the note about time off the bike. Loads of folks in here have done the same trip. Some still in it. Some out the other side.

Drop a line with where you're riding now and what you're working back up to. They'll come in with the stuff they wish they'd known.

— Ted`,
  },
  {
    memberEmail: "sample-priya@example.com",
    firstName: "Priya",
    persona: "plateau",
    draftBody: `Welcome in, Priya. Good to have you.

Saw the note — stuck at the same level for a while. You're in good company, more in here are plateaued than will admit it.

Drop a reply with where you're riding, what you've tried, and what hasn't moved. There's usually someone here who's been where you are.

— Ted`,
  },
  {
    memberEmail: "sample-matthew@example.com",
    firstName: "Matthew",
    persona: "event-prep",
    draftBody: `Matthew, welcome.

Event coming up on the calendar. Few folks in here prepping for the same kind of day — some still in the block, some just back from theirs.

Reply with the event, when it is, and where the training's at. People will share what worked and what they'd do differently.

— Ted`,
  },
];

export const SAMPLE_SURFACES: SampleSurfaceSeed[] = [
  {
    skoolPostId: "sample-thread-vo2",
    threadUrl: "https://www.skool.com/roadman/sample-vo2-thread",
    threadAuthor: "Niamh",
    threadTitle: "Anyone else find VO2 sessions destroy their week?",
    threadBody:
      "Did 5×3 at 115% this morning. Been wrecked for three days. Is this just me or do VO2 blocks need a lighter week afterwards?",
    surfaceType: "tag",
    body: `@Niamh you were on this exact question in January — might have a take. Your 3×5 rotation looked like it worked.

— Ted`,
  },
  {
    skoolPostId: "sample-thread-fuel",
    threadUrl: "https://www.skool.com/roadman/sample-fuelling-thread",
    threadAuthor: "Matthew",
    threadTitle: "How do you fuel a 4-hour gravel race?",
    threadBody:
      "First gravel race coming up — 4 hours, hilly, Irish summer so warm. What are people actually eating and drinking through it?",
    surfaceType: "link",
    body: `Tim Podlogar's episode from March covers this directly — around minute 18 he walks through the 120g/hr protocol and what it takes to actually get there. Worth the listen.

— Ted`,
  },
  {
    skoolPostId: "sample-thread-winter",
    threadUrl: "https://www.skool.com/roadman/sample-winter-thread",
    threadAuthor: "Priya",
    threadTitle: "Winter training — how many Z2 hours is enough?",
    threadBody:
      "6 hours a week is all I've got. Feeling like I should be doing 10+ based on what pros say. Am I wasting my time?",
    surfaceType: "summary",
    body: `Good thread for anyone lurking. Three takes so far: the 80/20 crowd saying more base always wins; the time-crunched group defending 6-hour weeks if intensity is right; one vote for "just do what keeps you riding."

What's the fourth?

— Ted`,
  },
  {
    skoolPostId: "sample-thread-bonk",
    threadUrl: "https://www.skool.com/roadman/sample-bonk-thread",
    threadAuthor: "Darragh",
    threadTitle: "Bonked on my long ride AGAIN — what am I missing?",
    threadBody:
      "Third Saturday in a row. 3-hour ride, started feeling rough at two hours, crawled home. Eating a banana and a bar on the way out. What's happening?",
    surfaceType: "summary",
    body: `Good one for anyone skimming. Four takes already: ate too little at the start; started too fast; didn't practice fuelling in training; sleep debt before the ride.

What's the angle nobody's said yet?

— Ted`,
  },
  {
    skoolPostId: "sample-thread-deload",
    threadUrl: "https://www.skool.com/roadman/sample-deload-thread",
    threadAuthor: "Kate",
    threadTitle: "Is a deload week actually necessary every 4 weeks?",
    threadBody:
      "Programme says deload every 4. I feel fine. Skipping it this cycle — talk me out of it if I'm being stupid.",
    surfaceType: "tag",
    body: `@Darragh you tested the skip-a-deload experiment last summer and wrote it up. Might be worth saying how it went.

— Ted`,
  },
];

export const SAMPLE_VOICE_CHECK_MARKER = {
  pass: true,
  redFlags: [],
  notes: "Seeded sample — skipped voice-check.",
  regenerationNotes: "",
  seededBy: "admin-sample",
};
