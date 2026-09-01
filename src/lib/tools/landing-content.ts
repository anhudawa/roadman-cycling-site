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
  kind: "tool" | "article" | "podcast" | "topic" | "glossary" | "product";
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
    title: "Cycling W/kg Calculator",
    description:
      "Calculate cycling FTP watts per kilogram from power and body mass, with transparent reference ranges, worked examples, evidence and interpretation limits.",
    url: `${ROADMAN_BASE}/tools/wkg`,
    breadcrumbName: "W/kg Calculator",
    answerSummary:
      "Enter FTP in watts and body mass in kilograms. The calculator returns FTP W/kg and highlights the surrounding half-watt range. The arithmetic is exact; the range is context, not a race category, percentile or diagnosis of ability. Keep the test method and date attached to the result.",
    whatItDoes:
      "This calculator performs one disclosed operation: FTP watts divided by rider body mass in kilograms. It then locates the result inside a broad half-watt reference range without converting that range into a race licence or professional label.\n\nFTP W/kg is useful for threshold-related climbing context. It does not describe sprint power, five-minute power, durability, aerodynamics, handling or race craft, and it does not predict speed independently of gradient, total system mass, wind, rolling resistance and pacing.",
    whoItsFor: [
      "Cyclists who already have a current FTP estimate and want the ratio calculated",
      "Riders tracking a repeatable FTP W/kg baseline over time",
      "Masters cyclists who need a route from raw W/kg to a qualified age benchmark",
      "Coaches and self-coached riders explaining why one ratio is not a complete power profile",
    ],
    howItWorks:
      "W/kg = FTP in watts ÷ rider body mass in kilograms. The tool does not estimate FTP or reconcile different protocols. Use a current value from a disclosed, repeatable method and a representative body-mass measurement. Record the device, protocol and date because a ramp estimate, 20-minute estimate, modelled FTP and long steady effort can disagree.",
    howToSteps: [
      { name: "Choose a current FTP estimate", text: "Use a value from a disclosed, repeatable power test or model. Keep the device and protocol beside the result rather than treating unlike FTP methods as interchangeable." },
      { name: "Use representative body mass", text: "Enter kilograms from a consistent measurement routine. If tracking change, compare similar conditions because hydration and food can move body mass without changing fitness." },
      { name: "Calculate the ratio", text: "Divide FTP watts by kilograms. Example: 260 W ÷ 72 kg = 3.61 W/kg. Two decimals help with arithmetic; they do not remove measurement uncertainty." },
      { name: "Add the missing context", text: "Interpret the result with age, experience, event, duration and terrain. Use a complete power profile for training decisions and actual race results for competitive ability." },
    ],
    howToTotalTime: "PT1M",
    limitations:
      "The output is rider-only FTP W/kg, not total-system W/kg and not a speed prediction. It does not include bicycle mass, gradient, aerodynamic drag, wind, rolling resistance, drafting, pacing, fatigue or power-duration shape. The displayed ranges are not population percentiles, sex- or age-adjusted norms, race categories or medical advice.",
    whenToSeeACoach:
      "A coach can help when repeated, comparable tests do not move despite consistent training or when event demands are unclear. Intentional weight loss, persistent fatigue, falling power, menstrual disturbance, recurrent illness or injury should be handled with appropriately qualified medical or sports-dietetic support rather than a generic W/kg target.",
    examples: [
      {
        scenario: "FTP calculation",
        inputs: ["FTP: 280W", "Weight: 72kg"],
        output: "3.89 W/kg at FTP. The ratio does not by itself establish a race category or predict a gran fondo result.",
      },
      {
        scenario: "Repeatable baseline",
        inputs: ["FTP: 200W", "Weight: 88kg"],
        output: "2.27 W/kg at FTP. Record the method and date, then compare with the same setup after a suitable training period.",
      },
    ],
    faqs: [
      {
        question: "What is a good W/kg for cycling?",
        answer: "There is no context-free good number. Duration, test method, age, sex, training history and event all matter. Generic charts are useful for orientation, not as population percentiles or race categories. Compare against a matched age or experience reference and your own repeatable baseline.",
      },
      {
        question: "How do I improve my W/kg?",
        answer: "Increase sustainable power through appropriate training and recovery. Body-mass change is not automatically required and should preserve energy availability, health, recovery and useful power. A generic calculator cannot decide whether weight loss is appropriate for an individual.",
      },
      {
        question: "Does W/kg matter on flat roads?",
        answer: "Less than on sustained climbs. At higher speeds on flatter roads, absolute power and aerodynamic drag become more important. Wind, rolling resistance, drafting, position and course shape also matter, so W/kg is not a universal finishing-speed predictor.",
      },
      {
        question: "Is FTP W/kg the same as climbing W/kg?",
        answer: "Not necessarily. FTP is a threshold-related estimate, while a climb may last much less or much more time. Use power for a duration that matches the climb, then account for bicycle mass, gradient, aerodynamics and conditions.",
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
      "Transparent watts-divided-by-kilograms formula",
      "Broad half-watt reference-range marker",
      "Worked examples and interpretation limits",
    ],
    evidenceSources: [
      {
        name: "Creating Your Power Profile",
        role: "Andrew Coggan · multi-duration framework and benchmark limits",
        href: "https://www.trainingpeaks.com/blog/power-profiling/",
      },
      {
        name: "Understanding Intensity: Power",
        role: "British Cycling · FTP W/kg definition and weight-loss caution",
        href: "https://www.britishcycling.org.uk/knowledge/training/get-started/article/izn20140820-Training-Understanding-Intensity-3--Power-0",
      },
      {
        name: "Allometric scaling of uphill cycling performance",
        role: "Jobson et al., 2008 · field hill-climb study",
        href: "https://pubmed.ncbi.nlm.nih.gov/18213539/",
      },
      {
        name: "Optimal body-mass normalisation over complex cycling courses",
        role: "Horvath and Andersson, 2025 · course-specific modelling",
        href: "https://pubmed.ncbi.nlm.nih.gov/40901017/",
      },
      {
        name: "Power profiling and the power-duration relationship in cycling",
        role: "Leo et al., 2022 · narrative review",
        href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8783871/",
      },
      {
        name: "IOC consensus statement on Relative Energy Deficiency in Sport",
        role: "Mountjoy et al., 2023 · health and performance consensus",
        href: "https://bjsm.bmj.com/content/57/17/1073",
      },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "coach review and source verification",
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
    title: "MTB Suspension Calculator",
    description:
      "Calculate fork and rear-shock sag, plus a manufacturer-backed starting pressure where an exact source supports it.",
    url: `${ROADMAN_BASE}/tools/shock-pressure`,
    breadcrumbName: "MTB Suspension Calculator",
    answerSummary:
      "Enter body weight, riding-kit weight, fork travel, shock stroke and sag targets. Roadman calculates sag in millimetres and returns an official starting pressure only where the selected model-year source supports one. For bike-specific or serial-specific products, it sends you to the manufacturer lookup instead of inventing a universal PSI.",
    whatItDoes:
      "This is a source-aware setup assistant, not a universal pressure formula. It converts your chosen fork and rear sag percentages into millimetres, matches a dressed rider to the published 2026 FOX 38 chart, and applies FOX's published body-weight starting method to the selected 2026 FLOAT rear shocks. Those values begin the setup; measured sag decides it.\n\nFor RockShox, another FOX generation, another air shock or a coil shock, the tool deliberately withholds an unsupported number and routes you to the product, serial-number or bicycle-specific source. Tyre pressure has its own canonical calculator rather than a second hidden model on this page.",
    whoItsFor: [
      "MTB riders who need a measurable fork and rear-sag target",
      "FOX 38 owners who can confirm the exact 2026 chassis variant",
      "FOX FLOAT X, FLOAT SL or FLOAT X2 owners checking the published 2026 starting method",
      "RockShox riders who need the correct path to Trailhead rather than a generic pressure table",
      "Air- or coil-shock owners who want to know where a calculator must stop",
    ],
    howItWorks:
      "Sag in millimetres equals suspension travel or shock stroke multiplied by the chosen sag percentage. FOX 38 starting PSI is a direct band lookup from the official 2026 table—no interpolation, extrapolation, riding-style multiplier or volume-spacer multiplier. Selected 2026 FOX rear shocks use FOX's body-weight-in-pounds first-inflation method, subject to the stated maximum; rear sag then calibrates the bike-specific result. Other products require their official lookup.",
    howToSteps: [
      { name: "Identify the exact products", text: "Confirm fork and shock model, model year, travel or stroke, air-spring variant and every maximum stated by the bicycle and component manufacturers." },
      { name: "Enter body and kit weight separately", text: "FOX's rear starting method refers to body weight in pounds. The fork chart and sag check use the weight of the dressed rider, so Roadman keeps those two values visible." },
      { name: "Choose a sag target from the exact manual", text: "Enter the percentage specified for the product and bike. Roadman converts it to the millimetre distance the O-ring should move." },
      { name: "Inflate and equalise exactly as instructed", text: "Open compression damping, use a shock pump, respect every maximum and follow the product-specific positive/negative chamber equalisation sequence." },
      { name: "Measure, adjust and record", text: "Settle into normal riding position in full kit, measure sag without bouncing, make a small pressure adjustment, equalise again where required and repeat before touching rebound or compression." },
    ],
    howToTotalTime: "PT15M",
    limitations:
      "Roadman cannot identify a component from appearance, read its serial number, see the bicycle's leverage curve or know its OEM tune, service condition, temperature, permitted spacers or manufacturer limits. The numeric fork chart is intentionally limited to four 2026 FOX 38 variants and the published weight range. The FOX rear value is explicitly a first-inflation method, not a bike-specific final pressure. No generic coil spring rate, rebound click count or automatic style/spacer adjustment is produced.",
    whenToSeeACoach:
      "Suspension faults and compatibility are mechanical questions, not coaching questions. Stop riding and use a qualified suspension technician or the bicycle/component manufacturer if you cannot identify the product, a calculated starting method exceeds a limit, the unit is stuck down, loses pressure, leaks, tops out harshly or still behaves abnormally after correct sag setup.",
    examples: [
      {
        scenario: "2026 FOX 38 FLOAT, 80 kg dressed rider",
        inputs: ["Body weight: 77 kg", "Kit + hydration: 3 kg", "Fork travel: 170 mm", "Target fork sag: 20%"],
        output: "The official 170–180 lb chart band starts at 93 PSI. The measurable target is 34 mm sag. Inflate, equalise and adjust to that target; do not add a riding-style or spacer multiplier.",
      },
      {
        scenario: "2026 FOX FLOAT X with 55 mm stroke",
        inputs: ["Body weight: 77 kg / about 170 lb", "Target rear sag: 30%", "Shock stroke: 55 mm"],
        output: "FOX's first-inflation method starts at about 170 PSI. The target is 16.5 mm sag. The final pressure can differ with the frame, so measure and adjust rather than treating 170 PSI as the answer.",
      },
    ],
    faqs: [
      {
        question: "What is the correct MTB suspension pressure for my weight?",
        answer: "There is no universal rider-weight-to-PSI answer. Fork pressure depends on the exact chassis, air spring, travel and model year. Rear pressure also depends heavily on the bicycle's leverage curve and OEM tune. Use the matching manufacturer starting point, then adjust until measured sag matches the bike and component manuals.",
      },
      {
        question: "How does the FOX suspension calculator work?",
        answer: "For the four listed 2026 FOX 38 variants, Roadman selects the published weight band without interpolating or extrapolating. For the listed 2026 FLOAT rear shocks, it applies FOX's body-weight-in-pounds first-inflation method and stated maximum. In both cases the rider must then equalise the air chambers and tune to measured sag.",
      },
      {
        question: "Why does the RockShox suspension calculator send me to Trailhead?",
        answer: "RockShox directs riders to the pressure decal or Trailhead for the product-specific starting pressure and rebound setting. Model name alone is not enough because generations, travel and air-spring configurations differ. Roadman still calculates the sag distance, but it does not copy one RockShox table across incompatible products.",
      },
      {
        question: "What is sag and how do I calculate it?",
        answer: "Sag is how far the suspension compresses under the dressed rider in normal position. Multiply fork travel or shock stroke—not rear-wheel travel—by the target percentage. A 170 mm fork at 20% is 34 mm. A 55 mm shock at 30% is 16.5 mm.",
      },
      {
        question: "Do volume spacers mean I should add more PSI?",
        answer: "Not through a universal percentage. FOX describes spacers as a way to change mid-stroke and bottom-out resistance after sag is set, while RockShox describes tokens as increasing progression. Follow the permitted configuration for the exact product and repeat the complete sag process after a change.",
      },
      {
        question: "Can rider weight alone calculate a coil spring rate?",
        answer: "No. A defensible spring-rate calculation also needs frame motion ratio or leverage curve, rear travel, shock stroke, weight distribution and the manufacturer's preload limits. Use the bicycle maker or shock maker's bike-specific spring calculator; Roadman will not disguise a rider-weight shortcut as engineering.",
      },
      {
        question: "Is Roadman affiliated with FOX or RockShox?",
        answer: "No. Roadman Cycling is an independent publisher and calculator. FOX, SRAM and RockShox names identify the official source profile selected by the rider. Their manuals, bike-specific instructions, warnings and maximum limits always override this page.",
      },
    ],
    related: [
      { label: "Tyre Pressure Calculator", href: "/tools/tyre-pressure", kind: "tool" },
      { label: "MTB suspension setup guide", href: "/blog/mtb-suspension-setup-complete-guide", kind: "article" },
      { label: "MTB fork setup guide", href: "/blog/mtb-fork-setup-guide", kind: "article" },
      { label: "Mountain biking topic hub", href: "/topics/mountain-biking", kind: "topic" },
    ],
    webAppFeatures: [
      "Fork and rear-shock sag calculator in millimetres",
      "Direct 2026 FOX 38 published pressure-band lookup",
      "2026 FOX FLOAT rear-shock first-inflation method with maximum-pressure guard",
      "RockShox Trailhead and model-specific lookup routing",
      "Explicit no-extrapolation and no-generic-coil-rate safeguards",
    ],
    evidenceSources: [
      {
        name: "FOX 2026 38 mm Owner’s Manual",
        role: "published pressure bands, 15–20% sag, maximum pressure and spacer boundaries",
        href: "https://tech.ridefox.com/bike/owners-manuals/3103/fork--2026-38mm",
      },
      {
        name: "FOX 2026 FLOAT SL and FLOAT X Owner’s Manual",
        role: "body-weight starting method, 25–30% sag, equalisation process and maximum pressures",
        href: "https://tech.ridefox.com/bike/owners-manuals/3098/sagsetup",
      },
      {
        name: "FOX 2026 FLOAT X2 Owner’s Manual",
        role: "body-weight starting method, approximately 30% sag, equalisation process and 350 PSI maximum",
        href: "https://tech.ridefox.com/bike/owners-manuals/3023/shock--2026-float-x2",
      },
      {
        name: "SRAM/RockShox Suspension Manual",
        role: "product-specific pressure lookup, sag method and damping sequence",
        href: "https://docs.sram.com/en-US/publications/5ODr3E6BhL1uWDnWhq4ATB/UM%20-%20Suspension",
      },
      {
        name: "RockShox Trailhead",
        role: "official product lookup for starting pressure, rebound, service and tuning data",
        href: "https://trailhead.rockshox.com/",
      },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "source-to-calculation and rider-facing method review",
  },

  "energy-availability": {
    slug: "energy-availability",
    title: "Energy Availability Estimator",
    description:
      "Estimate energy availability from intake, exercise expenditure and fat-free mass, with clear limits on what the result can tell a cyclist.",
    url: `${ROADMAN_BASE}/tools/energy-availability`,
    breadcrumbName: "Energy Availability Calculator",
    answerSummary:
      "Enter daily energy intake, exercise energy expenditure, body weight and estimated body fat. The tool applies the standard energy-availability equation and returns an educational estimate in kcal per kg of fat-free mass. It does not screen for or diagnose RED-S.",
    whatItDoes:
      "Energy availability describes dietary energy remaining after exercise expenditure, scaled to fat-free mass. The equation is useful in research and can structure a fuelling conversation, but free-living food intake, exercise expenditure and body composition are difficult to measure accurately. This tool shows the arithmetic without converting it into a clinical traffic light.",
    whoItsFor: [
      "Riders pursuing race weight",
      "High-volume cyclists reviewing how intake relates to exercise demand",
      "Anyone with persistent fatigue, frequent illness, or stalled progress",
      "Female cyclists with menstrual irregularity or stress fractures",
      "Coaches explaining the energy-availability concept without diagnosing an athlete",
    ],
    howItWorks:
      "Energy Availability (EA) = (daily energy intake − exercise energy expenditure) ÷ fat-free mass. Values around 30 and 45 kcal/kg FFM/day are widely cited research reference points, largely derived from controlled work in young women. They are not universal diagnostic boundaries across sexes, sports, durations or individuals.",
    howToSteps: [
      { name: "Choose a comparable period", text: "Use an average that matches the same days for intake and exercise. A single unusually long ride or incomplete food day will distort the result." },
      { name: "Estimate intake", text: "Record food and drink as carefully as practical, while recognising that self-reported energy intake in athletes commonly differs from reference measurements." },
      { name: "Enter exercise expenditure", text: "Use exercise energy only, not total daily expenditure. Power-meter kilojoules may inform cycling estimates, but devices and metabolic assumptions still introduce error." },
      { name: "Estimate fat-free mass", text: "Fat-free mass equals body weight minus estimated fat mass. DXA, bioimpedance and circumference methods are not interchangeable and each adds uncertainty." },
      { name: "Use the result as context", text: "Do not label the value optimal, dangerous or diagnostic. Compare it with symptoms, health history, training and qualified assessment." },
    ],
    howToTotalTime: "PT4M",
    limitations:
      "This is not a RED-S screener. Every input has meaningful error, and the 30/45 reference points do not operate as universal clinical cut-offs. The IOC REDs CAT2 uses screening, severity and risk assessment, exclusion of other causes, and a physician-led diagnosis informed by a multidisciplinary team.",
    whenToSeeACoach:
      "Seek qualified medical and sports-dietetic assessment for menstrual disturbance, low libido or sexual-function change, recurrent bone stress injury, persistent fatigue or illness, marked performance change, rapid weight change, disordered eating or distress around food and training. A coach and app can provide context but cannot make the diagnosis.",
    examples: [
      {
        scenario: "Female 60kg rider, 12hr/week training",
        inputs: ["Intake: 2,400 kcal/day", "Training: 12 hr/week at 150W", "Weight: 60kg", "Body fat: 22%"],
        output: "The arithmetic produces an estimate near 28 kcal/kg FFM/day. Because the inputs and research boundaries are uncertain, this is a prompt to review the wider context—not a clinical category or automatic calorie prescription.",
      },
      {
        scenario: "Male 75kg rider, 8hr/week training",
        inputs: ["Intake: 3,200 kcal/day", "Training: 8 hr/week at 200W", "Weight: 75kg", "Body fat: 15%"],
        output: "The arithmetic produces an estimate near 46 kcal/kg FFM/day. It does not prove that intake is adequate or rule out a health problem.",
      },
    ],
    faqs: [
      {
        question: "What is RED-S in cycling?",
        answer: "Relative Energy Deficiency in Sport describes impaired health and performance associated with exposure to problematic low energy availability. It can affect female and male cyclists, but its indicators are non-specific and other causes must be considered. Diagnosis is physician-led, not calculator-led.",
      },
      {
        question: "What is a healthy energy availability for cyclists?",
        answer: "There is no single validated healthy cut-off for every cyclist. Values around 30 and 45 kcal/kg FFM/day are useful research references but responses vary with sex, duration, baseline status and measurement method. Health, symptoms and performance require wider assessment.",
      },
      {
        question: "How is energy availability different from calorie deficit?",
        answer: "Energy balance compares intake with total expenditure. Energy availability subtracts exercise expenditure from intake and scales the remainder to fat-free mass. They describe different concepts; neither a short food log nor body-weight stability can diagnose RED-S.",
      },
      {
        question: "Can I diet for race weight without low energy availability?",
        answer: "Body-composition goals should be individualised and should not compromise health or useful training. This estimator cannot set a safe deficit, duration, protein target or minimum body weight. Riders with symptoms, previous RED-S, bone stress injury or disordered eating need qualified support before pursuing weight loss.",
      },
      {
        question: "How do I know if I have RED-S?",
        answer: "You cannot diagnose RED-S from this estimate, one symptom, one blood test or one DXA result. The IOC CAT2 uses a three-step process culminating in physician-led diagnosis and treatment after other causes are considered. Seek assessment when indicators persist or health is affected.",
      },
    ],
    related: [
      { label: "Race Weight Calculator", href: "/tools/race-weight", kind: "tool" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling", kind: "tool" },
      { label: "RED-S complete guide", href: "/blog/energy-availability-red-s-cyclists-guide", kind: "article" },
      { label: "Cycling nutrition topic hub", href: "/topics/cycling-nutrition", kind: "topic" },
    ],
    webAppFeatures: [
      "EA calculation in kcal per kg fat-free mass",
      "Clear warning that the estimate is not a RED-S screen",
      "Direct intake, exercise-expenditure and body-composition inputs",
      "Research-reference context without clinical traffic lights",
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
    title: "Cycling to Running Conversion Calculator",
    description:
      "Convert running and cycling distance or time with published 2024 Compendium MET values and explicit limits on fitness, impact and adaptation.",
    url: `${ROADMAN_BASE}/tools/run-ride-converter`,
    breadcrumbName: "Cycling to Running Conversion Calculator",
    answerSummary:
      "Choose Run → Ride or Ride → Run, enter a distance or duration and select the published speed categories on both sides. The calculator matches MET-minutes using the 2024 Adult Compendium of Physical Activities and returns a population-average energy-cost duration and distance. It does not predict FTP, VDOT, race performance, tissue load or equal training adaptation.",
    whatItDoes:
      "This tool answers one narrow question: how long and how far would a selected activity in the other sport take to produce the same population-average MET-minute exposure? Each running and cycling option maps to a named 2024 Compendium activity code. The source MET value is multiplied by minutes, then divided by the target MET value. This is an energy-cost match, not evidence that the sessions are interchangeable.",
    whoItsFor: [
      "Runners replacing some aerobic work with cycling during an off-season or reduced-impact block",
      "Cyclists adding running and needing a conservative planning reference",
      "Triathletes and coaches comparing session energy cost without pretending the sports are identical",
      "Anyone searching for a cycling-to-running ratio who needs the assumptions shown",
    ],
    howItWorks:
      "MET-minutes = published MET value × session minutes. Target minutes = source MET-minutes ÷ target MET value. When distance is entered, the selected source speed converts it to duration; the selected target speed converts the matched duration back to distance. Body mass cancels when comparing the same person, so no weight input is required. The arithmetic is transparent, but MET values remain population estimates.",
    howToSteps: [
      { name: "Choose the direction", text: "Select Run → Ride or Ride → Run. This determines which published activity categories appear on each side." },
      { name: "Enter distance or time", text: "Use a known session distance in kilometres or miles, or enter its duration in minutes." },
      { name: "Select both speed categories", text: "Choose the source and target speeds that best describe the sessions. Every option displays its 2024 Compendium MET value." },
      { name: "Read the scoped match", text: "Use the returned duration and distance as a population-average energy-cost reference, then preserve the purpose, specificity and recovery constraints of the original session." },
    ],
    howToTotalTime: "PT2M",
    limitations:
      "Equal MET-minutes do not mean equal race fitness, tissue load, recovery cost, training stress or adaptation. MET categories estimate population-average energy expenditure. Running economy, cycling efficiency, gradient, wind, surface, drafting, coasting, bike fit and sport-specific skill can move an individual's cost. Running impact and eccentric load have no cycling-distance equivalent. Do not use this result as injury-rehabilitation clearance or as a substitute for sport-specific race preparation.",
    whenToSeeACoach:
      "Use coaching or appropriately qualified clinical support when a substitution affects injury rehabilitation, return to running, race preparation or a high-load multisport week. A calculator cannot assess tissue tolerance, symptoms, recovery or whether the original session should be replaced at all.",
    examples: [
      {
        scenario: "Thirty-minute run to a moderate ride",
        inputs: ["Run: 30 minutes at 6 mph", "Ride: 12 mph category"],
        output: "The 9.3-MET run produces 279 MET-minutes. At 8.0 MET, the matched ride is about 35 minutes and 7.0 miles. This matches estimated energy cost only.",
      },
      {
        scenario: "One-hour ride to a steady run",
        inputs: ["Ride: 60 minutes at 14 mph", "Run: 6 mph"],
        output: "The 10.0-MET ride produces 600 MET-minutes. At 9.3 MET, the matched run is about 65 minutes and 6.5 miles. The impact and sport-specific load are not matched.",
      },
    ],
    faqs: [
      {
        question: "How many cycling miles equal one running mile?",
        answer: "There is no fixed evidence-backed ratio. Speed, terrain, wind, drafting and individual economy change the answer. Select a speed category on each side and this tool will calculate a disclosed MET-minute energy-cost match instead of applying one universal 1:3 rule.",
      },
      {
        question: "Does equal MET-minutes mean equal training stress?",
        answer: "No. MET-minutes estimate energy cost from population values. They do not capture impact, eccentric loading, sport-specific muscle recruitment, session distribution, recovery or the individual's response. The result is a planning reference, not a training-load identity.",
      },
      {
        question: "Can cycling replace a run during injury rehabilitation?",
        answer: "Cycling may preserve some aerobic work with less impact, but the calculator cannot decide whether replacement is clinically appropriate. It does not match tissue loading or assess symptoms. Follow the rehabilitation plan from an appropriately qualified professional.",
      },
      {
        question: "Why does the calculator ask for both speeds?",
        answer: "The 2024 Compendium assigns different MET values to different running and cycling speeds, and distance requires a speed to become time. Naming both categories prevents a slow recovery ride and a fast non-drafting ride from being treated as the same activity.",
      },
    ],
    related: [
      { label: "Heart-Rate Zone Calculator", href: "/tools/hr-zones", kind: "tool" },
      { label: "Cycling-to-running conversion guide", href: "/blog/running-cycling-conversion-calculator", kind: "article" },
      { label: "Running vs cycling fitness transfer", href: "/blog/running-vs-cycling-fitness-transfer", kind: "article" },
      { label: "Running for cyclists topic hub", href: "/topics/running-for-cyclists", kind: "topic" },
      { label: "Cycling for runners topic hub", href: "/topics/cycling-for-runners", kind: "topic" },
    ],
    webAppFeatures: [
      "Two-way running-to-cycling and cycling-to-running calculation",
      "Distance or duration inputs with kilometre and mile support",
      "Published 2024 Compendium activity codes and MET values",
      "Transparent MET-minute arithmetic",
      "Explicit performance, impact, recovery and adaptation limits",
    ],
    evidenceSources: [
      {
        name: "2024 Adult Compendium of Physical Activities",
        role: "Herrmann et al. · 1,114 activity codes and updated measured MET values",
        href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC10818145/",
      },
      {
        name: "Official 2024 Adult Compendium activity table",
        role: "Named running and bicycling codes used by calculator version 2.0",
        href: "https://pacompendium.com/wp-content/uploads/2024/03/1_2024-adult-compendium_1_2024.pdf",
      },
      {
        name: "Cross-training between running and cycling",
        role: "Menges et al., 2026 · systematic review and meta-analysis; n=7 randomized trials",
        href: "https://pubmed.ncbi.nlm.nih.gov/42267259/",
      },
      {
        name: "Physiological differences between cycling and running",
        role: "Millet et al., 2009 · review of modality-specific physiology",
        href: "https://pubmed.ncbi.nlm.nih.gov/19290675/",
      },
    ],
    dateModified: "2026-08-26",
    reviewedBy: "Anthony Walsh",
    reviewScope: "calculation method and source-boundary review",
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
  "strength-session-planner": {
    slug: "strength-session-planner",
    title: "Cycling Strength Session Planner",
    description:
      "Map a Monday-to-Sunday riding week and place one or two 30, 45 or 60-minute strength sessions while protecting key and long rides.",
    url: `${ROADMAN_BASE}/tools/strength-session-planner`,
    breadcrumbName: "Strength Session Planner",
    answerSummary:
      "Map each day's riding demand and available gym window. The planner ranks one or two strength placements, penalises the day before a key or long ride, prefers off-bike or easy-ride days and flags compromises. It places time only: exercises, sets, load and medical decisions remain outside the tool.",
    whatItDoes:
      "This tool solves a scheduling problem: where one or two strength sessions can sit in the cycling week with the least obvious conflict. It uses the week you enter rather than inventing a generic Monday-to-Sunday plan. Every recommendation includes the rules and compromises that produced it.\n\nThe planner is the tool-intent owner for placing strength around rides. The broad evidence and programming owner remains Roadman's strength-training guide; the forthcoming app owns ongoing strength, readiness and recovery delivery.",
    whoItsFor: [
      "Cyclists who already have bike sessions and need to find realistic gym windows",
      "Masters riders adding strength without sacrificing a key interval or long ride",
      "Time-crunched riders choosing between 30, 45 and 60-minute sessions",
      "Coaches and self-coached athletes who want visible scheduling rules rather than a black box",
    ],
    howItWorks:
      "Each available gym window receives a deterministic score. Off-bike and easy-ride days start higher; a window directly before a key or long ride receives a large penalty; a suitable day after a priority ride receives a small preference. When two sessions are requested, the planner prefers separation over back-to-back placement. A conflict is shown rather than hidden when the week has no clean option.",
    howToSteps: [
      { name: "Map the riding week", text: "For each day choose no ride, easy or recovery, endurance, key intervals or race-priority work, or a long or event-specific ride." },
      { name: "Add only real gym windows", text: "Choose no window, 30, 45 or 60 minutes for each day. On a ride day, the tool assumes the gym window comes after the ride." },
      { name: "Choose one or two sessions", text: "Ask for the smallest weekly dose you intend to complete. The planner will not stack an unplaced second session into the only available day." },
      { name: "Read the reasons and cautions", text: "Check which ride is being protected and whether the suggested day contains a compromise. Move the window when the next important ride loses quality." },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "The planner knows only the ride label and strength window entered for each day. It cannot see exercise selection, working-set volume, load, target RIR, lifting experience, injury history, travel, sleep or the true demand of a ride. The ranking rules are a transparent Roadman scheduling heuristic, not a research-validated prescription or proof that one sequence is optimal.",
    whenToSeeACoach:
      "Use a qualified coach or strength professional when every available window compromises priority riding, when strength repeatedly reduces bike-session quality, or when the programme must account for an event block, rehabilitation, osteoporosis risk, pain or another medical condition. Pain, injury and unexplained fatigue are not scheduling-tool problems.",
    examples: [
      {
        scenario: "Two sessions around Tuesday intervals and a Sunday long ride",
        inputs: ["Tuesday: key intervals", "Sunday: long ride", "Wednesday: easy ride + 45-minute gym window", "Friday: off-bike + 60-minute gym window"],
        output: "Wednesday and Friday are selected. Neither sits directly before the priority rides, and the sessions are not back to back.",
      },
      {
        scenario: "Only one compromised window",
        inputs: ["Tuesday: key intervals", "Monday: only available 45-minute gym window"],
        output: "Monday is shown because it is the only available window, but the planner labels the day-before-key-ride conflict instead of presenting it as a clean recommendation.",
      },
    ],
    faqs: [
      {
        question: "When should cyclists do strength training during the week?",
        answer: "Protect the rides most connected to the goal, then place strength where it does not repeatedly reduce their quality. Off-bike or easy-ride days can work, and some cyclists concentrate demanding work by riding first and lifting later. No single weekday or sequence is optimal for every rider.",
      },
      {
        question: "Should I lift before or after cycling on the same day?",
        answer: "Put the priority first. If the bike session is the key stimulus, complete it before strength. If developing maximal strength is the block's primary goal, lift fresh or separate the sessions. This planner assumes a ride-day gym window happens after the ride.",
      },
      {
        question: "How many strength sessions should a cyclist do each week?",
        answer: "The cyclist-only research includes programmes using one to three sessions per week, but it does not prove one universal optimum. One or two sessions can be a practical starting choice depending on experience, phase, riding load and recovery. This tool places the one or two sessions you request; it does not decide the dose for you.",
      },
      {
        question: "How long should a cycling strength session be?",
        answer: "Thirty, 45 and 60 minutes can all hold useful work when the exercise menu and set count match the window. More time is not automatically better. Choose the duration you can repeat without damaging the next important ride.",
      },
      {
        question: "Does the planner prescribe exercises or weights?",
        answer: "No. It places time around the riding week. Exercise choice, sets, load, RIR, progression and clinical constraints require more context. Roadman's strength guide covers the broad evidence; the upcoming app will connect placement with coach-reviewed cyclist-specific sessions.",
      },
    ],
    related: [
      { label: "Roadman strength and recovery app", href: "/app", kind: "product" },
      { label: "Strength Training for Cyclists: Evidence & Plan", href: "/blog/cycling-strength-training-guide", kind: "article" },
      { label: "Gym Exercises for Cyclists", href: "/blog/cycling-gym-exercises-best", kind: "article" },
      { label: "Training Readiness Check", href: "/tools/training-readiness", kind: "tool" },
      { label: "Cycling Strength & Conditioning Hub", href: "/topics/cycling-strength-conditioning", kind: "topic" },
    ],
    webAppFeatures: [
      "Monday-to-Sunday ride-context mapping",
      "One- or two-session placement",
      "30, 45 and 60-minute gym windows",
      "Key-ride and long-ride conflict detection",
      "Visible deterministic scoring rules and compromise warnings",
      "No signup required",
    ],
    evidenceSources: [
      { name: "Llanos-Lagos et al. 2025", role: "cyclist-only heavy-strength systematic review and implementation limits", href: "https://pubmed.ncbi.nlm.nih.gov/40632222/" },
      { name: "Petré et al. 2021", role: "concurrent endurance and resistance training outcomes in trained athletes", href: "https://pubmed.ncbi.nlm.nih.gov/33751469/" },
      { name: "Murlasits et al. 2018", role: "same-session sequence meta-analysis and priority-order boundary", href: "https://pubmed.ncbi.nlm.nih.gov/28783467/" },
    ],
    dateModified: "2026-08-28",
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

  "gear-ratio": {
    slug: "gear-ratio",
    title: "Bike Gear Ratio Calculator",
    description:
      "Compare exact chainring and cassette combinations by ratio, gear inches, development, speed at cadence, total range and overlap.",
    url: `${ROADMAN_BASE}/tools/gear-ratio`,
    breadcrumbName: "Bike Gear Ratio Calculator",
    answerSummary:
      "Choose your chainrings, exact cassette sprockets and wheel rollout. The calculator divides front teeth by rear teeth, then uses wheel circumference to show gear inches, metres travelled per pedal revolution and speed at each cadence. It compares gearing geometry; it does not certify derailleur, chain, freehub or frame compatibility.",
    whatItDoes:
      "This is the canonical Roadman owner for bike gear ratio calculator intent. It maps every selected chainring-and-cog pair, identifies the easiest and hardest combinations, and makes duplicated or widely spaced gears visible before you buy a cassette. The companion gear-ratio guide owns explanatory intent and worked training examples.\n\nPreset tooth sequences are tied to named Shimano and SRAM configurations. You can enter any cassette manually, and a custom loaded-rollout input prevents a nominal tyre label from pretending to be an exact circumference.",
    whoItsFor: [
      "Road, gravel and sportive riders comparing cassette or chainring options",
      "Cyclists checking climbing gears before a hilly event or training camp",
      "Riders who want speed-at-cadence, development and gear inches from one input",
      "Mechanics and coaches who need a transparent table instead of a black-box recommendation",
    ],
    howItWorks:
      "For each combination, raw gear ratio is chainring teeth divided by rear-cog teeth. Development is that ratio multiplied by wheel circumference in metres. Speed is development multiplied by cadence and 60, then divided by 1,000 for kilometres per hour. Gear inches use the same ratio multiplied by wheel diameter in inches. The calculator does not model tyre slip or drivetrain losses.",
    howToSteps: [
      {
        name: "Enter the drivetrain you actually have",
        text: "Choose a named preset only when its tooth sequence matches your cassette. Otherwise enter every rear cog manually and choose the matching chainring set.",
      },
      {
        name: "Set wheel circumference",
        text: "Use a nominal tyre preset for a quick comparison or measure one loaded wheel revolution and enter the millimetres as a custom rollout for the most accurate speed and development.",
      },
      {
        name: "Calculate every combination",
        text: "Read the easiest and hardest gears, then open individual cells to compare development and speed across practical cadences.",
      },
      {
        name: "Check compatibility separately",
        text: "Confirm maximum sprocket, total capacity, freehub body, chain length and approved chainring combinations in the exact component manuals before buying parts.",
      },
    ],
    howToTotalTime: "PT3M",
    limitations:
      "Wheel presets are nominal: rim width, fitted tyre width, pressure, load and tread change the real rollout. The output assumes no tyre slip and reports kinematics, not the power needed for a gradient. A matching numerical ratio does not prove a cassette will work with a derailleur, freehub, chain, shifter or frame. Manufacturer compatibility and installation documents override this calculator.",
    whenToSeeACoach:
      "Ask a qualified mechanic to check component compatibility before a cassette, chainring or drivetrain change. Use a coach when the decision depends on your sustainable power, cadence under fatigue, event gradients or pacing rather than ratios alone. Persistent knee pain needs an appropriate clinical or bike-fit assessment, not a lower-gear guess from a calculator.",
    examples: [
      {
        scenario: "Compact road bike: 50/34, 11-28, 700x25c",
        inputs: ["Wheel rollout: 2,105 mm", "Easiest: 34/28", "Hardest: 50/11"],
        output: "34/28 is a 1.21 ratio and 2.56 m development, or 13.8 km/h at 90 rpm. 50/11 is a 4.55 ratio and 9.57 m development, or 51.7 km/h at 90 rpm.",
      },
      {
        scenario: "1x gravel bike: 40T, SRAM XPLR 10-44, 700x32c",
        inputs: ["Wheel rollout: 2,155 mm", "Easiest: 40/44", "Hardest: 40/10"],
        output: "40/44 is a 0.91 ratio and 1.96 m development, or 9.4 km/h at 80 rpm. 40/10 is a 4.00 ratio and 8.62 m development, or 46.5 km/h at 90 rpm.",
      },
    ],
    faqs: [
      {
        question: "How do you calculate a bike gear ratio?",
        answer: "Divide the number of teeth on the front chainring by the number on the selected rear cog. A 50-tooth chainring with a 25-tooth cog is 50 / 25 = 2.00. The rear wheel turns twice for each crank revolution, before accounting for wheel circumference.",
      },
      {
        question: "What is a good gear ratio for climbing?",
        answer: "There is no universal climbing ratio. Lower numbers are easier, but the right lowest gear depends on gradient, total system mass, sustainable power and the cadence you can hold when tired. Compare the calculator output with your real climbing files and event route rather than treating 1:1 as a rule.",
      },
      {
        question: "What is the difference between gear ratio, gear inches and development?",
        answer: "Gear ratio compares chainring teeth with rear-cog teeth. Gear inches applies that ratio to wheel diameter. Development applies it to wheel circumference and reports metres travelled per crank revolution. Development connects most directly to speed at a chosen cadence.",
      },
      {
        question: "How accurate are the wheel-size presets?",
        answer: "They are nominal starting values. Actual circumference changes with rim width, tyre casing, fitted width, pressure and rider load. For the most accurate result, mark the tyre, complete one loaded wheel revolution on level ground, measure the distance in millimetres and use custom rollout.",
      },
      {
        question: "Does a lower gear ratio mean easier pedalling?",
        answer: "At the same wheel speed, a lower ratio requires a higher cadence and less crank torque for the same rear-wheel torque, so it generally feels easier to turn. It does not reduce the external power required to move the rider up a hill at the same speed.",
      },
      {
        question: "Will the calculator tell me whether a cassette fits my bike?",
        answer: "No. It compares tooth counts only. Cassette and chainring compatibility also depends on freehub standard, number of speeds, shifter indexing, derailleur maximum sprocket and total capacity, chain length, chainline and frame clearance. Check the exact component manuals or ask a qualified mechanic.",
      },
    ],
    related: [
      { label: "Gear ratios explained", href: "/blog/gear-ratio-cycling-complete-guide", kind: "article" },
      { label: "Cycling gearing and cassette guide", href: "/blog/cycling-gearing-explained-chainrings-cassettes", kind: "article" },
      { label: "What gear ratio do I need for climbing?", href: "/answers/what-gear-ratio-for-climbing", kind: "article" },
      { label: "Cadence calculator", href: "/tools/cadence", kind: "tool" },
      { label: "Climb-time calculator", href: "/tools/climb-time", kind: "tool" },
      { label: "Power-to-speed calculator", href: "/tools/power-speed", kind: "tool" },
    ],
    webAppFeatures: [
      "Exact chainring-by-cog ratio table",
      "Gear inches and metres of development",
      "Speed across five cadence values",
      "Easiest and hardest gear comparison",
      "Gear-overlap visualisation for multiple chainrings",
      "Verified Shimano and SRAM cassette presets",
      "Manual cassette and custom wheel-rollout inputs",
    ],
    evidenceSources: [
      {
        name: "Garmin wheel size and circumference table",
        role: "nominal 700c rollout values and manual-measurement boundary",
        href: "https://www8.garmin.com/manuals-apac/webhelp/venusq/EN-SG/GUID-DB7E720A-4CA0-4C30-AA2A-28DEC5060416-3977.html",
      },
      {
        name: "Wahoo tyre-size and wheel-circumference chart",
        role: "loaded-rollout measurement guidance and sources of circumference variation",
        href: "https://support.wahoofitness.com/hc/en-us/articles/26243161988882-Tire-Size-Wheel-Circumference-Chart",
      },
      {
        name: "Shimano CS-R8000 cassette specification",
        role: "11-speed 11-25, 11-28, 11-30 and 11-32 sprocket sequences",
        href: "https://si.shimano.com/en/pdfs/ev/CS-R8000-4257/EV-CS-R8000-4257.pdf",
      },
      {
        name: "Shimano CS-R7100 cassette specification",
        role: "12-speed 11-34 sprocket sequence",
        href: "https://si.shimano.com/en/pdfs/ev/CS-R7100-4922/EV-CS-R7100-4922A.pdf",
      },
      {
        name: "Shimano CS-HG710 dealer manual",
        role: "12-speed 11-36 sprocket sequence",
        href: "https://si.shimano.com/en/pdfs/dm/RACS010/DM-RACS010-02-ENG.pdf",
      },
      {
        name: "SRAM Rival XG-1250 cassette",
        role: "12-speed 10-36 sprocket sequence and XDR boundary",
        href: "https://www.sram.com/en/sram/models/cs-xg-1250-d1",
      },
      {
        name: "SRAM PG-1130 cassette",
        role: "11-speed 11-42 sprocket sequence and drivetrain boundary",
        href: "https://www.sram.com/en/sram/models/CS-PG-1130-A1",
      },
      {
        name: "SRAM XPLR XG-1251 cassette",
        role: "12-speed 10-44 sprocket sequence",
        href: "https://www.sram.com/en/sram/models/cs-xg-1251-d1",
      },
      {
        name: "Sheldon Brown gain-ratio method",
        role: "original gain-ratio definition and wheel/crank geometry",
        href: "https://www.sheldonbrown.com/gain.html",
      },
    ],
    dateModified: "2026-08-31",
    reviewedBy: "Anthony Walsh",
    reviewScope: "calculator method, preset tooth sequence and source-to-claim review",
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
