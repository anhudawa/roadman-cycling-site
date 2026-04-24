#!/usr/bin/env node
/**
 * scripts/extend-short-descs.mjs
 *
 * One-shot rewrite of seoDescription frontmatter for blog posts whose
 * descriptions were under 70 chars (leaving SERP real estate unused).
 *
 * Each new description targets 140-160 chars, leads with the primary
 * keyword, and adds the unique angle of the article. Voice matched to
 * Anthony's plain, direct register — no "complete guide" filler, no
 * "everything you need to know" boilerplate.
 *
 * Run once and delete.
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const REWRITES = {
  "cycling-hrv-training-guide.mdx":
    "How cyclists should actually use HRV — what the morning number means, when to back off, when to ignore it, and the trends that matter more than any single reading.",
  "cycling-time-trial-tips.mdx":
    "How to ride a faster time trial — pacing without blowing up, the position you can actually hold, and the race-week details that find seconds for free.",
  "triathlon-cycling-power-to-weight.mdx":
    "Power-to-weight for triathletes — why it matters less than cyclists assume, what actually wins races at 70.3 and Ironman, and the numbers worth chasing in training.",
  "mtb-nutrition-trail-fuelling.mdx":
    "Practical MTB nutrition — what to carry, when to eat, and how to fuel rough singletrack without the sugar-bonk cycle that wrecks most trail riders by hour three.",
  "comeback-cyclist-12-week-return-plan.mdx":
    "Returning to cycling after a layoff? A 12-week comeback plan that rebuilds aerobic base before chasing watts — built for riders who've been here before.",
  "is-a-cycling-coach-worth-it-case-study.mdx":
    "Is a cycling coach worth the money? A real Cat-3-to-Cat-1 case study — what changed week to week, the watts gained, and the mistakes the rider stopped making.",
  "mtb-heart-rate-zones-guide.mdx":
    "Road HR zones don't transfer to mountain biking — terrain spikes the cost. How to set MTB heart-rate zones that actually reflect what the trails demand.",
  "cycling-sleep-performance-guide.mdx":
    "How sleep affects cycling performance — the watts lost to sleep debt, what the research shows, and the habits that genuinely move the needle for amateur riders.",
  "cycling-chain-lube-guide.mdx":
    "Chain lube for cyclists — wax vs wet vs dry, what the drivetrain efficiency studies show in measurable watts, and the lube your conditions actually call for.",
  "best-gravel-trails-ireland.mdx":
    "The best gravel riding in Ireland — 12 routes ranked by surface quality, scenery, and what's genuinely worth the drive for a weekend off the road bike.",
  "cycling-heat-training-guide.mdx":
    "Heat training for cyclists — how to acclimatise without crushing yourself, the protocols that actually work, and how the gains transfer to race day.",
  "yoga-for-cyclists-guide.mdx":
    "Yoga for cyclists — does it actually help performance, or is it a stretching tax? An honest assessment of what works for the bike and what doesn't.",
  "cycling-active-recovery-rides-guide.mdx":
    "Active recovery rides for cyclists — how easy is easy enough, the power and HR caps that work, and why most riders ride their recovery days far too hard.",
  "best-cycling-coach-ireland.mdx":
    "How to choose a cycling coach in Ireland — the questions that matter, the red flags to avoid, and why location is rarely the deciding factor in 2026.",
  "best-cycling-coach-usa.mdx":
    "How to choose a cycling coach in the USA — the questions to ask, the red flags to spot, and why time-zone overlap matters more than your coach's home state.",
  "etape-du-tour-training-plan.mdx":
    "How to train for the Etape du Tour — a 16-week plan covering climbing, fuelling, and pacing for one of the toughest sportives on the calendar.",
  "best-cycling-coach-uk.mdx":
    "How to choose a cycling coach in the UK — what actually matters when picking one, what doesn't, and why distance to your coach is rarely the right filter.",
  "cycling-hill-repeats-training.mdx":
    "Hill repeats for cyclists — the session that builds threshold power and race-day grit. How to structure them, how often to run them, and how to recover.",
  "cycling-breathing-techniques.mdx":
    "Breathing techniques for cycling — how to breathe under threshold load, the patterns pros use, and the inspiratory work that's added watts in published studies.",
  "cycling-altitude-training.mdx":
    "Altitude training for cyclists — does Live High Train Low actually work for amateurs, what the protocols look like, and where the marginal gains really sit.",
  "best-online-cycling-coach-how-to-choose.mdx":
    "How to choose the best online cycling coach — the questions that matter, the red flags to avoid, and what a good coach-athlete relationship actually looks like.",
  "cycling-coaching-for-beginners-when-ready.mdx":
    "Thinking about a cycling coach as a beginner? Most riders should wait. The signals you're actually ready — and what to do in the meantime to keep improving.",
  "wahoo-vs-garmin-cycling-computers.mdx":
    "Wahoo vs Garmin cycling computers in 2026 — which one actually fits your riding. Battery, mapping, ecosystem, and the workflow differences that matter day to day.",
  "best-cycling-coach-masters-riders.mdx":
    "How to choose a cycling coach if you're over 40 — what masters-specific coaching should cover, the recovery realities, and the questions worth asking up front.",
  "mtb-vs-road-cycling-fitness.mdx":
    "MTB vs road cycling for fitness — an honest comparison of what each actually builds, the carryover both ways, and which one fits the goal you're chasing.",
  "cycling-core-workout-routine.mdx":
    "A 15-minute core workout built specifically for cyclists — the movements that transfer to power on the bike, with no fluff and no gym membership required.",
  "is-a-cycling-coach-worth-it.mdx":
    "When is a cycling coach worth the money — and when isn't it? An honest cost-benefit analysis based on the realities of how coached athletes actually improve.",
  "mtb-tubeless-conversion-guide.mdx":
    "How to convert your mountain bike to tubeless — a step-by-step guide covering tyres, sealant, rim tape, and the small details that decide if it actually holds.",
  "pogacar-training-secrets.mdx":
    "How Tadej Pogacar became the greatest rider of his era — the training story behind the numbers, the team around him, and what amateurs can actually use from it.",
  "stephen-seiler-research-polarised-training-lessons.mdx":
    "Eight weeks reading every Stephen Seiler paper I could find — the polarised-training lessons that actually matter for amateur cyclists training in 2026.",
  "what-does-a-cycling-coach-do.mdx":
    "What does a cycling coach actually do beyond writing workouts? A week inside NDY coaching — file reviews, decisions, conversations, and the parts you don't see.",
  "best-cycling-coach-guide.mdx":
    "How to choose the best cycling coach for your goals — the questions that matter, the marketing language to ignore, and how to filter the market in 2026.",
  "triathlon-cycling-training-plan.mdx":
    "A triathlon cycling training plan built by cycling specialists — how to develop a stronger bike leg without compromising your run or burning out mid-block.",
  "cycling-gym-exercises-best.mdx":
    "The 8 gym exercises that actually transfer to cycling — what the research supports, what to leave out, and how to fit it around your bike training.",
  "ironman-bike-training-plan-16-weeks.mdx":
    "A 16-week Ironman bike training plan built for age-group athletes — pacing, fuelling, and bike-fit decisions that protect the run still ahead of you.",
  "triathlon-off-season-cycling.mdx":
    "How to use the triathlon off-season to build real cycling fitness — the structured block that adds watts to the bike leg without wrecking your run base.",
};

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content/blog");

let updated = 0;
let skipped = 0;
const lengthIssues = [];

for (const [filename, newDesc] of Object.entries(REWRITES)) {
  if (newDesc.length < 70 || newDesc.length > 165) {
    lengthIssues.push(`  ${filename}: ${newDesc.length} chars (out of range)`);
    continue;
  }
  const fp = path.join(DIR, filename);
  if (!fs.existsSync(fp)) {
    console.log(`! missing: ${filename}`);
    skipped++;
    continue;
  }
  const raw = fs.readFileSync(fp, "utf-8");
  const parsed = matter(raw);
  const old = (parsed.data.seoDescription ?? "").replace(/\s+/g, " ").trim();
  if (!old) {
    console.log(`! no existing seoDescription: ${filename}`);
    skipped++;
    continue;
  }
  if (old === newDesc) {
    skipped++;
    continue;
  }
  parsed.data.seoDescription = newDesc;
  const next = matter.stringify(parsed.content, parsed.data, {
    lineWidth: 80,
  });
  fs.writeFileSync(fp, next);
  updated++;
}

console.log(`\nUpdated: ${updated}`);
console.log(`Skipped: ${skipped}`);
if (lengthIssues.length) {
  console.log(`\nLength issues:\n${lengthIssues.join("\n")}`);
  process.exit(1);
}
