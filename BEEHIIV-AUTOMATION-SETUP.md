# Beehiiv Automation Setup — Faster After 40

The squeeze page and API are wired up. When someone enters their email:

1. They're subscribed to Beehiiv with the tag **`faster-after-40`**
2. They receive a transactional welcome email via Resend with the PDF download link
3. They see a "Download Now" button on the page for immediate access

The Resend email handles the instant delivery. What you need to set up below is the **Beehiiv automation** — this is the follow-up email that Beehiiv sends, which gives you tracking, open rates, and segmentation within Beehiiv's dashboard.

---

## Step 1 — Create the automation

1. Log in to [Beehiiv](https://app.beehiiv.com)
2. Go to **Automations** in the left sidebar
3. Click **New Automation**
4. Name it: `Faster After 40 — PDF Delivery`

## Step 2 — Set the trigger

1. Under **Trigger**, select **Tag Added**
2. Choose the tag: **`faster-after-40`**
3. This fires whenever the API subscribes someone with that tag

## Step 3 — Add the email step

1. Click **Add Step** → **Send Email**
2. Set **Delay**: `0 minutes` (send immediately)

## Step 4 — Write the email

### Subject line options (pick one)

- `Your Faster After 40 guide is here`
- `The 5 pillars — your PDF is inside`
- `Here's Faster After 40 (30 pages, no filler)`

### Email body

Keep it short. The Resend email already covered the detail — this one is a Beehiiv-native backup with tracking.

```
Hey {first_name},

Here's your copy of Faster After 40 — 30 pages of coaching intelligence from Dan Lorang, Professor Seiler, and the coaches behind Grand Tour wins.

[DOWNLOAD THE GUIDE (PDF)]
→ Link to: https://roadmancycling.com/downloads/faster-after-40-report.pdf

What's inside:
• The polarised model — what actually works for time-limited riders over 40
• Fuelling-first nutrition — how I got lighter eating more food
• 5 S&C movements from Pogačar's programme, adapted for you
• Recovery, sleep, HRV — the over-40 equation in plain English
• Le métier — why riding alone always leads to a plateau

If you already know where you're stuck, the Plateau Diagnostic is a free four-minute audit that tells you exactly where to focus:
→ https://roadmancycling.com/go

And when you're ready to train alongside 100+ serious cyclists applying all five pillars together, Not Done Yet is where that happens:
→ https://www.skool.com/roadmancycling

You're not done yet.
— Anthony
```

## Step 5 — Activate

1. Review the automation flow
2. Click **Activate** (or **Publish**, depending on your Beehiiv version)
3. Test with your own email — subscribe via the squeeze page and confirm the email arrives

## Step 6 — Verify it's working

After activating:
1. Open the squeeze page in an incognito window
2. Enter a test email
3. Confirm you receive:
   - The **Resend** welcome email (instant, with PDF link)
   - The **Beehiiv** automation email (may take a few minutes)
4. Check the subscriber in Beehiiv has the `faster-after-40` tag

---

## How the PDF is hosted

The PDF is served from the Next.js `public/downloads/` directory:

```
public/downloads/faster-after-40-report.pdf
```

Live URL: `https://roadmancycling.com/downloads/faster-after-40-report.pdf`

If you want to update the PDF, replace that file and redeploy. The filename must stay the same — it's referenced by the API, the squeeze page, and both email templates.

---

## Environment variables

These must be set in Vercel (they should already be configured for the site):

| Variable | Purpose |
|---|---|
| `BEEHIIV_API_KEY` | Authenticates API calls to Beehiiv |
| `BEEHIIV_PUBLICATION_ID` | Your Beehiiv publication |
| `RESEND_API_KEY` | Sends the transactional welcome email |

---

## Segmentation notes

Subscribers from this squeeze page are tagged:
- **`faster-after-40`** — the primary tag (automation trigger)
- **`intent-masters`** — intent taxonomy (matches other masters-focused magnets)

Custom fields set on the subscriber:
- `lead_magnet` = `faster-after-40`
- `first_name` = whatever they entered (if they did)

UTM attribution:
- `utm_source` = `website`
- `utm_medium` = `squeeze-page`
- `utm_campaign` = `faster-after-40`
