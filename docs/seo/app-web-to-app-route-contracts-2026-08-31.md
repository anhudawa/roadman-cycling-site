# Roadman app acquisition and route contract — 31 August 2026

## Permanent public owner

- `/app` is the only product, launch and early-access owner.
- Every attributed variant keeps the canonical URL `https://roadmancycling.com/app`.
- The product remains publicly name-neutral until its external name is approved.
- Every app capture joins the existing Beehiiv publication with the shared
  `app-waitlist` tag and campaign. Attribution must never create a second list.

## Web acquisition contract

The `source` query value records the page that solved the visitor's first job.
The app page accepts only the values below; unknown values fall back to direct
app attribution. Hero and bottom placement are appended to the stored source so
conversion can be compared without changing the audience.

| First job                                | Web owner                                    | App handoff                              |
| ---------------------------------------- | -------------------------------------------- | ---------------------------------------- |
| Place strength around rides              | `/tools/strength-session-planner`            | `/app?source=strength-session-planner`   |
| Decide whether today's plan needs review | `/tools/training-readiness`                  | `/app?source=training-readiness`         |
| Identify a recovery constraint           | `/tools/recovery-screen`                     | `/app?source=recovery-screen`            |
| Understand cycling strength evidence     | `/blog/cycling-strength-training-guide`      | `/app?source=strength-guide`             |
| Choose cyclist-specific gym exercises    | `/blog/cycling-gym-exercises-best`           | `/app?source=gym-exercises`              |
| Start a cycling core routine             | `/blog/cycling-core-workout-routine`          | `/app?source=core-workout`               |
| Progress beyond basic planks             | `/blog/core-strength-cyclists-beyond-planks`  | `/app?source=core-progressions`          |
| Start a 12-week beginner strength plan   | `/blog/cycling-strength-training-12-week-beginner-plan` | `/app?source=beginner-strength-plan` |
| Progress an experienced off-season block | `/blog/off-season-gym-routine-cyclists-12-week-block` | `/app?source=off-season-strength` |
| Apply Derek Teel's strength interview    | `/blog/derek-teel-best-exercises-cyclists`   | `/app?source=derek-teel-exercises`       |
| Adapt strength training after age 50     | `/blog/strength-training-cyclists-over-50`    | `/app?source=strength-over-50-guide`     |
| Understand recovery                      | `/blog/cycling-recovery-tips`                | `/app?source=recovery-guide`             |
| Choose post-ride recovery food           | `/blog/best-recovery-foods-after-cycling`    | `/app?source=recovery-nutrition`         |
| Decide on an active-recovery ride        | `/blog/cycling-active-recovery-rides-guide`  | `/app?source=active-recovery-guide`      |
| Fit training into a limited week         | `/blog/cycling-time-crunched-training-guide` | `/app?source=time-crunched-guide`        |
| Browse the strength knowledge layer      | `/topics/cycling-strength-conditioning`      | `/app?source=strength-hub`               |
| Browse the recovery knowledge layer      | `/topics/cycling-recovery`                   | `/app?source=recovery-hub`               |
| Find masters-specific support            | `/topics/masters-cycling`                    | `/app?source=masters-hub`                |
| Compare available apps                   | `/best/[app-comparison-slug]`                | `/app?source=best-[app-comparison-slug]` |
| Buy the current standalone strength plan | `/strength-training`                         | `/app?source=strength-plan`              |

## Stored acquisition values

An attributed hero signup from the strength guide is stored as
`roadman-app-waitlist-strength-guide-hero`; the same visitor using the lower form
is stored as `roadman-app-waitlist-strength-guide-bottom`. Both receive only the
shared `saturday-spin` and `app-waitlist` Beehiiv tags and the `app-waitlist`
campaign. The exact capture source remains available as the website event, CRM
source and Beehiiv UTM medium.

## Launch deep-link contract

The current web URLs describe jobs, not unreleased app screens. Once the final
bundle identifier, App Store URL and navigation paths are approved, preserve
these mappings:

| Web job                                   | Intended in-app action                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------ |
| Strength session planner                  | Open weekly availability and key-ride placement                                      |
| Training readiness                        | Open today's readiness check-in                                                      |
| Recovery screen or recovery guide         | Open today's recovery context and action                                             |
| Strength guide, exercises or strength hub | Open strength onboarding or the current prescribed session                           |
| Masters or time-crunched guide            | Open onboarding with the rider's availability and training-history questions visible |
| Comparison or product page                | Open product onboarding, never a fabricated review or pricing screen                 |

Implementation after product approval:

1. Publish `apple-app-site-association` for the final bundle and signed app.
2. Keep the existing HTTPS URL as the fallback for users without the app.
3. Pass the approved acquisition key through install attribution and onboarding.
4. Measure waitlist signup, install, onboarding completion, first strength
   session and second strength session by the original web owner.
5. Test every route on an installed device, an uninstalled device and desktop
   before exposing Universal Links publicly.

## Measurement and privacy boundary

- Compare signup rate by originating owner and by hero/bottom placement.
- Do not put email, health, soreness, sleep or training data in URL parameters.
- Do not infer a medical state from an acquisition source.
- Low-volume sources should be reported in aggregate rather than used for
  individual profiling.
