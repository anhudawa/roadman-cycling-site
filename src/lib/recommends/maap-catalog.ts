import type {
  RecommendationOffer,
  RecommendationProduct,
} from "./types";

const reviewedAt = new Date("2026-07-30T10:00:00.000Z");
const MAAP_TRACKING_URL = "https://maap.sjv.io/Ag027D";

type MaapSeed = {
  id: number;
  offerId: number;
  name: string;
  slug: string;
  badge: string;
  verdict: string;
  shortDescription: string;
  whyRecommend: string;
  whoFor: string;
  whoSkip: string;
  strengths: string[];
  limitations: string[];
  specifications: Record<string, string>;
  useCases: string[];
  tags: string[];
  disciplines: string[];
  seasons: string[];
  priceBand: string;
  imageUrl: string;
  imageAlt: string;
  sortOrder: number;
  destinationUrl: string;
  bestValue?: boolean;
};

function impactDeepLink(productSlug: string, destinationUrl: string) {
  const url = new URL(MAAP_TRACKING_URL);
  url.searchParams.set("subId1", "roadman-recommends");
  url.searchParams.set("subId2", productSlug);
  url.searchParams.set("u", destinationUrl);
  return url.toString();
}

function maapOffer(id: number): RecommendationOffer {
  return {
    id,
    retailerName: "MAAP",
    affiliateProgram: "MAAP Cycling Apparel — Impact",
    regions: ["IE", "GB", "EU", "US"],
    currency: "EUR",
    priceLabel: "View current price",
    promoCode: null,
    priority: 0,
    active: true,
    lastCheckedAt: reviewedAt,
    lastHttpStatus: 200,
    lastError: null,
  };
}

