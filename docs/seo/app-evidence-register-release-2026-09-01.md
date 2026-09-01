# App evidence register release — 1 September 2026

## Shipped

- A public, versioned app evidence register at `/app/evidence` that answers what
  evidence exists today rather than what Roadman plans to prove later.
- Seven claim records covering the strength rationale, decision-policy
  conformance, usability, coach agreement, cycling outcomes, recovery
  measurement and injury or medical claims.
- Explicit zero-result fields: product effectiveness is not established, no
  public product result exists, and Roadman makes no performance, recovery
  measurement, injury-prevention or medical-clearance claim.
- A five-item reporting queue whose unannounced dates and unpublished result
  URLs remain `null` in the public data.
- A stable machine-readable feed at `/feeds/app-evidence.json`.
- Evidence discovery added to the app page, methodology, testing standard,
  product feed, MCP product record, knowledge graph, sitemap and both LLM
  reference files.

## Search role

`/app` remains the canonical owner for the cycling strength and recovery app.
`/app/testing` answers how Roadman will evaluate it. `/app/evidence` answers
what evidence and claim status exist now. The pages have distinct intents and
cross-link without creating a second product owner.

## Verification

- 17 focused tests passed across the evidence page and feed, app page,
  methodology, testing standard, product feed, MCP and knowledge graph.
- TypeScript and changed-file lint passed.
- Search-quality audit: 1,772 documents, 0 errors.
- Strict search-ownership audit: 1,772 documents, 6 owners, 0 errors and 0
  review-queue items.
- Production build passed with 4,457 generated pages; `/app/evidence` and
  `/feeds/app-evidence.json` are present.
