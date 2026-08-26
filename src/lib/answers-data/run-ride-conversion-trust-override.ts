import type { AnswerPage } from "@/lib/answers";

const OWNER = "how-many-minutes-cycling-equals-running";

export function applyRunRideConversionTrustOverride(
  answer: AnswerPage,
): AnswerPage {
  if (answer.slug !== OWNER) return answer;

  return {
    ...answer,
    question: "How Much Cycling Equals Running?",
    seoTitle: "How Much Cycling Equals Running? Time & Distance",
    seoDescription:
      "There is no universal cycling-to-running ratio. See a transparent MET-minute example, why impact does not convert and which calculator to use.",
    directAnswer:
      "There is no universal cycling-to-running time or distance ratio. For population-average energy cost, match MET-minutes: activity MET multiplied by duration. Example: 30 minutes running at 6 mph is 279 MET-minutes; the 12 mph cycling category reaches that in about 35 minutes and 7.0 miles. This does not match impact, recovery, race fitness or adaptation, so use it as a planning estimate only.",
    keyTakeaways: [
      "A fixed 3:1 time or distance rule is not supported across speeds, terrain, wind, drafting and individual economy.",
      "MET-minutes can compare population-average energy cost when both activity categories are named.",
      "Equal energy cost does not mean equal biomechanical load, recovery, training stress or sport-specific adaptation.",
      "Use the calculator for disclosed arithmetic and the full guide for the conversion chart and evidence limits.",
    ],
    whoFor: [
      {
        label: "The runner moving aerobic work to the bike",
        detail:
          "You want a bounded planning reference without treating the ride as identical to the run.",
      },
      {
        label: "The cyclist adding running",
        detail:
          "You need to account for a new session while respecting running impact and tissue tolerance.",
      },
    ],
    roadmanView: [
      "A conversion only makes sense after naming the outcome. Energy cost, tissue load and race preparation are three different jobs.",
      "Roadman uses the 2024 Compendium to expose the population-average MET arithmetic. We do not predict FTP from a running time or running race performance from FTP.",
      "If symptoms, recovery or event specificity matter, those signals outrank a generic conversion output.",
    ],
    expertEvidence: [
      {
        name: "Barbara Ainsworth, Bryce Herrmann and colleagues",
        credential: "2024 Adult Compendium research team",
        insight:
          "The Compendium standardises population activity-energy costs with named MET values. It supports transparent MET-minute arithmetic, not claims that two sports are interchangeable.",
      },
      {
        name: "Menges and colleagues",
        credential: "2026 running/cycling cross-training review authors",
        insight:
          "Their seven-trial meta-analysis found no clear between-group differences in the assessed outcomes, but limited, heterogeneous evidence did not establish interchangeability.",
      },
    ],
    practicalApplication: [
      {
        title: "Name both speeds",
        detail:
          "Choose the source and target activity categories rather than applying one ratio to every run and ride.",
      },
      {
        title: "Match one metric",
        detail:
          "For estimated energy cost, multiply source MET by minutes and divide by target MET. Do not rename that result training equivalence.",
      },
      {
        title: "Restore the missing load",
        detail:
          "Review impact, symptoms, sport-specific purpose, terrain, wind, drafting and recovery before changing the programme.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Multiplying every run by a fixed three-to-one ratio.",
        fix:
          "Name the selected speeds and metric. The result changes when either activity category changes.",
      },
      {
        mistake: "Calling equal MET-minutes equal training stress.",
        fix:
          "Treat MET-minutes as an energy-cost estimate and monitor biomechanical, physiological and subjective load separately.",
      },
      {
        mistake: "Using the result as injury-rehabilitation clearance.",
        fix:
          "A calculator cannot assess tissue tolerance or symptoms. Follow an appropriately qualified rehabilitation plan.",
      },
    ],
    faq: [
      {
        question: "How many cycling miles equal one running mile?",
        answer:
          "There is no universal number. At selected moderate categories the energy-cost answer can land near two or three cycling miles, but speed, terrain, wind, drafting and the outcome being matched change it.",
      },
      {
        question: "What cycling distance is equivalent to a 5K run?",
        answer:
          "For a 5K at 6 mph matched to the 12 mph cycling category, the population-average energy-cost result is about 7.2 miles or 11.6 km. It does not match running impact or race specificity.",
      },
      {
        question: "Can I use TSS or TRIMP instead?",
        answer:
          "They can add useful sport-specific load context when their inputs are valid, but a matched score still does not match impact, symptoms, recovery or adaptation across modes.",
      },
      {
        question: "Can I convert running pace to cycling FTP?",
        answer:
          "Not with a reliable universal equation. Use a cycling-specific FTP method because efficiency, economy, threshold and training history differ between modes.",
      },
      {
        question: "Can cycling replace a run during injury?",
        answer:
          "It may preserve some aerobic work with less impact, but the decision is clinical and programme-specific. The conversion does not assess symptoms or readiness to run.",
      },
      {
        question: "Is 30 minutes cycling equal to 30 minutes running?",
        answer:
          "Only when the selected categories carry the same MET value, and then only for population-average energy cost. Tissue load, recovery and sport-specific effects remain different.",
      },
    ],
    relatedTopics: [
      {
        label: "Cycling to Running Conversion Calculator",
        href: "/tools/run-ride-converter",
      },
      {
        label: "Cycling to Running Conversion Guide",
        href: "/blog/running-cycling-conversion-calculator",
      },
      {
        label: "Running for Cyclists — Topic Hub",
        href: "/topics/running-for-cyclists",
      },
      {
        label: "Cycling for Runners — Topic Hub",
        href: "/topics/cycling-for-runners",
      },
    ],
    sources: [
      {
        name: "2024 Adult Compendium of Physical Activities",
        url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10818145/",
        publisher: "Journal of Sport and Health Science",
        note: "Compendium methods, scope and MET definition.",
      },
      {
        name: "Official 2024 Adult Compendium activity table",
        url: "https://pacompendium.com/wp-content/uploads/2024/03/1_2024-adult-compendium_1_2024.pdf",
        publisher: "Compendium of Physical Activities",
        note: "Named running and cycling activity codes used by the calculator.",
      },
      {
        name: "Cross-training between running and cycling",
        url: "https://pubmed.ncbi.nlm.nih.gov/42267259/",
        publisher: "Frontiers in Sports and Active Living",
        note: "2026 systematic review and meta-analysis and its interchangeability boundary.",
      },
      {
        name: "Physiological differences between cycling and running",
        url: "https://pubmed.ncbi.nlm.nih.gov/19290675/",
        publisher: "Sports Medicine",
        note: "Review of modality-specific physiology and training-history effects.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "MET-minute arithmetic is transparent and source-coded. Cross-sport training equivalence remains limited by individual economy, mechanical load, specificity and the small heterogeneous intervention evidence base.",
    updatedDate: "2026-08-26",
    reviewedBy: "Anthony Walsh",
  };
}
