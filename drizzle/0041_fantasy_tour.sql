CREATE TABLE "admin_audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ask_auth_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_authenticated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_authenticated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"beehiiv_subscriber_id" text,
	"beehiiv_synced_at" timestamp with time zone,
	"auth_count" integer DEFAULT 1 NOT NULL,
	"source" text,
	CONSTRAINT "ask_auth_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "ask_auth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ask_auth_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "ask_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"citations" jsonb,
	"cta_recommended" text,
	"safety_flags" text[],
	"confidence" text,
	"model" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"latency_ms" integer,
	"flagged_for_review" boolean DEFAULT false NOT NULL,
	"admin_note" text,
	"admin_preferred_answer" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ask_retrievals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"chunk_text" text,
	"score" numeric(6, 4),
	"used_in_answer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ask_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rider_profile_id" integer,
	"anon_session_key" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"utm_source" text,
	"utm_campaign" text
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer,
	"filename" text NOT NULL,
	"content_type" text,
	"size_bytes" integer,
	"blob_url" text NOT NULL,
	"blob_pathname" text NOT NULL,
	"uploaded_by_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"trigger_type" text NOT NULL,
	"trigger_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"actions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_run_at" timestamp with time zone,
	"run_count" integer DEFAULT 0 NOT NULL,
	"max_runs_per_day" integer DEFAULT 0 NOT NULL,
	"dedupe_window_minutes" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"rule_id" integer,
	"contact_id" integer,
	"status" text NOT NULL,
	"event" jsonb,
	"result" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer,
	"owner_slug" text NOT NULL,
	"title" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"location" text,
	"notes" text,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"completed_at" timestamp with time zone,
	"created_by_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_citation_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt_id" integer NOT NULL,
	"model" text NOT NULL,
	"response" text,
	"mentioned" boolean DEFAULT false NOT NULL,
	"matched_terms" jsonb,
	"matched_urls" jsonb,
	"citations" jsonb,
	"error" text,
	"ran_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"category" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "camp_bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"camp" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"single_room" boolean DEFAULT false NOT NULL,
	"dietary" text,
	"emergency_contact_name" text,
	"emergency_contact_phone" text,
	"medical" text,
	"heard_from" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "camp_room_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"camp" text NOT NULL,
	"room_key" text NOT NULL,
	"bed_key" text NOT NULL,
	"is_single_occupancy" boolean DEFAULT false NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"assigned_by" text DEFAULT 'auto' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claim_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"claim_id" integer NOT NULL,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_slug" text NOT NULL,
	"claim" text NOT NULL,
	"confidence" real DEFAULT 0 NOT NULL,
	"evidence" text,
	"claim_type" text,
	"speaker" text,
	"speaker_entity_slug" text,
	"supporting_quote" text,
	"timestamp" text,
	"topic_tags" text[],
	"reviewed" boolean DEFAULT false NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"rider_profile_id" integer,
	"email" text NOT NULL,
	"consent_type" text NOT NULL,
	"granted" boolean NOT NULL,
	"source" text NOT NULL,
	"copy_version" text,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"segment_index" integer NOT NULL,
	"start_distance" integer NOT NULL,
	"end_distance" integer NOT NULL,
	"gradient_mrad" integer NOT NULL,
	"heading_mrad" integer NOT NULL,
	"surface" text,
	"elevation_m" integer NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"country" text,
	"region" text,
	"discipline" text DEFAULT 'road' NOT NULL,
	"distance_m" integer NOT NULL,
	"elevation_gain_m" integer NOT NULL,
	"elevation_loss_m" integer DEFAULT 0 NOT NULL,
	"surface_summary" text,
	"gpx_data" jsonb NOT NULL,
	"course_data" jsonb NOT NULL,
	"event_dates" jsonb,
	"verified" boolean DEFAULT false NOT NULL,
	"source" text,
	"uploader_email" text,
	"uploader_rider_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "crm_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"target" text NOT NULL,
	"operation" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"error" text,
	"attempt_count" integer DEFAULT 1 NOT NULL,
	"related_table" text,
	"related_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cron_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"status" text NOT NULL,
	"result" jsonb,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "custom_field_defs" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"help_text" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "custom_field_defs_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer,
	"title" text NOT NULL,
	"value_cents" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"stage" text DEFAULT 'qualified' NOT NULL,
	"owner_slug" text,
	"source" text,
	"expected_close_date" date,
	"closed_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnostic_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_slug" text NOT NULL,
	"version" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"config" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnostic_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_result_id" integer NOT NULL,
	"definition_id" integer,
	"rider_profile_id" integer,
	"tool_slug" text NOT NULL,
	"scores" jsonb NOT NULL,
	"primary_category" text NOT NULL,
	"secondary_category" text,
	"risk_flags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"recommendations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resource_slug" text,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnostic_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"email" text NOT NULL,
	"age" text NOT NULL,
	"hours_per_week" text NOT NULL,
	"ftp" integer,
	"goal" text,
	"answers" jsonb NOT NULL,
	"scores" jsonb NOT NULL,
	"primary_profile" text NOT NULL,
	"secondary_profile" text,
	"severe_multi_system" boolean DEFAULT false NOT NULL,
	"close_to_breakthrough" boolean DEFAULT false NOT NULL,
	"breakdown" jsonb NOT NULL,
	"generation_source" text DEFAULT 'fallback' NOT NULL,
	"raw_model_output" text,
	"generation_meta" jsonb,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"user_agent" text,
	"referrer" text,
	"beehiiv_subscriber_id" text,
	"retake_number" integer DEFAULT 1 NOT NULL,
	"rider_profile_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "diagnostic_submissions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "email_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"template_id" integer,
	"from_user" text NOT NULL,
	"from_address" text NOT NULL,
	"to_address" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"resend_message_id" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "fantasy_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"detail" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_auth_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"purpose" text DEFAULT 'login' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"use_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_auth_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "fantasy_captain_picks" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"stage_number" integer NOT NULL,
	"rider_id" integer NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_game_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_game_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "fantasy_league_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"league_id" integer NOT NULL,
	"player_id" integer NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_leagues" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"created_by_player_id" integer,
	"is_official" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_leagues_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "fantasy_players" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"country" text,
	"rider_persona" text,
	"consent_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"beehiiv_subscriber_id" text,
	"beehiiv_synced_at" timestamp with time zone,
	"beehiiv_sync_attempts" integer DEFAULT 0 NOT NULL,
	"capi_sent_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_players_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "fantasy_pro_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"category" text NOT NULL,
	"jersey_hex" text,
	"source_url" text NOT NULL,
	"verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_pro_teams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "fantasy_riders" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"pcs_id" text,
	"pro_team_id" integer NOT NULL,
	"price" integer NOT NULL,
	"rider_class" text NOT NULL,
	"country_code" text,
	"status" text DEFAULT 'provisional' NOT NULL,
	"abandoned_after_stage" integer,
	"confirmed_source" text,
	"source_url" text NOT NULL,
	"verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_riders_pcs_id_unique" UNIQUE("pcs_id")
);
--> statement-breakpoint
CREATE TABLE "fantasy_scoring_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"stage_number" integer NOT NULL,
	"rider_id" integer NOT NULL,
	"rule" text NOT NULL,
	"points" integer NOT NULL,
	"source_ref" text,
	"result_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_stage_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"stage_number" integer NOT NULL,
	"payload" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"source_url" text,
	"entered_by" text,
	"published_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_stage_results_stage_number_unique" UNIQUE("stage_number")
);
--> statement-breakpoint
CREATE TABLE "fantasy_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"stage_number" integer NOT NULL,
	"date" date NOT NULL,
	"start_town" text NOT NULL,
	"finish_town" text NOT NULL,
	"distance_km" numeric(5, 1) NOT NULL,
	"stage_type" text NOT NULL,
	"summit_finish" boolean DEFAULT false NOT NULL,
	"start_time_cest" timestamp with time zone,
	"rest_day_after" boolean DEFAULT false NOT NULL,
	"roadman_take" text,
	"source_url" text NOT NULL,
	"cross_check_url" text,
	"verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_stages_stage_number_unique" UNIQUE("stage_number")
);
--> statement-breakpoint
CREATE TABLE "fantasy_team_riders" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"rider_id" integer NOT NULL,
	"effective_from_stage" integer NOT NULL,
	"effective_to_stage" integer,
	"added_via" text DEFAULT 'initial' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_team_stage_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"stage_number" integer NOT NULL,
	"points" integer NOT NULL,
	"captain_rider_id" integer,
	"breakdown" jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fantasy_team_totals" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"week1_points" integer DEFAULT 0 NOT NULL,
	"week2_points" integer DEFAULT 0 NOT NULL,
	"week3_points" integer DEFAULT 0 NOT NULL,
	"best_stage_points" integer DEFAULT 0 NOT NULL,
	"global_rank" integer,
	"last_scored_stage" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_team_totals_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE "fantasy_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"player_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fantasy_teams_player_id_unique" UNIQUE("player_id")
);
--> statement-breakpoint
CREATE TABLE "fantasy_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"effective_from_stage" integer NOT NULL,
	"rider_out_id" integer NOT NULL,
	"rider_in_id" integer NOT NULL,
	"kind" text DEFAULT 'standard' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_call_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tool_name" text NOT NULL,
	"input_truncated" text,
	"duration_ms" integer,
	"success" boolean NOT NULL,
	"error" text,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_community_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"podcast_downloads_total" integer DEFAULT 0 NOT NULL,
	"youtube_subscribers_main" integer DEFAULT 0 NOT NULL,
	"youtube_subscribers_clips" integer DEFAULT 0 NOT NULL,
	"free_community_members" integer DEFAULT 0 NOT NULL,
	"paid_community_members" integer DEFAULT 0 NOT NULL,
	"featured_transformations" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mcp_episode_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" integer NOT NULL,
	"chunk_index" integer NOT NULL,
	"chunk_text" text NOT NULL,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE TABLE "mcp_episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"guest_name" text,
	"published_at" timestamp with time zone,
	"duration_sec" integer,
	"summary" text,
	"audio_url" text,
	"youtube_url" text,
	"transcript_text" text,
	"key_insights" jsonb,
	"topic_tags" text[],
	"url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mcp_episodes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "mcp_expert_quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"expert_id" integer NOT NULL,
	"episode_id" integer,
	"quote" text NOT NULL,
	"context" text,
	"topic_tags" text[]
);
--> statement-breakpoint
CREATE TABLE "mcp_experts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"credentials" text,
	"specialty" text,
	"bio" text,
	"appearance_count" integer DEFAULT 0 NOT NULL,
	"latest_appearance" timestamp with time zone,
	CONSTRAINT "mcp_experts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mcp_methodology_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"principle_id" integer NOT NULL,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE TABLE "mcp_methodology_principles" (
	"id" serial PRIMARY KEY NOT NULL,
	"principle" text NOT NULL,
	"explanation" text NOT NULL,
	"topic_tags" text[],
	"supporting_expert_names" text[],
	"supporting_episode_ids" integer[]
);
--> statement-breakpoint
CREATE TABLE "mcp_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_key" text NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"billing_period" text,
	"description" text NOT NULL,
	"who_its_for" text NOT NULL,
	"url" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "mcp_products_product_key_unique" UNIQUE("product_key")
);
--> statement-breakpoint
CREATE TABLE "method_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp with time zone,
	"drip_start_at" timestamp with time zone,
	"amount_cents" integer,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripe_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_event_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "method_enrollments_email_unique" UNIQUE("email"),
	CONSTRAINT "method_enrollments_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE TABLE "method_login_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "method_login_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "method_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"enrollment_id" integer NOT NULL,
	"module_slug" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"recipient_slug" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"rider_profile_id" integer,
	"email" text NOT NULL,
	"product_slug" text NOT NULL,
	"tool_result_id" integer,
	"amount_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"stripe_checkout_session_id" text,
	"stripe_payment_intent_id" text,
	"stripe_event_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"receipt_url" text,
	"utm" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
