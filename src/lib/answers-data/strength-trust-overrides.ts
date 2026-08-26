import type { AnswerPage, AnswerSource } from "@/lib/answers";

const REVIEWED_DATE = "2026-08-26";

function strengthSources(): AnswerSource[] {
  return [
    {
      name: "Heavy strength training effects in endurance cyclists",
      url: "https://pubmed.ncbi.nlm.nih.gov/40632222/",
      publisher: "European Journal of Applied Physiology",
      note: "2025 cyclist-only systematic review and meta-analysis; 17 studies, 262 participants and low-certainty outcome evidence.",
    },
    {
      name: "Maximizing adaptations in concurrent training",
      url: "https://pubmed.ncbi.nlm.nih.gov/41762427/",
      publisher: "Sports Medicine",
      note: "2026 umbrella review of 17 concurrent-training meta-analyses and its sequence and population limits.",
    },
    {
      name: "Resistance training to non-failure versus failure",
      url: "https://pubmed.ncbi.nlm.nih.gov/42410632/",
      publisher: "BMC Sports Science, Medicine and Rehabilitation",
      note: "2026 systematic review and meta-analysis of strength, hypertrophy, endurance and power outcomes in healthy adults.",
    },
    {
      name: "Strength training in elite cyclists",
      url: "https://pubmed.ncbi.nlm.nih.gov/24862305/",
      publisher: "Scandinavian Journal of Medicine & Science in Sports",
      note: "Small 25-week controlled study showing both performance changes and increased lower-body lean mass.",
    },
  ];
}

function reviewed(answer: AnswerPage, patch: Partial<AnswerPage>): AnswerPage {
  return {
    ...answer,
    ...patch,
    sources: strengthSources(),
    evidenceLevel: "emerging",
    evidenceNote:
      "The cyclist-only meta-analysis found significant group-level effects but graded the evidence as low certainty and did not establish an optimal exercise list, weekly frequency or implementation method. Broader resistance-training reviews require population-specific caution.",
    updatedDate: REVIEWED_DATE,
    reviewedBy: "Anthony Walsh",
  };
}

