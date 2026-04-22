# Plateau Diagnostic — Paste Packet

Everything you need to paste or configure in external systems to get
the funnel live. Complements `docs/plateau-diagnostic.md` (which is
the ordered checklist).

Scripts referenced below:

- `npm run migrate:diagnostic` — applies migrations 0025 + 0026
- `npm run seed:beehiiv:plateau -- --email=seed@your-test-inbox.com` —
  forces Beehiiv to create the 6 tags + prints the §13 email sequence
- `npm run smoke:plateau -- --url=https://roadmancycling.com` —
  post-deploy sanity check
- `npm run smoke:plateau -- --url=... --submit --email=you+smoke@...` —
  runs a full end-to-end submission (real email + Beehiiv hit)

---

## 1. Env vars (Vercel → Project Settings → Environment Variables)

Copy-paste these keys; fill in the values:

```
ANTHROPIC_API_KEY=
RESEND_API_KEY=
BEEHIIV_API_KEY=
BEEHIIV_PUBLICATION_ID=
NEXT_PUBLIC_CAL_BOOKING_URL=
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_SITE_URL=https://roadmancycling.com
CRON_SECRET=
```

All seven are optional at build time — the funnel degrades gracefully
per `docs/plateau-diagnostic.md`. The smoke script flags which are
missing after deploy.

---

## 2. Beehiiv — tags

Run `npm run seed:beehiiv:plateau -- --email=seed@your-test-inbox.com`
once against the publication. It force-creates these by subscribing
the seed address with all tags attached:

```
plateau-diagnostic
profile-underRecovered
profile-polarisation
profile-strengthGap
profile-fuelingDeficit
multi-system
retake
```

Delete the seed subscriber after the tags appear. Real submissions
will re-apply them.

---

## 3. Beehiiv — 5-email nurture automation

Beehiiv's public API doesn't expose automations, so this is manual.
Run the seed script once and it prints the full §13 sequence to your
terminal — **copy from that output directly**, don't re-type from here.

Automation config (Audience → Automations → New):

| Field | Value |
| --- | --- |
| Trigger | Tag applied · `plateau-diagnostic` |
| Audience | All subscribers |
| Delay basis | Tag-applied timestamp |
| Delays | Day 0 (send within 5m), Day 1, Day 3, Day 5, Day 7 |
| Merge tags | `{{ subscriber.custom_fields.diagnostic_profile }}`, `{{ subscriber.custom_fields.diagnostic_slug }}` |

The submit route writes both custom fields on every subscribe, so the
merge tags render correctly from email 1 onward.

---

## 4. Cal.com — 15-minute call event type

Create a new event type, then copy the link into
`NEXT_PUBLIC_CAL_BOOKING_URL`.

| Field | Value |
| --- | --- |
| Title | Plateau diagnostic — 15 minutes with Anthony |
| Slug | plateau-15 |
| Duration | 15 minutes |
| Buffer before/after | 5 min / 5 min |
| Schedule | Anthony's working hours (your call) |
| Required questions | Name, email, "Which profile did you get?" (short text) |
| Confirmation email | Default Cal.com — you can override later |

Webhook (optional but recommended) — wire once we have the CAPI work
done:

- Trigger: `BOOKING_CREATED`
- URL: `https://roadmancycling.com/api/webhooks/calcom` (not built yet — flag for a later PR)

---

## 5. Meta Business — Pixel + Conversions API

**Pixel (already wired on the page, just needs an ID):**

1. Meta Business Manager → Events Manager → Connect Data Sources → Web
2. Create a new pixel; call it "Roadman Cycling" or similar
3. Copy the 16-digit pixel id → `NEXT_PUBLIC_META_PIXEL_ID` on Vercel
4. No further setup needed — the client fires `PageView` on `/plateau`
   and `PageView` + `Lead` on `/diagnostic/[slug]`

**Conversions API (deferred — this PR only wires the client pixel):**

When you add it:

