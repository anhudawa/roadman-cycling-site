/**
 * Tool landing-page content registry.
 *
 * Single source of truth for the rich content rendered on each tool
 * landing page AND the structured-data (FAQPage / WebApplication / HowTo)
 * emitted from each tool's layout. Visible FAQ ≡ schema FAQ — never let
 * them drift, or Google will stop trusting our pages.
 */

export interface ToolFAQ {
  question: string;
  answer: string;
}

export interface ToolExample {
  scenario: string;
  inputs: string[];
  output: string;
}

export interface ToolRelatedLink {
  label: string;
  href: string;
  kind: "tool" | "article" | "podcast" | "topic" | "glossary";
}

export interface ToolHowToStep {
  name: string;
  text: string;
}

export interface ToolLandingContent {
  slug: string;
  title: string;
  description: string;
  url: string;
  breadcrumbName: string;
  /** ~50-word direct answer rendered as a featured callout at the top of the body. */
  answerSummary: string;
  /** What the tool does — 1-2 short paragraphs. */
  whatItDoes: string;
  /** Who this tool is for — 3-5 short bullets. */
  whoItsFor: string[];
  /** How it works — 1-2 short paragraphs. Mirrored as HowTo steps below. */
  howItWorks: string;
  /** Step-by-step methodology used both visibly and in HowTo schema. */
  howToSteps: ToolHowToStep[];
  /** Total time for the HowTo schema (ISO 8601). */
  howToTotalTime: string;
  /** Honest limitations + when to see a coach. */
  limitations: string;
  /** When the tool is the wrong answer. */
  whenToSeeACoach: string;
  /** 1-2 worked examples. */
  examples: ToolExample[];
  /** 3-7 FAQs. Used for both visible accordion AND FAQPage schema. */
  faqs: ToolFAQ[];
  /** Curated related tools / articles / podcast episodes. */
  related: ToolRelatedLink[];
  /** WebApplication / SoftwareApplication featureList bullets. */
  webAppFeatures: string[];
}

const ROADMAN_BASE = "https://roadmancycling.com";

