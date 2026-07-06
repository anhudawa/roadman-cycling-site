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
    body: `When Marco Pantani attacked on a mountain, he did the thing that should not work: he stood up, threw the bandana down, and accelerated away from the best climbers in the world on the steepest part of the climb. In 1998 he won the Giro and the Tour in the same season, a feat only Pogačar would repeat, twenty-six years later in 2024. On his day, going uphill, Il Pirata looked less like he was racing than escaping.

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
  {
    slug: "mountains-that-made-legends",
    title: "The Mountains That Made Legends",
    dek: "Tourmalet, Galibier, Ventoux, Alpe d'Huez — four climbs the Tour returns to because history was written on them. The decisive afternoons, and what they still ask of a rider.",
    eyebrow: "ICONIC CLIMBS",
    tag: "The Great Climbs",
    readMinutes: 9,
    published: "2026-06-11",
    body: `The Tour de France is won and lost in the mountains, and the great mountains carry more than their altitude. A handful of climbs return to the race year after year — not because the map demands it, but because something happened on each of them that the sport has never been able to put down. Four stand above the rest. The 2026 route visits three of them: the Col du Tourmalet on stage 6, the Col du Galibier on the queen stage, and Alpe d'Huez on two consecutive days. The fourth, Mont Ventoux, sits this edition out — but no honest history of the Tour can leave it unmentioned.

## Col du Tourmalet — where the Pyrenees entered the race

In 1910 the Tour did something close to reckless. For the first time it sent the riders over the high Pyrenees, onto roads that were little more than cart tracks, on bicycles with a single gear and no prospect of help if anything broke. The stage from Bagnères-de-Luchon to Bayonne crossed four passes, the Tourmalet among them, and finished over the Aubisque. When Octave Lapize hauled himself over the top, half-walking, he is said to have turned on the officials at the roadside and spat one word at them: assassins. Murderers.

He had a point. He also won the Tour that year, and the mountains stayed. The Tourmalet — 2,115 metres, seventeen kilometres of climbing from Sainte-Marie-de-Campan at better than seven percent — has since been used more often than any other high pass in the race's history. A giant steel statue of a straining rider, the Géant du Tourmalet, is carried to the summit every summer and planted there for the race to pass. It is the climb that taught the Tour what it could be: not a test of speed across flat country, but a test of who can keep producing power when the road tilts up and refuses to come back down.

It has staged some of the great solo rides. In 1969 Eddy Merckx crossed the Tourmalet alone with well over a hundred kilometres still to race, on a day he could have sat in and defended, and rode to Mourenx nearly eight minutes clear of everyone — an attack so gratuitous that his own staff thought he had lost his mind. For the modern rider the climb remains exactly what it was for Lapize and Merckx: a test governed by sustainable power, your functional threshold and the band just above it, and by fuel. Nobody has ever ridden the Tourmalet well on empty. In 2026 it headlines the queen stage of the Pyrenees, climbed after the Col d'Aspin and before the drag to Gavarnie-Gèdre, and the riders who pace it to a number rather than to the wheel in front of them will be the ones still there at the top.

## Col du Galibier — the roof of the race

If the Tourmalet opened the Pyrenees, the Galibier opened the Alps. First crossed in 1911, at 2,642 metres by its hardest approach it is among the highest points the Tour ever reaches, and in 2026 it is the highest of all — the Souvenir Henri Desgrange, the prize awarded each year at the race's summit. Desgrange founded the Tour, and his monument stands near the top of the Galibier; the riders climb past the memory of the man who sent them up there in the first place.

The Galibier has decided Tours by the simple fact of its size. In 2011 the race finished on its summit for the first time, and Andy Schleck rode away from the field with around sixty kilometres still to race, a long-range attack of a kind the data age was supposed to have made impossible. He held it to the line. The lesson of the Galibier is the lesson of altitude and duration stacked together: it rewards the rider with the deepest aerobic engine and the discipline to ration it. In 2026 it comes on stage 20, after the Croix de Fer and the Télégraphe, with Alpe d'Huez still to climb afterward — the kind of day that is survived before it is won. The Galibier is also where the weather can decide a Tour on its own terms: even in July, snow, freezing fog and sleet have met the riders at its summit, and more than one race has been reshaped less by an attack than by the cold gnawing at exhausted men on the long descent toward the Col du Lautaret.

## Mont Ventoux — the Giant of Provence

No climb in cycling looks like the Ventoux. Its upper slopes are stripped bare, a bald white scree of broken limestone that holds no trees, no shade and very little mercy. It stands alone above the plains of Provence, and on a hot day the heat comes off the rock like a furnace. The Tour has gone there since 1951, and the mountain has taken its price.

