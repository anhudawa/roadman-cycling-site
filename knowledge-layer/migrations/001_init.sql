-- ============================================================================
-- Roadman Knowledge Layer — 001_init.sql
-- Regenerated from CLAUDE.md Appendix A (authoritative spec; phase0 package
-- zip was not present in the repo).
-- Target: Supabase Postgres 15+ with pgvector.
--
-- NOTE ON EMBEDDING DIMENSIONS: schema assumes 1536 dims pending the pilot
-- embedding benchmark (task P0-7). If the chosen model differs, a follow-up
-- migration alters the vector columns and rebuilds the HNSW indexes.
-- ============================================================================

create extension if not exists vector;
create extension if not exists pg_trgm;
create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type processing_status as enum (
  'pending',
  'transcribing',
  'diarizing',
  'segmenting',
  'extracting',
  'normalising',
  'indexed',
  'failed',
  'skipped'
);

create type claim_type as enum (
  'recommendation',
  'mechanism',
  'empirical',
  'opinion',
  'anecdote',
  'disagreement'
);

create type claim_relation_type as enum (
  'supports',
  'contradicts',
  'refines',
  'supersedes'
);

create type hedging_level as enum (
  'speculative',
  'qualified',
  'confident',
  'emphatic'
);

create type review_reason as enum (
  'low_confidence',
  'unmapped_topic',
  'ambiguous_speaker',
  'blocklist_hit',
  'schema_violation',
  'manual_flag'
);

create type review_status as enum (
  'open',
  'approved',
  'corrected',
  'rejected'
);

-- ----------------------------------------------------------------------------
-- experts — human-curated identity + biography.
-- `credentials` is HUMAN-CURATED ONLY. The pipeline never writes it.
-- Enforced by: (a) the guard trigger below, (b) column-level grants in
-- 002_roles_rls.sql, (c) pipeline code which simply never references it.
-- ----------------------------------------------------------------------------

create table experts (
  id                       uuid primary key default uuid_generate_v4(),
  canonical_name           text not null unique,
  aliases                  text[] not null default '{}',
  credentials              text,           -- human-curated only; never pipeline-written
  credentials_verified_by  text,
  credentials_verified_at  timestamptz,
  domain_tags              text[] not null default '{}',
  first_appearance         date,
  last_appearance          date,
  episode_count            integer not null default 0,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index experts_aliases_gin on experts using gin (aliases);
create index experts_name_trgm on experts using gin (canonical_name gin_trgm_ops);

-- Credentials guard: only privileged human-operated roles may set or change
-- credentials fields. The pipeline role is blocked even if column grants are
-- ever misconfigured (defence in depth).
create or replace function guard_expert_credentials()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'UPDATE' and (
        new.credentials              is distinct from old.credentials or
        new.credentials_verified_by  is distinct from old.credentials_verified_by or
        new.credentials_verified_at  is distinct from old.credentials_verified_at))
     or (tg_op = 'INSERT' and (
        new.credentials is not null or
        new.credentials_verified_by is not null or
        new.credentials_verified_at is not null))
  then
    if current_user not in ('postgres', 'service_role', 'supabase_admin') then
      raise exception 'experts.credentials is human-curated only; role % may not write it', current_user
        using errcode = 'insufficient_privilege';
    end if;
  end if;
  return new;
end;
$$;

create trigger experts_credentials_guard
  before insert or update on experts
  for each row execute function guard_expert_credentials();

-- ----------------------------------------------------------------------------
-- episodes — archive inventory + processing state machine
-- ----------------------------------------------------------------------------

