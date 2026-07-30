import type {
  RecommendationOffer,
  RecommendationProduct,
} from "./types";
import {
  ADDITIONAL_MAAP_AFFILIATE_DESTINATIONS,
  ADDITIONAL_MAAP_PRODUCTS,
} from "./maap-catalog";
import {
  ROAD_EXPANSION_AFFILIATE_DESTINATIONS,
  ROAD_EXPANSION_PRODUCTS,
} from "./road-catalog-expansion";

export const HEXIS_FALLBACK_OFFER_ID = 900_000_001;
export const HEXIS_AFFILIATE_URL =
  "https://www.gj4bt5vt.com/8LJN3/2CTPL/?creative_id=1&source_id=roadman-recommends&sub2=hexis-product-page";

const reviewedAt = new Date("2026-07-29T09:00:00.000Z");

const OFFER_IDS = {
  maapTeamBib: 900_000_101,
  maapEvadeJersey: 900_000_102,
  competitiveGp5000: 900_000_201,
  zwiftKickrCore2: 900_000_301,
  zwiftRideFrame: 900_000_302,
  zwiftKickrCore2Us: 900_000_303,
  zwiftRideFrameUs: 900_000_304,
  mucOffAllWeatherLube: 900_000_401,
  mucOffX3: 900_000_402,
  mucOffCleaningKit: 900_000_403,
} as const;

function impactDeepLink(
  trackingUrl: string,
  productSlug: string,
  destinationUrl: string,
) {
  const url = new URL(trackingUrl);
  url.searchParams.set("subId1", "roadman-recommends");
  url.searchParams.set("subId2", productSlug);
  url.searchParams.set("u", destinationUrl);
  return url.toString();
}

const affiliateDestinations = {
  [HEXIS_FALLBACK_OFFER_ID]: HEXIS_AFFILIATE_URL,
  [OFFER_IDS.maapTeamBib]: impactDeepLink(
    "https://maap.sjv.io/Ag027D",
    "maap-team-bib-evo",
    "https://maap.cc/products/team-bib-evo-charcoal",
  ),
  [OFFER_IDS.maapEvadeJersey]: impactDeepLink(
    "https://maap.sjv.io/Ag027D",
    "maap-evade-pro-base-jersey-2",
    "https://maap.cc/products/evade-pro-base-jersey-2-0-ghost-grey",
  ),
  [OFFER_IDS.competitiveGp5000]: impactDeepLink(
    "https://competitivecyclist.g39l.net/9VQ6AE",
    "continental-grand-prix-5000-s-tr",
    "https://www.competitivecyclist.com/continental-grand-prix-5000-s-tr-tire-tubeless",
  ),
  [OFFER_IDS.zwiftKickrCore2]: impactDeepLink(
    "https://zwiftinc.sjv.io/qWNKAN",
    "wahoo-kickr-core-2",
    "https://eu.zwift.com/collections/equipment/products/wahoo-kickr-core-2",
  ),
  [OFFER_IDS.zwiftRideFrame]: impactDeepLink(
    "https://zwiftinc.sjv.io/qWNKAN",
    "zwift-ride-smart-frame",
    "https://eu.zwift.com/products/zwift-ride-smart-frame",
  ),
  [OFFER_IDS.zwiftKickrCore2Us]: impactDeepLink(
    "https://zwiftinc.sjv.io/qWNKAN",
    "wahoo-kickr-core-2",
    "https://us.zwift.com/products/wahoo-kickr-core-2",
  ),
  [OFFER_IDS.zwiftRideFrameUs]: impactDeepLink(
    "https://zwiftinc.sjv.io/qWNKAN",
    "zwift-ride-smart-frame",
    "https://us.zwift.com/products/zwift-ride-smart-frame",
  ),
  [OFFER_IDS.mucOffAllWeatherLube]: impactDeepLink(
    "https://mucoff.sjv.io/aN6o5o",
    "muc-off-all-weather-lube",
    "https://eu.muc-off.com/products/all-weather-lube",
  ),
  [OFFER_IDS.mucOffX3]: impactDeepLink(
    "https://mucoff.sjv.io/aN6o5o",
    "muc-off-x3-chain-machine",
    "https://muc-off.com/products/x-3-dirty-chain-machine",
  ),
  [OFFER_IDS.mucOffCleaningKit]: impactDeepLink(
    "https://mucoff.sjv.io/aN6o5o",
    "muc-off-8-in-1-cleaning-kit",
    "https://muc-off.com/products/8-in-1-bicycle-cleaning-kit",
  ),
  ...ADDITIONAL_MAAP_AFFILIATE_DESTINATIONS,
  ...ROAD_EXPANSION_AFFILIATE_DESTINATIONS,
} as const;