On 13 July 1967, Tom Simpson — Britain's first world champion, a rider of enormous courage and not much restraint — collapsed and died near the summit, his body overwhelmed by a combination of amphetamines, alcohol and savage heat. A memorial stands at the spot where he fell, and to this day riders and fans leave bottles and caps on it as they pass. It is the darkest landmark on any Tour climb, and a permanent argument against the idea that suffering is always noble.

The Ventoux has produced lighter legends too, and a few uneasy ones. In 1970 Eddy Merckx won the stage to the top and needed oxygen at the line, so deep had he gone. In 2000 the mountain hosted a duel between Lance Armstrong and Marco Pantani that ended in argument — Armstrong appeared to let the climber take the stage at the summit, then belittled him for it afterward, and within four years both men's reputations would lie in ruins for very different reasons. In 2016 ferocious wind forced the finish down to Chalet Reynard, a motorbike pile-up brought Chris Froome down in the yellow jersey, and the race leader — bike broken, no spare yet in sight — got off and ran up the road in his cleats, one of the strangest images the Tour has produced. In 2021 the race went over the Giant twice in a single stage, by two different roads, just to see who was left. The mountain does that. It turns the race into theatre, and occasionally into tragedy.

## Alpe d'Huez — the amphitheatre

Alpe d'Huez is the most famous climb in the sport, and it earned the title on the road rather than on paper. Fausto Coppi won the Tour's first mountain-top finish there in 1952. The race left it alone for a quarter of a century, then brought it back for good in 1976, and it has hosted the sport's defining afternoons ever since. Each of its twenty-one numbered hairpins now carries the name of a stage winner; there are more famous winners than there are bends, so the names have begun to double up.

What sets the Alpe apart is the crowd. The climb is short by Alpine standards — 13.8 kilometres at a little over eight percent — but it is steep, close, and lined with hundreds of thousands of people who close to a corridor barely wide enough for the bikes; the Dutch corner, bend seven, is a furnace of orange smoke and noise that riders describe as both terrifying and intoxicating. It is a 40-minute effort ridden inside a wall of sound. Every kind of Tour drama has played out there: Marco Pantani set a climbing record in the 1990s that has never been bettered, though the era it belongs to means the figure is admired and distrusted in the same breath; and in 1986 Greg LeMond and Bernard Hinault, teammates and rivals, rode up it side by side and crossed the line hand in hand, a truce and a power play in one photograph. In 2026 the Tour finishes there on two consecutive days, stages 19 and 20, a first for any Grand Tour. The rider still standing on the second visit will be the one who refuelled, slept and rode the first one within himself.

## What the mountains ask

Strip away the history and these four climbs ask the same three questions of every rider, professional or amateur. Can you hold a sustainable power for a long time — the engine built over months of aerobic work, not in a final sharp week. Can you pace to your own number instead of chasing a wheel that is faster than you. And can you keep fuel in the tank, because every one of these climbs has ended the day of someone who was fit enough but ran empty. The legends were made by riders who answered all three. The mountains have not changed the questions since.`,
    related: [
      { label: "Tom Simpson — the untold story (podcast)", href: "/podcast/ep-2146-the-untold-story-of-world-champion-tom-simpson" },
      { label: "Alpe d'Huez — 21 bends of history", href: "/tour-de-france/history/alpe-dhuez-21-bends" },
      { label: "Stage 6 — the Tourmalet", href: "/tour-de-france/stage/6" },
      { label: "VO2max training hub", href: "/masters/vo2max" },
    ],
  },
  {
    slug: "greatest-rivalries-tour-de-france",
    title: "The Rivalries That Defined the Tour",
    dek: "Anquetil and Poulidor split a nation. Hinault and LeMond split a team. Merckx and Indurain answered everyone at once. Five careers, four rivalries, and the tension that makes the race.",
    eyebrow: "TOUR FEATURES",
    tag: "Rivalries · 1960s–1990s",
    readMinutes: 9,
    published: "2026-06-11",
    body: `A bike race needs more than a winner. It needs two riders who cannot both have what they want, and a reason for the rest of us to take a side. The Tour de France has produced a handful of rivalries so complete that they outgrew the results sheet and became arguments about character — about how a champion should behave, and what we are really cheering for when we cheer. The bikes and the science have changed beyond recognition across sixty years; the shape of a great rivalry has not changed at all.

## Anquetil and Poulidor — the technician and the people's choice

In the 1960s France split itself in two over a question that had nothing to do with politics. Jacques Anquetil was the first man to win the Tour five times — cold, precise, a time-trial machine who did exactly as much work as winning required and not one pedal stroke more. He treated the race as a sum to be solved: take the minutes in the time trials, concede as little as possible in the mountains, and never spend a watt on a gesture. Raymond Poulidor was his opposite in every direction: warm, attacking, generous to a fault, and forever just short. Poulidor stood on the Tour podium eight times across a fourteen-year career and never once pulled on the yellow jersey, not even for a single day. They called him the eternal second, and the country adored him for it precisely because he never quite won.

