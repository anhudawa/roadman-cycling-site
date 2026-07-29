CREATE TABLE "recommendation_brands" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "website_url" text,
  "logo_url" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "recommendation_brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recommendation_categories" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "description" text,
  "icon" text DEFAULT 'gear' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "recommendation_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recommendation_products" (
  "id" serial PRIMARY KEY NOT NULL,
  "brand_id" integer,
  "category_id" integer,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "badge" text,
  "evidence_status" text DEFAULT 'editorial' NOT NULL,
  "verdict" text NOT NULL,
  "short_description" text NOT NULL,
  "why_recommend" text NOT NULL,
  "who_for" text NOT NULL,
  "who_skip" text,
  "strengths" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "limitations" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "specifications" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "use_cases" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "disciplines" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "seasons" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "price_band" text,
  "image_url" text,
  "image_alt" text,
  "related_article_url" text,
  "featured" boolean DEFAULT false NOT NULL,
  "best_value" boolean DEFAULT false NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "scheduled_at" timestamp with time zone,
  "published_at" timestamp with time zone,
  "last_reviewed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "recommendation_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "recommendation_offers" (
  "id" serial PRIMARY KEY NOT NULL,
  "product_id" integer NOT NULL,
  "retailer_name" text NOT NULL,
  "affiliate_program" text,
  "destination_url" text NOT NULL,
  "regions" jsonb DEFAULT '["IE","GB","US","EU"]'::jsonb NOT NULL,
  "currency" text,
  "price_label" text,
  "promo_code" text,
  "priority" integer DEFAULT 0 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "last_checked_at" timestamp with time zone,
  "valid_until" timestamp with time zone,
  "last_http_status" integer,
  "last_error" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_click_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "offer_id" integer NOT NULL,
  "product_id" integer NOT NULL,
  "session_id" text,
  "page" text,
  "placement" text,
  "campaign" text,
  "region" text,
  "device" text,
  "referrer" text,
  "user_agent" text,
  "affiliate_click_id" text,
  "bot" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_conversions" (
  "id" serial PRIMARY KEY NOT NULL,
  "network" text NOT NULL,
  "external_transaction_id" text NOT NULL,
  "offer_id" integer,
  "product_id" integer,
  "click_id" uuid,
  "retailer_name" text,
  "sale_amount" numeric(12, 2),
  "commission_amount" numeric(12, 2),
  "currency" text DEFAULT 'EUR' NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "transaction_at" timestamp with time zone NOT NULL,
  "imported_at" timestamp with time zone DEFAULT now() NOT NULL,
  "raw_data" jsonb
);
--> statement-breakpoint
ALTER TABLE "recommendation_products" ADD CONSTRAINT "recommendation_products_brand_id_recommendation_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."recommendation_brands"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recommendation_products" ADD CONSTRAINT "recommendation_products_category_id_recommendation_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."recommendation_categories"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recommendation_offers" ADD CONSTRAINT "recommendation_offers_product_id_recommendation_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."recommendation_products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "affiliate_click_events" ADD CONSTRAINT "affiliate_click_events_offer_id_recommendation_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."recommendation_offers"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "affiliate_click_events" ADD CONSTRAINT "affiliate_click_events_product_id_recommendation_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."recommendation_products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_offer_id_recommendation_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."recommendation_offers"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_product_id_recommendation_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."recommendation_products"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "affiliate_conversions" ADD CONSTRAINT "affiliate_conversions_click_id_affiliate_click_events_id_fk" FOREIGN KEY ("click_id") REFERENCES "public"."affiliate_click_events"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "recommendation_categories_active_sort_idx" ON "recommendation_categories" USING btree ("active","sort_order");
--> statement-breakpoint
CREATE INDEX "recommendation_products_status_idx" ON "recommendation_products" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "recommendation_products_category_idx" ON "recommendation_products" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX "recommendation_products_featured_idx" ON "recommendation_products" USING btree ("featured","sort_order");
--> statement-breakpoint
CREATE INDEX "recommendation_offers_product_idx" ON "recommendation_offers" USING btree ("product_id");
--> statement-breakpoint
CREATE INDEX "recommendation_offers_active_priority_idx" ON "recommendation_offers" USING btree ("active","priority");
--> statement-breakpoint
CREATE INDEX "affiliate_click_events_created_idx" ON "affiliate_click_events" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "affiliate_click_events_offer_idx" ON "affiliate_click_events" USING btree ("offer_id");
--> statement-breakpoint
CREATE INDEX "affiliate_click_events_product_idx" ON "affiliate_click_events" USING btree ("product_id");
--> statement-breakpoint
CREATE UNIQUE INDEX "affiliate_conversions_network_transaction_uniq" ON "affiliate_conversions" USING btree ("network","external_transaction_id");
--> statement-breakpoint
CREATE INDEX "affiliate_conversions_transaction_idx" ON "affiliate_conversions" USING btree ("transaction_at");
--> statement-breakpoint
CREATE INDEX "affiliate_conversions_status_idx" ON "affiliate_conversions" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "affiliate_conversions_product_idx" ON "affiliate_conversions" USING btree ("product_id");
--> statement-breakpoint
INSERT INTO "recommendation_categories" ("name", "slug", "description", "icon", "sort_order")
VALUES
  ('Tyres & Tubes', 'tyres-tubes', 'Faster rolling, fewer punctures and the right setup for your roads.', 'tyre', 10),
  ('Nutrition & Hydration', 'nutrition-hydration', 'Fuel and hydration choices that work on real rides.', 'bottle', 20),
  ('Clothing', 'clothing', 'Cycling kit that earns its place across the seasons.', 'jersey', 30),
  ('Indoor Training', 'indoor-training', 'Trainers, fans and accessories for effective indoor work.', 'trainer', 40),
  ('Tech & GPS', 'tech-gps', 'Computers, sensors and technology worth paying for.', 'gps', 50),
  ('Tools & Accessories', 'tools-accessories', 'Workshop and ride essentials without the clutter.', 'tool', 60),
  ('Safety & Visibility', 'safety-visibility', 'Helmets, lights and visibility equipment for everyday riding.', 'light', 70),
  ('Recovery', 'recovery', 'Practical recovery tools for riders balancing training and life.', 'recovery', 80)
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "recommendation_brands" (
  "name",
  "slug",
  "website_url",
  "logo_url"
)
VALUES (
  'Hexis',
  'hexis',
  'https://athlete.hexis.live/',
  'https://hexis.live/'
)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "website_url" = EXCLUDED."website_url",
  "updated_at" = now();
--> statement-breakpoint
INSERT INTO "recommendation_products" (
  "brand_id",
  "category_id",
  "name",
  "slug",
  "status",
  "badge",
  "evidence_status",
  "verdict",
  "short_description",
  "why_recommend",
  "who_for",
  "who_skip",
  "strengths",
  "limitations",
  "specifications",
  "use_cases",
  "tags",
  "disciplines",
  "seasons",
  "price_band",
  "image_url",
  "image_alt",
  "featured",
  "best_value",
  "sort_order",
  "published_at",
  "last_reviewed_at"
)
SELECT
  b."id",
  c."id",
  'Hexis Athlete App',
  'hexis-athlete-app',
  'published',
  'Roadman pick',
  'personally_used',
  'The nutrition app I use to match my fuelling to the work ahead instead of eating the same way every day.',
  'Hexis turns your training schedule into a personalised daily fuel plan, adapting carbohydrate and energy targets when your sessions change.',
  'I used Hexis while losing 7kg over 12 weeks without seeing my power drop. The biggest win was not simply eating less—it was knowing when to eat more for hard sessions and when my needs were lower. Hexis connects training and nutrition in a way a standard calorie tracker does not.',
  'Cyclists who train consistently and want clear daily guidance on how much to eat before, during and after changing training loads.',
  'Riders who only want a simple on-bike carbs calculator, dislike logging food or will not use the training integrations enough to justify a subscription.',
  '["Daily carbohydrate and energy targets adapt to your training load","Connects with Garmin, WHOOP, Strava, Apple Health and TrainingPeaks","Makes hard-day, easy-day and recovery fuelling easier to understand","Includes race-day and competition fuelling guidance"]'::jsonb,
  '["Getting the full value requires regular food logging and synced training data","It is a recurring subscription rather than a one-off purchase","It supports performance nutrition but does not replace individual medical or clinical advice"]'::jsonb,
  '{"Pricing":"€16.99 monthly or €109.99 annually","Integrations":"Garmin, WHOOP, Strava, Apple Health, TrainingPeaks and Intervals.icu","Roadman code":"CARBS25"}'::jsonb,
  '["Fuel changing training loads","Plan nutrition around hard rides","Support body-composition goals without underfuelling","Prepare a race-day fuelling plan"]'::jsonb,
  '["nutrition app","carbohydrate periodisation","fuel planning","training nutrition","Hexis"]'::jsonb,
  '["Road","Gravel","Indoor","Triathlon"]'::jsonb,
  '["All year"]'::jsonb,
  '€16.99/month or €109.99/year',
  'https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7fad8d3c-795d-4b73-891f-add9262527e3/id-preview-1bd41763--4ed485f6-1095-49a9-9f0c-38cf0e041354.lovable.app-1781174554153.png',
  'Hexis personalised performance nutrition app shown alongside an athlete training',
  true,
  false,
  10,
  now(),
  now()
FROM "recommendation_brands" b
CROSS JOIN "recommendation_categories" c
WHERE b."slug" = 'hexis'
  AND c."slug" = 'nutrition-hydration'
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
  "sort_order" = EXCLUDED."sort_order",
  "last_reviewed_at" = EXCLUDED."last_reviewed_at",
  "updated_at" = now();
--> statement-breakpoint
INSERT INTO "recommendation_offers" (
  "product_id",
  "retailer_name",
  "affiliate_program",
  "destination_url",
  "regions",
  "currency",
  "price_label",
  "promo_code",
  "priority",
  "active",
  "last_checked_at",
  "last_http_status"
)
SELECT
  p."id",
  'Hexis',
  'Hexis partner programme — 20% recurring revenue share',
  'https://www.gj4bt5vt.com/8LJN3/2CTPL/?creative_id=1&source_id=roadman-recommends&sub2=hexis-product-page',
  '["IE","GB","EU","US"]'::jsonb,
  'EUR',
  'From €9.17/month billed annually',
  'CARBS25',
  0,
  true,
  now(),
  200
FROM "recommendation_products" p
WHERE p."slug" = 'hexis-athlete-app'
  AND NOT EXISTS (
    SELECT 1
    FROM "recommendation_offers" o
    WHERE o."product_id" = p."id"
      AND o."retailer_name" = 'Hexis'
  );
--> statement-breakpoint
INSERT INTO "recommendation_products" (
  "category_id",
  "name",
  "slug",
  "status",
  "evidence_status",
  "verdict",
  "short_description",
  "why_recommend",
  "who_for",
  "who_skip",
  "strengths",
  "limitations",
  "use_cases",
  "tags"
)
SELECT
  c."id",
  'Example tyre recommendation — replace before publishing',
  'example-tyre-recommendation',
  'draft',
  'editorial',
  'Draft example: replace this with a verified Roadman verdict.',
  'This unpublished record demonstrates the editorial workflow. Replace every field with verified product guidance before publishing.',
  'Explain the first-hand experience, evidence or rider problem that makes the real product worth recommending.',
  'Describe the specific rider, terrain and conditions the real product suits.',
  'State clearly who should spend their money elsewhere.',
  '["Replace with a substantiated strength"]'::jsonb,
  '["Replace with an honest limitation"]'::jsonb,
  '["I need faster tyres"]'::jsonb,
  '["example", "replace-before-publishing"]'::jsonb
FROM "recommendation_categories" c
WHERE c."slug" = 'tyres-tubes'
ON CONFLICT ("slug") DO NOTHING;
--> statement-breakpoint
INSERT INTO "recommendation_products" (
  "category_id",
  "name",
  "slug",
  "status",
  "evidence_status",
  "verdict",
  "short_description",
  "why_recommend",
  "who_for",
  "who_skip",
  "strengths",
  "limitations",
  "use_cases",
  "tags"
)
SELECT
  c."id",
  'Example sports drink recommendation — replace before publishing',
  'example-sports-drink-recommendation',
  'draft',
  'editorial',
  'Draft example: replace this with a verified Roadman verdict.',
  'This unpublished record demonstrates the editorial workflow. Replace every field with verified product guidance before publishing.',
  'Explain the evidence, formulation and real-ride context behind the genuine recommendation.',
  'Describe the ride duration, intensity and rider needs the real product suits.',
  'State who needs a different carbohydrate, electrolyte or flavour profile.',
  '["Replace with a substantiated strength"]'::jsonb,
  '["Replace with an honest limitation"]'::jsonb,
  '["I struggle to fuel long rides"]'::jsonb,
  '["example", "replace-before-publishing"]'::jsonb
FROM "recommendation_categories" c
WHERE c."slug" = 'nutrition-hydration'
ON CONFLICT ("slug") DO NOTHING;
