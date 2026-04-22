/**
 * Programmatic SEO landing pages: /plan/[event]/[weeks-out]
 *
 * Each landing page combines:
 *   - TrainingEvent — a specific target event (Wicklow 200, Ride London, etc.)
 *   - TrainingPhase — weeks-out bucket (16, 12, 8, 4, 2, 1)
 *
 * That gives event-specific + phase-specific content at scale
 * without writing every combination by hand. A rider searching
 * "wicklow 200 training plan 8 weeks out" lands on a page that's
 * genuinely useful for their exact situation, not a generic article.
 */

export type EventType =
  | "sportive"
  | "gran-fondo"
  | "road-race"
  | "gravel"
  | "ultra"
  | "mtb";

export interface TrainingEvent {
  slug: string;
  name: string;
  shortName: string;
  /** Country/region — powers geo SEO. */
  region: string;
  type: EventType;
  distanceKm: number;
  elevationGainM: number;
  /** E.g. "8-12 hours" — typical amateur finish. */
  typicalFinishTime: string;
  /** Month the event usually runs, e.g. "May", "July". */
  defaultMonth: string;
  /** Short intro paragraph (1-2 sentences). */
  description: string;
  /** 3-5 defining characteristics. */
  keyCharacteristics: string[];
  /** 2-3 most-common mistakes amateurs make at this event. */
  commonMistakes: string[];
  /** Paragraph on how to pace it. */
  pacingStrategy: string;
  /** Event-specific nutrition / fuelling notes. */
  nutritionAngle: string;
  /** Gear / kit considerations. */
  kitAngle: string;
  /** Optional related blog slug if we already have a long-form guide. */
  blogSlug?: string;
}

export interface TrainingPhase {
  slug: string;
  weeksOut: number;
  label: string;
  tagline: string;
  /** What training emphasises at this phase. */
  focus: string;
  /** A concrete anchor session for the week. */
  anchorSession: {
    name: string;
    detail: string;
  };
  /** Typical week structure (7 days). */
  weekStructure: {
    day: string;
    session: string;
    detail: string;
  }[];
  /** Common mistake at this phase. */
  gotcha: string;
}

/* ============================================================ */
/* Events                                                       */
/* ============================================================ */

