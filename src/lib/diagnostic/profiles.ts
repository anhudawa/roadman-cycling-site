import type { Breakdown, CtaConfig, Profile } from "./types";

/**
 * Static breakdowns verbatim from the spec §9. These are the source
 * of truth for voice + content: the Claude API is prompted against
 * them, and if validation fails twice we fall back to rendering the
 * static version directly. Do not rewrite without Anthony's sign-off.
 */
export const PROFILE_BREAKDOWNS: Record<Profile, Breakdown> = {
  underRecovered: {
    headline: "You're not undertrained. You're under-recovered.",
    diagnosis:
      "Your diagnosis is Under-recovered. Training stress and life stress share the same bucket, and right now the bucket is overflowing.",
    whyThisIsHappening:
      "Training stress and life stress share the same bucket. When sleep drops, work pressure climbs, and the legs never come good — the body can't absorb the work you're putting in. You're doing the training. You're just not getting the adaptation.\n\nThis is the pattern Professor Seiler's work on endurance adaptation describes over and over. The riders who break through are the ones who back off first.",
    whatItsCosting:
      "Every hard session lands on top of fatigue, so the stimulus gets muted. Over months, that looks exactly like a plateau, except it's not a training problem. It's a recovery problem pretending to be one.",
    fix: [
      {
        step: 1,
        title: "Protect sleep like it's a session.",
        detail:
          "Seven and a half hours minimum, consistent wake time, no screens past 10. Non-negotiable for eight weeks.",
      },
      {
        step: 2,
        title: "Flip the load.",
        detail:
          "Two hard days max per week for the next eight weeks. Everything else is easy. Not tempo — easy.",
      },
      {
        step: 3,
        title: "Track recovery, not just training.",
        detail:
          "HRV trends matter more than Strava kudos right now. If it's dropping, you skip the session.",
      },
    ],
    whyAlone:
      "Because admitting you need less is the hardest thing in cycling. Everyone around you is training more. The coaches behind Tadej Pogačar and the ones Professor Seiler has studied for decades know this. The riders who break through are the ones who back off first.",
    nextMove:
      "Not Done Yet is built for exactly this. Weekly coaching with me, a TrainingPeaks plan that backs the load off before you do, and the recovery, nutrition and S&C work sitting alongside it. $195/month, 7-day free trial. Cancel anytime.",
    secondaryNote: null,
  },

  polarisation: {
    headline: "You're living in the grey zone.",
    diagnosis:
      "Your diagnosis is Polarisation Failure. Most of your riding is neither easy enough to aid recovery nor hard enough to drive adaptation.",
    whyThisIsHappening:
      "Most of your riding is neither easy enough to aid recovery nor hard enough to drive adaptation. Tempo, sweet spot, \"moderately hard\" — it all feels productive. It's not.\n\nStephen Seiler's research shows elite endurance athletes spend roughly 80% of their time at an intensity so easy that most recreational riders would find it frustrating to hold back. That's not an accident. That's the work.",
    whatItsCosting:
      "You accumulate fatigue without adaptation. Your easy rides are too hard to recover from, and your hard sessions are too tired to actually be hard. So the stimulus blurs, and the needle stops moving.",
    fix: [
      {
        step: 1,
        title: "Slow the easy rides down. Properly.",
        detail: "If it feels slow, slow it more. Hold power, hold heart rate, and resist the urge to push up a gear.",
      },
      {
        step: 2,
        title: "Sharpen the hard sessions.",
        detail:
          "Two or three per week, executed fully, with proper recovery around them.",
      },
      {
        step: 3,
        title: "Cut the middle.",
        detail:
          "No more \"moderate endurance\" rides that leave you half-fresh and half-cooked.",
      },
    ],
    whyAlone:
      "Because slow riding feels like wasted time. Every instinct says push a bit harder. A plan on a screen won't fix this — you need someone looking at your actual weekly output and calling the ride before you start.",
    nextMove:
      "This is the profile Not Done Yet is most directly built for. A TrainingPeaks plan that calls the easy ride easy and the hard one hard, weekly coaching to keep you honest when the legs feel good, and a community of riders who already get it. $195/month with a 7-day free trial. Cancel anytime.",
    secondaryNote: null,
  },

  strengthGap: {
    headline: "The engine's fine. The chassis isn't.",
    diagnosis:
      "Your diagnosis is Strength Gap. Your aerobic system is probably still intact — but the neuromuscular power that lets you follow an attack or finish a sprint is quietly leaking away.",
    whyThisIsHappening:
      "After about 40, we lose roughly 1% of muscle mass per year without deliberate strength work. Your aerobic system is probably still intact — but the neuromuscular power that lets you follow an attack, finish a sprint, or grind a 10-minute climb is quietly leaking away. Cardio-only training can't replace it.\n\nMost masters cycling plans bolt on a token strength block at the end. That's backwards.",
    whatItsCosting:
      "Your FTP might hold, but your top-end collapses. You're strong on the flats, dropped on the punches. The number on the screen doesn't tell the whole story.",
    fix: [
      {
        step: 1,
        title: "Lift twice a week with meaningful load.",
        detail:
          "Not bodyweight-only, not bands — structured resistance work scaled to your level. Cycling-specific patterns: split squats, hip hinges, single-leg deadlifts, hip thrusts, presses, core. Progressed gradually.",
      },
      {
        step: 2,
        title: "Add neuromuscular work on the bike.",
        detail:
          "10-second maximal sprints, standing starts, short hills.",
      },
      {
        step: 3,
        title: "Reverse the periodisation.",
        detail:
          "Start with strength and speed, add the endurance after. Most masters athletes build base forever and never circle back.",
      },
    ],
    whyAlone:
      "Because strength training for cyclists is counterintuitive. Most plans are endurance-first and bolt on a token strength block. That's backwards for masters athletes. You need someone who programs the whole picture.",
    nextMove:
      "Not Done Yet runs across the five pillars — and the S&C roadmap sits inside it, not bolted on the end. Cycling-specific lifting, the bike work paired with it, and weekly oversight from me so you actually do the work. $195/month, 7-day free trial. Cancel anytime.",
    secondaryNote: null,
  },

  fuelingDeficit: {
    headline: "You're training hungry.",
    diagnosis:
      "Your diagnosis is Fuelling Deficit. The body can't build power when it's managing a shortage — every session is being paid for with tomorrow's adaptation.",
    whyThisIsHappening:
      "Chronic low energy availability. Either you're under-fuelling on the bike, eating too little around training, or chasing a race weight that's driving the whole system into conservation mode. The body can't build power when it's managing a shortage. Every session is being paid for with tomorrow's adaptation.\n\nFemale cyclists hit this harder and earlier, but it's widespread in masters men too — and almost never diagnosed.",
    whatItsCosting:
      "Low-grade fatigue. Dropped immune function. A plateau that looks like a training problem but is actually a fuel problem.",
    fix: [
      {
        step: 1,
        title: "Fuel the work.",
        detail:
          "80g+ of carbs per hour on any ride over two hours. Non-negotiable.",
      },
      {
        step: 2,
        title: "Eat around training.",
        detail:
          "A proper meal within an hour of finishing, including carbs and protein.",
      },
      {
        step: 3,
        title: "Let go of the weight number for 12 weeks.",
        detail: "Watch what happens to power. You can always revisit weight once the engine is built.",
      },
    ],
    whyAlone:
      "Because the cycling internet has spent 20 years telling you lighter is faster. That advice is outdated. The coaches who work with pros now fuel them aggressively. You need someone in your corner who'll tell you to eat the second breakfast.",
    nextMove:
      "Not Done Yet wraps nutrition into the same plan as the training, with weekly coaching to call out where you're under-fuelling and what to change this week. The S&C, recovery and community sit alongside. $195/month with a 7-day free trial. Cancel anytime.",
    secondaryNote: null,
  },
};

