import type { AnswerPage } from "@/lib/answers";

const FTP_TEST_OWNER = "ftp-test-guide";

/**
 * Replaces the legacy FTP-test copy with the reviewed search owner while
 * preserving the established URL and the surrounding answer-page registry.
 */
export function applyFtpTestTrustOverride(answer: AnswerPage): AnswerPage {
  if (answer.slug !== FTP_TEST_OWNER) return answer;

  return {
    ...answer,
    question: "Which FTP Test Should a Cyclist Use?",
    seoTitle: "FTP Test: Protocols, Accuracy & How to Choose",
    seoDescription:
      "Choose an FTP test by comparing sustained, 20-minute, ramp and modelled methods. Learn their limits, how to repeat a test and when results disagree.",
    directAnswer:
      "An FTP test estimates threshold power; no protocol is exact for every cyclist. A sustained 45–60-minute effort is close to the FTP construct but demanding, a 20-minute test commonly uses a 95% estimate, and ramp or modelled tests use platform-specific equations. Choose one suitable method, record it with the result, and repeat the same equipment, preparation and conditions before calling a change fitness.",
    keyTakeaways: [
      "A test result is method-specific: sustained, 20-minute, ramp and modelled estimates are not automatically interchangeable.",
      "The common 20-minute × 0.95 conversion is an estimate with individual error, not a universal physiological law.",
      "Power source, calibration, cooling, preparation and pacing can change the result independently of fitness.",
      "Use the FTP test calculator only to apply a stated equation; use this guide to choose and interpret the protocol.",
    ],
    whoFor: [
      {
        label: "The rider choosing a first test",
        detail:
          "You need to understand the trade-off between a sustained effort, 20-minute field test, ramp test and modelled estimate.",
      },
      {
        label: "The rider with conflicting results",
        detail:
          "Two platforms or protocols produced different values and you need to decide what can be compared honestly.",
      },
      {
        label: "The self-coached rider resetting zones",
        detail:
          "You want a repeatable result before changing every power target in the training week.",
      },
    ],
    roadmanView: [
      "The useful FTP test is the one the rider can execute safely, pace appropriately and repeat under comparable conditions. Protocol loyalty does not make an estimate physiologically exact, but it makes the trend more interpretable.",
      "A 20-minute result multiplied by 0.95 is a common field estimate. Published reviews support repeatability while also reporting individual disagreement with laboratory threshold markers. Roadman therefore labels the output as estimated FTP and keeps the equation beside the result.",
      "When a ramp test, a 20-minute test and recent long-duration performance disagree, do not average them into a more scientific-looking number. Check the power source, protocol, cooling, pacing and recent maximal-effort data, then choose the value that best fits the same method and the sessions it will prescribe.",
    ],
    expertEvidence: [
      {
        name: "Andrew Coggan",
        credential: "Exercise physiologist; originator of the FTP framework",
        insight:
          "Coggan's published TrainingPeaks guidance treats threshold power as a practical performance estimate and recommends deriving it from appropriate recent efforts rather than presenting one short-test equation as exact for every rider.",
      },
      {
        name: "British Cycling",
        credential: "National governing body coaching guidance",
        insight:
          "British Cycling publishes a distinct field protocol and uses the result to organise power-based intensity. The existence of different accepted protocols is a reason to preserve the method name when comparing results.",
      },
    ],
    practicalApplication: [
      {
        title: "Choose the method for the rider",
        detail:
          "Use a sustained effort when pacing skill and a suitable route or race file exist; use a repeatable 20-minute or ramp protocol when practicality matters; use modelled detection only when recent data contain representative hard efforts.",
      },
      {
        title: "Standardise the comparison",
        detail:
          "Keep the power source, calibration routine, warm-up, trainer mode or route, cooling and preparation as similar as practical. Record anything that materially changed.",
      },
      {
        title: "Check the result against riding",
        detail:
          "Review recent long efforts and the first threshold sessions. A surprising result deserves confirmation; it should not automatically reset every zone.",
      },
      {
        title: "Send each next task to its owner",
        detail:
          "Use the calculator to apply a declared conversion, the 20-minute and ramp answers for protocol detail, and the timing guide for when another test is worth the fatigue cost.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Comparing different protocols as a clean fitness trend.",
        fix: "Keep the test name attached to each number and compare like with like before attributing the difference to training.",
      },
      {
        mistake: "Treating 95% or 75% as an individual truth.",
        fix: "Call the output an estimate, preserve the platform or protocol equation and cross-check it against representative performance.",
      },
      {
        mistake: "Ignoring measurement and environmental changes.",
        fix: "Check calibration, device consistency, temperature, cooling, terrain and preparation before accepting a large jump or drop.",
      },
    ],
    faq: [
      {
        question: "What is the best FTP test for cycling?",
        answer:
          "There is no universally best protocol. A sustained 45–60-minute effort is close to the FTP construct but difficult to pace; a 20-minute test is practical but uses an estimated conversion; ramp and modelled tests are convenient but depend on platform-specific methods. Choose the protocol you can execute and repeat consistently.",
      },
      {
        question: "How do I calculate FTP from a 20-minute test?",
        answer:
          "A common method multiplies average 20-minute power by 0.95. That gives an estimated FTP, not a guaranteed one-hour value or laboratory threshold. Use the same warm-up, power source and protocol when tracking change, and keep the 95% method recorded with the result.",
      },
      {
        question: "Is a ramp test or 20-minute FTP test more accurate?",
        answer:
          "Neither wins for every rider. Ramp estimates can be influenced by anaerobic contribution and the platform's equation, while a 20-minute result depends heavily on pacing and the individual relationship between 20-minute and longer-duration power. Repeatability for the rider matters more than declaring one universal winner.",
      },
      {
        question: "Does FTP always equal one-hour power?",
        answer:
          "No. One-hour power is a useful shorthand, but published research reports substantial variation in how long riders can sustain a measured FTP. Record time-to-exhaustion or the wider power-duration curve when the event requires more context than one threshold estimate.",
      },
      {
        question: "How often should cyclists repeat an FTP test?",
        answer:
          "Retest when the current value appears stale, after a meaningful training block, or when repeatable workouts show the zones no longer fit. No fixed calendar interval suits every rider. The timing guide covers fatigue, block placement and alternatives to formal testing.",
      },
      {
        question: "Why did two FTP tests give different results?",
        answer:
          "Different equations, pacing demands, anaerobic contribution, power meters, calibration, cooling, fatigue and fuelling can all change the result. First identify which variables changed; then repeat one method under comparable conditions before interpreting the gap as fitness.",
      },
    ],
    relatedEpisodes: [],
    relatedTopics: [
      {
        label: "FTP Test Result Calculator",
        href: "/tools/ftp-test",
        description: "Apply the stated equation to a completed test result.",
      },
      {
        label: "20-Minute FTP Test Protocol",
        href: "/answers/20-minute-ftp-test",
        description: "The specific pacing and calculation answer.",
      },
      {
        label: "Ramp Test Protocol",
        href: "/answers/how-to-do-a-ramp-test",
        description: "How ramp testing works and where estimates can differ.",
      },
      {
        label: "When to Test FTP",
        href: "/blog/when-to-test-ftp-cycling",
        description: "Timing, fatigue cost and alternatives to formal testing.",
      },
      {
        label: "FTP in Cycling",
        href: "/topics/ftp-training",
        description: "The canonical definition, zones and evidence limits.",
      },
    ],
    sources: [
      {
        name: "TrainingPeaks — How to Calculate Threshold Values",
        url: "https://help.trainingpeaks.com/hc/en-us/articles/204071934-How-to-Calculate-Threshold-Values-for-Power-Heart-Rate-or-Pace",
        publisher: "TrainingPeaks",
        note: "Common 20-minute estimate and recent 45–60-minute power guidance.",
      },
      {
        name: "Andrew Coggan — What Is Threshold Power?",
        url: "https://www.trainingpeaks.com/learn/articles/what-is-threshold-power/",
        publisher: "TrainingPeaks",
        note: "Operational threshold-power definition and performance-based assessment.",
      },
      {
        name: "British Cycling — Understanding Intensity: Power",
        url: "https://www.britishcycling.org.uk/knowledge/training/get-started/article/izn20140820-Training-Understanding-Intensity-3--Power-0",
        publisher: "British Cycling",
        note: "An official alternative field-test protocol and zone application.",
      },
      {
        name: "Functional Threshold Power Field Tests — Scoping Review",
        url: "https://pubmed.ncbi.nlm.nih.gov/34304689/",
        publisher: "Sports Medicine",
        note: "Reliability, validity, participant and agreement limits across FTP field tests.",
      },
      {
        name: "Cycling Power Meter Validity — Systematic Review",
        url: "https://pubmed.ncbi.nlm.nih.gov/35009945/",
        publisher: "Sports Medicine",
        note: "Device and condition effects on power-measurement validity and reproducibility.",
      },
      {
        name: "Time to Exhaustion at FTP",
        url: "https://pubmed.ncbi.nlm.nih.gov/35835698/",
        publisher: "International Journal of Sports Physiology and Performance",
        note: "Variation in the duration riders can sustain a measured FTP.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Common field methods can be repeatable, but agreement with physiological thresholds and between protocols has individual limits. Most published samples are small and male-dominated.",
    updatedDate: "2026-08-26",
    reviewedBy: "Anthony Walsh",
  };
}
