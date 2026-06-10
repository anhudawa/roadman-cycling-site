/**
 * Tour de France history articles — the historical content layer of the
 * Tour overlay.
 *
 * Each piece is long-form, factual, and built on the Roadman angle: what the
 * riders and climbs of Tour history tell a serious amateur about training,
 * pacing, fuelling, and getting faster after 40. Bodies are Markdown,
 * rendered with the same MDX pipeline and prose styles as the entity pages.
 *
 * Editorial rules: no fabricated quotes; the physiological figures cited are
 * the widely-reported public numbers, framed as illustration not gospel; the
 * doping era is handled honestly, never glorified.
 */

export interface TourHistoryArticle {
  slug: string;
  title: string;
  /** Standfirst / dek. */
  dek: string;
  /** Section label, e.g. "THE GREATS" or "ICONIC CLIMBS". */
  eyebrow: string;
  /** Era or subject tag shown on cards. */
  tag: string;
  readMinutes: number;
  /** ISO publish date. */
  published: string;
  /** Markdown body. */
  body: string;
  related: { label: string; href: string }[];
}

export const TOUR_HISTORY: TourHistoryArticle[] = [
  {
    slug: "eddy-merckx-the-cannibal",
    title: "Eddy Merckx: The Anatomy of the Cannibal",
    dek: "Five Tours, 525 wins, and an engine the lab could barely measure. What the most dominant rider in history teaches a time-crunched amateur — and what his early burnout warns against.",
    eyebrow: "THE GREATS",
    tag: "Merckx · 1969–1974",
    readMinutes: 6,
    published: "2026-06-09",
    body: `Eddy Merckx won the 1969 Tour de France — his first — by nearly eighteen minutes, and took the yellow, green and mountains jerseys at the same time. No rider before or since has finished a Tour with all three. The Belgian press settled on a nickname that stuck for a reason: the Cannibal, the man who could not stop eating up wins.

The numbers are still hard to hold. Five Tours. Five Giri. Around 525 victories across an eleven-year career that took in the cobbled classics, the Grand Tours, the world championship and, in 1972 in Mexico City, the Hour Record — 49.431 kilometres that he later called the hardest ride of his life. He won on the flat, in the mountains, against the clock, in the rain. He attacked from distances that modern tactics call reckless and modern physiology calls expensive.

## The engine

When physiologists tested Merckx, the figures that came back were exceptional but not alien. A maximal oxygen uptake widely reported around the low-to-mid 70s in ml/kg/min. A large, efficient heart. What set him apart was less a single freak number than the combination: a big aerobic ceiling, remarkable efficiency, and the capacity to repeat hard efforts day after day without the tank running dry.

That is the first lesson, and it is the unglamorous one. Merckx's dominance was built on an enormous aerobic base — years of high-volume riding that raised the floor under everything else. The sprint, the climb, the long solo move all sat on top of an engine that could produce power for hours and recover overnight. For the amateur, the takeaway is not the attacking flair. It is the base. The biggest, most durable, most trainable quality in cycling is aerobic endurance, and it is built with volume at controlled intensity, not with a season of hard group rides.

## The cost

There is a second lesson, and Merckx is the cautionary tale as much as the model. He raced everything. Criteriums between Grand Tours, classics on tired legs, a calendar that would now be considered a duty of care problem. By his early thirties the edge had gone. The greatest engine the sport had seen was, in the end, run too hot for too long.

Modern training science has a name for the thing Merckx never got: structured recovery. The adaptation that makes you faster does not happen during the hard ride — it happens after, when the body is allowed to absorb the load. Merckx kept stacking stimulus on stimulus until there was nothing left to absorb it. The riders who last, the masters athletes still setting personal bests into their forties and fifties, are the ones who treat recovery as training rather than as time off.

So take both halves. Build the engine the way the Cannibal built his — patiently, aerobically, over years. Then protect it the way he didn't.`,
    related: [
      { label: "Polarised vs sweet spot training", href: "/blog/polarised-vs-sweet-spot-training" },
      { label: "What a recovery week actually looks like", href: "/blog/cycling-recovery-week-what-to-actually-do" },
      { label: "VO2max training hub", href: "/masters/vo2max" },
    ],
  },
  {
    slug: "bernard-hinault-the-badger",
    title: "Bernard Hinault: The Badger and the Art of Peaking",
    dek: "The last Frenchman to win the Tour didn't race everything — he picked his battles and arrived ready. The case for peaking, for the amateur who can't be in form all year.",
    eyebrow: "THE GREATS",
    tag: "Hinault · 1978–1986",
    readMinutes: 6,
    published: "2026-06-09",
    body: `They called Bernard Hinault le Blaireau — the Badger — for the way he raced: head down, teeth bared, dangerous when cornered. He won five Tours between 1978 and 1985 and remains, four decades on, the last Frenchman to win the race. He won a sixth that he arguably should have, lost in 1980 to a knee injury he rode on far too long, and finished his career on his own terms at thirty-two, the day he said he would.

What separates Hinault from Merckx is instructive, and it is the whole point of this piece. Merckx raced everything and burned bright and brief. Hinault was selective. He targeted. He built his season around objectives and arrived at them sharp, then allowed himself to be ordinary in the races that did not matter to him. The Badger understood something that took sports science another generation to formalise: you cannot be at your best all year, so choose when your best needs to land, and build toward it.

## Periodisation, before it had the name

The modern word for what Hinault did is periodisation — organising training and racing into blocks, each with a purpose, so that fitness peaks for a chosen event rather than drifting along at a permanent middling level. A base period to build the engine. A specific period to sharpen the qualities the goal demands. A taper to arrive fresh. Then a deliberate let-down before the next build.

For a professional with a thirty-year-old's recovery and a full support staff, that is a luxury. For a masters amateur with a job, a family and eight to twelve hours a week, it is a necessity. You do not have the time or the recovery to be race-fit in March and still race-fit in September. The riders who improve year on year are the ones who pick an A-event — the Étape, a target gran fondo, a club hill climb — and reverse-engineer the calendar back from it.

## Racing into form

Hinault also trusted something amateurs find hard to accept: that you can race your way into shape, that the early-season form you are panicking about is supposed to be missing because the build isn't finished yet. Form is not a switch. It is the output of a process that has a date on it.

So borrow the Badger's discipline rather than his aggression. Decide what day you need to be flying. Work backwards. Let the unimportant rides be unimportant. Arrive angry, arrive sharp, and let everything before it be the building, not the proving.`,
    related: [
      { label: "Taper discipline — the 15% gain", href: "/blog/cycling-taper-discipline-15-percent-gain" },
      { label: "Training plans hub", href: "/topics/cycling-training-plans" },
      { label: "Goal setting that actually works", href: "/blog/cycling-goal-setting-that-actually-works" },
    ],
  },
  {
    slug: "miguel-indurain-the-engine-room",
    title: "Miguel Indurain: The Engine Room",
    dek: "A resting heart rate in the high twenties, lungs like bellows, and five straight Tours won at metronomic threshold. Big Mig is the masters athlete's case study in the aerobic engine.",
    eyebrow: "THE GREATS",
    tag: "Indurain · 1991–1995",
    readMinutes: 6,
    published: "2026-06-10",
    body: `Miguel Indurain won five Tours de France in a row, from 1991 to 1995 — the first rider ever to do it. He did it without the showmanship of the climbers he beat, and that was the point. Big Mig won the way a diesel engine works: enormous, efficient, relentless, almost boring, and impossible to drop over a long enough effort.

He was a big man for a Grand Tour winner — around 1.88 metres and 80 kilograms — and on the steepest slopes the lighter climbers could nip away from him. It rarely mattered. Indurain took the time he needed in the individual time trials, where his engine was simply on another level, and then defended in the mountains by riding the climbers off his wheel at a pace they could not sustain and he could hold all day.

## The numbers

The physiological figures attached to Indurain became legend, and even allowing for the way such numbers get rounded up in the retelling, they describe something real. A resting heart rate reported in the high twenties. A lung capacity around 7.8 litres against a typical adult's six. A cardiac output that could move enormous volumes of oxygenated blood. A maximal oxygen uptake often cited near the high 80s in ml/kg/min. The picture is consistent: a vast, efficient aerobic system delivering sustainable power for hour after hour.

## Why this is the masters athlete's blueprint

Here is the part that matters for a rider on the wrong side of forty. Of all the qualities that make a cyclist fast — sprint, anaerobic punch, VO2max, aerobic endurance — the aerobic engine is the most trainable and the one that holds up best with age. Top-end sprint power fades. The big, sustainable, threshold-and-below engine that Indurain embodied can be built and rebuilt deep into the masters years.

That is the diesel. It is made with consistent aerobic volume, with threshold work that pushes the ceiling of sustainable power, and with the patience to let it accumulate over months. Know your functional threshold, train the zones around it deliberately, and you are building the same quality that won five Tours — at a far smaller scale, but on exactly the same principle.

You will never have Indurain's lungs. You do not need them. The engine is trainable, it is durable, and it is the one quality that rewards the time-served amateur most. Big Mig is proof of what it can do when it is the whole strategy.`,
    related: [
      { label: "FTP Zone Calculator", href: "/tools/ftp-zones" },
      { label: "FTP training hub", href: "/topics/ftp-training" },
      { label: "Age-group FTP benchmarks 2026", href: "/blog/age-group-ftp-benchmarks-2026" },
    ],
  },
  {
    slug: "marco-pantani-mathematics-of-the-climb",
    title: "Marco Pantani and the Mathematics of the Climb",
    dek: "Il Pirata flew uphill on power-to-weight most riders can only model. An honest look at what climbing really costs — the watts per kilo, the era, and the danger in chasing it too far.",
    eyebrow: "THE GREATS",
    tag: "Pantani · 1994–2000",
    readMinutes: 6,
    published: "2026-06-10",
    body: `When Marco Pantani attacked on a mountain, he did the thing that should not work: he stood up, threw the bandana down, and accelerated away from the best climbers in the world on the steepest part of the climb. In 1998 he won the Giro and the Tour in the same season, the last rider to manage the double. On his day, going uphill, Il Pirata looked less like he was racing than escaping.

The mathematics behind it is the cleanest in cycling. On a steep climb, against gravity, what matters above almost everything else is power-to-weight — the watts you can sustain divided by the kilograms you carry up the hill. Pantani was small, around 57 kilograms, and he produced a climbing power that, set against that weight, gave him a power-to-weight ratio at the absolute edge of the sport. Light, strong, and willing to suffer past where others stopped.

## The honest part

You cannot write about Pantani's era without the rest of it. The late 1990s were the height of EPO, and the climbing performances of that period — his among them — sit under a shadow that has never lifted. In 1999, leading the Giro and seemingly on his way to another double, he was thrown off the race at Madonna di Campiglio over a blood value. Five years later he was dead, at thirty-four, alone in a hotel room in Rimini. It is a genuine tragedy, and it should be told as one, not as a footnote to the highlight reel.

So the numbers of that climbing era are not a clean benchmark, and we should stop treating them as one. What survives, and what is useful, is the principle underneath.

## What to actually take from it

Power-to-weight is real, and on a long climb it is the number that decides where you finish. But there are two ways to improve it, and only one of them is safe. You can raise the power — through threshold and VO2max work that lifts sustainable output. Or you can drop the weight. The first is almost always the better lever for an amateur, and the second is where riders get into trouble.

Chasing extreme leanness, under-fuelling to hit a climbing weight, is how amateurs walk into low energy availability and the cascade of problems — hormonal, skeletal, immune — that comes with it. It wrecks the very power you were trying to express. The lesson Pantani's story leaves, read honestly, is to build the watts and to fuel the body that makes them. Get faster up the hill by getting stronger, not by getting dangerously light.`,
    related: [
      { label: "Race Weight Calculator", href: "/tools/race-weight" },
      { label: "Energy Availability Calculator", href: "/tools/energy-availability" },
      { label: "Pacing strategy for long climbs", href: "/blog/cycling-pacing-strategy-long-climbs" },
    ],
  },
  {
    slug: "greg-lemond-eight-seconds",
    title: "Greg LeMond, 8 Seconds, and the First Marginal Gain",
    dek: "Shot, written off, and back to win the closest Tour ever — by a margin he found on a set of handlebars. LeMond's 1989 is the original aerodynamics story, and a masterclass in Not Done Yet.",
    eyebrow: "THE GREATS",
    tag: "LeMond · 1986–1990",
    readMinutes: 7,
    published: "2026-06-11",
    body: `Two years before the most famous time trial in cycling history, Greg LeMond was lying in a field with around three dozen shotgun pellets in his body, some of them lodged near the lining of his heart. A hunting accident in 1987 nearly killed the man who, in 1986, had become the first rider from outside Europe to win the Tour de France. The comeback that followed is the reason his name belongs in any conversation about getting faster — and about refusing to accept that your best days are behind you.

In 1989 LeMond arrived at the final stage of the Tour, a short individual time trial from Versailles into Paris, fifty seconds down on Laurent Fignon. Fifty seconds, over a course that short, was supposed to be uncatchable. Everyone said so.

## The handlebars

LeMond did two things differently. He used a set of triathlon aero bars — clip-on extensions that let him stretch out low and narrow over the front of the bike — and an aerodynamic helmet. Fignon rode in a traditional position, on traditional bars, his ponytail loose in the wind. The clock did the rest. LeMond took back fifty-eight seconds in around twenty-five kilometres and won the Tour de France by eight. It remains the closest finish in the race's history.

That is the original marginal-gains story, decades before the phrase existed. On flat ground at speed, the single biggest force a rider fights is air resistance — the great majority of your effort goes into pushing a hole through the air. Position matters more than almost anything else, because a lower, narrower frontal area is free speed: the same watts, a faster bike. LeMond did not out-power Fignon that day. He out-shaped him.

The modern obsessives have only refined the point. The riders and coaches who treat aerodynamics as the highest-return investment in flat-and-rolling performance are LeMond's direct descendants. For an amateur, the order of operations is the same: get the position right before you spend on anything else, because watts are expensive and aero is, comparatively, cheap.

## Not Done Yet, in one man

There is a reason LeMond's story sits naturally inside the Roadman frame. He was written off — too injured, too far back, too late — and he came back anyway, twice. From the gunshot to the 1989 win. From fifty seconds down to eight seconds up. The whole ethos of refusing to accept that the window has closed has a face, and it is his.

So take the literal lesson and the larger one together. Get aero — it is the cheapest speed you will ever buy. And the next time someone tells you the best is behind you, remember a man with pellets near his heart, on a borrowed idea of handlebars, winning the Tour de France by the length of a sprint.`,
    related: [
      { label: "Race Predictor — model your time trial", href: "/predict" },
      { label: "Against the Clock", href: "/against-the-clock" },
      { label: "Cycling time trial tips", href: "/blog/cycling-time-trial-tips" },
    ],
  },
  {
    slug: "alpe-dhuez-21-bends",
    title: "Alpe d'Huez: 21 Bends, and Why It Still Decides Tours",
    dek: "The most famous climb in cycling gets a double finish in 2026 — back-to-back, a Grand Tour first. A history of the 21 hairpins, and how to pace the 40 minutes that decide them.",
    eyebrow: "ICONIC CLIMBS",
    tag: "Alpe d'Huez · since 1952",
    readMinutes: 6,
    published: "2026-06-11",
    body: `It is 13.8 kilometres long, it averages a little over eight percent, and it turns twenty-one times. Alpe d'Huez is not the highest climb the Tour de France uses, nor the steepest, nor the longest. It is simply the most famous, and in 2026 the race does something it has never done before: it finishes there on two consecutive days, on stages 19 and 20. Back-to-back Alpe d'Huez, a Grand Tour first.

The climb entered Tour history in 1952, when Fausto Coppi won the first mountain-top finish ever held there. It then disappeared from the race for a quarter of a century before returning for good in 1976, and it has since hosted some of the sport's defining afternoons. Each of the twenty-one numbered hairpins now carries the name of a stage winner — and because there are more famous winners than there are bends, the names have started doubling up.

## The shape of the effort

For the rider, Alpe d'Huez is a particular kind of test. At thirteen-plus kilometres and eight percent, a strong amateur is looking at somewhere around forty to sixty minutes of climbing. That places the effort squarely in the territory governed by sustainable power — your functional threshold and the band just above it. This is not a climb won by a single explosive move and survived to the top; it is a climb that punishes anyone who starts above the power they can actually hold.

The hardest ramps come early, in the first few bends out of Bourg-d'Oisans, where the road tilts toward double figures before it settles. That is exactly where over-eager riders spend matches they will beg for two-thirds of the way up. The discipline is to climb to your number, not to the wheel in front of you — to let stronger riders go if their pace is above yours, and to ride the whole climb as one even effort rather than a series of heroic accelerations.

## Use the bends

The twenty-one hairpins are a gift to pacing, and the pros use them as one. Each numbered corner is a checkpoint — a way to break a daunting climb into twenty-one manageable pieces, to settle the breathing on the brief flattening of each bend, and to measure the effort against the distance left. Count down from twenty-one. Hold the power. Eat and drink early, because a climb this long is decided as much by what is in the tank as by what is in the legs.

In 2026 the race will climb it twice in two days, which adds a final lesson — the one that runs through all of Tour history. Recovery between back-to-back mountain efforts is its own discipline. The rider who is still there on the second Alpe d'Huez will be the one who refuelled, slept, and rode the first one within themselves. The mountain rewards the patient. It always has.`,
    related: [
      { label: "Stage 19 — Gap to Alpe d'Huez", href: "/tour-de-france/stage/19" },
      { label: "Stage 20 — the queen stage", href: "/tour-de-france/stage/20" },
      { label: "VO2max training hub", href: "/masters/vo2max" },
    ],
  },
];

export function getHistoryArticle(slug: string): TourHistoryArticle | undefined {
  return TOUR_HISTORY.find((a) => a.slug === slug);
}

export function getAllHistorySlugs(): string[] {
  return TOUR_HISTORY.map((a) => a.slug);
}
