INSERT INTO "recommendation_brands" ("name", "slug", "website_url")
VALUES
  ('Continental', 'continental', 'https://www.continental-tires.com/'),
  ('Portland Design Works', 'portland-design-works', 'https://ridepdw.com/'),
  ('Wahoo', 'wahoo', 'https://www.wahoofitness.com/'),
  ('MAAP', 'maap', 'https://maap.cc/'),
  ('Garmin', 'garmin', 'https://www.garmin.com/')
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "website_url" = EXCLUDED."website_url",
  "updated_at" = now();
--> statement-breakpoint
INSERT INTO "recommendation_products" (
  "brand_id", "category_id", "name", "slug", "status", "badge",
  "evidence_status", "verdict", "short_description", "why_recommend",
  "who_for", "who_skip", "strengths", "limitations", "specifications",
  "use_cases", "tags", "disciplines", "seasons", "price_band",
  "image_url", "image_alt", "featured", "best_value", "sort_order",
  "published_at", "last_reviewed_at"
)
SELECT
  b."id", c."id", v."name", v."slug", 'published', v."badge",
  'editorial', v."verdict", v."short_description", v."why_recommend",
  v."who_for", v."who_skip", v."strengths"::jsonb,
  v."limitations"::jsonb, v."specifications"::jsonb,
  v."use_cases"::jsonb, v."tags"::jsonb, v."disciplines"::jsonb,
  v."seasons"::jsonb, v."price_band", v."image_url", v."image_alt",
  v."featured", v."best_value", v."sort_order", now(), now()
