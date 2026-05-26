-- Embeddings for the structured-extraction tables (claims, quotes).
-- Mirrors mcp_episode_embeddings / mcp_methodology_embeddings: one pgvector
-- row per source row, populated by scripts/generate-mcp-embeddings.ts. The
-- Ask Roadman retriever (src/lib/mcp/services/quotes.ts) queries these and
-- only surfaces rows whose source quote/claim is reviewed = true.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS "quote_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_id" integer NOT NULL REFERENCES "quotes"("id") ON DELETE CASCADE,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "claim_embeddings" (
	"id" serial PRIMARY KEY NOT NULL,
	"claim_id" integer NOT NULL REFERENCES "claims"("id") ON DELETE CASCADE,
	"embedding" vector(1024)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "quote_embeddings_quote_id_uniq" ON "quote_embeddings" USING btree ("quote_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "claim_embeddings_claim_id_uniq" ON "claim_embeddings" USING btree ("claim_id");
