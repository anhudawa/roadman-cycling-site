import { getPostBySlug } from "./blog";
import { type ContentPillar } from "@/types";

/**
 * Topic-cluster hub pages — nested authority routes that aggregate the
 * site's existing articles on a single focused intent, attribute the
 * named experts behind the positions, and frame the cluster with
 * connective long-form prose. They are deliberately NOT in the
 * /topics/[slug] system: these live at intent-shaped nested paths
 * (/masters/vo2max, /training/zone-2, …) and are rendered by the shared
 * <ClusterHubPage /> component.
 *
 * Design rules:
 *  - Hubs aggregate; they do not duplicate. The connective prose orients
 *    the reader and links out — the depth lives in the linked articles.
 *  - Every `articleSlugs` entry is resolved through getPostBySlug at
 *    render time, so a slug that doesn't resolve is silently dropped
 *    rather than rendered as a broken link.
 *  - Expert attribution (name + credential) is required and must be
 *    authentic — people genuinely associated with the topic, most of
 *    them Roadman Cycling Podcast guests.
 */

export interface HubExpert {
  name: string;
  credential: string;
}

export interface HubFAQ {
  question: string;
  answer: string;
}

export interface HubRelated {
  label: string;
  href: string;
}

export interface ClusterHubDef {
  /** Canonical path, e.g. "/training/zone-2". */
  path: string;
  /** Stable id for analytics + JSON-LD fragments. */
  id: string;
  pillar: ContentPillar;
  /** <title> + canonical h1 (long form). */
  metaTitle: string;
  /** Hero headline (Bebas Neue, rendered uppercase). */
  headline: string;
  /** Meta description + the page's extractable short answer. */
  description: string;
  /** A tighter single-sentence answer for the ShortAnswer block. */
  shortAnswer: string;
  keywords: string[];
  /** Breadcrumb parent — must resolve to a real route. */
  parent: { label: string; href: string };
  experts: HubExpert[];
  /** Existing blog slugs to aggregate, in editorial order. */
  articleSlugs: string[];
  /** Gap articles written for this hub (also blog slugs). */
  newArticleSlugs: string[];
  /** Connective hub prose (MDX). Links out to cluster articles. */
  pillarContent: string;
  faqs: HubFAQ[];
  relatedHubs: HubRelated[];
  /** CTA headline (Bebas Neue). */
  ctaHeadline: string;
  /** CTA supporting line. */
  ctaSubhead: string;
}

/* ------------------------------------------------------------------ */
/* 1 — Masters VO2max                                                  */
/* ------------------------------------------------------------------ */