export const EVENTS: TrainingEvent[] = [
  {
    slug: "wicklow-200",
    name: "Wicklow 200",
    shortName: "Wicklow 200",
    region: "Ireland",
    type: "sportive",
    distanceKm: 200,
    elevationGainM: 3500,
    typicalFinishTime: "8-12 hours",
    defaultMonth: "June",
    description:
      "The Wicklow 200 is Ireland's classic mass-participation sportive — 200km across the Wicklow Mountains with 3,500m of climbing. Starts and finishes in Greystones or thereabouts, runs in early June.",
    keyCharacteristics: [
      "Five named climbs including Sally Gap, Slieve Mann, and the Shay Elliott",
      "Weather can shift from baking to cold rain inside an hour",
      "Cut-off times at checkpoints — pacing mistakes end your day early",
      "Long valleys between climbs demand steady aerobic fitness",
      "Mass start means the opening 30km can drag you into the red",
    ],
    commonMistakes: [
      "Going too hard in the first 50km in a pack surge",
      "Underfueling on Sally Gap because it's 'only' the first big climb",
      "Pack light thinking 'it's June' — expect wind and showers",
    ],
    pacingStrategy:
      "Think of it as two 100km rides stitched together. Target heart-rate ceiling on Sally Gap (climb 1) that's 5-8 beats below your sportive threshold. If you feel comfortable at the 100km mark, you paced it right. If you're already hanging on, the back half will be a grind.",
    nutritionAngle:
      "80-100g carbs/hour for 200km is the realistic target if your gut's trained. Start fuelling within 45 minutes. Cafe stop at the 140km feed zone is a strategic checkpoint, not a recovery break — keep it under 20 minutes.",
    kitAngle:
      "Rain cape stashed in the jersey pocket. Compact chainset for Shay Elliott unless you're built for hills. Double-bottle plus one refill at every stop — Irish weather dehydrates you even when it feels cool.",
    blogSlug: "wicklow-200-training-plan",
  },
  {
    slug: "ring-of-beara",
    name: "Ring of Beara Cycle",
    shortName: "Ring of Beara",
    region: "Ireland",
    type: "sportive",
    distanceKm: 140,
    elevationGainM: 2200,
    typicalFinishTime: "5-8 hours",
    defaultMonth: "May",
    description:
      "Ring of Beara is the coastal Kerry sportive — 140km around the wildest peninsula in Ireland, with the Caha Mountains and Healy Pass as the defining climbs. Smaller field than Wicklow 200, steeper climbs.",
    keyCharacteristics: [
      "Healy Pass — the signature climb, 8% average, switchbacks",
      "Exposed coastal sections with unpredictable crosswinds",
      "140km is shorter than Wicklow but the terrain is punchier",
      "Early May means the road is often wet",
      "Small villages for feed zones — plan your stops carefully",
    ],
    commonMistakes: [
      "Treating Healy Pass like an easy climb because it's 'only' 9km",
      "Packing like it's July when it's May on the Atlantic",
      "Cranking the gearing too hard — long compact gearing saves the day",
    ],
    pacingStrategy:
      "The first 80km are rolling with two controllable climbs. The Healy Pass at km 100 is the ride. If you arrive at the base feeling fresh you'll finish strong. If you're already ragged you'll crack on the steep section. Pace for Healy, not the flats.",
    nutritionAngle:
      "Shorter than Wicklow but more climbing per km. 70-90g carbs/hour. Refill at Kenmare or Glengarriff depending on the route. The Healy Pass has no feed zone — come to it with a full bottle and a gel.",
    kitAngle:
      "Gilet and armwarmers even in May. Compact crankset with 11-32 cassette. The descent off Healy is technical — check brake pads before you start.",
    blogSlug: "ring-of-beara-training-plan",
  },
  {
    slug: "ride-london-100",
    name: "Ride London 100",
    shortName: "Ride London",
    region: "United Kingdom",
    type: "sportive",
    distanceKm: 160,
    elevationGainM: 1200,
    typicalFinishTime: "5-9 hours",
    defaultMonth: "May",
    description:
      "Ride London 100 is the UK's largest mass-participation sportive — 160km (100 miles) from Surrey into central London on closed roads. Rolling with two named climbs (Leith Hill, Box Hill). First-time 100-mile riders dominate the field.",
    keyCharacteristics: [
      "Closed roads on the outbound and return legs",
      "Leith Hill — the psychological midpoint; Box Hill — the fun one",
      "Pack riding dominates — drafting saves 20-30% of your work",
      "Central London finish with huge crowds",
      "Early start (often 06:30) — means late nights the week before ruin you",
    ],
    commonMistakes: [
      "Surfing from group to group in the first 40km and burning matches",
      "Underhydrating because it 'doesn't feel hot' on closed roads",
      "Descending Leith Hill too cautiously and losing the pack behind you",
    ],
    pacingStrategy:
      "Sit in a pack at your sportive pace. Don't chase a faster pack if you can't comfortably hold a wheel for 10 minutes. Leith Hill is at 77km — keep your power 10% below threshold. Box Hill is a 3-minute effort, go for a Strava time if you have legs, otherwise spin.",
    nutritionAngle:
      "Gels every 30-45 min + bar every 90. Closed-road feed zones are plentiful but often packed — carry enough that you can skip one. Caffeine gel at 100km keeps the focus through the urban section.",
    kitAngle:
      "Aero road bike with 52/36 + 11-30 cassette is plenty. No need for climbing gear. Bidon cage warming bottles (it often rains). Thin gloves — finish is in London, traffic after the line.",
    blogSlug: "ride-london-training-plan",
  },
  {
    slug: "fred-whitton-challenge",
    name: "Fred Whitton Challenge",
    shortName: "Fred Whitton",
    region: "United Kingdom",
    type: "sportive",
    distanceKm: 180,
    elevationGainM: 3950,
    typicalFinishTime: "8-12 hours",
    defaultMonth: "May",
    description:
      "Fred Whitton Challenge is the UK's hardest sportive — 180km through the Lake District with 3,950m of climbing including Hardknott Pass (33% max gradient). A pure climbing test. Finishers consider it a career highlight.",
    keyCharacteristics: [
      "Hardknott Pass — 33% max gradient, cobbled in places",
      "Four 10%+ climbs stacked on top of each other",
      "Weather can put visibility at 50m on the summits",
      "Cut-off times at checkpoints tight for slower riders",
      "Field size smaller than Wicklow or Ride London — less pack riding",
    ],
    commonMistakes: [
      "Riding a 50/34 + 11-28 and discovering 33% gradient mid-effort",
      "Saving yourself for Hardknott and bonking before it",
      "Pushing the descent after the Struggle when the legs are done",
    ],
    pacingStrategy:
      "Fred Whitton is about finishing. Heart rate management on the first three climbs is everything. Target Z3 ceiling on Kirkstone, Honister, and Newlands. Save Zone 4 for Wrynose and Hardknott. The last 30km are a drift — pace for survival.",
    nutritionAngle:
      "10-12 hours needs 80-100g carbs/hour sustained — that's the difference-maker. Food at every feed zone, don't skip 'because you feel OK'. Electrolytes matter more than calories in the last 60km.",
    kitAngle:
      "34x34 minimum gearing. Some riders use a 1x setup. Walking shoes are not weakness — plenty of people walk Hardknott. Long-finger gloves for descents.",
    blogSlug: "fred-whitton-challenge-training-plan",
  },
  {
    slug: "etape-du-tour",
    name: "Étape du Tour",
    shortName: "Étape du Tour",
    region: "France",
    type: "sportive",
    distanceKm: 175,
    elevationGainM: 4500,
    typicalFinishTime: "8-12 hours",
    defaultMonth: "July",
    description:
      "The Étape du Tour is cycling's mass-participation crown jewel — one stage of the current year's Tour de France, on closed roads, run by ASO. Varies each year but always hard, always mountainous, always an international field.",
    keyCharacteristics: [
      "Closed roads on full HC / Category-1 climbs",
      "15,000+ riders means the start can take 40 minutes to clear",
      "Altitude — many editions cross 2,000m",
      "Support unmatched: feed zones every 25-30km, full medical",
      "Cut-off times mirror the pro race — strict",
    ],
    commonMistakes: [
      "Treating it like a normal sportive — this is mountain racing",
      "Underestimating heat at altitude (sun intensity + thin air)",
      "Saving legs for the final climb and ending up missing the cut-off",
    ],
    pacingStrategy:
      "Étape pacing is pro-race pacing scaled to your FTP. Treat each HC climb as its own threshold effort with rigid wattage ceilings. The summit-to-summit interval is often the crux — don't burn matches on the valley transitions.",
    nutritionAngle:
      "8+ hours at altitude demands 100g/hr carbs minimum if gut-trained. Altitude suppresses thirst — force-drink on a timer. Feed zones have baguettes and ham — use them but fuel continuously from your own supplies.",
    kitAngle:
      "34x32 minimum — many amateurs run 34x34. Clear lenses for the descents. Full-finger gloves for the summits (even in July). A gilet stashed in the pocket is non-negotiable for the mountain descents.",
  },
  {
    slug: "maratona-dles-dolomites",
    name: "Maratona dles Dolomites",
    shortName: "Maratona Dolomites",
    region: "Italy",
    type: "sportive",
    distanceKm: 138,
    elevationGainM: 4230,
    typicalFinishTime: "6-10 hours",
    defaultMonth: "July",
    description:
      "The Maratona dles Dolomites is the classic Italian sportive — 138km over 7 Dolomite passes with 4,230m of climbing. Ballotted entry, 9,000 riders, closed roads from dawn. Arguably the most beautiful sportive on the calendar.",
    keyCharacteristics: [
      "Seven passes: Campolongo, Pordoi, Sella, Gardena, Giau, Falzarego, Valparola",
      "Passo Giau is the crux — 9.9km at 9.3%",
      "Altitude 1,200-2,240m across the day",
      "Early start (pre-dawn) — means the first climb is in darkness for some",
      "Technical descents demand road-race confidence",
    ],
    commonMistakes: [
      "Racing the first three passes when the hardest (Giau) comes after 4 hours",
      "Poor descent technique on Pordoi and Gardena losing 30+ minutes",
      "Altitude-naive riders struggling with heart-rate drift on the upper passes",
    ],
    pacingStrategy:
      "Start conservative — the first three passes are warm-up. Giau is the race. Control HR on Giau below threshold for the bottom half, hold the line for the top. Falzarego is the victory lap but still 600m of climbing — respect it.",
    nutritionAngle:
      "90-110g carbs/hour. Feed zones are excellent (Italian sportives understand food) but own-supply is faster. Water at every tap — Dolomite sun is deceiving.",
    kitAngle:
      "Climbing bike. 34x30 minimum. Light windproof gilet — descents are cold even in July. Sunscreen on arms + legs — Dolomite UV is brutal.",
  },
  {
    slug: "mallorca-312",
    name: "Mallorca 312",
    shortName: "Mallorca 312",
    region: "Spain",
    type: "sportive",
    distanceKm: 312,
    elevationGainM: 5050,
    typicalFinishTime: "10-14 hours",
    defaultMonth: "April",
    description:
      "The Mallorca 312 is spring's most talked-about sportive — 312km around Mallorca with 5,000m+ of climbing, including Sa Calobra, the iconic hairpin-laced descent-then-climb that defines the day. Runs in late April. Open-road format, closed to traffic in parts.",
    keyCharacteristics: [
      "Sa Calobra — 10km descent into the sea then 10km climb back out, 7% average",
      "Coll de Sóller tunnel + classic north-coast climbs stacked early",
      "312km distance means fuelling strategy determines who finishes",
      "Three distance options: 312km, 225km, 167km — pick realistically",
      "Weather shift from cold morning climbs to afternoon Mediterranean heat",
    ],
    commonMistakes: [
      "Choosing the 312 because you've done other long sportives — Mallorca's combination of distance + heat is different",
      "Underfuelling the first 80km because the climbing starts easy",
      "Forgetting the Sa Calobra climb is a 9% average, not a gentle return — many riders bonk here",
    ],
    pacingStrategy:
      "The 312 is a fueling problem more than a fitness one. Pace the opening 100km at 60-65% FTP maximum. Ride the middle 100km conservatively with strict carb/fluid discipline. The last 100km is where preparation shows — those who fuelled correctly can even push. The Sa Calobra climb is at 220km — arrive with reserves, not red-lined.",
    nutritionAngle:
      "10+ hours means 80g carbs/hour minimum, 100g if gut-trained. 500-750ml fluid/hour once the heat kicks in. Food at every aid station on the route — don't skip any. Electrolytes become dominant after hour 6. A 'second breakfast' at the Pollença aid stop (km 80) is a classic move.",
    kitAngle:
      "Long-finger gloves + gilet for the first two hours (cold on the climbs pre-dawn). 34x30 minimum, 34x32 recommended for Sa Calobra late in the day. Extra bottle cages or a frame bag for the long desert-like middle section.",
  },
  {
    slug: "badlands",
    name: "Badlands",
    shortName: "Badlands",
    region: "Spain",
    type: "ultra",
    distanceKm: 800,
    elevationGainM: 16000,
    typicalFinishTime: "60-120 hours",
    defaultMonth: "September",
    description:
      "Badlands is one of the hardest self-supported ultras in the world — 800km across Andalusia and the Tabernas Desert (Europe's only true desert) with 16,000m of climbing. Mixed gravel/road, 40°C+ daytime heat, freezing desert nights. The race that made Lachlan Morton famous on the Roadman Podcast.",
    keyCharacteristics: [
      "Self-supported format — resupply only at open shops + fountains",
      "Tabernas Desert crossing: 40°C+ daytime, freezing at night",
      "16,000m climbing across 800km averages 20m/km — relentless",
      "Sleep strategy is part of the race (2-6 hours/day at best)",
      "Mix of road + gravel + rough dirt — tyre choice is a gamble",
    ],
    commonMistakes: [
      "Underestimating the night desert cold — riders treat 'Spain in September' as warm, it isn't at 2am",
      "Treating it like a long sportive — Badlands breaks people who haven't done shorter ultras first",
      "Poor tyre pressure — either too light (punctures) or too firm (fatigue)",
    ],
    pacingStrategy:
      "Don't race the start. Badlands has a 4-5 day finishing window for most riders and the leaderboard means almost nothing if you DNF at km 400. Sustainable pace — roughly 60% of your 8-hour FTP as an all-day ceiling. Sleep plan written in advance: where, how long, triggered by which km.",
    nutritionAngle:
      "No aid stations. You carry or you resupply from shops. 80-100g carbs/hour on the bike minimum. Calories eaten at shops count. Salt + electrolytes critical in the desert crossing. Cafés and gas stations become your crew.",
    kitAngle:
      "Ultra-endurance bikepacking setup: dynamo hub, frame bag, saddle bag, bar bag. 40-45mm gravel tyres with good sidewalls (Challenge Getaway, Pirelli Cinturato, Schwalbe G-One Ultrabite). Bivvy bag + emergency blanket for forced sleep stops.",
  },
  {
    slug: "leadville-100",
    name: "Leadville Trail 100",
    shortName: "Leadville 100",
    region: "USA",
    type: "mtb",
    distanceKm: 160,
    elevationGainM: 3800,
    typicalFinishTime: "8-12 hours",
    defaultMonth: "August",
    description:
      "Leadville 100 is the definitive high-altitude MTB race — 160km through the Colorado Rockies starting at 3,100m (10,200ft) with 3,800m of climbing and a topout above 3,800m on Columbine Mine. Lottery entry, hard cut-offs, finisher buckle is a career milestone.",
    keyCharacteristics: [
      "Altitude 3,100-3,810m — altitude-naive riders lose 20-30% power",
      "Columbine Mine climb — 9km straight up to 3,810m above sea level",
      "Cut-off at the Columbine turnaround (6:00) is the race",
      "Powerline descent — fast, rocky, tyre-popping territory",
      "Weather varies from freezing dawn to 30°C + thunderstorms",
    ],
    commonMistakes: [
      "Arriving less than 2 weeks before for altitude acclimatisation",
      "Racing the first 40km on paved road sections and blowing up at altitude",
      "Running tyres too light — Leadville's rocks destroy XC casings",
    ],
    pacingStrategy:
      "Altitude changes everything. Target a power ceiling 15-20% below what you'd hold at sea level. Heart rate runs 5-10 bpm higher than your lowland rate at the same effort — don't panic. Columbine Mine is a controlled climb at aerobic threshold. The flats + the Powerline descent are where the front group makes time; the back half is where you win your sub-9 buckle.",
    nutritionAngle:
      "Altitude suppresses appetite — force-fuel on a timer. 70-90g carbs/hour. Feed zones are excellent (crew + on-course). Hydration is critical: 750ml+/hour with electrolytes. The dry Colorado air dehydrates faster than you feel.",
    kitAngle:
      "Hardtail or 120mm trail bike. 2.3-2.4\" tyres with Enduro or MaxxTerra casings — not XC race tyres. CO2 + pump + plug kit + spare tube. Arm warmers + gilet for the 06:30 start (cold). Altitude requires sunglasses with good UV + clear lens backup for the Columbine descent (often cloud + rain).",
  },
  {
    slug: "gran-fondo-nyc",
    name: "Gran Fondo New York",
    shortName: "Gran Fondo NYC",
    region: "USA",
    type: "sportive",
    distanceKm: 160,
    elevationGainM: 2500,
    typicalFinishTime: "5-9 hours",
    defaultMonth: "May",
    description:
      "Gran Fondo New York (GFNY) is the flagship USA sportive — 160km from the George Washington Bridge up the Hudson Valley with 2,500m of climbing. Competitive timed format (your position matters), international field, closed bridge at the start.",
    keyCharacteristics: [
      "Start on the George Washington Bridge — 8,000+ riders",
      "Bear Mountain climb — the signature climb at km 90",
      "Timed format: results matter, pacing strategies ruthless",
      "Rolling Hudson Valley terrain — few flat km",
      "May weather: anywhere from 10°C and raining to 30°C and humid",
    ],
    commonMistakes: [
      "Burning matches matching pace on the first 30km — it's a race start, not your pace",
      "Riding solo instead of working groups — drafting saves 25-30% on the Hudson roads",
      "Underfueling because the early rollers feel 'just easy enough'",
    ],
    pacingStrategy:
      "Get in a pack at your sportive pace within the first 15km. Work the pack on the flats + rollers. Bear Mountain at km 90 is a 25-30 min threshold effort — attack it at 90-95% FTP if you're chasing a time, 80-85% if you're chasing a finish. The back half rewards steady pacing over heroic climbs.",
    nutritionAngle:
      "80-90g carbs/hour. Feed zones at km 55 and km 110 are strategic. Don't skip the km 55 stop. US roadie fuelling culture means everyone carries their own — don't rely on aid station variety.",
    kitAngle:
      "Aero road bike with 11-30 cassette. Arm warmers + gilet stashed — weather varies. Rear light mandatory (enforced). Sunglasses with clear lenses for the GW Bridge tunnel at the start.",
  },
  {
    slug: "dirty-reiver",
    name: "Dirty Reiver",
    shortName: "Dirty Reiver",
    region: "United Kingdom",
    type: "gravel",
    distanceKm: 200,
    elevationGainM: 2500,
    typicalFinishTime: "8-14 hours",
    defaultMonth: "April",
    description:
      "Dirty Reiver is the UK's flagship gravel event — 200km across Kielder Forest with 2,500m of climbing on forestry roads, single track, and open fell crossings. Self-supported navigation, weather-exposed. The event that established UK gravel.",
    keyCharacteristics: [
      "Forestry roads in Kielder — fast, wide, surprisingly rolling",
      "Weather can shift from sunny to snowy inside an hour in April",
      "Self-supported: carry what you eat/drink",
      "Short 130km + 65km options for first-timers",
      "Borderline mountain bike terrain in sections",
    ],
    commonMistakes: [
      "Running road tyres — you will puncture",
      "Underdressing because 'it's April' — Kielder makes its own weather",
      "Pacing like a sportive — gravel eats your legs faster than tarmac",
    ],
    pacingStrategy:
      "Gravel events punish overpacing effort because the surface varies. Target heart-rate rather than power — aim for high Z2 / low Z3 as your all-day ceiling. Let others go early on the fast sections; you'll catch them when the rough stuff starts. Eat on the flat sections when you can chew safely.",
    nutritionAngle:
      "Self-supported means you pack it. 70-90g carbs/hour, more if cold. One water refill at the mid-point feed stop (if it's there — not guaranteed). Real food works better than gels when the ride stretches beyond 8 hours — sandwiches, bars, waffles.",
    kitAngle:
      "Gravel bike with 40-45mm tyres — Rene Herse Humptulips, Challenge Getaway, WTB Nano. Tubeless with sealant. Mudguards help in wet years. Frame bag + top tube bag for food. Rain jacket that actually works. Head torch if you're a slower finisher.",
  },
  {
    slug: "unbound-gravel",
    name: "Unbound Gravel",
    shortName: "Unbound",
    region: "USA",
    type: "gravel",
    distanceKm: 320,
    elevationGainM: 2800,
    typicalFinishTime: "12-20 hours",
    defaultMonth: "June",
    description:
      "Unbound Gravel is the world's biggest gravel event — 320km (200mi) across the Flint Hills of Kansas on rocky unpaved roads. Lottery entry, professional field mixed with amateurs, 100mi + 50mi options. Mud years and dust years both exist.",
    keyCharacteristics: [
      "320km (200mi) flagship + 100mi + 50mi options",
      "Flint Hills rocks destroy tyres, wheels, and souls",
      "Mud years (historic): bike-carrying, abandonments, DNFs at 50%",
      "Kansas heat: 25-35°C with no shade",
      "Self-navigated (GPS) after the first 20km",
    ],
    commonMistakes: [
      "Running tyres under 40mm — Unbound shreds light tyres",
      "Trying to ride from a sportive background without ultra pacing",
      "Underfueling because 'it's just bikes, not running' — 12-20 hours is ultra territory",
    ],
    pacingStrategy:
      "Unbound is an ultra with a drop bag. Pace at 55-60% of your 4-hour FTP as a realistic all-day ceiling. The rocks force constant micro-adjustments; you don't hold steady power like on road. Drop bag at checkpoints 2 and 3 — strategise what's in each bag before the start.",
    nutritionAngle:
      "80-100g carbs/hour for 12+ hours. Aid stations are official but crowded — own supply between them is faster. Heat means electrolytes dominate. Solid food at checkpoints, gels + bars between. Texan rule: if you're not peeing every 2 hours you're underfuelling.",
    kitAngle:
      "Gravel bike with 42-45mm tyres, reinforced sidewalls (Panaracer GravelKing SK+, Challenge Gravine Race, Rene Herse Stampede Pass). Tubeless mandatory. 2-3 tyre plugs + CO2 + spare tube. Mudguards optional (but essential in mud years). Hydration pack optional but helps in heat.",
  },
  {
    slug: "cape-epic",
    name: "Absa Cape Epic",
    shortName: "Cape Epic",
    region: "South Africa",
    type: "mtb",
    distanceKm: 700,
    elevationGainM: 15000,
    typicalFinishTime: "8 days (stage race)",
    defaultMonth: "March",
    description:
      "The Absa Cape Epic is the premier 8-day MTB stage race — 700km + 15,000m of climbing across the Western Cape of South Africa, raced in teams of two. World Series status, lottery entry, the hardest amateur MTB event on earth.",
    keyCharacteristics: [
      "8-day stage race — sleep, recover, repeat",
      "Raced in teams of 2 — you finish together or you DNF",
      "Technical singletrack AND long climbs on each stage",
      "Heat, dust, and altitude variations across the Cape",
      "Stage cut-offs — slower teams eliminated during the week",
    ],
    commonMistakes: [
      "Arriving undertrained for back-to-back 6-8 hour days",
      "Mismatching partner fitness — you ride at the slower rider's pace",
      "Skipping the first two stages' recovery protocols — day 5 is where it breaks",
    ],
    pacingStrategy:
      "Cape Epic pacing is multi-day pacing, not single-stage racing. Target day 1 at 70-75% of a single-day race effort. Recovery — sleep, nutrition, legs up — is the race after day 3. The strongest teams at the finish line are those who held back on days 1-3 and still had legs on days 5-8.",
    nutritionAngle:
      "Daily calorie intake 5,000-7,000 kcal during the event. Fuel on the bike aggressively (80g carbs/hour). Recovery window post-stage: 4:1 carb:protein within 30 minutes. Hydrate all day every day — dehydration compounds across stages.",
    kitAngle:
      "Trail or lightweight XC full-suspension. 2.3-2.4\" tyres with good sidewalls (MaxxTerra or Enduro casing). Service-day bike fleet access (mandatory at the Cape Epic). 2x kit pieces of everything. Tyre plugs, pump, CO2, multitool.",
  },
  {
    slug: "trans-pyrenees",
    name: "Trans Pyrenees",
    shortName: "Trans Pyrenees",
    region: "France / Spain",
    type: "ultra",
    distanceKm: 1500,
    elevationGainM: 35000,
    typicalFinishTime: "6-9 days",
    defaultMonth: "October",
    description:
      "Trans Pyrenees is one of the hardest self-supported ultras in Europe — 1,500km from Biarritz to Barcelona (or reverse) across every major pass in the Pyrenees, with 35,000m of climbing. 6-9 day finishes. October weather unpredictable.",
    keyCharacteristics: [
      "35,000m climbing — that's 4× Everest across the event",
      "Every HC and Cat 1 Pyrenean pass featured — Tourmalet, Aubisque, Aspin, Peyresourde, Porto",
      "October weather: snow on passes, freezing rain, wind",
      "Self-supported — you carry, you sleep where you can",
      "Mandatory tracker, daily check-in times",
    ],
    commonMistakes: [
      "Treating it like Badlands (Mediterranean) — the Pyrenees are colder, wetter, mountainous",
      "Underspecing kit — October above 1,800m needs winter gear",
      "Sleep deprivation affecting descending safety on day 4+",
    ],
    pacingStrategy:
      "Trans Pyrenees is a climbing-dominated ultra. Pace on the climbs — not the flats. Target sub-threshold on every pass, regardless of time pressure. Sleep 5-7 hours/day for sustainable progress. Check weather nightly and pick tomorrow's start time accordingly.",
    nutritionAngle:
      "No aid stations. Resupply at open shops, cafés, petrol stations. 80-100g carbs/hour on the bike, with real food stops at cafés every 4-5 hours. Hot drinks at altitude pass points matter more than people expect. Carry extra gels for nighttime emergencies.",
    kitAngle:
      "Full bikepacking kit. Dynamo hub for lights + devices. 32-35mm tyres with reinforcement. Waterproof jacket, waterproof gloves, waterproof socks. Bivvy + sleeping bag rated to 0°C. Emergency mylar blanket. Spare battery pack.",
  },
];