CREATE TABLE "paid_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"rider_profile_id" integer,
	"email" text NOT NULL,
	"product_slug" text NOT NULL,
	"tool_result_id" integer,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"status_reason" text,
	"secure_token_hash" text,
	"pdf_url" text,
	"web_report_html" text,
	"page_count" integer,
	"generator_version" text,
	"delivered_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"last_resent_at" timestamp with time zone,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"prediction_id" integer NOT NULL,
	"actual_time_s" integer NOT NULL,
	"average_power" integer,
	"ride_file_url" text,
	"segment_actuals" jsonb,
	"analysis" jsonb,
	"model_error_pct" real,
	"submitted_email" text,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"rider_profile_id" integer,
	"course_id" integer,
	"course_gpx_hash" text,
	"course_data" jsonb,
	"mode" text DEFAULT 'plan_my_race' NOT NULL,
	"predicted_time_s" integer NOT NULL,
	"confidence_low_s" integer NOT NULL,
	"confidence_high_s" integer NOT NULL,
	"average_power" integer,
	"normalized_power" integer,
	"variability_index" real,
	"rider_inputs" jsonb NOT NULL,
	"environment_inputs" jsonb NOT NULL,
	"pacing_plan" jsonb,
	"result_summary" jsonb,
	"weather_data" jsonb,
	"ai_translation" jsonb,
	"email" text,
	"is_paid" boolean DEFAULT false NOT NULL,
	"paid_report_id" integer,
	"engine_version" text DEFAULT 'v1.0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "predictions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quote_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer NOT NULL,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE TABLE "quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_slug" text NOT NULL,
	"quote" text NOT NULL,
	"speaker" text NOT NULL,
	"speaker_credential" text,
	"speaker_entity_slug" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"context" text,
	"timestamp" text,
	"topic_tags" text[],
	"reviewed" boolean DEFAULT false NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"tool_slug" text,
	"bundle_items" jsonb,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'usd' NOT NULL,
	"stripe_price_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"page_count_target" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rider_login_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"rider_profile_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rider_login_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "rider_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer,
	"email" text NOT NULL,
	"first_name" text,
	"age_range" text,
	"discipline" text,
	"weekly_training_hours" integer,
	"current_ftp" integer,
	"weight_kg" numeric(5, 2),
	"main_goal" text,
	"target_event" text,
	"target_event_date" date,
	"biggest_limiter" text,
	"uses_power_meter" boolean,
	"current_training_tool" text,
	"coaching_interest" text,
	"self_coached_or_coached" text,
	"access_tier" text DEFAULT 'free' NOT NULL,
	"consent_save_profile" boolean DEFAULT false NOT NULL,
	"consent_email_followup" boolean DEFAULT false NOT NULL,
	"consent_recorded_at" timestamp with time zone,
	"current_weight" numeric(5, 2),
	"weight_unit" text DEFAULT 'kg',
	"training_tool" text,
	"coaching_status" text,
	"coaching_interest_level" integer,
	"lead_score" integer DEFAULT 0 NOT NULL,
	"marketing_consent" boolean DEFAULT false NOT NULL,
	"data_storage_consent" boolean DEFAULT false NOT NULL,
	"research_consent" boolean DEFAULT false NOT NULL,
	"last_lead_score_at" timestamp with time zone,
	"height_cm" integer,
	"body_composition_goal" text,
	"preferred_support_level" text,
	"injury_history" text,
	"current_tools" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rider_profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "roadman_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"location" text,
	"description" text,
	"is_members_only" boolean DEFAULT false NOT NULL,
	"url" text,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"entity" text NOT NULL,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by_slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "segments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skool_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"source" text DEFAULT 'unknown' NOT NULL,
	"email" text,
	"name" text,
	"persona" text,
	"raw_payload" jsonb NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"status" text NOT NULL,
	"result" jsonb,
	"error" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ted_active_members" (
	"member_id" text PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"topic_tags" text[],
	"post_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ted_activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"job" text NOT NULL,
	"action" text NOT NULL,
	"level" text DEFAULT 'info' NOT NULL,
	"payload" jsonb,
	"error" text
);
--> statement-breakpoint
CREATE TABLE "ted_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"pillar" text NOT NULL,
	"scheduled_for" date NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"original_body" text NOT NULL,
	"edited_body" text,
	"approved_by_slug" text,
	"approved_at" timestamp with time zone,
	"posted_at" timestamp with time zone,
	"skool_post_url" text,
	"voice_check" jsonb,
	"generation_attempts" integer DEFAULT 1 NOT NULL,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ted_edits" (
	"id" serial PRIMARY KEY NOT NULL,
	"draft_id" integer NOT NULL,
	"before_text" text NOT NULL,
	"after_text" text NOT NULL,
	"chars_changed" integer DEFAULT 0 NOT NULL,
	"edited_by_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ted_kill_switch" (
	"id" integer PRIMARY KEY NOT NULL,
	"paused" boolean DEFAULT false NOT NULL,
	"paused_by_slug" text,
	"paused_at" timestamp with time zone,
	"reason" text,
	"post_prompt_enabled" boolean DEFAULT false NOT NULL,
	"post_welcome_enabled" boolean DEFAULT false NOT NULL,
	"surface_threads_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ted_surface_drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"skool_post_id" text NOT NULL,
	"thread_url" text NOT NULL,
	"thread_author" text,
	"thread_title" text,
	"thread_body" text,
	"surface_type" text NOT NULL,
	"original_body" text NOT NULL,
	"edited_body" text,
	"status" text DEFAULT 'drafted' NOT NULL,
	"voice_check" jsonb,
	"approved_by_slug" text,
	"approved_at" timestamp with time zone,
	"posted_at" timestamp with time zone,
	"skool_reply_url" text,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ted_surfaced" (
	"id" serial PRIMARY KEY NOT NULL,
	"skool_post_id" text NOT NULL,
	"surface_type" text NOT NULL,
	"body" text NOT NULL,
	"skool_reply_url" text,
	"surfaced_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ted_welcome_queue" (
	"member_email" text PRIMARY KEY NOT NULL,
	"member_id" text,
	"first_name" text NOT NULL,
	"persona" text,
	"questionnaire_answers" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"draft_body" text,
	"voice_check" jsonb,
	"posted_at" timestamp with time zone,
	"skool_post_url" text,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tool_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"rider_profile_id" integer,
	"email" text NOT NULL,
	"tool_slug" text NOT NULL,
	"inputs" jsonb NOT NULL,
	"outputs" jsonb NOT NULL,
	"summary" text NOT NULL,
	"primary_result" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"utm" jsonb,
	"source_page" text,
	"email_sent_at" timestamp with time zone,
	"ask_handoff_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tool_results_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "topic_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_slug" text NOT NULL,
	"tag" text NOT NULL,
	"slug" text NOT NULL,
	"kind" text NOT NULL,
	"entity_slug" text,
	"relevance" real DEFAULT 0 NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_peaks_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"plan_code" text NOT NULL,
	"plan_name" text NOT NULL,
	"plan_start_date" date,
	"status" text DEFAULT 'pending' NOT NULL,
	"tp_athlete_id" text,
	"tp_plan_id" text,
	"notes" text,
	"assigned_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_activities" ADD COLUMN "author_slug" text;--> statement-breakpoint
ALTER TABLE "contact_submissions" ADD COLUMN "status" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "ai_referrer" text;--> statement-breakpoint
ALTER TABLE "stripe_snapshots" ADD COLUMN "active_subscriptions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_snapshots" ADD COLUMN "trialing_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_snapshots" ADD COLUMN "past_due_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_snapshots" ADD COLUMN "past_due_mrr_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_snapshots" ADD COLUMN "annual_mrr_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_snapshots" ADD COLUMN "net_new_mrr_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "stripe_snapshots" ADD COLUMN "net_new_subs" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "request_status" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "response_message" text;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "responded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "focus_order" integer;--> statement-breakpoint
ALTER TABLE "team_users" ADD COLUMN "google_sub" text;--> statement-breakpoint
ALTER TABLE "team_users" ADD COLUMN "google_refresh_token" text;--> statement-breakpoint
ALTER TABLE "team_users" ADD COLUMN "google_linked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "ask_messages" ADD CONSTRAINT "ask_messages_session_id_ask_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."ask_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ask_retrievals" ADD CONSTRAINT "ask_retrievals_message_id_ask_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ask_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ask_sessions" ADD CONSTRAINT "ask_sessions_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_rule_id_automation_rules_id_fk" FOREIGN KEY ("rule_id") REFERENCES "public"."automation_rules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_citation_runs" ADD CONSTRAINT "brand_citation_runs_prompt_id_brand_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."brand_prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "camp_room_assignments" ADD CONSTRAINT "camp_room_assignments_booking_id_camp_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."camp_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "claim_embeddings" ADD CONSTRAINT "claim_embeddings_claim_id_claims_id_fk" FOREIGN KEY ("claim_id") REFERENCES "public"."claims"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_segments" ADD CONSTRAINT "course_segments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_uploader_rider_id_rider_profiles_id_fk" FOREIGN KEY ("uploader_rider_id") REFERENCES "public"."rider_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_tool_result_id_tool_results_id_fk" FOREIGN KEY ("tool_result_id") REFERENCES "public"."tool_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_definition_id_diagnostic_definitions_id_fk" FOREIGN KEY ("definition_id") REFERENCES "public"."diagnostic_definitions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_results" ADD CONSTRAINT "diagnostic_results_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_messages" ADD CONSTRAINT "email_messages_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_captain_picks" ADD CONSTRAINT "fantasy_captain_picks_team_id_fantasy_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."fantasy_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_captain_picks" ADD CONSTRAINT "fantasy_captain_picks_rider_id_fantasy_riders_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."fantasy_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_league_id_fantasy_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."fantasy_leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_league_members" ADD CONSTRAINT "fantasy_league_members_player_id_fantasy_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."fantasy_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_leagues" ADD CONSTRAINT "fantasy_leagues_created_by_player_id_fantasy_players_id_fk" FOREIGN KEY ("created_by_player_id") REFERENCES "public"."fantasy_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_riders" ADD CONSTRAINT "fantasy_riders_pro_team_id_fantasy_pro_teams_id_fk" FOREIGN KEY ("pro_team_id") REFERENCES "public"."fantasy_pro_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_scoring_events" ADD CONSTRAINT "fantasy_scoring_events_rider_id_fantasy_riders_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."fantasy_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_team_riders" ADD CONSTRAINT "fantasy_team_riders_team_id_fantasy_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."fantasy_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_team_riders" ADD CONSTRAINT "fantasy_team_riders_rider_id_fantasy_riders_id_fk" FOREIGN KEY ("rider_id") REFERENCES "public"."fantasy_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_team_stage_scores" ADD CONSTRAINT "fantasy_team_stage_scores_team_id_fantasy_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."fantasy_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_team_stage_scores" ADD CONSTRAINT "fantasy_team_stage_scores_captain_rider_id_fantasy_riders_id_fk" FOREIGN KEY ("captain_rider_id") REFERENCES "public"."fantasy_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_team_totals" ADD CONSTRAINT "fantasy_team_totals_team_id_fantasy_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."fantasy_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_teams" ADD CONSTRAINT "fantasy_teams_player_id_fantasy_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."fantasy_players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_transfers" ADD CONSTRAINT "fantasy_transfers_team_id_fantasy_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."fantasy_teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_transfers" ADD CONSTRAINT "fantasy_transfers_rider_out_id_fantasy_riders_id_fk" FOREIGN KEY ("rider_out_id") REFERENCES "public"."fantasy_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fantasy_transfers" ADD CONSTRAINT "fantasy_transfers_rider_in_id_fantasy_riders_id_fk" FOREIGN KEY ("rider_in_id") REFERENCES "public"."fantasy_riders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_episode_embeddings" ADD CONSTRAINT "mcp_episode_embeddings_episode_id_mcp_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."mcp_episodes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_expert_quotes" ADD CONSTRAINT "mcp_expert_quotes_expert_id_mcp_experts_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."mcp_experts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_expert_quotes" ADD CONSTRAINT "mcp_expert_quotes_episode_id_mcp_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."mcp_episodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mcp_methodology_embeddings" ADD CONSTRAINT "mcp_methodology_embeddings_principle_id_mcp_methodology_principles_id_fk" FOREIGN KEY ("principle_id") REFERENCES "public"."mcp_methodology_principles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "method_login_tokens" ADD CONSTRAINT "method_login_tokens_enrollment_id_method_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."method_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "method_progress" ADD CONSTRAINT "method_progress_enrollment_id_method_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."method_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tool_result_id_tool_results_id_fk" FOREIGN KEY ("tool_result_id") REFERENCES "public"."tool_results"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paid_reports" ADD CONSTRAINT "paid_reports_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paid_reports" ADD CONSTRAINT "paid_reports_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paid_reports" ADD CONSTRAINT "paid_reports_tool_result_id_tool_results_id_fk" FOREIGN KEY ("tool_result_id") REFERENCES "public"."tool_results"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_results" ADD CONSTRAINT "prediction_results_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_paid_report_id_paid_reports_id_fk" FOREIGN KEY ("paid_report_id") REFERENCES "public"."paid_reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_embeddings" ADD CONSTRAINT "quote_embeddings_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rider_login_tokens" ADD CONSTRAINT "rider_login_tokens_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rider_profiles" ADD CONSTRAINT "rider_profiles_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ted_edits" ADD CONSTRAINT "ted_edits_draft_id_ted_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."ted_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tool_results" ADD CONSTRAINT "tool_results_rider_profile_id_rider_profiles_id_fk" FOREIGN KEY ("rider_profile_id") REFERENCES "public"."rider_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "training_peaks_assignments" ADD CONSTRAINT "training_peaks_assignments_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_audit_logs_target_idx" ON "admin_audit_logs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "admin_audit_logs_actor_email_idx" ON "admin_audit_logs" USING btree ("actor_email");--> statement-breakpoint
CREATE INDEX "ask_auth_subscribers_email_idx" ON "ask_auth_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "ask_auth_tokens_email_idx" ON "ask_auth_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "ask_auth_tokens_expires_at_idx" ON "ask_auth_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "ask_messages_session_id_idx" ON "ask_messages" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "ask_messages_created_at_idx" ON "ask_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ask_retrievals_message_id_idx" ON "ask_retrievals" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "ask_sessions_rider_profile_id_idx" ON "ask_sessions" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "ask_sessions_anon_session_key_idx" ON "ask_sessions" USING btree ("anon_session_key");--> statement-breakpoint
CREATE INDEX "ask_sessions_last_activity_at_idx" ON "ask_sessions" USING btree ("last_activity_at");--> statement-breakpoint
CREATE INDEX "attachments_contact_id_idx" ON "attachments" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "attachments_created_at_idx" ON "attachments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "automation_rules_trigger_type_idx" ON "automation_rules" USING btree ("trigger_type");--> statement-breakpoint
CREATE INDEX "automation_rules_active_idx" ON "automation_rules" USING btree ("active");--> statement-breakpoint
CREATE INDEX "automation_runs_rule_id_idx" ON "automation_runs" USING btree ("rule_id");--> statement-breakpoint
CREATE INDEX "automation_runs_created_at_idx" ON "automation_runs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "automation_runs_rule_contact_idx" ON "automation_runs" USING btree ("rule_id","contact_id","created_at");--> statement-breakpoint
CREATE INDEX "bookings_contact_id_idx" ON "bookings" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "bookings_owner_slug_idx" ON "bookings" USING btree ("owner_slug");--> statement-breakpoint
CREATE INDEX "bookings_scheduled_at_idx" ON "bookings" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "bookings_status_idx" ON "bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brand_citation_runs_prompt_id_idx" ON "brand_citation_runs" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "brand_citation_runs_ran_at_idx" ON "brand_citation_runs" USING btree ("ran_at");--> statement-breakpoint
CREATE INDEX "brand_citation_runs_model_idx" ON "brand_citation_runs" USING btree ("model");--> statement-breakpoint
CREATE INDEX "camp_bookings_camp_idx" ON "camp_bookings" USING btree ("camp");--> statement-breakpoint
CREATE INDEX "camp_bookings_status_idx" ON "camp_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "camp_bookings_created_at_idx" ON "camp_bookings" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "camp_bookings_stripe_session_idx" ON "camp_bookings" USING btree ("stripe_session_id");--> statement-breakpoint
CREATE UNIQUE INDEX "camp_bookings_email_camp_idx" ON "camp_bookings" USING btree ("email","camp");--> statement-breakpoint
CREATE INDEX "camp_room_assignments_camp_idx" ON "camp_room_assignments" USING btree ("camp");--> statement-breakpoint
CREATE INDEX "camp_room_assignments_booking_id_idx" ON "camp_room_assignments" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "camp_room_assignments_camp_room_bed_idx" ON "camp_room_assignments" USING btree ("camp","room_key","bed_key");--> statement-breakpoint
CREATE UNIQUE INDEX "camp_room_assignments_booking_room_idx" ON "camp_room_assignments" USING btree ("booking_id","room_key","bed_key");--> statement-breakpoint
CREATE UNIQUE INDEX "claim_embeddings_claim_id_uniq" ON "claim_embeddings" USING btree ("claim_id");--> statement-breakpoint
CREATE INDEX "claims_episode_slug_idx" ON "claims" USING btree ("episode_slug");--> statement-breakpoint
CREATE INDEX "claims_speaker_entity_slug_idx" ON "claims" USING btree ("speaker_entity_slug");--> statement-breakpoint
CREATE INDEX "consent_records_email_idx" ON "consent_records" USING btree ("email");--> statement-breakpoint
CREATE INDEX "consent_records_rider_profile_id_idx" ON "consent_records" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "consent_records_consent_type_idx" ON "consent_records" USING btree ("consent_type");--> statement-breakpoint
CREATE INDEX "course_segments_course_id_idx" ON "course_segments" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_segments_course_segment_idx" ON "course_segments" USING btree ("course_id","segment_index");--> statement-breakpoint
CREATE INDEX "courses_country_idx" ON "courses" USING btree ("country");--> statement-breakpoint
CREATE INDEX "courses_discipline_idx" ON "courses" USING btree ("discipline");--> statement-breakpoint
CREATE INDEX "courses_verified_idx" ON "courses" USING btree ("verified");--> statement-breakpoint
CREATE INDEX "crm_sync_logs_email_idx" ON "crm_sync_logs" USING btree ("email");--> statement-breakpoint
CREATE INDEX "crm_sync_logs_status_idx" ON "crm_sync_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "crm_sync_logs_target_idx" ON "crm_sync_logs" USING btree ("target");--> statement-breakpoint
CREATE INDEX "cron_runs_kind_idx" ON "cron_runs" USING btree ("kind","started_at");--> statement-breakpoint
CREATE INDEX "custom_field_defs_sort_order_idx" ON "custom_field_defs" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "deals_contact_id_idx" ON "deals" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "deals_stage_idx" ON "deals" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "deals_owner_slug_idx" ON "deals" USING btree ("owner_slug");--> statement-breakpoint
CREATE INDEX "deals_expected_close_date_idx" ON "deals" USING btree ("expected_close_date");--> statement-breakpoint
CREATE UNIQUE INDEX "diagnostic_definitions_tool_version_idx" ON "diagnostic_definitions" USING btree ("tool_slug","version");--> statement-breakpoint
CREATE INDEX "diagnostic_definitions_tool_slug_idx" ON "diagnostic_definitions" USING btree ("tool_slug");--> statement-breakpoint
CREATE INDEX "diagnostic_results_tool_result_id_idx" ON "diagnostic_results" USING btree ("tool_result_id");--> statement-breakpoint
CREATE INDEX "diagnostic_results_tool_slug_idx" ON "diagnostic_results" USING btree ("tool_slug");--> statement-breakpoint
CREATE INDEX "diagnostic_results_primary_category_idx" ON "diagnostic_results" USING btree ("primary_category");--> statement-breakpoint
CREATE INDEX "diagnostic_submissions_email_idx" ON "diagnostic_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "diagnostic_submissions_created_at_idx" ON "diagnostic_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "diagnostic_submissions_primary_profile_idx" ON "diagnostic_submissions" USING btree ("primary_profile");--> statement-breakpoint
CREATE INDEX "diagnostic_submissions_utm_campaign_idx" ON "diagnostic_submissions" USING btree ("utm_campaign");--> statement-breakpoint
CREATE INDEX "diagnostic_submissions_rider_profile_id_idx" ON "diagnostic_submissions" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "email_messages_contact_id_idx" ON "email_messages" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "email_messages_sent_at_idx" ON "email_messages" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "email_messages_status_idx" ON "email_messages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_templates_slug_idx" ON "email_templates" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "fantasy_audit_log_entity_idx" ON "fantasy_audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "fantasy_auth_tokens_email_idx" ON "fantasy_auth_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "fantasy_auth_tokens_expires_at_idx" ON "fantasy_auth_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "fantasy_captain_picks_team_stage_uniq" ON "fantasy_captain_picks" USING btree ("team_id","stage_number");--> statement-breakpoint
CREATE UNIQUE INDEX "fantasy_league_members_uniq" ON "fantasy_league_members" USING btree ("league_id","player_id");--> statement-breakpoint
CREATE INDEX "fantasy_league_members_player_idx" ON "fantasy_league_members" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "fantasy_players_email_idx" ON "fantasy_players" USING btree ("email");--> statement-breakpoint
CREATE INDEX "fantasy_riders_team_idx" ON "fantasy_riders" USING btree ("pro_team_id");--> statement-breakpoint
CREATE INDEX "fantasy_riders_status_idx" ON "fantasy_riders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fantasy_scoring_events_stage_idx" ON "fantasy_scoring_events" USING btree ("stage_number");--> statement-breakpoint
CREATE INDEX "fantasy_scoring_events_rider_stage_idx" ON "fantasy_scoring_events" USING btree ("rider_id","stage_number");--> statement-breakpoint
CREATE INDEX "fantasy_team_riders_team_idx" ON "fantasy_team_riders" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "fantasy_team_riders_team_from_idx" ON "fantasy_team_riders" USING btree ("team_id","effective_from_stage");--> statement-breakpoint
CREATE UNIQUE INDEX "fantasy_team_stage_scores_uniq" ON "fantasy_team_stage_scores" USING btree ("team_id","stage_number");--> statement-breakpoint
CREATE INDEX "fantasy_team_stage_scores_stage_idx" ON "fantasy_team_stage_scores" USING btree ("stage_number");--> statement-breakpoint
CREATE INDEX "fantasy_team_totals_rank_idx" ON "fantasy_team_totals" USING btree ("global_rank");--> statement-breakpoint
CREATE INDEX "fantasy_transfers_team_idx" ON "fantasy_transfers" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "mcp_call_logs_tool_name_idx" ON "mcp_call_logs" USING btree ("tool_name");--> statement-breakpoint
CREATE INDEX "mcp_call_logs_created_at_idx" ON "mcp_call_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "mcp_episode_embeddings_episode_id_idx" ON "mcp_episode_embeddings" USING btree ("episode_id");--> statement-breakpoint
CREATE INDEX "mcp_episodes_slug_idx" ON "mcp_episodes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "mcp_episodes_published_at_idx" ON "mcp_episodes" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "mcp_expert_quotes_expert_id_idx" ON "mcp_expert_quotes" USING btree ("expert_id");--> statement-breakpoint
CREATE INDEX "method_enrollments_email_idx" ON "method_enrollments" USING btree ("email");--> statement-breakpoint
CREATE INDEX "method_enrollments_status_idx" ON "method_enrollments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "method_enrollments_paid_at_idx" ON "method_enrollments" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "method_login_tokens_enrollment_id_idx" ON "method_login_tokens" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "method_login_tokens_expires_at_idx" ON "method_login_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "method_progress_enrollment_id_idx" ON "method_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE INDEX "method_progress_module_slug_idx" ON "method_progress" USING btree ("module_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "method_progress_enrollment_module_unique" ON "method_progress" USING btree ("enrollment_id","module_slug");--> statement-breakpoint
CREATE INDEX "notifications_recipient_slug_idx" ON "notifications" USING btree ("recipient_slug");--> statement-breakpoint
CREATE INDEX "notifications_read_at_idx" ON "notifications" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_product_slug_idx" ON "orders" USING btree ("product_slug");--> statement-breakpoint
CREATE INDEX "orders_rider_profile_id_idx" ON "orders" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "paid_reports_email_idx" ON "paid_reports" USING btree ("email");--> statement-breakpoint
CREATE INDEX "paid_reports_status_idx" ON "paid_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "paid_reports_order_id_idx" ON "paid_reports" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "paid_reports_rider_profile_id_idx" ON "paid_reports" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "prediction_results_prediction_id_idx" ON "prediction_results" USING btree ("prediction_id");--> statement-breakpoint
CREATE INDEX "predictions_email_idx" ON "predictions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "predictions_course_id_idx" ON "predictions" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "predictions_rider_profile_id_idx" ON "predictions" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "predictions_is_paid_idx" ON "predictions" USING btree ("is_paid");--> statement-breakpoint
CREATE UNIQUE INDEX "quote_embeddings_quote_id_uniq" ON "quote_embeddings" USING btree ("quote_id");--> statement-breakpoint
CREATE INDEX "quotes_episode_slug_idx" ON "quotes" USING btree ("episode_slug");--> statement-breakpoint
CREATE INDEX "quotes_speaker_entity_slug_idx" ON "quotes" USING btree ("speaker_entity_slug");--> statement-breakpoint
CREATE INDEX "rider_login_tokens_rider_profile_id_idx" ON "rider_login_tokens" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "rider_login_tokens_expires_at_idx" ON "rider_login_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "rider_profiles_email_idx" ON "rider_profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "rider_profiles_contact_id_idx" ON "rider_profiles" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "rider_profiles_lead_score_idx" ON "rider_profiles" USING btree ("lead_score");--> statement-breakpoint
CREATE INDEX "roadman_events_starts_at_idx" ON "roadman_events" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "saved_views_entity_idx" ON "saved_views" USING btree ("entity");--> statement-breakpoint
CREATE INDEX "saved_views_created_by_slug_idx" ON "saved_views" USING btree ("created_by_slug");--> statement-breakpoint
CREATE INDEX "segments_created_by_slug_idx" ON "segments" USING btree ("created_by_slug");--> statement-breakpoint
CREATE INDEX "skool_events_created_at_idx" ON "skool_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "skool_events_status_idx" ON "skool_events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_runs_source_idx" ON "sync_runs" USING btree ("source","started_at");--> statement-breakpoint
CREATE INDEX "ted_activity_log_timestamp_idx" ON "ted_activity_log" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "ted_activity_log_job_idx" ON "ted_activity_log" USING btree ("job","timestamp");--> statement-breakpoint
CREATE INDEX "ted_drafts_scheduled_for_idx" ON "ted_drafts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "ted_drafts_status_idx" ON "ted_drafts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ted_edits_draft_id_idx" ON "ted_edits" USING btree ("draft_id");--> statement-breakpoint
CREATE INDEX "ted_edits_created_at_idx" ON "ted_edits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ted_surface_drafts_status_idx" ON "ted_surface_drafts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ted_surface_drafts_skool_post_id_idx" ON "ted_surface_drafts" USING btree ("skool_post_id");--> statement-breakpoint
CREATE INDEX "ted_surface_drafts_created_at_idx" ON "ted_surface_drafts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ted_surfaced_post_id_idx" ON "ted_surfaced" USING btree ("skool_post_id");--> statement-breakpoint
CREATE INDEX "ted_surfaced_at_idx" ON "ted_surfaced" USING btree ("surfaced_at");--> statement-breakpoint
CREATE INDEX "ted_welcome_queue_status_idx" ON "ted_welcome_queue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ted_welcome_queue_created_at_idx" ON "ted_welcome_queue" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tool_results_email_idx" ON "tool_results" USING btree ("email");--> statement-breakpoint
CREATE INDEX "tool_results_tool_slug_idx" ON "tool_results" USING btree ("tool_slug");--> statement-breakpoint
CREATE INDEX "tool_results_rider_profile_id_idx" ON "tool_results" USING btree ("rider_profile_id");--> statement-breakpoint
CREATE INDEX "tool_results_created_at_idx" ON "tool_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "topic_tags_episode_slug_idx" ON "topic_tags" USING btree ("episode_slug");--> statement-breakpoint
CREATE INDEX "topic_tags_slug_idx" ON "topic_tags" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_tags_episode_slug_slug_uniq" ON "topic_tags" USING btree ("episode_slug","slug");--> statement-breakpoint
CREATE INDEX "training_peaks_assignments_contact_id_idx" ON "training_peaks_assignments" USING btree ("contact_id");--> statement-breakpoint
CREATE INDEX "training_peaks_assignments_status_idx" ON "training_peaks_assignments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "training_peaks_assignments_tp_athlete_id_idx" ON "training_peaks_assignments" USING btree ("tp_athlete_id");--> statement-breakpoint
CREATE INDEX "training_peaks_assignments_created_at_idx" ON "training_peaks_assignments" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "cohort_applications_email_cohort_idx" ON "cohort_applications" USING btree ("email","cohort");--> statement-breakpoint
CREATE INDEX "contact_activities_author_slug_idx" ON "contact_activities" USING btree ("author_slug");--> statement-breakpoint
CREATE INDEX "contact_submissions_status_idx" ON "contact_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_ai_referrer_idx" ON "events" USING btree ("ai_referrer");