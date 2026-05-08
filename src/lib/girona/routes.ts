/**
 * Girona route guides — long-tail SEO landing pages for the iconic
 * climbs and rides every World Tour pro in town uses for testing.
 *
 * Each route gets its own /cycling-girona/[slug] page with route stats,
 * a turn-by-turn description, what to expect, and a link back to the
 * camps. Built to capture searches like "Rocacorba climb",
 * "Els Àngels Girona", "Mare de Déu del Mont cycling".
 */

export type RouteSurface = "Road" | "Gravel" | "Mixed";

export interface GironaRoute {
  /** URL slug under /cycling-girona/[slug] */
  slug: string;
  /** Display name (the climb / ride name as locals call it). */
  name: string;
  /** Common alternate spellings, used in the body and metadata. */
  alternateNames?: string[];
  /** Short summary for hub cards and meta descriptions. */
  summary: string;
  /** Surface type — drives icon and "what bike" guidance. */
  surface: RouteSurface;
  /** Distance from a typical Girona old-town start, in km. */
  distance: string;
  /** Total elevation gain across the loop, in metres. */
  elevation: string;
  /** Climb-only stats (length and average gradient). */
  climbLength: string;
  averageGradient: string;
  maxGradient: string;
  /** Approximate time for a fit amateur. */
  rideTime: string;
  /** Difficulty bucket. */
  difficulty: "Intermediate" | "Intermediate–Advanced" | "Advanced";
  /** Hero image (in /public). */
  heroImage: string;
  heroImageAlt: string;
  /** Featured image alt text used in OG cards. */
  ogImageAlt: string;
  /** Which Roadman camp this route lives in. */
  campSlug: "road" | "gravel" | "both";
  /** Day-by-day position on the camp itinerary, if relevant. */
  campDay?: string;
  /** SEO metadata. */
  seoTitle: string;
  seoDescription: string;
  /** Heading and section copy — Anthony's voice. */
  whyItMatters: string;
  whatToExpect: string[];
  whereToStart: string;
  bestTimeOfDay: string;
  coffeeStop: string;
  watchOutFor: string;
  /** Strava-style segment names cyclists actually search for. */
  segmentNames?: string[];
  /** GPS coordinates for schema markup (Place lat/lng of the climb start). */
  geo: { latitude: number; longitude: number };
  /** Keywords woven naturally into the body. */
  keywords: string[];
}

