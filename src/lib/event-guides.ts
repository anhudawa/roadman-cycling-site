/**
 * Event-specific training cluster pages: /event/[slug]
 *
 * The /plan/[event]/[weeksOut] grid covers the week-by-week training
 * framework. The /event/[slug] pages sit one level above that — a
 * comprehensive event guide that explains what the event actually
 * demands (climbing breakdown, finish-time bands, FTP requirement)
 * and links riders into the right weeks-out plan from there.
 *
 * The slug ends in "-training-plan" because that's the keyword
 * cluster these pages target. Each guide is a content hub for
 * the event: ride-style explainer + a router into the planning grid.
 */

import { getEvent, type TrainingEvent } from "./training-plans";
import { getRaceBySlug, type Race } from "@/data/races";

export interface EventClimb {
  name: string;
  lengthKm: number;
  avgGradient: number;
  /** Optional maximum gradient pitch on the climb. */
  maxGradient?: number;
  elevationGainM: number;
  /** Where it sits in the ride, e.g. "km 35" or "second half". */
  positionInRide?: string;
  /** Short tactical note — what makes the climb hard or different. */
  notes: string;
}

export interface FinishTimeBand {
  /** Audience-facing label, e.g. "First-time finisher". */
  level: string;
  /** Time range, e.g. "10-12 hours". */
  range: string;
  /** Fitness profile that lands in this band. */
  fitnessProfile: string;
}

export interface FtpRequirement {
  /** "Just to finish" floor, in W/kg. */
  minimum: string;
  /** Competitive / strong-finisher level, in W/kg. */
  competitive: string;
  /** Why these numbers matter for this specific event. */
  notes: string;
}

export interface CommonMistakeDetail {
  mistake: string;
  fix: string;
}

export interface EventGuide {
  /** Full URL slug — e.g. "wicklow-200-training-plan". */
  slug: string;
  /** Slug of the corresponding TrainingEvent (drives the /plan link). */
  trainingEventSlug: string;
  /** Slug of the corresponding Race in /data/races.ts (optional). */
  raceSlug?: string;
  /** Direct predictor_slug if one exists for /predict pre-selection. */
  predictorSlug?: string;
  /** Short SEO-friendly H1 title, e.g. "Wicklow 200 Training Plan". */
  pageTitle: string;
  /** One-sentence intent the page is built around. */
  intent: string;

  /** 1-2 sentences describing typical weather conditions. */
  weatherConditions: string;
  /** 1-2 sentences describing the terrain shape. */
  terrainSummary: string;

  ftpRequirement: FtpRequirement;
  /** Hours/week + long-ride targets to be ready for the event. */
  enduranceDemands: string;

  /** Overview paragraph on the climbing demands of the day. */
  climbingNarrative: string;
  majorClimbs: EventClimb[];

  finishTimes: FinishTimeBand[];

  /** Expanded fuelling section — beyond the short nutritionAngle on TrainingEvent. */
  fuellingDeepDive: string;
  /** Expanded pacing section — beyond the short pacingStrategy on TrainingEvent. */
  pacingDeepDive: string;
  /** Common mistakes with explicit fixes — pairs each problem with the move. */
  detailedMistakes: CommonMistakeDetail[];
}

/* ============================================================ */
/* Guides                                                       */
/* ============================================================ */