const MASTERS_VO2MAX: ClusterHubDef = {
  path: "/masters/vo2max",
  id: "masters-vo2max",
  pillar: "coaching",
  metaTitle: "VO2max for Masters Cyclists — The Complete Training Hub",
  headline: "VO2MAX AFTER 40",
  description:
    "VO2max is the first thing to go after 40 — and the most recoverable. The complete masters hub: which sessions rebuild the top end, what the research on age-related decline actually shows, and how to train your aerobic ceiling without wrecking your recovery.",
  shortAnswer:
    "VO2max declines roughly 0.5% a year in masters cyclists who keep training the top end, closer to 1% a year in those who stop — but the trajectory is trainable, not fixed. Short, hard intervals that put you at 90%+ of max heart rate two or three times a week are the highest-return work a cyclist over 40 can do.",
  keywords: [
    "vo2max masters cycling",
    "vo2max over 40",
    "vo2max decline age",
    "masters cyclist intervals",
    "vo2max training cyclists",
    "cycling after 40 vo2max",
  ],
  parent: { label: "Masters", href: "/masters" },
  experts: [
    { name: "Dr Andy Galpin", credential: "Muscle physiologist, Parker University" },
    { name: "Professor Stephen Seiler", credential: "Exercise physiologist, polarised-training researcher" },
    { name: "Dr David Lipman", credential: "Sports scientist and masters-performance researcher" },
    { name: "Joe Friel", credential: "Coach and author of Fast After 50" },
  ],
  articleSlugs: [
    "cycling-vo2max-intervals",
    "vo2-max-workouts-cyclists-over-40",
    "vo2max-training-cyclists-seven-reasons",
    "vo2max-cycling-fixable-reasons-low",
    "andy-galpin-fast-twitch-fibres-cyclist-after-40",
    "cycling-over-40-getting-faster",
    "sprint-interval-training-cyclists-masters",
    "masters-cycling-training-plan-over-40",
    "training-load-management-cyclists-40s-50s",
  ],
  newArticleSlugs: ["vo2max-decline-reversibility-masters-cyclists"],
  pillarContent: `Here's what nobody tells you about getting older on a bike. It isn't your endurance that fades first — it's your ceiling. The long Sunday rides hold up well into your fifties and beyond. What goes is the top end: the four-minute effort up the local climb, the bridge to a move, the surge that used to come for free. That top end is VO2max, and on a masters cyclist it is both the first thing to decline and the single most responsive thing you can train.

The decline is real, but it is not the number most riders fear. Across the research, a masters cyclist who keeps training intensity loses somewhere around half a percent of VO2max per year. Stop training the top end and that roughly doubles. Over two decades that is the difference between losing about 10% and losing 20% — the gap between a rider who is still racing and one who has quietly become a tourist. We pulled the research apart in [what the science says about VO2max decline and how much of it is reversible](/blog/vo2max-decline-reversibility-masters-cyclists), the piece anchored on the work of Dr David Lipman and the masters-performance data.

## Why the top end goes first

Dr Andy Galpin's research explains the mechanism better than anything else. The fibres that fade fastest with age are the fast-twitch ones — the ones that produce the snap. You keep the engine; you lose the kick. That matters for VO2max because those high-recruitment fibres are exactly the ones you call on at the top of an interval. [Galpin's findings on why the snap goes first](/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40) reframe the whole problem: it isn't that your aerobic system has collapsed, it's that you have stopped asking the fibres that drive it to show up.

The fix is uncomfortable and specific. You have to spend time at 90% of max heart rate and above, and you have to do it often enough for the adaptation to stick. That is the founding logic of [VO2max intervals](/blog/cycling-vo2max-intervals) — the sessions that raise the ceiling everything else lives under.

## The sessions that actually move it

There is no single right session, but there is a right shape. [The three VO2max workouts that work for cyclists over 40](/blog/vo2-max-workouts-cyclists-over-40) covers the classics — 5×5, 4×4, and the under-recovered "30/15" — and explains why the masters version uses fewer reps and more recovery than the plan you ran at 30. When even those stall, [sprint-interval training](/blog/sprint-interval-training-cyclists-masters) — six all-out 30-second efforts — moves FTP through a different door, recruiting the high-threshold fibres Galpin warns about.

If your number is stubbornly low, it is almost never genetics. [Seven fixable reasons your VO2max is low](/blog/vo2max-training-cyclists-seven-reasons) and the [step-by-step fix](/blog/vo2max-cycling-fixable-reasons-low) walk through the usual culprits — too much grey-zone riding, intervals that never reach the intensity that counts, recovery that never lands.

## Putting it in a masters week

The top end is not trained in isolation. It sits inside a week that has to respect a 45-year-old's recovery rate, which means two hard sessions with 72 hours between them, not three crammed into a weekend. [Getting faster after 40](/blog/cycling-over-40-getting-faster) and [the masters training plan for riders over 40](/blog/masters-cycling-training-plan-over-40) put the VO2max work in its place inside a structured, sustainable block, and [managing training load through your 40s and 50s](/blog/training-load-management-cyclists-40s-50s) keeps that balance honest week to week — ramp rate, acute-to-chronic load, and the autoregulation that stops a hard session landing on a day your body hasn't recovered for. Build the sessions into a periodised plan in [TrainingPeaks](https://www.trainingpeaks.com) so you can see the intensity distribution and stop the easy days drifting hard — the most common reason masters intervals fail.

The headline is simple, and it is the Roadman position: your top end is not a fixed inheritance you spend down with age. It is a training response. You're not done yet.`,
  faqs: [
    {
      question: "How much does VO2max really decline after 40?",
      answer:
        "Roughly 0.5% per year for masters cyclists who keep training the top end, closer to 1% per year for those who don't. Tanaka and Seals (2008) remains the canonical reference. The key finding is that the decline is heavily moderated by training — trained masters lose far less than the sedentary population, and the slope is partly recoverable.",
    },
    {
      question: "Can a cyclist over 40 actually raise their VO2max?",
      answer:
        "Yes. VO2max is one of the most trainable variables at any age. Masters cyclists who add structured high-intensity intervals two or three times a week routinely lift their VO2max even in their fifties and sixties — the response is slower than at 25 but the direction is the same.",
    },
    {
      question: "What is the best VO2max session for a masters cyclist?",
      answer:
        "Classic 5×5 (five minutes at maximal sustainable effort, five minutes easy) is the workhorse. Masters athletes get most of the benefit with fewer reps and more recovery than younger riders — three to four reps rather than five or six, and a full 72 hours before the next hard session.",
    },
    {
      question: "Why does the top end fade before endurance?",
      answer:
        "Because the fast-twitch fibres that drive high-intensity efforts atrophy faster with age than the slow-twitch fibres that carry steady endurance. Dr Andy Galpin's research describes it as keeping the engine but losing the kick — which is exactly why short, hard intervals matter more, not less, as you get older.",
    },
  ],
  relatedHubs: [
    { label: "Reverse Periodisation", href: "/training/reverse-periodisation" },
    { label: "Masters Nutrition", href: "/nutrition/masters" },
    { label: "The Masters Hub", href: "/masters" },
  ],
  ctaHeadline: "TRAIN YOUR TOP END WITH A PLAN.",
  ctaSubhead:
    "The Not Done Yet community builds your intervals, recovery and progression around a masters recovery rate — not a 25-year-old's. Serious cyclists, real structure.",
};

