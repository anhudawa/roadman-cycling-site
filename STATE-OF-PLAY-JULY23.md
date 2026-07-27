# State of Play — July 23 (afternoon update)

## FA40 Funnel — COMPLETE, READY TO PUSH

All three pieces built and staged:

1. **API route** (`src/app/api/faster-after-40/route.ts`) — wired to lead magnets registry, Beehiiv subscribe with `lm-faster-after-40` tag, CRM upsert, CORS for roadmancycling.com
2. **Lead magnets registry** (`src/lib/cta/lead-magnets.ts`) — `faster-after-40` added with tags `["lm-faster-after-40", "intent-masters"]`
3. **28-page PDF** (`public/downloads/faster-after-40-report.pdf`) — 60 KB, all 5 NDY pillars, slop-checked, Dan Lorang correct (Head of Performance, Red Bull–Bora–Hansgrohe)
4. **Dan Lorang error fixed** in both `public/faster-after-40.html` and `squeeze-page-faster-after-40.html`

## To Push (Terminal)

```bash
cd ~/Desktop/roadman-cycling-site
rm -f .git/index.lock .git/HEAD.lock
git commit -m "feat: FA40 funnel (API + PDF + Beehiiv wiring) + OS polish"
git push origin main
```

139 files staged (FA40 funnel + OS Phases 4-8 polish from earlier).

## To Test Full Funnel

1. Push the commit above
2. Wait for Vercel deploy
3. Go to roadmancycling.com/faster-after-40.html
4. Submit your email
5. Check: Beehiiv should capture with `lm-faster-after-40` tag
6. The success state shows a download button for the PDF
7. For email delivery: set up a Beehiiv automation triggered by `lm-faster-after-40` tag that sends an email with the PDF link

## TrainingPeaks Virtual Content

TPV content has been in the codebase since mid-June:
- Dedicated post: `content/blog/trainingpeaks-virtual-structured-indoor-training.mdx` (published 2026-06-20)
- TPV mentioned across ~64 files (indoor training, heat management, comparisons, tools, topic hubs)
- Positions TPV favourably over Zwift/Rouvy as the serious structured option
- Should be live if June commits were pushed (they were)

## Roadman OS Status

75/76 tickets complete. Only T50 (launch prep — connect credentials, test, go live) remains.

## Blockers Only You Can Action

1. Push the commit above (sandbox can't push — no GitHub creds)
2. Set up Beehiiv automation for `lm-faster-after-40` tag to deliver the PDF email
3. API credentials for Roadman OS (GSC urgent — 16-month rolling window)
4. Record 12 Method module videos
5. Record /go hero video

## Latest Update (3) — Homepage Redesign DONE

Tour de France hero removed. New coaching-first hero:
- "YOU'RE NOT DONE YET." in massive Bebas Neue, "YET." in coral
- Primary CTA: Apply for Coaching → /apply
- Secondary: Take the Diagnostic → /plateau
- Social proof: "113 coached athletes · Cat 3→Cat 1 · $195/month"
- OVERLAY_END set to 2026-07-26 (Tour banner auto-hidden)
- Zero "Tour de France" references on homepage

```bash
cd ~/Desktop/roadman-cycling-site
rm -f .git/index.lock .git/HEAD.lock
git add -A && git commit -m "feat: homepage redesign — coaching-first hero, Tour overlay removed" && git push origin main
```

## Previous Update (2)

PDF CTAs fixed — all 7 instances changed from skool.com/roadmancycling to **roadmancycling.com/apply**. Ready to push:

```bash
cd ~/Desktop/roadman-cycling-site
rm -f .git/index.lock .git/HEAD.lock
git add -A && git commit -m "fix: FA40 PDF CTAs → roadmancycling.com/apply" && git push origin main
```

## Previous Update

Push successful — commit f30a67d7 is on origin. Everything deployed.

Once Vercel finishes building, test the FA40 funnel at roadmancycling.com/faster-after-40.html. Submit your email → download button appears immediately. For email delivery, set up a Beehiiv automation triggered by the `lm-faster-after-40` tag.

## Dispatch Bug

The reprompt loop hit again. Messages confirm delivery but don't render. This file is the fallback — check Finder. Restart session to continue.