FROM (
  VALUES
    (
      'continental', 'tyres-tubes',
      'Continental Grand Prix 5000 AS TR',
      'continental-grand-prix-5000-as-tr',
      'Winter grip',
      'The fast all-season tyre for riders who want more wet-road confidence and protection without making the bike feel slow.',
      'An all-season tubeless-ready road tyre with BlackChili rubber, a Vectran breaker and reinforced sidewalls.',
      'This is the winter alternative to a pure race tyre. It gives away little of the lively GP5000 feel while adding the wet grip, cut protection and wider size options that matter on dark, dirty roads.',
      'Road riders training through wet winters who still care about speed and ride feel.',
      'Dry-weather racers chasing the lightest setup or riders whose rims and clearances do not suit the available sizes.',
      '["Confident all-season BlackChili compound","Vectran puncture-protection breaker","Tubeless-ready and hookless compatible","Available from 25mm to 35mm"]',
      '["Heavier than the GP5000 S TR","Premium tyre price","Tubeless fitting can be tight on some rims"]',
      '{"Type":"Tubeless-ready folding road tyre","Casing":"110 TPI with Vectran breaker","Sizes":"700 × 25, 28, 32 or 35c"}',
      '["Winter road riding","Wet training","All-season endurance"]',
      '["winter tyre","wet grip","tubeless","Continental"]',
      '["Road","Endurance"]',
      '["Autumn","Winter","Spring"]',
      'Premium',
      'https://content.competitivecyclist.com/images/items/large/CON/CONF04D/BLA.jpg',
      'Continental Grand Prix 5000 AS TR all-season road tyre',
      true, false, 40
    ),
    (
      'portland-design-works', 'tools-accessories',
      'Portland Design Works Poncho Fenders',
      'pdw-poncho-recycled-fenders',
      'Full wet-weather cover',
      'Proper full-coverage mudguards for a winter or all-road bike—far more useful than a short flap when the rain settles in.',
      'A rigid full-coverage fender set with long mudflaps, safety-release tabs and mounting hardware.',
      'Full coverage keeps spray off the rider behind you and removes a huge amount of grit from your drivetrain. The Poncho set uses stiff stays to reduce rattle and is the right style of guard for a bike built around dependable winter miles.',
      'Riders with an endurance, gravel or winter road frame that has enough tyre clearance and suitable mounts.',
      'Tight-clearance race bikes, frames without compatible mounts or riders who only want a quick removable rear flap.',
      '["Full front-and-rear coverage","Long polypropylene mudflaps","Rigid 6mm stays","Front safety-release tabs"]',
      '["Frame clearance and mounts must be checked","More involved to fit than a clip-on guard","Designed around 45mm or 57mm fender widths"]',
      '{"Material":"Recycled polycarbonate","Fit":"650 × 57mm; 700 × 45mm or 57mm","Weight":"520g claimed per set"}',
      '["Winter road bike","Wet commuting","All-weather endurance"]',
      '["mudguards","fenders","winter bike","rain"]',
      '["Road","Gravel","Commuting"]',
      '["Autumn","Winter","Spring"]',
      'Mid-range',
      'https://content.competitivecyclist.com/images/items/large/PDW/PDWA04O/BLA.jpg',
      'Black Portland Design Works Poncho full-coverage fender set',
      false, true, 157
    ),
    (
      'wahoo', 'tech-gps',
      'Wahoo TRACKR Heart Rate',
      'wahoo-trackr-heart-rate',
      'NDY starter',
      'The first training sensor a new NDY rider should buy: simple, accurate effort data indoors and outside without power-meter money.',
      'A rechargeable chest-strap heart-rate monitor with ANT+, multiple Bluetooth connections and up to 100 hours of runtime.',
      'Heart rate gives a coach and rider a consistent view of effort for a fraction of the price of a power meter. TRACKR is rechargeable, works with common bike computers and training apps, and is easy to move between every bike and indoor setup.',
      'New coached riders, indoor cyclists and anyone ready to train with repeatable effort data.',
      'Riders who dislike chest straps or already have a dependable ANT+ and Bluetooth heart-rate monitor.',
      '["Up to 100 hours per charge","ANT+ and three simultaneous Bluetooth connections","IPX7 water rating","Rechargeable sensor"]',
      '["Chest straps need regular washing","No onboard workout storage","Fit and skin contact affect readings"]',
      '{"Connectivity":"ANT+ and Bluetooth","Battery":"Rechargeable; up to 100 hours","Rating":"IPX7"}',
      '["NDY coaching","Zone training","Indoor sessions"]',
      '["heart rate monitor","Wahoo","training zones","NDY"]',
      '["Road","Indoor","Triathlon"]',
      '["All year"]',
      'Accessible',
      'https://content.competitivecyclist.com/images/items/large/WHA/WHAC02M/ONECOL.jpg',
      'Wahoo TRACKR rechargeable chest-strap heart-rate monitor',
      false, true, 103
    ),
    (
      'wahoo', 'indoor-training',
      'Wahoo KICKR HEADWIND',
      'wahoo-kickr-headwind',
      'Indoor essential',
      'The premium indoor fan that puts strong, targeted airflow exactly where a rider needs it.',
      'A connected training fan with four manual speeds and automatic control from heart rate or riding speed.',
      'Cooling is not an optional extra for quality indoor sessions. HEADWIND moves enough air for hard work, aims it along the rider body and can automatically increase as effort rises.',
      'Regular indoor riders building a permanent, low-fuss training setup.',
      'Occasional indoor riders who can position a powerful standard floor fan effectively.',
      '["Targeted airflow up to 30mph","Heart-rate or speed-controlled fan output","Bluetooth and ANT+ connectivity","Two useful floor positions"]',
      '["Far more expensive than a standard fan","Needs floor space in front of the bike","Best value comes with frequent indoor use"]',
      '{"Airflow":"Up to 30mph","Control":"Four speeds; heart rate or riding speed","Connectivity":"Bluetooth and ANT+"}',
      '["Indoor intervals","Zwift racing","Pain-cave cooling"]',
      '["indoor fan","Wahoo","KICKR","cooling"]',
      '["Indoor"]',
      '["All year","Winter"]',
      'Premium',
      'https://content.competitivecyclist.com/images/items/large/WHA/WHA0012/BK.jpg',
      'Black Wahoo KICKR HEADWIND smart indoor training fan',
      false, false, 92
    ),
    (
      'maap', 'clothing',
      'MAAP Apex Deep Winter Glove',
      'maap-apex-deep-winter-glove',
      'Deep-winter hands',
      'MAAP''s proper cold, wind and rain glove for the days when ordinary thermal gloves stop being enough.',
      'A waterproof and windproof deep-winter glove with PrimaLoft Gold insulation and a grippy padded palm.',
      'Cold hands can end a ride long before tired legs. This is a serious winter glove: insulated without giving up bar control, waterproof through a SympaTex insert and still usable with a phone or head unit.',
      'Year-round road riders heading out around freezing temperatures, wind and rain.',
      'Riders in mild winters or anyone who normally runs warm enough in a lighter waterproof glove.',
      '["Waterproof, windproof and breathable insert","PrimaLoft Gold insulation","Non-slip padded palm","Touchscreen-compatible fingertips"]',
      '["Too warm for mild or high-intensity days","Bulky compared with a race glove","Premium price"]',
      '{"Range":"Down to approximately -5°C","Protection":"SympaTex waterproof and windproof insert","Insulation":"PrimaLoft Gold"}',
      '["Deep-winter road rides","Cold rain","Long endurance days"]',
      '["winter gloves","MAAP","waterproof","cold weather"]',
      '["Road","Gravel"]',
      '["Winter"]',
      'Premium',
      'https://cdn.shopify.com/s/files/1/2180/3833/files/DeepWinterGlove_Black_LP_FLATLAY.png?v=1738561784',
      'Black MAAP Apex Deep Winter cycling gloves',
      false, false, 73
    ),
    (
      'maap', 'clothing',
      'MAAP Apex Deep Winter Tight 2.0',
      'maap-apex-deep-winter-tight-2',
      'Winter leg armour',
      'The bib tight for committed winter mileage, combining wind and wet protection with MAAP''s long-ride chamois.',
      'A deep-winter bib tight with waterproof and windproof panels, thermal fabrics and a DWR finish.',
      'The front and upper legs take the worst of cold wind and wheel spray. MAAP places weatherproof panels where they matter, then uses softer thermoregulating fabric behind the legs so the tight remains wearable on long rides.',
      'Road riders training in cold, windy and wet conditions from roughly 0°C to 12°C.',
      'Fair-weather riders, warm climates or cyclists who only need a light shoulder-season tight.',
      '["Windproof and waterproof front panelling","Warm, breathable brushed fabric","3D thermo-moulded chamois","Reflective details"]',
      '["Too warm above its intended range","Premium price","Close fit makes sizing important"]',
      '{"Range":"Approximately 0–12°C","Protection":"Windproof, waterproof and DWR panels","Weight":"270g claimed"}',
      '["Winter endurance rides","Cold training","Wet-weather miles"]',
      '["bib tights","MAAP","winter cycling","waterproof"]',
      '["Road","Gravel"]',
      '["Autumn","Winter"]',
      'Flagship',
      'https://cdn.shopify.com/s/files/1/2180/3833/files/MPMBT250325_BLAK.Apex_20Deep_20Winter_20Tights_LP_FLATLAY.png?v=1757565975',
      'Black MAAP Apex Deep Winter Tight 2.0 cycling bib tights',
      false, false, 74
    ),
    (
      'garmin', 'tech-gps',
      'Garmin Edge 540',
      'garmin-edge-540',
      'NDY computer pick',
      'The sensible training computer for a new NDY rider: dependable buttons, full workout support and serious battery life without flagship excess.',
      'A compact GPS computer with multi-band positioning, structured workouts, ClimbPro and broad sensor support.',
      'The Edge 540 records everything a coach needs, displays structured sessions clearly and pairs with heart rate, cadence, power and smart-trainer sensors. Physical buttons also remain easy to use with winter gloves and rain on the screen.',
      'New coached riders and experienced cyclists who want training depth in a compact, durable computer.',
      'Riders who strongly prefer a touchscreen or only need basic speed, distance and breadcrumb navigation.',
      '["Up to 26 hours of demanding-use battery life","Reliable button controls","Multi-band GNSS positioning","Structured workouts and broad sensor support"]',
      '["Menus take time to learn","No touchscreen","More computer than a casual rider may need"]',
      '{"Display":"2.6-inch colour display","Battery":"Up to 26 hours; 42 hours in battery saver","Connectivity":"Bluetooth, ANT+ and Wi-Fi"}',
      '["NDY coaching","Structured training","Road navigation"]',
      '["bike computer","Garmin","NDY","structured workouts"]',
      '["Road","Gravel","Indoor"]',
      '["All year"]',
      'Premium',
      'https://content.competitivecyclist.com/images/items/large/GRM/GRMF06D/BLA.jpg',
      'Garmin Edge 540 GPS cycling computer',
      true, false, 101
    )
) AS v(
  "brand_slug", "category_slug", "name", "slug", "badge", "verdict",
  "short_description", "why_recommend", "who_for", "who_skip",
  "strengths", "limitations", "specifications", "use_cases", "tags",
  "disciplines", "seasons", "price_band", "image_url", "image_alt",
  "featured", "best_value", "sort_order"
)
INNER JOIN "recommendation_brands" b ON b."slug" = v."brand_slug"
INNER JOIN "recommendation_categories" c ON c."slug" = v."category_slug"
ON CONFLICT ("slug") DO UPDATE SET
  "brand_id" = EXCLUDED."brand_id",
  "category_id" = EXCLUDED."category_id",
  "status" = EXCLUDED."status",
  "badge" = EXCLUDED."badge",
  "evidence_status" = EXCLUDED."evidence_status",
  "verdict" = EXCLUDED."verdict",
  "short_description" = EXCLUDED."short_description",
  "why_recommend" = EXCLUDED."why_recommend",
  "who_for" = EXCLUDED."who_for",
  "who_skip" = EXCLUDED."who_skip",
  "strengths" = EXCLUDED."strengths",
  "limitations" = EXCLUDED."limitations",
  "specifications" = EXCLUDED."specifications",
  "use_cases" = EXCLUDED."use_cases",
  "tags" = EXCLUDED."tags",
  "disciplines" = EXCLUDED."disciplines",
  "seasons" = EXCLUDED."seasons",
  "price_band" = EXCLUDED."price_band",
  "image_url" = EXCLUDED."image_url",
  "image_alt" = EXCLUDED."image_alt",
  "featured" = EXCLUDED."featured",
  "best_value" = EXCLUDED."best_value",
  "sort_order" = EXCLUDED."sort_order",
  "last_reviewed_at" = now(),
  "updated_at" = now();
