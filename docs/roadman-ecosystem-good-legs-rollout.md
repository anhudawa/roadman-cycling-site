# Roadman ecosystem implementation — 7 September 2026

## Product decision

Anthony confirmed that Not Done Yet members will receive Good Legs access. Good Legs covers the **strength** and **recovery** pillars. The other pillars remain **coaching**, **nutrition** and **community** (including cycling culture / le métier).

The current public product is preparing for iPhone beta. Website wording therefore says access is included **at launch**; it does not claim that an automatic membership unlock is already live. No standalone price or public launch date has been invented.

## Implemented in this change

- Blog archive pages pass only current-page card data and aggregate counts to the client. The compact full search index loads on demand when a reader searches or filters, with loading, failure and retry states. Existing server-rendered pagination and article links remain.
- Every existing crawler group allows `/_next/image` alongside static assets.
- Good Legs by Roadman has a shared public identity, product-domain link and consistent name in the product feed and graph. Established Roadman entity identifiers and canonical URLs remain stable.
- The homepage, Not Done Yet page, application delivery copy, entity page, planner and fixed-course comparison explain the membership inclusion.
- The Not Done Yet page explains all five pillars. Homepage discovery retains podcast, learning, tools and camps. Newsletter and community journeys remain available.
- The app page refers visitors to the actual Good Legs waitlist instead of a second form bundled with Saturday Spin. Only allowlisted editorial identifiers are forwarded; no email, personal query value or health data is placed in the cross-domain URL.
- Existing strength, sleep and coaching pages connect the reader with the relevant Roadman support. The minimum-dose and over-40 strength articles replace unsupported universal claims with bounded evidence and practical planning guidance.

## Measured local payload change

953 article records in this checkout. The former full metadata array serializes to 6,550,778 bytes. The compact on-demand search array serializes to 573,050 bytes. Initial archive props (current-page cards plus counts) are 25,139 bytes on page 1 and 23,398 bytes on page 2. This measures component data, **not complete production HTML**. Measure the deployed HTML separately before claiming the audit's 7 MB response has reached its target.

## Semrush prioritisation evidence

The UK `resource_organic` report returned on 7 September 2026 estimates:

| Query | Position | Monthly search volume | Current Roadman destination |
|---|---:|---:|---|
| strength training for cyclists | 3 | 320 | /blog/cycling-strength-training-guide |
| cycling and sleep | 2 | 1,300 | /blog/cycling-sleep-performance-guide |
| online cycling coaching | 2 | 110 | /blog/best-online-cycling-coach-how-to-choose |
| rouvy vs zwift | 1 | 1,000 | /blog/rouvy-vs-zwift |

These are third-party UK estimates, not Search Console measurements, worldwide rankings or revenue attribution. The mix supports improving the wider Roadman ecosystem rather than turning every high-traffic article into an app advertisement. No existing high-ranking URL is redirected in this change.

## Member access: required connection before launch

The current Roadman `/api/skool-webhook` accepts free-community join/update events and flexible automation payloads. It is not an authoritative record of an active, paid Not Done Yet subscription. The Good Legs app has a `manual` entitlement type, but the inspected commerce manager currently validates against store-platform products. Public membership inclusion does not implement those runtime changes.

**Confirmed source:** Anthony confirmed that Not Done Yet payments run through Skool. Authenticated admin inspection on 7 September 2026 verified the group at `https://www.skool.com/roadmancycling` as **Roadman Cycling (Not Done Yet)**. Skool admin access is available for this implementation.

### Verified Skool integration constraints

