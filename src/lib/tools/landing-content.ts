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

export interface ToolEvidenceSource {
  name: string;
  role: string;
  href: string;
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
  /** Primary research and consensus sources used to verify the model and copy. */
  evidenceSources?: ToolEvidenceSource[];
  /** ISO date used by visible trust signals and WebPage structured data. */
  dateModified?: string;
  /** Named human who checked the source-to-claim mapping. */
  reviewedBy?: string;
  /** Honest scope of the review; avoids implying clinical or dietetic review. */
  reviewScope?: string;
}

const ROADMAN_BASE = "https://roadmancycling.com";

export const TOOL_LANDING_CONTENT: Record<string, ToolLandingContent> = {
  "ftp-zones": {
    slug: "ftp-zones",
    title: "FTP Calculator",
    description:
      "Calculate seven continuous cycling power zones from FTP, with whole-watt ranges, test guidance and explicit evidence limits.",
    url: `${ROADMAN_BASE}/tools/ftp-zones`,
    breadcrumbName: "FTP Calculator",
    answerSummary:
      "Enter a recent FTP and this calculator converts it into seven conventional cycling power ranges. It returns continuous whole-watt bands with no gaps. These are starting targets, not measured lactate or ventilatory thresholds: two riders with the same FTP can still have different power-duration profiles and responses.",
    whatItDoes:
      "This is a transparent percentage conversion, not a laboratory test or a complete training prescription. It turns one FTP value into seven whole-watt ranges so a workout written in power zones has usable targets. Every watt belongs to exactly one range.\n\nIt is the general FTP calculator for training-zone intent. If the question is how your FTP compares with riders of the same age and gender, use the separate masters benchmark calculator.",
    whoItsFor: [
      "Cyclists who have a recent FTP and need power targets for a structured plan",
      "Riders setting cycling power zones in a head unit or training platform",
      "Coaches and self-coached athletes checking a transparent percentage table",
      "Anyone repeating an FTP protocol who wants gap-free whole-watt ranges",
    ],
    howItWorks:
      "The calculator applies conventional Coggan-style upper boundaries: Zone 1 up to 55% of FTP, Zone 2 above 55% to 75%, Zone 3 above 75% to 90%, Zone 4 above 90% to 105%, Zone 5 above 105% to 120%, Zone 6 above 120% to 150%, and Zone 7 above 150%. After rounding an upper boundary down to a whole watt, the next zone starts one watt higher. That prevents gaps and overlaps.",
    howToSteps: [
      { name: "Use a current, repeatable FTP", text: "Take FTP from a protocol you can repeat under similar conditions. Multiplying a 20-minute test by 0.95 is one common field estimate, but ramp, 20-minute, hour and critical-power tests are not interchangeable." },
      { name: "Enter FTP in watts", text: "Input a value from 50 to 600 watts. The calculator does not judge whether the number is physiologically valid; it only converts the value you provide." },
      { name: "Read the continuous ranges", text: "Each displayed whole-watt range begins immediately after the previous one ends. For a 280 W FTP, Zone 2 is 155–210 W and Zone 3 is 211–252 W." },
      { name: "Calibrate in training", text: "Use the ranges as starting targets. Adjust the session with breathing, RPE, heart rate, repeatability and coaching context because fixed percentages do not locate individual physiological thresholds." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "The output is only as current and repeatable as the FTP input. A 20-minute FTP estimate is related to, but not interchangeable with, critical power or laboratory lactate landmarks. Fixed percentages also cannot describe every rider's sustainable duration above FTP. Finally, a seven-zone power table is not the same thing as the three-zone models used in training-intensity-distribution research, so this calculator cannot prescribe a universal 80/20 week.",
    whenToSeeACoach:
      "Use a coach or sports scientist when test protocols disagree materially, the same percentage produces very different responses between riders, or you need zones tied to lactate, ventilation, race demands and a complete training plan rather than a generic percentage model.",
    examples: [
      {
        scenario: "Example A: 280 W FTP",
        inputs: ["FTP input: 280 W", "Whole-watt boundaries"],
        output: "Z1: 0–154 W · Z2: 155–210 W · Z3: 211–252 W · Z4: 253–294 W · Z5: 295–336 W · Z6: 337–420 W · Z7: 421 W+.",
      },
      {
        scenario: "Example B: 180 W FTP",
        inputs: ["FTP input: 180 W", "Whole-watt boundaries"],
        output: "Z1: 0–99 W · Z2: 100–135 W · Z3: 136–162 W · Z4: 163–189 W · Z5: 190–216 W · Z6: 217–270 W · Z7: 271 W+.",
      },
    ],
    faqs: [
      {
        question: "What is FTP in cycling?",
        answer: "FTP stands for Functional Threshold Power. It is a practical cycling performance marker used to scale workouts and compare repeat tests. It is often described as power near a quasi-steady effort, but a calculated FTP is not a guarantee that every rider can hold that wattage for exactly one hour.",
      },
      {
        question: "How do I calculate my FTP?",
        answer: "One common field protocol multiplies mean power from a 20-minute test by 0.95. That factor is an estimate, not a universal physiological conversion. Ramp tests, longer time trials and critical-power models can return different values, so use the same protocol when tracking change. Roadman's FTP test calculator compares the available protocols.",
      },
      {
        question: "What are the seven cycling power zones?",
        answer: "This calculator uses Zone 1 up to 55% of FTP, Zone 2 above 55% to 75%, Zone 3 above 75% to 90%, Zone 4 above 90% to 105%, Zone 5 above 105% to 120%, Zone 6 above 120% to 150%, and Zone 7 above 150%. Labels can differ across platforms, so keep the selected model consistent with your plan.",
      },
      {
        question: "Why do Roadman's watt ranges have no gaps?",
        answer: "Percentage boundaries often land between whole watts. Roadman rounds each upper boundary down, then begins the next zone one watt higher. At 280 W FTP, Zone 1 ends at 154 W and Zone 2 begins at 155 W. Every whole watt therefore belongs to one zone, with no overlap or missing target.",
      },
      {
        question: "How often should I retest FTP?",
        answer: "Retest when the value is stale enough to distort sessions, after a meaningful training block, or when repeatable workouts show the current targets no longer fit. There is no single interval that suits every rider. Keep the device, protocol, environment and preparation as consistent as practical before comparing results.",
      },
      {
        question: "Are FTP and critical power the same?",
        answer: "No. They are strongly related performance markers, but published studies report limits of agreement large enough that they should not be used interchangeably for individual training decisions. Critical power is fitted from multiple efforts across the power-duration curve; FTP is commonly estimated from one field protocol.",
      },
      {
        question: "Which Roadman FTP calculator should I use?",
        answer: "Use this FTP calculator when you want seven training-zone watt ranges. Use the FTP test calculator when you need to estimate FTP from a test result. Use the masters FTP calculator by age and gender when you want an age-graded W/kg percentile rather than training zones.",
      },
    ],
    related: [
      { label: "FTP Test Calculator", href: "/tools/ftp-test", kind: "tool" },
      { label: "FTP Calculator by Age & Gender", href: "/tools/masters-ftp-benchmark", kind: "tool" },
      { label: "W/kg Calculator", href: "/tools/wkg", kind: "tool" },
      { label: "FTP training topic hub", href: "/topics/ftp-training", kind: "topic" },
      { label: "What Is FTP in Cycling?", href: "/topics/ftp-training", kind: "topic" },
      { label: "Complete FTP Training Zones Guide", href: "/blog/ftp-training-zones-cycling-complete-guide", kind: "article" },
    ],
    webAppFeatures: [
      "Seven conventional cycling power zones",
      "Continuous whole-watt ranges with no gaps or overlaps",
      "Instant results from any FTP value between 50 and 600 watts",
      "Transparent percentage boundaries and worked examples",
      "Copy-to-clipboard results",
    ],
    evidenceSources: [
      {
        name: "TrainingPeaks: Cycling Power Zones Explained",
        role: "published Allen-Coggan percentage-zone reference",
        href: "https://www.trainingpeaks.com/blog/power-training-levels/",
      },
      {
        name: "Valenzuela et al. 2020, Reliability of Functional Threshold Power",
        role: "FTP20 reliability and 95% field-test convention",
        href: "https://pubmed.ncbi.nlm.nih.gov/31952081/",
      },
      {
        name: "Karsten et al. 2021, Critical Power and FTP20",
        role: "limits of agreement between critical power and FTP",
        href: "https://pubmed.ncbi.nlm.nih.gov/33551839/",
      },
      {
        name: "Morgan et al. 2022, FTP and Lactate Thresholds",
        role: "boundary on substituting FTP for laboratory lactate landmarks",
        href: "https://pubmed.ncbi.nlm.nih.gov/34127613/",
      },
      {
        name: "Jeffries et al. 2022, Time to Exhaustion at FTP",
        role: "individual variation in sustainable duration at estimated FTP",
        href: "https://pubmed.ncbi.nlm.nih.gov/35835698/",
      },
      {
        name: "Rosenblat et al. 2025, Training Intensity Distribution",
        role: "evidence boundary for universal polarised-versus-pyramidal claims",
        href: "https://pubmed.ncbi.nlm.nih.gov/39888556/",
      },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "method and primary-source verification",
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
      { label: "Race-weight strategy guide", href: "/blog/cycling-weight-loss-fuel-for-the-work-required", kind: "article" },
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
    title: "Cycling Nutrition Calculator",
    description:
      "Estimate carbs, fluid and sodium per hour from ride duration, power, intensity, gut training, body weight and weather. Free and evidence-informed.",
    url: `${ROADMAN_BASE}/tools/fuelling`,
    breadcrumbName: "Cycling Nutrition Calculator",
    answerSummary:
      "Enter ride duration, power, session type, body weight, gut-training level and weather. The cycling nutrition calculator returns planning estimates for carbohydrate, fluid and sodium per hour, total carbohydrate, feeding intervals and a glucose:fructose split. Rehearse the output in training and adjust it from your own tolerance and sweat-rate data.",
    whatItDoes:
      "A single grams-per-hour rule cannot fit a recovery spin, a hard two-hour session and a five-hour race. This tool converts the ride you are planning into a practical starting range for carbohydrate, fluid and sodium. It also shows how to divide higher carbohydrate intakes between glucose and fructose. The numbers are modelled estimates, not laboratory measurements or medical advice.",
    whoItsFor: [
      "Cyclists planning a long training ride, sportive, gran fondo or race",
      "Riders comparing 30, 60, 90 or 120 g/hr carbohydrate strategies",
      "Athletes practising higher intakes before an important event",
      "Cyclists who want a weather-adjusted starting point before measuring sweat rate",
    ],
    howItWorks:
      "The model estimates carbohydrate demand from expected power, ride duration and session type, then limits the suggested intake according to the gut-training level you select. Higher targets use glucose and fructose because they rely on different intestinal transporters. Fluid begins with body mass, intensity and weather; sodium uses a population-average sweat concentration. Those last two estimates should be replaced by your own pre/post-ride body-mass and sweat-test data when available.",
    howToSteps: [
      { name: "Describe the ride", text: "Enter duration, expected average power and the closest session type. These inputs drive the carbohydrate estimate." },
      { name: "Add body weight", text: "Body weight is used for the fluid estimate, not to scale the carbohydrate target. Carbohydrate demand is modelled from the work being done." },
      { name: "Set gut training honestly", text: "Choose beginner, moderate or trained. High targets are appropriate only after the same product and dose have been tolerated repeatedly in training." },
      { name: "Add the conditions", text: "Use local or manual temperature and humidity. Weather adjusts the starting fluid estimate, but it cannot know your individual sweat rate." },
      { name: "Rehearse and calibrate", text: "Spread intake across the ride, note gastrointestinal symptoms, and compare body mass before and after representative sessions. Change one variable at a time." },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "This is a planning model. It does not measure your respiratory exchange ratio, glycogen status, sweat rate, sweat sodium, gastrointestinal tolerance or medical history. Research supporting 120 g/hr comes from tightly controlled endurance protocols and trained participants; it is not a universal target. Fluid and sodium losses vary widely, while both underdrinking and overdrinking can be harmful. Never use the result to force fluid intake or ignore thirst, symptoms or body-mass gain.",
    whenToSeeACoach:
      "Speak to a registered sports dietitian or qualified clinician if gastrointestinal distress persists, you have diabetes or another condition affected by carbohydrate/fluid intake, you repeatedly gain body mass during long rides, or performance and health decline despite adequate training. A coach can help with execution; clinical nutrition questions need an appropriately qualified professional.",
    examples: [
      {
        scenario: "75kg rider, 4hr endurance ride, moderate conditions",
        inputs: ["Duration: 240 min", "Average power: 150W", "Session: endurance", "Weight: 75kg", "Gut: moderate", "Weather: 20°C, 50% humidity"],
        output: "About 74 g carbohydrate/hr (296 g total), 450 ml fluid/hr and 500 mg sodium/hr. Because intake is above 60 g/hr, the tool suggests glucose plus fructose.",
      },
      {
        scenario: "70kg trained rider, 5hr race, warm and humid",
        inputs: ["Duration: 300 min", "Average power: 180W", "Session: race", "Weight: 70kg", "Gut: trained", "Weather: 28°C, 70% humidity"],
        output: "120 g carbohydrate/hr (600 g total) using a 1:0.8 glucose:fructose split, about 770 ml fluid/hr and 860 mg sodium/hr. This high target must be rehearsed; it is not a beginner recommendation.",
      },
    ],
    faqs: [
      {
        question: "How many carbs per hour should I eat on the bike?",
        answer: "Match intake to duration, intensity and tolerance. A short, easy ride may need no on-bike carbohydrate; 30-60 g/hr is a common starting range for longer or harder sessions; prolonged racing often uses 60-90 g/hr. Intakes around 90-120 g/hr are specialised strategies for trained riders using glucose plus fructose after repeated practice. They are not a minimum or a universal goal.",
      },
      {
        question: "What is gut training in cycling?",
        answer: "Gut training means repeatedly practising the food, drink, dose and timing you plan to use in competition. The aim is to improve tolerance and reduce gastrointestinal surprises. Increase intake gradually during suitable training rides; do not assume that every rider will tolerate 90-120 g/hr, and do not introduce a high dose for the first time on race day.",
      },
      {
        question: "How much fluid should I drink per hour cycling?",
        answer: "There is no safe universal ml-per-hour target. Needs vary with weather, intensity, body size, acclimation and individual sweat rate. Use the calculator as a starting estimate, then weigh yourself before and after representative rides while recording intake. Aim to avoid excessive dehydration without drinking so much that body mass increases; overdrinking can raise hyponatraemia risk.",
      },
      {
        question: "Why do I bonk on long rides?",
        answer: "Low carbohydrate availability is one common cause of a late-ride collapse, especially when intake does not match the duration and intensity. Starting too hard, heat stress, dehydration, illness, inadequate training and gastrointestinal problems can produce similar symptoms. Review pacing, conditions and nutrition together instead of treating every poor ride as a fuelling failure.",
      },
      {
        question: "What is the dual-transporter model?",
        answer: "Glucose and fructose use different intestinal transport pathways, so combining them can raise exogenous carbohydrate delivery compared with glucose alone during prolonged exercise. The older practical mix was often 2:1 glucose:fructose; many newer high-intake protocols use roughly 1:0.8. Neither ratio guarantees tolerance, and higher intake should be tested progressively.",
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
      "Per-session carbohydrate, fluid and sodium planning estimates",
      "Glucose:fructose split for higher carbohydrate targets",
      "Weather-adjusted fluid starting estimate",
      "Gut-training guardrails for high intake",
      "Total ride carbohydrate and feeding interval",
    ],
    evidenceSources: [
      {
        name: "Regulation of fat and carbohydrate metabolism by exercise intensity",
        role: "Romijn et al., 1993 · stable-isotope and calorimetry study, n=5",
        href: "https://pubmed.ncbi.nlm.nih.gov/8214047/",
      },
      {
        name: "Cycling efficiency and type I muscle fibres",
        role: "Coyle et al., 1992 · trained cyclists, n=19",
        href: "https://pubmed.ncbi.nlm.nih.gov/1501563/",
      },
      {
        name: "The new carbohydrate intake recommendations",
        role: "Jeukendrup, 2013 · duration- and intensity-specific guidance",
        href: "https://pubmed.ncbi.nlm.nih.gov/23765351/",
      },
      {
        name: "Graded carbohydrate ingestion up to 120 g/hr and cycling critical power",
        role: "Norte et al., 2026 · trained cyclists/triathletes, n=16",
        href: "https://pubmed.ncbi.nlm.nih.gov/42322010/",
      },
      {
        name: "Normative sweat sodium and sweating-rate data in athletes",
        role: "Baker et al., 2016 · observational athlete dataset, n=506",
        href: "https://pubmed.ncbi.nlm.nih.gov/26070030/",
      },
      {
        name: "Exercise and fluid replacement position stand",
        role: "American College of Sports Medicine, 2007",
        href: "https://pubmed.ncbi.nlm.nih.gov/17277604/",
      },
      {
        name: "Fluid replacement for the physically active",
        role: "National Athletic Trainers' Association consensus statement, 2017",
        href: "https://pubmed.ncbi.nlm.nih.gov/28985128/",
      },
    ],
    dateModified: "2026-08-25",
    reviewedBy: "Anthony Walsh",
    reviewScope: "primary-source verification",
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
    title: "Cycling Heart-Rate Zone Calculator",
    description:
      "Calculate five cycling heart-rate zones from a measured maximum heart rate or a cycling-specific lactate-threshold heart-rate estimate, with transparent methods, worked examples and evidence limits.",
    url: `${ROADMAN_BASE}/tools/hr-zones`,
    breadcrumbName: "Cycling Heart-Rate Zone Calculator",
    answerSummary:
      "Enter a measured cycling maximum heart rate or a cycling-specific LTHR estimate. The calculator returns five continuous whole-bpm ranges. Max-HR mode uses 50%, 60%, 70%, 80%, 90% and 100% boundaries; LTHR mode condenses Joe Friel's cycling convention into five displayed bands. The output is a coaching estimate, not a laboratory threshold measurement.",
    whatItDoes:
      "This is Roadman's canonical calculator and explanation for broad cycling heart-rate-zone searches. It converts one cycling-specific anchor into five gap-free ranges that can be copied into a head unit or training platform. Within the displayed Max-HR span—or across the open-ended LTHR table—each whole bpm belongs to exactly one range.\n\nHeart rate describes the body's internal response, while power describes external work and perceived exertion describes how the effort feels. Those signals can disagree, so the calculated bands are starting points to interpret alongside breathing, RPE, power, conditions and the purpose of the session.",
    whoItsFor: [
      "Cyclists who need five heart-rate ranges for a head unit or training platform",
      "Riders training without a power meter",
      "Athletes comparing heart-rate response with power and perceived exertion",
      "Coaches and self-coached riders who want a disclosed percentage convention",
    ],
    howItWorks:
      "Max-HR mode applies a simple percentage-of-maximum convention: 50–60%, above 60–70%, above 70–80%, above 80–90% and above 90–100%. This is not the Karvonen heart-rate-reserve method. LTHR mode uses Friel-style cycling boundaries: up to 81%, above 81–90%, above 90–94%, above 94–100% and above 100% of the entered threshold-HR estimate. The traditional 5a, 5b and 5c subdivisions are collapsed into one open-ended Zone 5. Roadman rounds each upper boundary to a whole bpm and starts the next band one bpm higher, preventing overlaps.\n\nThe two methods answer different questions and can produce different bands. An age equation is only a population estimate of maximum heart rate. An LTHR field test estimates a cycling-specific anchor; it does not directly measure blood lactate or make the percentage bands individually validated metabolic thresholds.",
    howToSteps: [
      { name: "Choose one cycling-specific method", text: "Use Max HR only when you have a credible maximum recorded while cycling. Use LTHR only when it comes from a documented cycling lab or repeatable field protocol. Do not mix a running anchor with cycling zones." },
      { name: "Enter the anchor", text: "Enter a whole-bpm value from 100 to 220. If you only have an age equation, label it as an estimate and replace it when you have a valid measured value." },
      { name: "Calculate the five ranges", text: "Read the method label and the exact bpm bands. The displayed five-zone table is a coaching convention; it is not interchangeable with a three-zone research model or another platform's labels." },
      { name: "Copy the result consistently", text: "Use the same method and anchor in your head unit, training platform and plan. Record the protocol and test date so a later result can be compared like for like." },
      { name: "Cross-check the ride", text: "Compare heart rate with breathing, RPE and power where available. Heart rate responds with delay and may drift during sustained exercise, especially as heat strain or dehydration changes." },
      { name: "Reassess abnormal responses", text: "Do not force a target when illness, medication, heat or an unusual heart-rate response changes the meaning of the number. Stop and seek appropriate medical advice for concerning symptoms." },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "Fixed percentages cannot locate every rider's lactate or ventilatory thresholds. Published age equations have substantial individual error, and even exercise-intensity prescription from percentage anchors can misclassify metabolic response. Heart rate also changes with heat, hydration, fatigue, illness, stimulants and rate-limiting medication, and it lags rapid changes in work rate. Power, heart rate and RPE measure different signals; no one metric is universally primary. Finally, these five displayed bands are not interchangeable with the three-zone models used in training-intensity-distribution research, so the calculator cannot prescribe a universal polarised or 80/20 programme.",
    whenToSeeACoach:
      "A coach or sports scientist can help when repeatable field tests disagree, your heart-rate and power responses diverge, or a plan needs individual threshold testing. Seek medical assessment—not a calculator or coach—for chest pain, fainting, unexplained palpitations, an abnormal response to exercise, or questions about exercise with a cardiovascular condition or rate-limiting medication.",
    examples: [
      {
        scenario: "Cycling LTHR estimate of 168 bpm",
        inputs: ["Method: LTHR", "Cycling LTHR estimate: 168 bpm"],
        output: "Z1: ≤136 bpm · Z2: 137–151 bpm · Z3: 152–158 bpm · Z4: 159–168 bpm · Z5: ≥169 bpm.",
      },
      {
        scenario: "Measured cycling Max HR of 188 bpm",
        inputs: ["Method: Max HR", "Measured cycling Max HR: 188 bpm"],
        output: "Z1: 94–113 bpm · Z2: 114–132 bpm · Z3: 133–150 bpm · Z4: 151–169 bpm · Z5: 170–188 bpm.",
      },
    ],
    faqs: [
      {
        question: "How are cycling heart-rate zones calculated?",
        answer: "Roadman's Max-HR mode uses five percentage-of-maximum bands with boundaries at 50%, 60%, 70%, 80%, 90% and 100%. LTHR mode uses a condensed Friel-style cycling convention with boundaries at 81%, 90%, 94% and 100% of the entered LTHR estimate. The calculator rounds to continuous whole-bpm ranges. Other devices may use different models, so compare both the anchor and the percentages before copying labels.",
      },
      {
        question: "Should I use Max HR or LTHR for cycling zones?",
        answer: "Use the method that matches a credible cycling-specific measurement and the plan you are following. Max-HR percentages are simple but an age-predicted maximum can be far from an individual's value. LTHR can provide a cycling-specific field anchor, but its result depends on the protocol and is still an estimate rather than a direct laboratory measurement. Do not treat outputs from the two methods as interchangeable.",
      },
      {
        question: "Is 220 minus age accurate for maximum heart rate?",
        answer: "No age equation can accurately predict every individual's maximum heart rate. Research-derived equations describe population trends and have substantial individual prediction error. If you use one because no measured value is available, label the result as a provisional estimate rather than your true cycling Max HR. A maximal test may be inappropriate for some riders, so use professional screening or supervision when health or symptoms warrant it.",
      },
      {
        question: "Is cycling LTHR the same as FTP or laboratory lactate threshold?",
        answer: "No. FTP is a power estimate, while LTHR is a heart-rate anchor derived from a particular protocol. A field LTHR can be useful for scaling training, but it does not directly measure blood lactate and should not be assumed to equal a laboratory threshold. Keep the protocol, device and conditions consistent when tracking change.",
      },
      {
        question: "Why does heart rate drift during a long ride or in heat?",
        answer: "During prolonged cycling, heart rate can rise even when power stays steady. Heat strain and fluid loss can contribute, but the size and direction of the response are individual and condition-dependent. Use the trend with power, RPE, breathing and environmental context rather than automatically raising power to hold a prescribed heart-rate band.",
      },
      {
        question: "Should I train by heart rate, power or perceived exertion?",
        answer: "They answer different questions: power records external work, heart rate records part of the internal response, and RPE records the athlete's integrated perception. Research shows that training-intensity distributions can look different depending on which measure is used. For short efforts, power and RPE often respond faster; for steady rides, heart-rate trends add useful context. Use the combination that fits the session and your equipment.",
      },
    ],
    related: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "Heart-rate vs power training guide", href: "/blog/zone-2-cycling-heart-rate-vs-power-vs-rpe", kind: "article" },
      { label: "Indoor vs outdoor cycling heart-rate zones", href: "/blog/heart-rate-zones-indoor-vs-outdoor-cycling", kind: "article" },
      { label: "Mountain-bike heart-rate zones", href: "/blog/mtb-heart-rate-zones-guide", kind: "article" },
      { label: "Training with heart rate only", href: "/blog/cycling-training-with-heart-rate-only-guide", kind: "article" },
    ],
    webAppFeatures: [
      "Five continuous whole-bpm cycling ranges",
      "Separate Max-HR and cycling-LTHR methods",
      "Transparent percentage boundaries and worked examples",
      "Copy-to-clipboard results",
      "Evidence notes and method limitations",
    ],
    evidenceSources: [
      {
        name: "Joe Friel: A Quick Guide to Setting Zones",
        role: "original cycling LTHR zone convention and current author clarification",
        href: "https://joefrieltraining.com/a-quick-guide-to-setting-zones/",
      },
      {
        name: "Tanaka, Monahan & Seals (2001)",
        role: "age-predicted maximum-heart-rate population equation and prediction error",
        href: "https://pubmed.ncbi.nlm.nih.gov/11153730/",
      },
      {
        name: "Nes et al. (2013), HUNT Fitness Study",
        role: "maximum-heart-rate equation and reported standard error of estimate",
        href: "https://pubmed.ncbi.nlm.nih.gov/22376273/",
      },
      {
        name: "Mann, Lamberts & Lambert (2013)",
        role: "limitations of fixed percentage anchors for exercise-intensity prescription",
        href: "https://pubmed.ncbi.nlm.nih.gov/23620244/",
      },
      {
        name: "Meixner et al. (2025)",
        role: "inter-individual variability in fixed-percentage Zone 2 prescriptions in cyclists",
        href: "https://pubmed.ncbi.nlm.nih.gov/40225831/",
      },
      {
        name: "Sanders, Myers & Akubat (2017)",
        role: "differences between heart rate, power and perceived-exertion intensity distributions",
        href: "https://pubmed.ncbi.nlm.nih.gov/28253026/",
      },
      {
        name: "Wingo et al. (2020)",
        role: "cycling cardiovascular drift and heat-strain context",
        href: "https://pubmed.ncbi.nlm.nih.gov/32102057/",
      },
      {
        name: "Jamnick et al. (2020)",
        role: "threshold-based exercise-intensity framework and limits of relative percentages",
        href: "https://pubmed.ncbi.nlm.nih.gov/32729096/",
      },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "source-to-claim and calculator-method review",
  },

  "tyre-pressure": {
    slug: "tyre-pressure",
    title: "Road Bike Tyre Pressure Calculator",
    description:
      "Calculate front and rear road bike tyre pressure in PSI and bar from system weight, measured tyre width and surface, with explicit hookless and manufacturer safety checks.",
    url: `${ROADMAN_BASE}/tools/tyre-pressure`,
    breadcrumbName: "Road Bike Tyre Pressure Calculator",
    answerSummary:
      "Add rider, bike, bottles and luggage; use the measured width of the inflated tyre; choose the surface; and enter the strictest limits printed by the tyre and rim makers. The calculator returns a front and rear starting point in PSI and bar. It is not a compatibility approval or a pressure limit.",
    whatItDoes:
      "This calculator turns system weight, measured mounted tyre width and surface into a reproducible front/rear starting estimate. It shows PSI and bar, records rim and setup details for the safety check, and flags an estimate that falls outside limits you enter.\n\nThere is no universal fastest pressure. Tyre construction, actual wheel load, rim geometry, speed and surface all matter. Use the result to begin controlled testing—not as permission to ignore a tyre or wheel manual.",
    whoItsFor: [
      "Road cyclists who want separate front and rear starting pressures",
      "Riders using 23-60 mm tyres on tarmac, rough roads or gravel",
      "Hookless users who need the pressure ceiling kept visible",
      "Cyclists comparing a calculated estimate with manufacturer tables",
    ],
    howItWorks:
      "Roadman model v1 uses a disclosed empirical curve: rear PSI = 361.6257 × system weight in kg ÷ measured tyre width in mm^1.8. The front estimate is 93% of rear. Surface factors are 1.00 for smooth tarmac, 0.90 for rough roads and 0.80 for gravel. Setup type and rim width are not hidden modifiers because casing and tyre/rim combinations vary. The output is then checked against any limits you enter and a 72 PSI ceiling when hookless is selected.",
    howToSteps: [
      { name: "Add complete system weight", text: "Enter your weight in riding kit, then the bike, bottles, tools and luggage. Missing carried mass makes the estimate too low." },
      { name: "Measure the inflated tyre", text: "Use callipers at the widest point of the mounted tyre where possible. Sidewall size is only a fallback because rim width changes actual tyre width." },
      { name: "Check the tyre-rim system", text: "Confirm rim profile, approved tyre compatibility, internal rim-width range, and the minimum and maximum pressures published by both manufacturers." },
      { name: "Choose the real surface", text: "Select smooth tarmac, rough tarmac or gravel for the route you are actually riding. Mixed routes should start with the rougher dominant surface." },
      { name: "Calculate and verify", text: "Reject any result outside the permitted range. The higher manufacturer minimum and lower manufacturer maximum always control." },
      { name: "Tune in small steps", text: "Test one change at a time on a repeatable route, usually 1-2 PSI per wheel, and stop lowering if the tyre squirms, bottoms, burps or loses support." },
    ],
    howToTotalTime: "PT5M",
    limitations:
      "The model does not know your exact front/rear axle load, tyre casing, bead retention, insert, sealant, speed, temperature, gauge error or impact risk. It cannot certify that a tyre fits a rim. Manufacturer compatibility and pressure ranges override every number on this page. Do not use the result if it falls outside those limits.",
    whenToSeeACoach:
      "A coach can structure field testing, but a qualified mechanic or the tyre/wheel manufacturer—not a coach or calculator—should resolve compatibility, repeated burping, rim strikes, unexplained pressure loss or uncertainty about a hookless setup.",
    examples: [
      {
        scenario: "75 kg rider, 28 mm measured tyre, smooth tarmac",
        inputs: ["Bike, bottles and kit: 8.5 kg", "System weight: 83.5 kg", "Measured tyre: 28 mm", "Surface factor: 1.00"],
        output: "Model starting point: front 70 PSI (4.8 bar), rear 75 PSI (5.2 bar). Verify both manufacturers' limits before use.",
      },
      {
        scenario: "85 kg rider, 40 mm measured tyre, gravel",
        inputs: ["Bike, bottles and kit: 10 kg", "System weight: 95 kg", "Measured tyre: 40 mm", "Surface factor: 0.80"],
        output: "Model starting point: front 33 PSI (2.3 bar), rear 36 PSI (2.5 bar). The tyre/rim minimum can still be higher.",
      },
    ],
    faqs: [
      {
        question: "What tyre pressure should I run on a road bike?",
        answer: "It depends on complete system weight, measured mounted tyre width, surface, tyre construction and the permitted tyre-rim range. As a model example, an 83.5 kg system on measured 28 mm tyres starts at about 70 PSI front and 75 PSI rear on smooth tarmac. That is a test point, not a universal target or safety approval.",
      },
      {
        question: "Is lower tyre pressure always faster?",
        answer: "No. Pressure involves a trade-off between tyre deformation, surface interaction, vibration, grip and impact support. Smooth-surface tests can favour higher pressure, while lower pressure and wider tyres can reduce vibration on rougher surfaces. Recent controlled work found nonlinear effects and no single universal optimum, which is why this calculator returns a starting point for field testing.",
      },
      {
        question: "How much lower should front pressure be than rear?",
        answer: "The exact split follows the load on each wheel, which changes with riding position, bike geometry and luggage. Roadman model v1 uses a disclosed default: front pressure is 93% of rear. Riders who measure individual wheel loads should prefer tyre or wheel-maker guidance that accepts those loads.",
      },
      {
        question: "Should tubeless pressure be lower than pressure with a tube?",
        answer: "Tubeless removes an inner tube pinch-flat mode, but that does not justify one universal percentage reduction. Casing, tyre size, rim, load and terrain still control support and retention. This model therefore does not silently lower pressure because tubeless is selected; use the tyre and rim makers' tubeless range, then tune in small steps.",
      },
      {
        question: "What is the maximum pressure for hookless road rims?",
        answer: "Current road tubeless straight-side systems use a 5 bar or roughly 72 PSI ceiling, but many wheel-and-tyre combinations specify a lower maximum for a given width. Use only a tyre explicitly approved for hookless use and never exceed the lowest maximum published by the tyre or rim maker. A 72 PSI calculator cap does not certify compatibility.",
      },
      {
        question: "Should I use stated or measured tyre width?",
        answer: "Use the measured width of the inflated tyre on your actual rim when possible. The same labelled tyre can measure differently on different internal rim widths. If you cannot measure it, use the sidewall size as an estimate and expect to refine the result after measuring.",
      },
    ],
    related: [
      { label: "MTB Setup Calculator", href: "/tools/shock-pressure", kind: "tool" },
      { label: "Road cycling tyre-pressure guide", href: "/blog/cycling-tyre-pressure-guide", kind: "article" },
      { label: "MTB tyre-pressure guide", href: "/blog/mtb-tyre-pressure-guide", kind: "article" },
      { label: "Tyres are slowing you down podcast", href: "/podcast/ep-2057-your-tyres-are-slowing-you-down-here-s-why", kind: "podcast" },
    ],
    webAppFeatures: [
      "Front and rear starting pressure in PSI and bar",
      "Complete system-weight and measured tyre-width inputs",
      "Smooth, rough-road and gravel surface modes",
      "Hooked, hookless and manufacturer-limit safety checks",
      "Published Roadman v1 calculation method",
    ],
    evidenceSources: [
      {
        name: "ETRTO Recommendations, edition 2 (2024)",
        role: "Tyre/rim compatibility and manufacturer pressure limits",
        href: "https://www.etrto.org/media/j05fjxrd/etrto-recommendations-edition-2-september-2024.pdf",
      },
      {
        name: "SRAM Zipp Road Wheels user manual",
        role: "Hookless compatibility and width-specific maximum pressure examples",
        href: "https://docs.sram.com/en-US/publications/6s97VpCp9fBhUto8eMea31/UM%20-%20ZIPP%20-%20Road%20Wheels",
      },
      {
        name: "Schwalbe tyre-pressure guidance",
        role: "Load, tyre width and permitted-range guidance",
        href: "https://www.schwalbe.com/en/technology-faq/tire-pressure/",
      },
      {
        name: "Buder, Fouchard & Schwanitz (2025)",
        role: "Controlled tyre-width, pressure, surface and vibration study",
        href: "https://www.jsc-journal.com/index.php/JSC/article/download/1049/863/5662",
      },
      {
        name: "Crenna et al. (2025)",
        role: "Road-bike tyre width, pressure and vibration measurements",
        href: "https://doi.org/10.3390/eng6090245",
      },
      {
        name: "Lim et al. (2011)",
        role: "Field method and smooth-asphalt pressure comparison",
        href: "https://pubmed.ncbi.nlm.nih.gov/20881880/",
      },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "source-to-claim and calculator-method review",
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
      { label: "MTB suspension setup guide", href: "/blog/mtb-suspension-setup-complete-guide", kind: "article" },
      { label: "Equipment topic hub", href: "/topics/cycling-coaching", kind: "topic" },
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
      { label: "RED-S complete guide", href: "/blog/cycling-weight-loss-fuel-for-the-work-required", kind: "article" },
      { label: "Cycling nutrition topic hub", href: "/topics/cycling-nutrition", kind: "topic" },
    ],
    webAppFeatures: [
      "EA calculation in kcal per kg fat-free mass",
      "RED-S risk screening (3 thresholds)",
      "Training-load and intake inputs",
      "Recommendations to lift above clinical low",
    ],
  },

  "race-predictor": {
    slug: "race-predictor",
    title: "Race Time Predictor",
    description:
      "Predict your cycling race or sportive finish time from real physics. Enter your weight, power, the course distance and climbing, and get an estimated time, average speed, and average power — free.",
    url: `${ROADMAN_BASE}/tools/race-predictor`,
    breadcrumbName: "Race Time Predictor",
    answerSummary:
      "Enter rider and bike weight, the power you can hold, course distance and total climbing, plus rolling resistance and CdA. The tool solves the cycling power-balance equation — gravity, rolling resistance, aerodynamic drag, and drivetrain loss — and returns your estimated finish time, average speed, and average power. The detailed per-segment breakdown, pacing plan, and fuelling timing are members-only.",
    whatItDoes:
      "This calculator turns your numbers into a finish time using the same physics a coach uses to build a race plan. It models the course as a climb-and-descent split derived from your distance and total elevation gain, then solves the steady-state speed your power can sustain against gravity, rolling resistance, and air. The preview is free; the full pacing and fuelling plan lives inside the Roadman community.",
    whoItsFor: [
      "Riders pacing a first gran fondo, sportive, or time trial",
      "Cyclists choosing realistic power targets for a known course",
      "Anyone weighing kit changes — lighter bike, faster tyres, better position",
      "Self-coached athletes who want a physics check on their goal time",
    ],
    howItWorks:
      "The engine solves the cycling power equation P·η = (m·g·sinθ + Crr·m·g·cosθ + ½·ρ·CdA·v²)·v for speed v on each part of the course, then sums the time. With only distance and total ascent available, the route is modelled as half climbing and half descending at an average gradient of 2 × (ascent ÷ distance), which correctly captures that climbs cost more time than descents return.",
    howToSteps: [
      { name: "Enter your weights", text: "Add your body weight and your bike-plus-kit weight in kilograms. Total system mass drives both the climbing and rolling-resistance terms." },
      { name: "Enter your power", text: "Put in the average power you can realistically hold for the effort — your FTP for a hard hour, a little under it for longer events." },
      { name: "Describe the course", text: "Enter total distance in kilometres and total elevation gain in metres. Pick your surface and riding position, or fine-tune Crr and CdA directly." },
      { name: "Read your prediction", text: "The tool returns estimated finish time, average speed, and average power instantly. Unlock the per-segment breakdown, pacing split, and fuelling plan inside the community." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "With only distance and total ascent, the tool models an average gradient rather than the real profile — a route with one long climb behaves differently from constant rolling, and the upload-the-GPX predictor at /predict is more precise. It assumes still air, sea-level air density, and a constant power output, so wind, altitude, drafting, and fatigue are not modelled. Treat the result as a well-grounded estimate, not a guarantee.",
    whenToSeeACoach:
      "A predicted time only matters if your training is building the engine to hit it. If you can model the finish but keep falling short on the day, the gap is usually pacing discipline, fuelling, or how your training week is structured — which is exactly what coaching is for.",
    examples: [
      {
        scenario: "Hilly gran fondo",
        inputs: ["Rider 75kg + bike 8kg", "Power: 230W", "120 km, 2,000 m climbing", "Crr 0.004, CdA 0.31"],
        output: "Roughly a 4½-hour finish at ~26 km/h average. The pacing plan shows where to spend the extra watts to take time off that.",
      },
      {
        scenario: "Flat 40 km TT",
        inputs: ["Rider 70kg + bike 8kg", "Power: 290W", "40 km, 150 m climbing", "Crr 0.0032, CdA 0.24"],
        output: "Around 58 minutes at ~41 km/h. Tightening CdA toward 0.21 with a better position is worth more here than any weight saving.",
      },
    ],
    faqs: [
      {
        question: "How accurate is a physics-based race time predictor?",
        answer: "For a steady effort on a known course, power-balance physics is accurate to within a few percent — it's the same maths used in professional race modelling. The biggest sources of error are wind, how evenly you pace, and whether your real average power matches what you entered. This tool assumes still air and constant power, so use the GPX-based predictor at /predict when you need profile-level precision.",
      },
      {
        question: "What power should I enter — FTP or something lower?",
        answer: "Enter the average power you can actually hold for the event. For an all-out hour that's roughly your FTP. For a 2-3 hour sportive most riders sustain about 75-85% of FTP; for all-day events, lower still. The unlocked pacing plan converts your number into climb, flat, and descent targets.",
      },
      {
        question: "Why does the tool ask for rolling resistance and CdA?",
        answer: "They're the two biggest non-gravity forces. Crr (rolling resistance) depends on your tyres and the road surface; CdA (drag area) depends on your position and equipment. The tool gives sensible presets by surface and riding position, but entering measured values makes the prediction sharper — and lets you test what new tyres or an aero position would actually save.",
      },
      {
        question: "Does elevation gain alone tell you enough about the course?",
        answer: "It's a strong proxy. The tool derives an average gradient of twice the climbing-per-kilometre and splits the route into climbing and descending halves, which captures the key fact that hills cost more time than descents give back. It can't tell a single mountain pass from constant rolling — for that, upload your GPX file to the full predictor at /predict.",
      },
      {
        question: "Is the Race Time Predictor free?",
        answer: "Yes. The estimated finish time, average speed, and average power are free with no sign-up. The detailed per-segment analysis, the climb-and-descent pacing strategy, and the fuelling timing are part of the Roadman community at skool.com/roadmancycling.",
      },
    ],
    related: [
      { label: "Full GPX Race Predictor", href: "/predict", kind: "tool" },
      { label: "W/kg Calculator", href: "/tools/wkg", kind: "tool" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling", kind: "tool" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "Cycling pacing strategy for long climbs", href: "/blog/cycling-pacing-strategy-long-climbs", kind: "article" },
    ],
    webAppFeatures: [
      "Physics-based finish-time prediction",
      "Solves gravity, rolling resistance, aero drag, and drivetrain loss",
      "Estimated time, average speed, and average power",
      "Surface and riding-position presets for Crr and CdA",
      "Per-segment breakdown, pacing, and fuelling (members)",
    ],
  },

  "fuel-planner": {
    slug: "fuel-planner",
    title: "Cycling Fuel Planner",
    description:
      "Calculate your daily calorie target, carb/protein/fat split, in-ride carbs, and hydration for the session you're riding. Free, evidence-based, built on fuel-for-the-work-required.",
    url: `${ROADMAN_BASE}/tools/fuel-planner`,
    breadcrumbName: "Cycling Fuel Planner",
    answerSummary:
      "Enter your age, sex, height, weight, FTP, body-composition goal, and the ride you're doing. The planner returns a training-day and rest-day calorie target, your carb/protein/fat split in grams, in-ride carbs in grams per hour, and a hydration estimate — using the fuel-for-the-work-required method the World Tour runs on.",
    whatItDoes:
      "Most amateurs eat the same every day, then wonder why they bonk on hard rides and gain weight on easy weeks. This planner periodises your nutrition the way the pros do: more carbs on training days, fewer on rest days, protein held steady throughout. You get a calorie target, a macro split in grams, an in-ride carb prescription, and a hydration estimate for the actual session in front of you.\n\nThe basic plan is free. The full 12-week periodised calendar — meal by meal, with recovery-week and race-day adjustments — lives inside the Roadman community.",
    whoItsFor: [
      "Riders who train hard but fuel the same every day",
      "Cyclists chasing race weight without losing power",
      "Anyone who bonks on long rides or fades in the final hour",
      "Self-coached athletes who want a structured starting point, not another generic macro ratio",
    ],
    howItWorks:
      "We estimate your resting metabolic rate with the Mifflin-St Jeor equation, add daily activity and the energy cost of your ride (from FTP, intensity, and duration), then apply your body-composition goal. Protein is held at 1.8 g/kg, carbs scale with the work you do, and fat fills the rest — the Hexis/Impey fuel-for-the-work-required model. In-ride carbs follow current sports-science ceilings; hydration scales with body weight, intensity, and duration.",
    howToSteps: [
      { name: "Enter your details", text: "Age, sex, height, weight, and FTP. FTP drives the energy cost of your ride, so use a recent number — multiply your best 20-minute power by 0.95 if you're not sure." },
      { name: "Set your goal and lifestyle", text: "Choose lose, maintain, or build, and how active you are off the bike. This sets your baseline calorie target before any training is added." },
      { name: "Describe the ride", text: "Pick the session — easy, endurance, tempo, threshold, or race — and how long it lasts. Carb demand and sweat rate both scale sharply with intensity." },
      { name: "Read your fuel plan", text: "You get a training-day and rest-day calorie target, your macros in grams, in-ride carbs per hour, and a hydration estimate. Start there and refine over a few weeks against how you feel." },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "Every number here is an estimate from population averages — RMR equations carry a ±10% error, and carb absorption and sweat rate vary widely between riders. The planner shows a single representative day; it doesn't periodise across a full training block, manage recovery weeks, or build meal-by-meal plans. Treat the output as a starting prescription you dial in with experience, not a fixed rule.",
    whenToSeeACoach:
      "If you're fuelling well and still bonking, losing power while dieting, getting ill often, or your weight won't move despite doing everything right — the issue is rarely a single day's macros. That's where a structured, periodised plan and a coach who can see your whole week beats another calculator.",
    examples: [
      {
        scenario: "75kg male, FTP 250W, maintaining, 2hr endurance ride",
        inputs: ["Weight: 75kg", "FTP: 250W", "Goal: maintain", "Ride: endurance, 2h"],
        output: "Training day ≈ 3,400 kcal vs rest day ≈ 2,790 kcal. ~290g carbs / 135g protein / 160g fat. 50 g/hr in-ride carbs, ~675 ml/hr fluid.",
      },
      {
        scenario: "68kg female, FTP 220W, losing weight, 1hr threshold session",
        inputs: ["Weight: 68kg", "FTP: 220W", "Goal: lose", "Ride: threshold, 1h"],
        output: "A modest deficit on the rest day, more carbs restored on the hard day, protein held at ~122g, 70 g/hr in-ride carbs with a 2:1 glucose:fructose mix.",
      },
    ],
    faqs: [
      {
        question: "How many calories should a cyclist eat per day?",
        answer: "It depends on the day. On a rest day, most amateur cyclists need roughly their bodyweight-driven maintenance — often 2,400-3,000 kcal. On a hard or long training day, that can rise by 600-1,200 kcal to pay back the session. Eating the same every day is the most common amateur mistake: you under-fuel hard days and overeat on easy ones. The planner gives you both numbers.",
      },
      {
        question: "What is fuel-for-the-work-required?",
        answer: "It's the modern periodised-nutrition method developed by Professor James Morton and used across the World Tour. Instead of a fixed daily diet, you match carbohydrate intake to the training you're actually doing — high carbs around hard and long sessions, lower carbs on easy and rest days — while keeping protein steady. It improves body composition and performance at the same time.",
      },
      {
        question: "How much protein does a cyclist need?",
        answer: "Around 1.6-2.2 g per kg of body weight per day, with 1.8 g/kg a sensible default for most trained cyclists. Protein protects muscle while you periodise carbs and is especially important if you're in a calorie deficit chasing race weight. The planner holds protein steady at 1.8 g/kg every day regardless of training.",
      },
      {
        question: "How many carbs should I eat during a ride?",
        answer: "It scales with intensity and duration. Easy or short rides (under an hour): water is often enough. Endurance rides: 50-60 g/hr. Tempo and threshold sessions: 60-70 g/hr. Racing or very high intensity: up to 90-100 g/hr if your gut is trained, using a 2:1 glucose:fructose mix to absorb above 60 g/hr.",
      },
      {
        question: "How much should I drink on the bike?",
        answer: "As a rough guide, 500-1,000 ml per hour depending on body weight, intensity, and heat. The planner estimates sweat rate from your body weight and ride intensity. Add 300-700 mg of sodium per hour, and increase fluid in hot or humid conditions where sweat losses can double. Aim to limit weight loss during a ride to under 2% of body weight.",
      },
      {
        question: "Is the full 12-week plan free?",
        answer: "The daily plan — calorie target, macros, in-ride carbs, and hydration — is completely free. The full 12-week periodised fuel calendar, with meal-by-meal macros, pre and post-ride timing, recovery-week and race-day adjustments, lives inside the Roadman community alongside weekly live calls with Anthony.",
      },
    ],
    related: [
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling", kind: "tool" },
      { label: "Race Weight Calculator", href: "/tools/race-weight", kind: "tool" },
      { label: "Energy Availability Calculator", href: "/tools/energy-availability", kind: "tool" },
      { label: "Cycling nutrition topic hub", href: "/topics/cycling-nutrition", kind: "topic" },
      { label: "Race-weight strategy guide", href: "/blog/cycling-weight-loss-fuel-for-the-work-required", kind: "article" },
    ],
    webAppFeatures: [
      "Training-day and rest-day calorie targets",
      "Carb / protein / fat split in grams",
      "Fuel-for-the-work-required carb periodisation",
      "In-ride carbs per hour by session intensity",
      "Hydration estimate from body weight and ride duration",
    ],
  },

  "run-ride-converter": {
    slug: "run-ride-converter",
    title: "Run↔Ride Equivalence Converter",
    description:
      "Convert a running pace or race time into an equivalent cycling FTP, or a bike FTP into equivalent running race times. Free tool using VO2max as the bridge.",
    url: `${ROADMAN_BASE}/tools/run-ride-converter`,
    breadcrumbName: "Run↔Ride Equivalence Converter",
    answerSummary:
      "Enter a running pace or race time and get an estimated cycling FTP in watts and W/kg, or enter your FTP and get estimated VDOT plus race time predictions for 5K through marathon. VO2max is the shared currency linking the two sports, with a correction factor for the lower VO2max readings typical of cycling tests.",
    whatItDoes:
      "This tool bridges running and cycling performance using VO2max as the common measure. Runners moving to the bike (injury, off-season, triathlon) get an estimated starting FTP instead of guessing. Cyclists picking up running get estimated race times instead of showing up to a 10K blind. Both directions include a training-load equivalence and a heart-rate comparison note, because effort doesn't translate 1:1 between the sports.",
    whoItsFor: [
      "Runners cross-training on the bike during an injury or off-season",
      "Cyclists adding running for triathlon or general fitness",
      "Coaches setting a sensible starting point for an athlete new to the other sport",
      "Anyone curious how their running fitness stacks up against their cycling fitness, or vice versa",
    ],
    howItWorks:
      "Running pace or race time is converted to VDOT using Jack Daniels' model — velocity becomes an oxygen cost, then adjusted for how long that pace can be sustained. Cycling FTP is converted to VO2max using a standard FTP-to-VO2max regression. A 0.92 correction factor links the two, because cycling VO2max tests typically read 5-8% lower than running VO2max tests for the same athlete. Training-load equivalence uses a 1.65x duration scale between easy cycling and easy running.",
    howToSteps: [
      { name: "Pick a direction", text: "Choose Run → Ride if you're converting running fitness to an estimated bike FTP, or Ride → Run if you're converting FTP to estimated running performance." },
      { name: "Enter your weight", text: "Body weight in kg or lbs — needed to convert between VO2max and FTP in either direction." },
      { name: "Enter your running or cycling number", text: "For Run → Ride: a pace (min/km or min/mile) or a race time at 5K, 10K, half marathon or marathon. For Ride → Run: your FTP in watts." },
      { name: "Read the equivalent numbers", text: "You'll get an estimated FTP or VDOT, race time predictions, an easy-effort description, a training-load equivalence, and a heart-rate comparison note." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "This tool estimates aerobic-capacity transfer between two different sports — it can't account for running economy, cycling efficiency, bike fit, neuromuscular skill, or terrain. Two athletes with identical VO2max numbers can have meaningfully different race times or FTP. The 0.92 cycling correction factor and 1.65x duration scale are coaching approximations, not physiological constants. Treat every output here as a rough guide for programming cross-training, not a precise prediction.",
    whenToSeeACoach:
      "If you're using this to plan a serious cross-training block — injury rehab, off-season bike focus, or a first triathlon — a coach can build the actual week around your real numbers rather than an estimate, and adjust as your body responds.",
    examples: [
      {
        scenario: "Runner, 70kg, converting a 10K time to bike FTP",
        inputs: ["Weight: 70kg", "10K: 45:00"],
        output: "Estimated FTP around 230-250W (roughly 3.3-3.6 W/kg), with an equivalent easy-ride description and a training-load note.",
      },
      {
        scenario: "Cyclist, 75kg, converting FTP to running times",
        inputs: ["Weight: 75kg", "FTP: 250W"],
        output: "Estimated VDOT in the mid-40s, with predicted 5K, 10K, half marathon and marathon times and an equivalent easy running pace.",
      },
    ],
    faqs: [
      {
        question: "How accurate is a run-to-bike FTP conversion?",
        answer: "It's a starting-point estimate, not a precise prediction. VO2max transfers reasonably well between running and cycling, but running economy and cycling efficiency are separate skills that vary a lot between athletes. Use the output as a first FTP to train from, then retest on the bike after a few weeks.",
      },
      {
        question: "Why is cycling VO2max usually lower than running VO2max?",
        answer: "Cycling recruits less total muscle mass than running — no upper body involvement, less core and stabiliser demand — so the same athlete typically posts a VO2max reading 5-8% lower on a bike test than on a treadmill test. This tool applies a 0.92 correction factor to account for that gap.",
      },
      {
        question: "Why does cycling heart rate run lower than running heart rate?",
        answer: "At an equivalent physiological effort, cycling heart rate is typically 5-10 bpm lower than running heart rate, mainly because there's no impact loading and less total muscle mass working against gravity. Don't apply your running heart-rate zones directly to the bike, or vice versa.",
      },
      {
        question: "Can I use this to plan a cross-training week?",
        answer: "Yes, as a rough guide. The training-load equivalence uses a 1.65x duration scale — an easy ride can typically run about 65% longer than an easy run for similar aerobic cost, reflecting lower impact stress on the bike. Start conservative and adjust based on how your body responds.",
      },
    ],
    related: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "Heart-Rate Zone Calculator", href: "/tools/hr-zones", kind: "tool" },
      { label: "W/kg Calculator", href: "/tools/wkg", kind: "tool" },
      { label: "Race Time Predictor", href: "/tools/race-predictor", kind: "tool" },
      { label: "FTP training topic hub", href: "/topics/ftp-training", kind: "topic" },
    ],
    webAppFeatures: [
      "Two-way conversion — running to cycling and cycling to running",
      "VDOT-based race time predictions for 5K through marathon",
      "Estimated FTP and W/kg from running pace or race time",
      "Training-load equivalence between easy rides and easy runs",
      "Heart-rate comparison note between the two sports",
    ],
  },

  "power-speed": {
    slug: "power-speed",
    title: "Power↔Speed Calculator",
    description:
      "Convert between cycling power and speed using real physics. Gradient, wind, riding position, rolling resistance, altitude — see exactly what your watts buy you on any road.",
    url: `${ROADMAN_BASE}/tools/power-speed`,
    breadcrumbName: "Power↔Speed Calculator",
    answerSummary:
      "Enter your power in watts and the calculator returns your speed in km/h and mph, or enter a target speed and get the watts required. The model accounts for gradient, rider + bike mass, aerodynamic drag (CdA by position), rolling resistance (Crr by surface), wind, altitude-adjusted air density, and drivetrain efficiency.",
    whatItDoes:
      "This calculator solves the standard cycling power equation in both directions. Give it watts and it tells you how fast you go; give it a speed and it tells you what that costs. The physics covers gravity, rolling resistance, and aero drag — the three forces that determine your speed for a given power output. Preset scenarios for Alpe d'Huez, Mont Ventoux, a flat TT, and a rolling sportive let you compare instantly.",
    whoItsFor: [
      "Riders setting realistic speed targets for a time trial, sportive, or training ride",
      "Cyclists quantifying how much speed a position change, lighter wheelset, or tyre upgrade buys",
      "Anyone who wants to know what their FTP actually means on a specific gradient",
      "Self-coached athletes comparing power-to-speed across flat, climbing, and windy conditions",
    ],
    howItWorks:
      "The engine solves P = v × (m·g·sin(θ) + m·g·Crr·cos(θ) + 0.5·ρ·CdA·v²) / η. For Power → Speed, Newton-Raphson iterates to find the velocity where total resistive power matches your input. For Speed → Power, the equation is solved directly. Wind speed is added to rider velocity for the aero term. Air density adjusts with altitude using the International Standard Atmosphere barometric formula.",
    howToSteps: [
      { name: "Choose a direction", text: "Power → Speed if you want to know how fast your watts take you, or Speed → Power if you have a target pace and want to know the cost in watts." },
      { name: "Enter rider and bike weight", text: "Body weight in kg or lbs; bike weight in kg. Total system mass drives the gravity and rolling-resistance terms." },
      { name: "Set gradient", text: "0% for flat, positive for climbs, negative for descents. Range: -20% to 25%." },
      { name: "Optionally open advanced settings", text: "Choose a riding position (sets CdA), surface type (sets Crr), add wind speed (negative for tailwind), and set altitude to adjust air density. Sensible defaults are already loaded." },
      { name: "Read the result", text: "You get speed in km/h and mph (or watts and W/kg), a force-breakdown bar showing gravity, rolling, and aero drag percentages, a contextual comparison, and links to deeper tools." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "CdA values are representative estimates for typical riders — wind tunnel or velodrome aero testing gives precise numbers, and individual CdA can vary by 15-20% within a position category depending on body shape, helmet, and clothing. The model assumes constant speed, still air (unless wind is entered), and no drafting. On descents, the model does not cap speed — real-world braking, cornering, and terminal velocity limits apply. Rolling resistance varies with tyre pressure, temperature, and casing quality beyond what the surface preset captures.",
    whenToSeeACoach:
      "If you can see the speed you want but cannot hold the power to get there — or if you are producing the watts but still missing the target — the gap is pacing, position, or how you structure your training week. That is where coaching beats another calculator.",
    examples: [
      {
        scenario: "Strong amateur, flat road, hoods position",
        inputs: ["Power: 250W", "Rider: 75kg", "Bike: 8kg", "Gradient: 0%", "Position: hoods"],
        output: "About 36.5 km/h (22.7 mph). Aero drag accounts for roughly 85% of resistive force on the flat.",
      },
      {
        scenario: "Same rider, Alpe d'Huez preset",
        inputs: ["Power: 250W", "Rider: 75kg", "Bike: 8kg", "Gradient: 8.1%", "Position: hoods", "Altitude: 1100m"],
        output: "About 11.5 km/h (7.1 mph). Gravity takes over 85% of resistance. That is roughly 5:13 per kilometre.",
      },
    ],
    faqs: [
      {
        question: "How fast does 200 watts go on a bike?",
        answer: "On a flat road at sea level with a 75kg rider on the hoods, 200W gives roughly 31-32 km/h (19-20 mph). Add a 5% gradient and the same 200W drops to about 13 km/h. The answer always depends on gradient, wind, position, weight, and rolling resistance — which is exactly what this calculator models.",
      },
      {
        question: "How many watts to hold 40 km/h on a flat road?",
        answer: "For a 75kg rider on the hoods (CdA 0.35 m²) with a road bike on smooth tarmac, roughly 280-300W depending on wind and exact position. Switch to drops (CdA 0.32) and it drops to around 250-265W. Switch to aero bars (CdA 0.27) and it is closer to 210-225W. Position is the biggest lever on the flat.",
      },
      {
        question: "Does CdA matter more than weight?",
        answer: "On flat roads and gentle gradients (under 3-4%), CdA dominates — a 10% CdA reduction saves more watts than a 10% weight reduction. On steep climbs (8%+), weight dominates because gravity is the primary force. The force breakdown bar in this calculator shows you exactly where your watts go for any scenario.",
      },
      {
        question: "How accurate are the CdA values in this calculator?",
        answer: "They are representative averages. Real CdA varies with body shape, clothing, helmet, and subtle position differences — two riders both \"on the hoods\" can differ by 0.03-0.05 m² easily. A wind tunnel or velodrome Chung method test gives precise numbers. Use these values for comparison and planning; test for precision.",
      },
      {
        question: "Why does altitude make me faster?",
        answer: "Air density drops with altitude — roughly 3% per 300m of elevation. Lower density means less aerodynamic drag, which matters most on flat roads and descents. At 1,500m, air density is about 13% lower than sea level. The trade-off is reduced oxygen availability, which limits your sustainable power — this calculator does not model that physiological effect.",
      },
      {
        question: "What is the effect of wind on cycling speed?",
        answer: "A 15 km/h headwind at 35 km/h roughly doubles the aerodynamic force you face, because the aero term depends on the square of air speed relative to the rider (35 + 15 = 50 km/h airspeed vs 35 km/h in still air). Tailwinds help less than headwinds hurt, because you spend more time riding into the wind on an out-and-back route. Enter wind speed in the advanced settings to quantify the difference.",
      },
    ],
    related: [
      { label: "Race Time Predictor", href: "/tools/race-predictor", kind: "tool" },
      { label: "W/kg Calculator", href: "/tools/wkg", kind: "tool" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "FTP training topic hub", href: "/topics/ftp-training", kind: "topic" },
    ],
    webAppFeatures: [
      "Two-way conversion — watts to speed and speed to watts",
      "Gradient, wind, riding position, and surface presets",
      "Altitude-adjusted air density (ISA barometric formula)",
      "Force breakdown showing gravity, rolling, and aero drag percentages",
      "Preset scenarios for Alpe d'Huez, Ventoux, flat TT, and rolling sportive",
      "Newton-Raphson solver for the full cycling power equation",
    ],
  },

  "sweet-spot": {
    slug: "sweet-spot",
    title: "Sweet Spot Calculator",
    description:
      "Enter your FTP and calculate the common 88-94% sweet spot band, compare neighbouring power ranges, and review response-led sample sessions.",
    url: `${ROADMAN_BASE}/tools/sweet-spot`,
    breadcrumbName: "Sweet Spot Calculator",
    answerSummary:
      "Enter your FTP in watts and the calculator displays the common sweet spot convention of 88-94% FTP, plus tempo and threshold ranges for context. The sample sessions are starting structures, not personal prescriptions; use recent training and the complete weekly load to select and progress them.",
    whatItDoes:
      "This calculator performs the percentage arithmetic and presents sample interval structures from 30 to 90 minutes of sweet spot work. It cannot locate your physiological thresholds, determine a personal weekly dose or replace the FTP test method, training history and observed response that a coach would use.",
    whoItsFor: [
      "Time-crunched cyclists exploring whether sustained sub-threshold work fits a limited week",
      "Riders building a structured training week and choosing between tempo, sweet spot, and threshold sessions",
      "Self-coached athletes who know their FTP but need session prescriptions",
      "Anyone returning to structured training after a break and wanting productive but manageable intensity",
    ],
    howItWorks:
      "Sweet spot is commonly prescribed at 88-94% of FTP, overlapping upper tempo and lower threshold in the classic power model. The calculator multiplies FTP by these percentages and shows neighbouring bands for context. The templates demonstrate possible structures; research does not establish one weekly frequency, block length or guaranteed result for every cyclist.",
    howToSteps: [
      { name: "Enter your FTP", text: "Type your Functional Threshold Power in watts. If you do not know it, use your best 20-minute power multiplied by 0.95." },
      { name: "Read your sweet spot range", text: "The calculator shows your sweet spot band (88-94% FTP) in watts, alongside tempo and threshold ranges for comparison." },
      { name: "Pick a sample structure", text: "Choose a work-duration target and treat the returned intervals as examples; shorten them when recent comparable work does not support the dose." },
      { name: "Check the complete week", text: "Count races, group rides, threshold work, strength training and life stress before adding another demanding session." },
    ],
    howToTotalTime: "PT1M",
    limitations:
      "The 88-94% band is a coaching convention, not a measured physiological threshold. FTP methods can disagree at individual level, and percentage alone does not capture duration, fatigue or internal response. Session templates are examples; do not infer a personal recovery time or weekly dose from the calculator.",
    whenToSeeACoach:
      "Use a coach when the calculated target repeatedly fails to match perceived effort or repeatable performance, when the complete weekly load is difficult to interpret, or when event demands require a personalised progression. Stop and seek medical assessment for concerning exercise symptoms.",
    examples: [
      {
        scenario: "Time-crunched amateur, 250W FTP",
        inputs: ["FTP: 250W"],
        output: "Displayed sweet spot band: 220-235W. Sample structure: 2x20 min with 5 min easy, only when recent training supports twenty-minute blocks.",
      },
      {
        scenario: "Strong masters rider, 300W FTP",
        inputs: ["FTP: 300W"],
        output: "Displayed sweet spot band: 264-282W. A 3x20 sample is demanding and does not become appropriate because of age, FTP or phase alone.",
      },
    ],
    faqs: [
      {
        question: "What is sweet spot training in cycling?",
        answer: "Sweet spot is a cycling coaching convention commonly set at 88-94% of FTP. It overlaps upper tempo and lower threshold in common power models. It is a practical prescription, not a separate physiological threshold or a proven percentage-of-benefit formula.",
      },
      {
        question: "How long should a sweet spot interval be?",
        answer: "There is no universal length. Choose intervals that allow the final repetition to resemble the first, then extend controlled time before raising power. A rider new to structure may need shorter work than the templates, while experienced riders may use longer blocks for a specific event demand.",
      },
      {
        question: "Is sweet spot better than threshold training?",
        answer: "Neither is universally better. Sweet spot is commonly used for controlled sub-threshold work, while threshold training targets sustained work nearer FTP. Choose from the event, training phase, available time, FTP method and the rider's previous response.",
      },
      {
        question: "How many sweet spot sessions per week?",
        answer: "No evidence-backed number fits everyone. Count races, hard group rides, other interval work, strength training and life stress before setting frequency. One controlled session can be a conservative starting point; add work only when the complete set and normal training remain stable.",
      },
      {
        question: "What does sweet spot feel like?",
        answer: "Controlled effort. You can hold a short conversation but would rather not. Breathing is elevated but rhythmic. Legs feel loaded but not burning. On a 1-10 RPE scale, it sits at 7-8. If it feels easy, you are in tempo. If you are counting down the seconds, you have drifted into threshold.",
      },
      {
        question: "Does sweet spot training work for older cyclists?",
        answer: "It can, but age alone does not prescribe the dose or recovery gap. Masters-recovery evidence is limited and mixed. Use recent comparable sessions, sleep, soreness, motivation and normal power trends rather than a fixed 48-hour rule.",
      },
    ],
    related: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "TSS Calculator", href: "/tools/tss", kind: "tool" },
      { label: "FTP Test Calculator", href: "/tools/ftp-test", kind: "tool" },
      { label: "Training Load Calculator", href: "/tools/training-load", kind: "tool" },
      { label: "FTP Training topic hub", href: "/topics/ftp-training", kind: "topic" },
      { label: "Sweet Spot Training evidence guide", href: "/blog/sweet-spot-training-cycling-guide", kind: "article" },
    ],
    webAppFeatures: [
      "Sweet spot power range calculation (88-94% FTP)",
      "Side-by-side tempo, sweet spot, and threshold zone comparison",
      "Session builder with six interval structures from 30 to 90 minutes",
      "Training-phase questions without a universal weekly prescription",
      "Evidence boundaries linked to the canonical sweet spot guide",
    ],
    evidenceSources: [
      {
        name: "TrainingPeaks: Training With Power",
        role: "Official description of the 88-94% FTP coaching convention and neighbouring power bands",
        href: "https://www.trainingpeaks.com/blog/how-to-get-started-training-with-power/",
      },
      {
        name: "Mackey and Horner 2021",
        role: "Scoping review of FTP20 reliability and limits of agreement",
        href: "https://pubmed.ncbi.nlm.nih.gov/34304689/",
      },
      {
        name: "Filipe et al. 2025",
        role: "Systematic review and meta-analysis of training distribution in trained cyclists",
        href: "https://pubmed.ncbi.nlm.nih.gov/39788807/",
      },
      {
        name: "Almquist et al. 2023",
        role: "Systematic review of periodisation, intensity distribution and volume in trained cyclists",
        href: "https://pubmed.ncbi.nlm.nih.gov/36640771/",
      },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "FTP convention, training-distribution, periodisation and masters-recovery claims",
  },
  "interval-builder": {
    slug: "interval-builder",
    title: "Interval Session Builder",
    description:
      "Enter your FTP, pick a training goal and available time, and get a complete structured interval session with warm-up, work intervals, recovery, cool-down, power targets, cadence ranges, and TSS estimate.",
    url: `${ROADMAN_BASE}/tools/interval-builder`,
    breadcrumbName: "Interval Session Builder",
    answerSummary:
      "Enter your FTP in watts, choose a training goal (VO2max, threshold, sweet spot, tempo, sprint, or endurance), set your available time, and the builder returns a complete session structure — warm-up through cool-down — with wattage targets, cadence ranges, RPE, estimated TSS, and recovery guidance. Twenty sessions across six training goals, matched to your time and experience level.",
    whatItDoes:
      "This tool prescribes a complete structured interval session based on your FTP, training goal, available time, and experience level. You get a visual session timeline, a block-by-block breakdown with power in watts and percentage of FTP, cadence targets, RPE, and an estimated Training Stress Score. Each session includes a physiological explanation of what the workout targets and when to schedule your next hard session.",
    whoItsFor: [
      "Cyclists who know their FTP and want a structured session without a full coaching plan",
      "Self-coached riders looking for session variety across different training goals",
      "Time-crunched athletes who need a workout that fits a specific time window",
      "Riders preparing for a specific event and choosing between VO2max, threshold, or sweet spot work",
      "Anyone who trains on a smart trainer and wants targets to load into ERG mode",
    ],
    howItWorks:
      "The session library contains twenty prescriptions across six training goals, built from established protocols: Seiler's polarised VO2max blocks, Ronnestad's 30/15s protocol, Coggan's threshold model, and Overton's sweet spot framework. The builder filters sessions by your training goal, experience level, and available time, then expands the selected session into a timed segment list. TSS is estimated from the time-weighted average intensity factor across all segments.",
    howToSteps: [
      { name: "Enter your FTP", text: "Type your Functional Threshold Power in watts. If you do not know it, use your best 20-minute power multiplied by 0.95 or use the FTP Test Calculator." },
      { name: "Select your available time", text: "Choose how long you have to train: 30, 45, 60, 75, or 90 minutes. The builder matches sessions that fit your window." },
      { name: "Pick a training goal", text: "Choose from VO2max, threshold, sweet spot, tempo, sprint power, or endurance. Each goal prescribes sessions targeting a different physiological adaptation." },
      { name: "Set your experience level", text: "Beginner, intermediate, or advanced. Some protocols (Ronnestad 30/15s, Tabata, progressive sweet spot) require intermediate or advanced experience." },
      { name: "Review and copy the session", text: "Read the session timeline, interval breakdown, TSS estimate, and recovery guidance. Copy the session to paste into your training log or head unit." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "TSS estimates use a time-weighted average of target power as a proxy for Normalised Power. Actual TSS from your power file will differ depending on how closely you hit the targets and how variable your power is within each interval. Power targets assume your FTP is current and accurate. The session library covers the most common and well-researched protocols but does not replace a coach who can sequence sessions across a training block and adjust for individual response.",
    whenToSeeACoach:
      "If you are doing the right sessions but not adapting — FTP flat for 8+ weeks despite consistent training — the issue is usually how sessions are sequenced across the week, recovery between hard days, or fuelling. A coach can audit your training load distribution, spot overreaching before it becomes overtraining, and adjust the plan based on your individual response.",
    examples: [
      {
        scenario: "Time-crunched amateur, 250W FTP, 60 minutes available, threshold goal",
        inputs: ["FTP: 250W", "Time: 60 min", "Goal: Threshold", "Level: Intermediate"],
        output: "Classic 2x20 at 238-263W (95-105% FTP). Warm-up 10 min, 2x20 min work with 5 min recovery, 5 min cool-down. Cadence 85-95rpm. Est. TSS: 72. Next hard session in 48-72 hours.",
      },
      {
        scenario: "Advanced rider, 300W FTP, 75 minutes, VO2max goal",
        inputs: ["FTP: 300W", "Time: 75 min", "Goal: VO2max", "Level: Advanced"],
        output: "Classic 5x4 at 318-360W (106-120% FTP) with 4 min recovery at 150-180W. Warm-up 10 min, 5x4 min work, cool-down 5 min. Cadence 95-105rpm. Est. TSS: 85. 48-72 hours before next intensity.",
      },
    ],
    faqs: [
      {
        question: "How do I choose between VO2max, threshold, and sweet spot sessions?",
        answer: "It depends on your training phase and goals. Sweet spot (88-94% FTP) is the best return-on-investment for time-crunched riders in the build phase. Threshold (95-105% FTP) directly raises your FTP ceiling and belongs in the final 6-8 weeks before a target event. VO2max (106-120%+ FTP) improves your aerobic ceiling and is most effective in the speciality phase or when your FTP has plateaued despite consistent threshold work. Endurance and tempo sessions build your aerobic base.",
      },
      {
        question: "How many interval sessions should I do per week?",
        answer: "There is no universal number. Count races, hard group rides, strength work and other sports before adding interval sessions. Begin conservatively, keep the complete set repeatable and add work only when normal training and recovery remain stable.",
      },
      {
        question: "What is the Ronnestad 30/15 protocol?",
        answer: "Developed by Norwegian researcher Bent Ronnestad, the 30/15 protocol alternates 30 seconds at 130% FTP with 15 seconds at 50% FTP, repeated 13 times per set across 3 sets. Research shows this format produces more time at VO2max than traditional long intervals because the brief recovery periods prevent complete metabolic recovery while the high power demands force rapid re-recruitment of muscle fibres. It is marked as advanced-only due to the extreme metabolic stress.",
      },
      {
        question: "How accurate is the TSS estimate?",
        answer: "The TSS estimate uses a time-weighted average of each interval's midpoint power as a proxy for Normalised Power. It will be close to your actual TSS if you hit the power targets consistently. Variable power within intervals (surging above target, dipping below) will typically produce a higher actual TSS than the estimate. Treat it as a planning guide, not a definitive number.",
      },
      {
        question: "Should I use ERG mode or resistance mode for intervals?",
        answer: "ERG mode works well for steady-state intervals like sweet spot and threshold blocks, where holding a consistent power is the goal. For VO2max and sprint sessions, resistance mode is often better because it lets you respond to fatigue naturally and adjust your effort within the target range. Over-unders specifically benefit from resistance mode so you can feel the transitions between the under and over segments.",
      },
      {
        question: "What cadence should I target during intervals?",
        answer: "Higher cadences (95-110 rpm) during VO2max and sprint intervals reduce muscular force per pedal stroke, shifting stress toward the cardiovascular system. Lower cadences (85-95 rpm) during threshold and sweet spot work increase muscular tension, which drives peripheral adaptations in the working muscles. The cadence targets in each session are prescribed to match the intended physiological stimulus. If a specific cadence feels unnatural, prioritise hitting the power target over the cadence target.",
      },
    ],
    related: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
      { label: "TSS Calculator", href: "/tools/tss", kind: "tool" },
      { label: "Sweet Spot Calculator", href: "/tools/sweet-spot", kind: "tool" },
      { label: "FTP Test Calculator", href: "/tools/ftp-test", kind: "tool" },
      { label: "Training Load Calculator", href: "/tools/training-load", kind: "tool" },
      { label: "FTP Training topic hub", href: "/topics/ftp-training", kind: "topic" },
    ],
    webAppFeatures: [
      "Twenty structured interval sessions across six training goals",
      "Complete session structure: warm-up, work intervals, recovery, cool-down",
      "Power targets in watts and percentage of FTP",
      "Cadence ranges and RPE for every interval block",
      "Visual session timeline with proportional coloured blocks",
      "TSS estimation with Normalised Power and Intensity Factor",
      "Physiological explanation of each session's training effect",
      "Recovery guidance for post-session scheduling",
      "Copy-to-clipboard session export",
      "Experience level filtering (beginner, intermediate, advanced)",
    ],
  },

  "pre-ride-fuel": {
    slug: "pre-ride-fuel",
    title: "Pre-Ride Fuel Calculator",
    description:
      "Calculate your pre-ride meal macros based on body weight, FTP, session type, and start time. Powered by the Hexis/Impey FFTWR methodology, verified against live accounts.",
    url: `${ROADMAN_BASE}/tools/pre-ride-fuel`,
    breadcrumbName: "Pre-Ride Fuel Calculator",
    answerSummary:
      "Enter your weight, FTP, session type and start time. The calculator returns your pre-ride meal macros (carbs, protein, fat in grams), a timing window of 2–3 hours before the session, example foods, and your in-ride carb target per hour — all built on the Hexis/Impey Fuel For The Work Required methodology verified against live athlete accounts.",
    whatItDoes:
      "Most cyclists either eat too much before easy rides or too little before hard ones. This calculator fixes that by matching your pre-ride meal to the session you're about to do. A rest-day spin and a three-hour threshold session need fundamentally different fuel — the calculator tells you exactly how much, what ratio, and when to eat it.",
    whoItsFor: [
      "Cyclists who want to stop guessing what to eat before training",
      "Riders following a structured plan who want nutrition matched to session type",
      "Athletes preparing for events who need pre-ride fuelling dialled in",
      "Anyone who has bonked because they ate the wrong breakfast before a hard ride",
      "Riders curious about periodised nutrition before committing to Hexis",
    ],
    howItWorks:
      "The engine calculates your daily energy expenditure using the Mifflin-St Jeor equation, applies your body composition goal (lose, maintain, or gain), then adds exercise energy for the session you've selected. Carbohydrate scaling follows the FFTWR fuel-category system — low-intensity sessions get fewer carbs, high-intensity sessions get more. The pre-workout meal receives a 15% carb bump to top off glycogen stores. Meal distribution follows the verified Hexis model: breakfast ~24%, lunch ~30%, PM snack ~15%, dinner ~30%, with the pre-workout window adjusted to your session start time.",
    howToSteps: [
      { name: "Enter your body weight in kilograms", text: "Your weight drives the protein target (1.8 g/kg) and resting metabolic rate. Use your current morning weight, not a target." },
      { name: "Enter your FTP in watts", text: "FTP determines exercise energy expenditure. If you haven't tested recently, use the most recent value from TrainingPeaks, Zwift, or TrainerRoad." },
      { name: "Select your session type", text: "Choose from 21 session templates — recovery spin, Z2 endurance, sweet spot, threshold intervals, VO2max repeats, and more. Each has a fuel category that determines carb scaling." },
      { name: "Set your session start time", text: "This determines when to eat. The calculator prescribes a 2–3 hour pre-ride window and identifies which meal slot the pre-ride food falls into." },
      { name: "Choose your body composition goal", text: "Lose, maintain, or gain. A weight-loss goal applies a modest deficit to rest-day calories without under-fuelling training sessions — the core FFTWR principle." },
      { name: "Read your pre-ride prescription", text: "You get pre-ride macros in grams (carbs, protein, fat), a timing window, example foods for that macro profile, and your in-ride carb-per-hour target based on session intensity." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "The calculator uses population-level metabolic equations (Mifflin-St Jeor) — individual metabolic rates vary by ±10%. Gut tolerance to pre-ride carbs is personal and takes time to train. The 15% pre-workout carb bump is a methodology default, not an individually calibrated value. Session templates use typical intensity factors — your actual session may differ. For fully individualised periodised nutrition with food logging and daily adjustment, Hexis automates the full FFTWR methodology.",
    whenToSeeACoach:
      "If you regularly experience GI distress during rides, have a history of disordered eating, struggle with fuelling around early-morning sessions, or need race-day nutrition planning for events over four hours — a sports dietitian or the full Hexis platform will serve you better than a single-meal calculator.",
    examples: [
      {
        scenario: "82kg rider, 250W FTP, 90-min Z2 endurance ride at 7am",
        inputs: ["Weight: 82kg", "FTP: 250W", "Session: Z2 Endurance (≤75min)", "Start: 07:00", "Goal: Maintain"],
        output: "Pre-ride meal (05:00): 48g carbs, 37g protein, 18g fat (~500 kcal). Examples: porridge with banana and a scoop of whey. In-ride carbs: 0 g/hr (low fuel category — water only).",
      },
      {
        scenario: "75kg rider, 280W FTP, threshold intervals at 18:00",
        inputs: ["Weight: 75kg", "FTP: 280W", "Session: 2×20 Threshold", "Start: 18:00", "Goal: Lose"],
        output: "Pre-ride meal (15:30): 62g carbs, 34g protein, 15g fat (~520 kcal). Examples: rice cakes with chicken and a banana. In-ride carbs: 60 g/hr (moderate-high fuel category).",
      },
    ],
    faqs: [
      {
        question: "What should I eat before a cycling session?",
        answer: "A meal 2–3 hours before riding, weighted toward carbohydrates with moderate protein and low fat. The exact amounts depend on your body weight, the session intensity, and your body composition goal. A 75kg rider doing threshold intervals needs roughly 60g of carbs pre-ride; the same rider doing a recovery spin needs closer to 35g. The calculator gives you the specific numbers for your session.",
      },
      {
        question: "How many hours before cycling should I eat?",
        answer: "Two to three hours gives most riders enough time to digest a full meal without GI discomfort. If you ride early morning and can't eat three hours before, a smaller carb-focused snack 60–90 minutes out works — think a banana and a handful of cereal, not a full breakfast. The key is getting some glycogen on board without sitting heavy in your stomach.",
      },
      {
        question: "How many carbs should I eat before a long ride?",
        answer: "For rides over 90 minutes at moderate intensity, aim for 1–2 g of carbs per kilogram of body weight in your pre-ride meal. For a 75kg rider, that's 75–150g of carbs depending on session intensity and duration. The calculator narrows this range based on the specific session template — a four-hour endurance ride needs more pre-ride fuel than a 90-minute tempo session.",
      },
      {
        question: "Should I eat before a Zone 2 ride?",
        answer: "For Zone 2 rides under 75 minutes, eating before is optional — the body's glycogen stores handle the workload. For Zone 2 rides over 90 minutes, eat. The FFTWR model prescribes a smaller, carb-moderate meal for low-intensity sessions and a larger, carb-heavy meal for high-intensity ones. Chronic fasted training at any intensity risks under-recovery and hormone disruption.",
      },
      {
        question: "What is the difference between pre-ride fuel for training and racing?",
        answer: "Racing gets more carbs. The FFTWR competition-day protocol increases carbohydrate restoration to near 100% of exercise calories (versus ~77% on training days) and adds a 40g carb-loading bonus. Pre-ride meals on competition days are larger and more carb-dominant. The competition day fuel planner handles this in detail — this calculator covers standard training-day pre-ride meals.",
      },
    ],
    related: [
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling", kind: "tool" },
      { label: "FFTWR Complete Guide", href: "/blog/fuel-for-the-work-required-fftwr-explained", kind: "article" },
      { label: "Hexis Review", href: "/blog/hexis-review", kind: "article" },
      { label: "Fuelled vs Fasted Sessions", href: "/compare/fueled-vs-fasted-sessions", kind: "topic" },
      { label: "Hexis vs MyFitnessPal", href: "/compare/hexis-vs-myfitnesspal", kind: "article" },
      { label: "Nutrition topic hub", href: "/topics/cycling-nutrition", kind: "topic" },
    ],
    webAppFeatures: [
      "Pre-ride meal macros (carbs, protein, fat) from 21 session templates",
      "Timing window based on session start time",
      "Fuel-category-aware carb scaling (FFTWR methodology)",
      "In-ride carb-per-hour target by session intensity",
      "Body composition goal integration (lose, maintain, gain)",
      "Example food suggestions for each macro profile",
      "Verified against live Hexis accounts (May 2026)",
    ],
  },

  hydration: {
    slug: "hydration",
    title: "Cycling Sweat Rate Calculator",
    description:
      "Calculate cycling sweat rate from measured pre/post body mass, fluid, urine and ride duration, with the formula, assumptions and safety boundaries visible.",
    url: `${ROADMAN_BASE}/tools/hydration`,
    breadcrumbName: "Sweat Rate Calculator",
    answerSummary:
      "A cycling sweat-rate test estimates fluid lost during one representative ride. Record dry pre- and post-ride body mass, everything you drink, any urine produced and the duration. The result belongs to those conditions: it is not a universal drinking target and it does not measure sweat sodium.",
    whatItDoes:
      "This calculator turns field measurements from a real ride into estimated total sweat loss and litres per hour. It keeps the inputs and formula visible, flags body-mass gain and unusually high values, and links the result to an evidence-led planning process.\n\nIt replaces Roadman's old population estimate based on body weight, intensity and temperature. Those variables affect sweat loss, but they cannot measure an individual rider's loss from a desk calculation.",
    whoItsFor: [
      "Cyclists planning long, hot or high-intensity rides",
      "Riders comparing sweat losses across representative conditions",
      "Coaches auditing bottle logistics without forcing full replacement",
      "Anyone searching for a transparent cycling sweat-rate formula",
    ],
    howItWorks:
      "Estimated sweat loss equals pre-ride body mass minus post-ride body mass, plus fluid consumed, minus urine produced. One kilogram of acute mass change is treated as roughly one litre of water, then total loss is divided by ride duration in hours. Wet clothing, scale precision, food and unrecorded losses create error, so repeat comparable tests.",
    howToSteps: [
      { name: "Prepare a representative ride", text: "Choose conditions, clothing and intensity relevant to the event or training question. Use the same reliable scale before and after." },
      { name: "Measure normal behaviour", text: "Weigh after using the toilet in dry minimal clothing. Drink normally and record every bottle, refill and bathroom stop; do not withhold fluid for the test." },
      { name: "Enter the four measurements", text: "Add pre- and post-ride body mass in kilograms, fluid consumed and urine in millilitres, and the ride duration." },
      { name: "Interpret, repeat and audit", text: "Attach temperature, humidity, airflow, clothing and workload to the result. Repeat comparable sessions, avoid drinking enough to gain body mass and do not assume 100% replacement is required." },
    ],
    howToTotalTime: "PT5M",
    limitations:
      "One field result is noisy and specific to its conditions. Wet clothing, inaccurate scales, food, respiratory water and unrecorded fluid can distort it. The calculator estimates fluid loss only: it cannot measure sweat sodium, diagnose dehydration, prescribe a universal millilitres-per-hour target or decide whether symptoms need treatment.",
    whenToSeeACoach:
      "Use a qualified sports dietitian or clinician when repeated measurements are extreme, you have recurrent heat illness, confusion, collapse, persistent gastrointestinal problems, kidney or cardiovascular disease, or take medication that affects fluid or sodium balance. Confusion, seizure, collapse, loss of coordination or altered consciousness during or after exercise needs urgent medical help.",
    examples: [
      {
        scenario: "Representative 90-minute ride",
        inputs: ["Pre: 75.0 kg", "Post: 74.4 kg", "Drink: 750 ml", "Urine: 0 ml", "Duration: 90 min"],
        output: "Estimated sweat loss: 1.35 L. Estimated sweat rate: 0.90 L/h. This describes that ride; it is not a command to drink 0.90 L/h.",
      },
      {
        scenario: "Body-mass gain check",
        inputs: ["Pre: 70.0 kg", "Post: 70.3 kg", "Drink and duration recorded"],
        output: "The tool flags fluid-related body-mass gain so the rider can recheck measurements and avoid repeating an overdrinking pattern.",
      },
    ],
    faqs: [
      {
        question: "How do I calculate sweat rate for cycling?",
        answer: "Subtract post-ride body mass from pre-ride body mass, add fluid consumed, subtract urine produced, then divide the estimated litres lost by duration in hours. Weigh in dry minimal clothing and repeat comparable rides because one result is condition-specific and noisy.",
      },
      {
        question: "Is sweat rate the same as how much I should drink per hour?",
        answer: "No. Sweat rate estimates loss during a particular ride. It is one boundary for planning, not a requirement to replace every millilitre while riding. Thirst, conditions, access, tolerance, symptoms and post-ride body-mass trends also matter, and a normally hydrated rider should not drink enough to gain body mass during prolonged exercise.",
      },
      {
        question: "Should I avoid drinking during a sweat-rate test?",
        answer: "No. Drink normally and record the amount. The formula adds consumed fluid back into estimated loss. Withholding fluid can make the session unrepresentative and is unnecessary for this field calculation.",
      },
      {
        question: "Does the calculator tell me how much sodium I need?",
        answer: "No. Sweat volume and sweat sodium concentration are separate measurements. This tool does not infer a sodium dose from fluid loss, body mass, temperature or cramping. Review food, product labels, event demands and—when justified—valid sweat-sodium testing separately.",
      },
      {
        question: "How often should I repeat a cycling sweat-rate test?",
        answer: "Repeat it in the conditions that materially change your loss: cool and hot weather, indoor and outdoor riding, different workloads or clothing. Compare like with like and treat repeated observations as a range, not a permanent personal constant.",
      },
    ],
    related: [
      { label: "Cycling Hydration Guide", href: "/blog/cycling-hydration-guide", kind: "article" },
      { label: "How to Calculate Sweat Rate", href: "/blog/cycling-electrolytes-sweat-rate-testing-guide", kind: "article" },
      { label: "Electrolytes for Cycling", href: "/blog/electrolytes-sweat-rate-cycling", kind: "article" },
      { label: "Cycling Nutrition Hub", href: "/topics/cycling-nutrition", kind: "topic" },
    ],
    webAppFeatures: [
      "Measured cycling sweat-rate calculation",
      "Transparent fluid-balance formula",
      "Body-mass gain and high-value checks",
      "500 ml and 750 ml bottle comparison",
      "Visible methodology and evidence limits",
      "No signup and no universal fluid or sodium prescription",
    ],
    evidenceSources: [
      { name: "UCI Sports Nutrition Project: Special Environments", role: "Cycling-specific consensus and field sweat-loss equation", href: "https://pubmed.ncbi.nlm.nih.gov/41468209/" },
      { name: "Baker: Sweating Rate and Sweat Sodium Concentration", role: "Field measurement methodology and sources of error", href: "https://pubmed.ncbi.nlm.nih.gov/28332116/" },
      { name: "NATA Fluid Replacement Position Statement", role: "Individual planning and body-mass-gain safeguard", href: "https://pubmed.ncbi.nlm.nih.gov/28985128/" },
      { name: "Exercise-Associated Hyponatremia Consensus", role: "Overdrinking risk and emergency context", href: "https://pubmed.ncbi.nlm.nih.gov/26102445/" },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "Editorial source-to-claim review; not individual medical or dietetic advice.",
  },

  "indoor-platform-compare": {
    slug: "indoor-platform-compare",
    title: "Indoor Cycling Platform Comparison Tool",
    description:
      "Compare TrainingPeaks Virtual, Zwift, Rouvy, and TrainerRoad side by side. Select your priorities — structured training, social features, racing, coaching — and get a personalised recommendation.",
    url: `${ROADMAN_BASE}/tools/indoor-platform-compare`,
    breadcrumbName: "Indoor Platform Comparison",
    answerSummary:
      "Select two or three indoor cycling platforms from TrainingPeaks Virtual, Zwift, Rouvy, and TrainerRoad, then rate your priorities across structured training, social features, racing, coach integration, event simulation, and cost. The tool returns a weighted recommendation with a side-by-side feature matrix and pricing breakdown.",
    whatItDoes:
      "Four major indoor cycling platforms, each built around a different philosophy. TrainingPeaks Virtual for coached, plan-integrated training. Zwift for social riding and racing. Rouvy for real-world course simulation. TrainerRoad for self-coached adaptive plans. This tool helps you cut through the marketing and find the platform that matches how you actually train.",
    whoItsFor: [
      "Cyclists deciding between indoor platforms for the first time",
      "Riders considering a switch from one platform to another",
      "Coached athletes evaluating whether TPV fits their training setup",
      "Riders who use multiple platforms and want to optimise which sessions go where",
    ],
    howItWorks:
      "The tool uses a weighted scoring model across six training priorities. Each platform has pre-scored values for structured training quality, social/group riding, racing depth, coach integration, event-specific simulation, and monthly cost. You rate which priorities matter most to you, and the tool returns a ranked recommendation. The feature matrix gives you the raw comparison; the recommendation tells you what that data means for your riding.",
    howToSteps: [
      { name: "Select platforms to compare", text: "Choose two or three platforms from TrainingPeaks Virtual, Zwift, Rouvy, and TrainerRoad. Comparing all four at once also works." },
      { name: "Rate your training priorities", text: "Rank how much each factor matters to you: structured training, social features, racing, coach integration, event simulation, and cost. The tool weights your recommendation accordingly." },
      { name: "Review the feature matrix", text: "A side-by-side comparison of every major feature: workout delivery, ERG mode, group rides, racing, course library, analytics, and pricing." },
      { name: "Read your recommendation", text: "The tool explains which platform fits your priorities and why. Where two platforms are close, it suggests how to combine them for the best result." },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "Platform features change — pricing and feature sets were last verified in August 2026. The tool captures features available to most users; some platforms have beta features, regional variations, or hardware-specific capabilities not included. The scoring model is editorial, based on hands-on testing and coaching experience, not a perfectly objective algorithm. Your personal experience with each platform's UI, community, and workout feel can't be captured in a feature matrix.",
    whenToSeeACoach:
      "If you're unsure whether your indoor training is actually translating to outdoor performance, or you're doing plenty of indoor work without seeing results, the problem is probably your training plan — not your platform. A coach can audit your week and tell you whether the platform is the issue or the programming behind it.",
    examples: [
      {
        scenario: "Coached cyclist, 8 hrs/week, uses TrainingPeaks",
        inputs: ["Platforms: TPV, Zwift", "Priorities: Coach integration (high), Structured training (high), Social (low)"],
        output: "Recommendation: TrainingPeaks Virtual. Your structured workouts sync from the TP calendar, your coach sees every session, and your TSS/CTL stays unified. Add Zwift for occasional weekend group rides if you want the social layer.",
      },
      {
        scenario: "Self-coached rider, trains alone, wants AI plan adjustment",
        inputs: ["Platforms: TrainerRoad, TPV, Zwift", "Priorities: Structured training (high), Cost (medium), Social (medium)"],
        output: "Recommendation: TrainerRoad. Adaptive Training adjusts your plan based on completed sessions, and the AI Training Simulation optimises your next four weeks. TrainerRoad is built for riders who want the plan to think for them.",
      },
    ],
    faqs: [
      {
        question: "Which indoor cycling platform is best?",
        answer: "It depends on how you train. TrainingPeaks Virtual is best for coached athletes who want indoor sessions integrated with their training plan. Zwift is best for social riders who need group rides and races to stay motivated. TrainerRoad is best for self-coached riders who want adaptive AI-driven plans. Rouvy is best for event-specific preparation on real-world course simulations.",
      },
      {
        question: "Is TrainingPeaks Virtual included with TrainingPeaks?",
        answer: "Yes. TrainingPeaks Virtual is included with TrainingPeaks Premium at $19.95 per month. If you're already paying for TrainingPeaks analytics and structured workout delivery, you get the indoor training platform at no additional cost — which makes it significantly better value than paying for a separate indoor platform alongside your TP subscription.",
      },
      {
        question: "Can I use multiple indoor platforms?",
        answer: "Yes, and many serious cyclists do. A common setup: TrainingPeaks Virtual or TrainerRoad for structured midweek sessions, Zwift for social group rides or races on weekends, and Rouvy for event-specific course simulation in the final build before a target event. The key is ensuring your structured work stays integrated with your training plan.",
      },
      {
        question: "Which platform is best for coached cyclists?",
        answer: "TrainingPeaks Virtual, by a clear margin. Your coach prescribes workouts in TrainingPeaks, and TPV loads them automatically on the trainer. Completed sessions sync back to the same calendar as your outdoor rides. Your coach sees everything in one place — no data fragmentation, no manual imports. No other indoor platform offers this level of coaching integration.",
      },
      {
        question: "Is TrainerRoad or Zwift better for getting faster?",
        answer: "TrainerRoad, if you follow the plan. Its Adaptive Training system adjusts workout difficulty based on your responses, and the AI Training Simulation optimises your plan over four-week windows. Zwift's workout library is solid but doesn't adapt to you. However, Zwift's social layer keeps many riders more consistent than they'd be alone — and consistency beats optimisation every time. The fastest platform is the one you actually use.",
      },
    ],
    related: [
      { label: "TPV vs Zwift", href: "/compare/trainingpeaks-virtual-vs-zwift", kind: "article" },
      { label: "TPV vs Rouvy", href: "/compare/trainingpeaks-virtual-vs-rouvy", kind: "article" },
      { label: "TPV vs TrainerRoad", href: "/compare/trainingpeaks-virtual-vs-trainerroad", kind: "article" },
      { label: "Rouvy vs Zwift", href: "/blog/rouvy-vs-zwift", kind: "article" },
      { label: "Indoor vs Outdoor Training", href: "/compare/indoor-vs-outdoor-training", kind: "article" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones", kind: "tool" },
    ],
    webAppFeatures: [
      "Side-by-side comparison of TPV, Zwift, Rouvy, and TrainerRoad",
      "Priority-weighted recommendation engine",
      "Feature matrix across structured training, racing, social, and coaching",
      "Pricing comparison with value analysis",
      "Platform combination suggestions for multi-platform setups",
      "Personalised recommendation based on your training style",
    ],
  },
};

/** Helper for components that look up a tool by slug. */
export function getToolLanding(slug: string): ToolLandingContent | undefined {
  return TOOL_LANDING_CONTENT[slug];
}