/* ------------------------------------------------------------------ */
/* 2 — Zone 2                                                          */
/* ------------------------------------------------------------------ */

const ZONE_2: ClusterHubDef = {
  path: "/training/zone-2",
  id: "training-zone-2",
  pillar: "coaching",
  metaTitle: "Zone 2 Training for Cyclists — The Complete Hub",
  headline: "ZONE 2 DONE RIGHT",
  description:
    "Pro cyclists spend roughly 80% of their time at a pace recreational riders could hold a conversation through. The complete Zone 2 hub: what it is, how to find your own true ceiling with lactate, and why most amateurs ride their easy days too hard.",
  shortAnswer:
    "Zone 2 is the intensity just below your first lactate threshold (LT1) — hard enough to drive mitochondrial and fat-oxidation adaptations, easy enough to talk in full sentences. Most amateurs ride it 10–20 watts too hard, which turns a recovery-building session into a fatigue-building one.",
  keywords: [
    "zone 2 training cycling",
    "zone 2 cycling",
    "find your zone 2",
    "lactate threshold zone 2",
    "lt1 cycling",
    "polarised training zone 2",
  ],
  parent: { label: "Topics", href: "/topics" },
  experts: [
    { name: "Dr Iñigo San Millán", credential: "Exercise physiologist; coach to Tadej Pogačar" },
    { name: "Professor Stephen Seiler", credential: "Exercise physiologist, polarised-training pioneer" },
    { name: "Dan Lorang", credential: "Head coach, Bora-Hansgrohe; coach to Pogačar and Vingegaard" },
    { name: "John Wakefield", credential: "Performance coach, Science to Sport" },
  ],
  articleSlugs: [
    "zone-2-training-complete-guide",
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "zone-2-vs-endurance-training",
    "what-experts-say-about-zone-2-training",
    "lactate-threshold-home-test-cyclists",
    "polarised-training-cycling-complete-guide",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "aerobic-decoupling-cycling-cardiac-drift",
  ],
  newArticleSlugs: ["find-your-zone-2-lactate-testing-san-millan"],
  pillarContent: `The cycling internet will tell you Zone 2 is "easy riding." That is true and useless in equal measure. Easy compared to what? Easy by whose heart rate? The reason most amateurs get nothing from their Zone 2 is that they ride it by feel, the feel is wrong, and they spend the whole session 15 watts into no-man's-land — too hard to build a base, too easy to build a top end. The grey zone. The single most common mistake in amateur training.

Here is the position, and it comes straight from the people who coach the best riders in the world. Professor Stephen Seiler's research on training-intensity distribution showed that elite endurance athletes spend roughly 80% of their training time genuinely easy. Dan Lorang, who has coached Tadej Pogačar and Jonas Vingegaard, prescribes the same. The hard part isn't believing it — it's holding yourself to it. [The complete guide to Zone 2 training](/blog/zone-2-training-complete-guide) lays out the why and the how.

## Find YOUR Zone 2, not a textbook's

A percentage of max heart rate is a starting point, not an answer. Your true Zone 2 ceiling is the watts at your first lactate threshold, LT1 — the point where blood lactate first ticks above baseline — and it is personal. Dr Iñigo San Millán, the physiologist behind Pogačar's metabolic training, built his reputation on clamping riders right at that line. [How to find your own Zone 2 with lactate testing, using San Millán's methodology](/blog/find-your-zone-2-lactate-testing-san-millan), is the piece that turns the theory into a number you can actually ride to. If you don't want to bleed for it, [the at-home lactate threshold test](/blog/lactate-threshold-home-test-cyclists) gets you a workable LT1 and LT2 without a lab.

## Pick the metric that keeps you honest

Power is precise, heart rate is honest, and RPE is the one that catches you drifting. They disagree often, and knowing which to trust when is most of the skill. [Zone 2 by heart rate vs power vs RPE](/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe) settles it. And if you want proof your base is real rather than assumed, [aerobic decoupling](/blog/aerobic-decoupling-cycling-cardiac-drift) — the cardiac drift number — tells you whether your heart rate stayed flat or quietly climbed while your power held.

## Where Zone 2 sits in the bigger picture

Zone 2 is not a training plan on its own — it is the broad base of a [polarised approach](/blog/polarised-training-cycling-complete-guide), where most riding is genuinely easy and the rest is genuinely hard, with very little in between. If you've ever wondered whether you should be doing sweet spot instead, [sweet spot vs threshold vs polarised](/blog/sweet-spot-vs-threshold-vs-polarised-comparison) is the decision tree. And because the words get used loosely, [Zone 2 vs endurance training](/blog/zone-2-vs-endurance-training) draws the line between the two — they are not the same thing.

Log it in [TrainingPeaks](https://www.trainingpeaks.com) and watch your time-in-zone honestly. The riders who break through aren't doing anything exotic. They are just genuinely easy on the easy days, for the first time in their cycling lives.`,
  faqs: [
    {
      question: "What is Zone 2 in cycling?",
      answer:
        "Zone 2 is the aerobic-endurance intensity just below your first lactate threshold (LT1) — typically around 60–75% of max heart rate, where you can hold a full conversation. It's the intensity that drives mitochondrial density and fat-oxidation adaptations without generating the fatigue of harder work.",
    },
    {
      question: "How do I find my real Zone 2?",
      answer:
        "The gold standard is a lactate step test to find LT1 — the power at which blood lactate first rises above baseline. Dr Iñigo San Millán's protocol clamps riders right at that line. A practical at-home proxy is the pace at which you can still breathe through your nose or speak full sentences, cross-checked against heart rate drift over a long steady ride.",
    },
    {
      question: "Why is my Zone 2 riding not working?",
      answer:
        "Almost always because it's too hard. Most amateurs ride Zone 2 in the grey zone — 10 to 20 watts above LT1 — which adds fatigue without the polarised benefit. Hold yourself to a power or heart-rate cap and resist the ego pull to push when you feel good.",
    },
    {
      question: "How much Zone 2 should I do?",
      answer:
        "In a polarised model, roughly 80% of your weekly training time. For a time-crunched amateur that often means most weekday rides easy and one or two genuinely hard sessions, rather than every ride landing in the moderate middle.",
    },
  ],
  relatedHubs: [
    { label: "Reverse Periodisation", href: "/training/reverse-periodisation" },
    { label: "Indoor Training", href: "/training/indoor" },
    { label: "VO2max for Masters", href: "/masters/vo2max" },
  ],
  ctaHeadline: "STOP RIDING THE GREY ZONE.",
  ctaSubhead:
    "Not Done Yet coaching sets your zones from your own data and holds you to them — so the easy days build a base instead of fatigue.",
};

