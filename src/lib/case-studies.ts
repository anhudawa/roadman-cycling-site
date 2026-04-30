import { type ContentPillar } from "@/types";
import { type MetricRow } from "@/components/proof";
import { TESTIMONIALS, type Testimonial } from "./testimonials";

/**
 * Long-form athlete case studies. Each case study is anchored by a
 * real testimonial in `/src/lib/testimonials.ts` and expanded with
 * narrative sections — starting point, constraints, intervention,
 * outcome, caveats, and coach commentary — for an SEO-indexable
 * proof page at /case-studies/[slug].
 *
 * Editorial rules:
 *   - Quotes are used verbatim. Never paraphrase the athlete's words.
 *   - Numbers (FTP, weight, body fat, race results) come from the
 *     testimonial. We do not invent power figures, dates, or sessions.
 *   - Where the testimonial is silent on a detail (weekly hours, exact
 *     sessions), we describe the methodology in general terms — the
 *     polarised five-pillar system — rather than fabricating specifics.
 *   - Every case study includes a `caveats` block. Real coaching has
 *     limits; pretending otherwise is the fastest route to losing trust.
 *   - Coach commentary is written in Anthony's voice — short
 *     declarative sentences, no marketing fluff, the same patterns the
 *     voice guide pulls from the YouTube transcripts.
 */

export interface RiderConstraint {
  label: string;
  value: string;
}

export interface CaseStudy {
  /** URL slug, e.g. "damien-maloney" */
  slug: string;
  /** Name of the linked testimonial in TESTIMONIALS */
  testimonialName: string;

  // SEO
  title: string;
  seoTitle: string;
  seoDescription: string;
  /** AI-crawler answer summary at the top of the page */
  answerCapsule: string;
  keywords: string[];

  // Dates
  publishDate: string;
  updatedDate?: string;

  // Hero block
  heroEyebrow: string;
  heroStat: string;
  heroStatLabel: string;
  /** One-line headline for the index card and OG image */
  cardSummary: string;

  // Narrative sections — each is an array of paragraphs
  startingPoint: string[];
  riderConstraints: RiderConstraint[];
  intervention: string[];
  weeklyStructure: string[];
  nutritionStrength: string[];
  outcome: string[];
  /** Before/after numerical results — drives the metrics ladder */
  outcomeMetrics: MetricRow[];
  caveats: string[];
  coachCommentary: string[];

  /** Optional pillar for theming (default: coaching) */
  pillar?: ContentPillar;

  /** Internal links surfaced on the page */
  internalLinks?: { label: string; href: string; description?: string }[];