The rivalry has a single defining image. On the Puy de Dôme in 1964, with the whole Tour balanced between them, Anquetil and Poulidor climbed the volcano shoulder to shoulder, elbows almost touching, neither willing to give a centimetre. For kilometres they rode locked together, two men and one jersey, in what is still remembered as the most famous duel the race has staged. Poulidor finally cracked his rival near the summit and took back time — but not enough. Anquetil, emptied, defended the yellow jersey into Paris by 55 seconds, the closest the race had been. France understood the lesson and refused to learn it. Anquetil was admired; Poulidor was loved; and the gap between those two words was the whole story.

Poulidor's defeat became his immortality. He retired without a single day in yellow and the country loved him more for it than it loved most champions — proof that the Tour rewards character as richly as it rewards results. The bloodline endured, too. Poulidor's grandson is Mathieu van der Poel, one of the brightest riders of the current peloton, and a man who has worn the yellow jersey his grandfather never could. When van der Poel pulls it on, the commentary always finds its way back to Pou-Pou. Some rivalries echo for sixty years.

## Hinault and LeMond — the rivalry inside one team

The strangest of the great rivalries unfolded between teammates wearing the same jersey. In 1985 the young American Greg LeMond rode in service of Bernard Hinault, the fearsome French champion known as the Badger, and helped carry him to his fifth Tour. The understanding, as LeMond believed it, was simple and binding: Hinault would repay the debt the following year and ride for him.

Nineteen eighty-six did not go to plan. Hinault attacked, and attacked, and attacked again — putting LeMond under pressure, taking the yellow jersey, insisting all the while that he was only making the race hard to soften their rivals. LeMond, in the same team car and increasingly the same despair, was no longer sure whether the most dangerous man in the race was on his side or across the road. The defining moment came on Alpe d'Huez, where the two of them rode up the mountain together and crossed the line hand in hand, Hinault a wheel ahead — a photograph that has been read as friendship and as a power play in roughly equal measure ever since. LeMond won his first Tour. Hinault finished second and called the whole campaign loyalty.

The fallout outlasted the race. Hinault's fifth title in 1985 remains, four decades on, the last by a Frenchman — and the 1986 Tour he tried so hard to control was the one that handed the race to an American and tilted the sport's centre of gravity away from France for good. LeMond never fully trusted him again, and the two have told the story differently every year since: one as a hard but fair plan to forge a champion, the other as a betrayal survived. Both versions can be true at once. That is what makes it the most human rivalry the Tour has produced, and it is worth hearing both men on it in their own words.

## Merckx and Indurain — the rivals against everyone

Two of the Tour's defining figures had no single rival at all, because they beat the entire field at once. Eddy Merckx — the Cannibal — won five Tours between 1969 and 1974 and devoured everything else in between, attacking from distances that modern tactics call reckless, winning sprints, climbs and time trials inside the same three weeks. In 1969 he crossed the Tourmalet alone with well over a hundred kilometres still to ride and arrived in Mourenx nearly eight minutes clear of the next man, a ride so absurd that his own team manager begged him to ease off. His rivals were a rotating cast of very good riders who took turns being beaten and then went home.

Miguel Indurain did the same thing two decades later and made it look like the opposite. Where Merckx was relentless, Big Mig was a diesel — five straight Tours from 1991 to 1995, the first man to win five in a row. He took his minutes in the time trials, where his engine was on another plane, and defended in the mountains by riding the climbers off his wheel at a metronomic pace they simply could not hold. Neither man had a true equal. Both had the same effect on the race, which was to remove the suspense and replace it with awe. A rivalry needs two. Merckx and Indurain were each, for their era, a rivalry of one — which is its own kind of greatness, and its own kind of problem for a sport that lives on doubt.

## Pogačar and Vingegaard — the rivalry of the data age

The current Tour has its own version, and it is the best the race has had in a generation. Tadej Pogačar, the Slovenian who attacks like a throwback to Merckx, and Jonas Vingegaard, the quiet Dane who answers him watt for watt, have traded the yellow jersey and the upper hand across several seasons. The rivalry has already produced its own Puy de Dôme. On the Col du Granon in 2022, Vingegaard's team laid a trap in the Alpine heat, attacked Pogačar from distance, and watched the Slovenian — who had looked untouchable for two years — crack spectacularly and lose the Tour in a single afternoon. A year later Pogačar answered back, and the jersey has swung between them since. Their duels on the high passes — Pogačar gambling on a long move, Vingegaard pacing with cold precision and then countering when the Slovenian over-reaches — have brought panache back to a sport the data era was supposed to make predictable. Two riders of near-equal strength and opposite temperament, raised on power meters and physiology, have produced exactly the theatre that Anquetil and Poulidor produced on instinct alone. The technology changed everything except the part that matters. The 2026 Tour will most likely turn on the next chapter of it.

