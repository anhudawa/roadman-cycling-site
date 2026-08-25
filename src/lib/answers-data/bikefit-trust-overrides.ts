import type { AnswerPage } from "@/lib/answers";

const REVIEWER =
  "Anthony Walsh, with editorial fact-checking against the cited bike-fit and cycling-biomechanics research";

const kneePainTrust: Partial<AnswerPage> = {
  seoTitle: "Cycling Knee Pain: Fit, Load and Warning Signs",
  seoDescription:
    "Cycling knee pain is not a bolt-by-bolt diagnosis. Check recent load, setup changes and fit, then know when persistent symptoms need clinical assessment.",
  directAnswer:
    "Cycling knee pain can involve training load, position, cleats, cadence, tissue irritation or a health problem; the location alone does not identify one cause. Reduce the aggravating load, record recent training and equipment changes, and restore any recent fit change before experimenting further. A qualified fitter can assess position. Seek clinical assessment for persistent or worsening pain, swelling, weakness, locking, giving way, night pain or symptoms away from the bike.",
  keyTakeaways: [
    "Pain location is context, not a reliable instruction to raise, lower or move the saddle.",
    "Review recent volume, intensity, hills, cadence and equipment changes alongside the fit.",
    "Change one recorded variable at a time; several simultaneous adjustments hide cause and effect.",
    "Persistent pain, swelling, weakness, locking, giving way or night pain needs clinical assessment.",
  ],
  whoFor: [
    {
      label: "The rider with a new knee symptom",
      detail: "You need a safe order of checks without assuming the bicycle is the only cause.",
    },
    {
      label: "The rider whose pain keeps returning",
      detail: "You need to stop random adjustments and decide whether a fitter or clinician should assess it.",
    },
  ],
  roadmanView: [
    "Where the knee hurts helps describe the problem; it does not prove which component is wrong.",
    "The useful evidence trail is recent load, exact equipment, onset time, original setup and one repeatable change—not an internet symptom map.",
  ],
  expertEvidence: [
    {
      name: "Phil Burt",
      credential: "Former Head of Physiotherapy, British Cycling",
      insight:
        "Roadman's conversation with Burt provides practitioner context for assessing the rider and bicycle together. It is not a claim that every knee-pain location has one mechanical cause.",
      episodeSlug:
        "ep-2103-fixing-the-1-bike-fit-mistake-that-causes-knee-pain-with-phil-burt",
      guestSlug: "phil-burt",
    },
  ],
  practicalApplication: [
    {
      title: "Reduce the aggravating dose",
      detail:
        "Pause the session that reliably worsens the symptom and note whether easy riding, daily activity or rest also produces it.",
    },
    {
      title: "Record load and setup",
      detail:
        "Write down recent volume, intensity, hills, cadence, shoes, cleats, saddle, bike service and any fit change.",
    },
    {
      title: "Restore before experimenting",
      detail:
        "If symptoms followed a recorded equipment or position change, restore the prior safe setup. Do not move several contact points at once.",
    },
    {
      title: "Escalate the right problem",
      detail:
        "Use a fitter for position, a mechanic for bicycle safety and a clinician for persistent or concerning symptoms.",
    },
  ],
  commonMistakes: [
    {
      mistake: "Treating anterior, posterior or lateral pain as a diagnosis.",
      fix: "Use location to describe the symptom, then assess load, fit, equipment and health together.",
    },
    {
      mistake: "Copying a fixed 3–5mm saddle move from an article.",
      fix: "Preserve the baseline and make a small, reasoned change only when the assessment supports it.",
    },
    {
      mistake: "Training through a worsening symptom for two weeks.",
      fix: "Reduce the aggravating load and seek assessment sooner when warning signs are present.",
    },
  ],
  faq: [
    {
      question: "Does front-of-knee pain mean my saddle is too low?",
      answer:
        "Not by itself. Saddle height, setback, crank length, cadence, training load and a non-cycling condition can all affect the symptom. Pain location cannot select one adjustment without an assessment.",
    },
    {
      question: "Should I change my cleats when my knee hurts?",
      answer:
        "Only after recording the current position and checking whether a cleat change, wear or rotation preceded the symptom. Do not force the foot into a generic angle or change cleats and saddle together.",
    },
    {
      question: "Can a bike fit help cycling knee pain?",
      answer:
        "It can help when position or equipment contributes, but it cannot rule out a load or health problem. A fitter should document the setup and explain uncertainty rather than guarantee a cure.",
    },
    {
      question: "When should cycling knee pain be assessed clinically?",
      answer:
        "Seek assessment for pain that persists or worsens despite reducing the aggravating load, or for swelling, weakness, locking, giving way, night pain, trauma or symptoms during daily life.",
    },
  ],
  evidenceLevel: "moderate",
  evidenceNote:
    "Systematic reviews report limited and conflicting evidence connecting conventional bike-fit measures to cycling overuse pain or injury (PMID 35151569; PMID 29872355; PMID 29234554).",
  updatedDate: "2026-08-25",
  reviewedBy: REVIEWER,
};

