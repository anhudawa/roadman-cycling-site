import type { AnswerPage } from "@/lib/answers";

/**
 * Training-physiology definitions — the citation-optimised "what is X" answer
 * pages for the foundational physiology terms that sit underneath the metrics
 * layer. These fill genuine answer-layer gaps: lactate threshold, polarised
 * training, HRV, VO2 max and tempo each had how-to or comparison pages, or no
 * page at all, but none owned the single extractable definition. Same rich
 * format as answers-data/metrics.ts; expert framing reflects the on-the-record
 * public positions of cited guests (Seiler, Friel) — no fabricated quotes.
 */
export const trainingPhysiologyAnswers: AnswerPage[] = [
  // ============================================================
  // WHAT IS LACTATE THRESHOLD
  // ============================================================
  {
    slug: "what-is-lactate-threshold-cycling",
    cluster: "power",
    question: "What Is Lactate Threshold in Cycling?",
    seoTitle: "What Is Lactate Threshold in Cycling? LT1 and LT2 Explained",
    seoDescription:
      "Lactate threshold is the intensity above which lactate builds up faster than you clear it. What LT1 and LT2 mean, how they relate to FTP, and how to train them.",
    pillar: "coaching",
    directAnswer:
      "Lactate threshold is the exercise intensity above which lactate accumulates in your blood faster than your body can clear it. There are two thresholds: LT1, the first rise above resting levels that marks the top of true easy riding, and LT2, the point where lactate climbs sharply and the effort becomes unsustainable. LT2 is what your FTP approximates — the highest power you can hold in a quasi-steady state for roughly an hour. The two thresholds bracket your training zones: easy work sits below LT1, hard work pushes toward LT2.",
    keyTakeaways: [
      "There are two thresholds, not one: LT1 (the top of easy) and LT2 (the edge of sustainable).",
      "FTP is a field proxy for LT2 — the power you can hold for about an hour.",
      "Below LT1 you can ride almost all day; above LT2 the clock runs out fast.",
      "The two thresholds define where your zones actually sit — which is why training by them beats training by guesswork.",
    ],
    whoFor: [
      {
        label: "The rider trying to make sense of zones",
        detail:
          "You keep hearing about LT1, LT2 and threshold, and want to know what the boundaries physically mean before you train to them.",
      },
      {
        label: "The polarised-curious amateur",
        detail:
          "You want to ride easy days easy and hard days hard, and you need to know where 'easy' actually ends.",
      },
    ],
    roadmanView: [
      "Lactate threshold is the single most useful idea in endurance training, and it's quietly misunderstood because most riders think there's one threshold. There are two. LT1 is the top of properly easy — the intensity where lactate first lifts off baseline. LT2 is the ceiling — where it runs away from you and the effort has a short fuse. Everything you read about zones is really a story about where these two lines fall.",
      "Lactate itself isn't the villain it was sold as for decades. It's a fuel your body recycles, and the threshold isn't a poison line — it's a marker of the point where production outruns clearance. That distinction matters, because it reframes the goal. You're not trying to avoid lactate. You're trying to push the intensity at which clearance can't keep up to a higher and higher power.",
      "The practical payoff is the reason we build Method plans around it: once you know roughly where LT1 and LT2 sit, the polarised model writes itself. Most of your riding lives below LT1, where you can accumulate hours without digging a hole. A smaller, deliberate share lives at or above LT2, where the adaptations that move the ceiling actually happen. The grey middle — comfortably hard, between the two — is where most amateurs spend their week and where the least adaptation per unit of fatigue lives.",
    ],
    expertEvidence: [
      {
        name: "Prof. Stephen Seiler",
        credential: "Exercise physiologist, originator of the polarised-training framework",
        insight:
          "Seiler's work anchors training intensity to the two lactate turn-points rather than a single threshold: the bulk of training sits below the first (LT1), a deliberate minority above the second (LT2), and the comfortably-hard middle is the zone to ration. Defining zones by where lactate actually behaves, not by round-number percentages, is the point.",
        episodeSlug: "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Anchor your easy pace to LT1",
        detail:
          "True endurance riding sits below LT1 — conversational, nose-breathing, a pace you could hold for hours. If your 'easy' rides leave you needing recovery, they're drifting above LT1.",
      },
      {
        title: "Treat FTP as your working LT2",
        detail:
          "You don't need a lab. An honest FTP test gives you a usable estimate of LT2. Set your zones from it and retest every six to eight weeks as you get fitter.",
      },
      {
        title: "Spend less time between the two",
        detail:
          "The intensity between LT1 and LT2 feels productive and costs a lot for what it returns. Push it to the edges: most volume below LT1, the hard minority near or above LT2.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Believing there's a single threshold.",
        fix:
          "There are two. LT1 sets the top of easy; LT2 sets the edge of sustainable. Conflating them is why riders ride their easy days too hard.",
      },
      {
        mistake: "Treating lactate as a waste product to avoid.",
        fix:
          "Lactate is a fuel your body recycles. The threshold marks where production outpaces clearance — the goal is to raise the power at which that happens, not to fear the molecule.",
      },
    ],
    faq: [
      {
        question: "What's the difference between LT1 and LT2?",
        answer:
          "LT1 is the first lift in blood lactate above resting levels — the top of truly easy, aerobic riding. LT2 (often called the anaerobic or second threshold) is where lactate rises steeply and the effort becomes unsustainable. LT2 is close to your FTP; LT1 sits well below it.",
      },
      {
        question: "Is lactate threshold the same as FTP?",
        answer:
          "FTP is a practical field estimate of your second lactate threshold (LT2) — the highest power you can hold in a quasi-steady state for around an hour. They're used interchangeably in training, but FTP is a usable approximation, not a lab measurement.",
      },
      {
        question: "How do I find my lactate threshold without a lab?",
        answer:
          "An honest FTP test gives you a working estimate of LT2. For LT1, the conversational test is reliable: the top of easy is the highest intensity at which you can still hold a full sentence comfortably and breathe through your nose. Both are estimates, but they're enough to set zones.",
      },
      {
        question: "Can you raise your lactate threshold?",
        answer:
          "Yes. Consistent aerobic volume lifts LT1, and threshold and VO2 work lift LT2 toward your VO2 max ceiling. Raising the power at each threshold is most of what getting fitter as an endurance cyclist actually means.",
      },
      {
        question: "Why does lactate threshold matter more than VO2 max?",
        answer:
          "VO2 max sets the ceiling on your aerobic engine, but lactate threshold determines what fraction of that ceiling you can sustain. Two riders with the same VO2 max but different thresholds will perform very differently over an hour — the one with the higher threshold holds more power for longer.",
      },
    ],
    relatedEpisodes: [
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
    ],
    relatedTopics: [
      { label: "What Is FTP and Why Does It Matter?", href: "/answers/what-is-ftp" },
      { label: "What Is VO2 Max for Cyclists?", href: "/answers/what-is-vo2-max-cycling" },
      { label: "What Is Zone 2 Training?", href: "/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe" },
      {
        label: "Lactate Threshold Home Test for Cyclists",
        href: "/blog/lactate-threshold-home-test-cyclists",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "The two-threshold model (LT1/LT2) and the lactate-clearance framing are well-established exercise physiology; the FTP-as-LT2 relationship is standard coaching practice across the Roadman archive.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS HRV
  // ============================================================
  {
    slug: "what-is-hrv-cycling",
    cluster: "recovery",
    question: "What Is Heart Rate Variability (HRV) for Cyclists?",
    seoTitle: "What Is HRV for Cyclists? Heart Rate Variability Explained",
    seoDescription:
      "HRV is variation between normal heartbeats. Learn what it can tell cyclists, why high or low is not a diagnosis, and how to use a personal pattern.",
    pillar: "recovery",
    directAnswer:
      "Heart rate variability (HRV) is variation in the interval between normal heartbeats. It can add context to autonomic regulation and recovery when cyclists compare the same metric, device and method with their own repeated pattern. A low value does not automatically mean fatigue, a high value does not prove readiness, and HRV cannot diagnose illness or overtraining. Use it beside symptoms, subjective wellbeing, resting heart rate, sleep and recent training load.",
    keyTakeaways: [
      "HRV measures the tiny beat-to-beat differences in your heart rhythm, not your heart rate.",
      "Higher is not always recovered and lower is not automatically fatigued; direction only makes sense inside the rider's measurement method and wider context.",
      "It's a personal trend, not a leaderboard — your baseline is the only thing worth comparing to.",
      "Use it to confirm what your body's telling you, not to override how you actually feel.",
    ],
    whoFor: [
      {
        label: "The data-driven rider managing load",
        detail:
          "You want an objective signal for when to push and when to back off, beyond how the legs feel on the day.",
      },
      {
        label: "The masters cyclist watching recovery",
        detail:
          "You want another recovery input without applying a fixed age correction or universal HRV threshold.",
      },
    ],
    roadmanView: [
      "HRV has real physiology behind it, but a consumer score does not isolate recovery. Training, sleep, alcohol, psychological stress, illness, breathing, posture and measurement quality can all influence it.",
      "The mistake is reading one number like a school grade—or turning one rolling average and percentage threshold into a universal law. Compare like with like inside your own method and ask whether repeated change agrees with how you feel and perform.",
      "Where it earns a place is as one vote in the decision. If HRV, symptoms, sleep, resting heart rate and the warm-up agree, act on the cluster. When they conflict, do not let the gadget overrule obvious symptoms or manufacture a hard day.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Co-founder of TrainingPeaks, author of The Cyclist's Training Bible",
        insight:
          "HRV can inform a weekly training conversation when it is read as a personal pattern beside the athlete's wider context, rather than used as a binary daily command.",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Measure at the same time, the same way",
        detail:
          "Follow one validated resting or overnight method and keep the device, metric, posture and routine comparable. Consistency makes interpretation more defensible.",
      },
      {
        title: "Read the trend, not the day",
        detail:
          "Inspect an unusual value for artefact and context, then see whether repeated change agrees with symptoms, wellbeing, resting heart rate, sleep and recent load.",
      },
      {
        title: "Let it inform, not dictate",
        detail:
          "Use HRV to sharpen the question, not settle it. Symptoms and function outrank a favourable score, and one low score does not automatically cancel training.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Comparing your HRV to other riders'.",
        fix:
          "Absolute values are highly individual and say nothing across people. The only comparison that matters is to your own established baseline.",
      },
      {
        mistake: "Reacting to every single morning reading.",
        fix:
          "Do not obey one reading, but do not blindly obey one smoothing window either. Check measurement quality and whether the wider recovery picture agrees.",
      },
    ],
    faq: [
      {
        question: "What is a good HRV for a cyclist?",
        answer:
          "There's no universal good number. HRV depends on the metric, device, protocol and individual. Compare like with like inside your own repeated pattern; stable or rising is not automatically good and lower is not automatically fatigue.",
      },
      {
        question: "How do I measure HRV?",
        answer:
          "Use a validated resting chest-strap method or an overnight wearable protocol, then keep the device, metric and routine stable. Optical pulse-rate variability and ECG-derived HRV should not be treated as interchangeable.",
      },
      {
        question: "Does HRV go up or down when I'm fatigued?",
        answer:
          "It can fall, but the direction is not reliable enough to diagnose fatigue. Training status, load, sleep, illness, stress and measurement conditions can produce different patterns, so check HRV against symptoms and performance.",
      },
      {
        question: "Should I skip training if my HRV is low?",
        answer:
          "Not automatically. A single low reading is noise. A sustained drop, especially alongside heavy legs or poor sleep, is a reason to consider an easier day — but weigh it against how you feel rather than letting the number decide for you.",
      },
      {
        question: "Is HRV better than resting heart rate for tracking recovery?",
        answer:
          "They're complementary. Resting heart rate is simpler and tends to rise with fatigue or illness; HRV is more sensitive but noisier. Tracked together over time, against your own baseline, they give a fuller picture than either alone.",
      },
    ],
    relatedEpisodes: [
      "ep-2205-the-training-secret-to-going-faster-after-40-joe-friel",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
    ],
    relatedTopics: [
      { label: "Should Cyclists Use HRV?", href: "/answers/should-cyclists-use-hrv" },
      { label: "What Are the Signs of Overtraining?", href: "/answers/signs-of-overtraining-cycling" },
      {
        label: "HRV Training Guide for Cyclists",
        href: "/blog/cycling-hrv-training-guide",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "HRV reflects autonomic-related variation, but reviews show only small or uncertain superiority of HRV-guided training for performance. Interpretation requires a consistent personal method and multiple recovery inputs.",
    publishDate: "2026-06-20",
    updatedDate: "2026-08-31",
  },

  // ============================================================
  // WHAT IS VO2 MAX
  // ============================================================
  {
    slug: "what-is-vo2-max-cycling",
    cluster: "power",
    question: "What Is VO2 Max for Cyclists?",
    seoTitle: "What Is VO2 Max for Cyclists? The Aerobic Ceiling Explained",
    seoDescription:
      "VO2 max is the maximum rate your body can use oxygen — the ceiling on your aerobic engine. What it means for cycling, how it relates to FTP, and how trainable it is.",
    pillar: "coaching",
    directAnswer:
      "VO2 max is the maximum rate at which your body can take in, transport and use oxygen during hard exercise, usually expressed in millilitres of oxygen per kilogram of body weight per minute (ml/kg/min). It's the ceiling on your aerobic engine. For cyclists it sets the upper limit of sustainable power: your FTP is the fraction of that ceiling you can hold for an hour, and VO2 max defines how high the ceiling itself sits. It's partly genetic, but trainable — and the higher it is, the more aerobic headroom you have to develop.",
    keyTakeaways: [
      "VO2 max is your aerobic ceiling — the most oxygen your body can use per minute.",
      "It's reported relative to body weight (ml/kg/min), so it behaves like a power-to-weight number.",
      "FTP is the fraction of that ceiling you can sustain; VO2 max is the ceiling itself.",
      "It's partly genetic but meaningfully trainable, especially through hard interval work.",
    ],
    whoFor: [
      {
        label: "The rider chasing a higher ceiling",
        detail:
          "Your FTP has crept close to your aerobic ceiling and you want to understand what raising the ceiling itself takes.",
      },
      {
        label: "The data-curious cyclist",
        detail:
          "Your watch or head unit shows an estimated VO2 max and you want to know what it actually measures and how much to trust it.",
      },
    ],
    roadmanView: [
      "VO2 max is the headline number everyone knows and few use well. It's a genuine measure — the ceiling on how much oxygen your aerobic system can deliver and burn — and a higher ceiling does mean more potential. But on its own it doesn't win bike races. What you do with the ceiling matters more than the ceiling itself.",
      "The useful way to hold it: VO2 max sets the roof, and your lactate threshold determines how close to that roof you can live. Two riders can share a VO2 max and finish minutes apart over an hour because one holds a far higher fraction of it. That's why we rarely chase VO2 max in isolation — it's developed alongside threshold and a deep aerobic base, not instead of them.",
      "It's also more trainable than the genetic-ceiling story suggests, particularly for amateurs who've never done structured high-intensity work. Done properly, VO2 intervals raise it. But it responds slowly, it's costly in fatigue, and the wearable estimate on your wrist is a rough trend at best. Build the base, train the threshold, add a deliberate dose of VO2 work — and treat the number as one input, not the scoreboard.",
    ],
    expertEvidence: [
      {
        name: "Prof. Stephen Seiler",
        credential: "Exercise physiologist, originator of the polarised-training framework",
        insight:
          "In the polarised model, VO2-level work is the deliberate hard minority that drives high-end adaptation — effective precisely because it's rationed and ridden fresh. The ceiling is raised by a small, well-placed dose of legitimately hard riding sitting on top of a large aerobic base, not by grinding the comfortably-hard middle.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Build the base before chasing the ceiling",
        detail:
          "VO2 work lands best on top of a deep aerobic foundation. Months of easy volume first; high-intensity intervals second, once the base can support them.",
      },
      {
        title: "Train it with proper intervals, ridden fresh",
        detail:
          "VO2 efforts are typically three to five minutes near your maximum sustainable effort, with full recovery between. They only work if you arrive rested enough to hit the target.",
      },
      {
        title: "Treat the wearable estimate as a trend",
        detail:
          "Watch and head-unit VO2 max figures are modelled estimates, not lab values. Use the direction of travel over months, not the exact number on any given day.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Chasing VO2 max in isolation.",
        fix:
          "The ceiling matters less than how much of it you can sustain. Develop VO2 max alongside lactate threshold and aerobic base, not as a standalone target.",
      },
      {
        mistake: "Trusting the wearable number to the decimal.",
        fix:
          "Consumer VO2 max estimates are approximate and noisy. Read them as a long-run trend, and don't let a daily wobble change your training.",
      },
    ],
    faq: [
      {
        question: "What is a good VO2 max for a cyclist?",
        answer:
          "It varies hugely with age, sex and training history. Recreational riders often sit in the 40s, well-trained amateurs in the 50s and 60s, and elite professionals can exceed 70–80 ml/kg/min. Your own trend over time is more useful than any single benchmark.",
      },
      {
        question: "Can you actually improve VO2 max?",
        answer:
          "Yes, especially if you've never trained it. A meaningful share of VO2 max is genetic, but structured high-intensity intervals on top of a solid aerobic base can raise it — though it responds slowly and costs more fatigue than threshold work.",
      },
      {
        question: "What's the difference between VO2 max and FTP?",
        answer:
          "VO2 max is the maximum rate your body can use oxygen — the ceiling on your aerobic engine. FTP is the sustainable power you can hold near your lactate threshold, which sits below that ceiling. You can raise FTP toward your VO2 max; raising the ceiling itself is harder.",
      },
      {
        question: "How do you measure VO2 max accurately?",
        answer:
          "The gold standard is a lab test with a mask measuring oxygen uptake during a ramp to exhaustion. Watches and head units estimate it from heart rate and power, which is convenient but approximate — useful as a trend, not a precise figure.",
      },
      {
        question: "Why is VO2 max measured per kilogram of body weight?",
        answer:
          "Because cycling performance, especially climbing, depends on power relative to weight. Expressing oxygen use as ml/kg/min makes it comparable across riders of different sizes, the same way power-to-weight does for FTP.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "How Do I Increase My VO2 Max?", href: "/answers/how-to-increase-vo2-max-cycling" },
      { label: "What Is a Good VO2 Max for a Cyclist?", href: "/answers/what-is-a-good-vo2-max-cyclist" },
      { label: "What Is Lactate Threshold in Cycling?", href: "/answers/what-is-lactate-threshold-cycling" },
      { label: "What Is FTP and Why Does It Matter?", href: "/answers/what-is-ftp" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "VO2 max as the aerobic ceiling and its relationship to FTP/lactate threshold are well-established physiology; trainability and the limits of wearable estimates reflect current consensus and Roadman coaching practice.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },

  // ============================================================
  // WHAT IS TEMPO TRAINING
  // ============================================================
  {
    slug: "what-is-tempo-training-cycling",
    cluster: "zone2",
    question: "What Is Tempo Training in Cycling?",
    seoTitle: "What Is Tempo Training in Cycling? Zone 3 Explained",
    seoDescription:
      "Tempo is the steady, moderately hard effort that sits between endurance and threshold — Zone 3. What it is, when it helps, and why it's so easy to overuse.",
    pillar: "coaching",
    directAnswer:
      "Tempo is a steady, moderately hard riding intensity that sits between easy endurance and threshold — commonly called Zone 3, roughly 76–90% of FTP. It feels comfortably hard: you can still talk, but only in short phrases, and you couldn't hold a conversation. Tempo builds aerobic strength and muscular endurance and is useful in measured doses, but because it sits in the grey zone between the two lactate thresholds, it's also the intensity amateurs most often overuse.",
    keyTakeaways: [
      "Tempo is Zone 3 — steady and moderately hard, between endurance and threshold (~76–90% of FTP).",
      "It feels comfortably hard: short phrases, not full conversation.",
      "Used deliberately, it builds muscular endurance and aerobic strength.",
      "It's the classic grey-zone trap: easy to default to, costly in fatigue if it crowds out easy and hard work.",
    ],
    whoFor: [
      {
        label: "The rider building muscular endurance",
        detail:
          "You're preparing for long, steady efforts — sportives, long climbs, time trials — where holding a firm pace for hours matters.",
      },
      {
        label: "The time-crunched cyclist",
        detail:
          "You have limited hours and want to know where tempo really helps and where it quietly sabotages your week.",
      },
    ],
    roadmanView: [
      "Tempo is the most seductive intensity in cycling. It feels like real work without the suffering of threshold, so it's where riders drift when left to their own devices — fast enough to feel productive, not so hard it hurts. That's exactly the problem. Tempo lives in the grey zone between your two lactate thresholds, and a week built around it accumulates fatigue without much of the adaptation that easy or hard work delivers.",
      "That doesn't make it useless. Used on purpose, tempo builds muscular endurance and trains you to hold a firm, steady pace — truly valuable for sportives, long climbs and time-trial efforts where the demand is sustained rather than spiky. The key word is on purpose. Tempo should be a chosen tool for a specific job, not the default setting your rides slide into.",
      "Inside the Method we use tempo deliberately and sparingly, usually in a block aimed at sustained-power events, and we guard against it leaking into the easy days. The discipline is the same one polarised training teaches: if tempo is crowding out your truly-easy volume and your properly-hard sessions, it's working against you. Choose it, don't default to it.",
    ],
    expertEvidence: [
      {
        name: "Prof. Stephen Seiler",
        credential: "Exercise physiologist, originator of the polarised-training framework",
        insight:
          "Seiler's central warning to amateurs is about exactly this band: the comfortably-hard middle that feels productive and quietly limits progress. Tempo has a place as a deliberate, specific stimulus — but defaulting to it is the grey-zone pattern that polarised training is designed to break.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Use tempo for a specific job",
        detail:
          "Reach for tempo when you're building toward sustained efforts — long climbs, sportives, time trials. Block it deliberately rather than sprinkling it through every ride.",
      },
      {
        title: "Hold it truly steady",
        detail:
          "Tempo is about control: a firm, even effort you can hold for 20–60 minutes, not a surging grind. If it keeps creeping toward threshold, you've left the zone.",
      },
      {
        title: "Protect your easy and hard days",
        detail:
          "Make sure tempo isn't eating into truly-easy volume or your hard sessions. If your week is mostly tempo, you're in the grey zone — pull it back to the edges.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Letting every ride drift into tempo.",
        fix:
          "Tempo is the default amateurs fall into. Make easy rides easy and hard rides hard, and use tempo only as a chosen, specific stimulus.",
      },
      {
        mistake: "Confusing tempo with threshold.",
        fix:
          "Tempo is comfortably hard and sustainable for a long while; threshold is hard and time-limited. Riding tempo at threshold effort just adds fatigue without the benefit of either.",
      },
    ],
    faq: [
      {
        question: "What power is tempo in cycling?",
        answer:
          "Tempo is commonly defined as roughly 76–90% of your FTP — Zone 3 in a typical seven-zone model. It sits above endurance and below threshold. Set it from a current FTP, and retest as your fitness changes.",
      },
      {
        question: "What does tempo feel like?",
        answer:
          "Comfortably hard. Your breathing is deeper and steadier than on an easy ride, you can speak in short phrases but not hold a flowing conversation, and you could sustain the effort for a good while but not all day.",
      },
      {
        question: "Is tempo training good or bad?",
        answer:
          "Both, depending on how it's used. As a deliberate tool for building muscular endurance and sustained power, it's valuable. As the default intensity your rides drift into, it's the grey-zone trap — fatiguing without much adaptation.",
      },
      {
        question: "What's the difference between tempo and sweet spot?",
        answer:
          "Sweet spot sits just above tempo, around 88–94% of FTP — the top end of tempo into the bottom of threshold. Tempo is a touch easier and more sustainable; sweet spot is a more time-efficient, higher-stress stimulus closer to threshold.",
      },
      {
        question: "How often should I do tempo training?",
        answer:
          "Sparingly and on purpose, usually within a block aimed at sustained-effort events. The exact frequency depends on your goals, but it should never crowd out your easy volume or your properly hard sessions.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "Polarised or Sweet Spot: Which Is Better?", href: "/answers/polarised-vs-sweet-spot" },
      { label: "What Is Polarised Training for Cyclists?", href: "/blog/polarised-training-cycling-complete-guide" },
      { label: "What Is Zone 2 Training?", href: "/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe" },
      {
        label: "80/20 Training and the Grey-Zone Trap",
        href: "/blog/80-20-cycling-training-the-grey-zone-trap",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Tempo as Zone 3 and its place between the lactate thresholds are standard training-zone definitions; the grey-zone caution reflects Stephen Seiler's on-the-record position and Roadman coaching practice.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
  },
];