## Why the tension matters

The riders change and the bikes change, but the shape of the thing does not. Every great Tour comes down to two people who cannot both win, and to the way each of them carries it — the calculation of Anquetil, the heart of Poulidor, the ruthlessness of Hinault, the patience of Indurain, the daring of Pogačar, the ice of Vingegaard. That is the real engine of the race, deeper than any single result. It is why we watch a three-week event for the twenty minutes a day when two people finally stop bluffing. And it is why the riders the sport remembers most warmly are rarely the ones who won the most. We remember the ones who had someone to beat, and a manner of beating them — or of losing to them — that told us exactly who they were. A champion alone is a statistic. A champion with a rival is a story, and the Tour has always been in the business of stories. The 2026 race will produce its own version, because it always does. The names on the road will be different. The tension will be exactly the same.`,
    related: [
      { label: "LeMond on his relationship with Hinault (podcast)", href: "/podcast/ep-2176-lemond-opens-up-about-relationship-with-hinault-rdmn-clips" },
      { label: "Bernard Hinault — the Badger", href: "/tour-de-france/history/bernard-hinault-the-badger" },
      { label: "Greg LeMond — 8 seconds", href: "/tour-de-france/history/greg-lemond-eight-seconds" },
      { label: "Miguel Indurain — the engine room", href: "/tour-de-france/history/miguel-indurain-the-engine-room" },
    ],
  },
  {
    slug: "greatest-comebacks-tour-de-france",
    title: "The Greatest Comebacks the Tour Has Seen",
    dek: "A rider returning from a gunshot. A champion winning ten years after his first, with a country on edge. And the comeback that turned out to be a lie. What the Tour's resurrections really teach.",
    eyebrow: "TOUR FEATURES",
    tag: "Against the odds",
    readMinutes: 9,
    published: "2026-06-11",
    body: `The Tour de France is long enough and hard enough to break almost anyone, which is why the comeback is one of its oldest and best stories. A rider written off, a career assumed finished, a deficit declared uncatchable — and then it isn't. The best of these stories are not about luck. They are about what a person does with the time that everyone else spends giving up, and they have a way of outliving the results they produced. The Tour, more than any race on the calendar, hands a rider both the time to fall and the room to climb back, and it has been rewarding that particular brand of stubbornness since its very first edition. The wins fade in the memory. The returns from the dead do not.

## Greg LeMond, 1989 — back from the dead, by eight seconds

Two years before the most famous time trial in cycling history, Greg LeMond was lying in a field with around three dozen shotgun pellets in his body, some of them lodged near the lining of his heart. A hunting accident in 1987 nearly killed the man who, in 1986, had become the first rider from outside Europe to win the Tour. He lost most of two seasons to surgery and recovery; the pellets that could not be safely removed are in him still. He was, by any reasonable account, finished.

In 1989 he arrived at the final stage of the Tour — a short time trial into Paris — fifty seconds down on Laurent Fignon, a margin everyone in the race agreed was uncatchable. LeMond used a set of clip-on aero bars and an aerodynamic helmet; Fignon rode in the traditional position, on traditional bars, his ponytail loose in the wind. LeMond took back fifty-eight seconds in twenty-five kilometres and won the Tour de France by eight — the closest finish in the race's history, and a margin a healthy rider would have struggled to find, let alone a man rebuilt around birdshot. Fignon, who had led for so long, was told the result as he slumped over his handlebars on the Champs-Élysées and wept on the cobbles, an image of loss as famous as LeMond's of triumph. It remains the standard against which every comeback is measured: pellets near his heart, a borrowed idea of handlebars, the biggest race on earth won by the length of a sprint.

## Gino Bartali, 1948 — ten years, and a country on the edge

Gino Bartali won the Tour in 1938, and then the world stopped. War took the next several editions and the best years of his career with them. By 1948 he was thirty-four, his great victory a decade behind him, and few expected him to do more than ride with honour.

What he did instead has passed into legend, some of it earned and some of it embroidered. Bartali won the 1948 Tour — ten years after his first, the longest gap between victories in the race's history. He did it at a moment when Italy stood on a knife edge: an assassination attempt on a political leader had pushed the country toward open unrest, and the story handed down is that Bartali's win gave a fractured nation something it could agree on and helped pull it back from the brink. Historians are right to be cautious about how much a bike race can really do to a country. But the core of it is true and remarkable enough on its own — a man written off by time winning the hardest race in the world a full decade after everyone assumed his moment had gone. And the larger truth is larger still: through the war years Bartali had quietly carried forged identity documents hidden in the frame and seatpost of his bicycle, riding hundreds of kilometres under the cover of training to help save Jewish families from deportation, a thing he refused to speak about for the rest of his life. The comeback was the smaller half of the man.

