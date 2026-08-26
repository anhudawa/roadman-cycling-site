import { type ContentPillar } from "@/types";

/**
 * Named-expert evidence for a problem page — a verified podcast guest, their
 * credential, a relevant episode, and 2-3 sentences of expert-backed advice.
 *
 * Every field is verified, not generated: `name`/`credential`/`guestSlug`/
 * `episodeSlug` are reused from the editorially-checked answer corpus
 * (`src/lib/answers-data/*`), where the scaled-content audit confirmed all
 * guest and episode references resolve. `insight` is a faithful paraphrase of
 * that guest's documented position from the linked episode — never a
 * fabricated quote. Rendered on the page (guest + episode links) to turn the
 * previously thin diagnostic stubs into grounded, attributed pages.
 */
export interface ProblemExpertEvidence {
  name: string;
  credential: string;
  insight: string;
  /** Resolves to /podcast/[slug]; verified against content/podcast. */
  episodeSlug: string;
  /** Resolves to /guests/[slug]. */
  guestSlug: string;
}

export interface ProblemPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  pillar: ContentPillar;
  problem: string;
  causes: string[];
  solutions: { title: string; description: string; href: string }[];
  toolHref?: string;
  toolLabel?: string;
  /**
   * Optional named-expert evidence. Present on every problem page that has a
   * natural, verifiable guest/episode match. Deliberately absent where no
   * episode genuinely backs the topic — see `injury-return`, flagged below —
   * rather than forcing a tenuous attribution.
   */
  expertEvidence?: ProblemExpertEvidence;
}