1. Events Manager → Settings → Conversions API → Generate access token
2. Store as `META_CAPI_TOKEN` on Vercel
3. Build a server-side `Lead` emitter in the submit route; pass a
   shared `eventID` per Meta dedup rules (client + server must share it)
4. Test via Events Manager → Test Events tab

Dedup is the only tricky part — without a shared `eventID` you'll
double-count Leads and the ad optimisation breaks.

---

## 6. Facebook ads (§14) — creative copy

Three variants. Run all three at €50/day, kill underperformers at day 3.

### Variant 1 — "The four reasons" (primary)

Primary text:

> If you're over 40 and your FTP hasn't moved in a year, it's almost always one of four things.
>
> It's usually not what you'd guess. And it's almost never "train harder."
>
> Twelve questions. Four minutes. A specific answer for why you're stuck — and the exact fix, written for riders who train 6 to 12 hours a week around a real life.
>
> Built from 1,400+ podcast conversations with the coaches behind Pogačar, Froome and Bernal.
>
> Start the diagnostic →

Headline: `One of four reasons your FTP is stuck`

CTA button: `Learn more`

Media: Anthony to camera, 15–20s, direct delivery of the hook. No
stock footage, no music-over.

### Variant 2 — "The specific number"

Primary text:

> Your FTP has been sitting at the same number for 18 months.
>
> Every block starts well. Week four, you're flat. Week six, the numbers are back where they started. You've been blaming training hours, age, work stress, genetics.
>
> It's almost certainly one specific thing — and it's fixable. Four minutes will tell you which of four profiles you fit, and what to actually do about it.
>
> Start the diagnostic →

Headline: `Same FTP for 18 months?`

CTA button: `Learn more`

Media: Static asset. Charcoal `#252526` background, Bebas Neue
headline "SAME FTP FOR 18 MONTHS?", purple accent, coral CTA pill.

### Variant 3 — "The identity angle" (retargeting)

Primary text:

> You listen to the podcast. You know the content. You've heard me interview Seiler, Lorang, LeMond, Morton.
>
> Here's the awkward bit. If you've been listening for a year and your FTP hasn't moved — the content isn't translating into training. That's not on you. That's how content works.
>
> This is different. Twelve questions, a specific answer for where you're stuck, and a protocol that fits your life. Not a plan. Not another podcast episode.
>
> Start the diagnostic →

Headline: `From the podcast, into your training`

CTA button: `Learn more`

Media: Thumbnail-style image of Anthony with a top guest (Lachlan
Morton, Professor Seiler — whoever has the strongest clip library).
Text overlay: "From the podcast, into your training."

### Targeting (all variants)

| Axis | Setting |
| --- | --- |
| Age | 35–60 |
| Interests | Cycling, road cycling, Strava, Zwift, masters cycling, Tadej Pogačar, Greg LeMond, TrainerRoad, cycling training |
| Lookalikes | 1% LAL off existing Skool paid members |
| Exclusions | Existing email list, existing NDY members |
| Geo | Ireland, UK, US, Australia, Canada, Netherlands, Germany |
| Objective | Leads (optimise for `Lead` event via server-side CAPI once configured; client pixel until then) |
| Budget | €50/day across the three variants to start; scale winners 20% per step, cap €300/day until CPL holds |

### UTM convention (set on all ad destinations)

```
?utm_source=facebook&utm_medium=cpc&utm_campaign=plateau-diagnostic&utm_content=<variant-id>
```

Where `<variant-id>` is `four-reasons`, `specific-number`, or
`identity-angle`. The submit route persists these per row — admin
list filters by `utm_campaign` + `utm_content`.

---

## 7. Post-deploy smoke

Run after Vercel promotes the build:

```bash
# Fast: health + landing only
npm run smoke:plateau -- --url=https://roadmancycling.com

# Full: also POSTs an end-to-end submission (fires a real
# confirmation email + Beehiiv subscribe against the inbox you pass)
npm run smoke:plateau -- --url=https://roadmancycling.com --submit --email=you+smoke@example.com
```

Expected output: ✓ on every line, exit 0.