## Eddy Merckx, 1975 — the champion who would not stop

Not every great comeback is a victory. In 1975 Eddy Merckx, chasing a record sixth Tour, was punched in the stomach by a spectator on the Puy de Dôme and rode on, doubled over, to defend his lead. Days later he crashed and fractured his face, an injury that should have ended his Tour outright. He kept riding, barely able to eat, and finished second in Paris to Bernard Thévenet — who had staged his own quiet comeback from the illness and self-doubt that had nearly finished him a year earlier. Merckx did not win. He did something the sport remembered longer than another victory: he refused to climb off, and turned a lost Tour into the clearest statement he ever made about what a champion is once the winning has stopped.

## Mark Cavendish, 2021 — the sprinter nobody wanted

The most moving modern comeback belongs to a sprinter. By 2020 Mark Cavendish — once the fastest man in the world — looked finished. Years of the Epstein-Barr virus had hollowed out his form, depression had done the rest, and he stood at a race in tears saying it might be the last time anyone saw him on a bike. No major team wanted him for 2021. He took a low-paid, last-chance place at his old squad as a fallback option, not a leader.

Then the team's first-choice sprinter got hurt, and Cavendish went to the Tour almost by accident. He won four stages. He pulled on the green jersey. And on the road to Carcassonne he took his thirty-fourth Tour stage win, equalling the all-time record that had belonged to Eddy Merckx for half a century. Three years later, at thirty-nine, he came back once more and won a thirty-fifth, breaking a record that had stood since 1975. It is the rare comeback with no asterisk and no tragedy attached — a man the sport had buried, fastest of all again, on the biggest stage there is.

## The comeback that wasn't

Honesty requires the counter-example. For years the most celebrated comeback in the race's history was Lance Armstrong's return from cancer to win the Tour seven times. It was told as the ultimate triumph of will, and millions believed it. It was also, we now know, built on the most systematic doping programme the sport has produced, and all seven titles were stripped in 2012. The lesson is not that comebacks are fairy tales. It is that the real ones — LeMond on a time-trial bike, Bartali ten years on, Merckx riding with a broken face, Cavendish from the scrapheap — are the ones that hold up when you look closely. The honest comebacks survive scrutiny. The manufactured one did not. The riders who lived through that era have spent the years since trying to tell the difference, and they are the people worth listening to on it.

## Why the Tour keeps producing them

No race manufactures comebacks like this one, and the reason is built into its shape. The Tour is three weeks long, which is enough time for a rider to lose everything in the first hour and claw it back over the second and third. It spans careers measured in decades, long enough for a champion to fall, fade and return. And it hurts enough — in the heat of Provence, on the slopes of the Pyrenees, deep in the final week — that simply continuing becomes a kind of victory in itself. A one-day race does not give you the room to come back. The Tour gives you almost nothing but room, and then dares you to use it. That is why the comeback is not a sub-plot of Tour history. It is closer to the main one.

## What the comebacks share

Beneath the drama, the great Tour comebacks have one thing in common, and it is unglamorous: consistency held under conditions that would excuse the opposite. LeMond rebuilt an engine the slow way across two lost years. Bartali stayed a professional through a decade that gave him every reason not to. Cavendish kept turning the pedals when no team and, some days, no part of himself believed it was worth it. The amateur takeaway is identical to the professional one — the riders who come back are the ones who keep doing the basic work, fuelled, recovered and paced, on the days when nobody would blame them for skipping it. Form does not arrive as a bolt of lightning. It returns, slowly, to the people who keep showing up for it.`,
    related: [
      { label: "Greg LeMond — 8 seconds", href: "/tour-de-france/history/greg-lemond-eight-seconds" },
      { label: "Cavendish's coach on the record-breaking win (podcast)", href: "/podcast/ep-2108-did-cavendishs-coach-reveal-the-secret-to-winning-vasilis-an" },
      { label: "Hamilton on doping and forgiving Lance (podcast)", href: "/podcast/ep-2152-hamiltons-untold-account-of-doping-forgiving-lance" },
      { label: "The LeMond doping dispute", href: "/blog/trek-lemond-doping-dispute-cycling-history" },
    ],
  },
  {
    slug: "evolution-of-tour-tactics",
    title: "From Lone Suffering to Data: How Tour Tactics Changed",
    dek: "The Tour was built to be ridden alone, no help allowed. A century later it is the most controlled endurance event on earth. How the race got from a rider forging his own fork to power meters and marginal gains — and what swung back.",
    eyebrow: "TOUR FEATURES",
    tag: "The craft of racing",
    readMinutes: 9,
    published: "2026-06-11",
    body: `The Tour de France was invented to be ridden alone. Its founder, Henri Desgrange, believed the perfect race was one in which a single rider suffered against the road with no help from anyone, and he wrote the rules to enforce it. The story of Tour tactics is the story of how the race grew out of that idea — through teams, radios, technology and data — and then, in the last few years, swung partly back toward it.

