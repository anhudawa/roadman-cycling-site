# Good Legs acquisition through the Roadman podcast archive

Owner: Codex, implementing Anthony Walsh's request of 11 September 2026.

## Outcome

Help cyclists discover Roadman's original strength interviews, answer their training questions, and understand Good Legs before joining its iPhone waitlist. Preserve established URLs and the rest of Roadman's coaching and editorial journeys.

## Delivery sequence

| Step | Deliverable | Completion evidence | Status |
| --- | --- | --- | --- |
| 1 | Audit the three interviews, existing guides, app claims and publishing workflow | Source inventory, exact existing URLs and evidence limitations | Complete |
| 2 | Improve Galpin and Art interview pages; add the missing Chris Peden episode using verified source metadata | Accurate names, descriptions, playable source and useful related reading | Implemented and reviewed |
| 3 | Improve three practical guides on strength after 40, fitting gym around riding, and starting strength training | Useful standalone answers; source-specific attribution; retained URLs where available | Implemented and reviewed |
| 4 | Publish a Roadman founder/product story | Actual podcast material and verified product capabilities; no invented personal memories or guest endorsements | Implemented and reviewed |
| 5 | Connect these pages to a focused Good Legs preview | Relevant product imagery, one principal product action and article-level referral attribution | Implemented and reviewed |
| 6 | Produce six short clips and source-description link copy | Playable reviewed clips, accurate captions, source identification and relevant destination URLs | Six briefs and description copy prepared; actual clip exports require source media/service access |
| 7 | Verify and publish | Editorial gate, TypeScript, focused behavior tests, content audit, links, SEO, desktop/mobile and post-release checks | Desktop/mobile and production editorial gate passed; merge and live verification next |

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

Website application source: `3aa9a40de305287a213d2ec7900f568644555201` in [PR #350](https://github.com/anhudawa/roadman-cycling-site/pull/350).

The exact application revision completed its Vercel preview build and actual desktop/mobile review. Codex signed the 43-section release review and the production editorial gate passed. The following commit adds only review evidence, this plan and the dated search CSVs. Merge and production verification are the remaining release operations; the pull request records their outcome.

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

- Production editorial gate passed for content digest `cd195bcefc6c2cf7043ad0ad71b0b0f6d381616c969cb022ca93105287d23b43`. Baseline and publishing controls remain unchanged.
- Codex reviewed 43 substantive section records and all twelve affected routes at actual desktop 1363 × 936 and mobile 390 × 844 viewports. Per-route observations and the final DOM scan are in `good-legs-rendered-qa-2026-09-11.json`.
- Real QA caught and fixed a broken external product image, an injected newsletter splitting the founder quotation, overlapping expertise labels and an inaccurate episode count. The original 960 × 645 mascot file is now served locally, without visual modification. Selected reading routes also lose duplicate content/sales modules and interrupting coaching overlays.
- The founder CTA reached `/app?source=goodlegs-origin`, then the actual product site with `roadman-app-waitlist-goodlegs-origin-hero` in `utm_content`. The normal top-level waitlist form was inspected without creating a subscriber.
- The mobile Peden CTA reached `/app?source=chris-peden-episode`; its onward link retained `roadman-app-waitlist-chris-peden-episode-hero`. The external destination refuses iframe embedding, so mobile external-form rendering is not claimed. The normal top-level destination was checked independently on desktop.
- Availability and scheduling FAQs opened; transcript search highlighted two matches on desktop and mobile; transcript closing/reopening worked. The original Peden Spotify preview played and was stopped after the check.
- Final rendered metadata scan: twelve correct canonicals, one H1 per page and valid JSON-LD. Each of nine selected content pages has one main Good Legs card, no injected newsletter and no duplicate algorithmic cross-content block.
- 56 editorial-gate rejection tests and 22 final focused tests across four files passed. TypeScript, focused ESLint and edited MDX compilation passed. Earlier focused waitlist tests and a local preview production build also passed; that build generated 4,470 pages.
- Final internal-link audit: 18,387 references, zero broken and zero indeterminate internal links; 2,576 external references excluded.
- Original Galpin and Art transcript strings compare exactly equal to main. Standard method/index generators completed, producing 819 compact podcast records.
- Final application source `3aa9a40de305287a213d2ec7900f568644555201` completed Vercel deployment `EyrBqB9YQKE72SDc5k1xWZcHg883` successfully. GitHub SEO and episode coverage checks passed.
- The legacy `audit:content-governance` command references a script absent from main. It is not claimed as executed; the publishing-standard source review, MDX compilation and link audit are recorded separately.

## Clip production and external follow-through

Six editing briefs and original episode-description additions are prepared in `good-legs-podcast-clip-briefs-2026-09-11.md`. No clip exports or source-channel description posts are claimed.

Four passages are located in Galpin/Art stored transcripts. Their actual video in/out points and captions still require review against source media. Chris Peden's two selections require the original audio or transcript. Preparation notes and the podcast schedule confirm his identity, but planned questions do not establish spoken answers.

The connected transcript/clip service returned insufficient credits without a charge. Focused searches and inspection of three accessible podcast/video folders found no named original recordings. Complete the clips when the recordings or service access are available: verify passages, set actual in/out points, export, watch each result and add approved embeds to the live destinations. Obtain explicit authorization before posting the prepared description copy to source channels.

Search Console and site analytics were not available in this session. The dated Semrush snapshots below provide search-discovery context, while measured visits, impressions and confirmed conversions require the connected reports described above.

## Search visibility snapshot — captured 11 September 2026

Two Semrush organic-keyword reports are saved beside this plan:

- `good-legs-search-baseline-uk-2026-09-11.csv`
- `good-legs-search-baseline-us-2026-09-11.csv`

Each report contains the top 30 returned rows for roadmancycling.com, filtered to URLs containing `strength` and sorted by estimated traffic. UK keyword observations span 20 July–5 September 2026; US observations span 19 July–7 September 2026. They are dated third-party search observations and traffic estimates, not live rankings, measured site visits or a complete organic baseline. Missing rows do not establish zero traffic.

The broad strength guide appears at position 3 for “strength training for cyclists” in both returned databases. The beginner plan appears at position 3 for “12-week strength training program for cyclists” in the US report. This supports retaining those established URLs and adding source links and relevant product handoffs. Search Console and analytics data are still needed for measured impressions, clicks and conversion rates.