export const PROBLEM_PAGES: ProblemPage[] = [
  {
    slug: "not-getting-faster",
    expertEvidence: {
      name: "Stephen Barrett",
      credential: "Head coach, Decathlon AG2R La Mondiale (UCI WorldTour)",
      insight:
        "Barrett's read on stalled amateurs is that they train too hard on easy days and not hard enough on hard ones, then skip the recovery that lets adaptation happen. The riders who improve most aren't the ones with the biggest engine — they're the ones who test honestly and build the aerobic base before chasing the ceiling.",
      episodeSlug: "ep-38-world-tour-coach-s-most-valuable-training-secrets-revealed",
      guestSlug: "stephen-barrett",
    },
    title: "Why Am I Not Getting Faster at Cycling?",
    seoTitle: "Why Am I Not Getting Faster Cycling?",
    seoDescription: "Stuck at the same speed? The 6 most common reasons cyclists stop improving — and the fix for each one.",
    pillar: "coaching",
    problem: "You're training consistently but your FTP hasn't moved in months. Group rides feel the same. Race results are stagnant. You're working hard — maybe harder than ever — and nothing changes.",
    causes: [
      "No structured plan — riding hard without intention",
      "Too much time in the grey zone (Zone 3) — not easy enough or hard enough",
      "Insufficient recovery — stacking fatigue without adaptation",
      "Nutrition misalignment — under-fuelling hard sessions",
      "No periodisation — same training month after month",
      "Training alone without accountability or external review",
    ],
    solutions: [
      { title: "Get structured", description: "Follow a plan with clear intensity targets", href: "/blog/how-to-get-faster-cycling" },
      { title: "Fix your zones", description: "Calculate your FTP zones and stick to them", href: "/tools/ftp-zones" },
      { title: "Check your fuelling", description: "Match carbs to training demands", href: "/tools/fuelling" },
      { title: "If your FTP specifically has plateaued", description: "Read the dedicated FTP plateau diagnostic for the structured fix", href: "/problem/stuck-on-plateau" },
      { title: "Take a coaching assessment", description: "Find out if coaching would accelerate your goals", href: "/assessment" },
    ],
    toolHref: "/assessment",
    toolLabel: "Take the free assessment",
  },
  {
    slug: "stuck-on-plateau",
    expertEvidence: {
      name: "Dan Lorang",
      credential: "Head of Performance, Lidl-Trek; endurance coach",
      insight:
        "After thirteen years coaching pros, Lorang's view is that most amateur plateaus mean the easy gains from unstructured riding are gone — the next step isn't more intensity but real periodisation and proper recovery between hard sessions. Adaptation needs an aerobic base deep enough to support the work you keep stacking on top of it.",
      episodeSlug: "ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know",
      guestSlug: "dan-lorang",
    },
    title: "Cycling FTP Plateau — How to Break Through",
    seoTitle: "Stuck on a Cycling Plateau? How to Break Through",
    seoDescription: "FTP plateaued? The most common reasons cyclists get stuck — and the structured approach that breaks through.",
    pillar: "coaching",
    problem: "Your FTP has flatlined. You've been at the same number for 6 months, maybe longer. You train regularly, you eat reasonably well, you sleep — but the needle won't move.",
    causes: [
      "You've exhausted the easy gains from unstructured training",
      "Your training lacks periodisation — no base, build, peak cycle",
      "You're under-recovering between hard sessions",
      "Your aerobic base is too shallow for the intensity you're adding",
      "You haven't changed your approach in over a year",
    ],
    solutions: [
      { title: "Build the base first", description: "Zone 2 volume before intensity", href: "/blog/zone-2-training-complete-guide" },
      { title: "Periodise properly", description: "Structure training into phases", href: "/blog/how-to-periodise-cycling-season" },
      { title: "Try the plateau diagnostic", description: "4-minute quiz identifies your specific blocker", href: "/plateau" },
      { title: "Get coached", description: "A coach identifies what you can't see in your own data", href: "/apply" },
    ],
    toolHref: "/plateau",
    toolLabel: "Take the plateau diagnostic",
  },
  {
    slug: "coming-back-after-break",
    expertEvidence: {
      name: "Dan Lorang",
      credential: "Head of Performance, Lidl-Trek; endurance coach",
      insight:
        "Lorang builds amateur plans backward from the goal, not from how fit the rider used to be. Coming back, the trap is training to your old numbers — the fix is to recalibrate zones to current fitness and rebuild the aerobic platform first. Consistency at an honest intensity beats trying to claw back the block you lost.",
      episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      guestSlug: "dan-lorang",
    },
    title: "Coming Back to Cycling After Time Off",
    seoTitle: "Getting Back Into Cycling After a Break",
    seoDescription: "Returning to cycling after time off? How to rebuild fitness safely, set realistic expectations, and avoid the mistakes that cause injuries.",
    pillar: "coaching",
    problem: "You used to ride. Life happened — injury, work, family, motivation loss. Now you want to get back. But your legs don't work like they used to, and you're not sure where to start.",
    causes: [
      "Fitness loss is real — expect 50-80% of detraining after 3+ months off",
      "Muscle memory helps but doesn't replace structured rebuilding",
      "The biggest risk is doing too much too soon",
      "Mental fitness matters — riding with people faster than your current level hurts motivation",
    ],
    solutions: [
      { title: "Start with 3 rides per week", description: "Consistency before intensity", href: "/blog/comeback-cyclist-12-week-return-plan" },
      { title: "Set a 12-week target", description: "Structured comeback plan", href: "/blog/comeback-cyclist-12-week-return-plan" },
      { title: "Get your zones right", description: "Test and recalculate from current fitness", href: "/tools/ftp-zones" },
      { title: "Consider coaching", description: "A coach manages the rebuild so you don't overdo it", href: "/you/comeback" },
    ],
    toolHref: "/tools/ftp-zones",
    toolLabel: "Recalculate your zones",
  },
  {
    slug: "losing-power-after-40",
    expertEvidence: {
      name: "Joe Friel",
      credential: "Author of Fast After 50 and The Cyclist's Training Bible",
      insight:
        "Friel's work on masters athletes shows the decline curve flattens sharply for riders who keep training structured and lift heavy. The power loss most over-40s blame on age is largely lost muscle and lost recovery capacity — both trainable. Treat strength work as non-negotiable and protect recovery, and the drop is far smaller than the calendar suggests.",
      episodeSlug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
      guestSlug: "joe-friel",
    },
    title: "Losing Power After 40 — What to Do About It",
    seoTitle: "Losing Cycling Power After 40? Here's What to Do",
    seoDescription: "Power declining after 40? It's not inevitable. The evidence-based approach to maintaining and even gaining FTP as a masters cyclist.",
    pillar: "coaching",
    problem: "You're over 40. Your FTP has dropped. Recovery takes longer. The riders who used to sit on your wheel are now riding away from you. You're wondering if this is just age or if something can be done.",
    causes: [
      "Muscle mass declines ~8% per decade after 40 without resistance training",
      "Recovery capacity decreases — same load, more fatigue",
      "VO2max declines ~5% per decade in trained athletes (less than the ~10% for sedentary)",
      "Most masters cyclists train exactly like they did at 30, which no longer works",
    ],
    solutions: [
      { title: "Add strength training", description: "Heavy S&C 2x/week is non-negotiable after 40", href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40" },
      { title: "Masters-specific coaching", description: "Training that accounts for recovery changes", href: "/blog/best-cycling-coach-masters-riders" },
      { title: "Adjust recovery", description: "More recovery days, better sleep, nutrition timing", href: "/blog/masters-cyclist-guide-getting-faster-after-40" },
      { title: "Get coached", description: "Masters riders benefit most from coaching", href: "/apply" },
    ],
    toolHref: "/assessment",
    toolLabel: "Take the coaching assessment",
  },
  {
    slug: "slow-climbing",
    expertEvidence: {
      name: "Jack Burke",
      credential: "World's fastest hill climber, multiple Strava KOM holder",
      insight:
        "Burke's whole approach to climbing comes down to power-to-weight, and the riders who get faster work both sides of that fraction — structured intervals to raise the power, sensible body composition to manage the weight. Trying to climb faster by simply pushing harder almost always ends in blowing up before the summit.",
      episodeSlug: "ep-2083-secrets-of-the-worlds-fastest-hill-climber-jack-burke",
      guestSlug: "jack-burke",
    },
    title: "Why Am I Slow on Climbs?",
    seoTitle: "Slow on Cycling Climbs? The Real Reasons Why",
    seoDescription: "Getting dropped on climbs? The physiological, pacing, and training reasons cyclists struggle uphill — and the specific fixes for each.",
    pillar: "coaching",
    problem: "Riders who are your equal on flats ride away from you the moment the road goes up. You're working harder than they are and still losing ground. Climbing exposes every weakness in your training.",
    causes: [
      "Power-to-weight ratio (W/kg) is the single biggest climbing determinant — both sides matter",
      "Pacing mistakes: going too hard early blows your top-end before the summit",
      "Threshold and VO2max capacity below where it needs to be",
      "Insufficient sustained high-intensity work (3-8 min efforts)",
      "Excess body mass that isn't muscle",
      "Mental framing: climbs feel harder because they expose the gap between your fitness and your ambition",
    ],
    solutions: [
      { title: "Calculate your W/kg", description: "Know your climbing benchmark", href: "/tools/wkg" },
      { title: "Train the climb energy system", description: "3-8 min sustained intervals build climbing-specific fitness", href: "/blog/how-to-improve-ftp-cycling" },
      { title: "Fix climbing pacing", description: "How to pace a climb without exploding", href: "/blog/cycling-base-training-guide" },
      { title: "Structured climbing plan", description: "12-week programme targeting climbing power", href: "/coaching" },
    ],
    toolHref: "/tools/wkg",
    toolLabel: "Calculate your climbing W/kg",
  },
  {
    slug: "hr-too-high",
    expertEvidence: {
      name: "Professor Stephen Seiler",
      credential: "Exercise physiologist, University of Agder",
      insight:
        "Seiler's point about riding fast at a low heart rate is that most amateurs let their easy rides drift up into the moderate zone, so they never fully recover and the aerobic base stops growing. A properly easy ride should feel almost too easy — when heart rate runs high for the power, the usual cause is accumulated fatigue from training that's never truly easy.",
      episodeSlug: "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
      guestSlug: "stephen-seiler",
    },
    title: "Why Is My Cycling Heart Rate So High?",
    seoTitle: "Cycling Heart Rate Too High? Here's What's Going On",
    seoDescription: "Heart rate higher than it should be at a given pace or power? The 8 most common causes — and the fix for each.",
    pillar: "coaching",
    problem: "Your HR runs 10-20 bpm higher than you think it should for a given power output. Easy rides don't feel easy. Every session feels harder than the numbers suggest it should.",
    causes: [
      "Cardiac drift on long rides — HR rises for the same power as fatigue accumulates",
      "Dehydration — blood volume drops, HR climbs to maintain cardiac output",
      "Under-recovery from previous sessions, illness, or poor sleep",
      "Heat stress — warm days can add 10-15 bpm at the same power",
      "Caffeine, alcohol, or stress the night before",
      "Zone miscalibration — your zones may be wrong if FTP hasn't been tested recently",
      "Overtraining — elevated resting HR for 3+ consecutive days is a red flag",
      "Under-fuelling — low glycogen drives HR up at lower intensities",
    ],
    solutions: [
      { title: "Recalculate your HR zones", description: "Zones drift with fitness — retest when FTP changes", href: "/tools/hr-zones" },
      { title: "Track resting HR trends", description: "Morning RHR is your canary for under-recovery", href: "/blog/cycling-hrv-training-guide" },
      { title: "Fix your fuelling", description: "Low glycogen drives HR up at moderate intensity", href: "/tools/fuelling" },
      { title: "Read the HR vs power guide", description: "When each metric tells you the real story", href: "/compare/heart-rate-vs-power" },
    ],
    toolHref: "/tools/hr-zones",
    toolLabel: "Recalculate your HR zones",
  },
  {
    slug: "cant-lose-weight-cycling",
    expertEvidence: {
      name: "David Dunne",
      credential: "Performance nutritionist, INEOS Grenadiers, EF Education, Uno-X",
      insight:
        "Dunne's message to amateurs is that the lean weight you see in pro cycling comes from periodised fuelling, not blanket restriction. Fuel the sessions that need fuelling, run a modest deficit through everyday choices, and keep protein high to protect muscle. Under-eating around hard training backfires — it costs power and stalls the body-composition change you're chasing.",
      episodeSlug: "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
      guestSlug: "david-dunne",
    },
    title: "Why Can't I Lose Weight From Cycling?",
    seoTitle: "Cycling But Not Losing Weight? Here's Why",
    seoDescription: "Riding consistently but the scale won't budge? The 7 reasons cycling alone doesn't drop weight — and what actually works.",
    pillar: "nutrition",
    problem: "You ride 8-10 hours a week. You've cut back on obvious junk. The scale hasn't moved in months — or worse, it's gone up. You're doing the work; the math isn't mathing.",
    causes: [
      "Compensatory eating — long rides drive appetite for 24-48 hours after",
      "Under-reporting food intake by 20-40% (this is universal, not a willpower failure)",
      "Chronic cardio builds cortisol, which drives fat retention in some riders",
      "Muscle loss from insufficient protein masks fat loss on the scale",
      "Low-intensity-only riding doesn't create the metabolic adaptation needed for fat loss",
      "Sleep debt — under 7 hours wrecks insulin sensitivity",
      "Alcohol more than 3 units per week pauses fat oxidation for 24+ hours per session",
    ],
    solutions: [
      { title: "Track protein intake", description: "Target 1.6-2.2g/kg to preserve muscle during deficit", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { title: "Calculate your race weight", description: "Set an evidence-based target, not a round number", href: "/tools/race-weight" },
      { title: "Add strength training", description: "Preserves muscle, increases RMR, changes body composition without scale change", href: "/blog/new-study-confirms-heavy-strength-training-beats-more-miles-after-40" },
      { title: "Fuel the work required", description: "Under-fuelling workouts often stalls fat loss", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
    ],
    toolHref: "/tools/race-weight",
    toolLabel: "Calculate your race weight",
  },
  {
    slug: "tired-all-the-time",
    expertEvidence: {
      name: "Dan Lorang",
      credential: "Head of Performance, Lidl-Trek; endurance coach",
      insight:
        "Lorang manages elite riders by watching the balance between load and recovery, not just the training itself. Chronic tiredness is rarely one thing — it's intensity, sleep, fuelling and life stress stacking faster than the body can absorb. The intervention is almost always to pull intensity back and let a recovery block do its job before adding work again.",
      episodeSlug: "ep-2056-13-years-of-coaching-pros-what-amateurs-dont-know",
      guestSlug: "dan-lorang",
    },
    title: "Why Am I Always Tired From Cycling?",
    seoTitle: "Cycling Exhaustion: Why Am I Always Tired?",
    seoDescription: "Chronic fatigue from cycling? How to tell the difference between normal training fatigue, overreaching, and full overtraining syndrome — plus the recovery protocol.",
    pillar: "recovery",
    problem: "You finish rides more tired than you should be. Easy rides feel hard. You're not sleeping well. Your motivation is draining. Everything feels like it takes more effort than it used to.",
    causes: [
      "Functional overreaching crossing into non-functional overreaching — too much intensity, too little recovery",
      "Sleep quality below 7 hours, or fragmented — destroys adaptation",
      "Under-fuelling — chronic energy deficit drives RED-S symptoms in both men and women",
      "Life stress stacking with training stress — the body doesn't distinguish between them",
      "Iron deficiency (especially in women) — standard blood markers miss it",
      "Zone drift — most training is actually zone 3 not zone 2, driving accumulated fatigue",
      "Missing deload weeks — 3 weeks hard, 1 week easy is not optional",
    ],
    solutions: [
      { title: "Check energy availability", description: "Screen for under-fuelling with the EA calculator", href: "/tools/energy-availability" },
      { title: "Audit your recovery", description: "HRV, RHR, sleep, mood — track the right metrics", href: "/blog/cycling-hrv-training-guide" },
      { title: "Schedule a deload", description: "One easy week now saves six weeks of overtraining recovery", href: "/glossary/deload" },
      { title: "Get blood work done", description: "Ferritin, vitamin D, testosterone (men) — the standard training bloods", href: "/blog/cycling-overtraining-signs-guide" },
    ],
    toolHref: "/tools/energy-availability",
    toolLabel: "Check your energy availability",
  },
  {
    slug: "group-ride-dropped",
    expertEvidence: {
      name: "Cory Williams",
      credential: "Professional cyclist, founder of Legion Cycling Team, criterium specialist",
      insight:
        "Williams treats the ability to hold a surging bunch as a trainable skill, built through exposure at the right level rather than raw fitness alone. The riders who get dropped either avoid groups or jump into ones that are too fast; the path is deliberate progression — repeated short, hard efforts plus time in predictable groups until the accelerations stop hurting.",
      episodeSlug: "ep-2191-criterium-secrets-get-ahead-of-99-of-your-competition-cory-w",
      guestSlug: "cory-williams",
    },
    title: "Why Do I Get Dropped on Group Rides?",
    seoTitle: "Getting Dropped on Group Rides? Fix This",
    seoDescription: "Getting shelled on the club ride? The physiological, positioning, and tactical reasons stronger riders pull away — and how to close the gap.",
    pillar: "coaching",
    problem: "You can hold 200W on your own for an hour, but you can't sit in a group ride for 30 minutes. Every surge hurts. Every hill splits the group with you on the wrong side. Eventually the tail of the bunch rolls away and you're alone.",
    causes: [
      "Repeated-sprint ability (RSA) below group average — you can't absorb surges",
      "Anaerobic capacity (W') too small to bridge gaps when the group accelerates",
      "Poor positioning — burning watts fighting the wind instead of drafting",
      "Pacing on climbs — going into the red too early, dropping off the back on the second half",
      "Nutrition timing — 90 min in with no carbs is the classic drop zone",
      "Aerobic base insufficient for the duration of the ride",
      "Bike position or equipment inefficiency — 20+ watts lost to drag or rolling resistance",
    ],
    solutions: [
      { title: "Train repeated-effort capacity", description: "30-30s and VO2max intervals build the surge tolerance group rides demand", href: "/glossary/intervals" },
      { title: "Fix your group-ride position", description: "Drafting saves 25-30% of your energy at group pace", href: "/glossary/drafting" },
      { title: "Fuel the ride properly", description: "60-90g carbs/hour from minute 45 onward", href: "/tools/fuelling" },
      { title: "Get coached for group performance", description: "Targeted training for the demands your rides actually place on you", href: "/coaching" },
    ],
    toolHref: "/tools/fuelling",
    toolLabel: "Plan your ride fuelling",
  },
  {
    slug: "cant-stick-to-plan",
    expertEvidence: {
      name: "Erin Ayala",
      credential: "Sport psychologist specialising in endurance athlete motivation and performance",
      insight:
        "Ayala's core point is that motivation follows action, not the other way around — the athletes who struggle most are waiting to feel ready. The ones who stay consistent design their environment and commitments so the decision is already made before they're tired or reluctant. Adherence is a system you build, not a feeling you summon.",
      episodeSlug: "ep-2078-how-to-increase-your-motivation-erin-ayala",
      guestSlug: "erin-ayala",
    },
    title: "Why Can't I Stick to a Cycling Plan?",
    seoTitle: "Can't Stick to a Cycling Training Plan? Try This",
    seoDescription: "Keep falling off the plan after 3-4 weeks? The accountability, life-fit, and plan-quality reasons consistency fails — and what actually sustains it.",
    pillar: "coaching",
    problem: "You start every plan motivated. Week 1-3 goes well. By week 4-5 you're missing sessions. By week 6 the plan is in the bin. You've done this cycle for years. The plans aren't the problem — or are they?",
    causes: [
      "Plan doesn't match your actual available hours — aspirational, not realistic",
      "No external accountability — the plan doesn't know or care if you skip",
      "Motivation-dependent consistency collapses when life stress rises",
      "Plan rigidity — one missed session breaks the psychological chain",
      "Missing the 'why' — plans without a specific target event lose meaning",
      "Social isolation — riding alone while everyone else is group riding",
      "Identity mismatch — following an elite plan without elite life structure",
    ],
    solutions: [
      { title: "Match plan to available hours", description: "Honest audit of actual weekly hours — not aspirational", href: "/blog/how-to-structure-cycling-training-plan" },
      { title: "Add accountability", description: "A coach, a group, or a public commitment shifts adherence 40%+", href: "/compare/coach-vs-app" },
      { title: "Book a target event", description: "Plans without targets become optional; plans with targets don't", href: "/plan" },
      { title: "Start coaching", description: "The single biggest predictor of consistency is someone who checks in weekly", href: "/apply" },
    ],
    toolHref: "/assessment",
    toolLabel: "Take the coaching assessment",
  },
  {
    // FLAGGED — no expertEvidence. No podcast guest has a verified episode
    // specifically about returning from injury/illness. Phil Burt (physio)
    // is a credential match, but his episodes cover bike fit and back/neck
    // pain, not injury rehab/comeback — attaching one here would be a
    // tenuous, off-topic attribution. Left ungrounded pending a real
    // injury-comeback episode rather than forcing a fabricated-by-context fit.
    slug: "injury-return",
    title: "Returning to Cycling After Injury",
    seoTitle: "Returning to Cycling After Injury — How to Rebuild",
    seoDescription: "Coming back from a crash, illness, or orthopaedic injury? The rebuild protocol that prevents re-injury and restores fitness without blowing up.",
    pillar: "coaching",
    problem: "You've been cleared to ride. The body can do it — technically. But the fitness is gone, the confidence is fragile, and you don't know how to structure a rebuild that gets you back without breaking again.",
    causes: [
      "Rushing the rebuild — the fitness you lost took months; it needs months to return",
      "Pain scale confusion — discomfort during rebuild is different from injury pain",
      "Detraining is real: 2-4 weeks off costs 5-10% of VO2max; 3+ months costs 20%+",
      "Muscle imbalances post-injury — one side stronger, different recruitment pattern",
      "Mental-fitness gap — legs are ahead of confidence, or vice versa",
      "Missing the rehab-to-training transition — going straight from PT discharge to normal rides",
    ],
    solutions: [
      { title: "Follow a structured return", description: "12-week comeback plan calibrated to time off the bike", href: "/blog/comeback-cyclist-12-week-return-plan" },
      { title: "Reset your zones", description: "Your old FTP is aspirational — recalibrate from current fitness", href: "/tools/ftp-zones" },
      { title: "Add strength rehab", description: "Addresses imbalances and rebuilds robustness", href: "/strength-training" },
      { title: "Get coached through the return", description: "The highest-risk period for re-injury is DIY comeback", href: "/you/comeback" },
    ],
    toolHref: "/tools/ftp-zones",
    toolLabel: "Recalculate your zones",
  },
  {
    slug: "numb-hands-feet",
    expertEvidence: {
      name: "Phil Burt",
      credential: "Former Team Sky and British Cycling physiotherapist and bike fitter",
      insight:
        "Burt treats numbness as a pressure problem, not a medical one — too much weight on the hands from excess reach or a nose-down saddle, or feet loaded by cleat position and tight shoes. The diagnostic sequence is fit first: saddle position and tilt, then reach, then contact points, before reaching for gel pads or assuming nerve damage.",
      episodeSlug: "ep-2535-5-fixable-bike-fit-mistake-most-riders-make",
      guestSlug: "phil-burt",
    },
    title: "Numb Hands or Feet on the Bike — What's Wrong?",
    seoTitle: "Numb Hands or Feet Cycling? How to Fix It",
    seoDescription: "Cycling-induced numbness in hands or feet is almost always fit, position, or equipment — rarely medical. The 6-point troubleshooting guide.",
    pillar: "coaching",
    problem: "Mile 20 of every ride your ring and pinky finger go numb. Or your toes lose feeling halfway through a long climb. The numbness dissipates after the ride but it's there every time.",
    causes: [
      "Hand numbness (ulnar nerve): pressure on the outside of the palm from poor handlebar position",
      "Hand numbness (median nerve): flexed wrist position stretching the carpal tunnel",
      "Foot numbness: cleat position too far forward, shoes too tight, or overly aggressive arch support",
      "Saddle position pushing too much weight onto hands",
      "Stem length or reach too long — stretching to the bars",
      "Fore-aft saddle position too far forward — weight on hands instead of sit bones",
      "Cold weather + compressive gloves/shoes compounding circulation issues",
    ],
    solutions: [
      { title: "Get a professional bike fit", description: "Persistent numbness is a fit issue until proven otherwise", href: "/glossary/bike-fit" },
      { title: "Test saddle position", description: "Level saddle and correct setback keeps weight off hands", href: "/blog/bike-fit-one-change-amateurs-should-make" },
      { title: "Check cleat position", description: "Move cleats 2-3mm toward the heel if feet go numb", href: "/blog/numb-hands-cycling-5-fixes-bike-fit" },
      { title: "Vary hand position", description: "Move hands every 10-15 min — hoods, tops, drops", href: "/blog/numb-hands-cycling-5-fixes-bike-fit" },
    ],
    toolHref: "/assessment",
    toolLabel: "Get a bike fit assessment",
  },
  {
    slug: "saddle-pain",
    expertEvidence: {
      name: "Dr Andy Pruitt",
      credential: "Pioneer of medical-based bike fitting; founder of the Boulder Center for Sports Medicine",
      insight:
        "Pruitt's fitting work puts saddle height and tilt at the centre of most saddle pain: too high and the hips rock and chafe, the wrong tilt and pressure shifts onto soft tissue. Start the saddle level, get the height into the established knee-flexion range, and match the saddle to your sit-bone width before blaming the shorts.",
      episodeSlug: "ep-2186-the-correct-bike-fit-simplified-dr-pruitt",
      guestSlug: "dr-andy-pruitt",
    },
    title: "Cycling Saddle Pain — Why It Happens and How to Fix It",
    seoTitle: "Cycling Saddle Pain? Here's the Real Fix",
    seoDescription: "Saddle pain, numbness, or sores? The 5-step troubleshooting protocol from fit to saddle choice to chamois — what actually works.",
    pillar: "coaching",
    problem: "You dread long rides because your saddle makes you miserable. You've tried 'breaking in' a saddle, you've tried different shorts, you've tried standing up more — the pain is still there by hour two.",
    causes: [
      "Wrong saddle for your sit-bone width — most common cause",
      "Saddle tilt wrong — even 1-2 degrees of nose-down shifts pressure forward",
      "Saddle too high — rocking causes friction and chafing",
      "Saddle too far forward or back — weight in the wrong place",
      "Shorts with thin or old chamois padding",
      "Skipping chamois cream on rides over 2 hours",
      "Lack of gradual adaptation — long rides before the body has built tolerance",
    ],
    solutions: [
      { title: "Measure your sit-bone width", description: "Saddles come in 130mm, 143mm, 155mm widths — match yours", href: "/blog/cycling-saddle-sore-prevention" },
      { title: "Check saddle level", description: "Use a spirit level on the saddle; start perfectly flat", href: "/blog/bike-fit-one-change-amateurs-should-make" },
      { title: "Upgrade your shorts", description: "Quality bibs with proper chamois reduce saddle pain more than saddle changes", href: "/blog/cycling-saddle-sore-prevention" },
      { title: "Apply chamois cream", description: "Every ride over 2 hours — friction is the enemy", href: "/blog/cycling-saddle-sore-prevention" },
    ],
    toolHref: "/assessment",
    toolLabel: "Get a fit assessment",
  },
  {
    slug: "cramp-on-long-rides",
    expertEvidence: {
      name: "Sam Impey",
      credential: "World Tour nutritionist",
      insight:
        "Impey's take is that late-ride cramps track with under-fuelling and big sweat-sodium losses as much as anything mechanical. Hydration and electrolyte strategy has to start hours before the ride — once you are out in the heat under-fuelled, you are already behind. Plan sodium for long, hot efforts rather than reaching for it once the cramp has hit.",
      episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      guestSlug: "sam-impey",
    },
    title: "Cramping on Long Rides — Why and How to Stop It",
    seoTitle: "Cycling Cramps on Long Rides? Here's Why",
    seoDescription: "Cramping 3+ hours into rides? The electrolyte, fitness, and pacing reasons cyclists cramp — and the evidence-based prevention protocol.",
    pillar: "nutrition",
    problem: "Every ride over 3-4 hours ends the same way — quad, hamstring, or calf cramps that shut you down. You've tried salt tabs, pickle juice, everything on the forums. The cramps keep coming.",
    causes: [
      "Fitness mismatch — riding above your durability threshold recruits fresh muscle fibres that cramp",
      "Neuromuscular fatigue — the current science points to this over pure electrolyte loss",
      "Under-fuelling — low glycogen contributes to cramp susceptibility",
      "Pacing errors — surging above threshold, then sustaining, then surging again",
      "Dehydration compounding neuromuscular fatigue (not causing cramps alone, but amplifying)",
      "Sodium losses for heavy sweaters in heat over 5+ hours",
      "Lack of long-ride training — the body hasn't adapted to the duration demands",
    ],
    solutions: [
      { title: "Build durability", description: "Long rides at endurance pace extend the fatigue-resistance ceiling", href: "/blog/aerobic-decoupling-cycling-cardiac-drift" },
      { title: "Fuel properly", description: "60-90g carbs/hour maintains glycogen and delays neuromuscular fatigue", href: "/tools/fuelling" },
      { title: "Audit fluid and sodium together", description: "Measure representative losses, count every source and avoid a universal dose", href: "/blog/electrolytes-sweat-rate-cycling" },
      { title: "Train long-ride pacing", description: "Even pacing prevents the surge-recover pattern that triggers cramps", href: "/glossary/pacing-strategy" },
    ],
    toolHref: "/tools/fuelling",
    toolLabel: "Plan your fuelling + electrolytes",
  },
  {
    slug: "blowing-up-on-climbs",
    expertEvidence: {
      name: "John Archibald",
      credential: "British national pursuit champion",
      insight:
        "Archibald races the pursuit, where blowing up means pacing the effort wrong, not lacking fitness. The discipline transfers straight to climbing: set a target power off your FTP and the climb's length, then ride your own watts rather than chasing the wheel in front. Going out at VO2 max in the first minute is what empties the tank before the summit.",
      episodeSlug: "ep-2089-how-to-ride-faster-than-98-of-people-john-archibald",
      guestSlug: "john-archibald",
    },
    title: "Blowing Up on Climbs — The Pacing Fix",
    seoTitle: "Blowing Up on Cycling Climbs? Here's the Pacing Fix",
    seoDescription: "Start a climb strong, implode halfway up? The pacing, fuelling, and power-management errors that cause cyclists to blow up — and the 3-phase framework that stops it.",
    pillar: "coaching",
    problem: "You start the climb feeling good. Two minutes in you're already over threshold. Five minutes in you're hanging on. By the top you've been passed by riders who started slower and paced better. This isn't a fitness problem — it's a pacing problem.",
    causes: [
      "Starting at VO2max, not at threshold — the first 30 seconds feel easy and trick you into going too hard",
      "Chasing the wheel in front rather than riding your own watts",
      "No target power for the climb — riding on feel means over-pacing on feel-good days",
      "Not factoring in climb duration — a 5-minute climb has different pacing than a 20-minute climb",
      "Low cadence + high torque on steep pitches burns out muscular endurance early",
      "Fuelling gap — rolling into the climb with empty tank from inadequate carbs/hour",
      "Climbing cold — no warm-up before the first serious effort",
    ],
    solutions: [
      { title: "Use the 3-phase pacing framework", description: "First third at 95% target, middle third at target, final third chase the top", href: "/blog/cycling-base-training-guide" },
      { title: "Set a target wattage before the climb", description: "Based on FTP and climb duration — know the number before you start", href: "/tools/ftp-zones" },
      { title: "Fuel the climb from below", description: "Take carbs 10-15 min before the climb, not at the top when you're already in trouble", href: "/tools/fuelling" },
      { title: "Warm up properly", description: "15 minutes including one short effort to open the engine before the first climb", href: "/blog/cycling-climbing-tips-stop-getting-dropped" },
    ],
    toolHref: "/tools/ftp-zones",
    toolLabel: "Calculate your climbing target wattage",
  },
  {
    slug: "red-s-low-energy-availability",
    expertEvidence: {
      name: "Tim Podlogar",
      credential: "Nutrition consultant to Tudor Pro Cycling",
      insight:
        "Podlogar is blunt that the lean weight cycling rewards comes from periodised fuelling, not chronic restriction. The amateur version is simple: fuel the work that needs fuelling and create any deficit through general eating, not by under-eating before hard sessions. When energy availability drops too low, the fix is eating more — not training less.",
      episodeSlug: "ep-3-is-losing-weight-actually-making-you-slower",
      guestSlug: "tim-podlogar",
    },
    title: "RED-S and Low Energy Availability in Cyclists",
    seoTitle: "RED-S for Cyclists — Warning Signs and What to Do",
    seoDescription: "Underfuelled cycling is a performance killer and a health risk. The warning signs of RED-S (Relative Energy Deficiency in Sport), who's most at risk, and the recovery protocol.",
    pillar: "nutrition",
    problem: "Your power is flat, you're always cold, your periods have gone irregular (if female), your sleep is broken, and small niggles never seem to heal. You've been eating 'clean' and trying to get leaner. What's happening is RED-S — and the only fix is eating more, not training less.",
    causes: [
      "Chronic energy deficit — calories in consistently below what training + daily life demand",
      "Intentional restriction driven by race-weight pursuit or body-image pressure",
      "Under-fuelling rides — riding fasted or with insufficient in-ride carbs for months",
      "High training volume without matching nutritional volume",
      "Masking the problem with caffeine + stimulants rather than addressing the deficit",
      "Lack of appetite cue sensitivity — hard training suppresses hunger short-term",
      "Information from social media conflating 'lean' with 'fit'",
    ],
    solutions: [
      { title: "Calculate your energy availability", description: "Know the number — the clinical cutoff is 30 kcal/kg FFM/day", href: "/tools/energy-availability" },
      { title: "Rebuild carbs around training", description: "Pre, during, and post — not just after", href: "/tools/fuelling" },
      { title: "Refuel the deficit, don't taper training", description: "Most riders try to train less; the research says eat more while training similarly", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { title: "Get clinical support", description: "If symptoms have been present 3+ months, a sports-dietitian and GP review", href: "/research" },
    ],
    toolHref: "/tools/energy-availability",
    toolLabel: "Check your energy availability",
  },
  {
    slug: "travel-fatigue-cycling",
    expertEvidence: {
      name: "Laurens ten Dam",
      credential: "Professional cyclist, 16 World Tour seasons; Tour de France top-10 finisher",
      insight:
        "Across sixteen World Tour seasons ten Dam learned to treat the days after travel and disruption as easy rebuilding, not catch-up. The instinct to slam in a hard session the day you land is exactly wrong — prioritise sleep and easy riding for a couple of days, let the body resettle, then add intensity back once it's resilient again.",
      episodeSlug: "ep-2247-laurens-ten-dam-roadman-cycling-podcast",
      guestSlug: "laurens-ten-dam",
    },
    title: "Travel Fatigue — Why You Ride Poorly After Trips",
    seoTitle: "Cycling Travel Fatigue — How to Train Through a Travel Week",
    seoDescription: "Every trip kills your fitness for 10 days? The circadian, nutritional, and training-structure reasons cyclists crash after travel — and the protocol to stop it.",
    pillar: "recovery",
    problem: "You take a work trip or holiday, miss four sessions, and it takes you two weeks to feel normal again. The numbers say you only lost a handful of training days; the feeling says you lost a block. That gap is almost always manageable — if you plan for it.",
    causes: [
      "Circadian disruption from time-zone shifts — HR and RPE stay elevated for days",
      "Dehydration from flying — pressurised cabins cost ~200ml/hour",
      "Sleep debt compounded across consecutive travel days",
      "Meal-timing chaos — late dinners, skipped breakfasts, disrupted fuelling patterns",
      "Stress cortisol from travel logistics adds to training stress",
      "Inactivity during travel — sitting in airports and cars increases stiffness, reduces blood flow",
      "The urge to 'catch up' with a hard ride day one — exactly the wrong move",
    ],
    solutions: [
      { title: "Use an HRV check on day one back", description: "If HRV is down >15% from baseline, start with zone 2 only for 48-72 hours", href: "/blog/cycling-hrv-training-guide" },
      { title: "Pack a travel mobility routine", description: "10 minutes daily on the road keeps the body primed to ride when you return", href: "/blog/cycling-stretching-routine" },
      { title: "Prioritise sleep over mileage for 72 hours", description: "A week of under-sleeping needs 3 nights of 9+ hours to rebuild", href: "/blog/cycling-sleep-optimisation" },
      { title: "Plan 2 easy days before resuming intensity", description: "Don't chase the block you missed — rebuild the platform, then add intensity", href: "/blog/cycling-active-recovery-rides-guide" },
    ],
    toolHref: "/assessment",
    toolLabel: "Take the coaching assessment",
  },
  {
    slug: "heat-performance-drop",
    expertEvidence: {
      name: "John Wakefield",
      credential: "World Tour coach, Bora-Hansgrohe; works with Primož Roglič and Jai Hindley",
      insight:
        "Wakefield coaches around internal load — the cost of a session to the rider, not just the watts on the screen. Heat is the clearest case: the same power costs more when it's hot, so the answer is a structured 10-14 day acclimation block and monitoring day to day, rather than forcing through and turning an adaptation week into overreaching.",
      episodeSlug: "ep-2132-how-do-team-bora-approach-building-endurance-we-find-out-joh",
      guestSlug: "john-wakefield",
    },
    title: "Heat Performance Drop — When Summer Wrecks Your Numbers",
    seoTitle: "Cycling Performance in the Heat — Why You're Slower in Summer",
    seoDescription: "Why cycling feels harder in hot conditions, how acclimation can prepare you for a hot event, and the pacing, hydration and safety decisions to make.",
    pillar: "coaching",
    problem: "Winter numbers look like a different rider than your summer numbers. On anything over 25°C your HR climbs 15 bpm, your power falls 10-20%, and efforts that felt controllable in March feel impossible in July. You assume you've lost fitness. You haven't — you've lost heat tolerance.",
    causes: [
      "Skin blood flow redirects blood from working muscles to cooling — reducing power at a given HR",
      "Fluid losses and excessive drinking can both compound an already difficult heat-management problem",
      "Core temp rise slows pacing as the brain protects against hyperthermia",
      "Sodium losses from sweat disproportionate for heavy sweaters",
      "No progressive exposure to conditions representative of the target event",
      "Poor clothing choices — dark kit, no ventilation, hot lids",
      "Over-pacing early — a 'normal' early-ride effort becomes a heat disaster 90 minutes in",
    ],
    solutions: [
      { title: "Plan progressive heat preparation", description: "Match the exposure, recovery and safety plan to the event and rider", href: "/blog/heat-training-cyclists-30-watts-ftp-protocol" },
      { title: "Individualise food and fluid", description: "Use representative field observations instead of one hourly volume or sodium dose", href: "/tools/fuelling" },
      { title: "Rehearse cooling options", description: "Test practical event-legal methods without treating comfort as a safety guarantee", href: "/blog/cycling-heat-performance-adaptation-guide" },
      { title: "Reduce the opening demand", description: "Use power, heart rate, perceived effort and symptoms together rather than one universal cutoff", href: "/blog/cycling-heat-performance-adaptation-guide" },
    ],
    toolHref: "/tools/fuelling",
    toolLabel: "Plan hot-weather fuelling + fluids",
  },
  {
    slug: "bad-winter-motivation",
    expertEvidence: {
      name: "Jonas Abrahamsen",
      credential: "Professional cyclist, Uno-X, Tour de France stage winner",
      insight:
        "Abrahamsen puts in enormous volume through Norwegian winters without losing quality by treating the cold as a manageable environment rather than an excuse. The principle is correct layering, executing the planned pace whatever the conditions, and accepting that some winter days are about accumulating hours, not hitting numbers.",
      episodeSlug: "ep-29-untold-story-ofjonas-abrahamsens-pro-winter-training",
      guestSlug: "jonas-abrahamsen",
    },
    title: "Winter Cycling Motivation — How to Stay Consistent",
    seoTitle: "Can't Train Through Winter? Here's How",
    seoDescription: "Losing motivation through the winter months? The adherence, environment, and plan-design fixes that keep cyclists consistent when it's dark and cold.",
    pillar: "coaching",
    problem: "Every year the same pattern. Strong in September. Consistent in October. Slipping in November. By January you've done 4 indoor rides in a month and your fitness is in freefall. Spring arrives and you're playing catch-up again.",
    causes: [
      "No event anchor — without a target, winter training feels optional",
      "Training rooms are uncomfortable — too hot, bad airflow, poor audio",
      "Indoor boredom — 2-hour zone 2 rides on a trainer feel endless",
      "No social structure — group rides dry up, you're alone",
      "Plans don't match winter reality — 10-hour weeks in December are fantasy for most",
      "Dark rides feel unsafe, outdoor rides get skipped, indoor never happens",
      "Motivation depletes faster than it can be rebuilt alone",
    ],
    solutions: [
      { title: "Book a spring event", description: "Target events make winter training non-negotiable", href: "/plan" },
      { title: "Use indoor platforms strategically", description: "Zwift / TrainerRoad social features bridge the group-ride gap", href: "/blog/zwift-vs-trainerroad" },
      { title: "Short + frequent beats long + occasional", description: "4 × 45 min beats 1 × 3 hour for winter consistency", href: "/blog/how-to-structure-cycling-training-plan" },
      { title: "Get coached through winter", description: "External accountability is the single biggest winter-consistency lever", href: "/apply" },
    ],
    toolHref: "/assessment",
    toolLabel: "Take the coaching assessment",
  },
  {
    slug: "energy-crash-mid-ride",
    expertEvidence: {
      name: "Uri Carlson",
      credential: "Registered dietitian nutritionist; fuelling specialist",
      insight:
        "Carlson ran the comparison directly — under-fuelled, optimally fuelled, and over-fuelled riding — and the under-fuelled sessions consistently produced the lowest power and felt the hardest. The practical lesson is to start fuelling early and keep carbs coming before you feel empty, because by the time you bonk the glycogen is already gone.",
      episodeSlug: "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      guestSlug: "uri-carlson",
    },
    title: "Why Do I Bonk Mid-Ride?",
    seoTitle: "Bonking on Rides? Why You Hit the Wall Cycling",
    seoDescription: "Hitting the wall 2-3 hours in? The glycogen, pacing, and fuelling reasons cyclists bonk — and the prevention protocol.",
    pillar: "nutrition",
    problem: "Two hours in, your legs turn to concrete. Power drops 30%. Your brain fogs. The ride goes from manageable to survival in 15 minutes.",
    causes: [
      "Glycogen depletion — 400-500g of stored carbohydrate exhausted without replacement",
      "Starting fuelling too late — waiting until hungry means glycogen is critically low",
      "Under-dosing carbs — 30g/hour when the ride demands 60-90g/hour",
      "Pre-ride nutrition gap — skipping breakfast or riding fasted without adjusting intensity",
      "Pacing too hard early — burning glycogen at threshold when the ride demands endurance pace",
      "Heat and dehydration amplifying glycogen use rate",
    ],
    solutions: [
      { title: "Plan your fuelling", description: "60-90g carbs/hour from minute 30 for rides over 90 min", href: "/tools/fuelling" },
      { title: "Read the carbs-per-hour guide", description: "The gut training ladder from 30g to 120g", href: "/blog/carbohydrate-per-hour-cyclists" },
      { title: "Fix pre-ride nutrition", description: "2-4g carbs per kg body weight 2-3 hours before", href: "/blog/cycling-nutrition-race-day-guide" },
      { title: "Learn pacing", description: "Even effort prevents the early glycogen burn", href: "/glossary/pacing-strategy" },
    ],
    toolHref: "/tools/fuelling",
    toolLabel: "Plan your ride fuelling",
  },
  {
    slug: "breathing-too-hard",
    expertEvidence: {
      name: "James Nestor",
      credential: "Author of Breath: The New Science of a Lost Art",
      insight:
        "Nestor's work shows breathing is a mechanic you can train, not just a symptom of effort. Gasping at what should be an easy pace usually means you're above your aerobic threshold or chest-breathing rather than using the diaphragm. Slower nasal and diaphragmatic breathing lowers perceived effort — but if easy still feels breathless, your zones are probably set too high.",
      episodeSlug: "ep-2238-how-to-breathe-when-cycling-mouth-vs-nose-roadman-podcast",
      guestSlug: "james-nestor",
    },
    title: "Why Am I Breathing So Hard on the Bike?",
    seoTitle: "Breathing Too Hard Cycling? Here's Why",
    seoDescription: "Gasping at moderate intensity? The ventilatory, fitness, and pacing reasons your breathing is out of proportion.",
    pillar: "coaching",
    problem: "You're riding at a pace that should feel moderate but you're gasping. Riders around you are chatting — you can barely get a sentence out.",
    causes: [
      "Riding above VT1 — what feels moderate is actually zone 3-4",
      "Aerobic base underdeveloped — insufficient mitochondrial density",
      "Zone miscalibration — zones set too high, making 'easy' rides too hard",
      "Shallow breathing pattern — chest breathing instead of diaphragmatic",
      "Position-related — aggressive aero position compressing the diaphragm",
      "Asthma or exercise-induced bronchoconstriction (common, under-diagnosed)",
    ],
    solutions: [
      { title: "Recalculate your zones", description: "If easy rides don't feel easy, your zones are wrong", href: "/tools/ftp-zones" },
      { title: "Practice breathing technique", description: "Diaphragmatic breathing reduces perceived effort", href: "/blog/breathing-techniques-cycling-performance" },
      { title: "Build aerobic base", description: "Zone 2 volume improves oxygen extraction efficiency", href: "/blog/zone-2-training-complete-guide" },
      { title: "See a doctor about EIB", description: "Exercise-induced bronchoconstriction is treatable", href: "/blog/cycling-breathing-techniques" },
    ],
    toolHref: "/tools/ftp-zones",
    toolLabel: "Recalculate your zones",
  },
  {
    slug: "knee-pain-cycling",
    expertEvidence: {
      name: "Daryl Fitzgerald",
      credential: "World Tour bike fitter at Science to Sport",
      insight:
        "Fitzgerald's experience is that most cycling knee pain is a fit problem, not a joint problem. Saddle height and cleat position drive how the knee tracks through the pedal stroke, and getting those right resolves the large majority of cases. Check the position before assuming the joint is the issue or spiking your training load.",
      episodeSlug: "ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make",
      guestSlug: "daryl-fitzgerald",
    },
    title: "Cycling Knee Pain — Causes and Fixes",
    seoTitle: "Cycling Knee Pain? The Real Causes and Fixes",
    seoDescription: "Knee pain from cycling is almost always load, fit, or technique. The 6-point diagnosis and fix for each pattern.",
    pillar: "coaching",
    problem: "Your knees hurt during or after rides. It started as a twinge and now it's every ride. You're worried the bike is damaging your joints.",
    causes: [
      "Saddle too low — excessive knee flexion at bottom of pedal stroke",
      "Saddle too high — hyperextension causing posterior knee pain",
      "Cleat rotation wrong — fixed cleats forcing unnatural knee tracking",
      "Too much, too soon — rapid load increases outpacing tissue adaptation",
      "Single-leg imbalance — one leg overloading",
      "Low cadence grinding — high-force pedalling loading the patella tendon",
      "Weak glutes/VMO — knee tracking controlled by hip and quad muscles",
    ],
    solutions: [
      { title: "Get a bike fit", description: "80% of cycling knee pain resolves with saddle and cleat adjustment", href: "/blog/cycling-knee-pain-causes-fixes" },
      { title: "Increase cadence", description: "Spin 85-95 rpm to reduce per-pedal-stroke knee load", href: "/glossary/cadence" },
      { title: "Add strength work", description: "Glute bridges, squats, and VMO work fix the root cause", href: "/strength-training" },
      { title: "Manage load", description: "Don't spike volume — ramp gradually", href: "/blog/cycling-knee-pain-causes-fixes" },
    ],
    toolHref: "/assessment",
    toolLabel: "Get a fit assessment",
  },
  {
    slug: "back-pain-cycling",
    expertEvidence: {
      name: "Phil Burt",
      credential: "Former Team Sky and British Cycling physiotherapist and bike fitter",
      insight:
        "Burt frames back pain on the bike as two levers most riders address neither of: position and preparation. The position fix is usually reducing reach, which cuts the flexion demand on the lumbar spine; the preparation fix is building the core capacity to hold the position for the whole ride. Together they resolve far more back pain than a new saddle ever will.",
      episodeSlug: "ep-2185-hidden-cause-of-back-neck-pain-in-cycling-how-to-beat-it-rdm",
      guestSlug: "phil-burt",
    },
    title: "Lower Back Pain From Cycling — How to Fix It",
    seoTitle: "Cycling Back Pain? The Position and Core Fixes",
    seoDescription: "Lower back pain after rides? The position, core, and flexibility causes — and the fixes that work long-term.",
    pillar: "strength",
    problem: "Your lower back aches after every ride over 90 minutes. Long descents in the drops are miserable. You stand up to stretch every 20 minutes.",
    causes: [
      "Excessive reach — stem too long or bars too low for your flexibility",
      "Weak core — lumbar spine absorbs force the core should stabilise",
      "Tight hip flexors from desk work — pelvis forced into anterior tilt",
      "Saddle too high — overextension causes rocking, fatiguing the lower back",
      "Lack of position variety — same posture for hours",
      "Insufficient hamstring flexibility — tight hamstrings load the lumbar spine",
    ],
    solutions: [
      { title: "Get a bike fit", description: "Stack/reach mismatch is the most common structural cause", href: "/blog/cycling-back-pain-fixes" },
      { title: "Strengthen your core", description: "Planks, dead bugs, bird-dogs 3x/week", href: "/strength-training" },
      { title: "Stretch hip flexors daily", description: "90 seconds per side counteracts desk + bike tightness", href: "/blog/cycling-back-pain-fixes" },
      { title: "Try a shorter stem", description: "10mm shorter can eliminate back pain", href: "/glossary/bike-fit" },
    ],
    toolHref: "/assessment",
    toolLabel: "Get a fit assessment",
  },
  {
    slug: "sleep-disruption-training",
    expertEvidence: {
      name: "Andy Galpin",
      credential: "Professor of Kinesiology, Cal State Fullerton; muscle physiologist",
      insight:
        "Galpin treats sleep as a primary training variable, not an afterthought — it's where adaptation and nervous-system recovery actually happen. Late, intense sessions and chronic high load keep the sympathetic system switched on, so the fix is finishing hard efforts well before bed, fuelling enough to keep cortisol down, and deloading when sleep and HRV both slide.",
      episodeSlug: "the-science-of-getting-faster-after-40-dr-andy-galpin",
      guestSlug: "andy-galpin",
    },
    title: "Training Ruining Your Sleep? Here's Why",
    seoTitle: "Cycling Training Disrupting Sleep? Fix This",
    seoDescription: "Can't sleep after hard rides? The cortisol, timing, and overtraining reasons — and the recovery protocol.",
    pillar: "recovery",
    problem: "You train hard, eat well, go to bed tired — then lie there wired. Resting HR elevated. Waking at 3am. The harder you train, the worse you sleep.",
    causes: [
      "Late-evening high-intensity sessions elevate cortisol for 2-4 hours",
      "Sympathetic nervous system dominance from chronic high training load",
      "Under-fuelling — low glycogen and elevated cortisol disrupt sleep",
      "Overtraining spectrum — disrupted sleep is an early overtraining signal",
      "Caffeine too late — half-life of 5-6 hours means 2pm coffee affects midnight sleep",
      "Screen exposure post-ride compounding sympathetic arousal",
    ],
    solutions: [
      { title: "Time hard sessions", description: "Finish intervals 3+ hours before bed", href: "/blog/cycling-sleep-optimisation" },
      { title: "Check energy availability", description: "Under-fuelling drives cortisol", href: "/tools/energy-availability" },
      { title: "Track HRV trends", description: "Declining HRV + bad sleep = overreaching. Schedule a deload", href: "/blog/cycling-hrv-training-guide" },
      { title: "Read the sleep guide", description: "Full sleep optimisation protocol for cyclists", href: "/blog/cycling-sleep-performance-guide" },
    ],
    toolHref: "/tools/energy-availability",
    toolLabel: "Check your energy availability",
  },
  {
    slug: "race-anxiety",
    expertEvidence: {
      name: "Dr Michael Gervais",
      credential: "High-performance psychologist, worked with NFL, Olympic, and World Tour athletes",
      insight:
        "Gervais teaches that controlling negative thoughts under pressure is a trainable skill, and the people who fail at it usually haven't pre-scripted their response to the moments that hurt most. A written, rehearsed self-talk plan — practised in hard training before race day — changes the internal dialogue when the nerves arrive.",
      episodeSlug: "ep-2181-beating-negative-thoughts-why-99-fail-and-how-you-wont-dr-ge",
      guestSlug: "dr-michael-gervais",
    },
    title: "Pre-Race Nerves — How to Manage Race Anxiety",
    seoTitle: "Race Anxiety Cycling? How to Manage Pre-Race Nerves",
    seoDescription: "Race-day nerves destroying performance? Mental, physical, and preparation strategies that turn anxiety into fuel.",
    pillar: "coaching",
    problem: "Night before a race you can't sleep. Morning of, stomach in knots. Start line HR is 30 bpm above normal. First 20 minutes you ride too hard, too reactive.",
    causes: [
      "Outcome focus — worrying about results instead of process",
      "Under-preparation — anxiety scales with uncertainty about readiness",
      "Catastrophising — imagining worst-case scenarios",
      "Comparison — measuring against other entrants instead of your own targets",
      "Unfamiliar environment — new course, new competitors",
      "Physical manifestation — elevated HR, GI distress from adrenaline",
    ],
    solutions: [
      { title: "Write a race-day process plan", description: "Pacing, fuelling, gear — anxiety lives in ambiguity", href: "/blog/cycling-nutrition-race-day-guide" },
      { title: "Recce the course", description: "Familiarity reduces uncertainty", href: "/plan" },
      { title: "Practise race simulation", description: "Race-pace efforts normalise the stress response", href: "/glossary/pacing-strategy" },
      { title: "Focus on controllables", description: "Power targets, fuelling, breathing — not the field", href: "/blog/race-day-fuelling-24-hour-timeline" },
    ],
    toolHref: "/tools/fuelling",
    toolLabel: "Build your race-day fuel plan",
  },
];

export function getProblemBySlug(slug: string): ProblemPage | null {
  return PROBLEM_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getAllProblemSlugs(): string[] {
  return PROBLEM_PAGES.map((p) => p.slug);
}
