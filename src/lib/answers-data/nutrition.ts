import type { AnswerPage } from "@/lib/answers";

export const nutritionAnswers: AnswerPage[] = [
  // ============================================================
  // 1 — WHAT TO EAT AFTER A RIDE
  // ============================================================
  {
    slug: "what-to-eat-after-cycling",
    cluster: "nutrition",
    question: "What Should I Eat After a Ride?",
    seoTitle: "What to Eat After a Ride — The Recovery Nutrition That Works",
    seoDescription:
      "What to eat after cycling: 20–40g of protein and 1–1.2g/kg of carbs within 30–60 minutes. The recovery window that matters, the foods that work, and the mistake most riders make.",
    pillar: "nutrition",
    directAnswer:
      "Eat 20–40g of protein and 1–1.2g of carbs per kg of bodyweight within 30–60 minutes of finishing a hard or long ride. This is the recovery window where muscle protein synthesis and glycogen replenishment are most efficient. A meal of rice, chicken and vegetables, or a recovery shake followed by a full meal, both work. The biggest mistake is skipping the window entirely.",
    keyTakeaways: [
      "Aim for 20–40g protein and 1–1.2g/kg carbs within 30–60 minutes post-ride.",
      "The recovery window matters most after sessions over 90 minutes or hard intervals.",
      "Real food works as well as shakes — prioritise getting something in, not the perfect thing.",
      "Masters cyclists over 40 need the upper end of the protein range; muscle responds more slowly with age.",
    ],
    whoFor: [
      {
        label: "The rider who skips the post-ride meal",
        detail:
          "You come home from a hard session, shower, and eat an hour or two later — wondering why recovery is slow.",
      },
      {
        label: "The masters cyclist protecting adaptation",
        detail:
          "You are over 40 and want to get the most from every hard session, especially with back-to-back training days.",
      },
    ],
    roadmanView: [
      "The post-ride window is real, and most amateurs throw it away. Anthony has tested it personally and covered it repeatedly on the podcast — the riders who prioritise eating within 30 minutes of a hard session recover faster, sleep better, and get more from the next day's ride. It is not complicated nutrition science; it is just showing up for the window.",
      "The protein number matters more than the source. Chicken and rice, Greek yoghurt with a banana, a recovery shake, eggs on toast — all work. What does not work is arriving home and waiting two hours because you are not hungry. Post-exercise appetite suppression is real, but your muscles are not waiting for you to feel peckish.",
      "For riders over 40, Dr Michael Ormsbee's research makes the case clearly: older muscle is less sensitive to protein stimulus, so you need more of it, more often. The 20g that was plenty at 25 may not be enough at 50. Aim for the upper end of the range — 35–40g — and pair it with carbohydrate so the protein actually goes to work on repair rather than being burned for fuel.",
    ],
    expertEvidence: [
      {
        name: "Dr Michael Ormsbee",
        credential: "Sports nutrition researcher, Florida State University",
        insight:
          "Post-exercise protein timing is one of the highest-leverage nutrition habits for cyclists, particularly older athletes. Muscle protein synthesis rates are elevated after exercise, and providing protein within that window — especially before bed for recovery overnight — accelerates adaptation compared to delayed feeding.",
        episodeSlug: "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
        guestSlug: "michael-ormsbee",
      },
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "Recovery nutrition is not optional for riders training more than once a day or on consecutive hard days. The carbohydrate component restores glycogen so the next session starts full; the protein component initiates repair. Both windows — immediately post-ride and before sleep — are worth targeting.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
    ],
    practicalApplication: [
      {
        title: "Get something in within 30 minutes",
        detail:
          "Keep a recovery option ready before you leave — a Greek yoghurt and banana, a shake, or a pre-prepared meal. The goal is protein and carbs in the window, not perfection. Something beats nothing.",
      },
      {
        title: "Hit 20–40g of protein at the post-ride meal",
        detail:
          "For a real meal: a large chicken breast or two eggs plus Greek yoghurt will hit the range. For a shake: most whey products deliver 20–25g per scoop, so two scoops or one scoop plus a glass of milk covers it.",
      },
      {
        title: "Add a high-protein snack before bed",
        detail:
          "For hard days or back-to-back sessions, 30–40g of protein before sleep — cottage cheese, Greek yoghurt, or a casein shake — extends the recovery stimulus overnight, especially valuable for masters cyclists.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Waiting until hunger returns before eating after a hard session.",
        fix:
          "Post-exercise appetite suppression can last 1–2 hours. Eat by the clock, not hunger — 30 minutes post-ride regardless of how you feel.",
      },
      {
        mistake: "Prioritising carbs and skipping protein in the recovery meal.",
        fix:
          "Both matter. Carbs restore glycogen; protein drives repair. A banana alone is not a recovery meal.",
      },
      {
        mistake: "Treating easy recovery rides like hard sessions nutritionally.",
        fix:
          "Easy rides do not need the same urgency. A normal meal within an hour is fine after a gentle spin. Save the recovery-window focus for hard sessions and long rides.",
      },
    ],
    faq: [
      {
        question: "How long is the recovery window after cycling?",
        answer:
          "The most sensitive window is within 30–60 minutes of finishing, when glycogen resynthesis and muscle protein synthesis rates are highest. After two hours the opportunity has not disappeared, but the rate of recovery per gram of food slows. For hard or long sessions, aim to eat within the hour.",
      },
      {
        question: "Is a protein shake better than real food after a ride?",
        answer:
          "Neither is superior if the protein and carb content is similar. Shakes are faster and more convenient when appetite is low or time is tight; real food provides micronutrients and tends to keep you fuller. Most riders do best with a small shake or snack immediately, then a full meal an hour later.",
      },
      {
        question: "How much carbohydrate should I eat after cycling?",
        answer:
          "Roughly 1–1.2g per kg of bodyweight in the first hour after a ride over 90 minutes or a hard session. For a 75kg rider that is 75–90g of carbs — the equivalent of two cups of rice, or a bagel and a banana. Scale down for shorter or easier rides.",
      },
      {
        question: "Does the recovery window matter if I am not training again until tomorrow?",
        answer:
          "Yes, though less urgently. If you have more than 24 hours until your next hard session, glycogen replenishment will happen over the day regardless. But protein intake in the window still drives overnight muscle repair. A normal balanced meal within 1–2 hours is fine.",
      },
      {
        question: "What if I am trying to lose weight — should I still eat after rides?",
        answer:
          "Yes. Skipping post-ride nutrition to save calories backfires: it suppresses muscle protein synthesis, slows recovery, and often leads to larger compensatory meals later. Keep the recovery meal, control the rest of the day instead.",
      },
      {
        question: "Do I need supplements for cycling recovery?",
        answer:
          "Whole food covers it for most riders. The supplements with the strongest evidence for recovery are protein (if you struggle to hit targets from food) and creatine (for strength and high-intensity recovery). Everything else is a distant second to consistent meals and sleep.",
      },
    ],
    relatedEpisodes: [
      "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-31-5-things-pogacar-always-does-after-a-ride",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Bedtime Protein for Recovery", href: "/blog/bedtime-protein-cyclists-recovery-protocol" },
      { label: "What to eat before a long ride", href: "/answers/what-to-eat-before-cycling" },
      { label: "How much protein do cyclists need?", href: "/answers/how-much-protein-do-cyclists-need" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Post-exercise protein and carbohydrate timing is well established in sports nutrition literature; corroborated by Dr Michael Ormsbee and Dr Sam Impey.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 2 — HOW MUCH PROTEIN DO CYCLISTS NEED
  // ============================================================
  {
    slug: "how-much-protein-do-cyclists-need",
    cluster: "nutrition",
    question: "How Much Protein Do Cyclists Need?",
    seoTitle: "How Much Protein Do Cyclists Need? The Honest Answer",
    seoDescription:
      "Cyclists need 1.6–2.2g of protein per kg per day — more than the general population recommendation. Why timing matters, what masters athletes need, and the foods that hit the target.",
    pillar: "nutrition",
    directAnswer:
      "Cyclists need 1.6–2.2g of protein per kg of bodyweight per day — roughly double the general population recommendation of 0.8g/kg. Training breaks muscle down; protein rebuilds it. Masters cyclists over 40 need the upper end of that range, around 2–2.4g/kg, because older muscle is less sensitive to protein stimulus. Spread intake across 3–4 meals of 30–40g rather than loading it all at dinner.",
    keyTakeaways: [
      "Target 1.6–2.2g of protein per kg per day as a serious amateur.",
      "Over 40, aim for 2–2.4g/kg — muscle protein synthesis becomes less efficient with age.",
      "Spread protein across 3–4 meals rather than concentrating it in one sitting.",
      "A 30–40g serving before bed extends the overnight repair stimulus on hard training days.",
    ],
    whoFor: [
      {
        label: "The cyclist who focuses on carbs and ignores protein",
        detail:
          "You eat plenty of pasta and gels but rarely think about protein — and recovery feels slower than it should.",
      },
      {
        label: "The masters rider losing muscle",
        detail:
          "You are over 40 and noticing that power retention is getting harder despite consistent training.",
      },
    ],
    roadmanView: [
      "The cycling world has a carbohydrate obsession, and rightly so — carbs are the fuel. But protein is the builder, and most serious amateurs under-eat it. The typical number Anthony sees from riders who track their food sits at 1.0–1.2g/kg, which is fine for a sedentary person and too low for someone doing four to six hours a week on the bike.",
      "Dr Michael Ormsbee's research on nighttime protein changed Anthony's own habits. Taking 30–40g of casein or Greek yoghurt before sleep is not a bodybuilding trick — it is a recovery lever that the cycling world was slow to adopt. The protein extends the synthesis window overnight instead of letting your muscles sit in repair limbo while your stomach is empty for eight hours.",
      "For masters athletes, the conversation is even more pointed. Muscle anabolic resistance after 40 means you need more protein per meal to get the same muscle-building response you got at 25. Eating the same amount you did a decade ago, distributed the same way, produces less adaptation. The fix is simple: more at each sitting, one more sitting per day, and a hit before sleep.",
    ],
    expertEvidence: [
      {
        name: "Dr Michael Ormsbee",
        credential: "Sports nutrition researcher, Florida State University",
        insight:
          "Nighttime protein intake — specifically 30–40g of a slow-digesting source like casein before sleep — measurably improves overnight muscle protein synthesis compared to going to bed without it. For cyclists training hard on consecutive days, this is a meaningful recovery difference.",
        episodeSlug: "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
        guestSlug: "michael-ormsbee",
      },
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "World Tour riders are guided to 1.8–2.2g/kg of protein during training blocks, with distribution across the day prioritised over total daily intake alone. An athlete who hits 2g/kg but eats it all at dinner misses the stimulus that comes from feeding muscle regularly throughout the day.",
        episodeSlug: "ep-14-i-tried-eating-like-pidcock-for-60-days-here-s-what-happened",
        guestSlug: "sam-impey",
      },
    ],
    practicalApplication: [
      {
        title: "Calculate your daily target",
        detail:
          "Multiply your bodyweight in kg by 1.8 as a starting point. A 75kg rider targets 135g/day. Divide across four meals — roughly 30–35g per sitting. Use a food diary for a week to see where you actually land; most riders are surprised how short they fall.",
      },
      {
        title: "Anchor each meal with a protein source",
        detail:
          "Breakfast: eggs, Greek yoghurt, or cottage cheese. Lunch: chicken, fish, or legumes. Post-ride: a shake or high-protein snack. Dinner: a palm-sized serving of animal protein or equivalent plant sources. Each meal should deliver 25–40g.",
      },
      {
        title: "Add a bedtime protein hit on hard training days",
        detail:
          "200g of Greek yoghurt, 150g of cottage cheese, or a casein shake before sleep delivers 30–40g of slow-release protein and extends the overnight repair window. This one change alone moves the needle for riders who currently eat nothing after dinner.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Hitting a 1.0g/kg protein target because it matches general health guidelines.",
        fix:
          "Endurance athletes need nearly twice the general recommendation. Double your target and track a few days to confirm you are hitting it.",
      },
      {
        mistake: "Eating most protein at dinner and little throughout the day.",
        fix:
          "Muscle protein synthesis is driven by individual meal doses, not daily total alone. Spread 25–40g across each of three to four meals.",
      },
      {
        mistake: "Relying on carb-heavy recovery foods with no protein component.",
        fix:
          "A banana and an energy bar after a ride covers carbohydrate but does nothing for muscle repair. Add a protein source — a shake, eggs, or Greek yoghurt — to every post-ride snack.",
      },
    ],
    faq: [
      {
        question: "Can I get enough protein as a plant-based cyclist?",
        answer:
          "Yes, but it requires more planning. Plant proteins are generally less complete and lower in leucine, the amino acid that most strongly triggers muscle protein synthesis. Aim for the upper end of the range — 2–2.4g/kg — and combine sources (legumes with grains, soy protein, tofu) to cover all essential amino acids.",
      },
      {
        question: "Will eating more protein make me gain weight?",
        answer:
          "Protein has the highest satiety value of the macronutrients, so replacing some carbs or fat with protein often reduces overall calorie intake rather than increasing it. For cyclists trying to lose weight, higher protein intake while training hard helps preserve muscle during a calorie deficit.",
      },
      {
        question: "Is whey protein better than food for cyclists?",
        answer:
          "Whey is a convenient, fast-digesting source that works well post-ride when appetite is low. For daily intake, whole food sources are equally effective and provide micronutrients that a shake does not. Use shakes to plug gaps, not as a replacement for meals.",
      },
      {
        question: "How much protein is too much for a cyclist?",
        answer:
          "There is no strong evidence that intakes up to 3g/kg cause harm in healthy adults. Practically, the law of diminishing returns kicks in above 2.2g/kg for most cyclists. More protein above that threshold does not drive more adaptation — the extra calories are better spent on carbohydrate for fuel.",
      },
      {
        question: "Does protein timing around rides matter?",
        answer:
          "Yes, but not as precisely as supplement marketing suggests. The most important windows are within 30–60 minutes post-exercise and before sleep. Getting protein at every meal across the day matters more than hitting an exact minute post-ride.",
      },
      {
        question: "Do masters cyclists really need more protein than younger riders?",
        answer:
          "Research is clear: muscle protein synthesis becomes less efficient after 40, requiring a higher protein dose per meal to achieve the same response. Aim for 2.0–2.4g/kg and prioritise larger individual servings of 35–40g rather than the 20–25g that was sufficient at a younger age.",
      },
    ],
    relatedEpisodes: [
      "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
      "ep-14-i-tried-eating-like-pidcock-for-60-days-here-s-what-happened",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Cycling Protein Requirements", href: "/blog/cycling-protein-requirements" },
      { label: "What to eat after a ride", href: "/answers/what-to-eat-after-cycling" },
      { label: "Best recovery foods for cyclists", href: "/answers/best-recovery-foods-cyclists" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Protein requirements for endurance athletes are well established at 1.6–2.2g/kg; masters protein research corroborated by Dr Michael Ormsbee.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 3 — HOW TO CARB-LOAD BEFORE AN EVENT
  // ============================================================
  {
    slug: "how-to-carb-load-before-an-event",
    cluster: "nutrition",
    question: "How Do I Carb-Load Before an Event?",
    seoTitle: "How to Carb-Load Before a Cycling Event — The Protocol That Works",
    seoDescription:
      "How to carb-load before a cycling event: 10–12g of carbs per kg over 24–48 hours, low fibre, low fat. When it helps, when it doesn't, and the amateur mistakes that wreck it.",
    pillar: "nutrition",
    directAnswer:
      "For events over 90 minutes, carb-load with 8–12g of carbohydrate per kg of bodyweight in the 24–48 hours before, choosing low-fibre, low-fat foods so your gut is clear and your glycogen stores are topped. Pasta, white rice, bread, potatoes and sports drinks all work. For events under 90 minutes, carb-loading delivers no meaningful benefit. Don't debut a new fuelling protocol on race day.",
    keyTakeaways: [
      "Carb-load with 8–12g of carbs per kg over 24–48 hours before events longer than 90 minutes.",
      "Choose low-fibre, low-fat foods — white rice, pasta, bread — so digestion is clean.",
      "For events under 90 minutes, carb-loading adds no meaningful performance benefit.",
      "Practice the protocol in training first; never try a new approach on race morning.",
    ],
    whoFor: [
      {
        label: "The sportive and gran fondo rider",
        detail:
          "You are heading into a 3–5 hour event and want to arrive at the start with full glycogen stores.",
      },
      {
        label: "The rider who has never carb-loaded deliberately",
        detail:
          "You eat pasta the night before out of habit but have no structured protocol or quantities in mind.",
      },
    ],
    roadmanView: [
      "The classic pasta dinner the night before a race is well-intentioned but usually under-delivered. Anthony has talked about this on the podcast and tested it himself — a single big dinner gets nowhere near the 8–12g/kg carbohydrate target that maximises glycogen loading. One meal is not enough. You need 24–48 hours of deliberate, high-carb, low-fat, low-fibre eating.",
      "The pro approach, which Dr Sam Impey has covered on the podcast, is systematic: cut training in the two to three days before the event, eat white rice or pasta and bread at every meal, top up with sports drinks, and consciously reduce fibre and fat so your gut is clean at the start line. You are not aiming for a celebratory dinner — you are manufacturing a physiological state.",
      "There is also an important negative: if your event is under 90 minutes, skip the whole exercise. Glycogen depletion simply does not happen in a 60-minute crit or a short TT, and over-eating carbs the day before just bloats you and disrupts sleep. Save carb-loading for the rides and events that actually tax your stores.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "Carbohydrate loading before long events is one of the few nutrition strategies with strong, consistent evidence behind it. The mechanism is simple — you top up glycogen stores above their resting level, which delays fatigue in efforts over 90 minutes. The failure mode is always the same: not eating enough carbs, eating too much fat and fibre alongside them, and trying it for the first time on race day.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "Dr Tim Podlogar",
        credential: "Nutrition consultant to Tudor Pro Cycling",
        insight:
          "The quantitative target matters: 8–12g/kg over 24–48 hours is the range that produces meaningful glycogen super-compensation. A single large pasta dinner typically delivers 3–4g/kg at best. Riders who hit the real target start events with a measurable advantage in sustained power.",
        episodeSlug: "ep-3-is-losing-weight-actually-making-you-slower",
        guestSlug: "tim-podlogar",
      },
    ],
    practicalApplication: [
      {
        title: "Calculate your carb target for the 48 hours before",
        detail:
          "Take your bodyweight in kg and multiply by 10. A 75kg rider needs 750g of carbohydrate over the two days — split roughly 375g each day. White rice, pasta, bread, potatoes, and sports drinks are your tools. Track it the first time you do this — most riders are shocked how far short a 'big pasta dinner' falls.",
      },
      {
        title: "Cut fibre and fat over those 48 hours",
        detail:
          "Swap brown rice for white, wholegrain bread for white, and avoid salads, raw veg, and high-fat sauces. The goal is for your gut to be light and empty at the start, not processing a high-fibre meal. Keep protein moderate; you are not building muscle in this window.",
      },
      {
        title: "Practice the protocol before a B-event",
        detail:
          "Run the full carb-loading protocol before a lower-stakes long ride or a B-race to test how your gut responds and what foods work best for you. Never debut it at your target event.",
      },
    ],
    commonMistakes: [
      {
        mistake: "One big pasta dinner and calling it carb-loading.",
        fix:
          "A single meal hits 3–4g/kg at best. You need 8–12g/kg across 24–48 hours. Eat carbs at every meal and top up with drinks.",
      },
      {
        mistake: "Eating high-fibre foods and salads while 'carb-loading'.",
        fix:
          "Fibre sits in your gut and adds weight without adding usable glycogen. Switch to low-fibre white rice, bread, and pasta for the 24–48 hours before the event.",
      },
      {
        mistake: "Carb-loading before events under 90 minutes.",
        fix:
          "Glycogen depletion is not the limiter for short efforts. Save the protocol for events that actually run your stores down.",
      },
    ],
    faq: [
      {
        question: "Does carb-loading work for cycling?",
        answer:
          "Yes — for events over 90 minutes it is one of the best-evidenced nutrition strategies in endurance sport. It delays glycogen depletion and maintains power output in the back half of long rides. It produces no measurable benefit for shorter efforts.",
      },
      {
        question: "What foods are best for carb-loading?",
        answer:
          "White rice, white pasta, white bread, potatoes, bagels, sports drinks, and rice cakes. The goal is high carbohydrate, low fibre, low fat. Save your brown rice and wholegrain bread for after the event.",
      },
      {
        question: "Should I eat more than normal during carb-loading?",
        answer:
          "Yes — 8–12g/kg is significantly above a normal eating day for most cyclists. You will feel fuller than usual and may gain 1–2kg of water weight, which is the glycogen being stored with water. This is normal and not real weight gain.",
      },
      {
        question: "How long before a race should I start carb-loading?",
        answer:
          "Start 48 hours before for most events, reducing training simultaneously. For an event on Saturday morning, begin increased carb intake on Thursday evening and continue through Friday. Race morning is the final top-up, not the start of loading.",
      },
      {
        question: "Can I carb-load on a plant-based diet?",
        answer:
          "Easily — rice, pasta, bread, potatoes, and bananas are all plant-based. The challenge is avoiding high-fibre plant foods like legumes and raw vegetables in the 48 hours before, since fibre will slow digestion and leave you heavy at the start.",
      },
      {
        question: "Will I gain weight from carb-loading?",
        answer:
          "Expect to gain 1–2kg temporarily. Every gram of glycogen is stored with roughly 3g of water, so topping up your stores adds water weight. It disappears as you burn the glycogen during the event. Don't panic at the scales the morning before a race.",
      },
    ],
    relatedEpisodes: [
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-3-is-losing-weight-actually-making-you-slower",
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Race Week Carb Loading Protocol", href: "/blog/cycling-carb-loading-protocol-race-week" },
      { label: "What to eat before a long ride", href: "/answers/what-to-eat-before-cycling" },
      { label: "How many carbs per hour for cycling?", href: "/answers/carbs-per-hour-cycling" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Carbohydrate loading for endurance events is strongly supported in the literature; quantitative targets corroborated by Dr Sam Impey and Dr Tim Podlogar.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 4 — LOSE WEIGHT WITHOUT LOSING POWER
  // ============================================================
  {
    slug: "lose-weight-without-losing-power",
    cluster: "nutrition",
    question: "How Do I Lose Weight Without Losing Power?",
    seoTitle: "How to Lose Weight Without Losing Cycling Power",
    seoDescription:
      "How to lose weight without losing power on the bike: a small daily calorie deficit of 200–300 kcal, full fuelling on hard sessions, and high protein. What World Tour nutritionists actually prescribe.",
    pillar: "nutrition",
    directAnswer:
      "Lose weight without losing power by creating a small daily deficit — 200–300 kcal — through moderate off-bike adjustments, while fully fuelling every hard and long training session. Never under-fuel the work itself. Eat 1.8–2.2g of protein per kg to preserve muscle, cut easy-ride fuel while keeping race-fuel intact, and lose at a rate of 0.3–0.5kg per week. Faster than that and muscle goes with the fat.",
    keyTakeaways: [
      "A 200–300 kcal daily deficit produces safe, sustainable loss without muscle compromise.",
      "Fully fuel hard and long sessions — the deficit comes from easy days and off-bike meals, not training.",
      "1.8–2.2g of protein per kg per day protects muscle while in a deficit.",
      "Aim for 0.3–0.5kg per week loss. Faster than that and power drops with the weight.",
    ],
    whoFor: [
      {
        label: "The rider chasing better watts per kilo",
        detail:
          "You want to improve climbing and race performance by reducing body fat without compromising the training that builds power.",
      },
      {
        label: "The cyclist stuck in the weight-loss trap",
        detail:
          "You have tried restricting calories but always end up slower, flatter, and frustrated. You suspect you are doing it wrong.",
      },
    ],
    roadmanView: [
      "The most common weight-loss mistake Anthony sees is riders trying to lose weight and train hard at the same time — cutting calories across the board, showing up to intervals half-fuelled, and wondering why their FTP is falling. Dr David Dunne said it on the podcast clearly: you cannot simultaneously create adaptation and aggressively restrict energy. The body chooses survival over performance.",
      "The framework that works in the World Tour, and the one Anthony has used personally, is 'fuel for the work required.' Hard sessions and long rides get full carbohydrate support. The deficit comes from easier days — lower-intensity rides where glycogen is not the limiter — and from off-bike meals, not from training. You are not eating less training food; you are eating smarter across the whole day.",
      "The protein piece is equally important and often overlooked. In a calorie deficit, your body will cannibalise muscle for fuel if protein intake drops. Keeping it at 1.8–2.2g/kg while in a deficit is the difference between losing fat with power intact and losing fat with power alongside it. Alex Larson has talked about this extensively — the riders who get lean and stay fast are the ones who protect protein religiously.",
    ],
    expertEvidence: [
      {
        name: "Dr David Dunne",
        credential: "Performance nutritionist to INEOS Grenadiers, EF Education, and Uno-X",
        insight:
          "The fundamental error in most amateur weight-loss attempts is applying a calorie deficit uniformly across the training week. World Tour nutrition periodises energy availability around the work: high carbohydrate availability on hard days, moderate restriction on easy days. The result is body composition improvement without the power loss that comes from chronically under-fuelling training.",
        episodeSlug: "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
        guestSlug: "david-dunne",
      },
      {
        name: "Alex Larson",
        credential: "Sports dietitian specialising in body composition for cyclists",
        insight:
          "Cyclists who lose weight and keep power share two habits: they never under-fuel hard sessions, and they eat high protein consistently. The ones who lose power are the ones who restrict uniformly, go low on protein, and end up in a chronic low-energy availability state that suppresses adaptation.",
        episodeSlug: "ep-2088-how-cyclists-can-get-lean-stay-lean-forever-alex-larson",
        guestSlug: "alex-larson",
      },
    ],
    practicalApplication: [
      {
        title: "Fuel training sessions as normal — cut elsewhere",
        detail:
          "Do not reduce carbohydrate intake on hard or long ride days. On easy ride days and rest days, reduce portion sizes at main meals by 200–300 kcal versus your normal intake. The training gets its fuel; the deficit comes from non-training hours.",
      },
      {
        title: "Protect protein at every meal",
        detail:
          "1.8–2.2g/kg of protein per day is the floor while losing weight. For a 75kg rider that is 135–165g/day. Anchor every meal with a lean protein source — chicken, fish, Greek yoghurt, eggs, legumes — so your body preserves muscle even when calories are restricted.",
      },
      {
        title: "Weigh weekly, not daily, and target 0.3–0.5kg per week",
        detail:
          "Daily weight swings of 1–2kg from glycogen and water are normal and meaningless. Track a weekly average over four weeks. If you are losing more than 0.5kg/week consistently, eat slightly more on easy days — the pace is too aggressive.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Cutting carbs before and during hard sessions to 'burn more fat'.",
        fix:
          "Under-fuelling intervals and threshold sessions blunts adaptation and drops power. Fuel the hard work fully; apply the deficit elsewhere.",
      },
      {
        mistake: "Cutting calories uniformly on all days including race days.",
        fix:
          "Periodise energy around the work. Full carb availability on training days, moderate restriction on easy days and rest days.",
      },
      {
        mistake: "Going low on protein to reduce calories.",
        fix:
          "Protein is the most calorie-efficient way to preserve muscle in a deficit. Cutting it to save calories is a false economy that costs you the power you are trying to protect.",
      },
    ],
    faq: [
      {
        question: "How much weight do I need to lose to improve my cycling?",
        answer:
          "A 1kg reduction in body fat yields roughly 0.01–0.02 W/kg improvement on climbs, depending on gradient. A 70kg rider dropping 5kg might gain 5–10 seconds per kilometre on a steep climb. The benefit is real but modest — power gains from training usually trump small weight changes.",
      },
      {
        question: "Is it possible to lose weight and gain fitness at the same time?",
        answer:
          "Yes, in certain conditions — especially for newer, heavier cyclists or those returning to training. Well-trained athletes at race weight cannot easily do both simultaneously. The practical approach is a focused build phase fuelled properly, then a moderate body-composition phase off-season or between build blocks.",
      },
      {
        question: "Can I use fasted riding to lose weight?",
        answer:
          "Short, easy fasted rides can modestly increase fat oxidation but the effect on long-term body composition is small. The problem is that fasted training often leads to worse-quality hard sessions and compensatory eating later. Most evidence suggests total calorie balance and protein intake matters far more than timing.",
      },
      {
        question: "What is the Fuel for the Work Required approach?",
        answer:
          "It means matching carbohydrate intake to the demands of each session rather than eating the same amount every day. Hard sessions and races get full carbohydrate support; easy sessions and rest days use lower carb availability. The result is better training quality and gradual body composition improvement.",
      },
      {
        question: "Do I need to count calories to lose weight while cycling?",
        answer:
          "Not necessarily. Tracking is useful for a few weeks to establish baselines and spot under-fuelling. After that, many riders manage on intuitive portion control with high protein and the rule of fuelling hard sessions fully. The tracking phase is educational; it does not have to be permanent.",
      },
    ],
    relatedEpisodes: [
      "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
      "ep-2088-how-cyclists-can-get-lean-stay-lean-forever-alex-larson",
      "ep-3-is-losing-weight-actually-making-you-slower",
    ],
    relatedTopics: [
      { label: "Cycling Weight Loss — Topic Hub", href: "/topics/cycling-weight-loss" },
      { label: "Body Composition for Cyclists", href: "/blog/body-composition-cyclists-lighter-faster-myth" },
      { label: "Fuel for the Work Required Explained", href: "/answers/fuel-for-the-work-required" },
      { label: "Race Weight Calculator", href: "/tools/race-weight" },
      { label: "Weight Loss vs FTP Gain", href: "/compare/weight-loss-vs-ftp-gain" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Energy periodisation and protein preservation during caloric restriction are well supported; corroborated by Dr David Dunne and Alex Larson.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 5 — IS FASTED RIDING WORTH IT
  // ============================================================
  {
    slug: "is-fasted-riding-worth-it",
    cluster: "nutrition",
    question: "Is Fasted Riding Worth It?",
    seoTitle: "Is Fasted Riding Worth It? The Evidence for Cycling",
    seoDescription:
      "Is fasted riding worth it? For short easy sessions, modest benefit. For anything hard or long, the evidence is clear: under-fuelling wrecks quality and blocks adaptation. What the research says.",
    pillar: "nutrition",
    directAnswer:
      "For short, genuinely easy rides under 90 minutes, occasional fasted sessions can modestly improve fat oxidation and metabolic flexibility. For anything hard, long, or where you want adaptation, riding fasted backfires — it drops session quality, suppresses protein synthesis, and the claimed metabolic benefit does not persist over a training block. Fuel the work that matters. Save fasted riding for easy spins only.",
    keyTakeaways: [
      "Fasted easy rides under 90 minutes have a modest, real metabolic stimulus.",
      "Fasted hard or long sessions drop power output and reduce the quality of the adaptation.",
      "The fat-burning effect does not persist long-term when session quality is compromised.",
      "Most riders who ride fasted regularly are not riding easy enough for it to be beneficial.",
    ],
    whoFor: [
      {
        label: "The rider who skips breakfast before morning sessions",
        detail:
          "You ride first thing, often without eating, and want to know whether this is helping or hurting you.",
      },
      {
        label: "The cyclist chasing fat adaptation",
        detail:
          "You have heard about fat-burning benefits and are considering a low-carb or fasted training approach.",
      },
    ],
    roadmanView: [
      "The fasted riding romance comes from a genuine metabolic fact — exercising without carbohydrate does shift your body toward fat oxidation. The problem is that the cycling world extrapolated a modest acute effect into a universal training principle, and it does not hold up. Anthony has tested it himself and discussed it with Dr Sam Impey on the podcast — when the sessions that matter get run on empty, they are slower, worse quality, and produce less adaptation than fuelled equivalents.",
      "The practical test is simple: check what your 'fasted' rides actually look like in your training files. Most riders who think they are doing easy fasted training are hovering in zone 3 because they cannot hold zone 2 without carbohydrate. At that intensity, you are not getting the fat-oxidation stimulus you are seeking; you are just doing suboptimal aerobic work on a short fuel supply.",
      "There is a legitimate use case: a short, genuinely easy ride — 60 to 90 minutes, fully conversational, heart rate solidly in zone 2 — done fasted occasionally adds a meaningful metabolic stimulus without wrecking the session. The key word is occasional, easy, and short. It is a specific tool for a specific purpose, not a general training philosophy.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "Fasted training has a place in a well-structured programme — specifically low-intensity, short-duration work where fat oxidation is the target. The error is extending it to hard sessions or long rides where glycogen availability is performance-limiting. Under-fuelling those sessions costs more in adaptation than the metabolic benefit of fasting is worth.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "Fuelling experiment — under vs optimal vs over",
        credential: "Roadman podcast — Anthony's personal fuelling test",
        insight:
          "When Anthony ran a controlled comparison of under-fuelled, optimally fuelled, and over-fuelled riding, the under-fuelled sessions consistently produced the worst power numbers and felt the worst. The metabolic argument for fasting does not translate into better ride quality or more training adaptation.",
        episodeSlug: "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      },
    ],
    practicalApplication: [
      {
        title: "Limit fasted riding to easy sessions under 90 minutes",
        detail:
          "If you want the metabolic stimulus, ride before breakfast on a genuinely easy day — zone 1 to low zone 2, fully conversational. Keep it under 90 minutes. This is the condition where fasted training delivers benefit without the cost.",
      },
      {
        title: "Fuel every hard session, regardless of timing",
        detail:
          "Intervals, threshold work, and anything with a power target should always have carbohydrate available. Even a small carb intake — a banana before, a gel during — materially improves session quality and the adaptation it produces.",
      },
      {
        title: "Test your own 'easy' rides",
        detail:
          "Pull up a recent fasted ride and check the power and heart rate. If you are consistently in zone 3, you are not riding easy enough to benefit from fasted training. Either lower the intensity or add fuel.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Using fasted sessions for interval or threshold work.",
        fix:
          "Fuel hard sessions fully. The quality of the work produces the adaptation — undercutting it with an empty tank is a false economy.",
      },
      {
        mistake: "Riding 'easy' fasted but actually drifting into zone 3.",
        fix:
          "True fasted-training benefit requires genuinely easy intensity. If you cannot hold zone 2 without carbs, eat something small and lower the expectation.",
      },
      {
        mistake: "Fasting through long rides trying to burn more fat.",
        fix:
          "Long rides are where glycogen depletion actually becomes a performance limiter. Bonking 60km from home is not a training stimulus — it is a miserable, suboptimal session.",
      },
    ],
    faq: [
      {
        question: "Does fasted riding help with weight loss?",
        answer:
          "Marginally, if it does not increase compensatory eating later in the day. The total calorie balance over the day matters more than the fasting window. Riders who ride fasted often eat more at breakfast, wiping out any deficit. Focus on overall daily calorie management rather than the fasting mechanism.",
      },
      {
        question: "Will fasted training improve my fat metabolism?",
        answer:
          "Periodically, yes — occasional fasted easy rides do shift substrate use toward fat oxidation during low-intensity efforts. But the effect does not translate into better race performance, which requires high-intensity fuelled efforts. You are training one energy system while competing on another.",
      },
      {
        question: "How long can I ride fasted safely?",
        answer:
          "For easy, zone 2 riding, most people have enough stored glycogen for 60–90 minutes without meaningful performance loss. Beyond that, power and pacing begin to degrade. Two hours fasted at anything above zone 2 is where bonking risk becomes real.",
      },
      {
        question: "Should I drink coffee before a fasted ride?",
        answer:
          "Caffeine is fine and does not materially break the fasted state for training purposes. A black coffee before an easy fasted ride keeps you sharp without providing the carbohydrate that would change the metabolic stimulus.",
      },
      {
        question: "Is fasted training worse for masters cyclists?",
        answer:
          "Generally, yes. Older athletes are more sensitive to catabolic conditions and muscle protein breakdown. Fasted sessions in masters riders carry a higher risk of muscle loss alongside fat loss, making the high-protein fuelled approach even more important after 40.",
      },
    ],
    relatedEpisodes: [
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      "ep-11-is-training-fasted-a-good-idea-vlog-011",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Fasted vs Fuelled Cycling", href: "/blog/fasted-vs-fueled-cycling" },
      { label: "Fuelled vs Fasted Sessions", href: "/compare/fueled-vs-fasted-sessions" },
      { label: "What to eat before a long ride", href: "/answers/what-to-eat-before-cycling" },
      { label: "How many carbs per hour for cycling?", href: "/answers/carbs-per-hour-cycling" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "The metabolic case for occasional fasted easy rides is supported; the overextension to hard sessions is contradicted by session-quality evidence from Dr Sam Impey and the Roadman fuelling experiments.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 6 — HOW TO TRAIN YOUR GUT
  // ============================================================
  {
    slug: "how-to-train-your-gut-cycling",
    cluster: "nutrition",
    question: "How Do I Train My Gut to Take More Carbs?",
    seoTitle: "How to Train Your Gut to Take More Carbs on the Bike",
    seoDescription:
      "How to train your gut to absorb more carbs while cycling: start at 60g/hr and add 10g every 2–3 weeks using glucose-fructose mixes. Why it takes weeks, not days, and how to avoid GI disaster.",
    pillar: "nutrition",
    directAnswer:
      "Train your gut by practising high carbohydrate intake on long training rides — starting at 60g per hour and adding 10–15g every two to three weeks, using a glucose-fructose mix at roughly 2:1. Gut training adapts the transporters that move carbs from your intestine into the bloodstream. It takes four to six weeks of consistent practice. Never debut a new intake level on race day.",
    keyTakeaways: [
      "Start at 60g/hr and increase by 10–15g every 2–3 weeks using a 2:1 glucose-fructose product.",
      "Gut training adapts SGLT1 and GLUT5 transporters — the process takes 4–6 weeks.",
      "Always practise on training rides, never introduce a new intake level at an event.",
      "GI discomfort is a sign you have outrun your current capacity — step back, not forward.",
    ],
    whoFor: [
      {
        label: "The racer chasing 90g/hr or higher intake",
        detail:
          "You want to fuel at pro-level rates for racing but know your gut is not ready for it yet.",
      },
      {
        label: "The sportive rider with stomach problems on long rides",
        detail:
          "You have tried taking more food and ended up with GI distress in the back third of rides.",
      },
    ],
    roadmanView: [
      "The gut is trainable. That is the single most important thing to understand about high carbohydrate fuelling, and it is what makes the pro 120g/hr number possible for them but not for an untrained amateur who walks in cold. Anthony has covered this with Dr Sam Impey on the podcast — the transporters that move glucose and fructose from your gut into your bloodstream adapt under stimulus, just like a muscle adapts to resistance training.",
      "The process is not fast. Four to six weeks of deliberate, progressive practice on training rides is the minimum to build meaningful absorption capacity. The protocol: pick a 2:1 glucose-to-fructose product, start at whatever you can currently tolerate without issues, and add 10–15g per hour every two to three weeks. The gut gives you honest feedback — nausea, bloating, or cramping means you have jumped too far. Back off one step.",
      "The mistake most riders make is thinking gut training happens automatically through general riding. It does not. You need to specifically practise high intake on rides long enough to matter, using products that match the glucose-fructose ratio. An easy 45-minute spin with a single gel trains nothing. A three-hour ride where you systematically hit 80g/hr every week for a month trains a great deal.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "High carbohydrate absorption capacity is an adaptation, not a given. The intestinal transporters that handle glucose and fructose — SGLT1 and GLUT5 — upregulate in response to regular high-carbohydrate intake. Riders who consistently practise fuelling at target race rates for four to six weeks measurably improve their absorption ceiling.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "Fuelling experiment — under vs optimal vs over",
        credential: "Roadman podcast — real-world fuelling test",
        insight:
          "The contrast between under-fuelled and optimally fuelled riding shows clearly that the ceiling for most amateurs is not physiological — it is a trained gut limitation. Riders who have practised taking 90g/hr regularly can perform at that level; those who have not almost always experience GI distress before they hit that target.",
        episodeSlug: "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      },
    ],
    practicalApplication: [
      {
        title: "Establish your current baseline",
        detail:
          "On your next two-hour-plus ride, take 60g of carbohydrate per hour using a 2:1 glucose-fructose product and note any GI response. If all is comfortable, that is your starting point. If even 60g causes issues, drop to 45g and build from there.",
      },
      {
        title: "Add 10–15g per hour every two to three weeks",
        detail:
          "Once you are consistently comfortable at a level for two to three long rides, add 10–15g/hr in the next block. At 60g → 75g → 90g, building over 6–9 weeks. Each step should feel unremarkable before you take the next one.",
      },
      {
        title: "Use the right product ratio",
        detail:
          "Above 60g/hr, you need both glucose and fructose to use two different gut transporters. A 2:1 glucose-to-fructose ratio — found in many dedicated endurance products — is the evidence-backed standard. Using glucose-only gels at 90g/hr is a reliable way to cause GI distress regardless of your training.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Jumping from 60g/hr to 90g/hr in one step.",
        fix:
          "Increase by 10–15g every two to three weeks. The gut adapts at training pace, not overnight.",
      },
      {
        mistake: "Using glucose-only products for high intake.",
        fix:
          "Above 60g/hr, fructose is essential to access the GLUT5 transporter. Use a 2:1 glucose-fructose product for any target above that threshold.",
      },
      {
        mistake: "Saving the new intake level for race day.",
        fix:
          "Debut every intake level on training rides, multiple times, before bringing it to a race. GI distress at kilometre 80 of a sportive is not the place to discover your new limit.",
      },
    ],
    faq: [
      {
        question: "How long does it take to train your gut for cycling?",
        answer:
          "Four to six weeks of consistent, progressive practice on long rides produces measurable adaptation. Building from 60g/hr to 90g/hr typically takes 8–12 weeks when done properly — two to three weeks at each step.",
      },
      {
        question: "Why do I get stomach problems with energy gels?",
        answer:
          "Most commonly: you are taking too much too fast, using a glucose-only product at too high an intake, or dehydrating while fuelling. Try slowing your intake, switching to a glucose-fructose product, and drinking 500–750ml of water per hour alongside your carbs.",
      },
      {
        question: "Can I train my gut with real food instead of gels?",
        answer:
          "Yes. Bananas, rice cakes, dates, and homemade rice balls all work and are often better tolerated at low-to-moderate intake levels. They are harder to use at very high intake (90g/hr+) because of the volume required, but are excellent tools for building gut tolerance progressively.",
      },
      {
        question: "What is the best ratio of glucose to fructose for cycling?",
        answer:
          "2:1 glucose to fructose is the most studied ratio and maximises the use of two separate intestinal transporters. Some products use 1:0.8 (close to 1:1) with good results. Avoid products that are purely glucose or purely fructose for intake above 60g/hr.",
      },
      {
        question: "Should I drink water with my gels on the bike?",
        answer:
          "Yes — plain water, not more carbohydrate drink, with concentrated gels. The osmolality of concentrated carbohydrate draws water into your gut to dilute it, which can cause bloating if you are not adequately hydrated. Roughly 500–750ml of water per hour is the range to aim for.",
      },
    ],
    relatedEpisodes: [
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      "ep-2031-ben-healy-s-insane-fueling-strategy-revealed",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
      { label: "How many carbs per hour for cycling?", href: "/answers/carbs-per-hour-cycling" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
      { label: "Fuelled vs Fasted Sessions", href: "/compare/fueled-vs-fasted-sessions" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Intestinal transporter upregulation in response to carbohydrate training is well established in the research; corroborated by Dr Sam Impey and the Roadman fuelling experiments.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 7 — WHAT DO PRO CYCLISTS EAT
  // ============================================================
  {
    slug: "what-do-pro-cyclists-eat",
    cluster: "nutrition",
    question: "What Do Pro Cyclists Actually Eat?",
    seoTitle: "What Do Pro Cyclists Actually Eat? The Real Answer",
    seoDescription:
      "What pro cyclists actually eat: high carbohydrate on training days, periodised protein, real food over supplements, and no extreme restriction. What World Tour chefs and nutritionists reveal.",
    pillar: "nutrition",
    directAnswer:
      "Pro cyclists eat a high-carbohydrate, periodised diet — roughly 8–12g of carbs per kg on hard days, 3–5g on easy days, and 1.8–2.2g of protein per kg daily. They favour real food: rice, pasta, chicken, eggs, and vegetables. They eat a lot on training days and significantly less on rest days. There is no single 'pro diet' — it is matched to the work. What they do not do is restrict aggressively or eat less than the training demands.",
    keyTakeaways: [
      "Carbohydrate is periodised: 8–12g/kg on hard days, 3–5g/kg on easy and rest days.",
      "Protein stays consistently high at 1.8–2.2g/kg regardless of the day.",
      "Real food dominates — rice, pasta, eggs, chicken, vegetables — supplements fill gaps.",
      "Pros eat a great deal on training days; the restriction comes on rest days, not training days.",
    ],
    whoFor: [
      {
        label: "The rider curious about professional nutrition",
        detail:
          "You have seen the rice bidon photos and want to understand what the actual daily diet of a World Tour rider looks like.",
      },
      {
        label: "The cyclist trying to eat for performance",
        detail:
          "You want to adopt professional principles for an amateur schedule without the luxury of a team chef.",
      },
    ],
    roadmanView: [
      "Alan Murchison spent years cooking for professional cycling teams as a Michelin-star chef before coming on the podcast, and his account of what pros actually eat upends the Instagram version. There is nothing exotic. Rice is the staple — in bidons during races, in bowls at the dinner table, in rice cakes made by the team chef. The volume is remarkable on training days, the restraint equally remarkable on rest days.",
      "The concept that surprised Anthony most is how deliberately food is periodised. A pro's Tuesday rest day looks genuinely different nutritionally from their Wednesday five-hour training ride. The carbohydrate intake swings by 600–800g depending on what the work demands. That is the principle most amateurs get wrong — they eat roughly the same every day regardless of training load.",
      "What pros do not do is restrict aggressively during racing or hard training. Dr Allen Lim has described the culture shift at WorldTour level over the last decade — teams moved away from weight obsession after seeing the performance cost of under-fuelled training. The riders who win today are fuelling hard and periodising the rest. The old 'lighter is faster at any cost' thinking has been replaced by 'fuel the work, manage the easy days'.",
    ],
    expertEvidence: [
      {
        name: "Alan Murchison",
        credential: "Michelin-star chef and elite sports nutritionist",
        insight:
          "The foundation of professional cycling nutrition is simpler than most people expect: real food, cooked well, at the right time. Rice, pasta, chicken, eggs, and vegetables cover the bulk of what pro teams eat. The sophistication is in the periodisation — matching quantity and composition to the day's work — not in the foods themselves.",
        episodeSlug: "what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
        guestSlug: "alan-murchison",
      },
      {
        name: "Dr Allen Lim",
        credential: "Sports scientist, founder of Skratch Labs",
        insight:
          "The shift in professional cycling nutrition over the last decade has been away from restriction and toward fuelling for performance. Teams that adopted a performance-first approach — high carbohydrate availability, real food, no chronic energy deficit in training — outperformed those still following old weight-loss models. The culture finally caught up with the science.",
        episodeSlug: "ep-2123-the-untold-story-of-cycling-s-rebirth-after-armstrong-dr-lim",
        guestSlug: "dr-allen-lim",
      },
    ],
    practicalApplication: [
      {
        title: "Periodise carbohydrate around your training week",
        detail:
          "On hard and long ride days, eat 6–10g of carbs per kg. On easy days and rest days, pull it back to 3–5g/kg. Keep protein constant at 1.8–2.2g/kg throughout. This single change moves most amateurs closer to what the pros actually do.",
      },
      {
        title: "Make rice and real food the base",
        detail:
          "White rice, pasta, eggs, chicken, fish, vegetables, and fruit cover the majority of what World Tour riders eat. Build meals around these before adding supplements. Rice cakes made with honey and a pinch of salt are as effective on the bike as most commercial products, and cheaper.",
      },
      {
        title: "Eat more on hard days and less on rest days — deliberately",
        detail:
          "Track one training week and one rest day. If the calories are similar, you are missing the main lever. Hard training days should involve significantly more food — the pros use the scale of the difference as a nutrition discipline.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Eating the same amount every day regardless of training load.",
        fix:
          "Periodise energy around the work. Hard days need significantly more carbohydrate than rest days — the swing between them is where the professional principle lives.",
      },
      {
        mistake: "Thinking pros eat tiny amounts to stay lean.",
        fix:
          "Pros eat enormous amounts on training days — often 5,000–7,000 kcal on a Grand Tour stage. Leanness comes from the volume of work, not chronic restriction.",
      },
      {
        mistake: "Over-investing in supplements before getting the food base right.",
        fix:
          "Real food covers the vast majority of what drives performance nutrition. Get consistent daily meals right first; supplements fill specific gaps in specific contexts.",
      },
    ],
    faq: [
      {
        question: "Do pro cyclists eat a lot?",
        answer:
          "On racing and hard training days, yes — extraordinarily so. Grand Tour riders burn 5,000–7,000 kcal on a mountain stage and eat to match. On rest days the intake drops sharply. The volume swings by design.",
      },
      {
        question: "What do pro cyclists eat during a race?",
        answer:
          "Gels, rice cakes, energy bars, bananas, bidons of carbohydrate drink, and occasionally real sandwiches from team musettes. The carbohydrate rate on a hard stage can reach 90–120g/hr with gut training. Hydration and sodium management run alongside.",
      },
      {
        question: "Do pro cyclists follow low-carb diets?",
        answer:
          "No. Low-carb approaches are used tactically by some athletes in specific training contexts, but no World Tour team trains or races predominantly low-carb. High carbohydrate availability is considered essential for training quality and race performance.",
      },
      {
        question: "What do pro cyclists eat for breakfast before a race?",
        answer:
          "Rice, oats, eggs, toast, and white bread — typically 3–4g of carbs per kg, eaten 3–4 hours before the start. Low fibre, low fat. Coffee is a near-universal part of the morning routine as a legal performance aid.",
      },
      {
        question: "Do pro cyclists use protein shakes?",
        answer:
          "Selectively. Recovery shakes are used post-stage when appetite is low and a quick protein hit is convenient. Whole food is prioritised at every other opportunity. The reliance on shakes is much lower than supplement marketing would suggest.",
      },
      {
        question: "What does a typical World Tour training day diet look like?",
        answer:
          "Breakfast of rice or porridge and eggs, a carb-rich snack pre-ride, 60–90g/hr of carbs during the ride, a recovery meal of rice and protein immediately post-ride, and a full dinner of protein with carbs and vegetables. Total carbohydrate on a heavy training day can exceed 600–800g.",
      },
    ],
    relatedEpisodes: [
      "what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
      "ep-2123-the-untold-story-of-cycling-s-rebirth-after-armstrong-dr-lim",
      "ep-2031-ben-healy-s-insane-fueling-strategy-revealed",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "What World Tour Nutritionists Recommend", href: "/blog/cycling-nutrition-world-tour-nutritionists" },
      { label: "Alan Murchison on Cycling Nutrition", href: "/blog/alan-murchison-michelin-star-chef-cycling-nutrition" },
      { label: "Fuel for the Work Required", href: "/answers/fuel-for-the-work-required" },
      { label: "How many carbs per hour for cycling?", href: "/answers/carbs-per-hour-cycling" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Professional nutrition practice corroborated by Alan Murchison and Dr Allen Lim; specific nutrient targets align with published sports nutrition guidelines.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 8 — HOW MUCH TO DRINK CYCLING
  // ============================================================
  {
    slug: "how-much-to-drink-cycling",
    cluster: "nutrition",
    question: "How Much Should I Drink While Cycling?",
    seoTitle: "How Much Should You Drink While Cycling?",
    seoDescription:
      "How much to drink while cycling: 500–750ml per hour in cool conditions, up to 1,000ml in heat. Why thirst is a reasonable guide for most rides, and when it is not enough.",
    pillar: "nutrition",
    directAnswer:
      "Drink 500–750ml per hour in cool to moderate conditions, scaling up to 750–1,000ml per hour in heat or high-intensity efforts. Thirst is a reasonable guide for easy rides but lags behind real needs in hot weather or at race pace. Start drinking from the first 15–20 minutes — do not wait until you feel dry. Pre-hydrating the morning before long or hot rides reduces the deficit you start with.",
    keyTakeaways: [
      "Target 500–750ml per hour in cool conditions, 750–1,000ml in heat.",
      "Thirst is a reasonable guide for easy rides but underestimates needs in heat or high intensity.",
      "Start drinking early — within the first 15–20 minutes, before thirst arrives.",
      "Pre-hydrate the morning before long or hot events to reduce the starting deficit.",
    ],
    whoFor: [
      {
        label: "The rider who waits until thirsty",
        detail:
          "You drink when you remember to and often finish rides feeling dehydrated, especially in summer.",
      },
      {
        label: "The cyclist heading into heat or a hot-weather event",
        detail:
          "You want to know how to manage fluid intake in conditions where sweat rates and stakes are higher.",
      },
    ],
    roadmanView: [
      "Most amateur cyclists drink too little and drink it too late. The science is clear that by the time thirst kicks in as a strong signal, you are already 1–2% dehydrated — a level that measurably reduces both power output and perceived effort. Anthony has tested this on long hot rides: the difference between proactively pacing your drinking and responding to thirst is visible in the power file in the back third of the ride.",
      "The practical standard is a 500ml bottle per 30 minutes in warm conditions, adjusting based on sweat rate and temperature. Some riders sweat 1,500ml per hour in extreme heat — no amount of drinking covers that entirely, but getting as close as you can delays the performance decline. The riders who cope best in heat are the ones who start hydrated, drink on a schedule, and include sodium to help retain what they take in.",
      "Cold weather riding fools people in the opposite direction — you feel less sweaty and forget to drink. The fluid loss is lower, but it is still there. On a three-hour cold-day ride, a 500ml bottle per hour is a reasonable minimum. Arrive home dehydrated in November and recovery quality suffers just as much as in July.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "Hydration strategy at World Tour level is personalised to sweat rate, sweat sodium concentration, and environmental conditions. The amateur takeaway is simpler: drink on a schedule from the start rather than reacting to thirst, include sodium in longer rides to aid retention, and never arrive at an event under-hydrated.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "Fuelling and hydration experiment",
        credential: "Roadman podcast — under vs optimal fuelling",
        insight:
          "In Anthony's controlled fuelling comparison, hydration shortfall combined with carbohydrate shortfall produced the steepest power decline. The two interact — dehydration impairs carbohydrate absorption, compounding the effect of under-fuelling.",
        episodeSlug: "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      },
    ],
    practicalApplication: [
      {
        title: "Set a drinking schedule, not a thirst response",
        detail:
          "Aim for one 500–750ml bottle per hour in temperate conditions. Set a recurring 20-minute alert on your head unit as a prompt. You should never be taking a first sip at the 45-minute mark.",
      },
      {
        title: "Scale up in heat",
        detail:
          "Above 25°C or at race intensity, move toward 750–1,000ml per hour. If you are sweating through your kit visibly, you are likely losing more than 500ml per hour. Add a second bottle cage for hot-day rides or plan café and water stops.",
      },
      {
        title: "Pre-hydrate the morning before long rides",
        detail:
          "Drink 500ml of water in the 2–3 hours before a long or hot ride, alongside your pre-ride meal. Waking up on a normal morning you are already mildly dehydrated from overnight breathing and potential alcohol from the night before. Start the ride topped up.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Waiting until thirsty to start drinking on the bike.",
        fix:
          "Drink from 15–20 minutes in, before the thirst signal arrives. Thirst lags behind actual fluid needs, especially in heat.",
      },
      {
        mistake: "Drinking only water on rides over two hours.",
        fix:
          "Plain water on long rides dilutes blood sodium, reducing the drive to retain fluid and potentially causing hyponatremia in extreme cases. Add electrolytes — particularly sodium — to your bottles for rides over 90 minutes.",
      },
      {
        mistake: "Under-hydrating in cold weather because you 'don't feel sweaty'.",
        fix:
          "Cold air is dry and cycling creates respiratory fluid loss. You sweat less but still lose fluid. Keep drinking on a schedule year-round.",
      },
    ],
    faq: [
      {
        question: "Can you drink too much water while cycling?",
        answer:
          "Yes — hyponatremia (dangerously low blood sodium) can occur when riders drink large volumes of plain water over many hours without replacing sodium. It is rare in typical sportive riding but has occurred in ultra-endurance events. Use drinks with electrolytes for rides over two hours and on hot days.",
      },
      {
        question: "Should I drink sports drinks or water on long rides?",
        answer:
          "Both. Water alone works for rides under 60–90 minutes. Beyond that, a drink with sodium and some carbohydrate aids fluid retention, delivers fuel, and reduces the risk of dilutional hyponatremia. Use electrolyte drinks for long hot rides; water works fine for most easy rides.",
      },
      {
        question: "How do I know if I am dehydrated after a ride?",
        answer:
          "Weigh yourself before and after a long ride. Each kilogram of bodyweight lost corresponds roughly to 1 litre of fluid deficit. If you lose 2kg or more, your hydration strategy needs improving. Dark urine post-ride is also a useful signal.",
      },
      {
        question: "How much should I drink on a hot day cycling event?",
        answer:
          "In temperatures above 25–30°C, target 750–1,000ml per hour and ensure every bottle contains electrolytes. Plan water stop intervals that keep you below a 2% bodyweight fluid deficit. Starting an event already dehydrated is the most common cause of mid-event heat performance collapse.",
      },
      {
        question: "Does caffeine cause dehydration while cycling?",
        answer:
          "At moderate doses — the 3–6mg/kg used for performance — caffeine does not cause meaningful dehydration in trained athletes. The mild diuretic effect is offset by the fluid you consume the caffeine in. Drink coffee or caffeine as part of your normal fluid intake, not instead of it.",
      },
    ],
    relatedEpisodes: [
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      "ep-2031-ben-healy-s-insane-fueling-strategy-revealed",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Hydration for Cyclists", href: "/blog/cycling-hydration-guide" },
      { label: "Do cyclists need electrolytes?", href: "/answers/do-cyclists-need-electrolytes" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
      { label: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Hydration targets and thirst-lag evidence are well established in sports science; corroborated by Dr Sam Impey.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 9 — DO CYCLISTS NEED ELECTROLYTES
  // ============================================================
  {
    slug: "do-cyclists-need-electrolytes",
    cluster: "nutrition",
    question: "Do Cyclists Need Electrolytes?",
    seoTitle: "Do Cyclists Need Electrolytes? The Honest Answer",
    seoDescription:
      "Do cyclists need electrolytes? Yes, for rides over 90 minutes, in heat, or where sweat loss is high. Why sodium is the key electrolyte, and when plain water is enough.",
    pillar: "nutrition",
    directAnswer:
      "For rides over 90 minutes, in hot conditions, or when sweat loss is high, yes — cyclists need electrolytes, particularly sodium. Sodium aids fluid retention, helps maintain blood volume, and prevents the performance decline that comes from plasma sodium dilution. For rides under an hour in cool conditions, plain water is usually sufficient. Sodium is the electrolyte that matters most; the others — potassium, magnesium — are covered by a normal diet.",
    keyTakeaways: [
      "Sodium is the critical electrolyte for cycling — it aids fluid retention and maintains plasma volume.",
      "Electrolytes matter for rides over 90 minutes, in heat, and at high sweat rates.",
      "Plain water is sufficient for most rides under 60–90 minutes in cool conditions.",
      "A normal varied diet covers potassium, magnesium, and calcium needs — these rarely need supplementing.",
    ],
    whoFor: [
      {
        label: "The rider who cramps in hot weather or on long rides",
        detail:
          "You suffer cramps or fade badly in the second half of long events and wonder whether electrolytes are the missing piece.",
      },
      {
        label: "The cyclist buying electrolyte tablets but not sure they're needed",
        detail:
          "You add electrolytes to every ride from habit but want to understand when they actually make a difference.",
      },
    ],
    roadmanView: [
      "Electrolyte marketing has created a world where riders are adding tablet after tablet to every water bottle on every ride, including a 45-minute commute in October. The truth is more targeted: for easy short rides, plain water is fine. For long rides, hot days, and high-intensity efforts where you are sweating significantly, sodium in your drink is genuinely important.",
      "The mechanism is real. Sodium keeps you thirsty, so you drink more. It is retained with fluid, maintaining blood plasma volume. When sodium drops through heavy sweating and plain-water replacement, the hormonal drive to drink weakens, you stop retaining fluid efficiently, and power output drops faster than it should. The riders who manage this best — like Ben Healy with his extraordinary fuelling strategy — are precise about sodium intake on long and hot efforts.",
      "For most amateurs on normal four-season riding, the priority is simply getting sodium into your bottles on any ride over 90 minutes and on any ride where conditions are warm. Beyond that, potassium and magnesium are handled by eating a varied diet. The electrolyte complexity the supplement industry sells is largely unnecessary for riders who eat real food.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "Sodium is the electrolyte that drives meaningful performance differences in cycling. It regulates fluid balance, aids carbohydrate absorption in the gut, and helps maintain blood volume. Losses via sweat can be substantial — some riders lose 1,500–2,000mg of sodium per hour — making replacement on long or hot rides a performance priority.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "Ben Healy fuelling strategy",
        credential: "Roadman podcast — professional race fuelling",
        insight:
          "At the pro level, electrolyte management is personalised around sweat testing. Riders with high sweat sodium content — some pros lose over 2,000mg/hr — carry specific sodium supplements in their race nutrition plan. The amateur lesson is to at least cover baseline sodium needs rather than relying on plain water for multi-hour efforts.",
        episodeSlug: "ep-2031-ben-healy-s-insane-fueling-strategy-revealed",
      },
    ],
    practicalApplication: [
      {
        title: "Add sodium to your bottles for rides over 90 minutes",
        detail:
          "An electrolyte tablet, a pinch of salt (300–500mg sodium), or a sodium-containing sports drink in your main bottle on any ride over 90 minutes is a sensible baseline. On hot days or high-intensity efforts, use it in every bottle.",
      },
      {
        title: "Eat real food for potassium and magnesium",
        detail:
          "Bananas, potatoes, spinach, and nuts cover potassium and magnesium. A varied diet almost always provides adequate amounts of these electrolytes — targeted supplementation is rarely necessary for amateur cyclists who eat well.",
      },
      {
        title: "Test your personal sweat rate on hot long rides",
        detail:
          "Weigh yourself before and after a 90-minute hot-day ride without drinking. Each kg lost is roughly 1,500mg of sodium. If you regularly lose 2kg or more, you are a high sweat-loss rider and need to take electrolytes more seriously than most.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Adding electrolytes to every ride including short easy sessions.",
        fix:
          "For rides under 60–90 minutes in cool conditions, plain water is usually sufficient. Save the tablets for when they actually matter — long rides and hot days.",
      },
      {
        mistake: "Drinking plain water for hours without replacing sodium.",
        fix:
          "Plain water on a long ride dilutes plasma sodium. Add sodium to your drinks for any ride over 90 minutes, scaling up in heat and high intensity.",
      },
      {
        mistake: "Blaming cramps entirely on electrolyte deficiency.",
        fix:
          "Cramping during cycling is multi-factorial — fatigue, pacing, neuromuscular factors, and hydration all contribute. Address all of them; sodium can help but is rarely the sole solution.",
      },
    ],
    faq: [
      {
        question: "Do electrolytes help with cycling cramps?",
        answer:
          "Sodium deficiency and dehydration can contribute to cramping, particularly in heat. But most exercise cramps have a neuromuscular component — fatigue and poor pacing — that electrolytes alone will not fix. Staying hydrated with sodium-containing drinks reduces the risk; addressing training load and pacing addresses the rest.",
      },
      {
        question: "What is the best electrolyte for cyclists?",
        answer:
          "Sodium is the most important one for performance and fluid retention. Most electrolyte products also contain potassium, magnesium, and calcium, but the evidence for supplementing these beyond what a normal diet provides is weak. If you use electrolyte tablets, check the sodium content — aim for products with 300–500mg or more per serving.",
      },
      {
        question: "Can I get enough electrolytes from food rather than supplements?",
        answer:
          "For sodium, food alone is often not enough to replace high sweat losses during long or hot rides — you need it in your drink to maintain absorption efficiency alongside carbohydrate. For other electrolytes, yes — a normal varied diet covers potassium, magnesium, and calcium for most riders.",
      },
      {
        question: "How much sodium do I need per hour cycling?",
        answer:
          "Sweat sodium concentration varies widely between individuals — from 300mg/litre to over 1,500mg/litre. A practical starting target is 500–700mg of sodium per hour on long hot rides, adjusting based on whether you are a heavy or light sweater. If your kit is coated in white salt stains, you are a high-sodium loser and need more.",
      },
      {
        question: "Are electrolyte drinks worth it for short rides?",
        answer:
          "For rides under 60 minutes in cool conditions, plain water is fine and electrolyte drinks add unnecessary cost and calories. For rides over 90 minutes, in heat, or where you sweat heavily, the sodium in electrolyte drinks makes a meaningful difference to fluid retention.",
      },
    ],
    relatedEpisodes: [
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-2031-ben-healy-s-insane-fueling-strategy-revealed",
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Hydration for Cyclists", href: "/blog/cycling-hydration-guide" },
      { label: "How much should I drink while cycling?", href: "/answers/how-much-to-drink-cycling" },
      { label: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Sodium's role in fluid retention and performance is well established; sweat-sodium variability corroborated by Dr Sam Impey.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 10 — FUEL FOR THE WORK REQUIRED
  // ============================================================
  {
    slug: "fuel-for-the-work-required",
    cluster: "nutrition",
    question: "What Does Fuel for the Work Required Mean?",
    seoTitle: "Fuel for the Work Required — What It Means and How to Use It",
    seoDescription:
      "What Fuel for the Work Required means for cyclists: matching carbohydrate intake to training demand. High carbs on hard days, low on easy days. How to apply it and why it changes everything.",
    pillar: "nutrition",
    directAnswer:
      "Fuel for the Work Required means matching your carbohydrate intake to the specific demands of each training session — not eating the same every day. Hard sessions and races get full carbohydrate availability; easy sessions and rest days use lower carb intake to create a modest deficit without compromising training quality. It is the framework that lets you improve body composition while protecting performance.",
    keyTakeaways: [
      "Match carbohydrate intake to session demand: 6–10g/kg on hard days, 3–5g/kg on easy and rest days.",
      "Never under-fuel the work itself — the deficit comes from easy days and off-bike meals.",
      "It is a framework for simultaneous performance improvement and body composition management.",
      "Protein stays high (1.8–2.2g/kg) every day regardless of the training load.",
    ],
    whoFor: [
      {
        label: "The rider trying to get leaner without losing power",
        detail:
          "You want to improve your watts per kilo but every time you restrict calories your performance suffers.",
      },
      {
        label: "The cyclist who eats the same every day regardless of training",
        detail:
          "You eat a consistent daily intake and wonder why your body composition is not changing despite hard training.",
      },
    ],
    roadmanView: [
      "Anthony came across the Fuel for the Work Required concept through Dr David Dunne and Sam Impey on the podcast, and it reframed how he thought about nutrition entirely. The old model — eat the same every day, run a general deficit — produces exactly the outcome most people complain about: flat training, poor recovery, and body composition that does not shift. The FFTWR model explains why.",
      "The core principle is simple even if the execution requires discipline. Your hard training days are not the time to restrict. Those sessions need carbohydrate to drive adaptation — under-fuel them and you get a worse session, slower recovery, and less fitness gain per unit of effort. The restriction goes on the easy days and rest days, where your body does not need maximum glycogen availability to do the work.",
      "What riders discover when they apply this properly is that they eat more on hard days than they ever did before, and significantly less on easy days. The total calorie balance across the week is the same or slightly lower, but the composition of the work improves dramatically. The sessions that are supposed to drive adaptation have everything they need; the quiet days create the deficit.",
    ],
    expertEvidence: [
      {
        name: "Dr David Dunne",
        credential: "Performance nutritionist to INEOS Grenadiers, EF Education, and Uno-X",
        insight:
          "The Fuel for the Work Required framework is how professional teams manage simultaneous performance optimisation and body composition in athletes. It avoids the performance cost of chronic caloric restriction by targeting the deficit to periods of lower training demand, where it causes minimal performance impact.",
        episodeSlug: "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
        guestSlug: "david-dunne",
      },
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "The key insight is that energy availability — not total caloric balance — determines training adaptation. High energy availability on hard days protects the quality of the work and the adaptation it drives. Deliberately lower energy availability on easy days creates body composition benefits without touching the sessions that matter.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
    ],
    practicalApplication: [
      {
        title: "Label each day of your training week",
        detail:
          "Go through your weekly plan and categorise each day: hard session, moderate, easy, or rest. This is the skeleton for your nutrition periodisation. Hard days get high carbohydrate; easy and rest days get moderate to low carbohydrate. The categories drive the food.",
      },
      {
        title: "Set carbohydrate targets by day type",
        detail:
          "Hard training day: 6–10g carbs/kg. Easy day: 3–5g carbs/kg. Rest day: 2–3g carbs/kg. Protein stays at 1.8–2.2g/kg every day. Track these for two weeks to understand your baselines before adjusting for body composition goals.",
      },
      {
        title: "Keep on-bike fuelling at hard-day rates during sessions",
        detail:
          "On a hard training day, fuel the session itself at 60g+/hr as normal. The easy-day carbohydrate reduction happens in meals around training, not during it. The ride always gets what it needs.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Cutting carbs on hard training days to reduce calories.",
        fix:
          "The hard session is where adaptation is built. Cutting carbs there reduces training quality and adaptation. The deficit must come from easier periods.",
      },
      {
        mistake: "Eating the same daily calorie total regardless of training load.",
        fix:
          "A rest day should look meaningfully different from a five-hour ride day nutritionally. The swing between them — eating more on hard days, less on easy days — is the whole mechanism.",
      },
      {
        mistake: "Applying the framework without tracking for a baseline first.",
        fix:
          "Most riders discover they are under-fuelling hard days and over-fuelling easy days when they track for a week. Establish where you actually are before prescribing the target.",
      },
    ],
    faq: [
      {
        question: "Where did Fuel for the Work Required come from?",
        answer:
          "The concept originates from sports nutrition research in the early 2000s and was formalised by researchers including Louise Burke and John Hawley. It entered mainstream cycling nutrition through practitioners at World Tour teams, and was brought into the Roadman world through conversations with Dr David Dunne and Dr Sam Impey.",
      },
      {
        question: "Is Fuel for the Work Required the same as carb cycling?",
        answer:
          "Similar in structure but different in philosophy. Carb cycling tends to be a diet strategy focused primarily on body composition. FFTWR is a performance framework first — the body composition benefit is a by-product of matching fuel to training demand, not the primary goal.",
      },
      {
        question: "Will eating more on hard days make me gain weight?",
        answer:
          "If you pair it with eating less on easy days, no. The total weekly calorie balance can be maintained or slightly reduced while improving the distribution. Riders who apply FFTWR properly often find they lose weight gradually without ever feeling like they are restricting.",
      },
      {
        question: "How do I know if my hard days are truly 'high carb'?",
        answer:
          "Track one hard training day and calculate total carbohydrate against your bodyweight. A genuine high-carb hard day for a 75kg rider looks like 450–750g of carbohydrate — rice, pasta, bread, fruit, and on-bike fuelling combined. Most riders who 'eat well' on training days are well below this.",
      },
      {
        question: "Does FFTWR work for cyclists who are not trying to lose weight?",
        answer:
          "Yes — the performance benefit stands independently of any body composition goal. Fuelling hard sessions fully and reducing intake on easy days improves training quality, recovery, and adaptation regardless of weight targets.",
      },
    ],
    relatedEpisodes: [
      "ep-2044-world-tour-nutritionist-we-got-weight-loss-wrong",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-2088-how-cyclists-can-get-lean-stay-lean-forever-alex-larson",
    ],
    relatedTopics: [
      { label: "Cycling Weight Loss — Topic Hub", href: "/topics/cycling-weight-loss" },
      { label: "Fuel for the Work Required Guide", href: "/blog/fuel-for-the-work-required-fftwr-explained" },
      { label: "How do I lose weight without losing power?", href: "/answers/lose-weight-without-losing-power" },
      { label: "Nutrition Periodisation Guide", href: "/blog/nutrition-periodisation-base-build-race" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Energy periodisation around training demand is well established in sports nutrition research; directly corroborated by Dr David Dunne and Dr Sam Impey.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 11 — BEST RECOVERY FOODS FOR CYCLISTS
  // ============================================================
  {
    slug: "best-recovery-foods-cyclists",
    cluster: "nutrition",
    question: "What Are the Best Recovery Foods for Cyclists?",
    seoTitle: "Best Recovery Foods for Cyclists — What Actually Works",
    seoDescription:
      "The best recovery foods for cyclists: protein plus carbs within 30–60 minutes of a hard session. Specific foods, quantities, and the bedtime protein strategy for faster overnight repair.",
    pillar: "nutrition",
    directAnswer:
      "The best recovery foods pair 20–40g of protein with 1–1.2g of carbs per kg of bodyweight within 30–60 minutes of a hard session. Greek yoghurt and fruit, chocolate milk, rice and chicken, eggs on toast, or a whey shake with a banana all work. The food matters less than hitting the protein and carb targets in the window. Before bed on hard days, 30g of slow-digesting protein — cottage cheese or Greek yoghurt — extends overnight repair.",
    keyTakeaways: [
      "The first 30–60 minutes post-ride is the highest-priority recovery window.",
      "Target 20–40g of protein and 1–1.2g/kg of carbohydrate in that window.",
      "Real food and shakes are equally effective if the macro targets are met.",
      "A 30g bedtime protein hit on hard training days meaningfully extends overnight muscle repair.",
    ],
    whoFor: [
      {
        label: "The rider who feels sluggish the day after hard sessions",
        detail:
          "Recovery feels slow and your legs never quite feel ready for the next effort.",
      },
      {
        label: "The masters cyclist protecting muscle between sessions",
        detail:
          "You are over 40 and want to get the maximum recovery stimulus from every session.",
      },
    ],
    roadmanView: [
      "The recovery window is free performance. Anthony has said this on the podcast more than once, and the research is clear enough to be stated plainly: eat 20–40g of protein and meaningful carbohydrate within an hour of a hard session, and you recover faster than if you eat the same food an hour later. Not a little faster — measurably faster, in terms of glycogen replenishment rate and muscle protein synthesis.",
      "The specific food matters far less than most people think. Chocolate milk — old-fashioned, accessible, unglamorous — has as strong a recovery evidence base as any branded recovery product. It delivers roughly 8g of protein and 26g of carbs per 250ml, gets absorbed quickly, and is isotonic enough to aid rehydration. Greek yoghurt with fruit, rice and chicken, or a two-egg scramble on toast all hit similar targets. Pick what you will actually eat within the window.",
      "The bedtime protein piece comes from Dr Michael Ormsbee's research and is still underused. On hard training days and the night before key sessions, 30–40g of slow-digesting casein protein before sleep extends the repair stimulus overnight instead of leaving muscles in a catabolic state for eight hours. Cottage cheese, Greek yoghurt, or a casein shake are the practical options.",
    ],
    expertEvidence: [
      {
        name: "Dr Michael Ormsbee",
        credential: "Sports nutrition researcher, Florida State University",
        insight:
          "Pre-sleep protein intake of 30–40g of casein-rich food improves overnight muscle protein synthesis and next-morning recovery markers in athletes training regularly. For cyclists doing back-to-back hard sessions, this is a meaningful edge that costs almost nothing to implement.",
        episodeSlug: "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
        guestSlug: "michael-ormsbee",
      },
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "Recovery nutrition is one of the highest-return habits for a serious amateur because most are not doing it consistently. The protocol is not complex: protein plus carbohydrate within an hour, protein again before sleep on hard days. The riders who do this reliably recover faster between sessions and hold training quality better through a block.",
        episodeSlug: "ep-2092-sports-nutritionist-the-one-food-thats-slowing-us-down",
        guestSlug: "sam-impey",
      },
    ],
    practicalApplication: [
      {
        title: "Prepare your recovery food before you ride",
        detail:
          "The biggest barrier to the recovery window is arriving home depleted and having nothing ready. Make your post-ride food before you leave — Greek yoghurt in the fridge, a shake with banana ready to blend, or a batch-cooked rice and chicken container. Remove the friction.",
      },
      {
        title: "Match protein and carbs to your bodyweight",
        detail:
          "25–40g of protein alongside 60–90g of carbohydrate for a 70–80kg rider. Concrete options: 200g Greek yoghurt (20g protein) plus a banana and a handful of granola; or a whey shake (25g protein) with 300ml of milk and a banana; or two eggs on two slices of toast plus a piece of fruit.",
      },
      {
        title: "Add 30g of protein before sleep on hard days",
        detail:
          "150g of cottage cheese, 200g of Greek yoghurt, or a casein shake before bed on your hard training nights. On easy days and rest days this is less critical — the stimulus from the bedtime protein is proportional to the training stress that day.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Skipping the post-ride meal because appetite is low after intense sessions.",
        fix:
          "Post-exercise appetite suppression is real — muscle does not care. Eat something small (a shake, yoghurt, fruit) within 30 minutes regardless of hunger, then have a full meal when appetite returns.",
      },
      {
        mistake: "Choosing only carbohydrate in the recovery window.",
        fix:
          "Carbs alone replenish glycogen but do not initiate muscle repair. Protein is equally essential in the post-ride window. Every recovery snack should include a protein source.",
      },
      {
        mistake: "Treating every day the same for recovery nutrition.",
        fix:
          "Easy ride days do not require the same urgency. Focus the recovery-window discipline on hard sessions, intervals, and long rides — the days where the protein and carb window actually makes a difference.",
      },
    ],
    faq: [
      {
        question: "Is chocolate milk a good recovery drink for cyclists?",
        answer:
          "Yes — it has a strong evidence base. Chocolate milk delivers the right protein-carb ratio, it is rapidly absorbed, isotonic, and cheap. It is not glamorous, but the research supporting it as a recovery drink is as strong as most commercial products costing five times more.",
      },
      {
        question: "Should I eat immediately after a ride or wait until I'm hungry?",
        answer:
          "Eat within 30–60 minutes regardless of hunger. Post-exercise appetite suppression can keep you from feeling hungry for 1–2 hours, but glycogen resynthesis and muscle protein synthesis are most rapid in the first hour. A small snack is enough — follow with a full meal when appetite returns.",
      },
      {
        question: "What is the best protein source for cycling recovery?",
        answer:
          "Whey protein is among the fastest-absorbed and most leucine-rich options, making it ideal immediately post-ride. For bedtime use, casein (found in cottage cheese and Greek yoghurt) digests slowly and provides a sustained amino acid release overnight. Both are effective — match the type to the timing.",
      },
      {
        question: "Do I need a recovery shake or is real food enough?",
        answer:
          "Real food is equally effective when appetite allows for it and the macro targets are met. Shakes earn their place when appetite is very low post-ride, timing is tight, or you need a convenient pre-prepared option. There is no magic in the powder.",
      },
      {
        question: "How does sleep affect cycling recovery?",
        answer:
          "Sleep is the primary recovery mechanism — it is where the majority of growth hormone release and protein synthesis occurs. No amount of recovery nutrition compensates for consistently poor sleep. For most athletes, prioritising 7–9 hours of sleep does more for recovery than any specific food.",
      },
    ],
    relatedEpisodes: [
      "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
      "ep-2092-sports-nutritionist-the-one-food-thats-slowing-us-down",
      "ep-31-5-things-pogacar-always-does-after-a-ride",
    ],
    relatedTopics: [
      { label: "Cycling Recovery — Topic Hub", href: "/topics/cycling-recovery" },
      { label: "Bedtime Protein for Recovery", href: "/blog/bedtime-protein-cyclists-recovery-protocol" },
      { label: "What to eat after a ride", href: "/answers/what-to-eat-after-cycling" },
      { label: "How much protein do cyclists need?", href: "/answers/how-much-protein-do-cyclists-need" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Post-exercise recovery nutrition windows are well established; bedtime protein research corroborated by Dr Michael Ormsbee.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 12 — SHOULD CYCLISTS TAKE CREATINE
  // ============================================================
  {
    slug: "should-cyclists-take-creatine",
    cluster: "nutrition",
    question: "Should Cyclists Take Creatine?",
    seoTitle: "Should Cyclists Take Creatine? The Evidence",
    seoDescription:
      "Should cyclists take creatine? Yes, for masters riders and strength work. 5g/day of creatine monohydrate supports short explosive efforts and muscle preservation — but the evidence for endurance performance is mixed.",
    pillar: "nutrition",
    directAnswer:
      "Cyclists should consider creatine monohydrate — specifically 5g daily — if they do strength training, are over 40, or want to protect muscle during a weight-loss phase. Creatine supports short, high-power efforts and aids muscle preservation. The evidence for improving steady-state endurance performance is weak, but the case for strength-trained masters cyclists is clear. Weight gain of 1–2kg from water retention is expected.",
    keyTakeaways: [
      "5g of creatine monohydrate daily is the evidence-backed dose — no loading phase needed.",
      "Benefits are clearest for short high-power efforts, strength work, and masters muscle preservation.",
      "Endurance-only performance gains are small and inconsistent in the research.",
      "Expect 1–2kg of water weight gain within the first two weeks — this is normal.",
    ],
    whoFor: [
      {
        label: "The masters cyclist doing strength work",
        detail:
          "You are over 40, lifting twice a week, and want to get the most from your resistance training while protecting muscle mass.",
      },
      {
        label: "The rider trying creatine but uncertain about the evidence",
        detail:
          "You have heard the claims and want an honest breakdown of what it actually does for cyclists.",
      },
    ],
    roadmanView: [
      "Anthony ran a 30-day creatine experiment and documented it on the podcast. The results were honest: no dramatic FTP jump, no revelation — but measurably better performance in short high-intensity efforts, faster recovery between hard intervals, and a sense of fuller, more capable legs in strength sessions. That is broadly in line with what the research shows.",
      "The strongest case for creatine in cycling is not the FTP argument — it is the masters muscle argument. Creatine supplementation increases the effectiveness of resistance training, and after 40 that combination is meaningful. If you are lifting twice a week to protect power and muscle mass, creatine makes the lifting more effective. The 1–2kg of water weight from creatine retention is temporary and is not fat.",
      "The honest caveat is that creatine does little for pure endurance performance. It does not improve VO2max, it does not raise FTP, and it does not meaningfully help a two-hour steady-state ride. But for sprint finishes, hard climbs, and strength sessions — and for any rider over 40 who is serious about protecting muscle — 5g per day of unflavoured creatine monohydrate is one of the most evidence-backed supplements in sport.",
    ],
    expertEvidence: [
      {
        name: "Creatine 30-day experiment",
        credential: "Roadman podcast — Anthony's personal protocol",
        insight:
          "Anthony's 30-day protocol found improvements in short power output and recovery between intervals, with 1.5kg of water weight gain in the first week that plateaued and did not continue. No meaningful change in sustained power or FTP. The short-power and strength training benefits were genuine.",
        episodeSlug: "ep-2043-i-tried-creatine-for-30-days-the-results-shocked-me",
      },
      {
        name: "Dr Andy Galpin",
        credential: "Professor of Kinesiology, Cal State Fullerton; muscle physiologist",
        insight:
          "Creatine monohydrate is among the most studied and best-supported supplements for muscle function. It improves high-intensity repeat performance, aids muscle protein synthesis when combined with resistance training, and is particularly valuable for older athletes where muscle preservation is a growing priority.",
        guestSlug: "andy-galpin",
      },
    ],
    practicalApplication: [
      {
        title: "Take 5g of creatine monohydrate daily",
        detail:
          "No loading phase is needed — 5g per day builds to effective tissue saturation within two to three weeks. Mix unflavoured creatine monohydrate into water, juice, or a post-ride shake. Take it at the same time each day for consistency.",
      },
      {
        title: "Pair it with your strength sessions",
        detail:
          "Creatine's strongest benefit is as an amplifier of resistance training adaptation. If you are not strength training, the case for creatine is weaker. Start the supplement alongside a consistent lifting programme rather than adding it to an endurance-only schedule.",
      },
      {
        title: "Expect and accept the initial water weight",
        detail:
          "1–2kg of water weight gain in the first two weeks is normal — creatine pulls water into muscle cells. This is not fat and it is not bad for performance. It typically stabilises and some riders find it improves the feeling of muscular fullness during hard efforts.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Expecting creatine to raise FTP or improve aerobic endurance.",
        fix:
          "The evidence for creatine improving steady-state endurance is weak and inconsistent. Take it for short-power, strength, and muscle preservation — not as an FTP tool.",
      },
      {
        mistake: "Stopping creatine because of the initial weight gain.",
        fix:
          "The 1–2kg gained in the first two weeks is water, not fat. It stabilises and does not continue. For most cyclists, the performance benefit outweighs the marginal effect on power-to-weight.",
      },
      {
        mistake: "Using expensive branded creatine products over plain creatine monohydrate.",
        fix:
          "Creatine monohydrate is the form with the overwhelming majority of research behind it. Proprietary blends add cost and complexity without adding efficacy. Buy unflavoured monohydrate.",
      },
    ],
    faq: [
      {
        question: "Does creatine improve cycling performance?",
        answer:
          "For short, high-intensity efforts — sprints, climbs, interval repeats — there is genuine evidence of benefit. For sustained aerobic endurance, the evidence is weak. The strongest case for cyclists is when combined with resistance training, particularly for masters athletes.",
      },
      {
        question: "Will creatine make me heavier and slower?",
        answer:
          "You will gain 1–2kg of water weight in the first two weeks, which is retained in muscle cells. For most cyclists this is neutral to slightly positive in terms of performance — the strength benefits typically outweigh the small weight increase. If you are a pure climber obsessed with kg, the trade-off is worth considering.",
      },
      {
        question: "Do I need to load creatine?",
        answer:
          "No. Loading with 20g/day for a week reaches saturation faster but the benefit over 5g/day is minimal and the GI distress from high loading doses is a real drawback. Take 5g daily, every day, and you reach the same endpoint within three weeks.",
      },
      {
        question: "Is creatine safe for long-term use?",
        answer:
          "Creatine monohydrate is one of the most extensively studied supplements in sport. Decades of research have found no harmful effects in healthy adults at standard doses of 3–5g/day. There is no evidence it damages kidneys in people without pre-existing renal conditions.",
      },
      {
        question: "When in the day should I take creatine?",
        answer:
          "Timing matters less than consistency. Post-workout timing has a small edge in some studies, but the daily total is far more important. Take it at whatever time you will remember — post-ride shake, morning coffee, or with a meal — and keep it daily.",
      },
    ],
    relatedEpisodes: [
      "ep-2043-i-tried-creatine-for-30-days-the-results-shocked-me",
      "ep-27-protein-before-bed-builds-cyclists-muscles-faster-new-study",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "Creatine for Cyclists: 30-Day Data", href: "/blog/creatine-for-cyclists-thirty-day-data" },
      { label: "Should cyclists do strength training?", href: "/answers/should-cyclists-lift-weights" },
      { label: "How much protein do cyclists need?", href: "/answers/how-much-protein-do-cyclists-need" },
      { label: "Energy Availability Calculator", href: "/tools/energy-availability" },
    ],
    evidenceLevel: "moderate",
    evidenceNote:
      "Creatine's benefits for high-intensity and strength performance are well established; evidence for endurance cycling is moderate at best; masters application supported by Dr Andy Galpin's muscle physiology research.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 13 — DOES CAFFEINE IMPROVE CYCLING
  // ============================================================
  {
    slug: "does-caffeine-improve-cycling",
    cluster: "nutrition",
    question: "Does Caffeine Improve Cycling Performance?",
    seoTitle: "Does Caffeine Improve Cycling Performance? The Evidence",
    seoDescription:
      "Does caffeine improve cycling performance? Yes — 3–6mg/kg 45–60 minutes before effort is one of the best-evidenced legal performance aids. What dose works, when to take it, and the tolerance issue.",
    pillar: "nutrition",
    directAnswer:
      "Yes. Caffeine at 3–6mg per kg of bodyweight, taken 45–60 minutes before effort, consistently improves cycling performance by 2–4% in time-trial studies. It reduces perceived exertion, blunts pain, and improves both endurance and high-intensity performance. For a 70kg rider that is 210–420mg — roughly two to four strong coffees. Timing and habituation matter: caffeine tolerance reduces the performance benefit, so some riders cycle off it before key events.",
    keyTakeaways: [
      "3–6mg/kg caffeine, 45–60 minutes before exercise, consistently improves cycling performance by 2–4%.",
      "Caffeine reduces perceived exertion — the same power feels easier.",
      "Habitual high caffeine users see smaller benefits; consider reducing intake in the week before key events.",
      "More caffeine is not better — doses above 6mg/kg increase side effects without extra performance gains.",
    ],
    whoFor: [
      {
        label: "The cyclist who drinks coffee but has never optimised their timing",
        detail:
          "You drink coffee every morning but time it from habit, not performance strategy.",
      },
      {
        label: "The rider who wants to use caffeine for racing or key sessions",
        detail:
          "You want to use caffeine deliberately as a performance tool rather than just a morning habit.",
      },
    ],
    roadmanView: [
      "Caffeine is the most evidence-backed legal performance aid in cycling. Anthony has said it repeatedly and the research backs him up without qualification — the 2–4% improvement in time-trial performance is as robust as any finding in sports nutrition. It is not a placebo. It works by reducing the perceived difficulty of effort, which means you produce more power at the same level of discomfort.",
      "The practical mistake most riders make is drinking coffee every morning regardless of whether they are training hard that day, and then wondering why it does not feel like it does much when they actually race. Caffeine tolerance is real — daily habitual use significantly reduces the performance effect. The riders who get the most from race-day caffeine are the ones who manage their intake strategically: moderate on easy training days, deliberately higher on hard days and before races.",
      "Timing is easy to get wrong too. The peak plasma level hits around 45–60 minutes post-ingestion, so a coffee at the café before a sportive — if you arrive at the start 30 minutes later — means you are still climbing toward peak effect at the gun. Time it so peak effect lands when the race or hard effort starts.",
    ],
    expertEvidence: [
      {
        name: "Caffeine performance research",
        credential: "Meta-analyses in endurance sport",
        insight:
          "Caffeine is among the most consistently replicated findings in sports performance science. A dose of 3–6mg/kg body weight improves time-trial performance by 2–4% on average, reduces RPE at submaximal intensities, and improves both aerobic and anaerobic power output. These effects are present even in habitual users, though the magnitude is smaller.",
        episodeSlug: "ep-2114-how-pro-cyclists-boost-their-performance-with-this-magic-dri",
      },
      {
        name: "Alan Murchison",
        credential: "Michelin-star chef and elite sports nutritionist",
        insight:
          "Coffee is embedded in pro cycling culture for a reason — the performance evidence is genuine. At team level, caffeine use is planned around racing schedules, with deliberate reductions before major events to reduce tolerance and maximise race-day effect.",
        episodeSlug: "what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
        guestSlug: "alan-murchison",
      },
    ],
    practicalApplication: [
      {
        title: "Time caffeine intake 45–60 minutes before the hard effort starts",
        detail:
          "For a sportive starting at 8am, take your caffeine at 7–7:15am. For an interval session starting 45 minutes into a ride, take it before you leave home. The peak performance effect arrives around 60 minutes post-ingestion and lasts 2–3 hours.",
      },
      {
        title: "Dose at 3–6mg/kg for performance use",
        detail:
          "For a 70kg rider: 210–420mg, which is roughly 2–4 espresso shots or one to two strong filtered coffees. Start at the lower end if caffeine-sensitive. More than 6mg/kg adds side effects — anxiety, jitteriness, GI distress — without meaningful extra performance benefit.",
      },
      {
        title: "Consider a caffeine reduction before key events",
        detail:
          "If you drink 3–4 coffees daily, reduce to one or two in the week before a target race or key session. Tolerance reduction amplifies the race-day performance effect. You do not need to eliminate caffeine entirely — a modest reduction is enough.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Drinking coffee at the same time every morning regardless of training.",
        fix:
          "Time caffeine to peak for your hard sessions. A morning coffee 90 minutes before an afternoon interval session barely contributes. Take it 45–60 minutes before the work.",
      },
      {
        mistake: "Taking more caffeine than 6mg/kg hoping for more benefit.",
        fix:
          "The performance dose ceiling is around 6mg/kg. Above that, side effects increase and performance benefit plateaus. Dose intelligently, not aggressively.",
      },
      {
        mistake: "Using caffeine daily in high doses and expecting a race-day effect.",
        fix:
          "Tolerance blunts the performance benefit. Manage intake strategically — lower on easy days, moderate on training days, targeted on race days.",
      },
    ],
    faq: [
      {
        question: "How much caffeine should I take before a cycling race?",
        answer:
          "3–6mg/kg body weight, taken 45–60 minutes before the start. For a 70kg rider that is 210–420mg — roughly two to four espresso shots or one to two strong coffees. Start toward the lower end if you are caffeine-sensitive and test on a training day first.",
      },
      {
        question: "Is caffeine bad for cycling hydration?",
        answer:
          "At the doses used for performance, caffeine does not cause meaningful dehydration in trained athletes. The mild diuretic effect is small and offset by the fluid consumed with the caffeine. Do not avoid coffee because of hydration concerns — this is an outdated concern not supported by the evidence.",
      },
      {
        question: "Can I use caffeine gels during a ride?",
        answer:
          "Yes — caffeine gels used strategically during a ride can provide a mid-ride boost, typically best timed 30–45 minutes before the hardest part of the route. Many riders prefer 25–50mg per gel rather than a large dose all at once, which reduces GI risk. Total daily caffeine still applies.",
      },
      {
        question: "Does caffeine work better for some cyclists than others?",
        answer:
          "Yes. Caffeine metabolism varies based on genetics — specifically CYP1A2 gene variants. Fast metabolisers may need higher doses or different timing. Slow metabolisers experience longer-lasting effects. If caffeine makes you jittery or anxious, you are likely a slow metaboliser and should use the lower end of the dose range.",
      },
      {
        question: "Should I avoid caffeine on rest days?",
        answer:
          "Not necessarily, but moderating intake on easy and rest days reduces habitual tolerance and makes hard-day caffeine more effective. A couple of coffees for enjoyment is fine — you do not need to abstain completely, just avoid the high-dose performance use on days it does not benefit your training.",
      },
    ],
    relatedEpisodes: [
      "ep-2114-how-pro-cyclists-boost-their-performance-with-this-magic-dri",
      "what-pros-actually-eat-to-win-michelin-chef-alan-murchison",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
      { label: "How many carbs per hour for cycling?", href: "/answers/carbs-per-hour-cycling" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
      { label: "What do pro cyclists eat?", href: "/answers/what-do-pro-cyclists-eat" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Caffeine's performance benefits are among the most replicated findings in sports science; timing and dosing guidance supported by the research literature.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },

  // ============================================================
  // 14 — HOW TO AVOID BONKING
  // ============================================================
  {
    slug: "how-to-avoid-bonking",
    cluster: "nutrition",
    question: "How Do I Avoid Bonking on Long Rides?",
    seoTitle: "How to Avoid Bonking on Long Rides — The Fuelling Fix",
    seoDescription:
      "How to avoid bonking on long rides: start fuelling at 30–45 minutes, target 60g of carbs per hour on rides over 90 minutes, and never rely on hunger as your guide. The exact protocol.",
    pillar: "nutrition",
    directAnswer:
      "Avoid bonking by starting to fuel within 30–45 minutes of setting off — before you feel empty — and targeting 60g of carbohydrate per hour on any ride over 90 minutes. Once glycogen is depleted, you cannot fully recover mid-ride. Set a recurring alarm on your head unit, carry more food than you think you need, and eat by the clock, not by hunger. The bonk is not bad luck; it is a fuelling failure that is entirely preventable.",
    keyTakeaways: [
      "Start eating at 30–45 minutes, not when you feel flat — by then you are already two gels behind.",
      "Target 60g/hr of carbohydrate for rides over 90 minutes as the dependable baseline.",
      "Once glycogen is depleted you cannot fully recover mid-ride — prevention is the only strategy.",
      "Carry more food than you think you need; run out of food once and you will always over-pack.",
    ],
    whoFor: [
      {
        label: "The rider who has bonked before",
        detail:
          "You have experienced the bonk — the sudden loss of power, the fuzzy head, the desperate search for a café. You never want it again.",
      },
      {
        label: "The cyclist starting to ride longer distances",
        detail:
          "You are stepping up to 3+ hour rides for the first time and want to get the fuelling right before the wheels fall off.",
      },
    ],
    roadmanView: [
      "Anthony has bonked on long rides and documented the experience. The description is always the same: you feel fine, then you feel fine, then suddenly you feel terrible, your power drops off a cliff, and you are reduced to survival pace while every ride companion disappears. The bonk is not gradual. It arrives suddenly because glycogen depletion is a threshold event.",
      "The reason it keeps happening to riders who 'know' they should eat is that the hunger signal lags catastrophically behind actual glycogen needs. By the time you feel the bonk coming — that hollow, powerless feeling — your muscles are already operating in a deficit that food cannot quickly reverse. You can eat after the bonk and feel marginally better, but you cannot restore hard-riding capability mid-ride. The window to prevent it closed 30 minutes ago.",
      "The alarm on the head unit is Anthony's practical solution and it works. Set a 20-minute recurring alert and eat something on each buzz regardless of how you feel. A gel, a banana, rice cakes, a bar — something with 30–45g of carbohydrate every 20 minutes keeps the tank above the critical level. On a 4-hour ride you will eat more than feels comfortable. Do it anyway.",
    ],
    expertEvidence: [
      {
        name: "Dr Sam Impey",
        credential: "World Tour nutritionist",
        insight:
          "Glycogen depletion is irreversible mid-ride without stopping and eating a full recovery meal — which is not an option in a race or sportive. The only strategy that works is prevention: consistent carbohydrate intake from the early stages, timed against the clock rather than against appetite or perceived effort.",
        episodeSlug: "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
        guestSlug: "sam-impey",
      },
      {
        name: "Fuelling experiment — under vs optimal vs over",
        credential: "Roadman podcast — controlled fuelling comparison",
        insight:
          "Under-fuelled riding produces a predictable pattern: power holds for 60–90 minutes, then declines steadily in the second half of the ride. The contrast with optimally fuelled riding is stark — the power curve stays flat where under-fuelling produces a visible fade. The experiment makes the prevention case more viscerally than any study.",
        episodeSlug: "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      },
    ],
    practicalApplication: [
      {
        title: "Set a 20-minute recurring alarm on your head unit",
        detail:
          "On any ride over 90 minutes, set a reminder to eat every 20 minutes from the 30-minute mark. Each alert is a prompt to take something with 20–30g of carbohydrate — a gel, half a bar, a banana, rice cakes. Three alarms equal roughly 60–90g per hour, which is the target.",
      },
      {
        title: "Carry 20% more food than your plan requires",
        detail:
          "Calculate the food you need for your planned distance and add 20%. Longer routes, unexpected climbing, mechanical delays — anything can extend a ride. Running out of food is never acceptable when a few extra gels weigh nothing. Check your pockets before every long ride.",
      },
      {
        title: "Front-load fuelling in the first hour",
        detail:
          "The first 90 minutes of a long ride is the window to defend glycogen levels before they begin to dip. Eating earlier — 30g at 30 minutes, another 30g at 50 minutes — is more effective than scrambling to catch up at 90 minutes. Start eating while you still feel fine.",
      },
    ],
    commonMistakes: [
      {
        mistake: "Waiting until you feel hungry or flat to start eating.",
        fix:
          "Hunger lags behind glycogen depletion by 20–30 minutes. Eat by the clock from 30 minutes in. By the time you feel the bonk, you are already too late.",
      },
      {
        mistake: "Relying on café stops as your only fuel plan.",
        fix:
          "Plan café stops as supplements to on-bike fuelling, not replacements. The gap between café stops on a long ride often exceeds two hours — that is a 120g carbohydrate deficit if you carry nothing.",
      },
      {
        mistake: "Not practising fuelling on training rides.",
        fix:
          "Race-day fuelling is not the time to learn what works. Practice your exact protocol — timing, products, and quantities — on training rides of similar duration to your event.",
      },
    ],
    faq: [
      {
        question: "What does bonking feel like?",
        answer:
          "A sudden, dramatic loss of power combined with mental fog, lightheadedness, and a sense of overwhelming fatigue. It comes on quickly — you can feel okay one minute and unable to hold 200 watts the next. The legs feel hollow and disconnected. Once there, riding hard is impossible until glycogen is partially restored.",
      },
      {
        question: "Can you recover from a bonk mid-ride?",
        answer:
          "Partially. Eating immediately and reducing pace lets blood glucose recover over 20–30 minutes, which restores the ability to ride at easy pace. Full race-level power does not return until after a proper recovery meal. That is why prevention is the only real strategy.",
      },
      {
        question: "How many gels do I need for a 100-mile sportive?",
        answer:
          "For a 100-mile sportive at around 5 hours of riding, targeting 60g/hr means 300g of carbohydrate. At 25–30g per gel, that is 10–12 gels — or a mix of gels, bars, bananas, and real food. Most riders carry 8 and run short. Carry 12 and eat most of them.",
      },
      {
        question: "Does the bonk happen faster in the heat?",
        answer:
          "Heat increases metabolic rate, sweat losses, and perceived exertion — all of which can accelerate the path to glycogen depletion. Hot-weather rides require consistent fuelling from even earlier in the ride, with higher sodium intake alongside the carbohydrate.",
      },
      {
        question: "Can I bonk on rides under 90 minutes?",
        answer:
          "Rarely, unless you were already under-fuelled before you started — poor diet the day before or no breakfast. Normal glycogen stores are enough for 60–90 minutes of moderate riding without on-bike food. For anything hard, long, or if you start under-fuelled, the window shortens significantly.",
      },
      {
        question: "What is the fastest food to eat when you are bonking?",
        answer:
          "Fast-absorbing glucose: gels, energy chews, a sugary drink, or a banana. Solid food with fat or fibre delays absorption. In an emergency, a flat coke from a corner shop or a handful of sweets delivers glucose fast. Eat, slow down, and wait 20 minutes for it to take effect.",
      },
    ],
    relatedEpisodes: [
      "ep-36-i-tried-under-over-optimal-fuelling-heres-what-no-one-tells",
      "ep-2035-world-tour-nutritionist-we-got-fuelling-wrong",
      "ep-2031-ben-healy-s-insane-fueling-strategy-revealed",
    ],
    relatedTopics: [
      { label: "Cycling Nutrition — Topic Hub", href: "/topics/cycling-nutrition" },
      { label: "In-Ride Nutrition Guide", href: "/blog/cycling-in-ride-nutrition-guide" },
      { label: "How many carbs per hour for cycling?", href: "/answers/carbs-per-hour-cycling" },
      { label: "What to eat before a long ride", href: "/answers/what-to-eat-before-cycling" },
      { label: "Fuelling Calculator", href: "/tools/fuelling" },
    ],
    evidenceLevel: "strong",
    evidenceNote:
      "Glycogen depletion mechanism and prevention via consistent carbohydrate intake is well established; corroborated by Dr Sam Impey and the Roadman fuelling experiments.",
    publishDate: "2026-05-26",
    updatedDate: "2026-05-26",
  },
];