--> statement-breakpoint
INSERT INTO "recommendation_offers" (
  "product_id", "retailer_name", "affiliate_program", "destination_url",
  "regions", "currency", "price_label", "priority", "active",
  "last_checked_at", "last_http_status"
)
SELECT
  p."id", v."retailer_name", v."affiliate_program",
  v."destination_url", v."regions"::jsonb, v."currency",
  'View current price', 0, true, now(), 200
FROM (
  VALUES
    ('continental-grand-prix-5000-as-tr', 'Competitive Cyclist', 'Competitive Cyclist — Impact', 'https://competitivecyclist.g39l.net/9VQ6AE?subId1=roadman-recommends&subId2=continental-grand-prix-5000-as-tr&u=https%3A%2F%2Fwww.competitivecyclist.com%2Fcontinental-grand-prix-5000-as-tr-tire', '["US"]', 'USD'),
    ('pdw-poncho-recycled-fenders', 'Competitive Cyclist', 'Competitive Cyclist — Impact', 'https://competitivecyclist.g39l.net/9VQ6AE?subId1=roadman-recommends&subId2=pdw-poncho-recycled-fenders&u=https%3A%2F%2Fwww.competitivecyclist.com%2Fportland-design-works-poncho-recycled-fenders', '["US"]', 'USD'),
    ('wahoo-trackr-heart-rate', 'Competitive Cyclist', 'Competitive Cyclist — Impact', 'https://competitivecyclist.g39l.net/9VQ6AE?subId1=roadman-recommends&subId2=wahoo-trackr-heart-rate&u=https%3A%2F%2Fwww.competitivecyclist.com%2Fwahoo-fitness-trackr-heart-rate-monitor', '["US"]', 'USD'),
    ('wahoo-kickr-headwind', 'Competitive Cyclist', 'Competitive Cyclist — Impact', 'https://competitivecyclist.g39l.net/9VQ6AE?subId1=roadman-recommends&subId2=wahoo-kickr-headwind&u=https%3A%2F%2Fwww.competitivecyclist.com%2Fwahoo-fitness-kickr-headwind-fan', '["US"]', 'USD'),
    ('maap-apex-deep-winter-glove', 'MAAP', 'MAAP — Impact', 'https://maap.sjv.io/Ag027D?subId1=roadman-recommends&subId2=maap-apex-deep-winter-glove&u=https%3A%2F%2Fmaap.cc%2Feu%2Fproducts%2Fapex-deep-winter-glove-black', '["IE","GB","EU","US"]', 'EUR'),
    ('maap-apex-deep-winter-tight-2', 'MAAP', 'MAAP — Impact', 'https://maap.sjv.io/Ag027D?subId1=roadman-recommends&subId2=maap-apex-deep-winter-tight-2&u=https%3A%2F%2Fmaap.cc%2Feu%2Fproducts%2Fapex-deep-winter-tight-2-0-black', '["IE","GB","EU","US"]', 'EUR'),
    ('garmin-edge-540', 'Competitive Cyclist', 'Competitive Cyclist — Impact', 'https://competitivecyclist.g39l.net/9VQ6AE?subId1=roadman-recommends&subId2=garmin-edge-540&u=https%3A%2F%2Fwww.competitivecyclist.com%2Fgarmin-edge-540-bike-computer', '["US"]', 'USD')
) AS v(
  "product_slug", "retailer_name", "affiliate_program",
  "destination_url", "regions", "currency"
)
INNER JOIN "recommendation_products" p ON p."slug" = v."product_slug"
WHERE NOT EXISTS (
  SELECT 1
  FROM "recommendation_offers" o
  WHERE o."product_id" = p."id"
    AND o."retailer_name" = v."retailer_name"
);
--> statement-breakpoint
INSERT INTO "recommendation_collections" (
  "name", "slug", "description", "rule", "active", "sort_order"
)
VALUES
  (
    'Indoor Setup',
    'indoor-setup',
    'The trainer, controls and cooling that make indoor sessions work.',
    'manual',
    true,
    30
  ),
  (
    'Winter-Proof Your Riding',
    'winter-riding',
    'Grip, warmth, rain protection, bike care and an indoor fallback for the months that test motivation.',
    'manual',
    true,
    40
  ),
  (
    'New to NDY',
    'new-to-ndy',
    'The useful first purchases for coached riding, from heart rate and structured sessions to a sensible power upgrade.',
    'manual',
    true,
    50
  )
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "rule" = EXCLUDED."rule",
  "active" = EXCLUDED."active",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = now();