function symptomTrust({
  symptom,
  seoTitle,
  seoDescription,
  directAnswer,
  fitChecks,
  warningSigns,
  evidenceNote,
}: {
  symptom: string;
  seoTitle: string;
  seoDescription: string;
  directAnswer: string;
  fitChecks: string;
  warningSigns: string;
  evidenceNote: string;
}): Partial<AnswerPage> {
  return {
    seoTitle,
    seoDescription,
    directAnswer,
    keyTakeaways: [
      `${symptom} can involve position, equipment, training load or health; it does not diagnose one adjustment.`,
      `Record onset, duration and recent load or equipment changes before changing the bicycle.`,
      `Check ${fitChecks}, but change only one recorded variable at a time.`,
      `Reduce the aggravating load and seek clinical assessment for ${warningSigns}.`,
    ],
    whoFor: [
      {
        label: `The rider with recurring ${symptom.toLowerCase()}`,
        detail: "You need a safe order of checks without assuming the bicycle is the only cause.",
      },
      {
        label: "The rider considering a fit change",
        detail: "You want a reversible test and a clear boundary for professional assessment.",
      },
    ],
    roadmanView: [
      `Treat ${symptom.toLowerCase()} as evidence to investigate, not a bolt selector.`,
      "A fitter can assess position, a mechanic can assess the bicycle and a clinician can assess health. Use the scope that matches the unresolved problem.",
    ],
    expertEvidence: [
      {
        name: "Dr Andy Pruitt",
        credential: "Sports-medicine physician and bike-fit practitioner",
        insight: "Roadman's practitioner conversation supports assessing rider, bicycle and riding goal together; it is not a remote diagnosis for an individual symptom.",
        episodeSlug: "ep-2186-the-correct-bike-fit-simplified-dr-pruitt",
        guestSlug: "dr-andy-pruitt",
      },
    ],
    practicalApplication: [
      {
        title: "Describe the pattern",
        detail: "Record when the symptom begins, what makes it better or worse, and whether it occurs away from cycling.",
      },
      {
        title: "Review load and equipment",
        detail: "List recent changes in duration, intensity, terrain, bicycle, contact points, clothing or service work.",
      },
      {
        title: "Test one reversible variable",
        detail: `After mechanical safety is confirmed, assess ${fitChecks} and preserve the original setup.`,
      },
      {
        title: "Escalate persistent symptoms",
        detail: `Seek clinical assessment for ${warningSigns}.`,
      },
    ],
    commonMistakes: [
      {
        mistake: `Assuming ${symptom.toLowerCase()} proves one fit error.`,
        fix: "Review load, equipment, position and health together.",
      },
      {
        mistake: "Changing several contact points at once.",
        fix: "Preserve the baseline and test one reasoned variable at a time.",
      },
      {
        mistake: "Using an accessory to ignore a persistent symptom.",
        fix: "Reduce the aggravating load and investigate rather than masking a worsening pattern.",
      },
    ],
    faq: [
      {
        question: `Does ${symptom.toLowerCase()} mean my bike fit is wrong?`,
        answer: `Not by itself. ${symptom} can be influenced by fit, equipment, recent load and health. The pattern needs assessment rather than one automatic adjustment.`,
      },
      {
        question: "Should I change my bicycle position immediately?",
        answer: "First record the setup and recent changes. Restore a recent change when it clearly preceded the symptom; otherwise test one small reversible variable only after safety is confirmed.",
      },
      {
        question: "Can a professional bike fit help?",
        answer: "It can help when position or equipment contributes, but it cannot diagnose every cause or guarantee symptom resolution.",
      },
      {
        question: "When should I seek clinical assessment?",
        answer: `Seek assessment for ${warningSigns}.`,
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote,
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  };
}

function performancePositionTrust({
  seoTitle,
  seoDescription,
  directAnswer,
}: {
  seoTitle: string;
  seoDescription: string;
  directAnswer: string;
}): Partial<AnswerPage> {
  return {
    seoTitle,
    seoDescription,
    directAnswer,
    keyTakeaways: [
      "A lower or longer position may reduce aerodynamic drag, but the net result depends on power, control and how long it can be held.",
      "Stabilise saddle and cleats before testing cockpit performance.",
      "Compare repeatable conditions using speed or time, power, perceived effort and handling—not appearance.",
      "Current position research does not prescribe one bar drop, stem or trunk angle for every rider.",
    ],
    whoFor: [
      {
        label: "The rider balancing aerodynamics and sustainability",
        detail: "You want a testable position rather than a promise that lower is always faster.",
      },
      {
        label: "The rider preparing for a specific event",
        detail: "The position must work for that speed, duration, terrain and handling demand.",
      },
    ],
    roadmanView: [
      "A position is a performance hypothesis. Test the complete result instead of scoring how professional it looks.",
      "Comfort, power, drag and control are measured together; none wins automatically for every rider or event.",
    ],
    expertEvidence: [
      {
        name: "Phil Burt",
        credential: "Former Head of Physiotherapy, British Cycling",
        insight: "Roadman's practitioner conversation supports matching position to rider and event; the research evidence remains variable and individual.",
        episodeSlug: "ep-2535-5-fixable-bike-fit-mistake-most-riders-make",
        guestSlug: "phil-burt",
      },
    ],
    practicalApplication: [
      {
        title: "Define the event demand",
        detail: "Write down likely speed, duration, terrain, control and hand-position needs.",
      },
      {
        title: "Stabilise the baseline",
        detail: "Record saddle, cleats and cockpit before changing the front end.",
      },
      {
        title: "Test one position",
        detail: "Compare repeatable power, speed or time, perceived effort and handling over a relevant duration.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Assuming a lower front end is automatically faster.",
        fix: "Measure the net result after power, drag, control and sustainability are included.",
      },
      {
        mistake: "Copying a professional rider's coordinates.",
        fix: "Fit the current rider, bicycle and event rather than a photograph.",
      },
      {
        mistake: "Testing several cockpit variables together.",
        fix: "Preserve the baseline and isolate the variable being tested.",
      },
    ],
    faq: [
      {
        question: "Is a lower cycling position always faster?",
        answer: "No. It may reduce drag, but the net result depends on the rider's power, control, breathing, handling and ability to hold it for the event.",
      },
      {
        question: "How should I test a position change?",
        answer: "Use repeatable conditions and compare power, speed or time, perceived effort and handling over a duration relevant to the event.",
      },
      {
        question: "Does comfort matter for cycling performance?",
        answer: "It matters when discomfort changes position, output, control or pacing. Comfort is one input to a net performance test, not a guaranteed proxy for speed.",
      },
      {
        question: "When should I use a professional fitter?",
        answer: "When several variables interact, a specialised position matters, or a safe repeatable position cannot be found with one reversible change.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "A 2024 systematic review found no high-quality studies among the included position research and no clear universal recommendations for several common variables (PMID 39285616).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  };
}

const saddleChoiceTrust: Partial<AnswerPage> = {
  seoTitle: "How to Choose a Cycling Saddle: Width, Shape and Testing",
  seoDescription:
    "Choose a cycling saddle by support, riding posture, pressure and a real test. Sit-bone width is useful context, not a universal add-20mm formula.",
  directAnswer:
    "Choose a cycling saddle by combining the rider's support width, riding posture, pressure pattern, bicycle position and a real test—not by padding, price or a universal sit-bone formula. Measure sit-bone width as one reference, then compare saddles compatible with the seatpost and intended posture. Cut-outs, width and padding do not produce one result for everyone. Set each test saddle to equivalent coordinates and assess it over the duration you actually ride.",
  keyTakeaways: [
    "Sit-bone width is a useful reference, not a universal instruction to add 20–30mm.",
    "Saddle shape, width, posture, setback, tilt and riding intensity interact.",
    "A cut-out, more padding or a higher price does not guarantee lower pressure or comfort.",
    "Compare saddles at equivalent coordinates over the duration and position you actually use.",
  ],
  whoFor: [
    {
      label: "The rider choosing a replacement saddle",
      detail: "You want a short list based on measured support and riding position rather than reviews alone.",
    },
    {
      label: "The rider with pressure or numbness",
      detail: "You need to assess the complete saddle position and know when persistent symptoms require care.",
    },
  ],
  roadmanView: [
    "A saddle model is not comfortable in isolation. It works—or does not—in one rider's complete position.",
    "Use measurement to narrow the test, then let repeated riding decide. Do not turn a ten-person study or a brand chart into a universal formula.",
  ],
  expertEvidence: [
    {
      name: "Dr Andy Pruitt",
      credential: "Sports-medicine physician and bike-fit practitioner",
      insight: "Roadman's conversation treats saddle and rider position as one system; controlled saddle studies remain small and design-specific.",
      episodeSlug: "ep-2186-the-correct-bike-fit-simplified-dr-pruitt",
      guestSlug: "dr-andy-pruitt",
    },
  ],
  practicalApplication: [
    {
      title: "Record the current coordinates",
      detail: "Measure saddle height, setback and tilt at repeatable points before changing model.",
    },
    {
      title: "Build a compatible shortlist",
      detail: "Use support width, riding posture, rail and seatpost compatibility and the maker's intended use.",
    },
    {
      title: "Match the test position",
      detail: "Account for saddle stack and shape so each candidate is tested at equivalent contact-point coordinates.",
    },
    {
      title: "Test the target duration",
      detail: "Use a demo scheme or return policy where possible and assess normal positions, pressure and control over real rides.",
    },
  ],
  commonMistakes: [
    {
      mistake: "Adding 20–30mm to sit-bone width as a guaranteed answer.",
      fix: "Use width as one reference and test the shape and complete position.",
    },
    {
      mistake: "Assuming a cut-out or more padding always reduces pressure.",
      fix: "Saddle design changes pressure distribution; verify the actual rider response.",
    },
    {
      mistake: "Bolting on a new saddle at the old rail mark.",
      fix: "Different stack and shapes change the effective contact point; reproduce coordinates before comparing.",
    },
  ],
  faq: [
    {
      question: "How do I know what cycling saddle width I need?",
      answer: "Sit-bone width helps create a shortlist, but posture, saddle shape and pressure distribution matter. Do not use one universal added-width formula as the final answer.",
    },
    {
      question: "Is a more padded saddle more comfortable?",
      answer: "Not automatically. Padding changes pressure and movement, but width, shape, support and position decide the result for a rider.",
    },
    {
      question: "Do I need a saddle cut-out?",
      answer: "Maybe. Cut-outs alter pressure distribution and can help some riders while creating edge pressure for others. Test the complete saddle and position.",
    },
    {
      question: "How long should I test a saddle?",
      answer: "Long enough to reproduce the positions and duration that normally create the decision. One car-park sit or short first ride cannot represent a long event.",
    },
    {
      question: "When does saddle numbness need assessment?",
      answer: "Restore recent changes and reduce the aggravating load. Persistent loss of sensation, weakness, urinary or sexual symptoms, skin breakdown or symptoms away from cycling need clinical assessment.",
    },
  ],
  evidenceLevel: "moderate",
  evidenceNote:
    "Small studies show saddle width and design can change pressure and comfort, but their samples and conditions do not establish one universal width, cut-out or padding rule (PMID 37711719; PMID 21834869; PMID 12074400).",
  updatedDate: "2026-08-25",
  reviewedBy: REVIEWER,
};

const OVERRIDES: Record<string, Partial<AnswerPage>> = {
  "signs-you-need-a-bike-fit": {
    seoTitle: "Signs You May Need a Bike Fit — And When You Need Care",
    seoDescription:
      "Recurring pain, numbness or loss of control can justify a bike-fit review, but symptoms are not proof of one position error. Use this safe decision guide.",
    directAnswer:
      "Recurring pain, numbness, increasing hand pressure, loss of control or a position you cannot hold are reasons to assess your bike fit, not proof of one faulty measurement. Record when the symptom starts, recent training and equipment changes, and the current setup. Use a fitter when several position variables interact, a mechanic when assembly or component limits are unclear, and a clinician for persistent or worsening pain, weakness, swelling or loss of sensation.",
    keyTakeaways: [
      "A recurring symptom justifies assessment; it does not diagnose saddle height, reach or cleat position.",
      "Training load, equipment and health belong in the same review as fit.",
      "A useful fit records starting and final coordinates and provides a follow-up route.",
      "Persistent numbness, weakness, swelling or pain away from the bike needs clinical assessment.",
    ],
    whoFor: [
      {
        label: "The rider with recurring discomfort",
        detail: "You want to know whether to self-check, book a fit or seek clinical assessment.",
      },
      {
        label: "The rider on a new bicycle",
        detail: "The position cannot be made repeatably comfortable without changing several variables.",
      },
    ],
    roadmanView: [
      "A symptom is a reason to investigate, not permission to invent a diagnosis.",
      "The right professional depends on the problem: fitter for position, mechanic for the bicycle and clinician for health.",
    ],
    expertEvidence: [
      {
        name: "Dr Andy Pruitt",
        credential: "Sports-medicine physician and bike-fit practitioner",
        insight:
          "Roadman's conversation with Pruitt emphasises assessing the rider and riding goal before prescribing a position. It does not create a universal symptom checklist.",
        episodeSlug: "ep-2186-the-correct-bike-fit-simplified-dr-pruitt",
        guestSlug: "dr-andy-pruitt",
      },
    ],
    practicalApplication: [
      {
        title: "Record the symptom",
        detail: "Note location, onset time, ride type, intensity and whether it occurs away from cycling.",
      },
      {
        title: "Record the bicycle",
        detail: "Measure the saddle, photograph cleats and cockpit, and list recent component or service changes.",
      },
      {
        title: "Choose the right assessment",
        detail: "Use the professional whose scope matches the unresolved problem rather than buying a guaranteed fix.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Assuming every ache is normal—or that every ache is fit.",
        fix: "Treat it as evidence and review load, equipment, position and health together.",
      },
      {
        mistake: "Changing saddle, stem and cleats at once.",
        fix: "Preserve the baseline and change one recorded variable at a time.",
      },
      {
        mistake: "Using padding to ignore persistent numbness.",
        fix: "Reduce the aggravating load and investigate persistent loss of sensation.",
      },
    ],
    faq: [
      {
        question: "Does knee pain mean I need a bike fit?",
        answer: "It can justify a fit review, but pain location does not prove one position error. Review training load and warning signs as well.",
      },
      {
        question: "Is numbness during cycling normal?",
        answer: "It is common but should not be ignored when persistent or worsening. Pressure, position, equipment and health can contribute.",
      },
      {
        question: "Can I check my fit at home first?",
        answer: "Yes when the bicycle is mechanically safe and there are no concerning symptoms. Record the baseline and test one small reversible change.",
      },
      {
        question: "What should a professional bike fit include?",
        answer: "Goals and relevant history, starting and final coordinates, rationale for each change, safe component limits and a follow-up process.",
      },
      {
        question: "When should I see a clinician instead?",
        answer: "For persistent or worsening pain, swelling, weakness, locking, giving way, night pain, symptoms away from cycling or persistent numbness.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Bike fit may help when position contributes, but evidence linking conventional fit measurements to overuse symptoms is limited and conflicting (PMID 35151569).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "why-do-my-knees-hurt-cycling": kneePainTrust,
  "cycling-knee-pain-causes-and-fixes": kneePainTrust,
  "how-to-manage-knee-pain-from-cycling": {
    ...kneePainTrust,
    seoTitle: "How to Manage Cycling Knee Pain Safely",
    seoDescription:
      "Manage cycling knee pain by reducing the aggravating load, recording training and equipment changes, and knowing when symptoms need clinical care.",
    directAnswer:
      "Manage cycling knee pain by reducing the ride or effort that reliably aggravates it, then recording the exact onset, recent training load and every equipment or position change. Pain location helps describe the symptom but cannot diagnose one cause or prescribe a saddle move. Restore a documented recent fit change when safe, and use a fitter for position. Seek clinical assessment for trauma, persistent or worsening pain, marked swelling, weakness, locking, giving way or symptoms away from cycling.",
  },
  "how-to-fix-lower-back-pain-cycling": symptomTrust({
    symptom: "Lower-back pain while cycling",
    seoTitle: "Cycling Lower-Back Pain: Fit, Load and Warning Signs",
    seoDescription:
      "Cycling lower-back pain can involve load, position, conditioning or health. Use a reversible fit check and know when symptoms need clinical assessment.",
    directAnswer:
      "Lower-back pain while cycling can involve ride duration and intensity, position, previous history, conditioning or another health issue; it does not automatically mean the stem is too long or the core is weak. Reduce the aggravating load, record onset and recent training or equipment changes, and preserve the current setup. A fitter can assess saddle and cockpit interaction. Seek clinical assessment for persistent or worsening pain, trauma, weakness, numbness or symptoms away from cycling.",
    fitChecks: "saddle stability, cockpit reach, bar height and the rider's ability to vary position",
    warningSigns:
      "persistent or worsening pain, trauma, weakness, numbness, night pain or symptoms during daily life",
    evidenceNote:
      "A 2026 review found potentially useful lower-back-pain improvements after individualised fitting in three included studies, but varied protocols and short follow-up limit generalisation (PMID 41705012).",
  }),
  "why-do-my-hands-go-numb-cycling": symptomTrust({
    symptom: "Numb hands while cycling",
    seoTitle: "Numb Hands While Cycling: Pressure, Fit and Warning Signs",
    seoDescription:
      "Numb cycling hands can involve pressure, controls, position, equipment or health. Record the pattern, reduce pressure and know when to seek assessment.",
    directAnswer:
      "Numb hands while cycling can involve sustained pressure, wrist or control position, reach, bar shape, gloves, road vibration or a non-cycling nerve problem; it does not prove the bars are too low. Change hand position and reduce the aggravating load, then record when and where numbness starts and recent cockpit changes. Restore a recent change before experimenting. Seek clinical assessment for persistent numbness, weakness, loss of grip or symptoms away from the bike.",
    fitChecks: "lever reach, wrist position, bar rotation, hand positions and weight distribution after the saddle is stable",
    warningSigns:
      "persistent numbness, weakness, loss of grip, worsening symptoms or symptoms away from cycling",
    evidenceNote:
      "This answer uses a pressure-and-position differential rather than claiming one fit cause; individual hand symptoms require assessment when persistent or associated with weakness.",
  }),
  "how-to-stop-neck-pain-cycling": symptomTrust({
    symptom: "Neck pain while cycling",
    seoTitle: "Cycling Neck Pain: Position, Load and Warning Signs",
    seoDescription:
      "Cycling neck pain can involve riding duration, vision, reach, controls or health. Use a safe cockpit check and know when persistent symptoms need care.",
    directAnswer:
      "Neck pain while cycling can involve riding duration, forward vision, cockpit reach, bar position, helmet or eyewear, recent training load and non-cycling health; it does not prove the stem is too long. Reduce the aggravating duration, record when symptoms start and preserve the current cockpit. After the saddle is stable, a fitter can assess reach, controls and posture. Seek clinical assessment for trauma, persistent or worsening pain, weakness, numbness, severe headache or symptoms away from cycling.",
    fitChecks: "forward vision, reach, bar and lever position, helmet or eyewear and the ability to vary hand position",
    warningSigns:
      "trauma, persistent or worsening pain, weakness, numbness, severe headache or symptoms away from cycling",
    evidenceNote:
      "Neck symptoms have multiple possible contributors; this answer provides a reversible position check and clinical boundary rather than a fixed stem or spacer prescription.",
  }),
  "why-do-my-feet-go-numb-cycling": symptomTrust({
    symptom: "Numb feet while cycling",
    seoTitle: "Numb Feet While Cycling: Shoes, Cleats and Warning Signs",
    seoDescription:
      "Cycling foot numbness can involve shoe pressure, closure, cleats, position or health. Preserve the setup and know when persistent symptoms need assessment.",
    directAnswer:
      "Numb feet while cycling can involve shoe width or closure, heat-related swelling, socks, insoles, cleat position, saddle interaction or a non-cycling nerve or circulation problem; it does not prove the cleat is too far forward. Reduce the aggravating pressure, record the exact area and onset time, and trace cleats before changing them. Seek clinical assessment for persistent, one-sided or worsening numbness, weakness, colour change or symptoms away from cycling.",
    fitChecks: "shoe volume and closure, socks, insoles, cleat position and the saddle-to-pedal relationship",
    warningSigns:
      "persistent, one-sided or worsening numbness, weakness, colour change, unusual swelling or symptoms away from cycling",
    evidenceNote:
      "Foot numbness has several possible mechanical and health contributors; this answer avoids a universal cleat or saddle diagnosis and preserves a clinical boundary.",
  }),
  "how-to-set-saddle-height": {
    seoTitle: "How to Set Cycling Saddle Height: A Dynamic Check",
    seoDescription:
      "Use an inseam estimate, record the baseline and check saddle height while pedalling. Static and dynamic knee angles differ, so the method matters.",
    directAnswer:
      "Set cycling saddle height as a repeatable range, not one universal number. Record the current bottom-bracket-to-saddle measurement, use an inseam formula only as a starting estimate, then film normal pedalling with the camera square to the bike. Static bottom-dead-centre, dynamic bottom-dead-centre and maximum-extension knee angles differ, so quote the method with any angle. Test one small reversible change and restore the baseline if comfort or control worsens.",
    keyTakeaways: [
      "Record the original height at a repeatable saddle point before adjusting it.",
      "An inseam multiplier is an estimate; it does not see ankle movement, crank length or saddle compression.",
      "Static and dynamic knee-angle measurements are not interchangeable.",
      "Do not diagnose pain or promise watts from one saddle-height number.",
    ],
    whoFor: [
      {
        label: "The rider setting up a familiar road bike",
        detail: "You want a recoverable home baseline without pretending a formula is a personal fit.",
      },
      {
        label: "The rider comparing conflicting angle advice",
        detail: "You need to understand why static and dynamic numbers differ.",
      },
    ],
    roadmanView: [
      "The angle is incomplete without the measurement condition.",
      "A saddle-height change needs an undo button: record it, change one thing and repeat the same ride.",
    ],
    expertEvidence: [
      {
        name: "Daryl Fitzgerald",
        credential: "Bike fitter and biomechanics practitioner",
        insight:
          "Roadman's practitioner conversation supports observing the rider while pedalling; research separately shows why static and dynamic angle methods cannot be mixed.",
        episodeSlug: "ep-1-pro-bike-fitter-reveals-the-1-change-amateurs-should-make",
      },
    ],
    practicalApplication: [
      {
        title: "Mark the baseline",
        detail: "Measure from bottom-bracket centre to the same marked point on the saddle and photograph seatpost exposure.",
      },
      {
        title: "Film a repeatable condition",
        detail: "Use normal shoes, pedals and shorts; place the camera square to the bike and pedal at an easy-to-moderate load.",
      },
      {
        title: "Test one small change",
        detail: "Keep setback and tilt fixed, repeat a comparable easy ride and restore the original if the result is worse.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Publishing 25–35 degrees without saying how it was measured.",
        fix: "Name static or dynamic, the crank condition and the video method.",
      },
      {
        mistake: "Treating an inseam formula as the final position.",
        fix: "Use it to start, then observe normal pedalling and the rider's response.",
      },
      {
        mistake: "Moving height, setback and cleats together.",
        fix: "Hold the other contact points steady so the height test can be interpreted.",
      },
    ],
    faq: [
      {
        question: "What knee angle should I use for saddle height?",
        answer: "A number is meaningful only with its measurement method. Static and dynamic measurements differ; use one repeatable method and assess a range rather than chasing one degree.",
      },
      {
        question: "Is the LeMond or Hamley formula accurate?",
        answer: "It can provide a starting estimate, but anthropometric methods do not place every rider inside a proposed dynamic knee-angle range.",
      },
      {
        question: "Does hip movement prove the saddle is too high?",
        answer: "No. It is a reason to inspect the setup, but camera angle, mobility, asymmetry, load and other fit variables can contribute.",
      },
      {
        question: "Can saddle height fix knee pain?",
        answer: "It may help when height contributes, but pain does not diagnose saddle position. Review load and seek assessment for persistent or concerning symptoms.",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Dynamic and static saddle-height methods produce different knee-angle results, and inseam formulas do not fit every rider (PMID 32022807; PMID 22190163; PMID 34706617).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "is-a-professional-bike-fit-worth-it": {
    seoTitle: "Is a Professional Bike Fit Worth It? A Decision Guide",
    seoDescription:
      "A professional bike fit can be useful for persistent symptoms, interacting changes or specialised positions. What it should include and what it cannot promise.",
    directAnswer:
      "A professional bike fit is worth considering when persistent symptoms or a new bike cannot be resolved with one safe, reversible change; several contact points interact; or a specialised race position matters. It should document your goals, starting and final coordinates, rationale and follow-up. A fit cannot guarantee watts, prevent every injury or diagnose a medical condition. Use a mechanic for assembly limits and a clinician for persistent or concerning symptoms.",
    keyTakeaways: [
      "Buy an assessment for a defined problem, not a guaranteed watt number.",
      "Starting and final coordinates make the result transferable and reversible.",
      "Technology can add information; it does not calculate one perfect position automatically.",
      "There is no evidence-backed weekly-hour threshold or fixed global re-fit schedule.",
    ],
    whoFor: [
      {
        label: "The rider with interacting fit variables",
        detail: "Saddle, cleats and cockpit cannot be assessed as isolated tweaks.",
      },
      {
        label: "The rider with a specialised position",
        detail: "Handling, aerodynamics and event duration need to be tested together.",
      },
    ],
    roadmanView: [
      "The deliverable is a documented, testable position—not a promise that expensive equipment finds free power.",
      "A credible fitter explains uncertainty and knows when the problem belongs with a mechanic or clinician.",
    ],
    expertEvidence: [
      {
        name: "Dr Andy Pruitt",
        credential: "Sports-medicine physician and bike-fit practitioner",
        insight: "Roadman's conversation emphasises an individual assessment rather than fitting the rider to one template.",
        episodeSlug: "ep-2186-the-correct-bike-fit-simplified-dr-pruitt",
        guestSlug: "dr-andy-pruitt",
      },
    ],
    practicalApplication: [
      {
        title: "Define the problem",
        detail: "Write down the riding goal, symptom or setup constraint the fit needs to resolve.",
      },
      {
        title: "Ask for the deliverables",
        detail: "Confirm that coordinates, changes, safe limits and follow-up are included before booking.",
      },
      {
        title: "Check scope",
        detail: "Verify whether the provider is acting as fitter, mechanic, clinician or more than one qualified role.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Booking because an article says every five-hour rider needs a fit.",
        fix: "Book for a defined position problem, material change or specialised goal.",
      },
      {
        mistake: "Assuming motion capture guarantees accuracy.",
        fix: "Judge the assessment, interpretation, documentation and follow-up—not the equipment list.",
      },
      {
        mistake: "Expecting a fitter to diagnose persistent pain.",
        fix: "Use an appropriately qualified clinician when health assessment is required.",
      },
    ],
    faq: [
      {
        question: "How much should a professional bike fit cost?",
        answer: "Prices vary by country, scope, provider and follow-up. Compare the assessment and deliverables rather than using a global price from an article.",
      },
      {
        question: "Can a professional bike fit add power?",
        answer: "It may remove a constraint for a particular rider, but no fitter can guarantee a watt gain. Training creates fitness and the fit changes the rider-bicycle interface.",
      },
      {
        question: "How often should I repeat a fit?",
        answer: "Reassess after a material change in rider, bicycle, contact points, symptoms or goals. There is no universal two-year rule.",
      },
      {
        question: "Should I fit before buying a new bike?",
        answer: "It can be useful when sizing is uncertain or a specialised position matters, because it identifies the contact-point range the new frame must support.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Individualised fitting may improve comfort in some studied groups, but protocols and evidence quality vary; guaranteed performance and injury-prevention claims are not supported (PMID 35151569; PMID 41705012).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "how-to-set-cleat-position": {
    seoTitle: "How to Set Cycling Cleat Position Safely",
    seoDescription:
      "Mark the original cleat, follow the shoe and pedal range, preserve natural rotation and change one dimension at a time. Evidence and warning signs.",
    directAnswer:
      "Set cycling cleats by tracing the original position, staying within the shoe and pedal maker's adjustment range, and letting the foot follow a comfortable rotation rather than forcing it straight. Change fore-aft separately from rotation and tighten fasteners to the specified torque. Research shows fore-aft changes can alter joint angles but does not support a universal power gain. Restore the baseline if new pain, numbness or focal pressure appears.",
    keyTakeaways: [
      "Trace both cleats before loosening them.",
      "Follow the component maker's range, fastener and torque instructions.",
      "Do not force foot rotation or prescribe one float number for every rider.",
      "A rearward cleat can change kinematics; it does not automatically add power or recruit a preferred muscle group.",
    ],
    whoFor: [
      {
        label: "The rider replacing cleats",
        detail: "You want to preserve a known position or make a controlled change.",
      },
      {
        label: "The rider comparing fore-aft advice",
        detail: "You need evidence limits rather than a universal 5–10mm instruction.",
      },
    ],
    roadmanView: [
      "The first cleat mark is the route home if an experiment fails.",
      "Fore-aft and rotation are different variables. Move one, record it and keep the other stable.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Fact-check against controlled cleat-position research",
        insight: "A 15mm fore-aft change altered joint kinematics in one controlled trial but not the measured performance, physiological or muscle-activity outcomes.",
      },
    ],
    practicalApplication: [
      {
        title: "Trace the cleat",
        detail: "Use a fine marker or template to preserve fore-aft and rotation on each shoe.",
      },
      {
        title: "Check the system",
        detail: "Inspect wear and use the shoe and pedal maker's compatible range and torque.",
      },
      {
        title: "Test one dimension",
        detail: "Change fore-aft or rotation—not both—and repeat a comparable easy ride.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Moving every cleat backwards by the same number.",
        fix: "Test a defined problem inside the component range and preserve the baseline.",
      },
      {
        mistake: "Forcing both feet to point straight.",
        fix: "Allow a comfortable individual rotation within the pedal system's safe setup.",
      },
      {
        mistake: "Changing cleats and saddle together.",
        fix: "Keep the saddle stable so the cleat result can be interpreted.",
      },
    ],
    faq: [
      {
        question: "Should the ball of my foot be over the pedal axle?",
        answer: "It is a common starting reference, not a universal final position. Shoe construction, cleat range, riding goal and individual response matter.",
      },
      {
        question: "Should I move my cycling cleats backwards?",
        answer: "Only for a defined reason and as a controlled test. Research does not show a universal performance gain from a rearward move.",
      },
      {
        question: "How much cleat float should I use?",
        answer: "Use the pedal maker's options and a setup that does not force the foot. There is no evidence-backed single degree prescription for every rider.",
      },
      {
        question: "When should cleat discomfort be assessed?",
        answer: "Restore the original position for new symptoms. Persistent numbness, pain, weakness or symptoms away from cycling need appropriate assessment.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "A controlled 12-cyclist trial found that 15mm cleat fore-aft changes altered joint kinematics but not its measured performance, physiological or muscle-activity outcomes (PMID 35129429).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "should-i-switch-to-shorter-cranks": {
    seoTitle: "Should I Use Shorter Cranks? Evidence for Cyclists",
    seoDescription:
      "Shorter cranks can create hip and knee clearance, but they do not guarantee power or pain relief. How to test 165–175mm as part of the full bike fit.",
    directAnswer:
      "Consider shorter cranks when a fitter needs more hip or knee clearance at the top of the pedal stroke, not because height or age automatically prescribes a length. In one randomised crossover trial, trained male cyclists produced similar measured power and efficiency on 165mm, 170mm and 175mm cranks, although perceived fatigue differed in some comparisons. A crank change also requires the saddle relationship, gearing feel and pedal clearance to be reassessed.",
    keyTakeaways: [
      "Shorter cranks reduce the pedal circle and can create fit space for a particular rider.",
      "Height, sex or age alone does not prescribe one crank length.",
      "A practical 165–175mm range produced similar measured power in one trained-male sample.",
      "Rebuild saddle height and check gearing feel and pedal clearance after a change.",
    ],
    whoFor: [
      {
        label: "The rider with limited clearance in a specialised position",
        detail: "A fitter is considering crank length as part of the whole setup.",
      },
      {
        label: "The rider worried about losing leverage",
        detail: "You want measured evidence rather than a free-watts promise.",
      },
    ],
    roadmanView: [
      "Crank length is fit space, not a personality test or a guaranteed upgrade.",
      "Compare the complete rebuilt position, not a new crank against an unchanged saddle and a historical best ride.",
    ],
    expertEvidence: [
      {
        name: "Phil Burt",
        credential: "Former Head of Physiotherapy, British Cycling",
        insight: "Roadman's practitioner conversation makes crank length part of the whole fit; the cited trial provides the separate performance evidence.",
        episodeSlug: "ep-2535-5-fixable-bike-fit-mistake-most-riders-make",
        guestSlug: "phil-burt",
      },
    ],
    practicalApplication: [
      {
        title: "Define the constraint",
        detail: "Identify whether top-of-stroke clearance, a specialised position or component compatibility is the actual problem.",
      },
      {
        title: "Model the whole change",
        detail: "Account for saddle height, gearing, chainring compatibility and pedal clearance before buying.",
      },
      {
        title: "Repeat the same test",
        detail: "Compare a stable submaximal effort and position after adaptation rather than using one first-ride sensation.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Using rider height to prescribe 165mm or 170mm automatically.",
        fix: "Assess the rider, bicycle, riding goal and position together.",
      },
      {
        mistake: "Promising 10–20 watts from shorter cranks.",
        fix: "Present clearance and comfort as possible fit outcomes, not guaranteed power.",
      },
      {
        mistake: "Leaving saddle height unchanged after a crank swap.",
        fix: "Rebuild the saddle-to-pedal relationship and record the final setup.",
      },
    ],
    faq: [
      {
        question: "Do shorter cranks reduce cycling power?",
        answer: "Not necessarily. One crossover trial found no significant measured power or efficiency difference among 165mm, 170mm and 175mm in trained male cyclists.",
      },
      {
        question: "Do shorter cranks fix knee or hip pain?",
        answer: "They may create useful clearance in a particular fit, but they cannot guarantee pain relief. Persistent symptoms need appropriate assessment.",
      },
      {
        question: "What crank length should a rider under 178cm use?",
        answer: "Height alone cannot prescribe it. Leg proportions, joint range, bicycle, discipline and complete position matter.",
      },
      {
        question: "What changes with a shorter crank?",
        answer: "The pedal circle, top-of-stroke closure and saddle-to-pedal relationship change; gearing feel and pedal clearance may also need review.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "A randomised crossover trial in 28 trained male cyclists found no significant measured power or efficiency differences among 165mm, 170mm and 175mm cranks; some perceived-fatigue comparisons differed (PMID 40342376).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "how-often-update-bike-fit": {
    seoTitle: "How Often Should You Update a Bike Fit?",
    seoDescription:
      "There is no universal two-year bike-fit schedule. Reassess after a material change in rider, bicycle, contact points, symptoms or riding goals.",
    directAnswer:
      "There is no evidence-backed rule to repeat a bike fit every two or three years. Reassess when something material changes: a bicycle, saddle, shoes, pedals or cranks; a new riding discipline; an injury or surgery; persistent new symptoms; or a position you can no longer hold. Keep the previous fit coordinates so a review can distinguish equipment drift from a real change in the rider's needs.",
    keyTakeaways: [
      "Use change and symptoms to trigger review, not a universal calendar rule.",
      "Record coordinates so saddle or cockpit slippage is not mistaken for body change.",
      "A new contact point can justify a focused check without repeating every part of a fit.",
      "Injury and persistent symptoms may require clinical input as well as fit review.",
    ],
    whoFor: [
      {
        label: "The rider with an older fit report",
        detail: "You want to know whether anything material has changed before booking again.",
      },
      {
        label: "The rider changing equipment or discipline",
        detail: "The current coordinates may not transfer directly to the new setup.",
      },
    ],
    roadmanView: [
      "A fit is worth reviewing when the evidence changes—not because an article's calendar alarm expires.",
      "Coordinates turn a vague feeling into a comparison: bicycle drift, rider change or a different riding goal.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Bike-fit evidence and content governance",
        insight: "Current research does not establish one preventive re-fit interval for asymptomatic cyclists.",
      },
    ],
    practicalApplication: [
      {
        title: "Compare coordinates",
        detail: "Check saddle height, setback, tilt, cleats and cockpit against the last documented fit.",
      },
      {
        title: "List material changes",
        detail: "Include bicycle, components, discipline, injury, surgery and persistent symptoms.",
      },
      {
        title: "Book the scope you need",
        detail: "A focused transfer or contact-point check may be enough; several interacting changes justify a full review.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Booking automatically every two years without checking the bike.",
        fix: "Compare documented coordinates and identify a material change first.",
      },
      {
        mistake: "Assuming age alone requires a higher and shorter position.",
        fix: "Assess the rider's current capacity and riding goal, not a birthday stereotype.",
      },
      {
        mistake: "Using a fit review instead of clinical rehabilitation after injury.",
        fix: "Coordinate position changes with the appropriate clinician when health is involved.",
      },
    ],
    faq: [
      {
        question: "Should every cyclist repeat a bike fit every two years?",
        answer: "No. There is no universal evidence-backed interval. Review after a material rider, bicycle, symptom or goal change.",
      },
      {
        question: "Does a new saddle require a new fit?",
        answer: "It requires the position to be checked because saddle shape changes the reference point. A focused transfer may be enough when the rest is stable.",
      },
      {
        question: "Does getting older automatically change bike fit?",
        answer: "No. Capacity, symptoms and goals can change at any age. Assess the individual instead of prescribing a position from age alone.",
      },
      {
        question: "Should I review fit after injury or surgery?",
        answer: "Often yes, but coordinate it with the clinician managing recovery. A fitter should not replace medical assessment or rehabilitation.",
      },
    ],
    evidenceLevel: "anecdotal",
    evidenceNote:
      "No controlled evidence establishes one preventive re-fit interval for every cyclist; this answer uses a change-triggered decision framework rather than a fixed schedule.",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "how-to-check-saddle-fore-aft-position": {
    seoTitle: "How to Check Saddle Fore-Aft Without Treating KOPS as Law",
    seoDescription:
      "Use KOPS as a repeatable reference, not proof of correct saddle position. Record height and setback together and do not use the saddle to fix reach.",
    directAnswer:
      "Check saddle fore-aft by recording setback and using KOPS only as a repeatable reference with the cranks level—not as proof of an ideal position. Do not slide the saddle to fix cockpit reach. A fore-aft change also alters support over the bike and effective leg extension, so record saddle height with it. Test one small reversible change for balance and pedalling; pain location alone does not prescribe a direction.",
    keyTakeaways: [
      "KOPS is a reference, not a universal biomechanical rule.",
      "Use stem and cockpit decisions for reach; do not repurpose saddle setback.",
      "Record saddle height and setback together because they interact.",
      "Front or back knee pain does not prove the saddle should move in one direction.",
    ],
    whoFor: [
      {
        label: "The rider using a home plumb line",
        detail: "You want a repeatable record without turning KOPS into a diagnosis.",
      },
      {
        label: "The rider tempted to shorten reach with the saddle",
        detail: "You need to separate pedalling support from cockpit fit.",
      },
    ],
    roadmanView: [
      "KOPS can tell you where the knee is relative to the pedal. It cannot tell you that the whole position is correct.",
      "Setback belongs to the saddle system; cockpit reach belongs to the front end.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Fact-check against cycling biomechanics research",
        insight: "Research on setback changes can describe altered joint forces, but evidence connecting one setback measure to pain remains inconclusive.",
      },
    ],
    practicalApplication: [
      {
        title: "Record height and setback",
        detail: "Use repeatable bicycle and saddle reference points before moving the saddle.",
      },
      {
        title: "Record KOPS as context",
        detail: "If used, repeat the same crank position, rider posture and kneecap landmark.",
      },
      {
        title: "Test balance, not a line",
        detail: "Make one small change and reassess normal pedalling and control on a comparable easy ride.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Treating the plumb line as a pass/fail test.",
        fix: "Use it as one recorded reference alongside riding goal and rider response.",
      },
      {
        mistake: "Sliding the saddle to make the bars feel closer.",
        fix: "Assess reach through the cockpit after the saddle is stable.",
      },
      {
        mistake: "Diagnosing knee pain from setback.",
        fix: "Review load, fit, equipment and health together.",
      },
    ],
    faq: [
      {
        question: "Should my knee be directly over the pedal spindle?",
        answer: "Not as a universal rule. It is a repeatable reference that must be interpreted with the whole position and riding goal.",
      },
      {
        question: "Can saddle fore-aft cause knee pain?",
        answer: "It may contribute for a particular rider, but pain does not diagnose setback and current evidence is not strong enough for a universal symptom map.",
      },
      {
        question: "Should I move my saddle to change reach?",
        answer: "No. Stabilise the saddle for pedalling support, then assess stem, bar and controls for cockpit reach.",
      },
      {
        question: "Does changing setback affect saddle height?",
        answer: "It changes the rider's effective relationship to the pedal, so height and setback should be recorded and reassessed together.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Setback changes can alter modelled knee forces, while its relationship to pain remains inconclusive (PMID 29920153; PMID 35151569).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "how-to-adjust-handlebar-height-cycling": {
    seoTitle: "How to Adjust Road-Bike Handlebar Height Safely",
    seoDescription:
      "Set handlebar height after the saddle, record the cockpit and respect steerer limits. When spacers or an integrated front end need a mechanic.",
    directAnswer:
      "Adjust road-bike handlebar height only after the saddle is stable and after recording spacer order, stem angle, bar rotation and lever position. There is no universal saddle-to-bar drop. Threadless spacer changes must preserve headset preload, steerer support, insertion and manufacturer torque limits. Carbon steerers, integrated cockpits, already-cut forks or unclear limits belong with a qualified mechanic. Test one small change for steering, braking, vision and sustainable comfort.",
    keyTakeaways: [
      "Stabilise the saddle before assessing the front end.",
      "Record spacer order, stem angle, bar rotation and controls before moving anything.",
      "There is no universal 2–6cm bar-drop range for every amateur.",
      "Carbon, integrated or unclear steerer systems need qualified mechanical work.",
    ],
    whoFor: [
      {
        label: "The rider assessing reach and drop",
        detail: "You need a safe, reversible cockpit test after the saddle is stable.",
      },
      {
        label: "The rider with an integrated or carbon front end",
        detail: "You need to know when a generic spacer tutorial is not appropriate.",
      },
    ],
    roadmanView: [
      "Handlebar height is a control and sustainability decision before it is an appearance decision.",
      "A spacer is simple only when the steerer system, torque and support limits are understood.",
    ],
    expertEvidence: [
      {
        name: "Phil Burt",
        credential: "Former Head of Physiotherapy, British Cycling",
        insight: "Roadman's conversation provides practitioner context for a position the rider can control and sustain; it does not prescribe one drop measurement.",
        episodeSlug: "ep-2535-5-fixable-bike-fit-mistake-most-riders-make",
        guestSlug: "phil-burt",
      },
    ],
    practicalApplication: [
      {
        title: "Photograph the front end",
        detail: "Capture spacer order, stem orientation, bar rotation and lever position.",
      },
      {
        title: "Check the component instructions",
        detail: "Confirm steerer, spacer, torque and headset-preload requirements before loosening anything.",
      },
      {
        title: "Test control",
        detail: "After a safe small change, check steering, braking, forward vision, hand pressure and the position over a comparable ride.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Copying a spacer tutorial onto every cockpit.",
        fix: "Use the exact fork, stem and headset instructions or a qualified mechanic.",
      },
      {
        mistake: "Chasing a universal bar-drop number.",
        fix: "Assess the rider, bicycle, controls and riding goal together.",
      },
      {
        mistake: "Changing bar height to compensate for an unstable saddle.",
        fix: "Stabilise saddle height, setback and tilt before the cockpit.",
      },
    ],
    faq: [
      {
        question: "How low should road-bike handlebars be?",
        answer: "There is no universal measurement. The position must allow steering, braking, forward vision, varied hand positions and the duration required by the riding goal.",
      },
      {
        question: "Can I rearrange headset spacers myself?",
        answer: "Only when you understand the exact threadless system, preload, steerer support and torque requirements. Use a mechanic for carbon, integrated or unclear systems.",
      },
      {
        question: "Will lower handlebars make me faster?",
        answer: "A lower posture may reduce drag, but only a controlled test can show the net result after power, handling and sustainability are considered.",
      },
      {
        question: "Do neck pain or numb hands prove my bars are too low?",
        answer: "No. They justify assessment, but reach, controls, load, technique, equipment and health can also contribute.",
      },
    ],
    evidenceLevel: "anecdotal",
    evidenceNote:
      "Handlebar-height evidence is individual and low quality; this answer prioritises manufacturer mechanical limits, rider control and reversible testing over a universal drop prescription.",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "how-aggressive-should-my-position-be": performancePositionTrust({
    seoTitle: "How Aggressive Should My Cycling Position Be?",
    seoDescription:
      "Choose a cycling position by testing power, drag, control and event duration. There is no universal saddle-to-bar drop or rule that lower is faster.",
    directAnswer:
      "Your cycling position should be only as low and long as produces the best repeatable result for the event after power, aerodynamic drag, control and sustainability are considered. There is no universal bar drop for amateurs and pain-free does not automatically mean optimal. Stabilise saddle and cleats, record the cockpit, then test one small position change in repeatable conditions over a relevant duration. Restore the baseline if control, output or symptoms worsen.",
  }),
  "bike-fit-comfort-vs-power": performancePositionTrust({
    seoTitle: "Bike Fit: Comfort vs Power Is a Test, Not a Rule",
    seoDescription:
      "Comfort and power are not guaranteed trade-offs. Test position, output, drag, control and duration together for the riding you actually do.",
    directAnswer:
      "Comfort and power are not automatic opposites. A position that feels easier may let one rider sustain output, while another change may reduce drag without reducing power; only a repeatable event-specific test shows the net result. Record the baseline, stabilise saddle and cleats, and compare one cockpit change using power, speed or time, perceived effort and control. Do not promise that comfort adds watts or that an aggressive position is always faster.",
  }),
  "aero-without-losing-power": performancePositionTrust({
    seoTitle: "Cycling Aero Position Without Losing Power: How to Test",
    seoDescription:
      "Test an aero cycling position with power, speed, control and duration. Lower drag is useful only when the complete event result improves.",
    directAnswer:
      "To pursue a more aerodynamic cycling position without assuming power will hold, stabilise the saddle and cleats, record the cockpit, then change one front-end variable. Compare repeatable runs using power, speed or time, perceived effort and handling over the duration the event requires. A lower posture may reduce drag, but the net result can be worse if output, vision or control declines. Field testing is evidence; how low the position looks is not.",
  }),
  "does-bike-fit-change-with-age": {
    seoTitle: "Does Bike Fit Change With Age? Assess the Rider, Not a Number",
    seoDescription:
      "Age alone does not prescribe higher bars, shorter reach or shorter cranks. Reassess current capacity, symptoms, equipment and riding goals.",
    directAnswer:
      "Bike fit does not change automatically at a particular age. Reassess the individual when current range of motion, strength, health, symptoms, equipment or riding goals materially change. Some older riders may prefer more stack, less reach or a different crank length; others do not need those changes. Preserve the previous coordinates and test the present rider rather than assuming that everyone over 40 has lost flexibility or needs a less aggressive position.",
    keyTakeaways: [
      "Age is context, not a bike-fit prescription.",
      "Assess current capacity, health, symptoms and riding goals directly.",
      "Higher bars, shorter reach and shorter cranks are possible tools—not automatic masters settings.",
      "Compare documented coordinates when the rider or equipment materially changes.",
    ],
    whoFor: [
      {
        label: "The masters rider reviewing an older fit",
        detail: "You want an individual reassessment without an age stereotype.",
      },
      {
        label: "The rider returning after injury or time away",
        detail: "Current capacity and goals may differ from the previous position.",
      },
    ],
    roadmanView: [
      "Fit the rider who is here today—not the birth certificate and not the rider from ten years ago.",
      "Masters cyclists deserve measurement and choice, not a mandatory upright position.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Masters-cycling and bike-fit content governance",
        insight: "Current research does not establish one age threshold or mandatory position change for cyclists.",
      },
    ],
    practicalApplication: [
      {
        title: "Compare current capacity",
        detail: "Record what position can be controlled and held now, without assuming the direction of change.",
      },
      {
        title: "Compare coordinates",
        detail: "Use the prior fit report to separate bicycle drift from a new rider need.",
      },
      {
        title: "Test the relevant event",
        detail: "Assess power, control and sustainability for the duration and terrain the rider actually targets.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Raising the bars automatically after 40.",
        fix: "Assess current capacity and the riding goal before choosing a direction.",
      },
      {
        mistake: "Assuming every older rider needs shorter cranks.",
        fix: "Use crank length when it solves a measured fit constraint.",
      },
      {
        mistake: "Using age instead of investigating a new symptom.",
        fix: "Review load, equipment, position and health; seek clinical assessment when indicated.",
      },
    ],
    faq: [
      {
        question: "Should cyclists over 40 raise their handlebars?",
        answer: "Not automatically. Bar height should follow current control, position, event demand and rider response rather than age alone.",
      },
      {
        question: "Do older cyclists need shorter cranks?",
        answer: "Only when a shorter crank solves a specific clearance or position constraint. Age alone does not prescribe length.",
      },
      {
        question: "Does flexibility always decline enough to change bike fit?",
        answer: "No universal amount or fit consequence applies. Assess the individual's current range, strength, health and riding goal.",
      },
      {
        question: "When should a masters rider review fit?",
        answer: "After a material change in symptoms, health, capacity, bicycle, contact points or riding goals—not on a birthday or fixed calendar rule.",
      },
    ],
    evidenceLevel: "anecdotal",
    evidenceNote:
      "No controlled evidence establishes one age threshold or mandatory bike-fit change; the framework uses individual reassessment and the same mechanical and clinical boundaries as the canonical guide.",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "womens-bike-fit": {
    seoTitle: "Women's Bike Fit: Fit the Individual Rider",
    seoDescription:
      "Women's bike fit should assess the individual rider, controls, saddle, cockpit and goals—not apply one anatomy or women-specific component rule.",
    directAnswer:
      "Women's bike fitting should use the same individual process as any good fit: assess the rider's proportions, current capacity, symptoms, contact points, controls and riding goal. Sex or gender alone does not prescribe a saddle shape, handlebar width, stem or crank length. Some riders need narrower controls, different lever reach or another saddle; others do not. Choose components from measured fit and response, not a women-specific label or a scaled men's template.",
    keyTakeaways: [
      "Fit the individual; sex or gender does not prescribe one component list.",
      "Check hand access to controls, saddle support, cockpit and crank clearance directly.",
      "A women-specific label is neither proof of suitability nor a reason to reject a component.",
      "Research includes far fewer female participants, so broad sex-based claims require extra caution.",
    ],
    whoFor: [
      {
        label: "The rider underserved by stock contact points",
        detail: "Controls, saddle or cockpit do not support a stable position.",
      },
      {
        label: "The rider comparing women-specific equipment",
        detail: "You want measured fit criteria rather than a marketing label.",
      },
    ],
    roadmanView: [
      "Individual assessment is the method. A category label cannot substitute for measuring the rider.",
      "The component is right when it supports this rider, bicycle and goal—not when the packaging chooses the demographic.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Fact-check against current cycling-position research",
        insight: "A recent position review identified major underrepresentation of female participants, limiting confident sex-specific prescriptions.",
      },
    ],
    practicalApplication: [
      {
        title: "Check control access",
        detail: "Verify reliable braking and shifting from every hand position used.",
      },
      {
        title: "Assess contact points separately",
        detail: "Evaluate saddle support, bar and lever position, shoes and cleats without assuming one package.",
      },
      {
        title: "Test the complete position",
        detail: "Use the target duration and terrain to assess control, pressure and sustainability.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Prescribing a women-specific saddle from sex alone.",
        fix: "Assess support, pressure, posture and riding goal for the individual.",
      },
      {
        mistake: "Assuming every woman needs narrower bars or shorter reach.",
        fix: "Measure control access, proportions and handling rather than applying a category rule.",
      },
      {
        mistake: "Ignoring a component because it lacks a women's label.",
        fix: "Choose by compatibility and measured fit.",
      },
    ],
    faq: [
      {
        question: "Do women need a different bike-fit method?",
        answer: "No separate universal method is required. A good fit assesses the individual rider, bicycle and goal.",
      },
      {
        question: "Do women need women-specific saddles?",
        answer: "Not automatically. Saddle suitability depends on the rider's support, posture, pressure and intended use, not the label alone.",
      },
      {
        question: "Should women use narrower handlebars?",
        answer: "Only when measured shoulder, control, handling and position needs support it. Sex alone cannot prescribe width.",
      },
      {
        question: "Do women need shorter cranks?",
        answer: "Crank length should solve a measured fit constraint. Height, proportions, clearance, bicycle and discipline matter; sex alone does not prescribe it.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "A 2024 cycling-position review included far fewer female than male participants and found few studies addressed sex-specific effects, limiting broad prescriptions (PMID 39285616).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "handlebar-width-cycling": {
    seoTitle: "Cycling Handlebar Width: Control, Fit and Aero Testing",
    seoDescription:
      "Shoulder width is one bike-fit reference, not a universal bar rule. Choose road handlebar width by controls, handling, position and repeatable testing.",
    directAnswer:
      "Choose cycling handlebar width from the rider's shoulder and hand position, control reach, terrain, bicycle geometry and performance goal—not one universal centimetre rule. Shoulder width is a starting reference. Narrower bars may reduce frontal area, while a different width can change upper-body muscle activity and handling; neither outcome is guaranteed for every rider. Confirm how the brand measures width, preserve lever access, and test control before cutting bars or buying an integrated cockpit.",
    keyTakeaways: [
      "Shoulder width is a starting reference, not a pass/fail rule.",
      "Brand measurement conventions and flare can make equal labelled widths different.",
      "Narrower may reduce frontal area, but handling, controls and the whole position decide the result.",
      "Test before cutting a bar or committing to an integrated cockpit.",
    ],
    whoFor: [
      {
        label: "The rider replacing road handlebars",
        detail: "You need to compare measurement conventions, controls and handling.",
      },
      {
        label: "The rider considering narrower bars",
        detail: "You want an aero test without assuming breathing or power outcomes.",
      },
    ],
    roadmanView: [
      "Bar width is a control surface first and an aerodynamic variable second; the complete result must be tested.",
      "A width printed on two boxes may not describe the same centre-to-centre points, flare or hood position.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Fact-check against current handlebar-width research",
        insight: "One small female-cyclist study found width-related kinematic and muscle-activity differences; it does not prescribe one width for all riders.",
      },
    ],
    practicalApplication: [
      {
        title: "Confirm the measurement convention",
        detail: "Check centre-to-centre or outside-to-outside, hood width, drop flare and control placement.",
      },
      {
        title: "Check control and handling",
        detail: "Verify braking, shifting, climbing and descending before testing aerodynamics.",
      },
      {
        title: "Test before committing",
        detail: "Use a reversible setup where possible and avoid cutting or buying an integrated cockpit from one rule.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Equating labelled bar width across every brand.",
        fix: "Check the maker's exact measurement points and flare.",
      },
      {
        mistake: "Assuming narrower cannot affect control or power.",
        fix: "Test the complete position and terrain demands.",
      },
      {
        mistake: "Treating shoulder width as the final answer.",
        fix: "Include hand position, controls, handling and goal.",
      },
    ],
    faq: [
      {
        question: "Should road handlebars match shoulder width?",
        answer: "It is a common starting reference, not a universal final width. Controls, flare, terrain, position and rider response matter.",
      },
      {
        question: "Are narrower handlebars faster?",
        answer: "They may reduce frontal area, but only a test that includes power, control and position can show the net result for a rider.",
      },
      {
        question: "Can narrow handlebars restrict breathing?",
        answer: "Do not assume one predictable effect. Width can change upper-body position, but breathing and performance need to be tested in the complete setup.",
      },
      {
        question: "Why do two 40cm handlebars feel different?",
        answer: "Brands may use different measurement conventions, flare, reach, drop and hood placement. Compare the exact geometry rather than the label alone.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "A small study in female cyclists reported width-related differences in upper-body muscle activity and kinematics; its sample does not establish one universal prescription (PMID 39846669).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "handlebar-reach-and-stem": {
    seoTitle: "Road-Bike Reach and Stem Length: A Safe Fit Check",
    seoDescription:
      "Set road-bike reach only after the saddle is stable. There is no universal stem length; check controls, handling, frame geometry and component limits.",
    directAnswer:
      "Set road-bike reach only after saddle height, setback and tilt are stable. There is no universal stem length or elbow angle. Record the current stem, spacers, bar and lever position, then assess braking and shifting access, relaxed elbows, forward vision, hand pressure and steering over the riding duration required. A large stem change alters handling and may expose a frame-size mismatch. Respect steerer and torque limits and use a mechanic for integrated or unclear systems.",
    keyTakeaways: [
      "Stabilise the saddle before using the cockpit to set reach.",
      "Stem length, bar reach, hood position and frame reach interact.",
      "A position must preserve braking, shifting, vision and steering.",
      "Large or mechanically unclear changes need a qualified mechanic or frame-size review.",
    ],
    whoFor: [
      {
        label: "The rider who feels stretched or cramped",
        detail: "You need to separate cockpit reach from saddle position.",
      },
      {
        label: "The rider considering a stem swap",
        detail: "You need to include handling and mechanical limits in the decision.",
      },
    ],
    roadmanView: [
      "Reach is the whole saddle-to-controls relationship, not just the number printed on the stem.",
      "A cockpit change is successful only when controls, steering and the target duration still work.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Bike-fit and mechanical safety governance",
        insight: "Current evidence does not establish one stem length or cockpit reach for every rider; the change must be tested in the complete system.",
      },
    ],
    practicalApplication: [
      {
        title: "Record the cockpit",
        detail: "Capture stem length and angle, spacers, bar geometry, rotation and lever position.",
      },
      {
        title: "Check control access",
        detail: "Verify braking and shifting from each hand position before assessing performance.",
      },
      {
        title: "Test one small change",
        detail: "Compare steering, hand pressure, vision and sustainability over a relevant ride.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Sliding the saddle to make the bars closer.",
        fix: "Stabilise the saddle for pedalling support, then assess cockpit reach.",
      },
      {
        mistake: "Choosing a stem from rider height alone.",
        fix: "Include frame, bar, controls, rider and handling.",
      },
      {
        mistake: "Ignoring steerer and torque limits.",
        fix: "Use the component instructions or a qualified mechanic.",
      },
    ],
    faq: [
      {
        question: "How do I know if my road-bike reach is too long?",
        answer: "No one symptom proves it. Assess control access, steering, hand pressure, vision and sustainability after the saddle is stable.",
      },
      {
        question: "What stem length should I use?",
        answer: "There is no universal length. Frame reach, bar geometry, controls, handling and the rider's position interact.",
      },
      {
        question: "Can I use saddle position to fix reach?",
        answer: "No. Set the saddle for pedalling support, then use the cockpit to assess reach.",
      },
      {
        question: "Can a shorter stem change handling?",
        answer: "Yes. A material stem change alters the cockpit and steering response, so test it and consider whether the frame size is the underlying constraint.",
      },
    ],
    evidenceLevel: "anecdotal",
    evidenceNote:
      "No controlled evidence establishes one road-bike stem length for every rider; this answer uses a system-level fit and mechanical-safety framework.",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "indoor-training-position": {
    seoTitle: "Indoor Cycling Position: Match the Bike, Then Test Comfort",
    seoDescription:
      "Start indoor training from the outdoor contact points, then assess cooling, movement and pressure separately. Do not prescribe an automatic bar rise.",
    directAnswer:
      "Start indoor cycling with the same saddle, cleat and cockpit coordinates as the bicycle you want the training to transfer to. Indoor discomfort does not automatically require a 5–10mm bar rise or a different saddle: reduced movement, fixed gradient, heat, fan placement and session duration can change the experience. Confirm the trainer and bicycle are level and secure, improve cooling and movement opportunities, then test one recorded fit change only if the problem persists.",
    keyTakeaways: [
      "Match the outdoor contact points before inventing a separate trainer fit.",
      "Check bicycle level, trainer installation, cooling and movement before changing position.",
      "Indoor discomfort does not prove the bars must rise or the saddle must change.",
      "Persistent numbness or pain keeps the same fitting and clinical boundaries indoors.",
    ],
    whoFor: [
      {
        label: "The rider comfortable outdoors but not indoors",
        detail: "You need to separate heat and movement from a true coordinate problem.",
      },
      {
        label: "The rider building a dedicated trainer bike",
        detail: "You want repeatable coordinates that support training transfer.",
      },
    ],
    roadmanView: [
      "Match the known position first. Then isolate the indoor variable instead of rebuilding the bicycle from one uncomfortable session.",
      "Cooling and movement are training-environment variables; do not disguise them as a guaranteed fit fix.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Indoor-training and bike-fit content governance",
        insight: "There is no evidence-backed universal indoor bar-rise or separate-saddle prescription; the variables should be isolated and tested.",
      },
    ],
    practicalApplication: [
      {
        title: "Match coordinates",
        detail: "Record and reproduce saddle, cleats and cockpit from the outdoor bicycle where practical.",
      },
      {
        title: "Check the environment",
        detail: "Confirm trainer installation and level, strong cooling, hydration access and regular safe changes of hand position.",
      },
      {
        title: "Test one persistent issue",
        detail: "If the symptom remains, preserve the baseline and change one variable with a defined reason.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Raising the bars automatically for every trainer setup.",
        fix: "Check level, cooling, movement and duration before changing coordinates.",
      },
      {
        mistake: "Changing to a separate saddle immediately.",
        fix: "First confirm whether fixed posture or heat explains the indoor-only problem.",
      },
      {
        mistake: "Ignoring persistent numbness because the ride is indoors.",
        fix: "Reduce the aggravating load and use the same fit and clinical boundaries as outdoors.",
      },
    ],
    faq: [
      {
        question: "Should my indoor and outdoor bike fit match?",
        answer: "Start from matching contact points when training transfer is the goal, then isolate genuine equipment or environment differences.",
      },
      {
        question: "Should I raise my handlebars indoors?",
        answer: "Not automatically. Check trainer level, cooling, movement and duration first; test a recorded change only for a defined persistent problem.",
      },
      {
        question: "Do I need a different saddle on the trainer?",
        answer: "Not by default. Indoor-only discomfort can reflect fixed posture, heat or session structure rather than saddle incompatibility.",
      },
      {
        question: "Why does indoor riding feel harder?",
        answer: "Heat, reduced airflow, fixed posture and fewer natural coasting or movement breaks can all contribute. Do not assume the position is the only cause.",
      },
    ],
    evidenceLevel: "anecdotal",
    evidenceNote:
      "Indoor position guidance is based on isolating trainer setup, cooling, movement and fit variables; no universal bar-rise or separate-saddle rule is established.",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "how-to-prevent-saddle-sores": {
    seoTitle: "How to Prevent Cycling Saddle Sores Safely",
    seoDescription:
      "Saddle sores can involve friction, pressure, moisture and skin irritation or infection. Reduce the load, use clean dry kit and know when to seek care.",
    directAnswer:
      "Cycling saddle sores can involve friction, pressure, heat, moisture, hair-follicle irritation or infection; the term does not identify one lesion or one bike-fit cause. Reduce or stop the aggravating riding, use clean dry shorts, wash skin and kit normally, and record saddle and training changes. Do not squeeze, drain or self-treat a worsening lump from an article. Seek clinical care for spreading redness, marked swelling, drainage, fever, feeling unwell, severe pain or recurrent sores.",
    keyTakeaways: [
      "Saddle sore is an umbrella term, not one diagnosis.",
      "Pressure, friction, moisture, skin condition, clothing, load and position can interact.",
      "Clean dry kit and reducing the aggravating riding are safer than a guaranteed cream or millimetre fix.",
      "Spreading redness, marked swelling, drainage, fever, severe pain or recurrent sores need clinical assessment.",
    ],
    whoFor: [
      {
        label: "The rider with new skin irritation",
        detail: "You need to reduce aggravation and distinguish a fit review from medical care.",
      },
      {
        label: "The rider with recurring sores",
        detail: "You need a complete review of load, kit, skin and position rather than another guaranteed product.",
      },
    ],
    roadmanView: [
      "Do not diagnose every saddle-area lesion as friction and do not promise that levelling a saddle cures it.",
      "Reduce the aggravating load, keep kit clean and dry, review the complete contact point and seek care when infection or recurrence is possible.",
    ],
    expertEvidence: [
      {
        name: "Roadman editorial review",
        credential: "Fact-check against current saddle-sore and saddle-pressure research",
        insight: "A 2026 qualitative study describes pressure, friction and sweat as reported contributors, while also documenting severe cases needing time off or medical treatment; it does not establish one cure.",
      },
    ],
    practicalApplication: [
      {
        title: "Reduce the aggravating contact",
        detail: "Shorten or stop riding on broken, worsening or severely painful skin and avoid repeatedly loading the same area.",
      },
      {
        title: "Use clean dry kit",
        detail: "Wear clean, well-fitting shorts, change out of wet kit promptly and wash skin and clothing normally without aggressive scrubbing.",
      },
      {
        title: "Record load and position",
        detail: "Note recent volume, heat, clothing, saddle model, height, setback and tilt before making one reasoned change.",
      },
      {
        title: "Escalate warning signs",
        detail: "Seek clinical care for spreading redness, marked swelling, drainage, fever, feeling unwell, severe pain or recurrent lesions.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Assuming every saddle sore is a fit problem.",
        fix: "Review pressure, friction, moisture, skin, clothing, load and infection warning signs together.",
      },
      {
        mistake: "Squeezing or draining a lump at home.",
        fix: "Do not perform a procedure from an article; seek clinical advice for a worsening or draining lesion.",
      },
      {
        mistake: "Relying on a fixed chamois-cream or shower-time rule.",
        fix: "Use clean dry kit and normal hygiene, then investigate recurrence rather than promising one product or deadline.",
      },
    ],
    faq: [
      {
        question: "What causes cycling saddle sores?",
        answer: "The term covers different skin problems. Pressure, friction, heat, moisture, hair-follicle irritation, clothing, load and infection can contribute in different combinations.",
      },
      {
        question: "Should I ride with a saddle sore?",
        answer: "Reduce or stop the contact when skin is broken, pain is worsening or the area is markedly swollen. Repeated loading can aggravate the problem.",
      },
      {
        question: "Does chamois cream prevent saddle sores?",
        answer: "It may reduce friction for some riders, but it cannot fix every pressure, fit, skin or infection problem and no product guarantees prevention.",
      },
      {
        question: "Does saddle width or tilt cause saddle sores?",
        answer: "Position can change pressure distribution, but one width or tilt rule cannot diagnose a skin lesion. Record the setup and assess the whole contact point.",
      },
      {
        question: "When should a saddle sore be checked by a clinician?",
        answer: "For spreading redness, marked swelling, drainage, fever, feeling unwell, severe pain, a worsening lump or recurrent lesions.",
      },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "A 2026 qualitative study of 20 competitive female cyclists reported pressure, friction and sweat as perceived contributors and documented variable management, including medical care in severe cases; it does not establish one preventive protocol (PMID 41705181).",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
  "how-to-choose-the-right-saddle": saddleChoiceTrust,
  "how-to-choose-a-saddle": saddleChoiceTrust,
  "cycling-with-bad-knees": {
    seoTitle: "Cycling With Knee Pain or Osteoarthritis: A Safe Guide",
    seoDescription:
      "Cycling may suit some people with knee osteoarthritis or previous knee problems, but diagnosis, current symptoms and load matter. How to start safely.",
    directAnswer:
      "Cycling can be an exercise option for some people with knee osteoarthritis or a previous knee problem, but ‘bad knees’ is not a diagnosis and cycling is not automatically safe for every condition. A meta-analysis found stationary cycling reduced pain in knee-osteoarthritis trials, while several other outcomes did not exceed minimal clinically important differences. Ask a clinician about acute injury, surgery or unstable symptoms, start with a tolerable dose, and adjust the bicycle from measured response rather than a universal cadence or saddle rule.",
    keyTakeaways: [
      "Knee osteoarthritis, an acute injury, post-operative rehabilitation and unexplained pain require different advice.",
      "Stationary cycling reduced pain in knee-osteoarthritis trials, but not every measured benefit was clinically important.",
      "A professional fit can assess position; it cannot diagnose the knee or guarantee pain relief.",
      "Build from a dose the individual tolerates and use clinical guidance for diagnosed conditions or rehabilitation.",
    ],
    whoFor: [
      {
        label: "The rider with diagnosed knee osteoarthritis",
        detail:
          "You want to discuss cycling as one exercise option inside a clinician-led plan.",
      },
      {
        label: "The rider returning after a knee problem",
        detail:
          "You need current clearance and a progressive, symptom-informed return rather than generic setup advice.",
      },
    ],
    roadmanView: [
      "Cycling can be useful exercise without being a universal treatment for every knee labelled ‘bad’.",
      "The safe sequence is diagnosis and clinical guidance when needed, then tolerable load, recorded position and progressive exposure.",
    ],
    expertEvidence: [
      {
        name: "Luan and colleagues",
        credential:
          "Authors of a systematic review and meta-analysis of stationary cycling for knee osteoarthritis",
        insight:
          "Across the included trials, stationary cycling reduced pain and improved sport function versus no exercise, while several stiffness, daily-living, function and quality-of-life outcomes did not exceed minimal clinically important differences.",
      },
    ],
    practicalApplication: [
      {
        title: "Name the condition",
        detail:
          "Separate diagnosed osteoarthritis or a clinician-led rehabilitation plan from a new unexplained symptom. Do not use one article for all three.",
      },
      {
        title: "Agree the starting dose",
        detail:
          "After appropriate clinical guidance, begin with duration and resistance that are tolerable during and after the session. There is no universal cadence or weekly increment.",
      },
      {
        title: "Record the bicycle",
        detail:
          "Preserve saddle, cleat, crank and shoe coordinates. Use a qualified fitter when several variables interact or the position cannot be sustained.",
      },
      {
        title: "Watch the response",
        detail:
          "Track symptoms, swelling, function and the following day. Escalate worsening, unstable or persistent symptoms instead of adding several fit changes.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Treating ‘bad knees’ as one diagnosis.",
        fix: "Base the plan on the actual condition, current symptoms and clinical advice.",
      },
      {
        mistake: "Assuming low impact means no meaningful knee load.",
        fix: "Choose tolerable resistance and duration, then assess the individual response.",
      },
      {
        mistake: "Buying a fit as a substitute for rehabilitation.",
        fix: "Use fit for the rider-bicycle relationship and a clinician for diagnosis, treatment and return-to-sport decisions.",
      },
    ],
    faq: [
      {
        question: "Is cycling good for knee osteoarthritis?",
        answer:
          "It can be one exercise option. A stationary-cycling meta-analysis found reduced pain, but several other outcomes did not exceed minimal clinically important differences. Suitability and dose remain individual.",
      },
      {
        question: "Can I cycle after knee surgery?",
        answer:
          "Use the surgeon or rehabilitation clinician's restrictions and progression. Procedure, healing, range of motion, swelling and strength matter; a generic week or saddle-height rule is not safe.",
      },
      {
        question: "Do I need a professional bike fit?",
        answer:
          "A fit can help when position or equipment limits a tolerable cycling setup. It does not diagnose the knee and should not replace clinical assessment for persistent, unstable or post-operative symptoms.",
      },
      {
        question: "What symptoms should stop the session?",
        answer:
          "Stop and seek appropriate advice for severe or escalating pain, marked swelling, locking, giving way, inability to bear weight, or a hot red knee with fever or feeling unwell.",
      },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "A meta-analysis of stationary cycling for knee osteoarthritis found reduced pain, while several other outcomes did not exceed minimal clinically important differences (PMID 33167714). This does not establish suitability for every knee condition.",
    updatedDate: "2026-08-25",
    reviewedBy: REVIEWER,
  },
};

OVERRIDES["signs-your-bike-doesnt-fit-properly"] = {
  ...OVERRIDES["signs-you-need-a-bike-fit"],
  seoTitle: "Signs Your Bike May Not Fit — A Safe Checklist",
  seoDescription:
    "Recurring pain, numbness or loss of control can justify a fit review, but symptoms do not prove one position error. Use this safe cycling checklist.",
};

export function applyBikeFitTrustOverride(page: AnswerPage): AnswerPage {
  const override = OVERRIDES[page.slug];
  return override ? { ...page, ...override } : page;
}
