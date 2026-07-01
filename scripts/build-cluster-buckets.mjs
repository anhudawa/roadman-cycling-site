// Buckets the verified citation pack into per-answer-cluster shortlists so
// each authoring agent cites only real, relevant slugs. Reads
// /tmp/citation-pack.json; writes /tmp/clusters/<id>.json + /tmp/namespaces.json
import fs from "node:fs";

const pack = JSON.parse(fs.readFileSync("/tmp/citation-pack.json", "utf8"));

const NAMESPACES = {
  topicHubs: [
    "ftp-training",
    "cycling-nutrition",
    "cycling-training-plans",
    "cycling-recovery",
    "cycling-strength-conditioning",
    "cycling-weight-loss",
    "cycling-beginners",
    "triathlon-cycling",
    "mountain-biking",
    "cycling-coaching",
  ],
  tools: [
    "ftp-zones",
    "race-weight",
    "tyre-pressure",
    "fuelling",
    "energy-availability",
    "wkg",
    "hr-zones",
    "shock-pressure",
  ],
  compare: [
    "coach-vs-app","polarised-vs-pyramidal","strength-vs-more-miles","indoor-vs-outdoor-training",
    "heart-rate-vs-power","trainerroad-vs-trainingpeaks","online-coach-vs-local-club","ftp-ramp-test-vs-20-minute",
    "sweet-spot-vs-threshold","zwift-plan-vs-coach","road-vs-gravel-fitness","self-coached-vs-coached",
    "weight-loss-vs-ftp-gain","training-plan-vs-coach","garmin-vs-wahoo","rouvy-vs-zwift-platform",
    "power-meter-vs-smart-trainer","trainingpeaks-vs-vekta","base-vs-build-training","short-vs-long-intervals",
    "cycling-vs-triathlon-coach","fueled-vs-fasted-sessions","volume-vs-intensity","morning-vs-evening-training",
    "group-rides-vs-solo-training","carbs-vs-fat-adaptation","single-sided-vs-dual-sided-power","road-bike-vs-gravel-bike",
    "carbon-vs-aluminium-frame","clipless-vs-flat-pedals","8-week-vs-16-week-plan","coaching-monthly-vs-annual",
    "turbo-trainer-vs-rollers","strava-vs-trainingpeaks","cycling-coach-vs-trainerroad","cycling-coach-vs-ai-training",
    "cycling-coach-vs-fascat","join-cycling-vs-coaching","group-coaching-vs-one-to-one","sweet-spot-vs-zone-2",
    "ftp-vs-heart-rate","polarised-vs-sweet-spot-masters",
  ],
  existingAnswerSlugs: [
    "how-to-improve-ftp","how-much-zone-2","carbs-per-hour-cycling","should-cyclists-lift-weights",
    "how-to-stop-plateauing","polarised-vs-sweet-spot","cycling-training-over-40","ftp-test-guide",
    "what-to-eat-before-cycling","how-many-hours-training",
  ],
};
fs.writeFileSync("/tmp/namespaces.json", JSON.stringify(NAMESPACES, null, 1));

// cluster keyword matchers (broad — for harvesting candidate citations only)
const CLUSTERS = {
  ftp: /\bftp\b|threshold|20.?min|ramp test|functional threshold|watts|power\b/i,
  zone2: /zone ?2|z2|aerobic|low.?intensity|easy ride|fat.?max|base mile|heart rate|low heart/i,
  nutrition: /nutrition|fuel|carb|gel|eat|diet|weight|lean|protein|hydrat|gut|fast(ed|ing)|food|drink|creatine/i,
  strength: /strength|gym|lift|s&c|squat|deadlift|core|exercise|muscle|fast.?twitch|resistance/i,
  recovery: /recov|sleep|rest|overtrain|fatigue|deload|adaptation|hrv|illness|sick|stress/i,
  masters: /after 40|over 40|over 50|masters|veteran|age|older|fast after|longevity|decline/i,
  racing: /race|event|sportive|gran fondo|gravel race|criterium|crit|unbound|badlands|taper|peak|tactics|pacing/i,
  periodisation: /periodis|base.?build|season|plan|macro|meso|block|winter|off.?season|reverse|polaris|80.?20/i,
  power: /power|vo2|watt|sprint|climb|aero|cadence|interval|pacing|plateau|durability/i,
  mental: /mental|mindset|psycholog|motivation|confidence|pressure|focus|fear|nerve|suffer|toughness|negotiat/i,
  bikefit: /bike fit|fitting|saddle|cleat|position|knee|back pain|neck|hand|numb|crank|shoe|posture/i,
  heat: /heat|altitude|sauna|hot|temperature|acclimat|hydration|cramp|infrared|remco/i,
};

// guest pillar hints for suggested-experts per cluster
const guestsBy = (pred) =>
  pack.guests.filter(pred).map((g) => ({ slug: g.slug, name: g.name, credential: g.credential, episodes: g.episodes.map((e) => e.slug) }));

fs.mkdirSync("/tmp/clusters", { recursive: true });

const summary = {};
for (const [id, re] of Object.entries(CLUSTERS)) {
  const episodes = pack.episodes
    .filter((e) => re.test(`${e.title} ${(e.keywords || []).join(" ")}`))
    .map((e) => ({ slug: e.slug, title: e.title, guest: e.guest, pillar: e.pillar }));
  const blog = pack.blog
    .filter((b) => re.test(`${b.title} ${b.slug} ${(b.keywords || []).join(" ")}`))
    .map((b) => ({ slug: b.slug, title: b.title }));
  fs.writeFileSync(
    `/tmp/clusters/${id}.json`,
    JSON.stringify({ cluster: id, episodes, blog }, null, 1)
  );
  summary[id] = { episodes: episodes.length, blog: blog.length };
}

// full guest list (all 97) — every cluster may cite any verified guest
fs.writeFileSync(
  "/tmp/guests-verified.json",
  JSON.stringify(
    pack.guests.map((g) => ({ slug: g.slug, name: g.name, credential: g.credential, episodes: g.episodes.map((e) => e.slug) })),
    null,
    1
  )
);

console.log("namespaces + per-cluster buckets written to /tmp");
console.log(JSON.stringify(summary, null, 1));
console.log("guests-verified:", pack.guests.length);