- The group's **Zapier integration is Off**. Its settings list a paid-member name/email trigger, a membership-question trigger, and actions to invite members or unlock a course. No renewal, cancellation or removal trigger was shown in this integration panel.
- Skool's [official new-paid-member instructions](https://help.skool.com/article/162-zapier-new-paid-member-info-to-crm) describe a Pro-plan Zapier connection and a trigger returning a transaction ID, transaction date, name and subscription email. They do not establish a complete subscription lifecycle feed or the timing relative to a free trial. Verify actual payloads in the connected Zapier account before building an adapter.
- The members interface exposes **Active**, **Cancelling**, **Churned** and **Banned** views, an Export control, membership tiers, renewal information and cancellation timing. Active membership includes complimentary/lifetime accounts and subscriptions marked cancelled with access remaining. Neither presence in the group nor a generic `active` label proves a paid subscription.
- Skool says [cancellation removes a member at the end of their billing cycle](https://help.skool.com/article/99-how-to-cancel-my-subscription-to-a-community). Cancellation intent must therefore not immediately revoke an otherwise valid included benefit.
- Anthony's inclusion promise is for Not Done Yet members. Trial and complimentary membership eligibility must be represented deliberately; a payment-only trigger must not silently redefine that promise. An unrelated free Clubhouse signup is not evidence of Not Done Yet membership.
- No API key was revealed, generated or rotated. No integration was enabled, member modified, payment changed, or customer message sent during inspection. Member names, emails and billing records are not copied into this repository.

**Remaining integration dependency:** connect the actual Zapier account and inspect its available Skool trigger fields and lifecycle capabilities. A new-paid-member event can start activation, but cannot alone guarantee continuing membership eligibility. Before production, establish an authoritative renewal/end-of-access reconciliation source, verify the existing-member import format, and resolve trial/complimentary policy. Do not convert the existing community webhook into a permanent app-access grant.

Implementation acceptance criteria for the access bridge:

1. Verify a signed server event or current provider record for the explicit Not Done Yet product. A newsletter or free Clubhouse join never qualifies.
2. Bind the verified member to their authenticated Good Legs account with a verified identity. Client-supplied email or a public campaign code cannot grant access.
3. Support idempotent creation, renewal, cancellation, expiry and reinstatement. Apply source event ordering and retain an audit trail without health records.
4. Give membership access a distinct source and finite validity. Preserve an independently valid App Store subscription when membership expires, and preserve membership when a store subscription ends.
5. Show included membership access before offering a second purchase. Explain existing App Store billing without pretending Roadman has cancelled that subscription.
6. Verify member, non-member, trial, expired, mismatched-account, replayed-event and simultaneous-entitlement cases in the real staging integration.
7. Make activation instructions visible in the member welcome/account journey only once the flow is usable. Provide a support recovery path for identity mismatches.

No membership grants, live billing changes, customer emails, migrations or app releases were executed in this change.

## Remaining programme work

| Work | Concrete next step | Dependency |
|---|---|---|
| Member access | Implement and test the verified entitlement bridge above | Skool source confirmed; Zapier connection, lifecycle reconciliation and trial/complimentary policy remain |
| Attribution | Carry campaign attribution through Good Legs navigation and confirmed signup; respect consent | Good Legs website/server change, no copy redesign |
| Measurement | Join Search Console, GA4 and product revenue into separate coaching, course, camp and app outcomes with a deduplicated customer view | Private analytics and billing data |
| Search consolidation | Check traffic, backlinks and canonical selection before merging exact duplicate intents | GSC and backlink review |
| Original evidence | Produce a consented rider case series and timestamp-verified interview resources | Rider records, permissions and editorial review |
| Distribution | Prepare guest, club and event partnership assets | Approved assets; sending outreach requires Anthony's instruction |
| App launch | Validate beta retention and activation before scaling distribution; prepare store assets from released functionality | Good Legs release gates and physical-device evidence |

## Release validation

Targeted checks cover archive payload bounds, homepage and app rendering, crawler rules, public product facts and attribution privacy. Production webpack compilation passed. The ordinary build initially failed on the runner’s tsx IPC socket restriction; running the same prebuild scripts in-process succeeded. A subsequent compile-mode build with temporary local worker settings compiled successfully in 2.3 minutes but reached the 180-second execution cap while collecting build traces. The temporary settings were restored and are not part of this change. This is not a completed full production build or deployed-page validation. The pull request must pass the normal production build before release. See the pull request for final TypeScript and targeted-test results.

After deployment, verify `/`, `/community/not-done-yet`, `/apply`, `/app`, the strength planner, the changed articles, both archive pages and the search-index endpoint. Confirm canonical links, image crawl access, search/filter success and retry, source attribution and the existing coaching application path. Record complete uncompressed archive HTML sizes. Monitor qualified applications and retained Roadman customer value alongside app signups.
