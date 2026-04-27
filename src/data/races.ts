export interface Climb {
  name: string;
  elevation_m: number;
  length_km: number;
  avg_gradient: number;
}

export interface FinishTimes {
  beginner: string;
  intermediate: string;
  advanced: string;
  elite: string;
}

export interface Race {
  name: string;
  slug: string;
  distance_km: number;
  elevation_m: number;
  location: string;
  country: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  key_climbs: Climb[];
  typical_finish_times: FinishTimes;
  similar_races: string[];
  month?: string;
  website?: string;
  tags: string[];
  /** Slug of the matching course in the Race Predictor (/predict/[slug]), if one exists. */
  predictor_slug?: string;
}

export const RACES: Race[] = [
  {
    name: "Étape du Tour",
    slug: "etape-du-tour",
    distance_km: 168,
    elevation_m: 4800,
    location: "French Alps",
    country: "France",
    difficulty: 5,
    description:
      "The chance to ride a stage of the Tour de France before the pros. The Étape follows an actual Tour stage through the high Alps — often including two or three legendary climbs in a single day. The route changes annually, alternating between Alpine, Pyrénéan and Massif Central editions, but the ambition never wavers: finish on the same roads as the world's best riders.",
    key_climbs: [
      { name: "Col du Galibier", elevation_m: 2642, length_km: 17.7, avg_gradient: 5.5 },
      { name: "Col du Télégraphe", elevation_m: 1566, length_km: 11.9, avg_gradient: 7.1 },
      { name: "Alpe d'Huez", elevation_m: 1850, length_km: 13.8, avg_gradient: 8.1 },
    ],
    typical_finish_times: {
      beginner: "10–14h",
      intermediate: "7–10h",
      advanced: "5–7h",
      elite: "4–5h",
    },
    similar_races: ["la-marmotte", "haute-route-alps", "maratona-dles-dolomites"],
    month: "July",
    website: "https://www.letapedutour.com",
    tags: ["gran fondo", "alpine", "tour de france", "france", "cols"],
    predictor_slug: "etape-du-tour-2026",
  },
  {
    name: "La Marmotte",
    slug: "la-marmotte",
    distance_km: 174,
    elevation_m: 5181,
    location: "Bourg-d'Oisans, French Alps",
    country: "France",
    difficulty: 5,
    description:
      "One of the hardest sportives in the world and a bucket-list event for serious amateur cyclists. La Marmotte links the Col du Glandon, Col du Télégraphe, Col du Galibier and Alpe d'Huez — four legendary Alpine climbs — in a single 174km day. The 5,000m of elevation gain demands months of structured preparation. Finish times under 8 hours earn a gold medal; under 10 hours earns silver.",
    key_climbs: [
      { name: "Col du Glandon", elevation_m: 1924, length_km: 21.3, avg_gradient: 5.1 },
      { name: "Col du Télégraphe", elevation_m: 1566, length_km: 11.9, avg_gradient: 7.1 },
      { name: "Col du Galibier", elevation_m: 2642, length_km: 17.7, avg_gradient: 5.5 },
      { name: "Alpe d'Huez", elevation_m: 1850, length_km: 13.8, avg_gradient: 8.1 },
    ],
    typical_finish_times: {
      beginner: "11–14h",
      intermediate: "8–11h",
      advanced: "6–8h",
      elite: "5–6h",
    },
    similar_races: ["etape-du-tour", "otztaler-radmarathon", "maratona-dles-dolomites"],
    month: "July",
    website: "https://www.marmottegranfondoseries.com",
    tags: ["gran fondo", "alpine", "alpe d'huez", "france", "cols", "classic"],
    predictor_slug: "marmotte-granfondo-alpes",
  },
  {
    name: "Mallorca 312",
    slug: "mallorca-312",
    distance_km: 312,
    elevation_m: 5200,
    location: "Mallorca",
    country: "Spain",
    difficulty: 5,
    description:
      "An ultra-endurance challenge that circumnavigates the island of Mallorca in a single day. The 312km distance with 5,200m of climbing makes this one of the longest one-day sportives in the world. The Serra de Tramuntana mountain range dominates the northern part of the route, offering sustained climbs with spectacular sea views. Completing this is a genuine achievement even for well-trained riders.",
    key_climbs: [
      { name: "Sa Calobra", elevation_m: 682, length_km: 9.4, avg_gradient: 7.1 },
      { name: "Puig Major", elevation_m: 820, length_km: 12.6, avg_gradient: 6.6 },
      { name: "Coll de Sóller", elevation_m: 486, length_km: 7.8, avg_gradient: 6.3 },
    ],
    typical_finish_times: {
      beginner: "16–20h",
      intermediate: "12–16h",
      advanced: "9–12h",
      elite: "8–9h",
    },
    similar_races: ["raid-pyreneen", "otztaler-radmarathon", "dragon-ride"],
    month: "April",
    website: "https://www.mallorca312.com",
    tags: ["ultra endurance", "gran fondo", "island", "spain", "mediterranean"],
    predictor_slug: "mallorca-312",
  },
  {
    name: "Wicklow 200",
    slug: "wicklow-200",
    distance_km: 200,
    elevation_m: 3800,
    location: "County Wicklow",
    country: "Ireland",
    difficulty: 4,
    description:
      "Ireland's most iconic sportive and one of the longest-running in Europe. The Wicklow 200 takes riders through the wild Wicklow Mountains — past Glendalough, over the Sally Gap and Wicklow Gap, and into some of Ireland's most dramatic upland scenery. The roads are often wet, the wind is frequently savage, and the gradients are relentless. A true test of mental and physical endurance.",
    key_climbs: [
      { name: "Sally Gap", elevation_m: 493, length_km: 9.2, avg_gradient: 5.4 },
      { name: "Wicklow Gap", elevation_m: 474, length_km: 11.0, avg_gradient: 4.3 },
      { name: "Shay Elliott Memorial Climb", elevation_m: 525, length_km: 7.6, avg_gradient: 5.9 },
    ],
    typical_finish_times: {
      beginner: "10–14h",
      intermediate: "8–10h",
      advanced: "6–8h",
      elite: "5–6h",
    },
    similar_races: ["ring-of-kerry", "tour-de-yorkshire", "dragon-ride"],
    month: "June",
    tags: ["gran fondo", "ireland", "mountain", "classic", "endurance"],
  },
  {
    name: "Ring of Kerry",
    slug: "ring-of-kerry",
    distance_km: 180,
    elevation_m: 2500,
    location: "County Kerry",
    country: "Ireland",
    difficulty: 3,
    description:
      "A classic Irish sportive that follows the famous Ring of Kerry tourist route around the Iveragh Peninsula. The route combines spectacular Atlantic coastline, traditional Irish villages and the Kerry Mountains. Less brutal than Wicklow but longer than it looks on paper — the rolling terrain adds up quickly and the Irish weather is always a wildcard. A strong community event with thousands of participants.",
    key_climbs: [
      { name: "Coomakista Pass", elevation_m: 215, length_km: 3.8, avg_gradient: 5.6 },
      { name: "Moll's Gap", elevation_m: 258, length_km: 5.1, avg_gradient: 5.0 },
      { name: "Ballaghbeama Gap", elevation_m: 281, length_km: 6.4, avg_gradient: 4.4 },
    ],
    typical_finish_times: {
      beginner: "8–12h",
      intermediate: "6–8h",
      advanced: "5–6h",
      elite: "4–5h",
    },
    similar_races: ["wicklow-200", "velo-birmingham", "ridelondon"],
    month: "July",
    tags: ["gran fondo", "ireland", "coastal", "classic"],
  },
  {
    name: "Fred Whitton Challenge",
    slug: "fred-whitton",
    distance_km: 181,
    elevation_m: 4084,
    location: "Lake District, Cumbria",
    country: "England",
    difficulty: 5,
    description:
      "Widely regarded as England's hardest sportive. The Fred Whitton passes over nine Lake District passes including Hardknott and Wrynose — the steepest roads in England, with sections exceeding 30% gradient. There is no shame in walking. The route is visually stunning and brutally demanding in equal measure. Named after Fred Whitton, a much-loved cyclist who died in 1998.",
    key_climbs: [
      { name: "Hardknott Pass", elevation_m: 393, length_km: 2.4, avg_gradient: 19.8 },
      { name: "Wrynose Pass", elevation_m: 393, length_km: 4.0, avg_gradient: 9.8 },
      { name: "Kirkstone Pass", elevation_m: 454, length_km: 4.1, avg_gradient: 11.1 },
      { name: "Honister Pass", elevation_m: 356, length_km: 3.2, avg_gradient: 11.1 },
    ],
    typical_finish_times: {
      beginner: "10–14h",
      intermediate: "8–10h",
      advanced: "6–8h",
      elite: "5–6h",
    },
    similar_races: ["dragon-ride", "wicklow-200", "tour-de-yorkshire"],
    month: "May",
    tags: ["gran fondo", "england", "lake district", "mountains", "classic", "cobbles"],
  },
  {
    name: "Maratona dles Dolomites",
    slug: "maratona-dles-dolomites",
    distance_km: 138,
    elevation_m: 4230,
    location: "Alta Badia, Dolomites",
    country: "Italy",
    difficulty: 5,
    description:
      "Possibly the most beautiful cycling event in the world. The Maratona dles Dolomites passes through the UNESCO World Heritage Dolomites, crossing seven iconic mountain passes in a single day. The event is massively oversubscribed — entry is by ballot only — making it one of the most coveted bibs in cycling. The climbs are relentless, the scenery is otherworldly, and the atmosphere is electric.",
    key_climbs: [
      { name: "Passo Campolongo", elevation_m: 1875, length_km: 5.5, avg_gradient: 7.0 },
      { name: "Passo Pordoi", elevation_m: 2239, length_km: 9.4, avg_gradient: 6.8 },
      { name: "Passo Sella", elevation_m: 2244, length_km: 5.5, avg_gradient: 7.9 },
      { name: "Passo Giau", elevation_m: 2236, length_km: 9.8, avg_gradient: 9.3 },
      { name: "Passo Falzarego", elevation_m: 2105, length_km: 13.8, avg_gradient: 5.9 },
    ],
    typical_finish_times: {
      beginner: "9–12h",
      intermediate: "7–9h",
      advanced: "5–7h",
      elite: "4–5h",
    },
    similar_races: ["la-marmotte", "etape-du-tour", "otztaler-radmarathon"],
    month: "July",
    website: "https://www.maratona.it",
    tags: ["gran fondo", "dolomites", "italy", "mountains", "ballot", "iconic"],
  },
  {
    name: "L'Eroica",
    slug: "leroica",
    distance_km: 209,
    elevation_m: 4600,
    location: "Gaiole in Chianti, Tuscany",
    country: "Italy",
    difficulty: 4,
    description:
      "The most unique event in cycling. L'Eroica requires riders to use vintage bicycles and clothing from before 1987 — steel frames, downtube shifters, wool jerseys. The route crosses the famous strade bianche (white gravel roads) of Tuscany's Chianti wine country. The combination of heritage, beauty and difficulty has made this a phenomenon, spawning editions worldwide. A celebration of cycling's soul.",
    key_climbs: [
      { name: "Montemaggio", elevation_m: 686, length_km: 11.2, avg_gradient: 6.1 },
      { name: "Lucignano d'Arbia", elevation_m: 324, length_km: 7.1, avg_gradient: 4.5 },
    ],
    typical_finish_times: {
      beginner: "12–16h",
      intermediate: "9–12h",
      advanced: "7–9h",
      elite: "6–7h",
    },
    similar_races: ["tour-of-flanders-cyclo", "liege-bastogne-liege", "maratona-dles-dolomites"],
    month: "October",
    website: "https://eroica.cc",
    tags: ["vintage", "gravel", "gran fondo", "italy", "strade bianche", "tuscany", "iconic"],
  },
  {
    name: "Haute Route Alps",
    slug: "haute-route-alps",
    distance_km: 920,
    elevation_m: 21000,
    location: "Nice to Geneva",
    country: "France / Italy / Switzerland",
    difficulty: 5,
    description:
      "Seven days. 920km. 21,000m of climbing. The Haute Route Alps is the ultimate amateur cycling challenge, riding from Nice through the highest mountain passes of the Alps to Geneva. Daily stages average 130km with 3,000m of climbing. Riders race each stage with live timing, creating a genuine race-within-an-event atmosphere. Completion alone is an achievement; going fast is something else entirely.",
    key_climbs: [
      { name: "Col de la Bonette", elevation_m: 2802, length_km: 24.1, avg_gradient: 5.9 },
      { name: "Col du Galibier", elevation_m: 2642, length_km: 17.7, avg_gradient: 5.5 },
      { name: "Col de l'Iseran", elevation_m: 2764, length_km: 13.0, avg_gradient: 7.4 },
      { name: "Alpe d'Huez", elevation_m: 1850, length_km: 13.8, avg_gradient: 8.1 },
    ],
    typical_finish_times: {
      beginner: "Multi-day event",
      intermediate: "Multi-day event",
      advanced: "Multi-day event",
      elite: "Multi-day event",
    },
    similar_races: ["raid-pyreneen", "mallorca-312", "otztaler-radmarathon"],
    month: "August",
    website: "https://www.hauteroute.org",
    tags: ["multi-day", "ultra endurance", "alps", "france", "switzerland", "italy", "iconic"],
  },
  {
    name: "Dragon Ride",
    slug: "dragon-ride",
    distance_km: 311,
    elevation_m: 4700,
    location: "Brecon Beacons, Wales",
    country: "Wales",
    difficulty: 5,
    description:
      "The UK's toughest sportive follows the quiet lanes of the Brecon Beacons and Black Mountains in South Wales. The Gran Fondo route covers 311km with nearly 5,000m of climbing — matching Alpine events for pure brutality, but on Welsh mountain roads rather than iconic passes. Multiple distance options make it accessible at all levels, but the full Gran Fondo is reserved for riders who mean serious business.",
    key_climbs: [
      { name: "Bwlch y Groes", elevation_m: 544, length_km: 7.6, avg_gradient: 7.2 },
      { name: "Gospel Pass", elevation_m: 542, length_km: 8.3, avg_gradient: 6.5 },
      { name: "Rhigos Mountain", elevation_m: 421, length_km: 5.3, avg_gradient: 7.9 },
    ],
    typical_finish_times: {
      beginner: "14–18h",
      intermediate: "10–14h",
      advanced: "8–10h",
      elite: "7–8h",
    },
    similar_races: ["fred-whitton", "mallorca-312", "wicklow-200"],
    month: "June",
    tags: ["gran fondo", "wales", "uk", "mountains", "ultra endurance"],
    predictor_slug: "dragon-ride-gran-fondo",
  },
  {
    name: "RideLondon-Surrey 100",
    slug: "ridelondon",
    distance_km: 161,
    elevation_m: 1280,
    location: "London and Surrey",
    country: "England",
    difficulty: 2,
    description:
      "Britain's biggest cycling event by participation, with thousands of riders heading out of central London on closed roads through Surrey's leafy lanes. The route is relatively accessible — mostly flat or gently rolling — making it a genuine target for cyclists at all levels. The closed-road experience through central London and along the Surrey Hills is unique and the atmosphere is unbeatable.",
    key_climbs: [
      { name: "Box Hill", elevation_m: 162, length_km: 2.5, avg_gradient: 6.5 },
      { name: "Leith Hill", elevation_m: 294, length_km: 3.2, avg_gradient: 9.2 },
    ],
    typical_finish_times: {
      beginner: "6–8h",
      intermediate: "5–6h",
      advanced: "4–5h",
      elite: "3:30–4h",
    },
    similar_races: ["velo-birmingham", "ring-of-kerry", "gran-fondo-new-york"],
    month: "May",
    website: "https://www.ridelondon.co.uk",
    tags: ["gran fondo", "england", "london", "flat", "mass participation", "closed roads"],
    predictor_slug: "ridelondon-classique-100",
  },
  {
    name: "Gran Fondo New York",
    slug: "gran-fondo-new-york",
    distance_km: 175,
    elevation_m: 2300,
    location: "New York City, New York",
    country: "USA",
    difficulty: 3,
    description:
      "North America's premier gran fondo starts in the heart of Manhattan and crosses the George Washington Bridge into New Jersey and Rockland County. The route combines flat sections through the Hudson Valley with meaningful climbs — most notably Perkins Memorial Drive — before returning to the city. The New York backdrop makes this a bucket-list event for cyclists worldwide.",
    key_climbs: [
      { name: "Perkins Memorial Drive", elevation_m: 491, length_km: 7.8, avg_gradient: 6.3 },
      { name: "Seven Lakes Drive", elevation_m: 215, length_km: 9.1, avg_gradient: 2.4 },
    ],
    typical_finish_times: {
      beginner: "7–10h",
      intermediate: "5–7h",
      advanced: "4–5h",
      elite: "3:30–4h",
    },
    similar_races: ["ridelondon", "velo-birmingham", "cape-town-cycle-tour"],
    month: "May",
    website: "https://granfondonewyork.com",
    tags: ["gran fondo", "usa", "new york", "iconic", "international"],
  },
  {
    name: "Quebrantahuesos",
    slug: "quebrantahuesos",
    distance_km: 205,
    elevation_m: 3700,
    location: "Sabiñánigo, Huesca",
    country: "Spain",
    difficulty: 4,
    description:
      "Spain's most celebrated sportive, the name translates as 'bone-breaker' — and it doesn't lie. Starting in Sabiñánigo in the Spanish Pyrenees, the route crosses into France at the Somport tunnel before climbing the Col du Pourtalet (Portalet) and returning via Biescas. The Pyrenean scenery is spectacular and less touristy than the Tour de France Alps, making this a rewarding choice for those seeking a less crowded classic.",
    key_climbs: [
      { name: "Puerto de Somport", elevation_m: 1632, length_km: 17.5, avg_gradient: 5.4 },
      { name: "Col du Pourtalet (Portalet)", elevation_m: 1794, length_km: 14.9, avg_gradient: 5.9 },
      { name: "Puerto de Cotefablo", elevation_m: 1420, length_km: 9.8, avg_gradient: 7.1 },
    ],
    typical_finish_times: {
      beginner: "9–12h",
      intermediate: "7–9h",
      advanced: "5:30–7h",
      elite: "4:30–5:30h",
    },
    similar_races: ["etape-du-tour", "raid-pyreneen", "la-marmotte"],
    month: "June",
    website: "https://quebrantahuesos.com",
    tags: ["gran fondo", "pyrenees", "spain", "mountain", "classic"],
  },
  {
    name: "Ötztaler Radmarathon",
    slug: "otztaler-radmarathon",
    distance_km: 238,
    elevation_m: 5500,
    location: "Sölden, Ötztal",
    country: "Austria",
    difficulty: 5,
    description:
      "The Ötztaler is routinely rated one of the world's hardest one-day cycling events. Starting in Sölden, the route climbs four major Alpine passes — Kühtai, Brenner, Jaufenpass and the legendary Timmelsjoch — in a single 238km day. Entry is by ballot only. The 5,500m of climbing separates this from almost everything else: even strong riders find the final climb to Timmelsjoch a survival exercise.",
    key_climbs: [
      { name: "Kühtai", elevation_m: 2017, length_km: 22.0, avg_gradient: 6.1 },
      { name: "Brenner Pass", elevation_m: 1374, length_km: 22.0, avg_gradient: 6.2 },
      { name: "Jaufenpass", elevation_m: 2094, length_km: 16.4, avg_gradient: 7.1 },
      { name: "Timmelsjoch", elevation_m: 2509, length_km: 29.9, avg_gradient: 7.1 },
    ],
    typical_finish_times: {
      beginner: "12–16h",
      intermediate: "9–12h",
      advanced: "7–9h",
      elite: "6–7h",
    },
    similar_races: ["la-marmotte", "maratona-dles-dolomites", "haute-route-alps"],
    month: "September",
    tags: ["gran fondo", "austria", "alps", "classic", "ballot", "iconic", "extreme"],
  },
  {
    name: "Cape Town Cycle Tour",
    slug: "cape-town-cycle-tour",
    distance_km: 109,
    elevation_m: 1030,
    location: "Cape Town, Western Cape",
    country: "South Africa",
    difficulty: 2,
    description:
      "One of the world's largest individually timed cycling events, with over 35,000 riders tackling the famous route around the Cape Peninsula. The scenery is genuinely world-class — Chapman's Peak Drive, the slopes of Table Mountain, False Bay and the Atlantic Seaboard all feature. A technically accessible event with a challenge from the Cape Peninsula's famous southeaster wind, which can make the coastal sections brutally difficult.",
    key_climbs: [
      { name: "Chapman's Peak", elevation_m: 373, length_km: 5.5, avg_gradient: 6.8 },
      { name: "Suikerbossie", elevation_m: 260, length_km: 3.1, avg_gradient: 8.4 },
    ],
    typical_finish_times: {
      beginner: "4:30–7h",
      intermediate: "3:30–4:30h",
      advanced: "2:45–3:30h",
      elite: "2:20–2:45h",
    },
    similar_races: ["ridelondon", "velo-birmingham", "gran-fondo-new-york"],
    month: "March",
    website: "https://www.cycletour.co.za",
    tags: ["gran fondo", "south africa", "mass participation", "coastal", "iconic"],
  },
  {
    name: "Liège-Bastogne-Liège Cyclosportive",
    slug: "liege-bastogne-liege",
    distance_km: 259,
    elevation_m: 4800,
    location: "Liège, Wallonia",
    country: "Belgium",
    difficulty: 4,
    description:
      "La Doyenne — the oldest classic on the professional calendar. The sportive version follows the same route as the professional race on the same weekend, giving amateur riders the chance to experience true cobblestone-era cycling. The Ardennes climbs are short and vicious rather than long and grinding: dozens of punchy walls pile up over 259km, culminating in the Côte de la Redoute and Roche-aux-Faucons before the finish in Liège.",
    key_climbs: [
      { name: "Côte de Wanne", elevation_m: 522, length_km: 3.8, avg_gradient: 7.1 },
      { name: "Côte de Stockeu", elevation_m: 494, length_km: 1.0, avg_gradient: 12.5 },
      { name: "La Redoute", elevation_m: 524, length_km: 2.0, avg_gradient: 8.8 },
      { name: "Roche-aux-Faucons", elevation_m: 415, length_km: 1.3, avg_gradient: 11.0 },
    ],
    typical_finish_times: {
      beginner: "12–16h",
      intermediate: "9–12h",
      advanced: "7–9h",
      elite: "6–7h",
    },
    similar_races: ["tour-of-flanders-cyclo", "leroica", "quebrantahuesos"],
    month: "April",
    website: "https://www.liegecyclosportive.be",
    tags: ["gran fondo", "belgium", "ardennes", "classics", "cobbles", "iconic"],
  },
  {
    name: "Tour of Flanders Cyclo",
    slug: "tour-of-flanders-cyclo",
    distance_km: 228,
    elevation_m: 2600,
    location: "Bruges to Oudenaarde, Flanders",
    country: "Belgium",
    difficulty: 4,
    description:
      "The Ronde van Vlaanderen Cyclo gives amateur cyclists the chance to ride cobbled climbs, narrow lanes and legendary bergs of Belgian cycling. The course covers many of the same iconic sections as the professional race — the Koppenberg, Oude Kwaremont, Paterberg — and finishes in Oudenaarde just like the pros. Cobblestones and steep ramps demand more than raw fitness: bike-handling and tactical riding matter enormously.",
    key_climbs: [
      { name: "Koppenberg", elevation_m: 77, length_km: 0.6, avg_gradient: 22.0 },
      { name: "Paterberg", elevation_m: 84, length_km: 0.36, avg_gradient: 20.3 },
      { name: "Oude Kwaremont", elevation_m: 153, length_km: 2.2, avg_gradient: 6.7 },
      { name: "Wijnpers (Kapelmuur)", elevation_m: 79, length_km: 0.5, avg_gradient: 9.3 },
    ],
    typical_finish_times: {
      beginner: "10–14h",
      intermediate: "8–10h",
      advanced: "6–8h",
      elite: "5:30–6h",
    },
    similar_races: ["liege-bastogne-liege", "leroica", "fred-whitton"],
    month: "April",
    website: "https://www.rondevanvlaanderen.be/en/cyclo",
    tags: ["gran fondo", "belgium", "cobbles", "classics", "flanders", "iconic"],
    predictor_slug: "tour-of-flanders-sportive",
  },
  {
    name: "Raid Pyrénéen",
    slug: "raid-pyreneen",
    distance_km: 720,
    elevation_m: 15000,
    location: "Hendaye to Cerbère",
    country: "France / Spain",
    difficulty: 5,
    description:
      "The Raid Pyrénéen is a self-supported cycling odyssey spanning the entire Pyrenean mountain range from the Atlantic to the Mediterranean. Riders must collect stamps at control points along the way, tackling some of cycling's most iconic climbs including the Tourmalet, Aubisque, Aspin and Peyresourde. There is no organised event — riders go when they choose, within a fixed season, making it more pilgrimage than race.",
    key_climbs: [
      { name: "Col d'Aubisque", elevation_m: 1709, length_km: 16.6, avg_gradient: 7.2 },
      { name: "Col du Tourmalet", elevation_m: 2115, length_km: 19.0, avg_gradient: 7.4 },
      { name: "Col d'Aspin", elevation_m: 1489, length_km: 12.0, avg_gradient: 6.5 },
      { name: "Col de Peyresourde", elevation_m: 1569, length_km: 9.7, avg_gradient: 7.8 },
      { name: "Port d'Envalira", elevation_m: 2408, length_km: 30.7, avg_gradient: 3.4 },
    ],
    typical_finish_times: {
      beginner: "5–7 days",
      intermediate: "3–5 days",
      advanced: "2–3 days",
      elite: "Under 100 hours",
    },
    similar_races: ["haute-route-alps", "mallorca-312", "otztaler-radmarathon"],
    month: "May–October",
    website: "https://www.raid-pyreneen.com",
    tags: ["ultra endurance", "pyrenees", "france", "spain", "self-supported", "extreme"],
  },
  {
    name: "Velo Birmingham",
    slug: "velo-birmingham",
    distance_km: 161,
    elevation_m: 880,
    location: "Birmingham, Midlands",
    country: "England",
    difficulty: 2,
    description:
      "One of the UK's biggest mass-participation cycling events, Velo Birmingham sends thousands of riders through closed roads across the West Midlands. The route is predominantly flat with some gentle Worcestershire hills — making it an achievable first century for newer cyclists — but the atmosphere and scale of the event give it real appeal for experienced riders too. A great step-up from shorter sportives or a fast day out.",
    key_climbs: [
      { name: "Clent Hills", elevation_m: 294, length_km: 4.2, avg_gradient: 7.0 },
      { name: "Lickey Hills", elevation_m: 290, length_km: 3.5, avg_gradient: 8.3 },
    ],
    typical_finish_times: {
      beginner: "5:30–8h",
      intermediate: "4:30–5:30h",
      advanced: "3:30–4:30h",
      elite: "3–3:30h",
    },
    similar_races: ["ridelondon", "ring-of-kerry", "cape-town-cycle-tour"],
    month: "September",
    website: "https://velouk.net",
    tags: ["gran fondo", "england", "uk", "flat", "mass participation", "closed roads"],
  },
  {
    name: "Tour de Yorkshire Sportive",
    slug: "tour-de-yorkshire",
    distance_km: 130,
    elevation_m: 2200,
    location: "Yorkshire",
    country: "England",
    difficulty: 3,
    description:
      "Yorkshire is cycling country — the legacy of the 2014 Grand Départ runs deep — and the Tour de Yorkshire sportive captures everything that makes it special. The route passes through stunning dales countryside, over moorland and through market towns on roads that have hosted some of the biggest races in the world. Not as extreme as the Fred Whitton but punchy enough to leave a mark on unprepared legs.",
    key_climbs: [
      { name: "Buttertubs Pass", elevation_m: 524, length_km: 7.2, avg_gradient: 7.3 },
      { name: "Park Rash", elevation_m: 547, length_km: 3.8, avg_gradient: 15.0 },
      { name: "Fleet Moss", elevation_m: 544, length_km: 5.4, avg_gradient: 10.1 },
    ],
    typical_finish_times: {
      beginner: "6–9h",
      intermediate: "4:30–6h",
      advanced: "3:30–4:30h",
      elite: "3–3:30h",
    },
    similar_races: ["fred-whitton", "wicklow-200", "dragon-ride"],
    month: "May",
    tags: ["gran fondo", "england", "yorkshire", "dales", "moors"],
  },
];

export function getRaceBySlug(slug: string): Race | undefined {
  return RACES.find((r) => r.slug === slug);
}

export function getSimilarRaces(race: Race): Race[] {
  return race.similar_races
    .map((slug) => getRaceBySlug(slug))
    .filter((r): r is Race => r !== undefined)
    .slice(0, 3);
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: "Accessible",
  2: "Moderate",
  3: "Challenging",
  4: "Hard",
  5: "Extreme",
};

export const DIFFICULTY_COLORS: Record<number, string> = {
  1: "text-green-400",
  2: "text-blue-400",
  3: "text-yellow-400",
  4: "text-orange-400",
  5: "text-coral",
};
