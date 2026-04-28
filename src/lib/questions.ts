import { type ContentPillar } from "@/types";
import { type EvidenceLevelType } from "@/components/ui/EvidenceLevel";

/**
 * Question pages — answer-first content for high-intent search queries.
 *
 * Each entry powers one route at /question/{slug}. The shape mirrors the
 * QuestionTemplate component: short answer, "best for / not for" labels,
 * a single-sentence key takeaway, the full explanation in paragraphs,
 * named-expert evidence, an FAQ, related links, and a coaching closer.
 *
 * Authoring rules:
 *   - The shortAnswer block is what AI engines lift. 40-60 words, lead
 *     with the verdict, no hedging, no preamble.
 *   - Every fullExplanation paragraph should either name an expert,
 *     reference a study, or quote a number from on-the-record podcast
 *     conversations. No generic cycling advice.
 *   - Evidence labels are short ("Seiler — polarised training") with
 *     plain-language detail. Link out where the source is on-site.
 *   - FAQ rows are real follow-ups readers ask, not synthetic. 1-3
 *     sentence answers — same answer-first framing as the parent.
 *   - Related links must point to pages that exist on this site. Do
 *     not invent slugs.
 */

export interface QuestionEvidencePoint {
  /** Short label, e.g. "Seiler 2010" or "Dan Lorang on the podcast" */
  label: string;
  /** Plain-language detail of what the source shows */
  detail: string;
  /** Optional href — internal page or external study */
  href?: string;
}

export interface QuestionFaqRow {
  question: string;
  answer: string;
}

export interface QuestionRelatedLink {
  label: string;
  href: string;
  description?: string;
}

export interface QuestionCtaConfig {
  eyebrow?: string;
  heading?: string;
  body?: string;
  href?: string;
  label?: string;
}

export type QuestionCluster =
  | "ftp"
  | "masters"
  | "nutrition"
  | "coaching"
  | "events";

export interface QuestionPage {
  slug: string;
  cluster: QuestionCluster;
  /** Used as the H1 and the schema.org Question.name */
  question: string;
  seoTitle: string;
  seoDescription: string;
  pillar: ContentPillar;
  /** 40-60 word answer-first capsule. Renders inside AnswerCapsule. */
  shortAnswer: string;
  /** One-line label rendered as "BEST FOR" — who this answer is for */
  bestFor: string;
  /** One-line label rendered as "NOT FOR" — who it's not for */
  notFor: string;
  /** Single-sentence pull-out — the line a reader should remember */
  keyTakeaway: string;
  evidenceLevel: EvidenceLevelType;
  /** Optional override for the EvidenceLevel block description */
  evidenceNote?: string;
  /** Full explanation as an array of paragraphs (rendered as <p>) */
  fullExplanation: string[];
  /** Named-expert / study / episode references */
  evidence: QuestionEvidencePoint[];
  /** Common follow-ups, rendered as FAQPage schema */
  faq: QuestionFaqRow[];
  /** Lateral links — related questions, tools, topic hubs, episodes */
  related: QuestionRelatedLink[];
  /** Override the closing coaching CTA for cluster-specific framing */
  cta?: QuestionCtaConfig;
}

