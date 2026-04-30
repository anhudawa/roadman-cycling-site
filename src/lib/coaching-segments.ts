/**
 * Coaching segment landing pages — content data.
 *
 * Each entry powers one /coaching/<slug> page rendered through the shared
 * <SegmentPage> component. Editing copy here updates the page; do not edit
 * the rendering component for one-off content tweaks.
 *
 * Voice: Anthony Walsh — direct, evidence-based, references named experts
 * (Seiler, Lorang, Wakefield, Friel). Anti-diet-culture nutrition position.
 * Pro-polarised training. TrainingPeaks favourable. USD pricing.
 */

export interface SessionDay {
  day: string;
  session: string;
  duration: string;
}

export interface Mistake {
  title: string;
  description: string;
}

export interface CaseStudy {
  name: string;
  context: string;
  result: string;
  quote: string;
}

export interface SegmentFAQ {
  question: string;
  answer: string;
}

export interface SegmentData {
  slug: string;
  /** SEO title (under 60 chars where possible) */
  seoTitle: string;
  seoDescription: string;
  /** H1 — rendered uppercase */
  h1: string;
  /** Eyebrow tag above the H1 */
  heroEyebrow: string;
  /** Coral-highlighted subline under the H1 */
  heroAccent: string;
  /** 2-3 sentence "who this is for" answer block */
  directAnswer: string;
  /** 2-3 paragraph problem statement */
  problem: string[];
  /** Right-rail bullet list — what changes about coaching for this segment */
  whatChanges: string[];
  /** 5 pillar items, segment-specific */
  pillars: { number: string; title: string; description: string }[];
  /** Example training week — 7 days */
  sampleWeek: SessionDay[];
  /** Hours/week label for the sample week block */
  sampleWeekHours: string;
  /** Sample week framing line */
  sampleWeekContext: string;
  /** Mistakes to avoid — 3 to 5 */
  mistakes: Mistake[];
  /** Case study / outcome */
  caseStudy: CaseStudy;
  /** FAQ — 4 to 6 items */
  faqs: SegmentFAQ[];
  /** "Yes if you" list */
  yesIfYou: string[];
  /** "Not if you" list */
  notIfYou: string[];
  /** Schema.org Service serviceType */
  serviceType: string;
  /** Visual breaker word, e.g. "MASTERS" */
  breakerWord: string;
  /**
   * Optional segment-specific resource links — free tools, curated
   * playlists, deep-dive guides. Renders as a small linked panel on the
   * segment page when present. Use sparingly: only resources that
   * directly serve the segment, not generic site links.
   */
  relatedResources?: {
    label: string;
    href: string;
    description: string;
  }[];
}

