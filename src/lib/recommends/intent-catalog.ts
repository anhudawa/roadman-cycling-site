import type { RecommendationOffer, RecommendationProduct } from "./types";

const reviewedAt = new Date("2026-07-30T22:00:00.000Z");

const TRACKING_URLS = {
  competitiveCyclist: "https://competitivecyclist.g39l.net/9VQ6AE",
  maap: "https://maap.sjv.io/Ag027D",
} as const;

type Partner = keyof typeof TRACKING_URLS;

type OfferSeed = {
  id: number;
  partner: Partner;
  retailerName: string;
  affiliateProgram: string;
  destinationUrl: string;
  regions: string[];
  currency: string;
};

type IntentProductSeed = {
  id: number;
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
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
  offers: OfferSeed[];
  featured?: boolean;
  bestValue?: boolean;
};

function impactDeepLink(
  partner: Partner,
  productSlug: string,
  destinationUrl: string,
) {
  const url = new URL(TRACKING_URLS[partner]);
  url.searchParams.set("subId1", "roadman-recommends");
  url.searchParams.set("subId2", productSlug);
  url.searchParams.set("u", destinationUrl);
  return url.toString();
}

function competitiveOffer(id: number, destinationUrl: string): OfferSeed {
  return {
    id,
    partner: "competitiveCyclist",
    retailerName: "Competitive Cyclist",
    affiliateProgram: "Competitive Cyclist — Impact",
    destinationUrl,
    regions: ["US"],
    currency: "USD",
  };
}

function maapOffer(id: number, destinationUrl: string): OfferSeed {
  return {
    id,
    partner: "maap",
    retailerName: "MAAP",
    affiliateProgram: "MAAP — Impact",
    destinationUrl,
    regions: ["IE", "GB", "EU", "US"],
    currency: "EUR",
  };
}

function offer(seed: OfferSeed): RecommendationOffer {
  return {
    id: seed.id,
    retailerName: seed.retailerName,
    affiliateProgram: seed.affiliateProgram,
    regions: seed.regions,
    currency: seed.currency,
    priceLabel: "View current price",
    promoCode: null,
    priority: 0,
    active: true,
    lastCheckedAt: reviewedAt,
    lastHttpStatus: 200,
    lastError: null,
  };
}