/* ============================================================ */
/* Phases                                                       */
/* ============================================================ */

export const PHASES: TrainingPhase[] = [
  {
    slug: "16-weeks-out",
    weeksOut: 16,
    label: "BASE PHASE",
    tagline: "Aerobic foundation. High volume, low intensity. Don't skip this.",
    focus:
      "Sixteen weeks out, your job is volume. Forget intervals. Forget Strava. Build the aerobic engine that every later phase sits on top of. 80% of your time should be in Zone 2 — conversational pace, nose-breathing territory. If your base phase feels easy, you're doing it right.",
    anchorSession: {
      name: "The long Z2 ride",
      detail:
        "One 3-4 hour steady Zone 2 ride per week. Flat to rolling route. Cadence 85-95rpm. Heart rate below first ventilatory threshold the whole way. This is where your mitochondrial density grows.",
    },
    weekStructure: [
      { day: "Monday", session: "Rest or 45min Z1", detail: "Recovery day — coffee spin only if you want to." },
      { day: "Tuesday", session: "90min Z2 endurance", detail: "Steady, controlled, aerobic." },
      { day: "Wednesday", session: "1h strength + 30min easy spin", detail: "Squats, deadlifts, core. Builds what the bike can't." },
      { day: "Thursday", session: "90min Z2 with 3x5min tempo", detail: "Intro to structured effort — don't race it." },
      { day: "Friday", session: "Rest", detail: "Genuine rest. The adaptations happen now." },
      { day: "Saturday", session: "3-4h long Z2 ride", detail: "Anchor session. Fueled from minute 30." },
      { day: "Sunday", session: "90min group ride or solo Z2", detail: "Social pace. No heroes allowed." },
    ],
    gotcha:
      "The #1 base-phase mistake: riding too hard on easy days. If you arrive at Saturday already tired, you'll never build the aerobic depth you need. Discipline the volume, discipline the intensity.",
  },
  {
    slug: "12-weeks-out",
    weeksOut: 12,
    label: "LATE BASE",
    tagline: "Bridge phase. Volume still rules, but structure begins.",
    focus:
      "Twelve weeks out, you're still building the base — but specific structure is starting to appear. Tempo work enters the picture one day a week. Long rides get longer. This is where the event-specific fitness starts to take shape without compromising your aerobic foundation.",
    anchorSession: {
      name: "Tempo sandwich",
      detail:
        "2x20min at tempo (76-88% FTP) inside a 2-hour Z2 ride. Steady, controlled, not a time trial. This is your first taste of extended race-pace efforts.",
    },
    weekStructure: [
      { day: "Monday", session: "Rest", detail: "Non-negotiable." },
      { day: "Tuesday", session: "Tempo sandwich (2h)", detail: "2x20min tempo inside steady Z2." },
      { day: "Wednesday", session: "Strength + 1h recovery spin", detail: "Keep the gym work periodised." },
      { day: "Thursday", session: "2h Z2 with 4x8min tempo", detail: "Progressive tempo work." },
      { day: "Friday", session: "Rest or easy 30min", detail: "Protect the weekend." },
      { day: "Saturday", session: "4-5h long ride with event-specific terrain", detail: "Mimic your target event's profile." },
      { day: "Sunday", session: "2h Z2 recovery ride", detail: "Active recovery, conversational pace." },
    ],
    gotcha:
      "Don't start threshold intervals yet. The build phase will come. If you jump intensity too early you'll peak 6 weeks before race day and arrive flat.",
  },
  {
    slug: "8-weeks-out",
    weeksOut: 8,
    label: "BUILD PHASE",
    tagline: "Structured intensity enters. Threshold + VO2 max work.",
    focus:
      "Eight weeks out, the build phase kicks in. One threshold session, one VO2 max session, and the long ride all in a week. Volume stays high, but now intensity layers on top. This is where your FTP should start climbing — if it doesn't, distribution is wrong, not effort.",
    anchorSession: {
      name: "2x20min threshold",
      detail:
        "Warm up 15min. 2x20min at 91-105% FTP with 5min recovery between. Cool down. Hit the target power both reps — if you fade the second, you started too hard. This is your bread-and-butter threshold session.",
    },
    weekStructure: [
      { day: "Monday", session: "Rest", detail: "Recovery is a session — treat it like one." },
      { day: "Tuesday", session: "Threshold intervals (2x20min)", detail: "Your key quality session of the week." },
      { day: "Wednesday", session: "90min Z2 + strength", detail: "Reduced gym volume — maintenance only." },
      { day: "Thursday", session: "VO2 max (4x4min @ 106-120% FTP)", detail: "Push the ceiling. Rep 4 should be the hardest." },
      { day: "Friday", session: "Rest or 45min recovery", detail: "Legs up." },
      { day: "Saturday", session: "4-6h long ride with 3x15min at event pace", detail: "Specificity starts here." },
      { day: "Sunday", session: "2h Z2", detail: "Active recovery." },
    ],
    gotcha:
      "Do not stack threshold and VO2 max back-to-back. 48 hours minimum between quality sessions. Stacking kills the adaptation and makes you fragile.",
  },
  {
    slug: "4-weeks-out",
    weeksOut: 4,
    label: "PEAK PHASE",
    tagline: "Event-specific sharpening. Volume drops, quality rises.",
    focus:
      "Four weeks out, you stop building and start sharpening. Volume drops 15-20%. Intensity gets very specific to your event. Long rides mimic race pacing. The goal is to arrive fresh, not fitter — if you're still building now, you peaked wrong.",
    anchorSession: {
      name: "Event simulation",
      detail:
        "One 3-hour ride that mimics the first 3 hours of your target event. Same pace, same fueling, same kit. If your event has a big early climb, include one. Your legs learn what race pace feels like.",
    },
    weekStructure: [
      { day: "Monday", session: "Rest", detail: "Protect recovery aggressively now." },
      { day: "Tuesday", session: "Threshold (3x10min)", detail: "Shorter, sharper threshold reps." },
      { day: "Wednesday", session: "60min Z2", detail: "Just keeping the legs open." },
      { day: "Thursday", session: "Race-pace intervals (5x5min)", detail: "At your target sportive pace." },
      { day: "Friday", session: "Rest", detail: "Full rest — no bike." },
      { day: "Saturday", session: "3h event simulation", detail: "Dial in pacing + fueling + kit." },
      { day: "Sunday", session: "90min Z2", detail: "Easy, social." },
    ],
    gotcha:
      "The peak phase is when amateurs panic-train. Resist. Extra volume here creates fatigue that sits in your legs on race day. Trust the base.",
  },
  {
    slug: "2-weeks-out",
    weeksOut: 2,
    label: "TAPER",
    tagline: "Sharpness is banked. Now shed fatigue.",
    focus:
      "Two weeks out you're in taper territory. Fitness plateaus or nudges up — you don't lose meaningful fitness in two weeks, but fatigue disappears fast. Short sharp efforts to keep legs awake. Everything else is volume reduction.",
    anchorSession: {
      name: "Race-pace openers",
      detail:
        "60min ride with 3x3min at race pace + 3x1min at VO2. Not training — priming. The efforts remind your legs what fast feels like. Nothing more.",
    },
    weekStructure: [
      { day: "Monday", session: "Rest", detail: "Rest is the session." },
      { day: "Tuesday", session: "Openers (60min)", detail: "Short sharp race-pace primers." },
      { day: "Wednesday", session: "45min Z1", detail: "Coffee spin." },
      { day: "Thursday", session: "60min Z2 with 2x5min at threshold", detail: "Final sharpening effort." },
      { day: "Friday", session: "Rest", detail: "Full rest." },
      { day: "Saturday", session: "90min Z2 with openers", detail: "Short, easy, prep the pre-event day." },
      { day: "Sunday", session: "60min Z1 or rest", detail: "Total reset." },
    ],
    gotcha:
      "The taper-anxiety mistake: riding harder in taper because your legs feel fresh. Fresh legs aren't a problem — they're the whole point. Hold the line.",
  },
  {
    slug: "1-week-out",
    weeksOut: 1,
    label: "RACE WEEK",
    tagline: "Don't do anything clever. Eat, sleep, show up.",
    focus:
      "Race week is about arriving at the start line fresh, hydrated, and calm. The training is done. Hard sessions now cost you more than they give you. Every hour of good sleep in the final 72 hours does more than any workout could.",
    anchorSession: {
      name: "Race morning openers",
      detail:
        "20 minutes on the bike, morning of the event or day before, with 3x30sec at race pace. Wakes legs up without draining anything. That's it.",
    },
    weekStructure: [
      { day: "Monday", session: "45min Z1 + openers (3x1min race pace)", detail: "Legs awake, fatigue low." },
      { day: "Tuesday", session: "Rest or 30min easy", detail: "Focus on hydration + sleep." },
      { day: "Wednesday", session: "60min with 4x30sec race pace", detail: "Final primer — nothing heroic." },
      { day: "Thursday", session: "Rest", detail: "Start carb-loading today." },
      { day: "Friday", session: "30min easy spin + openers", detail: "Race check. Kit lay-out. Route review." },
      { day: "Saturday (race day -1)", session: "20-30min very easy", detail: "Or rest. Whichever calms nerves." },
      { day: "Race Day", session: "Event", detail: "Pace it. Fuel it. Enjoy it." },
    ],
    gotcha:
      "Race-week mistakes are always additive — an extra hard session, extra volume, an unfamiliar food. Do less. The last week cannot make you fitter. It can absolutely make you slower.",
  },
];

