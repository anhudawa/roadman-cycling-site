# Roadman Analytics — UTM & Attribution Strategy

Covers the AI-referrer attribution system, the events table, and the
canonical-tag policy that keeps SEO clean while UTMs do attribution work.

## How AI traffic is attributed

We classify inbound traffic that came from an AI assistant (ChatGPT,
Perplexity, Claude, Gemini, Copilot, …) using two complementary signals,
in this precedence order:

1. **`utm_source` query param** — strongest signal because it survives
   cross-origin Referrer-Policy stripping. Outbound URLs in `/llms.txt`
   and `/llms-full.txt` are tagged with
   `?utm_source=llms-txt&utm_medium=ai-crawler` via `tagUrlForAICrawler()`
   so AI crawlers ingest them in pre-tagged form.
2. **`Referer` header / `document.referrer`** — fallback when the AI
   assistant didn't tag the URL but did pass a referer. We match against
   a known host map (`HOST_MAP` in `ai-referrer.ts`) that folds subdomain
   variants (`www.`, `chat.`) onto canonical slugs.

### Where detection lives

| Layer | File | Used by |
|---|---|---|
| Slug definitions + host map | `ai-referrer.ts` | Both client and server |
| Browser detection (sessionStorage first-touch) | `ai-referrer.ts` | `components/analytics/Tracker.tsx` |
| Server detection (header + utm) | `ai-referrer-server.ts` | `app/api/events/route.ts` fallback |

Both layers share `matchAIHost()`, so adding a new AI host is a one-line
change in `HOST_MAP` plus the `AIReferrerHost` union and
`AI_REFERRER_HOSTS` array.

### Why both client and server detection?

The client always tries first because sessionStorage gives true
first-touch attribution across in-session navigation. But the client
send is best-effort — adblock or strict privacy modes can drop it.
The server fallback re-derives from the inbound `Referer` header and
parsed `utm_source` so events still get attributed. First-write-wins
on the client; the server only kicks in when the client omits the field.

## Storage model

Two columns in `events` carry AI attribution:

- **`ai_referrer text` (indexed)** — added in migration 0038. The
  canonical store. Queries on the measurement dashboard hit this
  column directly.
- **`meta->>'ai_referrer'` (jsonb)** — the original location, written
  to in parallel for backwards compatibility with any reader that
  still expects to find it there. Will be deprecated once all callers
  are migrated.

The migration also backfilled the column from `meta->>'ai_referrer'`
so historical events are queryable without a separate one-shot script.

## Canonical-tag policy

UTM-tagged URLs (`?utm_source=...`) **must not appear in canonical
tags**. Search engines should always see the bare URL in the
canonical so attribution UTMs don't fragment indexed rankings or
muddy duplicate detection.

The codebase enforces this by hardcoding canonicals as absolute URLs
in each page's `Metadata.alternates.canonical`, e.g.:

```ts
export const metadata: Metadata = {
  alternates: { canonical: "https://roadmancycling.com/apply" },
  // ...
};
```

### Audit (2026-04-27)

`grep` for `alternates.*canonical` across `src/`. Result: ~30
occurrences, every one a hardcoded absolute URL — no offenders that
build canonicals from `request.url` or pass through inbound search
params. No fixes required.

## Adding a new AI host

1. Add the hostname to `HOST_MAP` in `ai-referrer.ts` (with any
   subdomain variants you need to fold).
2. Add the canonical slug to the `AIReferrerHost` union and to the
   `AI_REFERRER_HOSTS` array.
3. No DB migration needed — `events.ai_referrer` is a `text` column.

The new host will start showing up in the AI Referrals panel of
`/admin/measurement` immediately on the next pageview.
