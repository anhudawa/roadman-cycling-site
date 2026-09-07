# Roadman release editorial review — 7 September 2026

## Scope and decision

Reviewed all public-facing additions in PR #336, including product metadata and shared article calls to action. This is a review of that release, not a claim that the complete Roadman archive has been edited.

Anthony identified the Good Legs page as below Roadman's standard and supplied the Good Legs copydeck from 7 September. His subsequent direction takes priority: describe the strength and recovery app through what it offers; do not lead with internal boundaries about cycling-plan ownership.

The original release passed technical checks but its app copy did not pass a sufficient editorial review. It repeated promises, used internal product terminology, presented a fabricated interface illustration and carried an unverified named-review badge. This revision removes those weaknesses rather than awarding the page an unsupported quality score.

## Public surfaces reviewed

| Surface | Editorial action |
|---|---|
| `/app` | Rebuilt around strength, recovery and a concrete example week. Removed the invented phone UI, technical sales language, competitor generalisations and named-review badge. Preserved the product identity, canonical, waitlist attribution and honest launch status. |
| `/app/masters` | Rewritten for riders balancing experience, available time and recovery. Removed repeated age disclaimers, implementation terminology and explanations of acquisition tracking. |
| Shared waitlist component | Shortened to a clear destination and next action. Removed repeated membership paragraphs. The main product FAQ explains invitation availability. |
| Homepage | Edited the new product and community cards, membership answer and delivery copy; restored current strength support alongside future app inclusion. |
| Not Done Yet | Clarified the current five-pillar service, reduced repeated app promises and restored current strength guidance to the tier inclusions. |
| Application page | Described current strength/nutrition support and future app inclusion directly. |
| Not Done Yet entity page | Clarified inclusion and corrected the adjacent claim that 1,400+ episodes meant 1,400+ World Tour coaches and scientists interviewed. |
| Strength course | Explained the available fixed course and forthcoming app without readiness jargon or acquisition-system explanations. |
| Strength-session planner | Replaced the internal placement-logic pitch with a description of the app's strength and recovery work. |
| Minimum-dose article | Rewritten for a rider making a scheduling decision. Research limits remain explicit; the correction to the previous claim is retained in a dated note. |
| Strength after 40 article | Rewritten around training experience, exercise choices, scheduling and the training record. Kept the correction and distinguished elite-study findings from individual expectations. |
| Strength, sleep and coaching guides | Edited the Good Legs placements and removed repeated five-pillar sales language. The rest of these existing long guides is outside this release's rewrite scope. |
| Shared next-step block | Replaced slogans and competitor contrasts with specific coaching, strength, recovery and community actions. Removed unnecessary unverified audience-count claims. |
| Header/footer navigation | The added Good Legs name and destination are clear; retained. |
| Product data, feeds and graph | Simplified the shared description/features. Retained stable IDs, explicit prelaunch status and unknown launch/price fields. Technical evidence limitations remain in technical records. |
| Blog archive/search UI | Search labels, counts and pagination communicate their function clearly; retained. |

## Evidence and product checks

- Product facts come from Anthony's supplied copydeck: strength-session planning, previous lifts, progression, exercise substitution, sleep/energy/soreness check-ins, reduced sets on low-recovery days, recovery work and an assistant explanation. There are no new wearable-partner or sync claims.
- The example week puts strength on Friday after Thursday's threshold session. It is labelled as an example, not an individual prescription or a screenshot of the released app.
- Good Legs remains in development. Not Done Yet access is described as included at launch. No app availability, beta place, standalone price or release date is invented.
- The retained strength research was checked against the [Llanos-Lagos et al. publisher article](https://link.springer.com/article/10.1007/s00421-025-05883-2) and the [Rønnestad et al. publisher abstract](https://onlinelibrary.wiley.com/doi/10.1111/sms.12257). The review's low-certainty finding and lack of robust optimal-programming recommendations are preserved. The elite study is not presented as a masters-rider forecast.
- No guest endorsement, app effectiveness result, quotation, customer outcome or completed coach sign-off has been invented.
- Skool access automation remains deferred. The separate getgoodlegs.com website and its copy have not been changed by this release.

## Editorial standard for this revision

Each section should answer a reader's question, add a concrete detail and move the page forward. Product copy should explain the work, not its implementation. Scientific qualifications belong beside the claim they qualify. Remove filler, synthetic quotations, exaggerated authority, generic competitor dismissals and repeated slogans. No automated test or self-awarded decimal score can certify literary quality; the checks below verify behaviour and publishing integrity.

## Validation

TypeScript and targeted rendering, canonical, product-feed and acquisition checks run before publication. Existing copy-specific assertions were updated to preserve the meaningful product and attribution checks without pinning rejected marketing slogans. Production build, SEO QA and live checks are recorded in the pull request.
