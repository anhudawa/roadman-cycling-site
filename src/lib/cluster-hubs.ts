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

export interface HubResearchSource {
  title: string;
  href: string;
  /** What this source can support, including important population limits. */
  scope: string;
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
  /** Published research or official consensus used to bound the hub's claims. */
  research?: HubResearchSource[];
  /** Named editorial reviewer and ISO review date for visible and machine trust. */
  reviewedBy?: string;
  lastReviewed?: string;
  /** How evidence, expert interviews and practical guidance were separated. */
  methodology?: string;
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
  metaTitle: "VO2max Training for Masters Cyclists After 40",
  headline: "VO2MAX TRAINING AFTER 40",
  description:
    "VO2max training for masters cyclists: interpret age-related change, choose a repeatable interval dose, audit recovery and know when a health check comes first.",
  shortAnswer:
    "A masters cyclist should verify the trend with a repeatable test, keep a tolerable dose of event-relevant intensity in the programme, and progress only when execution and recovery remain stable; age alone cannot set one decline rate, interval format, weekly frequency or 72-hour rule.",
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
    { name: "Dr Andy Galpin", credential: "Exercise physiologist and Roadman podcast guest" },
    { name: "Professor Stephen Seiler", credential: "Endurance-training researcher and Roadman podcast guest" },
    { name: "Dr David Lipman", credential: "Sports physician and masters-performance researcher" },
    { name: "Joe Friel", credential: "Coach and author of Fast After 50" },
  ],
  research: [
    {
      title: "Rogers et al. — Decline in VO2max with aging in master athletes and sedentary men",
      href: "https://pubmed.ncbi.nlm.nih.gov/2361923/",
      scope: "eight-year follow-up of 15 trained male masters athletes and 14 sedentary men; a cohort result, not an individual forecast",
    },
    {
      title: "Hawkins et al. — Longitudinal change in VO2max and maximal heart rate in master athletes",
      href: "https://pubmed.ncbi.nlm.nih.gov/11581561/",
      scope: "135 male and female masters runners followed for about 8.5 years; observed rates varied with sex, body composition and training change",
    },
    {
      title: "Aerobic fitness in older endurance athletes and sedentary men",
      href: "https://pubmed.ncbi.nlm.nih.gov/11844000/",
      scope: "older male endurance athletes; the small subgroup maintaining vigorous training differed markedly from athletes who reduced it",
    },
    {
      title: "Simonsson et al. — The Umeå HIT randomized controlled trial",
      href: "https://pubmed.ncbi.nlm.nih.gov/36972981/",
      scope: "older non-exercisers on stationary bikes; both tested protocols improved VO2peak and neither represents a masters-cyclist prescription",
    },
    {
      title: "Training and cardiorespiratory-fitness loss in masters endurance athletes",
      href: "https://pubmed.ncbi.nlm.nih.gov/36078762/",
      scope: "review and regression synthesis showing wide longitudinal estimates and a strong association with changes in training volume",
    },
  ],
  reviewedBy: "Anthony Walsh",
  lastReviewed: "2026-08-26",
  methodology:
    "Roadman separated longitudinal masters-athlete evidence from cross-sectional comparisons, older-adult intervention trials and coaching practice. Population averages are used to frame questions, not predict one rider; interval selection remains conditional on the rider's event, testing method, history, health and response.",
  articleSlugs: [
    "cycling-vo2max-intervals",
    "vo2-max-workouts-cyclists-over-40",
    "vo2max-cycling-fixable-reasons-low",
    "andy-galpin-fast-twitch-fibres-cyclist-after-40",
    "cycling-over-40-getting-faster",
    "sprint-interval-training-cyclists-masters",
    "masters-cycling-training-plan-over-40",
    "training-load-management-cyclists-40s-50s",
    "sleep-and-the-masters-cyclist",
    "detraining-after-40",
    "racing-at-50-plus-masters-cycling",
  ],
  newArticleSlugs: ["vo2max-decline-reversibility-masters-cyclists"],
  pillarContent: `VO2max can matter to a masters cyclist, but a birthday does not diagnose the limiter or prescribe the workout. The useful question is not “Which interval is best after 40?” It is “What changed, how certain is the measurement, which demand matters for my event, and what dose can I repeat?”

This page owns that decision. Use the [canonical VO2max interval guide](/blog/cycling-vo2max-intervals) for session mechanics, the [low-VO2max diagnostic](/blog/vo2max-cycling-fixable-reasons-low) when the number looks wrong, the [masters weekly schedule](/blog/cycling-training-plan-masters-over-40) to place work across seven days, and the [masters plateau framework](/blog/masters-cyclist-guide-getting-faster-after-40) when a broader performance trend has stalled.

## What the masters research actually establishes

Age-related change is real at population level; one fixed rate is not. In an eight-year follow-up, [Rogers and colleagues](https://pubmed.ncbi.nlm.nih.gov/2361923/) observed a smaller average decline in 15 trained male masters athletes than in 14 sedentary men. A larger longitudinal study of [135 male and female masters runners](https://pubmed.ncbi.nlm.nih.gov/11581561/) reported much wider rates and associations with training change and body composition. In another older male cohort, the small subgroup that maintained vigorous training behaved differently from those who reduced it.

A 2022 [review and regression synthesis](https://pubmed.ncbi.nlm.nih.gov/36078762/) reported masters-athlete longitudinal estimates ranging from 5% to 46% per decade and linked much of the variation to changes in training volume. Those studies differ in population, sport, sex, age, follow-up and measurement. They support sustained training as an important modifier; they do not support subtracting 0.5% or 1% from one rider every year.

VO2max is also not the whole performance model. Threshold, economy, body composition, skill, pacing, fatigue, health and the event's demands can change while VO2max is stable. A lower wearable estimate is therefore a prompt to investigate, not a verdict.

## Step one: verify the signal

Compare like with like before changing training. A laboratory test, a repeatable field protocol and a watch estimate are not interchangeable. Check whether the same protocol, equipment, environment, fuelling state and fatigue context were used. Look for a trend across several observations rather than one bad day.

Then ask whether performance moved with the number. If repeatable climbing power, interval completion and race execution are stable, the estimate may be the noisy part. If several independent signals moved together, the change deserves a structured audit. The [VO2max estimator](/tools/vo2max) can organise a consistent field estimate, but it cannot diagnose a medical cause or replace a metabolic test.

## Step two: define the job before choosing the interval

Different sessions solve different problems. Long aerobic intervals can accumulate time near a high oxygen demand; short repeats can make that demand more tolerable; repeated sprints target a different mix of neuromuscular and metabolic qualities. None is the universal masters workout.

| The question | Best next Roadman destination |
| --- | --- |
| How should I execute VO2max intervals? | [VO2max interval guide](/blog/cycling-vo2max-intervals) |
| Which session formats can I compare? | [VO2max workouts for cyclists over 40](/blog/vo2-max-workouts-cyclists-over-40) |
| Is my estimate wrong or is something else limiting me? | [Low-VO2max diagnostic](/blog/vo2max-cycling-fixable-reasons-low) |
| How do I place the session in a week? | [Masters weekly schedule](/blog/cycling-training-plan-masters-over-40) |
| Has my whole programme plateaued? | [Four-week masters plateau audit](/blog/masters-cyclist-guide-getting-faster-after-40) |

The event decides what deserves priority. A rider preparing for repeated short climbs may need a different stimulus from a long sportive rider whose main constraint is durability. Training history matters too: an interval-naive rider and a highly trained racer should not receive the same starting dose merely because both are 52.

## Step three: start with the smallest repeatable dose

There is evidence that older adults can improve cardiorespiratory fitness with structured cycling, but it does not crown one masters protocol. In the [Umeå randomized trial](https://pubmed.ncbi.nlm.nih.gov/36972981/), 68 non-exercising adults aged 66–79 completed either twice-weekly short supramaximal intervals or longer moderate intervals for three months. VO2peak improved across the groups without a between-group difference. That is useful evidence about trainability in that population—not proof that masters cyclists need two weekly sessions, 10 × 6 seconds, 4 × 4 minutes or a fixed heart-rate target.

Choose a session the rider can execute consistently. Record interval power or pace, perceived effort, heart-rate response where useful, and the quality of the final repetitions. Progress one variable at a time: repetitions, work duration, power or reduced recovery. Do not increase all four because the first session went well.

## Step four: earn the next hard session

No trial gives every cyclist over 40 a compulsory 72-hour clock. Recovery should be judged from several signals: whether the target can be executed, whether easy riding is genuinely easy, sleep and life stress, soreness, motivation, illness and any unusual symptoms. The [training-load guide for cyclists in their 40s and 50s](/blog/training-load-management-cyclists-40s-50s) provides a broader audit; the [12-week masters plan](/blog/masters-cycling-training-plan-over-40) shows how a session can sit inside a goal-specific block.

If quality falls repeatedly, remove or move work before adding more. If the rider absorbs the session and the event demands it, the next dose can progress. “Masters” changes the questions worth monitoring; it does not supply the answer in advance.

## When this stops being a training question

An unexpected or disproportionate drop in exercise capacity, chest pain or pressure, fainting, unusual breathlessness, palpitations, persistent fatigue or other concerning symptoms needs qualified medical assessment. Iron status, infection, medication effects and cardiovascular or respiratory conditions cannot be diagnosed from an interval file or a web page.

Roadman provides education and coaching. It does not use age, VO2max or recovery data to diagnose disease, clear a rider for maximal exercise or replace individual clinical advice.`,
  faqs: [
    {
      question: "How much does VO2max really decline after 40?",
      answer:
        "There is no single annual rate for one rider. Longitudinal masters-athlete studies report materially different trajectories, and changes in training volume, body composition, sex, age, health and measurement method can all matter. Use a repeatable personal trend rather than subtracting a population percentage each year.",
    },
    {
      question: "Can a cyclist over 40 actually raise their VO2max?",
      answer:
        "Some older adults improve VO2peak with structured training, so age alone does not make improvement impossible. The size and direction of one cyclist's response depend on starting fitness, test reliability, training history, dose, adherence, recovery and health; improvement is possible, not guaranteed.",
    },
    {
      question: "What is the best VO2max session for a masters cyclist?",
      answer:
        "No single interval format is best for every masters cyclist. Choose from longer intervals, short repeats or repeated-sprint work according to the event, current limiter, training history and ability to complete quality work repeatedly; use the dedicated interval guide for session mechanics.",
    },
    {
      question: "How often should masters cyclists train VO2max?",
      answer:
        "Frequency is a load decision, not an age-group rule. Begin with the smallest dose that addresses the goal, count racing, hard group rides and strength work in the total week, and add another hard exposure only when execution and recovery remain stable.",
    },
    {
      question: "Do I need to reach 90% of maximum heart rate in every interval?",
      answer:
        "No. Heart rate lags behind power, varies between riders and conditions, and can be altered by medication and fatigue. Use power or pace, perceived effort, interval duration and repeatability alongside heart rate; do not turn one percentage into the definition of a successful session.",
    },
    {
      question: "When should a VO2max drop be checked medically?",
      answer:
        "Seek qualified medical advice when the change is unexpected or disproportionate, or when it comes with chest discomfort, fainting, unusual breathlessness, palpitations, persistent fatigue or other concerning symptoms. A coach, wearable or website cannot diagnose the cause or clear someone for maximal exercise.",
    },
  ],
  relatedHubs: [
    { label: "Reverse Periodisation", href: "/training/reverse-periodisation" },
    { label: "Masters Nutrition", href: "/nutrition/masters" },
    { label: "The Masters Hub", href: "/masters" },
  ],
  ctaHeadline: "TRAIN YOUR TOP END WITH A PLAN.",
  ctaSubhead:
    "The Not Done Yet coaching team places intensity inside your event, training history, health context and response — without using age as the whole prescription.",
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
    "The complete Zone 2 cycling hub: translate competing zone systems, estimate LT1 or VT1, use power, heart rate and RPE together, and build a repeatable aerobic dose without false precision.",
  shortAnswer:
    "Zone 2 cycling usually means low-intensity aerobic work around or below the first lactate or ventilatory threshold, LT1 or VT1. The label changes between zone systems, so a fixed FTP or maximum-heart-rate percentage is an estimate rather than a universal definition.",
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
    { name: "Dr Iñigo San Millán", credential: "Exercise physiologist; Roadman Zone 2 podcast guest" },
    { name: "Professor Stephen Seiler", credential: "Exercise physiologist; training-intensity-distribution researcher" },
    { name: "Dan Lorang", credential: "Head of Performance, Red Bull–Bora-Hansgrohe" },
    { name: "John Wakefield", credential: "Performance coach; former WorldTour coach" },
  ],
  articleSlugs: [
    "zone-2-cycling-heart-rate-vs-power-vs-rpe",
    "zone-2-vs-endurance-training",
    "what-experts-say-about-zone-2-training",
    "lactate-threshold-home-test-cyclists",
    "polarised-training-cycling-complete-guide",
    "sweet-spot-vs-threshold-vs-polarised-comparison",
    "aerobic-decoupling-cycling-cardiac-drift",
  ],
  newArticleSlugs: ["find-your-zone-2-lactate-testing-san-millan"],
  pillarContent: `Zone 2 is useful only after the model and anchor are named. Research using three zones usually calls work below the first threshold Zone 1; common cycling software often calls a conventional 56–75% FTP band Zone 2. Those labels can describe overlapping low-intensity work, but they are not interchangeable.

[Zone 2 cycling: heart rate, power, RPE and LT1](/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe) is the canonical definition and execution guide. It explains why a measured LT1 or VT1 is a stronger anchor than a generic percentage, why methods can still disagree, and why power, heart rate and RPE answer different questions.

Professor Stephen Seiler's research supports the site's discussion of training-intensity distribution. Dan Lorang's Roadman interviews support narrower coaching observations about consistency and matching load to recovery. Roadman has no verified basis for claiming that Lorang coached Tadej Pogačar or Jonas Vingegaard.

## Find YOUR Zone 2, not a textbook's

A percentage of maximum heart rate or FTP can be a starting estimate. A suitable lactate or ventilatory assessment can locate an individual first threshold more directly, although protocol and interpretation still matter. [How to find Zone 2 with lactate testing](/blog/find-your-zone-2-lactate-testing-san-millan) explains the laboratory approach, while the [at-home lactate threshold guide](/blog/lactate-threshold-home-test-cyclists) explains the extra uncertainty in field testing.

## Use each metric for its own job

Power records external work. Heart rate and RPE describe parts of the internal response. Comfortable speech is a useful field proxy, not a precise threshold test. When the signals disagree, examine duration, terrain, heat, fuelling, fatigue and device quality before declaring one metric the universal referee. [Aerobic decoupling](/blog/aerobic-decoupling-cycling-cardiac-drift) can describe how heart rate and power separate over time, but it is not a diagnosis or a standalone fitness verdict.

## Where Zone 2 sits in the bigger picture

Zone 2 is one training intensity, not a complete plan. A [polarised distribution](/blog/polarised-training-cycling-complete-guide) uses predominantly low-intensity work with a smaller high-intensity dose, but current evidence does not require an exact weekly ratio or show one distribution always wins. [Sweet spot vs threshold vs polarised](/blog/sweet-spot-vs-threshold-vs-polarised-comparison) owns the programme comparison, while [Zone 2 vs endurance training](/blog/zone-2-vs-endurance-training) separates two labels that are often used as synonyms.

Judge the complete dose. There is no evidence-backed 60- or 90-minute minimum, no universal weekly percentage and no uniquely Zone 2 adaptation. Build a repeatable aerobic workload that supports the rest of the programme.`,
  faqs: [
    {
      question: "What is Zone 2 in cycling?",
      answer:
        "Zone 2 cycling usually means low-intensity aerobic work around or below LT1 or VT1. The exact label and boundary depend on the zone system; a common seven-zone power model uses 56–75% FTP, but that band is a convention rather than an individual physiological measurement.",
    },
    {
      question: "How do I find my real Zone 2?",
      answer:
        "A suitable lactate or gas-exchange assessment can estimate LT1 or VT1. Without one, begin with a conservative power or heart-rate estimate from a named method and cross-check it with RPE, comfortable speech and repeatable response. No field proxy is an exact laboratory threshold.",
    },
    {
      question: "Why is my Zone 2 riding not working?",
      answer:
        "First confirm the zone model and anchor. Then check whether the dose is repeatable, whether conditions or fuelling changed, and whether the complete programme serves the event. Zone 2 is not guaranteed to solve every limiter, and one high heart-rate reading does not identify the cause.",
    },
    {
      question: "How much Zone 2 should I do?",
      answer:
        "There is no universal percentage, duration or session count. Training level, event demands, available time, other intensity and observed recovery determine the dose. Start from the current week, add the smallest useful amount and progress only when normal training remains repeatable.",
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
    { name: "Dan Lorang", credential: "Head of Performance, Lidl-Trek; elite endurance coach" },
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
  metaTitle: "Masters Cycling Nutrition After 40: Evidence Guide",
  headline: "MASTERS CYCLING NUTRITION",
  description:
    "Masters cycling nutrition after 40: assess energy, carbohydrate and protein needs, avoid fixed age-only targets and know when to involve a sports dietitian.",
  shortAnswer:
    "Start by matching total energy and carbohydrate to training, then assess protein against body size, dietary pattern, goals and health context; masters-specific research does not establish one universal daily target, four-meal rule or compulsory pre-sleep dose.",
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
    { name: "Alan Murchison", credential: "Chef, performance-nutrition author and Roadman podcast guest" },
    { name: "Alex Larson", credential: "Registered dietitian specialising in endurance nutrition" },
    { name: "Dr David Dunne", credential: "Performance nutritionist and Roadman podcast guest" },
    { name: "Dr Michael Ormsbee", credential: "Researcher in exercise and protein timing" },
  ],
  research: [
    {
      title: "Franzke et al. — Protein intake, performance and body composition in master athletes",
      href: "https://pubmed.ncbi.nlm.nih.gov/39940356/",
      scope: "2025 scoping review finding only 12 heterogeneous reports and no established population-specific protein recommendation",
    },
    {
      title: "Moore et al. — Protein dose response in healthy older versus younger men",
      href: "https://pubmed.ncbi.nlm.nih.gov/25056502/",
      scope: "pooled acute muscle-protein-synthesis analysis in men; useful physiology, not a masters-cyclist daily target",
    },
    {
      title: "Kim et al. — Even versus uneven protein distribution in older adults",
      href: "https://pubmed.ncbi.nlm.nih.gov/28318687/",
      scope: "small eight-week randomized trial finding no distribution effect on measured anabolic or functional outcomes",
    },
    {
      title: "Kouw et al. — Pre-sleep protein and overnight muscle protein synthesis",
      href: "https://pubmed.ncbi.nlm.nih.gov/28855419/",
      scope: "acute randomized trial in healthy older men; not a cycling-performance or long-term recovery trial",
    },
    {
      title: "Mountjoy et al. — IOC consensus statement on Relative Energy Deficiency in Sport",
      href: "https://bjsm.bmj.com/content/57/17/1073",
      scope: "health and performance framework for problematic low energy availability in female and male athletes; diagnosis requires qualified assessment",
    },
    {
      title: "Lane et al. — Low energy availability in trained male endurance athletes",
      href: "https://pubmed.ncbi.nlm.nih.gov/31581498/",
      scope: "observational self-report study including cyclists; prevalence estimates used female-derived cut-points and do not diagnose an individual",
    },
  ],
  reviewedBy: "Anthony Walsh",
  lastReviewed: "2026-08-26",
  methodology:
    "Roadman separated masters-athlete evidence from general older-adult protein studies, acute tracer experiments and expert practice. The page uses those sources to define questions and limits; it does not convert one study population into a universal diet, protein target or treatment plan.",
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
  pillarContent: `Masters cycling nutrition is not a separate food system. The useful difference after 40 is the decision context: training load, recovery, body-composition goals, dietary pattern, health, medication and the evidence gaps all deserve more attention than an age-only protein formula.

This page owns that broad nutrition audit. Use the [protein guide](/blog/cycling-protein-requirements) for the full protein question, the [bedtime protein review](/blog/bedtime-protein-cyclists-recovery-protocol) for pre-sleep evidence, the [body-composition guide](/blog/cycling-body-composition-guide) for changing weight without treating the scale as the outcome, and the [masters metabolism guide](/blog/masters-metabolism-anabolic-resistance-nutrition) for the physiology in more depth.

## Start with energy, not a supplement

A rider cannot assess protein in isolation from total energy and carbohydrate. The first questions are practical: Is body mass changing unintentionally? Are key sessions fuelled? Does the rider repeatedly finish long or hard rides depleted? Are sleep, mood, concentration, libido or menstrual function changing? Is performance falling while training load stays high?

Problematic low energy availability can affect female and male athletes. The [IOC REDs consensus](https://bjsm.bmj.com/content/57/17/1073) describes a complex health-and-performance syndrome, not a diagnosis that can be made from one calorie calculation. An observational study of [108 competitively trained male endurance athletes](https://pubmed.ncbi.nlm.nih.gov/31581498/) found many participants classified at risk using estimated energy availability, with cyclists lower than runners in that cohort; the authors also warned that the cut-points came from female research and needed validation in men.

That evidence supports taking chronic under-fuelling seriously. It does not prove that every lean rider has REDs, that one energy-availability number diagnoses it, or that turning 40 creates a new metabolic rule.

## What “anabolic resistance” can—and cannot—tell a cyclist

Older muscle can show a lower muscle-protein-synthesis response to a given feeding in controlled research. A pooled acute analysis estimated that [healthy older men required a larger relative protein dose](https://pubmed.ncbi.nlm.nih.gov/25056502/) to maximise the measured response than younger men. That helps explain why protein quantity and meal composition may deserve review with age.

It does not establish 1.6–2.2 g/kg/day, four feedings or 30–40 g per meal as compulsory for every masters cyclist. A 2025 [masters-athlete scoping review](https://pubmed.ncbi.nlm.nih.gov/39940356/) found only 12 heterogeneous studies; reported average intakes ranged from 1.0 to 1.9 g/kg/day, and the authors described population-specific recommendations as uncertain or speculative. A small eight-week trial in older adults found [no measured advantage of even versus uneven distribution](https://pubmed.ncbi.nlm.nih.gov/28318687/) at the intake tested.

The defensible approach is an assessment, not a magic number. Estimate current intake, check whether total energy and carbohydrate support the work, consider body size and dietary quality, and decide whether the goal is maintenance, adaptation, injury recovery or weight change. Plant-based patterns, appetite, gastrointestinal tolerance, kidney disease and other medical conditions can materially change the plan. A registered sports dietitian is the right person to individualise it.

## Is protein before sleep worth it?

Pre-sleep protein is an option, not the cornerstone of every masters diet. In a randomized acute trial, [48 healthy older men](https://pubmed.ncbi.nlm.nih.gov/28855419/) received 40 g casein, 20 g casein, 20 g casein plus leucine or placebo before sleep. The 40 g condition increased overnight myofibrillar protein synthesis compared with placebo. The study measured an overnight physiological response; it did not test masters cyclists, women, long-term performance, sleep quality or whether a pre-sleep feeding outperforms improving the rest of the diet.

Use it only after the larger questions are in order. If total intake is low, breakfast is routinely missed or training is chronically under-fuelled, fixing those gaps may matter more. If the rider already eats adequately and tolerates a pre-sleep snack, it can be a convenient way to distribute intake. It is not mandatory, and anyone with a relevant medical or gastrointestinal issue should seek individual advice.

## A four-part masters nutrition audit

| Audit question | What to inspect | Best next destination |
| --- | --- | --- |
| Is the rider eating enough for the work? | Weight trend, training quality, recovery, symptoms and the reliability of intake records | [Fuelling self-assessment](/blog/fuelling-self-assessment-cycling-nutrition-guide) |
| Are key rides fuelled? | Pre-ride meal, carbohydrate during longer or harder work, and post-ride access to food | [In-ride nutrition guide](/blog/cycling-in-ride-nutrition-guide) |
| Is protein adequate in context? | Current intake, body size, meal pattern, food quality, goals and health | [Protein requirements for cyclists](/blog/cycling-protein-requirements) |
| Is weight change helping performance? | Power, health, body-composition trend and whether restriction is becoming problematic | [Cycling body-composition guide](/blog/cycling-body-composition-guide) |

Change one major input, then reassess. A three-day food record can reveal obvious gaps but is not a diagnosis and often misses habitual variation. Performance, weight, appetite and recovery should be interpreted together rather than forcing one number to explain everything.

## Body composition without the lighter-is-always-faster trap

Power-to-weight matters on some courses, but the lowest possible body mass is not the performance target. Aggressive restriction can reduce training quality and may compromise lean mass, health and recovery. The [lighter-is-faster review](/blog/body-composition-cyclists-lighter-faster-myth) separates climbing context from the claim that every kilogram lost improves the rider; [Alex Larson's body-composition guidance](/blog/alex-larson-body-composition-cyclists) and [David Dunne's race-weight discussion](/blog/david-dunne-world-tour-nutritionist-cycling-weight-loss) add practical expert perspectives.

If weight change is the goal, use a slow process that protects key sessions and monitors more than the scale. Persistent fatigue, recurrent injury or illness, rapid or unexplained weight change, disordered eating, menstrual disturbance or other concerning symptoms should be assessed by an appropriate clinician and sports dietitian.

## The Roadman boundary

Roadman provides general education and coaching. This page does not prescribe a therapeutic diet, diagnose REDs or sarcopenia, or set protein and energy targets for someone with kidney disease, diabetes, gastrointestinal disease, medication interactions or another clinical condition. Those decisions need an appropriately qualified professional with the rider's full history.`,
  faqs: [
    {
      question: "How much protein does a masters cyclist need?",
      answer:
        "Masters-specific research does not establish one universal target. Start by assessing current intake, total energy, training load, body size, dietary pattern, goals and health; use a registered sports dietitian for an individual prescription, especially during weight loss, injury recovery or clinical care.",
    },
    {
      question: "What is anabolic resistance?",
      answer:
        "It describes a lower muscle-protein-synthesis response to a given anabolic stimulus in some ageing research. It makes protein adequacy worth reviewing, but it does not prove that every masters cyclist needs the same dose, meal frequency or supplement.",
    },
    {
      question: "Should masters cyclists diet to lose weight?",
      answer:
        "Weight loss may be appropriate for some riders, but age alone cannot decide it. Use a gradual, monitored process that protects key training and watches performance, health and body composition—not scale weight alone. Rapid loss, persistent symptoms or disordered eating needs professional support.",
    },
    {
      question: "Does protein before bed help cyclists recover?",
      answer:
        "An acute trial in healthy older men found that 40 g casein increased overnight muscle protein synthesis versus placebo. It did not test long-term cycling recovery or prove a compulsory dose. Pre-sleep protein is optional after total energy, carbohydrate and overall protein adequacy are addressed.",
    },
    {
      question: "Do masters cyclists need four equal protein meals?",
      answer:
        "No trial establishes that as a universal rule. Even distribution can be a practical way to avoid a very low-protein breakfast or lunch, but a small eight-week trial in older adults found no difference between even and uneven patterns at the intake tested.",
    },
    {
      question: "When should a masters cyclist see a sports dietitian or clinician?",
      answer:
        "Seek individual help for rapid or unexplained weight change, recurrent injury or illness, persistent fatigue, menstrual disturbance, disordered eating, suspected low energy availability, or a condition such as kidney disease or diabetes that changes nutrition decisions.",
    },
  ],
  relatedHubs: [
    { label: "VO2max for Masters", href: "/masters/vo2max" },
    { label: "The Masters Hub", href: "/masters" },
    { label: "Zone 2 Training", href: "/training/zone-2" },
  ],
  ctaHeadline: "FUEL TO HOLD YOUR POWER.",
  ctaSubhead:
    "Not Done Yet coaching reviews energy, carbohydrate, protein and body-composition decisions in context — without age-only targets or guaranteed outcomes.",
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
    { name: "Dan Lorang", credential: "Head of Performance, Lidl-Trek; elite endurance coach" },
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

Indoor and outdoor aren't at war — they do different jobs. [Indoor vs outdoor: when each one actually wins](/blog/indoor-vs-outdoor-cycling-training-when-each-wins) gives the session-by-session split: precise interval work and time-crunched weekdays indoors, long endurance and bike-handling outdoors. And within the pain cave there's a second choice — [smart trainer vs rollers](/blog/indoor-trainer-vs-rollers) — because they train really different things, from raw power to pedalling finesse.

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
