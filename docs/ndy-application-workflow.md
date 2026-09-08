# Not Done Yet application follow-up

Built for Anthony Walsh's 8 September 2026 request. The feature flag defaults off so the workflow can be disabled independently of a deployment.

## Applicant experience

1. Submit the existing Not Done Yet application. Save the application and its email job in one database transaction. Inner Circle continues through its existing process.
2. Start one immediate Beehiiv automation. Email contains two choices: start a **7-day free trial**, then **$195 USD/month** plus applicable taxes via Skool, or ask Sarah a question. The Skool about page is also linked.
3. The applicant can open the same next-step page immediately after submitting, even if email is delayed or held.
4. Asking Sarah opens a short form. Submitting it records the question, moves the application to **Sarah Review**, assigns its existing CRM contact to Sarah, records a timeline entry and queues an operational alert to **anthony@roadmancycling.com**. Sarah reviews the dedicated admin column daily; the question remains visible there if the alert email fails.
5. Opening checkout records intent only. It does not mark a person paid, change membership counts or unlock Good Legs.

The approved email states “Your application to Not Done Yet has been approved.” That sentence is supplied only for a persisted `fit=ready` assessment; the neutral fallback never asserts approval. The admin labels the stored result **Approved automatically** or **Sarah review required**. Existing queued jobs use the current assessment wording when enrolled; already-sent emails do not change.

The automatic fit screen checks the supported cycling goals, the selected training time and injury/comeback wording. Under-four-hour, injury/comeback and unrecognised-goal applications get an honest fit-discussion message. This is a simple routing rule, not a medical assessment or a human review. No AI review is invented.

## Email to install

- Automation name: **Not Done Yet — application next steps**
- Subject: **Your Not Done Yet application**
- Preview: **Start your 7-day free trial, or email Sarah with a question.**
- Use the publication's existing verified sender identity and its current reply-to, **anthony@roadmancycling.com**.
- Email HTML content: `docs/email/ndy-application.html`; plain text: `docs/email/ndy-application.txt`.
- Keep Beehiiv's normal sender/address/unsubscribe footer. Do not publish this as a public newsletter post or send it to the whole list.
- Trigger: active **Add by API**, then one immediate email with no delay. Do not use a tag trigger: `ndy-applicant` is a segmentation tag and must not cause a second welcome.
- Re-entry: permit a genuine new application after the prior journey completes. The website deduplicates repeated requests using the submission key. Check the platform's re-entry behaviour with an existing subscriber during activation QA.

Create these case-sensitive Beehiiv text fields first:

| Field | Contents |
| --- | --- |
| `ndy_first_name` | Applicant first name |
| `ndy_application_message` | Actual automatic-screen outcome wording |
| `ndy_join_url` | Personal next-step URL, join section |
| `ndy_questions_url` | Personal next-step URL, questions section |

Insert the two URL fields as the buttons' destinations. Preview with a test subscriber and verify the received HTML retains the full `#join/<token>` and `#questions/<token>` fragments after click tracking. If Beehiiv's editor cannot resolve a merge tag in an href, that blocks activation until its supported personalised-link mechanism is verified; do not send a literal unresolved merge tag.

Ordinary replies reach Anthony through Reply-To, while the public next-step page retains Sarah’s direct email address. Email-inbox replies do **not** automatically enter the website database. The **Email Sarah** button opens the personal message form, which emails an operational alert to Anthony and saves the inquiry in Sarah’s admin queue. Ordinary inbox replies require an authenticated inbound mail integration before they can be included in the admin timeline; that integration is not implemented. Do not claim every email conversation is tracked.

## Delivery reliability