export const COACHING_SEGMENTS: Record<string, SegmentData> = {
  masters: {
    slug: "masters",
    seoTitle: "Online Cycling Coach for Masters Riders | $195/mo",
    seoDescription:
      "Online cycling coach for masters riders over 40. Power preservation, recovery management, and structured progression — built on conversations with Seiler, Lorang, and Friel. Personalised TrainingPeaks plans.",
    h1: "Online Cycling Coach for Masters Riders",
    heroEyebrow: "COACHING FOR MASTERS RIDERS",
    heroAccent: "PROTECT THE POWER. RIDE LIKE YOU'RE NOT DONE YET.",
    directAnswer:
      "This is coaching for cyclists over 40 who refuse to accept that their best days are behind them. You've still got watts to find — but the way you trained at 30 will start breaking you down at 45. Masters coaching is built around the recovery, intensity distribution, and strength work that lets the engine keep growing while the body keeps holding up.",
    problem: [
      "Most masters cyclists ride 50% too hard when they think they're riding easy. The same gain-or-bust rides that worked at 30 are now the reason you're flat for three days after a hard Sunday. The internet keeps telling you to grind. Your body keeps telling you that doesn't work anymore.",
      "It's not your age. It's the method. The science from Professor Seiler and the work coaches like Dan Lorang do with Vingegaard and Pogacar all point the same way — the older the rider, the more polarised the training has to be. More true Zone 2. Fewer, sharper hard days. And actual recovery — not the kind where you ride easy but still drift into Zone 3.",
      "The gains are still there. They just stop arriving when you train through fatigue.",
    ],
    whatChanges: [
      "Polarised intensity distribution — closer to 85/15 than 80/20",
      "Recovery treated as a session, not a gap between sessions",
      "Strength training as a power-preservation tool, not a side dish",
      "VO2max sessions kept short, sharp, and infrequent",
      "Nutrition built around protein adequacy and fuelling — not restriction",
      "Heart rate and HRV monitored to catch overcooking before it derails a block",
    ],
    pillars: [
      {
        number: "01",
        title: "Polarised Volume",
        description:
          "True Zone 2 sessions that build mitochondrial density and fat oxidation without flooring you. Most masters drift into Zone 3 and call it endurance — your plan polices the line.",
      },
      {
        number: "02",
        title: "Sharper Intensity",
        description:
          "VO2max and threshold work compressed into shorter, higher-quality reps. You don't need three hard sessions a week — you need two of the right ones, fully recovered for.",
      },
      {
        number: "03",
        title: "Strength That Protects",
        description:
          "30-45 min of cycling-specific lifting twice a week — heavy enough to maintain type-2 fibre recruitment, intelligent enough not to wreck your legs.",
      },
      {
        number: "04",
        title: "Recovery Architecture",
        description:
          "HRV trends, sleep, and rest-day prescriptions baked into the plan. Hard days are earned by good recovery, not pushed through tiredness.",
      },
      {
        number: "05",
        title: "Fuelling, Not Restricting",
        description:
          "Protein adequacy, in-ride carbs, and proper meals around training. The under-fuelling masters cyclists fall into is what kills the gains, not the calories themselves.",
      },
    ],
    sampleWeekHours: "8-10 hrs/week",
    sampleWeekContext:
      "A typical mid-block week for a masters cyclist with full-time work, family, and a Saturday club ride. Adjusted weekly based on HRV, sleep, and how the previous block landed.",
    sampleWeek: [
      { day: "Monday", session: "Full rest or 20 min easy spin + mobility", duration: "0-30 min" },
      { day: "Tuesday", session: "VO2max — 5 x 4 min @ 110% FTP, 4 min easy", duration: "75 min" },
      { day: "Wednesday", session: "Zone 2 endurance — true HR cap, no Strava segments", duration: "75 min" },
      { day: "Thursday", session: "Strength session — heavy compound lifts, 4 x 5", duration: "45 min" },
      { day: "Friday", session: "Easy spin or rest — driven by HRV reading", duration: "0-45 min" },
      { day: "Saturday", session: "Long Zone 2 club ride — disciplined HR, no chaingang efforts", duration: "3-4 hrs" },
      { day: "Sunday", session: "Sweet spot — 3 x 12 min @ 88-93% FTP", duration: "90 min" },
    ],
    mistakes: [
      {
        title: "Treating every Saturday club ride like a race",
        description:
          "If your average HR on Saturday is in Zone 3 every week, you're never doing true endurance and never doing true intensity. Pick a HR cap and hold it — even when the chaingang lights up.",
      },
      {
        title: "Training through fatigue and calling it consistency",
        description:
          "Consistency is showing up week after week. Grinding through a body that's screaming for rest is just damage. A Friday rest day driven by HRV beats a Friday tempo session done on fumes every single time.",
      },
      {
        title: "Skipping strength because 'I don't want to bulk up'",
        description:
          "Masters cyclists lose type-2 muscle fibres faster than younger riders. Two 45-min strength sessions a week protect the watts you've already built. There is no bulk — there is power preservation.",
      },
      {
        title: "Under-fuelling the easy days",
        description:
          "The biggest weight-loss mistake masters cyclists make is eating like a teenager on hard days and like a monk on easy days. Energy availability tanks, hormones suffer, and the gains stop. Eat to support training, not to punish it.",
      },
      {
        title: "Three hard days a week",
        description:
          "Two quality sessions, fully recovered for, beats three half-recovered sessions every block. The body adapts during recovery, not during training. Add the third session back at 25 — for now, the gains live in the gap.",
      },
    ],
    caseStudy: {
      name: "Brian Morrissey",
      context: "Age 52. Shift worker. Stuck at 230w FTP for two seasons. Constantly sick after big training weeks.",
      result: "FTP 230w → 265w (+15%). Hit 4 w/kg at 52. Training fewer hours, lower average intensity, no more chest infections.",
      quote:
        "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193. FTP up 15%, hit 4 w/kg at age 52.",
    },
    faqs: [
      {
        question: "Is cycling coaching worth it for masters cyclists?",
        answer:
          "If you've been training consistently for two or more years and your power has flatlined, yes — coaching is one of the highest-leverage investments a masters cyclist can make. The mistakes that hold riders back after 40 (too much grey-zone riding, not enough recovery, no strength work) are exactly the ones a structured plan eliminates. Most of our masters members see measurable FTP gains within 8-12 weeks, often while training fewer hours than before.",
      },
      {
        question: "Can a masters cyclist still gain FTP after 40 or 50?",
        answer:
          "Yes — and the science backs this up. Trained masters cyclists hold and even improve FTP into their 50s and 60s when training is structured properly. Brian, one of our coached members, went from 230w to 265w at age 52. Kevin, age 67, set a new FTP after four decades on the bike. The ceiling is rarely physiological. It's almost always methodology.",
      },
      {
        question: "How many hours a week should a masters cyclist train?",
        answer:
          "Most of our coached masters members train between 6 and 12 hours a week. The exact number matters less than the distribution — 80-85% of those hours should be true Zone 2, with 2 sharp interval sessions plus strength work. Adding hours without fixing the intensity distribution is how masters cyclists overtrain themselves into a plateau.",
      },
      {
        question: "Do I need a power meter?",
        answer:
          "Strongly recommended. As a masters cyclist, the line between training and overtraining is narrower — power data lets your coach see exactly when you're drifting into Zone 3 on what should be a Zone 2 ride, and when your hard days are landing where they should. Heart rate alone can be misleading at 45+ because of medication interactions, daily HR variability, and the cumulative effect of life stress.",
      },
      {
        question: "How is this different from TrainerRoad or Zwift plans for masters?",
        answer:
          "TrainerRoad and Zwift give you workouts. They don't adjust for the bad night of sleep, the work stress, or the fact that your knee has been niggly since Tuesday. A coach reads the whole picture — your data, your life, your recovery — and adjusts the plan weekly. For masters cyclists, that adaptive layer is the difference between progress and burnout.",
      },
      {
        question: "Will I have to give up my Saturday club ride?",
        answer:
          "No. We periodise the club ride into your plan rather than fighting it. Sometimes it's the long Zone 2 of the week (with a HR cap you actually hold). Sometimes it's a sharpening race-pace effort. Sometimes it's swapped for a structured session if the block calls for it. Club riding is part of why you ride — it stays.",
      },
    ],
    yesIfYou: [
      "Are over 40 and feel the gains getting harder to find",
      "Have plateaued for 12+ months despite training consistently",
      "Get sick or flat for days after big training weeks",
      "Train 6-12 hours a week and want every hour to count",
      "Want structure that respects your recovery, not just your effort",
      "Already understand training basics but lack the framework",
    ],
    notIfYou: [
      "Are brand new to structured training (start with our beginners coaching)",
      "Want to grind harder rather than train smarter",
      "Are unwilling to slow down on easy days",
    ],
    serviceType: "Cycling Coaching for Masters Cyclists",
    breakerWord: "MASTERS",
    relatedResources: [
      {
        label: "Masters Recovery Score",
        href: "/tools/masters-recovery-score",
        description:
          "Free 0–100 recovery audit calibrated for cyclists 40+. Four inputs, one number, a calibrated recommendation.",
      },
      {
        label: "Masters FTP Benchmark",
        href: "/tools/masters-ftp-benchmark",
        description:
          "See where your FTP sits among trained masters cyclists in your age group. 40-44, 45-49, 50-54, 55-59, 60+.",
      },
      {
        label: "Masters Cycling Podcast Playlist",
        href: "/blog/masters-cycling-podcast-playlist",
        description:
          "Topic-organised playlist of Roadman episodes for masters cyclists — training, recovery, strength, racing, longevity.",
      },
      {
        label: "Masters Cyclist Guide",
        href: "/blog/masters-cyclist-guide-getting-faster-after-40",
        description:
          "The long-form companion guide — getting faster after 40, with the full training, recovery, and strength framework.",
      },
    ],
  },

  beginners: {
    slug: "beginners",
    seoTitle: "Cycling Coaching for Beginners | Build Real Base Fitness",
    seoDescription:
      "Cycling coaching for new cyclists building structured base fitness. No grinding, no junk miles, no overwhelm — a personalised plan that takes you from 'I ride sometimes' to 'I ride with a purpose'. $195/month.",
    h1: "Cycling Coaching for Beginners",
    heroEyebrow: "COACHING FOR NEW CYCLISTS",
    heroAccent: "BUILD A REAL BASE. SKIP THE BAD HABITS.",
    directAnswer:
      "This is coaching for cyclists in their first 6-24 months who want to build proper aerobic fitness without spending two years figuring it out the hard way. You don't need a Cat 1 plan. You need a structured base, the right intensity discipline early on, and someone who'll stop you making the mistakes that plateau most riders by year three.",
    problem: [
      "The cycling internet is overwhelming. Sweet spot, polarised, FTP, w/kg, Zone 2, Zwift races, intervals, structured plans — and somewhere in there is the actual question: what do I do this Tuesday?",
      "Most new cyclists default to one of two patterns. Either they ride hard every time they go out (because slow feels like wasted time) or they buy a 12-week training plan and lose interest by week four because nothing in it is built around them.",
      "Neither builds the engine that lasts. The right way to spend your first two years on the bike is genuinely simple — and exactly what we coach beginners through.",
    ],
    whatChanges: [
      "Time spent learning Zone 2 properly — most beginners never learn what easy actually feels like",
      "Skill work integrated early: pedal stroke, cadence, descending, group riding",
      "Slower introduction to high-intensity work — base before sharpening",
      "Plain-English plan structure with the why explained, not just the workout",
      "Equipment guidance built in — power meters, computers, what to actually buy and when",
      "Realistic progression — beginner gains are big, but only if you don't burn the engine before it builds",
    ],
    pillars: [
      {
        number: "01",
        title: "Aerobic Base First",
        description:
          "12-16 weeks of mostly Zone 2 with a clear HR or power cap. This is the work that builds the engine. Skip it and you'll plateau in 18 months no matter what comes next.",
      },
      {
        number: "02",
        title: "Skills Before Watts",
        description:
          "Cadence, pedal stroke, climbing position, descending lines, group riding. The riders who go furthest are the ones who learn to ride before they learn to suffer.",
      },
      {
        number: "03",
        title: "Confidence Through Structure",
        description:
          "Every session has a purpose written in plain English. You stop second-guessing whether you're doing the right thing — because you know what each ride is for.",
      },
      {
        number: "04",
        title: "Honest Progression",
        description:
          "Threshold and VO2max sessions added when you're ready, not before. Your plan progresses based on what you can actually absorb — not what looks impressive on Strava.",
      },
      {
        number: "05",
        title: "Community to Lean On",
        description:
          "Access to the Not Done Yet community — other riders going through the same learning curve. Questions answered fast, accountability built in.",
      },
    ],
    sampleWeekHours: "5-7 hrs/week",
    sampleWeekContext:
      "An early-block week for a beginner cyclist 4-6 months in. Designed around building Zone 2 capacity and skill, with intensity introduced gradually as the base develops.",
    sampleWeek: [
      { day: "Monday", session: "Rest", duration: "0 min" },
      { day: "Tuesday", session: "Cadence drills + Zone 2 — high cadence intervals (95-105 RPM)", duration: "60 min" },
      { day: "Wednesday", session: "Easy Zone 2 endurance — flat route, true HR cap", duration: "45 min" },
      { day: "Thursday", session: "Bike skills + light tempo — cornering, climbing position", duration: "60 min" },
      { day: "Friday", session: "Rest or 20 min very easy spin", duration: "0-20 min" },
      { day: "Saturday", session: "Long Zone 2 ride — first crack at 2+ hours, conversational pace", duration: "2-2.5 hrs" },
      { day: "Sunday", session: "Recovery spin or short hike", duration: "30-45 min" },
    ],
    mistakes: [
      {
        title: "Riding every ride hard",
        description:
          "If you only have one speed and that speed is uncomfortable, you're not building anything that lasts. The aerobic base only grows from rides that feel almost suspiciously easy. Slow is not wasted — slow is the work.",
      },
      {
        title: "Buying a 12-week race plan as your first plan",
        description:
          "Generic race plans assume you've already built the base. Doing one in your first six months is like starting marathon training without ever having jogged. The plan doesn't fail — your body just isn't ready yet.",
      },
      {
        title: "Obsessing over Strava segments",
        description:
          "Strava segments turn every ride into a race. That's fine occasionally. As your default? It's the fastest route to plateau because you never do real endurance and never recover properly. The PRs come when the engine is built.",
      },
      {
        title: "Comparing your watts to other people's",
        description:
          "Your year-one wattage means nothing. The trajectory matters. Riders who progress fastest are the ones who track their own changes — FTP up 15% in 12 weeks is enormous, even if it's still well below the rider next to you.",
      },
      {
        title: "Adding intensity before building base",
        description:
          "VO2max intervals at 6 months in feel productive but you'll plateau in a year because the engine underneath them is too small. Build the base, then sharpen it. Not the other way around.",
      },
    ],
    caseStudy: {
      name: "Kazim",
      context: "Complete novice. New to structured training. Took on a 7-day stage race covering 800km with 18,500m of climbing.",
      result: "Finished a 7-day, 800km stage race with 18,500m of climbing, having started as a complete beginner. The plan, the structure, and the trust did the work.",
      quote:
        "From being a complete novice to completing a 7-day race covering more than 800km with 18,500m of climbing. They pushed me to the limits and I had full confidence and trust in them.",
    },
    faqs: [
      {
        question: "Is cycling coaching worth it for a beginner?",
        answer:
          "Coaching is most valuable when you're still forming habits. Self-coached beginners often spend two years building the wrong habits — riding too hard on easy days, no structure, random intensity — and have to unlearn it all later. A coach in your first year saves you that detour. You build the right base, the right way, the first time.",
      },
      {
        question: "Do I need a power meter to start coaching as a beginner?",
        answer:
          "No. Many of our beginner-stage members start with heart rate and RPE alone, which is enough to coach properly through the first 6-12 months of base building. We can recommend when adding a power meter is worth the spend (usually once you're consistently riding 6+ hours a week and want to introduce structured intervals). Until then, HR is fine.",
      },
      {
        question: "How long until I see real fitness improvement?",
        answer:
          "Most beginners feel a clear difference within 4-6 weeks — easier breathing on familiar climbs, lower HR at the same speed, faster recovery between rides. Measurable FTP gains usually arrive in the 8-12 week window. The trajectory in year one is steeper than it'll ever be again — provided you don't burn the engine before it builds.",
      },
      {
        question: "What's the minimum hours per week I need?",
        answer:
          "We coach beginners on as little as 4-5 hours a week. The structure matters more than the hours. A coached 5-hour week beats a random 8-hour week every time because every session is doing the right thing for the right reason.",
      },
      {
        question: "Will the coaching adapt as I get fitter?",
        answer:
          "Yes — that's the whole point. Your plan progresses every week based on your actual data and how you responded. Once you've built the aerobic base, intensity work is added. As your goals sharpen (first sportive, first race, first century), the plan periodises towards them. You're not stuck on a beginner plan forever.",
      },
    ],
    yesIfYou: [
      "Are in your first 24 months of cycling and want to do it properly",
      "Ride 4-8 hours a week and want structure that fits your life",
      "Get overwhelmed by conflicting cycling advice online",
      "Want to avoid the mistakes that plateau most riders by year three",
      "Have a goal — a sportive, a fitness target, a category — but no plan to get there",
      "Prefer learning the why, not just being told the workout",
    ],
    notIfYou: [
      "Have never ridden a bike at all (start with a few months of just riding for fun)",
      "Want a one-size-fits-all PDF plan instead of personalised coaching",
      "Are looking for race coaching at Cat 1-2 level (we coach beginners through to advanced — start with our main coaching page)",
    ],
    serviceType: "Cycling Coaching for Beginner Cyclists",
    breakerWord: "BEGINNER",
  },

  women: {
    slug: "women",
    seoTitle: "Cycling Coaching for Women | Female-Specific Training",
    seoDescription:
      "Cycling coaching for women. Female-specific training periodisation, cycle-aware programming, fuelling for performance not restriction, and benchmarks built around female physiology. Personalised plans, $195/month.",
    h1: "Cycling Coaching for Women",
    heroEyebrow: "COACHING FOR WOMEN CYCLISTS",
    heroAccent: "TRAINING THAT WORKS WITH FEMALE PHYSIOLOGY — NOT AGAINST IT.",
    directAnswer:
      "This is coaching for women cyclists who are tired of training plans that were designed on male data and handed over with the words 'just scale it down'. Female physiology, hormonal cycles, fuelling needs, and power benchmarks are not a smaller version of the male model — they're a different model. Coaching that respects that gets you faster.",
    problem: [
      "Most cycling coaching advice online is built on research where 90%+ of the subjects were male. Then it's repackaged for women with smaller wattage targets and the same training week. That's not coaching — that's a hand-me-down.",
      "The mistakes this creates are predictable: under-fuelled training (because the calorie advice was written for a 75kg male), intensity sessions stacked on the wrong week of your cycle, strength work that's either ignored or treated as an afterthought, and benchmarks that compare you to men instead of measuring your trajectory.",
      "The fix isn't complicated. It's just rarely offered.",
    ],
    whatChanges: [
      "Cycle-aware periodisation — heavier work loaded into the follicular phase where you adapt fastest",
      "Fuelling targets calibrated for female energy availability, not male calorie templates",
      "Strength training treated as central to power and bone health, not optional",
      "Power benchmarks compared to female age-group data — not generic w/kg charts",
      "Iron, ferritin, and recovery flagged as non-negotiables in the plan",
      "Honest conversations about RED-S and how chronic under-fuelling shuts down performance",
    ],
    pillars: [
      {
        number: "01",
        title: "Cycle-Aware Periodisation",
        description:
          "Where your cycle is regular and trackable, harder intensity blocks land in your follicular phase — when adaptation rates are highest. Premenstrual weeks shift to lower-intensity volume. The plan flexes around your physiology instead of ignoring it.",
      },
      {
        number: "02",
        title: "Fuel For Performance",
        description:
          "Female cyclists are the most under-fuelled population in the sport. We rebuild fuelling around training load and energy availability — not weight loss. Power gets built. Body composition follows.",
      },
      {
        number: "03",
        title: "Strength as a Pillar",
        description:
          "Two heavy strength sessions a week. Not pink dumbbells — proper compound lifting periodised with your riding. Power preservation, bone density, and the kind of force production that matters on every steep climb.",
      },
      {
        number: "04",
        title: "Female Power Benchmarks",
        description:
          "Your trajectory is measured against your own data and against female age-group averages — not the male w/kg charts that make every female cyclist feel like they're underperforming.",
      },
      {
        number: "05",
        title: "Recovery and Long-Term Health",
        description:
          "Sleep, iron status, energy availability, hormonal feedback. The metrics that matter long-term are baked into the conversation — not addressed only when something breaks.",
      },
    ],
    sampleWeekHours: "8-10 hrs/week",
    sampleWeekContext:
      "A mid-block week for a female cyclist in the follicular phase of her cycle. Intensity loads land here when feasible. Premenstrual weeks rebalance towards endurance and recovery.",
    sampleWeek: [
      { day: "Monday", session: "Rest or active recovery walk", duration: "0-30 min" },
      { day: "Tuesday", session: "VO2max — 6 x 3 min @ 110-115% FTP, 3 min easy", duration: "75 min" },
      { day: "Wednesday", session: "Zone 2 endurance — disciplined HR cap", duration: "75 min" },
      { day: "Thursday", session: "Heavy strength — back squat, deadlift, hip thrust, 4 x 5", duration: "50 min" },
      { day: "Friday", session: "Easy spin or rest", duration: "0-45 min" },
      { day: "Saturday", session: "Long Zone 2 ride — fuelled at 60-80g carbs/hr from the start", duration: "3-4 hrs" },
      { day: "Sunday", session: "Sweet spot — 3 x 12 min @ 88-93% FTP", duration: "90 min" },
    ],
    mistakes: [
      {
        title: "Eating like you're trying to lose weight, training like you're trying to gain power",
        description:
          "It's the most common pattern in female cycling and the fastest route to RED-S. Chronic under-fuelling tanks hormones, kills power, weakens bones, and makes weight loss harder, not easier. Fuel the work. The body composition follows.",
      },
      {
        title: "Treating your cycle like an inconvenience to ignore",
        description:
          "Hormonal phases meaningfully affect adaptation, recovery, perceived effort, and injury risk. Tracking your cycle and periodising around it isn't a soft science — it's coaching that uses the information available. Most plans throw it out.",
      },
      {
        title: "Skipping strength because 'I just want to ride'",
        description:
          "Female cyclists lose bone density and type-2 fibres faster without resistance training. Two heavy strength sessions a week aren't optional after 35 — they're the foundation of long-term power and a body that holds up.",
      },
      {
        title: "Comparing your watts to male riders in your group",
        description:
          "Female elite cyclists average ~15% lower w/kg than male elites for clear physiological reasons. Comparing your numbers to the men you ride with is comparing the wrong baseline. Compare to female age-group benchmarks and your own trajectory.",
      },
      {
        title: "Ignoring iron and ferritin",
        description:
          "Low ferritin is one of the most common — and most overlooked — causes of female cyclists feeling permanently tired. We flag the symptoms, recommend testing, and adjust training when ferritin is low so a fixable problem doesn't masquerade as a training problem.",
      },
    ],
    caseStudy: {
      name: "Mary K",
      context: "Age 56. Long-time cyclist who'd never done structured strength work. Felt power leaking on steep climbs.",
      result: "Two heavy strength sessions a week alongside structured cycling. Core stronger, position on the bike improved, climbing power back. Strength built without sacrificing ride time.",
      quote:
        "I love how targeted it is to cycling — not just general gym stuff. Every session feels like it's actually helping my performance on the bike. Core's stronger, legs feel more connected, and even my position on the bike feels better.",
    },
    faqs: [
      {
        question: "Is cycling coaching different for women than for men?",
        answer:
          "Meaningfully, yes. The endurance principles are universal — Zone 2, polarised distribution, recovery as a session — but the application changes. Cycle-aware periodisation, female-calibrated fuelling targets, strength prioritisation, and honest power benchmarking against female data all matter. A plan that ignores those is a male plan with the wattage scaled down.",
      },
      {
        question: "Do you account for the menstrual cycle in training plans?",
        answer:
          "Where it's regular and you're comfortable tracking it, yes. We load harder intensity into the follicular phase where adaptation rates are highest, and rebalance premenstrual weeks toward endurance and recovery. For riders on hormonal contraception or in perimenopause, the framework adapts — the principle is using available physiological information, not forcing every athlete into the same template.",
      },
      {
        question: "What if I'm in perimenopause or menopause?",
        answer:
          "Coaching becomes even more important. Hormonal shifts in perimenopause and menopause meaningfully affect recovery, body composition, sleep, and strength response. The training approach shifts to higher-intensity work, more strength, more deliberate recovery, and a clear conversation about fuelling. We coach a number of riders through this transition — it's a window where the right structure makes an enormous difference.",
      },
      {
        question: "Will I be the only woman in the community?",
        answer:
          "No. The Not Done Yet community has a growing female membership and our coaching covers riders across the spectrum — sportive, racing, gravel, comeback. The community Q&A, masterclasses, and coaching calls are open to all members.",
      },
      {
        question: "Do I need a power meter?",
        answer:
          "Recommended but not required to start. For female cyclists, power data is especially useful for ensuring true Zone 2 stays true — heart rate alone can drift higher in the luteal phase and confuse intensity targets. We can start with HR and RPE and add power when you're ready.",
      },
    ],
    yesIfYou: [
      "Are tired of plans that feel like they were designed for someone else",
      "Have plateaued and suspect under-fuelling or poor periodisation is part of it",
      "Want training that respects your physiology, not ignores it",
      "Are in perimenopause or menopause and need a recalibrated approach",
      "Have a goal event and want a structured female-aware build",
      "Want strength work as a serious pillar, not an afterthought",
    ],
    notIfYou: [
      "Are looking for a generic training plan rather than personalised coaching",
      "Are unwilling to fuel training properly",
      "Need a fully medicalised return-to-sport programme post-pregnancy (we'll refer you to a women's health specialist first)",
    ],
    serviceType: "Cycling Coaching for Women",
    breakerWord: "WOMEN",
  },

  "busy-professionals": {
    slug: "busy-professionals",
    seoTitle: "Cycling Coaching for Busy Professionals | 6-8 Hrs/Week",
    seoDescription:
      "Cycling coaching built for cyclists with 6-8 hours a week max. Maximum return per hour, sessions that adapt to a moving calendar, and structure that survives a real working life. $195/month.",
    h1: "Cycling Coaching for Busy Professionals",
    heroEyebrow: "COACHING FOR BUSY PROFESSIONALS",
    heroAccent: "6-8 HOURS. EVERY ONE OF THEM EARNING ITS KEEP.",
    directAnswer:
      "This is coaching for cyclists with full diaries, family commitments, and 6-8 hours a week to ride at most. The goal isn't to make you train more. It's to make every hour you do train return more — through intensity discipline, smart prioritisation, and a plan that flexes when Tuesday gets blown up by a client emergency.",
    problem: [
      "Most training advice assumes 12+ hours a week. Most professional cyclists have 6-8 — and half of those get cancelled by life. The result is a chronic mismatch: you read about 4-hour endurance rides and feel like you're failing because Sunday is your kid's match.",
      "The honest truth is that 6-8 quality hours a week, properly structured, beats 12 random hours every time. Time-crunched cyclists can absolutely keep building — but only if every session has a clear purpose and the plan flexes around real life.",
      "What kills most professional cyclists isn't the hours. It's the lack of structure when those hours land at unpredictable times.",
    ],
    whatChanges: [
      "Every session has the highest possible return — no junk miles, no filler",
      "Intensity-led training distribution: more sweet spot, more VO2max, less volume",
      "Indoor-trainer-first programming so weather and daylight aren't blockers",
      "Plan that re-shuffles weekly when meetings, travel, or family blow up the schedule",
      "Brick-style stacked sessions when you can ride longer at the weekend",
      "No guilt for missed sessions — the plan adjusts, it doesn't accumulate debt",
    ],
    pillars: [
      {
        number: "01",
        title: "Intensity-Led Distribution",
        description:
          "Time-crunched cyclists need more time at threshold and VO2max than 12-hour-a-week riders. Your plan tilts toward sweet spot and short, sharp intervals — the work that returns the most per hour.",
      },
      {
        number: "02",
        title: "Indoor-First Programming",
        description:
          "Most weekday sessions are 45-75 min on the trainer. No daylight, weather, traffic, or kit-hassle excuses. Saturday's outdoor ride becomes the reward, not the only chance to train.",
      },
      {
        number: "03",
        title: "Adaptive Scheduling",
        description:
          "When Tuesday's session moves to Wednesday, the rest of the week reshuffles intelligently — not 'add it on top'. The plan respects your reality.",
      },
      {
        number: "04",
        title: "Stacked Weekends",
        description:
          "When you do have 2-3 hours on Saturday morning, that ride is structured to deliver multiple adaptations at once — endurance plus race-pace efforts plus fuelling practice.",
      },
      {
        number: "05",
        title: "Honest Periodisation",
        description:
          "Hard blocks when work is calmer. Maintenance blocks when work is brutal. Tapers around races, deloads after stress. The annual plan is built around your life, not on top of it.",
      },
    ],
    sampleWeekHours: "6-7 hrs/week",
    sampleWeekContext:
      "A typical week for a cyclist with full-time work, family commitments, and a moving calendar. Most weekday sessions are indoor and time-boxed; the long ride lives at the weekend.",
    sampleWeek: [
      { day: "Monday", session: "Rest", duration: "0 min" },
      { day: "Tuesday", session: "VO2max indoor — 5 x 4 min @ 110% FTP, 4 min easy", duration: "60 min" },
      { day: "Wednesday", session: "Sweet spot indoor — 3 x 15 min @ 88-93% FTP", duration: "75 min" },
      { day: "Thursday", session: "Strength — 30 min cycling-specific S&C", duration: "30 min" },
      { day: "Friday", session: "Easy 30 min spin or rest", duration: "0-30 min" },
      { day: "Saturday", session: "Long ride — 2.5 hrs Zone 2 + 2 x 15 min sweet spot embedded", duration: "2.5 hrs" },
      { day: "Sunday", session: "60 min recovery spin or family ride", duration: "60 min" },
    ],
    mistakes: [
      {
        title: "Trying to follow a 12-hour-a-week plan",
        description:
          "Generic training plans assume you have time you don't have. You spend the first three weeks proud, the next three weeks behind, and the rest of the block frustrated. A plan built for your hours doesn't trigger that spiral.",
      },
      {
        title: "Doing endurance rides because 'pros do them'",
        description:
          "Pros also ride 30 hours a week. The 80/20 distribution that works at 30 hours becomes 60/40 or even 50/50 at 7 hours. Your plan's intensity distribution should match your hours — not copy the pros.",
      },
      {
        title: "Adding sessions on top of missed ones",
        description:
          "Tuesday got cancelled. The instinct is to make it up Wednesday. The right move is usually to skip it — or shorten Wednesday's planned session to absorb it. Stacking missed sessions is how time-crunched cyclists end up overcooked.",
      },
      {
        title: "No structure on the long ride",
        description:
          "If your only outdoor ride of the week is 3 hours of unstructured Zone 3, you're getting some endurance and some fatigue and not much adaptation. Embedding 1-2 structured efforts inside that ride doubles the return.",
      },
      {
        title: "Skipping strength because there's no time",
        description:
          "30 minutes of cycling-specific S&C, twice a week, is one of the highest-leverage sessions for time-crunched cyclists. It protects power, prevents injury, and adds force production. The 30 min is found by replacing one easy spin — not added on top.",
      },
    ],
    caseStudy: {
      name: "Aaron Kearney",
      context: "Time-crunched professional cyclist who'd cycled through TrainerRoad, Zwift plans, and self-coaching. Nothing stuck.",
      result: "Personalised plan, weekly coaching feedback, real adaptation. Built the engine that powered the changeover from road to ultra-endurance racing.",
      quote:
        "I tried TrainerRoad, Zwift plans, self-coaching — nothing stuck. The expertise and personalised plan allowed me to utilise my past racing experience and gave me the adaptations needed for the changeover. If you're looking to unlock new potential, I couldn't recommend Anthony enough.",
    },
    faqs: [
      {
        question: "Can I really get faster on 6-8 hours a week?",
        answer:
          "Yes — and several of our strongest results come from members training under 8 hours. The constraint forces quality, and quality with structure beats quantity without it. The trade-off is that intensity distribution shifts: you do more sweet spot and VO2max than a 12-hour rider would, and your endurance comes from disciplined Zone 2 on the few sessions you have.",
      },
      {
        question: "What happens when work blows up my training week?",
        answer:
          "The plan reshuffles. Coaching is asynchronous-first — you flag a busy week in TrainingPeaks, your coach adjusts the remaining sessions, and you carry on. There's no guilt and no accumulating session debt. A maintained engine through a brutal work week is far better than a broken one chasing the original plan.",
      },
      {
        question: "Will most of my training be indoors?",
        answer:
          "For most busy professionals, yes — the weekday structured sessions (60-75 min) are best done indoors because they remove every variable except the work itself. The weekend long ride is outdoors. Indoor isn't a downgrade — for time-crunched cyclists it's actively the right tool.",
      },
      {
        question: "Do I need TrainerRoad or Zwift on top of coaching?",
        answer:
          "No, but they integrate well. Your TrainingPeaks plan can sync to Zwift, Wahoo SYSTM, or any structured workout platform. We don't require a specific app. We do require a power meter or smart trainer for the indoor sessions to work properly.",
      },
      {
        question: "How is this different from doing TrainerRoad alone?",
        answer:
          "TrainerRoad gives you workouts. Coaching gives you a system that adapts. TrainerRoad's adaptive training is good — but it can't account for your kid being sick, the meeting that ran two hours over, or the fact that your knee has been niggly since Tuesday. A coach reads the whole picture and adjusts the plan weekly. That's the layer that actually makes time-crunched training work.",
      },
    ],
    yesIfYou: [
      "Train 5-9 hours a week and need every hour to count",
      "Have a moving calendar that breaks rigid plans",
      "Have plateaued on TrainerRoad, Zwift, or self-coaching",
      "Want indoor-first programming that doesn't depend on weather",
      "Have a target event (sportive, race, gran fondo) and limited time to prepare",
      "Are willing to fuel and recover properly so the few hours you do train actually stick",
    ],
    notIfYou: [
      "Have 12+ hours a week available (start with our main coaching page)",
      "Want a plan that ignores your real-life schedule",
      "Aren't willing to do indoor sessions when needed",
    ],
    serviceType: "Cycling Coaching for Busy Professionals",
    breakerWord: "BUSY",
  },

  sportives: {
    slug: "sportives",
    seoTitle: "Online Cycling Coach for Sportives & Gran Fondos | $195/mo",
    seoDescription:
      "Online cycling coach for sportive and gran fondo riders. Event-specific build, climbing-specific blocks, race-day pacing and fuelling, and the engine to enjoy the day instead of survive it. Personalised TrainingPeaks plans.",
    h1: "Online Cycling Coach for Sportives & Gran Fondos",
    heroEyebrow: "COACHING FOR SPORTIVES & GRAN FONDOS",
    heroAccent: "PERFORM ON THE DAY. DON'T JUST SURVIVE IT.",
    directAnswer:
      "This is coaching for cyclists targeting a specific sportive — a 100-mile, a Wicklow 200, a Marmotte, a Fred Whitton — and who want to arrive in form, pace it well, and finish strong. Not just complete the distance. Get to the finish with something left and a finishing time you actually wanted.",
    problem: [
      "Most sportive riders train hard right up to event day. They ride more in May than they did in February. They go in tired, they pace it on feel, and they bonk at 130km. Then they spend the next three months saying 'next year I'll train properly.'",
      "Sportive performance is one of the most coachable problems in cycling because it's so well-defined. We know your event date, your distance, your climbing, your goal time. Periodise the build, sharpen for race week, fuel the day properly — and the difference between this year's experience and last year's isn't subtle.",
      "Most sportive disappointment isn't a fitness problem. It's a planning problem.",
    ],
    whatChanges: [
      "12-20 week periodised build to your specific event date",
      "Climbing-specific blocks matched to your event's profile",
      "Race-pace simulation rides built into the back half of the plan",
      "Tapered race week — not the panic-ride week most riders do",
      "Race-day pacing strategy with specific power and HR caps for each section",
      "Fuelling plan tested in training, not improvised on the day",
    ],
    pillars: [
      {
        number: "01",
        title: "Periodised Build",
        description:
          "Base, build, peak, taper. The plan is reverse-engineered from your event date so each block delivers what the next one needs. No accidental peaking three weeks too early.",
      },
      {
        number: "02",
        title: "Course-Specific Work",
        description:
          "Wicklow 200's sustained climbs are different from Marmotte's altitude or Fred Whitton's brutal walls. Your plan replicates the demands of your specific event in your training rides.",
      },
      {
        number: "03",
        title: "Pacing Strategy",
        description:
          "We build specific power caps, HR ceilings, and segment-by-segment pacing for your event. Most sportive riders blow up because they ride the first 50km too hard. Your plan trains the discipline to hold back.",
      },
      {
        number: "04",
        title: "Fuelling The Distance",
        description:
          "60-90g of carbs per hour is the difference between finishing strong and crawling home. We test your fuelling in long training rides until it's automatic — sportive day is not the time to discover your stomach can't handle gels.",
      },
      {
        number: "05",
        title: "Tapered Race Week",
        description:
          "Race week is shorter rides, openers two days out, and proper sleep. Most sportive riders ride too much in race week. Your plan respects what taper actually means.",
      },
    ],
    sampleWeekHours: "8-10 hrs/week",
    sampleWeekContext:
      "A peak-block week 6 weeks out from a major sportive (e.g., Wicklow 200 or Marmotte). Climbing-specific work, race-pace simulation, and fuelling practice all integrated.",
    sampleWeek: [
      { day: "Monday", session: "Rest or recovery walk", duration: "0-30 min" },
      { day: "Tuesday", session: "Climbing intervals — 5 x 6 min @ threshold on 4-7% gradient", duration: "75 min" },
      { day: "Wednesday", session: "Zone 2 endurance — disciplined HR cap", duration: "90 min" },
      { day: "Thursday", session: "Race-pace efforts — 3 x 20 min @ goal sportive pace", duration: "90 min" },
      { day: "Friday", session: "Easy spin", duration: "45 min" },
      { day: "Saturday", session: "Long sportive simulation — 4 hrs with course-profile climbs, full fuelling", duration: "4 hrs" },
      { day: "Sunday", session: "Recovery spin or short Zone 2", duration: "60-90 min" },
    ],
    mistakes: [
      {
        title: "Training hardest in the week before the event",
        description:
          "Sportive riders panic in race week and ride more than they did the month before. Your fitness was built weeks ago — race week is for sharpening and resting, not for adding any new work. Trust the build.",
      },
      {
        title: "Going out too hard in the first 50km",
        description:
          "The single biggest sportive mistake. Adrenaline + fresh legs + a fast group = 30 watts above your sustainable pace, and a guaranteed bonk later. Hold a specific power cap for the first hour. The wheels you let go will come back.",
      },
      {
        title: "Improvising fuelling on the day",
        description:
          "If you've never eaten 80g of carbs an hour for 6 hours in training, race day is not the time to find out your gut can't handle it. Practice the exact fuelling plan in your long rides. Carry what you've tested.",
      },
      {
        title: "Skipping climbing-specific training",
        description:
          "If your event has 3,000m of climbing and your training has 600m a week of climbing, the engine you're building doesn't match the engine you'll need. Climb-specific intervals — sustained efforts on 4-8% gradients — have to be in the plan.",
      },
      {
        title: "No taper",
        description:
          "Race week should look like 50% of your normal volume, with one short opener two days out. Most sportive riders ride 80% — and then wonder why their legs feel heavy on the day. Taper is not optional.",
      },
    ],
    caseStudy: {
      name: "Damien Maloney",
      context: "Average sportive rider who had plateaued. Wanted to actually perform at his target events instead of just finishing them.",
      result: "FTP 205w → 295w (+90w). Built the engine, learned the pacing, executed the fuelling. Sportive performance changed from 'survive the day' to 'ride it the way I wanted to ride it'.",
      quote:
        "I was an average sportive rider who had plateaued. Roadman custom built a plan to achieve my goals. I've gotten much more out of Roadman than I ever imagined. The coaches are very generous with their time and knowledge.",
    },
    faqs: [
      {
        question: "How far out from my sportive should I start coaching?",
        answer:
          "12-20 weeks out is ideal. That gives one full base block, one build, one peak, and a proper taper. We can absolutely start later — even 6-8 weeks out — but the longer the runway, the more we can shape. If your event is more than a year out, we start with general fitness and periodise into the specific build later.",
      },
      {
        question: "Do you coach for specific sportives like Wicklow 200, Marmotte, or Fred Whitton?",
        answer:
          "Yes. We coach riders for these and most other major sportives — Etape du Tour, Ride London, Ring of Beara, Sean Kelly Tour, Dragon Ride, the Maratona. Your plan is built around the specific course profile, distance, climbing, expected weather, and your goal time.",
      },
      {
        question: "What if I just want to finish, not race it?",
        answer:
          "Same coaching applies. The difference is in pacing strategy and goal time, not in the build. Even riders aiming purely to finish do the day far better with a periodised build, a proper taper, and a tested fuelling plan than they do off random training.",
      },
      {
        question: "Do I need a power meter for sportive coaching?",
        answer:
          "Strongly recommended for any event over 100km. Pacing a long sportive is fundamentally a wattage problem — the discipline of holding 75-80% of FTP for the first hour is what separates a strong finish from a bonk at 130km. Heart rate works as a backup but power is the primary signal.",
      },
      {
        question: "How is this different from a downloadable sportive plan?",
        answer:
          "Generic plans are written for a generic rider. Your plan is built around your current FTP, your weekly hours, your event's specific demands, and how you respond week by week. When you have a bad week, the plan adjusts. When a session lands well, the next week ramps. A static PDF can't do that.",
      },
    ],
    yesIfYou: [
      "Have a specific sportive 8-20 weeks away you want to perform at",
      "Have completed sportives before but want to ride them better",
      "Are training inconsistently and want a structured build",
      "Want a tested fuelling and pacing plan, not a 'wing it' approach",
      "Have a climbing-heavy event and your weekly riding is mostly flat",
      "Plan to do multiple sportives a year and want a season-long structure",
    ],
    notIfYou: [
      "Have never ridden over 60km and your event is 4 weeks away (start with general fitness first)",
      "Want a one-size-fits-all PDF plan",
      "Aren't willing to fuel properly in training and on the day",
    ],
    serviceType: "Cycling Coaching for Sportive Riders",
    breakerWord: "SPORTIVE",
    relatedResources: [
      {
        label: "Race Pace Predictor",
        href: "/tools/race-pace-predictor",
        description:
          "Estimate your sustainable power and finish time for a sportive based on FTP, weight, and course profile. Free tool, no sign-up.",
      },
      {
        label: "FTP Zones Calculator",
        href: "/tools/ftp-zones",
        description:
          "Calculate your training zones from your FTP — the foundation for the pacing caps you'll hold in the first hour of an event.",
      },
      {
        label: "Coaching Assessment",
        href: "/diagnostic",
        description:
          "Five-minute coaching diagnostic. Where the gains are, what to fix first, and whether structured coaching is the right next step.",
      },
      {
        label: "Sportive & Gran Fondo Training Guide",
        href: "/topics/cycling-training-plans",
        description:
          "Long-form training plans, periodisation, and pacing guides for sportive and gran fondo riders.",
      },
    ],
  },

  gravel: {
    slug: "gravel",
    seoTitle: "Online Cycling Coach for Gravel Racing | $195/mo",
    seoDescription:
      "Online cycling coach for gravel racing. Mixed-terrain endurance, fuelling for 4+ hour efforts, technical skills, and the polarised base that wins long-format gravel. Personalised TrainingPeaks plans.",
    h1: "Online Cycling Coach for Gravel Racing",
    heroEyebrow: "COACHING FOR GRAVEL RACING",
    heroAccent: "ENDURANCE THAT LASTS. SKILLS THAT HOLD UP.",
    directAnswer:
      "This is coaching for cyclists racing gravel — Unbound, Dirty Reiver, Migration, your local gravel league. Gravel racing isn't road racing on dirt. It's a different problem: longer events, lower average power, harder fuelling, more variable terrain, and the technical layer most road-only training never touches.",
    problem: [
      "Most gravel racers come from a road background and train like road racers. Long endurance rides, threshold intervals, sweet spot blocks — and then they show up to a 200-mile gravel event and discover the bottleneck is not their FTP. It's their nutrition, their pacing, their handling on rough surfaces, and their ability to keep eating at hour 7.",
      "Gravel performance is built on three things: a huge polarised aerobic base, the technical skill to hold speed on loose surfaces without burning matches, and a fuelling system that keeps you eating 80-100g of carbs an hour for 8+ hours. Most road-derived plans cover the first one. The other two are where most gravel racers actually leak time.",
      "We coach the whole problem.",
    ],
    whatChanges: [
      "Heavier polarised distribution — closer to 90/10 for ultra-distance gravel",
      "Long, structured endurance rides (5-8 hrs) periodised into the plan",
      "Technical skills as a coached pillar — handling, descending, group dynamics",
      "Fuelling at 80-100g carbs/hr practiced and tested before race day",
      "Equipment and tyre-pressure decisions integrated, not left to forum advice",
      "Race-day pacing built around average power, not threshold targets",
    ],
    pillars: [
      {
        number: "01",
        title: "Polarised Aerobic Base",
        description:
          "Gravel races are won by the rider who can hold a respectable power for 4-12 hours, not the one with the highest FTP. The base block is bigger, slower, and more disciplined than a road racer's.",
      },
      {
        number: "02",
        title: "Long Structured Endurance",
        description:
          "5-8 hour rides aren't just 'get out and ride'. They're periodised: HR caps, fuelling targets, terrain-matched routes. Each one is dress rehearsal for race day.",
      },
      {
        number: "03",
        title: "Technical Skill Work",
        description:
          "Loose-surface handling, line choice, group riding on gravel, descending fast on gravel without burning matches. The watts you save with skill outweigh most of the watts you can build through training.",
      },
      {
        number: "04",
        title: "Fuelling The Long Day",
        description:
          "80-100g of carbs an hour for 8+ hours is a trained skill. We test products, dial timing, and rehearse the full race-day fuelling plan in long training rides. No surprises on event day.",
      },
      {
        number: "05",
        title: "Race-Pace Discipline",
        description:
          "Average power, not threshold pace, is the gravel race target. We build the pacing strategy from your event's profile, your weight, and your goal time — and the discipline to hold it when the early group flies away.",
      },
    ],
    sampleWeekHours: "10-14 hrs/week",
    sampleWeekContext:
      "A peak block week for a gravel racer 8 weeks out from a major event (e.g., Unbound or Dirty Reiver). Heavy polarised distribution, long endurance, technical work, and fuelling rehearsal.",
    sampleWeek: [
      { day: "Monday", session: "Rest or 30 min easy spin", duration: "0-30 min" },
      { day: "Tuesday", session: "Sweet spot — 4 x 12 min @ 88-93% FTP, mixed terrain", duration: "90 min" },
      { day: "Wednesday", session: "Zone 2 endurance — strict HR cap, gravel route", duration: "2 hrs" },
      { day: "Thursday", session: "Skills + Zone 2 — descending, loose-surface lines, 60g/hr fuelling practice", duration: "2 hrs" },
      { day: "Friday", session: "Easy spin or rest", duration: "0-45 min" },
      { day: "Saturday", session: "Long gravel ride — 5-6 hrs, 80g/hr fuelling, race-pace efforts in back third", duration: "5-6 hrs" },
      { day: "Sunday", session: "Recovery spin or 90 min easy gravel", duration: "60-90 min" },
    ],
    mistakes: [
      {
        title: "Training like a road racer",
        description:
          "Threshold blocks and 90-min sweet spot sessions don't prepare you for 8 hours on gravel. The aerobic base for ultra-distance gravel has to be bigger and more polarised than the road equivalent. More volume, slower volume, longer rides.",
      },
      {
        title: "Under-fuelling in training",
        description:
          "If you only practise fuelling on race day, your gut can't handle 80-100g an hour and you'll bonk. Gut training is a real adaptation — practice eating during long rides for weeks before the event. The stomach has to learn just like the legs do.",
      },
      {
        title: "Treating skills as 'something I'll just figure out'",
        description:
          "On gravel, technical skill saves more watts than any training block. Riders who handle loose corners, washboard, and gravel descents efficiently arrive at hour 6 fresh. Riders who white-knuckle every descent are cooked. Skill is a coachable pillar.",
      },
      {
        title: "Going out at threshold pace",
        description:
          "Gravel races aren't won at threshold. They're won at a sustainable percentage of FTP held for 5-12 hours. Most blow-ups come from sitting on someone's wheel at 90% FTP for the first hour — pace it from your own number, not theirs.",
      },
      {
        title: "Ignoring tyre pressure and equipment choices",
        description:
          "On gravel, tyre pressure is worth more than 10 watts of fitness. Equipment choices — tyre size, sealant, gearing, hydration setup — meaningfully affect performance. We coach these decisions; we don't leave them to forum threads.",
      },
    ],
    caseStudy: {
      name: "Aaron Kearney",
      context: "Road racer transitioning to ultra-endurance gravel. Needed a complete rebuild of the engine for the new format.",
      result: "Successfully made the changeover from road racing to ultra-endurance gravel events. Periodised build, structured endurance, fuelling rebuilt for the long format.",
      quote:
        "The expertise and personalised plan allowed me to utilise my past racing experience and gave me the adaptations needed for the changeover to ultra. If you're looking to unlock new potential, I couldn't recommend Anthony enough.",
    },
    faqs: [
      {
        question: "How is gravel coaching different from road cycling coaching?",
        answer:
          "The fundamentals are the same — polarised distribution, recovery as a session, structured intensity. But gravel coaching tilts heavier on long endurance, fuelling practice, and technical skill. Sweet spot blocks shrink. Long rides get longer. Race-pace targets shift from threshold to sustainable percentage of FTP. The plan reflects the format.",
      },
      {
        question: "Do you coach for Unbound, Dirty Reiver, and other big gravel events?",
        answer:
          "Yes. We coach riders for Unbound (200 mile), Dirty Reiver, Migration Gravel Race, Trans-Atlanta, Grinduro, and most major UK and European gravel events. Your plan is built around the specific event's distance, profile, surface mix, and expected conditions.",
      },
      {
        question: "What if I'm new to gravel but already strong on road?",
        answer:
          "Most of our gravel members come from road. The transition is mostly about extending the engine and adding the technical and fuelling pieces. Existing road fitness is a huge advantage — we periodise the gravel-specific work on top of that base rather than starting from scratch.",
      },
      {
        question: "Do I need a power meter for gravel?",
        answer:
          "Recommended. Pacing a 6-12 hour gravel race is fundamentally a wattage problem — average power held for hours is the metric. Heart rate alone gets confused on rough surfaces (handling effort spikes HR independent of effort), so power data is the cleaner signal. A gravel-compatible power meter is a strong investment.",
      },
      {
        question: "How do you handle the technical skill side without in-person coaching?",
        answer:
          "Skill drills are written into the plan with specific focus points for each session. Members upload short clips of riding for feedback when needed. The community Q&A handles equipment and skill questions in detail. For most riders the bottleneck isn't unknown technique — it's not practising the technique often enough. The plan structures that.",
      },
    ],
    yesIfYou: [
      "Race or plan to race gravel — local league, ultra-distance, or anywhere in between",
      "Are coming from road and want a structured transition to gravel",
      "Have a specific gravel event 8-20 weeks away",
      "Want fuelling, pacing, and technical work coached as part of the plan",
      "Have plateaued on road methodology applied to gravel events",
      "Are willing to do 5-8 hour long rides as part of the build",
    ],
    notIfYou: [
      "Are new to cycling generally (start with our beginners coaching)",
      "Don't have access to gravel routes or terrain to train on",
      "Want a generic plan with no event-specific periodisation",
    ],
    serviceType: "Cycling Coaching for Gravel Racers",
    breakerWord: "GRAVEL",
    relatedResources: [
      {
        label: "Tyre Pressure Calculator",
        href: "/tools/tyre-pressure",
        description:
          "Pressure recommendations for tyre, rider weight, and surface. Worth more than 10 watts of fitness on rough gravel.",
      },
      {
        label: "Race Pace Predictor",
        href: "/tools/race-pace-predictor",
        description:
          "Estimate average power and finish time for long gravel races. Pacing the first hour is the single biggest gravel-day variable.",
      },
      {
        label: "Coaching Assessment",
        href: "/diagnostic",
        description:
          "Five-minute coaching diagnostic. Where the gains are, what to fix first, and whether structured coaching is the right next step.",
      },
      {
        label: "Gravel Training Topic Hub",
        href: "/topics/cycling-training-plans",
        description:
          "Periodisation, long-ride structure, and fuelling guides for ultra-distance gravel events.",
      },
    ],
  },

  "over-50": {
    slug: "over-50",
    seoTitle: "Cycling Coaching for Over-50 Cyclists | Power & Longevity",
    seoDescription:
      "Cycling coaching for cyclists over 50. Deeper recovery, strength emphasis, joint health, and the long-term programming that keeps you fast for decades. Personalised plans, $195/month.",
    h1: "Cycling Coaching for Over-50 Cyclists",
    heroEyebrow: "COACHING FOR CYCLISTS OVER 50",
    heroAccent: "STILL GETTING FASTER. STILL NOT DONE YET.",
    directAnswer:
      "This is coaching for cyclists over 50 who want to keep building — not just maintain — and want a plan that respects what 50+ recovery actually looks like. The watts are still there. The protocol changes. Heavier strength work, deeper recovery windows, more disciplined intensity, and joint-aware programming all become non-negotiable.",
    problem: [
      "After 50, the same training that worked at 40 starts costing more than it gives. Recovery takes longer. Niggles become injuries faster. Type-2 muscle fibres atrophy without intervention. And bone density quietly slides if there's no resistance work.",
      "But — and this is the part most internet advice ignores — over-50 cyclists who train well still gain power. Brian, one of our coached members, hit 4 w/kg at 52 while training fewer hours than ever. Kevin, age 67, set new power numbers after four decades on the bike. The ceiling is rarely physiology. It's almost always methodology.",
      "What changes after 50 isn't the goal. It's the architecture.",
    ],
    whatChanges: [
      "More true Zone 2 — closer to 85-90% of weekly volume",
      "VO2max sessions less frequent but executed at full quality",
      "Heavy strength training (proper lifting, not bodyweight) twice a week minimum",
      "Recovery treated as a structural pillar — sleep, HRV, rest days enforced",
      "Joint health: cadence, position, and running protocols built in for longevity",
      "Bone density and strength prioritised — the work matters past the bike too",
    ],
    pillars: [
      {
        number: "01",
        title: "Polarised With Discipline",
        description:
          "After 50 the cost of grey-zone riding compounds. The plan tilts harder polarised — more true Zone 2, fewer but sharper hard days. The discipline to ride easy is the difference between progress and breakdown.",
      },
      {
        number: "02",
        title: "Heavy Strength",
        description:
          "Squat, deadlift, hip thrust, press. Compound lifting at heavy loads (4 x 5 territory, not 12-15 reps with light dumbbells) twice a week. Type-2 fibre preservation, bone density, joint protection — all driven by this.",
      },
      {
        number: "03",
        title: "Recovery as a Pillar",
        description:
          "After 50, recovery isn't the gap between training — it IS the training. Sleep, HRV, deload weeks, mandatory rest days driven by data. We catch overcooking before it becomes injury or illness.",
      },
      {
        number: "04",
        title: "Joint-Aware Programming",
        description:
          "Cadence work to protect knees. Position checks. Mobility built in. We don't ignore the body parts that don't show up on a power file — joints, tendons, hips, lower back are coached too.",
      },
      {
        number: "05",
        title: "Long-Term Periodisation",
        description:
          "The annual plan is built for sustainable progress over years, not sharp peaks. Many of our over-50 members improve year-on-year for 5+ consecutive seasons because the architecture supports it.",
      },
    ],
    sampleWeekHours: "8-10 hrs/week",
    sampleWeekContext:
      "A typical week for a 55+ cyclist with full-time work, regular club rides, and a target event in 12 weeks. Built around polarised distribution, two strength sessions, and a hard-earned long ride.",
    sampleWeek: [
      { day: "Monday", session: "Full rest", duration: "0 min" },
      { day: "Tuesday", session: "VO2max — 5 x 4 min @ 110% FTP, 4 min easy (only if HRV is green)", duration: "75 min" },
      { day: "Wednesday", session: "Heavy strength — back squat, deadlift, RDL, 4 x 5", duration: "50 min" },
      { day: "Thursday", session: "Zone 2 endurance — strict HR cap, no Zone 3 drift", duration: "75 min" },
      { day: "Friday", session: "Rest or recovery walk", duration: "0-30 min" },
      { day: "Saturday", session: "Long Zone 2 club ride — disciplined HR, 80g/hr fuelling", duration: "3-4 hrs" },
      { day: "Sunday", session: "Sweet spot — 3 x 12 min @ 88-93% FTP + second strength session", duration: "90 min + 45 min" },
    ],
    mistakes: [
      {
        title: "Training like you're 35",
        description:
          "Three hard sessions a week, no real strength work, easy days that drift into Zone 3. It worked at 35. After 50 it produces injury, illness, and stagnant power. The protocol has to change with the body.",
      },
      {
        title: "Skipping or under-loading strength",
        description:
          "Bodyweight squats and pink dumbbells aren't strength training — they're warm-ups. After 50 you need heavy compound lifting at proper loads twice a week to preserve type-2 fibres and bone density. This is non-negotiable for long-term cycling performance and for staying out of the orthopaedic surgeon's office.",
      },
      {
        title: "Ignoring HRV and sleep data",
        description:
          "After 50 the line between productive training and overtraining is narrower. HRV trends, resting HR, and sleep quality are leading indicators. Ignoring them means you find out you're overcooked when you get sick — by which point you've lost 2-3 weeks of training.",
      },
      {
        title: "Crash dieting for race weight",
        description:
          "Aggressive caloric restriction after 50 wrecks recovery, kills power, and accelerates muscle loss. Body composition changes happen through fuelling training properly and adding strength — not through under-eating. Patience compounds; restriction doesn't.",
      },
      {
        title: "Quitting hard intervals to 'protect the body'",
        description:
          "The opposite of the previous mistake. Many over-50 cyclists overcorrect into pure endurance riding and lose all top-end power. VO2max work is critical for keeping the engine sharp at any age — the change is frequency and recovery, not removal.",
      },
    ],
    caseStudy: {
      name: "Kevin L",
      context: "Age 67. 40+ years on the bike. Felt like he'd plateaued long ago and accepted the gains were behind him.",
      result: "Set new power numbers after four decades on the bike. More powerful, more stable, recovering faster. The protocol change unlocked work he didn't know was still there.",
      quote:
        "I've been riding for over four decades and never realised how much I was leaving on the table. I'm more powerful, more stable, and recovering faster. I only wish I found this sooner.",
    },
    faqs: [
      {
        question: "Can I still gain FTP and power after 50?",
        answer:
          "Yes — this is one of the most consistent things we see. Brian (52) went from 230w to 265w. Kevin (67) set new power records after 40+ years on the bike. The trained masters cyclist holds and improves performance into the 60s and 70s when the methodology is right. The ceiling is almost always protocol, not physiology.",
      },
      {
        question: "How important is strength training after 50?",
        answer:
          "It moves from 'recommended' to 'non-negotiable'. After 50, untrained adults lose 1-2% of muscle mass per year. Heavy resistance training (proper compound lifts at challenging loads) is the only intervention that reliably preserves type-2 muscle fibres, bone density, and joint resilience. For cyclists, this directly translates to maintained power, fewer injuries, and a body that can handle training year after year.",
      },
      {
        question: "How do you handle joint issues common after 50?",
        answer:
          "We coach around them. Cadence work protects knees. Bike fit checks address hip, lower-back, and shoulder issues. Mobility is built into the plan, not optional. For specific medical issues we coordinate with your physio — the training plan adjusts around what your body can actually absorb, not what looks ideal on paper.",
      },
      {
        question: "How many hard sessions a week is right after 50?",
        answer:
          "For most over-50 cyclists, two genuinely hard sessions a week is the upper limit — and only when fully recovered for. The third hard session that worked at 35 is now the one that creates more cost than benefit. Quality over quantity, with real recovery between, is the framework. We use HRV trends to confirm whether each hard day actually lands.",
      },
      {
        question: "Will I lose fitness if I take more rest days?",
        answer:
          "Almost certainly the opposite. Adaptations happen during recovery, not during training. After 50, more rest days driven by HRV consistently produce better fitness outcomes than grinding through fatigue. Members who switch to this protocol almost always report higher sustainable training, fewer illness episodes, and steady power gains.",
      },
    ],
    yesIfYou: [
      "Are over 50 and want to keep building, not just maintain",
      "Have plateaued and suspect overtraining or under-recovery is part of it",
      "Want serious strength training as a coached pillar, not bolt-on advice",
      "Are willing to take rest days when HRV says so",
      "Have niggles or joint concerns that need accounting for in the plan",
      "Want a long-term programme — multiple seasons of progress, not a 12-week fix",
    ],
    notIfYou: [
      "Want to grind harder rather than train smarter",
      "Aren't willing to incorporate proper strength work",
      "Are dealing with serious medical issues that need clinical management before training (we'll work alongside your physio or doctor where appropriate)",
    ],
    serviceType: "Cycling Coaching for Over-50 Cyclists",
    breakerWord: "OVER 50",
  },

  "time-crunched": {
    slug: "time-crunched",
    seoTitle: "Online Cycling Coach for Time-Crunched Cyclists | $195/mo",
    seoDescription:
      "Online cycling coach for time-crunched cyclists with under 6 hours a week. Maximum return per hour, indoor-first programming, no junk miles, structured intensity. Personalised TrainingPeaks plans.",
    h1: "Online Cycling Coach for Time-Crunched Cyclists",
    heroEyebrow: "COACHING FOR TIME-CRUNCHED CYCLISTS",
    heroAccent: "UNDER 6 HOURS. MAXIMUM RETURN PER HOUR.",
    directAnswer:
      "This is coaching for cyclists with under 6 hours a week to train. The constraint sounds limiting but it's actually clarifying — every session has to do real work and the plan can't carry filler. Done right, time-crunched coaching produces serious gains. Done wrong, it produces a frustrated rider who burns out in three months.",
    problem: [
      "The cycling internet talks about 12-hour weeks like that's normal. For most working cyclists with families, 4-6 hours is the honest ceiling — and most of what's written for that population is just a watered-down version of the 12-hour plan.",
      "That's the wrong shape. A real time-crunched plan flips the intensity distribution: more sweet spot, more VO2max, less endurance volume. Indoor-first programming because every minute counts. Strength work that doubles as an injury insurance policy. And honest periodisation — hard blocks in calm weeks, maintenance blocks when work is brutal.",
      "Sub-6-hour cyclists can absolutely keep getting faster. The bottleneck isn't time. It's plan design.",
    ],
    whatChanges: [
      "Intensity distribution closer to 60/40 polarised — not the 80/20 from pro plans",
      "Most weekday sessions 45-60 min indoor",
      "VO2max and sweet spot prioritised — the highest-return-per-minute work",
      "Strength sessions 2-3 times a week, 25-30 minutes each, replacing easy spins",
      "No cancelled-session 'debt' — the plan reshuffles, doesn't accumulate",
      "Annual periodisation that respects work cycles — hard blocks land in calmer months",
    ],
    pillars: [
      {
        number: "01",
        title: "Intensity-First Design",
        description:
          "Time-crunched plans tilt toward sweet spot and VO2max because those sessions deliver the most adaptation per minute. The 80/20 polarised distribution gets re-shaped — closer to 60/40 — to fit the available hours.",
      },
      {
        number: "02",
        title: "Indoor As The Default",
        description:
          "The 60-min indoor session is the time-crunched cyclist's most valuable tool. No daylight, weather, or kit-faff overhead. Get on, do the work, get off. Saturday outdoors is the reward, not the only training opportunity.",
      },
      {
        number: "03",
        title: "Quality Over Quantity",
        description:
          "Every session has a clear purpose and a measurable target. No filler rides. No 'just spin and see how I feel'. When you have 5 hours a week, every hour is structured and every interval matters.",
      },
      {
        number: "04",
        title: "Strength as an Insurance Policy",
        description:
          "Two short, heavy strength sessions a week protect power, build force, and stop injuries before they start. For time-crunched cyclists this is one of the highest-leverage uses of 30 minutes available.",
      },
      {
        number: "05",
        title: "Real-Life Periodisation",
        description:
          "Hard training blocks land in calmer work months. Maintenance blocks land in brutal ones. Tapers around races, deloads after big stress periods. Your training year is structured around your real life, not on top of it.",
      },
    ],
    sampleWeekHours: "5-6 hrs/week",
    sampleWeekContext:
      "A typical week for a cyclist with full-time work, family, and 5-6 trainable hours. Indoor-led structure with the long ride at the weekend. Every session has a purpose.",
    sampleWeek: [
      { day: "Monday", session: "Rest", duration: "0 min" },
      { day: "Tuesday", session: "VO2max — 6 x 3 min @ 115% FTP, 3 min easy (indoor)", duration: "60 min" },
      { day: "Wednesday", session: "Strength — heavy compound lifts, 4 x 5", duration: "30 min" },
      { day: "Thursday", session: "Sweet spot — 3 x 15 min @ 88-93% FTP (indoor)", duration: "75 min" },
      { day: "Friday", session: "Strength — second session, focus on posterior chain", duration: "30 min" },
      { day: "Saturday", session: "Long ride — 2-2.5 hrs Zone 2 + 2 x 12 min sweet spot embedded", duration: "2.5 hrs" },
      { day: "Sunday", session: "Rest or 45 min easy spin", duration: "0-45 min" },
    ],
    mistakes: [
      {
        title: "Following an 80/20 polarised plan when you ride 5 hours",
        description:
          "80/20 polarised was designed for pros riding 25+ hours a week. At 5 hours, four hours of Zone 2 leaves you barely any intensity, and your top-end vanishes. Time-crunched plans tilt 60/40 or even 50/50. Match the distribution to the hours, not the textbook.",
      },
      {
        title: "Doing endurance miles outdoors instead of intensity indoors",
        description:
          "When you have 5 hours a week, three of them spent on slow Zone 2 outdoor rides won't move the needle as much as two structured indoor sessions plus one weekend long ride. The opportunity cost of slow miles is enormous when time is the constraint.",
      },
      {
        title: "Cancelling sessions then trying to make them up",
        description:
          "Tuesday gets blown up by work. The instinct is to do Tuesday's session on Wednesday and Wednesday's session on Thursday. Wrong move — you stack fatigue and end up overcooked. The correct move is usually to skip and let the plan reshuffle. The body adapts to consistency over weeks, not to perfect adherence in one.",
      },
      {
        title: "No strength work because 'no time'",
        description:
          "Two 30-min strength sessions a week sit in the same time slot as two easy 30-min spins. Replace one with the other and you get more adaptation. For time-crunched riders, strength is one of the highest-return uses of 30 minutes — do not skip it because the marketing says 'just ride'.",
      },
      {
        title: "Same plan year-round",
        description:
          "Your work intensity changes through the year. Your training shouldn't be flat. Hard blocks in your quieter work months, maintenance in the brutal ones, and a real taper before any target event. The annual plan respects your real-life cycle, not just the cycling season.",
      },
    ],
    caseStudy: {
      name: "Brian Morrissey",
      context: "Age 52. Shift worker. Limited hours. Tried training harder for years and kept getting sick after big training weeks.",
      result: "FTP up 15% (230w → 265w), hit 4 w/kg at 52, training fewer hours than ever. Lower average intensity, more recovery, higher peaks when they mattered.",
      quote:
        "This really works. I'm training so much less than last year, at lower intensities and not getting sick. FTHR up from 175 to 180, peak HR up to 193. FTP up 15%, hit 4 w/kg at age 52.",
    },
    faqs: [
      {
        question: "Can I really make progress on under 6 hours a week?",
        answer:
          "Yes. Several of our strongest results are from members training under 8 hours, and meaningful FTP gains are absolutely achievable on 4-6. The trade-off is that intensity has to do more of the work — sweet spot, VO2max, and well-structured weekend rides become the engine. The plan looks different from a 12-hour plan, but it works.",
      },
      {
        question: "What's the difference between 'time-crunched' and 'busy professional' coaching?",
        answer:
          "Mostly volume. Busy professional coaching usually targets 6-9 hours a week with a moving calendar. Time-crunched coaching targets 4-6 hours where time is the absolute constraint. Both lean on intensity-first programming and indoor sessions, but the intensity tilt is sharper at the lower volume.",
      },
      {
        question: "Will I have to give up outdoor riding?",
        answer:
          "No. The weekend long ride stays outdoors and is often the most enjoyable session of the week. The shift is on weekdays — instead of a 90-min Zone 2 outdoor ride that costs you 2.5 hours door-to-door, a 60-min structured indoor session does more work in less elapsed time. Most members find this trade liberating, not limiting.",
      },
      {
        question: "Do I need a smart trainer or just a basic turbo?",
        answer:
          "A smart trainer (or a power meter on a basic turbo) is strongly recommended for the indoor sessions to deliver structured wattage targets. If you only have a basic turbo without power, we can structure sessions on RPE and cadence — it's not as precise but it's workable. The power data is what makes time-crunched training really hit.",
      },
      {
        question: "How is this different from TrainerRoad's Low Volume plans?",
        answer:
          "TrainerRoad's low volume plans are well-designed but generic — they don't know about your week, your stress, your goal event, or how you responded to last week's training. A coach reads the whole picture and adjusts the plan weekly. For time-crunched cyclists, that adaptive layer is often the difference between sustained progress and burnout at month three.",
      },
    ],
    yesIfYou: [
      "Train 4-6 hours a week and want every hour earning its keep",
      "Have plateaued on TrainerRoad, Zwift, or self-coaching low-volume plans",
      "Have a moving work and family calendar",
      "Are willing to do most weekday training indoors",
      "Want a target event (sportive, race) and need a structured build",
      "Are willing to swap one easy session for a strength session",
    ],
    notIfYou: [
      "Have 8+ hours a week available (look at our busy professionals or main coaching page)",
      "Aren't willing to do indoor structured sessions",
      "Want a generic plan that ignores your real schedule",
    ],
    serviceType: "Cycling Coaching for Time-Crunched Cyclists",
    breakerWord: "TIME-CRUNCHED",
    relatedResources: [
      {
        label: "Plateau Diagnostic",
        href: "/plateau",
        description:
          "Three-minute diagnostic that pins down exactly why your power has flatlined — and what the next 12 weeks should focus on.",
      },
      {
        label: "FTP Zones Calculator",
        href: "/tools/ftp-zones",
        description:
          "Generate the training zones every time-crunched session is paced from. Indoor sweet spot and VO2max work needs the numbers right.",
      },
      {
        label: "Coaching Assessment",
        href: "/diagnostic",
        description:
          "Five-minute coaching diagnostic. Where the gains are, what to fix first, and whether structured coaching is the right next step.",
      },
      {
        label: "Time-Crunched Cyclist Guide",
        href: "/blog/time-crunched-cyclist-8-hours-week",
        description:
          "The long-form companion guide — getting faster on 5-8 hours a week without burning out or under-training.",
      },
    ],
  },

  "post-injury": {
    slug: "post-injury",
    seoTitle: "Cycling Coaching for Post-Injury Return | Progressive Loading",
    seoDescription:
      "Cycling coaching for cyclists returning from injury. Progressive loading, physio-coordinated programming, careful HRV-driven intensity, and the structured rebuild that gets you back stronger. $195/month.",
    h1: "Cycling Coaching for Post-Injury Return",
    heroEyebrow: "COACHING FOR POST-INJURY RETURN",
    heroAccent: "REBUILD CAREFULLY. COME BACK STRONGER.",
    directAnswer:
      "This is coaching for cyclists returning to the bike after injury, surgery, or a crash — and who want a structured, progressive rebuild rather than the ad-hoc 'try and see' approach that re-injures most riders. We coordinate with your physio, respect medical clearance, and load progressively from the start so your comeback compounds.",
    problem: [
      "After injury, most cyclists fall into one of two traps. The first is doing too much, too soon — the body wants to ride, the head wants the old fitness back, and three weeks in there's a flare-up that wipes out the next month. The second is doing too little for too long, becoming so cautious that the de-conditioning cycle just continues.",
      "The right path is structured progressive loading. Start lower than you think you should. Build slower than feels satisfying. Listen to the data — HRV, RPE, pain markers — far more than feelings. Keep your physio in the loop. And periodise the comeback over months, not weeks.",
      "Done well, riders come back from significant injuries stronger than before. Done badly, the same injury comes back six months later — and again, and again.",
    ],
    whatChanges: [
      "Starting volume and intensity set well below pre-injury — the rebuild needs runway",
      "Progressive loading driven by data: HRV, pain markers, sleep, perceived effort",
      "Physio coordination — we work alongside your medical team, not instead of",
      "Strength work integrated early to address muscle imbalances and protect the injury site",
      "No race-pace efforts until you have unbroken consistency for 4-6 weeks",
      "Honest expectation setting — comeback is measured in months, not weeks",
    ],
    pillars: [
      {
        number: "01",
        title: "Conservative Start",
        description:
          "We start lower than you think we should. Initial sessions are short Zone 2 with strict HR caps. The goal is unbroken consistency before any intensity returns. Building under-loaded is far cheaper than rebuilding from re-injury.",
      },
      {
        number: "02",
        title: "Progressive Loading",
        description:
          "Volume increases by no more than 10% week-on-week. Intensity is added in sequence: sweet spot before threshold, threshold before VO2max, VO2max before race-pace. Each step is earned by 2-3 weeks of consistency at the previous level.",
      },
      {
        number: "03",
        title: "Physio-Coordinated",
        description:
          "Your physiotherapist owns the rehabilitation. We own the training. The two have to align. We adjust load when your physio flags, and provide them with weekly training data so they see the full picture. This is non-negotiable for any serious return.",
      },
      {
        number: "04",
        title: "Strength to Protect",
        description:
          "Targeted strength work addresses the imbalances injury creates — typically a weak side, lost glute activation, or compromised core stability. The sessions are short (20-30 min), specific, and progressive. They are part of the comeback, not bolted on later.",
      },
      {
        number: "05",
        title: "Long-Term Mindset",
        description:
          "The comeback is measured in months. The first 4 weeks are foundation. Weeks 4-12 are progressive load. Months 3-6 are when fitness genuinely returns. Riders who try to compress this window typically reset themselves to month one. Patience is the most powerful protocol.",
      },
    ],
    sampleWeekHours: "5-7 hrs/week (varies by stage)",
    sampleWeekContext:
      "A representative week 8-10 weeks into a structured comeback from a non-spinal injury (e.g., collarbone fracture or knee surgery), with full physio clearance for cycling. Earlier weeks would have less volume and no intensity.",
    sampleWeek: [
      { day: "Monday", session: "Rest or physio-prescribed mobility", duration: "0-30 min" },
      { day: "Tuesday", session: "Easy Zone 2 — strict HR cap, no efforts", duration: "60 min" },
      { day: "Wednesday", session: "Strength — physio-aligned, focus on injury site stability", duration: "30 min" },
      { day: "Thursday", session: "Zone 2 with light cadence work — 3 x 5 min high cadence intervals", duration: "75 min" },
      { day: "Friday", session: "Rest", duration: "0 min" },
      { day: "Saturday", session: "Long Zone 2 — disciplined, no efforts, fuelled, build duration progressively", duration: "2-2.5 hrs" },
      { day: "Sunday", session: "Recovery spin or short walk", duration: "30-45 min" },
    ],
    mistakes: [
      {
        title: "Coming back at the volume and intensity you left",
        description:
          "The body that's coming back is not the body that left. Three months off means weeks — not days — of careful Zone 2 before any structured intensity. Riders who jump back to their old training plan re-injure within 6 weeks almost without fail.",
      },
      {
        title: "Ignoring the physio because you 'feel fine on the bike'",
        description:
          "Cycling is a low-impact, supported movement that masks problems. Issues that don't show on the bike show on a return to running, in lifting, or in daily life. Stay in your physio's lane until they discharge you. The training plan adjusts around their input.",
      },
      {
        title: "Skipping strength because you want to ride",
        description:
          "Injuries create imbalances. Cycling reinforces those imbalances if you don't address them with targeted strength work. Most re-injuries are not the same problem returning — they are a new problem caused by compensating around the original one.",
      },
      {
        title: "Adding race-pace efforts before consistency is built",
        description:
          "Hard intervals before you have 4-6 weeks of unbroken Zone 2 consistency are gambling with the comeback. The body is still healing in ways you can't feel. Earn the right to go hard with weeks of clean, progressive loading first.",
      },
      {
        title: "Comparing today's wattage to pre-injury wattage",
        description:
          "It's the fastest way to make a careful comeback feel like a failure. Power numbers will return — but not in week 4 and not in week 8. Track today's data against last week, not against your pre-injury PB. The trajectory is the metric.",
      },
    ],
    caseStudy: {
      name: "David Lundy",
      context: "Suffered a bad accident in March 2025. Was struggling to get back to his previous level and starting to lose enthusiasm for riding entirely.",
      result: "Four months of structured comeback later, signed up for his first race post-accident. Mojo back, enjoying riding again, on the start line.",
      quote:
        "I signed up for Not Done Yet after a bad accident in March 2025 and was struggling to get back to the same level. I was starting to lose my enthusiasm for riding. Four months later, I've got my mojo back and I'm really enjoying riding again. Just signed up for my first race this coming Tuesday.",
    },
    faqs: [
      {
        question: "Can you coach me before I'm fully cleared by my physio?",
        answer:
          "Only with their explicit clearance for cycling. Coaching is not a substitute for medical or physiotherapy care — we work alongside your medical team, not instead of them. Once you have written or verbal clearance to ride, we can start structuring the comeback in coordination with their guidance on load and progression.",
      },
      {
        question: "How long until I'm back to my pre-injury fitness?",
        answer:
          "It depends on the injury, the time off, and how disciplined the rebuild is. As a rough guide: 6-8 weeks for fitness baseline, 3-6 months for pre-injury performance, 6-12 months to exceed it. Riders who try to compress this timeline almost always end up extending it by re-injuring. The patient comeback is the fast comeback.",
      },
      {
        question: "Will you coordinate with my physio?",
        answer:
          "Yes. We want a clear conversation with your physio at the start so we understand the injury, the rehab plan, and the loading restrictions. As you progress we share weekly training data with them where helpful. Coordinated coaching produces dramatically better outcomes than parallel coaching where neither party sees the full picture.",
      },
      {
        question: "What kind of injuries do you coach comebacks from?",
        answer:
          "We've coached returns from collarbone fractures, knee surgeries, hip replacements, cycling-related overuse injuries, post-concussion returns, and more. We don't coach acute medical management — that's your physio and consultant's job. We coach the structured cycling rebuild once you're medically cleared to ride.",
      },
      {
        question: "I'm scared of riding outside again after my crash. Does that matter?",
        answer:
          "Yes — and we coach the mental side as part of the comeback. Returning to outdoor riding after a serious crash often takes longer than the physical recovery. We programme indoor work for as long as you need, structure outdoor returns gradually (quiet roads, daylight, alone before in groups), and treat the confidence rebuild as part of the plan, not separate from it.",
      },
    ],
    yesIfYou: [
      "Are returning to cycling after injury, surgery, or a crash",
      "Have medical clearance to ride and want a structured rebuild",
      "Are willing to start lower than your ego wants",
      "Have a physio you'll coordinate with through the comeback",
      "Want strength and stability work integrated, not bolted on later",
      "Understand the rebuild is months, not weeks",
    ],
    notIfYou: [
      "Have not been cleared by a medical professional to cycle",
      "Want to skip the rehab side and just train hard",
      "Need acute medical or physiotherapy care (we are coaches, not clinicians)",
    ],
    serviceType: "Cycling Coaching for Post-Injury Return",
    breakerWord: "COMEBACK",
  },

  "weight-loss": {
    slug: "weight-loss",
    seoTitle: "Cycling Coaching for Weight Loss | Body Comp, Not Restriction",
    seoDescription:
      "Cycling coaching for body composition. Fuelling for performance, not restriction. The protocol that drops body fat, holds power, and ends the diet cycle. $195/month, personalised plan.",
    h1: "Cycling Coaching for Weight Loss",
    heroEyebrow: "COACHING FOR BODY COMPOSITION",
    heroAccent: "FUEL THE PERFORMANCE. THE BODY COMPOSITION FOLLOWS.",
    directAnswer:
      "This is coaching for cyclists who want to change body composition through training and nutrition done properly — not through under-fuelling, fasted rides, or chronic restriction. The cycling internet keeps telling you that weight loss is calories in versus calories out. That advice is so outdated, and it's probably part of why you're still stuck.",
    problem: [
      "Most cyclists trying to lose weight do the same thing: ride more, eat less, do fasted rides, track every calorie, see results for a few weeks, then stall and rebound. Power drops. Mood drops. The numbers go back up.",
      "The internet's calories-in-versus-calories-out advice is incomplete at best. Anthony lost 7kg in 12 weeks while eating MORE food than he had in years. Power didn't drop. Energy went up. The 9pm junk-food cravings stopped on their own. He didn't track a calorie. He didn't skip a meal. He didn't do a single fasted ride.",
      "The reason most cyclists fail at weight loss is that they're fighting their physiology. Fuel performance properly, train consistently, sleep well — body composition follows. The protocol works because it stops fighting the body.",
    ],
    whatChanges: [
      "Eating to fuel training, not restricting to lose weight",
      "Protein adequacy targeted at 1.6-2.0g/kg — most cyclists are well under",
      "Carbs around training to support intensity and recovery",
      "Body composition tracked by DEXA, calipers, or photos — not scale weight alone",
      "No fasted rides — they bonk you, kill power, and don't accelerate fat loss",
      "Sleep and stress treated as core nutrition variables, not extras",
    ],
    pillars: [
      {
        number: "01",
        title: "Fuel Performance",
        description:
          "Every training session is properly fuelled. In-ride carbs at 60-90g/hr on rides over 90 minutes. Real meals around training. The energy availability that supports adaptation also unlocks body composition change — under-fuelling shuts both down.",
      },
      {
        number: "02",
        title: "Protein Adequacy",
        description:
          "Most cyclists eat far too little protein. We target 1.6-2.0g per kg of body weight, distributed across the day. Protein protects muscle during fat loss, accelerates recovery, and is the most satiating macro you'll consume.",
      },
      {
        number: "03",
        title: "Train Consistently",
        description:
          "Body composition follows training consistency, not training intensity. The cyclist who rides 5 properly-fuelled hours a week for 12 months loses far more body fat than the cyclist who hammers for 10 hours, gets sick, takes 2 weeks off, comes back, repeats.",
      },
      {
        number: "04",
        title: "Track Composition, Not Scale",
        description:
          "Scale weight conflates muscle, fat, water, and glycogen. Track body composition through DEXA, calipers, or progress photos every 6-8 weeks. Most cyclists doing this work see strength go up and clothes get looser even when scale weight is flat.",
      },
      {
        number: "05",
        title: "Sleep, Stress, Hormones",
        description:
          "Sleep deprivation tanks insulin sensitivity and increases cravings. Chronic stress elevates cortisol and stalls fat loss. These aren't optional add-ons — they're core nutrition variables. We coach them because ignoring them is why most diets fail.",
      },
    ],
    sampleWeekHours: "8-10 hrs/week",
    sampleWeekContext:
      "A typical mid-block week for a cyclist working on body composition. All sessions fully fuelled. No fasted rides. Real meals around training. The protocol that drops body fat without dropping power.",
    sampleWeek: [
      { day: "Monday", session: "Rest day — protein priority, no caloric restriction", duration: "0 min" },
      { day: "Tuesday", session: "VO2max — 5 x 4 min @ 110% FTP, fuelled with carbs pre and during", duration: "75 min" },
      { day: "Wednesday", session: "Zone 2 endurance — fuelled, NOT fasted, 60g/hr carbs", duration: "75 min" },
      { day: "Thursday", session: "Heavy strength — back squat, deadlift, RDL, 4 x 5", duration: "50 min" },
      { day: "Friday", session: "Easy spin or rest — protein-led day", duration: "0-45 min" },
      { day: "Saturday", session: "Long Zone 2 ride — 80g/hr carbs from start, real meal after", duration: "3-4 hrs" },
      { day: "Sunday", session: "Sweet spot — 3 x 12 min @ 88-93% FTP, fuelled session", duration: "90 min" },
    ],
    mistakes: [
      {
        title: "Fasted rides",
        description:
          "Fasted rides bonk you 60km from home, kill the session's quality, and don't accelerate fat loss meaningfully. They also reinforce a restriction mindset that makes the whole thing harder. Fuel rides over 60 minutes. Your body doesn't burn more fat hungry — it just trains worse.",
      },
      {
        title: "Tracking calories on MyFitnessPal",
        description:
          "It works for a few weeks. It also turns food into a constant mental load, makes you suspicious of normal eating, and is almost always inaccurate by 15-25%. The cyclists who keep weight off long-term build food awareness, not spreadsheets.",
      },
      {
        title: "Skipping meals or doing intermittent fasting around training",
        description:
          "Skipping breakfast and then training, or training and then skipping dinner, almost always backfires. You bonk training, recover poorly, get hungry later, and overeat. Eat real meals around training. The body composition results come from the training and the protein adequacy, not from missing meals.",
      },
      {
        title: "Cutting carbs to lose weight",
        description:
          "Low-carb training is the fastest route to dropping power, killing recovery, and tanking motivation. Cyclists need carbs to fuel hard efforts and rebuild glycogen. Body composition change happens around well-fuelled training, not in spite of it.",
      },
      {
        title: "Weighing yourself daily and panicking",
        description:
          "Daily scale weight bounces 1-2kg from glycogen, hydration, and food in your gut. Daily weigh-ins create emotional spikes that lead to poor decisions. Weigh once a week if at all, track body composition every 6-8 weeks, and judge progress on monthly trend — not yesterday's number.",
      },
    ],
    caseStudy: {
      name: "Chris O'Connor",
      context: "Started at 84kg with 20% body fat. Average wattage was modest. Wanted real body composition change but had been burned by years of diet-and-rebound cycles.",
      result: "From 84kg to 68kg. Body fat 20% to 7%. Average wattage doubled. Weekly 100km+ rides became the norm. Done through fuelling, training, and a complete reframe of the food relationship — not through restriction.",
      quote:
        "Anthony is a visionary, an educator, a mentor, a coach. He set me on a dietary, mental and physical journey of true discovery. Average wattage doubled and now weekly 100km+ rides are the norm.",
    },
    faqs: [
      {
        question: "Can I lose weight through cycling without dieting?",
        answer:
          "Yes — and it's the protocol that actually works long-term. Anthony lost 7kg in 12 weeks while eating more food than he had in years. Chris went from 84kg to 68kg with body fat dropping from 20% to 7% — power doubled at the same time. The framework is fuel performance properly, train consistently, hit protein adequacy, and let body composition follow. No tracking, no restriction.",
      },
      {
        question: "How is this different from calorie tracking?",
        answer:
          "Calorie tracking treats food as math. The protocol we coach treats food as fuel and recovery. The shift sounds subtle but the difference is enormous: tracking creates an adversarial relationship with food that almost always rebounds; fuelling for performance teaches you what your body actually needs and changes the relationship permanently.",
      },
      {
        question: "Should I do fasted rides for fat loss?",
        answer:
          "No. Fasted rides bonk training quality, don't accelerate meaningful fat loss, and reinforce a restriction mindset that makes long-term progress harder. Fuel rides over 60 minutes properly. Body composition change comes from consistent, well-fuelled training and protein adequacy — not from training hungry.",
      },
      {
        question: "How fast will I lose weight?",
        answer:
          "Sustainably, 0.5-1% of body weight per week is a healthy target — and even that's faster than most cyclists need. The bigger question is whether the fat stays off, and whether power holds. Aggressive weight loss usually means lost muscle, lost power, and a rebound within 6 months. The slower, fuelled approach typically produces 6-12kg of fat loss over 6-12 months that stays off.",
      },
      {
        question: "Will I lose power if I lose weight?",
        answer:
          "Done badly, yes — restriction kills power. Done properly, the opposite. Chris doubled his wattage while losing 16kg. Brian gained 15% FTP while training less. The protocol that works for body composition is the same protocol that works for performance: fuel training, hit protein, train consistently, sleep well. They're not in conflict — they're the same equation.",
      },
    ],
    yesIfYou: [
      "Want sustainable body composition change through training and proper nutrition",
      "Have been stuck in diet-and-rebound cycles you want to end",
      "Are willing to fuel rides properly, including in-ride carbs",
      "Want strength training as part of the protocol, not a side note",
      "Understand body composition is measured in months, not weeks",
      "Want power and body composition to improve together, not in conflict",
    ],
    notIfYou: [
      "Want a crash diet or quick-fix protocol",
      "Aren't willing to fuel training properly",
      "Have an active eating disorder (please work with a clinical specialist first)",
    ],
    serviceType: "Cycling Coaching for Body Composition",
    breakerWord: "FUEL",
  },
};