export function applyStrengthTrustOverride(answer: AnswerPage): AnswerPage {
  switch (answer.slug) {
    case "best-gym-exercises-for-cyclists":
      return reviewed(answer, {
        seoTitle: "Best Gym Exercises for Cyclists: Evidence & Routine",
        seoDescription:
          "No lift is mandatory for every cyclist. Choose knee-, hip- and single-leg patterns by competence, equipment and recovery, with a practical routine.",
        directAnswer:
          "There is no research-ranked list of the best gym exercises for every cyclist. A practical routine covers a knee-dominant movement, a hip-dominant movement, and enough single-leg, calf, upper-body and trunk work for the rider's actual needs. Choose variants that can be performed, progressively loaded and recovered from safely. The latest cyclist-only meta-analysis supports heavy strength training as a category, but does not prove one best lift, repetition range or weekly frequency.",
        keyTakeaways: [
          "Choose movement patterns before named exercises: knee-dominant, hip-dominant, single-leg where useful, calf, upper body and trunk.",
          "No review proves that unilateral exercises transfer better simply because pedalling alternates between legs.",
          "Machines, bilateral lifts and unilateral lifts can all be valid when they fit the rider and can be progressed.",
          "Use the full gym-exercise guide for the routine; use the broad strength guide for the evidence and effect sizes.",
        ],
        roadmanView: [
          "An exercise does not transfer because it looks like pedalling. It earns a place when the rider can progress it and the whole programme improves.",
          "A short exercise list is useful because it is repeatable, not because research discovered one sacred number of movements.",
        ],
        expertEvidence: [
          {
            name: "Llanos-Lagos, Ramirez-Campillo and Sáez de Villarreal",
            credential: "Authors of the 2025 cyclist-only meta-analysis",
            insight:
              "The pooled evidence favoured heavy strength training for cycling performance, efficiency and anaerobic power, but its low certainty prevented robust recommendations about optimal implementation.",
          },
          {
            name: "Wu and colleagues",
            credential: "Authors of the 2026 failure-training meta-analysis",
            insight:
              "Non-failure training was as effective for most measured outcomes and slightly favoured for dynamic strength in healthy adults; this supports avoiding unnecessary technical breakdown.",
          },
        ],
        practicalApplication: [
          {
            title: "Choose one knee-dominant movement",
            detail:
              "Use a squat, split squat, step-up or leg-press variant the rider can control and progressively load.",
          },
          {
            title: "Choose one hip-dominant movement",
            detail:
              "Use a hinge, trap-bar, hip-thrust or machine variation that fits competence, equipment and health history.",
          },
          {
            title: "Add only what serves a stated need",
            detail:
              "Single-leg, calf, upper-body and trunk exercises should earn their place through the rider's goal, not an internet ranking.",
          },
        ],
        commonMistakes: [
          {
            mistake: "Treating one exercise list as research-proven.",
            fix: "The cyclist review did not rank named lifts; use patterns and rider constraints.",
          },
          {
            mistake: "Calling free weights more specific than machines.",
            fix: "Choose the tool that lets the intended quality be trained and progressed reliably.",
          },
          {
            mistake: "Claiming one repetition range cannot add mass.",
            fix: "Strength and hypertrophy overlap; monitor body mass when power-to-weight matters.",
          },
        ],
        faq: [
          {
            question: "What are the best gym exercises for cyclists?",
            answer:
              "No universal list is proven. Cover useful knee-, hip- and whole-body movement patterns with variants suited to the rider's competence, equipment, health history and recovery.",
          },
          {
            question: "Should cyclists do squats or split squats?",
            answer:
              "Either can work. A bilateral squat permits stable force production; a split squat adds unilateral control. No review proves one transfers better for every cyclist.",
          },
          {
            question: "Are deadlifts good for cyclists?",
            answer:
              "A hip hinge can be useful, but no one deadlift variation is mandatory. Romanian, trap-bar, hip-thrust and machine options train overlapping qualities with different technical demands.",
          },
          {
            question: "How many sets and repetitions should cyclists do?",
            answer:
              "No universal optimum was established. Two or three controlled work sets per pattern can be a starting point. Progress toward heavier work only after earning the movement and protecting key rides.",
          },
          {
            question: "Should cyclists train to failure?",
            answer:
              "It is not required. A 2026 review in healthy adults found non-failure training as effective for most outcomes and slightly better for dynamic strength.",
          },
          {
            question: "Can gym exercises prevent cycling injuries?",
            answer:
              "The latest cycling-performance review did not test injury prevention. Strength may be part of a wider capacity or rehabilitation programme, but it cannot guarantee protection or replace assessment.",
          },
        ],
        relatedTopics: [
          { label: "Gym Exercises for Cyclists — Full Guide", href: "/blog/cycling-gym-exercises-best" },
          { label: "Leg Day for Cyclists", href: "/blog/cycling-leg-day-should-cyclists" },
          { label: "Strength Training Evidence & Plan", href: "/blog/cycling-strength-training-guide" },
          { label: "Strength & Conditioning Research Library", href: "/topics/cycling-strength-conditioning" },
        ],
      });

    case "how-many-strength-sessions-cyclists":
      return reviewed(answer, {
        seoTitle: "How Often Should Cyclists Strength Train? Evidence",
        seoDescription:
          "Cyclist studies used one to three strength sessions weekly and found no optimal frequency. Use a recoverable starting dose and protect priority rides.",
        directAnswer:
          "Research does not establish one best weekly strength-training frequency for every cyclist. The 2025 cyclist-only meta-analysis included programmes using one to three sessions per week and found no significant frequency moderator. Two non-consecutive sessions is a practical starting hypothesis for many riders, not a proven minimum or optimum. Reduce frequency or volume when key riding, symptoms or recovery deteriorate.",
        keyTakeaways: [
          "The reviewed cyclist programmes used one to three sessions per week; frequency did not significantly moderate the pooled outcomes.",
          "Two sessions is a practical starting point, not a research-proven sweet spot.",
          "Maintenance cannot be reduced to a universal one-session rule; training history, dose and cycling load matter.",
          "Judge the frequency by strength progress, key ride quality and recovery together.",
        ],
        roadmanView: [
          "Frequency is useful only in the context of total dose. Two enormous sessions and two small sessions are not the same programme.",
          "Start below the recoverable ceiling, then increase only while strength and priority cycling remain productive.",
        ],
        expertEvidence: [
          {
            name: "Llanos-Lagos, Ramirez-Campillo and Sáez de Villarreal",
            credential: "Authors of the 2025 cyclist-only meta-analysis",
            insight:
              "The included interventions used one to three sessions per week, and frequency was not a significant moderator; low certainty prevented an optimal prescription.",
          },
          {
            name: "Held and colleagues",
            credential: "Authors of the 2026 concurrent-training umbrella review",
            insight:
              "Concurrent training can develop both endurance and strength in recreationally trained people, while evidence in highly trained and elite athletes remains scarce.",
          },
        ],
        practicalApplication: [
          {
            title: "Start with the calendar",
            detail: "Protect races, key intervals and long rides before adding strength sessions.",
          },
          {
            title: "Choose a recoverable trial dose",
            detail: "For many riders this is two short, non-consecutive sessions; for others one is the sensible entry point.",
          },
          {
            title: "Review the whole programme",
            detail: "Track strength, priority ride completion, soreness, symptoms and recovery before increasing frequency.",
          },
        ],
        commonMistakes: [
          {
            mistake: "Calling two sessions the proven minimum.",
            fix: "The review included one to three and did not establish an optimum.",
          },
          {
            mistake: "Ignoring session volume when discussing frequency.",
            fix: "Count exercises, sets, effort and novelty as well as days per week.",
          },
          {
            mistake: "Keeping the same gym dose when race load rises.",
            fix: "Remove accessory volume or a session when priority riding and recovery require it.",
          },
        ],
        faq: [
          {
            question: "How often should cyclists strength train?",
            answer: "The research does not establish an optimum. Included programmes used one to three sessions weekly. Two can be a practical start, not a universal rule.",
          },
          {
            question: "Is one strength session per week enough?",
            answer: "It may be useful, particularly under high cycling load, but no universal maintenance guarantee applies. The exercise dose and training history matter.",
          },
          {
            question: "Should cyclists lift year-round?",
            answer: "Strength can remain in the plan year-round when the dose adapts to cycling priorities, but the evidence does not prescribe one seasonal template for every rider.",
          },
          {
            question: "Can cyclists do three strength sessions per week?",
            answer: "Some reviewed programmes did. Whether it is recoverable depends on cycling load, strength experience and session volume; more is not automatically better.",
          },
          {
            question: "How long should a strength session last?",
            answer: "Duration alone is a weak dose measure. Use enough time for the selected movements and full recovery between work sets without adding exercises for completeness.",
          },
          {
            question: "When should frequency be reduced?",
            answer: "Reduce or reposition the dose when key rides repeatedly miss their purpose, strength regresses, symptoms rise or recovery remains poor.",
          },
        ],
      });

    case "will-lifting-make-me-slower":
      return reviewed(answer, {
        seoTitle: "Will Lifting Make Cyclists Slower or Bulky? Evidence",
        seoDescription:
          "Strength training does not automatically slow cyclists, but FTP gains and zero mass gain cannot be promised. See the current cyclist evidence and limits.",
        directAnswer:
          "Lifting does not automatically make a cyclist slower. In the latest cyclist-only meta-analysis, heavy strength training improved pooled cycling performance, efficiency and anaerobic power, but not VO2max or maximal metabolic steady state, and the evidence was low certainty. Zero mass gain cannot be promised: a small elite-cyclist study reported increased lower-body lean mass. Track body mass, cycling performance and recovery instead of assuming the outcome.",
        keyTakeaways: [
          "The cyclist meta-analysis favoured strength training for some performance outcomes, but did not show an automatic FTP or VO2max increase.",
          "One controlled elite-cyclist study reported increased lower-body lean mass, so 'lifting cannot add bulk' is inaccurate.",
          "Poorly placed or excessive lifting can reduce key ride quality even when strength training is useful overall.",
          "Measure body mass, cycling performance, gym strength and recovery together.",
        ],
        roadmanView: [
          "The question is not whether lifting is good or bad in isolation. It is whether this dose improves the cyclist's whole programme.",
          "Promises of free strength, guaranteed FTP and zero mass gain are marketing, not evidence boundaries.",
        ],
        expertEvidence: [
          {
            name: "Llanos-Lagos, Ramirez-Campillo and Sáez de Villarreal",
            credential: "Authors of the 2025 cyclist-only meta-analysis",
            insight: "Pooled benefits appeared for performance, efficiency and anaerobic power, while VO2max and maximal metabolic steady state were not significantly changed.",
          },
          {
            name: "Rønnestad and colleagues",
            credential: "Authors of the 25-week elite-cyclist controlled study",
            insight: "The strength group improved several outcomes and increased lower-body lean mass, showing why zero-mass-gain promises are too strong.",
          },
        ],
        practicalApplication: [
          { title: "Set a baseline", detail: "Record body mass where relevant, a cycling outcome, strength and priority ride completion." },
          { title: "Use a progressive block", detail: "Increase the smallest useful dose while protecting races, intervals and long rides." },
          { title: "Reassess transfer", detail: "A stronger lift is not enough; the cycling outcome must also support the claim." },
        ],
        commonMistakes: [
          { mistake: "Promising that lifting always raises FTP.", fix: "The pooled maximal-steady-state result was not significant." },
          { mistake: "Promising that a repetition range prevents mass gain.", fix: "Monitor the individual; adaptations overlap." },
          { mistake: "Ignoring missed priority rides.", fix: "Reduce or reposition the strength dose when the whole programme deteriorates." },
        ],
        faq: [
          { question: "Will lifting make cyclists slower?", answer: "Not automatically. Pooled cyclist evidence favoured some performance outcomes, but individual response and total-programme fatigue still matter." },
          { question: "Will strength training make a cyclist bulky?", answer: "Not necessarily, but it can add lean mass. One small elite-cyclist trial reported increased lower-body lean mass." },
          { question: "Does strength training raise FTP?", answer: "It may help some riders, but the latest pooled analysis did not find a significant maximal-metabolic-steady-state effect. Do not promise an FTP increase." },
          { question: "Can lifting hurt cycling performance?", answer: "Yes, if the dose or timing repeatedly compromises important riding, recovery or symptoms. That is a programming problem, not proof that all lifting is harmful." },
          { question: "How should cyclists monitor lifting?", answer: "Track gym strength, a goal-relevant cycling measure, body mass when relevant, key session completion and recovery." },
          { question: "Should climbers avoid strength training?", answer: "Not automatically. Climbers should monitor body mass and climbing performance while using the smallest recoverable dose that serves the goal." },
        ],
      });

    case "are-squats-good-for-cyclists":
      return reviewed(answer, {
        seoTitle: "Are Squats Good for Cyclists? Evidence & Choices",
        seoDescription:
          "Squats can be useful for cyclists, but no variation is mandatory or proven best. Compare bilateral, split-squat and machine options safely.",
        directAnswer:
          "Squats can be useful for cyclists because they provide a progressively loadable knee- and hip-dominant strength exercise. No cyclist-specific review proves that back squats, split squats or any one variation is best for cycling performance. Choose the version the rider can execute, load and recover from safely. A leg press or step-up can be equally defensible when balance, equipment, health history or technique changes the decision.",
        keyTakeaways: [
          "Squats are an option, not a mandatory cycling exercise.",
          "No review proves that split squats transfer better simply because pedalling alternates legs.",
          "Machines and bilateral movements are not inferior by default.",
          "Pain, rehabilitation and unexplained asymmetry require assessment rather than an online exercise hierarchy.",
        ],
        whoFor: [
          { label: "The cyclist choosing a squat variation", detail: "You need a decision based on execution, loading and recovery rather than sport-specific marketing." },
          { label: "The rider comparing unilateral and bilateral work", detail: "You want the evidence boundary around transfer and asymmetry claims." },
        ],
        roadmanView: [
          "A squat earns its place when it develops a useful quality and the rider can progress it. It does not earn it because it looks hard or resembles one frame of a pedal stroke.",
          "The best variation is the one whose limiting factor matches the goal—not the one with the strongest internet identity.",
        ],
        expertEvidence: [
          { name: "Llanos-Lagos, Ramirez-Campillo and Sáez de Villarreal", credential: "Authors of the 2025 cyclist-only meta-analysis", insight: "The review supports heavy strength training as a category but did not establish a best named exercise or unilateral hierarchy." },
          { name: "Wu and colleagues", credential: "Authors of the 2026 failure-training meta-analysis", insight: "Strength development did not require training to failure in the broader healthy-adult evidence." },
        ],
        practicalApplication: [
          { title: "Choose the constraint", detail: "Decide whether loading capacity, balance, equipment, mobility or technique should govern the variation." },
          { title: "Start with control", detail: "Use a range and load that preserve technique and do not provoke pain." },
          { title: "Progress one variable", detail: "Add load, repetitions or a set gradually, then review the next priority ride." },
        ],
        commonMistakes: [
          { mistake: "Calling split squats the most transferable exercise.", fix: "No comparative cyclist outcome evidence establishes that ranking." },
          { mistake: "Rejecting machines as non-functional.", fix: "Use them when they permit more reliable target loading." },
          { mistake: "Using squats as treatment for knee pain.", fix: "Exercise selection does not diagnose pain; seek appropriate assessment when symptoms persist or worsen." },
        ],
        faq: [
          { question: "Are squats good for cyclists?", answer: "They can be. Squats offer progressive lower-body loading, but no one variation is mandatory or proven best for cycling performance." },
          { question: "Are split squats better than back squats for cyclists?", answer: "Not universally. Split squats add unilateral control; back squats permit stable bilateral loading. Choose by the rider's goal and constraints." },
          { question: "Can cyclists use a leg press instead?", answer: "Yes. A leg press can reduce balance and technical demands and may be the better loading tool for some riders." },
          { question: "How deep should cyclists squat?", answer: "Use the range the rider can control without pain while serving the programme goal. Pedal-joint angles do not create one mandatory squat depth." },
          { question: "Can squats fix cycling knee pain?", answer: "Not as a universal prescription. Strength work may be part of a clinician-led plan, but pain has multiple possible causes and needs assessment when persistent." },
          { question: "How often should cyclists squat?", answer: "No optimal frequency is established. Place the movement inside a recoverable strength dose and track its effect on both strength and cycling." },
        ],
      });

    case "when-to-lift-around-rides":
      return reviewed(answer, {
        seoTitle: "When Should Cyclists Lift Around Rides? Evidence",
        seoDescription:
          "There is no universal ride-and-lift order or 48-hour rule. Protect the priority session and use quality, soreness and recovery to set the gap.",
        directAnswer:
          "There is no universal rule to always lift before, after or a fixed number of hours from cycling. Protect the session that matters most. If the key interval, long ride or race is the priority, complete it fresh and avoid unfamiliar or fatiguing lifting beforehand. If strength is the block priority, lift fresh or separate the sessions. Same-day training can work, but the 2026 concurrent-training evidence does not establish one best sequence for every cyclist, especially trained and elite riders.",
        keyTakeaways: [
          "Put the priority session first or separate it when same-day work reduces quality.",
          "No universal 24-, 48- or 72-hour cyclist-specific rule was established.",
          "Same-day training can be viable, but session size, novelty, rider level and recovery change the result.",
          "Use completed quality, soreness, symptoms and recovery to adjust the schedule.",
        ],
        roadmanView: [
          "Scheduling should protect the purpose of each session, not obey a slogan about hard days or a fixed clock.",
          "If both sessions remain productive and the rider recovers, same-day work can fit. If one repeatedly collapses, separate or reduce the dose.",
        ],
        expertEvidence: [
          { name: "Held and colleagues", credential: "Authors of the 2026 concurrent-training umbrella review", insight: "Combined training improved both endurance and strength outcomes in recreationally trained people; no decisive universal sequence effect emerged and elite data remained scarce." },
          { name: "Llanos-Lagos, Ramirez-Campillo and Sáez de Villarreal", credential: "Authors of the 2025 cyclist-only meta-analysis", insight: "The cycling review supported potential benefits but did not establish one weekly placement or separation rule." },
        ],
        practicalApplication: [
          { title: "Mark priority rides first", detail: "Place races, key intervals and long rides before adding strength work." },
          { title: "Choose order by goal", detail: "Ride first when cycling quality matters most; lift fresh or separate when strength quality is the block priority." },
          { title: "Audit the result", detail: "Check whether both sessions met their purpose and whether recovery supports the next training day." },
        ],
        commonMistakes: [
          { mistake: "Applying one 48–72-hour rule to every strength dose.", fix: "Novelty, volume, exercise choice and the rider change recovery demand." },
          { mistake: "Stacking sessions because 'hard days hard' even when quality collapses.", fix: "Separate the sessions when consolidation repeatedly harms either one." },
          { mistake: "Using an easy spin as injury clearance.", fix: "Symptoms and rehabilitation decisions require appropriate assessment." },
        ],
        faq: [
          { question: "Should cyclists lift before or after riding?", answer: "Put the priority first. Ride first for a key cycling session; lift first or separate when strength is the primary quality." },
          { question: "Can cyclists lift and ride on the same day?", answer: "Yes, when both sessions remain productive and recovery supports the next day. Same-day training is an option, not a universal best practice." },
          { question: "How long should cyclists wait after leg day?", answer: "No universal number is established. Use the size and novelty of the strength dose, planned ride quality, soreness, symptoms and recovery." },
          { question: "Can I do an easy ride after lifting?", answer: "Often, if movement and symptoms are normal and the ride stays genuinely easy. It should not be treated as medical or rehabilitation clearance." },
          { question: "Should I lift before a race or key interval session?", answer: "Avoid unfamiliar or fatiguing lifting immediately beforehand. Protect the session tied most closely to the goal." },
          { question: "Does strength training interfere with endurance?", answer: "Concurrent training can improve both qualities, but interference depends on population and programme design. Evidence in highly trained and elite athletes remains limited." },
        ],
        relatedTopics: [
          { label: "Leg Day for Cyclists", href: "/blog/cycling-leg-day-should-cyclists" },
          { label: "Gym Exercises for Cyclists", href: "/blog/cycling-gym-exercises-best" },
          { label: "Strength Training Evidence & Plan", href: "/blog/cycling-strength-training-guide" },
          { label: "Cycling Training Plans", href: "/topics/cycling-training-plans" },
        ],
      });

    default:
      return answer;
  }
}
