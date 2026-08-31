import { type ContentPillar } from "@/types";

export interface BestForPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  pillar: ContentPillar;
  intro: string;
  picks: {
    name: string;
    verdict: string;
    bestFor: string;
    href: string;
    officialUrl?: string;
    strength?: string;
    limitation?: string;
  }[];
  faq: { question: string; answer: string }[];
  shortAnswer?: string;
  lastReviewed?: string;
  methodology?: string;
  disclosure?: string;
  criteria?: { title: string; description: string }[];
  sections?: { heading: string; paragraphs: string[] }[];
  officialSources?: { title: string; href: string }[];
  related?: { title: string; href: string; description: string }[];
  appCta?: {
    eyebrow: string;
    heading: string;
    body: string;
  };
}

export const BEST_FOR_PAGES: BestForPage[] = [
  {
    slug: "best-cycling-training-apps",
    title: "Best Cycling Training Apps in 2026",
    seoTitle: "Best Cycling Training Apps 2026: Choose by Training Job",
    seoDescription: "Compare the best cycling training apps for adaptive ride plans, indoor motivation, coach-led training, strength and recovery. Verified August 2026.",
    pillar: "coaching",
    intro: "The best cycling training app is the one built for your actual job: planning rides, making indoor work engaging, coordinating with a coach, placing gym work or changing training when recovery shifts. This guide separates those jobs so a long feature list does not hide the one gap that matters to you.",
    shortAnswer: "There is no honest single winner for every cyclist. TrainerRoad is the strongest ride-plan-first option in this comparison, JOIN is the clearest schedule-and-readiness option, Zwift is the indoor motivation choice, TrainingPeaks is the coach-and-calendar choice, and RideStrong is the dedicated cycling-strength choice.",
    lastReviewed: "2026-08-31",
    methodology: "This is a desk-based editorial comparison, not a hands-on product test. We checked current first-party product and support pages on 31 August 2026, then matched each app to a distinct rider job. We do not use affiliate links or rank by commission.",
    disclosure: "Roadman is building a competing cycling strength and recovery app. It is not included in the ranking because it has not launched or been independently tested. Its early-access page is clearly separated from the available products below.",
    criteria: [
      { title: "The job", description: "Does the rider need a cycling plan, an indoor world, a coach calendar, gym programming or a readiness decision?" },
      { title: "Adaptation", description: "What inputs can change the next session: completed rides, availability, subjective feedback, recovery data or a human coach?" },
      { title: "Strength depth", description: "Is strength a real progression with exercises and logging, an optional add-on, or absent?" },
      { title: "Decision transparency", description: "Can the rider understand why work moved, reduced or progressed rather than accepting a mystery score?" },
    ],
    picks: [
      { name: "TrainerRoad", verdict: "Best for an adaptive cycling plan", bestFor: "Self-coached riders who want event-led bike workouts without a virtual world.", strength: "Its Plan Builder uses goals, available training time and recent training history, while the plan adapts around completed or missed riding.", limitation: "This is a ride-plan-first choice, not our pick for a cyclist who chiefly needs progressive gym programming.", href: "/blog/zwift-vs-trainerroad", officialUrl: "https://www.trainerroad.com/all-cycling-training-plans" },
      { name: "JOIN", verdict: "Best for changing availability and daily readiness", bestFor: "Cyclists whose weekly time moves and who want subjective soreness and recovery to affect today's ride.", strength: "JOIN says its plan adjusts from workout data, RPE, readiness and availability; its current readiness check asks the rider to correct the estimate when it feels wrong.", limitation: "Its core job is cycling-session planning, not a full progressive strength programme.", href: "/tools/training-readiness", officialUrl: "https://help.join.cc/hc/en-150/articles/22387845984657-What-is-Readiness-in-JOIN" },
      { name: "Zwift", verdict: "Best for indoor motivation and social riding", bestFor: "Riders who are more consistent when workouts happen inside a virtual world with events and other people.", strength: "Zwift combines structured workouts and training plans with group rides, racing and an immersive riding environment.", limitation: "Choose it for executing and enjoying indoor rides; use another layer when the main need is gym progression or contextual recovery decisions.", href: "/blog/zwift-vs-trainerroad", officialUrl: "https://www.zwift.com/uk/training-on-zwift" },
      { name: "TrainingPeaks", verdict: "Best for a coach-led calendar", bestFor: "Athletes who want a human coach or purchased plan to coordinate bike and strength work in one calendar.", strength: "TrainingPeaks now supports structured strength workouts with a large exercise-video library alongside endurance planning and coach workflows.", limitation: "The platform is the delivery and analysis layer; buying a plan does not make the plan author your personal coach.", href: "/compare/trainerroad-vs-trainingpeaks", officialUrl: "https://www.trainingpeaks.com/strength-athlete/" },
      { name: "RideStrong", verdict: "Best dedicated cycling-strength library", bestFor: "Cyclists whose main gap is gym, activation and mobility programming rather than a new bike plan.", strength: "RideStrong publishes cycling-specific programme recommendations, exercise videos, substitutions, progress tracking and a training calendar.", limitation: "It does not present itself as a replacement for a complete adaptive cycling plan; it is the specialist strength layer in this comparison.", href: "/best/best-cycling-strength-training-apps", officialUrl: "https://www.everathlete.com/ridestrong" },
    ],
    sections: [
      { heading: "Start with the job, not the logo", paragraphs: ["A cyclist searching for a training app may be trying to solve five different problems. If the problem is bike-session prescription, start with TrainerRoad or JOIN. If the problem is doing indoor work consistently, start with Zwift. If a coach writes the plan, TrainingPeaks is the natural calendar. If the missing work is in the gym, compare the dedicated cycling strength options instead.", "That distinction also prevents subscription stacking. A ride engine, a planning layer and a recovery wearable can all be useful, but three dashboards do not create one coordinated decision. Write down which product owns tomorrow's prescription before adding another app."] },
      { heading: "Where strength and recovery change the answer", paragraphs: ["Most broad cycling-app comparisons treat strength as a tick-box and recovery as a score. For cyclists doing both bike and gym work, the harder question is whether the system protects a key ride, progresses the lift and explains what changed after poor sleep or soreness.", "Use the dedicated cycling strength app guide when the gym is the main search job. Use the recovery app guide when the main question is whether today's workload should change. Masters riders should use the masters guide because training density and strength support matter more than an age label alone."] },
    ],
    officialSources: [
      { title: "TrainerRoad training plans", href: "https://www.trainerroad.com/all-cycling-training-plans" },
      { title: "JOIN readiness documentation", href: "https://help.join.cc/hc/en-150/articles/22387845984657-What-is-Readiness-in-JOIN" },
      { title: "Zwift training plans and workouts", href: "https://www.zwift.com/uk/training-on-zwift" },
      { title: "TrainingPeaks Strength for athletes", href: "https://www.trainingpeaks.com/strength-athlete/" },
      { title: "RideStrong app features", href: "https://www.everathlete.com/ridestrong" },
    ],
    related: [
      { title: "Best cycling strength training apps", href: "/best/best-cycling-strength-training-apps", description: "Compare real gym programming, logging and placement around riding." },
      { title: "Best cycling recovery apps", href: "/best/best-cycling-recovery-apps", description: "Compare readiness signals by what they can actually change." },
      { title: "Best apps for masters cyclists", href: "/best/best-cycling-apps-structured-training", description: "A recovery-and-strength lens for riders over 40." },
      { title: "Cycling coach vs training app", href: "/compare/coach-vs-app", description: "Decide when software is enough and when human judgement earns its cost." },
    ],
    appCta: { eyebrow: "COMING TO IPHONE", heading: "Need strength and recovery to fit the riding week?", body: "Roadman is building that specific layer. The final product name, date and price are not announced; the permanent /app page holds the single early-access list." },
    faq: [
      { question: "What is the best cycling training app in 2026?", answer: "There is no single winner for every job. TrainerRoad is the ride-plan-first pick in this comparison, JOIN is strongest for changing availability and readiness input, Zwift for indoor motivation, TrainingPeaks for a coach-led calendar, and RideStrong for dedicated cycling strength." },
      { question: "Which cycling training app includes strength training?", answer: "RideStrong is the dedicated cycling-strength option in this comparison. TrainingPeaks supports structured strength work in the wider endurance calendar, and Wahoo SYSTM offers strength and yoga alongside cycling plans. Roadman's strength and recovery app is upcoming and is not ranked before launch." },
      { question: "Which cycling app uses recovery to change the workout?", answer: "JOIN says its readiness input can update the type, duration and intensity of the suggested ride. Project Summit says recovery can change its plan. Always check which data a score uses and whether you can correct it when the score disagrees with how you feel." },
      { question: "Do I need a training app if I have a coach?", answer: "You may still need the calendar and workout-delivery platform your coach uses, often TrainingPeaks, but you usually do not need a second algorithm creating a competing plan. Agree which system owns the prescription." },
    ],
  },
  {
    slug: "best-cycling-strength-training-apps",
    title: "Best Cycling Strength Training Apps in 2026",
    seoTitle: "Best Cycling Strength Training Apps 2026",
    seoDescription: "Compare cycling strength training apps for progressive gym work, bodyweight sessions, coach delivery and fitting strength around bike training.",
    pillar: "strength",
    intro: "A useful cycling strength app must do more than show a squat video. It should tell you what to do, how to progress it, how to scale it and how the gym work fits beside the rides that matter.",
    shortAnswer: "RideStrong is the strongest dedicated cycling-gym option currently available in this comparison. Wahoo SYSTM suits guided bodyweight cross-training, while TrainingPeaks Strength is the best calendar-and-coach workflow. Roadman's cyclist-specific strength and recovery app is upcoming and is not ranked before launch.",
    lastReviewed: "2026-08-31",
    methodology: "We compared only capabilities documented on current first-party product or support pages. This is a desk-based comparison, not a hands-on test. We weighted cycling specificity, usable progression, scaling, exercise guidance and coordination with bike training; no affiliate commission affects the order.",
    disclosure: "Roadman is building a competing cycling strength and recovery app. We exclude it from the available-product ranking until it launches and can be tested. The early-access link below is a clearly labelled commercial pathway.",
    criteria: [
      { title: "Cycling specificity", description: "Does the programme account for riding volume and discipline, or merely relabel a generic gym template?" },
      { title: "Progression", description: "Can the rider record work and receive a clear next exposure rather than repeat random circuits?" },
      { title: "Placement", description: "Does the app help protect priority rides and manage lower-body fatigue across the week?" },
      { title: "Scaling", description: "Are there substitutions for equipment, experience and movement comfort?" },
    ],
    picks: [
      { name: "RideStrong", verdict: "Best dedicated strength app for cyclists", bestFor: "Riders who want cycling-specific gym, activation and mobility programmes with progress logging.", strength: "Its published feature set includes programme recommendations, substitutions, video tutorials, progress tracking, a calendar and programmes for different cycling demands.", limitation: "The product is the specialist strength-and-mobility layer, not a complete adaptive prescription for every bike session.", href: "/blog/cycling-strength-training-guide", officialUrl: "https://www.everathlete.com/ridestrong" },
      { name: "Wahoo SYSTM", verdict: "Best for guided bodyweight cross-training", bestFor: "Indoor cyclists who want strength and yoga modules alongside a SYSTM cycling plan.", strength: "Wahoo documents strength modules that can complement a cycling plan or run as stand-alone cross-training, with progressive levels and mobility-focused yoga.", limitation: "Its strength work is better suited to guided cross-training than detailed barbell load-and-rep progression.", href: "/blog/cycling-strength-training-guide", officialUrl: "https://support.wahoofitness.com/hc/en-us/articles/4406401932050-Focused-Strength-Training" },
      { name: "TrainingPeaks Strength", verdict: "Best for coach-delivered strength in one calendar", bestFor: "Cyclists whose coach or purchased plan needs to schedule and review bike and strength work together.", strength: "TrainingPeaks supports structured strength sessions, execution on mobile and more than 1,000 exercise videos inside its endurance calendar.", limitation: "Its own support page says strength workouts currently have to be built on desktop; buying a plan is not the same as having its author as your coach.", href: "/compare/trainerroad-vs-trainingpeaks", officialUrl: "https://www.trainingpeaks.com/strength-athlete/" },
    ],
    sections: [
      { heading: "The feature most lists miss: placement", paragraphs: ["The best exercise library can still sabotage the bike if lower-body work lands before the week's priority session. Ask whether the product sees the riding week, labels key rides and can reduce or move strength volume without turning a missed gym day into debt.", "If the app cannot coordinate the two, use Roadman's free strength-session planner to place the session, then use the chosen app to execute it."] },
      { heading: "How to compare progression honestly", paragraphs: ["A strength plan needs a repeatable progression rule. Look for previous load and reps, a target effort such as reps in reserve, substitutions and a clear response to soreness or poor movement quality. More workouts in a library do not automatically create better progression.", "Beginners also need a lower entry point. Bodyweight or minimalist programmes can be useful, but cyclists who already lift should check whether the app supports the equipment and loading detail they need before subscribing."] },
    ],
    officialSources: [
      { title: "RideStrong app features and programme details", href: "https://www.everathlete.com/ridestrong" },
      { title: "Wahoo focused strength training", href: "https://support.wahoofitness.com/hc/en-us/articles/4406401932050-Focused-Strength-Training" },
      { title: "TrainingPeaks Strength for athletes", href: "https://www.trainingpeaks.com/strength-athlete/" },
    ],
    related: [
      { title: "Cycling strength training guide", href: "/blog/cycling-strength-training-guide", description: "The evidence and programming principles behind the app criteria." },
      { title: "Strength session planner", href: "/tools/strength-session-planner", description: "Place 30, 45 or 60-minute gym work around priority rides." },
      { title: "Best recovery apps for cyclists", href: "/best/best-cycling-recovery-apps", description: "Compare what a readiness score can change after the gym work lands." },
    ],
    appCta: { eyebrow: "THE GAP ROADMAN IS BUILDING FOR", heading: "Make the bike week and gym progression one decision", body: "Roadman's upcoming iPhone app is designed around cyclist-specific strength, key-ride protection and explainable recovery adjustments. Join the single early-access list on /app." },
    faq: [
      { question: "What is the best strength training app for cyclists?", answer: "RideStrong is our current dedicated cycling-strength pick because it publishes cyclist-specific programmes, substitutions, exercise videos, progress tracking and scheduling. Wahoo SYSTM is the better fit for guided bodyweight cross-training, while TrainingPeaks Strength suits a coach-led calendar." },
      { question: "Can a cycling app combine bike and gym training?", answer: "TrainingPeaks can hold structured bike and strength sessions in one calendar, and Wahoo SYSTM offers strength alongside cycling plans. Check whether the product merely displays both or actually changes strength placement and volume around priority rides." },
      { question: "Should cyclists use a general lifting app?", answer: "A general lifting app can log progressive overload well, but it usually cannot see which bike sessions need protecting. It can work if you or a coach own the weekly placement decision." },
    ],
  },
  {
    slug: "best-cycling-recovery-apps",
    title: "Best Cycling Recovery Apps in 2026",
    seoTitle: "Best Cycling Recovery Apps 2026: Readiness That Changes Training",
    seoDescription: "Compare cycling recovery and readiness apps by data inputs, rider feedback, plan changes and whether the score produces a useful next action.",
    pillar: "recovery",
    intro: "A recovery score is only useful when you know what feeds it, can correct bad context and understand what the number changes. This comparison ranks cycling recovery apps by the decision after the score—not the colour of the dashboard.",
    shortAnswer: "JOIN is the best ride-plan recovery option in this comparison because the rider can update soreness and recovery and the app can change today's suggested ride. Project Summit is the strongest Apple-Health-first recovery option for iPhone cyclists. Garmin Connect is useful as a device-native signal, not a complete gym-and-bike decision layer.",
    lastReviewed: "2026-08-31",
    methodology: "We checked first-party documentation for the inputs, rider feedback loop and stated training response of each product. This is a desk-based editorial comparison, not a medical assessment or hands-on device validation. We rank the usefulness and transparency of the next action, not a proprietary score.",
    disclosure: "Roadman is building a competing strength and recovery app. It is excluded from the available-product ranking until launch. Roadman's public readiness and recovery tools are free, and the separate /app link is the commercial early-access route.",
    criteria: [
      { title: "Inputs", description: "Which signals are used: completed load, sleep, HRV, resting heart rate, soreness, energy or rider-entered context?" },
      { title: "Correction", description: "Can the cyclist override or qualify a score that does not match how the day actually feels?" },
      { title: "Action", description: "Does the result change duration, intensity or volume, or does it merely show another number?" },
      { title: "Boundary", description: "Does the product avoid turning one noisy morning into a diagnosis or a dramatic training decision?" },
    ],
    picks: [
      { name: "JOIN", verdict: "Best for readiness that changes today's ride", bestFor: "Cyclists following an adaptive plan who want soreness and perceived recovery included in the daily decision.", strength: "JOIN documents that the rider can correct soreness or recovery and that the suggested workout's type, duration and intensity can update.", limitation: "It is primarily a cycling-plan decision; it is not a full strength-recovery coordinator.", href: "/tools/training-readiness", officialUrl: "https://help.join.cc/hc/en-150/articles/22387845984657-What-is-Readiness-in-JOIN" },
      { name: "Project Summit", verdict: "Best Apple-Health-first cycling recovery layer", bestFor: "iPhone cyclists who want sleep, HRV and recent load connected to an adaptive cycling plan.", strength: "Summit states that it reads recovery data from Apple Health and uses recovery and availability to rewrite the plan, while showing the underlying sleep and recovery detail.", limitation: "Its official site currently specifies iPhone and iOS 26 or later; strength progression is not the product's documented core job.", href: "/tools/recovery-screen", officialUrl: "https://projectsummit.app/" },
      { name: "Garmin Connect", verdict: "Best device-native recovery signal", bestFor: "Riders already recording training and overnight data with a compatible Garmin device.", strength: "Garmin's ecosystem can surface recovery time and training-readiness signals beside recorded cycling load without adding a separate sensor platform.", limitation: "Compatibility and inputs vary by device, and a device score is still context—not a diagnosis or a complete strength-placement decision.", href: "/blog/cycling-recovery-guide", officialUrl: "https://www.garmin.com/en-US/garmin-technology/running-science/physiological-measurements/training-readiness/" },
    ],
    sections: [
      { heading: "Do not buy a colour; buy a decision", paragraphs: ["Red, amber and green are easy to understand, but the practical question is what happens next. A good recovery product should show enough context to distinguish a hard training block from one poor night, then make a bounded change that protects consistency.", "If a score cannot explain its inputs, use it as a trend only. If it disagrees with illness symptoms, unusual pain or severe fatigue, stop treating the app as the authority and seek the appropriate professional advice."] },
      { heading: "Readiness is not the same as recovery", paragraphs: ["Recovery describes the process between training exposures. Readiness is a narrower decision about what is sensible now. An app may measure sleep or HRV well but still leave the rider to decide what today's bike or gym session should become.", "Roadman's free readiness check provides a conservative same-day screen, while the deeper recovery screen helps identify which lever needs attention. The upcoming app is intended to connect that decision to strength volume, but it is not ranked here before launch."] },
    ],
    officialSources: [
      { title: "JOIN readiness documentation", href: "https://help.join.cc/hc/en-150/articles/22387845984657-What-is-Readiness-in-JOIN" },
      { title: "Project Summit product and recovery documentation", href: "https://projectsummit.app/" },
      { title: "Garmin training readiness methodology", href: "https://www.garmin.com/en-US/garmin-technology/running-science/physiological-measurements/training-readiness/" },
    ],
    related: [
      { title: "Free training readiness check", href: "/tools/training-readiness", description: "Turn today's context into a conservative next step." },
      { title: "Cycling recovery screen", href: "/tools/recovery-screen", description: "Find the recovery lever most likely to need attention." },
      { title: "Cycling recovery guide", href: "/blog/cycling-recovery-guide", description: "Understand sleep, load, soreness and recovery methods before buying a score." },
    ],
    appCta: { eyebrow: "RECOVERY WITH A JOB", heading: "Connect readiness to the strength session", body: "Roadman's upcoming iPhone app is being built to hold or reduce strength volume with an explainable reason while protecting the rider's existing bike plan. The single early-access list lives on /app." },
    faq: [
      { question: "What is the best recovery app for cyclists?", answer: "JOIN is our pick when recovery needs to change today's cycling workout. Project Summit is the stronger Apple-Health-first choice in this comparison. Garmin Connect is useful for riders already inside the Garmin device ecosystem." },
      { question: "Can HRV tell me whether to train?", answer: "HRV can add useful trend context, but one reading should not own the full decision. Recent load, sleep, symptoms, soreness, motivation and the importance of the planned session still matter." },
      { question: "What should a cycling readiness app change?", answer: "At minimum it should give a bounded action: proceed, reduce volume or intensity, substitute easy work, or stop and reassess. It should also explain which inputs drove that action." },
    ],
  },
  {
    slug: "best-indoor-training-platforms",
    title: "Best Indoor Training Platforms for Road Cyclists",
    seoTitle: "Best Indoor Training Platforms for Road Cyclists",
    seoDescription: "Best indoor cycling platforms compared for road cyclists. Structured workouts, virtual riding, analytics — which platform delivers results?",
    pillar: "coaching",
    intro: "Indoor training platforms have transformed winter cycling. But they serve different purposes — structured training, social motivation, route simulation, or analytics. Pick the one that matches how you actually ride.",
    picks: [
      { name: "TrainerRoad", verdict: "Best for structured adaptive training", bestFor: "Self-coached riders who want AI-adjusted plans", href: "/blog/zwift-vs-trainerroad" },
      { name: "Zwift", verdict: "Best for social riding and racing", bestFor: "Riders who need external motivation to train indoors", href: "/blog/zwift-vs-trainerroad" },
      { name: "Rouvy", verdict: "Best for real-world AR routes", bestFor: "Riders who want to preview real event courses", href: "/blog/rouvy-vs-zwift" },
      { name: "TrainingPeaks + ERG", verdict: "Best for coached athletes", bestFor: "Riders with a human coach building their plan", href: "/compare/trainerroad-vs-trainingpeaks" },
    ],
    faq: [
      { question: "Can I use Zwift for structured training?", answer: "Yes — Zwift has structured workouts and training plans. But its adaptive training is less sophisticated than TrainerRoad's, and the gamification can pull you off plan." },
      { question: "Do I need a smart trainer for these platforms?", answer: "Strongly recommended. A smart trainer provides accurate power data and ERG mode (automatic resistance adjustment). Without one, you're guessing at intensity." },
    ],
  },
  {
    slug: "best-cycling-coach-sportive-riders",
    title: "Best Cycling Coach for Sportive Riders",
    seoTitle: "Best Cycling Coach for Sportive Riders",
    seoDescription: "How to choose the best cycling coach if you're training for a sportive or gran fondo. What to look for, what to avoid, and when coaching pays off.",
    pillar: "coaching",
    intro: "Training for a sportive is where coaching earns its keep. Generic plans don't account for the specific climbs, your pacing needs, or your fuelling strategy. Here's what to look for.",
    picks: [
      { name: "Roadman Cycling (Not Done Yet)", verdict: "Best for event-specific periodised plans", bestFor: "Riders targeting Wicklow 200, Ride London, Étape, or any specific sportive", href: "/coaching" },
      { name: "TrainerRoad", verdict: "Best self-coached option with event targeting", bestFor: "Budget riders who can set their own event date and follow a plan", href: "/compare/coach-vs-app" },
      { name: "FasCat Coaching", verdict: "Strong event-plan focus", bestFor: "Riders who want a structured calendar with racing periodisation", href: "/compare/self-coached-vs-coached" },
    ],
    faq: [
      { question: "When should I start coaching before a sportive?", answer: "12-16 weeks before the event is ideal. This gives enough time for a base phase, a build phase, and a taper. Under 8 weeks and coaching is damage limitation — still useful, but you're working with the fitness you have." },
      { question: "Do I need a coach for every sportive?", answer: "No. If you've done the event before and know your body well, self-coaching with a structured app can work. Coaching adds most value for first-time events, events with significant climbing, or events where you have a specific time goal." },
    ],
  },
  {
    slug: "best-cycling-coach-comeback-riders",
    title: "Best Cycling Coach for Comeback Riders",
    seoTitle: "Best Cycling Coach for Comeback Riders",
    seoDescription: "Returning to cycling after time off? The best coaching options for comeback riders — rebuilding safely without overtraining or injury.",
    pillar: "coaching",
    intro: "Coming back to cycling after illness, injury, or life is where coaching prevents the most damage. The instinct is to rush; a coach manages the rebuild.",
    picks: [
      { name: "Roadman Cycling (Not Done Yet)", verdict: "Best for structured rebuild with accountability", bestFor: "Riders returning after 3+ months off who need pacing discipline", href: "/you/comeback" },
      { name: "TrainerRoad (Adaptive Training)", verdict: "Best self-paced option", bestFor: "Self-motivated riders who need the plan to ramp gradually", href: "/compare/coach-vs-app" },
      { name: "Local cycling club", verdict: "Best for social motivation", bestFor: "Riders who need group energy to stay consistent", href: "/compare/online-coach-vs-local-club" },
    ],
    faq: [
      { question: "How long does it take to get back to previous fitness?", answer: "Typically 50-80% of the time you were off. If you were off 6 months, expect 3-5 months to return to previous levels. Muscle memory helps but cardiovascular fitness has to be rebuilt." },
      { question: "Should I test my FTP when coming back?", answer: "Yes, but don't compare it to your old numbers. Test after 2-3 weeks of easy riding to establish a current baseline, then retest every 6-8 weeks." },
    ],
  },
  {
    slug: "best-cycling-apps-structured-training",
    title: "Best Cycling Training Apps for Masters Cyclists in 2026",
    seoTitle: "Best Cycling Training Apps for Masters Cyclists 40+",
    seoDescription: "Compare cycling apps for masters riders by recovery, training density, strength support, schedule flexibility and access to human judgement.",
    pillar: "coaching",
    intro: "Masters riders do not need an app that assumes age alone dictates every session. They need control over training density, honest recovery feedback, strength support and a plan that can fit work, family and a longer sporting history.",
    shortAnswer: "TrainerRoad is the clearest self-coached masters option because it offers masters plans with no more than two higher-intensity days each week. JOIN is the flexible readiness-led choice, TrainingPeaks is the human-coach calendar, and RideStrong is the dedicated strength layer.",
    lastReviewed: "2026-08-31",
    methodology: "We verified current product capabilities on official pages and weighted masters-specific control: high-intensity density, recovery input, schedule flexibility, strength support and access to a human coach. This is a desk-based comparison, not a hands-on test; no affiliate commission affects the ranking.",
    disclosure: "Roadman sells masters coaching and is building a competing strength and recovery app. The upcoming app is not ranked before launch. Coaching and early access are separated from the available self-coached products in this guide.",
    criteria: [
      { title: "Intensity density", description: "Can the rider deliberately cap hard days rather than trusting an age label to make the decision?" },
      { title: "Recovery context", description: "Can subjective feedback and changing life stress influence the week?" },
      { title: "Strength support", description: "Is resistance training genuinely programmed or left as an afterthought?" },
      { title: "Escalation", description: "When the data and the rider disagree, is there a route to human judgement?" },
    ],
    picks: [
      { name: "TrainerRoad Masters Plans", verdict: "Best self-coached masters cycling plan", bestFor: "Riders who want a structured bike plan with an explicit cap of two higher-intensity days per week.", strength: "TrainerRoad's current masters documentation says most plans have an alternate version that prioritises recovery with no more than two higher-intensity days each week.", limitation: "The masters setting changes cycling intensity density; it does not by itself create a progressive cycling-specific gym programme.", href: "/blog/zwift-vs-trainerroad", officialUrl: "https://support.trainerroad.com/hc/en-us/articles/19485515014683-What-are-Masters-Plans" },
      { name: "JOIN", verdict: "Best for flexible weeks and subjective readiness", bestFor: "Masters cyclists whose time and recovery change and who want the ride prescription to respond.", strength: "JOIN combines availability changes with a readiness check that includes muscle soreness and rider-entered recovery.", limitation: "It does not document a dedicated masters strength progression; age is only one input to the wider cycling plan.", href: "/tools/training-readiness", officialUrl: "https://help.join.cc/hc/en-150/articles/22387845984657-What-is-Readiness-in-JOIN" },
      { name: "TrainingPeaks + a human coach", verdict: "Best when judgement matters more than automation", bestFor: "Riders managing injury history, complex event goals, high life stress or bike-and-gym trade-offs that need a person.", strength: "TrainingPeaks is built around the athlete-coach calendar and now supports structured strength alongside endurance work.", limitation: "The software does not supply personal judgement on its own; a purchased plan and an ongoing coaching relationship are different products.", href: "/compare/trainerroad-vs-trainingpeaks", officialUrl: "https://www.trainingpeaks.com/strength-athlete/" },
      { name: "RideStrong", verdict: "Best dedicated strength companion for masters", bestFor: "Riders whose aerobic plan is covered but who need cycling-specific strength, substitutions, activation and mobility.", strength: "RideStrong publishes beginner and equipment-scaled programmes, progress tracking and guidance for scheduling strength with riding.", limitation: "It is a strength-and-mobility companion rather than the owner of the complete cycling prescription.", href: "/best/best-cycling-strength-training-apps", officialUrl: "https://www.everathlete.com/ridestrong" },
    ],
    sections: [
      { heading: "Masters is a control setting, not a diagnosis", paragraphs: ["An age threshold is a useful search shortcut, not a complete prescription. Two riders aged 50 can have different training histories, sleep, injury constraints, work stress and tolerance for intensity. Prefer apps that expose the controllable decisions instead of using age as a black box.", "The most useful explicit masters feature in this comparison is TrainerRoad's option to cap higher-intensity days. JOIN takes a different route by bringing daily soreness, recovery and availability into the ride decision. A human coach becomes more valuable when several constraints interact."] },
      { heading: "Strength changes the masters app shortlist", paragraphs: ["A masters cycling plan that only arranges rides leaves an important job unowned. Strength supports force production and physical capacity, but it must be placed so the legs are not repeatedly flattened before key bike work.", "Use a specialist strength app when the bike plan is already good. Use an integrated calendar when a coach needs to see both. Roadman's upcoming product is aimed at that coordination gap, but this guide will not rank an unreleased app above products riders can use today."] },
    ],
    officialSources: [
      { title: "TrainerRoad masters plans", href: "https://support.trainerroad.com/hc/en-us/articles/19485515014683-What-are-Masters-Plans" },
      { title: "JOIN readiness documentation", href: "https://help.join.cc/hc/en-150/articles/22387845984657-What-is-Readiness-in-JOIN" },
      { title: "TrainingPeaks Strength for athletes", href: "https://www.trainingpeaks.com/strength-athlete/" },
      { title: "RideStrong app details", href: "https://www.everathlete.com/ridestrong" },
    ],
    related: [
      { title: "Masters cycling hub", href: "/masters", description: "Roadman's central owner for masters cycling training, recovery and strength." },
      { title: "12-week masters cycling plan", href: "/blog/masters-cycling-training-plan-over-40", description: "A complete training framework for riders over 40." },
      { title: "Masters recovery score", href: "/tools/masters-recovery-score", description: "Screen the recovery context before adding more work." },
      { title: "Best cycling strength apps", href: "/best/best-cycling-strength-training-apps", description: "Compare the gym layer separately from the bike plan." },
    ],
    appCta: { eyebrow: "BUILT WITH MASTERS RIDERS IN MIND", heading: "Strength and recovery around the week you actually have", body: "Roadman's upcoming iPhone app uses riding load, time, equipment, soreness and joint comfort rather than age alone. Join the one early-access list on /app." },
    faq: [
      { question: "What is the best cycling training app for riders over 40?", answer: "TrainerRoad is our self-coached pick because its masters plans explicitly limit higher-intensity days to two per week. JOIN is the stronger choice when availability and subjective readiness change frequently, while TrainingPeaks with a coach suits complex cases." },
      { question: "Do masters cyclists need a special app?", answer: "Not automatically. They need control over intensity density, recovery, strength and schedule. A masters-labelled plan is useful only when its actual rules fit the rider." },
      { question: "Which masters cycling app includes strength training?", answer: "RideStrong is the dedicated cycling-strength option in this comparison. TrainingPeaks can place structured strength and cycling in the same coach-led calendar. Roadman's integrated strength and recovery app is upcoming and is not ranked before launch." },
      { question: "Do I need a coach if I'm using one of these apps?", answer: "Not for every rider. A coach earns the extra cost when injury history, life stress, event demands and bike-and-gym trade-offs create decisions the app cannot resolve safely or transparently." },
      { question: "What about Strava as a training app?", answer: "Strava is a logging and social tool, not a structured training app. It tells you what you did, not what to do tomorrow. Useful as a layer alongside one of the picks above, not a replacement." },
    ],
  },
  {
    slug: "best-cycling-coach-masters-riders",
    title: "Best Cycling Coach for Masters Riders (40+)",
    seoTitle: "Best Cycling Coach for Masters Riders (Over 40)",
    seoDescription: "Best coaching options for cyclists over 40. Masters training, recovery, strength — who does it best.",
    pillar: "coaching",
    intro: "Masters cycling is a different sport. Recovery takes longer, muscle mass declines without intervention, and the training that worked at 30 doesn't work at 45.",
    picks: [
      { name: "Roadman Cycling (Not Done Yet)", verdict: "Best for integrated masters coaching", bestFor: "40+ riders needing training + strength + nutrition + recovery managed together", href: "/coaching" },
      { name: "FasCat Coaching", verdict: "Best for self-directed masters athletes", bestFor: "Masters riders wanting a plan library with age-adjusted periodisation", href: "/compare/coach-vs-app" },
      { name: "TrainerRoad (Adaptive Training)", verdict: "Best app-based option for masters", bestFor: "Self-coached masters riders needing adaptive intensity management", href: "/blog/zwift-vs-trainerroad" },
    ],
    faq: [
      { question: "Do masters cyclists need a different coaching approach?", answer: "Yes. Recovery capacity declines after 40. Muscle mass drops ~8% per decade without resistance training. A masters coach adjusts training density, adds mandatory strength work, and manages nutrition for body composition." },
      { question: "Is strength training essential for cyclists over 40?", answer: "Non-negotiable. Targeted, loaded resistance training 2x/week through cycling-specific patterns (split squats, hip hinges, single-leg deadlifts, hip thrusts, presses, core) preserves muscle mass, maintains bone density, and counteracts age-related power decline that aerobic training alone cannot prevent." },
    ],
  },
  {
    slug: "best-cycling-coach-triathlon",
    title: "Best Cycling Coach for Triathletes",
    seoTitle: "Best Cycling Coach for Triathletes (Bike Leg)",
    seoDescription: "Best bike-leg coaching for age-group triathletes. Cycling-deep, triathlon-aware coaching compared.",
    pillar: "coaching",
    intro: "Most triathlon coaches cover three disciplines thinly. Most cycling coaches ignore triathlon context. The best bike-leg coaching is cycling-deep but triathlon-aware, periodised around the run.",
    picks: [
      { name: "Roadman Cycling (Triathlon Bike Coaching)", verdict: "Best specialist bike-leg coaching", bestFor: "Age-group 70.3 and Ironman athletes wanting a dedicated bike-leg coach", href: "/coaching/triathletes" },
      { name: "Purple Patch Fitness", verdict: "Best full-triathlon coaching with strong bike focus", bestFor: "Triathletes wanting one coach across all three disciplines", href: "/compare/coach-vs-app" },
      { name: "TrainerRoad + triathlon plan", verdict: "Best self-coached bike-leg training", bestFor: "Budget triathletes wanting structured bike workouts", href: "/blog/zwift-vs-trainerroad" },
    ],
    faq: [
      { question: "Should I use a cycling coach or triathlon coach?", answer: "Cycling coach if the bike is your limiter. Triathlon coach if you need all three disciplines. The ideal: a cycling coach who understands triathlon context and doesn't build bike fitness at the expense of your run." },
      { question: "How is triathlon bike coaching different?", answer: "Three differences: aero position management (power in TT bars), pacing for a run off the bike (negative split), and brick-specific training." },
    ],
  },
  {
    slug: "best-cycling-nutrition-apps",
    title: "Best Cycling Nutrition Apps",
    seoTitle: "Best Cycling Nutrition Apps for Performance",
    seoDescription: "Best nutrition apps for cyclists. Fuelling, macro tracking, race-day planning compared.",
    pillar: "nutrition",
    intro: "Generic calorie apps don't understand periodised nutrition. The best cycling nutrition tools match fuel to training load, plan in-ride carbs, and prevent chronic under-fuelling.",
    picks: [
      { name: "Fuelin", verdict: "Best for periodised cycling nutrition", bestFor: "Serious cyclists wanting daily fuel targets matched to training", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { name: "MyFitnessPal", verdict: "Best for macro tracking on a budget", bestFor: "Riders wanting a free food diary with a large database", href: "/blog/cycling-weight-loss-fuel-for-the-work-required" },
      { name: "Roadman Fuelling Calculator", verdict: "Best free in-ride fuelling planner", bestFor: "Riders wanting exact carbs/hour and sodium targets", href: "/tools/fuelling" },
    ],
    faq: [
      { question: "Do I need a nutrition app for cycling?", answer: "Not strictly — but tracking carbs per hour during rides is one of the highest-leverage changes most amateurs can make. A free calculator gives targets. An app like Fuelin automates daily nutrition." },
      { question: "Is MyFitnessPal good enough?", answer: "For basic macros, yes. But it doesn't understand periodisation — same targets on rest day and 5-hour ride day. For fuel-for-the-work-required, you need something that reads your training calendar." },
    ],
  },
];

export function getBestForBySlug(slug: string): BestForPage | null {
  return BEST_FOR_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getAllBestForSlugs(): string[] {
  return BEST_FOR_PAGES.map((p) => p.slug);
}
