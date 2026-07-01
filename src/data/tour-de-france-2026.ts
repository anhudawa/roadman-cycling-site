/**
 * Tour de France 2026 — stage fixture.
 *
 * Single source of truth for the date-driven Tour overlay (countdown,
 * live, and fade-out modes). Route data — towns, distances, stage types,
 * dates, summit finishes, TT locations — is cross-verified against
 * letour.fr, Domestique, Cyclingnews, ProCyclingStats and cyclingstage
 * (route announced October 2025).
 *
 * Honesty policy, mirrored from src/data/canonical-entities.ts:
 *   - Per-climb HC/Cat categories are only set where confirmed by a
 *     source or where the climb is iconic enough to be certain
 *     (Tourmalet, Galibier, Croix de Fer, Alpe d'Huez). Where the
 *     official roadbook label was not retrievable, `category` is left
 *     undefined rather than guessed.
 *   - A handful of distances/elevations that sources rounded differently
 *     are noted inline; the most common figure is used.
 *
 * The `roadmanTake`, `expertAngle` and `related` fields are editorial —
 * they connect each stage to Roadman training principles and existing
 * site content. Expert angles describe a guest's known, on-the-record
 * methodology applied to the stage; they are NOT fabricated quotes.
 */

export type StageType =
  | "flat"
  | "hilly"
  | "mountain"
  | "individual-tt"
  | "team-tt";

export type ClimbCategory = "HC" | "1" | "2" | "3" | "4";

export interface Climb {
  name: string;
  /** Official category where confirmed; omitted when unverified. */
  category?: ClimbCategory;
  lengthKm?: number;
  gradientPct?: number;
  /** Summit altitude in metres, where notable. */
  summitM?: number;
}

export interface RelatedLink {
  label: string;
  href: string;
}

export interface Stage {
  number: number;
  /** ISO date (race-local). */
  date: string;
  dayOfWeek: string;
  start: string;
  finish: string;
  distanceKm: number;
  type: StageType;
  /** Total climbing in metres, where published. */
  elevationGainM?: number;
  climbs: Climb[];
  summitFinish: boolean;
  sprintFriendly: boolean;
  /** Mountain range, where the stage sits in one. */
  range?: string;
  /** One-line factual stage summary. */
  description: string;
  /** Tactical preview — which riders the stage suits and the decisive moment to watch. */
  tactical: { whoBenefits: string; whatToWatch: string };
  /** Short pre-race prediction / talking point. */
  prediction: string;
  /** How Roadman training principles apply — the rider's takeaway. */
  roadmanTake: string;
  /** A guest's known methodology applied to this stage (not a quote). */
  expertAngle: { expert: string; angle: string };
  /** Existing Roadman content this stage connects to. */
  related: RelatedLink[];
}

export const TOUR_TYPE_LABEL: Record<StageType, string> = {
  flat: "Flat",
  hilly: "Hilly",
  mountain: "Mountain",
  "individual-tt": "Individual Time Trial",
  "team-tt": "Team Time Trial",
};

/** Short label for tight UI (badges, banners). */
export const TOUR_TYPE_SHORT: Record<StageType, string> = {
  flat: "Flat",
  hilly: "Hilly",
  mountain: "Mountain",
  "individual-tt": "ITT",
  "team-tt": "TTT",
};

export const TOUR_META = {
  year: 2026,
  edition: "113th",
  startDate: "2026-07-04",
  endDate: "2026-07-26",
  grandDepart: "Barcelona",
  finish: "Paris — Champs-Élysées",
  restDays: ["2026-07-13", "2026-07-20"],
  totalDistanceKm: 3333,
  totalClimbingM: 54450,
  stageCount: 21,
  highestPoint: { name: "Col du Galibier", altitudeM: 2642, stage: 20 },
  ranges: ["Pyrenees", "Massif Central", "Vosges", "Jura", "Alps"],
} as const;

