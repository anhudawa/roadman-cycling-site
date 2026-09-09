# Not Done Yet email repair — 8 September 2026

## Status
Installation and activation QA completed on 9 September 2026. The corrected email is installed in the dedicated live Add by API automation; the application route, personal next-step route, Sarah Review tracking and provider recovery are covered by the release workflow and can still be disabled with `NDY_APPLICATION_FLOW_ENABLED=false`.

## Confirmed defects
Inspection of the received test email found:
- The primary button's bgcolor attribute was removed while its dark foreground remained. Add explicit inline background-color and color to both button cell and anchor.
- An internal QA message replaced the application assessment.
- Both personal action links used a dummy all-a token and the production domain. A fixture token cannot open an actual application.
- Reply-To pointed to Anthony instead of Sarah.
- The text/plain part contained only the editor's default placeholder.
The screenshot also shows oversized headings and excessively spaced/repetitive copy.

## Changed assets
- ndy-application.html: a short, single-column email; normal-sized text; explicit foreground/background pairs; two distinct actions; a tracked Email Sarah action.
- ndy-application.txt: matching plain text. Preserve Beehiiv's required footer/unsubscribe content in both versions.
Use subject: Your Not Done Yet application
Use preview text: Start your 7-day free trial, or email Sarah with a question.
Keep the publication's verified Reply-To at anthony@roadmancycling.com and verify the actual delivered header; changing this document does not change Beehiiv.

The about URL https://www.skool.com/roadmancycling/about resolves through web retrieval to “Roadman Cycling (Not Done Yet)”, lists $195/month and links to its plans page. This is destination-content verification, not a received-email tap or a checkout test.

## Working-window execution
1. Pull the latest PR #342 branch before editing. Install the HTML into the dedicated NDY Beehiiv automation. Ensure the plain-text part is populated (using the companion content or verified generation); remove default editor text. Do not send to the newsletter list.
2. Replace QA custom fields on the controlled test subscriber with values produced by a real synthetic application in the correct environment. Do not use an invented token or insert a real applicant token into code/docs. In preview, both personal links must target the deployed preview hosting that test record; production URLs only after the production route and database are ready.
3. Use the actual assessment from the application. Never send “QA preview” or claim a review took place if it did not. If shortening assessment copy, keep the review-required distinction and rerun relevant source/release checks.
4. Verify /apply/next is deployed, the environment flag is on for the test environment, and the token resolves there. Clicking Email Sarah must open the question form; submitting a synthetic question must persist it under the application, show Sarah Review in admin, assign the contact to Sarah and deliver one operational alert to Anthony. Sarah reviews the dedicated admin queue daily. GET/link-scanner visits must not send a question. A mailto fallback alone does not satisfy logging.
5. Test Start my 7-day free trial with the same application, follow its redirect to Skool, and confirm the 7-day free trial on the $195 USD monthly option. Do not make a real charge. Tap See what’s included in the delivered email and verify it opens the intended about page.
6. Send one controlled end-to-end test through the real automation. Inspect received HTML and plain text, resolved URLs and Reply-To. Compare delivery content to the installed template: Beehiiv can transform it.
7. Read the received email at 320–480px in light and dark mode (especially the reported iPhone mail client), and desktop >=1000px. Verify body, both buttons, about link and footer are readable, no horizontal overflow, no internal QA text, and both actions actually work. Record actual observations; source checks do not equal rendered QA.
8. Finish existing release gates, then deploy/activate through the normal workflow and repeat production smoke checks with controlled test data. Production's historical Drizzle ledger was found empty: follow the targeted migration procedure in docs/ndy-application-workflow.md; do not run a broad migration or destructive schema push.

## Editorial review
- What happened to my application? Keep the actual automated assessment; neutral fallback if unavailable.
- What does joining cost and where do I go? State the user-approved $195 USD monthly offer once and provide Join plus the verified about destination. The user confirmed a 7-day trial and the Skool about page lists it. Verify that the selected monthly checkout actually offers that trial. The Skool page separately discloses applicable taxes.
- How do I ask a question? The Email Sarah action opens the message form, saves the question in Roadman admin and queues the email to Sarah. Ordinary replies to Sarah’s inbox are not synced yet.
- Remove the billboard heading, numbered sales panels and repeated price. Do not add unverified promises, testimonials or urgency.
Completed: the live automation delivered personalized test messages, the real tracked question action persisted in Sarah Review and generated one Anthony alert, and the trial action opened the verified seven-day Skool checkout without starting a purchase.

## Tracking scope after the copy revision
| Event | Current Roadman record | Remaining requirement |
| --- | --- | --- |
| Application decision | fit=ready/review saved with the follow-up creation time; admin shows Approved automatically / Sarah review required | Verified with controlled submissions |
| Beehiiv enrollment | Status, attempts, errors, enrollment time and provider identifiers | Journey completion and inbox delivery verified; open/bounce feedback remains in Beehiiv |
| Trial-start selection | checkoutStartedAt, relabelled Selected start trial | Seven-day checkout verified without purchase; a click remains distinct from trial activation |
| Question submitted via Email Sarah | Question text, timestamp, application stage and CRM owner/activity | Verified end to end |
| Notification to Sarah | Queue/failure/sent status and timestamp | One controlled Anthony inbox alert verified with applicant Reply-To |
| Ordinary email reply | Not captured by this workflow | Connect authenticated inbound mail and deduplicate by provider message ID; match applicant/thread, then persist messages without triggering duplicate notifications |
| Paid signup | Existing authenticated application workflow | Verify billing evidence; never derive from clicks |

The delivered Beehiiv message is HTML-only. The automation editor exposes the HTML body, subject and preview text but no separate plain-text control, and the received MIME source contains no `text/plain` alternative. The companion text file remains the approved fallback copy for any future provider or editor that supports a text part; do not claim Beehiiv emitted it.

Final verification covered 116 focused workflow tests across 12 files, 56 publication-gate tests, a full production build, responsive application/next-step/admin rendering, a 375px and 1200px received-email render, real tracked action clicks, database state and the live Skool checkout. Controlled test applications 217–220 remain deliberately labelled in admin; no payment was initiated.