## The age of self-reliance

In the early Tours, outside assistance was banned outright, and the riders paid for it. The most famous example came in 1913, when Eugène Christophe broke the front fork of his bicycle descending the Tourmalet. The rules forbade anyone repairing it for him, so he walked roughly ten kilometres to a village blacksmith's forge at Sainte-Marie-de-Campan and made a new fork himself, by hand, while officials stood over him to make sure no one lent a finger. He was then docked additional minutes because a boy had worked the bellows of the forge for him. Christophe lost the Tour to a broken fork and a pair of bellows, and the sport has never quite forgotten it.

This was racing as pure attrition. There were no team cars, no spare bikes, no plan beyond keep going and hope nothing snaps. Even the technology was held back on principle — Desgrange resisted the derailleur for years, convinced that gears made the race too soft, and the riders were not permitted to use one in the Tour until 1937. The romance of that era is real, but so is the cruelty of it. The Tour spent its first decades deciding that the suffering was the point.

## The rise of the team

Once help was allowed, the team changed everything. The domestique — literally the servant — became the engine of Tour tactics: riders whose entire job was to fetch bottles, shelter their leader from the wind, chase down attacks and empty themselves completely for someone else's result. A great champion was now also the product of seven or eight men riding themselves inside out in his service. The Tour became a contest between organisations as much as individuals, and the sport's tactical grammar — the lead-out train, the blocking on the front, the controlled tempo that strangles a breakaway — was written in this period.

Then came the earpiece. From the 1990s, race radios let directeurs sportifs in the team cars talk to their riders in real time — relaying time gaps, ordering attacks, calling the catch to the metre. Racing grew sharper and, to many, more scripted: a breakaway's freedom now lasted exactly as long as a man in a car decided to allow it. The debate over whether to ban radios, to hand spontaneity back to the riders, has run for two decades and never quite resolved. It is the clearest sign of how far the race had travelled from Christophe at his forge.

## The data revolution

The deepest change came late, and it came from measurement. The portable power meter — pioneered by the German engineer Uli Schoberer, whose SRM cranks first let a rider see exactly how many watts he was producing — turned training and racing from feel into numbers. Effort could be prescribed to the watt, paced to the watt, and dissected to the watt afterward.

What followed was the most controlled era the race had seen, and one team came to define it. Built around the idea of marginal gains — dozens of tiny advantages compounding into a decisive one — the British super-team of the 2010s drilled its riders to hold a precise, punishing power on every climb, setting a tempo so high and so even that attacking it was simply pointless. The mountain train, a line of teammates detonating one by one to deliver their leader to the final kilometre, won Tour after Tour and made the race relentless, ruthless and, to some eyes, a little airless. Aerodynamics turned into its own arms race in parallel — the clip-on bars that won LeMond the 1989 Tour grew into wind tunnels, skinsuits and a sport in which the shape a rider cuts through the air is measured as carefully as the watts behind it. Nutrition science arrived alongside the power files: the discovery that trained riders could take on far more carbohydrate per hour than anyone had thought rewrote how a stage was fuelled and quietly removed the spectacular blow-ups that the old guesswork used to produce.

## The shadow over the data

There is a darker chapter between the team era and the data era, and honesty requires naming it. Before power meters made effort transparent, chemistry had made it dishonest. Through the late 1980s, the 1990s and into the 2000s, the blood-booster EPO let riders hold tempos on the great climbs that were not humanly clean, and it warped tactics as badly as it warped the results sheet — the controlled, suffocating pace that drained the spectacle from that era was, for too many teams, pharmaceutical rather than physiological. It came to a head in 1998, when the Festina affair broke open mid-race: a team car was found stuffed with doping products, riders went on strike in protest at the police raids, and the Tour came within a whisker of collapsing entirely. The clean-up that followed was slow and incomplete, but it eventually produced the biological passport and a generation of riders determined to win another way. Much of the modern fixation on measurable, legal marginal gains is a direct reaction to that period — a sport that had learned, at enormous cost, exactly what the unmeasurable kind was worth. When people praise how transparent today's racing is, with its public power figures and its data open to scrutiny, they are praising the opposite of what came before.

## The swing back

Here is the part nobody scripted. The data age was supposed to kill the long-range attack — to make the race so calculable that no rider would gamble on a move that the numbers said could not stick. Instead the current generation has done the opposite. Riders raised entirely on power files and physiology have started attacking from absurd distances again, racing on instinct and aggression in a way that looks far more like Merckx in 1969 than like the metronomic trains of a decade ago. The numbers, it turned out, did not make the racing timid. In the right temperament they did the reverse — they made riders confident enough to take bigger risks, because for the first time they knew, to the watt, exactly how much they had to spend and exactly when the rider chasing them would crack. The most modern Tours have produced the most old-fashioned racing, which is the kind of paradox the sport specialises in.