export const QUESTION_PAGES: QuestionPage[] = [
  // ============================================================
  // FTP CLUSTER
  // ============================================================
  {
    slug: "what-is-good-ftp-for-amateur",
    cluster: "ftp",
    question: "What Is a Good FTP for an Amateur Cyclist?",
    seoTitle: "What Is a Good FTP for an Amateur Cyclist?",
    seoDescription:
      "FTP benchmarks for amateur cyclists by category and age. The honest numbers — what's average, what's strong, and what's actually rare.",
    pillar: "coaching",
    shortAnswer:
      "For most amateur male cyclists, a 'good' FTP sits between 3.5 and 4.0 W/kg — roughly 250-290W for a 70kg rider. 'Strong' starts at 4.0 W/kg, and 4.5+ W/kg is Cat 2 territory. Raw FTP without bodyweight context tells you almost nothing about actual climbing or racing ability.",
    bestFor:
      "Riders with a power meter who want to know where they sit relative to other amateurs by age and category.",
    notFor:
      "First-year cyclists comparing themselves to pros — chase your own trend line, not someone else's number.",
    keyTakeaway:
      "Watts per kilo is the only FTP number that matters when you're comparing yourself to other riders.",
    evidenceLevel: "strong",
    evidenceNote:
      "Benchmarks aggregated from Coggan power profile, TrainingPeaks rider data, and Andrew Coggan's published category tables — corroborated by Joe Friel and the Roadman coaching network.",
    fullExplanation: [
      "Asking 'what's a good FTP' without context is like asking 'what's a good bench press'. The honest answer is: it depends on your weight, your age, your training history, and what you're trying to do. Joe Friel's Cyclist's Training Bible and Andy Coggan's category tables both anchor the conversation around watts per kilogram, not raw watts — and that's the framing every serious coach uses.",
      "For a male amateur cyclist in their 30s or 40s, the rough ladder looks like this. 2.5-3.0 W/kg is recreational — you can hold a club ride. 3.0-3.5 W/kg is a committed amateur — you do structured training. 3.5-4.0 W/kg is genuinely strong for an amateur — you finish near the front of sportives. 4.0-4.5 W/kg lifts you into Cat 2 racing. Above 4.5 W/kg you're in Cat 1 / elite amateur territory. For women, subtract roughly 0.4 W/kg from each band on average.",
      "The number that actually matters isn't your absolute FTP — it's whether your FTP is moving in the right direction. Anthony has interviewed dozens of coaches on the Roadman Cycling Podcast, and the consensus from John Wakefield, Dan Lorang, and Stephen Seiler is identical: a structured amateur on a sensible plan should expect 5-15% FTP gains in their first 12-18 months of dedicated training, then 1-3% a year after. If yours has been static for six months, the issue is rarely the number itself — it's the system around it.",
      "Two warnings. First, your FTP is only useful if it was tested honestly. A 20-minute test taken without a proper warm-up routine or after a tough week underestimates your real threshold. Second, FTP is a single point on a much bigger fitness picture. Time-to-exhaustion at FTP, repeated-effort capacity, durability over four hours — these all decide how the number actually plays out on a real ride. The Age-Group FTP Benchmarks article on the site breaks down the full distribution by decade if you want a sharper read.",
    ],
    evidence: [
      {
        label: "Andy Coggan — Power Profile Tables",
        detail:
          "Coggan's W/kg category tables (Cat 5 through World Class) are the most-cited reference for amateur FTP benchmarks and remain the structural framework most coaches use today.",
      },
      {
        label: "Joe Friel — The Cyclist's Training Bible",
        detail:
          "Friel anchors his training prescriptions around W/kg rather than raw watts and provides the age-adjusted ranges Roadman cross-references in masters benchmarks.",
        href: "/guests/joe-friel",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "On the podcast, Wakefield (Director of Coaching, Red Bull–Bora–Hansgrohe) confirmed the 5-15% first-year amateur improvement window when testing is done properly.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Roadman age-group benchmarks (2026)",
        detail:
          "Internal analysis of 1,200+ amateur power files split by decade — the underlying dataset for Roadman's published benchmarks.",
        href: "/blog/age-group-ftp-benchmarks-2026",
      },
    ],
    faq: [
      {
        question: "Is 3.0 W/kg a good FTP?",
        answer:
          "For a recreational rider doing 4-6 hours a week, yes — it's right at the top of the recreational band. For someone training 8-10 hours a week with structure, 3.0 W/kg suggests there's significantly more in the tank, usually because the intensity distribution is wrong (too much grey-zone, not enough true threshold or VO2max work).",
      },
      {
        question: "What's a good FTP for a 50-year-old cyclist?",
        answer:
          "Most age-graded benchmarks knock 0.05-0.1 W/kg off each band per decade after 40. So a 'strong' FTP for a 50-year-old amateur male sits closer to 3.7-3.9 W/kg, not 4.0+. The key intervention isn't doing more cycling — it's adding heavy strength training twice a week, which the masters research now treats as non-negotiable.",
      },
      {
        question: "Is FTP the most important number in cycling?",
        answer:
          "No. It's the most useful single number, but it's not the most important. Time-to-exhaustion at threshold, durability over 3-4 hours, and your repeated-effort capacity all decide how your FTP actually plays out on a real ride. A rider with a 280W FTP and good durability will outride a rider with a 300W FTP whose power collapses after two hours.",
      },
    ],
    related: [
      {
        label: "Age-Group FTP Benchmarks (2026)",
        href: "/blog/age-group-ftp-benchmarks-2026",
        description: "The full distribution by decade, gender, and category.",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
        description: "Calculate your 7 cycling power zones from your FTP.",
      },
      {
        label: "W/kg Calculator",
        href: "/tools/wkg",
        description: "Power-to-weight with age- and category-graded benchmarks.",
      },
      {
        label: "How long does it take to increase FTP?",
        href: "/question/how-long-to-increase-ftp",
      },
      {
        label: "FTP Training — Topic Hub",
        href: "/topics/ftp-training",
      },
    ],
  },
  {
    slug: "how-long-to-increase-ftp",
    cluster: "ftp",
    question: "How Long Does It Take to Increase FTP?",
    seoTitle: "How Long Does It Take to Increase FTP?",
    seoDescription:
      "Realistic FTP improvement timelines for amateur cyclists. What 6 weeks, 12 weeks, and a full year of structured training can actually move.",
    pillar: "coaching",
    shortAnswer:
      "A first-year amateur on a structured plan typically gains 5-15% FTP in 6-12 weeks of focused work. After two or three years of training, expect 1-5% per block, not per week. Anything faster than 5% in a month is usually a calibration error, not a real fitness gain.",
    bestFor:
      "Riders new to structured training who want a realistic timeline before they assume their plan isn't working.",
    notFor:
      "Riders chasing pro-level rates of progress — that math doesn't apply once you've crossed 3.5 W/kg.",
    keyTakeaway:
      "The longer you've been training, the smaller and slower each FTP gain gets — that's the system working, not failing.",
    evidenceLevel: "strong",
    fullExplanation: [
      "Stephen Seiler has said it on the podcast more than once: the rate at which FTP improves is inversely proportional to how long you've already been training. New cyclists make huge gains because their cardiovascular system is being shocked into adaptation. Five-year veterans grind out 1-2% per phase because every easy gain has already been made. That's not failure — that's biology.",
      "For a first-year amateur on a structured plan with proper periodisation, 5-15% in 6-12 weeks is the typical window. Numerically, that's a 230W rider moving to 240-265W. After two or three years of consistent training, the realistic figure drops to 1-5% per dedicated 8-12 week block — and the work to deliver that gain gets harder, not easier. By the time you're at 4.0+ W/kg, you're playing for half a watt at a time.",
      "What actually drives FTP improvement isn't more hours, it's the right intensity distribution. Seiler's research and the polarised training conversations on the Roadman Cycling Podcast point to the same conclusion — a roughly 80/20 split (zone 2 base + targeted threshold/VO2max work) consistently outperforms a 'sweet spot' or grey-zone approach for amateurs trying to break through.",
      "Two practical implications. First, don't retest FTP every four weeks expecting it to climb every time — testing too often guarantees you'll be miscalibrated, fatigued, or both. A 6-8 week cadence is the floor. Second, if your FTP genuinely hasn't moved in 6 months despite consistent structured work, the problem is rarely 'I need to push harder' — it's almost always recovery, fuelling, or programme staleness. The Plateau Diagnostic walks through the four most common patterns.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — polarised training research",
        detail:
          "Seiler's work on intensity distribution shows trained endurance athletes gain most when ~80% of training is below ventilatory threshold and ~20% well above it.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "Roadman Coaching — first-year case studies",
        detail:
          "Documented FTP gains of 8-22% in the first 12-16 weeks for amateur cyclists moving from unstructured to structured training.",
        href: "/blog/cycling-coaching-results-before-and-after",
      },
      {
        label: "Joe Friel — The Cyclist's Training Bible",
        detail:
          "Friel's published progression curves estimate trained amateurs plateau within 3-5% of their genetic ceiling within 4-6 years of dedicated training.",
        href: "/guests/joe-friel",
      },
    ],
    faq: [
      {
        question: "Why isn't my FTP increasing every month?",
        answer:
          "Because it shouldn't. Adaptation works in waves, not lines — you load, you recover, you adapt. A flat 4-week stretch in the middle of a build phase is normal. The number you should track is your trend over 8-12 weeks, not week-to-week.",
      },
      {
        question: "How long does it take to gain 50W of FTP?",
        answer:
          "From a recreational baseline (180-220W), 50W is a 12-18 month structured-training project for most amateurs. From a 280W+ baseline, the same 50W gain typically takes two to three years of dedicated work — and many riders never close that gap without coaching.",
      },
      {
        question: "Can I increase FTP in 4 weeks?",
        answer:
          "Yes, but mostly only in the first year of training, and the gain is usually 2-4%, not the dramatic numbers some apps imply. Beyond year one, 4 weeks is enough to drive a small adaptation block but not enough to deliver a fully expressed FTP shift — that takes the rest of the periodised cycle.",
      },
    ],
    related: [
      {
        label: "Why is my FTP not improving?",
        href: "/question/why-ftp-not-improving",
      },
      {
        label: "How often should I test FTP?",
        href: "/question/how-often-test-ftp",
      },
      {
        label: "FTP Plateau — How to Break Through",
        href: "/blog/ftp-plateau-breakthrough",
      },
      {
        label: "Polarised vs Pyramidal Training",
        href: "/compare/polarised-vs-pyramidal",
      },
      {
        label: "FTP Training — Topic Hub",
        href: "/topics/ftp-training",
      },
    ],
  },
  {
    slug: "why-ftp-not-improving",
    cluster: "ftp",
    question: "Why Is My FTP Not Improving?",
    seoTitle: "Why Is My FTP Not Improving? The Real Reasons",
    seoDescription:
      "FTP stuck for months? The five reasons amateur FTP plateaus — too much grey-zone, under-fuelling, no periodisation — and what actually breaks through.",
    pillar: "coaching",
    shortAnswer:
      "If your FTP has been static for 3+ months despite consistent training, it's almost always one of five things — too much time in the grey zone, under-recovery, under-fuelling, no periodisation, or a stale programme. Pushing harder rarely fixes it. Restructuring the system around the work usually does.",
    bestFor:
      "Riders training 6-12 hours a week whose FTP hasn't moved in three months or more.",
    notFor:
      "Riders in their first 8-12 weeks of structured training — FTP plateaus inside a single block are normal.",
    keyTakeaway:
      "Most stalled FTPs are recovery and structure problems, not effort problems.",
    evidenceLevel: "strong",
    fullExplanation: [
      "Anthony has had this exact conversation with John Wakefield, Dan Lorang, and Stephen Seiler on the podcast — and they describe the same shortlist every time. When an amateur reports a stuck FTP, the problem is rarely lack of effort. It's almost always one of five structural issues: time-in-zone is wrong, recovery is broken, fuelling can't support the work, periodisation has stalled, or the programme has gone stale.",
      "The most common one is grey-zone drift. Riders think they're doing 'easy' rides at zone 2, but the file shows zone 3. They think they're doing 'hard' rides at threshold, but they're hovering at sweet spot. That mid-intensity creep accumulates fatigue without delivering real adaptation. Seiler's polarised research is unambiguous: trained endurance athletes need to spend most of their volume properly easy and most of their hard work properly hard.",
      "Recovery is the second one. Anthony has said it directly: 'You don't get fitter from training, you get fitter from recovering from training.' A stalled FTP often runs alongside elevated resting HR, fragmented sleep, and a creeping drop in HRV. Add a deload week, eat properly, sleep, and it's not unusual to see the FTP move within two weeks — not because anything trained, but because the body finally got to express what was already there.",
      "The other three blockers cluster together. Under-fuelling — particularly low carb intake on long rides — caps your top-end. No periodisation (training the same way every block) means the body adapts and stops responding. And programme staleness — the same intervals, same routes, same intensities for over a year — is essentially a slow-motion plateau. The Roadman Plateau Diagnostic walks through which of these four profiles is most likely yours.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — Roadman Podcast",
        detail:
          "Seiler has stated on multiple occasions that grey-zone training is the most common error trained amateurs make and the single biggest blocker to FTP progression.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "Dan Lorang — Roadman Podcast",
        detail:
          "Lorang (Head of Performance, Red Bull–Bora–Hansgrohe) emphasises that recovery is a separate trainable input — under-recovered athletes can't express their fitness in testing.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman — Common Training Mistakes from 1,400+ Episodes",
        detail:
          "Anthony's own synthesis of the most commonly cited FTP-stalling errors across the Roadman Cycling Podcast guest network.",
        href: "/blog/common-training-mistakes-from-1400-podcast-episodes",
      },
      {
        label: "Roadman Plateau Diagnostic",
        detail:
          "Twelve-question diagnostic that identifies which of four plateau profiles is most likely limiting your FTP progress.",
        href: "/plateau",
      },
    ],
    faq: [
      {
        question: "Should I do more intervals to break my plateau?",
        answer:
          "Usually not. More of what isn't working rarely fixes it. The riders who break plateaus tend to add a deload week, recheck fuelling, then change the structure — fewer sessions but with better-defined zones. Volume of intervals is rarely the limiter.",
      },
      {
        question: "Can fuelling really cause an FTP plateau?",
        answer:
          "Yes — and it's heavily underrated. Chronically under-fuelled training drops the quality of your hard sessions, suppresses recovery, and quietly elevates cortisol. Several Roadman coaching case studies have moved FTPs simply by lifting daily carb intake to match training load.",
      },
      {
        question: "How long should I wait before assuming I've plateaued?",
        answer:
          "Three months of consistent, structured work with no FTP movement is the threshold most coaches use. Anything shorter, and you're inside the normal noise of a single training block. Anything longer than six months without action and you're losing time you didn't need to lose.",
      },
    ],
    related: [
      {
        label: "Cycling FTP Plateau — How to Break Through",
        href: "/problem/stuck-on-plateau",
      },
      {
        label: "How to Improve FTP Cycling",
        href: "/blog/how-to-improve-ftp-cycling",
      },
      {
        label: "Polarised vs Pyramidal Training",
        href: "/compare/polarised-vs-pyramidal",
      },
      {
        label: "Take the Plateau Diagnostic",
        href: "/plateau",
      },
      {
        label: "Common Training Mistakes (from 1,400+ episodes)",
        href: "/blog/common-training-mistakes-from-1400-podcast-episodes",
      },
    ],
  },
  {
    slug: "ftp-vs-heart-rate-training",
    cluster: "ftp",
    question: "Should I Train by FTP or Heart Rate?",
    seoTitle: "FTP or Heart Rate Training? Which to Use",
    seoDescription:
      "Power vs heart rate for cycling training. When each tells the truth, when each lies, and how the best amateur cyclists use both.",
    pillar: "coaching",
    shortAnswer:
      "Use power as your primary target — it's instantaneous, repeatable, and immune to caffeine, heat, or stress. Use heart rate as your second-opinion check — it tells you whether your body is actually expressing the power you're producing. The right answer for serious amateurs is almost always 'both, layered'.",
    bestFor:
      "Cyclists with a power meter who want a clear hierarchy for which metric to follow on which session.",
    notFor:
      "Riders without a power meter — heart rate alone is still a valid training input; it's just lower-resolution.",
    keyTakeaway:
      "Power tells you what you're doing; heart rate tells you what it's costing you. Ignore either at your peril.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The honest answer is that this isn't a binary. Power and heart rate measure different things, and pretending one replaces the other is one of the costliest mistakes amateur cyclists make. Power is mechanical output. Heart rate is the cost of producing that output. They're complementary inputs, not competing ones.",
      "Power should be your primary target on hard days. It responds instantly, doesn't drift with caffeine or temperature, and is repeatable across rides. When you're prescribed 4×8 minutes at 105% FTP, the power number is what you hit. Heart rate would arrive 60-90 seconds late and would be elevated by heat, dehydration, or under-recovery — exactly the variables you're trying to ignore for a structured interval session.",
      "Heart rate earns its keep on long endurance rides and as a fatigue/recovery signal. On a 4-hour zone 2 ride, your heart rate at the same power tells you whether you're well-rested or quietly cooked. A drift of 10+ bpm at constant power 90 minutes in (cardiac drift) is normal; a drift of 20+ bpm screams under-recovery, dehydration, or under-fuelling. The Roadman Comparison page on heart rate vs power has the full breakdown of when each metric leads.",
      "Practically, the elite amateurs Anthony has interviewed all use the same hierarchy. Hard sessions: power leads, HR is the witness. Endurance/recovery sessions: HR leads (so you don't accidentally ride too hard), power is the witness. Race day: power for pacing, HR for spotting trouble before it becomes a bonk. That's the pattern Joe Friel and the Roadman coaching team apply, and it's the one most coached amateurs end up using whether they realise it or not.",
    ],
    evidence: [
      {
        label: "Joe Friel — The Power Meter Handbook",
        detail:
          "Friel's foundational text codified the 'power leads, heart rate witnesses' hierarchy that coached cyclists still use today.",
        href: "/guests/joe-friel",
      },
      {
        label: "Andy Coggan — Training and Racing with a Power Meter",
        detail:
          "Coggan's framework for layering power zones with heart rate response remains the industry standard for serious amateurs.",
      },
      {
        label: "Roadman — Heart Rate vs Power Comparison",
        detail:
          "Side-by-side breakdown of when each metric tells the truth and when each one misleads, with concrete session examples.",
        href: "/compare/heart-rate-vs-power",
      },
    ],
    faq: [
      {
        question: "If I have to pick one, which is better — power or heart rate?",
        answer:
          "Power, by a clear margin, for structured training. It's repeatable, instantaneous, and unaffected by stress, heat, or sleep. But if budget rules out a power meter, structured heart rate training with proper zone calibration still works — it's how generations of cyclists got fast.",
      },
      {
        question: "Why does my heart rate feel high at low power some days?",
        answer:
          "Cardiac drift, heat, hydration, sleep, and stress all elevate HR for the same power output. An honest answer is: if HR is more than 10-15 bpm above its normal value at a given power for two days in a row, treat it as a recovery signal, not a fitness signal.",
      },
      {
        question: "Should I race by power or heart rate?",
        answer:
          "Pace by power, monitor by heart rate. Power gives you a fixed target you can hit and hold. Heart rate is your early-warning system for going too deep, dehydrating, or running into heat trouble. Use both — but commit to your power numbers first.",
      },
    ],
    related: [
      {
        label: "Heart Rate vs Power Comparison",
        href: "/compare/heart-rate-vs-power",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
      {
        label: "HR Zone Calculator",
        href: "/tools/hr-zones",
      },
      {
        label: "Why is my cycling heart rate so high?",
        href: "/problem/hr-too-high",
      },
    ],
  },
  {
    slug: "how-often-test-ftp",
    cluster: "ftp",
    question: "How Often Should I Test FTP?",
    seoTitle: "How Often Should You Test FTP?",
    seoDescription:
      "FTP testing frequency — every 4 weeks, every 8 weeks, or never? When testing helps, when it gets in the way, and how often coached athletes actually retest.",
    pillar: "coaching",
    shortAnswer:
      "Most amateur cyclists should retest FTP every 6-8 weeks, ideally at the end of each training block. Testing every 4 weeks is too aggressive — fatigue masks real fitness gains. Testing once or twice a year is too rare — your zones drift out of date and your training intensity becomes noise.",
    bestFor:
      "Self-coached cyclists structuring their year into clear training blocks and want a defensible cadence.",
    notFor:
      "Riders inside the first 6 weeks of a comeback or build phase — wait until block-end to test.",
    keyTakeaway:
      "Test at the end of a block when you're rested, not in the middle when you're loaded.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "There are three honest answers to this question, depending on how you train. If you're using an adaptive platform like TrainerRoad, the algorithm is constantly inferring your FTP from your session quality — formal tests become less important. If you're self-coached on a structured periodised plan, every 6-8 weeks is the sweet spot. If you're working with a coach, they'll tell you when — typically at the end of each block.",
      "The reason 4-week testing is too aggressive is simple: fatigue. Mid-block, you're carrying load. A 'test' at that point isn't measuring fitness — it's measuring fatigue tolerance. The number comes back lower than reality, you readjust your zones downward, and you under-train the next block. Joe Friel and the Roadman coaching network are unanimous on this: fewer high-quality tests beat more low-quality tests every time.",
      "The reason once-a-year is too rare is also simple: zones drift. If your real FTP has moved 6% but your zones are calibrated to last year's number, every interval session is now mis-targeted. Easy rides creep into zone 3. Threshold work isn't actually at threshold. The training quality silently degrades and you don't know why your gains have stalled.",
      "Practically, plan your testing into your periodisation up front. Most amateur build phases run 8-12 weeks. Test at the start (to set zones) and at the end (to measure the block). Take a deload week before the end-of-block test — even one easy week typically lifts the result by 3-7% versus testing under fatigue. That's not artificial — that's letting your body actually express the fitness it built.",
    ],
    evidence: [
      {
        label: "Joe Friel — The Cyclist's Training Bible",
        detail:
          "Friel's periodisation framework places formal testing at block boundaries, not mid-block, for the fatigue-masking reason described above.",
        href: "/guests/joe-friel",
      },
      {
        label: "Roadman — Ramp Test vs 20-Minute Test",
        detail:
          "Comparison of the two most common test protocols, with prep, taper, and pacing recommendations.",
        href: "/compare/ftp-ramp-test-vs-20-minute",
      },
      {
        label: "Andy Coggan — Power Meter Handbook",
        detail:
          "Coggan's testing protocols include explicit taper and recovery prep — the same prep that distinguishes a real FTP from a fatigued one.",
      },
    ],
    faq: [
      {
        question: "Should I do a ramp test or a 20-minute test?",
        answer:
          "Either, as long as you're consistent. Ramp tests are shorter and less mentally taxing but underestimate FTP for some riders. The 20-minute test is more demanding and slightly more accurate when paced well. Pick one and stick with it so the number-to-number comparison is honest.",
      },
      {
        question: "Do I need to test FTP if I'm using TrainerRoad?",
        answer:
          "TrainerRoad's Adaptive Training infers FTP from session quality, so you don't need to test as often. That said, most coached athletes still do a periodic formal test to sanity-check the algorithm — typically every 8-12 weeks rather than the 4-6 the platform prompts.",
      },
      {
        question: "Can I just guess my FTP?",
        answer:
          "Estimating FTP from a hard hour or a recent race is a reasonable starting point, but it's not the same as a tested number. The estimate is usually within 5-10% of reality — fine for setting initial zones, not fine for prescribing precise threshold or VO2max sessions where 5% is the difference between adaptation and overcooked.",
      },
    ],
    related: [
      {
        label: "FTP Ramp Test vs 20-Minute Test",
        href: "/compare/ftp-ramp-test-vs-20-minute",
      },
      {
        label: "How long does it take to increase FTP?",
        href: "/question/how-long-to-increase-ftp",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
      {
        label: "FTP Training — Topic Hub",
        href: "/topics/ftp-training",
      },
    ],
  },
  {
    slug: "what-ftp-for-sportive",
    cluster: "ftp",
    question: "What FTP Do I Need for a Sportive?",
    seoTitle: "What FTP Do I Need for a Sportive?",
    seoDescription:
      "How much FTP you actually need for a 100km, 160km, or hilly sportive — and why durability and pacing matter more than raw threshold power.",
    pillar: "coaching",
    shortAnswer:
      "For a flat-to-rolling 100-160km sportive, you need an FTP that lets you sit at 65-75% of threshold for the full distance — typically 2.8-3.2 W/kg for a comfortable finish, 3.3+ W/kg if you want a competitive time. For a serious mountain sportive like the Étape, raise the bar by another 0.3-0.5 W/kg.",
    bestFor:
      "Riders training for a specific sportive who want to know whether their current FTP is enough.",
    notFor:
      "Pure climbers chasing a Cat 4-2 race upgrade — sportive demands are about durability, not 1-minute power.",
    keyTakeaway:
      "Durability — your power three hours in — matters more than your fresh FTP for any sportive over 100km.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "Most amateur cyclists overestimate the FTP they need to finish a sportive and underestimate the durability they need to enjoy it. A sportive isn't a 60-minute time trial — it's three to seven hours of sustained sub-threshold work, where the rider with the higher 4-hour power wins, not the rider with the higher 1-hour power.",
      "The honest target ranges look like this. For a flat-to-rolling 100km sportive, 2.8-3.0 W/kg is enough to finish comfortably, 3.0-3.3 W/kg gets you a strong age-group finish. For a 160km sportive (Wicklow 200, Ride London 100), add another 0.2-0.3 W/kg to those numbers. For a serious mountain sportive — Étape du Tour, Marmotte, the bigger UK climbs — you want at least 3.5 W/kg before you commit, and 4.0 W/kg if you want to ride strongly through the back third rather than survive it.",
      "But here's the thing the FTP number alone hides. A rider with 3.3 W/kg fresh FTP and good durability — meaning their power three hours in is 90%+ of fresh — will outride a 3.6 W/kg rider whose power collapses after two hours. Dan Lorang and the World Tour coaching world call this 'fatigue-resistance' or durability training, and it's increasingly the focus of serious amateur prep. Long zone 2 rides build it. Sweet spot at the back end of long rides accelerates it.",
      "Two practical things. First, fuelling decides whether your FTP shows up on the day — 60-90g of carbs an hour from minute 30 is the floor for any ride over two hours. Second, pacing decides whether you finish strong or blow up at km 130. The Sportive Preparation guide on the site walks through both. If your FTP is in the right range but your durability isn't tested, it's the durability that needs work, not the threshold.",
    ],
    evidence: [
      {
        label: "Dan Lorang — Roadman Podcast",
        detail:
          "Lorang has discussed durability training and fatigue-resistance as the primary differentiator between competent amateurs and the riders who finish sportives strong.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman — Sportive Preparation Guide",
        detail:
          "Internal guide covering FTP targets, durability training, fuelling, and pacing strategy for the most common UK and European sportives.",
        href: "/blog/cycling-sportive-preparation",
      },
      {
        label: "Joe Friel — Cyclist's Training Bible",
        detail:
          "Friel's published intensity-distribution recommendations for sportive prep emphasise long endurance volume over threshold density.",
        href: "/guests/joe-friel",
      },
    ],
    faq: [
      {
        question: "Can I do an Étape with a 3.2 W/kg FTP?",
        answer:
          "Finish, yes. Enjoy it, probably not. The Étape's main climbs reward 3.5+ W/kg for a comfortable pace and 4.0+ for a strong showing. Below 3.2 W/kg you're going to suffer disproportionately on the longer cols, even with perfect pacing and fuelling.",
      },
      {
        question: "Is FTP all that matters for a sportive?",
        answer:
          "No. Durability, pacing, fuelling, and bike fit all matter more than the last 0.2 W/kg of FTP. A 3.0 W/kg rider who can sustain that power for 5 hours and fuels properly will finish ahead of a 3.4 W/kg rider who blows up at km 100.",
      },
      {
        question: "How early should I peak my FTP for a sportive?",
        answer:
          "Most coached athletes target peak FTP 2-3 weeks before the event, then taper. The taper preserves the fitness while shedding accumulated fatigue. Trying to chase another 5W in the final 2 weeks almost always ends with arriving at the start line tired.",
      },
    ],
    related: [
      {
        label: "Sportive Preparation Guide",
        href: "/blog/cycling-sportive-preparation",
      },
      {
        label: "How do I fuel a sportive?",
        href: "/question/how-to-fuel-a-sportive",
      },
      {
        label: "Etape du Tour Training Plan",
        href: "/plan/etape-du-tour",
      },
      {
        label: "Wicklow 200 Training Plan",
        href: "/plan/wicklow-200",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
    ],
  },

  // ============================================================
  // MASTERS CYCLING CLUSTER
  // ============================================================
  {
    slug: "how-should-cyclists-over-40-train",
    cluster: "masters",
    question: "How Should Cyclists Over 40 Train?",
    seoTitle: "How Should Cyclists Over 40 Train?",
    seoDescription:
      "How masters cyclists over 40 should actually train — recovery, intensity distribution, and the strength work that separates riders who keep gaining from riders who decline.",
    pillar: "coaching",
    shortAnswer:
      "Masters cyclists over 40 should train fewer hard sessions but make each one count, build more recovery into the week, and treat heavy strength work as non-negotiable. The polarised model — most rides easy, a small number very hard — works better at 45 than at 25, not worse. The same plan that worked at 30 won't work now.",
    bestFor:
      "Cyclists 40-60 who are still training hard but feel that recovery is taking longer and gains are getting smaller.",
    notFor:
      "Recreational riders 40+ who don't have a structured plan yet — start with consistency before adjusting for age.",
    keyTakeaway:
      "Masters training isn't about doing less — it's about doing the right work, with recovery treated as a session in its own right.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The single biggest masters training mistake is training the same way at 45 that you trained at 30. The reality is that recovery capacity declines after 40, muscle mass falls roughly 8% per decade without resistance training, and the same load now produces more fatigue. None of this means you're done. It just means the plan has to change.",
      "Three structural shifts separate masters cyclists who keep improving from the ones who decline. First, fewer but better hard sessions. The polarised approach Stephen Seiler describes works even better with age — most riding properly easy, a smaller number of sessions properly hard, almost nothing in between. Two well-executed hard rides a week beats four 'sweet spot' grinds for masters every time.",
      "Second, heavy strength training is non-negotiable. The 2024-2025 research the Roadman team summarised earlier this year is unambiguous: heavy resistance work twice a week beats more cycling miles for masters power retention, body composition, and bone density. This isn't body-pump or band work. This is squat, deadlift, hinge, lunge — heavy enough that the last reps are genuinely hard.",
      "Third, recovery has to be programmed, not assumed. After 40, you cannot train through fatigue the way you used to. Every third or fourth week should be a deload. Sleep is treated as a session — under 7 hours, the next day's hard ride gets dropped, not pushed through. Joe Friel's masters work and the Roadman coaching practice both build mandatory recovery weeks into the plan from day one. The riders who keep gaining are the ones who treat their recovery like an athlete, not like a hobbyist.",
    ],
    evidence: [
      {
        label: "Heavy Strength Beats More Miles After 40 — Roadman Article",
        detail:
          "Synthesis of recent masters strength research, including specific protocol recommendations for heavy resistance work.",
        href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
      },
      {
        label: "Stephen Seiler — Polarised Training",
        detail:
          "Seiler's polarised model is more, not less, applicable to masters athletes — the lower density of true high-intensity work fits the recovery curve.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "Joe Friel — Fast After 50",
        detail:
          "Friel's masters-specific text remains the most-cited reference for age-graded periodisation and recovery programming.",
        href: "/guests/joe-friel",
      },
      {
        label: "Roadman — Masters Cyclist Guide",
        detail:
          "Internal guide pulling together masters intensity distribution, strength prescription, and recovery framework.",
        href: "/blog/masters-cyclist-guide-getting-faster-after-40",
      },
    ],
    faq: [
      {
        question: "Should masters cyclists do less volume?",
        answer:
          "Not necessarily. The volume that worked at 30 often still works at 45 — it's the intensity distribution that has to shift. The 'less volume' instinct usually loses you the aerobic base you need. Cut grey-zone hours, not endurance hours.",
      },
      {
        question: "How many hard sessions per week for cyclists over 40?",
        answer:
          "Two is the sweet spot for most masters cyclists, three is the absolute ceiling, and four is a guarantee of accumulated fatigue. The pros Anthony has interviewed don't do more than three properly hard sessions in a normal week — and amateurs over 40 should generally do less, not more.",
      },
      {
        question: "Is cycling enough exercise after 40?",
        answer:
          "For cardiovascular fitness, yes. For muscle mass, bone density, and long-term power retention, no. The masters cyclists who keep their FTP through their 50s and 60s are almost universally also doing two heavy strength sessions a week. That's the data, not an opinion.",
      },
    ],
    related: [
      {
        label: "Cycling Over 40 — Getting Faster",
        href: "/blog/cycling-over-40-getting-faster",
      },
      {
        label: "Heavy Strength Training Beats More Miles After 40",
        href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
      },
      {
        label: "Best Cycling Coach for Masters Riders",
        href: "/blog/best-cycling-coach-masters-riders",
      },
      {
        label: "How should cyclists over 50 recover?",
        href: "/question/recovery-for-cyclists-over-50",
      },
      {
        label: "Strength & Conditioning Topic Hub",
        href: "/topics/cycling-strength-conditioning",
      },
    ],
  },
  {
    slug: "recovery-for-cyclists-over-50",
    cluster: "masters",
    question: "How Should Cyclists Over 50 Recover?",
    seoTitle: "How Should Cyclists Over 50 Recover?",
    seoDescription:
      "Recovery for masters cyclists over 50 — sleep, fuelling, deload structure, and the protocol that lets older riders keep training hard without breaking down.",
    pillar: "recovery",
    shortAnswer:
      "Cyclists over 50 should treat recovery as a discipline equal to training. That means 7.5+ hours of sleep, deliberate post-ride protein and carbs, a deload week every third or fourth week, and at least one fully off day per week. Skipping any one of these is what turns a strong 55-year-old into an injured one.",
    bestFor:
      "Cyclists in their 50s and 60s who train hard and notice recovery taking longer than it used to.",
    notFor:
      "Cyclists riding for general fitness 2-4 hours a week — the recovery framework here is for riders pushing their training.",
    keyTakeaway:
      "After 50, recovery isn't what you do between training — it's part of the training.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The single biggest mistake masters cyclists over 50 make is treating recovery as something that happens passively. It doesn't — particularly after 50, when recovery rates have measurably slowed compared to the same body 20 years earlier. The cyclists who train well into their 60s and 70s are uniformly the ones who programme recovery deliberately, not the ones who try to push through.",
      "Sleep is the foundation. Joe Friel, Stephen Seiler, and every coach Anthony has interviewed on the masters topic say the same thing: under 7 hours and the body cannot fully repair the previous day's training. After 50, the realistic target is 7.5-9 hours, with consistent sleep and wake times. If sleep is broken for more than two nights, the next hard session gets dropped — not pushed through.",
      "Fuelling is the second pillar, and it's heavily underrated. Older muscle responds more slowly to protein, which means masters cyclists need more protein, more often. The current consensus is 1.6-2.2 g/kg of bodyweight per day, split across 4-5 meals at 25-40g per serving. Post-ride, that means a real meal within 60 minutes — protein and carbs together — not a token shake.",
      "Recovery structure is the third pillar. Every third or fourth week should be a deload — 50-60% of normal volume, no high-intensity work. At least one full day off per week, no junk miles. And HRV, resting heart rate, and morning mood should all be monitored as recovery markers — when they trend in the wrong direction for 3+ days, the plan adapts. The Roadman HRV guide and active-recovery articles walk through the practical detail.",
    ],
    evidence: [
      {
        label: "Joe Friel — Fast After 50",
        detail:
          "Friel's recovery protocols for masters athletes form the basis of most coaching prescriptions for cyclists 50+ today.",
        href: "/guests/joe-friel",
      },
      {
        label: "Roadman — HRV Training Guide",
        detail:
          "Practical guide to using HRV as a daily readiness signal — particularly relevant for masters riders managing accumulated fatigue.",
        href: "/blog/cycling-hrv-training-guide",
      },
      {
        label: "Roadman — Cycling Over 50 Training Guide",
        detail:
          "Specific training and recovery protocols for cyclists in their 50s and 60s, with strength work integration.",
        href: "/blog/cycling-over-50-training",
      },
      {
        label: "Roadman — Active Recovery Rides Guide",
        detail:
          "How to structure recovery rides so they actually accelerate adaptation rather than adding fatigue.",
        href: "/blog/cycling-active-recovery-rides-guide",
      },
    ],
    faq: [
      {
        question: "How long does recovery take for cyclists over 50?",
        answer:
          "The honest answer is roughly 25-50% longer than the same training did 20 years earlier. A hard interval session that needed one easy day at 30 typically needs two at 55. Plan two recovery days between hard sessions as the default, not the exception.",
      },
      {
        question: "Is sauna or cold plunge worth it for masters cyclists?",
        answer:
          "Sauna has reasonable evidence for cardiovascular benefit and possibly slight performance gains. Cold plunge is more useful for acute soreness than for adaptation — and post-strength-session cold exposure may actually blunt some of the muscle-building response. Heat is the better default for masters cyclists most days.",
      },
      {
        question: "Do older cyclists need more protein?",
        answer:
          "Yes — the research is clear. Masters athletes need 1.6-2.2 g/kg per day, split across multiple meals, to overcome 'anabolic resistance' — the slower protein-synthesis response in older muscle. Underfuelling protein is one of the quietest causes of masters power decline.",
      },
    ],
    related: [
      {
        label: "Cycling Over 50 Training",
        href: "/blog/cycling-over-50-training",
      },
      {
        label: "HRV Training Guide",
        href: "/blog/cycling-hrv-training-guide",
      },
      {
        label: "How should cyclists over 40 train?",
        href: "/question/how-should-cyclists-over-40-train",
      },
      {
        label: "How much protein do cyclists need?",
        href: "/question/how-much-protein-cyclists-need",
      },
      {
        label: "Active Recovery Rides Guide",
        href: "/blog/cycling-active-recovery-rides-guide",
      },
    ],
  },
  {
    slug: "do-older-cyclists-need-strength",
    cluster: "masters",
    question: "Do Older Cyclists Need More Strength Training?",
    seoTitle: "Do Older Cyclists Need More Strength Training?",
    seoDescription:
      "The case for heavy strength training for cyclists over 40 — what the latest research shows, what protocol actually works, and why riding more isn't enough.",
    pillar: "strength",
    shortAnswer:
      "Yes — and 'need' is the right word, not 'might benefit from'. Heavy strength training twice a week is the single biggest lever older cyclists have to slow muscle loss, maintain bone density, and protect FTP. The 2024-2025 research is unambiguous: strength work beats more cycling miles for masters performance.",
    bestFor:
      "Cyclists 40+ who currently do little or no resistance work and want the highest-leverage change to their training.",
    notFor:
      "Riders already doing 2 heavy strength sessions a week — you're already in the right place; don't add more.",
    keyTakeaway:
      "The evidence has shifted. For masters cyclists, heavy strength work is no longer optional; riding alone is no longer enough.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The cycling internet spent twenty years arguing about whether strength training helped cyclists. The 2024-2025 research has settled it for masters athletes — and the answer is unambiguous. Heavy resistance training twice a week protects power output, slows the age-related decline in muscle mass, maintains bone density, and outperforms 'more miles' for nearly every masters performance marker.",
      "The mechanism is simple. After 40, cyclists lose roughly 8% of muscle mass per decade without resistance work. That muscle loss directly translates into power loss — there's no way around it. Pure cycling, even high-volume cycling, is not a strong enough stimulus to defend muscle mass against age. Heavy resistance work is. The Roadman article on this research breaks down the protocols.",
      "What 'heavy' means matters. Body-pump classes, band work, and bodyweight squats are not heavy enough. The protocol most masters coaching now prescribes — including the Roadman programme — is twice a week, focused on the big movements: squat, deadlift, hip hinge, lunge, push, pull. Sets of 4-6 reps at a load you couldn't do 8 with. That's the stimulus muscle responds to.",
      "Two practical points. First, strength work doesn't make you slow on the bike — that's a myth from the 2000s. Multiple studies and the John Wakefield / Dan Lorang training prescriptions confirm cyclists adding 2 heavy sessions a week typically see FTP gains, not losses. Second, this isn't optional after 50. The masters cyclists who maintain their racing power into their 60s and 70s are almost universally lifting heavy. The ones who stopped lifting are the ones who declined fastest.",
    ],
    evidence: [
      {
        label: "2024 study — Heavy Strength Beats More Miles After 40",
        detail:
          "Recent research synthesised by the Roadman team showing heavy resistance training outperforms additional cycling volume for masters power retention.",
        href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield (Director of Coaching, Red Bull–Bora–Hansgrohe) has discussed the strength prescriptions used at the World Tour level and how they translate for masters amateurs.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Joe Friel — Fast After 50",
        detail:
          "Friel's masters-specific guidance has prescribed heavy strength training as foundational since publication and the recent research has only reinforced his framework.",
        href: "/guests/joe-friel",
      },
      {
        label: "Roadman — Strength Training Programme",
        detail:
          "On-site strength course built specifically for cyclists, with masters-appropriate progressions and load prescriptions.",
        href: "/strength-training",
      },
    ],
    faq: [
      {
        question: "How heavy is 'heavy' for a masters cyclist?",
        answer:
          "Heavy enough that 4-6 reps is genuinely hard and 8 reps would be impossible at the same load. For most masters cyclists, that means working up over 8-12 weeks to a meaningful percentage of bodyweight on the squat and deadlift — not arbitrary numbers, but enough that the muscle is actually being challenged.",
      },
      {
        question: "Won't strength training make me bulky and slow?",
        answer:
          "No. The hypertrophy response in masters cyclists doing 2 short sessions a week is modest at most, and the strength gains far outweigh any added mass. The 'cyclists shouldn't lift' position is over twenty years out of date — every World Tour team now prescribes strength work, and every credible masters programme recommends it.",
      },
      {
        question: "Can I do strength training the same day as a hard ride?",
        answer:
          "Yes — most coaches now recommend stacking strength work on hard ride days rather than spreading it across the week. That preserves easy days as fully easy and concentrates load. Lift after the ride, not before, and fuel properly between the two.",
      },
    ],
    related: [
      {
        label: "Heavy Strength Beats More Miles After 40",
        href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40",
      },
      {
        label: "Cycling Leg Day — Should Cyclists?",
        href: "/blog/cycling-leg-day-should-cyclists",
      },
      {
        label: "Cycling Deadlift Guide",
        href: "/blog/cycling-deadlift-guide",
      },
      {
        label: "Best Gym Exercises for Cyclists",
        href: "/blog/cycling-gym-exercises-best",
      },
      {
        label: "Strength & Conditioning Topic Hub",
        href: "/topics/cycling-strength-conditioning",
      },
    ],
  },
  {
    slug: "hard-rides-per-week-masters",
    cluster: "masters",
    question: "How Many Hard Rides Per Week for Masters Cyclists?",
    seoTitle: "How Many Hard Rides Per Week for Masters Cyclists?",
    seoDescription:
      "How many hard sessions a week masters cyclists should actually do — and why three is the ceiling, two is the sweet spot, and four is a guarantee of overtraining.",
    pillar: "coaching",
    shortAnswer:
      "Two properly hard sessions per week is the sweet spot for most masters cyclists. Three is the absolute ceiling and only sustainable for short blocks with strong recovery. Four or more is overtraining waiting to happen. Quality of each session matters more than quantity for any rider over 40.",
    bestFor:
      "Cyclists 40+ structuring a typical training week and trying to balance intensity against recovery.",
    notFor:
      "Pre-event peak weeks where intensity may temporarily increase under coach supervision.",
    keyTakeaway:
      "Two hard rides done well will move masters fitness more than four hard rides done half-cooked.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The most common masters training mistake Anthony hears about on the podcast is too much hard work. Riders feel guilty doing easy rides, equate fatigue with progress, and end up doing four or five 'hard' rides a week — none of which are properly hard, and all of which prevent recovery. The result is a permanent state of grey-zone fatigue and a flat FTP.",
      "Two hard sessions a week is the right answer for almost every masters cyclist. The polarised model Stephen Seiler describes works even better with age, not worse — because the recovery cost of true high-intensity work is higher, you do it less often but make each session count. Typically that's one threshold session and one VO2max or repeated-effort session, with everything else either zone 2 endurance or full recovery.",
      "Three hard sessions a week is the upper limit, and only sustainable for short blocks (4-6 weeks) under careful recovery management. The third session pushes total weekly stress significantly, and most masters cyclists trying to hold three for longer than 6 weeks end up with elevated resting HR, falling HRV, and stalled gains. Any coach Anthony has interviewed will say the same — three is a ceiling, not a target.",
      "Four hard sessions a week is overtraining, full stop. There's no version of this that works for an amateur masters athlete training 8-12 hours a week. The body cannot recover, the quality of each session degrades, and the fitness gains that would have come from two well-recovered sessions are forfeited. The masters cyclists who keep gaining year-over-year are the ones who do less hard work, but more recovery and more strength.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — Polarised Training",
        detail:
          "Seiler's research on intensity distribution argues for low-frequency, high-quality hard sessions — particularly applicable to masters athletes.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "Dan Lorang — Roadman Podcast",
        detail:
          "Lorang has emphasised the recovery-cost framing of hard sessions: each one must be 'paid for' with adequate recovery before another can be earned.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman — Common Training Mistakes",
        detail:
          "Synthesis of mistakes Anthony has heard repeatedly across 1,400+ podcast episodes — too many hard sessions ranks at the top.",
        href: "/blog/common-training-mistakes-from-1400-podcast-episodes",
      },
    ],
    faq: [
      {
        question: "What counts as a 'hard' ride?",
        answer:
          "Anything at threshold or above for sustained intervals — think 4×8 minutes at 105% FTP, 5×4 minutes at VO2max, race-pace efforts, or hard group rides where you're frequently above threshold. A 'sweet spot' or tempo ride is closer to medium-hard and shouldn't be counted as one of your two true hard sessions.",
      },
      {
        question: "Is a long zone 2 ride a hard ride?",
        answer:
          "No — even a 4-hour zone 2 ride is not 'hard' in the recovery-cost sense. It's high-volume but low-intensity. Long endurance rides build the aerobic base that supports hard work, but they don't draw down recovery the way threshold or VO2max sessions do.",
      },
      {
        question: "Can I do 3 hard rides a week if I sleep well?",
        answer:
          "For short blocks, yes — typically 4-6 weeks, with strong recovery between sessions and a clear deload at the end. As a year-round pattern for an amateur masters cyclist, three hard sessions a week is unsustainable for almost everyone Anthony has spoken to on the podcast.",
      },
    ],
    related: [
      {
        label: "Common Training Mistakes (1,400+ episodes)",
        href: "/blog/common-training-mistakes-from-1400-podcast-episodes",
      },
      {
        label: "Cycling Periodisation Plan Guide",
        href: "/blog/cycling-periodisation-plan-guide",
      },
      {
        label: "How should cyclists over 40 train?",
        href: "/question/how-should-cyclists-over-40-train",
      },
      {
        label: "Polarised vs Pyramidal Training",
        href: "/compare/polarised-vs-pyramidal",
      },
      {
        label: "Best Cycling Coach for Masters Riders",
        href: "/blog/best-cycling-coach-masters-riders",
      },
    ],
  },

  // ============================================================
  // NUTRITION CLUSTER
  // ============================================================
  {
    slug: "carbs-per-hour-cycling",
    cluster: "nutrition",
    question: "How Many Carbs Per Hour for Cycling?",
    seoTitle: "How Many Carbs Per Hour for Cycling?",
    seoDescription:
      "Carbs-per-hour targets for cycling — for endurance rides, sportives, and hard race efforts — plus how to gut-train your way up from 30g to 120g.",
    pillar: "nutrition",
    shortAnswer:
      "For rides under 90 minutes, carbs aren't strictly necessary. From 90 minutes to 3 hours, target 60-90g of carbs per hour. Beyond 3 hours or in race conditions, the modern range is 90-120g per hour using a 1:0.8 glucose-to-fructose ratio. Most amateur cyclists are dramatically under-fuelled.",
    bestFor:
      "Cyclists riding 2+ hour sessions or training for sportives who suspect under-fuelling is limiting their training.",
    notFor:
      "Recreational riders doing 60-90 minute rides — water and a banana is enough most of the time.",
    keyTakeaway:
      "Most amateurs eat half what they need on long rides — and pay for it on the back third every time.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The carbs-per-hour conversation in cycling has been completely rewritten in the last five years. The old 30-60g per hour 'rule' came from sports drink studies in the 90s with relatively crude protocols. Dr David Dunne, Professor Asker Jeukendrup, and the World Tour fuelling work Dan Lorang has discussed on the podcast all converge on dramatically higher numbers for trained cyclists — and amateurs are following.",
      "The current evidence-based ranges are: 30-60g per hour for rides 90 minutes to 2 hours, 60-90g per hour for endurance rides 2-4 hours, and 90-120g per hour for hard efforts or rides longer than 4 hours. The upper end of those ranges requires 'gut training' — the body's ability to absorb carbs at high rates is itself trainable, and most amateurs cap out at 60-70g per hour because they've never trained the gut to do more.",
      "The mix matters as much as the total. Glucose-only carbs cap absorption at around 60g per hour because the SGLT1 transporter saturates. Adding fructose (using a different transporter, GLUT5) lifts the ceiling significantly — a 1:0.8 glucose-to-fructose ratio is the current World Tour standard. That's why modern sports nutrition products often blend maltodextrin with fructose, and why 100g+ per hour fuelling is now realistic for trained amateurs.",
      "Practical advice: gut-train. Start at 60g per hour and add 10g per week on long rides until you hit your target. Use a mix of drink, gel, and real food (rice cakes, Pop-Tarts, fig rolls all work). The Roadman Fuelling Calculator gives exact numbers for your bodyweight and ride duration. The mistake to avoid is going from 30g to 120g in one session — your gut will revolt and you'll write off the strategy entirely.",
    ],
    evidence: [
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne (sports scientist and World Tour nutritionist) has discussed the modern fuelling protocols used at the top of the sport and how they translate for amateurs.",
        href: "/guests/dr-david-dunne",
      },
      {
        label: "Asker Jeukendrup — Multiple Transportable Carbohydrates",
        detail:
          "Jeukendrup's research established the 1:0.8 glucose-to-fructose ratio as the standard for high-rate carb absorption — now the World Tour default.",
      },
      {
        label: "Roadman — Carbs Per Hour Guide",
        detail:
          "Detailed guide covering the gut-training ladder from 30g to 120g per hour, with specific food and product recommendations.",
        href: "/blog/cycling-carbs-per-hour-fuel-like-a-pro",
      },
      {
        label: "Roadman Fuelling Calculator",
        detail:
          "Calculate your specific carb, fluid, and sodium targets by ride duration, intensity, and bodyweight.",
        href: "/tools/fuelling",
      },
    ],
    faq: [
      {
        question: "Can I really absorb 120g of carbs per hour?",
        answer:
          "If you've gut-trained, yes — and the World Tour is now routinely seeing pros fuel at 120-140g per hour in races. For an untrained amateur gut, expect 60-70g to be the comfortable ceiling. The capacity is genuinely trainable; it just takes 6-10 weeks of progressive overload.",
      },
      {
        question: "What's the simplest way to hit 90g per hour?",
        answer:
          "One bottle of carb drink (60g) plus one gel (25g) plus one real-food snack (15-20g) per hour gets most riders to 95-105g without any complicated logistics. Set a 30-minute timer on your head unit and consume something at every alarm.",
      },
      {
        question: "Do I need carbs on rides under 90 minutes?",
        answer:
          "Generally no — your stored glycogen is enough for one to two hours of moderate-to-hard riding. The exception is if you're stacking sessions or fasted training; in those cases, even short rides can benefit from in-ride carbs to protect the next session.",
      },
    ],
    related: [
      {
        label: "Cycling Carbs Per Hour Guide",
        href: "/blog/cycling-carbs-per-hour-fuel-like-a-pro",
      },
      {
        label: "Cycling In-Ride Nutrition Guide",
        href: "/blog/cycling-in-ride-nutrition-guide",
      },
      {
        label: "Fuelling Calculator",
        href: "/tools/fuelling",
      },
      {
        label: "How do I fuel a sportive?",
        href: "/question/how-to-fuel-a-sportive",
      },
      {
        label: "What should I eat before a long ride?",
        href: "/question/what-to-eat-before-long-ride",
      },
    ],
  },
  {
    slug: "what-to-eat-before-long-ride",
    cluster: "nutrition",
    question: "What Should I Eat Before a Long Ride?",
    seoTitle: "What Should I Eat Before a Long Ride?",
    seoDescription:
      "Pre-ride nutrition for long cycling rides. Timing, carb amounts, fat and protein, and why what you eat the night before matters as much as breakfast.",
    pillar: "nutrition",
    shortAnswer:
      "For a long ride (3+ hours), eat 2-3g of carbs per kg of bodyweight 2-3 hours before the start — typically a substantial carb-led breakfast. Add a smaller top-up 30-60 minutes before. Keep fat and fibre low to avoid GI distress. The night before matters too: a normal carb-based dinner, no 'carb-loading' tricks needed.",
    bestFor:
      "Cyclists riding 3+ hours, sportive participants, and anyone whose long rides end with bonking or stomach problems.",
    notFor:
      "Riders doing fasted morning rides under 90 minutes — the rules are different and easier.",
    keyTakeaway:
      "Pre-ride fuel decides whether you start your long ride at 100% or already in deficit — it's the cheapest performance gain in cycling.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The pre-ride question gets answered in two parts: what you eat the day before, and what you eat the morning of. The night before, you don't need anything elaborate — a normal carb-led dinner (rice, pasta, potato with protein and veg) is enough for a ride up to about 4 hours. Above that, slightly increase carb intake the day before, but the dramatic 'carb-loading' protocols you read about apply mostly to marathons and full-distance triathlons, not most sportives.",
      "The morning of is where most amateurs underdo it. The current evidence-based target is 2-3g of carbs per kg of bodyweight, eaten 2-3 hours before the start. For a 70kg rider, that's 140-210g of carbs — a substantial breakfast. Porridge with banana, honey, and a scoop of protein hits about 90g; add toast with jam and a piece of fruit and you're at the right number. Coffee is fine and helpful. Fat and fibre should both stay low to avoid GI distress.",
      "30-60 minutes before the start, take a smaller top-up — 20-40g of fast-acting carbs. A gel, a banana, a small bowl of cereal. This sits on top of the earlier breakfast, primes blood sugar, and means you start the ride with full glycogen and no insulin crash. Dr David Dunne and the Roadman race-day nutrition guide both walk through this two-meal protocol in detail.",
      "What to avoid: anything new on ride day. Anything high-fat or high-fibre within 4 hours of the start. Sweetened coffees with cream. Large amounts of dairy if your gut isn't used to it. The pre-ride meal is not a tasting menu — it's a fuelling intervention. Pick a breakfast that's worked in training and use it. Race day is the wrong time to discover that overnight oats with chia don't agree with you.",
    ],
    evidence: [
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne has detailed pre-race fuelling protocols used at the World Tour level, including the two-meal pre-ride structure.",
        href: "/guests/dr-david-dunne",
      },
      {
        label: "Roadman — Cycling Nutrition Race-Day Guide",
        detail:
          "Hour-by-hour breakdown of pre-ride and race-day fuelling, with sample meals and timings.",
        href: "/blog/cycling-nutrition-race-day-guide",
      },
      {
        label: "Roadman — Fasted vs Fuelled Cycling",
        detail:
          "When fasted training has a place, when it doesn't, and why most long rides should always be fuelled in advance.",
        href: "/blog/fasted-vs-fueled-cycling",
      },
    ],
    faq: [
      {
        question: "Should I eat 2 hours or 3 hours before a ride?",
        answer:
          "2-3 hours is the safe window for a substantial meal. If you have to start earlier — early sportive, time-trial — drop to a smaller meal (1-1.5g/kg of carbs) 90 minutes out, then top up with 30-40g of fast carbs in the final hour. That avoids GI distress while still getting fuel on board.",
      },
      {
        question: "Can I just have coffee and a gel before a long ride?",
        answer:
          "For up to 90 minutes, that can work for a gut-trained rider. For anything longer, no — you'll start the ride already in glycogen deficit and pay for it after 90 minutes. A real breakfast 2-3 hours out is the difference between finishing strong and bonking on the back third.",
      },
      {
        question: "Does fasting before a ride improve fat-burning?",
        answer:
          "Short-term yes, performance-wise no. Fasted easy rides under 90 minutes can be a useful base-training stimulus, but for any ride where performance matters, the research is unanimous — fuel the work. Bonking from fasted long rides costs days of recovery for marginal metabolic benefit.",
      },
    ],
    related: [
      {
        label: "Cycling Nutrition Race-Day Guide",
        href: "/blog/cycling-nutrition-race-day-guide",
      },
      {
        label: "Fasted vs Fuelled Cycling",
        href: "/blog/fasted-vs-fueled-cycling",
      },
      {
        label: "How many carbs per hour for cycling?",
        href: "/question/carbs-per-hour-cycling",
      },
      {
        label: "Fuelling Calculator",
        href: "/tools/fuelling",
      },
      {
        label: "Cycling Nutrition Topic Hub",
        href: "/topics/cycling-nutrition",
      },
    ],
  },
  {
    slug: "how-to-fuel-a-sportive",
    cluster: "nutrition",
    question: "How Do I Fuel a Sportive?",
    seoTitle: "How Do I Fuel a Sportive?",
    seoDescription:
      "Sportive fuelling protocol — pre-ride, in-ride, and post-ride. The exact carb, fluid, and sodium targets that finish strong rather than bonking on the back third.",
    pillar: "nutrition",
    shortAnswer:
      "Eat 2-3g/kg of carbs 2-3 hours before the start. Take 30-40g of carbs 30-60 minutes pre-start. Then 60-90g of carbs every hour from minute 30 onwards, with 500-750ml of fluid per hour and 500-1000mg of sodium for warm conditions. Most amateurs eat half what they need and bonk because of it.",
    bestFor:
      "Riders training for or doing a 100km+ sportive who want a defensible, evidence-based fuelling plan.",
    notFor:
      "Pure recreational charity rides where you'll stop at every food station — different problem, different rules.",
    keyTakeaway:
      "The riders who finish sportives strong eat from minute 30, not from when they feel hungry.",
    evidenceLevel: "strong",
    fullExplanation: [
      "Sportive fuelling is one of the highest-leverage things an amateur cyclist can fix — and one of the most consistently under-done. Anthony has interviewed dozens of riders whose sportive performance shifted 15-25% in pace not because their FTP changed, but because they finally fuelled properly. The protocol below isn't extreme; it's the new amateur baseline.",
      "Pre-ride: eat 2-3g of carbs per kg of bodyweight 2-3 hours before the start. For a 75kg rider, that's a 150-225g breakfast — porridge with banana and honey, plus toast and jam, plus a coffee. 30-60 minutes before the start, top up with 30-40g of fast carbs (a gel, a banana, a small flapjack). You're aiming to roll out with full glycogen and stable blood sugar.",
      "In-ride: from minute 30, take 60-90g of carbs per hour — and this is where amateurs most consistently fall short. The rule is set a 25-30 minute timer on your head unit and eat or drink something every alarm. Mix sources: a bottle of carb drink (60g per bottle), gels (25g each), real food (rice cakes, Pop-Tarts, fig rolls). Aim for 500-750ml of fluid per hour. In hot conditions or long events, add 500-1000mg of sodium per hour — heavy sweaters at the upper end.",
      "Post-ride matters too, especially if you're stacking efforts. Within 30-60 minutes of finishing, take 1-1.2g/kg of carbs plus 25-40g of protein. That accelerates glycogen replacement and starts muscle repair. The Roadman Fuelling Calculator gives the exact numbers for your weight, ride duration, and conditions. The Sportive Preparation guide adds the pacing context — fuelling and pacing are inseparable on long rides.",
    ],
    evidence: [
      {
        label: "Roadman Fuelling Calculator",
        detail:
          "Free tool for calculating carb, fluid, and sodium needs by ride duration, intensity, weight, and conditions.",
        href: "/tools/fuelling",
      },
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne has discussed the modern World Tour fuelling protocols (90-120g/hr) and how they translate for amateur sportive prep.",
        href: "/guests/dr-david-dunne",
      },
      {
        label: "Roadman — Sportive Preparation Guide",
        detail:
          "Full sportive prep guide including pacing, fuelling, and the most common sportive-day mistakes.",
        href: "/blog/cycling-sportive-preparation",
      },
      {
        label: "Roadman — Race-Day Nutrition",
        detail:
          "Hour-by-hour fuelling and hydration plan for race day, with food and product specifics.",
        href: "/blog/cycling-nutrition-race-day-guide",
      },
    ],
    faq: [
      {
        question: "Can I rely on the food stations at sportives?",
        answer:
          "No, never. Food stations are unreliable, queues waste time, and the food on offer is rarely what you trained on. Carry your own primary fuel and treat anything at the food stations as a bonus. Hitting your hourly target with food you've already gut-tested is non-negotiable.",
      },
      {
        question: "What if I don't feel like eating at the start?",
        answer:
          "Eat anyway. By the time you 'feel hungry' in a long ride, glycogen is already low and you're playing catch-up. The 30-minute timer rule exists precisely because hunger is a lagging indicator. Set the alarm and eat to it, even if the first few feel forced.",
      },
      {
        question: "How much fluid for a hot sportive?",
        answer:
          "Heavy sweaters in heat over 28°C may need 750-1000ml/hour with 700-1000mg of sodium per hour. The simple way to estimate is to weigh yourself before and after a 90-minute ride at sportive pace — every kilogram lost is roughly a litre of fluid you didn't replace. Adjust accordingly.",
      },
    ],
    related: [
      {
        label: "Sportive Preparation Guide",
        href: "/blog/cycling-sportive-preparation",
      },
      {
        label: "Cycling In-Ride Nutrition Guide",
        href: "/blog/cycling-in-ride-nutrition-guide",
      },
      {
        label: "How many carbs per hour for cycling?",
        href: "/question/carbs-per-hour-cycling",
      },
      {
        label: "Wicklow 200 Training Plan",
        href: "/plan/wicklow-200",
      },
      {
        label: "Etape du Tour Training Plan",
        href: "/plan/etape-du-tour",
      },
      {
        label: "Fuelling Calculator",
        href: "/tools/fuelling",
      },
    ],
  },
  {
    slug: "how-much-protein-cyclists-need",
    cluster: "nutrition",
    question: "How Much Protein Do Cyclists Need?",
    seoTitle: "How Much Protein Do Cyclists Need?",
    seoDescription:
      "Protein for cyclists — daily targets, per-meal distribution, masters-specific needs, and why most amateurs underestimate by 30-40%.",
    pillar: "nutrition",
    shortAnswer:
      "Endurance cyclists should target 1.6-2.2g of protein per kg of bodyweight per day — significantly more than the standard 0.8g/kg recommendation. For masters cyclists, sit at the upper end. Spread it across 4-5 meals at 25-40g per serving. Most amateur cyclists eat 30-40% less protein than they need.",
    bestFor:
      "Endurance cyclists who train hard and want to preserve muscle mass during high-volume blocks or weight loss.",
    notFor:
      "Recreational riders doing 3-4 hours a week with no body-composition or performance goal — the standard 0.8g/kg is fine.",
    keyTakeaway:
      "Under-protein training is one of the most common, least-discussed limiters of amateur cycling progress.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The standard 0.8g/kg per day RDA was set for sedentary adults. It is not the right number for trained endurance cyclists. Current sports-nutrition consensus puts the target for cyclists at 1.6-2.2g/kg of bodyweight per day — roughly double the RDA. For a 75kg cyclist, that's 120-165g per day, ideally spread across 4-5 meals at 25-40g each.",
      "Why so much more? Endurance training breaks down muscle protein at higher rates than sedentary life — particularly during long rides and during periods of energy deficit (which most amateur cyclists are in more often than they realise). Without enough dietary protein, the body cannibalises muscle tissue to repair the damage, which slowly erodes both performance and metabolic health.",
      "Distribution matters as much as total. Eating 150g of protein in two meals doesn't have the same effect as 30g in five meals — muscle protein synthesis is maximised at around 0.4g/kg per meal, after which the additional protein contributes less to recovery. Practically: aim for 25-40g per meal, with the post-ride meal containing the largest dose.",
      "Two specific cases. Masters cyclists: target the upper end (1.8-2.2g/kg) because of 'anabolic resistance' — older muscle responds more slowly to protein, so more is needed to drive the same response. Cyclists in a calorie deficit (race-weight prep): protein needs go up further, not down — typically 2.0-2.4g/kg — to preserve muscle while losing fat. The Roadman protein guide breaks both cases down with specific food examples.",
    ],
    evidence: [
      {
        label: "Roadman — Cycling Protein Requirements",
        detail:
          "Detailed guide covering daily targets, per-meal distribution, masters-specific needs, and food sources.",
        href: "/blog/cycling-protein-requirements",
      },
      {
        label: "Roadman — Protein Timing Guide",
        detail:
          "When to eat protein around training, how to distribute across the day, and the post-ride window question.",
        href: "/blog/cycling-protein-timing-guide",
      },
      {
        label: "International Olympic Committee Consensus on Sports Nutrition",
        detail:
          "The IOC consensus statement places protein needs for endurance athletes in the 1.6-2.0g/kg range — corroborated by virtually every major sports nutrition body.",
      },
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne has discussed protein adequacy as one of the most under-recognised performance issues he sees in amateur cyclists.",
        href: "/guests/dr-david-dunne",
      },
    ],
    faq: [
      {
        question: "Can I get enough protein from a normal diet?",
        answer:
          "Yes, but only if you're deliberate about it. Hitting 30-40g of protein per meal four to five times a day requires structured eating — chicken breast, Greek yoghurt, cottage cheese, fish, eggs, lean red meat. Most amateurs who undershoot do so because they eat carb-led meals with token protein on the side.",
      },
      {
        question: "Is too much protein bad for cyclists?",
        answer:
          "Up to 2.5g/kg there's no credible evidence of harm in healthy adults. Concerns about kidney stress have been studied repeatedly and don't hold for people without pre-existing kidney disease. The practical issue is that very high protein intake displaces carbs — and carbs are what fuel cycling.",
      },
      {
        question: "Should I take protein powder?",
        answer:
          "Not as a default — most cyclists hit their protein needs from real food. Where powder helps: post-ride convenience (a 30-40g shake is faster to prepare and absorb than a meal) and masters cyclists who struggle to hit higher per-meal targets. Whey is the most evidence-supported option.",
      },
    ],
    related: [
      {
        label: "Cycling Protein Requirements",
        href: "/blog/cycling-protein-requirements",
      },
      {
        label: "Protein Timing Guide",
        href: "/blog/cycling-protein-timing-guide",
      },
      {
        label: "How should cyclists over 50 recover?",
        href: "/question/recovery-for-cyclists-over-50",
      },
      {
        label: "Cycling Body Composition Guide",
        href: "/blog/cycling-body-composition-guide",
      },
      {
        label: "Cycling Nutrition Topic Hub",
        href: "/topics/cycling-nutrition",
      },
    ],
  },

  // ============================================================
  // COACHING CLUSTER
  // ============================================================
  {
    slug: "is-cycling-coach-worth-it",
    cluster: "coaching",
    question: "Is a Cycling Coach Worth It?",
    seoTitle: "Is a Cycling Coach Worth It?",
    seoDescription:
      "When a cycling coach is worth it, when it isn't, and how to tell which side of the line you're on. Honest answer from a coach who interviews other coaches.",
    pillar: "coaching",
    shortAnswer:
      "A cycling coach is worth it when you've stopped progressing on apps or self-coaching, when you have a specific event you can't afford to under-prepare for, or when you don't trust your own programme decisions. It's not worth it if you're early in cycling, your biggest issue is consistency, or you're not ready to act on feedback.",
    bestFor:
      "Plateaued amateurs, masters cyclists, and event-focused riders who know what they want but can't get there alone.",
    notFor:
      "First-year cyclists who haven't yet figured out what consistent training looks like — apps and habit-building come first.",
    keyTakeaway:
      "A coach is worth it when the cost of staying stuck exceeds the cost of getting unstuck.",
    evidenceLevel: "strong",
    fullExplanation: [
      "Anthony coaches cyclists for a living and runs a podcast that has interviewed dozens of other coaches — so the honest answer is laid out from inside the industry, not from a marketing brochure. The short version: coaching is genuinely worth it for some riders and clearly not worth it for others, and most of the regret comes from people on the wrong side of that line.",
      "It is worth it for three rider profiles. First, plateaued amateurs — riders who've used apps or self-coached for a year or more and can't move their FTP. Most of the time the issue isn't motivation or effort; it's that they can't see what they're doing wrong from the inside. A coach diagnoses in two weeks what takes a year of trial and error to figure out alone. Second, masters cyclists — the recovery, strength, and fuelling adjustments needed after 40 are easy to get wrong and expensive to recover from. Third, event-focused riders with a specific target — an Étape, an Ironman, a season goal — where under-preparation isn't recoverable.",
      "It is not worth it for three other profiles. New cyclists who haven't yet figured out what consistent training looks like — habits and structure come first, coaching adds little until then. Riders whose biggest issue is staying on the bike at all — coaching can't fix a motivation problem from the outside. And riders who aren't ready to act on feedback — if you'll only do the parts of the plan that don't conflict with your existing habits, you'll waste the coach's time and your money.",
      "The Roadman case study article covers a Cat 3 to Cat 1 progression in 14 months under coaching — the kind of result that's typical for the right rider profile and unusual for self-coaching. The reverse is also true: there are riders Anthony has turned away because coaching wasn't right for them yet. The honest framing: a coach is worth it when the cost of staying stuck exceeds the cost of getting unstuck.",
    ],
    evidence: [
      {
        label: "Roadman — Is a Cycling Coach Worth It?",
        detail:
          "Long-form article covering the rider profiles where coaching pays off and the profiles where it doesn't.",
        href: "/blog/is-a-cycling-coach-worth-it",
      },
      {
        label: "Roadman — Is a Cycling Coach Worth It Case Study",
        detail:
          "Documented Cat 3 to Cat 1 progression in 14 months under coaching, with the underlying training and nutrition decisions.",
        href: "/blog/is-a-cycling-coach-worth-it-case-study",
      },
      {
        label: "Roadman — Coaching Results Before and After",
        detail:
          "Multiple coaching outcomes documented — power, weight, race results — across the Roadman programme.",
        href: "/blog/cycling-coaching-results-before-and-after",
      },
    ],
    faq: [
      {
        question: "How long before coaching pays off?",
        answer:
          "Most coached athletes see structural changes (improved consistency, fixed zones, better fuelling) within 4-6 weeks and meaningful FTP gains in the first 8-12 weeks. If a coach hasn't moved your training quality measurably in 6 weeks, the issue is fit — find a different coach, not a different approach.",
      },
      {
        question: "Is online coaching as good as in-person?",
        answer:
          "For most amateur cyclists, yes — and frequently better, because online coaches have access to a global pool of expertise. The Roadman article on cycling coaches near you covers why location matters less than fit, communication style, and methodology alignment.",
      },
      {
        question: "Can a coach replace a power meter or training app?",
        answer:
          "No, and a coach won't ask you to. Most coaches now expect you to have a power meter and use a platform like TrainingPeaks. The coach's value is in interpretation, periodisation, and accountability — not in replacing the tools that produce the data they read.",
      },
    ],
    related: [
      {
        label: "Is a Cycling Coach Worth It? — Article",
        href: "/blog/is-a-cycling-coach-worth-it",
      },
      {
        label: "Cycling Coach Worth It — Case Study",
        href: "/blog/is-a-cycling-coach-worth-it-case-study",
      },
      {
        label: "How much does cycling coaching cost?",
        href: "/question/how-much-cycling-coaching-costs",
      },
      {
        label: "When should I hire a cycling coach?",
        href: "/question/when-to-hire-cycling-coach",
      },
      {
        label: "Cycling Coach vs Training App",
        href: "/compare/coach-vs-app",
      },
    ],
    cta: {
      eyebrow: "READY TO STOP GUESSING?",
      heading: "See if Roadman coaching is the right fit.",
      body: "7-day free trial — no commitment. We'll tell you honestly if coaching isn't right for you yet.",
      label: "Apply for Coaching",
      href: "/apply",
    },
  },
  {
    slug: "how-much-cycling-coaching-costs",
    cluster: "coaching",
    question: "How Much Does Online Cycling Coaching Cost?",
    seoTitle: "How Much Does Online Cycling Coaching Cost?",
    seoDescription:
      "Online cycling coaching costs in 2026 — entry-level, mid-tier, and premium. What you actually get at each price point and why the cheapest option usually isn't.",
    pillar: "coaching",
    shortAnswer:
      "Online cycling coaching ranges from $80-$120/month at the entry level to $400-$700/month for premium 1:1. The bulk of the credible market sits at $150-$250/month — enough for a real coaching relationship without the elite price tag. The cheapest options are usually shared spreadsheets, not coaching.",
    bestFor:
      "Riders weighing whether the budget is right for them and trying to understand what they actually get at each price point.",
    notFor:
      "Riders looking for a one-off plan purchase — that's a different product (a stock plan), priced differently.",
    keyTakeaway:
      "What you pay for is access and personalisation — the cheapest coach you can find isn't a coach, it's a templated plan with a name on it.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "Online cycling coaching prices break into three tiers, and the value at each tier varies more than the price suggests. Entry-level (typically $80-$120 a month) usually gets you a stock plan with light personalisation, monthly check-ins, and limited access. It's better than self-coaching for some riders but it's closer to a guided app experience than a coaching relationship.",
      "Mid-tier ($150-$250 a month) is where most credible online coaching sits. At this level you should expect: a fully personalised plan rebuilt monthly, weekly check-ins, regular ride-file analysis, integrated nutrition and strength guidance, and proper communication channels. The Roadman programme sits in this bracket. So do most well-known coaches who've built sustainable practices rather than scaling on volume.",
      "Premium 1:1 ($300-$700+ a month) is where you'd expect Anthony-level access — direct messaging, video reviews, immediate feedback on race files, integrated S&C and nutrition specialists. It's the right tier for elite amateurs and high-stakes target events. For most amateur cyclists, mid-tier delivers 80% of the result at 40% of the cost.",
      "What to actually evaluate at any price point: how often does the coach change your plan based on your data? How fast do they respond to questions? Is the strength and nutrition advice integrated or bolted-on? Anthony has interviewed coaches who charge $90 a month and deliver more than coaches who charge $400 — and vice versa. The Roadman article on cycling coach costs and the cost-comparison piece walk through the trade-offs by price band.",
    ],
    evidence: [
      {
        label: "Roadman — How Much Does Online Cycling Coach Cost?",
        detail:
          "Breakdown of online cycling coaching costs by tier, including what's typically included at each price point.",
        href: "/blog/how-much-does-online-cycling-coach-cost-2026",
      },
      {
        label: "Roadman — Best Online Cycling Coach: How to Choose",
        detail:
          "What to evaluate when comparing coaches at any price tier — personalisation, communication, methodology, and fit.",
        href: "/blog/best-online-cycling-coach-how-to-choose",
      },
      {
        label: "Roadman — Cycling Coach vs Training App",
        detail:
          "Cost comparison between full coaching and adaptive training apps, with the rider profiles each suits best.",
        href: "/compare/coach-vs-app",
      },
    ],
    faq: [
      {
        question: "Why is one coach $90 and another $400?",
        answer:
          "Mostly access and personalisation, partly business model. The $90 coach is usually running templated plans at scale with limited check-ins. The $400 coach is offering closer-to-1:1 attention. Sometimes the gap is justified, sometimes it's brand premium — evaluate on what you actually get, not the price tag.",
      },
      {
        question: "Is monthly or annual billing better?",
        answer:
          "Most coaches offer a discount for annual billing — typically 10-20%. If you're sure of fit after a 4-8 week trial, annual makes sense. If you're new to coaching, monthly preserves your option to leave; the discount isn't worth being trapped with the wrong coach.",
      },
      {
        question: "Are there free or trial options?",
        answer:
          "Some coaches offer free trials (Roadman runs a 7-day free trial of the coaching programme). Others offer one-off consultations as a sample. Avoid 'free' offers that lock you into long contracts — the right coach is confident enough in their work to let you leave easily.",
      },
    ],
    related: [
      {
        label: "How Much Does Online Coaching Cost?",
        href: "/blog/how-much-does-online-cycling-coach-cost-2026",
      },
      {
        label: "Best Online Cycling Coach Guide",
        href: "/blog/best-online-cycling-coach-how-to-choose",
      },
      {
        label: "Coach vs Training App",
        href: "/compare/coach-vs-app",
      },
      {
        label: "What does a cycling coach actually do?",
        href: "/question/what-does-cycling-coach-do",
      },
      {
        label: "Is a cycling coach worth it?",
        href: "/question/is-cycling-coach-worth-it",
      },
    ],
    cta: {
      eyebrow: "WANT TO SEE THE NUMBERS?",
      heading: "Roadman coaching — 7-day free trial.",
      body: "Mid-tier pricing, premium-tier methodology. Try it for a week before committing.",
      label: "Apply for Coaching",
      href: "/apply",
    },
  },
  {
    slug: "what-does-cycling-coach-do",
    cluster: "coaching",
    question: "What Does a Cycling Coach Actually Do?",
    seoTitle: "What Does a Cycling Coach Actually Do?",
    seoDescription:
      "What an online cycling coach actually does week-to-week — plan design, ride-file analysis, periodisation, nutrition, accountability — and what they don't do.",
    pillar: "coaching",
    shortAnswer:
      "A cycling coach designs and adapts your training, reviews your ride files, periodises around your events, integrates your strength and nutrition, and holds you accountable. The job is mostly interpretation — looking at your data, your life, and your goal, and deciding what to change next. It's not handing you a plan and disappearing.",
    bestFor:
      "Riders evaluating coaching and wanting to understand what they're actually paying for week-to-week.",
    notFor:
      "Riders who want someone to do the riding for them — a coach changes the plan, not the work.",
    keyTakeaway:
      "A coach's value is in interpretation and adaptation, not in giving you a generic plan you could buy for $20.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "A real cycling coach does five things, week-to-week, that most riders underestimate when they're considering whether coaching is worth it.",
      "First, they design a personalised plan — not a stock plan with your name on it. That means looking at your power profile, your event calendar, your available hours, your strength baseline, your sleep and stress, and your training history, then writing a plan that actually fits your life. Most amateur cyclists fail on plans they couldn't realistically execute; a good coach catches that at the start.",
      "Second, they review your ride files. This is the bit most amateur cyclists most underestimate. Looking at a TrainingPeaks file and seeing what actually happened in a session — power decay, HR drift, cadence patterns, whether the warm-up worked — is where most coaching adjustments come from. A coach who isn't reading your files isn't coaching you.",
      "Third, they periodise around your events. Most amateur cyclists either have no periodisation or are running last year's plan because it 'kind of worked'. A coach builds the year backward from the event calendar — base, build, peak, taper — and adjusts when life intervenes. Fourth, they integrate strength and nutrition into the plan rather than treating them as separate. Fifth, they provide the accountability that consistency depends on. The Roadman What does a cycling coach do article goes deeper, but those five categories are the bulk of the work.",
    ],
    evidence: [
      {
        label: "Roadman — Cycling Coaching for Beginners (When Ready)",
        detail:
          "Practical breakdown of what a coach actually does week-to-week and the rider profiles that benefit most.",
        href: "/blog/cycling-coaching-for-beginners-when-ready",
      },
      {
        label: "Roadman — Coaching Results Before and After",
        detail:
          "Documented coaching outcomes across the Roadman programme — power, body composition, race results.",
        href: "/blog/cycling-coaching-results-before-and-after",
      },
      {
        label: "Roadman — Best Online Cycling Coach: How to Choose",
        detail:
          "What good coaches do that average ones don't — communication, file analysis, integrated S&C and nutrition.",
        href: "/blog/best-online-cycling-coach-how-to-choose",
      },
    ],
    faq: [
      {
        question: "Does a coach write my plan or use a template?",
        answer:
          "Good coaches write your plan. Templated coaches charge less because they're scaling — they hand out the same plan with surface tweaks. Both can work for some riders, but only the first is genuinely 'coaching'. Ask explicitly during the sales call: 'Do you write each athlete's plan?'",
      },
      {
        question: "How often does a coach change my plan?",
        answer:
          "Most credible coaches review and adjust weekly. Monthly check-ins with no in-between adjustments aren't coaching — that's a stock plan with monthly tweaks. Roadman coaching reviews each athlete's data weekly and adjusts at any point if the data warrants it.",
      },
      {
        question: "Will a coach tell me when I'm doing too much?",
        answer:
          "A good one absolutely will, and frequently. The most common coaching intervention isn't 'do more' — it's 'do less, but better'. Coaches who only push more volume and intensity are operating from one mode and missing half their job.",
      },
    ],
    related: [
      {
        label: "Best Online Cycling Coach Guide",
        href: "/blog/best-online-cycling-coach-how-to-choose",
      },
      {
        label: "Coaching for Beginners (When Ready)",
        href: "/blog/cycling-coaching-for-beginners-when-ready",
      },
      {
        label: "Coaching Results Before and After",
        href: "/blog/cycling-coaching-results-before-and-after",
      },
      {
        label: "Cycling Coach vs Training App",
        href: "/compare/coach-vs-app",
      },
      {
        label: "Is a cycling coach worth it?",
        href: "/question/is-cycling-coach-worth-it",
      },
    ],
    cta: {
      eyebrow: "READY TO BE COACHED?",
      heading: "Roadman coaching — 7-day free trial.",
      body: "See what a real coaching relationship looks like before committing.",
      label: "Apply for Coaching",
      href: "/apply",
    },
  },
  {
    slug: "when-to-hire-cycling-coach",
    cluster: "coaching",
    question: "When Should I Hire a Cycling Coach?",
    seoTitle: "When Should I Hire a Cycling Coach?",
    seoDescription:
      "When hiring a cycling coach actually pays off — plateau, target event, life transition, or returning from injury. The four signals to act on, plus when to hold off.",
    pillar: "coaching",
    shortAnswer:
      "Hire a cycling coach when one of four things is true: your FTP has plateaued for 3+ months despite consistent training, you have a target event you can't afford to under-prepare for, you're a masters rider whose recovery isn't keeping up, or you're returning from a long break and don't want to redo the trial-and-error rebuild alone.",
    bestFor:
      "Cyclists trying to decide whether the timing is right for them rather than whether coaching itself is right.",
    notFor:
      "Riders whose biggest issue is consistency or motivation — a coach can't substitute for getting on the bike.",
    keyTakeaway:
      "The right time to hire a coach is when the cost of getting it wrong on your own becomes higher than the cost of paying someone to get it right.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "Coaching has four classic 'right time' triggers — most people who hire a coach successfully do so because one of these became unavoidable. Knowing which one applies to you tells you both whether to hire and what to look for in a coach.",
      "Trigger one: the structural plateau. You've trained consistently for over a year, your FTP hasn't moved in three or more months, and you've tried what the internet suggested. This is the most common coaching trigger, and it's the rider profile where coaching most reliably pays back. The diagnosis a good coach makes in 2-3 weeks is what would otherwise take you a year of trial and error.",
      "Trigger two: the target event. You've signed up for an Étape, an Ironman, a stretch sportive, or a serious race, and you can't afford to under-prepare. The cost of arriving at the start line under-fitted, over-trained, or wrongly fuelled is much higher than the cost of 6 months of coaching. Most coached event riders do single-block coaching deals — 12-16 weeks, peak for the event, take stock after.",
      "Triggers three and four: the masters transition and the comeback. After 40, the training that worked at 30 stops working — and most masters riders self-coach for too long before realising the recovery, strength, and fuelling adjustments are non-trivial. After a long break (injury, illness, life), the rebuild is the highest-risk period for re-injury and overtraining. Both are exactly the moments where coaching adds disproportionate value. The Roadman coaching beginners article walks through the readiness signals in detail.",
    ],
    evidence: [
      {
        label: "Roadman — Cycling Coaching for Beginners (When Ready)",
        detail:
          "The signals that suggest you're ready for coaching, and the signals that suggest you're not yet.",
        href: "/blog/cycling-coaching-for-beginners-when-ready",
      },
      {
        label: "Roadman — Plateau Diagnostic",
        detail:
          "Twelve-question diagnostic that identifies the specific plateau profile — and whether coaching is the right intervention.",
        href: "/plateau",
      },
      {
        label: "Roadman — Comeback Cyclist 12-Week Plan",
        detail:
          "Structured comeback plan and the framework most masters / returning cyclists hire a coach to deliver.",
        href: "/blog/comeback-cyclist-12-week-return-plan",
      },
    ],
    faq: [
      {
        question: "How long before an event should I hire a coach?",
        answer:
          "12-16 weeks is the ideal. That covers a full base, build, peak, and taper cycle. Under 8 weeks and coaching becomes damage limitation — still useful, but the coach is working with the fitness you have rather than building new fitness. Under 4 weeks, an event-focused consultation is usually a better-value option than a full coaching block.",
      },
      {
        question: "Should I hire a coach if I'm new to cycling?",
        answer:
          "Usually not yet. The first 6-12 months of cycling are about building consistent habits — getting on the bike regularly, learning your body, finding routes you enjoy. A coach in this phase is mostly an expensive accountability tool. Better to start with a structured app, hit consistent volume for 6-12 months, then evaluate.",
      },
      {
        question: "Do masters cyclists really need a coach more than younger riders?",
        answer:
          "On average, yes. The recovery, strength, and fuelling adjustments needed after 40 are easier to get wrong, harder to recover from, and less well-understood. Masters cyclists also tend to have the most fixed schedules and the most to lose from training time poorly — both of which are exactly what a good coach optimises.",
      },
    ],
    related: [
      {
        label: "Coaching for Beginners (When Ready)",
        href: "/blog/cycling-coaching-for-beginners-when-ready",
      },
      {
        label: "Comeback Cyclist 12-Week Plan",
        href: "/blog/comeback-cyclist-12-week-return-plan",
      },
      {
        label: "Plateau Diagnostic",
        href: "/plateau",
      },
      {
        label: "Is a cycling coach worth it?",
        href: "/question/is-cycling-coach-worth-it",
      },
      {
        label: "What does a cycling coach actually do?",
        href: "/question/what-does-cycling-coach-do",
      },
    ],
    cta: {
      eyebrow: "RIGHT MOMENT?",
      heading: "Find out if now is the right time for coaching.",
      body: "7-day free trial — we'll tell you honestly if it's not the right moment yet.",
      label: "Apply for Coaching",
      href: "/apply",
    },
  },

  // ============================================================
  // EVENT PREP CLUSTER — sportive- and event-specific intent
  // ============================================================
  {
    slug: "how-to-train-for-wicklow-200",
    cluster: "events",
    question: "How Should I Train for the Wicklow 200?",
    seoTitle: "How to Train for the Wicklow 200",
    seoDescription:
      "A 12-16 week training framework for the Wicklow 200 — long-ride progression, threshold work, durability, and the pacing plan that beats Sally Gap and Wicklow Gap without blowing up.",
    pillar: "coaching",
    shortAnswer:
      "Build a 12-16 week structured plan around two pillars: weekly long rides progressing to 6-7 hours, and twice-weekly threshold or sweet-spot intervals. Aim for 3.0+ W/kg sustainable and durability tested over 5+ hours. Treat the route as two 100km halves and train the second one — that's where the Wicklow 200 is won.",
    bestFor:
      "Riders 12-16 weeks out from the Wicklow 200 with a base of 6-8 hours a week.",
    notFor:
      "First-year cyclists with no recent long-ride history — choose the Wicklow 100 first and target the 200 next year.",
    keyTakeaway:
      "The Wicklow 200 is two 100km rides stitched together — the rider who trains the second half wins the day.",
    evidenceLevel: "moderate",
    evidenceNote:
      "Based on the Roadman Wicklow 200 training plan, John Wakefield's interval prescriptions on the podcast, and Stephen Seiler's 80/20 distribution research applied to amateur sportive prep.",
    fullExplanation: [
      "The Wicklow 200 is Ireland's defining mass-participation sportive — 200km across the Wicklow Mountains with around 3,000m of climbing, anchored by Sally Gap and Wicklow Gap. Held in early June, it punishes amateurs in a specific way: the climbs are spread across the day, the early enthusiasm of fresh legs disguises a poor pacing plan, and the back 80km between Glendalough and the finish quietly destroys riders who haven't built durability.",
      "The training framework that consistently delivers a strong finish is a 12-16 week block split into base, build, and specific phases. Weeks 1-4 build aerobic volume — long zone 2 rides progressing from 3 to 5 hours. Weeks 5-10 layer in twice-weekly threshold or sweet-spot intervals (2x20-min at 88-94% FTP, building to 3x20). Weeks 11-14 are the specific phase: 5-7 hour long rides with sweet spot at the back end, climbing repeats to model Sally Gap, and a tested fuelling plan. Weeks 15-16 taper.",
      "On the podcast, John Wakefield (Director of Coaching, Red Bull–Bora–Hansgrohe) has been clear that durability — your power three hours into a ride — is the differentiator on long sportives, not fresh FTP. Stephen Seiler's polarised research backs the same conclusion: ~80% of training time below ventilatory threshold and ~20% well above it consistently outperforms grey-zone-heavy programmes for amateurs. A rider with a 270W FTP and well-trained durability will outride a 290W rider whose power collapses by km 130.",
      "Practical points. Gear for the Wicklow climbs: compact crankset with a 32-tooth cassette is the standard, no shame in 34T. Pace Sally Gap (climb 1) at 5-8 beats below sportive threshold — if you arrive at the 100km feed station feeling 'comfortable', you paced it right. Fuel from minute 30 (60-90g of carbs an hour, climbing toward 90-120g for serious amateurs) and never depend on the food stations. The Roadman Wicklow 200 training plan walks the full 16-week build with the specific intervals and long-ride targets.",
    ],
    evidence: [
      {
        label: "Roadman — Wicklow 200 Training Plan",
        detail:
          "Full 16-week training plan tuned to the Wicklow 200's profile, including climb-specific durability work and a tested pacing template.",
        href: "/plan/wicklow-200",
      },
      {
        label: "Roadman — Wicklow 200 Training Plan (long-form guide)",
        detail:
          "Long-form companion to the structured plan — gear choice, pacing Sally Gap, and the most common Wicklow 200 mistakes.",
        href: "/blog/wicklow-200-training-plan",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield has discussed durability training and the back-end sweet-spot work that separates amateurs who finish strong from those who hang on.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Stephen Seiler — polarised training research",
        detail:
          "Seiler's 80/20 intensity distribution is the framework underneath every serious amateur sportive plan, including this one.",
        href: "/guests/stephen-seiler",
      },
    ],
    faq: [
      {
        question: "How long do I need to train for the Wicklow 200?",
        answer:
          "12-16 weeks of structured training is the standard if you have a 6-8 hour base. If you're coming off a sedentary winter, extend to 18-20 weeks and dedicate the first 4 to aerobic base before any threshold work begins.",
      },
      {
        question: "What gearing do I need for the Wicklow Mountains?",
        answer:
          "A compact crankset (50/34) with an 11-32 cassette is the practical standard for amateurs. If your FTP is below 3.0 W/kg or you're carrying extra weight, an 11-34 cassette buys you a smaller gear on Sally Gap and Wicklow Gap and saves matches for the back half.",
      },
      {
        question: "Should I do the Wicklow 100 as a stepping stone?",
        answer:
          "Yes, if 200km is your first time at this distance. The 100 covers the same opening terrain at the same field density — a near-perfect rehearsal for pacing, fuelling, and route familiarity. Doing the 100 in year one and the 200 in year two is the safest progression.",
      },
    ],
    related: [
      {
        label: "Wicklow 200 Training Plan",
        href: "/plan/wicklow-200",
      },
      {
        label: "Wicklow 200 Training Plan — Long-Form Guide",
        href: "/blog/wicklow-200-training-plan",
      },
      {
        label: "What FTP do I need for a sportive?",
        href: "/question/what-ftp-for-sportive",
      },
      {
        label: "How do I fuel a sportive?",
        href: "/question/how-to-fuel-a-sportive",
      },
      {
        label: "How many weeks to train for a sportive?",
        href: "/question/how-many-weeks-to-train-for-sportive",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
    ],
  },
  {
    slug: "how-to-pace-mallorca-312",
    cluster: "events",
    question: "How Do I Pace the Mallorca 312?",
    seoTitle: "How to Pace the Mallorca 312",
    seoDescription:
      "A pacing plan for the Mallorca 312 — when to climb conservatively, when to draft, when to eat, and why Sa Calobra at km 80 is the trap that decides your day.",
    pillar: "coaching",
    shortAnswer:
      "Sit at 60-65% of FTP through the climbing section and never cross 75% on Sa Calobra. From km 130 onwards it's flat-to-rolling — ride tempo in groups, draft hard, fuel relentlessly. Most riders blow up because they overcook the first 100km of climbing, not because of the closing flats.",
    bestFor:
      "Riders entered for the 312km route who have completed a 200km event and want a defensible pacing plan.",
    notFor:
      "First-time long-distance riders — choose the 167km or 225km route and use the 312 as next year's target.",
    keyTakeaway:
      "Sa Calobra is the trap — the rider who climbs it slowest finishes the strongest.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "The Mallorca 312 is a 312km mass-start sportive in late April with around 5,000m of climbing. The defining feature isn't the distance — it's the front-loaded profile. The first 130km contains every serious climb, including Sa Calobra (9.5km at 7%) at km 80. The closing 180km is flat-to-rolling and pack-dominated. Riders who treat the climbs as 'the hard part' and the flats as 'the recovery' have it backwards.",
      "Climbing pacing. Target 60-65% of FTP for the opening climbing block. Sa Calobra at km 80 is where every ego mistake gets paid for. Cap power at 75% of FTP on Sa Calobra — if your FTP is 280W, that's 210W on the bottom slopes climbing to no more than 220W on the steeper middle section. The temptation to ride it 'at sportive pace' is the single biggest reason 312 riders blow up between km 150 and km 220.",
      "The flat closing 180km is a different sport. Once you crest the final categorised climb, switch to tempo (76-87% FTP) inside groups, draft economy becomes the single biggest determinant of finishing time. A 4-rider rotating paceline at sportive tempo can save 40-60W per rider — that's the difference between a 12-hour and a 14-hour finish. Stay calm in the wind, take short turns, eat on every flat stretch.",
      "Fuelling on a 12-hour event. Dr David Dunne's discussions of modern World Tour fuelling on the Roadman Cycling Podcast point to 90-120g of carbs per hour as the new amateur baseline for ultra-distance events, with 700-900ml of fluid and 700-1000mg of sodium each hour in Mallorca's late-April heat. That's roughly 1100-1400g of carbs across the day — most amateurs eat half that and bonk somewhere in the closing 80km. Use the fuelling calculator and gut-train every long ride beforehand.",
    ],
    evidence: [
      {
        label: "Roadman — Mallorca 312 Training Plan",
        detail:
          "Full 16-week training plan with pacing windows for each section of the 312 route, including Sa Calobra targets.",
        href: "/plan/mallorca-312",
      },
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne has discussed the modern 90-120g/hr fuelling approach used by the World Tour and how it applies to amateur ultra-distance prep.",
        href: "/guests/dr-david-dunne",
      },
      {
        label: "Dan Lorang — Roadman Podcast",
        detail:
          "Lorang has detailed how durability training and pacing discipline matter more than fresh FTP for events over 8 hours.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman — Sportive Preparation Guide",
        detail:
          "Internal guide covering pacing, fuelling, and the most common sportive-day mistakes.",
        href: "/blog/cycling-sportive-preparation",
      },
    ],
    faq: [
      {
        question: "What is a realistic finishing time for the 312?",
        answer:
          "11-13 hours for a strong amateur (3.5+ W/kg, well-paced, well-fuelled). 13-16 hours for a survival-mode finish. Sub-10 hours puts you near the front of the field — that's a 4.0+ W/kg ride paced ruthlessly with strong group skills.",
      },
      {
        question: "What FTP do I need for the Mallorca 312?",
        answer:
          "3.2 W/kg is the practical floor for a comfortable finish, 3.5 W/kg lifts you into a strong ride, and 4.0 W/kg puts you in the front quarter of the field. Below 3.0 W/kg the closing 100km becomes a battle of attrition that pacing alone cannot fix.",
      },
      {
        question: "How many carbs per hour do I need for 12 hours on the bike?",
        answer:
          "90-120g per hour from minute 30 onwards, summing to roughly 1100-1400g across the day. Use multiple sources — bottles of carb mix (60g each), gels (25g), real food (rice cakes, fig rolls) — and gut-train the upper end on long training rides before the event, never on race day.",
      },
    ],
    related: [
      {
        label: "Mallorca 312 Training Plan",
        href: "/plan/mallorca-312",
      },
      {
        label: "How do I fuel a 200km sportive?",
        href: "/question/how-to-fuel-200km-sportive",
      },
      {
        label: "What FTP do I need for a sportive?",
        href: "/question/what-ftp-for-sportive",
      },
      {
        label: "How many weeks to train for a sportive?",
        href: "/question/how-many-weeks-to-train-for-sportive",
      },
      {
        label: "Fuelling Calculator",
        href: "/tools/fuelling",
      },
    ],
  },
  {
    slug: "how-many-weeks-to-train-for-sportive",
    cluster: "events",
    question: "How Many Weeks Do I Need to Train for a Sportive?",
    seoTitle: "How Many Weeks Do I Need to Train for a Sportive?",
    seoDescription:
      "Realistic training timelines for amateur cyclists targeting a sportive — 12-16 weeks for a flat 100-160km event, 16-20 for a mountain sportive, and what to do if you're already inside 8 weeks.",
    pillar: "coaching",
    shortAnswer:
      "For a flat-to-rolling 100-160km sportive, 12-16 weeks of structured training is the standard. For a serious mountain sportive — Étape, Mallorca 312, Marmotte — extend to 16-20 weeks. Anything inside 8 weeks is damage control rather than preparation; the build phase needs at least 4-6 weeks once base is in place.",
    bestFor:
      "Riders planning their event calendar and deciding when to start a structured block.",
    notFor:
      "Riders inside 6 weeks of an event — pivot to taper and pacing rather than chasing more fitness.",
    keyTakeaway:
      "12 weeks is the floor — the harder the event, the further out you start.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "The standard amateur sportive build is 12-16 weeks split across four phases. 4 weeks of base (long zone 2 rides, low intensity, building aerobic capacity), 4-6 weeks of build (twice-weekly sweet spot or threshold intervals layered over the long ride), 2-3 weeks of specific work (race-pace simulations, climbing repeats, tested fuelling) and a 1-2 week taper. This isn't novel — it's Joe Friel's framework from The Cyclist's Training Bible and the structure underneath every Roadman event plan.",
      "Mountain sportives need a longer runway. The Étape du Tour, Marmotte, Mallorca 312, Maratona dles Dolomites — these events have climbing demands that don't compress into 12 weeks for most amateurs. A 16-20 week build gives you the durability work (4-5 hour zone 2 rides, climbing-specific sweet spot at the back end of long rides) that decides whether you finish strong or hang on. The harder the event, the further out you start.",
      "What to do inside the under-8-week window. This is damage control rather than build. Stop adding intensity — the adaptation window has closed and any new threshold work just adds fatigue. Instead, ride consistent moderate volume (3-5 rides per week, mostly zone 2 with one weekly tempo session), peak your fuelling protocol so race day isn't the day you test 90g/hr, and rehearse pacing on a long training ride at goal sportive tempo. You won't gain meaningful fitness in 6 weeks, but you can absolutely lose a sportive in those weeks by overcooking it.",
      "The aerobic base point most amateurs underestimate. A structured 12-week block delivers full gains only if you arrive with a base — meaning 8-12 weeks of consistent zone 2 volume already in your legs. Riders who jump from 4 hours a week into a structured threshold block typically plateau by week 6 because the aerobic engine isn't ready to support the work. If you're starting cold, treat the first 4-8 weeks as base-only and add 4 more weeks to the calendar.",
    ],
    evidence: [
      {
        label: "Joe Friel — The Cyclist's Training Bible",
        detail:
          "Friel's 12-16 week sportive periodisation framework is the structural reference for the standard amateur build.",
        href: "/guests/joe-friel",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield has discussed phase length, taper duration, and the cost of compressing a build phase below 4 weeks.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Roadman — Training Plans Index",
        detail:
          "Roadman's event-specific training plans, all built on a 12-20 week periodised structure.",
        href: "/plan",
      },
      {
        label: "Roadman — Sportive Preparation Guide",
        detail:
          "End-to-end sportive preparation guide covering periodisation, durability, fuelling, and pacing.",
        href: "/blog/cycling-sportive-preparation",
      },
    ],
    faq: [
      {
        question: "Can I train for a sportive in 8 weeks?",
        answer:
          "For a 100km flat sportive, yes if you have a base of 6+ hours a week. For a mountain sportive (Étape, Marmotte, Mallorca 312), 8 weeks is too short — you'll finish, but the back third will be a grind and the durability gap will be obvious. Push the event a year if you can.",
      },
      {
        question: "Do I need a coach for a 12-week block?",
        answer:
          "Not strictly — Roadman's free event plans walk through the structure week by week. But a coach materially improves the quality of each phase: they catch overtraining early, adjust intervals to your real (not predicted) recovery, and stop the two most common amateur mistakes — too much grey-zone work and too little aerobic base.",
      },
      {
        question: "How long should the taper be?",
        answer:
          "7-14 days for most sportives. The harder and longer the event, the longer the taper. A flat 100km sportive needs 5-7 days; a mountain sportive like the Étape benefits from a full 10-14 days. The principle is the same: drop volume by 40-60%, keep intensity sharp with short race-pace efforts, sleep more.",
      },
    ],
    related: [
      {
        label: "Training Plans by Event",
        href: "/plan",
      },
      {
        label: "What FTP do I need for a sportive?",
        href: "/question/what-ftp-for-sportive",
      },
      {
        label: "How do I fuel a sportive?",
        href: "/question/how-to-fuel-a-sportive",
      },
      {
        label: "Sportive Preparation Guide",
        href: "/blog/cycling-sportive-preparation",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
    ],
  },
  {
    slug: "what-ftp-for-etape-du-tour",
    cluster: "events",
    question: "What FTP Do I Need for the Étape du Tour?",
    seoTitle: "What FTP Do I Need for the Étape du Tour?",
    seoDescription:
      "Honest FTP targets for the Étape du Tour — the W/kg you need to finish strong, the floor below which you're surviving, and how long the gap takes to close for an amateur.",
    pillar: "coaching",
    shortAnswer:
      "To finish the Étape du Tour comfortably, you want at least 3.5 W/kg. To ride strongly through the back third, plan for 4.0 W/kg. Below 3.2 W/kg you're surviving rather than racing — the cumulative climbing punishes weak FTPs disproportionately, and the time cuts catch riders consistently below 3.0 W/kg most years.",
    bestFor:
      "Riders weighing whether to enter the Étape, or comparing themselves to last year's finishers.",
    notFor:
      "Riders below 3.0 W/kg with less than a year of structured training — choose a flatter target sportive first and target the Étape next year.",
    keyTakeaway:
      "3.5 W/kg is the floor — below that you're surviving, above 4.0 W/kg you're racing.",
    evidenceLevel: "moderate",
    fullExplanation: [
      "The Étape du Tour is a Tour de France stage on closed roads, ridden by amateurs the day before the pros. Distance varies by edition — typically 130-180km — but the climbing is always the deciding factor: 3,500-5,000m of vertical, often on hors-catégorie cols. The math of cumulative vertical is what destroys amateurs without enough FTP. Two consecutive 1,500m climbs at 3.0 W/kg is a fundamentally different physiological problem than one isolated climb of the same height.",
      "The honest target ranges. Below 3.0 W/kg and the time cuts become a real risk. 3.0-3.2 W/kg gets you across the line in survival mode — heart rate pinned, pacing knife-edge, no margin if anything goes wrong. 3.5 W/kg is the practical floor for a comfortable finish where you can ride the descents safely and the back third doesn't become a grind. 4.0+ W/kg is where you're riding the event, not enduring it — strong on the final climb, in groups on the flats, finishing inside the top quarter of the field.",
      "Why durability matters more than fresh FTP at this distance. On the podcast, Dan Lorang has detailed how the World Tour now treats fatigue resistance — your power three to four hours into a hard ride — as the primary differentiator at the elite level. The same logic scales perfectly to the Étape. A 3.5 W/kg rider whose power holds at 90% three hours in will outride a 3.7 W/kg rider whose power collapses to 75%. Long zone 2 plus sweet spot at the back end of long rides is the durability protocol.",
      "The realistic project for an amateur. Closing the gap from 3.0 W/kg to 3.5 W/kg is 9-18 months of structured training for most amateurs — and the pace slows the closer you get to 4.0 W/kg. If you're entering the Étape this year and your FTP is honest at 3.0 W/kg, the right move is to register and treat this year as reconnaissance, then target 3.5 W/kg for next year with an 18-month structured build. The W/kg calculator gives you the bands; the FTP timeline article on the site tells you what's realistic.",
    ],
    evidence: [
      {
        label: "Roadman — Étape du Tour Training Plan",
        detail:
          "Full event-specific training plan with FTP targets, climbing progression, and pacing strategy for the Étape's mountain profile.",
        href: "/plan/etape-du-tour",
      },
      {
        label: "Dan Lorang — Roadman Podcast",
        detail:
          "Lorang has discussed durability training and fatigue resistance as the primary differentiator on long mountain events, including how amateurs should structure 4-5 hour rides for the Étape specifically.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman — How long does it take to increase FTP?",
        detail:
          "The realistic timeline for moving from 3.0 to 3.5 W/kg, drawn from Stephen Seiler's work and Roadman coaching case studies.",
        href: "/question/how-long-to-increase-ftp",
      },
      {
        label: "Roadman — Sportive Preparation Guide",
        detail:
          "Generalised sportive prep guide with mountain-event-specific notes on pacing, fuelling, and durability.",
        href: "/blog/cycling-sportive-preparation",
      },
    ],
    faq: [
      {
        question: "What if I'm only 3.0 W/kg now and the Étape is in 6 months?",
        answer:
          "You can probably finish if you pace and fuel ruthlessly, but you'll suffer. The honest play is either to defer the entry by a year and target 3.5 W/kg next time, or to commit to the 6-month build and accept that this year is reconnaissance. Roadman coaching case studies show 5-12% FTP gains in 24 weeks for amateurs new to structured training — meaningful, but rarely enough to close a 0.5 W/kg gap.",
      },
      {
        question: "Will pacing alone get me through if my FTP is below target?",
        answer:
          "Pacing buys roughly 5-8% of comfortable finishing margin — meaningful, but not enough to compensate for a 0.5 W/kg gap on a mountain stage. A 3.0 W/kg rider with perfect pacing is still going to suffer disproportionately on the long cols. Pacing is the multiplier on your fitness, not a substitute.",
      },
      {
        question: "What about the Étape time cuts?",
        answer:
          "Time cuts catch a small but non-trivial number of riders every year — usually those riding consistently below 2.8 W/kg through the major climbs, or those who overcook the early section and blow up before the final col. The cut is enforced at intermediate points on long mountain editions. Train for the back third, not the start.",
      },
    ],
    related: [
      {
        label: "Étape du Tour Training Plan",
        href: "/plan/etape-du-tour",
      },
      {
        label: "What FTP do I need for a sportive?",
        href: "/question/what-ftp-for-sportive",
      },
      {
        label: "How long does it take to increase FTP?",
        href: "/question/how-long-to-increase-ftp",
      },
      {
        label: "How many weeks to train for a sportive?",
        href: "/question/how-many-weeks-to-train-for-sportive",
      },
      {
        label: "W/kg Calculator",
        href: "/tools/wkg",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
    ],
  },
  {
    slug: "how-to-fuel-200km-sportive",
    cluster: "events",
    question: "How Do I Fuel a 200km Sportive?",
    seoTitle: "How to Fuel a 200km Sportive",
    seoDescription:
      "An evidence-based fuelling protocol for 200km sportives — pre-ride loading, in-ride carb and sodium targets, hydration through hour 7, and the gut training that makes 120g/hr possible.",
    pillar: "nutrition",
    shortAnswer:
      "Take 90-120g of carbs per hour from minute 30, plus 600-900ml of fluid and 700-1000mg of sodium hourly. Total carb intake across a 6-9 hour 200km event lands at 600-1100g — most amateurs eat half that and bonk because of it. Train the gut on every long ride; race day is not the day to test new numbers.",
    bestFor:
      "Riders training for or doing a 200km sportive — Wicklow 200, Mallorca 312, Maratona dles Dolomites — who need a defensible fuelling plan.",
    notFor:
      "Riders doing a 100km or shorter sportive — different demands; the existing how-to-fuel-a-sportive guide covers shorter events.",
    keyTakeaway:
      "A 200km ride costs 600-1100g of carbs total — most amateurs eat half that and bonk because of it.",
    evidenceLevel: "strong",
    evidenceNote:
      "Aligned with Dr David Dunne's discussion of modern World Tour fuelling on the Roadman Cycling Podcast and the academic consensus around 90-120g/hr for trained ultra-endurance athletes.",
    fullExplanation: [
      "A 200km sportive is a step-change in fuelling demand from a 100km event, not a linear extension. Glycogen depletion across 6-9 hours of moderate-intensity work breaks the shortcuts that work at the shorter distance — under-eating early can be patched in a 100km ride; in a 200km ride it ends in a bonk somewhere in the closing 60km. The protocol below is the new amateur baseline for any event over 6 hours, not an upper bound for elite riders.",
      "Pre-ride loading. Eat 2-3g of carbs per kg of bodyweight 2-3 hours before the start — for a 75kg rider, that's a 150-225g breakfast (porridge with banana and honey, toast, juice). 30-60 minutes pre-start, top up with 30-40g of fast carbs (gel, banana, small flapjack). The aim is to roll out with full glycogen and stable blood sugar so you're not chasing a deficit from minute 60.",
      "In-ride: 90-120g of carbs per hour from minute 30, climbing toward the upper end if your gut is trained for it. Set a 25-30 minute timer on your head unit and eat or drink something every alarm — hunger is a lagging indicator on long events. Mix sources: a bottle of carb drink (60g per bottle), gels (25g each), real food (rice cakes, Pop-Tarts, fig rolls). Hydration in the same window: 600-900ml of fluid per hour, 700-1000mg of sodium per hour, with heavy sweaters in heat at the upper end of both ranges.",
      "Gut training is the non-negotiable. Most amateurs cannot tolerate 120g/hr on day one — it has to be trained, the same way you train threshold power. Build by 10-15g/hr per week from your current intake on weekly long rides, and never test a new fuelling number for the first time on race day. On the podcast, Dr David Dunne has been explicit that the 90-120g/hr World Tour standard is achievable for amateurs but only with deliberate gut training in the 8-12 weeks before the event. Use the Roadman fuelling calculator to model your specific weight, duration, and conditions.",
    ],
    evidence: [
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne has detailed the modern 90-120g/hr World Tour fuelling standard, the gut-training protocol that makes it tolerable, and how it translates to amateur ultra-distance prep.",
        href: "/guests/dr-david-dunne",
      },
      {
        label: "Roadman — Fuelling Calculator",
        detail:
          "Free tool for calculating carb, fluid, and sodium needs by ride duration, intensity, weight, and conditions — the practical companion to this protocol.",
        href: "/tools/fuelling",
      },
      {
        label: "Roadman — Race-Day Nutrition",
        detail:
          "Hour-by-hour fuelling and hydration plan for race day, with food and product specifics for events over 6 hours.",
        href: "/blog/cycling-nutrition-race-day-guide",
      },
      {
        label: "Roadman — In-Ride Nutrition Guide",
        detail:
          "Generalised in-ride fuelling guide covering carb sources, gut training, and the science behind multi-source carbs (glucose + fructose).",
        href: "/blog/cycling-in-ride-nutrition-guide",
      },
    ],
    faq: [
      {
        question: "Can my stomach actually take 120g per hour?",
        answer:
          "Yes, with deliberate gut training. Build by 10-15g per hour per week from your current intake — start at, say, 50g/hr and add a gel per hour each weekly long ride until you're comfortable at 100-120g. The reason most amateurs cap out at 60-70g/hr is undertrained absorption, not a fixed physiological limit. Multiple-source carbs (glucose + fructose, e.g. 2:1 ratio) tolerate better at the upper end.",
      },
      {
        question: "Should I caffeine-load for a 200km event?",
        answer:
          "Targeted, yes. 2-4mg/kg 60 minutes before the start, then 100-200mg every 2-3 hours through the event keeps the stimulant benefit on a long ride without over-stacking. Never use a new caffeine protocol on race day for the first time — gut tolerance and stimulant response are individual, and a long sportive is the worst place to discover yours is sensitive.",
      },
      {
        question: "How do I recover if I bonk mid-ride?",
        answer:
          "Take 60-90g of fast carbs immediately (two gels, a Coke, rice cakes — whatever's in your jersey), drop intensity to zone 1-2 for 20-30 minutes to let the carbs land, then resume your normal hourly feeding plus an extra 20-30g for the next two hours to rebuild the deficit. A bonk that's caught early costs you 30 minutes; a bonk that's ignored ends the day.",
      },
    ],
    related: [
      {
        label: "How do I fuel a sportive?",
        href: "/question/how-to-fuel-a-sportive",
      },
      {
        label: "How many carbs per hour for cycling?",
        href: "/question/carbs-per-hour-cycling",
      },
      {
        label: "Fuelling Calculator",
        href: "/tools/fuelling",
      },
      {
        label: "Wicklow 200 Training Plan",
        href: "/plan/wicklow-200",
      },
      {
        label: "Mallorca 312 Training Plan",
        href: "/plan/mallorca-312",
      },
      {
        label: "Race-Day Nutrition Guide",
        href: "/blog/cycling-nutrition-race-day-guide",
      },
    ],
  },
];

