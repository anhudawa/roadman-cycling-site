# Roadman app use-case feed release — 1 September 2026

## Purpose

Give search engines and AI systems a stable, name-neutral answer to “who is this app for?” without creating doorway pages, separate products or separate waitlists before launch.

## Released

- `/feeds/app-use-cases.json` with six distinct situations:
  - masters cyclists over 40 and over 50;
  - cyclists already following a coach or cycling plan;
  - time-crunched cyclists;
  - cyclists starting or returning to strength training;
  - home or limited-equipment training;
  - recovery and readiness coordination.
- Query-language examples, rider situation, product job, required decision inputs, entry page and supporting knowledge for every use case
- The same four explicit boundaries on diagnosis, age-only decisions, external-plan replacement and guaranteed outcomes
- One product and one early-access audience stated in the feed; entry-page attribution does not create a new subscriber list
- Discovery from the canonical app product feed, MCP app record, knowledge graph and both AI discovery files
- Two new AI-citation prompts for existing-plan/time-crunched and beginner/limited-equipment product fit

## Ownership boundary

- `/app` remains the broad product and launch owner.
- `/app/masters` remains the narrower masters product-fit page.
- Educational articles and tools remain the owners for training instructions and calculations.
- The JSON feed describes product fit; it does not claim product effectiveness or replace the public testing and evidence standards.

## Verification target

- Six unique use-case IDs and unique search-intent phrases
- Every entry URL resolves to the same `/app` product family
- At least three supporting knowledge URLs and four decision inputs per use case
- No internal project name, invented launch date, price or guaranteed outcome
- Product feed, MCP and knowledge graph all expose the same use-case feed URL