- Applications and email jobs commit together. A database failure produces a retriable error, preserving the applicant's form answers.
- Repeated identical submissions resolve to the same job. Atomic claims prevent duplicate simultaneous delivery attempts.
- Personalised fields must save successfully before automation enrollment. New and existing active subscribers are supported. Existing opt-outs, pending confirmations and invalid addresses are held, without reactivation or opt-in overrides.
- The Beehiiv enrollment marker is saved before the send request. A timeout, server error, missing journey ID or interrupted enrollment is held as **Check Beehiiv before resending**. It is never retried blindly.
- **Beehiiv accepted** means automation enrollment was accepted; it does not prove inbox delivery. Beehiiv remains the delivery/open/click source.
- Known failures retry every ten minutes, up to five attempts. Authenticated staff can retry a known failed email after fixing configuration. Uncertain enrollments require checking Beehiiv first.
- The operational alert to Anthony uses a stable Resend idempotency key. Automatic retries stop after five attempts or 23 hours, before the provider's 24-hour deduplication window expires. Older failures remain visible for direct follow-up.
- Personal action tokens have 256 bits of randomness, expire after 30 days and are replaced by a new application. They are carried in URL fragments and POST bodies, not email addresses or query strings. No applicant data is returned by a GET endpoint.
- A GET or security-scanner visit never records a question, sends Sarah mail or marks a paid signup.
- A recorded purchase is preserved on reapplication. Stale email jobs are held when the application has been replaced.

## Admin

`/admin/applications/followups` shows the latest 100 workflow entries, enrollment/failure state, questions, Anthony inbox-alert state and trial-start interest (not confirmed trial activation). It requires the existing admin authentication. The main application board has a **Sarah Review** column and a link to this view. Applicants in that column are assigned to Sarah, and detailed questions persist in the view even if CRM mirroring was unavailable at application time.

## Activation sequence

1. The additive `drizzle/0064_ndy_application_followups.sql` schema is already present in production. Production's historical Drizzle ledger is empty, so do not run the broad `npm run db:migrate` command or a destructive schema push.
2. The four custom fields and dedicated Add by API automation were created in Beehiiv. The automation ID is stored in `BEEHIIV_AUTOMATION_NDY_APPLICATION`; API, publication, Resend, database and cron credentials remain server-side in Vercel.
3. The read-only setup preflight confirmed the table, automation ID, API trigger and provider configuration. The automation is live and uses the publication's Anthony reply-to.
4. `NDY_APPLICATION_FLOW_ENABLED=true` is configured for the next production deployment. The website feature stays unchanged until that deployment is promoted or built from main.
5. Merge only after exact-revision technical, editorial, offer, desktop, mobile and interaction checks pass. Confirm the production routes and registered cron without creating an application or selecting a paid plan.
6. Monitor the first legitimate incoming application's Beehiiv and Sarah Review statuses. If rollout fails, set the feature flag false to restore the existing application response and pause the dedicated automation. Already saved questions remain in the database.

## Verification completed here

Ninety-nine focused tests pass across nine files, including API routing, Inner Circle isolation, new/existing subscribers, opt-outs, active-new-subscriber enrollment, ambiguous enrollment, duplicate questions, Anthony alert routing, purchase-state preservation and personal-link privacy. TypeScript, targeted lint, the 55 publication-gate tests, the Coral allowlist and diff whitespace checks pass. The internal-link audit found zero broken destinations. A selective production build covering the changed application/admin/API surfaces compiled and typechecked successfully; the complete preview build supplies the final deployment artifact.

The production schema was inspected read-only. A synthetic transaction exercised application insertion, follow-up deduplication, question persistence and Sarah Review status, then rolled back; no test application remains. The live Skool plan, Beehiiv custom fields, API-triggered automation, personalised email destinations, responsive email rendering and an authorised Resend test to Anthony were checked. Desktop and mobile application, next-step and authenticated admin views were reviewed without submitting a real application or initiating payment.

## Primary references

- [Beehiiv API automation enrollment](https://developers.beehiiv.com/api-reference/automation-journeys/create): active Add by API trigger, existing subscriber enrollment and journey response.
- [Beehiiv subscription creation](https://developers.beehiiv.com/api-reference/subscriptions/create): subscription creation options.
- [Beehiiv merge tags](https://www.beehiiv.com/support/article/25846316892055-how-to-personalize-a-post-using-merge-tags): case-sensitive fields, fallbacks and subscriber-context previews.
- [Not Done Yet on Skool](https://www.skool.com/roadmancycling/about): programme destination. Search confirmed $195/month on 8 September; the plans route was returned in search, but authenticated checkout selection still needs live verification.

- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys): same-key requests are deduplicated for 24 hours.