--> statement-breakpoint
DELETE FROM "recommendation_collection_products"
WHERE "collection_id" IN (
  SELECT "id"
  FROM "recommendation_collections"
  WHERE "slug" IN ('indoor-setup', 'winter-riding', 'new-to-ndy')
);
--> statement-breakpoint
INSERT INTO "recommendation_collection_products" (
  "collection_id", "product_id", "sort_order"
)
SELECT c."id", p."id", v."sort_order"
FROM (
  VALUES
    ('indoor-setup', 'wahoo-kickr-core-2', 10),
    ('indoor-setup', 'zwift-ride-smart-frame', 20),
    ('indoor-setup', 'zwift-ride-with-kickr-core-2', 30),
    ('indoor-setup', 'zwift-cog-click-upgrade-kit', 40),
    ('indoor-setup', 'wahoo-trackr-heart-rate', 50),
    ('indoor-setup', 'wahoo-kickr-headwind', 60),
    ('winter-riding', 'continental-grand-prix-5000-as-tr', 10),
    ('winter-riding', 'pdw-poncho-recycled-fenders', 20),
    ('winter-riding', 'maap-elements-pro-race-jacket', 30),
    ('winter-riding', 'maap-apex-deep-winter-glove', 40),
    ('winter-riding', 'maap-apex-deep-winter-tight-2', 50),
    ('winter-riding', 'muc-off-c3-wet-ceramic-lube', 60),
    ('winter-riding', 'muc-off-bike-protect', 70),
    ('winter-riding', 'wahoo-kickr-core-2', 80),
    ('winter-riding', 'wahoo-kickr-headwind', 90),
    ('new-to-ndy', 'garmin-edge-540', 10),
    ('new-to-ndy', 'wahoo-trackr-heart-rate', 20),
    ('new-to-ndy', 'wahoo-kickr-core-2', 30),
    ('new-to-ndy', 'garmin-rally-rs110-power-pedals', 40),
    ('new-to-ndy', 'poc-ventral-air-mips', 50),
    ('new-to-ndy', 'silca-mattone-seat-pack', 60),
    ('new-to-ndy', 'muc-off-puncture-plug-repair-kit', 70),
    ('new-to-ndy', 'hexis-athlete-app', 80),
    ('new-to-ndy', 'maap-training-jersey-2', 90),
    ('new-to-ndy', 'maap-training-bib-3', 100)
) AS v("collection_slug", "product_slug", "sort_order")
INNER JOIN "recommendation_collections" c
  ON c."slug" = v."collection_slug"
INNER JOIN "recommendation_products" p
  ON p."slug" = v."product_slug"
ON CONFLICT ("collection_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";