/* ------------------------------------------------------------------ */
/* 3 — Reverse Periodisation                                           */
/* ------------------------------------------------------------------ */

const REVERSE_PERIODISATION: ClusterHubDef = {
  path: "/training/reverse-periodisation",
  id: "training-reverse-periodisation",
  pillar: "coaching",
  metaTitle: "Reverse Periodisation for Cyclists — The Complete Hub",
  headline: "REVERSE PERIODISATION",
  description:
    "Traditional periodisation says build base first, add intensity later. Reverse periodisation flips it — and for time-crunched amateurs facing a dark winter, it often makes more sense. The complete hub on how to structure a season that fits your life.",
  shortAnswer:
    "Reverse periodisation front-loads high-intensity work in winter and builds endurance volume closer to the season, the opposite of the classic base-then-build model. It suits time-crunched amateurs because short, hard indoor sessions are easier to fit into dark winter weeks than long base miles.",
  keywords: [
    "reverse periodisation cycling",
    "cycling periodisation",
    "base training cycling",
    "cycling training plan structure",
    "time crunched cycling training",
    "winter cycling periodisation",
  ],
  parent: { label: "Topics", href: "/topics" },
  experts: [
    { name: "Joe Friel", credential: "Coach and author of The Cyclist's Training Bible and Fast After 50" },
    { name: "Dan Lorang", credential: "Head coach, Bora-Hansgrohe; coach to Pogačar and Vingegaard" },
    { name: "Dylan Johnson", credential: "Coach and evidence-based cycling educator" },
  ],
  articleSlugs: [
    "reverse-periodisation-cycling",
    "cycling-periodisation-friel-lorang-johnson",
    "cycling-training-plan-build-friel-lorang-johnson",
    "joe-friel-fast-after-50-cycling-method",
    "cycling-base-training-guide",
  ],
  newArticleSlugs: [],
  pillarContent: `For decades the orthodoxy was settled. You build a big aerobic base over winter — long, slow miles, month after month — and you layer intensity on top as the season approaches. It works. It has produced champions. But it was built for riders with time, daylight, and a calendar that peaks once a year. Most serious amateurs have none of those things.

Reverse periodisation is the answer to that mismatch. You flip the order: short, hard, specific work through the dark months when you can only get an hour on the trainer, and longer endurance volume as the evenings open up and your event comes into view. It is not better than classic periodisation in a vacuum — it is better suited to a particular life. [Reverse periodisation for time-crunched riders](/blog/reverse-periodisation-cycling) makes the full case and shows who it actually fits.

## Periodisation, not just "ride more"

The deeper point is that any periodisation beats none. "Just ride more" stops working at about five hours a week; past that, the amateurs who keep improving are the ones running real structure. [How to periodise your cycling season — the system Joe Friel, Dan Lorang and Dylan Johnson actually use](/blog/cycling-periodisation-friel-lorang-johnson) lays out the principles the best coaches agree on, and [how to build a training plan that fits your weekly hours](/blog/cycling-training-plan-build-friel-lorang-johnson) turns those principles into a plan you can run.

## The base still matters — it just moves

Reversing the order doesn't mean skipping the aerobic base; it means building it at a different time and often through different means. [Cycling base training](/blog/cycling-base-training-guide) explains what the base actually is — the mitochondrial, capillary and fat-oxidation engine — and why no amount of intensity compensates for its absence. The reverse model simply trusts that you can develop and hold that engine without parking it at the front of the calendar.

## What the masters evidence adds

Joe Friel, still riding twelve hours a week in his eighties, has spent four decades refining how older athletes should structure a year. [Friel's Fast After 50 method](/blog/joe-friel-fast-after-50-cycling-method) leans toward protecting intensity rather than burying it under endless base — a philosophy that sits naturally alongside reverse periodisation and matters even more after 40, when the top end is the first thing to fade. Pair it with the work in our [VO2max for masters hub](/masters/vo2max).

However you sequence it, the year only works if it is written down and adjusted as you go. Map the blocks in [TrainingPeaks](https://www.trainingpeaks.com), and run the structured sessions on [TrainingPeaks Virtual](https://www.trainingpeaks.com/virtual/) through the winter so the hard weeks land exactly as planned rather than by feel. Structure is the product. The plan that fits your life is the one you'll actually finish.`,
  faqs: [
    {
      question: "What is reverse periodisation in cycling?",
      answer:
        "Reverse periodisation front-loads high-intensity and threshold work early in the training year — typically through winter — and builds longer endurance volume closer to the racing or event season. It's the opposite sequence to the classic base-then-build model.",
    },
    {
      question: "Who should use reverse periodisation?",
      answer:
        "Time-crunched amateurs who can only train short sessions through a dark winter, riders whose key events fall in late summer, and anyone who finds long winter base miles impractical. It's less suited to riders with unlimited time who peak early in the season.",
    },
    {
      question: "Does reverse periodisation skip base training?",
      answer:
        "No. It still builds the aerobic base — it just develops it at a different point in the year, and often through shorter, more concentrated work rather than months of long slow distance. The engine still has to be built; only the timing changes.",
    },
    {
      question: "Is reverse periodisation better than traditional periodisation?",
      answer:
        "Neither is universally better. Traditional periodisation suits riders with time and daylight; reverse periodisation suits the time-crunched amateur with a late-season target. The best model is the one that matches your calendar, your daylight and your event — which is exactly why coaches periodise to the individual.",
    },
  ],
  relatedHubs: [
    { label: "Zone 2 Training", href: "/training/zone-2" },
    { label: "Indoor Training", href: "/training/indoor" },
    { label: "VO2max for Masters", href: "/masters/vo2max" },
  ],
  ctaHeadline: "A SEASON BUILT AROUND YOUR LIFE.",
  ctaSubhead:
    "Not Done Yet coaching periodises your year to your calendar, your daylight and your event — not a generic template.",
};

