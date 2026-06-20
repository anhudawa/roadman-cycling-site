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
      "Lactate threshold is the single most useful idea in endurance training, and it's quietly misunderstood because most riders think there's one threshold. There are two. LT1 is the top of genuinely easy — the intensity where lactate first lifts off baseline. LT2 is the ceiling — where it runs away from you and the effort has a short fuse. Everything you read about zones is really a story about where these two lines fall.",
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
          "LT1 is the first lift in blood lactate above resting levels — the top of genuinely easy, aerobic riding. LT2 (often called the anaerobic or second threshold) is where lactate rises steeply and the effort becomes unsustainable. LT2 is close to your FTP; LT1 sits well below it.",
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
      { label: "What Is Zone 2 Training?", href: "/answers/what-is-zone-2-training" },
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
  // WHAT IS POLARISED TRAINING
  // ============================================================
  {
    slug: "what-is-polarised-training",
    cluster: "periodisation",
    question: "What Is Polarised Training for Cyclists?",
    seoTitle: "What Is Polarised Training for Cyclists? The 80/20 Model Explained",
    seoDescription:
      "Polarised training means riding most of your volume easy and a small share genuinely hard, with little in between. What the 80/20 split means and why it works.",
    pillar: "coaching",
    directAnswer:
      "Polarised training is an intensity distribution: roughly 80% of your riding is done easy, below the first lactate threshold, and roughly 20% is done genuinely hard, at or above the second threshold — with very little time spent in the comfortably-hard middle. The idea, formalised by physiologist Stephen Seiler from how elite endurance athletes actually train, is that easy volume builds the aerobic base cheaply while a small dose of hard work drives the high-end adaptations, and the grey-zone middle is rationed because it costs a lot of fatigue for modest return.",
    keyTakeaways: [
      "Polarised means easy days truly easy, hard days truly hard, and very little in between.",
      "The headline split is about 80% low intensity, 20% high — measured by time or sessions.",
      "It's how most elite endurance athletes train, mapped onto amateur weeks by Stephen Seiler.",
      "The enemy is the grey zone: comfortably-hard riding that accumulates fatigue without much adaptation.",
    ],
    whoFor: [
      {
        label: "The time-pressed amateur stuck on a plateau",
        detail:
          "You train hard most days, you're always a bit tired, and your numbers have stopped moving. Polarised is usually the fix.",
      },
      {
        label: "The rider who rides every group ride flat out",
        detail:
          "Your easy rides aren't easy and your hard rides aren't hard. Polarising the week separates them again.",
      },
    ],
    roadmanView: [
      "Polarised training is the model that quietly fixes more amateur plateaus than any single session ever will. The instinct, especially when time is short, is to make every ride count by riding it hard. The result is a week of comfortably-hard rides — the grey zone — that leaves you permanently a little fatigued and adapting to none of it well.",
      "The polarised answer is counterintuitive: ride easy more often than feels productive, and when you do go hard, go genuinely hard. The easy volume is where the aerobic engine is built, and it's cheap — it barely costs you recovery, so you can stack a lot of it. The hard 20% is where the ceiling moves, but it only works if you arrive fresh enough to hit it properly, which the easy days protect.",
      "This is the spine of how we structure Method weeks. It isn't a magic ratio to obsess over to the decimal — the principle is what matters. Most of your time below the first threshold, a deliberate minority above the second, and a ruthless avoidance of the middle. The riders who get this right stop being tired all the time and start getting faster, often without adding a single hour.",
    ],
    expertEvidence: [
      {
        name: "Prof. Stephen Seiler",
        credential: "Exercise physiologist who formalised the polarised-training model",
        insight:
          "Seiler's research showed elite endurance athletes converge on a roughly 80/20 distribution — the large majority of training easy, a deliberate minority hard — and that amateurs sabotage themselves by living in the comfortably-hard middle. Easy has to be easy for the model to work; that's the discipline most riders skip.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Count your week by intensity",
        detail:
          "Look at the last fortnight. If most of your sessions are comfortably hard rather than clearly easy or clearly hard, you're riding the grey zone. That's the first thing to fix.",
      },
      {
        title: "Make easy genuinely easy",
        detail:
          "Cap your endurance rides below the first lactate threshold — conversational, controlled, sometimes frustratingly slow. This is the half of polarised that amateurs get wrong.",
      },
      {
        title: "Make hard genuinely hard",
        detail:
          "When a session is meant to be hard, commit to it: threshold, VO2 or sprint work done properly. A handful of these a week, ridden fresh, do the heavy lifting.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Riding the 'easy' 80% too hard.",
        fix:
          "If your easy rides need recovery, they aren't easy. Slow them down until they're truly below the first threshold — that's what frees you to hit the hard sessions.",
      },
      {
        mistake: "Obsessing over the exact 80/20 ratio.",
        fix:
          "The number is a guide, not a law. The principle — most easy, some hard, little in between — is what delivers the result, whatever your precise split.",
      },
    ],
    faq: [
      {
        question: "What does the 80/20 in polarised training mean?",
        answer:
          "Roughly 80% of your training time or sessions are done at low intensity, below the first lactate threshold, and roughly 20% at high intensity, at or above the second threshold. The split is a guide to intensity distribution, not a rigid prescription.",
      },
      {
        question: "Is polarised training better than sweet spot?",
        answer:
          "It depends on your time and goals. Polarised tends to suit riders with enough hours to accumulate easy volume and a need to protect freshness for hard work. Sweet spot can be more time-efficient for short blocks. Many riders use both across a season.",
      },
      {
        question: "How do I ride the easy part of polarised?",
        answer:
          "Keep it below your first lactate threshold (LT1) — conversational, nose-breathing, a pace you could sustain for hours. It should feel almost too easy. That restraint is what lets the hard sessions land.",
      },
      {
        question: "Does polarised training work for time-limited cyclists?",
        answer:
          "Yes, but the ratio flexes. With very few hours, a slightly higher share of intensity can make sense. The core lesson still holds: separate easy from hard and stop living in the grey middle, even on a tight schedule.",
      },
      {
        question: "What is the grey zone in polarised training?",
        answer:
          "The grey zone is the comfortably-hard intensity between the two lactate thresholds — harder than easy, easier than threshold. It accumulates fatigue without delivering much adaptation, which is why polarised training deliberately minimises it.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "Polarised or Sweet Spot: Which Is Better?", href: "/answers/polarised-vs-sweet-spot" },
      { label: "Polarised or Pyramidal: Which Should I Use?", href: "/answers/polarised-or-pyramidal-training" },
      { label: "What Is Zone 2 Training?", href: "/answers/what-is-zone-2-training" },
      {
        label: "Polarised Training: The Complete Guide",
        href: "/blog/polarised-training-cycling-complete-guide",
      },
      {
        label: "80/20 Training and the Grey-Zone Trap",
        href: "/blog/80-20-cycling-training-the-grey-zone-trap",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "The polarised model and the 80/20 distribution are well-supported in endurance-training research; framing reflects Stephen Seiler's on-the-record work and his Roadman podcast appearances.",
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
      "HRV is the variation in time between heartbeats — a window into how recovered your nervous system is. What it measures, what the trend tells you, and how to use it.",
    pillar: "recovery",
    directAnswer:
      "Heart rate variability (HRV) is the variation in the time interval between consecutive heartbeats. A recovered, well-rested body under low stress tends to show higher variability; fatigue, illness, poor sleep and accumulated training load tend to suppress it. For cyclists, HRV is a daily window into how well the autonomic nervous system has recovered — read as a personal trend over time, not as a single number to compare against anyone else.",
    keyTakeaways: [
      "HRV measures the tiny beat-to-beat differences in your heart rhythm, not your heart rate.",
      "Higher and stable usually signals recovery; a suppressed reading signals stress or fatigue.",
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
          "Recovery slows with age, and HRV gives you an early warning when load is outrunning your ability to absorb it.",
      },
    ],
    roadmanView: [
      "HRV is one of the few consumer recovery metrics with real physiology behind it, and it's also one of the easiest to misuse. The number reflects the balance of your autonomic nervous system — the push and pull between stress and recovery. When you're rested, that balance shows up as more variation between beats. When you're buried, ill, under-slept or stressed at work, the variation collapses.",
      "The mistake is reading a single morning number like a school grade. HRV is noisy day to day, it's deeply individual, and absolute values mean almost nothing across people. What it's genuinely good for is the trend against your own baseline: a reading that's drifted down and stayed there for several days, while training and life stress pile up, is the signal worth acting on.",
      "Where it earns its place is as a tie-breaker. On a morning when your legs feel flat and your HRV has dropped, that's two votes for an easier day. When the two disagree, trust how you feel over the gadget — HRV informs the decision, it doesn't make it. Used that way, it's a useful early-warning system, especially for older riders whose recovery margin is thinner.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Co-founder of TrainingPeaks, author of The Cyclist's Training Bible",
        insight:
          "Friel has long advocated using HRV trends — not single readings — to guide how hard to train, easing off when the autonomic signal is suppressed and pushing when it's stable. The value is in letting an objective recovery marker inform the week's intensity rather than training blind to it.",
        guestSlug: "joe-friel",
      },
    ],
    practicalApplication: [
      {
        title: "Measure at the same time, the same way",
        detail:
          "Take your reading first thing each morning, in the same position, before caffeine. Consistency is what turns a noisy number into a usable baseline.",
      },
      {
        title: "Read the trend, not the day",
        detail:
          "Ignore single-day swings. Watch the rolling baseline: a sustained drop across several days, alongside hard training or life stress, is the meaningful signal.",
      },
      {
        title: "Let it inform, not dictate",
        detail:
          "Use a suppressed HRV as a prompt to consider an easier day, then weigh it against how you actually feel. When they agree, act. When they don't, trust your body.",
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
          "HRV is noisy day to day. Act on a sustained trend across several days, not on one low number after a bad night's sleep.",
      },
    ],
    faq: [
      {
        question: "What is a good HRV for a cyclist?",
        answer:
          "There's no universal good number — HRV is highly individual and depends on age, genetics and measurement method. What matters is your personal baseline and its trend: stable or rising relative to your own norm is the encouraging sign, not a particular value.",
      },
      {
        question: "How do I measure HRV?",
        answer:
          "Most riders use a chest strap or a wearable with a dedicated app, taking a short reading at the same time each morning. Measuring under consistent conditions — same time, same position, before caffeine — is what makes the data usable.",
      },
      {
        question: "Does HRV go up or down when I'm fatigued?",
        answer:
          "It usually drops. Fatigue, illness, poor sleep and high stress suppress heart rate variability as the nervous system shifts toward a stressed state. A sustained fall is a common early sign that load is outrunning recovery.",
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
      "HRV's link to autonomic recovery is well-established; its day-to-day predictive value for individual training decisions is supported but noisier, so framing emphasises trend over single readings.",
    publishDate: "2026-06-20",
    updatedDate: "2026-06-20",
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
          "In the polarised model, VO2-level work is the deliberate hard minority that drives high-end adaptation — effective precisely because it's rationed and ridden fresh. The ceiling is raised by a small, well-placed dose of genuinely hard riding sitting on top of a large aerobic base, not by grinding the comfortably-hard middle.",
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
          "You have limited hours and want to know where tempo genuinely helps and where it quietly sabotages your week.",
      },
    ],
    roadmanView: [
      "Tempo is the most seductive intensity in cycling. It feels like real work without the suffering of threshold, so it's where riders drift when left to their own devices — fast enough to feel productive, not so hard it hurts. That's exactly the problem. Tempo lives in the grey zone between your two lactate thresholds, and a week built around it accumulates fatigue without much of the adaptation that easy or hard work delivers.",
      "That doesn't make it useless. Used on purpose, tempo builds muscular endurance and trains you to hold a firm, steady pace — genuinely valuable for sportives, long climbs and time-trial efforts where the demand is sustained rather than spiky. The key word is on purpose. Tempo should be a chosen tool for a specific job, not the default setting your rides slide into.",
      "Inside the Method we use tempo deliberately and sparingly, usually in a block aimed at sustained-power events, and we guard against it leaking into the easy days. The discipline is the same one polarised training teaches: if tempo is crowding out your truly-easy volume and your genuinely-hard sessions, it's working against you. Choose it, don't default to it.",
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
        title: "Hold it genuinely steady",
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
          "Sparingly and on purpose, usually within a block aimed at sustained-effort events. The exact frequency depends on your goals, but it should never crowd out your easy volume or your genuinely hard sessions.",
      },
    ],
    relatedEpisodes: [
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "Polarised or Sweet Spot: Which Is Better?", href: "/answers/polarised-vs-sweet-spot" },
      { label: "What Is Polarised Training for Cyclists?", href: "/answers/what-is-polarised-training" },
      { label: "What Is Zone 2 Training?", href: "/answers/what-is-zone-2-training" },
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
