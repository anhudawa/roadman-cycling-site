# App product feed release — 1 September 2026

## Shipped

- A public, cached product record at `/feeds/app-product.json` sourced from the
  same facts as `/app`, the knowledge graph and MCP.
- Explicit `null` launch date, price and currency fields, plus
  `finalNameAnnounced: false`, so machines cannot turn prelaunch context into
  invented commercial facts.
- One canonical early-access URL and `single-waitlist` audience model.
- Direct links to the app's topic owners, free previews, comparison pages,
  evidence articles, knowledge graph and MCP manifest.
- Product-feed discovery from `/app` metadata and JSON-LD, both LLM reference
  files, and the direct MCP app record.

## Trust boundary

The feed does not rank the unlaunched Roadman app against products that can be
tested today. It publishes identity, intended features and limitations only;
independent performance claims, pricing and a release date remain absent until
evidence exists.