/* ------------------------------------------------------------------ */
/* 4 — Masters Nutrition                                               */
/* ------------------------------------------------------------------ */

const MASTERS_NUTRITION: ClusterHubDef = {
  path: "/nutrition/masters",
  id: "nutrition-masters",
  pillar: "nutrition",
  metaTitle: "Masters Nutrition for Cyclists — The Complete Hub",
  headline: "FUELLING AFTER 40",
  description:
    "After 40 the rules change. Anabolic resistance means you need more protein to hold the same muscle, recovery windows lengthen, and the 'ride more, eat less' model does real damage. The complete masters nutrition hub.",
  shortAnswer:
    "Masters cyclists develop anabolic resistance — the muscle-building response to protein blunts with age — so protein needs rise to 1.6–2.2 g/kg/day spread across four feedings of 30–40g. Under-fuelling to chase race weight backfires after 40, accelerating muscle loss rather than fat loss.",
  keywords: [
    "masters cycling nutrition",
    "cycling nutrition over 40",
    "anabolic resistance cycling",
    "protein masters cyclist",
    "cycling body composition over 40",
    "masters cyclist diet",
  ],
  parent: { label: "Masters", href: "/masters" },
  experts: [
    { name: "Alan Murchison", credential: "Michelin-starred chef and performance nutrition specialist" },
    { name: "Alex Larson", credential: "Registered dietitian, endurance nutrition" },
    { name: "Dr David Dunne", credential: "Sports nutritionist and performance scientist" },
    { name: "Dr Michael Ormsbee", credential: "Researcher in protein timing and overnight recovery" },
  ],
  articleSlugs: [
    "alan-murchison-michelin-star-chef-cycling-nutrition",
    "alex-larson-body-composition-cyclists",
    "david-dunne-world-tour-nutritionist-cycling-weight-loss",
    "cycling-protein-requirements",
    "bedtime-protein-cyclists-recovery-protocol",
    "cycling-body-composition-guide",
    "body-composition-cyclists-lighter-faster-myth",
    "what-experts-say-about-cycling-nutrition",
  ],
  newArticleSlugs: ["masters-metabolism-anabolic-resistance-nutrition"],
  pillarContent: `The cycling internet sells masters riders the same nutrition advice it sells everyone: eat less, ride more, get lighter, go faster. For a 25-year-old it's incomplete. For a 50-year-old it's actively harmful. The metabolism you're feeding at 50 does not respond the way it did at 30, and the single biggest change has a name most amateurs have never heard: anabolic resistance.

Anabolic resistance means the muscle-building machinery gets harder to switch on with age. The same protein feeding that built muscle in your thirties produces a smaller response in your fifties. So the masters rider who cuts food to lose weight isn't trimming fat — they're shedding the muscle that holds their power. [What changes about masters metabolism, and the anabolic-resistance protein protocol that answers it](/blog/masters-metabolism-anabolic-resistance-nutrition) is the piece that puts the whole shift in one place.

## Protein is the lever, and the dose went up

The practical consequence is a higher protein target, eaten differently. Where younger riders get away with 1.4 g/kg, masters cyclists do better at 1.6 to 2.2 g/kg/day, split into four feedings of 30 to 40g rather than loaded into dinner. [How much protein cyclists actually need](/blog/cycling-protein-requirements) covers the targets and timing; registered dietitian Alex Larson's work on [getting lean and staying lean](/blog/alex-larson-body-composition-cyclists) shows why under-eating sabotages the very body composition riders are chasing.

One feeding matters more with age than any other. Dr Michael Ormsbee's research on [40 grams of protein before bed](/blog/bedtime-protein-cyclists-recovery-protocol) targets the overnight repair window — the lever most amateurs skip and the one anabolic-resistant muscle needs most.

## Stop chasing the scale

Body composition, not bodyweight, is the number that determines how you climb. [Why "lighter is faster" is holding you back](/blog/body-composition-cyclists-lighter-faster-myth) and [the body composition guide](/blog/cycling-body-composition-guide) make the case that scale weight is a crude, often misleading proxy — and Dr David Dunne, who has fed World Tour riders, explains in [why most cyclists get race weight wrong](/blog/david-dunne-world-tour-nutritionist-cycling-weight-loss) how the lighter-is-faster framing creates the problem it claims to solve.

## Eating well is a skill, not a sacrifice

None of this requires misery. Michelin-starred chef Alan Murchison, who feeds Specialized Factory Racing, makes the case in [what a Michelin chef knows about cycling nutrition](/blog/alan-murchison-michelin-star-chef-cycling-nutrition) that performance food can be food you actually want to eat. And [what the sports scientists say about cycling nutrition](/blog/what-experts-say-about-cycling-nutrition) gathers the consensus from the researchers on carbs per hour, fasted training and race weight.

The masters position is the opposite of restriction. You eat to hold muscle, fuel your sessions and recover faster — and the leanness follows. It pairs directly with the training in our [VO2max for masters hub](/masters/vo2max).`,
  faqs: [
    {
      question: "How much protein does a masters cyclist need?",
      answer:
        "1.6 to 2.2 g/kg of bodyweight per day, distributed across roughly four feedings of 30–40g rather than concentrated in one meal. The higher end and even spread both help overcome anabolic resistance — the age-related blunting of the muscle-building response to protein.",
    },
    {
      question: "What is anabolic resistance?",
      answer:
        "Anabolic resistance is the reduced muscle-protein-synthesis response to a given dose of protein and training that develops with age. Practically, it means a masters cyclist needs more protein per feeding, and more total, to maintain the muscle a younger rider holds onto more easily.",
    },
    {
      question: "Should masters cyclists diet to lose weight?",
      answer:
        "Aggressive calorie restriction tends to backfire after 40 because it strips muscle alongside fat, lowering power and slowing metabolism. The better approach is to fuel training properly, hit a high protein target, and let body composition improve gradually — chasing the scale is the wrong target.",
    },
    {
      question: "Does protein before bed help cyclists recover?",
      answer:
        "Yes. Dr Michael Ormsbee's research shows 30–40g of a slow-digesting protein like casein in the 30 minutes before sleep supports overnight muscle repair. For masters cyclists fighting anabolic resistance, that overnight feeding is one of the highest-value habits available.",
    },
  ],
  relatedHubs: [
    { label: "VO2max for Masters", href: "/masters/vo2max" },
    { label: "The Masters Hub", href: "/masters" },
    { label: "Zone 2 Training", href: "/training/zone-2" },
  ],
  ctaHeadline: "FUEL TO HOLD YOUR POWER.",
  ctaSubhead:
    "Not Done Yet coaching builds your protein, fuelling and body-composition plan around a masters metabolism — so you get leaner without losing the muscle that drives you.",
};

