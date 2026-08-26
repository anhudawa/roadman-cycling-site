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
  | "events"
  | "training";

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
      "Two practical implications. First, don't retest FTP every four weeks expecting it to climb every time — testing too often guarantees you'll be miscalibrated, fatigued, or both. A 6-8 week cadence is the floor. Second, if your FTP really hasn't moved in 6 months despite consistent structured work, the problem is rarely 'I need to push harder' — it's almost always recovery, fuelling, or programme staleness. The Plateau Diagnostic walks through the four most common patterns.",
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
        href: "/answers/how-often-test-ftp",
      },
      {
        label: "Why Your FTP Is Stuck — Five Causes",
        href: "/blog/why-your-ftp-is-stuck-five-causes",
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
          "Lorang (Head of Performance at Lidl-Trek since August 2026) emphasises that recovery is a separate input — under-recovered athletes can't express their fitness in testing.",
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
      "Masters cyclists over 40 should train fewer hard sessions but make each one count, build more recovery into the week, and treat targeted strength work as non-negotiable. The polarised model — most rides easy, a small number very hard — works better at 45 than at 25, not worse. The same plan that worked at 30 won't work now.",
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
      "Second, targeted strength training is non-negotiable. The 2024-2025 research the Roadman team summarised earlier this year is unambiguous: structured resistance work twice a week beats more cycling miles for masters power retention, body composition, and bone density. This isn't body-pump or band work. This is split squats, hip hinges, single-leg work, lunges, presses and core — well controlled, progressed gradually, and challenging enough that the last reps require focus.",
      "Third, recovery has to be programmed, not assumed. After 40, you cannot train through fatigue the way you used to. Every third or fourth week should be a deload. Sleep is treated as a session — under 7 hours, the next day's hard ride gets dropped, not pushed through. Joe Friel's masters work and the Roadman coaching practice both build mandatory recovery weeks into the plan from day one. The riders who keep gaining are the ones who treat their recovery like an athlete, not like a hobbyist.",
    ],
    evidence: [
      {
        label: "Strength Training Beats More Miles After 40 — Roadman Article",
        detail:
          "Synthesis of recent masters strength research, including specific protocol recommendations for structured resistance work.",
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
          "For cardiovascular fitness, yes. For muscle mass, bone density, and long-term power retention, no. The masters cyclists who keep their FTP through their 50s and 60s are almost universally also doing two structured strength sessions a week. That's the data, not an opinion.",
      },
    ],
    related: [
      {
        label: "Masters FTP Benchmark Calculator",
        href: "/tools/masters-ftp-benchmark",
      },
      {
        label: "Masters Recovery Score Calculator",
        href: "/tools/masters-recovery-score",
      },
      {
        label: "Masters Cycling Podcast Playlist (By Topic)",
        href: "/blog/masters-cycling-podcast-playlist",
      },
      {
        label: "Cycling Over 40 — Getting Faster",
        href: "/blog/cycling-over-40-getting-faster",
      },
      {
        label: "Strength Training Beats More Miles After 40",
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
        label: "Masters Recovery Score Calculator",
        href: "/tools/masters-recovery-score",
      },
      {
        label: "Masters Cycling Podcast Playlist (By Topic)",
        href: "/blog/masters-cycling-podcast-playlist",
      },
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
        href: "/answers/how-much-protein-do-cyclists-need",
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
      "The case for targeted strength training for cyclists over 40 — what the latest research shows, what protocol actually works, and why riding more isn't enough.",
    pillar: "strength",
    shortAnswer:
      "Yes — and 'need' is the right word, not 'might benefit from'. Targeted strength training twice a week is the single biggest lever older cyclists have to slow muscle loss, maintain bone density, and protect FTP. The 2024-2025 research is unambiguous: strength work beats more cycling miles for masters performance. The Roadman approach favours cycling-specific patterns (split squats, hip hinges, single-leg work, core) progressed gradually, rather than max-effort barbell lifting.",
    bestFor:
      "Cyclists 40+ who currently do little or no resistance work and want the highest-leverage change to their training.",
    notFor:
      "Riders already doing 2 structured strength sessions a week — you're already in the right place; don't add more.",
    keyTakeaway:
      "The evidence has shifted. For masters cyclists, targeted strength work is no longer optional; riding alone is no longer enough.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The cycling internet spent twenty years arguing about whether strength training helped cyclists. The 2024-2025 research has settled it for masters athletes — and the answer is unambiguous. Structured resistance training twice a week protects power output, slows the age-related decline in muscle mass, maintains bone density, and outperforms 'more miles' for nearly every masters performance marker.",
      "The mechanism is simple. After 40, cyclists lose roughly 8% of muscle mass per decade without resistance work. That muscle loss directly translates into power loss — there's no way around it. Pure cycling, even high-volume cycling, is not a strong enough stimulus to defend muscle mass against age. Targeted strength work is. The Roadman article on this research breaks down the protocols.",
      "What 'meaningful' means matters. Body-pump classes, band-only work, and bodyweight-only squats won't do it on their own. The Roadman programme prescribes twice-weekly strength work focused on cycling-specific patterns — split squats, hip hinges, single-leg deadlifts, lunges, presses and core — progressed gradually with controlled load. The aim is durable, controlled strength for amateur cyclists 35-55, not max-effort barbell lifting or 1RM testing. Working in the 6-10 rep range with focus on form is enough stimulus, with much lower injury risk than heavy bilateral barbell work.",
      "Two practical points. First, strength work doesn't make you slow on the bike — that's a myth from the 2000s. Multiple studies and the John Wakefield / Dan Lorang training prescriptions confirm cyclists adding 2 strength sessions a week typically see FTP gains, not losses. Second, this isn't optional after 50. The masters cyclists who maintain their racing power into their 60s and 70s are almost universally still lifting. The ones who stopped lifting entirely are the ones who declined fastest.",
    ],
    evidence: [
      {
        label: "2024 study — Strength Training Beats More Miles After 40",
        detail:
          "Recent research synthesised by the Roadman team showing structured resistance training outperforms additional cycling volume for masters power retention.",
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
          "Friel's masters-specific guidance has prescribed structured strength training as foundational since publication and the recent research has only reinforced his framework.",
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
        question: "How meaningful does the load need to be for a masters cyclist?",
        answer:
          "Challenging enough that the last 1-2 reps in a set of 6-10 require real focus, and 12 reps at the same load would be a stretch. The Roadman approach is cycling-specific patterns — split squats, hip hinges, single-leg deadlifts, hip thrusts, presses and core — progressed gradually over 8-12 weeks. The goal is durable, controlled strength for amateur cyclists 35-55, not 1RM testing or max-effort bilateral barbell lifting.",
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
        label: "Masters FTP Benchmark Calculator",
        href: "/tools/masters-ftp-benchmark",
      },
      {
        label: "Masters Cycling Podcast Playlist (By Topic)",
        href: "/blog/masters-cycling-podcast-playlist",
      },
      {
        label: "Strength Training Beats More Miles After 40",
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
        label: "Masters Recovery Score Calculator",
        href: "/tools/masters-recovery-score",
      },
      {
        label: "Masters FTP Benchmark Calculator",
        href: "/tools/masters-ftp-benchmark",
      },
      {
        label: "Masters Cycling Podcast Playlist (By Topic)",
        href: "/blog/masters-cycling-podcast-playlist",
      },
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
        href: "/guests/david-dunne",
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
        href: "/blog/carbohydrate-per-hour-cyclists",
      },
      {
        label: "Roadman Fuelling Calculator",
        detail:
          "Build a carbohydrate starting range from the session inputs; measure fluid loss separately with the cycling sweat-rate calculator.",
        href: "/tools/fuelling",
      },
    ],
    faq: [
      {
        question: "Can I really absorb 120g of carbs per hour?",
        answer:
          "If you've gut-trained, yes — and the World Tour is now routinely seeing pros fuel at 120-140g per hour in races. For an untrained amateur gut, expect 60-70g to be the comfortable ceiling. The capacity is actually trainable; it just takes 6-10 weeks of progressive overload.",
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
        href: "/blog/carbohydrate-per-hour-cyclists",
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
        href: "/guests/david-dunne",
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
      "Sportive fuelling protocol — pre-ride, in-ride, and post-ride. Build and rehearse carbohydrate and condition-specific hydration ranges.",
    pillar: "nutrition",
    shortAnswer:
      "Eat 2-3g/kg of carbs 2-3 hours before the start, take 30-40g of carbs 30-60 minutes pre-start, then use a rehearsed 60-90g-per-hour carbohydrate range from minute 30. Build fluid and sodium logistics from representative rides, weather, access and tolerance rather than copying a universal hourly dose.",
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
      "In-ride: from minute 30, use a rehearsed 60-90g-per-hour carbohydrate range. Set a 25-30 minute reminder and mix tolerated sources. Plan drink access from representative rides and expected conditions, then audit body-mass change and symptoms afterward. Sodium needs depend on total sweat loss, sweat sodium, diet and event context; sweat volume alone does not produce one universal dose.",
      "Post-ride matters too, especially if you're stacking efforts. Within 30-60 minutes of finishing, take 1-1.2g/kg of carbs plus 25-40g of protein. That accelerates glycogen replacement and starts muscle repair. The Roadman Fuelling Calculator gives the exact numbers for your weight, ride duration, and conditions. The Sportive Preparation guide adds the pacing context — fuelling and pacing are inseparable on long rides.",
    ],
    evidence: [
      {
        label: "Roadman Fuelling Calculator",
        detail:
          "Free tool for building a carbohydrate starting range from ride inputs; use the separate measured sweat-rate calculator for fluid-loss auditing.",
        href: "/tools/fuelling",
      },
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne has discussed the modern World Tour fuelling protocols (90-120g/hr) and how they translate for amateur sportive prep.",
        href: "/guests/david-dunne",
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
          "There is no safe universal hourly dose. Test representative rides by recording dry pre/post body mass, drink, urine and duration, then attach temperature, humidity, airflow and intensity to the result. Use repeated observations to rehearse a practical range, do not force full sweat replacement, and do not drink enough to gain body mass during prolonged exercise.",
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
      "Anthony coaches cyclists for a living and runs a podcast that has interviewed dozens of other coaches — so the honest answer is laid out from inside the industry, not from a marketing brochure. The short version: coaching is really worth it for some riders and clearly not worth it for others, and most of the regret comes from people on the wrong side of that line.",
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
          "Good coaches write your plan. Templated coaches charge less because they're scaling — they hand out the same plan with surface tweaks. Both can work for some riders, but only the first is actually 'coaching'. Ask explicitly during the sales call: 'Do you write each athlete's plan?'",
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
      "Fuelling on a 12-hour event must be rehearsed. Higher carbohydrate intakes require progressive gut training and are not an automatic baseline for every amateur. Build fluid logistics from representative warm rides, bottle access and tolerance; review sodium separately because sweat volume does not reveal sweat sodium concentration. Use the fuelling and sweat-rate tools as planning inputs, not exact prescriptions.",
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
        href: "/guests/david-dunne",
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
      "A practical fuelling protocol for 200km sportives — pre-ride food, gut-trained carbohydrate ranges and measured hydration planning through hour seven.",
    pillar: "nutrition",
    shortAnswer:
      "Start carbohydrate early and use the highest intake you have repeatedly tolerated in training; 90g per hour or more requires deliberate gut training and is not a universal starting point. Build a separate fluid and sodium plan from representative rides, expected conditions, access and tolerance. Race day is not the time to test new numbers.",
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
      "In-ride: begin with a carbohydrate rate already tolerated in long training rides and progress only through deliberate gut training. A reminder can keep intake consistent, but the foods and concentration must suit the rider. Plan fluid separately from representative sweat-loss observations and event access. Sodium concentration varies widely, so do not infer a fixed sodium dose from fluid loss or body size.",
      "Gut training is the non-negotiable. Most amateurs cannot tolerate 120g/hr on day one — it has to be trained, the same way you train threshold power. Build by 10-15g/hr per week from your current intake on weekly long rides, and never test a new fuelling number for the first time on race day. On the podcast, Dr David Dunne has been explicit that the 90-120g/hr World Tour standard is achievable for amateurs but only with deliberate gut training in the 8-12 weeks before the event. Use the Roadman fuelling calculator to model your specific weight, duration, and conditions.",
    ],
    evidence: [
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne has detailed the modern 90-120g/hr World Tour fuelling standard, the gut-training protocol that makes it tolerable, and how it translates to amateur ultra-distance prep.",
        href: "/guests/david-dunne",
      },
      {
        label: "Roadman — Fuelling Calculator",
        detail:
          "Free tool for building a carbohydrate starting range. Pair it with the measured cycling sweat-rate calculator and field testing.",
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
  // ============================================================
  // MASTERS CLUSTER — high-intent queries from cyclists over 40
  // ============================================================
  {
    slug: "zone-2-training-cyclists-over-40",
    cluster: "masters",
    question: "Zone 2 Training for Cyclists Over 40 — How to Do It Right",
    seoTitle: "Zone 2 Training for Cyclists Over 40 — The Honest Guide",
    seoDescription:
      "Zone 2 training for masters cyclists. Why it works harder for the over-40s than the over-30s, how slow is slow enough, and the weekly volume that actually moves FTP.",
    pillar: "coaching",
    shortAnswer:
      "For cyclists over 40, zone 2 should make up roughly 80% of weekly volume — which usually means slower than you think. Heart rate sits around 65-75% of max, conversational pace, nose-breathing capable. The masters payoff is bigger than the under-40 version: zone 2 protects mitochondrial function and recovery capacity, both of which decline with age if you don't train them deliberately.",
    bestFor:
      "Riders over 40 training 6-12 hours a week who want to keep gaining FTP without breaking themselves on intensity.",
    notFor:
      "Riders who already do plenty of easy riding and need the missing 20% — true threshold or VO2max work, not more zone 2.",
    keyTakeaway:
      "After 40, zone 2 isn't a warm-up — it's the stimulus that protects the engine you still have to train hard with.",
    evidenceLevel: "strong",
    evidenceNote:
      "Built on Stephen Seiler's polarised research, Iñigo San Millán's mitochondrial work with Pogacar, and what John Wakefield, Dan Lorang, and the Roadman masters coaching community see week to week.",
    fullExplanation: [
      "Anthony has had this conversation with Stephen Seiler more than once on the Roadman Cycling Podcast. The 80/20 distribution — roughly 80% of training volume in zone 2 and below, 20% well above threshold — is what every elite endurance programme runs on. The mistake most masters cyclists make is thinking 'easy' means zone 3. It doesn't. Zone 2 is the pace where you can hold a full conversation, breathe through your nose, and feel like you're undertraining. That feeling is the work.",
      "What changes after 40 is the stake. Iñigo San Millán — the coach behind Tadej Pogacar's mitochondrial work — has been clear that zone 2 is the most powerful stimulus we have for protecting mitochondrial density and fat oxidation. Both decline with age unless you train them. So a masters cyclist who skips zone 2 isn't just missing a stimulus — they're letting the engine itself shrink, then trying to layer threshold work on top of a smaller base every year.",
      "The honest question isn't whether to do zone 2. It's how slow to go. For a 50-year-old amateur with a max HR around 175, zone 2 sits roughly between 115 and 135 bpm. By power, it's 56-75% of FTP. If your normalised power on a 'long endurance' ride is 80% of FTP, you're not in zone 2. You're in zone 3 — the grey zone — and you're paying a recovery cost you'd be better off saving for your one or two real interval sessions.",
      "Practically, an 8-hour week for a masters rider might look like this: two endurance rides (90 minutes and 2 hours, both genuine zone 2), one threshold or VO2max session (60-75 minutes including warm-up), one strength session, and one recovery spin. That structure — heavy zone 2, one quality day, one strength day — is what the masters cohort inside Not Done Yet runs and what Wakefield and Lorang prescribe to the pros they coach. The compounding effect over six months is significant. The compounding effect over five years is the reason serious 50-year-olds still ride at the front of sportives.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — polarised training research",
        detail:
          "Seiler's work on training intensity distribution underpins the 80/20 model that Roadman recommends for masters cyclists. Zone 2 dominates the easy 80%.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "Iñigo San Millán — mitochondrial training",
        detail:
          "San Millán's published work and his interviews on Pogacar's training establish zone 2 as the primary stimulus for mitochondrial biogenesis — the lever that ages the slowest if you keep training it.",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield (Director of Coaching, Red Bull–Bora–Hansgrohe) has confirmed on the podcast that the over-40 cohort responds harder to volume restoration than to more intensity.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Roadman masters community — case data",
        detail:
          "Documented FTP gains in the Not Done Yet community after rebalancing toward 80/20 distribution — reversing 12-18 months of grey-zone stagnation.",
        href: "/blog/masters-cycling-training-report-2026",
      },
    ],
    faq: [
      {
        question: "How many hours of zone 2 per week should a masters cyclist do?",
        answer:
          "Aim for 80% of total weekly training time. On 8 hours a week, that's roughly 6.5 hours of true zone 2 — typically split across two longer endurance rides plus a recovery spin. On 12 hours, closer to 9.5. The number that matters is the ratio, not the absolute hours.",
      },
      {
        question: "Is zone 2 the same as easy spinning?",
        answer:
          "Close but not identical. Zone 2 is structured easy — a deliberate intensity that's hard enough to drive aerobic adaptation but easy enough to keep next-day fatigue low. Pure recovery spinning is below zone 2 and serves a different purpose. Both belong in a masters week.",
      },
      {
        question: "Can I lose weight on zone 2 alone?",
        answer:
          "Zone 2 is metabolically efficient — it trains the body to oxidise fat at higher intensities — but body composition is mostly built in the kitchen. Combine genuine zone 2 with adequate protein, properly fuelled long rides, and a small daily energy gap and weight will move. Anthony's own 7kg loss came from eating more, not less, while running a heavily zone-2 weekly base.",
      },
      {
        question: "How do I know I'm actually in zone 2, not zone 3?",
        answer:
          "The cleanest test is the talk test combined with nasal breathing. If you can hold a full sentence and still breathe through your nose, you're in zone 2. If you're snatching breaths or finishing sentences in chunks, you've drifted to zone 3. By heart rate, it's typically 65-75% of max; by power, 56-75% of FTP.",
      },
    ],
    related: [
      {
        label: "How should cyclists over 40 train?",
        href: "/question/how-should-cyclists-over-40-train",
      },
      {
        label: "Polarised vs Sweet Spot for Masters Cyclists",
        href: "/compare/polarised-vs-sweet-spot-masters",
      },
      {
        label: "80/20 Cycling Training — The Grey-Zone Trap",
        href: "/blog/80-20-cycling-training-the-grey-zone-trap",
      },
      {
        label: "Cycling Over 40 — Getting Faster Guide",
        href: "/blog/cycling-over-40-getting-faster",
      },
      {
        label: "Masters FTP Benchmark Tool",
        href: "/tools/masters-ftp-benchmark",
      },
    ],
    cta: {
      eyebrow: "STILL SECOND-GUESSING THE PACE?",
      heading: "The Plateau Diagnostic finds the leak in 4 minutes.",
      body: "Built for masters cyclists who've been doing the work and want to know exactly where the system is leaking — grey-zone drift, recovery, fuelling, or stale programming.",
      href: "/plateau",
      label: "Take the Plateau Diagnostic",
    },
  },
  {
    slug: "cycling-training-hours-per-week",
    cluster: "coaching",
    question: "How Many Hours Should I Train Per Week Cycling?",
    seoTitle: "How Many Hours Per Week Should You Cycle? Honest Targets",
    seoDescription:
      "Realistic weekly cycling hours by goal — from finishing a sportive to lifting FTP into Cat 2. Why the right structured 6-8 hours beats an unstructured 12.",
    pillar: "coaching",
    shortAnswer:
      "For most amateurs, 6-10 well-structured hours a week produce more fitness than 12-15 unstructured hours. Beginners can build at 4-6, intermediates aiming to lift FTP need 8-10, and ambitious masters or Cat 2/3 racers do 10-14. Above 14 hours, returns shrink fast unless you're racing seriously.",
    bestFor:
      "Working amateurs trying to set a realistic weekly target without copying a pro plan they can't sustain.",
    notFor:
      "Riders whose fitness ceiling is recovery-limited — adding hours to a system that's already over-fatigued just deepens the hole.",
    keyTakeaway:
      "More hours don't beat better hours — quality of structure beats raw volume for everyone training under 12 hours a week.",
    evidenceLevel: "strong",
    fullExplanation: [
      "The honest answer most cyclists don't want to hear: there is no universal number. Joe Friel sets it cleanly in The Cyclist's Training Bible — your weekly volume should be the most you can absorb while still adapting and still living the rest of your life. For the audience reading this, that almost always lands between 6 and 12 hours. Below 6 you can hold fitness but rarely lift it; above 12 the marginal gain shrinks unless you've got the recovery infrastructure of a full-time athlete.",
      "Anthony has dug into this on the podcast with John Wakefield, Dan Lorang, and the Bora coaching team. Their consistent message: a structured 8 hours a week beats an unstructured 12 every time. Two properly easy zone 2 rides, one threshold or VO2max session, one strength session, and one moderate weekend ride will move FTP further in twelve weeks than a random 12-hour week of group rides and sweet spot. The reason is simple — randomness produces fatigue without specificity, and the body adapts to the stimulus you actually deliver, not the hours on Strava.",
      "Practical targets by goal: to finish a 100-mile sportive comfortably, 5-7 structured hours a week for 12 weeks is enough. To lift FTP from 3.0 to 3.5 W/kg, 7-9 hours with proper periodisation usually does it inside 16-20 weeks. To race Cat 3 with a chance of staying in the bunch, 8-12 hours. To compete in Cat 2 or finish a Marmotte/Étape strongly, 10-14 hours plus strength. Above 14 hours you're in serious-amateur or elite-amateur territory and most of the gain comes from recovery and structure, not more saddle time.",
      "Two warnings from inside the coaching community. First, the hours figure on Strava lies. A 60-minute zone 2 ride and a 60-minute group ride that touches threshold are not the same training stress. Stop counting hours; start counting load with intent. Second, more hours added to a system that's recovery-broken makes things worse, not better. If you're already 8 hours a week and tired all the time, the answer is rarely 'go to 10'. It's 'recover properly for two weeks, then come back to 8 with cleaner zones'. Roadman's masters cohort sees this play out every block.",
    ],
    evidence: [
      {
        label: "Joe Friel — The Cyclist's Training Bible",
        detail:
          "Friel's volume guidance underpins the structured-hours-by-goal framework most amateur coaches use, including Roadman's.",
        href: "/guests/joe-friel",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "On the podcast, Wakefield (Director of Coaching, Red Bull–Bora–Hansgrohe) has been consistent: structured 8-10 hour weeks for amateurs outperform unstructured 12-15 hour weeks.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Dan Lorang — Roadman Podcast",
        detail:
          "Lorang (Head of Performance at Lidl-Trek since August 2026; previously at Red Bull–Bora–Hansgrohe) has stressed that work, family and recovery affect the right volume — copy the decision process, not a professional's volume.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman case data — time-crunched cohort",
        detail:
          "Members training 6-9 structured hours produce comparable FTP gains to the 10-12 hour cohort over 12 weeks — the differentiator is intensity distribution, not raw hours.",
        href: "/blog/cycling-training-plan-masters-over-40",
      },
    ],
    faq: [
      {
        question: "Is 5 hours per week enough cycling?",
        answer:
          "Yes — for maintaining fitness, completing most sportives, and making modest FTP gains in your first year of structured training. Below 5 you'll hold what you have but lifting top-end is hard. Above 5, intensity distribution starts to matter more than the hours themselves.",
      },
      {
        question: "How many hours do pro cyclists train per week?",
        answer:
          "Tour de France-level pros average 25-35 hours a week in build phases — but that includes recovery rides, training camps, and a job description that ends with 'cycling'. Comparing your week to theirs is the wrong frame. What's relevant from the pro world is the 80/20 distribution and the periodisation, not the raw hours.",
      },
      {
        question: "Can I get faster cycling 4 hours a week?",
        answer:
          "Yes, in your first 12-18 months of structured training, and if every hour is deliberate. Two zone 2 rides, one quality interval session, and a strength session inside 4 hours can lift a recreational FTP into the strong-amateur band. Beyond that, 4 hours becomes maintenance, not progression.",
      },
      {
        question: "How many days a week should I cycle?",
        answer:
          "Three to five days suits most amateurs. Three is the floor for fitness gains; five with one strength day and one full rest day is the sweet spot for time-crunched riders. Six or seven days only makes sense if at least two are genuine recovery rides and your sleep is dialled.",
      },
    ],
    related: [
      {
        label: "Cycling training plan for full-time workers",
        href: "/question/cycling-training-plan-full-time-workers",
      },
      {
        label: "How many hard rides per week for masters?",
        href: "/question/hard-rides-per-week-masters",
      },
      {
        label: "Polarised vs Sweet Spot for Masters Cyclists",
        href: "/compare/polarised-vs-sweet-spot-masters",
      },
      {
        label: "Masters Cycling Training Report (2026)",
        href: "/blog/masters-cycling-training-report-2026",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
    ],
    cta: {
      eyebrow: "WHEN HOURS ALONE WON'T MOVE THE NUMBER",
      heading: "Find out what's actually capping your FTP.",
      body: "The Plateau Diagnostic is built for time-crunched amateurs whose hours are right but the system isn't.",
      href: "/plateau",
      label: "Take the Plateau Diagnostic",
    },
  },
  {
    slug: "cycling-training-plan-full-time-workers",
    cluster: "coaching",
    question: "What's the Best Cycling Training Plan for Full-Time Workers?",
    seoTitle: "Cycling Training Plan for Full-Time Workers — Honest Template",
    seoDescription:
      "Cycling training for full-time professionals. The 6-8 hour weekly template that fits around a job, lifts FTP, and doesn't burn you out by Wednesday.",
    pillar: "coaching",
    shortAnswer:
      "The right plan for a full-time worker is roughly 6-8 hours across 4-5 days, structured 80/20: two short weekday quality sessions (45-75 minutes), two longer weekend rides (one zone 2, one mixed-intensity), and one strength session. This template lifts FTP in 12-week blocks without forcing you to choose between training, work, and family.",
    bestFor:
      "Working professionals — typically 35-55 — training around a 9-5, family obligations, and irregular travel.",
    notFor:
      "Riders with the time and recovery bandwidth for 12+ hours a week — they need a different load model.",
    keyTakeaway:
      "The best plan isn't the one that promises the biggest gains. It's the one you can actually finish three weeks in a row.",
    evidenceLevel: "moderate",
    evidenceNote:
      "Built from the time-crunched programming Roadman runs inside the Not Done Yet community plus the consistent guidance from John Wakefield, Dan Lorang, and Joe Friel on amateur volume.",
    fullExplanation: [
      "Most cycling training plans on the internet are written by people who train cycling for a living, then handed to people who don't. That's the core failure. A plan that prescribes 12 hours when you have 8, or stacks intensity on Tuesday and Thursday when those are your two longest meeting days, isn't a bad plan — it's a plan for someone else. The right plan for a full-time worker starts from the constraints, not the ambition.",
      "The shape that consistently works for the working amateur — and what Anthony has watched the masters cohort inside Not Done Yet run to good effect — is built around 6-8 hours, four to five days. Two midweek sessions of 45-75 minutes, both indoor or short-loop outdoors, where one is a true zone 2 endurance ride and the other is the week's quality session (threshold or VO2max intervals). One strength session — squats, deadlifts, single-leg work — lasting 45 minutes. One longer weekend zone 2 ride of 2-3 hours. One mixed-intensity weekend ride: warm-up, group ride or sweet spot, cool-down. That's it.",
      "The non-obvious part of programming around a job is the deload. A working amateur who hits 8 quality hours every week for six straight weeks is heading for a fatigue wall around week seven, regardless of how strong the plan looked on paper. The Wakefield prescription Anthony has talked through on the podcast is to build for three weeks, deload one — drop volume by 30-40%, keep one quality session at intensity. It's the difference between a plan that lifts FTP for a year and a plan that breaks you in 10 weeks.",
      "Two practical rules from the Roadman coaching community for the time-crunched cyclist. First, intensity stays sacred. If you can only protect one session a week, protect the threshold or VO2max work — that's where the FTP gains come from. Skip the long ride before you skip the intervals. Second, recovery has to be programmed, not hoped for. Sleep, fuelling and one full rest day a week are non-negotiable. The plans that actually move the number assume you'll defend those — not just on the easy weeks, but on the hard ones too.",
    ],
    evidence: [
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield's prescription for time-crunched amateurs — three weeks build, one week deload, intensity protected — is the rhythm Roadman applies inside the masters cohort.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Joe Friel — The Cyclist's Training Bible",
        detail:
          "Friel's framework for periodising around limited weekly hours is the underpinning logic for the 6-8 hour template.",
        href: "/guests/joe-friel",
      },
      {
        label: "Dan Lorang — Roadman Podcast",
        detail:
          "Lorang has been explicit on the podcast: copy the structure, not the volume. The lesson translated into a working amateur's plan is what this template encodes.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman Not Done Yet — case data",
        detail:
          "Documented FTP gains across the time-crunched masters cohort running 6-8 structured hours with one weekly strength session.",
        href: "/blog/cycling-training-plan-masters-over-40",
      },
    ],
    faq: [
      {
        question: "Can I get faster cycling 5 hours a week with a full-time job?",
        answer:
          "Yes — particularly in your first 12-18 months of structured training. The constraint isn't hours; it's whether each session has a clear purpose. Two interval sessions, one strength session, and one long zone 2 ride inside 5 hours can lift FTP from a recreational baseline into the committed-amateur band.",
      },
      {
        question: "When should I train if I work 9-5?",
        answer:
          "Most working amateurs do best with two early mornings (Tuesday and Thursday work cleanly because Wednesday becomes recovery) plus the weekend. If you can only do evenings, accept that quality drops after a 12-hour day — keep intervals to one weekday and protect them with a lighter day before.",
      },
      {
        question: "Is indoor training better for time-crunched cyclists?",
        answer:
          "For weekday quality sessions, yes. A 60-minute indoor threshold session delivers more usable training than a 75-minute outdoor session interrupted by junctions, traffic, and cold legs. For weekend volume, outdoor wins on engagement and durability — and durability is what most masters are actually under-trained on.",
      },
      {
        question: "Should I train through travel weeks?",
        answer:
          "Treat travel weeks as a structured recovery block — short hotel-gym sessions, walk a lot, and don't beat yourself up. Trying to maintain quality through a chaotic travel week is how the well-intentioned amateur ends up with one good week followed by three sub-par ones. Better to lose four days deliberately than four weeks accidentally.",
      },
    ],
    related: [
      {
        label: "How many hours should I train per week cycling?",
        href: "/question/cycling-training-hours-per-week",
      },
      {
        label: "How should cyclists over 40 train?",
        href: "/question/how-should-cyclists-over-40-train",
      },
      {
        label: "Cycling Training Plan — Masters Over 40",
        href: "/blog/cycling-training-plan-masters-over-40",
      },
      {
        label: "Polarised vs Sweet Spot for Masters Cyclists",
        href: "/compare/polarised-vs-sweet-spot-masters",
      },
      {
        label: "Cycling Coaching — Topic Hub",
        href: "/topics/cycling-coaching",
      },
    ],
    cta: {
      eyebrow: "WHEN THE PLAN FITS BUT THE NUMBER WON'T MOVE",
      heading: "The Plateau Diagnostic finds what's leaking.",
      body: "Built for working amateurs who've been doing the right hours and need an honest read on what's actually blocking the gain.",
      href: "/plateau",
      label: "Take the Plateau Diagnostic",
    },
  },
  {
    slug: "why-losing-power-with-age",
    cluster: "masters",
    question: "Why Am I Losing Power as I Age?",
    seoTitle: "Why Am I Losing Cycling Power as I Age? The Honest Answer",
    seoDescription:
      "Why cyclists lose power with age — sarcopenia, VO2max decline, recovery debt, and grey-zone training. What's biology, what's fixable, and where to start.",
    pillar: "coaching",
    shortAnswer:
      "You're not losing power because you're old. You're losing it because muscle mass declines about 8% per decade after 40 without strength training, recovery capacity drops, and most masters cyclists keep training the way they did at 30. Real biological decline in trained athletes is closer to 5% per decade — most of the rest is fixable. The fix is structural, not heroic.",
    bestFor:
      "Riders in their 40s and 50s watching their FTP slide despite training as hard as ever — and ready to address the system, not just push harder.",
    notFor:
      "Riders looking for a single supplement, gadget, or shortcut. The fixes are boring: strength, sleep, fuelling, structured intensity.",
    keyTakeaway:
      "Most age-related power loss in trained cyclists is sarcopenia and recovery debt — both are trainable, neither is destiny.",
    evidenceLevel: "strong",
    evidenceNote:
      "Built on the published masters athlete literature (Tanaka & Seals on VO2max decline, Faulkner on sarcopenia), Iñigo San Millán's mitochondrial work, and the Roadman expert network — Wakefield, Lorang, Friel, Galpin.",
    fullExplanation: [
      "The first thing to separate out is what's biology and what's behaviour. Tanaka and Seals' work on age-related VO2max decline — the most-cited paper in this conversation — shows trained endurance athletes lose roughly 5% of VO2max per decade. Sedentary adults lose closer to 10%. So if your FTP has dropped 15% in 5 years, only a fraction of that is age. The rest is something you can do something about.",
      "The biggest 'something' is sarcopenia — age-related muscle loss. After 40, untrained adults lose around 3-8% of muscle mass per decade depending on whose data you read. For cyclists, that translates directly into less force per pedal stroke and a lower top-end. Andy Galpin has talked about this on the Roadman Cycling Podcast — fast-twitch fibres atrophy first, which is why older cyclists feel the loss most on accelerations and short climbs. The defence is non-negotiable resistance training, twice a week, focused on heavy compound lifts. Without it, you are choosing the steepest version of the curve.",
      "The second blocker is recovery debt. Same load, more fatigue. The masters research is consistent: 48-72 hours between hard sessions is the standard prescription for under-40 amateurs; for over-45 it stretches to 72-96. The cyclist who runs Tuesday-Thursday-Saturday hard for years is fine at 35 and quietly under-recovered at 50. Fix that by spreading hard sessions further apart, prioritising sleep as the single biggest performance lever, and protecting one full rest day a week. Most of the riders inside the Not Done Yet community who've reversed an FTP slide did it by training less, not more.",
      "The third blocker is the one nobody wants to admit: most masters cyclists are still training like they're 32. Same intervals. Same group rides. Same off-season volume. The structural change that consistently moves the number is rebalancing toward a true 80/20 polarised distribution — more zone 2, sharper but less frequent threshold work, two strength sessions, and properly fuelled long rides. The question 'why am I losing power' usually has the same answer it had at 32: the system is leaking. The difference is that at 50, the system is less forgiving — so the leaks show up faster.",
    ],
    evidence: [
      {
        label: "Tanaka & Seals — VO2max decline with age",
        detail:
          "Reference paper showing trained endurance athletes lose roughly 5% VO2max per decade vs ~10% for sedentary adults — establishing how much of age-related decline is trainable.",
      },
      {
        label: "Andy Galpin — Roadman Podcast",
        detail:
          "Galpin's conversation on fast-twitch fibre loss after 40 anchors the strength-training case for masters cyclists.",
        href: "/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40",
      },
      {
        label: "Iñigo San Millán — mitochondrial training",
        detail:
          "San Millán's work explains why zone 2 protects mitochondrial density — the substrate that ages slowest if you train it deliberately.",
      },
      {
        label: "Roadman Masters Cycling Training Report (2026)",
        detail:
          "Aggregates the masters literature with the Roadman coaching network's case data on FTP retention and recovery windows after 40.",
        href: "/blog/masters-cycling-training-report-2026",
      },
    ],
    faq: [
      {
        question: "How much power do you lose per year after 40?",
        answer:
          "Untrained adults lose around 1% of VO2max per year after 40. Trained cyclists lose closer to 0.5%, and trained masters who include strength work and quality intensity often hold flat or even improve into their late 40s and early 50s. The annual figure isn't a constant — it's a reflection of what you're doing about it.",
      },
      {
        question: "Can I get my FTP back to where it was at 35?",
        answer:
          "For most masters under 55 with no underlying health issues, yes — provided the FTP slide came from training drift, not biology. The cohort inside Not Done Yet who recover lost FTP almost always do it the same way: structured polarised volume, two strength sessions, deeper recovery, and properly fuelled long rides. Six to twelve months is the realistic window.",
      },
      {
        question: "Is the power loss permanent?",
        answer:
          "Most of it isn't. The portion driven by sarcopenia is reversible with consistent strength training. The portion driven by recovery debt reverses inside weeks once you give the system room to breathe. The truly age-driven portion — the 5% per decade in trained athletes — is the smallest piece and the only one outside your direct control.",
      },
      {
        question: "Should I just accept the decline and ride for fun?",
        answer:
          "If that's what you want, ride for fun. But the data is clear: the cyclists in their 50s and 60s still riding strongly haven't 'beaten the curve' — they've just trained on the right side of it. The Roadman position, and the reason 'Not Done Yet' exists, is that the slide is far less inevitable than the cycling internet suggests.",
      },
    ],
    related: [
      {
        label: "Losing Power After 40 — What to Do About It",
        href: "/problem/losing-power-after-40",
      },
      {
        label: "How should cyclists over 40 train?",
        href: "/question/how-should-cyclists-over-40-train",
      },
      {
        label: "Should I do strength training as a cyclist over 40?",
        href: "/question/strength-training-cyclist-over-40",
      },
      {
        label: "Cycling Over 40 — Getting Faster Guide",
        href: "/blog/cycling-over-40-getting-faster",
      },
      {
        label: "Andy Galpin on fast-twitch fibres after 40",
        href: "/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40",
      },
    ],
    cta: {
      eyebrow: "BEFORE YOU ACCEPT THE DECLINE",
      heading: "Find out which leak is yours.",
      body: "The Plateau Diagnostic is built for masters cyclists who've felt the slide and want to know whether it's biology, recovery, fuelling, or programming.",
      href: "/plateau",
      label: "Take the Plateau Diagnostic",
    },
  },
  {
    slug: "how-to-increase-ftp-after-40",
    cluster: "masters",
    question: "How to Increase FTP After 40",
    seoTitle: "How to Increase FTP After 40 — The Masters Cyclist's Playbook",
    seoDescription:
      "How masters cyclists actually lift FTP after 40 — the polarised-plus-strength template, recovery windows, fuelling, and the changes that work when 'just train harder' has stopped working.",
    pillar: "coaching",
    shortAnswer:
      "After 40, FTP gains come from four moves: polarised intensity (80% genuine zone 2, 20% properly hard), two strength sessions a week, 72-96 hours between hard rides, and properly fuelled long rides. Most masters cyclists hold or lift FTP doing less but better — the model that works at 32 is rarely the model that works at 48.",
    bestFor:
      "Masters cyclists who've trained for years, watched FTP slide, and are ready to restructure rather than just push harder.",
    notFor:
      "Riders new to structured training — your first FTP gain comes from doing anything consistent. The masters-specific levers kick in once you've already plateaued.",
    keyTakeaway:
      "After 40, the system around the work matters more than the work itself — fix the system and the FTP follows.",
    evidenceLevel: "strong",
    evidenceNote:
      "Built on Seiler's polarised research, Rønnestad's strength training studies, the Roadman expert network (Wakefield, Lorang, Galpin, Friel), and case data from the Not Done Yet masters cohort.",
    fullExplanation: [
      "Anthony has had this conversation more times than any other on the Roadman Cycling Podcast — with John Wakefield, Dan Lorang, Joe Friel, Andy Galpin. The consensus is direct. Increasing FTP after 40 is rarely about training harder. The over-40 amateur who tries to push their way out of a plateau is usually the one most over-trained and least adapted. The masters playbook is structural: change the inputs, then let the body respond.",
      "Move one is the intensity distribution. Run polarised — roughly 80% genuine zone 2, 15-20% properly above threshold, almost nothing in the middle. Seiler's research is unambiguous and the masters case data inside Not Done Yet matches it: the cohort who restructured to 80/20 and held it for 12-16 weeks produced the largest FTP gains. The cohort who stayed in sweet spot or grey-zone training mostly stayed flat or slid backwards.",
      "Move two is non-negotiable strength training. Bent Rønnestad's research showed 8-15% FTP gains for cyclists who added structured heavy resistance training two days a week — without increasing bike volume. After 40, that finding is even sharper. Andy Galpin's work explains why: fast-twitch fibres atrophy first, and they're the fibres carrying short hard efforts and accelerations. Two sessions a week — squats, deadlifts, single-leg work, hip hinges — protects the engine that carries the threshold work. Skip it and you're capped.",
      "Move three is recovery as infrastructure. The over-40 cyclist needs 72-96 hours between hard sessions, not the 48-72 hours that worked at 32. Sleep is the single biggest performance lever — the Roadman masters report references this directly. Fuel long rides properly (70-90g of carbohydrate per hour for build-phase amateurs) so your body doesn't dig into recovery debt. One full rest day a week, every week. None of this is glamorous. All of it consistently works.",
      "Move four is the deload. Three weeks build, one week deload, repeat. The masters cyclists who lift FTP after 40 inside the Roadman community almost always do it via shorter, sharper build blocks with disciplined deloads — not heroic 8-week marathons. The body that's adapted, recovered, and properly fuelled responds. The body that's pushed without those three doesn't, no matter how hard the rider trains.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — polarised training research",
        detail:
          "Seiler's 80/20 framework is the dominant intensity model for masters FTP gain — the structural lever the case data inside Roadman keeps confirming.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "Bent Rønnestad — strength training for cyclists",
        detail:
          "Rønnestad's published research showing 8-15% FTP gains from heavy resistance training without added bike volume is the strongest single masters intervention.",
      },
      {
        label: "Andy Galpin — Roadman Podcast",
        detail:
          "Galpin's work on fast-twitch fibre loss after 40 explains why strength is non-negotiable for masters cyclists trying to lift FTP rather than just hold it.",
        href: "/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield's masters prescription — 72-96 hour recovery windows, polarised distribution, protected intensity — is the operating template Roadman uses inside Not Done Yet.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Roadman Masters Training Report (2026)",
        detail:
          "Aggregates the evidence base and the Roadman coaching network's case data on what actually moves FTP after 40.",
        href: "/blog/masters-cycling-training-report-2026",
      },
    ],
    faq: [
      {
        question: "Can a 50-year-old cyclist still increase FTP?",
        answer:
          "Yes — and most can lift FTP further than they assume, particularly if they've never done structured strength training or run a true polarised distribution. The masters cohort inside Not Done Yet routinely sees 5-12% FTP gains in the first 16-week structured block. The slide doesn't continue when the inputs change.",
      },
      {
        question: "How long does it take to lift FTP after 40?",
        answer:
          "A 12-16 week structured block is the standard window for a measurable FTP gain in masters athletes. The change in trajectory shows up faster — better recovery and cleaner zones inside 4-6 weeks — but the FTP number reflects compounded adaptation, which takes time. The deeper answer is in the Roadman piece on FTP improvement timelines.",
      },
      {
        question: "Should I cut training hours to lift FTP after 40?",
        answer:
          "Often, yes. The masters cyclist who drops from 12 chaotic hours to 8 structured hours, with strength training and proper recovery, almost always lifts FTP. The hours weren't the problem — the lack of structure and recovery around them was.",
      },
      {
        question: "Do I need a coach to increase FTP after 40?",
        answer:
          "Not necessarily, but the riders who get it most wrong tend to be self-coached masters who can't see the leaks in their own programme. A coach (or a community with structured plans like Not Done Yet) gives you the outside read that catches the patterns in your data you've stopped noticing.",
      },
    ],
    related: [
      {
        label: "How long does it take to increase FTP?",
        href: "/question/how-long-to-increase-ftp",
      },
      {
        label: "Why am I losing power as I age?",
        href: "/question/why-losing-power-with-age",
      },
      {
        label: "Should I do strength training as a cyclist over 40?",
        href: "/question/strength-training-cyclist-over-40",
      },
      {
        label: "Polarised vs Sweet Spot for Masters Cyclists",
        href: "/compare/polarised-vs-sweet-spot-masters",
      },
      {
        label: "Masters Cycling Training Report (2026)",
        href: "/blog/masters-cycling-training-report-2026",
      },
    ],
    cta: {
      eyebrow: "STILL FIGURING OUT WHICH LEVER TO PULL",
      heading: "The Plateau Diagnostic shows you which one matters most.",
      body: "Built for masters cyclists who've tried 'train harder' and need an honest read on what's actually capping the FTP — intensity, strength, recovery, or fuelling.",
      href: "/plateau",
      label: "Take the Plateau Diagnostic",
    },
  },
  {
    slug: "cycling-recovery-tips-older-riders",
    cluster: "masters",
    question: "Cycling Recovery Tips for Older Riders",
    seoTitle: "Cycling Recovery Tips for Older Riders — What Actually Works",
    seoDescription:
      "Recovery for cyclists over 40 — the levers that actually move the needle. Sleep, fuelling, hard-day spacing, deloads, and what most masters get wrong.",
    pillar: "recovery",
    shortAnswer:
      "For cyclists over 40, the recovery levers that actually matter are sleep (7-9 hours, dark room, cool temperature), 72-96 hours between hard sessions, properly fuelled long rides (70-90g carbs/hr in build phase), one full rest day every week, and a planned deload every fourth week. Ice baths, gadgets and supplements are secondary — the basics, done consistently, deliver almost all the gain.",
    bestFor:
      "Riders over 40 who train consistently, ride hard, and feel the recovery cost more than they used to.",
    notFor:
      "Riders looking for a single supplement, gadget, or trick that replaces sleep and structure.",
    keyTakeaway:
      "Older cyclists don't need a longer list of recovery tools — they need to defend the boring basics every single week.",
    evidenceLevel: "strong",
    evidenceNote:
      "Built on the masters athlete recovery literature (Tanaka & Seals, Faulkner sarcopenia work), Matthew Walker's sleep research, and the Roadman case data on what actually rebuilds masters cyclists between hard sessions.",
    fullExplanation: [
      "The honest summary first: the cycling internet sells masters recovery as a stack of gadgets, supplements, and protocols. The published evidence and the case data inside Roadman's masters cohort point somewhere much less marketable — sleep, fuelling, hard-day spacing, and deloads. None of them are sexy. All of them, defended every week, produce almost all of the recovery delta that separates the over-40 cyclist who keeps progressing from the one who doesn't.",
      "Sleep first. Matthew Walker's research is the cleanest version of the case: trained athletes who drop below seven hours a night for a week show measurable losses in time-to-exhaustion, reaction time, and recovery markers. The masters effect is sharper. The riders inside Not Done Yet who fix their sleep — earlier wind-down, dark cool room, alcohol-free midweek, no late-night screens — usually report inside two weeks that their HRV trend lifts and their recovery rides actually feel like recovery. The gain is structural and free.",
      "Hard-day spacing is the second lever and the easiest to get wrong. The standard amateur template — Tuesday hard, Thursday hard, Saturday hard — was built for athletes under 40. The masters research suggests stretching that to 72-96 hours between hard sessions. Many over-40 cyclists do well with one mid-week quality session and one weekend mixed-intensity ride, with the rest of the week properly easy zone 2 plus a strength day. Less hard work, properly recovered, beats more hard work, chronically under-recovered.",
      "Fuelling is the third. The masters cyclist who under-fuels long rides — 30-40g of carbohydrate per hour, often justified as 'training the fat-burning' — pays for it with cratered next-day recovery and stalled FTP. Build-phase amateurs need 70-90g per hour. Add adequate protein (around 1.6-2.2g per kg of bodyweight per day, with attention to evening dosing — there's published work on bedtime protein for masters recovery). Hydrate properly. None of this is glamorous, all of it lets the other levers work.",
      "Two more things, then the gadgets. The fourth lever is the planned deload — three weeks build, one week deload, every block. The masters cyclists who never deload are the ones who plateau the fastest. The fifth is one full rest day every week, defended like a meeting on the calendar. Once those five are in place, ice baths and recovery boots and tart cherry juice can give you a 1-2% lift if you've already got the 90% from the basics. Get them backwards and nothing else compensates.",
    ],
    evidence: [
      {
        label: "Matthew Walker — sleep & athletic recovery",
        detail:
          "Walker's published research and book ('Why We Sleep') anchors the case for sleep as the primary masters recovery lever. The performance cost of chronic short sleep is consistently larger than most cyclists assume.",
      },
      {
        label: "Cycling After 40 Recovery Report (2026)",
        detail:
          "Roadman's published synthesis of the masters recovery literature — recovery windows, sleep architecture, sarcopenia, and hormonal context.",
        href: "/blog/cycling-after-40-recovery-report-2026",
      },
      {
        label: "Bedtime protein protocol — Roadman",
        detail:
          "Roadman's deep-dive on the published protein-before-sleep research and how masters cyclists can implement it without overhauling their nutrition.",
        href: "/blog/bedtime-protein-cyclists-recovery-protocol",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield's prescription for the masters cohort — 72-96 hour windows between hard sessions, intensity protected, deloads disciplined — is the operating template Roadman runs inside Not Done Yet.",
        href: "/guests/john-wakefield",
      },
    ],
    faq: [
      {
        question: "How many days off should an older cyclist take per week?",
        answer:
          "At least one full rest day a week, defended every week. Many masters do better with two — one full rest, one true active recovery (30-45 minutes very easy spinning). The cohort that progresses across years usually rests more than the cohort that flames out at year two or three.",
      },
      {
        question: "Are ice baths and saunas worth it for older cyclists?",
        answer:
          "They have a measurable but secondary effect. Cold immersion can blunt some inflammatory adaptations if used right after strength work, and saunas have promising heat-acclimation data. Neither replaces sleep, fuelling, and hard-day spacing. Use them as a 1-2% addition once the basics are nailed, not as a substitute.",
      },
      {
        question: "Why do I take so long to recover after long rides at 50?",
        answer:
          "Three reasons. Muscle fibre damage takes longer to repair as we age (the published sarcopenia research underpins this). Glycogen replenishment is slower if fuelling is sub-optimal. And many over-50 cyclists are training on a baseline of recovery debt they don't realise they're carrying. Fixing all three — strength training, deliberate fuelling, and respecting recovery windows — usually shortens the post-long-ride hangover noticeably.",
      },
      {
        question: "Should masters cyclists track HRV?",
        answer:
          "Yes, but as a trend line, not a daily oracle. A 7-14 day downward trend in HRV is a real signal that recovery isn't keeping up. A single low day is usually one bad night's sleep. Use HRV to spot the bigger pattern; don't let it dictate whether to ride tomorrow.",
      },
    ],
    related: [
      {
        label: "Recovery for cyclists over 50",
        href: "/question/recovery-for-cyclists-over-50",
      },
      {
        label: "Cycling After 40 Recovery Report (2026)",
        href: "/blog/cycling-after-40-recovery-report-2026",
      },
      {
        label: "Bedtime Protein Protocol for Cyclists",
        href: "/blog/bedtime-protein-cyclists-recovery-protocol",
      },
      {
        label: "Cycling Active Recovery — Explained",
        href: "/blog/cycling-active-recovery-explained",
      },
      {
        label: "Masters Recovery Score Tool",
        href: "/tools/masters-recovery-score",
      },
    ],
    cta: {
      eyebrow: "WHEN RECOVERY IS THE LEAK",
      heading: "Find out exactly what's blocking your gains.",
      body: "The Plateau Diagnostic identifies whether your stalled FTP is a recovery problem, a fuelling problem, or a programming problem — in 4 minutes.",
      href: "/plateau",
      label: "Take the Plateau Diagnostic",
    },
  },
  {
    slug: "strength-training-cyclist-over-40",
    cluster: "masters",
    question: "Should I Do Strength Training as a Cyclist Over 40?",
    seoTitle: "Should Cyclists Over 40 Lift Weights? The Honest Answer",
    seoDescription:
      "Should you strength train as a cyclist over 40? The published evidence (Rønnestad), the masters case for it, and the two-session-a-week template that actually works.",
    pillar: "strength",
    shortAnswer:
      "Yes — and after 40, it's the single highest-return non-cycling intervention you can make. Heavy resistance training twice a week produces 8-15% FTP gains without adding bike volume (Rønnestad), protects fast-twitch muscle from age-related loss, and improves cycling economy by 4-5%. Skip it after 40 and you're choosing the steepest version of the decline curve.",
    bestFor:
      "Masters cyclists training under 12 hours a week who want to keep gaining power, protect against injury, and stay competitive into their 50s and 60s.",
    notFor:
      "Riders unwilling to commit to two consistent sessions a week — sporadic strength work is closer to no strength work than to the published-evidence dose.",
    keyTakeaway:
      "After 40, strength training stops being optional — it becomes the protective layer that keeps the bike work from running out of muscle to push.",
    evidenceLevel: "strong",
    evidenceNote:
      "Built on Bent Rønnestad's published research, Andy Galpin's masters fast-twitch work, and the Roadman case data inside Not Done Yet — alongside the gym-vs-bike strength training literature reviewed in our 2026 report.",
    fullExplanation: [
      "If there's one near-consensus inside the Roadman expert network, it's this one. Bent Rønnestad's published research is the single cleanest piece of evidence — heavy resistance training twice a week, alongside normal cycling volume, lifted FTP by 8-15% in trained cyclists. Cycling economy improved by 4-5%. Time-to-exhaustion at threshold went up. The cost was 60-90 minutes twice a week. The return per hour is hard to find anywhere else in the masters playbook.",
      "After 40, the case sharpens. Andy Galpin has been clear on the Roadman Cycling Podcast: fast-twitch fibres atrophy first with age, and they're the fibres that carry short hard efforts, accelerations, and the top-end of your FTP. Without resistance training, you're losing them by 3-8% a decade. With it, you can hold or even build them into your 50s and 60s. Watching a 55-year-old who lifts ride away from a 35-year-old who doesn't is a regular feature of any serious masters training group — the work is the difference.",
      "The honest counter-argument: 'lifting will make me bulky and slow me down.' The published research doesn't support this for the protocols that actually deliver FTP gains — heavy compound lifts (squats, deadlifts, single-leg work, hip hinges) at low rep ranges (3-6 reps, 3-5 sets) twice a week. Hypertrophy isn't the goal and isn't what happens at this dose. What happens is neural — better motor unit recruitment, stiffer tendons, more force per pedal stroke. The masters who report feeling 'too bulky' are usually doing high-rep bodybuilding sessions, not the strength template that moves cycling performance.",
      "Practically, the template Roadman runs inside Not Done Yet is two sessions a week, ideally on the same days as a hard ride (so you're not stacking another stressful day) or on a separate strength day if your week allows. Squats, deadlifts, lunges or split squats, a hip hinge variant, and core. 45-60 minutes including warm-up. Heavy enough to be hard at 3-5 reps. Off-season builds the foundation; in-season maintains it. Skip it for 8 weeks and you'll feel the loss on every steep climb.",
    ],
    evidence: [
      {
        label: "Bent Rønnestad — strength training for cyclists",
        detail:
          "Rønnestad's published trials showing 8-15% FTP gains from 8-12 weeks of heavy resistance training without added bike volume — the strongest single masters intervention.",
      },
      {
        label: "Andy Galpin — Roadman Podcast",
        detail:
          "Galpin's research and conversation on fast-twitch fibre loss after 40 establishes why strength training is non-negotiable rather than optional for masters cyclists.",
        href: "/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40",
      },
      {
        label: "Roadman strength training research review",
        detail:
          "Roadman's synthesis of the gym-vs-more-miles literature, including the published meta-analyses on age-group cyclists and the case data from the masters cohort.",
        href: "/blog/gym-vs-bike-strength-training-cyclists-research",
      },
      {
        label: "Roadman Strength Training Course",
        detail:
          "The published Roadman strength programme that operationalises the Rønnestad protocol for masters cyclists who don't have a coach.",
        href: "/strength-training",
      },
    ],
    faq: [
      {
        question: "How many strength sessions per week for cyclists over 40?",
        answer:
          "Two is the published-evidence standard and the dose that delivers most of the FTP gain. Three can work in off-season for riders who recover well; one is enough for in-season maintenance once the foundation is built. Below one a week is closer to no programme than to the published research.",
      },
      {
        question: "When should I do strength training in my cycling week?",
        answer:
          "Two patterns work. Stack it on hard ride days — fewer total stressful days, more recovery days clean. Or run it as standalone strength days with easy or rest cycling around them. Avoid putting heavy lower-body strength on the day before a key cycling session.",
      },
      {
        question: "Will lifting make me a slower climber?",
        answer:
          "If you're doing high-rep bodybuilding-style sessions and gaining 8kg of upper-body muscle, yes. If you're doing the heavy-low-rep cycling-specific protocol — squats, deadlifts, single-leg work — the evidence consistently shows the opposite: faster climbing, better economy, more durability. The protocol matters more than the activity.",
      },
      {
        question: "Can I just do bodyweight or do I need a gym?",
        answer:
          "Bodyweight gets you most of the way for the first 3-6 months, particularly if you're new to strength work. Beyond that, the published gains require external load — barbells, dumbbells, kettlebells. The masters cohort inside Roadman who've shifted from bodyweight to loaded sessions report the bigger jump came in the second phase.",
      },
    ],
    related: [
      {
        label: "Do older cyclists need strength training?",
        href: "/question/do-older-cyclists-need-strength",
      },
      {
        label: "Strength Training vs More Miles",
        href: "/compare/strength-vs-more-miles",
      },
      {
        label: "Cycling Strength Training Guide",
        href: "/blog/cycling-strength-training-guide",
      },
      {
        label: "Andy Galpin on fast-twitch fibres after 40",
        href: "/blog/andy-galpin-fast-twitch-fibres-cyclist-after-40",
      },
      {
        label: "Roadman Strength Training Programme",
        href: "/strength-training",
      },
    ],
    cta: {
      eyebrow: "READY TO STOP LEAVING POWER ON THE TABLE",
      heading: "The Plateau Diagnostic reveals where strength fits in your week.",
      body: "Built for masters cyclists who suspect strength is the missing piece — and want a structured read on where exactly the FTP is leaking.",
      href: "/plateau",
      label: "Take the Plateau Diagnostic",
    },
  },
  // ============================================================
  // TRAINING METHODOLOGY CLUSTER
  // ============================================================
  {
    slug: "how-often-vo2max-intervals-cycling",
    cluster: "training",
    question: "How Often Should I Do VO2max Intervals?",
    seoTitle: "How Often Should I Do VO2max Intervals Cycling?",
    seoDescription:
      "How often serious amateur cyclists should do VO2max intervals — once a week as a baseline, twice in a focused block, never more. The session frequency that lifts the ceiling without breaking the rest of the week.",
    pillar: "coaching",
    shortAnswer:
      "Once a week as a baseline. Twice a week in a focused 3-4 week block. More than that and you accumulate fatigue faster than you adapt — the session quality collapses and so does the rest of the week. Allow 48 hours minimum between VO2max sessions and any other quality work.",
    bestFor:
      "Trained amateurs who already have a base, ride 6-12 hours a week, and want to lift their FTP ceiling rather than rebuild it.",
    notFor:
      "Riders inside their first three months of structured training — VO2max work is the icing on a base that has to be built first.",
    keyTakeaway:
      "VO2max sessions are an injection, not a routine — the week is built around them, not on top of them.",
    evidenceLevel: "strong",
    evidenceNote:
      "Anchored in Stephen Seiler's polarised-distribution research, John Wakefield's published Bora-Hansgrohe protocols, and Roberto Vukovic's amateur dose-response work.",
    fullExplanation: [
      "VO2max work is the highest-intensity quality session most amateurs ever run — typically 4-8 efforts of 3-5 minutes at 105-115% of FTP. It lifts the aerobic ceiling that everything else sits underneath. Stephen Seiler has been clear on the podcast: a single weekly VO2max session, kept really hard, will move the needle for almost any trained amateur. The mistake isn't doing too few — it's adding more before the first one has produced any adaptation.",
      "The realistic frequency picture looks like this. In an aerobic base block, drop VO2max work entirely and protect zone 2 plus tempo. In a build phase, one VO2max session a week is the baseline. In a focused 3-4 week 'block periodisation' push — the John Wakefield-style protocol Roadman has covered with the Bora coaching staff — twice a week works, but only inside that block, and only for riders who can recover. Past three weeks at twice a week, performance starts collapsing. Drop back to one a week, or to maintenance.",
      "The recovery rule is the part that's easy to miss. A real VO2max session leaves a 48-hour shadow on power. Stack a sweet-spot or threshold day on top of that and quality plummets in both. The structure that consistently works for amateurs is: VO2max Tuesday, easy zone 2 Wednesday, threshold or sweet spot Friday, long zone 2 Saturday or Sunday. The rest of the week is properly easy. If easy days creep into tempo, the VO2max session can't be the right intensity by Tuesday — and the cycle breaks.",
      "Two practical signals to watch. First, your interval power should hold across the session — if reps 6-8 collapse to 92% of rep 1, the dose was correct. If they collapse to 78%, you went out too hard or you weren't recovered enough. Second, if your easy-day power feels noticeably harder a day after a VO2max, you are absorbing the work — that's the signal. If your easy-day power feels heroic, you're not recovered, and the next VO2max should be deferred 48 hours.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — polarised training, podcast",
        detail:
          "Seiler's distribution research: roughly 80% of training below VT1 and 20% well above VT2 produces the most reliable amateur adaptation. The 20% covers VO2max once or twice a week, not three.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "John Wakefield — Bora-Hansgrohe protocols, podcast",
        detail:
          "Wakefield (Director of Coaching at Red Bull-Bora-Hansgrohe) has detailed the block-periodisation pattern Roadman uses for amateurs — short focused blocks of higher VO2max density, then back off.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Roberto Vukovic — VO2max dose-response",
        detail:
          "Vukovic's published amateur protocols and case data show clear diminishing returns past 2 sessions per week, and accelerated overtraining risk at 3+.",
        href: "https://robertovukovic.com/vo2max-intervals-cycling/",
      },
      {
        label: "Habis 2024 — low-cadence interval study, PLOS ONE",
        detail:
          "Adjacent evidence — the Habis et al. study on cadence and VO2max gain reinforces that the dose at the high end is small and high-quality.",
      },
    ],
    faq: [
      {
        question: "Can I do VO2max intervals twice a week?",
        answer:
          "Yes, but only inside a defined 3-4 week block, and only if the rest of the week is really easy. Twice-a-week VO2max as a default routine doesn't survive — the second session always slips in quality, and the recovery debt compounds across the month.",
      },
      {
        question: "How many weeks of VO2max work before I see results?",
        answer:
          "Three to six weeks of consistent quality work. Most of the visible FTP gain shows up in the recovery week after the block, not during it. If you tested mid-block expecting a number to lift, you'll usually be disappointed — that's training fatigue masking the gain.",
      },
      {
        question: "What's the best VO2max interval session for amateurs?",
        answer:
          "5-minute repeats at 105-115% FTP are the workhorse: 4-6 efforts with 3-5 minutes recovery. 30/30s (30 seconds on, 30 off, 13 reps) work well as a variation in the second half of a block. 8-minute repeats are the highest dose — usually 3 efforts max.",
      },
      {
        question: "Should masters cyclists do VO2max work less often?",
        answer:
          "Not less often — but with longer recovery. Masters cyclists over 50 typically need 72-96 hours between VO2max and any other quality work, where a 30-year-old can stack at 48. Once a week, fully recovered, beats twice a week half-cooked.",
      },
    ],
    related: [
      {
        label: "Polarised, Pyramidal or Sweet Spot — Honest Comparison",
        href: "/question/polarised-vs-pyramidal-vs-sweet-spot",
      },
      {
        label: "How Long Does It Take to Increase FTP?",
        href: "/question/how-long-to-increase-ftp",
      },
      {
        label: "Why Is My FTP Not Improving?",
        href: "/question/why-ftp-not-improving",
      },
      {
        label: "Polarised Training Cycling Guide",
        href: "/blog/polarised-training-cycling-complete-guide",
      },
      {
        label: "FTP Training Topic Hub",
        href: "/topics/ftp-training",
      },
    ],
  },
  {
    slug: "should-cyclists-train-fasted",
    cluster: "training",
    question: "Should I Train Fasted as a Cyclist?",
    seoTitle: "Should I Train Fasted as a Cyclist? — The Honest Answer",
    seoDescription:
      "When fasted training helps, when it wrecks your week, and how to use it without bonking 60km from home. The Roadman position grounded in the published research and real World Tour practice.",
    pillar: "nutrition",
    shortAnswer:
      "Sometimes — and never on the days that matter. One or two short, easy fasted zone 2 rides a week (60-90 minutes, conversational, no quality work after) can produce a small fat-oxidation adaptation. Fasted threshold, VO2max, or rides over 90 minutes are a trap — they crater the session, the recovery, and usually the rest of the week.",
    bestFor:
      "Trained amateurs adding a small periodisation lever in base season — already eating enough on hard days, already protecting protein.",
    notFor:
      "Anyone trying to lose weight by fasting on the bike. Fasted training is not a weight-loss tactic. Riders with a history of low energy availability should skip this entirely.",
    keyTakeaway:
      "Fasted training is a niche tool for base-phase aerobic riders. It's not a shortcut, and it isn't free — every fasted ride costs something elsewhere.",
    evidenceLevel: "moderate",
    evidenceNote:
      "Built on Van Proeyen 2011 (PMC), the Burke train-low review, World Tour practice as discussed by Dr David Dunne, and the consistent picture across Roadman coaching cases.",
    fullExplanation: [
      "Fasted training has been a debate in cycling for fifteen years — much of it heat, very little of it light. The Van Proeyen 2011 paper showed real adaptation in fat oxidation and intramuscular triglyceride use when riders trained fasted in base. The follow-up Burke 'train low, race high' literature confirmed the basic mechanism. Both papers also flagged the cost: fasted high-intensity work compromises adaptation, and chronic under-fuelling produces the energy-availability problems behind RED-S. The honest answer sits in the middle of those two findings.",
      "What fasted training is good for: a short, easy aerobic ride done before breakfast, in base season, when the body has time to absorb a low-intensity stimulus without competing demands. 60-90 minutes, conversational, zone 2. The metabolic signal is real — slightly improved fat oxidation and a small mitochondrial bump — and the cost is contained. Dr David Dunne's framing on the podcast is the cleanest summary: 'A periodised tool, not a default. Used carefully, in the right phase, on the right rider.'",
      "What it isn't good for: anything that matters. Fasted threshold work, fasted VO2max, fasted long rides over 90 minutes — these reliably tank the session, increase muscle-protein breakdown, and steal recovery from whatever you do next. Anthony has been explicit on the podcast: 'You end up bonking 60k from home and end up absolutely hating your life — that's not training, that's a withdrawal symptom dressed up as discipline.' The sessions that produce FTP gain need to be fully fuelled. Always.",
      "The other red flag is using fasted training as a weight-loss tactic. The cycling research is unambiguous on this: training under-fuelled to lose weight reliably costs FTP, immune function, and (in women) menstrual function. The RED-S literature (relative energy deficiency in sport) is now the dominant frame for understanding what goes wrong. The Roadman position, anchored in those studies and in the published Lorang/Wakefield comments on World Tour fuelling, is direct: fuel the work, take the deficit on rest days, and don't try to shortcut body composition by riding hungry.",
      "Practical pattern that works for amateurs: in base phase, one or two short pre-breakfast zone 2 rides a week, with a high-protein breakfast immediately after. Don't stack fasted with hard sessions. Once you're in build or peak phases, drop them — every ride needs to be fuelled. Female cyclists, particularly perimenopausal masters, should treat fasted training with extra caution; the published literature on hormonal disruption from low energy availability is clear.",
    ],
    evidence: [
      {
        label: "Van Proeyen 2011 — fasted training adaptations, PMC",
        detail:
          "The foundational study on fasted endurance training adaptations — fat oxidation and intramuscular triglyceride changes documented in trained cyclists.",
        href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3253005/",
      },
      {
        label: "Dr David Dunne — Roadman Podcast",
        detail:
          "Dunne (World Tour nutritionist) framed fasted training as a periodised tool, never a default. The interview is the closest thing to a definitive Roadman position on the topic.",
        href: "/blog/david-dunne-world-tour-nutritionist-cycling-weight-loss",
      },
      {
        label: "Louise Burke — Train Low Race High research",
        detail:
          "Burke's review of train-low protocols clarifies which adaptations are real, which are exaggerated, and the conditions under which the costs exceed the gains.",
      },
      {
        label: "RED-S / LEA literature",
        detail:
          "The IOC Consensus on Relative Energy Deficiency in Sport documents the chronic-deficit risks that make weight-loss-via-fasted-training counterproductive.",
        href: "/problem/red-s-low-energy-availability",
      },
    ],
    faq: [
      {
        question: "Is fasted cycling good for fat loss?",
        answer:
          "Not as a primary tactic. The published research shows the day's fat-oxidation lift is tiny relative to total weekly energy balance, and the recovery cost of chronic fasted training reliably degrades training quality. Lose fat by fuelling sessions and taking the gap on rest days, not by riding hungry.",
      },
      {
        question: "How long should a fasted ride be?",
        answer:
          "60-90 minutes maximum, in zone 2, before breakfast. Beyond 90 minutes the muscle-glycogen depletion starts compromising recovery. Most coaches in the Roadman network cap fasted rides at 90 minutes for amateurs.",
      },
      {
        question: "Should women cyclists train fasted?",
        answer:
          "With more caution than men. The published literature on female endurance athletes shows higher rates of menstrual disruption from low energy availability, and perimenopausal cyclists are particularly sensitive. Fuel before harder sessions; reserve fasted to short, easy rides if used at all.",
      },
      {
        question: "Can I drink coffee on a fasted ride?",
        answer:
          "Yes — black coffee is fine and likely improves the ride quality slightly via caffeine ergogenics. Adding milk, sugar, or anything caloric breaks the fasted state. Most coaches treat black coffee as compatible with the protocol.",
      },
    ],
    related: [
      {
        label: "Fasted vs Fueled Cycling — Side by Side",
        href: "/blog/fasted-vs-fueled-cycling",
      },
      {
        label: "How to Lose Weight Without Losing Power",
        href: "/answers/lose-weight-without-losing-power",
      },
      {
        label: "Carbs Per Hour Cycling",
        href: "/question/carbs-per-hour-cycling",
      },
      {
        label: "How to Fuel a Long Ride",
        href: "/blog/carbohydrate-per-hour-cyclists",
      },
      {
        label: "RED-S — Low Energy Availability",
        href: "/problem/red-s-low-energy-availability",
      },
    ],
  },
  {
    slug: "am-i-doing-zone-2-right",
    cluster: "training",
    question: "Am I Doing Zone 2 Right?",
    seoTitle: "Am I Doing Zone 2 Right? — The 4 Tests",
    seoDescription:
      "How to know if your zone 2 rides are actually zone 2. The talk test, the heart rate drift check, and the four tells that say you're riding too hard on your easy days.",
    pillar: "coaching",
    shortAnswer:
      "Probably not. The most common amateur mistake is riding zone 2 at 75-80% of FTP because that's what feels productive — that's tempo, not zone 2. Real zone 2 is 56-75% of FTP, around 65-75% of max heart rate, and you can hold a full conversation in complete sentences without gasping between words.",
    bestFor:
      "Riders who think they're doing polarised but feel cooked by Friday — probably the largest single group of amateur cyclists.",
    notFor:
      "Riders looking for a workaround to ride harder. The fix is to slow down, not to redefine the zone.",
    keyTakeaway:
      "If you can't hold a full conversation, it's not zone 2. The fix is fixable — slow down, even if it feels stupid.",
    evidenceLevel: "strong",
    evidenceNote:
      "Anchored in Stephen Seiler's first ventilatory threshold work, the standard talk-test physiology, and John Wakefield's repeated podcast guidance on amateur intensity drift.",
    fullExplanation: [
      "Zone 2 is supposed to be the foundation of a polarised week — long, easy, conversational, the work that builds mitochondrial density and fat oxidation without producing fatigue. The reason most amateurs aren't getting the polarised benefit they expect isn't because the model is wrong; it's because they're riding zone 2 at tempo. The ego problem is real: riders don't want to go slow because it feels like they're not training. They are. They're just not adapting.",
      "The four tests that separate real zone 2 from amateur zone 2. First, the talk test — can you hold a full sentence without breaking for breath? Not 'a few words then a gasp', a full sentence. Stephen Seiler has used this on the podcast as the cleanest single check. Second, the heart rate test — sit at 65-75% of max HR, or 70-80% of lactate-threshold HR. Third, the power test — 56-75% of FTP, never above 75%. If you're regularly drifting to 78-82% on rolling terrain, that's tempo. Fourth, the next-day test — a true zone 2 ride should leave you feeling fresh the next day, not slightly cooked.",
      "The drift problem is the most common version of getting zone 2 wrong. You start the ride at the right power, then a hill arrives, you push 'just enough' over it, then you maintain that slightly higher number across the next 10 kilometres because it feels manageable. That's how three-quarters of amateur 'zone 2' rides become 65/35-distribution sweet-spot rides. The fix is mechanical: hard cap the power at 75% of FTP for outdoor rides, ease back on every climb, lift the cadence rather than the wattage. Dan Lorang and John Wakefield have both said the same thing on the podcast: pros are aggressive about going easy.",
      "If your zone 2 rides have all been too hard, the first signs that you've corrected come fast. Your weekly hard sessions feel sharper. Your sleep stabilises. Your morning resting heart rate drops. The fitness gain takes longer — usually 6-8 weeks of disciplined easy riding before mitochondrial adaptation translates into FTP — but the recovery dividend is immediate. Anthony has framed this on the podcast as the single biggest fixable pattern in amateur cycling: easy days that aren't easy.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — first ventilatory threshold framing",
        detail:
          "Seiler's repeated framing on the podcast: zone 2 is below VT1, the talk test still works, and amateurs systematically drift above the line.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "John Wakefield — Roadman Podcast",
        detail:
          "Wakefield's pro-team guidance: the easy days are aggressively easy, not 'kind of easy'. Amateurs miss the gap between the two.",
        href: "/guests/john-wakefield",
      },
      {
        label: "Dan Lorang — World Tour periodisation",
        detail:
          "Lorang's observed pro patterns reinforce the point — at the World Tour level zone 2 is actually conversational, much slower than amateurs believe.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Roadman Zone 2 vs Endurance article",
        detail:
          "Roadman's published guide on what zone 2 actually is, with the talk test and the power-and-HR ranges in detail.",
        href: "/blog/zone-2-vs-endurance-training",
      },
    ],
    faq: [
      {
        question: "What heart rate is zone 2 for cycling?",
        answer:
          "Roughly 65-75% of max HR, or 70-80% of lactate-threshold HR. For a rider with a max HR of 180 and an LTHR of 165, that's around 117-135 bpm or 116-132 bpm by the LTHR method. Use whichever you've calibrated more recently.",
      },
      {
        question: "How slow should zone 2 actually feel?",
        answer:
          "Slower than your ego wants. If it feels productive in the moment, it's probably tempo. If it feels almost too easy and you can chat with a friend in full sentences, that's the right pace.",
      },
      {
        question: "Can I do zone 2 indoors?",
        answer:
          "Yes — but the discipline is harder. Trainer fans, no music with cadence cues, and a power cap at 75% of FTP help. Most riders accidentally drift into tempo on a trainer because there's no terrain to force the easy.",
      },
      {
        question: "Why do I keep drifting out of zone 2 on climbs?",
        answer:
          "Most amateur zone-2 rides are picked on routes with too much climbing. Drift on climbs is the most common single cause of cooked easy days. Either change the route, or accept lifting cadence and dropping wattage hard on every gradient.",
      },
    ],
    related: [
      {
        label: "Zone 2 vs Endurance Training",
        href: "/blog/zone-2-vs-endurance-training",
      },
      {
        label: "Polarised, Pyramidal or Sweet Spot — Honest Comparison",
        href: "/question/polarised-vs-pyramidal-vs-sweet-spot",
      },
      {
        label: "Polarised Training Cycling Guide",
        href: "/blog/polarised-training-cycling-complete-guide",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
      },
      {
        label: "Heart Rate Zone Calculator",
        href: "/tools/hr-zones",
      },
    ],
  },
  {
    slug: "polarised-vs-pyramidal-vs-sweet-spot",
    cluster: "training",
    question: "Polarised, Pyramidal or Sweet Spot — Which One Should I Use?",
    seoTitle: "Polarised vs Pyramidal vs Sweet Spot — The Honest Comparison",
    seoDescription:
      "Three intensity distributions, evidence-based picks by rider profile and weekly hours. The contested debate settled in plain language with the Roadman expert network.",
    pillar: "coaching",
    shortAnswer:
      "At 12+ hours/week, polarised tends to win for trained riders. At 6-8 hours/week, a pyramidal or moderate sweet-spot model usually delivers more — there isn't enough total stimulus in pure polarised. Which label you use matters less than this: most amateurs gain the most from making easy easier and hard harder, regardless of model.",
    bestFor:
      "Riders who've heard all three terms and want a cleaner answer than 'whichever you prefer'. Particularly time-crunched amateurs trying to pick the right intensity backbone.",
    notFor:
      "First-year cyclists — at that stage the model matters less than just doing the work consistently. Pick one and run a block.",
    keyTakeaway:
      "The three models converge once you control for weekly hours. Pick the one that fits your time, not the one that sounds best.",
    evidenceLevel: "strong",
    evidenceNote:
      "Anchored in Stephen Seiler's polarised research, Dan Lorang's pyramidal admission on the podcast, the FasCat/CTS sweet-spot literature, and the published Stoggl-Sperlich head-to-head studies.",
    fullExplanation: [
      "These three terms describe how training intensity is distributed across a week. Polarised: 80% properly easy, 20% properly hard, almost nothing in the middle. Pyramidal: lots of easy, moderate amounts of threshold, smaller amounts of VO2max. Sweet spot: lots of moderate-hard work at 88-94% of FTP, less easy time, less true VO2max. The internet's polarised-vs-sweet-spot debate has run for a decade. The honest answer changes with rider hours and training history.",
      "Stephen Seiler's published distribution work shows that elite endurance athletes spend roughly 80% of training time below first ventilatory threshold and 15-20% well above the second. That's the polarised model. But Seiler himself has said on the podcast that pros are typically slightly more pyramidal than the headlines suggest — they hold more threshold time once form is built. Dan Lorang corroborated this on the show: at the World Tour level the distribution is closer to pyramidal than the textbook 80/20.",
      "For amateurs, weekly hours change which model wins. At 12+ hours per week, polarised usually delivers — there's enough total stimulus in the easy 80% that the hard 20% gets to be really hard. At 6-8 hours per week, pure polarised often under-delivers; the threshold time in a pyramidal or sweet-spot model adds the productive stimulus that the shorter polarised week is missing. The Stoggl-Sperlich head-to-head studies and the FasCat/CTS coaching observations both line up on this. There isn't a religious answer — there's a hours-banded one.",
      "What sweet spot does well: efficient productive stimulus when time is tight. What it does badly: it lives in the grey zone, and the recovery cost is high enough that easy days have to be properly easy or the rider cooks. The 'black hole' criticism of sweet spot is mostly about amateurs who do sweet spot AND let their easy days creep into tempo — that combination is what produces the chronic-fatigue plateau. Used carefully, sweet spot is a perfectly defensible amateur tool, especially in build phases.",
      "The Roadman position: pick the model that fits your weekly hours and stick to it for at least 8-12 weeks. Polarised at 12+ hours, pyramidal at 8-12, sweet-spot-leaning at 6-8. Block periodise across the year — don't try to hit one distribution every week of every season. And remember: the percentage of effort that's actually easy in your easy time matters more than which label is on the model.",
    ],
    evidence: [
      {
        label: "Stephen Seiler — polarised distribution work",
        detail:
          "Seiler's published research is the most-cited distribution evidence. Trained endurance athletes adapt more reliably to roughly 80/20 distributions than to threshold-heavy.",
        href: "/guests/stephen-seiler",
      },
      {
        label: "Dan Lorang — pyramidal observation on the podcast",
        detail:
          "Lorang's on-the-record framing: World Tour pros typically run more threshold than the textbook polarised model implies. Closer to pyramidal once base is built.",
        href: "/guests/dan-lorang",
      },
      {
        label: "Stoggl & Sperlich 2014 — head-to-head distribution study",
        detail:
          "Foundational study comparing polarised, pyramidal, threshold, and high-volume distributions over 9 weeks. Polarised and pyramidal both produced larger VO2max gains than the threshold-heavy and high-volume groups.",
        href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3912323/",
      },
      {
        label: "FasCat / Frank Overton — sweet spot literature",
        detail:
          "FasCat's published case data on sweet-spot programming is the cleanest amateur-focused defence of the model — particularly for time-crunched riders.",
      },
      {
        label: "Roadman polarised guide",
        detail:
          "The Roadman pillar on polarised training, with Seiler quotes and the amateur protocol.",
        href: "/blog/polarised-training-cycling-complete-guide",
      },
    ],
    faq: [
      {
        question: "Is polarised better than sweet spot for amateurs?",
        answer:
          "It depends on hours. At 12+ hours per week, polarised usually wins. At 6-8 hours per week, a sweet-spot or pyramidal model often delivers more total productive stimulus. Both can work for amateurs — the model isn't the thing that breaks; the discipline of easy days is.",
      },
      {
        question: "Do pros really train polarised?",
        answer:
          "Roughly. Distribution research shows pros sit close to 80% below VT1, but the remainder is more pyramidal than pure-polarised — meaning meaningful time at threshold, not just at VO2max. Both Seiler and Lorang have framed it this way on the podcast.",
      },
      {
        question: "Is sweet spot the 'black hole' that ruins training?",
        answer:
          "Only when paired with too-hard easy days. Sweet spot in isolation is a productive zone — the trap is the rider who does sweet spot Tuesday, tempo-creep Wednesday, sweet spot Thursday, and is cooked by Sunday. The black hole isn't the zone, it's the week.",
      },
      {
        question: "Should I switch models across the year?",
        answer:
          "Yes. The conventional periodisation across the Roadman network is: polarised in base phase, pyramidal or sweet-spot-leaning in build, polarised again in pre-event sharpening. Block periodise, don't try to hold one distribution every week of every month.",
      },
    ],
    related: [
      {
        label: "Polarised Training Cycling Guide",
        href: "/blog/polarised-training-cycling-complete-guide",
      },
      {
        label: "Polarised vs Sweet Spot Training",
        href: "/blog/polarised-vs-sweet-spot-training",
      },
      {
        label: "Am I Doing Zone 2 Right?",
        href: "/question/am-i-doing-zone-2-right",
      },
      {
        label: "How Often Should I Do VO2max Intervals?",
        href: "/question/how-often-vo2max-intervals-cycling",
      },
      {
        label: "Polarised vs Pyramidal Comparison",
        href: "/compare/polarised-vs-pyramidal",
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
  {
    id: "training",
    label: "Training Methodology",
    description:
      "Polarised vs sweet spot, VO2max frequency, durability work, fasted training, and the questions amateurs ask once they've moved past the basics.",
  },
];
