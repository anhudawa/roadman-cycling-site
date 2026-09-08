# Roadman release status — 8 September 2026

## Approved content and failed production deployment

PR340 is merged: https://github.com/anhudawa/roadman-cycling-site/pull/340

- Reviewed content commit: `febbba9634b14adbe74583c9accf2a7e5c0ff595`.
- Final QA commit: `36e19c296be9b7fd315ece8b0c29890a35835e2b`.
- Production merge commit: `bc536d6f68ffd7a76c4ad7965e25236c47dbdf0c`.
- The GitHub comparison between the QA commit and merge reports zero changed files.
- The editorial gate, SEO QA Audit and Episode SEO Coverage passed on the QA commit. Main's editorial and SEO checks also passed. An unrelated scheduled Ted draft workflow failed; it is not evidence of the Vercel build's cause.
- The reviewed preview built successfully. The final QA-only preview is also ready: deployment `HtxQK3SoC8KmhzYdEpf9PZZqbWDL`.

Vercel production deployment `dpl_8oiduDWQfMnLNNkdE699M3yYrct3` failed at 10:30:15 UTC. The GitHub status does not supply the build error, only the inspection command. The connected Vercel tool returns HTTP 403, explicitly saying it is not authorized for scope `anhudawas-projects` (`team_isb0WL1PXM9lbn80nAVEqGD8`). The hosted failure's cause remains unknown. Do not attribute it to the editorial gate without logs.

The existing public homepage, coaching page and training-load tool still return HTTP 200. The public calculator does not yet contain the new Starting CTL input, confirming the new release is not live. No preview was promoted to bypass production checks.

## Additional diagnosis

The exact-content gate passes locally after both generators and the coral check. Local production compilation succeeded in 2.8 minutes, TypeScript advanced to static generation, and generation reached 2,231 of 4,463 pages before the diagnostic build was stopped. This is not a completed local build. The local environment lacks Beehiiv publication configuration, so its external-data warnings are not a diagnosis of the hosted failure. An independent final TypeScript check passed earlier.

The local tsx CLI encountered an IPC permission error. The same generator modules were executed using `node --import tsx`, then the unchanged production build script ran with its editorial gate. No production configuration or gate was relaxed. Vercel CLI was not installed, so a read-only `npx --no-install` inspection could not run; no credentials were extracted or new access tokens created.

## Required continuation

Reconnect the Vercel plugin with access to the Roadman team's scope, then inspect the failed deployment's build logs. Correct the demonstrated cause, rerun relevant checks, and publish through the normal production build. Any content/control change invalidates the relevant QA hashes and requires renewed review. Do not reset the baseline or promote the preview-only QA helper to production.

After a successful deployment, verify public canonicals/indexability, coaching CTA, the CTL rest-day calculation, watch timestamps, absence of inferred review credits, and production `/preview-qa` returning 404 with noindex/no-store and DENY framing. A prepared local check script exists at `/tmp/roadman-production-check.py`; recreate it if scratch has been cleared. IndexNow submission was researched but not sent because the changes are not live. Submit only verified live canonical URLs and distinguish receipt from indexing.

## Next search work

[Next search batch](next-search-batch-2026-09-08.md) contains the confirmed automatic mobile overlay, event-edition corrections, competitor-result analysis and ordinary Bing traffic being classified as AI referrals. Raw Semrush reports are saved alongside the broader [search opportunity queue](search-opportunities-2026-09-08.md). These are findings and planned improvements, not measured ranking gains.