## The team behind the team

The modern Tour squad is as much a laboratory as a group of riders. Behind the eight men on the road sit coaches, physiologists, nutritionists, data analysts and aerodynamicists, each refining a single piece of the puzzle. The directeur sportif in the team car, once the lone tactical brain of the operation, now relays decisions shaped by a backroom that has modelled the stage, the weather, the rivals' power figures and the leader's form in fine detail before the flag has even dropped. It is a long way from Eugène Christophe alone at his forge. And yet, as the racing keeps showing, all that machinery has not removed the one thing the race has always come down to — a rider willing, at the right moment, to do something the model said could not be done.

## What the amateur takes from it

The whole arc of Tour tactics hands the everyday rider three lessons that have survived every change of era. The first is drafting: sitting in the wheels can cost up to a third less power, the single biggest piece of free speed there is, and it is why the peloton holds over forty kilometres an hour with riders barely breathing in the middle of it. The second is pacing to a number — the power meter is not a professional's toy but the most honest coach you can own, and a climb or a time trial held at your own sustainable figure will always beat the same effort ridden on adrenaline and ego. The third is fuelling to a plan rather than to hunger, because the same science that ended the pros' blow-ups works identically on a Sunday club run; by the time you feel empty, it is already too late. A century of tactical evolution, boiled down, comes to three instructions a beginner can follow: ride in the wheels, hold your number, and eat before you have to.`,
    related: [
      { label: "The first power meter — Uli Schoberer (podcast)", href: "/podcast/ep-2101-the-genius-behind-the-first-ever-power-meter-uli-schoberer" },
      { label: "How Pogačar became the greatest (podcast)", href: "/podcast/ep-15-untold-story-of-how-pogacar-became-the-greatest-rider-ever" },
      { label: "In-Ride Fuelling Calculator", href: "/tools/fuelling" },
      { label: "VO2max training hub", href: "/masters/vo2max" },
    ],
  },
  {
    slug: "history-of-grand-departs-barcelona",
    title: "Barcelona to Paris: A History of Grand Départs",
    dek: "The Tour once started on the edge of Paris and nowhere else. Now the right to host the Grand Départ is fought over by cities and countries. How the start became a prize — and why 2026 begins in Barcelona.",
    eyebrow: "TOUR FEATURES",
    tag: "The Grand Départ",
    readMinutes: 8,
    published: "2026-06-11",
    body: `Every Tour de France ends on the Champs-Élysées. Where it begins is another matter entirely, and over the last seventy years the start of the race — the Grand Départ — has grown from an afterthought on the edge of Paris into one of the most coveted hosting rights in world sport. In 2026 it goes to Barcelona, the most southerly Grand Départ the race has ever held, and opens with a team time trial. To understand why that matters, it helps to know how the start became a story in its own right.

## When the race only started in Paris

For its first half-century the Tour began at or near Paris, because the Tour was a French institution and it did not occur to anyone that it might begin somewhere else. The first race, in 1903, rolled out of a café on the southern edge of the city. For decades after, the opening stage was simply the first day's racing, sent down a long road south or west with no ceremony attached to the act of leaving. The drama was assumed to live in the mountains and at the finish; the start was logistics, nothing more.

That changed in 1954, when the Tour began outside France for the first time, in Amsterdam. The idea was modest — a single foreign start as a novelty — but it planted something that grew. A city, it turned out, could host the beginning of the biggest annual event in world sport, fill its streets with crowds and television cameras, and present itself to a global audience across an entire weekend. The Grand Départ stopped being logistics and started being a prize.

## The start becomes a prize worth fighting for

In the decades since, the opening of the Tour has become a contest that cities and whole regions compete to win, and they pay handsomely for it — a foreign Grand Départ now costs the host several million euros in fees alone, a price justified by the tourism and the exposure a weekend in the global spotlight brings. The race has begun in Berlin, in Rotterdam, in Monaco. London opened it in 2007 to vast crowds along the Mall. Düsseldorf took it in 2017. In 2019 it started in Brussels, deliberately, to mark fifty years since Eddy Merckx — a son of the city — won the first of his five Tours.

The high-water mark may have been Yorkshire in 2014, when the roads of northern England were lined three and four deep with an estimated two and a half million spectators, a turnout that stunned even the organisers and rewrote what a Grand Départ could be. Copenhagen opened the race in 2022, Bilbao carried it into the cycling-mad Basque Country in 2023, Florence brought it to Italy in 2024, and Lille started it in 2025. Each foreign départ makes the same quiet argument: that the Tour is no longer only France's race, but a travelling festival the rest of the world now bids to hold.