export const FALLBACK_AFFILIATE_DESTINATIONS: Readonly<
  Record<number, string>
> = affiliateDestinations;

function offer(
  id: number,
  retailerName: string,
  affiliateProgram: string,
  regions: string[],
  currency: string,
  priceLabel: string,
): RecommendationOffer {
  return {
    id,
    retailerName,
    affiliateProgram,
    regions,
    currency,
    priceLabel,
    promoCode: null,
    priority: 0,
    active: true,
    lastCheckedAt: reviewedAt,
    lastHttpStatus: 200,
    lastError: null,
  };
}

type ProductSeed = Omit<
  RecommendationProduct,
  | "status"
  | "scheduledAt"
  | "publishedAt"
  | "lastReviewedAt"
  | "createdAt"
  | "updatedAt"
>;

function product(seed: ProductSeed): RecommendationProduct {
  return {
    ...seed,
    status: "published",
    scheduledAt: null,
    publishedAt: reviewedAt,
    lastReviewedAt: reviewedAt,
    createdAt: reviewedAt,
    updatedAt: reviewedAt,
  };
}

/**
 * The starter catalogue keeps Roadman Recommends useful in previews and in
 * environments where the database migration has not yet been deployed. Once
 * database products exist, the admin-managed records replace this array.
 */
