import type {
  RecommendationOffer,
  RecommendationProduct,
} from "./types";

const reviewedAt = new Date("2026-07-30T19:30:00.000Z");

const TRACKING_URLS = {
  competitiveCyclist: "https://competitivecyclist.g39l.net/9VQ6AE",
  mucOff: "https://mucoff.sjv.io/aN6o5o",
  zwift: "https://zwiftinc.sjv.io/qWNKAN",
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
  priceLabel: string;
};

type ExpansionSeed = {
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

function offer(seed: OfferSeed): RecommendationOffer {
  return {
    id: seed.id,
    retailerName: seed.retailerName,
    affiliateProgram: seed.affiliateProgram,
    regions: seed.regions,
    currency: seed.currency,
    priceLabel: seed.priceLabel,
    promoCode: null,
    priority: 0,
    active: true,
    lastCheckedAt: reviewedAt,
    lastHttpStatus: 200,
    lastError: null,
  };
}

function competitiveOffer(
  id: number,
  destinationUrl: string,
): OfferSeed {
  return {
    id,
    partner: "competitiveCyclist",
    retailerName: "Competitive Cyclist",
    affiliateProgram: "Competitive Cyclist — Impact",
    destinationUrl,
    regions: ["US"],
    currency: "USD",
    priceLabel: "View current price",
  };
}

function mucOffOffer(id: number, destinationUrl: string): OfferSeed {
  return {
    id,
    partner: "mucOff",
    retailerName: "Muc-Off",
    affiliateProgram: "Muc-Off — Impact",
    destinationUrl,
    regions: ["IE", "GB", "EU"],
    currency: "EUR",
    priceLabel: "View current price",
  };
}

function zwiftOffers(
  euId: number,
  usId: number,
  euDestinationUrl: string,
  usDestinationUrl: string,
): OfferSeed[] {
  return [
    {
      id: euId,
      partner: "zwift",
      retailerName: "Zwift",
      affiliateProgram: "Zwift hardware — Impact",
      destinationUrl: euDestinationUrl,
      regions: ["IE", "GB", "EU"],
      currency: "EUR",
      priceLabel: "View current price",
    },
    {
      id: usId,
      partner: "zwift",
      retailerName: "Zwift US",
      affiliateProgram: "Zwift hardware — Impact",
      destinationUrl: usDestinationUrl,
      regions: ["US"],
      currency: "USD",
      priceLabel: "View current price",
    },
  ];
}

const EXPANSION_SEEDS: ExpansionSeed[] = [
  {
    id: -1501,
    name: "Garmin Edge 1050",
    slug: "garmin-edge-1050",
    brandName: "Garmin",
    brandSlug: "garmin",
    categoryId: -5,
    categoryName: "Tech & GPS",
    categorySlug: "tech-gps",
    badge: "Flagship computer",
    verdict:
      "The best Garmin screen and interface for riders who want maps, training and safety data in one place.",
    shortDescription:
      "A premium GPS computer with a vivid 3.5-inch touchscreen, advanced navigation and broad sensor connectivity.",
    whyRecommend:
      "The Edge 1050 is expensive, but its bright, responsive display makes maps and data genuinely easier to read at speed. It is the choice for riders who use navigation, structured training and connected safety features every week.",
    whoFor:
      "High-mileage road riders, racers and explorers who want Garmin's fullest navigation and training experience.",
    whoSkip:
      "Riders happy with a smaller computer, ultra-distance cyclists prioritising maximum battery life or anyone who only needs speed and distance.",
    strengths: [
      "Bright 3.5-inch colour touchscreen",
      "Up to 20 hours in demanding use or 60 hours in battery saver",
      "Bluetooth, ANT+ and Wi-Fi connectivity",
      "Detailed mapping, training and road-hazard features",
    ],
    limitations: [
      "Flagship price",
      "Larger and heavier than simpler head units",
      "Battery life trails the screen-free efficiency of endurance models",
    ],
    specifications: {
      Display: "3.5-inch colour touchscreen",
      Battery: "Up to 20 hours; 60 hours in battery saver",
      Connectivity: "Bluetooth, ANT+ and Wi-Fi",
    },
    useCases: ["Navigation", "Structured training", "Long road events"],
    tags: ["bike computer", "GPS", "Garmin", "navigation"],
    disciplines: ["Road", "Gravel", "Triathlon"],
    seasons: ["All year"],
    priceBand: "Flagship",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/GRM/GRMF07I/BLA.jpg",
    imageAlt: "Garmin Edge 1050 GPS cycling computer",
    sortOrder: 100,
    offers: [
      competitiveOffer(
        900_000_501,
        "https://www.competitivecyclist.com/garmin-edge-1050-gps-bike-computer",
      ),
    ],
    featured: true,
  },
  {
    id: -1502,
    name: "Garmin Varia RTL515",
    slug: "garmin-varia-rtl515",
    brandName: "Garmin",
    brandSlug: "garmin",
    categoryId: -7,
    categoryName: "Safety & Visibility",
    categorySlug: "safety-visibility",
    badge: "Safety essential",
    verdict:
      "The rear light that also tells you what is approaching—one of the most useful road-safety upgrades available.",
    shortDescription:
      "A rear radar and taillight that warns compatible computers or phones about vehicles approaching from behind.",
    whyRecommend:
      "The value is not replacing a shoulder check; it is getting an early warning before a vehicle reaches you. On quiet lanes, fast descents and solo rides, that extra awareness changes how calmly you hold your line.",
    whoFor:
      "Road riders who spend time on open roads and want better awareness of approaching traffic.",
    whoSkip:
      "Riders who only cycle on traffic-free routes or do not use a compatible display or smartphone.",
    strengths: [
      "Detects vehicles from up to 140 metres",
      "Taillight visible from up to one mile",
      "Up to 16 hours in day-flash mode",
      "Works with compatible Garmin, third-party computers and phones",
    ],
    limitations: [
      "Does not replace looking behind",
      "Needs a compatible display for the best experience",
      "Another device to charge",
    ],
    specifications: {
      Radar: "Up to 140m detection range",
      Light: "Up to one-mile visibility",
      Battery: "Up to 16 hours in day flash",
    },
    useCases: ["Solo road rides", "Country lanes", "Low-light training"],
    tags: ["rear radar", "bike light", "Garmin", "road safety"],
    disciplines: ["Road", "Gravel", "Commuting"],
    seasons: ["All year"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/GRM/GRMF011/ONECOL.jpg",
    imageAlt: "Garmin Varia RTL515 rear radar and taillight",
    sortOrder: 110,
    offers: [
      competitiveOffer(
        900_000_502,
        "https://www.competitivecyclist.com/garmin-varia-rtl515-rearview-radar-with-taillight",
      ),
    ],
    featured: true,
  },
  {
    id: -1503,
    name: "Garmin Rally RS110 Power Pedals",
    slug: "garmin-rally-rs110-power-pedals",
    brandName: "Garmin",
    brandSlug: "garmin",
    categoryId: -9,
    categoryName: "Components & Upgrades",
    categorySlug: "components-upgrades",
    badge: "Power upgrade",
    verdict:
      "A clean route into reliable power data for Shimano-cleat riders who want easy bike-to-bike swaps.",
    shortDescription:
      "Single-sided SPD-SL-compatible power pedals with rechargeable batteries and claimed ±1% accuracy.",
    whyRecommend:
      "Pedal power is the easiest format to move between bikes. The RS110 keeps the familiar Shimano road interface, adds long rechargeable runtime and leaves an upgrade path to dual-sided measurement.",
    whoFor:
      "Road riders starting structured power training or sharing one power meter across several bikes.",
    whoSkip:
      "Riders who need left-right balance now, use Look or Speedplay cleats, or already own a crank-based meter.",
    strengths: [
      "Claimed ±1% power accuracy",
      "Shimano SPD-SL cleat compatibility",
      "Up to 90 hours per charge",
      "Modular and upgradeable pedal design",
    ],
    limitations: [
      "Single-sided measurement estimates total power",
      "Costs far more than standard pedals",
      "Pedal bodies can collect cosmetic crash damage",
    ],
    specifications: {
      Measurement: "Single-sided power and cadence",
      Accuracy: "Claimed ±1%",
      Battery: "Rechargeable, up to 90 hours",
    },
    useCases: ["Power-based training", "Bike-to-bike swaps", "Race pacing"],
    tags: ["power meter", "pedals", "Garmin", "SPD-SL"],
    disciplines: ["Road", "Triathlon"],
    seasons: ["All year"],
    priceBand: "Flagship",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/GRM/GRMF091/BLA.jpg",
    imageAlt: "Garmin Rally RS110 single-sided power meter pedals",
    sortOrder: 120,
    offers: [
      competitiveOffer(
        900_000_503,
        "https://www.competitivecyclist.com/garmin-rally-rs110-power-clipless-pedals",
      ),
    ],
  },
  {
    id: -1504,
    name: "Shimano Ultegra PD-R8000 Pedals",
    slug: "shimano-ultegra-pd-r8000-pedals",
    brandName: "Shimano",
    brandSlug: "shimano",
    categoryId: -9,
    categoryName: "Components & Upgrades",
    categorySlug: "components-upgrades",
    badge: "Dependable pedal",
    verdict:
      "The road pedal sweet spot: stable, light enough and famously easy to live with.",
    shortDescription:
      "Carbon-composite SPD-SL pedals with a wide platform and adjustable cleat-retention tension.",
    whyRecommend:
      "Ultegra pedals do not need novelty to justify themselves. They offer a broad, reassuring platform, predictable engagement and Shimano serviceability without the cost of Dura-Ace.",
    whoFor:
      "Road riders wanting a durable performance pedal for training, racing and year-round mileage.",
    whoSkip:
      "Riders who walk frequently, prefer dual-sided entry or want integrated power measurement.",
    strengths: [
      "Wide, stable carbon-composite platform",
      "Adjustable entry and release tension",
      "Proven SPD-SL cleat system",
      "Competitive 248g claimed pair weight",
    ],
    limitations: [
      "Single-sided entry takes practice",
      "Road cleats are awkward for walking",
      "No power measurement",
    ],
    specifications: {
      System: "Shimano SPD-SL",
      Body: "Carbon composite with steel plate",
      Weight: "248g claimed per pair",
    },
    useCases: ["Daily road riding", "Racing", "Sportives"],
    tags: ["road pedals", "Shimano", "Ultegra", "SPD-SL"],
    disciplines: ["Road", "Triathlon"],
    seasons: ["All year"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/SHI/SHI00G3/GY.jpg",
    imageAlt: "Shimano Ultegra PD-R8000 SPD-SL road pedals",
    sortOrder: 121,
    offers: [
      competitiveOffer(
        900_000_504,
        "https://www.competitivecyclist.com/shimano-ultegra-pd-r8000-pedals",
      ),
    ],
    bestValue: true,
  },
  {
    id: -1505,
    name: "Shimano S-PHYRE RC903 Shoes",
    slug: "shimano-s-phyre-rc903-shoes",
    brandName: "Shimano",
    brandSlug: "shimano",
    categoryId: -3,
    categoryName: "Clothing",
    categorySlug: "clothing",
    badge: "Race shoe",
    verdict:
      "A benchmark race shoe for riders who want a locked-in heel and a very stiff connection to the bike.",
    shortDescription:
      "Shimano's flagship road shoe combines a carbon sole, wraparound upper and dual BOA Li2 adjustment.",
    whyRecommend:
      "The RC903 focuses on fit security and power transfer rather than gimmicks. The heel cup stays planted under hard efforts and the two BOA zones make small pressure adjustments possible while riding.",
    whoFor:
      "Racers and performance-focused road riders with narrow-to-average feet who value stiffness and precise adjustment.",
    whoSkip:
      "Wide-footed riders without access to the wide version, casual cyclists or anyone who prioritises walking comfort.",
    strengths: [
      "Very stiff carbon sole",
      "Dual BOA Li2 micro-adjustment",
      "Secure anti-twist heel cup",
      "Perforated upper for ventilation",
    ],
    limitations: [
      "Runs narrow and sizing needs care",
      "Race stiffness is excessive for some riders",
      "Flagship price",
    ],
    specifications: {
      Closure: "Dual BOA Li2",
      Cleats: "Three-bolt road",
      Weight: "225g claimed per shoe in size 42",
    },
    useCases: ["Road racing", "Fast training", "Time trials"],
    tags: ["cycling shoes", "Shimano", "S-PHYRE", "race kit"],
    disciplines: ["Road", "Triathlon"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Flagship",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/SHI/SHIU30X/BLA.jpg",
    imageAlt: "Black Shimano S-PHYRE RC903 road cycling shoes",
    sortOrder: 130,
    offers: [
      competitiveOffer(
        900_000_505,
        "https://www.competitivecyclist.com/shimano-rc903-s-phyre-cycling-shoe-mens",
      ),
    ],
  },
  {
    id: -1506,
    name: "POC Ventral Air MIPS",
    slug: "poc-ventral-air-mips",
    brandName: "POC",
    brandSlug: "poc",
    categoryId: -7,
    categoryName: "Safety & Visibility",
    categorySlug: "safety-visibility",
    badge: "Hot-weather helmet",
    verdict:
      "A highly ventilated road helmet that keeps the safety story strong without looking bulky.",
    shortDescription:
      "A performance road helmet with MIPS Integra, 18 vents, a unibody shell and an eyewear garage.",
    whyRecommend:
      "The Ventral Air is the pick for long climbs and hot days. Its internal channels move a meaningful amount of air, while the integrated MIPS system avoids making the helmet feel overbuilt.",
    whoFor:
      "Road riders and racers who prioritise ventilation, secure eyewear storage and rotational-impact protection.",
    whoSkip:
      "Cold-weather riders, cyclists who prefer a compact rounder fit or anyone shopping at entry-level prices.",
    strengths: [
      "MIPS Integra rotational-impact system",
      "18-vent airflow design",
      "Fully wrapped unibody shell",
      "Integrated eyewear garage",
    ],
    limitations: [
      "Premium price",
      "Fit shape will not suit every head",
      "Open ventilation gives less cold-weather coverage",
    ],
    specifications: {
      Safety: "MIPS Integra",
      Ventilation: "18 vents",
      Adjustment: "Lightweight ratcheting dial",
    },
    useCases: ["Hot road rides", "Climbing", "Racing"],
    tags: ["road helmet", "MIPS", "POC", "summer cycling"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/POC/POCZ1MR/APANAVMAT.jpg",
    imageAlt: "POC Ventral Air MIPS road cycling helmet",
    sortOrder: 131,
    offers: [
      competitiveOffer(
        900_000_506,
        "https://www.competitivecyclist.com/poc-ventral-air-mips-helmet",
      ),
    ],
  },
  {
    id: -1507,
    name: "Kask Protone Icon",
    slug: "kask-protone-icon",
    brandName: "Kask",
    brandSlug: "kask",
    categoryId: -7,
    categoryName: "Safety & Visibility",
    categorySlug: "safety-visibility",
    badge: "All-round helmet",
    verdict:
      "The polished all-round road helmet for riders who care equally about fit, airflow and a low-profile shape.",
    shortDescription:
      "Kask's performance road helmet uses a 14-vent shell, OCTOFIT+ adjustment and WG11-tested protection.",
    whyRecommend:
      "The Protone Icon has become a road staple because it works across racing, endurance and everyday riding. Its compact profile and vertically adjustable retention system make it especially good for riders who struggle with tall-looking helmets.",
    whoFor:
      "Road cyclists wanting one premium helmet for training, events and fast summer riding.",
    whoSkip:
      "Riders who specifically want a MIPS-labelled system or need a budget helmet.",
    strengths: [
      "Compact aerodynamic profile",
      "OCTOFIT+ micro-adjustment",
      "Kask WG11 rotational-impact testing",
      "Fast-drying Coolmax padding",
    ],
    limitations: [
      "Premium price",
      "Fourteen vents are fewer than the most open climbing helmets",
      "Helmet fit remains highly individual",
    ],
    specifications: {
      Safety: "Kask WG11 and CPSC",
      Ventilation: "14 vents",
      Adjustment: "OCTOFIT+",
    },
    useCases: ["Road racing", "Endurance rides", "Daily training"],
    tags: ["road helmet", "Kask", "Protone", "cycling safety"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/KSK/KSKZ00J/ESPBROMAT.jpg",
    imageAlt: "Kask Protone Icon performance road cycling helmet",
    sortOrder: 132,
    offers: [
      competitiveOffer(
        900_000_507,
        "https://www.competitivecyclist.com/kask-protone-icon-helmet",
      ),
    ],
  },
  {
    id: -1508,
    name: "Fizik Vento Argo R1 Adaptive",
    slug: "fizik-vento-argo-r1-adaptive",
    brandName: "Fizik",
    brandSlug: "fizik",
    categoryId: -9,
    categoryName: "Components & Upgrades",
    categorySlug: "components-upgrades",
    badge: "Premium saddle",
    verdict:
      "A supportive short-nose race saddle with pressure-mapped 3D padding—excellent when the shape matches you.",
    shortDescription:
      "A carbon-railed short-nose saddle using zonal 3D-printed Adaptive cushioning.",
    whyRecommend:
      "The benefit is not softness everywhere; it is different support through distinct zones. The short nose suits a rotated, performance position and the open lattice sheds heat better than traditional foam.",
    whoFor:
      "Flexible road riders who like short-nose saddles and want targeted support in an aggressive position.",
    whoSkip:
      "Riders who have not measured sit-bone width, prefer a rounded endurance shape or expect any saddle to be universally comfortable.",
    strengths: [
      "Pressure-mapped 3D-printed cushioning",
      "Short-nose performance shape",
      "Breathable open-lattice padding",
      "Light carbon rail construction",
    ],
    limitations: [
      "Saddle fit is highly personal",
      "Very expensive",
      "Open lattice needs more detailed cleaning",
    ],
    specifications: {
      Shape: "Short nose",
      Padding: "3D-printed Adaptive lattice",
      Widths: "140mm or 150mm",
    },
    useCases: ["Fast road riding", "Racing", "Aggressive bike fits"],
    tags: ["road saddle", "Fizik", "3D printed", "bike fit"],
    disciplines: ["Road", "Gravel"],
    seasons: ["All year"],
    priceBand: "Flagship",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/FIZ/FIZZ047/BLA.jpg",
    imageAlt: "Black Fizik Vento Argo R1 Adaptive 3D-printed saddle",
    sortOrder: 140,
    offers: [
      competitiveOffer(
        900_000_508,
        "https://www.competitivecyclist.com/fi-zik-vento-argo-r1-adaptive-saddle",
      ),
    ],
  },
  {
    id: -1509,
    name: "Vittoria Corsa Pro G2.0 TLR",
    slug: "vittoria-corsa-pro-g2-tlr",
    brandName: "Vittoria",
    brandSlug: "vittoria",
    categoryId: -1,
    categoryName: "Tyres & Tubes",
    categorySlug: "tyres-tubes",
    badge: "Supple race tyre",
    verdict:
      "The race tyre for riders who value a beautifully supple feel as much as outright speed.",
    shortDescription:
      "A 320 TPI tubeless-ready cotton tyre using a graphene and silica compound for speed and grip.",
    whyRecommend:
      "The Corsa Pro's appeal is the way it takes the sting out of imperfect roads while still feeling genuinely fast. It is a strong alternative to the GP5000 for riders who prioritise ride quality and cornering feel.",
    whoFor:
      "Road racers and fast riders seeking a premium tubeless tyre with a supple casing.",
    whoSkip:
      "Winter commuters, durability-first riders or cyclists who want a low-maintenance training tyre.",
    strengths: [
      "Supple 320 TPI cotton casing",
      "Graphene and silica compound",
      "Tubeless-ready construction",
      "Widths from 24mm to 32mm",
    ],
    limitations: [
      "Premium price and race-focused lifespan",
      "Cotton sidewalls need more care",
      "Tubeless installation can be messy",
    ],
    specifications: {
      Type: "Tubeless-ready",
      Casing: "320 TPI cotton",
      Sizes: "700 × 24–32c",
    },
    useCases: ["Road racing", "Fast summer riding", "Gran fondos"],
    tags: ["road tyre", "tubeless", "Vittoria", "race tyre"],
    disciplines: ["Road"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/VIT/VITC04F/REDBLA.jpg",
    imageAlt: "Vittoria Corsa Pro G2.0 tubeless-ready road tyre",
    sortOrder: 41,
    offers: [
      competitiveOffer(
        900_000_509,
        "https://www.competitivecyclist.com/vittoria-corsa-pro-g2.0-tlr-tire",
      ),
    ],
  },
  {
    id: -1510,
    name: "Pirelli P Zero Race TLR RS",
    slug: "pirelli-p-zero-race-tlr-rs",
    brandName: "Pirelli",
    brandSlug: "pirelli",
    categoryId: -1,
    categoryName: "Tyres & Tubes",
    categorySlug: "tyres-tubes",
    badge: "Fast race tyre",
    verdict:
      "A direct, quick race tyre for riders chasing low rolling resistance without abandoning wet-road grip.",
    shortDescription:
      "Pirelli's tubeless-ready road race tyre combines SmartEVO rubber with a 120 TPI SpeedCORE casing.",
    whyRecommend:
      "The RS is the sharpest P Zero choice for race day and fast summer events. It rewards good roads and confident handling more than it rewards riders looking for maximum winter protection.",
    whoFor:
      "Road racers and performance riders wanting Pirelli's fastest tubeless-ready road construction.",
    whoSkip:
      "High-mileage winter riders, puncture-anxious commuters or cyclists prioritising value per kilometre.",
    strengths: [
      "Fast SpeedCORE construction",
      "SmartEVO wet-and-dry compound",
      "Modern 26–32mm size range",
      "Tubeless-ready",
    ],
    limitations: [
      "Race durability rather than winter toughness",
      "Premium price",
      "Limited benefit on rough, debris-heavy roads",
    ],
    specifications: {
      Type: "Tubeless-ready",
      Casing: "120 TPI SpeedCORE",
      Sizes: "700 × 26–32c",
    },
    useCases: ["Road racing", "Fast events", "Summer best-bike setup"],
    tags: ["road tyre", "Pirelli", "tubeless", "race tyre"],
    disciplines: ["Road"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/PIR/PIR1WWI/BLA.jpg",
    imageAlt: "Pirelli P Zero Race TLR RS road cycling tyre",
    sortOrder: 42,
    offers: [
      competitiveOffer(
        900_000_510,
        "https://www.competitivecyclist.com/pirelli-p-zero-race-tlr-rs-tire",
      ),
    ],
  },
  {
    id: -1511,
    name: "Silca Mattone Seat Pack",
    slug: "silca-mattone-seat-pack",
    brandName: "Silca",
    brandSlug: "silca",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Saddle-pack pick",
    verdict:
      "A compact, rattle-free way to carry the road essentials without spoiling the lines of the bike.",
    shortDescription:
      "A small structured saddle pack secured by a BOA dial, with organised storage for a tube, CO₂ and tools.",
    whyRecommend:
      "The Mattone sits tight against the saddle and avoids dangling straps. It is sized for the essentials rather than becoming a second luggage compartment, which is exactly right for everyday road riding.",
    whoFor:
      "Road riders who want a neat, secure home for a tube, inflator, levers and multi-tool.",
    whoSkip:
      "Bikepackers, riders carrying bulky jackets or cyclists who prefer tools in a jersey pocket.",
    strengths: [
      "Secure BOA closure",
      "Compact structured shape",
      "Internal organisation",
      "Low movement and rattle",
    ],
    limitations: [
      "Limited capacity",
      "Costs more than a basic saddle bag",
      "Careful packing is required",
    ],
    specifications: {
      Closure: "BOA dial",
      Position: "Under saddle",
      Capacity: "Road repair essentials",
    },
    useCases: ["Daily road kit", "Race spares", "Minimal repair carry"],
    tags: ["saddle bag", "Silca", "ride essentials", "road accessories"],
    disciplines: ["Road", "Gravel"],
    seasons: ["All year"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/SLC/SLCD01E/BLA.jpg",
    imageAlt: "Black Silca Mattone compact saddle pack",
    sortOrder: 150,
    offers: [
      competitiveOffer(
        900_000_511,
        "https://www.competitivecyclist.com/silca-mattone-seat-pack",
      ),
    ],
    bestValue: true,
  },
  {
    id: -1512,
    name: "Silca Super Secret 2.0",
    slug: "silca-super-secret-2-chain-lube",
    brandName: "Silca",
    brandSlug: "silca",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Drip-wax pick",
    verdict:
      "Wax-like cleanliness and efficiency without setting up a hot-wax kitchen.",
    shortDescription:
      "An air-drying tungsten-disulfide drip wax that works alone or as a top-up for hot-waxed chains.",
    whyRecommend:
      "Super Secret is the bridge between oily lubes and full hot waxing. Applied to a properly stripped chain and allowed to cure, it stays far cleaner than conventional oil and is easy to refresh.",
    whoFor:
      "Road riders who want a cleaner drivetrain and lower-friction wax performance with a simple bottle application.",
    whoSkip:
      "Riders unwilling to deep-clean the chain first or anyone who needs a last-minute wet-weather application.",
    strengths: [
      "Dry, low-grime finish",
      "Tungsten-disulfide wax formula",
      "Compatible with hot-waxed chains",
      "Simple drip application",
    ],
    limitations: [
      "Best results require a fully stripped chain",
      "Needs curing time",
      "Poor preparation undermines performance",
    ],
    specifications: {
      Type: "Air-drying drip wax",
      Volume: "100ml",
      Application: "Clean chain; apply and cure",
    },
    useCases: ["Clean road drivetrains", "Wax top-ups", "Race preparation"],
    tags: ["chain wax", "Silca", "drivetrain", "bike maintenance"],
    disciplines: ["Road", "Gravel", "Triathlon"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/SLC/SLCD03J/ONECOL.jpg",
    imageAlt: "Silca Super Secret 2.0 drip wax chain lubricant",
    sortOrder: 151,
    offers: [
      competitiveOffer(
        900_000_512,
        "https://www.competitivecyclist.com/silca-super-secret-2.0-chain-lube",
      ),
    ],
  },
  {
    id: -1513,
    name: "Feedback Sports Pro Mechanic HD",
    slug: "feedback-pro-mechanic-hd",
    brandName: "Feedback Sports",
    brandSlug: "feedback-sports",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Workshop stand",
    verdict:
      "A buy-once repair stand for serious home maintenance, with enough stability for almost any bike.",
    shortDescription:
      "A folding aluminium work stand with a fast-action clamp, 360-degree adjustment and a 100lb capacity.",
    whyRecommend:
      "A stable stand turns cleaning and servicing from an awkward balancing act into a repeatable routine. This is expensive, but the clamp, footprint and folding design are all built for years of use.",
    whoFor:
      "Cyclists who clean, adjust and service bikes regularly and want a stable home-workshop setup.",
    whoSkip:
      "Riders who outsource all maintenance, have very limited storage or only need a basic wash stand.",
    strengths: [
      "100lb load capacity",
      "Fast one-handed clamp",
      "Folds for storage or travel",
      "Durable 6061 aluminium construction",
    ],
    limitations: [
      "High purchase price",
      "Overkill for occasional adjustments",
      "Still occupies meaningful floor space",
    ],
    specifications: {
      Capacity: "100lb",
      Clamp: "Up to 2.6 inches",
      Weight: "18lb claimed",
    },
    useCases: ["Home servicing", "Bike washing", "Race preparation"],
    tags: ["repair stand", "workshop", "Feedback Sports", "bike tools"],
    disciplines: ["Road", "Gravel", "MTB"],
    seasons: ["All year"],
    priceBand: "Flagship",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/USS/USSP01B/ONECOL.jpg",
    imageAlt: "Feedback Sports Pro Mechanic HD bicycle repair stand",
    sortOrder: 152,
    offers: [
      competitiveOffer(
        900_000_513,
        "https://www.competitivecyclist.com/feedback-sports-pro-mechanic-hd",
      ),
    ],
  },
  {
    id: -1514,
    name: "Oakley Sutro Prizm",
    slug: "oakley-sutro-prizm",
    brandName: "Oakley",
    brandSlug: "oakley",
    categoryId: -7,
    categoryName: "Safety & Visibility",
    categorySlug: "safety-visibility",
    badge: "Road eyewear",
    verdict:
      "The big-lens road glasses that deliver excellent coverage and clear contrast without feeling delicate.",
    shortDescription:
      "Shield-style cycling sunglasses with Oakley Prizm optics, a lightweight frame and high-coverage lens.",
    whyRecommend:
      "The Sutro became popular for a reason: the lens gives a wide, uninterrupted field of view and keeps wind, spray and insects out. Prizm Road options also make surface detail easier to pick out in changing light.",
    whoFor:
      "Road riders wanting broad eye coverage, strong contrast and a bold modern shape.",
    whoSkip:
      "Small-faced riders, minimalists who prefer half-frame glasses or cyclists needing interchangeable lenses in one purchase.",
    strengths: [
      "Wide shield coverage",
      "Prizm contrast-enhancing optics",
      "Stable nose contact",
      "Good wind and debris protection",
    ],
    limitations: [
      "Large styling is not subtle",
      "Fit can overwhelm smaller faces",
      "Premium replacement lenses",
    ],
    specifications: {
      Lens: "Prizm shield",
      Frame: "Lightweight O Matter",
      Fit: "High coverage",
    },
    useCases: ["Road riding", "Racing", "Bright and mixed light"],
    tags: ["cycling sunglasses", "Oakley", "Prizm", "eye protection"],
    disciplines: ["Road", "Gravel"],
    seasons: ["All year"],
    priceBand: "Premium",
    imageUrl:
      "https://content.competitivecyclist.com/images/items/large/OAK/OAK01UN/MATCARS24K.jpg",
    imageAlt: "Oakley Sutro cycling sunglasses with Prizm shield lens",
    sortOrder: 153,
    offers: [
      competitiveOffer(
        900_000_514,
        "https://www.competitivecyclist.com/oakley-sutro-prizm-sunglasses",
      ),
    ],
  },
  {
    id: -1601,
    name: "Muc-Off Nano Tech Bike Cleaner",
    slug: "muc-off-nano-tech-bike-cleaner",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Wash-day essential",
    verdict:
      "The dependable spray-on cleaner for regular bike washes without overcomplicating the job.",
    shortDescription:
      "A biodegradable bike cleaner designed to break down dirt while remaining safe on common bike finishes and components.",
    whyRecommend:
      "This is the foundation of a simple cleaning setup: rinse, spray, agitate stubborn areas and rinse again. It is easier and safer than reaching for household detergents around a good bike.",
    whoFor:
      "Any rider who washes a road or gravel bike at home.",
    whoSkip:
      "Riders without access to water or anyone only needing a concentrated drivetrain degreaser.",
    strengths: [
      "Simple spray-on application",
      "Safe for common bike surfaces",
      "Biodegradable formula",
      "Available in useful refill sizes",
    ],
    limitations: [
      "Heavy grime still needs a brush",
      "Not a dedicated chain degreaser",
      "Requires rinsing",
    ],
    specifications: {
      Type: "General bike cleaner",
      Formula: "Biodegradable Nano Tech",
      Application: "Spray, agitate and rinse",
    },
    useCases: ["Routine bike washing", "Post-rain clean-up", "Frame care"],
    tags: ["bike cleaner", "Muc-Off", "washing", "maintenance"],
    disciplines: ["Road", "Gravel", "MTB"],
    seasons: ["All year"],
    priceBand: "Everyday",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/products/WEB_904-CTJ_NANO_TECH_BIKE_CLEANER_2021.jpg?v=1636041591",
    imageAlt: "Pink bottle of Muc-Off Nano Tech Bike Cleaner",
    sortOrder: 160,
    offers: [
      mucOffOffer(
        900_000_601,
        "https://eu.muc-off.com/products/nano-tech-bike-cleaner",
      ),
    ],
    bestValue: true,
  },
  {
    id: -1602,
    name: "Muc-Off Bio Drivetrain Cleaner",
    slug: "muc-off-bio-drivetrain-cleaner",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Drivetrain cleaner",
    verdict:
      "The stronger cleaner for chains, cassettes and chainrings when general bike wash is not enough.",
    shortDescription:
      "A biodegradable drivetrain degreaser for chains, chainrings, cassettes and derailleurs.",
    whyRecommend:
      "A clean frame with a black, gritty chain is only half a job. This cuts through old lubricant and road grime quickly, making it the product to use before relubing.",
    whoFor:
      "Year-round road riders and anyone maintaining more than one drivetrain.",
    whoSkip:
      "Hot-wax users following a solvent-based stripping process or riders who only need light surface cleaning.",
    strengths: [
      "Targets oily drivetrain contamination",
      "Works on chains, rings, cassettes and derailleurs",
      "Biodegradable formula",
      "Can be brushed or used in a chain cleaner",
    ],
    limitations: [
      "Needs thorough rinsing and drying",
      "Overuse removes fresh lubricant",
      "Keep away from brake surfaces",
    ],
    specifications: {
      Type: "Drivetrain degreaser",
      Volume: "500ml",
      Formula: "Biodegradable",
    },
    useCases: ["Deep drivetrain cleaning", "Pre-lube preparation", "Winter maintenance"],
    tags: ["degreaser", "drivetrain", "Muc-Off", "chain cleaning"],
    disciplines: ["Road", "Gravel", "MTB"],
    seasons: ["All year"],
    priceBand: "Everyday",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/files/Drivetrain_Cleaner_500ml_grey.png?v=1746608495",
    imageAlt: "Muc-Off Bio Drivetrain Cleaner spray bottle",
    sortOrder: 161,
    offers: [
      mucOffOffer(
        900_000_602,
        "https://eu.muc-off.com/products/bio-drivetrain-cleaner",
      ),
    ],
  },
  {
    id: -1603,
    name: "Muc-Off C3 Wet Ceramic Lube",
    slug: "muc-off-c3-wet-ceramic-lube",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Wet-weather lube",
    verdict:
      "The long-ride chain lube for properly wet days when lighter formulas wash away too quickly.",
    shortDescription:
      "A ceramic wet lube using boron nitride for durable low-friction protection in rain and mud.",
    whyRecommend:
      "For Irish winter riding, longevity matters more than a perfectly dry-looking chain. C3 Wet stays put through sustained rain and its pipette makes controlled application straightforward.",
    whoFor:
      "Road and gravel riders training through persistent wet weather.",
    whoSkip:
      "Dry-climate riders, wax devotees or anyone unwilling to wipe the chain carefully after application.",
    strengths: [
      "Built for long wet rides",
      "Ceramic coating for drivetrain protection",
      "Precise pipette application",
      "UV dye helps check coverage",
    ],
    limitations: [
      "Attracts more grime than a dry lube",
      "Excess must be wiped carefully",
      "Best applied several hours before riding",
    ],
    specifications: {
      Conditions: "Wet and muddy",
      Formula: "Ceramic with boron nitride",
      Application: "Pipette",
    },
    useCases: ["Winter road riding", "Rainy sportives", "Wet gravel"],
    tags: ["wet lube", "Muc-Off", "chain lube", "winter cycling"],
    disciplines: ["Road", "Gravel", "Cyclocross"],
    seasons: ["Autumn", "Winter", "Spring"],
    priceBand: "Premium",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/products/Web_869_c3_wet_weather_cermaic_lube_50ml_2021.jpg?v=1636041487",
    imageAlt: "Muc-Off C3 Wet Weather Ceramic chain lube",
    sortOrder: 162,
    offers: [
      mucOffOffer(
        900_000_603,
        "https://eu.muc-off.com/products/c3-wet-ceramic-lube",
      ),
    ],
  },
  {
    id: -1604,
    name: "Muc-Off Hydrodynamic Lube",
    slug: "muc-off-hydrodynamic-lube",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Performance lube",
    verdict:
      "A high-end oil-based lube for riders who want race-level smoothness without moving to wax.",
    shortDescription:
      "Muc-Off's performance chain lubricant, developed for low friction and changing conditions.",
    whyRecommend:
      "Hydrodynamic is for riders who care about drivetrain efficiency but still want a conventional bottle-and-chain routine. It works across more varied weather than a specialist dry race lube.",
    whoFor:
      "Performance road riders, racers and time triallists who prefer oil-based chain care.",
    whoSkip:
      "Budget-focused riders, wax users or cyclists who prioritise the cleanest possible drivetrain.",
    strengths: [
      "Low-friction performance focus",
      "Works across changeable conditions",
      "Precise application",
      "Suited to high-output road riding",
    ],
    limitations: [
      "Expensive per application",
      "Still attracts some road contamination",
      "Needs a clean, dry chain",
    ],
    specifications: {
      Type: "Performance chain lubricant",
      Conditions: "Dry to changeable",
      Application: "Direct to clean chain",
    },
    useCases: ["Race preparation", "Fast road riding", "Time trials"],
    tags: ["performance lube", "Muc-Off", "drivetrain", "race prep"],
    disciplines: ["Road", "Triathlon"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/products/895-1_Hydrodynamic_Lube__GREY_2021.jpg?v=1636041617",
    imageAlt: "Muc-Off Hydrodynamic performance chain lubricant",
    sortOrder: 163,
    offers: [
      mucOffOffer(
        900_000_604,
        "https://eu.muc-off.com/products/hydrodynamic-lube",
      ),
    ],
  },
  {
    id: -1605,
    name: "Muc-Off Ultimate Tubeless Setup Kit",
    slug: "muc-off-ultimate-tubeless-setup-kit",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -1,
    categoryName: "Tyres & Tubes",
    categorySlug: "tyres-tubes",
    badge: "Tubeless starter kit",
    verdict:
      "The easiest one-box route from tubeless-ready wheels to a complete working setup.",
    shortDescription:
      "A conversion kit with rim tape, valves, seal patches and sealant in road, gravel and MTB sizes.",
    whyRecommend:
      "Tubeless shopping becomes confusing when tape width, valve length and sealant are all separate. Choosing the correct kit removes that friction and gets both wheels covered in one purchase.",
    whoFor:
      "Riders converting a tubeless-ready road or gravel wheelset for the first time.",
    whoSkip:
      "Cyclists whose rims or tyres are not tubeless-ready, or experienced users who already own valves and tape.",
    strengths: [
      "Tape, valves, patches and sealant included",
      "Road and gravel options for shallow or deep rims",
      "Covers a complete wheelset",
      "Colour-coded size choices",
    ],
    limitations: [
      "Correct tape width and valve length still matter",
      "Installation can be messy",
      "Not compatible with every rim and tyre",
    ],
    specifications: {
      Includes: "Tape, two valves, seal patches and sealant",
      Options: "Road/gravel shallow or deep rim kits",
      Requirement: "Tubeless-ready wheels and tyres",
    },
    useCases: ["First tubeless conversion", "Wheelset refresh", "Road and gravel setup"],
    tags: ["tubeless kit", "Muc-Off", "rim tape", "sealant"],
    disciplines: ["Road", "Gravel"],
    seasons: ["All year"],
    priceBand: "Mid-range",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/files/WebSKU-20086-Muc-Off-Ultimate-Tubeless-Setup-Kit---DH_Trail_Enduro-Collection.jpg?v=1763640789",
    imageAlt: "Muc-Off Ultimate Tubeless Setup Kit with tape valves and sealant",
    sortOrder: 43,
    offers: [
      mucOffOffer(
        900_000_605,
        "https://eu.muc-off.com/products/ultimate-tubeless-setup-kit",
      ),
    ],
    bestValue: true,
  },
  {
    id: -1606,
    name: "Muc-Off Puncture Plug Repair Kit",
    slug: "muc-off-puncture-plug-repair-kit",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -1,
    categoryName: "Tyres & Tubes",
    categorySlug: "tyres-tubes",
    badge: "Ride-saving tool",
    verdict:
      "The compact backup for a tubeless puncture that sealant cannot close on its own.",
    shortDescription:
      "A reusable 2-in-1 reamer and plug tool with three plug sizes stored in the handle.",
    whyRecommend:
      "Tubeless sealant handles small holes; this handles the bigger cut that would otherwise end the ride. It is light enough to stay in the saddle bag permanently.",
    whoFor:
      "Any road or gravel rider running tubeless tyres.",
    whoSkip:
      "Tube-only riders or cyclists who already carry a dependable plug tool.",
    strengths: [
      "Compact all-in-one handle",
      "Three plug thicknesses included",
      "Reusable metal tool",
      "Fast roadside repair",
    ],
    limitations: [
      "Does not replace inflation",
      "Some cuts still require a tube or tyre boot",
      "Plugging takes practice",
    ],
    specifications: {
      Tool: "2-in-1 plugger and reamer",
      Plugs: "Five each of thin, medium and thick",
      Compatibility: "Tubeless tyres",
    },
    useCases: ["Roadside punctures", "Tubeless emergency kit", "Gravel repairs"],
    tags: ["tubeless repair", "puncture plug", "Muc-Off", "ride essentials"],
    disciplines: ["Road", "Gravel", "MTB"],
    seasons: ["All year"],
    priceBand: "Everyday",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/files/20131_-_Puncture_Plug_Repair_Kit_updated.jpg?v=1769082585",
    imageAlt: "Muc-Off Puncture Plug Repair Kit and assorted tyre plugs",
    sortOrder: 44,
    offers: [
      mucOffOffer(
        900_000_606,
        "https://eu.muc-off.com/products/puncture-plug-repair-kit",
      ),
    ],
  },
  {
    id: -1607,
    name: "Muc-Off Road & Gravel Tubeless Sealant",
    slug: "muc-off-road-gravel-tubeless-sealant",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -1,
    categoryName: "Tyres & Tubes",
    categorySlug: "tyres-tubes",
    badge: "Road sealant",
    verdict:
      "A road-pressure sealant designed for modern narrow tyres rather than repackaged MTB use.",
    shortDescription:
      "A water-based road and gravel sealant rated up to 110psi and designed to seal holes up to 7mm.",
    whyRecommend:
      "Road tubeless needs a fast-flowing formula that works at higher pressure. This is easy to add through a Presta valve and comes in ride-pack and workshop sizes.",
    whoFor:
      "Road, gravel and cyclocross riders using tubeless tyres.",
    whoSkip:
      "Tube users, riders mixing sealant brands or anyone unwilling to check levels every few months.",
    strengths: [
      "Works up to 110psi",
      "Designed to seal holes up to 7mm",
      "Ammonia-free water-based formula",
      "Available from 80ml pouches to bulk refills",
    ],
    limitations: [
      "Needs checking every three to six months",
      "Should not be mixed with other sealants",
      "Large cuts still need a plug",
    ],
    specifications: {
      Pressure: "Up to 110psi",
      Seal: "Up to 7mm claimed",
      Formula: "Water-based, ammonia-free",
    },
    useCases: ["Road tubeless", "Gravel tubeless", "Sealant top-ups"],
    tags: ["tubeless sealant", "Muc-Off", "road tyres", "puncture prevention"],
    disciplines: ["Road", "Gravel", "Cyclocross"],
    seasons: ["All year"],
    priceBand: "Everyday",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/files/80ml-Road-and-Gravel_4b584c97-72b9-48a7-8fc0-715be1020f5f.jpg?v=1719492785",
    imageAlt: "Muc-Off Road and Gravel Tubeless Sealant pouch",
    sortOrder: 45,
    offers: [
      mucOffOffer(
        900_000_607,
        "https://eu.muc-off.com/products/road-gravel-tubeless-sealant",
      ),
    ],
  },
  {
    id: -1608,
    name: "Muc-Off Bike Protect",
    slug: "muc-off-bike-protect",
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Post-wash protection",
    verdict:
      "The useful final step after a wet wash: disperse leftover moisture and leave vulnerable metal better protected.",
    shortDescription:
      "A water-dispersing after-wash spray designed to inhibit corrosion and freshen the bike.",
    whyRecommend:
      "Bike Protect makes most sense through winter, when water hides in bolts and awkward junctions. A light application after drying helps finish the wash properly.",
    whoFor:
      "Year-round riders storing bikes after wet washes or salty winter roads.",
    whoSkip:
      "Riders who only need frame polish or anyone unable to keep spray away from braking surfaces.",
    strengths: [
      "Disperses residual water",
      "Helps inhibit corrosion",
      "Useful after winter washes",
      "Simple aerosol application",
    ],
    limitations: [
      "Must stay off rotors, pads and tyre tread",
      "Not a substitute for drying",
      "Overspray needs care",
    ],
    specifications: {
      Type: "After-wash protection spray",
      Volume: "500ml",
      Purpose: "Water dispersion and corrosion protection",
    },
    useCases: ["Post-wash care", "Winter maintenance", "Storage preparation"],
    tags: ["bike protect", "Muc-Off", "corrosion", "winter maintenance"],
    disciplines: ["Road", "Gravel", "MTB"],
    seasons: ["All year", "Winter"],
    priceBand: "Everyday",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/products/Web_909_Bike_Protect_2021_9310634e-c062-49ed-bfa4-30eb9b1af11f.jpg?v=1636041448",
    imageAlt: "Muc-Off Bike Protect after-wash spray",
    sortOrder: 164,
    offers: [
      mucOffOffer(
        900_000_608,
        "https://eu.muc-off.com/products/bike-protect",
      ),
    ],
  },
  {
    id: -1701,
    name: "Zwift Ride with KICKR CORE 2",
    slug: "zwift-ride-with-kickr-core-2",
    brandName: "Zwift",
    brandSlug: "zwift",
    categoryId: -4,
    categoryName: "Indoor Training",
    categorySlug: "indoor-training",
    badge: "Complete indoor setup",
    verdict:
      "The simplest route to an always-ready, shareable Zwift bike without flagship smart-bike pricing.",
    shortDescription:
      "An adjustable Zwift Ride frame bundled with the Wahoo KICKR CORE 2 trainer and integrated controls.",
    whyRecommend:
      "Buying the bundle removes the compatibility work. It arrives as a complete adjustable setup with virtual shifting, game controls and enough trainer performance for serious intervals and racing.",
    whoFor:
      "Regular indoor riders, multi-rider households and cyclists who do not want to mount an outdoor bike for every session.",
    whoSkip:
      "Occasional indoor riders, athletes who need an open-platform flagship smart bike or homes without permanent floor space.",
    strengths: [
      "Complete trainer and adjustable frame bundle",
      "Fits riders from 152cm to 198cm",
      "Integrated Zwift controls and virtual shifting",
      "KICKR CORE 2 provides up to 1800W and 16% gradient simulation",
    ],
    limitations: [
      "Large purchase and shipping cost",
      "Zwift-first ecosystem",
      "Needs permanent floor space and a display",
    ],
    specifications: {
      Rider: "152–198cm; 120kg maximum",
      Trainer: "±2% accuracy; 1800W; 16% grade",
      Footprint: "136 × 60.2cm",
    },
    useCases: ["Permanent pain cave", "Shared indoor bike", "Zwift racing"],
    tags: ["smart bike", "Zwift Ride", "KICKR CORE 2", "indoor cycling"],
    disciplines: ["Indoor", "Road", "Triathlon"],
    seasons: ["All year", "Winter"],
    priceBand: "Premium",
    imageUrl:
      "https://eu.zwift.com/cdn/shop/files/zwift-ride-with-kickr-core-2-all-in-one-cycling-setup.jpg?v=1756237929",
    imageAlt: "Zwift Ride smart frame with Wahoo KICKR CORE 2 trainer",
    sortOrder: 90,
    offers: zwiftOffers(
      900_000_701,
      900_000_702,
      "https://eu.zwift.com/products/zwift-ride-kickr-core-2",
      "https://us.zwift.com/products/zwift-ride-kickr-core-2",
    ),
    featured: true,
  },
  {
    id: -1702,
    name: "Zwift Cog and Click Upgrade Kit",
    slug: "zwift-cog-click-upgrade-kit",
    brandName: "Zwift",
    brandSlug: "zwift",
    categoryId: -4,
    categoryName: "Indoor Training",
    categorySlug: "indoor-training",
    badge: "Trainer upgrade",
    verdict:
      "The low-cost upgrade that gives a compatible smart trainer quiet virtual gears and handlebar control.",
    shortDescription:
      "A Zwift Cog V2 and wireless Click controller delivering 24 virtual gears on supported trainers.",
    whyRecommend:
      "For a compatible trainer, this solves cassette matching and makes virtual shifting much more accessible. It is particularly useful when several bikes share one indoor setup.",
    whoFor:
      "Owners of compatible direct-drive trainers who want Zwift virtual shifting without replacing the trainer.",
    whoSkip:
      "Riders whose trainer is not on the compatibility list or cyclists who prefer mechanical cassette shifting.",
    strengths: [
      "Twenty-four silent virtual gears",
      "Handlebar shifting and in-game controls",
      "Adjustable chain-line positions",
      "Quick installation on compatible trainers",
    ],
    limitations: [
      "Trainer compatibility must be checked first",
      "Indoor use only",
      "Best value is inside Zwift",
    ],
    specifications: {
      Gears: "24 virtual",
      Controller: "Bluetooth; CR2032; 100+ hours",
      Compatibility: "Selected direct-drive smart trainers",
    },
    useCases: ["Trainer conversion", "Multi-bike setup", "Virtual shifting"],
    tags: ["Zwift Cog", "Zwift Click", "virtual shifting", "trainer upgrade"],
    disciplines: ["Indoor"],
    seasons: ["All year", "Winter"],
    priceBand: "Accessible",
    imageUrl:
      "https://eu.zwift.com/cdn/shop/files/zwift-cog-click-2-upgrade-kit.jpg?v=1756227303",
    imageAlt: "Zwift Cog and Click virtual shifting upgrade kit",
    sortOrder: 91,
    offers: zwiftOffers(
      900_000_703,
      900_000_704,
      "https://eu.zwift.com/products/zwift-cog-and-click-upgrade-kit",
      "https://us.zwift.com/products/zwift-cog-and-click-upgrade-kit",
    ),
    bestValue: true,
  },
];

export const ROAD_EXPANSION_AFFILIATE_DESTINATIONS: Readonly<
  Record<number, string>
> = Object.fromEntries(
  EXPANSION_SEEDS.flatMap((product) =>
    product.offers.map((item) => [
      item.id,
      impactDeepLink(item.partner, product.slug, item.destinationUrl),
    ]),
  ),
);

export const ROAD_EXPANSION_PRODUCTS: RecommendationProduct[] =
  EXPANSION_SEEDS.map((seed) => ({
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