export const EVENT_GUIDES: EventGuide[] = [
  {
    slug: "wicklow-200-training-plan",
    trainingEventSlug: "wicklow-200",
    raceSlug: "wicklow-200",
    pageTitle: "Wicklow 200 Training Plan",
    intent:
      "Help Irish riders show up to the Wicklow 200 in early June fit enough to enjoy it, with a clear plan for every weeks-out window.",
    weatherConditions:
      "Early June in Wicklow is genuinely unpredictable. Expect anything from 22°C and dry to 8°C and horizontal rain on Sally Gap, sometimes inside the same hour. Wind off the Irish Sea adds 5-8 bpm of cardiac drift on the exposed sections.",
    terrainSummary:
      "Five named climbs stitched together by long, undulating valley roads. None of the climbs are vertical-wall steep — the difficulty comes from doing all of them inside one 200km day with weather that punishes underdressed riders.",
    ftpRequirement: {
      minimum: "2.8 W/kg",
      competitive: "3.6 W/kg",
      notes:
        "Wicklow rewards endurance more than threshold. A rider holding 2.8 W/kg for 8+ hours will finish comfortably; pushing 3.6 W/kg lets you sit in the front group on Sally Gap and the Shay Elliott without burning matches.",
    },
    enduranceDemands:
      "Eight to twelve hours a week of structured riding for at least 12 weeks out, with a long ride that has built up to 5-6 hours over rolling terrain. You need to have eaten and ridden through the back-half fatigue at least three times before race day.",
    climbingNarrative:
      "Around 3,000m of vertical across 200km — that's an average of 15m/km, which sounds modest until you do it under June drizzle with a tailwind that turns into a headwind. Pacing is everything: the climbs come in clusters, and the gap between Sally Gap and the Shay Elliott is where most riders crack.",
    majorClimbs: [
      {
        name: "Sally Gap",
        lengthKm: 9.2,
        avgGradient: 5.4,
        elevationGainM: 493,
        positionInRide: "km 35",
        notes:
          "The opener. Long drag rather than steep, but the pack surge over the top is where amateurs blow up.",
      },
      {
        name: "Wicklow Gap",
        lengthKm: 11,
        avgGradient: 4.3,
        elevationGainM: 474,
        positionInRide: "km 70",
        notes:
          "Steady aerobic effort. Save matches here — the second half of the day is where the route bites.",
      },
      {
        name: "Shay Elliott Memorial Climb",
        lengthKm: 7.6,
        avgGradient: 5.9,
        maxGradient: 12,
        elevationGainM: 525,
        positionInRide: "km 130",
        notes:
          "The crux. Comes after the Wicklow Gap, sustained 6-8% on the hard side. Pace it sub-threshold or you walk the back half.",
      },
      {
        name: "Slieve Mann",
        lengthKm: 4.5,
        avgGradient: 6.5,
        elevationGainM: 290,
        positionInRide: "km 165",
        notes:
          "Short, sharp punch with the day already in your legs. Misjudge the gear and your cadence collapses.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "10-12 hours",
        fitnessProfile:
          "FTP 2.5-3.0 W/kg, 6-8 hours of riding per week, longest ride 4 hours.",
      },
      {
        level: "Average enthusiast",
        range: "8-10 hours",
        fitnessProfile:
          "FTP 3.0-3.5 W/kg, 8-10 hours per week, longest ride 5 hours.",
      },
      {
        level: "Strong amateur",
        range: "7-8 hours",
        fitnessProfile:
          "FTP 3.5-4.2 W/kg, 10-14 hours per week, regular 6-hour rides with structured intervals.",
      },
      {
        level: "Elite amateur / racer",
        range: "6-7 hours",
        fitnessProfile:
          "FTP 4.2+ W/kg, 12-18 hours per week, group-ride threshold work, racing background.",
      },
    ],
    fuellingDeepDive:
      "200km in Wicklow is a fuelling test more than a fitness test for most riders. Target 80-100g of carbohydrate per hour on the bike — that's two gels plus a bar each hour, or a 90g/hour drink mix paired with one solid item every 90 minutes. Start eating inside the first 45 minutes; do not wait until you feel hungry. The official feed zone around the 140km mark is a strategic checkpoint, not a recovery break — refill bottles, top up your jersey, and roll out within 15-20 minutes. Cold and wet weather doubles the gut shutdown risk on the back half: rehearse your fuelling plan on at least three long training rides in similar conditions.",
    pacingDeepDive:
      "Treat it as two 100km rides stitched together. On Sally Gap (the first big climb), target heart rate 5-8 beats below your sportive threshold — if you're already at threshold here you've paced wrong. Through the middle 80km, control your power on the rises and take the descents at a measured pace; this is where overcooking the legs costs you the back half. The Shay Elliott at km 130 is the day's lottery: ride it sub-threshold, sit on a wheel if you can find one, and accept the climb is going to be slower than your fresh-leg PR. From km 160 onwards, finishing strongly is a fuelling and pacing problem — riders who arrive at this point still able to push tempo will overtake dozens.",
    detailedMistakes: [
      {
        mistake: "Going too hard in the first 50km in a pack surge",
        fix: "Sit at your goal heart rate even if the lead group is gone. The Wicklow start always launches faster than its finish — riders who chase that early pace are the same ones walking on Slieve Mann.",
      },
      {
        mistake: "Underfuelling on Sally Gap because it's 'only' the first big climb",
        fix: "Eat on the climb. The hour after Sally Gap is where you bank the carbs that get you through the Shay Elliott — skip it and you bonk three hours later, not now.",
      },
      {
        mistake: "Packing light because it's June in Ireland",
        fix: "Rain cape in the jersey pocket, gilet on the back, full-finger gloves stashed. Wicklow weather punishes the optimistic — a 20g rain jacket has saved more 200s than any aero gain ever did.",
      },
    ],
  },
  {
    slug: "mallorca-312-training-plan",
    trainingEventSlug: "mallorca-312",
    raceSlug: "mallorca-312",
    predictorSlug: "mallorca-312",
    pageTitle: "Mallorca 312 Training Plan",
    intent:
      "Help spring-cycling riders prepare for the Mallorca 312 — 312km of distance plus 5,000m of climbing in late April heat.",
    weatherConditions:
      "Late April Mallorca starts cold (8-12°C in the Tramuntana before sunrise) and finishes hot (25-30°C on the Pla central plain after midday). The temperature swing across one ride is the kit problem most first-timers underestimate.",
    terrainSummary:
      "Three distinct sections: a mountainous opening 100km through the Tramuntana, a long flat-rolling middle section across the Pla, and a finishing loop that varies year to year. Some editions include Sa Calobra; others don't. Either way, you're climbing on tired legs late in the day.",
    ftpRequirement: {
      minimum: "3.0 W/kg",
      competitive: "3.8 W/kg",
      notes:
        "The 312 is a fuelling-and-pacing event before it's an FTP event. 3.0 W/kg is enough to finish if your endurance and nutrition are both dialled in. 3.8+ W/kg lets you ride in groups with intent and finish under 11 hours.",
    },
    enduranceDemands:
      "12-15 hours/week peaking at 16-20 weeks out, with at least three back-to-back weekends of 5-6 hour rides paired with 3-4 hour rides the next day. You need to have done one ride longer than 8 hours in training before April.",
    climbingNarrative:
      "Around 5,000-5,200m of climbing on the long course, depending on whether Sa Calobra is in the route. The Tramuntana climbs come stacked early — Coll de Sóller, Puig Major, Coll dels Reis (the Sa Calobra return) — and most riders are still fresh at this point. The trap is the middle section: 150km of rolling tempo where it's tempting to push the pace and easy to undereat.",
    majorClimbs: [
      {
        name: "Coll de Sóller",
        lengthKm: 7.8,
        avgGradient: 6.3,
        elevationGainM: 486,
        positionInRide: "km 35-50",
        notes:
          "Switchback warm-up climb. Pace this at high Z2 — it's a primer, not the race.",
      },
      {
        name: "Puig Major",
        lengthKm: 12.6,
        avgGradient: 6.6,
        maxGradient: 11,
        elevationGainM: 820,
        positionInRide: "km 60-75",
        notes:
          "Highest point on the island. Sustained tempo for 50+ minutes. Control your HR — a 10-watt overshoot here costs you 30 minutes at the back end.",
      },
      {
        name: "Sa Calobra (return)",
        lengthKm: 9.5,
        avgGradient: 7.0,
        maxGradient: 12,
        elevationGainM: 668,
        positionInRide: "km 95-110 (route dependent)",
        notes:
          "If the year's route includes Sa Calobra you descend ~10km to the sea, then climb ~10km back out at sustained 7%. Many riders bonk on the return because they ate going down, not up.",
      },
      {
        name: "Coll de Femenia",
        lengthKm: 7.8,
        avgGradient: 5.7,
        elevationGainM: 445,
        positionInRide: "km 130",
        notes:
          "Last sustained Tramuntana climb before the Pla. From here, the climbing is over but the day isn't.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "13-14 hours",
        fitnessProfile:
          "FTP 2.8-3.2 W/kg, 8-10 hours/week, longest ride 6-7 hours.",
      },
      {
        level: "Average enthusiast",
        range: "11-13 hours",
        fitnessProfile:
          "FTP 3.2-3.7 W/kg, 10-12 hours/week, longest ride 7-8 hours.",
      },
      {
        level: "Strong amateur",
        range: "9-11 hours",
        fitnessProfile:
          "FTP 3.7-4.2 W/kg, 12-15 hours/week, multiple 6+ hour rides, structured intervals.",
      },
      {
        level: "Elite amateur",
        range: "8-9 hours",
        fitnessProfile:
          "FTP 4.2+ W/kg, 14-18 hours/week, racing background, group-pace tempo work, gut trained to 100g+ carbs/hour.",
      },
    ],
    fuellingDeepDive:
      "10+ hours of riding makes the 312 a carbohydrate problem. Target 80g carbs/hour minimum, 100g if your gut is trained — that's roughly 32 gels' worth across the day, plus solid food at every aid station. Once the heat lands around midday, fluid demands climb to 750ml/hour with electrolytes; cold morning bottles in the Tramuntana can be 500ml/hour and feel like more. The Pollença aid station around km 80 is your 'second breakfast' moment — eat real food here, not just gels, because the Pla section that follows is a long calorie burn with no shade. Skip one aid station and the back 100km becomes a survival ride; skip two and you DNF.",
    pacingDeepDive:
      "Pace the opening 100km at 60-65% FTP maximum, even when you feel fresh. The Tramuntana climbs reward patience and punish hero rides. Through the middle section across the Pla, sit in groups — drafting saves 25-30% of your output and keeps you below threshold while still moving. The last 100km is where the field thins: riders who fuelled correctly can hold tempo, and riders who didn't are walking gradients they cruised five hours earlier. If Sa Calobra is on the route, treat the descent as a rest opportunity — eat, drink, freewheel — and the climb back as a 50-minute sub-threshold effort. No heroes.",
    detailedMistakes: [
      {
        mistake: "Picking the 312 because you've done other long sportives",
        fix: "Mallorca's combination of distance and Mediterranean heat makes it different to a Wicklow 200 or a Marmotte. Drop to the 225 or 167 if your longest training ride hasn't passed 7 hours. There's no medal for a DNF.",
      },
      {
        mistake: "Underfuelling the first 80km because the climbing starts easy",
        fix: "Start eating inside 30 minutes. The Tramuntana is where you bank the carbs for the Pla — the climbs are the easy part of fuelling because your gut is fresh and the temperature is mild.",
      },
      {
        mistake: "Forgetting Sa Calobra is a sustained climb, not a gentle return",
        fix: "If the route includes Sa Calobra, ride the descent at sub-threshold, eat both ways, and treat the return climb as a controlled 50-minute Z3 effort. Riders who attack the bottom of the return ride the top in pieces.",
      },
    ],
  },
  {
    slug: "fred-whitton-challenge-training-plan",
    trainingEventSlug: "fred-whitton-challenge",
    raceSlug: "fred-whitton",
    pageTitle: "Fred Whitton Challenge Training Plan",
    intent:
      "Help Lake District-bound riders survive the UK's hardest sportive — 180km, nine passes, and Hardknott at 33%.",
    weatherConditions:
      "Early May in Cumbria swings from 18°C and clear to driving rain at 50m visibility on the high passes. The descents off Wrynose and Hardknott are notorious in the wet — half the field has walked them at some point.",
    terrainSummary:
      "Nine Lake District passes in 180km, including the steepest paved roads in England. The first half is mountainous-but-rideable; the back half is the Wrynose-Hardknott double-pass that has ended more sportive seasons than any other stretch of road in the country.",
    ftpRequirement: {
      minimum: "3.2 W/kg",
      competitive: "4.0 W/kg",
      notes:
        "Fred Whitton is gradient-limited, not FTP-limited. 3.2 W/kg with the right gearing gets you to the finish; below that, Hardknott becomes a walk regardless of how strong you are. Above 4.0 W/kg, you can ride steady on the climbs the front group is gritting their teeth on.",
    },
    enduranceDemands:
      "10-12 hours/week with a long ride that has hit 4.5-5 hours and includes at least three sustained climbs of 20+ minutes. Hill repeats are non-negotiable — you cannot fake your way through Wrynose-Hardknott on flat-land fitness.",
    climbingNarrative:
      "Around 3,500-4,100m of climbing depending on the year's route, packed into 180km. That's nearly twice the climbing density of a Wicklow 200. The defining feature is gradient: four climbs above 10% average, with Hardknott Pass touching 33% on the steepest pitches. Gearing is the single most important kit decision you make.",
    majorClimbs: [
      {
        name: "Kirkstone Pass",
        lengthKm: 4.1,
        avgGradient: 11.1,
        elevationGainM: 454,
        positionInRide: "km 35",
        notes:
          "First serious climb. Sustained 11% — good test of whether your gearing is too tall.",
      },
      {
        name: "Honister Pass",
        lengthKm: 3.2,
        avgGradient: 11.1,
        maxGradient: 25,
        elevationGainM: 356,
        positionInRide: "km 95",
        notes:
          "Honister bites in the second half. The 25% pitch in the middle catches riders sitting in too high a gear.",
      },
      {
        name: "Wrynose Pass",
        lengthKm: 4.0,
        avgGradient: 9.8,
        maxGradient: 25,
        elevationGainM: 393,
        positionInRide: "km 145",
        notes:
          "The first half of the day's defining double. Steep pitches, narrow tarmac, and the finish line still 35km away.",
      },
      {
        name: "Hardknott Pass",
        lengthKm: 2.4,
        avgGradient: 19.8,
        maxGradient: 33,
        elevationGainM: 393,
        positionInRide: "km 150",
        notes:
          "33% on the steepest section. Walking Hardknott is not weakness — most riders have done it at least once. Right gearing turns it from a walk into a survival climb.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "10-12 hours",
        fitnessProfile:
          "FTP 2.8-3.2 W/kg, 8-10 hours/week, longest ride 4-5 hours, hill repeats prioritised.",
      },
      {
        level: "Average enthusiast",
        range: "8-10 hours",
        fitnessProfile:
          "FTP 3.2-3.7 W/kg, 10-12 hours/week, longest ride 5-6 hours with sustained climbing.",
      },
      {
        level: "Strong amateur",
        range: "6-8 hours",
        fitnessProfile:
          "FTP 3.7-4.3 W/kg, 12-14 hours/week, regular long rides in hills, structured threshold work.",
      },
      {
        level: "Elite amateur",
        range: "5-6 hours",
        fitnessProfile:
          "FTP 4.3+ W/kg, 14-18 hours/week, racing or hill-repeat background, comfortable above threshold for 30+ minutes.",
      },
    ],
    fuellingDeepDive:
      "10 hours plus 4,000m of climbing means 80-100g carbs/hour sustained — the difference-maker between finishers and DNFs. Eat at every feed zone; don't skip 'because you feel OK', because that feeling is a 60-minute window before the bonk lands. Electrolytes matter more than calories in the last 60km; the cumulative fluid loss across nine climbs is bigger than it feels in cold weather. Caffeine gel before Wrynose is a classic move — sharpens the focus you need on the descents.",
    pacingDeepDive:
      "Fred Whitton is about finishing, not racing. Heart-rate management on the first three climbs (Kirkstone, Honister, Newlands) is everything — target Z3 ceiling, never Z4. Save Zone 4 for Wrynose and Hardknott, and even there only on the steeper pitches where you have no choice. The descent off Hardknott into the last 30km is technical and will be cold; pace the run-in for survival, not heroics. The 80% who finish are the ones who held back in the first half; the 20% who DNF are the ones who didn't.",
    detailedMistakes: [
      {
        mistake: "Riding 50/34 with an 11-28 cassette and discovering 33% gradient mid-effort",
        fix: "34x34 minimum. Many finishers run a 1x setup or a 32-tooth small ring with a 36-tooth cassette. Test your gearing on a 20% local hill before you commit — if you're grinding at 50rpm there, Hardknott will end you.",
      },
      {
        mistake: "Saving yourself for Hardknott and bonking before it",
        fix: "Eat on every climb up to that point. Hardknott is at km 150 of 180 — if you've fuelled the first 140km properly, the climb is just a hard 20 minutes. If you haven't, you're walking regardless of your gearing.",
      },
      {
        mistake: "Pushing the descent after Hardknott when the legs are done",
        fix: "Brake early, sit upright, give the descent the respect tired legs and Cumbrian rain demand. The most common DNF in the Lake District is a moment of confidence on a wet descent at 7 hours in — not a bonk.",
      },
    ],
  },
  {
    slug: "ride-london-training-plan",
    trainingEventSlug: "ride-london-100",
    raceSlug: "ridelondon",
    predictorSlug: "ridelondon-classique-100",
    pageTitle: "RideLondon 100 Training Plan",
    intent:
      "Help first-time-100-mile riders nail the closed-roads RideLondon-Essex 100 in late May, with a plan that respects how pack-dominated the modern route is.",
    weatherConditions:
      "Late May London weather can be anything from 10°C and raining at the 06:30 start to 25°C and humid by midday. The closed-road format keeps wind manageable but rarely changes the temperature swing.",
    terrainSummary:
      "Since 2022 the route runs out of central London through the rolling Essex countryside and back, finishing on The Mall. There are no sustained climbs — it's a fast, pack-dominated event with short rises rather than the climber's terrain of the old Surrey route.",
    ftpRequirement: {
      minimum: "2.5 W/kg",
      competitive: "3.5 W/kg",
      notes:
        "RideLondon is one of the more accessible bucket-list 100-milers thanks to closed roads and pack riding. 2.5 W/kg with eight weeks of structured riding gets you to the finish; 3.5+ W/kg lets you race the time and pick the right packs through Essex.",
    },
    enduranceDemands:
      "6-10 hours/week for at least 12 weeks, with a long ride that has reached 4 hours over rolling terrain. Group-ride experience matters here more than at any other event in this list — you cannot fake pack-pace if your last bunch ride was years ago.",
    climbingNarrative:
      "Around 1,400m of climbing across 160km — flat by sportive standards. The challenge isn't elevation; it's the pack-pace tempo demands and the discipline of not surfing from group to group in the first 40km on closed roads.",
    majorClimbs: [
      {
        name: "Essex rises",
        lengthKm: 1.5,
        avgGradient: 4.5,
        elevationGainM: 60,
        positionInRide: "throughout",
        notes:
          "Short, repeating undulations rather than named climbs. Each one is sub-3 minutes — the day's punctuation, not the day's race.",
      },
      {
        name: "Final London approach",
        lengthKm: 0.8,
        avgGradient: 3.5,
        elevationGainM: 25,
        positionInRide: "km 145",
        notes:
          "A few short urban rises in the final approach to The Mall. By this point pack tactics matter more than gradient.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "7-9 hours",
        fitnessProfile:
          "FTP 2.2-2.7 W/kg, 5-7 hours/week, longest ride 4 hours over rolling terrain.",
      },
      {
        level: "Average enthusiast",
        range: "6-7 hours",
        fitnessProfile:
          "FTP 2.7-3.2 W/kg, 7-9 hours/week, comfortable in groups at tempo.",
      },
      {
        level: "Strong amateur",
        range: "5-6 hours",
        fitnessProfile:
          "FTP 3.2-3.8 W/kg, 9-12 hours/week, regular group rides, used to surging short efforts.",
      },
      {
        level: "Elite amateur",
        range: "4-5 hours",
        fitnessProfile:
          "FTP 3.8+ W/kg, 12-16 hours/week, racing background, sub-threshold pack riding for 4+ hours.",
      },
    ],
    fuellingDeepDive:
      "RideLondon is shorter than the rest of the events in this cluster but still demands proper fuelling. Target 60-80g carbs/hour — gels every 30-45 minutes plus a bar at km 50 and km 100. The closed-road feed zones are plentiful but often packed; carry enough that you can skip one and not pay for it. A caffeine gel at the 100km mark sharpens the focus through the urban run-in. Underhydrating is the silent issue: closed roads don't feel hot but a 6-hour ride in the sun behind a pack is dehydrating, fast.",
    pacingDeepDive:
      "Get into a pack within the first 15km and let it pull you along. Don't chase faster groups unless you can comfortably hold a wheel for 10+ minutes — the surge cost ahead of every closed-road junction will burn matches you need at the end. Ride at tempo (76-88% FTP) for long stretches; spike briefly over the short rises and recover on the descents. Save matches for the last 30km back into London, where gaps open up and a strong finisher can pick off groups that overcooked the middle. If you're racing the time, the right group through Essex is worth more than 20 watts of FTP.",
    detailedMistakes: [
      {
        mistake: "Surfing from group to group in the first 40km and burning matches",
        fix: "Pick a pack at your goal pace within the first 15km and stay in it. The bunches will sort themselves; chasing a faster pack on closed roads costs you 30 minutes at the back end for a temporary feeling of speed.",
      },
      {
        mistake: "Underhydrating because it doesn't feel hot",
        fix: "750ml/hour even if it's overcast, with electrolytes once you're past three hours. Closed-road dehydration is the most common reason riders fade between 100km and 130km.",
      },
      {
        mistake: "Treating it like a climbing sportive",
        fix: "RideLondon is a pack-speed event. Spend training on group rides, surges over short rises, and tempo intervals — not on hill repeats. Adapt the plan to what the day actually demands.",
      },
    ],
  },
  {
    slug: "etape-du-tour-training-plan",
    trainingEventSlug: "etape-du-tour",
    raceSlug: "etape-du-tour",
    predictorSlug: "etape-du-tour-2026",
    pageTitle: "Étape du Tour Training Plan",
    intent:
      "Help amateur riders prepare for the Étape du Tour — one stage of that year's Tour de France on closed roads, always mountainous, always at altitude.",
    weatherConditions:
      "July in the high Alps or Pyrenees varies from 4°C and raining at 2,000m at 09:00 to 35°C in the valleys at 15:00. The summit of an HC col can be 25°C colder than the start town. Sun intensity at altitude burns skin faster than sea-level July.",
    terrainSummary:
      "One stage of the current year's Tour de France, route varying annually. Always mountainous — typically two or three HC or Cat-1 climbs, sometimes a summit finish, sometimes a descent into the line. Distance ranges 130-180km, climbing 3,500-5,000m.",
    ftpRequirement: {
      minimum: "3.3 W/kg",
      competitive: "4.0 W/kg",
      notes:
        "The Étape is climbing-limited and altitude-limited. 3.3 W/kg gets you up the climbs at a sustainable rate and within the cut-offs; 4.0+ W/kg lets you ride the climbs on your own terms rather than the mountain's.",
    },
    enduranceDemands:
      "12-15 hours/week peaking, with a long ride that has hit 5-6 hours and includes at least two sustained climbs of 30+ minutes each. Sea-level riders should add altitude exposure in the final 2-3 weeks if logistically possible.",
    climbingNarrative:
      "4,000-4,800m of climbing across 150-180km — comparable to La Marmotte. The difference is altitude and the pro-race format. Many editions cross 2,000m, where amateurs lose 10-15% power on the steepest pitches. Cut-offs mirror the pro race; slow climbers get pulled.",
    majorClimbs: [
      {
        name: "Col du Galibier (when included)",
        lengthKm: 17.7,
        avgGradient: 5.5,
        elevationGainM: 1245,
        positionInRide: "varies — typically mid-stage",
        notes:
          "2,642m summit. 60-90 minutes of sustained climbing for amateurs. Altitude bites on the upper third — pace the climb on power, not feel.",
      },
      {
        name: "Col du Télégraphe (when included)",
        lengthKm: 11.9,
        avgGradient: 7.1,
        elevationGainM: 856,
        positionInRide: "varies — often paired with Galibier",
        notes:
          "The Télégraphe-Galibier pair is one of cycling's defining stretches. Don't burn matches on the Télégraphe — Galibier is still ahead.",
      },
      {
        name: "Alpe d'Huez (when included)",
        lengthKm: 13.8,
        avgGradient: 8.1,
        maxGradient: 13,
        elevationGainM: 1100,
        positionInRide: "summit finish",
        notes:
          "21 hairpins. The crowd, the heat, and the gradient combine — pace it on a wattage ceiling and ignore the carnage around you.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "10-12 hours",
        fitnessProfile:
          "FTP 2.8-3.2 W/kg, 10-12 hours/week, longest ride 5 hours with sustained climbing.",
      },
      {
        level: "Average enthusiast",
        range: "8-10 hours",
        fitnessProfile:
          "FTP 3.2-3.7 W/kg, 10-13 hours/week, multiple long rides in hills.",
      },
      {
        level: "Strong amateur",
        range: "6-8 hours",
        fitnessProfile:
          "FTP 3.7-4.3 W/kg, 12-15 hours/week, sustained-climb work, 30+ minute threshold reps.",
      },
      {
        level: "Elite amateur",
        range: "5-6 hours",
        fitnessProfile:
          "FTP 4.3+ W/kg, 15-20 hours/week, racing background, comfortable above threshold at altitude.",
      },
    ],
    fuellingDeepDive:
      "Eight-plus hours at altitude pushes carbohydrate demand to 100g/hour minimum if your gut is trained — and that's the bar for finishing well, not just finishing. Altitude suppresses thirst; force-drink on a timer (one bottle per hour, alarm if you need it). Feed zones are excellent — baguettes, ham, bananas, the full ASO operation — but rely on your own supplies for in-effort fuelling and treat the feed zones as top-up stops, not meal stops. Sun at altitude doubles UV exposure: factor in 30-minute reapplication of sunscreen and electrolyte intake that scales with sweat rate, not feel.",
    pacingDeepDive:
      "Pace on watts, not feel. Each HC climb is its own threshold effort with a rigid wattage ceiling — 75-80% of FTP for 60+ minutes is the sweet spot for most amateurs, and you should hit it on every climb regardless of who's flying past. The summit-to-summit interval is often the crux: two cols in 90 minutes with a fast valley between is the move that separates strong finishers from cracked ones. Eat and drink on the descents, especially the long ones; you have 20-40 minutes of free aerobic recovery, and most amateurs throw it away by tucking and drifting. Cut-offs at the Étape are real — start in the right pen, fuel from the gun, and pace the first climb on power not panic.",
    detailedMistakes: [
      {
        mistake: "Treating it like a normal sportive",
        fix: "The Étape is mountain racing scaled to amateurs. Train on sustained climbs of 30+ minutes, ride at altitude if you can, and arrive with race-day taper and fuelling rehearsed. A Marmotte or Maratona prep is closer to the truth than a 100-mile sportive prep.",
      },
      {
        mistake: "Underestimating heat at altitude",
        fix: "Sun intensity at 2,000m is brutal even at 22°C. Sunscreen at every feed zone, clear lenses for the descents, and electrolytes from the start — not 'when it gets hot'.",
      },
      {
        mistake: "Saving legs for the final climb and missing the cut-off",
        fix: "Pace the first climb on watts and the second to your training data. Cut-offs are non-negotiable and they catch riders who go too slowly on the early climbs hoping to push later. Ride the day from minute one, not from the final climb backwards.",
      },
    ],
  },
];

/* ============================================================ */
/* Lookups                                                      */
/* ============================================================ */

export function getEventGuide(slug: string): EventGuide | null {
  return EVENT_GUIDES.find((g) => g.slug === slug) ?? null;
}

export function getAllEventGuideSlugs(): string[] {
  return EVENT_GUIDES.map((g) => g.slug);
}

export interface ResolvedEventGuide {
  guide: EventGuide;
  trainingEvent: TrainingEvent;
  race: Race | null;
}

/**
 * Resolve a guide into the full set of data needed to render the page —
 * pulls the matching TrainingEvent (drives the /plan link grid) and
 * Race (provides typical_finish_times + key_climbs cross-references).
 */
export function resolveEventGuide(slug: string): ResolvedEventGuide | null {
  const guide = getEventGuide(slug);
  if (!guide) return null;
  const trainingEvent = getEvent(guide.trainingEventSlug);
  if (!trainingEvent) return null;
  const race = guide.raceSlug ? getRaceBySlug(guide.raceSlug) ?? null : null;
  return { guide, trainingEvent, race };
}