/**
 * Dropped in when every profile scored under 3 points — the rider
 * probably isn't plateaued the way we measure. Still cleanly routes
 * them into NDY rather than dead-ending, per §8 edge cases.
 */
export const CLOSE_TO_BREAKTHROUGH: Breakdown = {
  headline: "You're closer to breakthrough than you think.",
  diagnosis:
    "Honestly? None of the four profiles lit up strongly for you. That usually means you're closer to breakthrough than you think — not plateaued in any of the ways this diagnostic measures.",
  whyThisIsHappening:
    "Most riders who fit this pattern have the fundamentals in place. Sleep's decent, training is polarised enough, you're fuelling reasonably, you're lifting. The stall is probably sitting in something more specific to your situation — a block structure, a taper, or a specific event target.\n\nThat's good news. The fix is almost always narrower and faster than a full profile-level rebuild.",
  whatItsCosting:
    "Not as much as you think. The risk here is overcorrecting — chasing a big change when all you need is a small, specific one.",
  fix: [
    {
      step: 1,
      title: "Hold the fundamentals.",
      detail: "Keep the sleep, the polarised training, the fuelling. Don't break what's working.",
    },
    {
      step: 2,
      title: "Look at the block, not the plan.",
      detail: "Most \"nothing's working\" windows are one poorly structured 4-week block, not a year-wide problem.",
    },
    {
      step: 3,
      title: "Get eyes on it once.",
      detail: "A single second opinion from someone who can see your files is usually enough.",
    },
  ],
  whyAlone:
    "Because the hardest plateaus to break are the ones that aren't really plateaus. You can stare at your own data for months and never see it.",
  nextMove:
    "Not Done Yet is still the right move if you want eyes on your file every week — even when the fundamentals are mostly there. Weekly coaching with me, the S&C roadmap, nutrition oversight, and a community of riders running the same system. $195/month, 7-day free trial. Cancel anytime.",
  secondaryNote: null,
};