export const SEGMENT_SLUGS = Object.keys(COACHING_SEGMENTS);

export function getSegment(slug: string): SegmentData | null {
  return COACHING_SEGMENTS[slug] ?? null;
}

/**
 * Display order for segment listings on the main /coaching page and in
 * cross-segment "explore other segments" blocks.
 */
export const SEGMENT_DISPLAY_ORDER: { slug: string; label: string; tagline: string }[] = [
  { slug: "masters", label: "Masters Riders", tagline: "40+ — preserve power, manage recovery" },
  { slug: "over-50", label: "Over 50", tagline: "Deeper recovery, heavy strength, joint-aware" },
  { slug: "beginners", label: "Beginners", tagline: "Build a real base. Skip the bad habits." },
  { slug: "women", label: "Women", tagline: "Female-specific physiology and benchmarks" },
  { slug: "busy-professionals", label: "Busy Professionals", tagline: "6-8 hrs/week — every hour earning its keep" },
  { slug: "time-crunched", label: "Time-Crunched", tagline: "Under 6 hrs/week — maximum return per hour" },
  { slug: "sportives", label: "Sportives & Gran Fondos", tagline: "Event-specific build, pacing, and fuelling" },
  { slug: "gravel", label: "Gravel Racing", tagline: "Mixed-terrain endurance and skills" },
  { slug: "triathletes", label: "Triathletes", tagline: "Bike-leg coaching that protects the run" },
  { slug: "post-injury", label: "Post-Injury Return", tagline: "Progressive loading, physio-coordinated" },
  { slug: "weight-loss", label: "Weight Loss", tagline: "Body composition through fuelling, not restriction" },
];