const MAAP_SEEDS: MaapSeed[] = [
  {
    id: -1103,
    offerId: 900_000_103,
    name: "MAAP Training Jersey 2.0",
    slug: "maap-training-jersey-2",
    badge: "Everyday jersey",
    verdict:
      "The sensible MAAP jersey: clean-looking, comfortable and built for the rides you do every week.",
    shortDescription:
      "A soft-touch training jersey made with lighter recycled Italian fabrics and breathable moisture management.",
    whyRecommend:
      "This is the MAAP jersey to buy before chasing the racier pieces. It keeps the premium finish but prioritises repeat-wear comfort and durability, making it easier to justify for regular training.",
    whoFor:
      "Road riders who want one dependable short-sleeve jersey for weekly training, club rides and long summer days.",
    whoSkip:
      "Racers chasing the lightest, most aerodynamic option or riders who prefer a relaxed club-fit jersey.",
    strengths: [
      "Soft-touch recycled Italian fabric",
      "Breathable moisture management",
      "Comfort-led endurance fit",
      "Built to keep its structure through regular use",
    ],
    limitations: [
      "Still priced above a basic training jersey",
      "Close MAAP sizing rewards checking the size guide",
      "Not designed for cold or wet conditions",
    ],
    specifications: {
      Category: "Short-sleeve training jersey",
      Fit: "Endurance performance",
      Colour: "Thistle",
    },
    useCases: ["Weekly training", "Club rides", "Long road days"],
    tags: ["cycling jersey", "training kit", "MAAP", "everyday jersey"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMJE260526_THIS.TrainingJersey2.0_PDP_01.jpg?v=1775541583",
    imageAlt: "MAAP Training Jersey 2.0 in Thistle",
    sortOrder: 21,
    destinationUrl:
      "https://maap.cc/products/training-jersey-2-0-thistle",
    bestValue: true,
  },
  {
    id: -1104,
    offerId: 900_000_104,
    name: "MAAP Spectrum Pro Air Jersey 3.0",
    slug: "maap-spectrum-pro-air-jersey-3",
    badge: "Hot-weather speed",
    verdict:
      "A high-airflow jersey for hard summer rides when ordinary kit starts to feel heavy.",
    shortDescription:
      "MAAP's heat-focused jersey uses targeted open-mesh zones to push airflow during high-intensity efforts.",
    whyRecommend:
      "The Pro Air earns its place when both the temperature and the pace climb. The mapped mesh construction makes more sense for racing, climbing and fast group rides than it does for easy spins.",
    whoFor:
      "Riders training or racing in hot conditions who want maximum ventilation and a close performance fit.",
    whoSkip:
      "Cool-weather riders, anyone who prefers more coverage, or cyclists looking for an all-season first jersey.",
    strengths: [
      "Targeted open-mesh ventilation",
      "Designed for high-output riding",
      "Close race-focused silhouette",
      "Light feel in hot conditions",
    ],
    limitations: [
      "Specialist rather than all-season kit",
      "Race fit will not suit every rider",
      "Premium price for a summer-only jersey",
    ],
    specifications: {
      Category: "Hot-weather jersey",
      Fit: "Race performance",
      Colour: "Mirage",
    },
    useCases: ["Hot-weather training", "Racing", "Mountain climbs"],
    tags: ["summer jersey", "race jersey", "MAAP", "hot weather"],
    disciplines: ["Road"],
    seasons: ["Summer"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMJE260726_MIRA.SpectrumProAirJersey3-0_PDP_01.jpg?v=1778468306",
    imageAlt: "MAAP Spectrum Pro Air Jersey 3.0 in Mirage",
    sortOrder: 22,
    destinationUrl:
      "https://maap.cc/products/spectrum-pro-air-jersey-3-0-mirage",
  },
  {
    id: -1105,
    offerId: 900_000_105,
    name: "MAAP Alt_Road Jersey 2.0",
    slug: "maap-alt-road-jersey-2",
    badge: "Gravel jersey",
    verdict:
      "The better MAAP choice for long, rough days where comfort and usable storage matter more than pure aero.",
    shortDescription:
      "A lightweight Merino-blend jersey designed for breathable cooling, stable storage and mixed-terrain durability.",
    whyRecommend:
      "Alt_Road hits a useful middle ground: technical enough for hard riding but less road-race specific. The Merino blend and dependable storage make it a strong option for gravel loops and all-day exploring.",
    whoFor:
      "Gravel riders and road cyclists who value breathability, storage and long-distance comfort over a pure race cut.",
    whoSkip:
      "Riders who want maximum aerodynamic performance or a budget jersey for short spins.",
    strengths: [
      "Lightweight Merino-blend fabric",
      "High air permeability",
      "Stable storage for rough surfaces",
      "Designed for heat, distance and mixed terrain",
    ],
    limitations: [
      "Premium pricing",
      "Merino blends need more careful washing",
      "Less aero-focused than MAAP's race jerseys",
    ],
    specifications: {
      Category: "Mixed-terrain jersey",
      Material: "Lightweight Merino blend",
      Colour: "Bijou Blue",
    },
    useCases: ["Gravel rides", "Bikepacking days", "Long summer routes"],
    tags: ["gravel jersey", "Merino cycling jersey", "MAAP", "Alt_Road"],
    disciplines: ["Gravel", "Road", "Bikepacking"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMJE241326_BIJO.Alt_RoadJersey2.0_PDP_01.jpg?v=1777439942",
    imageAlt: "MAAP Alt_Road Jersey 2.0 in Bijou Blue",
    sortOrder: 23,
    destinationUrl:
      "https://maap.cc/products/alt_road-jersey-2-0-bijou-blue",
  },
  {
    id: -1106,
    offerId: 900_000_106,
    name: "MAAP Training Bib 3.0",
    slug: "maap-training-bib-3",
    badge: "Daily bib",
    verdict:
      "A repeat-ride bib that puts dependable comfort ahead of marginal race-day gains.",
    shortDescription:
      "A durable training bib with an ergonomic chamois and breathable four-way-stretch fabric.",
    whyRecommend:
      "Not every ride needs MAAP's most expensive bib. The Training Bib 3.0 is the more practical rotation piece, with the support and construction needed for consistent mileage.",
    whoFor:
      "Cyclists building a quality bib rotation for training, club rides and regular weekend mileage.",
    whoSkip:
      "Riders who want cargo storage, deep-winter insulation or MAAP's lightest race construction.",
    strengths: [
      "Ergonomically engineered chamois",
      "Breathable four-way-stretch fabric",
      "Stable support for repeat use",
      "Durable, clean construction",
    ],
    limitations: [
      "No cargo pockets",
      "Premium compared with mainstream training bibs",
      "Close fit requires careful sizing",
    ],
    specifications: {
      Category: "Training bib shorts",
      Fabric: "Breathable four-way stretch",
      Colour: "Cobblestone",
    },
    useCases: ["Daily training", "Club rides", "Indoor sessions"],
    tags: ["bib shorts", "training bib", "MAAP", "cycling shorts"],
    disciplines: ["Road", "Gravel", "Indoor"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMBS223126_CBBL.Training_20Bib_PDP_01.jpg?v=1775541238",
    imageAlt: "MAAP Training Bib 3.0 in Cobblestone",
    sortOrder: 24,
    destinationUrl:
      "https://maap.cc/products/training-bib-3-0-cobblestone",
  },
  {
    id: -1107,
    offerId: 900_000_107,
    name: "MAAP Alt_Road Cargo Bib 2.0",
    slug: "maap-alt-road-cargo-bib-2",
    badge: "Gravel cargo pick",
    verdict:
      "The load-carrying bib for big gravel days when jersey pockets alone are not enough.",
    shortDescription:
      "A durable mixed-terrain bib with an off-road chamois, triple rear pockets and multi-zone cargo storage.",
    whyRecommend:
      "This is a genuinely useful cargo layout rather than a token phone pocket. It spreads food, tools and layers across several secure zones while the off-road-specific pad targets long, uneven days.",
    whoFor:
      "Gravel riders, bikepackers and long-distance cyclists who want accessible storage without adding a bag.",
    whoSkip:
      "Minimalist road riders, short-ride cyclists or anyone who never uses cargo pockets.",
    strengths: [
      "Off-road-specific chamois",
      "Integrated rear triple-pocket system",
      "Multiple cargo storage zones",
      "Lightweight, durable stretch fabric",
    ],
    limitations: [
      "More expensive than a standard bib",
      "Extra pockets are unnecessary for short rides",
      "Close fit and loaded pockets need careful sizing",
    ],
    specifications: {
      Category: "Cargo bib shorts",
      Storage: "Rear triple pockets plus cargo zones",
      Colour: "Deep Navy",
    },
    useCases: ["Gravel epics", "Bikepacking", "Long unsupported rides"],
    tags: ["cargo bib", "gravel shorts", "MAAP", "Alt_Road"],
    disciplines: ["Gravel", "Bikepacking", "Road"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMBS240526_DPNV.Alt_RoadCargoBib2.0_PDP_01.jpg?v=1777440084",
    imageAlt: "MAAP Alt_Road Cargo Bib 2.0 in Deep Navy",
    sortOrder: 25,
    destinationUrl:
      "https://maap.cc/products/alt_road-cargo-bib-2-0-deep-navy",
  },
  {
    id: -1108,
    offerId: 900_000_108,
    name: "MAAP Team Bib Evo Cargo",
    slug: "maap-team-bib-evo-cargo",
    badge: "Road cargo pick",
    verdict:
      "Team Bib comfort with discreet side storage—the useful choice for long road days and pocket-heavy events.",
    shortDescription:
      "MAAP's performance bib adds two side cargo pockets, stable compression and an Elastic Interface chamois.",
    whyRecommend:
      "It keeps the road-focused feel of the Team Bib Evo but solves the storage problem on long rides. The two thigh pockets make gels, a phone or gloves easier to reach without turning it into full gravel kit.",
    whoFor:
      "Road and endurance riders who want premium bib comfort with quick-access storage.",
    whoSkip:
      "Riders who prefer a completely clean race silhouette or need the larger storage system of the Alt_Road bib.",
    strengths: [
      "Two accessible side cargo pockets",
      "3D thermo-moulded Elastic Interface chamois",
      "Stable compression and moisture control",
      "Seamless braces help secure the fit",
    ],
    limitations: [
      "Costs more than the standard Team Bib Evo",
      "Side pockets change the classic road look",
      "Premium fit is unforgiving of the wrong size",
    ],
    specifications: {
      Category: "Performance cargo bib shorts",
      Storage: "Dual side pockets",
      Colour: "Deep Navy",
    },
    useCases: ["Long road rides", "Sportives", "Ultra-distance events"],
    tags: ["cargo bib", "road bib shorts", "MAAP", "Team Bib Evo"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMBS240226_DPNV.TEAMBibEvoCargo_PDP_01.jpg?v=1772430947",
    imageAlt: "MAAP Team Bib Evo Cargo in Deep Navy",
    sortOrder: 26,
    destinationUrl:
      "https://maap.cc/products/team-bib-evo-cargo-deep-navy",
  },
  {
    id: -1109,
    offerId: 900_000_109,
    name: "Women's MAAP Training Jersey 2.0",
    slug: "womens-maap-training-jersey-2",
    badge: "Women's everyday jersey",
    verdict:
      "A women-specific MAAP training jersey that is made for repeat wear, not just race-day photos.",
    shortDescription:
      "A lighter, soft-touch women's jersey with recycled Italian fabrics and breathable moisture management.",
    whyRecommend:
      "It brings the same practical brief as the men's Training Jersey into a women-specific cut: reliable fabric, clean construction and comfort that suits the bulk of weekly riding.",
    whoFor:
      "Women who want a premium short-sleeve jersey for training, club rides and long summer miles.",
    whoSkip:
      "Riders wanting a relaxed fit, maximum aero performance or cold-weather protection.",
    strengths: [
      "Women-specific performance cut",
      "Soft-touch recycled Italian fabric",
      "Breathable moisture management",
      "Durable construction for regular use",
    ],
    limitations: [
      "Premium price",
      "Close sizing should be checked carefully",
      "Short sleeves limit shoulder-season use",
    ],
    specifications: {
      Category: "Women's short-sleeve training jersey",
      Fit: "Endurance performance",
      Colour: "Washed Red",
    },
    useCases: ["Weekly training", "Club rides", "Long road days"],
    tags: [
      "women's cycling jersey",
      "training kit",
      "MAAP",
      "women's apparel",
    ],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPWJE260526_WSHR.Women_27sTrainingJersey2.0_PDP_01.jpg?v=1775541595",
    imageAlt: "Women's MAAP Training Jersey 2.0 in Washed Red",
    sortOrder: 27,
    destinationUrl:
      "https://maap.cc/products/womens-training-jersey-2-0-washed-red",
  },
  {
    id: -1110,
    offerId: 900_000_110,
    name: "Women's MAAP Team Bib Evo",
    slug: "womens-maap-team-bib-evo",
    badge: "Women's premium bib",
    verdict:
      "The women-specific version of MAAP's core endurance bib, built around support rather than unnecessary detail.",
    shortDescription:
      "A women's performance bib with stable compression, seamless braces, a ventilated back and a 3D thermo-moulded chamois.",
    whyRecommend:
      "This is the anchor piece for a women's MAAP kit. The construction focuses on the things that decide whether bibs work after several hours: stable fit, ventilation and pressure relief.",
    whoFor:
      "Women looking for premium bib shorts for long road rides, events and fast weekly training.",
    whoSkip:
      "Occasional riders, cyclists wanting cargo storage or anyone who prefers a less compressive fit.",
    strengths: [
      "Women-specific fit",
      "3D thermo-moulded Elastic Interface chamois",
      "Ventilated back panel",
      "Seamless braces and stable compression",
    ],
    limitations: [
      "Premium price",
      "No cargo pockets",
      "Performance fit needs careful sizing",
    ],
    specifications: {
      Category: "Women's performance bib shorts",
      Chamois: "3D thermo-moulded Elastic Interface",
      Colour: "Titanium",
    },
    useCases: ["Long road rides", "Sportives", "Fast group rides"],
    tags: ["women's bib shorts", "MAAP", "Team Bib Evo", "cycling kit"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPWBS211126_TITN.Women_27sTeamBibEvo_PDP_01.jpg?v=1772430341",
    imageAlt: "Women's MAAP Team Bib Evo in Titanium",
    sortOrder: 28,
    destinationUrl:
      "https://maap.cc/products/womens-team-bib-evo-titanium",
  },
  {
    id: -1111,
    offerId: 900_000_111,
    name: "MAAP Atmos Vest",
    slug: "maap-atmos-vest",
    badge: "Packable rain layer",
    verdict:
      "A tiny, serious rain layer for days when the forecast cannot make up its mind.",
    shortDescription:
      "An ultra-packable Pertex Shield vest with two-way stretch and a 20,000mm waterproof rating.",
    whyRecommend:
      "Most emergency layers are either protective or genuinely pocketable. The Atmos Vest combines both, making it the layer to carry on exposed routes, changeable mountain days and fast rides with little spare storage.",
    whoFor:
      "Road riders who want lightweight wind and rain protection that disappears into a jersey pocket.",
    whoSkip:
      "Cyclists needing full-sleeve winter protection or riders who rarely head out in unsettled weather.",
    strengths: [
      "20,000mm waterproof rating",
      "Lightweight Pertex Shield fabric",
      "Two-way stretch for on-bike movement",
      "Packs into a jersey pocket",
    ],
    limitations: [
      "Very premium price for a vest",
      "No sleeve protection",
      "Minimal construction is less useful for deep winter",
    ],
    specifications: {
      Category: "Packable waterproof vest",
      Fabric: "Pertex Shield",
      Waterproofing: "20,000mm",
    },
    useCases: ["Changeable forecasts", "Mountain descents", "Emergency layer"],
    tags: ["cycling vest", "rain vest", "MAAP", "packable layer"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MAP-MAV129_BLK.ATMOS_20VEST_BLACK_PRODUCT_CARD_HERO.jpg?v=1738707617",
    imageAlt: "Black MAAP Atmos waterproof cycling vest",
    sortOrder: 29,
    destinationUrl: "https://maap.cc/products/atmos-vest-black",
  },
  {
    id: -1112,
    offerId: 900_000_112,
    name: "MAAP Elements Pro Race Jacket",
    slug: "maap-elements-pro-race-jacket",
    badge: "Wet-weather jacket",
    verdict:
      "A race-cut waterproof for holding the pace when bad weather becomes the whole ride.",
    shortDescription:
      "A waterproof, breathable Polartec Power Shield jacket with stretch panelling for on-bike movement.",
    whyRecommend:
      "This is not just an emergency shell. The stretch construction and close cut are designed for riding hard through persistent rain, when a flappy backup jacket becomes annoying.",
    whoFor:
      "Committed road riders who train through wet weather and want a close, performance-focused outer layer.",
    whoSkip:
      "Fair-weather cyclists, commuters wanting a relaxed shell or riders prioritising maximum packability.",
    strengths: [
      "Waterproof Polartec Power Shield construction",
      "Breathable fabric for higher-output riding",
      "Stretch panelling supports movement",
      "Race-focused fit reduces excess fabric",
    ],
    limitations: [
      "Premium investment for a weather layer",
      "Race fit limits casual layering",
      "Less pocketable than an emergency shell",
    ],
    specifications: {
      Category: "Waterproof race jacket",
      Fabric: "Polartec Power Shield RPM",
      Colour: "Black",
    },
    useCases: ["Wet-weather training", "Cold race days", "Long rainy rides"],
    tags: ["cycling jacket", "waterproof jacket", "MAAP", "winter kit"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Autumn", "Winter", "Spring"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMJA250725_BLAK.Elements_20Pro_20Race_20Jacket_PDP_01_5249c09b-dd82-4d37-9ec4-60f8f7e8f419.jpg?v=1757554707",
    imageAlt: "Black MAAP Elements Pro Race waterproof cycling jacket",
    sortOrder: 31,
    destinationUrl:
      "https://maap.cc/products/elements-pro-race-jacket-black",
  },
  {
    id: -1113,
    offerId: 900_000_113,
    name: "MAAP Team Mesh Base Layer",
    slug: "maap-team-mesh-base-layer",
    badge: "Summer layer",
    verdict:
      "A light, quick-drying base layer that makes more sense as the ride gets hotter and harder.",
    shortDescription:
      "An ultra-light mesh base layer with recycled nylon, anti-chafe seams and an ergonomic neckline.",
    whyRecommend:
      "A good summer base layer manages sweat without feeling like another jersey. This one is stripped back, highly ventilated and shaped to sit cleanly beneath close-fitting MAAP kit.",
    whoFor:
      "Riders who train hard in warm weather or dislike a clammy jersey directly against the skin.",
    whoSkip:
      "Cold-weather riders looking for insulation or cyclists who prefer riding without a base layer in summer.",
    strengths: [
      "Ultra-light open-mesh construction",
      "Quick-drying performance",
      "Majority recycled nylon",
      "Anti-chafe seams and ergonomic neckline",
    ],
    limitations: [
      "No insulation",
      "White mesh needs careful washing",
      "An optional layer rather than an essential for every rider",
    ],
    specifications: {
      Category: "Sleeveless summer base layer",
      Material: "Majority recycled nylon",
      Colour: "White",
    },
    useCases: ["Hot training rides", "Racing", "Indoor sessions"],
    tags: ["base layer", "summer cycling kit", "MAAP", "mesh vest"],
    disciplines: ["Road", "Gravel", "Indoor"],
    seasons: ["Summer"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMBL250225_WHIT.Team_20Mesh_20Base_20Layer_PDP_01.jpg?v=1759300298",
    imageAlt: "White MAAP Team Mesh sleeveless cycling base layer",
    sortOrder: 32,
    destinationUrl:
      "https://maap.cc/products/team-mesh-base-layer-white",
  },
  {
    id: -1114,
    offerId: 900_000_114,
    name: "MAAP Spectrum Team Sock",
    slug: "maap-spectrum-team-sock",
    badge: "Finishing touch",
    verdict:
      "The easy way to finish a MAAP kit without turning a pair of socks into a technical thesis.",
    shortDescription:
      "A higher-gauge cycling sock with gentle compression, ribbed ventilation and moisture-wicking yarn.",
    whyRecommend:
      "Socks are the low-risk entry point into a premium kit. This pair keeps the design clean and adds the useful details—ventilation, moisture control and enough compression to stay put.",
    whoFor:
      "Road and gravel riders who want a clean, breathable sock to complete a MAAP kit.",
    whoSkip:
      "Riders who prefer ankle socks, heavy winter socks or the cheapest multipack available.",
    strengths: [
      "Higher-gauge knit for softness and durability",
      "Ribbed ventilation channels",
      "Moisture-wicking yarn",
      "Light compression helps hold the fit",
    ],
    limitations: [
      "Costs more than a standard cycling sock",
      "Not insulated for deep winter",
      "Tall cuff styling is personal",
    ],
    specifications: {
      Category: "Performance cycling sock",
      Knit: "High gauge with ribbed ventilation",
      Colour: "Black",
    },
    useCases: ["Road rides", "Gravel rides", "Matching kit"],
    tags: ["cycling socks", "MAAP", "summer kit", "accessories"],
    disciplines: ["Road", "Gravel", "Indoor"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MAUSO260826_BLAK.SpectrumTeamSock_PDP_01.jpg?v=1778468179",
    imageAlt: "Black MAAP Spectrum Team cycling sock",
    sortOrder: 33,
    destinationUrl:
      "https://maap.cc/products/spectrum-team-sock-black",
  },
];

export const ADDITIONAL_MAAP_AFFILIATE_DESTINATIONS: Readonly<
  Record<number, string>
> = Object.fromEntries(
  MAAP_SEEDS.map((seed) => [
    seed.offerId,
    impactDeepLink(seed.slug, seed.destinationUrl),
  ]),
);

export const ADDITIONAL_MAAP_PRODUCTS: RecommendationProduct[] =
  MAAP_SEEDS.map((seed) => ({
    id: seed.id,
    name: seed.name,
    slug: seed.slug,
    brandId: null,
    brandName: "MAAP",
    brandSlug: "maap",
    categoryId: -3,
    categoryName: "Clothing",
    categorySlug: "clothing",
    badge: seed.badge,
    evidenceStatus: "editorial",
    verdict: seed.verdict,
    shortDescription: seed.shortDescription,
    whyRecommend: seed.whyRecommend,
    whoFor: seed.whoFor,
    whoSkip: seed.whoSkip,
    strengths: seed.strengths,
    limitations: seed.limitations,
    specifications: seed.specifications,
    useCases: seed.useCases,
    tags: seed.tags,
    disciplines: seed.disciplines,
    seasons: seed.seasons,
    priceBand: seed.priceBand,
    imageUrl: seed.imageUrl,
    imageAlt: seed.imageAlt,
    relatedArticleUrl: null,
    featured: false,
    bestValue: seed.bestValue ?? false,
    sortOrder: seed.sortOrder,
    offers: [maapOffer(seed.offerId)],
    status: "published",
    scheduledAt: null,
    publishedAt: reviewedAt,
    lastReviewedAt: reviewedAt,
    createdAt: reviewedAt,
    updatedAt: reviewedAt,
  }));
