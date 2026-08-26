import type { AnswerPage } from "@/lib/answers";

const THRESHOLD_INTERVALS_OWNER = "threshold-intervals-guide";

/**
 * Rebuilds the established Search Console owner for threshold-interval intent.
 * The legacy source is retained in ftp.ts so the override is easy to audit and
 * can be removed without changing the wider answer registry.
 */
export function applyThresholdIntervalsTrustOverride(
  answer: AnswerPage,
): AnswerPage {
  if (answer.slug !== THRESHOLD_INTERVALS_OWNER) return answer;

  return {
    ...answer,
    question: "How Should Cyclists Do Threshold Intervals?",
    seoTitle: "Threshold Intervals Cycling: Workouts & Progression",
    seoDescription:
      "Learn how to pace and progress cycling threshold intervals using FTP, heart rate and RPE, with 3×8, 4×10, 3×12 and 2×20 workout options.",
    directAnswer:
      "Threshold intervals are sustained repeats near an individually validated threshold—not one compulsory 2×20 workout or a universal 95–105% FTP range. Start with repeatable 8–12-minute efforts at a conservative power, recover easily, and stop when power, breathing or technique becomes meaningfully less controlled. Progress total quality time before intensity, and place the session according to the rider’s complete training load and recovery.",
    keyTakeaways: [
      "FTP is a practical estimate, not a guaranteed one-hour power or an exact lactate threshold. Treat its workout percentage as a starting hypothesis and adjust from repeatable execution.",
      "3×8, 4×10, 3×12 and 2×20 are useful ways to divide sustained work. The research does not establish one of them as the universal best threshold workout.",
      "Power, heart rate, breathing and RPE respond on different timelines. Use them together instead of forcing a session from one number.",
      "There is no universal weekly threshold dose. Count races, hard group rides, other interval sessions, illness, sleep and recovery before adding another hard day.",
    ],
    whoFor: [
      {
        label: "The rider starting threshold work",
        detail:
          "You need a scalable first session without turning a published FTP percentage into a pass-or-fail test.",
      },
      {
        label: "The rider who fades late in every interval",
        detail:
          "You can start at the target power but need a better pacing, recovery or threshold-setting decision.",
      },
      {
        label: "The self-coached cyclist building a week",
        detail:
          "You need to place sustained work alongside endurance riding, races and other demanding sessions.",
      },
    ],
    roadmanView: [
      "The threshold session is practice, not an FTP test disguised as training. A clean set at the lower end of a useful range gives a coach more information than an aggressive first interval followed by survival riding.",
      "Roadman uses the shortest repeat that lets the rider accumulate controlled work for the session’s job. That may be 3×8 for a rider learning the effort, 4×10 or 3×12 during progression, or 2×20 when long continuous work matches the athlete and event. These are coaching formats, not a scientific ranking.",
      "The next-day response belongs in the prescription. If the planned work repeatedly fails, first audit FTP method, recent fatigue, heat, cooling, terrain, fuelling and pacing. Do not automatically add grit or another threshold day.",
    ],
    expertEvidence: [
      {
        name: "Sitko, Cirer-Sastre and López-Laval",
        credential: "Road-cycling threshold-power researchers",
        insight:
          "Their road-cyclist study found substantial variation in time to exhaustion at estimated FTP across performance levels, so one FTP value does not establish one universal interval duration.",
      },
      {
        name: "Dalleck and colleagues",
        credential: "Randomised interval-frequency study authors",
        insight:
          "One and two weekly high-intensity interval sessions both changed lactate-threshold measures in a small group of young, physically active adults. The result supports trainability, but it does not prove a universal dose for trained cyclists.",
      },
      {
        name: "Rosenblat, Perrotta and Vicenzino",
        credential: "Training-intensity-distribution review authors",
        insight:
          "Their review found only four eligible randomised comparisons and favoured polarised over threshold-emphasised distribution for time-trial performance. Threshold work can be useful without making the whole programme threshold-heavy.",
      },
    ],
    practicalApplication: [
      {
        title: "Validate the anchor",
        detail:
          "Keep the FTP test method beside the number and compare it with recent sustained efforts. If the value came from a different device, protocol or environment, do not assume the old percentage still means the same workload.",
      },
      {
        title: "Choose a repeatable first format",
        detail:
          "Start with 3×8 or 3×10 minutes near the lower end of the planned range, separated by easy riding long enough to regain control. The goal is comparable repetitions, not one maximal first effort.",
      },
      {
        title: "Monitor more than watts",
        detail:
          "Record power, RPE, breathing, heart-rate response, cadence and whether technique stayed controlled. Heart rate can lag and drift; power can be mis-set; perceived effort adds context.",
      },
      {
        title: "Progress one variable",
        detail:
          "When every repetition is controlled and recovery is normal, add a few minutes of total work or lengthen the repeats. Do not increase power, duration and weekly frequency together.",
      },
      {
        title: "Place the session in the whole week",
        detail:
          "Count races, hard group rides, VO2max sessions, demanding strength work and other sports as stress. Add threshold work only when the surrounding easy riding and recovery protect its quality.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Treating 2×20 at exactly 100% FTP as the definition of threshold training.",
        fix: "Use 2×20 as one format. Select repeat length and starting intensity from the rider’s validated threshold, experience and ability to keep the efforts comparable.",
      },
      {
        mistake: "Starting above target because the first minutes feel easy.",
        fix: "Hold the conservative target through the early lag in breathing and heart rate. Judge the set by the later repetitions, not minute two.",
      },
      {
        mistake: "Calling every incomplete session a motivation problem.",
        fix: "Audit threshold estimation, accumulated load, sleep, heat, cooling, terrain, carbohydrate availability and illness before changing the prescription.",
      },
      {
        mistake: "Adding another threshold day while other hard riding goes uncounted.",
        fix: "Count every demanding session and race first. Weekly frequency is an outcome of the complete plan, not a fixed internet rule.",
      },
    ],
    faq: [
      {
        question: "What are threshold intervals in cycling?",
        answer:
          "They are sustained work bouts performed near a rider’s individually estimated threshold, separated by easier recovery. FTP, lactate threshold, critical power and ventilatory threshold are related but not interchangeable anchors, so the target should be labelled by method rather than treated as one exact physiological line.",
      },
      {
        question: "Is 2×20 the best threshold workout?",
        answer:
          "No study establishes 2×20 as universally best. It is a practical way to accumulate 40 minutes of sustained work. Shorter formats such as 3×8, 4×10 or 3×12 can be better starting points when they produce more repeatable pacing and a clearer training response.",
      },
      {
        question: "What percentage of FTP should threshold intervals use?",
        answer:
          "A percentage near FTP is a starting range, not a guarantee. FTP protocol, time to exhaustion, training state, altitude, heat and measurement error all matter. Start conservatively, compare power with breathing and RPE, and adjust when the planned duration is not repeatable.",
      },
      {
        question: "How many threshold sessions should a cyclist do per week?",
        answer:
          "There is no universal number. Some riders may use one dedicated session; a coached block may sometimes use two. Races, hard group rides and other intervals already count as demanding work, and the right dose depends on training history, total load, recovery and the event goal.",
      },
      {
        question: "How long should a threshold interval be?",
        answer:
          "Useful repetitions often last about 8–20 minutes, but the correct duration is the one that lets the rider accumulate controlled work near the intended anchor. Begin with shorter repeats, then extend total quality time before assuming more power is required.",
      },
      {
        question: "Should I use power, heart rate or RPE for threshold intervals?",
        answer:
          "Use all available signals. Power describes external work, heart rate describes a delayed internal response, and RPE plus breathing describe how the effort is experienced. Heat, fatigue, altitude and device error can separate them, so disagreement is information rather than a reason to force one metric.",
      },
      {
        question: "Why can’t I complete threshold intervals at my FTP?",
        answer:
          "The FTP estimate may be high for your sustainable duration, or fatigue, heat, cooling, fuelling, terrain, pacing or illness may have changed the session. Check those variables and repeat a conservative format before treating one failure as lost fitness.",
      },
      {
        question: "How should I progress threshold intervals?",
        answer:
          "Change one variable at a time. First make the repetitions even, then add a small amount of total work or lengthen the bouts. Increase intensity only after the existing session is repeatable and the rider’s normal recovery remains intact.",
      },
    ],
    relatedEpisodes: [
      "ep-2540-secret-to-improving-threshold-dose-frequency-duration",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2026-ftp-jumped-30-watts-after-this-workout",
    ],
    relatedTopics: [
      {
        label: "FTP Training — Definition and Task Map",
        href: "/topics/ftp-training",
        description:
          "Understand FTP methods, limits, zones and the correct owner for each FTP question.",
      },
      {
        label: "FTP Zone Calculator",
        href: "/tools/ftp-zones",
        description:
          "Calculate conventional power bands while keeping the method limits visible.",
      },
      {
        label: "Improve Threshold Power",
        href: "/answers/improve-threshold-power",
        description:
          "Diagnose the wider training changes that can move sustainable power.",
      },
      {
        label: "Threshold, LT1, LT2 and MLSS",
        href: "/blog/cycling-threshold-power-explained-guide",
        description:
          "Separate the common threshold terms and understand where they disagree.",
      },
      {
        label: "Sweet Spot vs Threshold",
        href: "/compare/sweet-spot-vs-threshold",
        description:
          "Choose between sub-threshold and threshold-specific session jobs.",
      },
      {
        label: "Cycling Interval Training",
        href: "/blog/cycling-interval-training-beginners",
        description:
          "The broad beginner guide to interval structure, monitoring and progression.",
      },
    ],
    sources: [
      {
        name: "Time to Exhaustion at Estimated FTP in Road Cyclists",
        url: "https://pubmed.ncbi.nlm.nih.gov/35835698/",
        publisher: "Journal of Science and Medicine in Sport",
        note: "Performance-level differences and individual variability in time to exhaustion at estimated FTP.",
      },
      {
        name: "Functional Threshold Power Field Tests — Scoping Review",
        url: "https://pubmed.ncbi.nlm.nih.gov/34304689/",
        publisher: "Sports",
        note: "Validity, reliability and population limits of common cycling FTP field methods.",
      },
      {
        name: "FTP and Critical Power Comparison",
        url: "https://pubmed.ncbi.nlm.nih.gov/33551839/",
        publisher: "International Journal of Sports Physiology and Performance",
        note: "Evidence that FTP and critical power should not be treated as interchangeable individual anchors.",
      },
      {
        name: "Interval Frequency and Lactate-Threshold Response",
        url: "https://pubmed.ncbi.nlm.nih.gov/20535658/",
        publisher: "International Journal of Sports Medicine",
        note: "A small randomised comparison of one versus two weekly interval sessions in physically active adults.",
      },
      {
        name: "Polarised vs Threshold Training Distribution",
        url: "https://pubmed.ncbi.nlm.nih.gov/29863593/",
        publisher: "Journal of Strength and Conditioning Research",
        note: "A review of the limited randomised evidence comparing complete training-intensity distributions.",
      },
      {
        name: "Training-Intensity Distribution in Road Cyclists",
        url: "https://pubmed.ncbi.nlm.nih.gov/28253026/",
        publisher: "International Journal of Sports Physiology and Performance",
        note: "Demonstrates that power, heart rate and RPE classify the same training differently.",
      },
      {
        name: "Maximal Lactate Steady State in Elite Endurance Athletes",
        url: "https://pubmed.ncbi.nlm.nih.gov/9504136/",
        publisher: "Japanese Journal of Physiology",
        note: "Reports large individual variation in lactate concentration during prolonged cycling performance.",
      },
      {
        name: "Altitude and Maximal Lactate Steady State in Cyclists",
        url: "https://pubmed.ncbi.nlm.nih.gov/42051616/",
        publisher: "Journal of Human Kinetics",
        note: "Shows that environmental context can materially alter sustainable work rate while heart rate behaves differently.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Threshold power is trainable, but direct evidence does not establish one universal interval format, FTP percentage or weekly frequency. Roadman’s progression is a coaching framework bounded by FTP-method, monitoring and training-distribution research.",
    updatedDate: "2026-08-26",
    reviewedBy: "Anthony Walsh",
  };
}