/**
 * CTA routing. Every profile points at Not Done Yet (the /coaching
 * sales page) — direct call bookings were retired here because they
 * don't scale and split the conversion path. The personalised handoff
 * still lives in each profile's `nextMove` copy; this matrix just
 * decides which secondary content piece, if any, runs alongside.
 *
 * severeMultiSystem (§8) still routes through NDY — the sales page
 * itself surfaces the 1:1 application form for riders who need a
 * human conversation before they commit.
 */
export function ctaFor(
  profile: Profile,
  severeMultiSystem: boolean
): CtaConfig {
  const PRIMARY: Pick<CtaConfig, "primaryLabel" | "primaryHref"> = {
    primaryLabel: "Try Not Done Yet free for 7 days",
    primaryHref: "/coaching",
  };

  if (severeMultiSystem) {
    return {
      ...PRIMARY,
      secondaryLabel: "",
      secondaryHref: "",
    };
  }

  switch (profile) {
    case "underRecovered":
    case "polarisation":
      return {
        ...PRIMARY,
        secondaryLabel: "",
        secondaryHref: "",
      };
    case "strengthGap":
      return {
        ...PRIMARY,
        secondaryLabel: "Or read the strength training piece",
        secondaryHref: "/strength-training",
      };
    case "fuelingDeficit":
      return {
        ...PRIMARY,
        secondaryLabel: "Or run the fuelling calculator",
        secondaryHref: "/tools/fuelling",
      };
  }
}

export const PROFILE_LABELS: Record<Profile, string> = {
  underRecovered: "Under-recovered",
  polarisation: "Polarisation Failure",
  strengthGap: "Strength Gap",
  fuelingDeficit: "Fuelling Deficit",
};

export const CLOSE_TO_BREAKTHROUGH_LABEL =
  "Closer to breakthrough than you think";

/**
 * One-shot resolver for "what label do we show this user?" — collapses
 * the close-to-breakthrough edge case into the same call site as the
 * regular profile lookup so the results page + metadata + OG image
 * don't each reimplement the branch.
 */
export function labelFor(
  primary: Profile,
  closeToBreakthrough: boolean
): string {
  return closeToBreakthrough
    ? CLOSE_TO_BREAKTHROUGH_LABEL
    : PROFILE_LABELS[primary];
}