create table episodes (
  id                        uuid primary key default uuid_generate_v4(),
  episode_number            integer not null unique,
  title                     text not null,
  publish_date              date,
  audio_url                 text,
  youtube_url               text,
  duration_seconds          integer,
  status                    processing_status not null default 'pending',
  status_detail             text,
  transcript_quality_score  numeric check (transcript_quality_score >= 0 and transcript_quality_score <= 1),
  pipeline_version          text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index episodes_status_idx on episodes (status);
create index episodes_publish_date_idx on episodes (publish_date);

create table episode_guests (
  episode_id  uuid not null references episodes(id) on delete cascade,
  expert_id   uuid not null references experts(id) on delete cascade,
  primary key (episode_id, expert_id)
);

-- ----------------------------------------------------------------------------
-- transcripts — immutable raw Whisper+diarization output, versioned.
-- Source of truth; nothing ever edits it. Re-runs insert a new version row.
-- ----------------------------------------------------------------------------

create table transcripts (
  id          uuid primary key default uuid_generate_v4(),
  episode_id  uuid not null references episodes(id) on delete cascade,
  version     integer not null,
  model       text not null,
  raw         jsonb not null,
  created_at  timestamptz not null default now(),
  unique (episode_id, version)
);

create or replace function forbid_transcript_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'transcripts are immutable; insert a new version row instead'
    using errcode = 'integrity_constraint_violation';
end;
$$;

create trigger transcripts_immutable
  before update on transcripts
  for each row execute function forbid_transcript_mutation();

-- ----------------------------------------------------------------------------
-- taxonomy — controlled hierarchy, Ted-governed.
-- Extraction maps to existing nodes or emits UNMAPPED -> review queue.
-- Pipeline never inserts nodes.
-- ----------------------------------------------------------------------------

create table taxonomy (
  path         text primary key,
  label        text not null,
  parent_path  text references taxonomy(path),
  pillar       text not null check (pillar in
                 ('coaching','nutrition','strength-conditioning','recovery','le-metier')),
  active       boolean not null default true,
  created_by   text not null,
  created_at   timestamptz not null default now()
);

create index taxonomy_parent_idx on taxonomy (parent_path);

-- ----------------------------------------------------------------------------
-- segments — the retrieval unit. 200–500 word topical chunks,
-- speaker-resolved, timestamped, embedded.
-- ----------------------------------------------------------------------------

create table segments (
  id          uuid primary key default uuid_generate_v4(),
  episode_id  uuid not null references episodes(id) on delete cascade,
  speaker_id  uuid references experts(id),   -- nullable: unresolved speaker stays null
  start_ts    numeric not null,
  end_ts      numeric not null,
  text        text not null,
  topic_tags  text[] not null default '{}',
  embedding   vector(1536),
  tsv         tsvector generated always as (to_tsvector('english', text)) stored,
  created_at  timestamptz not null default now()
);

create index segments_episode_idx on segments (episode_id);
create index segments_speaker_idx on segments (speaker_id);
create index segments_embedding_hnsw on segments using hnsw (embedding vector_cosine_ops);
create index segments_tsv_gin on segments using gin (tsv);

-- ----------------------------------------------------------------------------
-- claims — the heart of the graph.
-- topic_path is NULL for UNMAPPED claims (which are routed to review_queue
-- and excluded from the live graph until resolved); the extractor's
-- suggested_topic travels in the review_queue detail.
-- ----------------------------------------------------------------------------

create table claims (
  id                    uuid primary key default uuid_generate_v4(),
  segment_id            uuid not null references segments(id) on delete cascade,
  episode_id            uuid not null references episodes(id) on delete cascade,
  expert_id             uuid references experts(id),
  timestamp_s           numeric not null,
  claim_text            text not null,        -- faithful paraphrase
  verbatim_quote        text not null,        -- minimal exact span; internal QA artifact
  claim_type            claim_type not null,
  topic_path            text references taxonomy(path),
  population_qualifier  text not null default 'general',
  confidence            numeric not null check (confidence >= 0 and confidence <= 1),
  hedging               hedging_level not null,
  embedding             vector(1536),
  prompt_version        text not null,
  model_version         text not null,
  pipeline_version      text not null,
  superseded_by         uuid references claims(id),
  created_at            timestamptz not null default now()
);

create index claims_topic_idx on claims (topic_path);
create index claims_expert_idx on claims (expert_id);
create index claims_episode_idx on claims (episode_id);
create index claims_embedding_hnsw on claims using hnsw (embedding vector_cosine_ops);

-- ----------------------------------------------------------------------------
-- claim_relations — supports / contradicts / refines / supersedes
-- ----------------------------------------------------------------------------

create table claim_relations (
  id              uuid primary key default uuid_generate_v4(),
  claim_a         uuid not null references claims(id) on delete cascade,
  claim_b         uuid not null references claims(id) on delete cascade,
  relation        claim_relation_type not null,
  rationale       text not null,
  confidence      numeric not null check (confidence >= 0 and confidence <= 1),
  prompt_version  text not null,
  model_version   text not null,
  created_at      timestamptz not null default now(),
  unique (claim_a, claim_b, relation),
  check (claim_a <> claim_b)
);

create index claim_relations_a_idx on claim_relations (claim_a);
create index claim_relations_b_idx on claim_relations (claim_b);

-- ----------------------------------------------------------------------------
-- fact_blocklist — known-false claims checked in QA
-- ----------------------------------------------------------------------------

create table fact_blocklist (
  id           uuid primary key default uuid_generate_v4(),
  pattern      text not null,
  detail       text not null,
  match_hints  text[] not null default '{}',
  added_by     text not null,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- review_queue
-- ----------------------------------------------------------------------------

create table review_queue (
  id           uuid primary key default uuid_generate_v4(),
  claim_id     uuid references claims(id) on delete cascade,
  segment_id   uuid references segments(id) on delete cascade,
  reason       review_reason not null,
  detail       text,
  status       review_status not null default 'open',
  resolved_by  text,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index review_queue_open_idx on review_queue (created_at) where status = 'open';

-- ----------------------------------------------------------------------------
-- golden_set / golden_runs — evaluation harness
-- ----------------------------------------------------------------------------

create table golden_set (
  id               uuid primary key default uuid_generate_v4(),
  question         text not null,
  persona          text not null check (persona in ('tom','mark','james','dave')),
  reference_notes  text,
  created_at       timestamptz not null default now()
);

create table golden_runs (
  id               uuid primary key default uuid_generate_v4(),
  golden_id        uuid not null references golden_set(id) on delete cascade,
  run_label        text not null,
  answer           text not null,
  citations_valid  boolean,
  rating           integer check (rating >= 1 and rating <= 5),
  rated_by         text,
  created_at       timestamptz not null default now()
);

create index golden_runs_golden_idx on golden_runs (golden_id);
