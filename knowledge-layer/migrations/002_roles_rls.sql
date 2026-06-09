-- ============================================================================
-- Roadman Knowledge Layer — 002_roles_rls.sql (task P0-2)
--
-- 1. `pipeline_worker` role: what the Python pipeline connects as
--    (SUPABASE_PIPELINE_KEY / dedicated DB credentials). Column-level grants
--    on `experts` exclude the credentials columns, so the pipeline cannot
--    write expert biographies even before the 001 guard trigger fires.
-- 2. RLS on member-facing reads: members (Supabase `authenticated`) can read
--    the published knowledge graph; internal tables (transcripts,
--    review_queue, fact_blocklist, golden_*) are not member-readable.
--
-- Run as a privileged role (postgres / service connection).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Pipeline role
-- ----------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'pipeline_worker') then
    create role pipeline_worker nologin;
  end if;
end
$$;

grant usage on schema public to pipeline_worker;

-- Full pipeline tables
grant select, insert, update on episodes      to pipeline_worker;
grant select, insert         on transcripts   to pipeline_worker;  -- immutable: no update/delete
grant select, insert, update on segments      to pipeline_worker;
grant select, insert, update on claims        to pipeline_worker;
grant select, insert, update on claim_relations to pipeline_worker;
grant select, insert         on episode_guests to pipeline_worker;
grant select, insert, update on review_queue  to pipeline_worker;
grant select                 on taxonomy      to pipeline_worker;  -- read-only: Ted-governed
grant select                 on fact_blocklist to pipeline_worker; -- read-only
grant select, insert         on golden_runs   to pipeline_worker;
grant select                 on golden_set    to pipeline_worker;

-- experts: column-level grants. The pipeline may create/maintain identity
-- fields (entity resolution, appearance stats) but has NO grant on the
-- credentials columns, in either INSERT or UPDATE position.
grant select on experts to pipeline_worker;
grant insert (id, canonical_name, aliases, domain_tags,
              first_appearance, last_appearance, episode_count,
              created_at, updated_at)
  on experts to pipeline_worker;
grant update (canonical_name, aliases, domain_tags,
              first_appearance, last_appearance, episode_count, updated_at)
  on experts to pipeline_worker;

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table experts         enable row level security;
alter table episodes        enable row level security;
alter table episode_guests  enable row level security;
alter table transcripts     enable row level security;
alter table taxonomy        enable row level security;
alter table segments        enable row level security;
alter table claims          enable row level security;
alter table claim_relations enable row level security;
alter table fact_blocklist  enable row level security;
alter table review_queue    enable row level security;
alter table golden_set      enable row level security;
alter table golden_runs     enable row level security;

-- Pipeline role operates under its grants; RLS must not silently filter its
-- writes, so give it explicit full-row policies on its tables.
create policy pipeline_all_episodes        on episodes        for all to pipeline_worker using (true) with check (true);
create policy pipeline_all_experts         on experts         for all to pipeline_worker using (true) with check (true);
create policy pipeline_all_episode_guests  on episode_guests  for all to pipeline_worker using (true) with check (true);
create policy pipeline_all_transcripts     on transcripts     for all to pipeline_worker using (true) with check (true);
create policy pipeline_read_taxonomy       on taxonomy        for select to pipeline_worker using (true);
create policy pipeline_all_segments        on segments        for all to pipeline_worker using (true) with check (true);
create policy pipeline_all_claims          on claims          for all to pipeline_worker using (true) with check (true);
create policy pipeline_all_claim_relations on claim_relations for all to pipeline_worker using (true) with check (true);
create policy pipeline_read_blocklist      on fact_blocklist  for select to pipeline_worker using (true);
create policy pipeline_all_review_queue    on review_queue    for all to pipeline_worker using (true) with check (true);
create policy pipeline_read_golden_set     on golden_set      for select to pipeline_worker using (true);
create policy pipeline_all_golden_runs     on golden_runs     for all to pipeline_worker using (true) with check (true);

-- Member-facing reads (Supabase `authenticated` role — NDY members).
-- Published graph only:
--  * claims: only live-graph claims — not superseded, not sitting in an open
--    review queue item.
--  * transcripts, review_queue, fact_blocklist, golden_*: NOT member-readable.
create policy member_read_experts  on experts  for select to authenticated using (true);
create policy member_read_episodes on episodes for select to authenticated using (true);
create policy member_read_guests   on episode_guests for select to authenticated using (true);
create policy member_read_taxonomy on taxonomy for select to authenticated using (active);
create policy member_read_segments on segments for select to authenticated using (true);

create policy member_read_claims on claims for select to authenticated
  using (
    superseded_by is null
    and not exists (
      select 1 from review_queue rq
      where rq.claim_id = claims.id and rq.status = 'open'
    )
  );

create policy member_read_relations on claim_relations for select to authenticated
  using (true);
