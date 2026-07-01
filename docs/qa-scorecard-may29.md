# Ask Roadman QA scorecard — 2026-05-29

**Target:** https://roadmancycling.com
**Suite:** scripts/qa-ask-roadman.ts (50 in-corpus + 20 out-of-corpus = 70 cases)
**Status:** **Skipped — auth gate blocks unauthenticated runs**
**Overall:** N/A (no cases executed)

## What happened

Single-case probe against prod returned **HTTP 401** on the first request and exited:

```
✗ [01/1] coach-01       291ms  FAIL
       · api error: HTTP 401: {"error":{"code":"auth_required",
         "message":"Enter your email on /ask to start a session."}}
```

The `/api/ask` POST handler (`src/app/api/ask/route.ts:67-74`) requires
either an `ask_session` JWT cookie (set by completing the magic-link flow
introduced in commit `b91e4658`) **or** a `riderProfileId` in the body.
The QA script sends neither, so every one of the 70 cases would fail
identically with the same 401. Running the full suite would burn
streaming-LLM credits with no signal, so the run was aborted after the
probe.

## Infrastructure check

| Question | Answer |
|---|---|
| Migration `0047_ask_auth` deployed? | **Yes** — the 401 surfaces the well-formed `auth_required` error path. If `ask_auth_subscribers` / `ask_auth_tokens` were missing, the magic-link flow would 500 instead. |
| Endpoint reachable? | Yes — 291 ms TTFB on the 401, well under the 5 s typical-latency budget. |
| Migration 0047 the blocker? | No — the gate itself is the blocker, not a missing migration. |

## What's needed to run the suite

The QA script needs a valid `ask_session` cookie on every fetch. Three
options, in order of pragmatism:

1. **Capture a cookie via the real magic-link flow (recommended)**
   - `POST https://roadmancycling.com/api/ask/auth/request` with `{"email":"anthony@roadmancycling.com"}`
   - Open the magic link from the resulting email
   - `GET https://roadmancycling.com/api/ask/auth/verify?token=…` — response `Set-Cookie`s `ask_session` (7-day TTL)
   - Patch `scripts/qa-ask-roadman.ts` to accept `--cookie=<value>` and pass it on the `Cookie` header in `askOnce()`. ~10 lines.

2. **Mint a JWT directly using the server secret.** Import `signAskSessionToken` from `src/lib/ask-auth/auth.ts`, sign a token for any email at script start, attach it as a cookie. Needs `ASK_SESSION_SECRET` (or the `METHOD_SESSION_SECRET` / `RIDER_SESSION_SECRET` fallback) from Vercel env — confirm which is set before running.

3. **Send a `riderProfileId`.** The gate yields when the body includes a valid paying-rider profile UUID. Exercises the paid-tier rate-limit path, not the email-gated lead path, so the metrics drift slightly from what a real `/ask` lead experiences.

## Recommendation

Option 1. Closest to real user behaviour, no env-var access required, small script patch. Once a cookie is captured, the full run looks like:

```bash
npm run qa:ask -- --url=https://roadmancycling.com \
  --cookie="ask_session=…" \
  --json=docs/qa-scorecard-may29.json
```

…and then this scorecard can be replaced with the real one.

## Files

- `docs/qa-scorecard-may29.json` — structured probe result + blocker detail (this run produced no per-case results).
- `docs/qa-scorecard-may29.md` — this summary.