export const FALLBACK_PUBLIC_PRODUCTS: RecommendationProduct[] = [
  product({
    id: -1001,
    name: "Hexis Athlete App",
    slug: "hexis-athlete-app",
    brandId: null,
    brandName: "Hexis",
    brandSlug: "hexis",
    categoryId: -2,
    categoryName: "Nutrition & Hydration",
    categorySlug: "nutrition-hydration",
    badge: "Roadman pick",
    evidenceStatus: "personally_used",
    verdict:
      "The nutrition app I use to match my fuelling to the work ahead instead of eating the same way every day.",
    shortDescription:
      "Hexis turns your training schedule into a personalised daily fuel plan, adapting carbohydrate and energy targets when your sessions change.",
    whyRecommend:
      "I used Hexis while losing 7kg over 12 weeks without seeing my power drop. The biggest win was not simply eating less—it was knowing when to eat more for hard sessions and when my needs were lower. Hexis connects training and nutrition in a way a standard calorie tracker does not.",
    whoFor:
      "Cyclists who train consistently and want clear daily guidance on how much to eat before, during and after changing training loads.",
    whoSkip:
      "Riders who only want a simple on-bike carbs calculator, dislike logging food or will not use the training integrations enough to justify a subscription.",
    strengths: [
      "Daily carbohydrate and energy targets adapt to your training load",
      "Connects with Garmin, WHOOP, Strava, Apple Health and TrainingPeaks",
      "Makes hard-day, easy-day and recovery fuelling easier to understand",
      "Includes race-day and competition fuelling guidance",
    ],
    limitations: [
      "Getting the full value requires regular food logging and synced training data",
      "It is a recurring subscription rather than a one-off purchase",
      "It supports performance nutrition but does not replace individual medical or clinical advice",
    ],
    specifications: {
      Pricing: "€16.99 monthly or €109.99 annually",
      Integrations:
        "Garmin, WHOOP, Strava, Apple Health, TrainingPeaks and Intervals.icu",
      "Roadman code": "CARBS25",
    },
    useCases: [
      "Fuel changing training loads",
      "Plan nutrition around hard rides",
      "Support body-composition goals without underfuelling",
      "Prepare a race-day fuelling plan",
    ],
    tags: [
      "nutrition app",
      "carbohydrate periodisation",
      "fuel planning",
      "training nutrition",
      "Hexis",
    ],
    disciplines: ["Road", "Gravel", "Indoor", "Triathlon"],
    seasons: ["All year"],
    priceBand: "€16.99/month or €109.99/year",
    imageUrl:
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7fad8d3c-795d-4b73-891f-add9262527e3/id-preview-1bd41763--4ed485f6-1095-49a9-9f0c-38cf0e041354.lovable.app-1781174554153.png",
    imageAlt:
      "Hexis personalised performance nutrition app shown alongside an athlete training",
    relatedArticleUrl: null,
    featured: true,
    bestValue: false,
    sortOrder: 10,
    offers: [
      {
        ...offer(
          HEXIS_FALLBACK_OFFER_ID,
          "Hexis",
          "Hexis partner programme",
          ["IE", "GB", "EU", "US"],
          "EUR",
          "From €9.17/month billed annually",
        ),
        promoCode: "CARBS25",
      },
    ],
  }),
  product({
    id: -1101,
    name: "MAAP Team Bib Evo",
    slug: "maap-team-bib-evo",
    brandId: null,
    brandName: "MAAP",
    brandSlug: "maap",
    categoryId: -3,
    categoryName: "Clothing",
    categorySlug: "clothing",
    badge: "Premium pick",
    evidenceStatus: "editorial",
    verdict:
      "A premium race-cut bib for riders who care as much about long-ride comfort as a clean, modern silhouette.",
    shortDescription:
      "MAAP's endurance-focused bib combines an advanced chamois, supportive Italian fabric and a high-airflow mesh back.",
    whyRecommend:
      "The Team Bib Evo gets the important details right: a supportive cut, seamless brace straps and a chamois designed for long days. It is expensive, but this is the MAAP piece to start with if comfort takes priority over building a full matching wardrobe.",
    whoFor:
      "Road riders who want premium bib shorts for long training rides, sportives and fast group rides.",
    whoSkip:
      "Occasional riders, anyone who prefers a relaxed fit, or cyclists who would get more value from a dependable mid-price bib.",
    strengths: [
      "Advanced chamois designed for all-day wear",
      "Breathable high-airflow back mesh",
      "Four-way stretch Italian fabric",
      "Seamless straps reduce pressure points",
    ],
    limitations: [
      "Premium price",
      "Close performance fit will not suit everyone",
      "Colour and size availability changes quickly",
    ],
    specifications: {
      Fit: "Performance",
      Fabric: "Italian, four-way stretch",
      Chamois: "Male-specific endurance pad",
    },
    useCases: ["Long road rides", "Sportives", "Fast group rides"],
    tags: ["bib shorts", "premium cycling kit", "MAAP", "road apparel"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "Premium",
    imageUrl:
      "https://cdn.shopify.com/s/files/1/1431/8222/products/Male_TeamBibEvoMAP-Charcoal_PRODUCT_CARD_ALT.jpg?v=1664768351",
    imageAlt: "MAAP Team Bib Evo cycling bib shorts in charcoal",
    relatedArticleUrl: null,
    featured: true,
    bestValue: false,
    sortOrder: 20,
    offers: [
      offer(
        OFFER_IDS.maapTeamBib,
        "MAAP",
        "MAAP Cycling Apparel — Impact",
        ["IE", "GB", "EU", "US"],
        "EUR",
        "View current price",
      ),
    ],
  }),
  product({
    id: -1102,
    name: "MAAP Evade Pro Base Jersey 2.0",
    slug: "maap-evade-pro-base-jersey-2",
    brandId: null,
    brandName: "MAAP",
    brandSlug: "maap",
    categoryId: -3,
    categoryName: "Clothing",
    categorySlug: "clothing",
    badge: "Hot-weather pick",
    evidenceStatus: "editorial",
    verdict:
      "A sharp, breathable race-fit jersey for warm rides when you want technical kit without the shouty graphics.",
    shortDescription:
      "A lightweight MAAP jersey using recycled Italian fabric, honeycomb mesh sleeves and low-profile pocket construction.",
    whyRecommend:
      "The Evade Pro Base 2.0 balances a very clean look with the practical details a fast summer jersey needs: moisture management, breathable sleeves, secure pockets and a low-profile collar.",
    whoFor:
      "Riders who like a close race fit and want a premium warm-weather jersey for training, events and café rides.",
    whoSkip:
      "Riders who prefer a relaxed cut, need cold-weather insulation or do not want to pay a premium for apparel.",
    strengths: [
      "Breathable honeycomb mesh sleeves",
      "Secure rear pockets with a zipped valuables pocket",
      "Light 150g construction",
      "Recycled and bluesign-approved fabrics",
    ],
    limitations: [
      "Race fit can feel restrictive if sizing is wrong",
      "Best suited to warm conditions",
      "Premium pricing",
    ],
    specifications: {
      Weight: "150g",
      Temperature: "18–35°C",
      Fit: "Core performance fit",
    },
    useCases: ["Warm-weather road rides", "Events", "Fast training"],
    tags: ["cycling jersey", "summer kit", "MAAP", "race fit"],
    disciplines: ["Road", "Gravel"],
    seasons: ["Summer"],
    priceBand: "Premium",
    imageUrl:
      "https://maap-product-images.b-cdn.net/0510/7809/files/MPMJE221924_GHST.Evade-Pro-Base-Jersey-2.0_GREY_PDP_01.jpg?height=1436&v=1728451834",
    imageAlt: "MAAP Evade Pro Base Jersey 2.0 in Ghost Grey",
    relatedArticleUrl: null,
    featured: false,
    bestValue: false,
    sortOrder: 30,
    offers: [
      offer(
        OFFER_IDS.maapEvadeJersey,
        "MAAP",
        "MAAP Cycling Apparel — Impact",
        ["IE", "GB", "EU", "US"],
        "EUR",
        "View current price",
      ),
    ],
  }),
  ...ADDITIONAL_MAAP_PRODUCTS,
  ...ROAD_EXPANSION_PRODUCTS,
  product({
    id: -1201,
    name: "Continental Grand Prix 5000 S TR",
    slug: "continental-grand-prix-5000-s-tr",
    brandId: null,
    brandName: "Continental",
    brandSlug: "continental",
    categoryId: -1,
    categoryName: "Tyres & Tubes",
    categorySlug: "tyres-tubes",
    badge: "Fast tyre pick",
    evidenceStatus: "editorial",
    verdict:
      "A benchmark fast road tyre that gives race-day speed without becoming too precious for regular training.",
    shortDescription:
      "Continental's tubeless-ready road tyre combines BlackChili rubber, Vectran puncture protection and hookless compatibility.",
    whyRecommend:
      "The GP5000 S TR is the sensible high-performance choice: quick enough to race, grippy enough for everyday road riding and available in useful widths from 25mm to 35mm.",
    whoFor:
      "Road riders moving to tubeless who want a fast tyre for training, sportives and racing.",
    whoSkip:
      "Riders prioritising maximum winter durability, anyone whose rims are not tubeless compatible, or cyclists outside the US for this retailer offer.",
    strengths: [
      "Low rolling resistance BlackChili compound",
      "Tubeless-ready for hooked and hookless rims",
      "Useful 25–35mm size range",
      "Vectran puncture protection",
    ],
    limitations: [
      "More expensive than an everyday training tyre",
      "Tubeless installation can take patience",
      "This Competitive Cyclist offer is US-only",
    ],
    specifications: {
      Type: "Tubeless-ready clincher",
      Sizes: "700c × 25, 28, 30, 32 or 35",
      "Maximum pressure": "73 psi",
    },
    useCases: ["Fast road riding", "Sportives", "Racing", "Tubeless setups"],
    tags: ["road tyre", "tubeless", "Continental", "GP5000"],
    disciplines: ["Road"],
    seasons: ["Spring", "Summer", "Autumn"],
    priceBand: "$102.95–$116.95",
    imageUrl:
      "https://static.biketiresdirect.com/productimages/images650/COJUY13-1.jpg",
    imageAlt:
      "Continental Grand Prix 5000 S TR tubeless-ready road cycling tyre",
    relatedArticleUrl: null,
    featured: true,
    bestValue: false,
    sortOrder: 40,
    offers: [
      offer(
        OFFER_IDS.competitiveGp5000,
        "Competitive Cyclist",
        "Competitive Cyclist — Impact",
        ["US"],
        "USD",
        "From $102.95",
      ),
    ],
  }),
  product({
    id: -1301,
    name: "Wahoo KICKR CORE 2 with Zwift Cog and Click",
    slug: "wahoo-kickr-core-2",
    brandId: null,
    brandName: "Wahoo",
    brandSlug: "wahoo",
    categoryId: -4,
    categoryName: "Indoor Training",
    categorySlug: "indoor-training",
    badge: "Indoor pick",
    evidenceStatus: "editorial",
    verdict:
      "The sweet-spot smart trainer for riders who want a convincing indoor ride and quiet virtual shifting without flagship pricing.",
    shortDescription:
      "A direct-drive smart trainer with Zwift Cog pre-installed, handlebar-mounted Click controls and automatic resistance.",
    whyRecommend:
      "KICKR CORE 2 covers the things that matter for consistent indoor riding: reliable resistance, a built-in power meter, broad 8–13-speed compatibility and Zwift virtual shifting straight out of the box.",
    whoFor:
      "Cyclists building a dependable indoor setup for structured training, racing and winter mileage.",
    whoSkip:
      "Riders who need a fully integrated smart bike, do not use Zwift, or only ride indoors occasionally enough for a basic trainer to do the job.",
    strengths: [
      "Zwift Cog and Click included",
      "Fits most 8–13-speed bikes",
      "Automatic gradient-matched resistance",
      "Direct-drive design keeps noise down",
    ],
    limitations: [
      "Requires a separate bike and training screen",
      "Virtual shifting is most valuable inside Zwift",
      "A trainer mat and fan are still separate purchases",
    ],
    specifications: {
      Drive: "Direct drive",
      Compatibility: "Most 8–13-speed bikes",
      Controls: "Zwift Click",
    },
    useCases: ["Indoor intervals", "Zwift racing", "Winter training"],
    tags: ["smart trainer", "Wahoo", "Zwift", "indoor cycling"],
    disciplines: ["Indoor", "Road", "Triathlon"],
    seasons: ["All year", "Winter"],
    priceBand: "€549.99 RRP",
    imageUrl:
      "https://eu.zwift.com/cdn/shop/files/black-friday-promo_10-25_PDP-kickr-core-1-month_d26d0fec-747a-4ee6-9e83-3c80c9550a92.jpg?v=1764633904",
    imageAlt:
      "Wahoo KICKR CORE 2 smart trainer with Zwift Cog and Click controls",
    relatedArticleUrl: null,
    featured: true,
    bestValue: true,
    sortOrder: 50,
    offers: [
      offer(
        OFFER_IDS.zwiftKickrCore2,
        "Zwift",
        "Zwift hardware — Impact",
        ["IE", "GB", "EU"],
        "EUR",
        "View current price",
      ),
      offer(
        OFFER_IDS.zwiftKickrCore2Us,
        "Zwift",
        "Zwift hardware — Impact",
        ["US"],
        "USD",
        "View current price",
      ),
    ],
  }),
  product({
    id: -1302,
    name: "Zwift Ride Smart Frame",
    slug: "zwift-ride-smart-frame",
    brandId: null,
    brandName: "Zwift",
    brandSlug: "zwift",
    categoryId: -4,
    categoryName: "Indoor Training",
    categorySlug: "indoor-training",
    badge: "Shared-home pick",
    evidenceStatus: "editorial",
    verdict:
      "A tidy way to turn a compatible trainer into an always-ready indoor bike that can be adjusted quickly between riders.",
    shortDescription:
      "An adjustable indoor frame with integrated Zwift controls, virtual shifting and an included Zwift Cog.",
    whyRecommend:
      "The Smart Frame solves the friction that kills indoor consistency: no outdoor bike to mount, no cassette to match and quick adjustment for different riders at home.",
    whoFor:
      "Regular Zwift users with a compatible trainer who want a permanent, shareable indoor setup.",
    whoSkip:
      "Riders without a compatible smart trainer, anyone short on permanent floor space, or cyclists who want a platform-agnostic smart bike.",
    strengths: [
      "Adjusts for riders from 152–198cm",
      "Integrated steering and game controls",
      "Quiet virtual shifting",
      "Keeps the outdoor bike ready to ride",
    ],
    limitations: [
      "A compatible smart trainer is still required",
      "Not compatible with every trainer",
      "Indoor-only and should not be stored vertically",
    ],
    specifications: {
      "Rider height": "152–198cm",
      Weight: "25.5kg",
      Drivetrain: "Single-speed Zwift Cog",
    },
    useCases: ["Permanent pain cave", "Shared indoor setup", "Zwift racing"],
    tags: ["smart bike", "Zwift Ride", "indoor frame", "virtual shifting"],
    disciplines: ["Indoor"],
    seasons: ["All year", "Winter"],
    priceBand: "€799.99",
    imageUrl:
      "https://eu.zwift.com/cdn/shop/files/zwift-ride-smart-frame_89c125f7-3250-4296-bb79-6cea1211b9cf.jpg?v=1724450021",
    imageAlt: "Zwift Ride adjustable smart frame for indoor cycling",
    relatedArticleUrl: null,
    featured: false,
    bestValue: false,
    sortOrder: 60,
    offers: [
      offer(
        OFFER_IDS.zwiftRideFrame,
        "Zwift",
        "Zwift hardware — Impact",
        ["IE", "GB", "EU"],
        "EUR",
        "€799.99",
      ),
      offer(
        OFFER_IDS.zwiftRideFrameUs,
        "Zwift",
        "Zwift hardware — Impact",
        ["US"],
        "USD",
        "$799.99",
      ),
    ],
  }),
  product({
    id: -1401,
    name: "Muc-Off All Weather Lube",
    slug: "muc-off-all-weather-lube",
    brandId: null,
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Everyday essential",
    evidenceStatus: "editorial",
    verdict:
      "A simple one-bottle chain lube for riders who would rather ride than debate the forecast.",
    shortDescription:
      "A durable synthetic lube made for road, gravel, commuting and mountain biking in changing conditions.",
    whyRecommend:
      "One dependable bottle is often better than a shelf of specialist lubes. This penetrates the rollers, resists water and uses a pipette so it is easy to apply without flooding the drivetrain.",
    whoFor:
      "Year-round riders who want a straightforward lube for mixed weather and regular maintenance.",
    whoSkip:
      "Wax devotees, riders chasing the absolute lowest drivetrain friction, or anyone who only rides in consistently dry conditions.",
    strengths: [
      "Works in wet and dry conditions",
      "Pipette makes accurate application easy",
      "Helps reduce friction and shifting noise",
      "Suitable for road, gravel, MTB and commuting",
    ],
    limitations: [
      "Clean and dry the chain before application",
      "Excess lube must be wiped away",
      "Specialist wet or dry lubes may suit extreme conditions better",
    ],
    specifications: {
      Sizes: "50ml or 120ml",
      Application: "1–2 drops per roller",
      Formula: "Readily biodegradable synthetic lube",
    },
    useCases: ["Mixed-weather riding", "Routine chain care", "Commuting"],
    tags: ["chain lube", "bike maintenance", "Muc-Off", "all weather"],
    disciplines: ["Road", "Gravel", "MTB", "Commuting"],
    seasons: ["All year"],
    priceBand: "From €10",
    imageUrl:
      "https://eu.muc-off.com/cdn/shop/products/Web_20891-AllWeatherLube50ml_2022.jpg?v=1774015829",
    imageAlt: "Muc-Off All Weather bicycle chain lube bottle",
    relatedArticleUrl: null,
    featured: false,
    bestValue: true,
    sortOrder: 70,
    offers: [
      offer(
        OFFER_IDS.mucOffAllWeatherLube,
        "Muc-Off",
        "Muc-Off — Impact",
        ["IE", "GB", "EU"],
        "EUR",
        "From €10",
      ),
    ],
  }),
  product({
    id: -1402,
    name: "Muc-Off X-3 Dirty Chain Machine",
    slug: "muc-off-x3-chain-machine",
    brandId: null,
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Workshop pick",
    evidenceStatus: "editorial",
    verdict:
      "A fast, contained way to deep-clean a grimy chain without removing it from the bike.",
    shortDescription:
      "A reusable chain cleaner with 120 contact points, separate dirty-fluid reservoir and 75ml drivetrain cleaner.",
    whyRecommend:
      "The X-3 makes the unglamorous job easier: cleaner goes into the upper chamber, dirty fluid drops away from the chain, and the brushes reach every face of each link.",
    whoFor:
      "Riders who train outdoors year-round and want a repeatable drivetrain-cleaning routine.",
    whoSkip:
      "Hot-wax users who remove the chain for cleaning, infrequent riders, or anyone happy with a brush and rag.",
    strengths: [
      "120 chain contact points",
      "Separates dirty fluid from the cleaned chain",
      "Heavy-duty reusable body",
      "Includes 75ml drivetrain cleaner",
    ],
    limitations: [
      "Costs more than a basic brush",
      "Still needs rinsing and drying afterwards",
      "Not suitable for motorcycle chains",
    ],
    specifications: {
      "Contact points": "120",
      Included: "75ml drivetrain cleaner",
      Compatibility: "Road, gravel, MTB and cyclocross chains",
    },
    useCases: ["Deep chain cleaning", "Winter maintenance", "Workshop routine"],
    tags: ["chain cleaner", "drivetrain", "Muc-Off", "bike tools"],
    disciplines: ["Road", "Gravel", "MTB"],
    seasons: ["All year", "Winter"],
    priceBand: "£37",
    imageUrl:
      "https://muc-off.com/cdn/shop/products/277-X3-Chain-Machine_Grey.jpg?v=1616054888",
    imageAlt: "Muc-Off X-3 Dirty Chain Machine and drivetrain cleaner",
    relatedArticleUrl: null,
    featured: false,
    bestValue: false,
    sortOrder: 80,
    offers: [
      offer(
        OFFER_IDS.mucOffX3,
        "Muc-Off",
        "Muc-Off — Impact",
        ["IE", "GB", "EU"],
        "GBP",
        "£37",
      ),
    ],
  }),
  product({
    id: -1403,
    name: "Muc-Off 8 in 1 Bicycle Cleaning Kit",
    slug: "muc-off-8-in-1-cleaning-kit",
    brandId: null,
    brandName: "Muc-Off",
    brandSlug: "muc-off",
    categoryId: -6,
    categoryName: "Tools & Accessories",
    categorySlug: "tools-accessories",
    badge: "Starter kit",
    evidenceStatus: "editorial",
    verdict:
      "The useful all-in-one cleaning kit for a new bike owner—or anyone still washing an expensive bike with one tired sponge.",
    shortDescription:
      "Cleaner, protectant, sponge and four purpose-made brushes packed in a storage tub that doubles as a parts washer.",
    whyRecommend:
      "It covers a complete bike wash without making you work out which brushes and sprays to buy individually. The tub keeps everything together and becomes genuinely useful when cleaning small parts.",
    whoFor:
      "New bike owners, riders setting up a home cleaning station, or anyone buying a practical cycling gift.",
    whoSkip:
      "Riders who already own good brushes and cleaner, or cyclists without somewhere suitable to wash a bike.",
    strengths: [
      "Complete wash kit in one tub",
      "Four brushes for frames and hard-to-reach areas",
      "Includes cleaner and post-wash protection",
      "Suitable for every type of bicycle",
    ],
    limitations: [
      "Bulkier than buying only the essentials",
      "Does not include a dedicated chain degreaser",
      "A hose or separate water supply is still needed",
    ],
    specifications: {
      Contents: "Cleaner, Bike Protect, sponge, four brushes and storage tub",
      Pieces: "8",
      Compatibility: "All bicycle types",
    },
    useCases: ["Complete bike wash", "New-rider setup", "Cycling gift"],
    tags: ["bike cleaning", "cleaning kit", "Muc-Off", "bike care"],
    disciplines: ["Road", "Gravel", "MTB", "Commuting"],
    seasons: ["All year"],
    priceBand: "£50",
    imageUrl:
      "https://muc-off.com/cdn/shop/products/Web_250_8-IN-1-BICYCLE_CLEANING_KIT_ALL_2021.jpg?v=1633005800",
    imageAlt: "Muc-Off 8 in 1 Bicycle Cleaning Kit with brushes and sprays",
    relatedArticleUrl: null,
    featured: false,
    bestValue: false,
    sortOrder: 90,
    offers: [
      offer(
        OFFER_IDS.mucOffCleaningKit,
        "Muc-Off",
        "Muc-Off — Impact",
        ["IE", "GB", "EU"],
        "GBP",
        "£50",
      ),
    ],
  }),
];
