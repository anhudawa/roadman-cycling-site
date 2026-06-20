import type { AnswerPage } from "@/lib/answers";

/**
 * Training-metric definitions — the citation-optimised "what is X" answer
 * pages for the TrainingPeaks load metrics and the effort measures that sit
 * alongside them. These fill the answer-layer gap for TSS, CTL, TSB, aerobic
 * decoupling and RPE: the long-form `reading-your-training-data` blog covers
 * them together, but the /answers layer needs each as a single, extractable
 * definition (matching the existing pattern of what-is-ftp / what-is-zone-2).
 */
export const metricsAnswers: AnswerPage[] = [
  // ============================================================
  // WHAT IS TSS
  // ============================================================
  {
    slug: "what-is-tss",
    cluster: "periodisation",
    question: "What Is TSS in TrainingPeaks?",
    seoTitle: "What Is TSS in TrainingPeaks? Training Stress Score Explained",
    seoDescription:
      "TSS (Training Stress Score) measures how demanding a ride was by combining intensity and duration. One hour flat out at threshold scores 100. What it means and how to use it.",
    pillar: "coaching",
    directAnswer:
      "TSS — Training Stress Score — is a single number that measures how demanding a ride was by combining its intensity and its duration. One hour ridden flat out at threshold (an intensity factor of 1.0) scores 100 TSS, and everything else scales from there. A steady two-hour endurance ride might be 120; a hard hour of intervals, 95. It's the building block TrainingPeaks uses to track your training load over time.",
    keyTakeaways: [
      "TSS combines intensity and duration into one number — one hour flat out at threshold equals 100.",
      "It's the unit that feeds the bigger picture: CTL (fitness), ATL (fatigue) and TSB (form) are all built from your daily TSS.",
      "Use it to compare and plan rides, not to chase. More TSS isn't automatically better training.",
      "A long easy ride can score more TSS than a short hard one — duration counts as much as intensity.",
    ],
    whoFor: [
      {
        label: "The rider new to power data",
        detail:
          "You've started logging rides and keep seeing 'TSS' without knowing what it actually measures.",
      },
      {
        label: "The structured amateur planning load",
        detail:
          "You want to manage your weekly training load deliberately rather than by feel.",
      },
    ],
    roadmanView: [
      "TSS is the most useful number on your screen that the most riders misunderstand. People treat it like a score to maximise — more TSS, better week — and that's exactly backwards. It's a measurement, not a target. Its whole value is that it lets you compare wildly different rides on one scale and stack them into a picture of your training load over time.",
      "Think of it as an objective version of the question 'how hard was that, out of ten?' One hour absolutely flat out is the anchor at 100. From there, a long easy ride accumulates a big TSS through duration, and a short brutal session accumulates it through intensity. That's the point: it captures both, which is why TrainingPeaks builds your fitness, fatigue and form lines out of it. It is the platform Roadman delivers its Method plans through for exactly this reason — once load is measured, it can be managed.",
      "So use TSS to understand and plan, never to win. The riders who chase a bigger weekly TSS number end up in the grey zone, accumulating load without adaptation. The riders who use it well watch the trend and let it inform when to push and when to back off.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Co-founder of TrainingPeaks, author of The Cyclist's Training Bible",
        insight:
          "The framework that turns ride files into training load — TSS and the fitness, fatigue and form lines built from it — is the language Friel helped give the sport. The point of measuring load is to manage it: to ramp it sensibly and arrive fresh, not to maximise a weekly number.",
        episodeSlug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Read TSS per ride, not in isolation",
        detail:
          "After each ride, note its TSS alongside what the session was for. Over a few weeks you'll learn what a typical endurance ride, threshold session and long ride score for you.",
      },
      {
        title: "Watch the weekly total trend",
        detail:
          "Add up your weekly TSS and watch whether it's climbing sensibly across a build. A rough guide is to keep the week-on-week rise modest — big jumps are where riders get hurt.",
      },
      {
        title: "Let it feed the bigger picture",
        detail:
          "Don't stop at single rides. TSS is the input to CTL, ATL and TSB on the Performance Management Chart, which is where the real planning value lives.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Treating TSS as a score to maximise every week.",
        fix:
          "It's a measurement, not a target. Chasing a bigger number pushes you into grey-zone riding. Watch the trend and let it guide load.",
      },
      {
        mistake: "Assuming a hard short ride always beats an easy long one.",
        fix:
          "Duration counts as much as intensity. A long endurance ride can carry a higher TSS — and a bigger aerobic stimulus — than a brief hard one.",
      },
    ],
    faq: [
      {
        question: "How is TSS calculated?",
        answer:
          "TSS is derived from the duration of a ride and its intensity factor — your normalised power for the ride divided by your FTP. For a steady effort it's roughly the duration in hours multiplied by the square of the intensity factor, times 100. One hour at FTP is 100 by definition.",
      },
      {
        question: "What is a good TSS for a ride?",
        answer:
          "There's no single good number — it depends entirely on the ride's purpose. A recovery spin might be 30, an endurance ride 80–150, a hard interval session 90–120, and a big sportive 250–350. The right TSS is the one that matches what the session was meant to do.",
      },
      {
        question: "How much TSS per week should a cyclist do?",
        answer:
          "It depends on your fitness and available time, and it's best judged by the trend rather than a fixed figure. The key is a sensible week-on-week progression with recovery weeks built in — big spikes in weekly TSS are a common cause of injury and burnout.",
      },
      {
        question: "Do I need a power meter to get TSS?",
        answer:
          "A power meter gives the most accurate TSS, but TrainingPeaks can also estimate it from heart rate (hrTSS) or from RPE and duration. The power-based figure is the gold standard, but a heart-rate or perceived-effort version still lets you track load.",
      },
      {
        question: "What's the difference between TSS and intensity factor?",
        answer:
          "Intensity factor describes how hard a ride was relative to your threshold, regardless of length. TSS combines that intensity with duration, so it describes the total stress of the ride. A short ride and a long ride can share an intensity factor but have very different TSS.",
      },
      {
        question: "Is more TSS always better?",
        answer:
          "No. TSS measures load, not adaptation. Stacking up high weekly TSS without recovery accumulates fatigue and stalls progress. The skill is applying the right load and then recovering from it, which is what the fitness and form lines help you see.",
      },
    ],
    relatedEpisodes: [
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    ],
    relatedTopics: [
      {
        label: "Reading Your Training Data: TSS, CTL, ATL & TSB",
        href: "/blog/reading-your-training-data-tss-ctl-atl-tsb",
      },
      { label: "What is CTL in TrainingPeaks?", href: "/answers/what-is-ctl" },
      { label: "What is Training Stress Balance (TSB)?", href: "/answers/what-is-tsb" },
      {
        label: "Tapering With the Performance Management Chart",
        href: "/blog/cycling-taper-pmc-performance-management-chart",
      },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "TSS is a well-defined, widely-used training-load metric; framing reflects standard TrainingPeaks methodology and coaching practice across the Roadman archive.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS CTL
  // ============================================================
  {
    slug: "what-is-ctl",
    cluster: "periodisation",
    question: "What Is CTL in TrainingPeaks?",
    seoTitle: "What Is CTL in TrainingPeaks? Chronic Training Load Explained",
    seoDescription:
      "CTL (Chronic Training Load) is your fitness — a 42-day average of your daily TSS in TrainingPeaks. What it means, why it moves slowly, and how to use the trend.",
    pillar: "coaching",
    directAnswer:
      "CTL — Chronic Training Load — is your fitness, modelled in TrainingPeaks as a 42-day exponentially weighted average of your daily TSS. Because it averages over six weeks, it moves slowly: months of consistent training push it up, and a couple of easy weeks let it drift down. A higher CTL means a bigger engine, but it's the steady upward trend, not the absolute number, that matters.",
    keyTakeaways: [
      "CTL is your fitness — a rolling 42-day average of your daily training load (TSS).",
      "It moves slowly by design. You build it over months and lose it slowly, not in a week.",
      "Judge it on the trend: a steadily climbing CTL means your training is accumulating.",
      "Ramp it sensibly — too fast a rise in CTL is how riders dig a fatigue hole.",
    ],
    whoFor: [
      {
        label: "The rider building toward an event",
        detail:
          "You want to know whether your fitness is genuinely climbing as your event approaches.",
      },
      {
        label: "The data-curious amateur",
        detail:
          "You see a 'CTL' line in TrainingPeaks and want to know what it's actually telling you.",
      },
    ],
    roadmanView: [
      "CTL is the closest thing you have to a single dial for fitness, and its slowness is its strength. A 42-day average can't be faked by one heroic weekend or wrecked by one missed session. It rewards exactly the thing that actually builds cyclists: consistency over months. That's why the line you want to see is a patient, steady climb, not a spike.",
      "The number itself means little in isolation — a CTL of 70 is meaningful for one rider and modest for another. What matters is your own trend and your own ramp rate. Push CTL up too quickly, by ramping your weekly load hard, and you build fatigue faster than you build fitness; let it slide for weeks and the engine quietly shrinks. The art is a sustainable rise, with recovery weeks that dip it slightly so the next block lands.",
      "And CTL only earns its keep alongside its siblings. On its own it tells you how big the engine is. Read against ATL (fatigue) and TSB (form), it tells you whether you can actually use that engine right now. It's one line in a three-line story.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Co-founder of TrainingPeaks, author of The Cyclist's Training Bible",
        insight:
          "Fitness is built slowly and consistently, which is exactly what a long rolling average captures. The value of a chronic-load line is that it ignores the noise of any single ride and shows whether the training is genuinely accumulating over time.",
        episodeSlug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Track the slope, not the number",
        detail:
          "Open your Performance Management Chart and look at whether the CTL line is rising, flat or falling over the last several weeks. Rising means you're building; flat or falling means you're maintaining or detraining.",
      },
      {
        title: "Ramp it sensibly",
        detail:
          "Aim for a gradual rise across a build, with a recovery week every third or fourth week that lets the line dip slightly. A steep, relentless climb is a fast route to a fatigue hole.",
      },
      {
        title: "Use it to plan a peak",
        detail:
          "Build CTL through your training block, then in the taper hold it roughly steady while fatigue drops — that's how form arrives on the day.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Chasing a higher CTL number for its own sake.",
        fix:
          "A bigger number built on unsustainable load just buries you. Aim for a steady, recoverable rise, not a record CTL.",
      },
      {
        mistake: "Panicking when CTL dips during a taper or rest week.",
        fix:
          "A small CTL drop while shedding fatigue is exactly what should happen. You lose a little fitness to gain a lot of freshness.",
      },
    ],
    faq: [
      {
        question: "What is a good CTL for a cyclist?",
        answer:
          "There's no universal good number — it's relative to the rider and the event. Many amateurs ride strong sportives and races with a CTL in the 60s to 80s, but what matters is your own trend, not comparing your figure to someone else's.",
      },
      {
        question: "How fast can I raise my CTL?",
        answer:
          "Sustainably, only gradually. A modest week-on-week rise in training load is what builds CTL without digging a fatigue hole. Spiking your weekly TSS to force CTL up quickly usually backfires within a couple of weeks.",
      },
      {
        question: "Does CTL equal fitness?",
        answer:
          "It's a good proxy for the size of your aerobic engine, but it's not the whole story. CTL says how much training load you can carry; it doesn't capture freshness, sharpness or event-specific skills. Read it alongside ATL and TSB.",
      },
      {
        question: "Will my CTL drop on a rest week?",
        answer:
          "Yes, slightly, and that's intended. A recovery week reduces load, so the 42-day average dips a little. The fitness isn't lost — the brief dip lets accumulated fatigue clear so the next block is productive.",
      },
      {
        question: "How much CTL do I lose when I stop training?",
        answer:
          "CTL falls gradually because it's a long average, so a few days off barely register. Longer breaks see it decline steadily, but it also rebuilds faster than it built the first time once you return to consistent training.",
      },
      {
        question: "What's the difference between CTL and ATL?",
        answer:
          "CTL is a 42-day average representing fitness, so it moves slowly; ATL is a 7-day average representing fatigue, so it moves fast. The gap between them is your form (TSB). Together they show whether your engine is big and whether you're fresh enough to use it.",
      },
    ],
    relatedEpisodes: [
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    ],
    relatedTopics: [
      {
        label: "Reading Your Training Data: TSS, CTL, ATL & TSB",
        href: "/blog/reading-your-training-data-tss-ctl-atl-tsb",
      },
      { label: "What is TSS in TrainingPeaks?", href: "/answers/what-is-tss" },
      { label: "What is Training Stress Balance (TSB)?", href: "/answers/what-is-tsb" },
      {
        label: "Tracking Efficiency Factor in TrainingPeaks",
        href: "/blog/efficiency-factor-trainingpeaks-tracking",
      },
      { label: "How should I taper for a race?", href: "/answers/how-to-taper-for-a-race" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "CTL is a standard, well-defined training-load metric; framing reflects established TrainingPeaks methodology and coaching practice.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS TSB
  // ============================================================
  {
    slug: "what-is-tsb",
    cluster: "periodisation",
    question: "What Is Training Stress Balance (TSB)?",
    seoTitle: "What Is TSB? Training Stress Balance (Form) Explained",
    seoDescription:
      "TSB (Training Stress Balance) is your form — fitness (CTL) minus fatigue (ATL) in TrainingPeaks. What the number means and the TSB target for race day.",
    pillar: "coaching",
    directAnswer:
      "TSB — Training Stress Balance — is your form, calculated in TrainingPeaks as your fitness (CTL) minus your fatigue (ATL). When it's deeply negative you're buried under training load; when it swings positive the fatigue has cleared while the fitness remains, which is the feeling of fresh, snappy legs. Most riders perform best with a race-day TSB of roughly +5 to +15.",
    keyTakeaways: [
      "TSB is your form: fitness (CTL) minus fatigue (ATL).",
      "Deeply negative means buried; positive means fresh. Hard training blocks should run negative.",
      "Aim for a race-day TSB of about +5 to +15 — masters riders often need the higher end.",
      "It's the number a taper is built to control: hold fitness, shed fatigue, lift form.",
    ],
    whoFor: [
      {
        label: "The rider timing a peak",
        detail:
          "You've got a target event and want to arrive fresh rather than fried.",
      },
      {
        label: "The rider confused by the form line",
        detail:
          "Your TSB is negative and you're worried something's wrong — it usually isn't.",
      },
    ],
    roadmanView: [
      "TSB is the most actionable number in the whole system, because it tells you not how big your engine is but whether you can use it right now. It's simply fitness minus fatigue, and that subtraction is the whole game of peaking. Through a hard training block your fatigue outweighs your fitness, TSB sits negative, and your legs feel heavy — that's correct, not a problem. You can't build without carrying fatigue.",
      "The magic happens in the taper. Cut the volume, keep a little intensity, and your fatigue (ATL) falls fast while your fitness (CTL) barely moves. The gap opens, TSB climbs through zero into positive territory, and the form you built all those weeks finally surfaces. Watching that line lift into the green is the cleanest confirmation you're peaking by design rather than by luck — and it's the single best antidote to the taper panic that tells you to add a session.",
      "The honest caveat: too much of a good thing is still a problem. Push TSB far beyond about +25 and you've usually shed so much training that the engine has started to shrink — fresh but flat. The target is a band, not a maximum. Land in it and you race at your best.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Co-founder of TrainingPeaks, author of The Cyclist's Training Bible",
        insight:
          "Form is the relationship between fitness and fatigue, not fitness alone. The reason a taper works is that fatigue clears faster than fitness fades, so a well-timed reduction in load lifts form into a positive range right as the event arrives.",
        episodeSlug: "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Expect negative TSB while training hard",
        detail:
          "Through a build block, TSB sitting negative and your legs feeling heavy is normal and correct. Don't try to keep form positive while you're still building.",
      },
      {
        title: "Use the taper to lift it",
        detail:
          "In the two weeks before an event, cut volume while keeping a little intensity. Watch ATL fall, CTL hold, and TSB climb toward your target band.",
      },
      {
        title: "Aim for the band, not the ceiling",
        detail:
          "Target roughly +5 to +15 for race morning, leaning higher if you're a masters rider who sheds fatigue slowly. Beyond about +25 you've usually over-tapered.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Worrying that a negative TSB means something is wrong.",
        fix:
          "Negative TSB during a training block is exactly right — it means you're carrying the load that builds fitness. Form comes when you taper.",
      },
      {
        mistake: "Tapering until TSB is sky-high.",
        fix:
          "Past about +25 you've shed too much training and arrive flat. Aim for the +5 to +15 band, not the biggest possible number.",
      },
    ],
    faq: [
      {
        question: "What TSB should I aim for on race day?",
        answer:
          "Most riders perform best with a race-day TSB of around +5 to +15 — fresh enough that the fatigue has gone, not so fresh that fitness has slipped. Masters riders often want the higher end of that range because they clear fatigue more slowly.",
      },
      {
        question: "Is a negative TSB bad?",
        answer:
          "Not at all during training. A negative TSB means your fatigue outweighs your fitness, which is exactly what a productive training block looks like. It only becomes a problem if you try to race on it — that's what the taper fixes.",
      },
      {
        question: "How is TSB calculated?",
        answer:
          "TSB is your CTL (fitness, a 42-day load average) minus your ATL (fatigue, a 7-day load average), using yesterday's values. Because ATL moves fast and CTL slowly, reducing training quickly drops ATL and pushes TSB positive.",
      },
      {
        question: "What does positive TSB feel like?",
        answer:
          "Fresh, snappy legs and a sense that efforts come easily. It's the feeling of fitness without the fatigue masking it — which is precisely why you time it to arrive on the day that matters.",
      },
      {
        question: "Can TSB be too high?",
        answer:
          "Yes. Beyond roughly +25 you've usually cut training so far that fitness has started to fade, leaving you fresh but flat with no snap. Form is a band to hit, not a number to maximise.",
      },
      {
        question: "Is TSB the same as form?",
        answer:
          "Yes — TSB is the technical name for what cyclists call form or freshness. It's the model's estimate of how ready you are to perform, derived from the balance of your fitness and fatigue.",
      },
    ],
    relatedEpisodes: [
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
      "ep-2256-time-trial-how-to-time-trial-faster-with-david-millar",
    ],
    relatedTopics: [
      {
        label: "Tapering With the Performance Management Chart",
        href: "/blog/cycling-taper-pmc-performance-management-chart",
      },
      { label: "What is CTL in TrainingPeaks?", href: "/answers/what-is-ctl" },
      { label: "What is TSS in TrainingPeaks?", href: "/answers/what-is-tss" },
      { label: "How should I taper for a race?", href: "/answers/how-to-taper-for-a-race" },
      {
        label: "Reading Your Training Data: TSS, CTL, ATL & TSB",
        href: "/blog/reading-your-training-data-tss-ctl-atl-tsb",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "TSB/form is a standard training-load model output; race-day targets reflect widely-used coaching guidance and the Roadman tapering methodology.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS AEROBIC DECOUPLING
  // ============================================================
  {
    slug: "what-is-aerobic-decoupling",
    cluster: "zone2",
    question: "What Is Aerobic Decoupling?",
    seoTitle: "What Is Aerobic Decoupling? Pw:Hr Drift Explained",
    seoDescription:
      "Aerobic decoupling measures how much your power-to-heart-rate ratio drifts across a steady ride. Under ~5% means good endurance durability. What it is and how to use it.",
    pillar: "coaching",
    directAnswer:
      "Aerobic decoupling measures how much your power-to-heart-rate ratio drifts between the first and second half of a steady ride — shown in TrainingPeaks as Pw:Hr. Under about 5% means your aerobic system held steady and you have good endurance durability; a larger drift means you faded. It's one of the cleanest tests of whether your aerobic base is deep enough for the distance you're riding.",
    keyTakeaways: [
      "Decoupling is the drift between your power-to-heart-rate ratio in the first half of a ride versus the second.",
      "Under about 5% drift signals good aerobic durability; more than that means you faded.",
      "Measure it on steady aerobic or tempo rides — not variable, stop-start, or all-out efforts.",
      "Falling decoupling over a base block is proof your endurance is genuinely improving.",
    ],
    whoFor: [
      {
        label: "The endurance rider testing durability",
        detail:
          "You want to know whether your base is deep enough to hold power late in long rides.",
      },
      {
        label: "The data-driven base builder",
        detail:
          "You're doing a Zone 2 block and want a metric that shows it's working.",
      },
    ],
    roadmanView: [
      "Aerobic decoupling answers a question every long-ride rider cares about: do I fade? It's not about how much power you can produce on a fresh, short effort — it's about whether you can still produce it three hours in. The number compares your power-to-heart-rate ratio early in a steady ride against the same ratio late in it. If your heart rate has crept up to hold the same power, your system decoupled, and that drift is the measurement.",
      "Under roughly 5% is the marker of genuine aerobic durability — the system held steady, your base is deep enough for the ride. A bigger drift tells you that you faded, whether from a base that isn't deep enough yet, under-fuelling, heat, or simply going longer than your fitness currently supports. That makes it a brilliant honesty check on a Zone 2 block: as the base builds, decoupling on your benchmark ride should fall.",
      "Use it alongside Efficiency Factor and you've got a proper aerobic dashboard — EF showing efficiency on a given day, decoupling showing how well that efficiency holds up within the ride. The combination, both trending the right way, is exactly what a base phase is supposed to produce.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, polarised-training researcher",
        insight:
          "The aerobic base built by large volumes of easy riding is precisely what lets a rider hold output deep into a long effort. Durability — sustaining performance late, not just producing a high peak — is a defining quality of well-developed endurance fitness.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Test on a steady benchmark ride",
        detail:
          "Pick a repeatable steady aerobic or tempo ride of 60–120 minutes in similar conditions. Decoupling only means something when the effort is steady — sprints, climbs and stop-start riding make it noise.",
      },
      {
        title: "Read the Pw:Hr figure",
        detail:
          "TrainingPeaks calculates decoupling for you as Pw:Hr. Under about 5% is good aerobic durability; well over it on a ride you should comfortably handle is a sign your base needs more depth.",
      },
      {
        title: "Track it across a base block",
        detail:
          "Compare the same benchmark ride every few weeks. Decoupling falling over a block is direct evidence your endurance is improving — often before your FTP moves.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Measuring decoupling on a hard, variable or hilly ride.",
        fix:
          "It only means something on a steady aerobic effort. Use a controlled benchmark ride, not a race or a punchy group ride.",
      },
      {
        mistake: "Blaming a high reading entirely on fitness.",
        fix:
          "Heat, under-fuelling and dehydration all inflate decoupling. Rule those out before concluding your base is the problem.",
      },
    ],
    faq: [
      {
        question: "What is a good aerobic decoupling percentage?",
        answer:
          "Under about 5% drift on a steady aerobic ride is generally considered a sign of good aerobic durability. Readings consistently above that on rides you should be able to handle suggest your aerobic base needs more depth.",
      },
      {
        question: "How is aerobic decoupling calculated?",
        answer:
          "It compares the average power-to-heart-rate ratio in the first half of a steady ride with the second half, expressed as a percentage drift. A rising heart rate needed to hold the same power produces a positive decoupling figure.",
      },
      {
        question: "What causes high decoupling?",
        answer:
          "A base that isn't deep enough for the ride is the main fitness cause, but heat, dehydration, under-fuelling and simply riding longer than your current fitness supports all push the number up too. Control those before judging your base.",
      },
      {
        question: "How do I lower my aerobic decoupling?",
        answer:
          "Build your aerobic base with consistent Zone 2 volume, fuel and hydrate long rides properly, and let durability develop over weeks. A falling decoupling figure on the same benchmark ride is the signal it's working.",
      },
      {
        question: "Is decoupling the same as cardiac drift?",
        answer:
          "They're closely related. Cardiac drift is the upward creep of heart rate at a steady effort; aerobic decoupling is the way that drift is quantified as a power-to-heart-rate percentage so you can track it over time.",
      },
      {
        question: "Do I need a power meter to measure decoupling?",
        answer:
          "Power and heart rate together give the cleanest measure (Pw:Hr). Without power you can still look at pace-to-heart-rate drift on a steady ride, but it's noisier — power makes the figure far more reliable.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
    ],
    relatedTopics: [
      {
        label: "Aerobic Decoupling & Cardiac Drift — Full Guide",
        href: "/blog/aerobic-decoupling-cycling-cardiac-drift",
      },
      {
        label: "Tracking Efficiency Factor in TrainingPeaks",
        href: "/blog/efficiency-factor-trainingpeaks-tracking",
      },
      { label: "What is Zone 2 training?", href: "/answers/what-is-zone-2-training" },
      { label: "How much Zone 2 should I do?", href: "/answers/how-much-zone-2" },
      {
        label: "Zone 2 Training — Complete Guide",
        href: "/blog/zone-2-training-complete-guide",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Aerobic decoupling is an established durability metric; the ~5% threshold reflects common coaching convention, with durability framing grounded in Seiler's endurance research.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS RPE
  // ============================================================
  {
    slug: "what-is-rpe-cycling",
    cluster: "power",
    question: "What Is RPE in Cycling Training?",
    seoTitle: "What Is RPE in Cycling? Rate of Perceived Exertion Explained",
    seoDescription:
      "RPE (Rate of Perceived Exertion) rates how hard a session felt, usually 1–10. Why it matters even with power, how to use it, and what session RPE adds.",
    pillar: "coaching",
    directAnswer:
      "RPE — Rate of Perceived Exertion — is a simple rating of how hard a session felt, usually on a scale of 1 to 10. It captures the subjective cost of an effort — heavy legs, mental strain — that a power number can't show. Logged after each session, it's a free, always-available measure of training stress that works even when your power meter doesn't, and it often flags fatigue before the watts do.",
    keyTakeaways: [
      "RPE rates how hard a session felt, typically 1–10. It measures cost, where power measures output.",
      "It catches what power misses: the same watts can feel like a 5 when fresh and an 8 when buried.",
      "Session RPE (your rating multiplied by duration) gives a training-load figure that tracks closely with power-based TSS.",
      "It's the one load metric that's always available — no battery, no sensor, every ride.",
    ],
    whoFor: [
      {
        label: "The rider who trains with power",
        detail:
          "You log watts but want the other half of the picture — what the effort actually cost.",
      },
      {
        label: "The rider without a power meter",
        detail:
          "You want a reliable way to gauge and log intensity without expensive kit.",
      },
    ],
    roadmanView: [
      "RPE is the most undervalued metric in training, because in the rush to data we forgot that how an effort feels is itself information. Power tells you what you produced. RPE tells you what it cost. The same 250 watts can be a controlled 5 out of 10 on a good day and a desperate 8 the week your sleep fell apart — and that gap, between the number and the feeling, is one of the earliest signs that fatigue is accumulating. It usually shows up in the RPE before it shows up in a drop in power.",
      "There's a way to turn feel into trackable data: session RPE, your overall rating multiplied by the session's duration in minutes. The published research shows it tracks closely with power-based TSS for most riders, which means you've got two independent reads on how hard your week was — and where they disagree is exactly where the interesting questions about fatigue and stress live. It's also the only load metric that never leaves you: dead battery, hire bike, an off-season run — all of them have an RPE.",
      "This is why the best coaching keeps the human in the loop. As Vasilis Anastopoulos put it on the podcast, all the data in the world still comes back to the rider asking, every morning, how they actually feel. The honest post-session note is where that lives, and it's free.",
    ],
    expertEvidence: [
      {
        name: "Vasilis Anastopoulos",
        credential: "Professional cycling coach (Cavendish's lead-out and sprint coach)",
        insight:
          "However good the data gets — HRV, power, readiness scores — the decisive input is still the rider's own answer to how they feel that morning. The numbers inform the call; perceived effort and honest self-report make it.",
        guestSlug: "vasilis-anastopoulos",
      },
    ],
    practicalApplication: [
      {
        title: "Log an RPE after every session",
        detail:
          "Before you close the app, rate the session 1–10 and add a line on the legs, your sleep and any life stress. It takes ten seconds and builds a record no power file contains.",
      },
      {
        title: "Watch for the power-feel gap",
        detail:
          "When a session that should feel like a 5 comes in at an 8 for the same power, treat it as an early fatigue flag — back off before the watts drop, not after.",
      },
      {
        title: "Use session RPE when you have no power",
        detail:
          "Multiply your overall RPE by the ride's duration in minutes for a subjective training-load figure. It lets you track load on any ride, with or without a power meter.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Ignoring RPE because you 'have power'.",
        fix:
          "Power and RPE answer different questions — output versus cost. Logging both catches fatigue and stress that watts alone hide.",
      },
      {
        mistake: "Rating effort dishonestly to protect your ego.",
        fix:
          "RPE only works if it's honest. A soft-pedalled rating hides exactly the fatigue signal the metric exists to catch.",
      },
    ],
    faq: [
      {
        question: "What does RPE mean in cycling?",
        answer:
          "RPE stands for Rate of Perceived Exertion — a subjective rating of how hard an effort or session felt, usually on a 1-to-10 scale. It measures the cost of the effort, which complements power's measure of the output you produced.",
      },
      {
        question: "Why use RPE if I train with power?",
        answer:
          "Because they answer different questions. Power says what you did; RPE says what it cost you on the day. When the same power suddenly feels much harder, that divergence is often the first sign of fatigue, stress or illness — and it shows in the RPE before the watts.",
      },
      {
        question: "What is session RPE?",
        answer:
          "Session RPE, or sRPE, is your overall RPE for a workout multiplied by its duration in minutes, giving a single subjective training-load figure. The research shows it tracks closely with power-derived TSS, and it's available on any ride, with or without a power meter.",
      },
      {
        question: "How accurate is RPE without a power meter?",
        answer:
          "With a little practice, RPE is a genuinely useful guide to intensity — riders learn to map ratings onto their zones reliably. It's less precise than power for hitting exact targets, but for managing overall effort and load it's effective and always available.",
      },
      {
        question: "What is a good RPE for an easy ride?",
        answer:
          "An easy aerobic ride should sit around 2–4 out of 10 — conversational, comfortable, the kind of effort you could sustain for hours. If your easy rides regularly feel harder than that, they're probably drifting too hard.",
      },
      {
        question: "How do coaches use RPE?",
        answer:
          "Coaches read RPE and the note alongside the power data to adjust the plan to the rider. A prescribed easy session that felt like an 8, or a run of poor sleep logged before a key workout, tells a coach to ease off before the rider digs a hole.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2256-time-trial-how-to-time-trial-faster-with-david-millar",
    ],
    relatedTopics: [
      {
        label: "RPE and Power: Using Them Together",
        href: "/blog/rpe-and-power-using-them-together",
      },
      {
        label: "The Post-Session Note in TrainingPeaks",
        href: "/blog/post-session-feedback-trainingpeaks-notes",
      },
      { label: "What is Zone 2 training?", href: "/answers/what-is-zone-2-training" },
      { label: "How do I improve my FTP?", href: "/answers/how-to-improve-ftp" },
      { label: "HR Zone Calculator", href: "/tools/hr-zones" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "RPE and session-RPE are well-established, validated subjective load measures; the self-report framing reflects coaching practice across the Roadman archive.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },
];