export const TOOL_LANDING_CONTENT: Record<string, ToolLandingContent> = {
  "ftp-zones": {
    slug: "ftp-zones",
    title: "FTP Zone Calculator",
    description:
      "Calculate your 7 cycling power zones from your FTP instantly. Free tool grounded in the training methodology discussed with Professor Seiler and World Tour coaches.",
    url: `${ROADMAN_BASE}/tools/ftp-zones`,
    breadcrumbName: "FTP Zone Calculator",
    answerSummary:
      "Enter your Functional Threshold Power in watts and the calculator returns the seven Coggan power zones — Active Recovery through Neuromuscular — with watt ranges for each. Optional LTHR adds matching heart-rate ranges. The output is the same zone framework used in structured plans worldwide.",
    whatItDoes:
      "This calculator turns a single FTP number into a complete training prescription. You get seven zones with exact wattage ranges, so any workout written as \"30 minutes Z2\" or \"3 × 8 min at threshold\" becomes a specific power target. If you also enter LTHR, you get matching heart-rate ranges to use when power drops out.",
    whoItsFor: [
      "Cyclists training to a structured plan and writing intervals in zones",
      "Riders moving from heart-rate to power, or vice versa",
      "Coaches and self-coached athletes setting up Garmin, Wahoo, Zwift or TrainerRoad",
      "Anyone who has just done an FTP test and needs zones updated",
    ],
    howItWorks:
      "We use the Coggan 7-zone model — the standard you'll find in every major training platform. Each zone is defined as a percentage band of FTP: Z1 below 55%, Z2 56-75%, Z3 76-90%, Z4 91-105%, Z5 106-120%, Z6 121-150%, Z7 above 150%. Heart-rate ranges, when supplied, use Friel-style percentages of LTHR. Power is the primary control; HR is a secondary check.",
    howToSteps: [
      { name: "Determine your FTP", text: "Complete a 20-minute all-out test on a power meter or smart trainer. Multiply average power by 0.95 to estimate FTP. Ramp tests on Zwift or TrainerRoad are an acceptable alternative." },
      { name: "Enter FTP in watts", text: "Input your FTP. Typical amateur values are 150-350W depending on fitness level, body weight, and training history." },
      { name: "Optionally enter LTHR", text: "If you train with heart rate as a backup, enter your Lactate Threshold Heart Rate (the average HR for the same 20-minute test). The calculator will return zone ranges in bpm alongside watts." },
      { name: "Apply the zones in your training", text: "Use the wattage ranges to set zones in Garmin Connect, Wahoo, TrainingPeaks, Zwift, or TrainerRoad. Spend roughly 80% of training time in Z1-Z2 and 20% in Z4 and above — Professor Seiler's polarised model." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "Zones are a percentage-of-FTP model — they assume your FTP is current and accurate. If you haven't tested in three months, retest before trusting the numbers. The Coggan 7-zone model is one of several (Friel, BCF, iLevels). Different platforms label zones slightly differently. Heart-rate ranges drift with heat, fatigue, hydration, and caffeine — treat them as a sanity check, not a target.",
    whenToSeeACoach:
      "If you can hit Z4 watts on demand but never seem to adapt, or your FTP has been flat for over a year, the bottleneck isn't your zones — it's how you're stacking workload, recovery, and intensity distribution. That's where structured coaching beats more numbers.",
    examples: [
      {
        scenario: "Competitive amateur, 75kg, mid-season",
        inputs: ["FTP: 280W", "LTHR: 168 bpm"],
        output: "Z2: 157-210W (116-139 bpm) for endurance rides. Z4: 255-294W (160-176 bpm) for 2 × 20 min threshold. Z5: 297-336W for 5 × 4 min VO2 max intervals.",
      },
      {
        scenario: "Beginner, 80kg, 3 months in",
        inputs: ["FTP: 180W", "LTHR not entered"],
        output: "Z2: 101-135W for the bulk of weekly volume. Z3: 137-162W for tempo. Z4: 164-189W for short threshold efforts as fitness builds.",
      },
    ],
    faqs: [
      {
        question: "What is FTP in cycling?",
        answer: "FTP stands for Functional Threshold Power. It's the highest average power you can sustain for approximately one hour and is measured in watts. FTP is the single most important metric in cycling training because your seven power zones are all calculated as percentages of it.",
      },
      {
        question: "How do I calculate my FTP?",
        answer: "The most common method is a 20-minute all-out test: ride as hard as you can sustain for 20 minutes on a power meter or smart trainer, then multiply your average power by 0.95. For example, if your 20-minute average is 260W, your estimated FTP is 247W. Ramp tests and full 60-minute tests are alternatives, but the 20-minute protocol offers the best balance of accuracy and practicality.",
      },
      {
        question: "What is a good FTP for a beginner cyclist?",
        answer: "For a beginner male cyclist, an FTP of 150-200W is typical; for a beginner female cyclist, 100-160W is common. However, absolute watts matter less than watts per kilogram (W/kg). A beginner might be around 1.5-2.5 W/kg, while a competitive amateur typically reaches 3.5-4.5 W/kg. Focus on your own progression rather than comparing raw numbers.",
      },
      {
        question: "How often should I test my FTP?",
        answer: "Test every 6-8 weeks, ideally at the end of a training block and after a rest day. Testing more frequently causes unnecessary fatigue without meaningful data because FTP changes gradually. Many smart trainers and platforms like Zwift and TrainerRoad also estimate FTP passively from your ride data.",
      },
      {
        question: "What are the 7 cycling power zones?",
        answer: "Z1 (Active Recovery, below 55% FTP), Z2 (Endurance, 56-75% FTP), Z3 (Tempo, 76-90% FTP), Z4 (Threshold, 91-105% FTP), Z5 (VO2max, 106-120% FTP), Z6 (Anaerobic Capacity, 121-150% FTP), and Z7 (Neuromuscular, above 150% FTP). This is the Coggan model — the standard used by most training platforms.",
      },
      {
        question: "What is W/kg and why does it matter in cycling?",
        answer: "W/kg (watts per kilogram) is your power-to-weight ratio — your FTP divided by body weight. It's the best predictor of climbing and overall cycling performance. A 70kg rider with a 280W FTP has a ratio of 4.0 W/kg. Improving W/kg through more power, less excess body fat, or both is the most effective way to get faster on the bike.",
      },
    ],
    related: [
      { label: "W/kg Calculator", href: "/tools/wkg", kind: "tool" },
      { label: "Heart-Rate Zone Calculator", href: "/tools/hr-zones", kind: "tool" },
      { label: "Race Predictor", href: "/predict", kind: "tool" },
      { label: "FTP training topic hub", href: "/topics/ftp-training", kind: "topic" },
      { label: "What is FTP? — Glossary", href: "/glossary/ftp", kind: "glossary" },
      { label: "Podcast: FTP jumped 30 watts after this workout", href: "/podcast/ep-2026-ftp-jumped-30-watts-after-this-workout", kind: "podcast" },
    ],
    webAppFeatures: [
      "7-zone Coggan power zone model",
      "Instant wattage ranges from any FTP value",
      "Optional LTHR input for matched heart-rate zones",
      "Visual zone distribution chart",
      "Copy-to-clipboard results",
    ],
  },

  "race-weight": {
    slug: "race-weight",
    title: "Race Weight Calculator",
    description:
      "Find your target race weight range based on height, current body composition, and event type. Free, evidence-based and grounded in sports science.",
    url: `${ROADMAN_BASE}/tools/race-weight`,
    breadcrumbName: "Race Weight Calculator",
    answerSummary:
      "Enter height, weight, body fat percentage, gender and event type. The tool returns a target weight range, target body-fat band, weeks to reach it at a safe rate, and a coaching approach tailored to how much change is needed.",
    whatItDoes:
      "Race weight isn't \"the lowest number you've ever seen on the scale.\" It's the weight at which your power-to-weight ratio peaks for the event you're targeting — and you can hold it without losing power, immune function, or sleep. This calculator gives you a sensible target range, not a single number, and tells you how long it should take to get there.",
    whoItsFor: [
      "Riders with a specific target event — Etape, Marmotte, hill climb season, gran fondo",
      "Cyclists who suspect they're carrying weight that's costing them W/kg",
      "Athletes who want a body-comp goal that's safe, not punitive",
      "Anyone tempted to crash-diet before a race — please use this instead",
    ],
    howItWorks:
      "We use gender- and event-specific competitive amateur body-fat ranges (drawn from Jeukendrup & Gleeson) to project a target weight range from your current lean mass. A Miller-formula minimum healthy weight acts as a floor — we never recommend below medically reasonable. Weeks-to-target assumes 0.5% body weight loss per week, the safe maximum before performance suffers.",
    howToSteps: [
      { name: "Get an accurate body-fat reading", text: "DXA scan is the gold standard. Bioimpedance scales are noisy but acceptable if used consistently. Skinfolds done by the same practitioner work too. Avoid one-off readings on a friend's scale." },
      { name: "Enter your inputs", text: "Height (cm), current weight (kg), body fat (%), gender, and the event you're targeting. Event matters — a hill climb specialist needs a different range than a gran fondo rider." },
      { name: "Read the target range", text: "You'll see a target weight range, a body-fat band, and an estimated number of weeks at a safe loss rate. Pick the upper end of the range as your first target — most riders perform better there than at the bottom." },
      { name: "Pick the right approach", text: "If you're already inside the range, focus on power and don't lose more. If you're 2-5 kg out, fuel-for-the-work-required nudges will get you there. If you're more than that, treat it as a multi-month project, not a four-week diet." },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "All body-comp models are estimates — DXA scans vary by ±2% body fat between machines. The calculator can't see your training history, sleep, stress, menstrual cycle, or relative energy availability. The Miller floor is a rough safety guard, not a medical assessment. Treat the output as a sensible target range, not a prescription.",
    whenToSeeACoach:
      "If you've been below 10% body fat for an extended period, your FTP is dropping, you're getting sick often, or your relationship with food feels difficult — stop using this calculator and speak to a sports dietitian. Race weight without performance is just dieting, and it's the fastest way to end a season.",
    examples: [
      {
        scenario: "Male 75kg, 18% body fat, targeting hill climb season",
        inputs: ["Height: 180cm", "Weight: 75kg", "Body fat: 18%", "Gender: male", "Event: hill-climb"],
        output: "Target range 68-72kg at 7-10% body fat. ~12 weeks at 0.5%/wk. Approach: structured body-comp phase with protein at 1.6-2.2 g/kg.",
      },
      {
        scenario: "Female 62kg, 24% body fat, targeting gran fondo",
        inputs: ["Height: 168cm", "Weight: 62kg", "Body fat: 24%", "Gender: female", "Event: gran-fondo"],
        output: "Target range 56-60kg at 18-24%. ~6-10 weeks. Approach: smarter food quality and fuelling timing — no calorie restriction needed.",
      },
    ],
    faqs: [
      {
        question: "What is race weight in cycling?",
        answer: "Race weight is the body weight at which your power-to-weight ratio is highest for your target event, while staying healthy enough to train hard. It's a range, not a single number — typically 8-12% body fat for competitive male cyclists and 16-22% for competitive female cyclists, depending on event type.",
      },
      {
        question: "How fast can I safely lose weight for cycling?",
        answer: "0.5% of body weight per week is the safe maximum before training quality drops. For a 75kg rider, that's around 375g per week. Faster than this and you risk losing power, immune function, sleep quality, and developing an unhealthy relationship with food. Race weight is a multi-month project, not a four-week diet.",
      },
      {
        question: "Should I lose weight before a hill climb event?",
        answer: "If you have body fat to lose, yes — gravity is the dominant force on a sustained climb, so W/kg matters more than absolute watts. But the timing matters: arrive at race weight 2-3 weeks before your event, not on the day. Crash-dieting in the final week typically loses you more power than weight.",
      },
      {
        question: "What body fat percentage do pro cyclists have?",
        answer: "Grand Tour climbers typically race at 4-7% body fat for the duration of a 3-week tour. They cannot hold this year-round, and most periodise body composition with the season. Targeting pro values as an amateur is rarely a good idea — the cost in immune function, sleep, and life stress is high.",
      },
      {
        question: "How accurate is body fat measurement?",
        answer: "DXA scans are the most accurate widely available method (±2% between machines). Bioimpedance scales are noisy day-to-day but useful if you weigh in consistently — same time, same conditions, and look at the trend over weeks not days. Skinfolds done by the same practitioner are also acceptable. One-off readings on different machines tell you almost nothing.",
      },
    ],
    related: [
      { label: "W/kg Calculator", href: "/tools/wkg", kind: "tool" },
      { label: "Energy Availability Calculator", href: "/tools/energy-availability", kind: "tool" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "Race-weight strategy guide", href: "/blog/race-weight-cycling-guide", kind: "article" },
      { label: "Nutrition topic hub", href: "/topics/cycling-nutrition", kind: "topic" },
    ],
    webAppFeatures: [
      "Target weight range from height, weight and body fat",
      "Event-specific competitive amateur body-fat bands",
      "Safe weeks-to-target estimate at 0.5%/week",
      "Coaching approach tailored to size of change",
      "Miller-formula minimum-weight safety floor",
    ],
  },

  "fuelling": {
    slug: "fuelling",
    title: "In-Ride Fuelling Calculator",
    description:
      "Calculate carbs per hour, fluid, and sodium for your ride based on duration, intensity, body weight, gut training, and weather. Evidence-based, free.",
    url: `${ROADMAN_BASE}/tools/fuelling`,
    breadcrumbName: "In-Ride Fuelling Calculator",
    answerSummary:
      "Tell the calculator how long you're riding, how hard, your body weight, how trained your gut is, and the weather. It returns carbs per hour, total carbs, fluid per hour, sodium, glucose:fructose split, and a feeding interval based on Jeukendrup, Morton, and ACSM data.",
    whatItDoes:
      "Most amateur riders bonk because they under-fuel — they ride on what worked at lower intensities, then surprise themselves when they crack at hour three. This calculator gives you a specific carb, fluid, and sodium target for the actual ride you're doing, not a generic \"60 g per hour\" rule.",
    whoItsFor: [
      "Anyone riding longer than 90 minutes who wants to finish strong",
      "Riders preparing for a sportive, gran fondo, or stage race",
      "Cyclists training their gut to handle higher carb intakes",
      "Athletes whose ride performance falls off a cliff in heat",
    ],
    howItWorks:
      "We blend three frameworks: James Morton's \"fuel for the work required\" (carb intake scales with intensity), Asker Jeukendrup's dual-transporter model (glucose and fructose use separate transporters, allowing absorption above 60 g/hr), and ACSM/Sawka guidance on fluid and sodium. The result is a per-session prescription, not a generic recommendation.",
    howToSteps: [
      { name: "Pick the session profile", text: "Choose the closest match: recovery, endurance, tempo, sweet spot, threshold, VO2, race, or mixed intervals. Carb demand scales sharply with intensity." },
      { name: "Enter ride duration and weight", text: "Duration in minutes; body weight in kg. Lighter riders need fewer total carbs; longer rides need feeding earlier." },
      { name: "Set gut training honestly", text: "None / Some / Trained. If you're new to high-carb fuelling, start at the lower end of the range and build up over 4-6 weeks of training rides." },
      { name: "Add weather", text: "Temperature and humidity drive sweat and sodium loss. Above 25°C in humid conditions, fluid needs can double." },
      { name: "Execute on the bike", text: "Start fuelling within the first 30 minutes. Use the suggested feeding interval and respect the dual-transport split if you're above 60 g/hr." },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "Carb absorption is highly individual — published ceilings (90-120 g/hr) assume a trained gut and the right glucose:fructose ratio. Sodium needs vary 4-fold across athletes. The calculator estimates from population averages and won't match a sweat patch test. Treat the output as a starting prescription you refine with experience.",
    whenToSeeACoach:
      "If you've followed the recommendations and still bonk, GI distress is consistent, or your weight drops more than 2-3% during a ride despite drinking — get a sweat patch test and speak to a sports nutritionist. Some riders have unusually high sodium losses or fructose intolerance that this calculator can't see.",
    examples: [
      {
        scenario: "75kg rider, 4hr endurance ride, 22°C, gut moderately trained",
        inputs: ["Duration: 240 min", "Session: endurance", "Weight: 75kg", "Gut: some", "Temp: 22°C"],
        output: "60 g carbs/hr (240 g total), 600 ml fluid/hr, 500 mg sodium/hr, single-source glucose works.",
      },
      {
        scenario: "70kg racer, 5hr sportive with surges, 28°C humid, gut trained",
        inputs: ["Duration: 300 min", "Session: race", "Weight: 70kg", "Gut: trained", "Temp: 28°C"],
        output: "100 g carbs/hr (500 g total) using 2:1 glucose:fructose, 850 ml fluid/hr, 800 mg sodium/hr, feeding every 15 min.",
      },
    ],
    faqs: [
      {
        question: "How many carbs per hour should I eat on the bike?",
        answer: "It depends on intensity and how trained your gut is. Easy rides (<2 hours): 30-40 g/hr or nothing. Endurance (2-4 hours, Z2-Z3): 60-80 g/hr. Threshold and racing (4+ hours or hard): 90-120 g/hr if your gut is trained. Below 60 g/hr, glucose alone is fine; above that, use a 2:1 glucose:fructose mix to use both intestinal transporters.",
      },
      {
        question: "What is gut training in cycling?",
        answer: "Gut training is the practice of progressively eating more carbs during training rides so your gut adapts to absorb them under exercise. The intestinal sodium-glucose transporter (SGLT1) and the fructose transporter (GLUT5) both upregulate with repeated high-carb training. Untrained gut: target 40-60 g/hr. Trained gut: 90-120 g/hr is achievable.",
      },
      {
        question: "How much fluid should I drink per hour cycling?",
        answer: "500-1000 ml per hour depending on temperature, humidity, body size, and individual sweat rate. ACSM guidance is to limit weight loss during exercise to under 2% of body weight. Sip continuously rather than gulping every 30 minutes. In hot conditions, pre-cooling and continuous fluid intake matter more than total volume.",
      },
      {
        question: "Why do I bonk on long rides?",
        answer: "Almost always because total carbohydrate intake doesn't match work done. Glycogen stores at ~500 g (2000 kcal); a 4-hour ride at endurance pace can burn 2400-3200 kcal, with carbs supplying 50-85% of energy depending on intensity. If you're eating a banana and a gel and call it fuelled, you're running an energy deficit by hour two.",
      },
      {
        question: "What is the dual-transporter model?",
        answer: "Glucose is absorbed via SGLT1 — capped around 60 g/hr. Fructose uses GLUT5 — adds another ~30-40 g/hr capacity. Combining the two in a roughly 2:1 glucose:fructose ratio lets athletes absorb 90-120 g/hr without gut distress. Most performance gels and drinks designed for endurance now use this ratio.",
      },
    ],
    related: [
      { label: "Carbs-per-hour API", href: "/api/v1/tools/carbs-per-hour", kind: "tool" },
      { label: "Energy Availability Calculator", href: "/tools/energy-availability", kind: "tool" },
      { label: "Race Weight Calculator", href: "/tools/race-weight", kind: "tool" },
      { label: "Cycling nutrition topic hub", href: "/topics/cycling-nutrition", kind: "topic" },
      { label: "Glycogen — Glossary", href: "/glossary/glycogen", kind: "glossary" },
    ],
    webAppFeatures: [
      "Per-session carbs, fluid and sodium targets",
      "Glucose:fructose split for absorption above 60 g/hr",
      "Heat- and humidity-adjusted fluid recommendations",
      "Gut-training scaling (none / some / trained)",
      "Total ride carb load and feeding interval",
    ],
  },

  "wkg": {
    slug: "wkg",
    title: "W/kg Calculator",
    description:
      "Calculate your cycling power-to-weight ratio (W/kg) instantly and benchmark against amateur, competitive, and professional ranges.",
    url: `${ROADMAN_BASE}/tools/wkg`,
    breadcrumbName: "W/kg Calculator",
    answerSummary:
      "Enter your FTP in watts and body weight in kilograms. The calculator divides one by the other and returns your W/kg, plus where you sit across eight benchmark bands from beginner (under 1.5) to professional (5.0+).",
    whatItDoes:
      "W/kg is the single best predictor of climbing speed and overall road cycling performance. This calculator gives you the number and tells you which performance band you're in — without the cycling forum noise that usually comes with that question.",
    whoItsFor: [
      "Riders comparing themselves to event categories or peer groups",
      "Cyclists deciding whether to chase more power or less weight",
      "Anyone planning a bucket-list event with published category cut-offs",
      "Athletes who want a single fitness number that travels across all rides",
    ],
    howItWorks:
      "W/kg = FTP (watts) ÷ Body weight (kg). FTP should come from a 20-minute test (×0.95) or a ramp test. Body weight should be measured first thing in the morning, after the bathroom, before eating or drinking — and averaged across 3-4 consecutive days to remove noise.",
    howToSteps: [
      { name: "Determine FTP", text: "Complete a 20-minute all-out test on a power meter or smart trainer. Multiply average power by 0.95. Ramp tests on Zwift / TrainerRoad are an acceptable alternative." },
      { name: "Weigh consistently", text: "Record morning weight on 3-4 consecutive days. Average the result. This is the number to use — not your weight after a long ride or after a heavy meal." },
      { name: "Divide watts by kilograms", text: "Example: 260W / 72kg = 3.61 W/kg. The calculator does this and matches you to the closest benchmark band." },
      { name: "Decide which lever to pull", text: "If you're already at competitive amateur power but holding extra weight, body composition is the fastest gain. If your power is well below your weight class, train more — don't diet." },
    ],
    howToTotalTime: "PT1M",
    limitations:
      "W/kg predicts climbing speed but not flat performance — on flat roads, absolute watts and aerodynamics dominate. Body weight changes daily with hydration and food; rely on a 7-day rolling average. Benchmarks are population-based — being a band below \"competitive\" doesn't mean you're slow at your event.",
    whenToSeeACoach:
      "If your W/kg has been flat for 6+ months despite consistent training, the issue is rarely the number — it's how your training week is structured. Coaching is about how you spend your hours, not how you measure them.",
    examples: [
      {
        scenario: "Competitive amateur",
        inputs: ["FTP: 280W", "Weight: 72kg"],
        output: "3.89 W/kg — strong amateur band. Climbing target for a regional gran fondo podium.",
      },
      {
        scenario: "Comeback rider",
        inputs: ["FTP: 200W", "Weight: 88kg"],
        output: "2.27 W/kg — recreational band. The fastest gain is usually 3-4 kg of body composition rather than 30W of FTP.",
      },
    ],
    faqs: [
      {
        question: "What is a good W/kg for cycling?",
        answer: "Recreational: 1.5-2.5 W/kg. Fitness cyclist: 2.5-3.0. Competitive amateur: 3.0-3.5. Strong amateur: 3.5-4.0. Elite: 4.0-4.5. Semi-pro: 4.5-5.0. Professional: 5.0+. Grand Tour climbers: 6.0+ on a 20-minute climb.",
      },
      {
        question: "How do I improve my W/kg?",
        answer: "Two levers: increase FTP through structured training (polarised model, threshold intervals, consistency) or decrease body weight through the fuel-for-the-work-required framework. Most amateurs improve fastest through body composition changes. Riders already at low body fat usually need to train more, not eat less.",
      },
      {
        question: "Does W/kg matter on flat roads?",
        answer: "Less than on climbs. On flat roads, absolute watts and aerodynamic drag dominate finishing speed. A 90kg rider with 320W FTP will often beat a 65kg rider with 240W on the flat, even though the lighter rider has the better W/kg. W/kg is the king metric for climbing and overall stage-race performance.",
      },
      {
        question: "What's a realistic W/kg gain in one year?",
        answer: "A consistent amateur can typically gain 0.3-0.5 W/kg in a year through structured training and modest body-composition work. Beginners can gain more (1.0+) in their first year. Riders already at 4.5+ usually plateau and need very specific training and recovery to add another 0.1-0.2.",
      },
    ],
    related: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "Race Weight Calculator", href: "/tools/race-weight", kind: "tool" },
      { label: "Race Predictor", href: "/predict", kind: "tool" },
      { label: "W/kg complete guide", href: "/blog/cycling-power-to-weight-ratio-guide", kind: "article" },
      { label: "What is W/kg? — Glossary", href: "/glossary/w-kg", kind: "glossary" },
    ],
    webAppFeatures: [
      "Instant W/kg calculation",
      "Eight performance benchmark bands",
      "Visual benchmark comparison",
      "Recommendations on which lever to pull",
    ],
  },

  "hr-zones": {
    slug: "hr-zones",
    title: "Heart-Rate Zone Calculator",
    description:
      "Calculate your 5 cycling heart-rate zones from Max HR or LTHR. Free tool grounded in Friel and Coggan zone models.",
    url: `${ROADMAN_BASE}/tools/hr-zones`,
    breadcrumbName: "Heart-Rate Zone Calculator",
    answerSummary:
      "Enter either Max HR or Lactate Threshold HR (LTHR). The tool returns your five training zones in beats per minute — Active Recovery, Endurance, Tempo, Threshold, and VO2 — using the established Friel-style percentage bands.",
    whatItDoes:
      "Heart rate is the cheapest, most universal training signal. This calculator turns one number — either Max HR or LTHR — into five zone ranges you can dial straight into your Garmin, Wahoo, or Polar device.",
    whoItsFor: [
      "Riders training without a power meter",
      "Cyclists who use HR as a backup to power",
      "Beginners getting structured for the first time",
      "Anyone setting up a new device or platform",
    ],
    howItWorks:
      "If you enter LTHR, we use Friel's zone bands as percentages of LTHR — slightly more accurate than Max HR for trained athletes. If you only have Max HR, we apply Karvonen-style percentages of HRmax. LTHR comes from the average HR for the last 20 minutes of an FTP test; Max HR comes from a true all-out 5-min effort or a recent strenuous race.",
    howToSteps: [
      { name: "Pick which number you have", text: "LTHR (preferred for trained riders) or Max HR. If neither, do a 20-minute FTP test and record both — average HR for the last 20 min is your LTHR estimate; the highest reading is close to Max HR." },
      { name: "Enter the value", text: "LTHR typically falls 130-180 bpm for adults; Max HR typically 170-200 bpm. Outside these ranges is possible but rare." },
      { name: "Read the five zones", text: "Z1 (recovery), Z2 (endurance), Z3 (tempo), Z4 (threshold), Z5 (VO2)." },
      { name: "Apply on the bike", text: "Use the zones as a target on outdoor rides where power isn't available, or as a sanity check on indoor sessions. Heart rate drifts upward 5-10 bpm after 60 minutes — that's normal cardiac drift, not a fitness problem." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "Heart rate is influenced by sleep, caffeine, dehydration, heat, and stress — it can drift 5-15 bpm in either direction. HR zones lag effort by 30-90 seconds, so they're poor for short intervals. Max HR drops with age but not at the textbook \"220 minus age\" rate — that formula is wrong for most trained athletes. Where possible, use power as the primary control and HR as the cross-check.",
    whenToSeeACoach:
      "If your HR is 10+ bpm above normal at the same power for several days running, you're likely under-recovered, ill, or over-reaching. That's where coaching and structured monitoring beats more numbers — it changes how you respond.",
    examples: [
      {
        scenario: "Trained rider with LTHR test",
        inputs: ["LTHR: 168 bpm"],
        output: "Z2: 119-141 bpm. Z3: 142-159 bpm. Z4: 160-176 bpm. Z5: 177+ bpm.",
      },
      {
        scenario: "New rider with Max HR estimate",
        inputs: ["Max HR: 188 bpm"],
        output: "Z2: 113-141 bpm. Z3: 142-160 bpm. Z4: 161-179 bpm.",
      },
    ],
    faqs: [
      {
        question: "How do I find my Max HR?",
        answer: "The most accurate way is a true all-out test — a hard 5-minute effort at the end of a race or hard interval session, with a 30-second sprint to finish. Take the highest reading. Avoid the \"220 minus age\" formula — it's a population average and is wrong for most trained athletes by 5-15 bpm in either direction.",
      },
      {
        question: "What is LTHR in cycling?",
        answer: "LTHR is your Lactate Threshold Heart Rate — the heart rate corresponding to your FTP. The simplest way to estimate it is to do a 20-minute FTP test and record the average heart rate for the last 20 minutes. LTHR is more useful than Max HR for setting zones in trained athletes, because it scales better with training adaptation.",
      },
      {
        question: "Should I train with heart rate or power?",
        answer: "Power is the primary control if you have access to it — instant, doesn't drift, isn't affected by heat or stress. Heart rate is a useful cross-check and is fine as a primary signal for endurance riders without a power meter. The best setup is power as the target, HR as the sanity check.",
      },
      {
        question: "Why is my heart rate higher in summer?",
        answer: "Cardiac drift in heat is real — your heart works harder to pump blood to skin for cooling, which raises HR for the same power output by 5-15 bpm. Don't chase HR zones when it's hot; let power lead and accept HR runs higher than usual.",
      },
    ],
    related: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "W/kg Calculator", href: "/tools/wkg", kind: "tool" },
      { label: "Heart-rate vs power training guide", href: "/blog/heart-rate-vs-power-cycling", kind: "article" },
      { label: "FTP training topic hub", href: "/topics/ftp-training", kind: "topic" },
    ],
    webAppFeatures: [
      "5-zone Friel/Coggan HR zone model",
      "Accepts Max HR or LTHR",
      "Instant bpm ranges",
      "Polarised training guidance",
    ],
  },

  "tyre-pressure": {
    slug: "tyre-pressure",
    title: "Tyre Pressure Calculator",
    description:
      "SILCA-grade front and rear tyre pressure based on rider weight, tyre width, rim width, surface, and tube type. Free, evidence-based.",
    url: `${ROADMAN_BASE}/tools/tyre-pressure`,
    breadcrumbName: "Tyre Pressure Calculator",
    answerSummary:
      "Enter rider and bike weight, tyre and internal rim width, road surface, and tube type. The calculator returns front and rear PSI targets following SILCA-style impedance-loss optimisation — the same logic the WorldTour use to set up their tyres.",
    whatItDoes:
      "The right tyre pressure isn't \"the maximum on the sidewall\" — that's almost always too high. Lower pressures roll faster on real roads because they reduce impedance losses (the energy spent vibrating the rider, not just the tyre). This calculator gives you front and rear targets for your specific setup and surface.",
    whoItsFor: [
      "Anyone running modern wide tyres (28mm+) on hookless or wide rims",
      "Riders who still pump to 100+ psi out of habit",
      "Gravel and all-road cyclists juggling road and rough surfaces",
      "Tubeless converts who want to confirm safe minimums",
    ],
    howItWorks:
      "Optimal pressure scales with system weight (rider + bike + kit), tyre volume (width × internal rim width), and surface roughness. We model this off SILCA-style impedance-loss research — pressure too high causes the tyre to bounce instead of rolling, costing watts. Front pressure runs ~5 PSI lower than rear because the front carries less weight.",
    howToSteps: [
      { name: "Weigh yourself in kit", text: "Add your weight in cycling kit, the bike, plus bottles and any luggage. Most riders forget to add 1-2 kg of kit and bottles." },
      { name: "Measure rim width, not stated tyre width", text: "Internal rim width is the number that matters. Measure with calipers or check the manufacturer spec. Modern road rims are 19-25 mm internal." },
      { name: "Pick the surface", text: "Smooth tarmac, rough chip-seal, or gravel/cobbles. Each surface shifts the optimal pressure down by several PSI." },
      { name: "Set front and rear separately", text: "The calculator returns different front and rear values. Set them with a digital pressure gauge — most floor pumps are wrong by 5-10 PSI." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "The calculator can't see your specific tyre casing (some tyres have noticeably different impedance curves), your rim's actual mounted tyre width (which is often 1-2 mm wider than stated), or your tubeless sealant volume. Use the output as a starting point; adjust ±5 PSI based on how the bike feels on your local roads.",
    whenToSeeACoach:
      "If you're tracking watts on a known segment and the difference between two pressures is in the noise — it probably is. Tyre-pressure optimisation is worth 5-15 watts on rough roads but isn't going to win you a race. Get the basics right, then move on.",
    examples: [
      {
        scenario: "75kg rider, 28mm tubeless, 21mm rim, smooth tarmac",
        inputs: ["Total weight: 84kg", "Tyre: 28mm", "Rim: 21mm", "Surface: smooth", "Tube: tubeless"],
        output: "Front: 65 PSI. Rear: 70 PSI.",
      },
      {
        scenario: "85kg rider, 38mm gravel tubeless, 24mm rim, gravel surface",
        inputs: ["Total weight: 95kg", "Tyre: 38mm", "Rim: 24mm", "Surface: gravel", "Tube: tubeless"],
        output: "Front: 32 PSI. Rear: 36 PSI.",
      },
    ],
    faqs: [
      {
        question: "What tyre pressure should I run on a road bike?",
        answer: "For a 70kg rider on 28mm tubeless tyres with 21mm internal rims on smooth tarmac, around 65-70 PSI front, 70-75 PSI rear is fast. Add 5-10 PSI per 10kg above 70kg. Subtract 5-10 PSI for rough roads. The sidewall maximum is a safety limit, not a target — it's almost always too high.",
      },
      {
        question: "Why do lower tyre pressures roll faster?",
        answer: "On real roads, energy is lost two ways — hysteresis (tyre deformation) and impedance (rider/bike vibration). Higher pressure reduces hysteresis but increases impedance, because the tyre bounces over bumps instead of absorbing them. Below the optimum, hysteresis dominates and you get slower; above, impedance dominates. SILCA's research found the optimum is usually well below the sidewall max.",
      },
      {
        question: "How much lower should front pressure be than rear?",
        answer: "Around 5 PSI lower on a road bike, because the front wheel carries roughly 40% of system weight versus 60% on the rear. On gravel or all-road, the gap can grow to 4-6 PSI. Running equal pressure makes the front feel harsh and the rear feel soft.",
      },
      {
        question: "Are tubeless tyres faster than tubes?",
        answer: "Yes — typically 5-15 watts faster at the same pressure due to lower hysteresis losses, plus tubeless lets you safely run lower pressures (no pinch flat risk), unlocking more impedance gains. The trade-off is setup hassle and sealant maintenance.",
      },
      {
        question: "Is the maximum sidewall pressure safe?",
        answer: "Yes, it's a safety limit. But it's not the target. The sidewall max exists for legal/insurance reasons — running near it on a wide modern tyre with a wide rim almost always rolls slower and definitely feels worse. Treat the calculator's number as the target and the sidewall as a never-exceed ceiling.",
      },
    ],
    related: [
      { label: "MTB Setup Calculator", href: "/tools/shock-pressure", kind: "tool" },
      { label: "Race Predictor", href: "/predict", kind: "tool" },
      { label: "Tyre pressure complete guide", href: "/blog/cycling-tyre-pressure-guide", kind: "article" },
      { label: "Equipment topic hub", href: "/topics/cycling-equipment", kind: "topic" },
    ],
    webAppFeatures: [
      "Front and rear PSI based on system weight",
      "Tyre and internal rim-width inputs",
      "Surface adjustment (smooth / rough / gravel)",
      "Tubeless and clincher modes",
      "SILCA-style impedance-loss model",
    ],
  },

  "shock-pressure": {
    slug: "shock-pressure",
    title: "MTB Suspension Setup Calculator",
    description:
      "Set fork and shock pressure, sag targets, and suspension setup for your mountain bike. Free, evidence-based MTB tool.",
    url: `${ROADMAN_BASE}/tools/shock-pressure`,
    breadcrumbName: "MTB Suspension Setup Calculator",
    answerSummary:
      "Enter rider and bike weight, shock type (air or coil), and intended use (XC, trail, enduro, DH). The calculator returns starting fork and shock pressures, sag targets, and a sequence of bracketing adjustments to dial in suspension on the trail.",
    whatItDoes:
      "Most riders set suspension once and never touch it again — usually too soft on the rear and too stiff on the front. This calculator gives you a sensible starting setup based on your weight and discipline, then walks you through the bracketing steps to fine-tune sag, rebound, and compression.",
    whoItsFor: [
      "MTB riders new to suspension setup",
      "Cyclists changing bikes, weight, or terrain",
      "Anyone whose bike feels harsh on small bumps but bottoms out on big ones",
      "Trail and enduro riders setting up for a specific course",
    ],
    howItWorks:
      "Air-spring pressure scales with rider weight and the manufacturer's recommended sag percentage for the discipline (typically 20-25% for XC, 25-30% for trail, 30-35% for enduro/DH). We use known PSI/kg curves for popular Fox and RockShox dampers, plus a sag-bracketing protocol to fine-tune. Coil spring rates use the standard load-deflection equation.",
    howToSteps: [
      { name: "Weigh yourself in full riding kit", text: "Helmet, pads, hydration pack, shoes, and water — full ride weight. This number is what the suspension actually has to support." },
      { name: "Pick discipline and shock type", text: "XC, trail, enduro, or DH; air spring or coil. Sag targets shift with discipline." },
      { name: "Set starting pressure or spring rate", text: "Use the calculator's starting value, then check sag with a sag-meter or O-ring while seated in normal riding position." },
      { name: "Bracket your settings", text: "If sag is too high, add 5-10 PSI; too low, drop 5-10 PSI. Adjust rebound to match the suspension's recommended damping curve. Compression last." },
      { name: "Test on familiar terrain", text: "Ride a known trail. If the bike packs through repeated hits, increase rebound damping. If it bucks, decrease it. Bottoming on every big drop means add volume spacers, not pressure." },
    ],
    howToTotalTime: "PT5M",
    limitations:
      "Suspension setup is highly individual and depends on terrain, riding style, and damper internals that differ between models. Use the calculator as a starting point — the bracketing protocol is what actually dials it in. We can't see your specific damper's tune or whether your seals need a service.",
    whenToSeeACoach:
      "If your suspension still feels wrong after bracketing, the issue is usually a service item — worn seals, contaminated oil, or a damper tune that doesn't match your weight. A qualified suspension service is more effective than another spreadsheet at that point.",
    examples: [
      {
        scenario: "Trail rider, 80kg in kit, 140mm air fork and shock",
        inputs: ["Rider weight: 75kg", "Bike+kit: 5kg", "Discipline: trail", "Shock type: air"],
        output: "Fork: ~85 PSI for 25% sag. Shock: ~190 PSI for 28% sag. Rebound 8 clicks from closed front, 7 rear.",
      },
      {
        scenario: "Enduro rider, 90kg, coil shock",
        inputs: ["Rider weight: 84kg", "Bike+kit: 6kg", "Discipline: enduro", "Shock type: coil"],
        output: "Coil spring rate: ~500 lb/in for 30% sag. Air fork: ~95 PSI. Rebound and compression set to mid-range to start, then bracket.",
      },
    ],
    faqs: [
      {
        question: "What is sag in MTB suspension?",
        answer: "Sag is the amount your suspension compresses under your static body weight in normal riding position. It's measured as a percentage of total travel: 20-25% for XC, 25-30% for trail, 30-35% for enduro and DH. Too little sag means the suspension can't track small bumps; too much means it bottoms out.",
      },
      {
        question: "How do I set my fork pressure?",
        answer: "Start with the calculator's recommended PSI for your weight and discipline. Strap a sag-meter or zip-tie to the stanchion, sit on the bike in normal riding position (hands on bars, feet on pedals), and check how much travel you've used. Adjust 5-10 PSI at a time until sag is within range.",
      },
      {
        question: "Air or coil shock — which is better?",
        answer: "Air is lighter, more adjustable, and supports a wider weight range — best for XC, trail, and most enduro use. Coil is more sensitive on small bumps, more linear through the stroke, and more durable, but heavier and limited to a single rider weight per spring. DH and aggressive enduro often run coil; cross-country runs air.",
      },
      {
        question: "Why does my suspension feel harsh on small bumps?",
        answer: "Usually compression damping is set too high, rebound is too slow (so the suspension hasn't fully extended before the next bump), or air pressure is too high for your weight. Drop pressure 5-10 PSI, open compression, and check sag is in range. If it's still harsh, the seals may need service.",
      },
      {
        question: "How often should I service MTB suspension?",
        answer: "Lower-leg service every 50 hours, full damper service every 100-200 hours depending on conditions. Riding in mud, dust, or wet weather shortens intervals. A serviced fork or shock is worth more than a top-end model that's been ridden into the ground without maintenance.",
      },
    ],
    related: [
      { label: "Tyre Pressure Calculator", href: "/tools/tyre-pressure", kind: "tool" },
      { label: "MTB suspension setup guide", href: "/blog/mtb-suspension-setup-guide", kind: "article" },
      { label: "Equipment topic hub", href: "/topics/cycling-equipment", kind: "topic" },
    ],
    webAppFeatures: [
      "Fork and shock pressure starting values",
      "Sag targets per discipline",
      "Air spring and coil-spring modes",
      "Bracketing protocol for fine-tuning",
    ],
  },

  "energy-availability": {
    slug: "energy-availability",
    title: "Energy Availability Calculator",
    description:
      "Calculate energy availability and screen for RED-S risk based on training load, calorie intake, body weight, and gender.",
    url: `${ROADMAN_BASE}/tools/energy-availability`,
    breadcrumbName: "Energy Availability Calculator",
    answerSummary:
      "Enter training hours, daily calorie intake, body weight, and gender. The calculator returns energy availability in kcal per kg of fat-free mass and screens you against RED-S risk thresholds (under 30, 30-45, and over 45 kcal/kg FFM/day).",
    whatItDoes:
      "Energy availability is the calories left over for everyday physiological function once you've subtracted what training burned. Chronic low energy availability is the root cause of RED-S — Relative Energy Deficiency in Sport — which costs cyclists power, immune function, sleep, hormonal health, and bone density. This tool tells you whether you're under-fuelling without realising.",
    whoItsFor: [
      "Riders pursuing race weight",
      "High-volume cyclists training 12+ hours per week",
      "Anyone with persistent fatigue, frequent illness, or stalled progress",
      "Female cyclists with menstrual irregularity or stress fractures",
      "Coaches screening athletes",
    ],
    howItWorks:
      "Energy Availability (EA) = (Daily intake kcal − Exercise energy expenditure kcal) ÷ Fat-free mass (kg). Three thresholds matter: above 45 kcal/kg FFM/day = optimal; 30-45 = sub-optimal but not severely impaired; below 30 = clinical low energy availability with measurable hormonal and performance consequences.",
    howToSteps: [
      { name: "Track intake honestly for 7 days", text: "Use a food-tracking app and weigh portions. Most amateurs under-report by 20-30%. Use the 7-day average rather than a single day." },
      { name: "Estimate exercise energy expenditure", text: "Cycling watts × hours × 3.6 ≈ kcal. A 75kg rider doing 10 hours/week at 180W average burns roughly 6,500 kcal/week (≈930/day)." },
      { name: "Estimate fat-free mass", text: "Body weight × (1 − body fat fraction). Use a DXA, bioimpedance scale, or skinfolds. A 75kg rider at 15% body fat has ~64 kg fat-free mass." },
      { name: "Read the result", text: "If EA is under 30 kcal/kg FFM/day, raise food intake or reduce training load — ideally both. If 30-45, you're under-fuelling enough to limit adaptation. Above 45 is the target zone." },
    ],
    howToTotalTime: "PT4M",
    limitations:
      "EA estimates depend on accurate calorie tracking and accurate exercise expenditure — both have meaningful error bars. The thresholds (30 / 45 kcal/kg FFM/day) come from research mostly on female athletes; male data is more sparse. EA is a screening tool, not a diagnosis. RED-S diagnosis requires medical input and looks at symptoms (low resting HR, missing periods, recurrent illness, stress fractures) alongside the number.",
    whenToSeeACoach:
      "If your EA is below 30, you've had recurrent illness, stress fractures, missing periods, or your power is dropping despite training — stop adjusting calories alone and book in with a sports physician and a registered dietitian. RED-S is a medical issue, not a coaching one.",
    examples: [
      {
        scenario: "Female 60kg rider, 12hr/week training",
        inputs: ["Intake: 2,400 kcal/day", "Training: 12 hr/week at 150W", "Weight: 60kg", "Body fat: 22%"],
        output: "EA: ~28 kcal/kg FFM/day — clinical low EA. Add 300-400 kcal/day to lift above the 30 threshold.",
      },
      {
        scenario: "Male 75kg rider, 8hr/week training",
        inputs: ["Intake: 3,200 kcal/day", "Training: 8 hr/week at 200W", "Weight: 75kg", "Body fat: 15%"],
        output: "EA: ~46 kcal/kg FFM/day — optimal. Maintain intake around hard training blocks.",
      },
    ],
    faqs: [
      {
        question: "What is RED-S in cycling?",
        answer: "RED-S — Relative Energy Deficiency in Sport — is a syndrome caused by chronically low energy availability. Symptoms include drops in performance, recurrent illness, low libido, missing periods (in females), low testosterone (in males), bone stress injuries, low resting HR, sleep disruption, and irritability. Cyclists are at high risk because the sport is body-weight sensitive.",
      },
      {
        question: "What is a healthy energy availability for cyclists?",
        answer: "Above 45 kcal per kg of fat-free mass per day is considered optimal. 30-45 is sub-optimal and limits training adaptation. Below 30 is clinical low energy availability with measurable hormonal and performance consequences and shouldn't be sustained beyond short, supervised body-comp phases.",
      },
      {
        question: "How is energy availability different from calorie deficit?",
        answer: "A calorie deficit is intake minus total energy expenditure (BMR + activity). Energy availability is intake minus exercise expenditure, divided by fat-free mass — what's left over to fuel basic physiological function. You can be in a small calorie deficit AND in healthy EA, or in calorie balance and dangerously low EA if training volume is high. EA is the more useful number for athletes.",
      },
      {
        question: "Can I diet for race weight without low energy availability?",
        answer: "Yes — but only if the deficit is small (≤300-400 kcal/day), the duration is limited (4-12 weeks), protein is high (1.6-2.2 g/kg), and you fuel hard training days fully. The danger is dieting through a high-volume training block with under-fuelled key sessions — that's the recipe for RED-S.",
      },
      {
        question: "How do I know if I have RED-S?",
        answer: "EA below 30 for an extended period plus symptoms — drops in power, recurrent illness, missing periods, stress fractures, low resting HR, poor sleep, low libido. Diagnosis requires medical input, blood work, and DXA. Don't self-diagnose; do screen yourself with this calculator and book in if multiple flags are present.",
      },
    ],
    related: [
      { label: "Race Weight Calculator", href: "/tools/race-weight", kind: "tool" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling", kind: "tool" },
      { label: "RED-S complete guide", href: "/blog/red-s-cycling-guide", kind: "article" },
      { label: "Cycling nutrition topic hub", href: "/topics/cycling-nutrition", kind: "topic" },
    ],
    webAppFeatures: [
      "EA calculation in kcal per kg fat-free mass",
      "RED-S risk screening (3 thresholds)",
      "Training-load and intake inputs",
      "Recommendations to lift above clinical low",
    ],
  },
};

/** Helper for components that look up a tool by slug. */
export function getToolLanding(slug: string): ToolLandingContent | undefined {
  return TOOL_LANDING_CONTENT[slug];
}