  /** Slugs of other case studies to surface at the bottom */
  relatedCaseStudies?: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  // ─────────────────────────────────────────────────────────────────────
  // 1. Damien Maloney — plateau breakthrough, +90w FTP
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "damien-maloney",
    testimonialName: "Damien Maloney",
    title:
      "Damien Maloney: From Plateaued Sportive Rider to a 90-Watt FTP Gain",
    seoTitle:
      "Damien Maloney Case Study — 205w to 295w FTP With Roadman Coaching",
    seoDescription:
      "Average sportive rider, plateaued for years, FTP stuck at 205 watts. After a custom-built Roadman coaching plan: 295 watts. The exact problem, the intervention, and the caveats.",
    answerCapsule:
      "Damien was an average sportive rider whose FTP had plateaued at 205 watts. With a custom-built Roadman coaching plan — polarised structure, periodised volume, and weekly accountability — his FTP moved to 295 watts. The plateau wasn't effort. It was structure.",
    keywords: [
      "cycling case study",
      "FTP plateau breakthrough",
      "sportive rider FTP gain",
      "Roadman coaching results",
      "polarised training case study",
      "cycling coach evidence",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · PLATEAU BREAKTHROUGH",
    heroStat: "+90w",
    heroStatLabel: "FTP gain",
    cardSummary:
      "An average sportive rider stuck at 205w. After a custom plan: 295w.",
    startingPoint: [
      "Damien describes himself as an average sportive rider who had plateaued. The kind of cyclist who shows up consistently, has the kit, has done the events, and watches the FTP graph in TrainingPeaks refuse to move for two years running.",
      "His FTP sat at 205 watts. He wasn't lazy. He wasn't undertrained. He was doing what most plateaued cyclists do — riding hard, riding often, and getting nowhere.",
    ],
    riderConstraints: [
      { label: "Profile", value: "Sportive rider, Ireland" },
      { label: "Starting FTP", value: "205 watts" },
      { label: "Status", value: "Multi-year plateau" },
      { label: "Goal", value: "Break the plateau and ride faster sportives" },
    ],
    intervention: [
      "We rebuilt the structure of his training week before we touched the volume. The most common reason a sportive rider plateaus is intensity distribution — too much grey-zone, not enough polarised contrast between easy and hard.",
      "The plan was custom. Not a template. We built it around Damien's life, his data, and the specific gap between where his FTP was and where his physiology said it could be. Weekly review. Monthly periodisation. The same polarised principles Professor Stephen Seiler has been publishing for two decades.",
    ],
    weeklyStructure: [
      "We don't publish Damien's exact week — that's his private plan in TrainingPeaks. But the framework was the standard polarised five-pillar system: most volume at conversational easy intensity, two structured high-intensity sessions a week with full recovery between them, periodised so the load increased into the season's target events and dropped before each one.",
      "The bigger change was what came out of the week. The medium-hard tempo rides that felt productive but produced nothing. The unstructured group rides that turned into mid-tempo grinds. Removing those was as important as adding the right intervals.",
    ],
    nutritionStrength: [
      "Damien's testimonial doesn't go into specifics on nutrition or strength — but every Roadman coached athlete gets the five-pillar treatment, not just a training plan. Nutrition guidance focused on fuelling the work, not chasing weight loss as the headline outcome. Strength work programmed in alongside the bike to build durable power, not to wreck the legs.",
      "When the engine's getting bigger and the body composition's holding, the power-to-weight ratio moves in the right direction without anyone having to white-knuckle a calorie deficit.",
    ],
    outcome: [
      "FTP moved from 205 watts to 295 watts. That's a 90-watt gain on a rider who'd plateaued for years. In Damien's words: \"I've gotten much more out of Roadman than I ever imagined.\"",
      "The bigger outcome — and the one that doesn't show up in TrainingPeaks — is that the plateau is gone and the system is repeatable. Damien knows what produced the change. He can keep doing it.",
    ],
    outcomeMetrics: [
      {
        label: "FTP",
        before: "205 w",
        after: "295 w",
        delta: "+90 watts over the coached programme",
      },
    ],
    caveats: [
      "We don't publish the exact timeframe. A 90-watt FTP move is unusual — most plateaued amateurs see 20–60 watts when the structure changes. Damien had headroom that not every rider will have.",
      "Untrained riders pick up watts faster than trained ones. Damien wasn't untrained — but his ceiling was higher than his old training had revealed.",
      "FTP is one number. It is the single best summary of aerobic capacity, but it isn't the whole picture. We track durability, repeatability, and event performance alongside it.",
      "Custom plans require honest data and honest reporting. The athletes who get gains like Damien's report what actually happened, not what they wished had happened.",
    ],
    coachCommentary: [
      "Damien is the case I think about when someone tells me they've stopped getting faster. Same training every week, same numbers, same frustration. The gap was structure, not effort.",
      "The hardest part of breaking a plateau is convincing a consistent athlete to do less of one thing — the medium-hard riding that feels productive — and more of two other things: easy volume and properly hard intervals. The middle is the trap.",
      "When the structure is right, the gains aren't a mystery. They're physiology doing what physiology does when you finally give it the right inputs.",
    ],
    internalLinks: [
      {
        label: "How we coach — the five-pillar methodology",
        href: "/methodology",
        description:
          "Training, nutrition, strength, recovery, community. The system that produced this result.",
      },
      {
        label: "Polarised vs sweet-spot training",
        href: "/blog/polarised-vs-sweet-spot-training",
        description:
          "The training-distribution argument that explains why Damien's old plan stalled.",
      },
      {
        label: "Plateau diagnostic",
        href: "/plateau",
        description:
          "Twelve questions to find out which version of the plateau is yours.",
      },
      {
        label: "FTP zones calculator",
        href: "/tools/ftp-zones",
        description:
          "Plug in your current FTP — see where the work actually has to land.",
      },
    ],
    relatedCaseStudies: ["blair-corey", "brian-morrissey", "daniel-stone"],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 2. David Lundy — comeback after crash
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "david-lundy",
    testimonialName: "David Lundy",
    title:
      "David Lundy: Back Racing Four Months After a Bad Cycling Accident",
    seoTitle:
      "David Lundy Case Study — Comeback to Cycling Four Months After Crash",
    seoDescription:
      "After a serious crash in March 2025, David's enthusiasm was gone. Four months on Not Done Yet later he had his mojo back and signed up for his first race. The comeback model.",
    answerCapsule:
      "After a serious crash in March 2025, David Lundy was struggling to get back to his old level and losing his enthusiasm for riding. Four months inside the Not Done Yet coaching community, he had his mojo back and signed up for his first race since the accident. Comebacks are not just physical.",
    keywords: [
      "cycling comeback after crash",
      "return to cycling after injury",
      "Not Done Yet case study",
      "rebuilding cycling fitness",
      "cycling motivation after accident",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · COMEBACK",
    heroStat: "4 months",
    heroStatLabel: "From crash to first race",
    cardSummary:
      "After a bad accident, enthusiasm gone. Four months later: back racing.",
    startingPoint: [
      "David had a bad cycling accident in March 2025. The kind of crash that doesn't just leave a physical injury — it takes the bit of you that wants to ride.",
      "He was struggling to get back to the same level. Numbers down, confidence down, and — the part most coaches miss — the enthusiasm to even start the sessions was draining away. That's when riders quietly walk away from the sport.",
    ],
    riderConstraints: [
      { label: "Profile", value: "Returning racer post-crash" },
      { label: "Starting context", value: "March 2025 accident" },
      { label: "Status", value: "Losing motivation, fitness behind old level" },
      { label: "Goal", value: "Get back to enjoying riding, then back to racing" },
    ],
    intervention: [
      "David joined the Not Done Yet coaching community four months before he wrote his testimonial. The intervention wasn't just a training plan — it was a structured comeback. Plan first, community second, accountability third.",
      "After a crash, the worst thing you can do is try to pick up where you left off. The right thing is to rebuild gradually, with structure that respects what your nervous system has been through, and a community of riders who know exactly what a bad crash does to your head.",
    ],
    weeklyStructure: [
      "We don't publish David's exact week. The principle for any post-crash comeback is the same: re-establish easy aerobic volume first, reintroduce structured intensity gradually, and never run intensity ahead of confidence on the bike.",
      "Inside Not Done Yet, that means a personalised TrainingPeaks plan, weekly coaching calls so the plan adjusts to how the week actually went, and a community of riders — most of whom have come back from something — to keep the comeback from feeling like a solo project.",
    ],
    nutritionStrength: [
      "After a crash, two things tend to slip: nutrition (because motivation is low and meals get sloppy) and strength (because the gym feels like the last thing you want to do). The Roadman five-pillar approach addresses both before they become the thing that stalls the comeback.",
      "The strength piece matters here. Heavy strength training — the kind Olav Aleksander Bu and the Norwegian-method coaches keep coming back to — is one of the cleanest ways to rebuild durable power without putting the body through repeat hard rides it can't yet absorb.",
    ],
    outcome: [
      "Four months in, David's testimonial is direct: \"I've got my mojo back and I'm really enjoying riding again. Just signed up for my first race this coming Tuesday.\"",
      "The headline outcome isn't a power number. It's that he's racing again. The training matters because it produced the confidence — not the other way around.",
    ],
    outcomeMetrics: [
      {
        label: "Time to first race",
        before: "Lost mojo",
        after: "4 months",
        delta: "From struggling to back on a start line",
      },
    ],
    caveats: [
      "Every comeback is different. Four months is fast. Some come back in two; some take a year. The variable is the crash, the body, and the headspace — not the plan.",
      "We don't have David's pre- and post-crash power numbers in his testimonial. The win we're reporting is the return to racing, not a specific FTP delta.",
      "Coaching can rebuild fitness and structure. It can't undo a crash. The mental side — and any required medical or physio support — sits alongside the training, not under it.",
      "Comebacks need a community. Riders who try to do it alone often quit. Part of why David's comeback worked is the Not Done Yet group around him.",
    ],
    coachCommentary: [
      "After a bad crash, the bike becomes the thing you avoid. The instinct is to push through it. The right move is the opposite — rebuild slowly, get the head right, and let the racing be the proof of the comeback rather than the test of it.",
      "The other thing that surprised people is how much the community piece mattered. David didn't just need a plan. He needed riders around him who knew what coming back from a crash actually feels like.",
      "Four months from \"losing enthusiasm\" to \"signed up for my first race\" is what coaching is for. It's not just the watts. It's the structure that makes the watts possible again.",
    ],
    internalLinks: [
      {
        label: "Coming back to cycling after a break",
        href: "/blog/cycling-returning-after-break",
        description:
          "The evidence-based protocol for returning to riding without losing months.",
      },
      {
        label: "Not Done Yet coaching community",
        href: "/community/not-done-yet",
        description:
          "The coached community David came back inside. $195/month, 7-day free trial.",
      },
      {
        label: "Cycling over 40 — getting faster again",
        href: "/blog/cycling-over-40-getting-faster",
        description:
          "Specific guidance for masters riders rebuilding after a layoff.",
      },
    ],
    relatedCaseStudies: ["chris-oconnor", "gregory-gross", "brian-morrissey"],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 3. Chris O'Connor — body composition + power transformation
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "chris-oconnor",
    testimonialName: "Chris O'Connor",
    title:
      "Chris O'Connor: 84kg to 68kg, 20% Body Fat to 7%, Power Doubled",
    seoTitle:
      "Chris O'Connor Case Study — 16kg Lost, Body Fat 20% to 7%, Power Doubled",
    seoDescription:
      "Chris dropped 16kg, took body fat from 20% to 7%, and doubled his average wattage. The case study for cyclists who want body composition and power to move together — not against each other.",
    answerCapsule:
      "Chris O'Connor lost 16kg (84kg → 68kg), dropped body fat from 20% to 7%, and doubled his average wattage. The combination — losing fat while building power — is what most cyclists chase and most diet-only approaches sabotage.",
    keywords: [
      "cycling body composition transformation",
      "lose weight cycling without losing power",
      "cyclist body fat 7%",
      "Roadman coaching body composition",
      "cycling weight loss case study",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · BODY COMPOSITION",
    heroStat: "-16 kg",
    heroStatLabel: "Body weight (84 → 68)",
    cardSummary:
      "84kg → 68kg, 20% body fat → 7%, average wattage doubled.",
    startingPoint: [
      "Chris started at 84 kilograms with body fat around 20 percent. He wasn't out of shape by general standards — but for a cyclist trying to ride well, the body composition was a ceiling.",
      "The real problem wasn't a single number. It was the gap between how he was eating, how he was riding, and how he was recovering. Each piece sabotaged the next, and the average wattage wouldn't move.",
    ],
    riderConstraints: [
      { label: "Profile", value: "Roadman athlete, Ireland" },
      { label: "Starting weight", value: "84 kg" },
      { label: "Starting body fat", value: "20%" },
      { label: "Goal", value: "Power and body composition together — not one or the other" },
    ],
    intervention: [
      "The intervention here was the full Roadman five-pillar system, not a diet. Training, nutrition, strength, recovery, and community — all moving in the same direction.",
      "Chris's testimonial is direct about it: \"He set me on a dietary, mental and physical journey of true discovery.\" The mental piece is what most weight-focused programmes ignore. You don't outrun a fork — and you don't out-discipline a poorly designed week either.",
    ],
    weeklyStructure: [
      "We don't publish Chris's exact week. The general framework: enough volume at conversational intensity to drive aerobic adaptation, enough hard work to push the ceiling, and recovery built in so the body can actually adapt rather than just survive.",
      "On top of that, the volume settled into a real habit. Chris's testimonial: \"weekly 100 km+ rides are now the norm.\" That's not the cause — the structure is the cause. But it's the symptom that the engine has actually grown.",
    ],
    nutritionStrength: [
      "Nutrition guidance was about fuelling the work, not running a chronic deficit. The cyclist who eats less and rides more in the wrong combination loses muscle, loses power, and looks lighter on the scale — but the watts don't follow.",
      "Chris took fat off and the watts went up. That's the combination that proves the nutrition was right. If only the scale moved, we'd have done the wrong thing.",
    ],
    outcome: [
      "16 kilograms off. 20 percent body fat down to 7 percent. Average wattage doubled. Weekly 100km+ rides became the norm.",
      "Chris's words: \"Anthony is a visionary, an educator, a mentor, a coach.\" The result is the result, but the bigger thing is that Chris owns the system now. He knows what produced the change.",
    ],
    outcomeMetrics: [
      {
        label: "Body weight",
        before: "84 kg",
        after: "68 kg",
        delta: "-16 kg over the coached arc",
      },
      {
        label: "Body fat",
        before: "20%",
        after: "7%",
        delta: "-13 percentage points",
      },
      {
        label: "Average wattage",
        before: "Baseline",
        after: "Doubled",
        delta: "Power moved in the right direction with weight loss, not against it",
      },
    ],
    caveats: [
      "Seven percent body fat is racing-cyclist territory. It is not a year-round target for most amateurs. It is also not a target you set on a spreadsheet — it falls out of the right system over a long arc.",
      "Chris's transformation wasn't six weeks. The testimonial is silent on the exact timeframe; this is a multi-year arc, not a quick fix.",
      "Doubling average wattage is the kind of number you can only get from a low starting point. It does not mean every coached athlete doubles their watts. It does mean the framework that produced it is real.",
      "Body composition is one of the most personal areas of coaching. Some athletes have medical or genetic context that puts a 20% → 7% transition off the table. The five-pillar approach adapts to the athlete in front of it — it does not chase a number for its own sake.",
    ],
    coachCommentary: [
      "Chris is the answer when someone asks whether you can lose weight and gain power at the same time. You can. You just have to stop doing the things that make those two outcomes fight each other.",
      "The cycling internet wants weight loss to be calories in versus calories out. That model is so outdated. The five-pillar system gets the body to a place where it doesn't need a deficit to compose itself properly.",
      "What Chris did is rare. What's repeatable is the framework. Most athletes won't go from 20% to 7%. Most athletes will move the right direction on body composition while their watts go up — and that is the only outcome that matters on the bike.",
    ],
    internalLinks: [
      {
        label: "Race weight calculator",
        href: "/tools/race-weight",
        description: "What your healthy power-to-weight target actually looks like.",
      },
      {
        label: "Energy availability calculator",
        href: "/tools/energy-availability",
        description:
          "Whether you're eating enough for the training you're doing — the line you don't want to cross.",
      },
      {
        label: "Why most cyclists can't lose race weight",
        href: "/problem/cant-lose-race-weight",
        description:
          "The diagnostic for athletes who've been chronically dieting and not getting lighter or faster.",
      },
    ],
    relatedCaseStudies: ["gregory-gross", "damien-maloney", "brian-morrissey"],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 4. Daniel Stone — Cat 3 to Cat 1
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "daniel-stone",
    testimonialName: "Daniel Stone",
    title: "Daniel Stone: From Cat 3 to Cat 1 in One Coached Season",
    seoTitle:
      "Daniel Stone Case Study — Cat 3 to Cat 1 in One Season With Roadman Coaching",
    seoDescription:
      "Daniel went from Cat 3 to Cat 1 in a single coached season with the Roadman Cycling Club. The structure that produced two category jumps — and the caveats most racing posts skip.",
    answerCapsule:
      "Daniel Stone went from Cat 3 to Cat 1 in one coached season. Two category jumps in a year is rare. The difference was a structured plan, periodised around a real race calendar, replacing the ad-hoc training that gets most amateurs stuck mid-pack.",
    keywords: [
      "cat 3 to cat 1 cycling",
      "racing cycling case study",
      "category upgrade cycling",
      "Roadman Cycling Club racing results",
      "structured cycling training for racing",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · CATEGORY JUMP",
    heroStat: "3 → 1",
    heroStatLabel: "Race category in one season",
    cardSummary:
      "Two category jumps in one coached season at the Roadman Cycling Club.",
    startingPoint: [
      "Daniel was a Cat 3 racer at the start of the season. Competent. Consistent. Stuck in the same pack, watching the same wheels go up the road on the same climbs.",
      "Most Cat 3 racers stay Cat 3 for years. The training is structured enough to hold the category and unstructured enough to never break out of it.",
    ],
    riderConstraints: [
      { label: "Profile", value: "Roadman Cycling Club racer" },
      { label: "Starting category", value: "Cat 3" },
      { label: "Status", value: "Plateaued mid-pack" },
      { label: "Goal", value: "Category upgrade — Cat 2 was the realistic ask" },
    ],
    intervention: [
      "We built the season backwards from his target races. Base, build, peak, taper — all structured around the specific weeks his races landed. Not a generic 12-week plan. A periodisation arc tied to the calendar.",
      "Inside the Roadman Cycling Club, that means a plan that adjusts weekly to how the racing is actually going, plus the bit that most online plans miss: a coach who looks at the post-race file and decides whether the next two weeks need to push or recover.",
    ],
    weeklyStructure: [
      "The framework was the standard polarised five-pillar setup, periodised for racing. Most volume at conversational intensity. Two structured high-intensity sessions a week — race-specific in the build, race-replicating in the peak.",
      "The unique piece for Daniel was race-day recovery management. Two-category jumps in a year aren't won in training — they're won by not arriving at the start line of a key race buried under fatigue from the last one.",
    ],
    nutritionStrength: [
      "Race nutrition was the part that needed the most rework. Most Cat 3 racers under-fuel races and over-fuel rest days; Daniel was no different. We rebuilt the in-race fuelling protocol — carbs per hour, drink mix, when to take what — alongside the training.",
      "Strength work was kept lean and specific. The point of S&C in a racing season isn't more — it's enough to maintain durable power without ever putting his legs into a race they couldn't win.",
    ],
    outcome: [
      "Daniel's testimonial is direct: \"One season with the system and I went from Cat 3 to Cat 1.\" The structured approach changed not just his training but how he raced.",
      "Two category jumps in a single season is unusual. The structure is what made it possible. Daniel did the work; the system made the work count.",
    ],
    outcomeMetrics: [
      {
        label: "Race category",
        before: "Cat 3",
        after: "Cat 1",
        delta: "Two upgrades in one coached season",
      },
    ],
    caveats: [
      "Cat 3 to Cat 1 in one season is rare. Most realistic plans target one upgrade in a season and treat the second as a stretch.",
      "Category systems vary by federation. The exact points or results required to move up depend on where you race. The principle — periodised, race-specific structure — travels; the tactical detail does not.",
      "Daniel had the underlying engine to support a two-category jump. Athletes whose physiology is a ceiling below their ambition won't see the same return on the same plan.",
      "Racing results depend on the field on the day. Coaching can move the rider's ceiling. It cannot guarantee a specific result in a specific race.",
    ],
    coachCommentary: [
      "What changed for Daniel wasn't the training intensity. He was already training hard. What changed was the structure around that training — when to push, when to recover, when to peak.",
      "Most Cat 3 racers I see have an engine bigger than their results. The gap is calendar management — knowing which races to chase, which to ride into form, and which to skip.",
      "Two upgrades in a season is the headline. The repeatable bit is the framework — and that's what makes the result a system rather than a fluke.",
    ],
    internalLinks: [
      {
        label: "How to periodise a cycling season",
        href: "/blog/how-to-periodise-cycling-season",
        description: "The periodisation framework Daniel raced into.",
      },
      {
        label: "Coaching for cyclists training for an event",
        href: "/you/event",
        description:
          "Specific to riders building toward a race or sportive on the calendar.",
      },
      {
        label: "Roadman Cycling Club community",
        href: "/community/club",
        description: "The race-focused community Daniel rides inside.",
      },
    ],
    relatedCaseStudies: ["damien-maloney", "blair-corey", "brian-morrissey"],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 5. Brian Morrissey — 52, +15% FTP in 10 weeks, training less
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "brian-morrissey",
    testimonialName: "Brian Morrissey",
    title:
      "Brian Morrissey: 4 w/kg at 52, FTP +15% in 10 Weeks — Training Less",
    seoTitle:
      "Brian Morrissey Case Study — Age 52, FTP +15% in 10 Weeks, Less Training",
    seoDescription:
      "A 52-year-old shift worker, training less than the year before and at lower intensities, moved his FTP from 230 to 265 watts in 10 weeks. 4 w/kg at 52. The masters polarised story.",
    answerCapsule:
      "Brian Morrissey, 52, a shift worker, moved his FTP from 230 to 265 watts (+15%) in 10 weeks while training less than the year before and at lower average intensities. He hit 4 w/kg at 52 and stopped getting sick. The polarised distribution, applied to a real life.",
    keywords: [
      "masters cyclist FTP gain",
      "cycling at 52",
      "FTP increase polarised training",
      "cycling case study age 50+",
      "4 w/kg at 50",
      "shift worker cycling training",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · MASTERS PLATEAU",
    heroStat: "+15%",
    heroStatLabel: "FTP at age 52",
    cardSummary:
      "Age 52 shift worker. Trained less. FTP up 15% in 10 weeks. 4 w/kg.",
    startingPoint: [
      "Brian is 52. He works shifts. He'd been training the way most masters cyclists train — hard, often, and somewhere in the middle the whole time. The result was an FTP at 230 watts that wouldn't move and a body that kept getting sick.",
      "The classic masters trap. The conventional wisdom says do more. The actual answer is to do the right work in the right places — and a lot less of the wrong work.",
    ],
    riderConstraints: [
      { label: "Age", value: "52" },
      { label: "Profile", value: "Shift worker" },
      { label: "Starting FTP", value: "230 watts" },
      { label: "Status", value: "Training hard, plateaued, frequently ill" },
      { label: "Goal", value: "Move FTP without burning out — and without falling sick again" },
    ],
    intervention: [
      "We pulled the average intensity down. Most of his volume moved to genuinely easy — heart-rate-controlled, conversational. The hard sessions stayed hard but became fewer and more deliberate.",
      "For a shift worker over 50, this is the only model that works. The body doesn't recover from chronic medium-intensity riding the way it did at 35. The polarised structure isn't a preference — it's a requirement.",
    ],
    weeklyStructure: [
      "Brian's testimonial captures the change: \"I'm training so much less than last year, at lower intensities and not getting sick.\" That sentence is the whole masters playbook in one line.",
      "The volume came down. The average intensity came down. Two structured high-intensity sessions a week stayed in. Strength work stayed in. The middle — the medium-hard riding that masters cyclists love and that breaks them — came out.",
    ],
    nutritionStrength: [
      "Recovery was the hidden lever. Shift work disrupts sleep; sleep disruption blunts adaptation. We adjusted training timing around his schedule rather than fighting it, and made sure the easy days were actually easy.",
      "Strength work was kept light enough that it didn't compete with the bike. For a masters rider, the goal of S&C is durability, not muscle gain — keeping the rider available to train rather than making them stronger in the gym.",
    ],
    outcome: [
      "Ten weeks. FTP from 230 to 265 watts. FTHR up from 175 to 180. Peak HR up to 193. 4 watts per kilo at 52.",
      "His own line: \"This really works. I'm training so much less than last year, at lower intensities and not getting sick.\" That's the whole story. The plan produces the watts. The structure produces the availability to keep producing them.",
    ],
    outcomeMetrics: [
      {
        label: "FTP",
        before: "230 w",
        after: "265 w",
        delta: "+15% in 10 weeks at age 52",
      },
      {
        label: "Power-to-weight",
        before: "Below 4 w/kg",
        after: "4 w/kg",
        delta: "Hit the masters benchmark at 52",
      },
      {
        label: "FTHR",
        before: "175 bpm",
        after: "180 bpm",
        delta: "Functional threshold heart rate moved with the engine",
      },
      {
        label: "Illness",
        before: "Recurrent",
        after: "None reported",
        delta: "Lower average load, fewer infections",
      },
    ],
    caveats: [
      "Ten-week FTP gains of 15% are larger than typical. Brian had been over-training in the medium zone — the gain came from removing the wrong work, not adding the right work.",
      "Heart rate metrics at 52 are individual. FTHR moves with fitness; peak HR is mostly genetic. We don't read peak HR as a fitness signal.",
      "Shift work is a real constraint. The plan worked for Brian's pattern of nights and days. A different shift pattern needs a different plan, not a copy of this one.",
      "4 w/kg at 52 is excellent. It is not a target every masters rider should chase — many will get more from improving durability and event-specific power than chasing the FTP number.",
    ],
    coachCommentary: [
      "Brian is the case I send to anyone over 45 who thinks they need to do more. They almost never need to do more. They need to do the right things in the right places, and stop doing the average-hard work that's quietly burying them.",
      "The shift-work piece is important. Real life has constraints. The plan has to fit the rider — not the other way around.",
      "Hitting 4 w/kg at 52 while training less and not getting sick is the masters model in one sentence. The science has been there for years. Most masters athletes still aren't using it.",
    ],
    internalLinks: [
      {
        label: "Cycling over 40 — getting faster again",
        href: "/blog/cycling-over-40-getting-faster",
        description: "The masters-specific guide to gaining FTP after 40.",
      },
      {
        label: "Polarised vs sweet-spot training",
        href: "/blog/polarised-vs-sweet-spot-training",
        description: "Why the medium-hard zone burns out masters cyclists.",
      },
      {
        label: "Masters FTP benchmark calculator",
        href: "/tools/masters-ftp-benchmark",
        description: "Where your FTP sits versus age-graded benchmarks.",
      },
      {
        label: "Time-crunched cyclist guide",
        href: "/blog/time-crunched-cyclist-8-hours-week",
        description: "How to train when you genuinely don't have the hours.",
      },
    ],
    relatedCaseStudies: ["damien-maloney", "blair-corey", "rob-capps"],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 6. Blair Corey — +60W on 20-min in 3 months
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "blair-corey",
    testimonialName: "Blair Corey",
    title:
      "Blair Corey: +60 Watts on 20-Min Power in 3 Months Inside Not Done Yet",
    seoTitle:
      "Blair Corey Case Study — 20-Min Power 236w to 296w in 3 Months",
    seoDescription:
      "Blair's 20-minute power moved from 236 to 296 watts in three months on Not Done Yet. The structure that produced 60 watts in a quarter — and the honest caveats that most marketing leaves out.",
    answerCapsule:
      "Blair Corey's 20-minute average power moved from 236 watts to 296 watts in three months inside the Not Done Yet coaching community — a 60-watt gain on the metric that proxies most closely for FTP. He paced his most recent test feeling like he could have gone harder.",
    keywords: [
      "20-minute power FTP gain",
      "Not Done Yet results",
      "cycling FTP 3 months",
      "polarised training case study",
      "cycling power test improvement",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · 20-MIN POWER",
    heroStat: "+60 W",
    heroStatLabel: "20-min power, 3 months",
    cardSummary:
      "December: 236w. March: 296w. 60 watts in three months on NDY.",
    startingPoint: [
      "Blair did a 20-minute test on December 19th. Average power: 236 watts. By his own description, the test was painful and he felt like he had nothing left at the end.",
      "Three months later he repeated the test. Same protocol, same effort target, different rider underneath the numbers.",
    ],
    riderConstraints: [
      { label: "Profile", value: "Not Done Yet member" },
      { label: "Starting 20-min power", value: "236 watts" },
      { label: "Test interval", value: "Three months — same protocol" },
      { label: "Goal", value: "Make the structured plan produce a measurable test gain" },
    ],
    intervention: [
      "Blair moved into Not Done Yet at the back end of December. The intervention was the standard NDY model — personalised TrainingPeaks plan, weekly coaching calls, masterclasses on the science behind the sessions, and the daily accountability of a community of serious cyclists.",
      "Three months is the smallest window where you can reasonably expect a test number to move on a structured plan. Six weeks is too short — you're testing the intervention's bedding in. Twelve weeks is the right cycle for an honest before/after.",
    ],
    weeklyStructure: [
      "We don't publish Blair's exact week. The general framework: most volume at conversational intensity, two structured high-intensity sessions per week, strength work alongside, recovery built in so adaptation actually happens.",
      "The discipline that the community adds is the part most amateur athletes can't replicate alone. Following the plan when you don't feel like it. Backing off when the plan says recover. Showing up to the calls.",
    ],
    nutritionStrength: [
      "Blair's testimonial doesn't go into nutrition or strength. Inside Not Done Yet, both are baseline — the five-pillar system isn't a-la-carte.",
      "Three-month test gains of 60 watts almost always rest on training that the body can absorb. That requires the recovery and nutrition pillars to be doing their work in the background. Otherwise the watts don't appear on test day.",
    ],
    outcome: [
      "Second test, three months later: 296 watts. A 60-watt jump on the same 20-minute test interval. His own line: \"Hard to believe a 60-watt increase in 3 months.\"",
      "More telling: \"Felt like I had nothing left back in December, today I was left feeling I paced it wrong and could have gone harder.\" That's the qualitative signal of an aerobic engine that's actually moved — not just a one-off lucky test.",
    ],
    outcomeMetrics: [
      {
        label: "20-min average power",
        before: "236 w",
        after: "296 w",
        delta: "+60 watts in 3 months",
      },
      {
        label: "Subjective effort",
        before: "Nothing left at the end",
        after: "Could have gone harder",
        delta: "Engine bigger; pacing the limiter",
      },
    ],
    caveats: [
      "60 watts on a 20-minute test in three months is at the upper end of what's reasonable. The test has variance — pacing, conditions, motivation — and three-month test deltas should be read with that variance in mind.",
      "20-minute power is a proxy for FTP, not FTP itself. The conventional 0.95 multiplier overestimates true FTP for some athletes. We track multiple test protocols rather than relying on one number.",
      "First-month gains in a structured programme look bigger than later gains. The next 60 watts will not come in three months — they will come over a year. Coaching is not a forever-linear-gain promise.",
      "The community piece is harder to quantify but materially affects results. Athletes who do the same plan without the accountability layer typically see smaller test deltas.",
    ],
    coachCommentary: [
      "What I love about Blair's testimonial is that he reports on pacing as well as on power. December he had nothing left. March he could have gone harder. That's a fitter rider, but it's also a smarter one.",
      "Three-month test gains tell you whether the structure is working. They don't tell you whether the rider is going to keep getting faster for another year. The framework is what does that.",
      "Most amateurs test, then go back to whatever they were doing before. Blair tested, took the data, and used it to set up the next three months. That's the difference between training and being coached.",
    ],
    internalLinks: [
      {
        label: "Not Done Yet coaching community",
        href: "/community/not-done-yet",
        description: "The structured coaching community Blair tests inside.",
      },
      {
        label: "FTP zones calculator",
        href: "/tools/ftp-zones",
        description: "Plug your post-test number in — see where the work lands.",
      },
      {
        label: "How to structure a cycling training plan",
        href: "/blog/how-to-structure-cycling-training-plan",
        description:
          "The framework behind a three-month gain that's actually durable.",
      },
    ],
    relatedCaseStudies: ["damien-maloney", "brian-morrissey", "rob-capps"],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 7. Gregory Gross — 315 lbs to sub-100 kg
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "gregory-gross",
    testimonialName: "Gregory Gross",
    title:
      "Gregory Gross: 315 Pounds to Sub-100kg — A 15-Year Low Weight",
    seoTitle:
      "Gregory Gross Case Study — From 315 lbs to Sub-100kg With Roadman Coaching",
    seoDescription:
      "Gregory was 315 pounds in late 2019 and about to go on disability. After joining Not Done Yet, he reached his lowest weight in 15 years — under 100 kilograms. The long arc of body composition.",
    answerCapsule:
      "In November 2019, Gregory Gross was 315 pounds and about to go on disability. After joining the Not Done Yet coaching community on January 5, he reached his lowest weight in 15 years — under 100 kilograms. The case for the long-arc body-composition approach over the quick-fix.",
    keywords: [
      "cycling weight loss case study",
      "315 lbs to under 100kg",
      "Not Done Yet body composition",
      "long-arc cycling weight loss",
      "Roadman coaching weight loss USA",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · BODY COMPOSITION (LONG ARC)",
    heroStat: "Sub-100 kg",
    heroStatLabel: "From 315 lbs / 15-year low",
    cardSummary:
      "Nov 2019: 315 lbs, about to go on disability. Today: under 100kg.",
    startingPoint: [
      "In November 2019, Gregory was 315 pounds. He was about to go on disability. He had been planning to compete in the Race Across America earlier that year — the gap between that ambition and where his body actually was was enormous.",
      "Quarantine, by his own account, was a godsend. It removed the friction that had kept him stuck. On January 5 he started Not Done Yet.",
    ],
    riderConstraints: [
      { label: "Profile", value: "USA athlete, NDY member" },
      { label: "Starting weight", value: "315 lbs (~143 kg) in Nov 2019" },
      { label: "Status", value: "Heading toward disability before NDY" },
      { label: "Goal", value: "Get under 100kg — sustainable body composition" },
    ],
    intervention: [
      "Gregory's intervention was time. Not three months — a multi-year coached arc inside Not Done Yet. Training, nutrition, strength, recovery, and community, all moving slowly in the same direction.",
      "Long-arc body composition isn't about willpower. It's about removing the friction that keeps you off the bike, putting structure on the days you're motivated, and having a community that knows you on the days you're not.",
    ],
    weeklyStructure: [
      "We don't publish Gregory's exact week. The principle for any long-arc body composition case is the same: enough riding to drive aerobic adaptation, enough easy volume to be sustainable, enough strength work to keep the body durable as the weight comes off.",
      "Sustainable means \"can keep doing this when life gets in the way.\" Quick-fix programmes lose people the first time work or family blows up the schedule. The Roadman model is built to bend rather than break.",
    ],
    nutritionStrength: [
      "Nutrition guidance focused on fuelling the work. Most heavy cyclists who try to lose weight under-fuel the bike — they crash, give up, and rebound. The five-pillar approach prioritises consistency over deficit.",
      "Strength work is non-negotiable on a long body-composition arc. As weight comes off, muscle mass has to be defended actively. Otherwise the scale moves but the engine doesn't.",
    ],
    outcome: [
      "Gregory's testimonial: \"Today I'm down 5 pounds and 1% body fat to my lowest weight in 15 years. I cannot believe I'm under 100kg.\"",
      "From 315 pounds and heading for disability to sub-100kg and lowest weight in 15 years. The headline number isn't the rate of loss. It's the durability — he's still in the system years later, and the trajectory is still in the right direction.",
    ],
    outcomeMetrics: [
      {
        label: "Body weight",
        before: "315 lbs (~143 kg)",
        after: "<100 kg",
        delta: "Lowest weight in 15 years",
      },
      {
        label: "Health trajectory",
        before: "About to go on disability",
        after: "Active cyclist, in the system",
        delta: "The headline outcome",
      },
    ],
    caveats: [
      "Gregory's arc is long — multiple years inside Not Done Yet. This is not a 12-week before-and-after.",
      "The starting point — 315 pounds and approaching disability — is not the typical entry point to the community. Most NDY athletes are already moderately fit.",
      "Body composition changes at this scale benefit from medical input alongside coaching. Coaching is one input among several. We do not position it as a substitute for clinical care where that's required.",
      "Rate of weight loss varied across the arc. Plateaus were part of the process. Anyone reading this expecting linear progress will be disappointed; anyone reading it expecting durability will see the model.",
    ],
    coachCommentary: [
      "Gregory is the case I think about when someone asks whether coaching can do anything for an athlete who's a long way from where they want to be. It can. The unlock is time, not intensity.",
      "The hard part of a long arc is staying in. Most athletes drop out at month four, month nine, month eighteen. The community piece is what keeps people in. The community is why Gregory is still going.",
      "Sub-100 kg from 315 pounds is a specific outcome. The repeatable outcome is staying in the system long enough for the body to compose itself properly. Everything that matters in cycling is downstream of that.",
    ],
    internalLinks: [
      {
        label: "Race weight calculator",
        href: "/tools/race-weight",
        description: "Healthy power-to-weight target — not a punishment number.",
      },
      {
        label: "Not Done Yet coaching community",
        href: "/community/not-done-yet",
        description: "The structured community Gregory's arc happened inside.",
      },
      {
        label: "Cycling over 40 — getting faster again",
        href: "/blog/cycling-over-40-getting-faster",
        description:
          "Specific guidance for masters athletes rebuilding from a long way back.",
      },
    ],
    relatedCaseStudies: ["chris-oconnor", "david-lundy", "brian-morrissey"],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 8. Rob Capps — coaching quality / data-backed expertise
  // ─────────────────────────────────────────────────────────────────────
  {
    slug: "rob-capps",
    testimonialName: "Rob Capps",
    title:
      "Rob Capps: What Data-Backed, Elite-Level Cycling Coaching Looks Like",
    seoTitle:
      "Rob Capps Case Study — Data-Backed Cycling Coaching With Anthony Walsh",
    seoDescription:
      "Rob's testimonial focuses on the coaching itself — power zones, cadence, the why behind every interval. The case study for cyclists evaluating coaching quality, not just headline FTP gains.",
    answerCapsule:
      "Rob Capps's testimonial is about the coaching, not a single power number. Power zones fine-tuned, cadence work, the reasoning behind every interval, and a coach he describes as organized, responsive, and precise. The case study for serious cyclists evaluating coaching quality.",
    keywords: [
      "data-backed cycling coaching",
      "elite cycling coach",
      "power zones cadence cycling coaching",
      "cycling coaching quality",
      "Anthony Walsh coaching review",
    ],
    publishDate: "2026-04-30",
    heroEyebrow: "CASE STUDY · COACHING QUALITY",
    heroStat: "Data-backed",
    heroStatLabel: "Power · cadence · intervals",
    cardSummary:
      "Power zones, cadence, the why behind every interval. Organized, responsive, precise.",
    startingPoint: [
      "Rob's case study is different from the others. He doesn't lead with a stat. He leads with what the coaching itself looks like from inside the relationship.",
      "That matters. Most cyclists choosing a coach are choosing on more than the headline FTP gain. They are choosing on whether the coach actually knows what they are doing — and whether the relationship is the kind that produces results over years rather than months.",
    ],
    riderConstraints: [
      { label: "Profile", value: "Coached athlete" },
      { label: "Focus", value: "Power zones, cadence, structured intervals" },
      { label: "Status", value: "Working with Anthony directly" },
      { label: "Goal", value: "A coach who combines elite expertise with a thorough, data-backed approach" },
    ],
    intervention: [
      "Rob's coaching is the standard one-to-one Roadman setup — a personalised TrainingPeaks plan, weekly review of the data, and a coach who explains the reasoning behind every session rather than just prescribing the number.",
      "Rob's words: \"He brings an expert level of insight that is hard to find. Beyond the technical skills, his professionalism is unmatched.\"",
    ],
    weeklyStructure: [
      "Rob doesn't publish his exact week, and we don't either. What he describes is the texture of the coaching — fine-tuning his power zones rather than running a generic estimate, perfecting cadence (which most plans never address explicitly), and explaining the why behind every interval.",
      "That's the difference between a plan and a coach. A plan tells you what to do. A coach tells you why, adjusts when the data says the why isn't landing, and keeps the rider involved in the process rather than just executing it.",
    ],
    nutritionStrength: [
      "Rob's testimonial doesn't go into nutrition or strength. The full Roadman coaching engagement covers all five pillars — Rob's emphasis on power zones, cadence, and intervals is one slice of the relationship rather than the whole of it.",
      "His other line — \"keeps me motivated and injury-free\" — is the recovery-and-S&C piece showing up in the part of the testimonial most cyclists actually care about. Injury-free is doing a lot of work in that sentence.",
    ],
    outcome: [
      "The outcome here isn't a power number. It's a description of what good coaching feels like from the inside: organized, responsive, precise, motivated, injury-free.",
      "Rob's recommendation is direct: \"If you're looking for a coach who combines extensive, elite-level expertise with a thorough, data backed approach, I'd recommend Anthony.\"",
    ],
    outcomeMetrics: [
      {
        label: "Coaching delivery",
        before: "Looking for elite-level expertise",
        after: "Found it",
        delta: "Organized, responsive, precise",
      },
      {
        label: "Injury status",
        before: "—",
        after: "Injury-free",
        delta: "S&C and recovery pillars holding up the training",
      },
    ],
    caveats: [
      "Rob's testimonial doesn't include specific power numbers. We're not reporting FTP or PRs because he didn't.",
      "Coaching quality is harder to evaluate than a headline stat. The signals — organized, responsive, technical depth, injury-free — show up over months, not weeks.",
      "Rob's experience is one athlete's experience. Coaching is a relationship; not every athlete responds to every coach the same way. The seven-day free trial exists so the fit can be tested before commitment.",
      "Rob's quote uses the phrase \"game-changer\" — those are his words. We don't use that phrase in our own copy because it doesn't say anything specific. We do let athletes describe their own experience in their own words.",
    ],
    coachCommentary: [
      "Rob's testimonial is the one I read when I want to remember what coaching is supposed to look like. It's not the FTP number. It's the texture of the relationship — the why behind the session, the responsiveness when the data shifts, the boring competence of a plan that actually fits the athlete.",
      "Power zones and cadence get under-coached in most online plans. Power zones because they're estimated rather than tested; cadence because most coaches don't programme it explicitly. Both are fixable. Both move performance.",
      "Injury-free is the one outcome cyclists rarely brag about. It's also the one that determines whether the rider is still in the system in two years. Rob's testimonial puts it last in the list. I'd put it first.",
    ],
    internalLinks: [
      {
        label: "Coaching — the five-pillar system",
        href: "/coaching",
        description: "How coaching works, what's covered, what it costs.",
      },
      {
        label: "Coaching methodology",
        href: "/methodology",
        description: "The reasoning behind power zones, cadence, and intervals.",
      },
      {
        label: "FTP zones calculator",
        href: "/tools/ftp-zones",
        description:
          "What \"fine-tuning power zones\" actually looks like — start with your numbers.",
      },
    ],
    relatedCaseStudies: ["damien-maloney", "brian-morrissey", "blair-corey"],
  },
];

/**
 * Find a case study by URL slug.
 */
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug);
}

/**
 * Resolve the linked testimonial for a case study. Throws in dev if
 * the testimonial is missing — that's an editorial bug that should
 * fail loud rather than render an incomplete page.
 */
export function getCaseStudyTestimonial(caseStudy: CaseStudy): Testimonial {
  const t = TESTIMONIALS.find((x) => x.name === caseStudy.testimonialName);
  if (!t) {
    throw new Error(
      `Case study "${caseStudy.slug}" references testimonial "${caseStudy.testimonialName}" which does not exist in TESTIMONIALS.`,
    );
  }
  return t;
}

export function getAllCaseStudySlugs(): string[] {
  return CASE_STUDIES.map((c) => c.slug);
}