export const GIRONA_ROUTES: Record<string, GironaRoute> = {
  rocacorba: {
    slug: "rocacorba",
    name: "Rocacorba",
    alternateNames: ["Rocacorba climb", "Roca Corba"],
    summary:
      "Eleven kilometres of the climb every pro in Girona uses for testing. The town's signature test piece — quiet roads, even gradient, a closed café at the summit, and a view that earns the climb back twice.",
    surface: "Road",
    distance: "70 km",
    elevation: "1,400 m",
    climbLength: "10.6 km",
    averageGradient: "6.5%",
    maxGradient: "13%",
    rideTime: "3 hr 30 min",
    difficulty: "Intermediate–Advanced",
    heroImage: "/images/camps/girona-cathedral-aerial.jpg",
    heroImageAlt:
      "Rocacorba climb above Banyoles — the test-piece pros use to gauge form before the season",
    ogImageAlt:
      "Rocacorba — the Girona climb every World Tour pro uses for testing",
    campSlug: "road",
    campDay: "Day 5 of the Roadman Girona Road Camp",
    seoTitle: "Rocacorba Climb, Girona — Profile, Times, Strava Records",
    seoDescription:
      "Everything on Rocacorba: 10.6 km at 6.5%, the test-piece climb every Girona pro uses to gauge form. Profile, segment times, where to start, and how the climb actually rides.",
    whyItMatters:
      "Rocacorba isn't a tourist climb. It's the bench mark every pro in Girona uses to figure out where their season is. Pogačar has a time on it. Froome has a time on it. The legend Tao Geoghegan Hart, the Yates twins, half the Ineos roster — they've all set markers on this hill. If you've ever wondered how amateurs and pros actually compare, this is the place to find out.",
    whatToExpect: [
      "A flat 25 km warm-up out of Girona along quiet farm roads to Pujarnol — the village at the foot.",
      "Roughly 10.6 km of climbing at an honest 6.5% average. Even gradient at the bottom, two harder ramps in the middle, and a final kilometre that touches 13% if you've still got a kick left.",
      "A closed café and a radio mast at the summit. The café shut years ago — bring your own coffee or save it for the descent.",
      "The view east over Banyoles lake and west into the Pyrenees foothills. On a clear October morning it's the best summit panorama within an hour of the city.",
      "An eleven-kilometre descent on the same road you climbed. Smooth tarmac, no surprise switchbacks, fast on a road bike.",
    ],
    whereToStart:
      "Most riders roll out from Girona old town and head north to Banyoles, picking up the climb in Pujarnol after about 25 km. From Can Sagnari, our base on camp, it's a 12 km warm-up.",
    bestTimeOfDay:
      "Early. The road's quiet at any hour, but morning shadows on the lower slopes keep the temperature down and the light on the descent is the postcard.",
    coffeeStop:
      "Café in Banyoles old town on the roll-back — a few options on the lake-front. The summit café is closed.",
    watchOutFor:
      "Goats. There's a herd that lives near the upper hairpins and they wander across the road in the cooler months. Slow down, take the photo, ride on.",
    segmentNames: ["Rocacorba", "Pujarnol to Rocacorba summit"],
    geo: { latitude: 42.0867, longitude: 2.7044 },
    keywords: [
      "Rocacorba climb",
      "Rocacorba cycling",
      "Rocacorba Strava",
      "Girona climbs",
      "cycling in Girona",
      "World Tour pro climbs Girona",
    ],
  },

  "els-angels": {
    slug: "els-angels",
    name: "Els Àngels",
    alternateNames: ["Sant Martí Vell to Els Àngels", "Mare de Déu dels Àngels"],
    summary:
      "The local climb every Girona pro has done a thousand times. Ten kilometres of even tempo, a sanctuary at the top, and the cleanest view back over the city you can earn on a road bike.",
    surface: "Road",
    distance: "85 km",
    elevation: "1,400 m",
    climbLength: "9.7 km",
    averageGradient: "4.7%",
    maxGradient: "8%",
    rideTime: "3 hr 15 min",
    difficulty: "Intermediate",
    heroImage: "/images/camps/girona-road-coast.jpeg",
    heroImageAlt:
      "Els Àngels climb above Girona — the city's most-ridden tempo training climb",
    ogImageAlt:
      "Els Àngels — the steady tempo climb every Girona pro uses for base work",
    campSlug: "road",
    campDay: "Day 2 of the Roadman Girona Road Camp",
    seoTitle: "Els Àngels Climb, Girona — Length, Gradient, Coffee Stop",
    seoDescription:
      "Els Àngels is Girona's everyday tempo climb. 9.7 km at 4.7%, a Sanctuari coffee stop at the top, and a clean roll-back through the Empordà. Profile, route, and what to expect.",
    whyItMatters:
      "If Rocacorba is the test piece, Els Àngels is the office. Pros ride this climb week in, week out, all season. It's not steep. It's not famous. It's the kind of even-gradient tempo road that builds engines — long enough to do real work, even enough to hold a power number, beautiful enough that you'll never get bored of it.",
    whatToExpect: [
      "An easy 12 km roll out of Girona to Sant Martí Vell — quiet farm roads, almost no traffic.",
      "9.7 km of climbing at 4.7% average. The gradient barely moves. You can sit in your zone-2-to-tempo window and ride it the same way every time.",
      "A small sanctuary (the Mare de Déu dels Àngels) at the summit, with a café that's been there forever. This is the coffee stop.",
      "A view back across the entire Girona plain — the Pyrenees on one horizon, the Mediterranean on the other.",
      "Drop down through the back of the climb and roll home through the Empordà on tiny lanes you'll otherwise never find.",
    ],
    whereToStart:
      "Roll out of Girona north-east to Sant Martí Vell. The climb starts a kilometre past the village. From Can Sagnari, head south-east through Cornellà del Terri and onto the same approach.",
    bestTimeOfDay:
      "Mid-morning. The east-facing approach catches the sun on the way up, the descent is in shade by the time you're rolling home.",
    coffeeStop:
      "Sanctuari Mare de Déu dels Àngels — the café next to the church at the summit. Cortado, slice of coca, sit in the sun.",
    watchOutFor:
      "Wedding cars on a Saturday. The sanctuary's a popular wedding venue and you'll occasionally share the road on the descent.",
    segmentNames: ["Sant Martí Vell to Els Àngels", "Els Àngels"],
    geo: { latitude: 41.9933, longitude: 2.9117 },
    keywords: [
      "Els Àngels climb",
      "Els Angels Girona",
      "Sanctuari Mare de Déu dels Àngels cycling",
      "Girona tempo climb",
      "cycling in Girona",
    ],
  },

  "mare-de-deu-del-mont": {
    slug: "mare-de-deu-del-mont",
    name: "Mare de Déu del Mont",
    alternateNames: ["Mare de Deu del Mont", "Mare de Déu del Mont climb"],
    summary:
      "Twelve kilometres of mountain. The big day-out climb of the Girona region — long, steep at the top, and the kind of summit you tell people about for the rest of the year.",
    surface: "Road",
    distance: "105 km",
    elevation: "2,200 m",
    climbLength: "11.8 km",
    averageGradient: "7.1%",
    maxGradient: "15%",
    rideTime: "5 hr",
    difficulty: "Advanced",
    heroImage: "/images/camps/girona-road-coast.jpeg",
    heroImageAlt:
      "Mare de Déu del Mont above the Garrotxa — the biggest mountain climb of the Girona region",
    ogImageAlt:
      "Mare de Déu del Mont — the Girona region's signature mountain climb",
    campSlug: "road",
    campDay: "Day 3 of the Roadman Girona Road Camp",
    seoTitle: "Mare de Déu del Mont Climb, Girona — 12 km Mountain Profile",
    seoDescription:
      "Mare de Déu del Mont is Girona's biggest climb. 11.8 km at 7.1%, ramping to 15% near the top. Profile, the right gear ratios, and what to expect on the day.",
    whyItMatters:
      "If you only have one day in the saddle in Girona and you want to know what the place can do at the top end, this is the ride. Long warm-up through the foothills, a climb that earns its summit, and a descent that lets you exhale. It's the closest the region has to an alpine col, and it sits an easy spin from the city.",
    whatToExpect: [
      "A 35 km approach through Banyoles, Esponellà and Beuda — gently rolling, the kind of warm-up that turns into a tempo block if you're not careful.",
      "11.8 km of climbing at 7.1%. The first half is honest. The middle eases. The final 2 km is where the climb earns its name — touching 15% in the steepest sections.",
      "A tiny chapel at the summit and the kind of view east to the coast and west into the Pyrenees that you'll only earn on a clear morning.",
      "A long, fast, technical descent. Smooth surface but with sharper turns than Rocacorba — pace it.",
      "A roll back through Beuda for second coffee and the long flat run home along the river.",
    ],
    whereToStart:
      "Start from Girona old town. The climb proper begins after Beuda — about 50 km in, with the descent and roll-back making the full day around 105 km. From Can Sagnari it's the same loop minus the first 12 km.",
    bestTimeOfDay:
      "Early start. This is a 5-hour day even on good legs. Out the door by 8:30 in October, summit before noon, home for a long lunch.",
    coffeeStop:
      "Beuda — the café in the village square on the way back. Tortilla, coffee, sit in the sun, watch the local pensioners argue about football.",
    watchOutFor:
      "Gear ratios. If you're running a 53/39 with an 11-25 cassette, you'll regret it. Bring a 32 or 34 on the back at minimum. Compact chainset, cassette-up, ride within yourself on the steep stuff.",
    segmentNames: ["Mare de Déu del Mont", "Beuda to Mare de Déu del Mont"],
    geo: { latitude: 42.2575, longitude: 2.7361 },
    keywords: [
      "Mare de Déu del Mont",
      "Mare de Deu del Mont climb",
      "Girona mountain climb",
      "Beuda cycling",
      "cycling in Girona",
    ],
  },

  "coll-de-bracons": {
    slug: "coll-de-bracons",
    name: "Coll de Bracons",
    alternateNames: ["Bracons", "Bracons climb"],
    summary:
      "The forgotten classic west of Girona. Twelve kilometres of beech-forest tarmac that climbs out of the Garrotxa volcanic park, summits with a view down into the Vall d'en Bas, and rolls back through some of the quietest roads in Catalonia.",
    surface: "Road",
    distance: "120 km",
    elevation: "2,100 m",
    climbLength: "12 km",
    averageGradient: "5.5%",
    maxGradient: "10%",
    rideTime: "5 hr 30 min",
    difficulty: "Advanced",
    heroImage: "/images/camps/girona-road-coast.jpeg",
    heroImageAlt:
      "Coll de Bracons above the Garrotxa volcanic park — beech-forest hairpins on quiet tarmac",
    ogImageAlt:
      "Coll de Bracons — the quiet beech-forest climb west of Girona",
    campSlug: "both",
    seoTitle: "Coll de Bracons, Girona — The Garrotxa's Forgotten Classic",
    seoDescription:
      "Coll de Bracons is Girona's quiet alternative to the famous climbs. 12 km at 5.5% through beech forest, summiting above the Vall d'en Bas. Profile and ride guide.",
    whyItMatters:
      "Everyone knows Rocacorba. Everyone knows Els Àngels. Bracons is the climb the locals keep quiet about. It sits west of the famous Girona triangle, in the Garrotxa volcanic park, and the surface is some of the smoothest tarmac in the region. Wide, well-graded, lined with beech and oak — the kind of climb you remember less for the suffering and more for the trees.",
    whatToExpect: [
      "A long 50 km approach via Banyoles, Sant Miquel de Campmajor and Mieres — tempo-paced lanes through farmland and small villages.",
      "12 km of climbing at 5.5% average through dense beech forest. The hairpins are evenly spaced and the gradient never spikes hard.",
      "A summit roll-down into the Vall d'en Bas — green pasture, scattered farmhouses, the volcanic cones of the park in the distance.",
      "A long roll back via Olot or Banyoles depending on the legs — both routes are quiet, both are scenic, neither is short.",
      "Total day around 120 km / 2,100 m. A real day in the saddle.",
    ],
    whereToStart:
      "Start from Girona or Banyoles. From Can Sagnari it's an 8 km warm-up to the Banyoles approach, then north-west through Mieres to pick up the climb.",
    bestTimeOfDay:
      "Late morning. The forest keeps the road cool even in summer, and the descent into the Vall d'en Bas catches the afternoon light.",
    coffeeStop:
      "Sant Miquel de Campmajor on the way out, or Olot on the way home. Both proper Catalan villages with cafés that have been pouring cortados for fifty years.",
    watchOutFor:
      "The tunnel above the summit. The original road threads a long, dimly-lit tunnel — most riders take the alternative line over the top, which is signposted and adds 2 km of climbing for daylight and clean air. Worth the detour.",
    segmentNames: ["Coll de Bracons", "Mieres to Coll de Bracons"],
    geo: { latitude: 42.1525, longitude: 2.4358 },
    keywords: [
      "Coll de Bracons",
      "Bracons climb",
      "Garrotxa cycling",
      "cycling in Girona",
      "Girona road climbs",
    ],
  },
};

export const GIRONA_ROUTE_LIST: GironaRoute[] = [
  GIRONA_ROUTES.rocacorba,
  GIRONA_ROUTES["els-angels"],
  GIRONA_ROUTES["mare-de-deu-del-mont"],
  GIRONA_ROUTES["coll-de-bracons"],
];

export function getGironaRoute(slug: string): GironaRoute | null {
  return GIRONA_ROUTES[slug] ?? null;
}

export function getAllGironaRouteSlugs(): string[] {
  return GIRONA_ROUTE_LIST.map((r) => r.slug);
}