/* ============================================================ */
/* Lookups + helpers                                            */
/* ============================================================ */

export function getEvent(slug: string): TrainingEvent | null {
  return EVENTS.find((e) => e.slug === slug) ?? null;
}

export function getPhase(slug: string): TrainingPhase | null {
  return PHASES.find((p) => p.slug === slug) ?? null;
}

export function getAllEventSlugs(): string[] {
  return EVENTS.map((e) => e.slug);
}

export function getAllPhaseSlugs(): string[] {
  return PHASES.map((p) => p.slug);
}

/** All event × phase combinations — generates the static params. */
export function getAllPlanCombinations(): {
  event: string;
  weeksOut: string;
}[] {
  const combos: { event: string; weeksOut: string }[] = [];
  for (const e of EVENTS) {
    for (const p of PHASES) {
      combos.push({ event: e.slug, weeksOut: p.slug });
    }
  }
  return combos;
}

/**
 * For an event + current phase, return the NEXT phase slug (closer to race)
 * and the PREVIOUS phase slug (further from race). Used to surface links
 * between the weeks-out stages for a given event.
 */
export function getAdjacentPhases(phaseSlug: string): {
  prev: TrainingPhase | null;
  next: TrainingPhase | null;
} {
  const idx = PHASES.findIndex((p) => p.slug === phaseSlug);
  return {
    prev: idx > 0 ? PHASES[idx - 1] : null,
    next: idx >= 0 && idx < PHASES.length - 1 ? PHASES[idx + 1] : null,
  };
}
