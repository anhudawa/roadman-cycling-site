# Good Legs acquisition through the Roadman podcast archive

Owner: Codex, implementing Anthony Walsh's request of 11 September 2026.

## Outcome

Help cyclists discover Roadman's original strength interviews, answer their training questions, and understand Good Legs before joining its iPhone waitlist. Preserve established URLs and the rest of Roadman's coaching and editorial journeys.

## Delivery sequence

| Step | Deliverable | Completion evidence | Status |
| --- | --- | --- | --- |
| 1 | Audit the three interviews, existing guides, app claims and publishing workflow | Source inventory, exact existing URLs and evidence limitations | Complete |
| 2 | Improve Galpin and Art interview pages; add the missing Chris Peden episode using verified source metadata | Accurate names, descriptions, playable source and useful related reading | Implemented; release QA outstanding |
| 3 | Improve three practical guides on strength after 40, fitting gym around riding, and starting strength training | Useful standalone answers; source-specific attribution; retained URLs where available | Implemented; release QA outstanding |
| 4 | Publish a Roadman founder/product story | Actual podcast material and verified product capabilities; no invented personal memories or guest endorsements | Implemented; release QA outstanding |
| 5 | Connect these pages to a focused Good Legs preview | Relevant product imagery, one principal product action and article-level referral attribution | Implemented; release QA outstanding |
| 6 | Produce six short clips and source-description link copy | Playable reviewed clips, accurate captions, source identification and relevant destination URLs | Briefs and description copy prepared; exports blocked by credits/source access |
| 7 | Verify and publish | Editorial gate, TypeScript, focused behavior tests, content audit, links, SEO, desktop/mobile and post-release checks | Technical checks passing; visual QA blocked by protected preview |

## Source inventory

- Andy Galpin: `content/podcast/the-science-of-getting-faster-after-40-dr-andy-galpin.mdx`; YouTube `Fi7TY8M3b1Y`. The existing file contains a full transcript, but its metadata, quotations and chapters must be checked before reuse.
- Art O'Connor: `content/podcast/ep-2054-i-tried-keegan-swensons-insane-strength-routine-heres-what-n.mdx`; YouTube `1BIr_B6KO0M`. Full transcript available; existing summaries contain universal claims that need qualification.
- Chris Peden: Roadman episode "Why Cyclists Need To Strength Train With Chris Peden", 10 August 2023; Spotify `5aGlg4fcLdwfZOX6jvjqb2`. No matching episode was found in the repository. The original Spotify listing confirms the title, date and approximately 33-minute length. No transcript is available; no guest takeaways, quotations or programme were invented.

## Product and editorial requirements

- Good Legs is in development for iPhone. The current conversion is a waitlist signup; neither a public download nor an immediate invitation is promised.
- Not Done Yet includes Good Legs at launch. Do not invent a standalone price, launch date, research result or API integration.
- Guests are interview sources. Any actual product review or endorsement must be separately evidenced.
- Check extracted claims against the source transcript and, where obtainable, the relevant recording. Never manufacture timestamps or quote wording.
- Roadman's application of a lesson must be distinguished from the guest's own advice. No fabricated recollections in Anthony's voice.
- Every guide must answer its reader's question without requiring a signup.
- Preserve existing consent-aware analytics. Referral clicks and confirmed signups are different events; do not label a click as an install or a signup.
- Keep the frozen editorial baseline and production controls unchanged. The existing live site stays in place until release QA passes.

## Initial access findings

- Source repository is available and an isolated branch has been created from current main.
- Existing production authority delegates final QA to Codex; `AGENTS.md` and `docs/editorial-publishing-standard.md` govern release.
- vidIQ transcript requests returned insufficient credits and charged nothing. Investigate the original available media and repository transcripts; do not record that tool as successful verification.

## Measurement

Record the original article/episode and campaign in Good Legs referral URLs. Verify parameters survive through Roadman's app preview. Evaluate qualified referrals and confirmed waitlist signups separately. Installs and first-session completion become release-stage measures when an app is available and the relevant attribution exists.

## Release record

This plan records intended work. It is not a release sign-off. Update the status table and append exact checks, changed URLs, commit/PR references and any remaining blockers after implementation.

## Implemented acquisition routes

| Reader entry | Role | Referral identifier |
| --- | --- | --- |
| /podcast/the-science-of-getting-faster-after-40-dr-andy-galpin | Original Galpin interview and corrected notes | andy-galpin-episode |
| /podcast/ep-2054-i-tried-keegan-swensons-insane-strength-routine-heres-what-n | Original Art interview and corrected notes | art-oconnor-episode |
| /podcast/why-cyclists-need-to-strength-train-with-chris-peden | Original Chris Peden episode | chris-peden-episode |
| /blog/andy-galpin-fast-twitch-fibres-cyclist-after-40 | Explain progress and transfer | galpin-strength-guide |
| /blog/art-oconnor-strength-training-cyclists | Fit gym work around riding | art-strength-guide |
| /blog/strength-training-cyclists-over-40-what-works | Choose a starting point after 40 | strength-over-40-guide |
| /blog/cycling-strength-training-12-week-beginner-plan | Begin and record a repeatable programme | beginner-strength-plan |
| /blog/cycling-strength-training-guide | Existing broad strength search owner | strength-guide |
| /blog/why-were-building-good-legs | Explain the product’s purpose and provenance | goodlegs-origin |

