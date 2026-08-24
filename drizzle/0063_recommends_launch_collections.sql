INSERT INTO "recommendation_collections" (
  "name", "slug", "description", "rule", "active", "sort_order"
)
VALUES
  (
    'All-Day Road Kit',
    'all-day-road-kit',
    'The clothing, fuel and small ride essentials that keep a long road day comfortable and moving.',
    'manual',
    true,
    60
  ),
  (
    'Keep the Bike Sweet',
    'keep-the-bike-sweet',
    'The low-fuss cleaning, chain care and protection kit that makes every ride feel better.',
    'manual',
    true,
    70
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
  WHERE "slug" IN ('all-day-road-kit', 'keep-the-bike-sweet')
);
--> statement-breakpoint
INSERT INTO "recommendation_collection_products" (
  "collection_id", "product_id", "sort_order"
)
SELECT c."id", p."id", v."sort_order"
FROM (
  VALUES
    ('all-day-road-kit', 'maap-team-bib-evo', 10),
    ('all-day-road-kit', 'maap-training-jersey-2', 20),
    ('all-day-road-kit', 'maap-team-mesh-base-layer', 30),
    ('all-day-road-kit', 'maap-atmos-vest', 40),
    ('all-day-road-kit', 'maap-spectrum-team-sock', 50),
    ('all-day-road-kit', 'hexis-athlete-app', 60),
    ('all-day-road-kit', 'muc-off-puncture-plug-repair-kit', 70),
    ('keep-the-bike-sweet', 'muc-off-nano-tech-bike-cleaner', 10),
    ('keep-the-bike-sweet', 'muc-off-bio-drivetrain-cleaner', 20),
    ('keep-the-bike-sweet', 'muc-off-all-weather-lube', 30),
    ('keep-the-bike-sweet', 'muc-off-c3-wet-ceramic-lube', 40),
    ('keep-the-bike-sweet', 'muc-off-bike-protect', 50),
    ('keep-the-bike-sweet', 'muc-off-x3-chain-machine', 60),
    ('keep-the-bike-sweet', 'muc-off-8-in-1-cleaning-kit', 70)
) AS v("collection_slug", "product_slug", "sort_order")
INNER JOIN "recommendation_collections" c
  ON c."slug" = v."collection_slug"
INNER JOIN "recommendation_products" p
  ON p."slug" = v."product_slug"
ON CONFLICT ("collection_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";
