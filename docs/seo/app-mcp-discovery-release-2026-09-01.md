# Roadman app MCP discovery — release brief

Released: 1 September 2026

MCP version: 1.2.0

## New public interfaces

- Tool: `get_cycling_strength_recovery_app`
- Resource: `roadman://products/cycling-strength-recovery-app`

Both return the same database-free product record sourced from
`src/data/app-product.ts`: the name-neutral identity, prelaunch status, iOS
platform, audience, features, evidence limits, graph ID, supporting topics,
preview tools, comparisons, evidence guides and one early-access URL.

The existing `list_products` tool remains the catalogue of products currently
available for purchase. It does not assign a price or launch state to the
prelaunch app.

## Claim boundary

- Final product name: not announced.
- Launch date: `null`.
- Price and currency: `null`.
- Early access: `https://roadmancycling.com/app#early-access`.
- Internal project names are not exposed.

## Validation

The real local Streamable HTTP endpoint completed MCP `initialize`,
`tools/list`, `resources/list`, `resources/read` and `tools/call` requests. The
server reported version 1.2.0 and returned the same bounded product record from
both the resource and tool.