export function getQuestionBySlug(slug: string): QuestionPage | null {
  return QUESTION_PAGES.find((q) => q.slug === slug) ?? null;
}

export function getAllQuestionSlugs(): string[] {
  return QUESTION_PAGES.map((q) => q.slug);
}

export function getQuestionsByCluster(
  cluster: QuestionCluster,
): QuestionPage[] {
  return QUESTION_PAGES.filter((q) => q.cluster === cluster);
}

export function getQuestionsByPillar(pillar: ContentPillar): QuestionPage[] {
  return QUESTION_PAGES.filter((q) => q.pillar === pillar);
}

export const QUESTION_CLUSTERS: Array<{
  id: QuestionCluster;
  label: string;
  description: string;
}> = [
  {
    id: "ftp",
    label: "FTP & Threshold",
    description:
      "What good FTP looks like, how long it takes to build, and why amateurs plateau.",
  },
  {
    id: "masters",
    label: "Masters Cycling (40+)",
    description:
      "Training, recovery, strength, and intensity for cyclists over 40.",
  },
  {
    id: "nutrition",
    label: "Cycling Nutrition",
    description:
      "Carbs per hour, pre-ride fuelling, sportive strategy, and protein.",
  },
  {
    id: "coaching",
    label: "Cycling Coaching",
    description:
      "Whether coaching is worth it, what it costs, what coaches actually do, and when to hire one.",
  },
  {
    id: "events",
    label: "Sportive & Event Prep",
    description:
      "Training, pacing, FTP targets and fuelling for specific sportives — Wicklow 200, Étape du Tour, Mallorca 312, and the rest.",
  },
];
