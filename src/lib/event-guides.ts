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
  {
    slug: "maratona-dolomites-training-plan",
    trainingEventSlug: "maratona-dles-dolomites",
    raceSlug: "maratona-dles-dolomites",
    pageTitle: "Maratona dles Dolomites Training Plan",
    intent:
      "Help ballot-lucky riders prepare for the Maratona dles Dolomites — 138km over 7 Dolomite passes with 4,230m of climbing on closed roads in early July.",
    weatherConditions:
      "Early July in Alta Badia starts cold (4-8°C) at the 06:30 mass start, climbs into the mid-20s in the valleys by mid-morning, and rarely gets above 18°C on the upper passes. Afternoon thunderstorms are a real risk above 2,000m — the Giau in particular has a reputation for hailing on a sunny day.",
    terrainSummary:
      "Seven Dolomite passes stitched together by short valley descents — Campolongo, Pordoi, Sella, Gardena, Giau, Falzarego, Valparola. The pacing problem is the route shape: the first three passes feel like a rolling warm-up, then Giau ambushes you four hours in.",
    ftpRequirement: {
      minimum: "3.0 W/kg",
      competitive: "3.8 W/kg",
      notes:
        "The Maratona is climb-density limited. 3.0 W/kg with the right gearing finishes inside the cut-offs; 3.8+ W/kg lets you hold sub-threshold up Giau when the rest of the field is grinding into Z4. Above 4.2 W/kg, you're racing for the sub-7-hour group.",
    },
    enduranceDemands:
      "10-12 hours/week peaking, with a long ride that has built up to 5 hours and includes at least three sustained climbs of 30+ minutes. Most of your training should be climbing-specific — 138km flat is a different event entirely.",
    climbingNarrative:
      "4,230m of climbing in 138km — that's 30m per kilometre, the densest climbing per km of any event in this cluster. The first three passes (Campolongo, Pordoi, Sella) come in 90 minutes and trick fresh legs into thinking it's a quick day. Then Gardena leads into the Giau — 9.9km at 9.3% on tired legs above 2,000m — and the day's real shape reveals itself.",
    majorClimbs: [
      {
        name: "Passo Campolongo",
        lengthKm: 5.5,
        avgGradient: 7.0,
        elevationGainM: 384,
        positionInRide: "km 5",
        notes:
          "First climb out of the start. Steady opener — keep it deep Z2 even if the pack is launching. The day is long.",
      },
      {
        name: "Passo Pordoi",
        lengthKm: 9.4,
        avgGradient: 6.8,
        elevationGainM: 639,
        positionInRide: "km 25",
        notes:
          "Switchback classic. 50-60 minutes of climbing — sit in a group at sub-threshold and let the kilometres pass.",
      },
      {
        name: "Passo Sella",
        lengthKm: 5.5,
        avgGradient: 7.9,
        elevationGainM: 434,
        positionInRide: "km 50",
        notes:
          "Steeper than Pordoi but shorter. The third climb is where most riders quietly start eating the time bonuses they thought they had.",
      },
      {
        name: "Passo Giau",
        lengthKm: 9.8,
        avgGradient: 9.3,
        maxGradient: 14,
        elevationGainM: 911,
        positionInRide: "km 80",
        notes:
          "The crux of the day. 9% sustained on legs that have already done 2,500m of climbing. Pace it on watts, not feel — overcook the bottom and you grind the top in pieces.",
      },
      {
        name: "Passo Falzarego",
        lengthKm: 13.8,
        avgGradient: 5.9,
        elevationGainM: 814,
        positionInRide: "km 110",
        notes:
          "Gentler gradient than Giau but it's the day's last long climb. The tunnel section near the top is cold and exposed — eat before, not on it.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "9-12 hours",
        fitnessProfile:
          "FTP 2.8-3.2 W/kg, 8-10 hours/week, longest ride 5 hours including a 30+ minute climb.",
      },
      {
        level: "Average enthusiast",
        range: "7-9 hours",
        fitnessProfile:
          "FTP 3.2-3.7 W/kg, 10-12 hours/week, regular climbing rides, one event-specific 5-hour day per fortnight.",
      },
      {
        level: "Strong amateur",
        range: "5-7 hours",
        fitnessProfile:
          "FTP 3.7-4.3 W/kg, 12-15 hours/week, structured threshold work, comfortable above 2,000m.",
      },
      {
        level: "Elite amateur",
        range: "4-5 hours",
        fitnessProfile:
          "FTP 4.3+ W/kg, 14-18 hours/week, racing background, sub-threshold for 60+ minutes at altitude.",
      },
    ],
    fuellingDeepDive:
      "138km on the Maratona is six to nine hours for most riders — closer to a 200km day in calorie terms because of the climbing density. Target 90-110g carbs/hour: gels every 30 minutes plus a bar at the bottom of every climb. The Italian feed zones are exceptional — fresh bread, ham, fruit, espresso — but they're crowded; rely on your own bottles and gels for in-effort fuelling and treat the feed zones as top-up stops, not meal breaks. The Giau has no useful feed — come to its base with a full bottle, two gels in pockets, and a caffeine gel saved for the 2km mark. Dolomite UV at 2,000m burns faster than sea-level July; sunscreen at every aid station, full fingers + arm warmers stashed for the descents that fly straight back into shade.",
    pacingDeepDive:
      "Pace the Maratona backwards from Giau. Every watt you save in the first three passes is a watt you have on the climb that matters. Target 70-75% of FTP on Campolongo, Pordoi, and Sella — that's a heart-rate ceiling, not a feel. The descents off Pordoi and Gardena are technical and crowded; brake early, sit upright, and treat them as 20-minute fuelling windows. Hit the base of Giau with a full stomach and a clear head; settle into 75-80% of FTP for the bottom 4km, then ride the gradient — not the riders around you — for the steep middle. Once you're over Giau the day is yours, but Falzarego still has 800m of vertical, so eat on the descent and ride the last climb steady, not slow.",
    detailedMistakes: [
      {
        mistake: "Racing the first three passes because they feel easy",
        fix: "Campolongo, Pordoi, and Sella are the warm-up. Stay 5-8 bpm below your sportive threshold on every one of them. Riders who burn matches in the first 90 minutes are the ones grinding 6km/h up the Giau two hours later.",
      },
      {
        mistake: "Treating the Giau like another climb",
        fix: "The Giau is the race. Plan it like a 60-minute threshold test: full bottle at the base, two gels in your pockets, caffeine gel at the 2km marker, and a wattage ceiling you do not break regardless of who passes you. The summit is the win — pace to get there, not to outdrag your neighbour.",
      },
      {
        mistake: "Underdressing for the descents",
        fix: "The Pordoi and Falzarego descents drop 800-1,000m at speed. Even in mid-July, you'll be at 6-8°C in the wind. A gilet stashed in the jersey is non-negotiable; a rain cape on a thunderstormy year has saved more days than aero socks ever will.",
      },
    ],
  },
  {
    slug: "unbound-gravel-training-plan",
    trainingEventSlug: "unbound-gravel",
    pageTitle: "Unbound Gravel 200 Training Plan",
    intent:
      "Help gravel riders prepare for Unbound Gravel 200 — 320km (200mi) across the Flint Hills of Kansas in June, with rocks that destroy tyres and 12-20 hours of self-supported riding.",
    weatherConditions:
      "Early June in Emporia ranges from 18°C at the 06:00 start to 32-35°C by mid-afternoon, with humidity that compounds the heat. There is almost no shade across the Flint Hills route. Mud years (2015, 2017, 2023) and dust years exist — the same race, very different days, and you don't know which you have until 50km in.",
    terrainSummary:
      "320km of unpaved Kansas backroads — packed dirt with embedded chert (flint) rocks that puncture inattentive tyres. Mostly rolling rather than mountainous; the climbing total is modest but the terrain never lets you settle into a rhythm. Two checkpoints with drop bags split the day into thirds.",
    ftpRequirement: {
      minimum: "2.6 W/kg",
      competitive: "3.4 W/kg",
      notes:
        "Unbound is endurance-limited and tyre-limited before it's FTP-limited. 2.6 W/kg with ultra-trained pacing finishes inside the 21-hour cut-off; 3.4+ W/kg with disciplined fuelling lands you in the sub-12-hour group. Watts win less time at Unbound than smart tyres and a fed gut.",
    },
    enduranceDemands:
      "12-15 hours/week peaking, with at least two back-to-back weekends of 7-8 hour rides paired with 4-hour days the next morning. You should have done one ride longer than 9 hours before race day, ideally on rough surface. Group-ride experience matters: drafting on Kansas dirt saves 20-25% of your output and is the difference between a 14-hour and a 17-hour finish.",
    climbingNarrative:
      "Around 2,800m of climbing across 320km — modest by sportive standards, brutal in context. The Flint Hills are a sequence of short, sharp rollers that never end; you stand, you sit, you stand again, every five minutes for 14 hours. There are no long climbs to settle into and no flat sections to recover on. The relentlessness is the climbing, not the elevation.",
    majorClimbs: [
      {
        name: "Texaco Hill",
        lengthKm: 1.2,
        avgGradient: 6.5,
        elevationGainM: 78,
        positionInRide: "km 50",
        notes:
          "The early signature roller. Sets the tone — short, punchy, and there are 200 more of them coming.",
      },
      {
        name: "Little Egypt",
        lengthKm: 0.8,
        avgGradient: 8.5,
        maxGradient: 12,
        elevationGainM: 68,
        positionInRide: "varies",
        notes:
          "Iconic short steep with deep rocky tracks. Pick your line on the way up — wrong line is a hike-a-bike.",
      },
      {
        name: "Cumulative Flint Hills rollers",
        lengthKm: 1,
        avgGradient: 5,
        elevationGainM: 30,
        positionInRide: "throughout",
        notes:
          "Most of the day's climbing is rollers under 2 minutes. None of them earn a name; together they're the day. Sit at endurance HR; do not stand and surge on every one.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "16-20 hours",
        fitnessProfile:
          "FTP 2.4-2.8 W/kg, 8-10 hours/week, longest ride 7-8 hours, ultra-pacing experience preferred.",
      },
      {
        level: "Average enthusiast",
        range: "13-16 hours",
        fitnessProfile:
          "FTP 2.8-3.3 W/kg, 10-12 hours/week, multiple 8+ hour gravel rides in training.",
      },
      {
        level: "Strong amateur",
        range: "11-13 hours",
        fitnessProfile:
          "FTP 3.3-3.8 W/kg, 12-15 hours/week, gravel-specific terrain, structured tempo work.",
      },
      {
        level: "Elite amateur",
        range: "9-11 hours",
        fitnessProfile:
          "FTP 3.8+ W/kg, 14-18 hours/week, racing background, gut trained to 90g+ carbs/hour, comfortable in fast lead packs.",
      },
    ],
    fuellingDeepDive:
      "12-20 hours of riding with no aid stations between checkpoints makes Unbound a logistics problem first. Target 80-100g carbs/hour on the bike; eat additional solid food at each checkpoint (real food beats gels after hour 8). Drop bags at checkpoints 1 and 2 — pre-pack them with bottles, gels, bars, salt tabs, sunscreen, and a fresh kit option for the second half. The Texan rule applies: if you're not peeing every 2-3 hours, you're underfuelled or underhydrated, and either one ends your day. Sodium is the silent killer — Kansas heat sweats out 1,500-2,000mg/hour and you cannot replace that with gels alone. Salt tabs every hour, electrolyte mix in every bottle.",
    pacingDeepDive:
      "Unbound is an ultra with a drop bag. Pace at 55-60% of your 4-hour FTP as the all-day ceiling — you do not 'race' Unbound at amateur level, you sit on a controlled effort for 14 hours and let the terrain shape the day. The first 100km is where the front pack rides above your sustainable pace; let them go and ride your watts. Sit in groups whenever you can find them; the Flint Hills cross-tail-headwind sequence makes drafting more valuable here than at any pure road event. Each checkpoint is a 10-15 minute reset — refill bottles, re-grease the chain, swap drop bag, refill jersey, leave. Riders who sit down to chat at checkpoint 1 lose 30 minutes they never get back. The final 100km separates ultra-trained finishers from sportive riders who picked the wrong race.",
    detailedMistakes: [
      {
        mistake: "Running tyres under 40mm",
        fix: "42-45mm minimum, with reinforced sidewalls (Panaracer GravelKing SK+, Challenge Gravine Race, Rene Herse Stampede Pass). Tubeless mandatory, with 2-3 plug kits, CO2, and a spare tube. The Flint Hills shred light XC casings inside 50km — there is no recovering from a sliced sidewall at km 80.",
      },
      {
        mistake: "Treating it like a long sportive",
        fix: "Unbound is ultra territory. Train ultra hours, train your gut to 90g+ carbs/hour, and arrive having done one 9+ hour ride. A road sportive background without ultra pacing is the most common reason for a checkpoint-2 DNF.",
      },
      {
        mistake: "Standing and surging on every roller",
        fix: "There are 200 rollers and you cannot punch every one. Sit, hold endurance heart rate, and let the gradient do its thing. Surging on rollers is the hidden energy leak that costs people the second half.",
      },
    ],
  },
  {
    slug: "leadville-100-training-plan",
    trainingEventSlug: "leadville-100",
    pageTitle: "Leadville Trail 100 MTB Training Plan",
    intent:
      "Help mountain bike riders prepare for the Leadville Trail 100 — 160km (100mi) starting at 3,100m altitude in the Colorado Rockies, with a sub-12-hour finisher buckle as the goal.",
    weatherConditions:
      "Mid-August in Leadville starts near freezing at the 06:30 start (often 0-4°C at 3,100m altitude) and peaks at 25-28°C in the valleys by mid-afternoon, with afternoon thunderstorms a near-certainty above the treeline. The temperature swing across one ride is bigger than at any sea-level event — kit choice is a real problem, not a stylistic one.",
    terrainSummary:
      "160km out-and-back through the Colorado Rockies on dirt roads, fire roads, and some technical singletrack. The crux is Columbine Mine — a 9km climb to 3,810m above sea level, the highest point of the day. The Powerline section on the return is fast, rocky, and tyre-popping. Cut-off at the Columbine turnaround (6 hours) is the day's first shaping moment.",
    ftpRequirement: {
      minimum: "3.2 W/kg",
      competitive: "4.0 W/kg",
      notes:
        "Leadville is altitude-limited. At sea level your FTP is one number; above 3,000m you'll lose 12-18% of it. 3.2 W/kg sea-level FTP with proper acclimatisation gets you the buckle; 4.0+ W/kg with two-week altitude exposure puts you in the sub-9 hour group. Riders who arrive 48 hours before the race lose more time to altitude than to fitness.",
    },
    enduranceDemands:
      "12-15 hours/week peaking, with a long ride that has built up to 6 hours over rolling terrain and includes at least two sustained 30+ minute climbs. MTB-specific skills are non-negotiable: technical descending, washboard fire roads, rocky singletrack — Leadville is not a road event in disguise. Aim to arrive in Leadville 2 weeks before the race for altitude acclimatisation, or as close as you can get logistically.",
    climbingNarrative:
      "Around 3,810m of climbing across 160km — but the elevation profile is misleading. The numbers say modest; the altitude says brutal. Columbine Mine is a 9km climb topping out at 3,810m above sea level. Sugarloaf and Powerline are short and steep but rideable. The hidden climb is the return-leg headwind out of Twin Lakes and the Powerline punch on tired legs at 9 hours in.",
    majorClimbs: [
      {
        name: "St Kevin's",
        lengthKm: 5.6,
        avgGradient: 4.8,
        elevationGainM: 269,
        positionInRide: "km 20",
        notes:
          "First sustained climb on dirt road. Sets your altitude pacing — keep heart rate 5-10 bpm below sea-level threshold for the same effort.",
      },
      {
        name: "Sugarloaf",
        lengthKm: 6.1,
        avgGradient: 5.2,
        elevationGainM: 317,
        positionInRide: "km 30",
        notes:
          "Drops onto Powerline on the descent — fast, rocky, do not overcook it on the outbound. You're descending it twice.",
      },
      {
        name: "Columbine Mine",
        lengthKm: 9.0,
        avgGradient: 7.4,
        maxGradient: 13,
        elevationGainM: 666,
        positionInRide: "km 65 (turnaround)",
        notes:
          "The race. Tops out at 3,810m above sea level. Pace it as a 60-90 minute aerobic-threshold effort — heart rate runs 8-12 bpm above your sea-level Z3 at the same wattage, and that's normal. Cut-off is 6 hours from race start; if you're not at the turnaround by 12:30, you're done.",
      },
      {
        name: "Powerline (return)",
        lengthKm: 1.6,
        avgGradient: 12,
        maxGradient: 23,
        elevationGainM: 198,
        positionInRide: "km 130",
        notes:
          "Steep, loose, and brutal at 9 hours in. Most amateurs hike a portion of this — that's not weakness, it's fitness management. Save it for here.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher (12-hour buckle)",
        range: "10-12 hours",
        fitnessProfile:
          "FTP 2.8-3.2 W/kg sea level, 8-10 hours/week, longest ride 5-6 hours, MTB-specific skills, 1-2 weeks altitude prep.",
      },
      {
        level: "Sub-12 buckle target",
        range: "9-11 hours",
        fitnessProfile:
          "FTP 3.2-3.7 W/kg sea level, 10-12 hours/week, multiple long rides on technical terrain, 2 weeks altitude prep.",
      },
      {
        level: "Sub-9 buckle (gold)",
        range: "8-9 hours",
        fitnessProfile:
          "FTP 3.7-4.3 W/kg sea level, 12-15 hours/week, structured threshold + VO2 work, racing background, 3+ weeks altitude prep.",
      },
      {
        level: "Top contender",
        range: "6-8 hours",
        fitnessProfile:
          "FTP 4.3+ W/kg sea level, 15-20 hours/week, MTB racing background, lives at altitude or arrives 4+ weeks early.",
      },
    ],
    fuellingDeepDive:
      "Altitude suppresses appetite — if you wait until you feel hungry you've already lost 60 minutes of fuelling. Force-fuel on a timer: 70-90g carbs/hour, alarm on the head unit if you have to. Crew or the on-course aid stations cover the basics (Twin Lakes is the main resupply both ways) but own-supply between is faster than queueing. Hydration is critical: 750ml-1L/hour with electrolytes once the heat lands, and 500-600ml in the cold opening hour even if you don't feel thirsty. Dry Colorado air dehydrates 30-40% faster than the same temperature at sea level. A caffeine gel before Columbine sharpens the climb; another before Powerline keeps the focus on rocky terrain at 9 hours in.",
    pacingDeepDive:
      "Pace Leadville on heart rate, not power — power meters lie at altitude when you're not adapted. Target a heart rate ceiling 5-8 bpm below your sea-level Z3 for the first 4 hours; on Columbine, sit at aerobic threshold and ride the climb in pieces (climb-eat-climb), not in one effort. The descent off Columbine back to Twin Lakes is the day's free recovery — eat, drink, freewheel, do not hammer. The return leg is harder than the outbound: headwinds, tired legs, and Powerline. Pace the run-in to the finish on the singletrack rather than chasing back time on the dirt road sections; falling at 10 hours in is the most common Leadville DNF.",
    detailedMistakes: [
      {
        mistake: "Arriving less than 2 weeks before the race",
        fix: "If you cannot arrive 2 weeks early, arrive 36 hours before — splitting the difference is the worst option. The acute mountain-sickness window peaks day 2-4 of altitude exposure. Get there early enough to adapt, or late enough that you race before you feel it.",
      },
      {
        mistake: "Racing the paved start road and blowing up at altitude",
        fix: "The first 5km is downhill paved, then a 6km dirt-road climb. The lead group is gone within 10km — let them go. Riding at sea-level wattage in the first hour at 3,100m altitude burns matches you cannot get back.",
      },
      {
        mistake: "Running XC race tyres",
        fix: "2.3-2.4\" tyres with MaxxTerra or Enduro casings (Maxxis Rekon, Vittoria Mezcal, Continental Race King ProTection). XC race tyres last 80km on Leadville rocks and then you walk. Casing weight is the single biggest insurance you can buy.",
      },
    ],
  },
  {
    slug: "gran-fondo-nyc-training-plan",
    trainingEventSlug: "gran-fondo-nyc",
    raceSlug: "gran-fondo-new-york",
    pageTitle: "Gran Fondo New York Training Plan",
    intent:
      "Help amateur riders prepare for Gran Fondo New York — 160km from the George Washington Bridge up the Hudson Valley with 2,500m of climbing, including the signature Bear Mountain ascent. Timed format, international field, ranked finish.",
    weatherConditions:
      "Mid-May in the Hudson Valley swings from 8-10°C at the 06:00 GW Bridge start to 25-30°C and humid by midday. Rain years and humid years both happen; the bridge is exposed and cold even in shorts-and-jersey weather, then the inland climbs trap the heat by km 70.",
    terrainSummary:
      "Closed bridge start out of Manhattan, then rolling Hudson Valley terrain north into Rockland and Bear Mountain State Park. The signature climb is Bear Mountain at km 90 — a sustained 25-30 minute effort. Few flat kilometres; the day is all rolling tempo broken by the one big climb.",
    ftpRequirement: {
      minimum: "2.7 W/kg",
      competitive: "3.6 W/kg",
      notes:
        "GFNY is timed and ranked, which changes how you should think about pacing. 2.7 W/kg with disciplined group riding gets you to the finish under 8 hours; 3.6+ W/kg lets you hold the front packs through the rollers and time-trial Bear Mountain at threshold. Above 4 W/kg, the racing is real — you're chasing an age-group podium.",
    },
    enduranceDemands:
      "8-12 hours/week peaking 8-12 weeks out, with a long ride that has reached 4.5-5 hours over rolling terrain. Group-ride experience is essential — GFNY is a pack event for the first 80km, and surfing groups solo doubles your effort cost. Hill repeats are non-negotiable: Bear Mountain at threshold for 25-30 minutes is a session you should be able to rehearse in training.",
    climbingNarrative:
      "Around 2,500m of climbing across 160km — modest by alpine standards, deceptive in execution. The first 80km up the Hudson Valley is rolling tempo with constant 2-5 minute rises. Bear Mountain at km 90 is the day's defining effort: 7-8km at 5-6%, often raced at threshold by faster groups. The back half rolls home with no flat — every kilometre after the climb is either up or down.",
    majorClimbs: [
      {
        name: "9W rollers",
        lengthKm: 2,
        avgGradient: 4.5,
        elevationGainM: 90,
        positionInRide: "km 25-75",
        notes:
          "The route has dozens of these — short, recurring 2-5 minute rises along Route 9W. Each one is a pack-shattering surge if you let it be. Sit, hold tempo, let the road undulate.",
      },
      {
        name: "Bear Mountain (Perkins Memorial Drive)",
        lengthKm: 7.8,
        avgGradient: 6.3,
        maxGradient: 9,
        elevationGainM: 491,
        positionInRide: "km 90",
        notes:
          "The race. 25-30 minute climb at sustained 6%. Pace at 90-95% FTP if you're chasing a time, 80-85% if you're chasing a finish. The climb separates the day into two — strong finishers earn their times here, not on the flats.",
      },
      {
        name: "Hudson Valley return rollers",
        lengthKm: 1.5,
        avgGradient: 5,
        elevationGainM: 60,
        positionInRide: "km 110-150",
        notes:
          "Rolling all the way back. By this point your group is small or you're solo — pacing on power matters more than legs.",
      },
    ],
    finishTimes: [
      {
        level: "First-time finisher",
        range: "7-9 hours",
        fitnessProfile:
          "FTP 2.5-2.9 W/kg, 6-8 hours/week, longest ride 4 hours, comfortable on rolling terrain.",
      },
      {
        level: "Average enthusiast",
        range: "5-7 hours",
        fitnessProfile:
          "FTP 2.9-3.4 W/kg, 8-10 hours/week, regular group rides, 25-minute threshold efforts in training.",
      },
      {
        level: "Strong amateur",
        range: "4-5 hours",
        fitnessProfile:
          "FTP 3.4-4.0 W/kg, 10-13 hours/week, structured threshold + tempo work, racing background.",
      },
      {
        level: "Elite amateur (age-group podium)",
        range: "3:30-4 hours",
        fitnessProfile:
          "FTP 4.0+ W/kg, 13-18 hours/week, current racer or recent racer, sub-threshold pack-pace for 4+ hours.",
      },
    ],
    fuellingDeepDive:
      "5-9 hours of rolling tempo demands 70-90g carbs/hour — gels every 30-40 minutes plus a bar at km 50 and km 110. The official feed zones are at km 55 and km 110; both are popular and busy, and the second is your most important fuel stop because Bear Mountain is digesting in your stomach. US sportive culture means most riders carry their own; don't rely on aid station variety. Hydration is the underrated factor: humidity in the Hudson Valley by 11:00 is brutal even when the temperature looks moderate, and 750ml/hour with electrolytes is the standard. A caffeine gel at the base of Bear Mountain sharpens the climb; another at km 130 keeps the focus on the rolling run-in.",
    pacingDeepDive:
      "Get into a pack within the first 15km on the GW Bridge and stay in it. The first 30km is fast, closed-road, and full of riders riding above their pace — let them go and ride your group. Through the Hudson Valley rollers (km 25-75), sit at tempo (78-88% FTP) and surge briefly over the rises rather than mashing flat-pace. Bear Mountain is your race within the race: pre-fuel, pick a wattage target, and ride it on power. The descent off Bear Mountain is technical and crowded — brake early, sit upright, eat — and the run-in along the Hudson rewards riders who held back in the first half. If you're chasing a time, the right groups through the back half are worth more than 15 watts of FTP.",
    detailedMistakes: [
      {
        mistake: "Burning matches matching pace on the GW Bridge start",
        fix: "The first 5km off the bridge is a race start by half the field — let them go. Pick a pack at your goal pace within 15km and stay in it. Riders who chase the front pack on the bridge are the same ones cracked at km 100.",
      },
      {
        mistake: "Riding the Hudson Valley rollers solo",
        fix: "Drafting in the pack saves 25-30% of your output through the rollers. Even if your group is slower than your fitness, you'll arrive at Bear Mountain fresher than the rider who hammered solo. The pack is the pace.",
      },
      {
        mistake: "Paying off the climb cost on the descent",
        fix: "The descent off Bear Mountain is fast, technical, and the wind shifts at 50km/h. Brake early, hold a steady cadence, eat. Riders who try to time-trial the descent crash, freewheel, or arrive at the run-in unable to sit on a wheel.",
      },
    ],
  },
  {
    slug: "badlands-training-plan",
    trainingEventSlug: "badlands",
    pageTitle: "Badlands Training Plan",
    intent:
      "Help ultra-endurance riders prepare for Badlands — one of the hardest self-supported gravel ultras in the world: 800km across Andalusia and the Tabernas Desert with 16,000m of climbing.",
    weatherConditions:
      "Early September in Andalusia is 35-42°C in the Tabernas Desert by mid-afternoon, drops to 5-10°C in the desert at 03:00, and can hit -2°C on the high Sierra Nevada passes overnight. The same kit serves daytime and nighttime only if it's chosen for both — and most riders underspec the cold.",
    terrainSummary:
      "800km of mixed road, gravel, and rough farm-track across the south of Spain — including a crossing of the Tabernas Desert (Europe's only true desert) and the Sierra Nevada. Self-supported: resupply at open shops, fuel at petrol stations, sleep where you can. 16,000m of climbing across 5-7 days of riding for most riders.",
    ftpRequirement: {
      minimum: "2.5 W/kg",
      competitive: "3.2 W/kg",
      notes:
        "Badlands is not an FTP event. It's a logistics, sleep, and durability event. 2.5 W/kg with smart pacing finishes in 5-7 days; 3.2+ W/kg with a polished bikepacking setup contests the front group. Above 3.5 W/kg you're racing, not riding — but it's still the rider with the best sleep strategy who wins.",
    },
    enduranceDemands:
      "20+ hours/week of base building 12-16 weeks out, including back-to-back-to-back long days (8h + 6h + 4h) at least three times in training. You should have completed at least one shorter ultra (300-500km) before attempting Badlands. The bike fit, the saddle, and the sleep system all need testing — race day is not the time to discover a hot spot.",
    climbingNarrative:
      "16,000m of climbing across 800km — that's an average of 20m per kilometre, relentless rather than spectacular. There are signature climbs (the Sierra Nevada crossing, the descent to the Tabernas, the climb out of Cabo de Gata) but the day-to-day reality is that nothing is flat for long. The shape of the ride is climbing-descending-climbing, day and night, for a week.",
    majorClimbs: [
      {
        name: "Sierra de los Filabres",
        lengthKm: 22,
        avgGradient: 5.2,
        elevationGainM: 1144,
        positionInRide: "first major test (~km 200)",
        notes:
          "First long climb. Sets your pacing for the rest of the race — if you push above 65% FTP here, you pay for it on day 3.",
      },
      {
        name: "Tabernas Desert crossing",
        lengthKm: 35,
        avgGradient: 1.5,
        elevationGainM: 525,
        positionInRide: "day 2-3",
        notes:
          "Not a climb, a test. 40°C+ temperatures, no shade, rocky farm tracks. Plan to cross at night or before 09:00; midday crossing is how riders DNF.",
      },
      {
        name: "Sierra Nevada crossing",
        lengthKm: 28,
        avgGradient: 5.8,
        elevationGainM: 1624,
        positionInRide: "mid-route",
        notes:
          "Highest point of the race. 2,400m+. Cold, often windy, can be wet even in September. Eat on the climb, descend in layers.",
      },
      {
        name: "Cabo de Gata coastal climbs",
        lengthKm: 4,
        avgGradient: 7,
        elevationGainM: 280,
        positionInRide: "varies, late race",
        notes:
          "Short steep coastal climbs in the final third. Salt air, exposed cliff sections, and tired legs after 600km. Pace conservatively; descents are technical.",
      },
    ],
    finishTimes: [
      {
        level: "First-time ultra finisher",
        range: "6-7 days",
        fitnessProfile:
          "FTP 2.4-2.7 W/kg, 12-15 hours/week, completed at least one 400km+ ultra, sleep plan rehearsed, bike-fit dialled.",
      },
      {
        level: "Experienced ultra rider",
        range: "5-6 days",
        fitnessProfile:
          "FTP 2.7-3.2 W/kg, 15-18 hours/week, multiple ultras finished, gravel-specific kit, 4-5 hours/day sleep schedule.",
      },
      {
        level: "Strong contender",
        range: "4-5 days",
        fitnessProfile:
          "FTP 3.2-3.7 W/kg, 18-22 hours/week, ultra racing background, 2-3 hours/day sleep tested in racing, polished bikepacking setup.",
      },
      {
        level: "Race for the podium",
        range: "3-4 days",
        fitnessProfile:
          "FTP 3.7+ W/kg, 20+ hours/week, ultra racing palmarès, can ride 18+ hours/day with strategic 90-minute naps, dialled nutrition and pacing.",
      },
    ],
    fuellingDeepDive:
      "Badlands is a calorie-deficit problem disguised as a race. You'll burn 8,000-12,000 kcal/day and you cannot eat that on the bike — the goal is to minimise the gap and refuel aggressively at every shop, café, and petrol station. On the bike, target 70-90g carbs/hour from gels, bars, and bottled mix; off the bike at every resupply, eat real food (sandwiches, tortilla, tuna, pastries, anything calorie-dense and palatable). Salt + electrolytes are non-negotiable in the desert sections — sodium intake of 1,000-2,000mg/hour is normal in 38°C heat. Hot food at café stops late at night isn't a luxury, it's a sleep enabler — you cannot lie down on cold gels alone. Hydration is constant: 750ml-1L/hour in heat, 500ml/hour at night. Map the shops on your GPX before the start; running out of water in the Tabernas is a 90-minute problem, not a 10-minute one.",
    pacingDeepDive:
      "Don't race the start. The Badlands leaderboard means almost nothing if you DNF at km 400, and most people who DNF do so because they rode the first 24 hours like a 24-hour race. Sustainable pace is roughly 60% of your 8-hour FTP as an all-day ceiling — even less if your sleep plan is aggressive. The race is won and lost on sleep strategy: 4-6 hours/day for first-time finishers, 2-4 hours for experienced ultras, 90-minute naps for the front group. Write your sleep plan before the start: where, how long, triggered by which kilometre or what time. Cross the desert sections (Tabernas, Cabo de Gata exposure) at night or before 09:00. Plan resupply windows around shop hours — Spanish villages close 14:00-17:00 and that's a problem if you didn't anticipate it. The riders who finish are the ones who treated each day as a separate stage; the riders who DNF rode the first day like a one-day race.",
    detailedMistakes: [
      {
        mistake: "Underestimating the night cold in the desert",
        fix: "Treat 'Spain in September' like 'high-elevation desert in any month' — long-sleeve baselayer, gilet, full-finger gloves, leg warmers, and a thermal layer for sleep stops. Riders who pack for 30°C and discover 4°C at 03:00 get hypothermic on the descents. The desert is hot in the day and cold at night, full stop.",
      },
      {
        mistake: "Treating it like a long sportive",
        fix: "Badlands punishes riders without ultra experience. Complete a 300-500km ultra in training, ride back-to-back long days, test your saddle, your sleep system, and your gut at full distance before race day. A road sportive background without ultra pacing is a 50% DNF probability.",
      },
      {
        mistake: "Riding the first 24 hours as if it were a 24-hour race",
        fix: "Pace at 60% of your 8-hour FTP from minute one. The leaderboard is meaningless until day 4. Riders who push above sustainable pace in the first 200km are the ones bonking in the desert two days later — and the desert does not negotiate.",
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
