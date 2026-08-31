import type { AnswerPage } from "@/lib/answers";

const CREATINE_OWNER = "should-cyclists-take-creatine";

/**
 * Rebuilds the high-AI-impression creatine answer around the distinction
 * between direct endurance evidence, mixed-sport evidence, resistance-
 * training evidence, and Roadman's one-person experiment.
 */
export function applyCreatineTrustOverride(answer: AnswerPage): AnswerPage {
  if (answer.slug !== CREATINE_OWNER) return answer;

  return {
    ...answer,
    seoTitle: "Should Cyclists Take Creatine? Evidence & Trade-Offs",
    seoDescription:
      "Creatine for cyclists: where evidence supports strength and repeated high-intensity work, where endurance data do not, dosing options and weight trade-offs.",
    directAnswer:
      "Creatine monohydrate is optional, not a blanket requirement. It is most defensible for cyclists who also lift or whose racing includes repeated sprints; pooled trained-endurance data show no improvement in endurance performance. A simple maintenance option is 3–5 g/day, and loading is faster but not required. Body mass can rise and response varies. Masters evidence comes mainly from older adults doing resistance training, not masters cyclists specifically.",
    keyTakeaways: [
      "A 2023 meta-analysis of 13 trained-endurance studies found no pooled endurance-performance benefit from creatine monohydrate.",
      "A 2026 scoping review found the most plausible endurance-sport use in repeated sprints, surges and power-endurance tasks, but results and recovery markers were inconsistent.",
      "Creatine plus resistance training improves strength and lean-mass outcomes across adult and older-adult meta-analyses; that is indirect evidence for cyclists who lift, not proof of faster cycling.",
      "Creatine monohydrate is the studied form. A 3–5 g/day maintenance approach avoids a loading phase; loading reaches saturation sooner but is not compulsory.",
      "Body mass may increase, commonly through water associated with higher muscle creatine. Measure your own response before a weight-sensitive event.",
    ],
    whoFor: [
      {
        label: "The cyclist who strength trains",
        detail:
          "You want to judge a well-supported resistance-training aid without pretending it directly raises FTP or steady-state endurance.",
      },
      {
        label: "The sprint, track or repeated-surge rider",
        detail:
          "Your event repeatedly calls for brief high-power work and you can test whether any benefit outweighs a body-mass change.",
      },
      {
        label: "The masters rider checking an age claim",
        detail:
          "You want the older-adult resistance-training evidence separated from claims made specifically about cyclists over 40.",
      },
    ],
    roadmanView: [
      "Start with the job. Creatine is a poor answer to 'how do I raise steady endurance?' and a more defensible answer to 'how do I support a real strength programme or repeated high-power work?' The supplement should match the demand, not the fashion cycle.",
      "The masters case needs an honest boundary. Meta-analyses in older adults support creatine alongside resistance training, but their participants were generally much older than 40 and were not a cycling-performance cohort. Roadman sees that as a reason to consider and test creatine while lifting—not evidence that every rider past a birthday should take it.",
      "Anthony's 30-day experiment is useful first-party reporting, not a controlled trial. It can show his protocol, measurements and trade-off; it cannot predict your response. Keep the personal data beside the larger evidence instead of using one to impersonate the other.",
    ],
    expertEvidence: [
      {
        name: "Fernández-Landa and colleagues",
        credential: "2023 trained-endurance systematic review and meta-analysis",
        insight:
          "Across 13 placebo-controlled studies, the pooled change in trained endurance performance was not significant. This is the strongest direct boundary against selling creatine as a general endurance enhancer.",
      },
      {
        name: "Wesołowski and colleagues",
        credential: "2026 endurance and mixed-sport scoping-review authors",
        insight:
          "The mapped evidence was most favourable in selected repeated-sprint and high-intensity contexts. Aerobic, recovery and body-composition findings were limited or inconsistent, and not every favourable change beat placebo.",
      },
      {
        name: "Chilibeck and colleagues",
        credential: "Older-adult resistance-training meta-analysis authors",
        insight:
          "Creatine added to resistance training improved pooled lean-tissue and strength outcomes in 22 studies involving 721 older adults. The mean ages across included studies were 57–70, which limits direct claims about every cyclist over 40.",
      },
      {
        name: "Anthony Walsh",
        credential: "Roadman founder; one-person 30-day creatine experiment",
        insight:
          "Anthony's logged protocol, body-mass change and power observations provide first-party context. They remain an n=1 report without placebo control and are not used here as proof of population-level benefit.",
        episodeSlug: "ep-2043-i-tried-creatine-for-30-days-the-results-shocked-me",
      },
    ],
    practicalApplication: [
      {
        title: "Name the outcome before buying",
        detail:
          "Write down whether you are testing gym strength, repeated sprint work, end-of-race power or something else. Do not use FTP or steady endurance as the promised outcome when pooled endurance evidence is negative.",
      },
      {
        title: "Use plain creatine monohydrate",
        detail:
          "The Australian Institute of Sport identifies monohydrate as the form with the safety and efficacy evidence. More expensive forms do not inherit that evidence automatically.",
      },
      {
        title: "Choose one dosing route",
        detail:
          "A maintenance-only approach of 3–5 g/day raises stores more gradually. A loading protocol of about 0.3 g/kg/day in divided doses for roughly five days, followed by 3–5 g/day, reaches saturation sooner. Loading is optional and can be less comfortable for the gut.",
      },
      {
        title: "Track the trade-off for four weeks",
        detail:
          "Keep normal training as stable as practical and record morning body mass, gastrointestinal tolerance, gym performance and the high-power cycling outcome you named. Do not call normal day-to-day power noise a supplement effect.",
      },
      {
        title: "Check health and product quality",
        detail:
          "Discuss use with an appropriate clinician when kidney disease, pregnancy, medication or another medical issue changes the decision. Competitive riders should choose a batch-tested product because supplement contamination—not creatine itself—creates anti-doping risk.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Taking creatine to raise FTP or improve steady endurance.",
        fix:
          "The pooled trained-endurance result is null. Use creatine only when a strength or repeated-high-intensity goal creates a defensible reason to test it.",
      },
      {
        mistake: "Saying every cyclist over 40 should take creatine.",
        fix:
          "Older-adult evidence is strongest alongside resistance training and mostly comes from participants older than a typical 40-plus racing category. Keep that population boundary visible.",
      },
      {
        mistake: "Treating Anthony's 30-day result as a guarantee.",
        fix:
          "Use it as transparent first-party context. Your response needs its own pre-defined outcome, consistent measurement and honest interpretation.",
      },
      {
        mistake: "Assuming a 1–2 kg gain is certain or irrelevant.",
        fix:
          "Small body-mass increases are common in the research, but magnitude varies. Measure the actual change and judge it against the demands of your event.",
      },
      {
        mistake: "Paying more for a novel creatine form.",
        fix:
          "Choose creatine monohydrate unless a qualified professional gives a specific reason otherwise; it is the form used across the established evidence base.",
      },
    ],
    faq: [
      {
        question: "Does creatine improve cycling endurance?",
        answer:
          "Not in the pooled trained-endurance evidence. A 2023 meta-analysis found no significant endurance-performance benefit. A newer scoping review found more plausible value for repeated sprints, surges and power-endurance demands than for endurance performance broadly.",
      },
      {
        question: "Can creatine help a cyclist who strength trains?",
        answer:
          "Possibly. Meta-analyses show that creatine can add to strength and lean-mass gains from resistance training in adults. That supports the gym programme; it does not prove a direct improvement in FTP, climbing or race results.",
      },
      {
        question: "Should masters cyclists take creatine?",
        answer:
          "They can consider it when resistance training or repeated high-power performance is a real goal. The strongest ageing evidence comes from older adults—often with mean ages of 57–70—doing resistance training, not from trials proving better cycling in every rider over 40.",
      },
      {
        question: "How much creatine should a cyclist take?",
        answer:
          "A common maintenance option is 3–5 g/day of creatine monohydrate. Loading at about 0.3 g/kg/day in divided doses for roughly five days reaches saturation faster, then transitions to maintenance, but loading is not required.",
      },
      {
        question: "Will creatine make a cyclist heavier?",
        answer:
          "It can increase body mass, commonly through water associated with increased muscle creatine, but the amount varies. That may matter more for a weight-sensitive hill climb than for a sprint, track, strength or repeated-surge goal, so measure your own response.",
      },
      {
        question: "Is creatine safe?",
        answer:
          "Creatine monohydrate is generally well tolerated in healthy adults at established doses, but a webpage cannot clear it for every person. Seek appropriate medical advice if kidney disease, pregnancy, medication or another health condition changes the decision.",
      },
      {
        question: "Does creatine cause dehydration or cramps?",
        answer:
          "The established review literature does not support creatine causing dehydration or muscle cramps at recommended doses in healthy users. That does not remove the need for a normal hydration plan or individual monitoring.",
      },
      {
        question: "Does creatine timing matter?",
        answer:
          "Consistency matters more than a precise clock time. Take the selected daily dose in a way you can repeat and evaluate; the evidence does not justify presenting one post-workout minute as compulsory.",
      },
    ],
    relatedEpisodes: [
      "ep-2043-i-tried-creatine-for-30-days-the-results-shocked-me",
      "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
    ],
    relatedTopics: [
      {
        label: "Anthony's 30-Day Creatine Data",
        href: "/blog/creatine-for-cyclists-thirty-day-data",
        description:
          "Read the first-party protocol and results with the n=1 limitation kept visible.",
      },
      {
        label: "Creatine Protocol for Cyclists",
        href: "/blog/creatine-for-cyclists-30-day-protocol",
        description:
          "Use the practical companion only after the evidence and trade-off fit your goal.",
      },
      {
        label: "Cycling Strength Session Planner",
        href: "/tools/strength-session-planner",
        description:
          "Build the resistance-training session that gives the supplement question context.",
      },
      {
        label: "Roadman Strength and Recovery App Waitlist",
        href: "/app?source=creatine-answer",
        description:
          "Join the single waitlist for Roadman's upcoming cyclist-specific strength and recovery app.",
      },
      {
        label: "Cycling Strength and Conditioning",
        href: "/topics/cycling-strength-conditioning",
        description:
          "See the complete off-bike strength task map and supporting evidence.",
      },
      {
        label: "Cycling Nutrition",
        href: "/topics/cycling-nutrition",
        description:
          "Separate supplements from the carbohydrate, protein and energy-availability fundamentals.",
      },
    ],
    sources: [
      {
        name: "Creatine and Endurance Performance in Trained People — Meta-analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/36877404/",
        publisher: "Sports Medicine",
        note: "Thirteen placebo-controlled studies; no significant pooled endurance-performance benefit.",
      },
      {
        name: "Creatine in Endurance and Mixed-Sport Contexts — Scoping Review",
        url: "https://pubmed.ncbi.nlm.nih.gov/42280321/",
        publisher: "Nutrients",
        note: "Maps repeated-sprint, power-endurance, recovery, aerobic and body-mass findings through 2025.",
      },
      {
        name: "Nutritional Ergogenic Aids in Cycling — Systematic Review",
        url: "https://pubmed.ncbi.nlm.nih.gov/38892701/",
        publisher: "Nutrients",
        note: "Shows how little direct standalone-creatine cycling evidence met the review criteria.",
      },
      {
        name: "Creatine Plus Resistance Training in Older Adults — Meta-analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/29138605/",
        publisher: "Open Access Journal of Sports Medicine",
        note: "Twenty-two studies and 721 older adults; supports lean-tissue and strength outcomes with a clear population boundary.",
      },
      {
        name: "Creatine and Resistance-Training Strength in Adults Under 50 — Meta-analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/39519498/",
        publisher: "Sports Medicine",
        note: "Supports additional upper- and lower-body strength gains, with limited female representation.",
      },
      {
        name: "Creatine, Resistance Training and Body Composition — Meta-analysis",
        url: "https://pubmed.ncbi.nlm.nih.gov/39074168/",
        publisher: "Journal of Strength and Conditioning Research",
        note: "Quantifies added lean-body-mass change and reinforces that resistance training is the intervention context.",
      },
      {
        name: "Common Questions and Misconceptions About Creatine",
        url: "https://jissn.biomedcentral.com/articles/10.1186/s12970-021-00412-w",
        publisher: "Journal of the International Society of Sports Nutrition",
        note: "Reviews maintenance dosing, loading, cramps, dehydration, safety and evidence limits.",
      },
      {
        name: "AIS Creatine Monohydrate Fact Sheet",
        url: "https://www.ais.gov.au/__data/assets/pdf_file/0007/1000501/Sport-supplement-fact-sheets-Creatine-v4.pdf",
        publisher: "Australian Institute of Sport",
        note: "Applied dosing routes, monohydrate-form guidance, use cases and supplement-quality cautions.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Direct trained-endurance evidence does not show a pooled performance benefit. Strength-plus-resistance-training evidence is stronger, while repeated-sprint and mixed-sport findings are promising but inconsistent. Masters claims are indirect because the older-adult trials were not masters-cycling performance trials.",
    updatedDate: "2026-08-31",
    reviewedBy:
      "Anthony Walsh, with editorial fact-checking against the cited creatine, cycling and resistance-training reviews",
  };
}
