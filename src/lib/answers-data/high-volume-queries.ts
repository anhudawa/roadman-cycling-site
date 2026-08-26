import type { AnswerPage } from "@/lib/answers";

export const highVolumeQueryAnswers: AnswerPage[] = [
  // ============================================================
  // 1 — HOW MANY CALORIES DOES CYCLING BURN PER HOUR
  // ============================================================
  {
    slug: "how-many-calories-does-cycling-burn",
    cluster: "nutrition",
    question: "How Many Calories Does Cycling Burn per Hour?",
    seoTitle: "How Many Calories Does Cycling Burn per Hour? Real Numbers",
    seoDescription:
      "Cycling burns 400–1,000 calories per hour depending on intensity and body weight. A 75 kg rider at moderate effort burns roughly 600 kcal/hr. Here are the real numbers by intensity, weight, and terrain.",
    pillar: "nutrition",
    directAnswer:
      "A 75 kg cyclist burns roughly 400–600 kcal per hour at moderate intensity (Zone 2, ~180 W) and 700–1,000+ kcal per hour during hard efforts (threshold and above, ~250–300 W). The primary drivers are power output and duration, not speed — a headwind or a hill costs the same energy as speed on the flat for the same wattage. Body weight matters because heavier riders produce more watts at the same relative effort. Without a power meter, use 8–12 kcal per minute as a practical estimate for moderate riding.",
    keyTakeaways: [
      "Moderate cycling (Zone 2) burns roughly 400–600 kcal/hr for a 75 kg rider.",
      "Hard efforts (threshold+) burn 700–1,000+ kcal/hr — intensity is the biggest variable.",
      "Power output, not speed, determines calorie burn — a headwind or gradient changes speed but not energy cost at the same wattage.",
      "Calorie estimates from Strava and Garmin are often 20–30% too high without a power meter.",
    ],
    whoFor: [
      {
        label: "The rider managing body composition",
        detail:
          "You want accurate calorie data to inform your nutrition — whether that is fuelling rides properly or understanding energy balance.",
      },
      {
        label: "The cyclist comparing exercise modalities",
        detail:
          "You want to know how cycling stacks up against running, swimming, or other sports for energy expenditure.",
      },
    ],
    roadmanView: [
      "The calorie question is one Anthony fields constantly, and the honest answer is that most riders dramatically overestimate how much they burn. Strava's calorie estimate without a power meter is often 20–30% too high because it guesses from heart rate, which is influenced by heat, caffeine, fatigue, and stress. A power meter gives you kilojoules — which, conveniently, converts almost 1:1 to kilocalories for cycling (gross mechanical efficiency is roughly 20–25%).",
      "The practical numbers: a 75 kg rider spinning along at a conversational pace — genuine Zone 2 at 150–180 watts — burns about 500 kcal per hour. Push that to threshold pace at 250+ watts and you are closer to 800–900 kcal. A hard 3-hour sportive can burn 2,000–2,500 kcal, which is why fuelling matters so much on longer rides.",
      "The trap is treating calorie burn as a licence to eat. Riders who finish a 2-hour ride, see '1,200 kcal burned' on their head unit, and reward themselves with a 1,500-calorie pub lunch are going backwards. The calorie number is useful for fuelling — knowing how much to eat during and after a ride — not for justifying a surplus.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "The kilojoule readout from a power meter is the most accurate field measure of energy expenditure available. For practical purposes, kilojoules from the power meter equal kilocalories burned — the conversion accounts for human mechanical efficiency. Heart-rate-only estimates carry a 20–30% margin of error.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "David Dunne",
        credential: "World Tour nutritionist (Israel–Premier Tech)",
        insight:
          "When planning nutrition for professional riders, we work from power data — not estimated calorie burn — because the precision matters. An amateur riding for 3 hours at 200 watts burns roughly 2,160 kJ, which maps to about 2,160 kcal. That is a precise, repeatable number that heart rate alone cannot match.",
        episodeSlug: "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
        guestSlug: "david-dunne",
      },
    ],
    practicalApplication: [
      {
        title: "Use power data for accurate calorie tracking",
        detail:
          "If you have a power meter, read kilojoules from your ride file. 1 kJ equals roughly 1 kcal for cycling. A 90-minute ride averaging 200 watts is 1,080 kJ — roughly 1,080 kcal burned. This is far more reliable than heart-rate-derived estimates.",
      },
      {
        title: "Estimate without a power meter",
        detail:
          "Without power data, use 8–10 kcal per minute for moderate riding and 12–15 kcal per minute for hard efforts as a rough guide. Multiply by duration in minutes. A moderate 2-hour ride: 120 min x 9 kcal = roughly 1,080 kcal. Then subtract 20% from whatever Strava tells you as a reality check.",
      },
      {
        title: "Match fuelling to calorie cost",
        detail:
          "On rides over 90 minutes, replace 30–50% of the calories you are burning with on-bike carbohydrate. A 3-hour ride burning 1,800 kcal needs 540–900 kcal of in-ride fuel — that is 60–80g of carbohydrate per hour. Use the calorie number to plan food, not to justify eating afterwards.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Trusting Strava or Garmin calorie estimates without a power meter.",
        fix:
          "Heart-rate-based calorie estimates are routinely 20–30% too high. If you do not have power, assume the app is overestimating and adjust down.",
      },
      {
        mistake: "Using calorie burn to justify excessive post-ride eating.",
        fix:
          "Fuel the ride itself properly — carbohydrate during and a recovery meal after — rather than banking 'calories earned' for later. The surplus is where body composition goals go wrong.",
      },
      {
        mistake: "Assuming speed equals calorie burn.",
        fix:
          "A tailwind ride at 35 km/h can burn fewer calories than a headwind ride at 25 km/h. Power output determines energy cost, not speed. A rider averaging 200 watts for an hour burns the same calories whether they are doing 30 km/h or 40 km/h.",
      },
    ],
    faq: [
      {
        question: "Does cycling burn more calories than running?",
        answer:
          "Per hour of effort at comparable intensity, running tends to burn 10–20% more calories because it is weight-bearing and less mechanically efficient. But cycling allows longer sustained efforts — a 3-hour ride is far more practical than a 3-hour run — so total session burn is often higher on the bike.",
      },
      {
        question: "How many calories does a 1-hour indoor trainer session burn?",
        answer:
          "Indoor sessions at structured intensity — intervals or sweet spot — typically burn 500–800 kcal per hour for a 70–80 kg rider. Zwift and TrainerRoad estimates are usually closer to reality than outdoor heart-rate estimates because the trainer controls power precisely.",
      },
      {
        question: "Does body weight affect how many calories cycling burns?",
        answer:
          "Yes. A heavier rider produces more absolute watts at the same relative effort (same W/kg), which means more energy expenditure. A 90 kg rider at 2.5 W/kg (225 W) burns roughly 20% more than a 70 kg rider at 2.5 W/kg (175 W), because the engine is doing more absolute work.",
      },
      {
        question: "Do I burn more calories climbing or on the flat?",
        answer:
          "If your power output is the same, the calorie burn is identical. Climbing tends to produce higher average power because gravity demands it — you cannot coast uphill. The perception of burning more on climbs is real, but it is because you are working harder, not because hills are metabolically special.",
      },
      {
        question: "How many calories does a 100-mile sportive burn?",
        answer:
          "A 100-mile sportive at 5–6 hours of riding typically burns 3,000–4,000 kcal depending on pace, weight, and terrain. That is a genuine fuelling challenge — most riders need 60–90g of carbohydrate per hour to sustain performance over that duration.",
      },
      {
        question: "Is the calories-burned number on my bike computer accurate?",
        answer:
          "With a power meter: yes, within about 5%. Kilojoules measured by a power meter are the gold standard for field energy expenditure. Without a power meter: assume 20–30% overestimate and use the number as a rough guide, not a precise account.",
      },
    ],
    relatedEpisodes: [
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
    ],
    relatedTopics: [
      { label: "Calorie Calculator", href: "/tools/calories" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
      { label: "How Many Calories Cycling Burns — Real Numbers", href: "/blog/how-many-calories-cycling-burns-real-numbers" },
      { label: "How to avoid bonking on long rides", href: "/answers/how-to-avoid-bonking" },
      { label: "Should cyclists track calories or macros?", href: "/answers/cycling-body-composition" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Power-to-calorie conversion is well established in exercise physiology. The kJ-to-kcal equivalence at ~20–25% mechanical efficiency is standard across sports science and World Tour nutritional practice.",
    publishDate: "2026-07-09",
    updatedDate: "2026-07-09",
  },

  // ============================================================
  // 2 — WHAT ARE CYCLING POWER ZONES
  // ============================================================
  {
    slug: "what-are-cycling-power-zones",
    cluster: "power",
    question: "What Are Cycling Power Zones?",
    seoTitle: "What Are Cycling Power Zones? A Plain-English Guide",
    seoDescription:
      "Cycling power zones are intensity bands set from your FTP. They range from Zone 1 (recovery) through Zone 7 (sprint). Each zone trains a different energy system. Here is what they mean and how to use them.",
    pillar: "coaching",
    directAnswer:
      "Power zones are intensity bands calculated from your Functional Threshold Power (FTP) that divide effort into 7 levels: Zone 1 (active recovery, under 55% FTP), Zone 2 (aerobic base, 56–75%), Zone 3 (tempo, 76–90%), Zone 4 (threshold, 91–105%), Zone 5 (VO2max, 106–120%), Zone 6 (anaerobic, 121–150%), and Zone 7 (neuromuscular, 150%+). Each zone targets a different energy system, and structured training prescribes specific zones to produce specific adaptations rather than riding at random intensity.",
    keyTakeaways: [
      "Power zones are intensity brackets set from your FTP — get the FTP right and the zones fall into place.",
      "Zones 2, 4, and 5 carry the bulk of amateur training — aerobic base, threshold development, and VO2max ceiling.",
      "Different platforms use different zone counts (5, 6, or 7) but describe the same underlying physiology.",
      "Training by power zones removes guesswork — you know exactly what adaptation each session targets.",
    ],
    whoFor: [
      {
        label: "The rider who just bought a power meter",
        detail:
          "You have wattage on your screen but no framework for interpreting the numbers or structuring training around them.",
      },
      {
        label: "The heart-rate-trained cyclist moving to power",
        detail:
          "You understand heart rate zones and want to know how power zones differ and why coaches prefer them.",
      },
    ],
    roadmanView: [
      "Power zones are the language of structured training. Before power meters, cyclists trained by feel and heart rate — both of which lag behind effort and are influenced by heat, fatigue, caffeine, and stress. A power meter tells you what you are doing right now, and zones give those numbers meaning.",
      "The 7-zone model most coaches use (based on Andrew Coggan's work) maps to distinct physiological systems. Zone 2 builds mitochondrial density and fat oxidation — the aerobic engine. Zone 4 (threshold) directly builds FTP. Zone 5 (VO2max) lifts the ceiling above threshold. Zones 6 and 7 train the anaerobic and neuromuscular systems used in sprints and short surges. Zone 3 — tempo — sits in no man's land: too hard to recover from quickly, too easy to drive meaningful adaptation. That is why coaches limit time spent there.",
      "The takeaway for most amateurs is straightforward: know your FTP, set your zones, and train with intention. Every session should have a zone target. If your Tuesday ride is Zone 2, stay in Zone 2. If Thursday is 5x4 minutes in Zone 5, hit Zone 5 — not Zone 4 because it feels hard enough. The zones exist to remove the guesswork that makes training a coin flip.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "Power-based training zones are the foundation of every structured training plan worth following. The zones tell you what adaptation you are buying with each session. Without them, training is just riding and hoping.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Professor Stephen Seiler",
        credential: "Exercise physiologist, polarised-training researcher",
        insight:
          "The three-zone polarised model — easy, threshold, VO2max — is a simplification that works because it captures the physiology that matters. Whether you call it 3 zones or 7, the principle is the same: most training easy, a small amount hard, very little in between.",
        episodeSlug: "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
        guestSlug: "stephen-seiler",
      },
    ],
    practicalApplication: [
      {
        title: "Test your FTP to anchor your zones",
        detail:
          "Zones are only as accurate as the FTP they are built from. Do a structured FTP test — a 20-minute test (multiply average power by 0.95) or a ramp test — rested and fuelled. Input the result into TrainingPeaks, Garmin, or your head unit to auto-calculate zones.",
      },
      {
        title: "Programme your head unit with zone alerts",
        detail:
          "Set power zone screens and alerts on your Garmin, Wahoo, or Hammerhead. When a workout prescribes Zone 2, the alert tells you when you drift above it. This is the single most practical step to stop grey-zone riding.",
      },
      {
        title: "Build a weekly structure around three zones",
        detail:
          "For most amateurs, a week needs three ingredients: Zone 2 volume (3–4 rides), one threshold session (Zone 4, e.g. 2x20 min at 95–105% FTP), and one VO2max session (Zone 5, e.g. 5x4 min at 106–120% FTP). That is a complete programme for FTP development.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Setting zones from an old or untested FTP.",
        fix:
          "Retest every 6–8 weeks at the end of a training block. Zones set from a stale FTP mean your Zone 2 might actually be Zone 3, and your threshold work might be too easy to drive adaptation.",
      },
      {
        mistake: "Spending most training time in Zone 3 (tempo).",
        fix:
          "Zone 3 is the grey zone — hard enough to cost recovery but not hard enough to produce meaningful threshold or VO2max adaptation. Limit it to 10–15% of weekly time and keep your easy rides properly easy.",
      },
      {
        mistake: "Ignoring power zones and training by speed instead.",
        fix:
          "Speed is affected by wind, gradient, road surface, and drafting. Power is the direct measure of work. Training by speed means training by conditions, not by physiology.",
      },
    ],
    faq: [
      {
        question: "How many power zones are there in cycling?",
        answer:
          "The most widely used system has 7 zones (Coggan model, used by TrainingPeaks and most coaches). Some coaches use 5 or 6. The polarised model reduces it to 3. The number of zones differs but the underlying physiology is the same — the zones are labels on a continuous effort spectrum.",
      },
      {
        question: "What is the difference between power zones and heart rate zones?",
        answer:
          "Power zones measure what you are doing — the work output right now. Heart rate zones measure how your body responds to that work, which lags by 30–90 seconds and is influenced by heat, fatigue, caffeine, and hydration. Power is the input; heart rate is the response. Coaches prefer power because it is immediate and objective.",
      },
      {
        question: "Can I use power zones without an FTP test?",
        answer:
          "Technically, your power meter app can estimate FTP from ride data, but the zones will be imprecise. A proper FTP test — even a simple 20-minute test — gives a reliable anchor. Without it, you are guessing the foundation that every zone depends on.",
      },
      {
        question: "Do power zones change as fitness improves?",
        answer:
          "Yes. As your FTP rises, all zones shift upward. That is why retesting every 6–8 weeks matters. A rider whose FTP moves from 220 to 240 watts needs to reset zones or their training intensity will be systematically too low.",
      },
      {
        question: "Which power zone builds FTP the fastest?",
        answer:
          "Zone 4 (threshold, 91–105% FTP) directly targets FTP development. Zone 5 (VO2max, 106–120% FTP) lifts the ceiling above threshold, which then lets FTP climb higher. Both are needed — threshold builds the engine, VO2max raises the roof.",
      },
      {
        question: "Should I train in every zone each week?",
        answer:
          "Not necessarily. Most productive amateur weeks involve Zone 2 (volume), Zone 4 (threshold), and Zone 5 (VO2max). Zones 1, 3, 6, and 7 appear occasionally — recovery spins, race-specific work, sprints — but they are not weekly staples for most riders building FTP.",
      },
    ],
    relatedEpisodes: [
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-2148-80-20-training-to-ride-faster-dr-stephen-seiler",
      "ep-2095-secret-to-cycling-fast-at-a-low-heart-rate-prof-seiler",
    ],
    relatedTopics: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "Heart Rate Zone Calculator", href: "/tools/hr-zones" },
      { label: "What percentage of FTP is each zone?", href: "/answers/what-percent-ftp-for-zones" },
      { label: "How do I improve my FTP?", href: "/answers/how-to-improve-ftp" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Coggan's power zone model is the standard across TrainingPeaks, Garmin, and professional coaching. Seiler's polarised framework corroborates the easy/hard distribution principle.",
    publishDate: "2026-07-09",
    updatedDate: "2026-07-09",
  },

  // ============================================================
  // 3 — WHAT IS A GOOD WATTS PER KG FOR CYCLING
  // ============================================================
  {
    slug: "what-is-a-good-watts-per-kg",
    cluster: "ftp",
    question: "What Is a Good Watts per Kg for Cycling?",
    seoTitle: "What Is a Good W/kg for Cycling? Honest Benchmarks",
    seoDescription:
      "A good watts per kilo (W/kg) for cycling depends on your level: recreational riders sit at 2.0–3.0, club racers at 3.0–4.0, strong amateurs at 4.0–5.0. Here are honest benchmarks by level, age, and gender.",
    pillar: "coaching",
    directAnswer:
      "A good W/kg depends on your level: recreational cyclists typically sit at 2.0–3.0 W/kg, club racers and sportive riders at 3.0–4.0 W/kg, competitive amateurs at 4.0–5.0 W/kg, and professional riders at 5.5–6.5+ W/kg. For women, the same category boundaries apply — the raw watt numbers differ but the W/kg benchmarks are broadly consistent. The number that matters most is whether yours is moving upward over time, not where it sits on someone else's scale.",
    keyTakeaways: [
      "2.0–3.0 W/kg is recreational; 3.0–4.0 is club racer; 4.0+ is competitive amateur; 5.5+ is professional.",
      "W/kg is the single most useful performance metric for cyclists — raw watts without body weight context is meaningless.",
      "W/kg benchmarks decline roughly 1% per year after 35, making age-adjusted comparison more honest.",
      "Improving W/kg comes from raising FTP, managing body composition, or both — but fuelling training properly is non-negotiable.",
    ],
    whoFor: [
      {
        label: "The rider who wants to know where they stand",
        detail:
          "You have an FTP and a body weight and want an honest assessment of how that stacks up against meaningful benchmarks.",
      },
      {
        label: "The sportive rider setting a training target",
        detail:
          "You want to know what W/kg you need to complete or be competitive in a specific type of event.",
      },
    ],
    roadmanView: [
      "Watts per kilogram is the honest number in cycling. It strips away the misleading comparisons that raw watts invite — the 95 kg rider boasting 300 watts is 3.15 W/kg, while the 62 kg rider at 260 watts is 4.19 W/kg and riding away on every climb. The lighter rider is categorically stronger in cycling terms. Until you express power relative to body weight, the number is meaningless.",
      "Anthony uses W/kg as the primary benchmark when discussing performance on the podcast, and the coaches he interviews — Friel, Barrett, Wakefield — all frame amateur development in W/kg terms. The recreational rider who trains 5–6 hours a week and has been riding a couple of years will typically sit at 2.5–3.0 W/kg. The committed club racer training 8–12 hours sits at 3.0–4.0. The sharp end of amateur racing — Cat 1–2, the front of the sportive — is 4.0–4.5. And above 4.5 W/kg you are properly strong for an amateur.",
      "The two levers to improve W/kg are FTP (raise the numerator) and body composition (manage the denominator). The mistake is chasing the denominator by under-eating, which suppresses the training that raises the numerator. Build power first, let body composition follow from fuelled training and sensible nutrition, and the W/kg takes care of itself.",
    ],
    expertEvidence: [
      {
        name: "Joe Friel",
        credential: "Author of The Cyclist's Training Bible; co-founder of TrainingPeaks",
        insight:
          "W/kg is the only meaningful performance benchmark for cyclists. His training system categorises riders from recreational through professional using W/kg as the structuring principle, and the benchmarks have remained consistent across decades of coaching data.",
        episodeSlug: "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
        guestSlug: "joe-friel",
      },
      {
        name: "Stephen Barrett",
        credential: "Head coach, Decathlon AG2R La Mondiale (UCI WorldTour)",
        insight:
          "At the WorldTour level, GC contenders sustain 6.0–6.5 W/kg on major climbs. The gap between a strong amateur at 4.5 W/kg and a professional at 6.0 W/kg looks small on paper but represents years of full-time training and genetic ceiling. For amateurs, targeting one W/kg category above current level is the productive goal.",
        episodeSlug: "ep-38-world-tour-coach-s-most-valuable-training-secrets-revealed",
        guestSlug: "stephen-barrett",
      },
    ],
    practicalApplication: [
      {
        title: "Calculate your current W/kg",
        detail:
          "Divide your most recent FTP (in watts) by your body weight (in kilograms). A 240 W FTP at 78 kg is 3.08 W/kg. Record this alongside the date, your FTP, and your weight. This is your baseline.",
      },
      {
        title: "Set a realistic target for your next training block",
        detail:
          "Aim to move up 0.2–0.3 W/kg per 12-week block. That means either a 15–20 W FTP gain at the same weight, or a smaller FTP gain plus sensible body composition improvement. Do not target more than 0.5 W/kg improvement in a single block — that pace is unsustainable.",
      },
      {
        title: "Track W/kg over months, not weeks",
        detail:
          "Retest FTP every 6–8 weeks after a deload. Weigh yourself first thing in the morning on the same day. Plot W/kg across four or more blocks — the trend line is your real progress signal, not any single data point.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Chasing W/kg by losing weight instead of building power.",
        fix:
          "Under-fuelled training suppresses the hard sessions that raise FTP. Build power first through structured training and proper nutrition. Let body composition improve as a consequence, not a target.",
      },
      {
        mistake: "Comparing W/kg with riders 20 years younger.",
        fix:
          "Power typically peaks in the late 20s and declines roughly 1% per year after 35. A 50-year-old at 3.5 W/kg is performing at a level equivalent to 4.0+ W/kg at 30. Age-adjusted comparison is the honest benchmark.",
      },
      {
        mistake: "Fixating on a W/kg number without training context.",
        fix:
          "A 4.0 W/kg from a fresh test after a recovery week is not the same as 4.0 W/kg during a hard training block. Test conditions matter. The comparison is only meaningful when the testing protocol is consistent.",
      },
    ],
    faq: [
      {
        question: "What W/kg do I need for a sportive?",
        answer:
          "Most riders can complete a 100-mile sportive comfortably at 2.5–3.0 W/kg. To be competitive in the general classification, target 3.5–4.0 W/kg. For mountain sportives with sustained climbing (L'Etape, Marmotte), 3.5+ W/kg is where the experience shifts from survival to enjoyment.",
      },
      {
        question: "Is 3 W/kg good for cycling?",
        answer:
          "3.0 W/kg is solid recreational-to-club level. It means you are trained, not a beginner, and capable of completing long rides and sportives comfortably. Most dedicated amateurs pass through 3.0 W/kg within their first 1–2 years of structured training.",
      },
      {
        question: "Is 4 W/kg good for an amateur cyclist?",
        answer:
          "4.0 W/kg is legitimately strong for an amateur. It places you at the sharp end of club racing and competitive sportives. Reaching 4.0 typically requires 2–3 years of structured training at 8–12 hours a week, quality nutrition, and genuine consistency.",
      },
      {
        question: "What is a good W/kg for a female cyclist?",
        answer:
          "W/kg benchmarks by category are broadly the same for women: recreational 2.0–3.0, club racer 3.0–3.8, competitive amateur 3.8–4.5. Raw watt numbers are typically 10–15% lower than male counterparts at the same W/kg due to body composition differences, but the W/kg performance mapping is consistent.",
      },
      {
        question: "Does W/kg only matter for climbing?",
        answer:
          "W/kg is most decisive on climbs, where gravity directly penalises extra weight. On the flat, raw watts and aerodynamics matter more. But W/kg remains the single best proxy for overall cycling fitness because most real-world courses include gradient changes.",
      },
      {
        question: "How much can I improve my W/kg in a year?",
        answer:
          "A first-year structured trainer can realistically improve 0.5–1.0 W/kg in 12 months. An experienced rider with several years of training might gain 0.2–0.4 W/kg per year with dedicated work. Gains slow as you approach your physiological ceiling — expect diminishing returns after year 3.",
      },
    ],
    relatedEpisodes: [
      "ep-38-world-tour-coach-s-most-valuable-training-secrets-revealed",
      "ep-40-how-joe-friel-structures-the-ideal-cycling-training-week",
      "ep-1-5-fixable-reasons-your-losing-power-as-you-age",
    ],
    relatedTopics: [
      { label: "W/kg Calculator", href: "/tools/wkg" },
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "What is a good FTP for a cyclist?", href: "/answers/what-is-a-good-ftp" },
      { label: "FTP vs Watts Per Kilo", href: "/answers/ftp-vs-watts-per-kg" },
      { label: "Age-Group FTP Benchmarks 2026", href: "/blog/age-group-ftp-benchmarks-2026" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "W/kg benchmarks are consistent across TrainingPeaks, British Cycling, and professional coaching data. Individual variation is significant — genetic ceiling, training history, and age all modulate outcomes.",
    publishDate: "2026-07-09",
    updatedDate: "2026-07-09",
  },
];