/* ------------------------------------------------------------------ */
/* 5 — Indoor Training                                                 */
/* ------------------------------------------------------------------ */

const INDOOR: ClusterHubDef = {
  path: "/training/indoor",
  id: "training-indoor",
  pillar: "coaching",
  metaTitle: "Indoor Cycling Training — The Complete Hub",
  headline: "INDOOR, DONE PROPERLY",
  description:
    "The turbo trainer is the most time-efficient tool a cyclist owns — and the one most people use wrong. The complete indoor hub: when indoor beats outdoor, managing the heat that wrecks your sessions, and how to make structured platforms count.",
  shortAnswer:
    "Indoor training is the most time-efficient way to hit precise power targets, but its hidden tax is heat — with no airflow your core temperature climbs and power fades, so cooling is a performance variable, not a comfort one. Pair a big fan and a cool room with structured sessions on a platform like TrainingPeaks Virtual to make the time count.",
  keywords: [
    "indoor cycling training",
    "turbo trainer training",
    "indoor cycling heat",
    "trainingpeaks virtual",
    "winter indoor cycling",
    "smart trainer training",
  ],
  parent: { label: "Topics", href: "/topics" },
  experts: [
    { name: "Professor Stephen Cheung", credential: "Environmental physiologist specialising in thermoregulation" },
    { name: "Dan Lorang", credential: "Head coach, Bora-Hansgrohe; coach to Pogačar and Vingegaard" },
    { name: "John Wakefield", credential: "Performance coach, Science to Sport" },
  ],
  articleSlugs: [
    "cycling-indoor-training-tips",
    "indoor-vs-outdoor-cycling-training-when-each-wins",
    "heart-rate-zones-indoor-vs-outdoor-cycling",
    "winter-cycling-training-indoor-protocol-pros",
    "winter-training-cycling-guide",
    "indoor-trainer-vs-rollers",
    "cycling-zwift-training-guide",
  ],
  newArticleSlugs: ["indoor-cycling-heat-management-trainingpeaks-virtual"],
  pillarContent: `Indoor training has a reputation problem. People think of it as the thing you endure when it's dark and wet — a grim substitute for real riding. That framing costs riders a lot, because the trainer is the most time-efficient tool in the sport. No coasting, no traffic lights, no descents where you stop pedalling. An hour on the trainer can hold more quality work than two hours on the road. The question is never whether to ride indoors; it's how to do it well. [How to make the turbo trainer actually work](/blog/cycling-indoor-training-tips) is the place to start.

## The variable nobody talks about: heat

Here's the thing nobody tells you about indoor training. The reason your power fades 30 minutes into a session usually isn't your legs — it's your core temperature. Outdoors you have a 30 km/h breeze stripping heat away. Indoors you have nothing, so heat builds, your heart rate drifts up, and your power drifts down. Environmental physiologist Professor Stephen Cheung's work on thermoregulation explains why a big fan and a cool room are performance equipment, not comfort items. [Managing the heat that wrecks your indoor sessions — and how TrainingPeaks Virtual fits in](/blog/indoor-cycling-heat-management-trainingpeaks-virtual) turns that into a setup you can run today.

## When indoor wins, and when it doesn't

Indoor and outdoor aren't at war — they do different jobs. [Indoor vs outdoor: when each one actually wins](/blog/indoor-vs-outdoor-cycling-training-when-each-wins) gives the session-by-session split: precise interval work and time-crunched weekdays indoors, long endurance and bike-handling outdoors. And within the pain cave there's a second choice — [smart trainer vs rollers](/blog/indoor-trainer-vs-rollers) — because they train genuinely different things, from raw power to pedalling finesse.

## Make winter the period you get fast

Most winter plans fail not from too little volume but from too much grey-zone — endless moderate spinning that builds fatigue without fitness. [The indoor protocol the pros use](/blog/winter-cycling-training-indoor-protocol-pros) and [the winter training guide](/blog/winter-training-cycling-guide) get the dose, frequency and duration right, so winter becomes the period you build spring fitness rather than just survive. If your structured work lives on a platform, [the Zwift training guide](/blog/cycling-zwift-training-guide) shows how to make the virtual world count rather than just entertain.

## Structure is what makes it count

The trainer's advantage is precision, and precision is wasted without a plan behind it. Build your sessions in [TrainingPeaks](https://www.trainingpeaks.com) and run them on [TrainingPeaks Virtual](https://www.trainingpeaks.com/virtual/), where your prescribed workout drives the resistance and the targets appear in front of you — so you hit the numbers the plan asked for instead of riding by feel and hoping. Pair the structure with the right zones from our [Zone 2 hub](/training/zone-2) and the seasonal sequencing in our [reverse periodisation hub](/training/reverse-periodisation), and the dark months become the ones that move you forward.`,
  faqs: [
    {
      question: "Is indoor cycling training as good as outdoor?",
      answer:
        "For structured interval work it's often better — you hit power targets precisely with no coasting, traffic or descents. Outdoor riding still wins for long aerobic volume, bike-handling and the mental break. The best plans use both deliberately rather than treating indoor as a poor substitute.",
    },
    {
      question: "Why does my power drop during indoor sessions?",
      answer:
        "Usually heat, not fitness. Without outdoor airflow your core temperature rises, heart rate drifts up and power falls — a phenomenon called cardiovascular drift. A powerful fan, a cool room and proper hydration keep core temperature down and protect your numbers through the session.",
    },
    {
      question: "What is TrainingPeaks Virtual?",
      answer:
        "TrainingPeaks Virtual is an indoor training platform that runs your prescribed structured workouts, controlling smart-trainer resistance to hold you on target and syncing the session back to your TrainingPeaks calendar. It's built around executing a plan precisely rather than gamified group riding.",
    },
    {
      question: "How do I keep cool on the indoor trainer?",
      answer:
        "Use one or two high-output fans aimed at your core and head, train in the coolest room available, keep the temperature low, and hydrate before you start rather than only when you're already hot. Pre-cooling and airflow are the two biggest levers on indoor power.",
    },
  ],
  relatedHubs: [
    { label: "Zone 2 Training", href: "/training/zone-2" },
    { label: "Reverse Periodisation", href: "/training/reverse-periodisation" },
    { label: "VO2max for Masters", href: "/masters/vo2max" },
  ],
  ctaHeadline: "MAKE THE PAIN CAVE COUNT.",
  ctaSubhead:
    "Not Done Yet coaching turns your indoor hours into a structured block that builds real fitness — not just sweat on the floor.",
};