## The riders who owned the opening day

If the host cities turned the start into a spectacle, a handful of riders turned it into a personal fiefdom. For decades the prologue and the opening time trial belonged to the great specialists against the clock, men who could take the first yellow jersey before a single mountain had its say. Miguel Indurain used the discipline to stamp his authority on a Tour from the opening hour. Fabian Cancellara made the start his own to a degree nobody has matched, pulling on the first yellow jersey so often across his career that he wore it more times, in total, than many outright Tour winners — almost all of it earned in the opening days, against the clock, on roads built for a power he had and the climbers did not. For these riders the Grand Départ was never a formality to survive. It was the one part of the route designed for them, and they treated it accordingly. It is part of why the organisers guard the opening so jealously: a well-shaped first stage hands a story, and a jersey, to a rider the three weeks of mountains might otherwise forget.

## A short history of the opening day

The format of the start has shifted as much as its location. For decades the Tour opened with a prologue — a very short individual time trial, often under ten kilometres, designed to settle the first yellow jersey on day one and hand a specialist a moment of glory before the climbers and sprinters took over the race. The prologue produced its own folklore: Chris Boardman flew round the 1994 version at an average that brushed fifty-five kilometres an hour, one of the fastest the race has timed. In recent editions the prologue has fallen out of fashion, replaced by a punchy road stage or a longer time trial, but the instinct behind it has only hardened — the start should decide something, should reward someone, should never be a mere rolling out of town. The opening day is now expected to draw blood.

## The opening day's great dramas

For all the ceremony, the start of the Tour is dangerous, and some of the race's wildest moments have come before it has properly settled. When London hosted the Grand Départ in 2007, enormous crowds filled the prologue route through the capital and Fabian Cancellara flew round to take the first yellow jersey in front of them — a perfect marriage of host city and opening-day specialist. Other starts have been decided by misfortune rather than form. In 2021 the first road stage in Brittany was wrecked when a spectator leaned into the road holding a cardboard sign, taking down a huge section of the bunch in one of the worst mass crashes the race has seen; the rider who began the day with ambitions ended it counting his bruises. It was a brutal reminder that the modern Grand Départ plays out in front of crowds so vast and so close that the danger is now part of the spectacle. A contender can lose his Tour on day one, in a pile-up he did nothing to cause, before the mountains have offered him a single chance to win it back. The opening day rewards the sharp and punishes the unlucky in equal measure — which is exactly why the riders approach it with the wariness they once reserved for the high passes, and why a strong, secure start has become a prize worth real money to defend.

## Why Barcelona, and why a team time trial

Which brings us to 2026. The race begins in Barcelona — Spanish soil, Catalan streets, the most southerly point from which the Tour has ever set out. The opening three days stay in Spain entirely, around Barcelona and Tarragona and up toward the Pyrenees, before the race crosses into France. The Tour has started in Spain before, but never this far down, and the symbolism of the world's greatest French race opening under the Mediterranean sun in Catalonia, on the slopes of Montjuïc, is not lost on anyone.

The opening discipline is the more striking decision. Stage 1 is a team time trial around Barcelona — the first time since 1971 that a team time trial has opened the Tour. It is a deliberate throw of the gauntlet. A team time trial is the purest test of organisation and pacing the sport has: eight riders holding a single effort, rotating cleanly, nobody over-cooking a corner, the clock punishing any squad that cannot ride as one machine. Seconds lost on that first morning will shadow the general-classification riders for three weeks, and a leader with a strong team can take the yellow jersey before he has truly raced anyone. It means the 2026 Tour will have a story before it has even left its host city — which is exactly what the Grand Départ has evolved to deliver.

## From the start line to your own

There is a rider's lesson buried in the team time trial that opens it all, and it is the same one your weekend chaingang teaches every Sunday. A group holding a smooth, even effort, with disciplined turns and no heroics, will always beat a stronger group that surges and swings raggedly off the front. The 2026 Tour begins with eight professionals proving that point at fifty kilometres an hour around Barcelona. The principle scales all the way down to a local paceline: hold the effort steady, take clean and equal turns, let the back of the line recover before it rotates through — and the average speed, in Catalonia or on your own roads, takes care of itself.`,
    related: [
      { label: "Stage 1 — the Barcelona team time trial", href: "/tour-de-france/stage/1" },
      { label: "The full 2026 race hub", href: "/tour-de-france" },
      { label: "Race Predictor — model your time trial", href: "/predict" },
      { label: "Against the Clock", href: "/against-the-clock" },
    ],
  },
];

export function getHistoryArticle(slug: string): TourHistoryArticle | undefined {
  return TOUR_HISTORY.find((a) => a.slug === slug);
}

export function getAllHistorySlugs(): string[] {
  return TOUR_HISTORY.map((a) => a.slug);
}
