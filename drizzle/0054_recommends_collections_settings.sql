CREATE TABLE "recommendation_collections" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "rule" text DEFAULT 'manual' NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "starts_at" timestamp with time zone,
  "ends_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "recommendation_collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recommendation_collection_products" (
  "id" serial PRIMARY KEY NOT NULL,
  "collection_id" integer NOT NULL,
  "product_id" integer NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendation_settings" (
  "key" text PRIMARY KEY NOT NULL,
  "value" text NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recommendation_collection_products" ADD CONSTRAINT "recommendation_collection_products_collection_id_recommendation_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."recommendation_collections"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recommendation_collection_products" ADD CONSTRAINT "recommendation_collection_products_product_id_recommendation_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."recommendation_products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "recommendation_collections_active_sort_idx" ON "recommendation_collections" USING btree ("active","sort_order");
--> statement-breakpoint
CREATE UNIQUE INDEX "recommendation_collection_products_uniq" ON "recommendation_collection_products" USING btree ("collection_id","product_id");
--> statement-breakpoint
CREATE INDEX "recommendation_collection_products_collection_idx" ON "recommendation_collection_products" USING btree ("collection_id","sort_order");
--> statement-breakpoint
INSERT INTO "recommendation_collections" (
  "name",
  "slug",
  "description",
  "rule",
  "active",
  "sort_order"
)
VALUES
  ('Roadman Picks', 'roadman-picks', 'The first products we would point a rider towards.', 'featured', true, 10),
  ('Best Value', 'best-value', 'Products that deliver the most useful performance for the money.', 'best_value', true, 20),
  ('Indoor Setup', 'indoor-setup', 'A simple, dependable indoor training setup.', 'manual', true, 30)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "rule" = EXCLUDED."rule",
  "active" = EXCLUDED."active",
  "sort_order" = EXCLUDED."sort_order",
  "updated_at" = now();
--> statement-breakpoint
INSERT INTO "recommendation_collection_products" (
  "collection_id",
  "product_id",
  "sort_order"
)
SELECT
  c."id",
  p."id",
  CASE p."slug"
    WHEN 'wahoo-kickr-core-2' THEN 10
    WHEN 'zwift-ride-smart-frame' THEN 20
    ELSE 100
  END
FROM "recommendation_collections" c
INNER JOIN "recommendation_products" p
  ON p."slug" IN ('wahoo-kickr-core-2', 'zwift-ride-smart-frame')
WHERE c."slug" = 'indoor-setup'
ON CONFLICT ("collection_id", "product_id") DO UPDATE SET
  "sort_order" = EXCLUDED."sort_order";
--> statement-breakpoint
INSERT INTO "recommendation_settings" ("key", "value")
VALUES
  (
    'affiliate_disclosure',
    'Some links are affiliate links. If you buy through them, Roadman may earn a commission at no extra cost to you. Recommendations remain editorially independent.'
  ),
  ('default_region', 'IE'),
  ('stale_offer_days', '30')
ON CONFLICT ("key") DO NOTHING;