const INTENT_PRODUCT_SEEDS: IntentProductSeed[] = [
  {
    id: -1801,
    name: "Continental Grand Prix 5000 AS TR",
    slug: "continental-grand-prix-5000-as-tr",
    brandName: "Continental",
    brandSlug: "continental",
    categoryId: -1,
    categoryName: "Tyres & Tubes",
    categorySlug: "tyres-tubes",
    badge: "Winter grip",
    verdict:
      "The fast all-season tyre for riders who want more wet-road confidence and protection without making the bike feel slow.",
    shortDescription:
      "An all-season tubeless-ready road tyre with BlackChili rubber, a Vectran breaker and reinforced sidewalls.",
    whyRecommend:
      "This is the winter alternative to a pure race tyre. It gives away little of the lively GP5000 feel while adding the wet grip, cut protection and wider size options that matter on dark, dirty roads.",
    whoFor:
      "Road riders training through wet winters who still care about speed and ride feel.",
    whoSkip:
      "Dry-weather racers chasing the lightest setup or riders whose rims and clearances do not suit the available sizes.",
    strengths: [
      "Confident all-season BlackChili compound",
      "Vectran puncture-protection breaker",
      "Tubeless-ready and hookless compatible",
      "Available from 25mm to 35mm",
    ],
    limitations: [
      "Heavier than the GP5000 S TR",
      "Premium tyre price",
      "Tubeless fitting can be tight on some rims",
    ],
    specifications: {
      Type: "Tubeless-ready folding road tyre",
      Casing: "110 TPI with Vectran breaker",
      Sizes: "700 × 25, 28, 32 or 35c",
    },
    useCases: ["Winter road riding", "Wet training", "All-season endurance"],
    tags: ["winter tyre", "wet grip", "tubeless", "Continental"],
    disciplines: ["Road", "Endurance"],
    seasons: ["Autumn", "Winter", "Spring"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/CON/CONF04D/BLA.jpg",
    imageAlt: "Continental Grand Prix 5000 AS TR all-season road tyre",
    sortOrder: 40,
    offers: [
      competitiveOffer(
        900_000_801,
        "https://www.competitivecyclist.com/continental-grand-prix-5000-as-tr-tire",
      ),
    ],
    featured: true,
  },
  {
    id: -1802,
    name: "Portland Design Works Poncho Fenders",
    slug: "pdw-poncho-recycled-fenders",
    brandName: "Portland Design Works",
    brandSlug: "portland-design-works",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Full wet-weather cover",
    verdict:
      "Proper full-coverage mudguards for a winter or all-road bike—far more useful than a short flap when the rain settles in.",
    shortDescription:
      "A rigid full-coverage fender set with long mudflaps, safety-release tabs and mounting hardware.",
    whyRecommend:
      "Full coverage keeps spray off the rider behind you and removes a huge amount of grit from your drivetrain. The Poncho set uses stiff stays to reduce rattle and is the right style of guard for a bike built around dependable winter miles.",
    whoFor:
      "Riders with an endurance, gravel or winter road frame that has enough tyre clearance and suitable mounts.",
    whoSkip:
      "Tight-clearance race bikes, frames without compatible mounts or riders who only want a quick removable rear flap.",
    strengths: [
      "Full front-and-rear coverage",
      "Long polypropylene mudflaps",
      "Rigid 6mm stays",
      "Front safety-release tabs",
    ],
    limitations: [
      "Frame clearance and mounts must be checked",
      "More involved to fit than a clip-on guard",
      "Designed around 45mm or 57mm fender widths",
    ],
    specifications: {
      Material: "Recycled polycarbonate",
      Fit: "650 × 57mm; 700 × 45mm or 57mm",
      Weight: "520g claimed per set",
    },
    useCases: ["Winter road bike", "Wet commuting", "All-weather endurance"],
    tags: ["mudguards", "fenders", "winter bike", "rain"],
    disciplines: ["Road", "Gravel", "Commuting"],
    seasons: ["Autumn", "Winter", "Spring"],
    priceBand: "Mid-range",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/PDW/PDWA04O/BLA.jpg",
    imageAlt: "Black Portland Design Works Poncho full-coverage fender set",
    sortOrder: 157,
    offers: [
      competitiveOffer(
        900_000_802,
        "https://www.competitivecyclist.com/portland-design-works-poncho-recycled-fenders",
      ),
    ],
    bestValue: true,
  },
  {
    id: -1803,
    name: "Wahoo TRACKR Heart Rate",
    slug: "wahoo-trackr-heart-rate",
    brandName: "Wahoo",
    brandSlug: "wahoo",
    categoryId: -5,
    categoryName: "Tech & GPS",
    categorySlug: "tech-gps",
    badge: "NDY starter",
    verdict:
      "The first training sensor a new NDY rider should buy: simple, accurate effort data indoors and outside without power-meter money.",
    shortDescription:
      "A rechargeable chest-strap heart-rate monitor with ANT+, multiple Bluetooth connections and up to 100 hours of runtime.",
    whyRecommend:
      "Heart rate gives a coach and rider a consistent view of effort for a fraction of the price of a power meter. TRACKR is rechargeable, works with common bike computers and training apps, and is easy to move between every bike and indoor setup.",
    whoFor:
      "New coached riders, indoor cyclists and anyone ready to train with repeatable effort data.",
    whoSkip:
      "Riders who dislike chest straps or already have a dependable ANT+ and Bluetooth heart-rate monitor.",
    strengths: [
      "Up to 100 hours per charge",
      "ANT+ and three simultaneous Bluetooth connections",
      "IPX7 water rating",
      "Rechargeable sensor",
    ],
    limitations: [
      "Chest straps need regular washing",
      "No onboard workout storage",
      "Fit and skin contact affect readings",
    ],
    specifications: {
      Connectivity: "ANT+ and Bluetooth",
      Battery: "Rechargeable; up to 100 hours",
      Rating: "IPX7",
    },
    useCases: ["NDY coaching", "Zone training", "Indoor sessions"],
    tags: ["heart rate monitor", "Wahoo", "training zones", "NDY"],
    disciplines: ["Road", "Indoor", "Triathlon"],
    seasons: ["All year"],
    priceBand: "Accessible",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/WHA/WHAC02M/ONECOL.jpg",
    imageAlt: "Wahoo TRACKR rechargeable chest-strap heart-rate monitor",
    sortOrder: 103,
    offers: [
      competitiveOffer(
        900_000_803,
        "https://www.competitivecyclist.com/wahoo-fitness-trackr-heart-rate-monitor",
      ),
    ],
    bestValue: true,
  },
  {
    id: -1804,
    name: "Wahoo KICKR HEADWIND",
    slug: "wahoo-kickr-headwind",
    brandName: "Wahoo",
    brandSlug: "wahoo",
    categoryId: -4,
    categoryName: "Indoor Training",
    categorySlug: "indoor-training",
    badge: "Indoor essential",
    verdict:
      "The premium indoor fan that puts strong, targeted airflow exactly where a rider needs it.",
    shortDescription:
      "A connected training fan with four manual speeds and automatic control from heart rate or riding speed.",
    whyRecommend:
      "Cooling is not an optional extra for quality indoor sessions. HEADWIND moves enough air for hard work, aims it along the rider's body and can automatically increase as effort rises.",
    whoFor:
      "Regular indoor riders building a permanent, low-fuss training setup.",
    whoSkip:
      "Occasional indoor riders who can position a powerful standard floor fan effectively.",
    strengths: [
      "Targeted airflow up to 30mph",
      "Heart-rate or speed-controlled fan output",
      "Bluetooth and ANT+ connectivity",
      "Two useful floor positions",
    ],
    limitations: [
      "Far more expensive than a standard fan",
      "Needs floor space in front of the bike",
      "Best value comes with frequent indoor use",
    ],
    specifications: {
      Airflow: "Up to 30mph",
      Control: "Four speeds; heart rate or riding speed",
      Connectivity: "Bluetooth and ANT+",
    },
    useCases: ["Indoor intervals", "Zwift racing", "Pain-cave cooling"],
    tags: ["indoor fan", "Wahoo", "KICKR", "cooling"],
    disciplines: ["Indoor"],
    seasons: ["All year", "Winter"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/WHA/WHA0012/BK.jpg",
    imageAlt: "Black Wahoo KICKR HEADWIND smart indoor training fan",
    sortOrder: 92,
    offers: [
      competitiveOffer(
        900_000_804,
        "https://www.competitivecyclist.com/wahoo-fitness-kickr-headwind-fan",
      ),
    ],
  },
  {
    id: -1805,
    name: "MAAP Apex Deep Winter Glove",
    slug: "maap-apex-deep-winter-glove",
    brandName: "MAAP",
    brandSlug: "maap",
    categoryId: -3,
    categoryName: "Clothing",
    categorySlug: "clothing",
    badge: "Deep-winter hands",
    verdict:
      "MAAP's proper cold, wind and rain glove for the days when ordinary thermal gloves stop being enough.",
    shortDescription:
      "A waterproof and windproof deep-winter glove with PrimaLoft Gold insulation and a grippy padded palm.",
    whyRecommend:
      "Cold hands can end a ride long before tired legs. This is a serious winter glove: insulated without giving up bar control, waterproof through a SympaTex insert and still usable with a phone or head unit.",
    whoFor:
      "Year-round road riders heading out around freezing temperatures, wind and rain.",
    whoSkip:
      "Riders in mild winters or anyone who normally runs warm enough in a lighter waterproof glove.",
    strengths: [
      "Waterproof, windproof and breathable insert",
      "PrimaLoft Gold insulation",
      "Non-slip padded palm",
      "Touchscreen-compatible fingertips",
    ],
    limitations: [
      "Too warm for mild or high-intensity days",
      "Bulky compared with a race glove",
      "Premium price",
    ],
    specifications: {
      Range: "Down to approximately -5°C",
      Protection: "SympaTex waterproof and windproof insert",
      Insulation: "PrimaLoft Gold",
    },
    useCases: ["Deep-winter road rides", "Cold rain", "Long endurance days"],
    tags: ["winter gloves", "MAAP", "waterproof", "cold weather"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Winter"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/DeepWinterGlove_Black_LP_FLATLAY.png?v=1738561784",
    imageAlt: "Black MAAP Apex Deep Winter cycling gloves",
    sortOrder: 73,
    offers: [
      maapOffer(
        900_000_805,
        "https://maap.cc/eu/products/apex-deep-winter-glove-black",
      ),
    ],
  },
  {
    id: -1806,
    name: "MAAP Apex Deep Winter Tight 2.0",
    slug: "maap-apex-deep-winter-tight-2",
    brandName: "MAAP",
    brandSlug: "maap",
    categoryId: -3,
    categoryName: "Clothing",
    categorySlug: "clothing",
    badge: "Winter leg armour",
    verdict:
      "The bib tight for committed winter mileage, combining wind and wet protection with MAAP's long-ride chamois.",
    shortDescription:
      "A deep-winter bib tight with waterproof and windproof panels, thermal fabrics and a DWR finish.",
    whyRecommend:
      "The front and upper legs take the worst of cold wind and wheel spray. MAAP places weatherproof panels where they matter, then uses softer thermoregulating fabric behind the legs so the tight remains wearable on long rides.",
    whoFor:
      "Road riders training in cold, windy and wet conditions from roughly 0°C to 12°C.",
    whoSkip:
      "Fair-weather riders, warm climates or cyclists who only need a light shoulder-season tight.",
    strengths: [
      "Windproof and waterproof front panelling",
      "Warm, breathable brushed fabric",
      "3D thermo-moulded chamois",
      "Reflective details",
    ],
    limitations: [
      "Too warm above its intended range",
      "Premium price",
      "Close fit makes sizing important",
    ],
    specifications: {
      Range: "Approximately 0–12°C",
      Protection: "Windproof, waterproof and DWR panels",
      Weight: "270g claimed",
    },
    useCases: ["Winter endurance rides", "Cold training", "Wet-weather miles"],
    tags: ["bib tights", "MAAP", "winter cycling", "waterproof"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Autumn", "Winter"],
    priceBand: "Flagship",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/2180/3833/files/MPMBT250325_BLAK.Apex_20Deep_20Winter_20Tights_LP_FLATLAY.png?v=1757565975",
    imageAlt: "Black MAAP Apex Deep Winter Tight 2.0 cycling bib tights",
    sortOrder: 74,
    offers: [
      maapOffer(
        900_000_806,
        "https://maap.cc/eu/products/apex-deep-winter-tight-2-0-black",
      ),
    ],
  },
  {
    id: -1807,
    name: "Garmin Edge 540",
    slug: "garmin-edge-540",
    brandName: "Garmin",
    brandSlug: "garmin",
    categoryId: -5,
    categoryName: "Tech & GPS",
    categorySlug: "tech-gps",
    badge: "NDY computer pick",
    verdict:
      "The sensible training computer for a new NDY rider: dependable buttons, full workout support and serious battery life without flagship excess.",
    shortDescription:
      "A compact GPS computer with multi-band positioning, structured workouts, ClimbPro and broad sensor support.",
    whyRecommend:
      "The Edge 540 records everything a coach needs, displays structured sessions clearly and pairs with heart rate, cadence, power and smart-trainer sensors. Physical buttons also remain easy to use with winter gloves and rain on the screen.",
    whoFor:
      "New coached riders and experienced cyclists who want training depth in a compact, durable computer.",
    whoSkip:
      "Riders who strongly prefer a touchscreen or only need basic speed, distance and breadcrumb navigation.",
    strengths: [
      "Up to 26 hours of demanding-use battery life",
      "Reliable button controls",
      "Multi-band GNSS positioning",
      "Structured workouts and broad sensor support",
    ],
    limitations: [
      "Menus take time to learn",
      "No touchscreen",
      "More computer than a casual rider may need",
    ],
    specifications: {
      Display: "2.6-inch colour display",
      Battery: "Up to 26 hours; 42 hours in battery saver",
      Connectivity: "Bluetooth, ANT+ and Wi-Fi",
    },
    useCases: ["NDY coaching", "Structured training", "Road navigation"],
    tags: ["bike computer", "Garmin", "NDY", "structured workouts"],
    disciplines: ["Road", "Gravel", "Indoor"],
    seasons: ["All year"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/GRM/GRMF06D/BLA.jpg",
    imageAlt: "Garmin Edge 540 GPS cycling computer",
    sortOrder: 101,
    offers: [
      competitiveOffer(
        900_000_807,
        "https://www.competitivecyclist.com/garmin-edge-540-bike-computer",
      ),
    ],
    featured: true,
  },
];

export const INTENT_AFFILIATE_DESTINATIONS: Readonly<Record<number, string>> =
  Object.fromEntries(
    INTENT_PRODUCT_SEEDS.flatMap((product) =>
      product.offers.map((item) => [
        item.id,
        impactDeepLink(item.partner, product.slug, item.destinationUrl),
      ]),
    ),
  );

export const INTENT_PRODUCTS: RecommendationProduct[] =
  INTENT_PRODUCT_SEEDS.map((seed) => ({
    id: seed.id,
    name: seed.name,
    slug: seed.slug,
    brandId: null,
    brandName: seed.brandName,
    brandSlug: seed.brandSlug,
    categoryId: seed.categoryId,
    categoryName: seed.categoryName,
    categorySlug: seed.categorySlug,
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
    featured: seed.featured ?? false,
    bestValue: seed.bestValue ?? false,
    sortOrder: seed.sortOrder,
    offers: seed.offers.map(offer),
    status: "published",
    scheduledAt: null,
    publishedAt: reviewedAt,
    lastReviewedAt: reviewedAt,
    createdAt: reviewedAt,
    updatedAt: reviewedAt,
  }));
