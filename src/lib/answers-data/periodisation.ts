import type { AnswerPage } from "@/lib/answers";

export const periodisationAnswers: AnswerPage[] = [
  // ============================================================
  // 1 — WHAT IS PERIODISATION IN CYCLING
  // ============================================================
  {
    slug: "what-is-periodisation-cycling",
    cluster: "periodisation",
    question: "What Is Periodisation in Cycling?",
    seoTitle: "What Is Periodisation in Cycling? The Plain-English Answer",
    seoDescription:
      "Periodisation in cycling means deliberately varying your training load and focus across the year so peak fitness arrives on race day. What it is, why it works, and how amateurs apply it.",
    pillar: "coaching",
    directAnswer:
      "Periodisation is the deliberate structuring of training into distinct phases — typically base, build, and peak — so your body adapts progressively and arrives at its best on a specific date. Rather than training the same way year-round, each phase has a different focus: volume, intensity, or sharpening. For most serious amateurs, a well-periodised season produces 10–20% more gain from the same hours than unstructured riding.",
    keyTakeaways: [
      "Periodisation divides the year into base, build, and peak phases, each with a distinct purpose.",
      "The aim is to have peak fitness land on your target event, not randomly throughout the year.",
      "Grey-zone year-round riding is the opposite of periodisation — it produces steady fatigue and slow gains.",
      "Amateurs benefit as much as pros — the principles scale down to 6–8 hours a week.",
    ],
    whoFor: [
      {
        label: "The self-coached rider starting to plan",
        detail:
          "You've been riding without structure and want to understand the framework behind serious training plans.",
      },
      {
        label: "The rider whose fitness peaks at the wrong time",
        detail:
          "You feel great in February and flat in June, and want to know how to flip that.",
      },
    ],
    roadmanView: [
      "The word makes it sound complicated. It isn't. Periodisation is just the idea that you can't be at your best all year, so you deliberately choose when to be at your best and work backwards from there. Anthony has covered this with Joe Friel, Dan Lorang, and Dylan Johnson across multiple episodes, and the framework they all use is structurally the same: a long base phase to build the engine, a build phase to sharpen it, and a peak to express it.",
      "The reason most amateurs never periodise is that they confuse consistency with sameness. Riding consistently is good. Riding the same way every month of the year — same zones, same sessions, same effort — is what prevents adaptation. The body responds to change, and periodisation is simply the organised version of providing that change.",
      "You don't need a coaching software licence or a spreadsheet with twenty tabs. You need a target date, a rough plan backwards from it, and the discipline to do easy phases easy and hard phases hard. That's it.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "Friel has argued for decades that the biggest gains available to amateur cyclists come from structuring the year rather than from any single session or training trick. The annual training plan — an A-event, phases working back from it, honest recovery built in — is the foundation everything else sits on.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Lorang's work coaching Primož Roglič across a full Grand Tour season distils to the same principle: you cannot be at peak condition every week of the year, and attempting it guarantees you are never truly at your best. The amateur equivalent is picking two or three A-events and building everything around them.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Pick one A-event and work backwards",
        detail:
          "Find your most important event — a gran fondo, a sportive, a target climb — and place it on a calendar. Then block out three to four months before it as your build phase, and the months before that as base. You now have a periodised year.",
      },
      {
        title: "Assign a different focus to each phase",
        detail:
          "Base = high volume, low intensity, mostly zone 2. Build = introduce threshold and VO2max blocks. Peak = sharpen and taper. Don't mix phases. Trying to do base and build simultaneously means doing neither properly.",
      },
      {
        title: "Schedule deload weeks every 3–4 weeks",
        detail:
          "Within each phase, reduce volume by 30–40% every third or fourth week. Fitness is built during work; it's expressed during recovery. Planned deloads prevent accumulated fatigue from masking your gains.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Training the same way in December as in May.",
        fix:
          "Each phase should feel different. December is base work, not mini-build. Let the year have seasons.",
      },
      {
        mistake: "Skipping the base phase because it feels too easy.",
        fix:
          "The base is what allows high-intensity work to land later without injury or burnout. Skip it and your build phase crumbles.",
      },
      {
        mistake: "Treating every ride as an A-event and refusing to have down phases.",
        fix:
          "You cannot be at peak fitness year-round. Plan your peak, protect your off-season, and let adaptation happen in the down months.",
      },
    ],
    faq: [
      {
        question: "Do amateurs really need to periodise?",
        answer:
          "Yes, especially those training 6+ hours a week. Without periodisation you spend most of the year in a moderate grey zone that accumulates fatigue without producing peak fitness at any point. Structured phases give your body a reason to adapt at specific times.",
      },
      {
        question: "What is linear versus undulating periodisation?",
        answer:
          "Linear periodisation moves progressively from base to build to peak in distinct blocks over months. Undulating periodisation varies intensity week to week or even session to session. For most amateurs, linear periodisation across a season is simpler and more effective than daily undulating approaches.",
      },
      {
        question: "How many A-events should I plan per year?",
        answer:
          "Two to three is the realistic maximum for most amateurs if you want genuine peaks. More than three and the peaks become meaningless — you're always either building toward one or recovering from another.",
      },
      {
        question: "Can I periodise on 4 hours a week?",
        answer:
          "Yes, though the phases are shorter and the volume changes smaller. Even on limited time, having a base block followed by a focused build of 6–8 weeks produces better results than riding the same sessions all year.",
      },
      {
        question: "What is the difference between periodisation and just having a training plan?",
        answer:
          "A plan can be any sequence of sessions. Periodisation is a specific philosophy within a plan — deliberately varying load, intensity, and focus across phases to drive progressive adaptation and peak at a target date. A periodised plan has phases with distinct purposes; a non-periodised plan just lists sessions.",
      },
      {
        question: "Do pros periodise differently from amateurs?",
        answer:
          "The principles are the same. Pros have longer build periods, larger volume swings between phases, and more precise peaks around Grand Tour schedules. Amateurs compress the same phases into a more modest volume. The structure — base, build, peak, recovery — is universal.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    ],
    relatedTopics: [
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
      { label: "How to Periodise Your Season", href: "/blog/how-to-periodise-cycling-season" },
      { label: "Cycling Periodisation Plan Guide", href: "/blog/cycling-periodisation-plan-guide" },
      { label: "How to Structure a Cycling Season", href: "/answers/how-to-structure-a-cycling-season" },
      { label: "What Is a Mesocycle?", href: "/answers/what-is-a-mesocycle" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Periodisation science is well established across endurance sport; framework corroborated by Joe Friel and Dan Lorang across the Roadman podcast.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 2 — HOW TO STRUCTURE A CYCLING SEASON
  // ============================================================
  {
    slug: "how-to-structure-a-cycling-season",
    cluster: "periodisation",
    question: "How Do I Structure My Cycling Season?",
    seoTitle: "How to Structure a Cycling Season — A Practical Framework",
    seoDescription:
      "How to structure a cycling season: pick your A-events, plan base (12–16 weeks), build (8–10 weeks) and peak (2–4 weeks) phases, and schedule recovery. The framework Dan Lorang and Joe Friel use.",
    pillar: "coaching",
    directAnswer:
      "Structure your cycling season by choosing one or two A-events and working backwards: 12–16 weeks of base building aerobic fitness, 8–10 weeks of build adding threshold and VO2max intensity, then 2–4 weeks of peak and taper. Between A-events, use a 2–4 week transition to recover before starting the next base. Most amateurs make more gains restructuring their year than adding extra sessions.",
    keyTakeaways: [
      "Base phase: 12–16 weeks of high volume, low intensity, mostly zone 2.",
      "Build phase: 8–10 weeks adding threshold and VO2max work on top of the base.",
      "Peak and taper: 2–4 weeks sharpening for the A-event, volume drops, quality stays.",
      "Transition: 2–4 weeks of unstructured riding between cycles to reset body and mind.",
    ],
    whoFor: [
      {
        label: "The self-coached amateur planning a year",
        detail:
          "You have a sportive or target event and want to know how to organise the months around it.",
      },
      {
        label: "The rider who peaks too early",
        detail:
          "You feel great in March and flat by July. Season structure is probably the fix.",
      },
    ],
    roadmanView: [
      "When Dan Lorang sat down with Anthony on the podcast and talked through how he builds a season for Roglič, the framework was surprisingly simple: pick the race, count back the weeks, assign a purpose to each block, and protect the recovery. There's no magic in the pro version — the pro version just has fewer distractions pulling you off the plan.",
      "For most amateurs the struggle isn't understanding the framework — it's executing the base phase honestly. Base training feels too easy. You're not suffering. Your Strava kudos are thin. But this is the phase where you build the aerobic engine that everything later sits on. Cut it short or ride it too hard and your build phase lands on a foundation that isn't ready.",
      "Season structure is a decisions problem, not a fitness problem. You're deciding in advance when to be easy and when to be hard, and you're not letting a good weather day or a competitive group ride override those decisions. That discipline is what separates riders who peak on their target day from those who peak in April by accident.",
    ],
    expertEvidence: [
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Season structure starts with the race calendar and works backwards. The phases are not invented — they're defined by the physiological adaptations needed in sequence. Base builds the aerobic capacity that absorbs high-intensity work; build converts that capacity to race-specific fitness; peak expresses it.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "The annual training plan is the most important planning tool a self-coached rider has. You don't need to fill in every session in January — you need the phases, the durations, and the A-events locked in so that daily decisions have a framework to sit inside.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Lock in your A-events first",
        detail:
          "Put your one or two most important events on a calendar. Everything else serves them. B-events are useful training races; C-events are rides you complete without tapering for them.",
      },
      {
        title: "Count back from the A-event",
        detail:
          "Reserve 2–4 weeks for the taper. Before that, 8–10 weeks of build (threshold and VO2max). Before that, 12–16 weeks of base. If you don't have 22–30 weeks, shorten the base first, not the build.",
      },
      {
        title: "Plan deloads into each phase now",
        detail:
          "Within each phase, schedule a 30–40% volume reduction every third or fourth week. If you don't put these in the calendar they don't happen. They're not optional recovery — they're when the adaptation from your previous weeks actually arrives.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Jumping into build intensity in the first week of January.",
        fix:
          "January belongs to base for most Northern Hemisphere riders. Hard intervals on an undeveloped aerobic engine either under-deliver or get you injured.",
      },
      {
        mistake: "Skipping transition between cycles.",
        fix:
          "Two to four weeks of unstructured riding after an A-event resets motivation and lets accumulated fatigue clear before the next base phase. Skip it and the next cycle starts depleted.",
      },
      {
        mistake: "Having five A-events and trying to peak for all of them.",
        fix:
          "Pick two, three at most. True peaks require tapering — you can't taper five times a year and still build fitness between events.",
      },
    ],
    faq: [
      {
        question: "How long should each training phase be?",
        answer:
          "Base: 12–16 weeks. Build: 8–10 weeks. Peak/taper: 2–4 weeks. Transition between cycles: 2–4 weeks. Shorten the base if the calendar is tight, but don't compress the taper — that's where you express what you built.",
      },
      {
        question: "When should I start base training for a June event?",
        answer:
          "For a June event, base should start around November or December. That gives 12–16 weeks of base through winter, a build phase through spring, and a taper into the event. Most amateurs start too late and try to compress everything into 12 weeks.",
      },
      {
        question: "What do I do between seasons?",
        answer:
          "A genuine transition phase: 2–4 weeks of low-volume, unstructured riding or cross-training. No intervals, no targets, no watching power numbers. It resets your motivation and lets your body recover from the accumulation of the previous season.",
      },
      {
        question: "Can I do multiple A-events in one year?",
        answer:
          "Yes, two or three realistically. Between peaks you need a mini-recovery block of 2–4 weeks, then you can restart a shortened build rather than a full base. Think of secondary peaks as extensions of the first season rather than starting fresh.",
      },
      {
        question: "What if my work or life disrupts my plan mid-season?",
        answer:
          "Don't restart from scratch — adjust within the current phase. A lost week in the build phase is not a catastrophe. Extend the build by a week and shift the taper. The framework should absorb disruption, not collapse under it.",
      },
      {
        question: "Should I use a training app or software to structure the season?",
        answer:
          "TrainingPeaks is the standard tool for annual planning among coached amateurs, and it's useful for seeing your load trends. But the framework decisions — which phases, how long — are made by you, not the software. Don't confuse filling an app with having a plan.",
      },
    ],
    relatedEpisodes: [
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2062-dylan-johnson-reveals-his-weird-2025-training-plan",
    ],
    relatedTopics: [
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
      { label: "How to Periodise Your Season", href: "/blog/how-to-periodise-cycling-season" },
      { label: "Cycling Periodisation: Friel, Lorang, Johnson", href: "/blog/cycling-periodisation-friel-lorang-johnson" },
      { label: "What Is Periodisation?", href: "/answers/what-is-periodisation-cycling" },
      { label: "How Long Should Base Phase Be?", href: "/answers/how-long-should-the-base-phase-be" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Season structure framework corroborated by Dan Lorang and Joe Friel; consistent with the model described across the Roadman periodisation coverage.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 3 — WHAT IS REVERSE PERIODISATION
  // ============================================================
  {
    slug: "what-is-reverse-periodisation",
    cluster: "periodisation",
    question: "What Is Reverse Periodisation?",
    seoTitle: "What Is Reverse Periodisation for Cycling?",
    seoDescription:
      "Reverse periodisation flips the traditional model: high-intensity work in winter, aerobic volume in spring. When it works for time-crunched cyclists, and the risks most people miss.",
    pillar: "coaching",
    directAnswer:
      "Reverse periodisation flips the traditional base-first model: instead of building aerobic volume in winter before adding intensity in spring, you train high intensity in winter and add longer aerobic volume as the season progresses. It suits time-crunched riders who have more indoor training time in winter and fewer outdoor hours. But it carries a real risk — high intensity without a solid aerobic base produces fragile fitness that can break down under event-length demands.",
    keyTakeaways: [
      "Traditional: base (volume) in winter, intensity in spring. Reverse: intensity in winter, volume in spring.",
      "Best suited to time-crunched riders with limited winter hours and longer outdoor availability in summer.",
      "High risk without an existing aerobic base — intensity on a thin base produces shallow, brittle fitness.",
      "Most coaches recommend traditional periodisation for first-time structured athletes.",
    ],
    whoFor: [
      {
        label: "The time-crunched commuter with a winter trainer",
        detail:
          "You can do hard hour-long turbo sessions in winter but can't rack up long weekend rides. Reverse periodisation is at least worth understanding.",
      },
      {
        label: "The experienced rider looking for a winter change",
        detail:
          "You've done traditional periodisation for years and want to understand the alternative before trying it.",
      },
    ],
    roadmanView: [
      "Reverse periodisation gets passed around as a shortcut for time-crunched riders, and in a narrow set of circumstances it has a case. If you genuinely cannot do three-hour zone 2 rides in winter but you can nail a hard hour on a smart trainer, shifting intensity earlier does at least produce some adaptation. The problem is that most riders who try it don't have the aerobic base to make the intensity land properly.",
      "High-intensity work without a solid aerobic engine produces fast early gains that plateau quickly and tends to leave riders with a fitness that feels sharp in February and brittle by May. The aerobic base is what gives intensity work somewhere to go. Without it, you're polishing a surface that has nothing underneath it.",
      "Anthony's view: if you have a strong multi-year aerobic base already built, a reverse-periodised winter can work as a change of stimulus. If you're in your first two years of structured training, do it the traditional way first. Build the foundation before you experiment with the roof.",
    ],
    expertEvidence: [
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "The sequencing of training stress matters as much as the total load. Starting a season with high-intensity work before aerobic capacity is in place forces the body to handle stress it isn't yet equipped to adapt from, producing early gains but limiting the ceiling.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, University of Agder",
        insight:
          "Aerobic base training builds the mitochondrial infrastructure that high-intensity work relies on to produce lasting adaptation. Reverse the sequence and you can still get intensity-driven gains, but they are less durable and sit on a thinner foundation.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Only try it with an existing aerobic base",
        detail:
          "If you've done two or more years of structured traditional periodisation, you have an aerobic base that the winter intensity can sit on. First-year structured athletes should build the base first.",
      },
      {
        title: "Keep some easy volume even in the reverse model",
        detail:
          "Reverse periodisation doesn't mean all-intensity all-winter. Keep at least 50–60% of sessions easy to maintain aerobic capacity. The reversal is about starting intensity earlier, not eliminating base riding entirely.",
      },
      {
        title: "Add volume progressively as the season opens up",
        detail:
          "As spring arrives and outdoor riding becomes available, shift the balance back toward volume. Use the early-season fitness as the base for longer aerobic blocks before your target event.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Treating reverse periodisation as an intensity shortcut.",
        fix:
          "It's a sequencing choice, not a way to skip aerobic development. If you haven't done traditional periodisation, do that first.",
      },
      {
        mistake: "Doing high-intensity all winter with no easy riding.",
        fix:
          "Keep the 80/20 ratio even in a reverse model. Intensity-only winter leads to burnout by March.",
      },
      {
        mistake: "Assuming early-season fitness will hold through a long summer event.",
        fix:
          "Intensity-led winter fitness can plateau for longer events. Add meaningful aerobic volume in the months before a gran fondo or multi-day event.",
      },
    ],
    faq: [
      {
        question: "Is reverse periodisation better than traditional periodisation?",
        answer:
          "For most amateurs, no — traditional is more reliable and less risky. Reverse periodisation suits a specific rider: time-crunched in winter, with an established aerobic base, targeting events that benefit from early-season sharpness.",
      },
      {
        question: "What kind of intensity should I do in a reverse periodisation winter?",
        answer:
          "Sweet spot and threshold work (84–105% FTP) is the typical choice — hard enough to drive adaptation, sustainable enough to run over multiple weeks. True VO2max intervals all winter is too aggressive without complementary base volume.",
      },
      {
        question: "Do any professionals use reverse periodisation?",
        answer:
          "Some early-season specialists and track cyclists have used reverse-style preparation for specific goals. For most road Grand Tour professionals, traditional periodisation remains the standard model — base first, intensity second.",
      },
      {
        question: "How do I know if reverse periodisation is right for me?",
        answer:
          "Ask three questions: Do I have a solid aerobic base already? Can I genuinely not ride long in winter? Does my target event reward early-season sharpness over long-distance durability? All three yes means it's worth considering.",
      },
      {
        question: "Will reverse periodisation help my FTP?",
        answer:
          "It can produce early FTP gains because of the early intensity exposure. Those gains may plateau before summer events if aerobic volume isn't added back in. FTP built on a thin base tends to be less durable than one built on a deep aerobic foundation.",
      },
    ],
    relatedEpisodes: [
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2062-dylan-johnson-reveals-his-weird-2025-training-plan",
    ],
    relatedTopics: [
      { label: "Reverse Periodisation for Cycling", href: "/blog/reverse-periodisation-cycling" },
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
      { label: "What Is Base Training?", href: "/answers/what-is-base-training" },
      { label: "Base vs Build Training", href: "/compare/base-vs-build-training" },
      { label: "What Is Periodisation?", href: "/answers/what-is-periodisation-cycling" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Reverse periodisation is a recognised but contested model; effectiveness depends heavily on existing aerobic base and event demands.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 4 — WHAT IS BASE TRAINING
  // ============================================================
  {
    slug: "what-is-base-training",
    cluster: "periodisation",
    question: "What Is Base Training and Why Does It Matter?",
    seoTitle: "What Is Base Training in Cycling and Why Does It Matter?",
    seoDescription:
      "Base training is the foundation phase of a periodised year: high-volume, low-intensity riding that builds mitochondrial density and fat oxidation. Why you can't skip it and what it actually does.",
    pillar: "coaching",
    directAnswer:
      "Base training is the foundation phase of a cycling year — typically 12–16 weeks of high-volume, genuinely low-intensity riding in zone 2. It builds mitochondrial density, improves fat oxidation, and develops the cardiovascular capacity that all subsequent high-intensity work sits on. Skip or rush the base and your build phase lands on ground that can't absorb it. It's the least glamorous part of the year and the one most amateurs undervalue.",
    keyTakeaways: [
      "Base training = 12–16 weeks of predominantly zone 2 riding, high volume, low intensity.",
      "The physiological goal is mitochondrial density and fat oxidation — the engine, not the ceiling.",
      "Without a proper base, high-intensity work produces shallow gains that plateau quickly.",
      "Base riding must be genuinely easy — most amateurs ride it 30–50% too hard and lose the benefit.",
    ],
    whoFor: [
      {
        label: "The rider who skips winter training",
        detail:
          "You take three months off and come back in spring, then wonder why your first intervals feel terrible.",
      },
      {
        label: "The rider who jumps straight into intervals",
        detail:
          "You start the season in January with hard sessions and plateau by April. Base is the missing piece.",
      },
    ],
    roadmanView: [
      "The base phase has a PR problem. It feels like nothing is happening. You're riding slow, your Strava looks boring, and your mates on Zwift are doing VO2max sessions. But the base is where the real infrastructure gets built. When Anthony sat down with Stephen Seiler, the message was direct: the mitochondrial adaptations that make zone 2 so valuable take weeks to accumulate. You can't rush them with intensity.",
      "What most amateurs do wrong in base is simple: they ride it too hard. They treat zone 2 as 'easy for a cyclist', which ends up being zone 3, which produces a moderate stimulus with significant fatigue cost. That's the grey zone in disguise. True base riding should feel almost embarrassingly easy — conversation pace, nose breathing, a speed that makes you wonder if you're wasting time. You're not.",
      "Do the base properly and your build phase feels categorically different. The intervals hit harder, recovery happens faster, and the peak comes out higher. The whole season is built on this foundation. Rushing it to get to the 'good stuff' is one of the most reliable ways to have an ordinary year.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, University of Agder",
        insight:
          "Zone 2 base work builds the mitochondrial density and fat oxidation capacity that sustains high-intensity efforts later in the season. These adaptations are specific to genuinely low-intensity work and cannot be replicated by shortcutting to harder training.",
        episodeSlug: "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
        guestSlug: "stephen-seiler",
      },
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "The base period isn't just about aerobic fitness — it's about preparing the entire system, including muscles, tendons, and connective tissue, for the stress of a build phase. Rushing the base increases injury risk in the build as much as it limits performance.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Set your zone 2 ceiling honestly",
        detail:
          "Zone 2 is roughly 56–75% of FTP, or under your first ventilatory threshold. Use the lower half of that band. If your 'easy' rides sit in zone 3, pull them down until the pace feels almost too slow.",
      },
      {
        title: "Make rides long enough to matter",
        detail:
          "Base adaptations are duration-driven. Aim for at least one ride per week of 90 minutes or longer. A 45-minute zone 2 ride is better than nothing, but the aerobic stimulus becomes meaningful above 60–90 minutes.",
      },
      {
        title: "Stay in base for 12–16 weeks before introducing build intensity",
        detail:
          "Resist the urge to add threshold sessions at week six. The full base period exists for a reason. One targeted hard session per week within the base phase is fine — but don't let it become two or three.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Riding base too hard because slow feels unproductive.",
        fix:
          "True base work is genuinely easy. Trust the process — the effort is cellular, not cardiovascular.",
      },
      {
        mistake: "Cutting the base phase to eight weeks to get to intervals sooner.",
        fix:
          "The base isn't preparation for training — it's training. Give it the full 12–16 weeks.",
      },
      {
        mistake: "Treating one or two long rides a week as sufficient base volume.",
        fix:
          "Base volume should fill the majority of your weekly hours across all sessions, not just weekend rides.",
      },
    ],
    faq: [
      {
        question: "What heart rate should base training be?",
        answer:
          "Roughly 60–70% of maximum heart rate, or below your first ventilatory threshold — the point where you shift from nose to mouth breathing. The exact number is individual, but a reliable field test is whether you can hold a conversation comfortably throughout.",
      },
      {
        question: "Can I do base training indoors?",
        answer:
          "Yes. A smart trainer makes it easy to hold zone 2 precisely. The main challenge indoors is duration — long easy rides are mentally harder on a trainer. Many riders use the indoor sessions for controlled zone 2 work and count on outdoor riding for longer base blocks.",
      },
      {
        question: "Will base training make me lose fitness?",
        answer:
          "In the short term, your peak power numbers may drop slightly as high-intensity sessions reduce. But the aerobic infrastructure being built more than compensates when you reintroduce intensity in the build phase. Base fitness often only becomes visible once the build is underway.",
      },
      {
        question: "Is base training just zone 2?",
        answer:
          "Predominantly, yes. Most of the base phase is zone 2, with one modest intensity session per week towards the end of the phase — tempo work, not full threshold. The ratio is roughly 80–90% easy, 10–20% low-level intensity.",
      },
      {
        question: "How do I know if I've built enough base?",
        answer:
          "Practical indicators: your zone 2 pace at the same heart rate is meaningfully faster than when you started; your heart rate at a fixed easy power output is lower; your recovery between efforts feels faster. These adaptations typically appear after 8–12 weeks of honest base work.",
      },
    ],
    relatedEpisodes: [
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2-i-asked-world-tour-coaches-about-zone-2-heres-what-they-said",
    ],
    relatedTopics: [
      { label: "Cycling Base Training Guide", href: "/blog/cycling-base-training-guide" },
      { label: "Zone 2 Training — Complete Guide", href: "/blog/zone-2-training-complete-guide" },
      { label: "How Long Should Base Phase Be?", href: "/answers/how-long-should-the-base-phase-be" },
      { label: "Base vs Build Training", href: "/compare/base-vs-build-training" },
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Zone 2 base training science is well established (Seiler); application to cycling periodisation corroborated by Friel and the Roadman base-training coverage.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 5 — HOW LONG SHOULD THE BASE PHASE BE
  // ============================================================
  {
    slug: "how-long-should-the-base-phase-be",
    cluster: "periodisation",
    question: "How Long Should the Base Phase Be?",
    seoTitle: "How Long Should the Base Phase Be for Cyclists?",
    seoDescription:
      "The base phase should be 12–16 weeks for most cyclists. Why shorter doesn't work, how to adjust if time is short, and what Joe Friel says about rushing to build.",
    pillar: "coaching",
    directAnswer:
      "For most serious amateurs, the base phase should be 12–16 weeks — roughly three to four months of predominantly zone 2 riding. Below 8 weeks the aerobic adaptations are incomplete and the build phase lands on unstable ground. Sixteen weeks is the sweet spot for riders who have a full winter to train. If the calendar doesn't allow it, shorten the base before shortening the build — but never compress it below 8 weeks.",
    keyTakeaways: [
      "Minimum effective base: 8 weeks. Optimal for most amateurs: 12–16 weeks.",
      "The base is where mitochondrial and fat-oxidation adaptations accumulate — they take time.",
      "A short base phase followed by a full build is a reliable route to early-season fitness that breaks down.",
      "Masters riders often benefit from a longer base than younger athletes — recovery from intensity needs more runway.",
    ],
    whoFor: [
      {
        label: "The rider planning their annual structure",
        detail:
          "You're deciding how to divide the year and want to know how much time to protect for base.",
      },
      {
        label: "The rider who always cuts base short",
        detail:
          "You get bored of easy riding after six weeks and start intervals. Every year ends the same way.",
      },
    ],
    roadmanView: [
      "Riders consistently underestimate how long the base needs to be because the payoff isn't visible during the phase itself. You don't feel faster. Your test numbers don't move much. You just feel... fine, and a bit bored. The gains from base training are running in the background, and they only become visible once intensity starts in the build phase.",
      "Joe Friel's guidance is clear on this: don't rush to build. The base phase is not a waiting room before the real training starts — it is the real training. The mitochondrial density and fat oxidation you build in those 12–16 weeks are what allow threshold work to produce meaningful adaptation later. Cut the base to eight weeks and you'll get early build gains; cut it to four and you'll plateau by April wondering what happened.",
      "If the calendar genuinely doesn't allow 16 weeks, protect 12. If it doesn't allow 12, protect 10. But never compress the base below 8 weeks and jump straight into full build intensity. You'd be better served staying in base a little longer and shortening the peak taper.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "The base period is non-negotiable in length because the adaptations it builds — aerobic capacity, fat oxidation, structural resilience — accumulate on a time scale of weeks to months. Athletes who compress base phases typically see early build gains followed by stagnation or breakdown.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, University of Agder",
        insight:
          "Across elite endurance athletes studied longitudinally, the volume of genuine easy aerobic work done in the preparation phase is one of the strongest predictors of high-intensity adaptation later in the season. More base time doesn't just help — it amplifies what follows.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Block 12–16 weeks in your calendar first",
        detail:
          "Before planning any build or peak phase, reserve 12–16 weeks from late autumn or early winter for base. This is your non-negotiable time investment in the season.",
      },
      {
        title: "Progress within the base phase",
        detail:
          "Base isn't just riding the same volume for 16 weeks. Add 10% volume every three weeks, take a deload week at week four, then build again. Progressing within base keeps the stimulus moving without introducing premature intensity.",
      },
      {
        title: "Use the final 2–3 weeks of base for low-level intensity",
        detail:
          "In the last 2–3 weeks of base, introduce one session per week of tempo riding (76–83% FTP) to begin bridging toward the build. This is not full build intensity — it's a controlled transition.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Starting the build phase after only 6–8 weeks of base because progress feels slow.",
        fix:
          "The gains are happening below what you can measure day-to-day. Commit to the full 12 weeks before assessing.",
      },
      {
        mistake: "Adding multiple hard sessions 'just to maintain intensity' during base.",
        fix:
          "One modest intensity session per week in the final base weeks is fine. More than that means you're not in base — you're in an undescribed limbo phase.",
      },
      {
        mistake: "Using the same 12-week base length regardless of event distance.",
        fix:
          "Longer events — gran fondos, ultras — benefit from longer base phases. A rider preparing for a 200km event needs 16 weeks; a rider targeting a 40km time trial can manage with 12.",
      },
    ],
    faq: [
      {
        question: "Can I do base training in 8 weeks?",
        answer:
          "Eight weeks produces some base adaptation, but it's the minimum. You'll see more limited gains and the build phase may feel harder than it should. If you genuinely have only 8 weeks, lower your build expectations and prioritise honest zone 2 throughout — don't try to compensate with intensity.",
      },
      {
        question: "What should the base phase look like on a weekly basis?",
        answer:
          "Most weeks: two to four zone 2 rides, one longer zone 2 ride on the weekend, one optional easy strength session. No threshold or VO2max work until the final 2–3 weeks of the phase. Volume builds gradually across the 12–16 weeks.",
      },
      {
        question: "Do masters cyclists need a longer base?",
        answer:
          "Generally yes. Recovery from intensity takes longer after 40, so the aerobic base needs to be more developed before the body can absorb hard build work. Sixteen weeks of base is a better default for masters riders than 12.",
      },
      {
        question: "Should I ride indoors or outdoors during base?",
        answer:
          "Both work. Outdoors is easier for long zone 2 rides. Indoors is more efficient for controlled sessions and better for zone adherence in bad weather. Many riders use indoor riding for shorter weekday zone 2 and get outside for the longer weekend base ride.",
      },
      {
        question: "What happens if I miss weeks during the base phase?",
        answer:
          "One or two missed weeks can usually be absorbed by extending the base phase slightly rather than skipping forward. If you miss four or more consecutive weeks, consider restarting the base phase from a lower volume rather than jumping to where you left off.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-5-secret-to-winter-training-dose-frequency-duration",
    ],
    relatedTopics: [
      { label: "Cycling Base Training Guide", href: "/blog/cycling-base-training-guide" },
      { label: "What Is Base Training?", href: "/answers/what-is-base-training" },
      { label: "Base vs Build Training", href: "/compare/base-vs-build-training" },
      { label: "How to Periodise Your Season", href: "/blog/how-to-periodise-cycling-season" },
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Base phase duration guidance reflects coaching consensus (Friel, Seiler) and standard periodisation practice; specific weeks are guidelines, not hard physiological thresholds.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 6 — WHAT IS A MESOCYCLE
  // ============================================================
  {
    slug: "what-is-a-mesocycle",
    cluster: "periodisation",
    question: "What Is a Mesocycle?",
    seoTitle: "What Is a Mesocycle in Cycling Training?",
    seoDescription:
      "A mesocycle is a training block of 3–6 weeks with a specific focus — base, threshold, or VO2max. How mesocycles fit inside phases, and how to build and deload within one.",
    pillar: "coaching",
    directAnswer:
      "A mesocycle is a training block of 3–6 weeks with a single specific focus — building aerobic base, developing threshold, or lifting VO2max. Several mesocycles make up a phase (base or build), and a sequence of phases makes a full season. Within a mesocycle, training load builds progressively across 3–4 weeks, then drops in a deload week to allow adaptation before the next block begins.",
    keyTakeaways: [
      "A mesocycle is 3–6 weeks of focused training with a single primary goal.",
      "The most common structure: 3 weeks building load, 1 week deloading — the 3:1 block.",
      "Multiple mesocycles make up a phase; phases make up the full season.",
      "The deload week isn't lost time — it's when the adaptation from the previous three weeks actually consolidates.",
    ],
    whoFor: [
      {
        label: "The self-coached rider who plans session by session",
        detail:
          "You think in individual workouts rather than blocks, and your structure lacks coherence.",
      },
      {
        label: "The rider who never deloads",
        detail:
          "You train hard week after week and plateau. Mesocycle structure forces the recovery that drives gains.",
      },
    ],
    roadmanView: [
      "Most riders think about training in individual sessions: Monday's interval, Saturday's long ride. Mesocycles shift the frame to blocks — what are you building over the next four weeks, and why? That shift in thinking is one of the most practical things any self-coached rider can do. It makes the deload week obvious and justified, not something you take when you're already exhausted.",
      "The classic structure is three weeks of building load followed by one week of reduced volume. The three hard weeks are where the stimulus happens; the fourth easy week is where the body actually adapts. Skip the deload and you accumulate fatigue faster than your body can convert it to fitness. The pattern Anthony has heard from coaches at every level — from Joe Friel to Dan Lorang — is the same: train hard for three, recover for one.",
      "The mesocycle focus matters too. Base mesocycles are predominantly zone 2. Threshold mesocycles add 2×20 work. VO2max mesocycles add short hard intervals. Don't mix everything into every block hoping for maximum return — specificity within the mesocycle is what makes the adaptation land.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "Structured training blocks with defined purposes and built-in recovery weeks produce more consistent adaptation than unstructured progressive loading. The 3:1 build-to-deload ratio is a practical framework that works for athletes across a wide range of volumes and abilities.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Every professional periodisation model uses structured blocks with specific goals and programmed recovery. For amateur riders, the mesocycle is the unit that makes periodisation practical — specific enough to drive adaptation, short enough to respond to life and schedule.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Plan the next 4-week block with a single focus",
        detail:
          "Pick one quality: aerobic base, threshold, or VO2max. Build three weeks of progressively harder sessions around that quality, then take one deload week at 50–60% volume before starting the next block.",
      },
      {
        title: "Label each session within the mesocycle",
        detail:
          "For a threshold mesocycle: one threshold session per week (2×20 at 95–105% FTP), one VO2max session optional, rest zone 2. Everything has a role. Avoid randomly mixing session types within the block.",
      },
      {
        title: "Track load trends, not single session results",
        detail:
          "Use a CTL/ATL chart in TrainingPeaks or intervals.icu to see how load accumulates across the mesocycle. The deload week should show a clear drop in ATL. If it doesn't, you're not recovering enough.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Making every week a build week and never deloading.",
        fix:
          "After three hard weeks, take one easy one. Planned deloads beat involuntary rest forced by illness or burnout.",
      },
      {
        mistake: "Changing the mesocycle focus every two weeks.",
        fix:
          "The body needs 3–4 weeks to respond to a specific stimulus. Block-hopping produces scattered adaptation.",
      },
      {
        mistake: "Treating the deload week as wasted training time.",
        fix:
          "The deload is where adaptation happens. Think of it as the most productive week of the block, just not visibly so.",
      },
    ],
    faq: [
      {
        question: "How long is a mesocycle?",
        answer:
          "Typically 3–6 weeks, with 4 weeks being the most common practical structure: three weeks of building load followed by one week of recovery. Some coaches use 3-week blocks with a 10-day recovery, particularly for masters athletes who need more recovery time.",
      },
      {
        question: "How many mesocycles are in a season?",
        answer:
          "A full season might have 6–9 mesocycles: three or four in base, two or three in build, then the peak and taper. The exact number depends on how long you have before your A-event and how many phases your season includes.",
      },
      {
        question: "What is a microcycle?",
        answer:
          "A microcycle is the smallest training unit — typically a single week. It sits inside a mesocycle the way a mesocycle sits inside a phase. Planning at microcycle level means deciding which sessions go on which days each week.",
      },
      {
        question: "Should every mesocycle have the same structure?",
        answer:
          "Same structure, different content. The 3:1 build-to-deload ratio stays the same throughout the season, but what you're building changes — from aerobic volume in base mesocycles to threshold and VO2max work in build mesocycles.",
      },
      {
        question: "Can I skip the deload week if I feel fine?",
        answer:
          "Feeling fine after three hard weeks doesn't mean your body has fully adapted. Fatigue accumulates ahead of what you feel. The planned deload gives adaptation time before it becomes necessary. Skipping it consistently leads to the plateau you were trying to avoid.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    ],
    relatedTopics: [
      { label: "Mesocycle Training Explained", href: "/blog/mesocycle-training-explained-cyclists" },
      { label: "Cycling Periodisation Plan Guide", href: "/blog/cycling-periodisation-plan-guide" },
      { label: "What Is Periodisation?", href: "/answers/what-is-periodisation-cycling" },
      { label: "What Happens in the Build Phase?", href: "/answers/what-happens-in-the-build-phase" },
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Mesocycle structure and 3:1 periodisation are well established across coaching literature; corroborated by Friel, Lorang, and standard periodisation practice.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 7 — WHAT HAPPENS IN THE BUILD PHASE
  // ============================================================
  {
    slug: "what-happens-in-the-build-phase",
    cluster: "periodisation",
    question: "What Happens in the Build Phase?",
    seoTitle: "What Happens in the Build Phase of Cycling Training?",
    seoDescription:
      "The build phase is where threshold and VO2max work is added on top of the aerobic base. What sessions to run, how to structure the weeks, and what Dan Lorang says about amateur build errors.",
    pillar: "coaching",
    directAnswer:
      "The build phase is 8–10 weeks where you introduce and develop threshold and VO2max training on top of the aerobic base you've already built. Two quality sessions per week — one threshold (2×20 min at 95–105% FTP) and one VO2max (5×4 min at 110–120% FTP) — are the core. Easy zone 2 riding fills the rest of the week. By the end of the build phase, fitness should be near its ceiling for the season.",
    keyTakeaways: [
      "Build phase: 8–10 weeks, two quality sessions per week on an aerobic base.",
      "Threshold work (2×20 at 95–105% FTP) and VO2max intervals (5×4 min at 110–120%) are the engine of build.",
      "Zone 2 riding doesn't disappear — it remains the majority of training volume.",
      "Don't start build without a proper base — intensity on an incomplete foundation produces shallow gains.",
    ],
    whoFor: [
      {
        label: "The rider entering their build phase",
        detail:
          "You've done 12+ weeks of base and want to know what to do now and in what order.",
      },
      {
        label: "The rider who trains hard all year but lacks periodised intensity",
        detail:
          "You do intervals but not in a structured progressive sequence. Build phase thinking will fix this.",
      },
    ],
    roadmanView: [
      "The build phase is where training starts to look like training. Hard intervals, threshold work, real fatigue. But the thing that separates riders who peak properly from those who peak too early is how much base they brought into the build. If you've done 12–16 weeks of honest zone 2, the threshold sessions land on an aerobic engine that can absorb them. If you rushed the base, the first hard week of build feels fine but by week six you're accumulating fatigue faster than you're adapting.",
      "The sessions themselves aren't complicated. Two hard sessions per week: one threshold day and one VO2max day. The threshold session builds the ceiling that racing happens at; the VO2max session pushes the roof above it. Everything else stays easy. The failure mode Anthony has seen in countless coached riders is adding a third or fourth hard session because 'two doesn't feel like enough'. Two done properly is a heavy load — three done moderately is a guaranteed plateau.",
      "Progressive overload within the build matters too. Don't run the same 2×20 session at the same power for eight consecutive weeks. Add interval length, reduce recovery, or slightly increase target power every three weeks before a deload. The body adapts to a repeated identical stimulus and stops responding.",
    ],
    expertEvidence: [
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Amateur riders typically err in the build by either introducing intensity too abruptly (no base underneath it) or adding too many hard sessions simultaneously. The World Tour model is disciplined about limiting genuinely hard sessions to two or three per week, with everything else supporting recovery and aerobic maintenance.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, University of Agder",
        insight:
          "The most productive build phase layers intensity onto an aerobic base progressively — threshold first, then VO2max on top. The easy riding between hard sessions isn't filler; it's the recovery that allows the next hard session to produce a quality stimulus.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Run one threshold session per week",
        detail:
          "2×20 minutes at 95–105% FTP with 5 minutes easy recovery between. This is the most reliable build-phase FTP driver for amateurs. Hold power steady; don't start hard and fade. Add a third 20-minute rep or extend to 3×15 every three weeks to progress.",
      },
      {
        title: "Add one VO2max session per week",
        detail:
          "5×4 minutes at 110–120% FTP, 4 minutes easy recovery. This lifts the ceiling your threshold work then pursues. One per week is enough — these cost more recovery than they look.",
      },
      {
        title: "Keep all other rides in zone 2",
        detail:
          "Everything outside the two hard sessions stays genuinely easy. This is the same principle as the base phase, but it's harder to enforce because the fitness you've built makes zone 3 feel tempting. Protect the easy days.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Starting build intensity without completing a proper base phase.",
        fix:
          "If you haven't done 10–12 weeks of mostly zone 2, delay build. The intensity won't stick properly on an incomplete aerobic foundation.",
      },
      {
        mistake: "Adding three or four hard sessions per week in the build.",
        fix:
          "Two quality sessions done properly with adequate recovery produce more adaptation than four moderate ones. More hard sessions without more recovery just accumulates fatigue.",
      },
      {
        mistake: "Doing the same intervals at the same intensity for the whole build.",
        fix:
          "Progressively overload — extend duration, reduce recovery time, or raise intensity slightly — every three weeks to keep the adaptation signal moving.",
      },
    ],
    faq: [
      {
        question: "When should I start the build phase?",
        answer:
          "After a minimum of 10–12 weeks of base work, ideally 12–16. The transition point is when your zone 2 fitness feels solid — your easy rides feel genuinely easy and your heart rate at a given power has dropped. That's the base doing its job; now you can layer intensity on top.",
      },
      {
        question: "Should I continue zone 2 during the build phase?",
        answer:
          "Yes, absolutely. Zone 2 remains the majority of training volume in the build. The build adds intensity; it doesn't replace easy riding. Most of your weekly hours should still be zone 2, with only the two quality sessions going hard.",
      },
      {
        question: "How long should the build phase last?",
        answer:
          "Eight to ten weeks for most amateurs. Shorter than that and there's not enough time for the intensity to produce meaningful adaptation; longer and accumulated fatigue starts overwhelming recovery. After 8–10 weeks, move to the peak and taper.",
      },
      {
        question: "Is sweet spot or threshold better in the build phase?",
        answer:
          "Threshold (95–105% FTP) is the more direct FTP-builder and the better choice for dedicated build sessions. Sweet spot (84–94%) can be used to add volume in other sessions if you want more stimulus than two pure hard sessions allow, but threshold should anchor the build quality.",
      },
      {
        question: "What if my FTP doesn't improve during the build?",
        answer:
          "Check the usual suspects: are you testing rested at the end of the block, not mid-block on fatigue? Is your fuelling adequate for the hard sessions? Are your easy days genuinely easy? If all those are right and FTP still stalls, shorten the intervals and add a third weekly quality session cautiously.",
      },
    ],
    relatedEpisodes: [
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    ],
    relatedTopics: [
      { label: "Cycling Periodisation Plan Guide", href: "/blog/cycling-periodisation-plan-guide" },
      { label: "How to Periodise Your Season", href: "/blog/how-to-periodise-cycling-season" },
      { label: "Base vs Build Training", href: "/compare/base-vs-build-training" },
      { label: "What Is Base Training?", href: "/answers/what-is-base-training" },
      { label: "How to Improve Your FTP", href: "/answers/how-to-improve-ftp" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Build phase session prescription (threshold + VO2max) is well established; corroborated by Dan Lorang and Seiler across the Roadman podcast.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 8 — HOW TO STRUCTURE A TRAINING WEEK
  // ============================================================
  {
    slug: "how-to-structure-a-training-week",
    cluster: "periodisation",
    question: "How Do I Structure a Training Week?",
    seoTitle: "How to Structure a Cycling Training Week — The Practical Template",
    seoDescription:
      "How to structure a training week: hard days, easy days, and rest in the right order. The session placement Joe Friel recommends and the day-stacking error most amateurs make.",
    pillar: "coaching",
    directAnswer:
      "A well-structured training week has two hard sessions placed 2–3 days apart, with easy zone 2 riding filling the remaining days and at least one full rest day. Hard sessions (threshold or VO2max) should not sit back-to-back; easy sessions should be genuinely easy. The most common amateur mistake is stacking hard sessions on consecutive days, which blunts quality and drags recovery through the whole week.",
    keyTakeaways: [
      "Two hard sessions per week, placed 2–3 days apart, with easy days between.",
      "At least one full rest day per week — not an easy ride, an actual rest.",
      "Hard days should be hard; easy days should be easy. Grey-zone days waste both purposes.",
      "The weekly pattern stays roughly the same across phases; what changes is what the hard sessions contain.",
    ],
    whoFor: [
      {
        label: "The rider who trains by feel, day to day",
        detail:
          "You ride when you feel like it without a structure. Understanding week architecture will make your training more productive immediately.",
      },
      {
        label: "The rider whose hard sessions feel weak",
        detail:
          "Your intervals never feel as strong as they should. The issue is often day placement, not fitness.",
      },
    ],
    roadmanView: [
      "When Joe Friel talked about structuring the ideal training week on the podcast, the framework was deceptively simple: place your hard sessions first, arrange easy work around them, never hard-on-hard, always a real rest day. The insight that lands for most riders is that the hard sessions are the point of the week — everything else serves them. You're building a week around protecting two quality sessions, not squeezing maximum suffering into every day.",
      "The detail that trips amateurs up is Tuesday-Wednesday stacking. You finish work on Tuesday, feel good, do a threshold session. Wednesday you feel okay, do another. Thursday you feel average and the session is mediocre. Friday you're tired. Saturday's long ride is grey. The whole week has been compromised because two hard days sat back-to-back. Spread them by 48 hours minimum — Tuesday and Thursday, or Monday and Thursday — and the quality jumps.",
      "The other common failure is treating easy days as slightly less-hard days. An easy day is a gift to Thursday's session. The easy day exists so that when Thursday comes, you have something to give. If Monday, Tuesday, and Wednesday are all zone 3, Thursday has nothing left in the tank to hit threshold. The week architecture matters as much as what's in the sessions.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "The weekly training structure should be designed to maximise the quality of hard sessions. That means arranging easy days before and after intensity, placing the long ride at the weekend when recovery time is greater, and treating the rest day as non-negotiable rather than optional.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Week structure at the professional level is also fundamentally about quality protection. Hard sessions are scheduled on days where full recovery precedes them, and surrounding sessions are designed to maintain fitness without compromising what comes next.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Place your two hard sessions on non-consecutive days",
        detail:
          "Tuesday/Thursday or Monday/Thursday are common patterns. This gives 48 hours of recovery between hard efforts, enough for quality in both sessions. If life forces them closer, push one to a light day and accept reduced quality.",
      },
      {
        title: "Put your long easy ride on the weekend",
        detail:
          "Saturday or Sunday, zone 2, 90 minutes to 3+ hours depending on the phase. Weekend timing gives more recovery time around a longer effort. Pair it with a shorter easy ride the next day rather than rest.",
      },
      {
        title: "Make every non-hard day genuinely easy",
        detail:
          "Check your zone distribution for the easy days. If they're sitting in zone 3, dial them back. Protect the hard days by protecting the easy ones.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Stacking hard sessions on Tuesday and Wednesday back-to-back.",
        fix:
          "Separate hard sessions by at least 48 hours. Tuesday and Thursday is the reliable pattern for most amateurs.",
      },
      {
        mistake: "Doing an easy ride on the rest day instead of actual rest.",
        fix:
          "Rest means no training — not 45 minutes at low power. True rest days accelerate recovery more than easy spins.",
      },
      {
        mistake: "Making the long ride hard rather than easy.",
        fix:
          "The long ride is a base ride — zone 2, conversation pace. Don't combine long and hard. They serve different purposes and produce very different fatigue costs.",
      },
    ],
    faq: [
      {
        question: "What is the best days of the week to do hard cycling sessions?",
        answer:
          "Tuesday and Thursday work for most people with a normal working week — they leave the weekend for longer easy or race riding and place recovery on Wednesday between the two hard sessions. Monday/Thursday also works if Tuesday is too close to a hard weekend.",
      },
      {
        question: "How many days a week should I cycle?",
        answer:
          "Most serious amateurs ride 4–6 days a week. Four days covers two hard sessions, one long easy ride, and one shorter easy ride. Five or six days adds more aerobic volume without changing the quality structure. Below four days it gets hard to maintain consistency; above six is very demanding on recovery.",
      },
      {
        question: "Should I cycle every day?",
        answer:
          "Seven days a week without a full rest day accumulates fatigue faster than most amateurs recover from it. One full rest day per week is the minimum. Masters riders should consider two rest days. Some pros ride every day, but they are paid to manage their recovery in ways amateurs can't replicate.",
      },
      {
        question: "Can I do strength training in the same week as hard cycling sessions?",
        answer:
          "Yes — but stack strength sessions on the same day as hard cycling sessions, not on easy days. Doing strength after a threshold ride concentrates the fatigue load rather than spreading it, which keeps your easy and recovery days genuinely easy.",
      },
      {
        question: "What should a typical amateur training week look like?",
        answer:
          "Monday: rest. Tuesday: hard session (threshold). Wednesday: easy zone 2. Thursday: hard session (VO2max or second threshold). Friday: easy or rest. Saturday: long zone 2 ride. Sunday: shorter easy ride or rest. Adjust based on your hours and schedule, but protect the hard/easy separation.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    ],
    relatedTopics: [
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
      { label: "How Many Hours Per Week Should Cyclists Train?", href: "/answers/how-many-hours-training" },
      { label: "What Happens in the Build Phase?", href: "/answers/what-happens-in-the-build-phase" },
      { label: "Volume vs Intensity", href: "/compare/volume-vs-intensity" },
      { label: "Cycling Periodisation Plan Guide", href: "/blog/cycling-periodisation-plan-guide" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Weekly session placement guidance is well established in coaching practice; corroborated by Joe Friel and Dan Lorang on the Roadman podcast.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 9 — WHAT IS BLOCK PERIODISATION
  // ============================================================
  {
    slug: "what-is-block-periodisation",
    cluster: "periodisation",
    question: "What Is Block Periodisation?",
    seoTitle: "What Is Block Periodisation for Cycling?",
    seoDescription:
      "Block periodisation concentrates one training quality per block — pure threshold, then pure VO2max — for stronger adaptation signals. How it differs from traditional periodisation and when it works.",
    pillar: "coaching",
    directAnswer:
      "Block periodisation concentrates training on one quality at a time — a pure threshold block for 3–4 weeks, then a pure VO2max block — rather than mixing qualities across a longer phase. The logic is that a concentrated stimulus produces a stronger adaptation signal. It's particularly effective for time-crunched athletes who need to maximise return from shorter training periods and for experienced athletes seeking a fresh stimulus after years of traditional models.",
    keyTakeaways: [
      "Block periodisation: one focused quality per short block, rather than mixed qualities across a long phase.",
      "Typical structure: accumulation block (volume/base), transmutation block (intensity), realisation block (race-sharp).",
      "Best for experienced athletes and time-crunched riders who need concentrated stimulus.",
      "Risk: very high weekly stress when the intensity block is pure hard work — recovery demands spike.",
    ],
    whoFor: [
      {
        label: "The experienced rider whose traditional periodisation has stalled",
        detail:
          "After several years of traditional base-build-peak, a block-periodised year can provide a new adaptation stimulus.",
      },
      {
        label: "The time-crunched athlete who can't sustain long phases",
        detail:
          "Shorter concentrated blocks may suit your schedule better than 16-week traditional phases.",
      },
    ],
    roadmanView: [
      "Block periodisation gets a lot of attention because it sounds efficient — do all the threshold work in one concentrated dose, adapt, move on. And for certain riders in certain situations, that's exactly right. The problem is that it gets recommended to riders for whom traditional periodisation would produce better results with less injury risk. Concentrated blocks of high-intensity work without an adequate aerobic base are a reliable route to overreaching.",
      "The model that makes block periodisation work is sequential: first a volume-heavy accumulation block that builds the aerobic base, then a transmutation block where the intensity is concentrated, then a realisation block that polishes event-specific fitness. The accumulation block has to be genuinely easy and genuinely long — if you try to skip it and go straight to concentrated intensity, you're just doing unstructured hard training.",
      "Anthony's view: if you've done three or four years of traditional periodisation, have a solid base, and your gains have stalled, a block-periodised year is worth trying. If you're in your first or second year of structured training, stick with traditional. The physiological machinery for high-density intensity blocks takes years to build.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, University of Agder",
        insight:
          "The science on block periodisation shows stronger short-term adaptation signals from concentrated load, particularly for trained athletes. The catch is that the recovery cost of dense intensity blocks is proportionally higher, and the benefits depend on having an aerobic base capable of absorbing the concentrated load.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Professional periodisation increasingly uses short concentrated blocks for specific adaptations — a focused VO2max camp, a dedicated sprint phase. The principle is the same as for amateurs: more concentrated stimulus drives faster adaptation, but only when the base is already in place.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Start with an accumulation block regardless of model",
        detail:
          "Before any concentrated intensity, build 8–12 weeks of aerobic base volume. Block periodisation doesn't bypass this requirement — it just makes the following intensity blocks shorter and more focused.",
      },
      {
        title: "Run a 3–4 week transmutation block",
        detail:
          "After the accumulation phase, concentrate on one quality for 3–4 weeks: all threshold, all VO2max, or a specific event preparation focus. Keep sessions clean — don't mix threshold and VO2max in the same block.",
      },
      {
        title: "Follow the transmutation block with a realisation block",
        detail:
          "2–3 weeks of sharper, shorter, more event-specific work — race openers, short hard efforts, reduced volume. This is the finishing coat on the adaptation produced by the transmutation block.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Starting a block periodisation cycle without a solid base phase.",
        fix:
          "The accumulation block is not optional. Even with a block periodisation model, 8–12 weeks of base work precede the concentrated intensity.",
      },
      {
        mistake: "Running the transmutation block for 6–8 weeks because 3–4 doesn't seem like enough.",
        fix:
          "Longer intense blocks accumulate more fatigue than they add adaptation. The concentrated stimulus works precisely because it's short.",
      },
      {
        mistake: "Trying block periodisation as a first-year structured rider.",
        fix:
          "Block periodisation works best on a platform of existing aerobic fitness. Build traditional first, then experiment with blocks when you have a multi-year aerobic base.",
      },
    ],
    faq: [
      {
        question: "Is block periodisation better than traditional periodisation?",
        answer:
          "For experienced athletes, evidence suggests block periodisation can produce stronger short-term adaptation. For beginners or riders without an established aerobic base, traditional periodisation is more reliable and less risky. Most serious amateurs benefit from several years of traditional periodisation before experimenting with block models.",
      },
      {
        question: "What is the difference between block and traditional periodisation?",
        answer:
          "Traditional periodisation runs one long phase at a time across months, mixing qualities progressively. Block periodisation concentrates single qualities into short 3–4 week windows, cycling through them faster. Traditional is broader and more forgiving; block is more intense and more specific.",
      },
      {
        question: "How many blocks per year in block periodisation?",
        answer:
          "A typical block-periodised year might have 4–6 blocks: one or two accumulation blocks, one or two transmutation blocks, and one realisation block per A-event. The total season length is similar to traditional — only the internal architecture changes.",
      },
      {
        question: "Do professional cyclists use block periodisation?",
        answer:
          "Many do, particularly for specific race preparation. A week-long altitude camp with concentrated threshold work, followed by a race simulation block before a Grand Tour, is a form of block periodisation. But the underlying aerobic base is always built first.",
      },
      {
        question: "Can I combine block and traditional periodisation?",
        answer:
          "Yes, and many coached amateurs effectively do. A traditional base followed by block-style build phases — concentrated threshold then concentrated VO2max — captures the benefits of both: a solid aerobic foundation with a specific adaptation signal in the build.",
      },
    ],
    relatedEpisodes: [
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    ],
    relatedTopics: [
      { label: "Cycling Periodisation: Friel, Lorang, Johnson", href: "/blog/cycling-periodisation-friel-lorang-johnson" },
      { label: "What Is Periodisation?", href: "/answers/what-is-periodisation-cycling" },
      { label: "What Is a Mesocycle?", href: "/answers/what-is-a-mesocycle" },
      { label: "Volume vs Intensity", href: "/compare/volume-vs-intensity" },
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Block periodisation evidence is stronger for trained athletes; research shows advantages over traditional for short-term adaptation in experienced cyclists.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 10 — HOW TO STRUCTURE WINTER TRAINING
  // ============================================================
  {
    slug: "how-to-structure-winter-training",
    cluster: "periodisation",
    question: "How Should I Structure Winter Training?",
    seoTitle: "How to Structure Winter Cycling Training",
    seoDescription:
      "Winter training for cyclists should be the base phase: high volume, low intensity, mostly zone 2 indoors and out. What the pros do in winter and the five mistakes amateurs keep making.",
    pillar: "coaching",
    directAnswer:
      "Winter training should be the base phase: 12–16 weeks of predominantly zone 2 riding, high volume relative to the rest of your year, and genuine low intensity. Spend the majority of winter building your aerobic engine through long rides and easy indoor sessions. One moderate strength session per week is ideal. Leave the intervals for spring. The biggest winter error amateurs make is treating it like a compressed build phase — too much intensity, not enough volume.",
    keyTakeaways: [
      "Winter = base phase: high volume, low intensity, mostly zone 2, 12–16 weeks.",
      "Long indoor rides and longer outdoor rides where weather allows — duration drives base adaptation.",
      "Add strength work twice a week in winter; it's the phase with fewest competing demands.",
      "Keep intervals out of winter (mostly) — one moderate quality session per week at most.",
    ],
    whoFor: [
      {
        label: "The rider who doesn't know what to do in winter",
        detail:
          "You stop structured training in October and come back in spring wondering why you feel terrible.",
      },
      {
        label: "The rider who jumps onto Zwift races all winter",
        detail:
          "You're doing high-intensity indoor racing from November to February and plateauing every spring.",
      },
    ],
    roadmanView: [
      "The pros do something in winter that surprises most amateurs: they ride slow, a lot. Jonas Abrahamsen described it on the podcast — an 18kg weight gain in the off-season followed by a structured winter base. The base phase is not a punishment. It's where the engine for the season is built. The riders who arrive at spring with 14 weeks of solid zone 2 behind them have an aerobic base that absorbs the build phase like a sponge. The riders who spent winter doing Zwift races are fighting accumulated fatigue and wondering why their intervals feel worse in March than in October.",
      "Winter is also the best time to build strength. Less competition for your legs in the week, more flexibility with when sessions happen, and the strength gains compound over a long winter base before being refined in the build. Two sessions a week of cycling-specific lifting — split squats, hip hinges, core — started in November and run through March produce a meaningfully stronger rider for summer.",
      "What not to do in winter: don't race Zwift every Saturday. Don't treat every cold day as an excuse to do a high-intensity indoor session instead of a longer easy one. Don't skip winter entirely and call it an 'off-season'. Rest is fine for 2–4 weeks after your last autumn event. After that, base riding is what winter is for.",
    ],
    expertEvidence: [
      {
        name: "Jonas Abrahamsen",
        credential: "Professional cyclist, Uno-X; Tour de France stage winner",
        insight:
          "Abrahamsen's described winter approach involves substantial de-training from road racing followed by a deliberate base phase rebuild — prioritising aerobic volume and recovery over maintaining race sharpness through the winter. The reset allows a higher quality build phase when spring arrives.",
        episodeSlug: "ep-29-untold-story-ofjonas-abrahamsens-pro-winter-training",
        guestSlug: "jonas-abrahamsen",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "Winter is the most important planning window in the season. The base built in winter determines the ceiling of what the build phase can produce. Coaches who allow athletes to train too hard in winter consistently see their riders plateau or break down during the spring build.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Build a long indoor zone 2 session into every week",
        detail:
          "60–120 minutes at genuine zone 2 on the trainer, once or twice a week. This is the backbone of your winter base — controlled, measurable, and repeatable regardless of weather.",
      },
      {
        title: "Add strength training twice a week",
        detail:
          "November through March is the best window for strength work — furthest from events and with the most schedule flexibility. Split squats, hip hinges, presses, and core. Progress meaningfully over the 12–16 weeks.",
      },
      {
        title: "Get outside once a week for a longer easy ride",
        detail:
          "A 2–3 hour outdoor zone 2 ride on the weekend builds durability that indoor sessions can't replicate. Dress for the weather and keep the power genuinely easy. Duration is the point, not the suffering.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Racing Zwift events all winter and calling it base training.",
        fix:
          "Zwift races are build-intensity work. They have no place in a base phase. Use Zwift for controlled zone 2 and group rides where you can manage the effort.",
      },
      {
        mistake: "Taking the whole winter off and expecting a quick restart in spring.",
        fix:
          "Two to four weeks of genuine rest after your last event is healthy. Beyond that, start building base. Detraining over 12 weeks costs you months of rebuilding.",
      },
      {
        mistake: "Skipping strength work because 'there's no time'.",
        fix:
          "Winter is the easiest time to add strength because event pressure is lowest. Two 30-minute sessions a week in November is far easier to sustain than in April with events looming.",
      },
    ],
    faq: [
      {
        question: "Should I do intervals in winter?",
        answer:
          "Minimal — one modest quality session per week at most in the latter half of the base phase. Tempo riding (76–83% FTP) is fine. Full threshold and VO2max intervals belong in the build phase, not winter base. Winter intensities creeping up is one of the most reliable ways to arrive at spring carrying hidden fatigue.",
      },
      {
        question: "How many hours should I train in winter?",
        answer:
          "Similar volume to your main season or slightly higher if you have the time — winter is when many riders have more weekend flexibility. More important than hours is the intensity distribution: overwhelmingly zone 2, nothing over threshold until spring.",
      },
      {
        question: "Is Zwift good for winter base training?",
        answer:
          "Yes, as a zone 2 training tool. Use the ERG mode for controlled base riding, take group rides where you can stay easy, and use structured base plans. Avoid Zwift racing or high-intensity workouts until the build phase — the platform makes any intensity easy to access, which is exactly the temptation to resist in winter.",
      },
      {
        question: "Should I ride outside in winter?",
        answer:
          "Yes, when conditions allow. Outdoor riding for long zone 2 rides builds durability that indoor sessions don't replicate over the same duration. Dress well, keep power easy, and count the outdoor long ride as a non-negotiable part of the weekly plan.",
      },
      {
        question: "When should I start building toward spring races?",
        answer:
          "For a spring target event in April or May, begin the build phase (threshold and VO2max intervals) in January or February — 8–10 weeks before the event, after 12–16 weeks of winter base. Don't start intervals in October trying to bank fitness early.",
      },
    ],
    relatedEpisodes: [
      "ep-29-untold-story-ofjonas-abrahamsens-pro-winter-training",
      "ep-8-how-to-structure-winter-training-intensity-frequency-duratio",
      "ep-5-secret-to-winter-training-dose-frequency-duration",
    ],
    relatedTopics: [
      { label: "Winter Cycling Training Guide", href: "/blog/winter-training-cycling-guide" },
      { label: "Winter Cycling Training: Indoor Protocol", href: "/blog/winter-cycling-training-indoor-protocol-pros" },
      { label: "Pro Cyclist Winter Habits", href: "/blog/pro-cyclist-winter-habits-offseason-playbook" },
      { label: "What Is Base Training?", href: "/answers/what-is-base-training" },
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Winter base-phase prescription is well established; corroborated by Jonas Abrahamsen, Dan Lorang, and the Roadman winter training series.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 11 — POLARISED OR PYRAMIDAL TRAINING
  // ============================================================
  {
    slug: "polarised-or-pyramidal-training",
    cluster: "periodisation",
    question: "Polarised or Pyramidal: Which Should I Use?",
    seoTitle: "Polarised vs Pyramidal Training: Which Is Right for You?",
    seoDescription:
      "Polarised training (80% easy, 20% hard, nothing in between) vs pyramidal (more threshold work). Which is better for amateurs, when each model fits, per Stephen Seiler's research.",
    pillar: "coaching",
    directAnswer:
      "Polarised training (roughly 80% easy, 20% very hard, almost nothing in the grey zone) and pyramidal training (more time at threshold, less at the extremes) are both legitimate models. Most endurance research favours polarised for long-term amateur development. Pyramidal suits time-crunched riders who need to fit more quality into fewer hours. The fatal error is living in the middle of either model — moderate-intensity riding that doesn't belong to either.",
    keyTakeaways: [
      "Polarised: ~80% zone 1/2, ~20% zone 4/5. Nothing in the grey zone between. Strongest long-term evidence.",
      "Pyramidal: more threshold work (zone 3–4) than polarised, less than pure sweet spot. Common in pros.",
      "Both beat grey-zone riding — the failure mode of amateurs who do neither properly.",
      "Polarised suits higher-volume athletes; pyramidal suits time-crunched riders with 6–8 hours a week.",
    ],
    whoFor: [
      {
        label: "The rider choosing a training model for the season",
        detail:
          "You want to know which philosophy to anchor your year around and understand the trade-offs.",
      },
      {
        label: "The time-crunched rider who heard polarised requires high volume",
        detail:
          "You're wondering if polarised works at 6–8 hours a week or if pyramidal is the right call.",
      },
    ],
    roadmanView: [
      "Seiler's research on polarised training is the most cited finding in endurance science over the last 20 years, and it's genuinely useful for amateurs. But the nuance that gets lost in the cycling podcast space is that pyramidal training — where pros spend more time at threshold and less at the extremes — is also the dominant pattern at the very highest level when you look at the actual data. The two models are closer than the argument about them suggests.",
      "What both models share, and what matters most, is the rejection of grey-zone riding. Neither says 'ride comfortably hard all the time'. Polarised says 'go easy or go very hard'. Pyramidal says 'go easy most of the time, threshold sometimes, very hard rarely'. The distribution is different at the top end; both models agree that moderate-intensity, medium-hard riding is where most amateur time gets wasted.",
      "Anthony's practical take: if you have 10+ hours a week, polarised is the more achievable model — the intensity sessions stay small and the volume absorbs them. On 6–8 hours, including some pyramidal threshold work is defensible because you have fewer hours to fill with purely easy riding. The key is that your easy rides are genuinely easy regardless of which model you call it.",
    ],
    expertEvidence: [
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, University of Agder",
        insight:
          "Seiler's analysis of elite endurance athletes consistently shows a polarised distribution as the most common pattern in long-term athletic development. The grey zone between first and second ventilatory thresholds accumulates fatigue without delivering equivalent adaptation — regardless of which model label riders apply to themselves.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "At the Grand Tour level, the distribution in training is more pyramidal than purely polarised — some threshold work sits between the easy aerobic base and the high-intensity peaks. The amateur lesson is that threshold work has a place, but the foundation must be aerobic volume, not the inverse.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Default to polarised if you train 10+ hours a week",
        detail:
          "At higher volumes, the 80/20 split is achievable and produces the best long-term base. Make easy rides genuinely easy, limit hard sessions to two per week, and put nothing in the middle.",
      },
      {
        title: "Add some pyramidal threshold work if you train 6–8 hours a week",
        detail:
          "With limited hours, some threshold riding (one 2×20 session) alongside mostly easy riding is a reasonable pyramidal compromise. The easy/hard ratio shifts slightly, but the principle — protect the easy days — stays the same.",
      },
      {
        title: "Police the grey zone either way",
        detail:
          "Review your zone data for the past two weeks. If your easy days sit in zone 3, that's grey-zone drift. Pull them down to zone 2 before worrying about which model label to apply.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Doing 'polarised' but riding easy days in zone 3.",
        fix:
          "Half-polarised is just grey-zone with better PR. Police the easy days — zone 2 or below.",
      },
      {
        mistake: "Treating pyramidal as permission to do threshold work every day.",
        fix:
          "Pyramidal means more threshold than polarised, not constant threshold. The majority of training is still easy in a pyramidal model.",
      },
      {
        mistake: "Changing models every six weeks to see which is better.",
        fix:
          "Pick one for a full season and evaluate over 12–16 weeks. Switching every block produces no useful data and no sustained adaptation.",
      },
    ],
    faq: [
      {
        question: "What is the difference between polarised and pyramidal training?",
        answer:
          "Polarised keeps almost all training at either very easy (zone 1–2) or very hard (zone 4–5) intensities, with almost nothing in the threshold zone. Pyramidal has a larger proportion of threshold and sweet-spot work between the two extremes. Both models keep easy riding as the largest single category.",
      },
      {
        question: "Which training model do the pros use?",
        answer:
          "Research suggests most elite endurance athletes land somewhere between polarised and pyramidal depending on the period of the season and the sport. During base phases, distribution is more polarised. During build and race phases, more threshold work enters, moving toward pyramidal. The base remains the largest volume category throughout.",
      },
      {
        question: "Can I combine polarised and pyramidal?",
        answer:
          "Yes — many coached amateurs run a polarised base phase and a pyramidal build phase. The base is almost purely easy volume, and the build adds threshold intervals. This is practically the most common model among well-coached serious amateurs.",
      },
      {
        question: "Does polarised training work at low volume?",
        answer:
          "It can, but the case is less clear-cut at 4–6 hours a week. At low volume, including some threshold work can be more efficient than spending all limited hours on zone 2. This is where the pyramidal argument has most merit — time-crunched riders may need more threshold density.",
      },
      {
        question: "Is there research comparing polarised and pyramidal directly?",
        answer:
          "A 2013 study directly comparing the two models found polarised produced greater gains in VO2max and power at threshold over nine weeks. Other research shows pyramidal is the typical observed distribution in elite cycling. The consensus is that both are effective; polarised may have a slight edge for long-term development.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
    ],
    relatedTopics: [
      { label: "Polarised vs Pyramidal Training", href: "/compare/polarised-vs-pyramidal" },
      { label: "Polarised vs Sweet Spot", href: "/answers/polarised-vs-sweet-spot" },
      { label: "Polarised Training Guide", href: "/blog/polarised-training-cycling-guide" },
      { label: "Stephen Seiler 80/20 Research", href: "/blog/stephen-seiler-80-20-polarised-training-cyclists" },
      { label: "FTP Training — Topic Hub", href: "/topics/ftp-training" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Polarised and pyramidal training are both well-studied; Seiler's research and the 2013 comparison study corroborate the polarised advantage; World Tour data supports pyramidal at higher volumes.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 12 — HOW MANY WEEKS TO PEAK
  // ============================================================
  {
    slug: "how-many-weeks-to-peak",
    cluster: "periodisation",
    question: "How Many Weeks Does It Take to Peak?",
    seoTitle: "How Many Weeks Does It Take to Peak for a Cycling Event?",
    seoDescription:
      "It takes 16–22 weeks from base to peak for most serious cyclists. Why a shorter plan can still work, how the taper fits, and the timing mistake that ruins otherwise good preparation.",
    pillar: "coaching",
    directAnswer:
      "From starting a structured base phase to expressing peak fitness at an event takes 16–22 weeks for most serious amateurs: 12–16 weeks of base plus 8–10 weeks of build. The taper on top of that is 1–3 weeks. If you have fewer than 16 total weeks, shorten the base first and protect the build. Peaking too early — usually from a rushed taper or excess intensity in the final weeks — is the most common timing error.",
    keyTakeaways: [
      "Total preparation: 16–22 weeks from base start to event day — base + build + taper.",
      "The taper is 1–3 weeks: volume drops 30–50%, intensity stays sharp.",
      "Less than 16 weeks? Shorten the base, not the build or taper.",
      "Peaking too early usually means tapering too long or doing too much intensity in the final weeks.",
    ],
    whoFor: [
      {
        label: "The rider planning their first properly periodised event prep",
        detail:
          "You want to know how far back to start planning and how to work toward a specific date.",
      },
      {
        label: "The rider who always feels flat on event day",
        detail:
          "You've trained well but arrive at your A-event legs feeling heavy. Taper timing is probably the issue.",
      },
    ],
    roadmanView: [
      "The most heartbreaking training error Anthony sees in coached riders is peaking two weeks before the event. You train hard, you feel amazing on a Tuesday eight days before the big sportive, and then you ease off and arrive flat. The body's adaptation doesn't wait for your race day — it arrives when it arrives, and if you've timed the taper wrong, the peak comes early.",
      "The taper formula is less intuitive than it seems. You're not just cutting volume — you're reducing training stress while keeping intensity present so the neuromuscular sharpness stays without the fatigue. Too long a taper and the sharpness fades. Too short and the fatigue hasn't cleared. For most amateurs, 10–14 days is close to right — cut volume by 30–50%, keep one or two short, punchy sessions in the week before, then rest for 48 hours out.",
      "And the weeks before the taper matter as much as the taper itself. Hammering training in the final two weeks of the build because you feel behind is the second-most common peaking error. That accumulated fatigue takes the full taper to clear, which means you arrive at the start line rested but without the sharpness the final two hard weeks would have given you.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "The taper is one of the most misunderstood phases in amateur preparation. Most riders either taper too long, losing sharpness, or not at all, arriving fatigued. A 10–14 day taper for most amateurs — cutting volume significantly while keeping some intensity — is the reliable template.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Dan Lorang",
        credential: "Head of Performance, Red Bull–Bora–Hansgrohe",
        insight:
          "At the professional level, peak timing is planned from the event date backwards with precision. The build phase ends with a deliberate reduction in volume and a shift to quality over quantity. Amateur riders often underestimate how long accumulated fatigue takes to clear — 10 days minimum, often more.",
        episodeSlug: "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
        guestSlug: "dan-lorang",
      },
    ],
    practicalApplication: [
      {
        title: "Count 16–22 weeks backwards from your event",
        detail:
          "Mark the date. Count back 1–2 weeks for taper, then 8–10 weeks for build, then 12–16 weeks for base. That's your base start date. If the calendar doesn't allow the full span, shorten the base phase.",
      },
      {
        title: "Start the taper 10–14 days out",
        detail:
          "Cut volume by 30–50% while keeping two short, sharp sessions in the first taper week. The second week, one short intensity session, then 48–72 hours easy before the event. Do not go longer than 14 days — sharpness fades.",
      },
      {
        title: "Don't add training stress in the final two weeks of build",
        detail:
          "The last two weeks before the taper should be your normal build load, not a last-minute panic block. Extra sessions in the final fortnight add fatigue that the taper can't fully clear by event day.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Tapering for three weeks and arriving flat.",
        fix:
          "Most amateurs need 10–14 days, not three weeks. A long taper produces detraining, not freshness.",
      },
      {
        mistake: "No taper — training right up to the event.",
        fix:
          "Even a 7-day mini-taper (cut volume by 30%) is better than none. Your body needs time to express the fitness you've built.",
      },
      {
        mistake: "Hammering extra training in the final 10 days because the event feels close.",
        fix:
          "No new fitness can be built in the final 10 days — only fatigue accumulated. Trust the plan and ease off.",
      },
    ],
    faq: [
      {
        question: "How do I know when I've peaked?",
        answer:
          "Practical signs: easy rides feel genuinely effortless, hard efforts produce power you haven't seen recently, and your legs feel 'alive' without feeling anxious. On a training file, your CTL should be near its highest of the cycle and your ATL (acute fatigue) dropping. If both are dropping, you may be detraining, not peaking.",
      },
      {
        question: "What if I can only start training 12 weeks before my event?",
        answer:
          "Compress by shortening base to 6–8 weeks rather than cutting the build or taper. A 6-week base followed by 6-week build and 10-day taper still produces meaningful adaptation. Manage your expectations — 12 weeks isn't enough for a full preparation, but it's enough to arrive better than untrained.",
      },
      {
        question: "Can I peak twice in one season?",
        answer:
          "Yes, typically by running two full build-to-peak cycles with a mini-recovery block between them. The second peak is usually slightly lower than the first unless the recovery block was adequate. Plan 12–14 weeks between A-events for a realistic secondary peak.",
      },
      {
        question: "Should I do any intensity in the taper week?",
        answer:
          "Yes — one or two short, sharp efforts in the first taper week keep the neuromuscular system activated. Eliminate intensity entirely and you arrive rested but flat. The formula: short intervals, not long threshold work, and nothing in the final 48 hours.",
      },
      {
        question: "Why do I feel worse at the start of the taper?",
        answer:
          "The first 3–5 days of a taper often feel heavy — you're carrying the fatigue from the last build block without the masking effect of daily training. This is normal. Push through the first week and the legs typically come around by days 7–10.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2134-roglics-coach-builds-a-training-plan-for-amateur-riders-dan",
      "ep-2067-boost-your-cycling-fitness-in-30-days-complete-training-plan",
    ],
    relatedTopics: [
      { label: "How to Peak for a Cycling Event", href: "/blog/cycling-taper-race-preparation-system" },
      { label: "Cycling Tapering Guide", href: "/blog/cycling-tapering-guide" },
      { label: "How to Periodise Your Season", href: "/blog/how-to-periodise-cycling-season" },
      { label: "How to Structure a Cycling Season", href: "/answers/how-to-structure-a-cycling-season" },
      { label: "Cycling Training Plans — Topic Hub", href: "/topics/cycling-training-plans" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Peak timing and taper guidance reflects coaching consensus (Friel, Lorang); specific week counts are practical guidelines rather than hard physiological thresholds.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 13 — HOW TO PERIODISE CYCLING NUTRITION
  // ============================================================
  {
    slug: "how-to-periodise-cycling-nutrition",
    cluster: "periodisation",
    question: "How Do I Periodise My Nutrition Across the Season?",
    seoTitle: "How to Periodise Cycling Nutrition Across the Season",
    seoDescription:
      "Nutrition periodisation means matching what you eat to what you're training — lower carbs in base, higher in build and race phases. What David Dunne and Sam Impey prescribe for serious amateurs.",
    pillar: "nutrition",
    directAnswer:
      "Nutrition periodisation means matching your carbohydrate intake to your training load: lower in the base phase when intensity is low, progressively higher through the build as hard sessions increase, and highest around race week. In the base phase, periodic easy fasted or low-carb sessions have a place. In the build and race phases, fuelling the hard work fully is non-negotiable. Trying to race on a base-phase diet is one of the most common amateur performance blockers.",
    keyTakeaways: [
      "Base phase: moderate carbs, some low-carb sessions are fine around easy rides.",
      "Build phase: carbs rise to match increasing intensity — hard sessions must be well fuelled.",
      "Race phase: high carbs, carb-loaded days before events, no calorie restriction.",
      "The error amateurs make is eating the same way year-round, under-fuelling the build and race phases.",
    ],
    whoFor: [
      {
        label: "The rider eating the same way in January as in June",
        detail:
          "Your nutrition doesn't match your training load and you're likely under-fuelling your hard sessions.",
      },
      {
        label: "The rider trying to lose weight while training hard",
        detail:
          "Understanding nutrition periodisation shows you the right time and wrong time to create a calorie deficit.",
      },
    ],
    roadmanView: [
      "The cycling nutrition conversation used to be dominated by two camps: eat everything or eat nothing. The modern position — which Anthony covered with David Dunne and Sam Impey on the podcast — is more nuanced. Nutrition should change with training load the same way training changes with the season. In base, when most rides are easy, some low-carb sessions are a legitimate adaptation stimulus. In build, when the hard sessions hit, under-fuelling them is a guaranteed way to cap your gains.",
      "What David Dunne calls 'fuelling for the work required' is the key principle. In the build phase, threshold and VO2max sessions need full glycogen stores to be done properly. An athlete who eats for base throughout their build phase is effectively doing every hard session at sub-maximal effort, and wondering why their FTP isn't moving. The adaptation signal is limited by the fuel available to generate the effort.",
      "Race phase nutrition is the simplest: eat carbohydrates, load them across the 36–48 hours before the event, and take enough on the bike to never bonk. This isn't the time for calorie restriction or low-carb experimenting. Race phase nutrition can take you from a mediocre performance to your best — but only if you've also periodised it through base and build.",
    ],
    expertEvidence: [
      {
        name: "David Dunne",
        credential: "Performance nutritionist to INEOS Grenadiers, EF Education, and Uno-X",
        insight:
          "Fuelling for the work required means carbohydrate availability should match the intensity demands of the session. Low-carb strategies have a place in base training around genuinely easy rides. High-carb fuelling is non-negotiable in build and race phases where intensity and performance are the goal.",
        episodeSlug: "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
        guestSlug: "david-dunne",
      },
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "The most consistent nutrition periodisation error in amateur cyclists is failing to raise carbohydrate intake when training intensity increases. Athletes who maintain a base-phase calorie deficit through the build phase systematically cap the quality of their hard sessions and blunt adaptation.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
    ],
    practicalApplication: [
      {
        title: "Low-carb easy sessions in base only",
        detail:
          "In the base phase, two or three easy zone 2 sessions per week can be done with low carbohydrate availability — morning fasted rides under 90 minutes, or rides where you deliberately reduce carb intake. Keep this to genuinely easy sessions only. Never do a threshold or VO2max session in a low-fuel state.",
      },
      {
        title: "Raise carb intake when the build starts",
        detail:
          "As hard sessions enter the plan in the build phase, increase daily carbohydrate intake to 5–7g per kg of body weight on training days. The fuel has to match the effort. Use a nutrition tracking app for two weeks to check you're actually hitting target.",
      },
      {
        title: "Carb-load in the 36–48 hours before an A-event",
        detail:
          "Eat carbohydrate-rich meals across the 36–48 hours before a major event, targeting 8–10g of carbs per kg of body weight daily. Keep fat and fibre lower to avoid digestive issues. This is about glycogen, not overeating — steady volume, high carb density.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Eating base-phase food while doing build-phase training.",
        fix:
          "Raise carb intake when intervals start. Under-fuelled hard sessions produce weaker adaptation — the intensity should feel properly hard, which requires glycogen.",
      },
      {
        mistake: "Trying to lose weight during the build or race phase.",
        fix:
          "Calorie deficits belong in the base phase when intensity is low and the risks of under-fuelling are minimal. The build and race phases are for performance, not weight loss.",
      },
      {
        mistake: "Eating the same amount on rest days as on hard training days.",
        fix:
          "Rest days need less fuel than hard-session days. Cycle carbohydrate: high on hard days, moderate on easy days, lower on rest days. Protein stays consistent.",
      },
    ],
    faq: [
      {
        question: "What is the 'fuel for the work required' principle?",
        answer:
          "A concept popularised by nutritionists working in professional cycling — match carbohydrate availability to the energy demands of the session. Easy sessions can be done with low carbs; hard sessions need full fuel. The idea is to use strategic low-carb exposure for base adaptation without compromising quality sessions.",
      },
      {
        question: "Should I eat more carbs in winter base or summer build?",
        answer:
          "More carbs in the build phase, when intensity is higher. Winter base training is predominantly easy, so carbohydrate demands are lower. As the build introduces threshold and VO2max work, carb intake should rise to match — summer build typically demands more carbohydrate than winter base.",
      },
      {
        question: "Can I lose weight in the build phase?",
        answer:
          "Technically yes, but it's risky. Calorie restriction while doing threshold and VO2max work reduces the quality of hard sessions and compromises adaptation. The evidence from coaches like David Dunne is clear: weight-loss interventions in the build phase cost performance. Do the deficit work in base.",
      },
      {
        question: "How many carbs should I eat on a hard training day?",
        answer:
          "5–7g of carbohydrate per kg of bodyweight for a hard training day. For a 75kg rider, that's 375–525g of carbs — substantially more than the base-phase default. Pre-session, 60–90 minutes of hard training needs glycogen stores topped up from the meal 2–3 hours before.",
      },
      {
        question: "Does nutrition periodisation apply to protein too?",
        answer:
          "Less dramatically than carbohydrates, but yes. Protein needs are slightly higher during the build and race phases when muscle synthesis demands are greatest. Around 1.6–2.2g per kg of bodyweight daily throughout the year, with emphasis on distributing it across meals rather than concentrating it post-training.",
      },
      {
        question: "What does race-week nutrition look like?",
        answer:
          "Two days before: high carbs, low fat and fibre, normal protein. The day before: same, with a carb-heavy dinner. Morning of: 1–4g carbs per kg two to four hours before the start, adjusted for how much time you have. On the bike: 60–90g carbs per hour from 30 minutes in.",
      },
    ],
    relatedEpisodes: [
      "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    ],
    relatedTopics: [
      { label: "Nutrition Periodisation Guide", href: "/blog/nutrition-periodisation-base-build-race" },
      { label: "Fuel for the Work Required", href: "/blog/fuel-for-the-work-required-fftwr-explained" },
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "How Many Carbs Per Hour?", href: "/answers/carbs-per-hour-cycling" },
      { label: "Fuelled vs Fasted Sessions", href: "/compare/fueled-vs-fasted-sessions" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Nutrition periodisation science is established for elite athletes; prescription for amateurs corroborated by David Dunne and Sam Impey across the Roadman podcast.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },
];