All nine sources lead to `/app?source=<identifier>`. The app preview sends an allowlisted referral to getgoodlegs.com with `utm_source=roadman`, `utm_medium=referral`, `utm_campaign=good-legs-launch` and `utm_content=roadman-app-waitlist-<identifier>-hero` or `-bottom`. The app preview now includes original Good Legs brand artwork, the founder-story link and all three interviews. Selected article and episode pages suppress competing coaching overlays and end-of-article offers.

## Measurement and follow-through

1. Before publication, capture the previous 28 complete days of organic visits/impressions/clicks for these exact existing URLs from the site's analytics and Search Console. Record new URLs as new pages rather than inventing a baseline. These connected reports were not available in this session.
2. At launch, verify the article click (`good_legs_preview_<identifier>`) and onward click (`good_legs_waitlist_referral`) through existing consent-aware `cta_click` handling. Confirm that the destination URL preserves the article identifier.
3. Evaluate confirmed waitlist submissions from the Good Legs backend separately. The browser destination displays the working waitlist form, but no real subscriber or synthetic production signup was created in this session. Do not report CTA clicks as signups.
4. After 28 complete days live, compare each source's organic traffic, app-preview visits, onward referral rate and confirmed signup rate where the backend retains the same UTM value. Improve the largest demonstrated drop-off first. This is a proposed review checkpoint, not a scheduled automation.
5. When the app launches, update the CTA only after the actual store URL and availability are confirmed. Add install and first-session attribution where supported; report any attribution gap explicitly.

## Verification completed

- 56 editorial-gate rejection tests passed; production publication still rejects this revision because visual QA is incomplete.
- 23 focused tests passed across acquisition, source-to-referral continuity, preview routes and the existing waitlist component.
- Standalone TypeScript check passed after fixing one JSX conditional. Focused ESLint check passed.
- The first local preview production build completed successfully, including TypeScript and 4,470 generated pages. Expected fallback warnings appeared because the local checkout has no Postgres or Beehiiv production credentials. The remote branch build is checked separately.
- Static HTML checks passed on 12 generated routes: one H1, correct canonical and parseable JSON-LD; all nine selected content pages contain exactly one main Good Legs CTA. These do not substitute for browser visual QA.
- The final source refinements correct the image’s intrinsic dimensions, keep the founder byline consistent with Roadman’s existing author schema, preserve original frontmatter formatting on lightly edited guides and correct the preview selector’s /entity/ route.
- Ten changed/new MDX documents compiled. The Galpin and Art transcript strings compare exactly equal to the original main-branch source.
- Sitewide internal-link audit: 18,382 references; zero broken internal links; 2,576 external links excluded from that audit.
- Standard method and podcast-index generators completed; 819 compact podcast records. The local runner required `node --import tsx` because the CLI's optional IPC listener was restricted. No build scripts or approval controls were changed.
- The package's `audit:content-governance` target points to a script absent from main. Content was reviewed against the publishing standard, with the MDX compilation and link audit recorded separately; that nonexistent script is not reported as passed.
- The actual Good Legs artwork loaded from its original public URL: 960 × 645 pixels. The destination's product information and waitlist form were inspected.

## Remaining blockers and exact continuation

The website implementation is in draft PR [#350](https://github.com/anhudawa/roadman-cycling-site/pull/350). It has not been merged or published to the production domain.

**Preview access:** The branch preview requires Vercel login. The connected Vercel app returns 403 for the owner scope `anhudawas-projects` and explicitly requires reauthentication to that scope. The local supervised preview stopped before browser review. `AGENTS.md` and `docs/editorial-publishing-standard.md` require actual desktop and mobile review before publication; neither was fabricated. Reconnect Vercel with access to that scope, then inspect the exact preview revision, resolve defects, refresh the digest-bound release and QA records, run the production gate, merge and verify live routes.

**Clip exports:** The connected clip/transcript service has zero credits. The six detailed editing briefs and original-description additions are in `docs/good-legs-podcast-clip-briefs-2026-09-11.md`. Four passages are located in stored transcripts; Chris's two selections require the original audio/transcript. Provide the recordings or restore service credits, verify the actual in/out points and captions, export and play back each clip, then add embeds and source-description links after the web destinations are live.

Neither purchase, external source-channel write nor subscriber creation has occurred. These are execution/access limits, not a request to reapprove the agreed strategy.
