import type {
  DiagnosticDefinition,
  ResultCategory,
  ReportSection,
  ReportSectionKind,
} from "@/lib/diagnostics/framework/types";
import type { ToolResult } from "@/lib/tool-results/types";

/**
 * Build the structured content for a paid report.
 *
 * Takes the DiagnosticDefinition, the saved tool_result, and the rider's
 * first name, and produces an array of rendered sections — each with a
 * title and a list of paragraphs. Both the PDF renderer and the HTML
 * web-view render from the same ReportContent so the delivery formats
 * never drift.
 *
 * The body copy inside each kind is intentionally hand-authored per
 * ReportSectionKind. This is the "paid value-add" above the free result
 * page — more specifics, more week-by-week structure, more operational
 * detail. Admin-tweakable in a future phase via the
 * `diagnostic_definitions` JSON payload.
 */

export interface RenderedSection {
  kind: ReportSectionKind;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ReportContent {
  riderFirstName: string | null;
  productName: string;
  toolTitle: string;
  summary: string;
  primaryCategory: ResultCategory | null;
  secondaryCategory: ResultCategory | null;
  riskFlags: string[];
  sections: RenderedSection[];
  disclaimer: string;
  generatedAt: Date;
}

function pickCategory(
  def: DiagnosticDefinition,
  key: string | null,
): ResultCategory | null {
  if (!key) return null;
  return def.categories.find((c) => c.key === key) ?? null;
}

// eslint-disable-next-line complexity
function renderSection(
  section: ReportSection,
  def: DiagnosticDefinition,
  primary: ResultCategory | null,
  secondary: ResultCategory | null,
  answers: Record<string, unknown>,
): RenderedSection | null {
  if (
    section.onlyForCategory &&
    primary &&
    !section.onlyForCategory.includes(primary.key)
  ) {
    return null;
  }

  switch (section.kind) {
    case "cover":
      return {
        kind: "cover",
        title: section.title ?? def.title,
        paragraphs: [def.subtitle, def.description],
      };

    case "summary":
      return {
        kind: "summary",
        title: section.title ?? "The short answer",
        paragraphs: primary
          ? [
              primary.explanation,
              `We've built the rest of this report around one idea: ${primary.shortLabel ?? primary.label}. Everything that follows is how you act on it for the next 12 weeks.`,
            ]
          : [
              "The inputs you gave us produce a mixed picture — no single limiter dominates. That's a good problem. Use the sections below as a self-audit: pick the one that feels most honest and start there.",
            ],
      };

    case "primary_limiter":
      if (!primary) return null;
      return {
        kind: "primary_limiter",
        title: section.title ?? `Primary: ${primary.label}`,
        paragraphs: [
          primary.explanation,
          "This isn't a 'nice-to-fix' — it's the rate-limiter on everything else. Fix this and the rest of your plan starts working again.",
        ],
        bullets: primary.nextSteps,
      };

    case "secondary_limiter":
      if (!secondary) return null;
      return {
        kind: "secondary_limiter",
        title: section.title ?? `Secondary: ${secondary.label}`,
        paragraphs: [
          secondary.explanation,
          "Queue this up once the primary has been under control for 3–4 weeks. Layering both at once is how most cyclists stall their own progress.",
        ],
        bullets: secondary.nextSteps.slice(0, 3),
      };

    case "next_12_weeks":
      return {
        kind: "next_12_weeks",
        title: section.title ?? "The next 12 weeks",
        paragraphs: [
          "Three four-week blocks. Each block stacks on the last. Don't skip block 1 because it feels easy — block 3 only works if block 1 happened.",
        ],
        bullets: [
          "Block 1 (weeks 1–4): Restore the base. Pull back intensity, protect sleep, hit Z2 volume honestly. Re-test at the end of week 4.",
          "Block 2 (weeks 5–8): Introduce the quality work. Two hard sessions per week, everything else Z1/Z2. Strength twice a week, 30 minutes each.",
          "Block 3 (weeks 9–12): Specificity. The sessions get closer to what you're training for. Peak week 10, taper weeks 11–12 if you have an event.",
        ],
      };

    case "week_by_week":
      return {
        kind: "week_by_week",
        title: section.title ?? "A sample week",
        paragraphs: [
          "This is a representative week — adjust to your calendar. The shape matters more than the days.",
        ],
        bullets: [
          "Monday — Full rest or 20 min easy spin + mobility.",
          "Tuesday — Threshold (2×20 at 95–100% FTP) + 10 min S&C.",
          "Wednesday — Z2 for 90 min. No grey zone.",
          "Thursday — VO2 (5×4 min at 110%) + strength (squat, deadlift, single-leg).",
          "Friday — 45 min Z1/Z2 recovery spin.",
          "Saturday — Long ride, 3–4 hours, 80% Z2 with 20 min tempo mid-ride.",
          "Sunday — Optional Z1 ride or full rest day. Family first.",
        ],
      };

    case "fuelling_plan":
      return {
        kind: "fuelling_plan",
        title: section.title ?? "Your fuelling plan",
        paragraphs: [
          `Based on your answers, your target rate sits at ${answers.carbsPerHour ?? "60–90"}g carbs per hour. The numbers are only useful if you can actually get them in. The sequence below is what riders at your level typically do on race day.`,
        ],
        bullets: [
          "0:00 — First feed in the first 15 minutes. Start before you think you need it.",
          "Every 15 minutes — small, regular intake beats heroic gels every hour.",
          "Dual-source (glucose + fructose 1:0.8) above 60g/hr — single-source saturates and gives you GI.",
          `Fluid target: ${answers.fluidPerHour ?? "500–750"}ml/hr, sodium ${answers.sodiumPerHour ?? "400–700"}mg/hr.`,
          "Gut-train: add 10g/hr per week if the target is new — don't jump straight to 90g/hr on race day.",
        ],
      };

    case "zones_plan":
      return {
        kind: "zones_plan",
        title: section.title ?? "Your zones, built around your FTP",
        paragraphs: [
          `Your FTP of ${answers.ftp ?? "your FTP"}W drives every training target here. Re-test every 8–12 weeks — out-of-date zones are the #1 reason plans stall.`,
        ],
        bullets: [
          "Zone 1 (Active Recovery) — <55% FTP. Recovery only, doesn't build fitness.",
          "Zone 2 (Endurance) — 55–75% FTP. The biggest lever most cyclists under-utilise.",
          "Zone 3 (Tempo) — 76–90% FTP. Use sparingly — this is the grey-zone trap.",
          "Zone 4 (Threshold) — 91–105% FTP. 2×20 is the staple.",
          "Zone 5 (VO2 Max) — 106–120% FTP. Short, hard, full recovery.",
          "Zone 6 (Anaerobic) — 121–150% FTP. Neuromuscular, rarely programmed.",
          "Zone 7 (Sprint) — 150%+ FTP. Bike-handling and race-specificity.",
        ],
      };

    case "recovery_plan":
      return {
        kind: "recovery_plan",
        title: section.title ?? "Recovery protocol",
        paragraphs: [
          "Recovery isn't passive. It's the protocol that decides whether the last block of training turns into fitness or turns into a plateau.",
        ],
        bullets: [
          "Sleep — 8+ hours, consistent bedtime. Non-negotiable. Every hour of lost sleep costs a day of adaptation.",
          "Fuel the 30-minute window after every ride — carbs + protein. Even on easy days.",
          "One full rest day per week. Complete rest, not 'active recovery on the turbo'.",
          "Drop volume 30% every fourth week. Your body needs a recovery week to absorb the previous three.",
          "Stress is training load. Busy week at work + full training = overreach. Pull one lever back when life is loud.",
        ],
      };

    case "risk_addendum": {
      const riskAdvice = primary?.riskAdvice;
      if (!riskAdvice) return null;
      const items = Object.entries(riskAdvice).map(
        ([flag, advice]) => `${flag}: ${advice}`,
      );
      if (items.length === 0) return null;
      return {
        kind: "risk_addendum",
        title: section.title ?? "Watch-outs",
        paragraphs: [
          "These only apply if the matching signal showed up in your inputs. If any of these resonate, slow down and get eyes on it before you add more training.",
        ],
        bullets: items,
      };
    }

    case "ask_roadman":
      return {
        kind: "ask_roadman",
        title: section.title ?? "Talk this through with Ask Roadman",
        paragraphs: [
          "This report is static — your training isn't. Open Ask Roadman with this result pre-loaded to drill into specifics, stress-test the plan against your schedule, or ask for a variation for next week.",
        ],
        bullets: [
          "roadmancycling.com/ask — loads this result automatically.",
          "Every answer references the podcast archive, expert interviews, and the methodology behind this report.",
        ],
      };

    case "community_invite":
      return {
        kind: "community_invite",
        title: section.title ?? "The room matters",
        paragraphs: [
          "You can keep guessing alone, or plug into a group that's already solving the same problem you are. Not Done Yet is the paid community — 113 serious amateur cyclists, Anthony on weekly calls, Vekta training plans, the accountability you've been missing.",
          "Free tier if you want to lurk first: the Roadman Cycling Clubhouse — 1,800+ members, weekly Q&A, no cost.",
        ],
      };

    case "disclaimer":
      return {
        kind: "disclaimer",
        title: section.title ?? "Important",
        paragraphs: [def.disclaimer],
      };

    // ─────────────────────────────────────────────────────────────
    // Value-stack additions
    // ─────────────────────────────────────────────────────────────

    case "world_tour_comparison": {
      const focusArea = (() => {
        switch (primary?.key) {
          case "polarisation": return "intensity distribution";
          case "strengthGap": return "strength and durability";
          case "fuelingDeficit": return "in-ride fuelling";
          default: return "recovery and adaptation";
        }
      })();
      return {
        kind: "world_tour_comparison",
        title: section.title ?? "How Your Training Compares",
        paragraphs: [
          "World Tour riders run the same physiological mechanisms you do. The difference is ratios. The numbers below show where the amateur-to-professional gap is consistently largest — not to discourage, but to show which levers are worth pulling.",
          `Your primary limiter — ${focusArea} — is the area where that gap tends to be widest. The data isn't flattering, but it is actionable.`,
        ],
        bullets: [
          "Zone 2 volume per week: Serious amateurs 45–55% of hours · World Tour riders 75–80%",
          "Genuinely hard sessions/week: Amateurs often 3–5 · World Tour 2–3 (the rest is genuinely easy)",
          "Recovery weeks: Amateurs often skip or delay · World Tour mandatory every 3–4 weeks, always",
          "Sleep per night: Amateurs average 6.5–7 hrs · World Tour 9–10 hrs including afternoon nap",
          "In-ride carb intake: Amateurs 20–40g/hr · World Tour 90–120g/hr (gut-trained over years)",
          "Dedicated strength sessions: Amateurs 0–1/week · World Tour 2–3 sport-specific S&C sessions",
          "FTP re-tests per year: Amateurs 0–1 · World Tour every 4–6 weeks to keep zones accurate",
        ],
      };
    }

    case "session_protocols": {
      const categoryKey = primary?.key ?? "";
      let sessions: string[];

      if (def.toolSlug === "ftp_zones") {
        switch (categoryKey) {
          case "cat_4plus":
            sessions = [
              "Over-under: 2×15 min alternating 4 min at 92% FTP / 1 min at 107% FTP. 5 min full recovery between reps. The session that sharpens threshold without wrecking your week.",
              "VO2 Max: 6×4 min at 108–112% FTP. 3 min recovery. If rep 6 is materially harder than rep 1 at the same wattage, you went 2% too hard.",
              "Long ride quality block: 3–4 hr Z2 with 3×10 min at threshold in the last 45 min of the ride.",
              "Strength (weekly): Bulgarian split squat 3×8 each leg · Hip thrust 3×10 · Copenhagen plank 3×20s · Box step-up 3×10 each.",
            ];
            break;
          case "cat_3":
            sessions = [
              "Threshold: 2×20 min at 96–100% FTP. 5 min recovery between reps. The single most effective session in structured amateur cycling — keep it honest.",
              "VO2 Max: 5×4 min at 108–112% FTP. 3 min recovery. Stop at 4 clean reps if RPE on rep 5 would be 10 — 4 good reps beats 5 ugly ones.",
              "Strength (weekly): Back squat 3×6 · Romanian deadlift 3×8 · Single-leg press 3×10 · Core 3×30s.",
            ];
            break;
          default:
            sessions = [
              "Threshold: 2×20 min at 95–100% FTP. Can't hold it? Drop to 3×15 or 4×10 — total time at threshold matters more than rep shape.",
              "VO2 Max: 5×3 min at 107–110% FTP. 3 min full recovery. Build to 5×4 min over 4 weeks.",
              "Long ride: 2.5–4 hr, genuinely easy. No pushing on climbs. If you finish tired, it was too hard.",
              "Strength (weekly): Goblet squat 3×10 · Deadlift 3×8 · Single-leg deadlift 3×8 · Plank 3×45s.",
            ];
        }
      } else {
        // Plateau tool — sessions match the primary limiter
        switch (categoryKey) {
          case "underRecovered":
            sessions = [
              "Recovery spin: 30–40 min at 55–65% FTP. This is the hard one — genuinely not a workout. Your brain will want to push. Don't.",
              "Zone 2 base: 60–90 min at 65–75% FTP. Conversational pace — you should be able to say a full sentence without pausing.",
              "Strength (once rested): Bodyweight only for week 1 — squat 3×10, RDL 3×10, core 3×30s. Add load from week 2 onward.",
              "What to skip for 7 days: all intervals, all threshold work, all racing. One recovery week costs nothing; persistent under-recovery costs months.",
            ];
            break;
          case "polarisation":
            sessions = [
              "Threshold session: 2×20 at 96–100% FTP. 5 min recovery. This is your 'hard' day. Nothing goes harder than this.",
              "VO2 session: 5×4 min at 108–112% FTP. 3 min recovery. Two hard days per week maximum — this is your second one.",
              "Zone 2 (everything else): 65–75% FTP. Conversational. If you're on a group ride and can't hold a conversation, you're in the grey zone.",
              "Strength (twice weekly, 30 min): Squat 3×8 · Deadlift 3×8 · Single-leg work 3×8 each · Core 3×30s.",
            ];
            break;
          case "strengthGap":
            sessions = [
              "Strength A (start of week): Back squat 3×6–8 · Romanian deadlift 3×8 · Bulgarian split squat 3×8 each · Hip thrust 3×10.",
              "Strength B (mid-week): Single-leg deadlift 3×8 each · Step-up 3×10 each · Copenhagen plank 3×20s · Hanging core 3×10.",
              "Late-ride quality block: Build to 15 min tempo in the last 30 min of your long ride. Progress over 4 weeks.",
              "What to maintain: Two threshold or VO2 sessions per week. Strength doesn't replace bike quality work — it adds to it.",
            ];
            break;
          default: // fuelingDeficit
            sessions = [
              "Fuelling rehearsal ride: 90–120 min with full target carb intake from min 15. Treat this as a test session — finding GI issues in training beats finding them on race day.",
              "Threshold with fuelling: 2×20 FTP session, but eat 30–40g carbs in the 20 min before the first rep. RPE will drop. That's the point.",
              "Long ride with nutrition protocol: 3+ hr ride, target carb rate the entire time. Bring more fuel than you think you need.",
              "Post-ride window: 30g carbs + 15g protein within 30 min of every session, even easy ones. Track this for 14 days.",
            ];
        }
      }

      return {
        kind: "session_protocols",
        title: section.title ?? "The Key Sessions — Written Out",
        paragraphs: [
          "These are the sessions that move the metrics. Everything else is Zone 2 or recovery. Don't add more hard sessions — run these ones correctly.",
        ],
        bullets: sessions,
      };
    }

    case "ranked_actions": {
      const toolSlug = def.toolSlug;
      const categoryKey = primary?.key ?? "";
      let actions: string[];

      if (toolSlug === "fuelling") {
        switch (categoryKey) {
          case "high_carb":
            actions = [
              "1. Switch to dual-source fuel immediately on all rides over 60 min — glucose + fructose blend (2:1 ratio). Single-source glucose caps at 60g/hr; your target needs more.",
              "2. Gut-train your way up — add 10g/hr per week over 4 weeks. Don't jump straight to race-day intake and wonder why your gut rebels.",
              "3. Set a 15-min alarm and eat on the alert from minute 15, not when you feel hungry. Front-loading is how you avoid the bonk, not gel at hour two.",
            ];
            break;
          case "mid_carb":
            actions = [
              "1. Set a 20-min alarm from the start of every ride — eat at every ring without exception. Consistency beats peak intake.",
              "2. Mix fuel formats every hour: gel + chew + solid reduces flavour fatigue and makes hitting the number easier.",
              "3. Test your full fuelling plan on your next ride over 90 min. Don't find out on race day that your gut can't handle the rate.",
            ];
            break;
          default: // low_carb
            actions = [
              "1. Start fuelling at 30 min on every ride over 45 min — don't wait until you feel hungry. By then you're already behind.",
              "2. Add a small carb source even on Zone 2 days. Glycogen depletes at easy pace too; arriving at hard sessions already half-empty is how they underperform.",
              "3. On hot days, increase your target by 20–30% — heat raises utilisation rate and shifts the demand curve upward.",
            ];
        }
      } else if (toolSlug === "ftp_zones") {
        switch (categoryKey) {
          case "cat_4plus":
            actions = [
              "1. Run over-unders this week: 2×15 min alternating 4 min at 92% / 1 min at 107% FTP. This is the session that sharpens the edge at your level.",
              "2. Schedule your FTP re-test for 8 weeks from now and don't re-test sooner — gains at 4.0+ W/kg take 6–8 weeks to consolidate.",
              "3. Audit your last four rides' average power. Replace any that were in the grey zone (76–88% FTP) with genuine Z2 — at your level, grey-zone drift eats the freshness quality sessions need.",
            ];
            break;
          case "cat_3":
            actions = [
              "1. Run 2×20 threshold next Tuesday. Target 96–98% FTP — not harder. This single session, done correctly twice a week, drives most Cat 3 FTP gains.",
              "2. Add one VO2 session per week: 5×4 min at 108–112% FTP. Pairs with threshold for the complete stimulus.",
              "3. Replace grey-zone rides with either genuine Z2 (under 75% FTP) or scheduled rest. The grey zone is where Cat 3 riders plateau and stay.",
            ];
            break;
          case "cat_4":
            actions = [
              "1. Run 2×20 threshold this week and protect it from work and life. This is the highest-leverage session at 3.0–3.5 W/kg.",
              "2. Build Z2 volume to 80% of your weekly hours. If you're training 8 hrs/week, 6.4 hrs should be at under 75% FTP — not 4.",
              "3. Fuel every session over 60 min. Under-fuelling suppresses FTP gains; it is the most-missed lever at your power level.",
            ];
            break;
          default: // beginner
            actions = [
              "1. Start with 3×15 threshold this week — more achievable than 2×20. Set a wattage target, hit it, feel what that feels like.",
              "2. Get your weekly hours consistent: same 4–6 hours, same days, every week for 4 consecutive weeks. Consistency is the prerequisite for everything else.",
              "3. Add one 20-min strength session this week: goblet squat, deadlift, core. Off-bike power is real and most building riders leave it entirely untouched.",
            ];
        }
      } else {
        // Plateau tool
        switch (categoryKey) {
          case "underRecovered":
            actions = [
              "1. Pull back for 7 days starting today. Zone 1/2 only, no intervals, no racing. Seven easy days won't lose you fitness — they'll let the last six weeks of training show up.",
              "2. Set a consistent sleep window tonight — same bedtime, same wake time, 8+ hours. Sleep is when FTP actually improves. No supplement or training tweak comes close.",
              "3. Re-test FTP at the end of week 4 only — not sooner. The recovery period is part of the training. Testing too early gives you a false floor.",
            ];
            break;
          case "polarisation":
            actions = [
              "1. This week: cap 80% of all sessions at genuine Zone 2 (under 75% FTP). Your easy rides need to get easier, not just your hard rides get harder.",
              "2. Run two quality sessions this week — one threshold (2×20) and one VO2 (5×4 min). These are your hard days. Protect them from drifting into grey zone.",
              "3. Audit your last four rides' average power. Any ride in the 76–88% FTP band was a grey-zone ride. Replace those with Z2.",
            ];
            break;
          case "strengthGap":
            actions = [
              "1. Add two 30-min strength sessions this week. Back squat, Romanian deadlift, single-leg work, core. This is where your missing watts are.",
              "2. End your next long ride with a 15-min quality block: 10 min tempo + 5 min at threshold. This trains durability — holding power when already fatigued.",
              "3. Add hip and core work twice a week, 10 min each time. Power at the pedal is limited by hip stability. This gap is invisible until you address it.",
            ];
            break;
          default: // fuelingDeficit
            actions = [
              "1. Set a 15-min alarm for every ride over 60 min and eat at every alert from minute 15 onward. This one habit change shows up in power numbers within two weeks.",
              "2. Target 60–90g carbs/hr on all rides over 90 min. Track the grams for 14 days so you know what hitting the target actually looks like.",
              "3. Add a 30g carb snack within 30 min of finishing every session — even easy ones. Glycogen replenishment is fastest here. Don't skip because you're not hungry.",
            ];
        }
      }

      return {
        kind: "ranked_actions",
        title: section.title ?? "3 Ranked Actions — Start Here",
        paragraphs: [
          "Three actions. In order of leverage. Do them in this sequence — they're ranked by how quickly they move the number and how well they embed.",
        ],
        bullets: actions,
      };
    }

    case "three_window_fuelling": {
      const carbTarget = Number(answers.carbsPerHour ?? 75);
      const fluidTarget = Number(answers.fluidPerHour ?? 600);
      return {
        kind: "three_window_fuelling",
        title: section.title ?? "The 3-Window Fuelling System",
        paragraphs: [
          "Missing one window undermines the others. Most riders nail the during part and ignore before and after — that's why they're always digging out of a hole in the first 30 minutes.",
        ],
        bullets: [
          "Window 1 — Pre-ride (3–4 hours out): 4–6g carbs/kg body weight. Real food: oats, rice, toast, banana. Nothing new on race day.",
          "Window 1 (1 hour out): 30–60g fast carbs. A gel + drink or a bar. Small and consistent — don't skip this.",
          `Window 2 — During: Your target is ${carbTarget}g carbs/hr from minute 15. Set a timer and eat on the alarm, not on hunger.`,
          `Window 2 (fluids): ${fluidTarget}ml/hr as a guide — adjust for heat and sweat rate. Clear to pale yellow urine = well-hydrated.`,
          "Window 3 — Within 30 min of finishing: 1–1.2g carbs/kg + 0.3g protein/kg. Glycogen replenishment is fastest here. Don't skip because you're not hungry.",
          "Window 3 (24 hours after): Don't under-eat. The ride is done but adaptation is happening. Eat normally, sleep well.",
        ],
      };
    }

    case "body_composition":
      return {
        kind: "body_composition",
        title: section.title ?? "Race Weight — The Real Numbers",
        paragraphs: [
          "W/kg is the only power metric that matters on a climb. A 5% reduction in body weight at the same FTP is roughly equivalent to a 5% FTP increase — but they require completely different approaches.",
          "The route to race weight is periodised nutrition, not caloric restriction. Under-fuelling to lose weight suppresses FTP — you end up lighter but slower. The sustainable path is eating to train hard, then adjusting slightly in base phase when intensity is low.",
        ],
        bullets: [
          "Calculate your W/kg: FTP (watts) ÷ bodyweight (kg). Below 3.0 is building; 3.5+ is strong amateur; 4.0+ is competitive at national level.",
          "Race weight target: current weight minus 5–8% maximum — and only if medically appropriate.",
          "Never cut more than 300–500 kcal below daily maintenance. Below that threshold, power output drops before body fat does.",
          "Red flag: if FTP drops as weight drops, you are eating too little. Stop and re-feed for two weeks.",
          "Timing: body composition changes happen in base phase. Never restrict calories in build, peak, or during a race block.",
          "Track weekly averages, not daily numbers. Weight fluctuates 1–2 kg day-to-day from hydration and glycogen alone.",
        ],
      };

    case "meal_plan_7day": {
      const carbTarget = Number(answers.carbsPerHour ?? 75);
      const isHighCarb = carbTarget >= 90;
      return {
        kind: "meal_plan_7day",
        title: section.title ?? "7-Day Eating Template",
        paragraphs: [
          "This is a shape, not a prescription. Use it as a template for a normal training week — adjust portions up on big days, slightly down on rest days. Consistency over perfection.",
        ],
        bullets: [
          "Hard training day: Breakfast 3–4g carbs/kg · Mid-morning snack 30g carbs · Lunch carb-dense (rice/pasta/potato) · Pre-session 30–60g carbs · Post-session within 30 min: 1g carbs/kg + 0.3g protein/kg · Dinner: normal balanced plate.",
          "Zone 2 day: Normal balanced meals · No need to carb-load · Protein target: 1.6–2.0g/kg body weight spread across 4 meals · Keep sodium up if sweating in heat.",
          "Rest day: Reduce carbs 20–30% vs hard days · Keep protein the same (repair continues overnight) · Focus on anti-inflammatory foods: oily fish, leafy greens, berries · Don't under-eat — adaptation happens here.",
          "Long ride day: Large carb-heavy breakfast 3 hrs before · Intra-ride at your target rate from min 15 · Post-ride: biggest carb meal of the week within 30 min + normal dinner · Go to bed well-fuelled.",
          "Pre-race day: No new foods · Familiar carb sources only · Dinner: moderate carbs, not excessive · Don't over-eat — gut discomfort the next morning is worse than being 2% under on carbs.",
          `Key daily totals: ${isHighCarb ? "8–10" : "6–10"}g carbs/kg on hard days · 4–6g on moderate days · 2–4g on rest days · Protein: 1.6–2.0g/kg every day.`,
        ],
      };
    }

    case "ftp_5reasons": {
      const categoryKey = primary?.key ?? "";
      const focusReason = (() => {
        switch (categoryKey) {
          case "cat_4plus": return "At your level, Reason 1 (stale zones) is the most common silent limiter — advanced riders drift furthest from accurate zones over a season without noticing.";
          case "cat_3": return "At 3.5–4.0 W/kg, Reason 2 (grey-zone trap) is the most common cause of the plateau. The middle ground is where Cat 3 riders live, train, and stall.";
          case "cat_4": return "At 3.0–3.5 W/kg, Reason 4 (under-fuelling) is frequently the missing link — the most under-diagnosed limiter in the amateur field.";
          default: return "For building riders, Reason 5 (skipping recovery weeks) is the most common brake on progress. Adaptation compounds only when recovery is protected.";
        }
      })();
      return {
        kind: "ftp_5reasons",
        title: section.title ?? "5 Fixable Reasons Your FTP Is Stuck",
        paragraphs: [
          "FTP plateaus are almost never random. They have the same five causes, they run in the same order of likelihood, and they're all fixable in under 12 weeks.",
          focusReason,
        ],
        bullets: [
          "1. Stale zones — Training to zones that are 3–6 months old makes every session wrong. If your last FTP test was more than 12 weeks ago, your zones are stale. Re-test now.",
          "2. Grey-zone trap — If 50%+ of your sessions sit at 75–88% FTP, you're neither recovering well nor adapting fast. Too hard to be easy, not hard enough to drive threshold. The fix: hard sessions harder, easy sessions genuinely easy.",
          "3. No strength work — Cyclists who add two properly-dosed S&C sessions per week see 3–7% FTP gains in 12 weeks. Squat and deadlift give neuromuscular recruitment the bike can't.",
          "4. Under-fuelling — FTP cannot increase in a caloric deficit. Carb restriction + high intensity = cortisol spike + suppressed adaptation. If you're restricting food and wondering why FTP is flat, here's your answer.",
          "5. Skipping recovery weeks — Week 4 must be easy (30–40% volume reduction). The adaptation from the previous three weeks consolidates here. A 4th hard week on top of three already-hard weeks doesn't add fitness — it stalls it.",
        ],
      };
    }

    case "ftp_6week_plan": {
      const categoryKey = primary?.key ?? "";
      const ftpValue = Number(answers.ftp ?? 0);
      const planBullets = (() => {
        switch (categoryKey) {
          case "cat_4plus":
            return [
              "Week 1–2 (Specificity): Over-unders 2×15 min (4 min at 92% / 1 min at 107%) · VO2 6×3 min at 110% · 3 Zone 2 rides",
              "Week 3–4 (Load): Over-unders 3×12 min · VO2 6×4 min at 110% · 1 race-pace effort (20 min at 98%) · 3 Zone 2",
              "Week 5 (Peak): 2×30 min at 97% FTP · VO2 5×5 min at 109% · 3 Zone 2 rides",
              "Week 6 (Test): Volume −35% · One quality session (3×15 at threshold) · FTP test Thursday or Friday",
            ];
          case "cat_3":
            return [
              "Week 1–2 (Foundation): 2×20 min at 96–100% FTP · VO2 5×4 min at 108–112% · 3 Zone 2 rides",
              "Week 3–4 (Build): 3×20 min at 97% FTP · VO2 5×4 min at 110% · 3 Zone 2 rides",
              "Week 5 (Peak): 2×30 min at 97% · VO2 5×5 min at 108% · 3 Zone 2 rides",
              "Week 6 (Test): Volume −30% · 3×15 at threshold · FTP test at end of week",
            ];
          case "cat_4":
            return [
              "Week 1–2 (Foundation): 2×20 at 95–98% FTP · 5×3 min VO2 at 107% · 3 Zone 2 rides",
              "Week 3–4 (Build): 3×15 at 97% FTP · 5×4 min VO2 at 108% · 3 Zone 2 rides",
              "Week 5 (Peak): 2×25 at 97% · 5×4 VO2 at 108% · 3 Zone 2 rides",
              "Week 6 (Test): Volume −30% · 2×20 at threshold · FTP test at end of week",
            ];
          default:
            return [
              "Week 1–2 (Foundation): 3×15 min at 93–96% FTP · 5×3 min at 106% · 3 Zone 2 rides",
              "Week 3–4 (Build): 2×20 min at 95% FTP · 5×3 min VO2 at 107% · 3 Zone 2 rides",
              "Week 5 (Peak): 2×20 min at 96% · 5×4 min VO2 at 107% · 3 Zone 2 rides",
              "Week 6 (Test): Volume −30% · 1×20 threshold · FTP test",
            ];
        }
      })();
      return {
        kind: "ftp_6week_plan",
        title: section.title ?? "6-Week FTP Builder",
        paragraphs: [
          `Six weeks, two quality sessions per week, everything else Zone 2. Wattage targets come from your current zones${ftpValue > 0 ? ` (FTP: ${ftpValue}W)` : ""}. Don't go harder than prescribed — the plan is calibrated, and going harder in week 1 means collapsing in week 4.`,
        ],
        bullets: planBullets,
      };
    }

    case "ftp_trajectory": {
      const categoryKey = primary?.key ?? "";
      const ftpValue = Number(answers.ftp ?? 0);
      const wkg = Number(answers.wkg ?? 0);
      const [gainLow, gainHigh] = (() => {
        switch (categoryKey) {
          case "cat_4plus": return [1, 3];
          case "cat_3": return [2, 4];
          case "cat_4": return [3, 7];
          default: return [6, 10];
        }
      })();
      const wattsLow = ftpValue > 0 ? Math.round(ftpValue * gainLow / 100) : null;
      const wattsHigh = ftpValue > 0 ? Math.round(ftpValue * gainHigh / 100) : null;
      const projectedWkgHigh = wkg > 0 ? (wkg * (1 + gainHigh / 100)).toFixed(2) : null;
      return {
        kind: "ftp_trajectory",
        title: section.title ?? "What 6 Weeks Buys You",
        paragraphs: [
          `Based on structured 6-week block outcomes in trained amateurs at your level: expected FTP gain of ${gainLow}–${gainHigh}%${ftpValue > 0 && wattsLow !== null && wattsHigh !== null ? ` (${wattsLow}–${wattsHigh}W at your current ${ftpValue}W FTP)` : ""}.`,
          "This assumes: two quality sessions per week at the prescribed intensity, Zone 2 for everything else, sleep protected, and fuelling at target rates on all rides over 60 minutes. Remove any one of these and the gain shrinks.",
        ],
        bullets: [
          "Week 4 is the first checkpoint — if RPE at the same wattage has dropped, adaptation is happening.",
          "Typical week 6 re-test result: most riders in a clean block hit the high end of the projected range.",
          `Projected outcome${ftpValue > 0 && wattsHigh !== null ? `: FTP ${ftpValue}W → ${ftpValue + wattsHigh}W` : ""}${wkg > 0 && projectedWkgHigh ? ` · W/kg to ${projectedWkgHigh}` : ""}.`,
          "What breaks the trajectory: skipped week for travel (pull sessions, don't skip entirely) · illness week (treat as recovery week, restart block) · poor sleep week (reduce intensity 10%, don't skip).",
          "Re-test protocol: 20-min max effort, or 8-min test × 0.9. Always well-rested, always after a recovery week.",
        ],
      };
    }

    case "not_done_yet_cta":
      return {
        kind: "not_done_yet_cta",
        title: section.title ?? "Take This Further — Not Done Yet",
        paragraphs: [
          "This report gives you the diagnosis and the plan. Not Done Yet gives you the implementation — Anthony on a weekly live coaching call, a training plan built backwards from your event, and 113 serious amateur cyclists solving the same problems.",
          "$195/month. 7-day free trial. Cancel anytime. roadmancycling.com/apply",
        ],
        bullets: [
          "Weekly live coaching call with Anthony Walsh — bring your numbers, your questions, this report",
          "Vekta-powered training plan built for your specific goal, event date, and available weekly hours",
          "Private community of 113+ serious amateurs — not beginners, not a ghost town",
          "Monthly masterclasses with World Tour coaches and sports scientists (Dan Lorang, Prof. Seiler, and others)",
          "Ask Roadman AI pre-loaded with your report result — use it between calls",
        ],
      };

    case "roadmap_90day":
      return {
        kind: "roadmap_90day",
        title: section.title ?? "Your 90-Day Performance Roadmap",
        paragraphs: [
          "This is how the three reports compound. Fuelling and FTP work run in parallel — they amplify each other. The plateau fix is the prerequisite: until the primary limiter is addressed, the other two won't deliver their full return.",
          "Three 30-day phases. Each builds on the last. Week 12 is where you re-test everything and measure the delta.",
        ],
        bullets: [
          "Phase 1 — Month 1 (Restore): Address your primary limiter first. Fuelling targets active from day 1. FTP zones updated and stable. No new intensity until the foundation is set.",
          "Phase 2 — Month 2 (Build): Two quality sessions per week at the correct wattage targets. Fuelling at target rate on every ride over 60 min. First strength session added.",
          "Phase 3 — Month 3 (Peak): Specificity. Sessions approach event demands. Fuelling rehearsal on every long ride. Second strength session added. Re-test FTP at week 10.",
          "Weekly rhythm: Tuesday quality · Thursday quality · Saturday long ride · Sunday easy or rest. This shape, every week.",
          "The check: if week 4 feels harder than weeks 1–3 at the same power, you accumulated fatigue. Drop intensity 15% in week 4, not volume.",
          "90-day goal: measurable W/kg gain + consistent fuelling practice embedded + FTP re-test result higher than your entry number.",
        ],
      };

    default:
      return null;
  }
}

export function buildReportContent(
  def: DiagnosticDefinition,
  toolResult: ToolResult,
  opts: { productName: string; riderFirstName: string | null; riskFlags?: string[] },
): ReportContent {
  const answers = {
    ...toolResult.inputs,
    ...toolResult.outputs,
  } as Record<string, unknown>;

  const primary = pickCategory(def, toolResult.primaryResult);
  // Secondary only meaningful for plateau today; other tools leave it null.
  const secondaryKey = (toolResult.outputs as Record<string, unknown>)
    .secondaryCategory;
  const secondary = pickCategory(
    def,
    typeof secondaryKey === "string" ? secondaryKey : null,
  );

  const sections: RenderedSection[] = [];
  for (const section of def.reportSections) {
    const rendered = renderSection(section, def, primary, secondary, answers);
    if (rendered) sections.push(rendered);
  }

  return {
    riderFirstName: opts.riderFirstName,
    productName: opts.productName,
    toolTitle: def.title,
    summary: toolResult.summary,
    primaryCategory: primary,
    secondaryCategory: secondary,
    riskFlags: opts.riskFlags ?? [],
    sections,
    disclaimer: def.disclaimer,
    generatedAt: new Date(),
  };
}

/**
 * Section list for bundle purchases. Combines all three tools' value-stack
 * sections plus the 90-day performance roadmap. Uses whatever tool result
 * the buyer had at checkout for personalisation; fallback copy covers the rest.
 */
export const BUNDLE_REPORT_SECTIONS: ReportSection[] = [
  { kind: "cover" },
  { kind: "summary" },
  { kind: "primary_limiter" },
  { kind: "secondary_limiter" },
  { kind: "world_tour_comparison" },
  { kind: "zones_plan" },
  { kind: "next_12_weeks" },
  { kind: "session_protocols" },
  { kind: "week_by_week" },
  { kind: "three_window_fuelling" },
  { kind: "fuelling_plan" },
  { kind: "body_composition" },
  { kind: "ftp_5reasons" },
  { kind: "ftp_6week_plan" },
  { kind: "ftp_trajectory" },
  { kind: "ranked_actions" },
  { kind: "recovery_plan" },
  { kind: "risk_addendum" },
  { kind: "roadmap_90day" },
  { kind: "ask_roadman" },
  { kind: "not_done_yet_cta" },
  { kind: "disclaimer" },
];