export const TOUR_STAGES: Stage[] = [
  {
    number: 1,
    date: "2026-07-04",
    dayOfWeek: "Saturday",
    start: "Barcelona",
    finish: "Barcelona",
    distanceKm: 19.7,
    type: "team-tt",
    climbs: [{ name: "Côte de Montjuïc", lengthKm: 1.1, gradientPct: 5.1 }],
    summitFinish: false,
    sprintFriendly: false,
    description:
      "The most southerly Grand Départ in race history opens with a team time trial around Barcelona — the first TTT to start a Tour since 1971. Seconds lost here follow GC riders for three weeks.",
    tactical: {
      whoBenefits:
        "The deep GC squads — UAE, Visma–Lease a Bike, Red Bull–Bora–Hansgrohe — whose eight riders can hold a brutal pace as one unit. A leader with a strong team takes time before he has pedalled in anger.",
      whatToWatch:
        "The 1.1km Montjuïc ramp. A team that hits it together and regroups over the top keeps its line intact; one that splits loses the riders it needs to drive the flat run home.",
    },
    prediction:
      "Expect 30 to 60 seconds between the best and weakest GC teams by the finish — a deficit some contenders will spend three weeks trying to claw back. The strongest squad puts its leader in the first yellow jersey.",
    roadmanTake:
      "A TTT is the purest test of pacing discipline and turn-taking — eight riders holding one effort, nobody blowing the line. The same maths runs your club's chaingang: smooth, even pulls beat hero turns that shred the group. Hold a steady power, rotate clean, and the average speed takes care of itself.",
    expertAngle: {
      expert: "Dan Bigham",
      angle:
        "The former Hour Record holder's whole case is that marginal aero and pacing decisions compound — start controlled, never spike over threshold into a corner, and let the back of the line recover before they rotate through.",
    },
    related: [
      { label: "Race Predictor — model your own TT", href: "/predict" },
      { label: "Against the Clock — the TT mindset", href: "/against-the-clock" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
  },
  {
    number: 2,
    date: "2026-07-05",
    dayOfWeek: "Sunday",
    start: "Tarragona",
    finish: "Barcelona",
    distanceKm: 168.5,
    type: "hilly",
    elevationGainM: 2500,
    climbs: [
      { name: "Côte du Château de Montjuïc", lengthKm: 1.6, gradientPct: 9.3 },
      { name: "Côte du Stade Olympique", lengthKm: 0.7, gradientPct: 7 },
    ],
    summitFinish: false,
    sprintFriendly: false,
    range: "Catalonia",
    description:
      "A punchy finishing circuit over Montjuïc decides the first road stage. Too steep for the pure sprinters, this is one for the puncheurs and a reduced bunch fighting for the yellow jersey.",
    tactical: {
      whoBenefits:
        "Puncheurs and the GC riders who can sprint uphill. The double ascent of Montjuïc is too steep for the pure fast men and too short for the climbers.",
      whatToWatch:
        "Positioning into the final kick and the bonus seconds on the line. With the race this young, a handful of seconds and the yellow jersey are worth a real fight.",
    },
    prediction:
      "A reduced bunch of thirty or so contests it. A Mathieu van der Poel or a fast-finishing GC leader is the profile that wins here — and takes yellow with the time bonus.",
    roadmanTake:
      "Repeated short, sharp climbs into a finish are a repeatability problem, not a one-effort problem. Riders who can go deep, recover, and go again win these days. That capacity is built with over-unders and short VO2 work — not with endless steady miles.",
    expertAngle: {
      expert: "Professor Seiler",
      angle:
        "The polarised-training pioneer would point at the recovery between efforts: the rider who spent the off-season building an aerobic base clears lactate fastest between each Montjuïc kick and is still there at the line.",
    },
    related: [
      { label: "VO2max intervals that build repeatability", href: "/blog/cycling-vo2max-intervals" },
      { label: "The grey-zone trap (80/20 training)", href: "/blog/80-20-cycling-training-the-grey-zone-trap" },
      { label: "Polarised vs sweet spot", href: "/blog/polarised-vs-sweet-spot-training" },
    ],
  },
  {
    number: 3,
    date: "2026-07-06",
    dayOfWeek: "Monday",
    start: "Granollers",
    finish: "Les Angles",
    distanceKm: 195.9,
    type: "mountain",
    elevationGainM: 4000,
    range: "Pyrenees",
    climbs: [
      { name: "Collada de Toses", lengthKm: 9.3, gradientPct: 6.5 },
      { name: "Col du Calvaire", lengthKm: 14.9, gradientPct: 4.1, summitM: 1836 },
      { name: "Les Angles", lengthKm: 1.7, gradientPct: 6.5 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "The race crosses into the Pyrenees for its first summit finish at the ski station of Les Angles. The first real GC selection of the Tour — three weeks of climbing legs start here.",
    tactical: {
      whoBenefits:
        "The pure climbers and the GC favourites. The first summit finish of the race is the first honest look at who has the legs.",
      whatToWatch:
        "Whether the favourites mark each other into a stalemate or one of them tests the water on the 14km Col du Calvaire. Early-week nerves and fresh legs make for cagey racing.",
    },
    prediction:
      "The first real GC time gaps of the Tour, even if only seconds. Whoever among Pogačar, Vingegaard and Evenepoel shows their hand here sets the tone for the rest of the Pyrenees.",
    roadmanTake:
      "First mountain summit of any race exposes who paced the opening week and who burned matches chasing crosswinds. Climb to your number, not to the wheel in front. A power target on a 14km climb is the difference between a strong finish and detonating with 3km to go.",
    expertAngle: {
      expert: "Stephen Seiler",
      angle:
        "Hold the long climbs in a controlled threshold zone and save the truly hard minutes for the final ramp — the classic polarised principle of not living in the grey zone, applied at race pace.",
    },
    related: [
      { label: "Pacing strategy for long climbs", href: "/blog/cycling-pacing-strategy-long-climbs" },
      { label: "Climb faster — five fixable reasons", href: "/blog/climb-faster-cycling-five-fixable-reasons" },
      { label: "VO2max training hub", href: "/masters/vo2max" },
    ],
  },
  {
    number: 4,
    date: "2026-07-07",
    dayOfWeek: "Tuesday",
    start: "Carcassonne",
    finish: "Foix",
    distanceKm: 181.9,
    type: "hilly",
    range: "Pyrenees",
    climbs: [
      { name: "Col de Coudons", lengthKm: 10.5, gradientPct: 5.5 },
      { name: "Col de Montségur", lengthKm: 6.9, gradientPct: 6.6 },
      { name: "Col du Paradis", lengthKm: 6.4, gradientPct: 4.1 },
    ],
    summitFinish: false,
    sprintFriendly: false,
    description:
      "A relentless, lumpy day through the Pyrenean foothills to Foix. Five categorised climbs with a downhill run to the line make this prime territory for a breakaway that the GC teams are happy to let go.",
    tactical: {
      whoBenefits:
        "Breakaway specialists and strong descenders. Five categorised climbs and a downhill run to the line is a day the GC teams are happy to give away.",
      whatToWatch:
        "The fight to make the break — it will be ferocious — and whether a descender can hold a gap off the final climb all the way to Foix.",
    },
    prediction:
      "The break goes the distance. A rider who can climb with the leaders and descend better than them wins alone or from a small group, while the GC stays frozen.",
    roadmanTake:
      "Breakaway days are won on durability — the ability to keep producing power after four hours and several thousand metres of climbing. That is built by training fatigue resistance, not just peak FTP. Long rides with efforts late, when you are already tired, are what make the difference.",
    expertAngle: {
      expert: "Lachlan Morton",
      angle:
        "The ultra-distance specialist's edge is fuelling and pacing a long day so the tank is not empty when it matters — eat early and often, and the legs are still there over the last climb.",
    },
    related: [
      { label: "Carbohydrate per hour for cyclists", href: "/blog/carbohydrate-per-hour-cyclists" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { label: "Training plans hub", href: "/topics/cycling-training-plans" },
    ],
  },
  {
    number: 5,
    date: "2026-07-08",
    dayOfWeek: "Wednesday",
    start: "Lannemezan",
    finish: "Pau",
    distanceKm: 158.3,
    type: "flat",
    sprintFriendly: true,
    summitFinish: false,
    climbs: [],
    description:
      "A flat run into Pau, one of the Tour's most-visited towns. After the Pyrenean opening, the sprinters' teams finally get a day to control the race and set up a bunch finish.",
    tactical: {
      whoBenefits:
        "The pure sprinters and their lead-out trains, finally with a day to control after the Pyrenean opening.",
      whatToWatch:
        "Crosswinds on the exposed run into Pau. If a GC team lights up an echelon, the sprint becomes the least of anyone's worries.",
    },
    prediction:
      "A bunch sprint, barring wind. The fastest man with the best train — a Jasper Philipsen or a Jonathan Milan — settles the first clean sprint of the Tour.",
    roadmanTake:
      "Sprint stages look easy on TV and are anything but — it is five hours of surging in the bunch, then a 1,200-watt effort at the end. The lesson for amateurs is positioning and timing: the rider who reads the last 3km and saves their effort beats the one who is stronger but launches too early.",
    expertAngle: {
      expert: "André Greipel",
      angle:
        "22 Grand Tour stage wins came from holding position and trusting the lead-out — the sprint is decided in the final corners, not the final metres, so commit to a wheel and do not panic.",
    },
    related: [
      { label: "The sprint captain's code (Greipel)", href: "/blog/andre-greipel-sprint-captains-code" },
      { label: "Sprint power vs winning power", href: "/blog/cory-williams-sprint-power-vs-winning-power" },
      { label: "Group ride etiquette", href: "/blog/cycling-group-ride-etiquette-guide" },
    ],
  },
  {
    number: 6,
    date: "2026-07-09",
    dayOfWeek: "Thursday",
    start: "Pau",
    finish: "Gavarnie-Gèdre",
    distanceKm: 186.2,
    type: "mountain",
    range: "Pyrenees",
    climbs: [
      { name: "Col d'Aspin", category: "1", lengthKm: 12, gradientPct: 6.5, summitM: 1490 },
      { name: "Col du Tourmalet", category: "HC", lengthKm: 17, gradientPct: 7.3, summitM: 2115 },
      { name: "Montée de Gavarnie-Gèdre", category: "2", lengthKm: 18.7, gradientPct: 3.8 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "The queen stage of the Pyrenees. Col d'Aspin then the mighty Tourmalet — the most-climbed pass in Tour history — before a long drag to the new finish at Gavarnie-Gèdre. A genuine GC battleground.",
    tactical: {
      whoBenefits:
        "The GC men, though the long, shallow 3.8% drag to the line suits a diesel over a pure explosive climber.",
      whatToWatch:
        "Whether a favourite attacks on the Tourmalet itself or waits — the gentle final climb punishes anyone who goes too early and blows.",
    },
    prediction:
      "The biggest names in the race light up the Tourmalet, but the soft finish can neutralise a small gap. A strong break could survive if the favourites stare each other down.",
    roadmanTake:
      "Back-to-back HC climbs are a fuelling stage first and a power stage second. Run out of carbohydrate on the Tourmalet and no amount of fitness saves you. The protocol that matters here is carb-loading the days before and taking on 80–120g of carbs per hour in the saddle.",
    expertAngle: {
      expert: "Hannah Grant",
      angle:
        "The former pro-team chef's whole job was keeping riders fuelled across mountain stages — real food early, then a steady stream of carbohydrate, so the rider never hits the wall on the final climb.",
    },
    related: [
      { label: "Carb-loading protocol for race week", href: "/blog/cycling-carb-loading-protocol-race-week" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { label: "Pacing strategy for long climbs", href: "/blog/cycling-pacing-strategy-long-climbs" },
    ],
  },
  {
    number: 7,
    date: "2026-07-10",
    dayOfWeek: "Friday",
    start: "Hagetmau",
    finish: "Bordeaux",
    distanceKm: 175.1,
    type: "flat",
    sprintFriendly: true,
    summitFinish: false,
    climbs: [],
    description:
      "A flat, fast run north to Bordeaux — a city that has hosted more bunch sprints than almost anywhere on the route. The fast men get their second clear chance of the Tour.",
    tactical: {
      whoBenefits:
        "The sprinters. Bordeaux has hosted more bunch finishes than almost anywhere on the route, and for good reason.",
      whatToWatch:
        "A nervous, fast run-in and the lead-out trains jockeying for the final kilometre. Crash risk is high while everyone still believes they can win.",
    },
    prediction:
      "A straightforward bunch sprint. The form sprinter of the first week confirms it on a finish that rarely springs a surprise.",
    roadmanTake:
      "Flat stages are where recovery between hard days is won or lost. For the amateur chasing a multi-day event or a big sportive, the skill is riding easy genuinely easy — true zone 2, not grey-zone tempo that quietly digs a hole you pay for tomorrow.",
    expertAngle: {
      expert: "Stephen Seiler",
      angle:
        "The discipline of keeping easy days easy is the foundation of the polarised model — the bunch soft-pedals for hours precisely so the hard efforts later in the race can be truly hard.",
    },
    related: [
      { label: "The grey-zone trap", href: "/blog/80-20-cycling-training-the-grey-zone-trap" },
      { label: "Active recovery rides done right", href: "/blog/cycling-active-recovery-rides-guide" },
      { label: "Heart Rate Zone Calculator", href: "/tools/hr-zones" },
    ],
  },
  {
    number: 8,
    date: "2026-07-11",
    dayOfWeek: "Saturday",
    start: "Périgueux",
    finish: "Bergerac",
    distanceKm: 180.4,
    type: "flat",
    sprintFriendly: true,
    summitFinish: false,
    climbs: [],
    range: "Dordogne",
    description:
      "Through the vineyards of the Dordogne to Bergerac. Another stage for the sprinters, though a nervous, technical finale can catch out a lead-out train that mistimes its move.",
    tactical: {
      whoBenefits:
        "Sprinters with bike-handling and a sharp lead-out — the technical finale rewards skill as much as raw speed.",
      whatToWatch:
        "The timing of the lead-out through the final corners. A train that commits early into the technical run-in can be swamped; one that mistimes it leaves its sprinter exposed.",
    },
    prediction:
      "Another sprint, but a messier one. Expect a different winner from Bordeaux as the trains get the finale wrong and an opportunist pounces.",
    roadmanTake:
      "A technical finish rewards bike handling, not just watts. Cornering at speed in a bunch is a skill you practise — relax the upper body, look through the corner, and brake before it, not in it. The fittest rider does not win if they cannot hold a wheel through the last roundabout.",
    expertAngle: {
      expert: "Alex Dowsett",
      angle:
        "The TT specialist talks constantly about staying relaxed and smooth under pressure — tension wastes energy and slows your reactions, on a TT bike or in a sprint lead-out.",
    },
    related: [
      { label: "What amateurs learn from the pros (Dowsett)", href: "/blog/alex-dowsett-pro-cycling-lessons-amateur" },
      { label: "Group ride etiquette", href: "/blog/cycling-group-ride-etiquette-guide" },
      { label: "Le Métier — the craft of riding", href: "/topics" },
    ],
  },
  {
    number: 9,
    date: "2026-07-12",
    dayOfWeek: "Sunday",
    start: "Malemort",
    finish: "Ussel",
    distanceKm: 185.5,
    type: "hilly",
    range: "Massif Central",
    climbs: [
      { name: "Suc au May", lengthKm: 3.8, gradientPct: 7.7 },
      { name: "Mont Bessou", lengthKm: 4.2, gradientPct: 5.5 },
      { name: "Côte des Gardes", lengthKm: 2.2, gradientPct: 4.8 },
    ],
    summitFinish: false,
    sprintFriendly: false,
    description:
      "Into the Massif Central on a constantly rolling day to Ussel. The last stage before the first rest day — tired legs and a hilly profile make it a classic breakaway opportunity.",
    tactical: {
      whoBenefits:
        "The breakaway. A rolling Massif Central day before the first rest day is tailor-made for a move the GC teams won't chase.",
      whatToWatch:
        "A long, brutal fight to form the break on tired legs. Once it sticks, the question is which rider has saved the most for the closing climbs.",
    },
    prediction:
      "The break wins, and the winning move is large and strong. A hilly-classics rider or a GC outsider given freedom takes the biggest result of their season.",
    roadmanTake:
      "Rolling terrain punishes riders who only train steady. The repeated accelerations out of every dip are anaerobic efforts stacked on an aerobic day. Sweet-spot and over-under work prepares you for exactly this — staying with the group when the road keeps kicking up.",
    expertAngle: {
      expert: "Dan Lorang",
      angle:
        "The Red Bull–Bora–Hansgrohe head of performance builds riders who can repeat hard efforts deep into a stage — periodised training that layers intensity on top of a big aerobic engine, not random hard days.",
    },
    related: [
      { label: "Cycling interval training for beginners", href: "/blog/cycling-interval-training-beginners" },
      { label: "Training plans hub", href: "/topics/cycling-training-plans" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
  },
  {
    number: 10,
    date: "2026-07-14",
    dayOfWeek: "Tuesday",
    start: "Aurillac",
    finish: "Le Lioran",
    distanceKm: 166.6,
    type: "mountain",
    range: "Massif Central",
    elevationGainM: 3700,
    climbs: [
      { name: "Pas de Peyrol (Puy Mary)", lengthKm: 7.8, gradientPct: 6, summitM: 1589 },
      { name: "Col de Pertus", lengthKm: 4.4, gradientPct: 8.5 },
      { name: "Col de Prat de Bouc", lengthKm: 3.2, gradientPct: 5.8 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "Bastille Day in the Massif Central, with the French desperate for a home win. A brutally lumpy stage over the volcanic Puy Mary and a string of short, steep climbs to the summit finish at Le Lioran.",
    tactical: {
      whoBenefits:
        "Punchy climbers and French riders desperate for a home win on July 14. The string of short, steep walls suits an explosive attacker over a tempo grinder.",
      whatToWatch:
        "An ambush. The repeated double-digit ramps over the Puy Mary and into Le Lioran are perfect for an attack from distance rather than a waiting game.",
    },
    prediction:
      "Aggressive, unpredictable racing and a French rider throwing everything at it. Whether the GC favourites let the break go or fancy the bonus seconds decides if it is won from the front or behind.",
    roadmanTake:
      "Short steep climbs — 8% and up — are a strength-and-power story, not just an aerobic one. Riders who do off-the-bike strength work and low-cadence torque intervals hold the wheel when the road pitches to double figures. This is where the gym pays its dividend on the road.",
    expertAngle: {
      expert: "Dan Lorang",
      angle:
        "Strength on and off the bike is a recurring theme — heavy lifting in the base phase builds the force you need on a 10% ramp, then converts to durable climbing power in the season.",
    },
    related: [
      { label: "Strength & conditioning hub", href: "/topics/cycling-strength-conditioning" },
      { label: "Climb faster — five fixable reasons", href: "/blog/climb-faster-cycling-five-fixable-reasons" },
      { label: "Stop getting dropped on climbs", href: "/blog/cycling-climbing-tips-stop-getting-dropped" },
    ],
  },
  {
    number: 11,
    date: "2026-07-15",
    dayOfWeek: "Wednesday",
    start: "Vichy",
    finish: "Nevers",
    distanceKm: 161.3,
    type: "flat",
    sprintFriendly: true,
    summitFinish: false,
    climbs: [{ name: "Côte de Billy-Chevannes", lengthKm: 1.5, gradientPct: 6 }],
    description:
      "A transitional flat stage out of the spa town of Vichy to Nevers. The sprinters who survived the mountains take their chance before the race tilts east toward the Jura and Vosges.",
    tactical: {
      whoBenefits:
        "The sprinters who survived the Pyrenees and the Massif Central, on their first clear chance since the mountains thinned the fast men out.",
      whatToWatch:
        "Whether the surviving sprinters' teams still have the bodies to control a break, a day after the Bastille Day climbs and with heavy legs all round.",
    },
    prediction:
      "A bunch sprint, but not a certain one. The fast men's teams should reel in any move, though legs this deep into the race make the chase less tidy than it looks.",
    roadmanTake:
      "Coming off a rest day and a mountain block, the body is carrying deep fatigue. Pros use these flatter days to top up glycogen and let the legs come back. The amateur lesson: after a hard training block, an easy week is not lost fitness — it is when the adaptation actually lands.",
    expertAngle: {
      expert: "Joe Friel",
      angle:
        "The author of The Cyclist's Training Bible has long argued that fitness is built in recovery — the stimulus is the hard day, but the gain comes when you back off and let the body absorb it.",
    },
    related: [
      { label: "What a recovery week actually looks like", href: "/blog/cycling-recovery-week-what-to-actually-do" },
      { label: "Recovery hub", href: "/topics/cycling-recovery" },
      { label: "Cycling after 40 — recovery report", href: "/blog/cycling-after-40-recovery-report-2026" },
    ],
  },
  {
    number: 12,
    date: "2026-07-16",
    dayOfWeek: "Thursday",
    start: "Circuit de Nevers Magny-Cours",
    finish: "Chalon-sur-Saône",
    distanceKm: 179.1,
    type: "flat",
    sprintFriendly: true,
    summitFinish: false,
    climbs: [{ name: "Côte de Montagny-lès-Buxy", lengthKm: 2.6, gradientPct: 3.9 }],
    description:
      "A start on the Magny-Cours motor-racing circuit and a flat run to Chalon-sur-Saône. The last realistic bunch sprint before the Jura and Vosges reshape the race.",
    tactical: {
      whoBenefits:
        "The pure sprinters — realistically their last clean chance before the Jura and Vosges take over the race.",
      whatToWatch:
        "Desperation in the lead-outs, knowing the chances are running out, and any crosswind that could split the bunch late.",
    },
    prediction:
      "A bunch sprint with everything on it for the fast men. Expect the strongest lead-out train of the race to deliver its sprinter and close the door on the flatland chapter.",
    roadmanTake:
      "The peloton averages over 45km/h on a day like this for one reason: drafting. Riding in the wheels costs up to 30% less power. For the amateur, that is the single biggest free speed gain there is — learn to sit in, share the work, and you ride faster for less.",
    expertAngle: {
      expert: "Dan Bigham",
      angle:
        "An aerodynamics obsessive, his point is that on flat ground air resistance is almost the entire battle — position and shelter matter more than raw fitness when the road is flat and fast.",
    },
    related: [
      { label: "Group ride etiquette", href: "/blog/cycling-group-ride-etiquette-guide" },
      { label: "Race Predictor", href: "/predict" },
      { label: "Tyre Pressure Calculator", href: "/tools/tyre-pressure" },
    ],
  },
  {
    number: 13,
    date: "2026-07-17",
    dayOfWeek: "Friday",
    start: "Dole",
    finish: "Belfort",
    distanceKm: 205.8,
    type: "hilly",
    range: "Jura",
    climbs: [
      { name: "Ballon d'Alsace", lengthKm: 8.7, gradientPct: 6.9 },
      { name: "Col des Croix", lengthKm: 5.4, gradientPct: 4.9 },
    ],
    summitFinish: false,
    sprintFriendly: false,
    description:
      "The longest stage of the Tour at 205.8km, climbing out of the Jura toward the Ballon d'Alsace — one of the race's historic passes — before dropping to Belfort. A breakaway day, but a hard one.",
    tactical: {
      whoBenefits:
        "The breakaway, and a hard rider within it. At 205.8km over the Ballon d'Alsace, this is a day of attrition that thins any move to its strongest few.",
      whatToWatch:
        "The selection on the Ballon d'Alsace. The climb comes far enough from the line that a strong descender or rouleur can solo to Belfort.",
    },
    prediction:
      "The break stays away on the longest day of the Tour. A hilly-classics specialist or a rangy all-rounder wins from a move whittled to a handful.",
    roadmanTake:
      "A 200km-plus day is a fuelling and pacing exam above all else. The riders who finish strong are the ones who ate from kilometre zero, not the ones who waited until they felt hungry. For your own big days, fuel to the plan, not to the feeling — by the time you feel empty, it is already too late.",
    expertAngle: {
      expert: "Lachlan Morton",
      angle:
        "His long-distance feats run on relentless, early, consistent fuelling — the body can only absorb so much per hour, so you start eating before you need to and never stop.",
    },
    related: [
      { label: "Nutrition plan for a 100-mile sportive", href: "/blog/cycling-nutrition-plan-100-mile-sportive" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { label: "Nutrition hub", href: "/topics/cycling-nutrition" },
    ],
  },
  {
    number: 14,
    date: "2026-07-18",
    dayOfWeek: "Saturday",
    start: "Mulhouse",
    finish: "Le Markstein Fellering",
    distanceKm: 155.3,
    type: "mountain",
    range: "Vosges",
    elevationGainM: 3800,
    climbs: [
      { name: "Grand Ballon", lengthKm: 21.5, gradientPct: 4.5, summitM: 1424 },
      { name: "Col du Haag", lengthKm: 11.2, gradientPct: 7.3 },
      { name: "Geishouse", lengthKm: 10.9, gradientPct: 7.3 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "Seven categorised climbs across the Vosges, including the Grand Ballon — the range's highest point — and a summit finish at Le Markstein. A war of attrition with almost no flat road all day.",
    tactical: {
      whoBenefits:
        "Aggressive GC riders and climbers who relish chaos. Seven climbs with almost no flat is a stage that rewards racing from distance.",
      whatToWatch:
        "A long-range move. The Vosges have a history of attacks from 50km out, and a GC rider down on time may gamble everything here.",
    },
    prediction:
      "Either a big GC name attacks from far out, or a strong break is left to fight it out while the favourites watch. With no flat to hide on, the strongest legs win — not the best sprint.",
    roadmanTake:
      "Seven climbs in 155km is a repeatability and recovery test. Whether you can do the seventh climb at the same intensity as the first comes down to aerobic base and how well you recover between efforts — the unglamorous endurance work done months earlier, not the last sharp session before the race.",
    expertAngle: {
      expert: "Stephen Seiler",
      angle:
        "The polarised case in full: the rider who logged the high-volume easy hours has the aerobic ceiling to repeat seven hard climbs, while the one who only trained intensity fades after three.",
    },
    related: [
      { label: "VO2max training hub", href: "/masters/vo2max" },
      { label: "Polarised vs sweet spot", href: "/blog/polarised-vs-sweet-spot-training" },
      { label: "Pacing strategy for long climbs", href: "/blog/cycling-pacing-strategy-long-climbs" },
    ],
  },
  {
    number: 15,
    date: "2026-07-19",
    dayOfWeek: "Sunday",
    start: "Champagnole",
    finish: "Plateau de Solaison",
    distanceKm: 183.9,
    type: "mountain",
    range: "Jura",
    climbs: [
      { name: "Plateau de Solaison", category: "1", lengthKm: 11.3, gradientPct: 9 },
      { name: "Col de la Croisette", lengthKm: 7.6, gradientPct: 8.8 },
      { name: "Col de la Savine", lengthKm: 5.9, gradientPct: 4.6 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "The last stage before the second rest day climbs from the Jura toward the pre-Alps and finishes up the severe Plateau de Solaison — over 11km averaging 9%, with ramps beyond 12%. A pure climber's summit finish.",
    tactical: {
      whoBenefits:
        "The pure climbers. An 11.3km wall averaging 9% with ramps past 12% is as honest a climb as the race offers — nowhere to hide, nowhere to draft.",
      whatToWatch:
        "Power-to-weight, undisguised. Expect the favourites to wait for the lower slopes, then trade attacks until the gradient does the selecting for them.",
    },
    prediction:
      "Real GC gaps before the second rest day. The lightest, best-climbing favourite gains time on a finish that exposes anyone a fraction below their best.",
    roadmanTake:
      "An 11km climb at 9% is sustained threshold-to-VO2 work — there is nowhere to hide and nowhere to freewheel. Riders who have trained their functional threshold and know their numbers to the watt pace it perfectly; everyone else either blows or leaves time on the road. This is the climb your FTP test was for.",
    expertAngle: {
      expert: "Dan Lorang",
      angle:
        "Periodisation pointed at a goal climb — build threshold and VO2 in the right blocks so the rider peaks with the exact capacity a 9% wall demands, rather than arriving generally fit but unspecific.",
    },
    related: [
      { label: "Pacing strategy for long climbs", href: "/blog/cycling-pacing-strategy-long-climbs" },
      { label: "FTP training hub", href: "/topics/ftp-training" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
    ],
  },
  {
    number: 16,
    date: "2026-07-21",
    dayOfWeek: "Tuesday",
    start: "Évian-les-Bains",
    finish: "Thonon-les-Bains",
    distanceKm: 26.1,
    type: "individual-tt",
    climbs: [{ name: "Côte de Larringes", lengthKm: 9.4, gradientPct: 4.3 }],
    summitFinish: false,
    sprintFriendly: false,
    description:
      "The Tour's only individual time trial, on the shores of Lake Geneva, comes deep in the third week. A rolling 26km against the clock that can rewrite the GC with everyone already tired.",
    tactical: {
      whoBenefits:
        "The GC time-trialists — a Remco Evenepoel or a Pogačar against the clock — and the pure specialists chasing a stage win. Deep in week three, fatigue widens every gap.",
      whatToWatch:
        "How much the climbers have left. A rolling 26km with everyone already tired can turn a 20-second deficit into a minute, or rescue a leader who can ride a bike against the clock.",
    },
    prediction:
      "The biggest single reshaping of the GC outside the high mountains. The best time-trialist among the favourites takes serious time; a climbing leader who cannot follow may see the Tour slip away.",
    roadmanTake:
      "A time trial is pacing made visible — go out too hard and the last 10km collapse. The winning effort is even or very slightly negative-split, held just at threshold, with the discipline to not chase the early split. It is the most coachable discipline in the sport: hold your number and trust it.",
    expertAngle: {
      expert: "Alex Dowsett",
      angle:
        "A multi-time national TT champion, his rule is to pace by power and feel, not by the clock — start in control, build into it, and never let an early time check pull you over your limit.",
    },
    related: [
      { label: "Race Predictor — model your TT", href: "/predict" },
      { label: "Against the Clock", href: "/against-the-clock" },
      { label: "Cycling time trial tips", href: "/blog/cycling-time-trial-tips" },
    ],
  },
  {
    number: 17,
    date: "2026-07-22",
    dayOfWeek: "Wednesday",
    start: "Chambéry",
    finish: "Voiron",
    distanceKm: 174.7,
    type: "flat",
    sprintFriendly: true,
    summitFinish: false,
    climbs: [
      { name: "Col de Couz", lengthKm: 6.3, gradientPct: 4.4 },
      { name: "Col des Prés", lengthKm: 8.1, gradientPct: 5.2 },
    ],
    range: "Alps (approach)",
    description:
      "A transitional day between the time trial and the high Alps. Rolling early climbs give way to a flatter finale into Voiron — a reduced bunch sprint, or a breakaway, depending on who has the legs.",
    tactical: {
      whoBenefits:
        "A breakaway or a depleted bunch of fast men — a survival day wedged between the time trial and the high Alps.",
      whatToWatch:
        "Whether the sprinters' teams have the numbers and the will to chase, or concede the day to a break with the Alps looming.",
    },
    prediction:
      "A break or a reduced sprint, with the GC riders content to hide. The contenders treat this as the last quiet day before three Alpine summit finishes decide the race.",
    roadmanTake:
      "Sandwiched between a TT and three Alpine summit finishes, this is a day the GC riders survive rather than win. The art of the Grand Tour is knowing which days to fight and which to conserve. For your own season, not every ride is a competition — protect the big efforts that actually move the needle.",
    expertAngle: {
      expert: "Joe Friel",
      angle:
        "Train and race with intent — every day has a purpose, and a recovery-paced day disguised as a race day is exactly how the strongest riders arrive fresh for the Alps.",
    },
    related: [
      { label: "Recovery hub", href: "/topics/cycling-recovery" },
      { label: "Active recovery rides done right", href: "/blog/cycling-active-recovery-rides-guide" },
      { label: "Goal setting that actually works", href: "/blog/cycling-goal-setting-that-actually-works" },
    ],
  },
  {
    number: 18,
    date: "2026-07-23",
    dayOfWeek: "Thursday",
    start: "Voiron",
    finish: "Orcières-Merlette",
    distanceKm: 185.2,
    type: "mountain",
    range: "Alps",
    elevationGainM: 3950,
    climbs: [
      { name: "Orcières-Merlette", lengthKm: 7.1, gradientPct: 6.7, summitM: 1850 },
      { name: "Côte d'Engins", lengthKm: 11.4, gradientPct: 5.4 },
      { name: "Monteynard", lengthKm: 9.7, gradientPct: 5 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "The high Alps begin in earnest with a summit finish at the ski resort of Orcières-Merlette, a climb steeped in Tour history. The first of three consecutive Alpine mountain stages that decide the race.",
    tactical: {
      whoBenefits:
        "The GC favourites with the strongest teams. The first of three consecutive Alpine days is about who arrives freshest, not who wins the stage.",
      whatToWatch:
        "Restraint. A rider who burns too much here pays for it twice before the block ends on Alpe d'Huez. The first cracks of the final week show on the Orcières-Merlette ramp.",
    },
    prediction:
      "The GC battle resumes with the first Alpine time gaps, but the smartest favourites keep their powder dry. A breakaway could still steal the stage while the leaders measure each other.",
    roadmanTake:
      "The first of three Alpine days in a row is about managing the whole block, not winning the stage. Recovery between back-to-back mountain stages — sleep, protein, getting the carbs back in fast — is what lets a rider still be there on day three. Train the recovery as seriously as the efforts.",
    expertAngle: {
      expert: "Dan Lorang",
      angle:
        "Stage-race performance is a recovery problem — refuel within the window, sleep, and the rider can repeat a near-maximal climb three days running instead of fading after one.",
    },
    related: [
      { label: "Bedtime protein recovery protocol", href: "/blog/bedtime-protein-cyclists-recovery-protocol" },
      { label: "Recovery hub", href: "/topics/cycling-recovery" },
      { label: "Cycling after 40 — recovery report", href: "/blog/cycling-after-40-recovery-report-2026" },
    ],
  },
  {
    number: 19,
    date: "2026-07-24",
    dayOfWeek: "Friday",
    start: "Gap",
    finish: "Alpe d'Huez",
    distanceKm: 127.9,
    type: "mountain",
    range: "Alps",
    climbs: [
      { name: "Alpe d'Huez", category: "HC", lengthKm: 13.8, gradientPct: 8.1, summitM: 1860 },
      { name: "Col du Noyer", lengthKm: 7.2, gradientPct: 8.3 },
      { name: "Col d'Ornon", lengthKm: 5.6, gradientPct: 6.2 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "Short and explosive at under 128km, finishing up the 21 hairpins of Alpe d'Huez — the most famous climb in cycling. The first of two consecutive days finishing on the Alpe, a Grand Tour first.",
    tactical: {
      whoBenefits:
        "Explosive climbers and the GC men with the best top-end. Under 128km, it is raced flat-out from the Col d'Ornon with no easing in.",
      whatToWatch:
        "Attacks on the lower hairpins of the Alpe. A short stage compresses everything into the final climb, and the 21 bends of Alpe d'Huez are where reputations are made.",
    },
    prediction:
      "Fireworks. The first of two straight finishes on the Alpe sees the GC favourites trade blows on cycling's most famous climb — expect attacks, not a tempo procession.",
    roadmanTake:
      "A short mountain stage is ridden flat-out from early — no easing in, no saving it for the finish. The lesson is that fitness has a ceiling set by VO2max, and on a 13km climb at 8% your sustainable power is what decides it. VO2 intervals are the most direct way to raise that ceiling.",
    expertAngle: {
      expert: "Stephen Seiler",
      angle:
        "Raise the aerobic ceiling with hard intervals on a deep base, then express it on the Alpe — the polarised model built precisely for a maximal 40-minute climbing effort.",
    },
    related: [
      { label: "VO2max training hub", href: "/masters/vo2max" },
      { label: "VO2max intervals", href: "/blog/cycling-vo2max-intervals" },
      { label: "Pacing strategy for long climbs", href: "/blog/cycling-pacing-strategy-long-climbs" },
    ],
  },
  {
    number: 20,
    date: "2026-07-25",
    dayOfWeek: "Saturday",
    start: "Le Bourg-d'Oisans",
    finish: "Alpe d'Huez",
    distanceKm: 170.9,
    type: "mountain",
    range: "Alps",
    elevationGainM: 5600,
    climbs: [
      { name: "Col de la Croix de Fer", category: "HC", lengthKm: 24, gradientPct: 5.2, summitM: 2067 },
      { name: "Col du Galibier", category: "HC", lengthKm: 23, gradientPct: 5.1, summitM: 2642 },
      { name: "Col du Télégraphe", category: "1", lengthKm: 11.9, gradientPct: 7.1, summitM: 1566 },
      { name: "Alpe d'Huez", category: "HC", lengthKm: 13.8, gradientPct: 8.1, summitM: 1860 },
    ],
    summitFinish: true,
    sprintFriendly: false,
    description:
      "The queen stage and the route of the 2026 Étape du Tour. Croix de Fer, Télégraphe and the Galibier — the Tour's highest point at 2,642m — before a second straight finish on Alpe d'Huez. Around 5,600m of climbing. This is where the Tour is won.",
    tactical: {
      whoBenefits:
        "The strongest stage-racer in the field. Croix de Fer, Télégraphe, the Galibier at 2,642m and a final haul up Alpe d'Huez — 5,600m of climbing leaves nowhere to fake it.",
      whatToWatch:
        "A long-range move on the Croix de Fer or Galibier. With the Tour on the line and the Étape crowd watching, this is the day a champion commits everything from distance.",
    },
    prediction:
      "The Tour is won here. Whoever holds the yellow jersey over the Galibier and up the Alpe wins the race; the rider with the deepest reserves after three weeks takes the most important stage of all.",
    roadmanTake:
      "5,600m of climbing is the ultimate test of fatigue resistance — the ability to produce power when you are already deeper than you have ever been. It is built over months of progressive long rides, not in a final hard week. If you are riding the Étape on this route, your training should rehearse being tired and still climbing.",
    expertAngle: {
      expert: "Lachlan Morton",
      angle:
        "Durability over a monstrous day comes from base, fuelling and pacing held together for hours — ride within yourself early so there is something left for the Galibier and the Alpe.",
    },
    related: [
      { label: "Masters Cycling Training Report 2026", href: "/blog/masters-cycling-training-report-2026" },
      { label: "Event prep — peak for your big day", href: "/event-prep" },
      { label: "Carb-loading protocol", href: "/blog/cycling-carb-loading-protocol-race-week" },
    ],
  },
  {
    number: 21,
    date: "2026-07-26",
    dayOfWeek: "Sunday",
    start: "Thoiry",
    finish: "Paris — Champs-Élysées",
    distanceKm: 132,
    type: "flat",
    sprintFriendly: true,
    summitFinish: false,
    climbs: [{ name: "Butte Montmartre (×3)", lengthKm: 1.1, gradientPct: 5.9 }],
    description:
      "The processional finish to Paris, now with three ascents of the cobbled Butte Montmartre before the Champs-Élysées circuit. Champagne for the GC riders, then a frantic finale that may favour a late attack as much as a sprint.",
    tactical: {
      whoBenefits:
        "Either the surviving sprinters or a punchy late attacker. Three ascents of the cobbled Butte Montmartre have turned the old procession into a real race.",
      whatToWatch:
        "The final climb of Montmartre. A strong puncheur can attack over the top and hold off the bunch to the Champs-Élysées, exactly as the finale was designed to allow.",
    },
    prediction:
      "Champagne early for the GC winner, then a genuine fight. Expect a late attack off Montmartre to challenge the sprinters' teams — the processional Paris finish is gone.",
    roadmanTake:
      "Three weeks and 3,300km end here. The riders who make it to Paris share one trait above talent: consistency — they trained, fuelled, recovered and paced day after day without the blow-up that ends a Tour. That is the whole game for the amateur too. Show up, do the work, recover, repeat. The result takes care of itself.",
    expertAngle: {
      expert: "Joe Friel",
      angle:
        "Consistency beats intensity over a season — the rider who strings together months of well-judged training without injury or burnout arrives in Paris, in form, every time.",
    },
    related: [
      { label: "Goal setting that actually works", href: "/blog/cycling-goal-setting-that-actually-works" },
      { label: "Training plans hub", href: "/topics/cycling-training-plans" },
      { label: "The Roadman methodology", href: "/methodology" },
    ],
  },
];

/** Lookup by stage number (1–21). */
export function getStage(n: number): Stage | undefined {
  return TOUR_STAGES.find((s) => s.number === n);
}