/* ------------------------------------------------------------------ */

export const CLUSTER_HUBS: ClusterHubDef[] = [
  MASTERS_VO2MAX,
  ZONE_2,
  REVERSE_PERIODISATION,
  MASTERS_NUTRITION,
  INDOOR,
];

export interface ResolvedHubArticle {
  slug: string;
  title: string;
  excerpt: string;
  pillar: ContentPillar;
  readTime: string;
  isNew: boolean;
}

export interface ResolvedClusterHub extends ClusterHubDef {
  articles: ResolvedHubArticle[];
}

/**
 * Resolve a hub definition into renderable data. Every aggregated and
 * new article slug is looked up via getPostBySlug; slugs that don't
 * resolve are dropped (no broken links) and logged in dev so a typo
 * surfaces during the build rather than shipping a missing card.
 */
export function resolveClusterHub(def: ClusterHubDef): ResolvedClusterHub {
  const resolve = (slug: string, isNew: boolean): ResolvedHubArticle | null => {
    const post = getPostBySlug(slug);
    if (!post) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[cluster-hubs] ${def.path}: article slug not found — ${slug}`);
      }
      return null;
    }
    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      pillar: post.pillar,
      readTime: post.readTime,
      isNew,
    };
  };

  const newArticles = def.newArticleSlugs
    .map((s) => resolve(s, true))
    .filter((a): a is ResolvedHubArticle => a !== null);
  const existingArticles = def.articleSlugs
    .map((s) => resolve(s, false))
    .filter((a): a is ResolvedHubArticle => a !== null);

  // New gap articles lead the grid — they're the reason to come back.
  return { ...def, articles: [...newArticles, ...existingArticles] };
}

export function getClusterHubByPath(path: string): ClusterHubDef | undefined {
  return CLUSTER_HUBS.find((h) => h.path === path);
}

export function getAllClusterHubPaths(): string[] {
  return CLUSTER_HUBS.map((h) => h.path);
}

export interface ArticleHubRef {
  /** Hub path, e.g. "/training/zone-2". */
  path: string;
  /** Hub display title. */
  label: string;
}

/**
 * Reverse lookup: given a blog slug, return the cluster hub it belongs
 * to (first match if it appears in more than one). Used by the blog post
 * template to render a visible backlink from every aggregated article to
 * its hub — the second half of the bidirectional hub↔article link, done
 * without editing the article files themselves.
 */
export function getClusterHubForArticle(slug: string): ArticleHubRef | null {
  for (const hub of CLUSTER_HUBS) {
    if (hub.articleSlugs.includes(slug) || hub.newArticleSlugs.includes(slug)) {
      return { path: hub.path, label: hub.metaTitle };
    }
  }
  return null;
}
