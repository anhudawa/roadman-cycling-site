import type { Scenario } from "./types";

/**
 * Racing IQ — Stage 1 scenario pack.
 *
 * One race, seven frozen moments. Copy register is a broadcast
 * director talking to a rider who knows the sport — direct,
 * peer-to-peer, zero arcade language.
 *
 * Content rules (load-bearing):
 *  - Expert quotes are PLACEHOLDERS. Do not invent or paraphrase
 *    quotes from real named experts. Anthony supplies the real ones
 *    from the podcast archive.
 *  - No coach–rider attributions anywhere in this file.
 *  - Tactical claims that need checking are marked [VERIFY — ANTHONY].
 */

const EXPERT_QUOTE_PLACEHOLDER = "[EXPERT QUOTE — ANTHONY TO SUPPLY]";
const EXPERT_NAME_PLACEHOLDER = "[EXPERT NAME — ANTHONY TO CONFIRM]";

export const SCENARIOS: Scenario[] = [
  // ── 1 · THE EARLY BREAK ────────────────────────────────────────
  {
    id: "early-break",
    act: 1,
    km: 5,
    title: "The Early Break",
    kicker: "KM 5 · NEUTRAL'S BARELY OFF",
    environment: "valley",
    timeOfDay: 0.05,
    setup: () =>
      "Five riders clip off the front before the race has settled. You know two of them — strong rouleurs, neither can climb. The gap goes to fifteen seconds and the bunch looks at each other. There's a 4k climb at kilometre 95 that decides this race, and everyone knows it.",
    teaches:
      "Race-reading beats ego. The question is never \"can I go with that?\" — it's \"does that move win on this course?\"",
    options: [
      {
        id: "bridge",
        label: "Bridge across now",
        detail: "Three minutes of pain and you're in the move of the day. Maybe.",
        cost: 1,
        axes: { nous: 3, match: 2, self: 2 },
        traits: { attack: 1 },
        outcome: () => ({
          text: "You jump hard, take two corners on the rivet, and make the junction. Five become six. The move has horsepower — and not one rider in it who can hold wheels on a 4k climb. You've bought a ticket on a train that stops at the bottom of the hill.",
          delta: { burn: 1, position: "break", slot: "mid" },
        }),
      },
      {
        id: "wait",
        label: "Let it dangle",
        detail: "No climbers in the move. The course will bring it back.",
        cost: 0,
        axes: { nous: 9, match: 8, self: 7 },
        traits: { conserve: 1 },
        outcome: () => ({
          text: "You stay in the wheels and watch the gap settle at ninety seconds. Five rouleurs and a 4k climb between them and the line — the maths is on your side. The riders who panicked are already three gels into their day.",
          delta: {},
        }),
      },
      {
        id: "chase",
        label: "Get on the front and chase",
        detail: "Kill it before it grows. Someone has to.",
        cost: 1,
        axes: { nous: 2, match: 1, self: 2 },
        traits: { work: 1 },
        outcome: () => ({
          text: "You ride a kilometre on the front. The gap stays at forty seconds, your heart rate doesn't. Behind you, two teams with sprinters watch you do their work for free. The break was never the danger — the spend was.",
          delta: { burn: 1, slot: "front" },
        }),
      },
    ],
    expert: {
      prompt: `We put this exact situation to ${EXPERT_NAME_PLACEHOLDER} on the podcast.`,
      quote: EXPERT_QUOTE_PLACEHOLDER,
      attribution: EXPERT_NAME_PLACEHOLDER,
    },
  },

  // ── 2 · THE PULL-THROUGH TRAP ──────────────────────────────────
  {
    id: "pull-through",
    act: 2,
    km: 30,
    title: "The Pull-Through Trap",
    kicker: "KM 30 · THE ROTATION",
    environment: "valley",
    timeOfDay: 0.2,
    setup: (s) =>
      s.position === "break"
        ? "Your break is working — five of you are, anyway. One rider has surfed the back for twenty minutes, swinging through soft and short every time. The gap behind is holding at ninety seconds, but only because everyone else is honest."
        : "A split formed over the rollers and you're in a group of eight rolling turns. Seven of you are working. One rider hasn't hit the wind in twenty minutes — soft pulls, early swings, always third wheel when it matters.",
    teaches:
      "Cooperation is economics, not etiquette. A group that rotates honestly is faster than the sum of its riders — police it cheaply or pay for it later.",
    options: [
      {
        id: "confront",
        label: "Call it, out loud",
        detail: "\"Through or off.\" Cheap words, said once.",
        cost: 0,
        axes: { nous: 8, match: 8, self: 6 },
        traits: { work: 1, discipline: 1 },
        outcome: () => ({
          text: "You say it once, flat, no theatre. He shrugs — but two others nod, the rotation tightens, and suddenly the soft pulls are visible to everyone. He starts working at half-effort, which is infinitely more than zero. The group goes faster and it cost you a sentence.",
          delta: { groupTrust: 1 },
        }),
      },
      {
        id: "accept",
        label: "Say nothing, keep riding",
        detail: "Not your problem. Do your turns, race your race.",
        cost: 0,
        axes: { nous: 4, match: 6, self: 6 },
        traits: { conserve: 1 },
        outcome: () => ({
          text: "You keep the rotation smooth and let it go. The group works, the gap holds — and the freeloader arrives at the finale fresher than everyone who pulled him there. You've paid his entry fee. He'll thank you at 200 metres to go.",
          delta: {},
        }),
      },
      {
        id: "attack-group",
        label: "Attack to shed him",
        detail: "Two minutes full gas. Burn the parasite off the wheel.",
        cost: 2,
        axes: { nous: 2, match: 1, self: 2 },
        traits: { attack: 1 },
        outcome: () => ({
          text: "You go over the top of the rotation and string it out for two minutes. When you look back you've dropped him — along with three of the riders who were actually working. The group reforms smaller, slower, and notably less interested in pulling for you.",
          delta: { burn: 2, groupTrust: -1 },
        }),
      },
    ],
    expert: {
      prompt: `We put this exact situation to ${EXPERT_NAME_PLACEHOLDER} on the podcast.`,
      quote: EXPERT_QUOTE_PLACEHOLDER,
      attribution: EXPERT_NAME_PLACEHOLDER,
    },
  },

  // ── 3 · THE CROSSWIND SPLIT ────────────────────────────────────
  {
    id: "crosswind",
    act: 3,
    km: 55,
    title: "The Crosswind Split",
    kicker: "KM 55 · WIND FROM THE LEFT",
    environment: "plain",
    timeOfDay: 0.35,
    setup: (s) =>
      s.position === "break"
        ? "The road turns onto the exposed plain and the wind arrives from the left like a verdict. Your break goes single file in the gutter. Behind, the bunch is tearing itself into echelons — the race is being decided back there and up here, all at once."
        : "The road swings onto the open plain and the wind comes hard off the left. At the front they smell it — the pace lifts and the first echelon starts forming. You're twelfth wheel. The echelon fits eight.",
    teaches:
      "Position is bought cheap before the corner and ruinously after it. Moving up costs one match. Chasing back costs three.",
    options: [
      {
        id: "fight-position",
        label: "Move up — now, before the turn",
        detail: "Spend one hard effort to make the front echelon while it's still forming.",
        cost: 1,
        axes: { nous: 9, match: 8, self: 7 },
        traits: { discipline: 1 },
        outcome: (s) => ({
          text:
            s.position === "break"
              ? "You slot second wheel before the worst of it, take your gutter pulls short and honest, and the break holds together where the bunch behind shatters. One effort, made early, while it was still cheap."
              : "You sprint up the outside before the road bends and slot in sixth wheel as the echelon snaps shut behind you. Eight riders make it. Thirty don't. One match, spent at the only moment it was for sale.",
          delta: { slot: "front", burn: 1 },
        }),
      },
      {
        id: "wait-regroup",
        label: "Hold your wheel — it'll come back",
        detail: "Crosswind sections end. Surely the bunch regroups.",
        cost: 0,
        axes: { nous: 2, match: 2, self: 3 },
        traits: { conserve: 1 },
        outcome: (s) => ({
          text:
            s.position === "break"
              ? "You sit last wheel in the gutter to save energy — and when the rider in front of you cracks, the elastic snaps. Now you're chasing your own breakaway across an open plain, alone, in a crosswind. It does not come back together. It never does."
              : "The echelon closes and the gap opens with mechanical indifference — ten seconds, twenty, forty. You're in group two with the other optimists, riding through-and-off into a crosswind to claw back what eighth wheel would have cost nothing to keep.",
          delta: { position: "chasing", slot: "back" },
        }),
      },
      {
        id: "gutter-grind",
        label: "Bury yourself to hold the wheel",
        detail: "Stay twelfth, take the gutter, eat the wind. Brute-force it.",
        cost: 2,
        axes: { nous: 5, match: 3, self: 4 },
        traits: { work: 1 },
        outcome: () => ({
          text: "You spend ten minutes at threshold with your front wheel six inches from the verge, rim-deep in the gutter. You make the front group — barely — having paid double what the riders three wheels ahead paid for the same result. Same postcode, very different rent.",
          delta: { burn: 2 },
        }),
      },
    ],
    expert: {
      prompt: `We put this exact situation to ${EXPERT_NAME_PLACEHOLDER} on the podcast.`,
      quote: EXPERT_QUOTE_PLACEHOLDER,
      attribution: EXPERT_NAME_PLACEHOLDER,
    },
  },

  // ── 4 · THE FUEL CALL ──────────────────────────────────────────
  {
    id: "fuel-call",
    act: 4,
    km: 70,
    title: "The Fuel Call",
    kicker: "KM 70 · TWENTY-FIVE MINUTES SINCE THE LAST GEL",
    environment: "plain",
    timeOfDay: 0.5,
    setup: () =>
      "The race settles for the first time all day. Your legs feel — honestly — great. The plan taped to your stem says carbs every twenty-five minutes, and it's been twenty-five minutes. You're sick of sweet. The climb is 25k away.",
    teaches:
      "Fuel for the rider you'll be in an hour, not the one you are now. By the time you feel the deficit, the decision is forty minutes old.",
    options: [
      {
        id: "eat-now",
        label: "Eat. The plan is the plan.",
        detail: "Feelings are not data. Gel down, move on.",
        cost: 0,
        axes: { nous: 6, match: 7, self: 9 },
        traits: { discipline: 1 },
        outcome: () => ({
          text: "You eat the gel you didn't want. Nothing happens — which is the entire point. The carbs you just took will arrive in your legs at kilometre 95, at the exact moment five riders surge off the bottom of the climb.",
          delta: { fuel: true },
        }),
      },
      {
        id: "skip-gel",
        label: "Skip it — legs are great",
        detail: "You'll eat at the bottom of the climb. Probably.",
        cost: 0,
        axes: { nous: 2, match: 2, self: 1 },
        outcome: () => ({
          text: "You leave the gel in your pocket. Your legs keep feeling great, which proves nothing — glycogen doesn't send a warning letter. Somewhere ahead, the bill is being printed.",
          delta: { fuel: false },
        }),
      },
      {
        id: "wait-quiet",
        label: "Wait for a quieter moment",
        detail: "It's twitchy in here. You'll eat when the road opens up.",
        cost: 0,
        axes: { nous: 3, match: 3, self: 2 },
        outcome: () => ({
          text: "You wait for the quiet moment. A roundabout, then a town, then someone's attacking again — the quiet moment never comes, because it's a race. The gel rides on in your pocket, doing its best work for nobody.",
          delta: { fuel: false },
        }),
      },
    ],
    expert: {
      prompt: `We put this exact situation to ${EXPERT_NAME_PLACEHOLDER} on the podcast.`,
      quote: EXPERT_QUOTE_PLACEHOLDER,
      attribution: EXPERT_NAME_PLACEHOLDER,
    },
  },

  // ── 5 · THE DESCENT ────────────────────────────────────────────
  {
    id: "descent",
    act: 5,
    km: 85,
    title: "The Descent",
    kicker: "KM 85 · INTO THE TREES, ROAD STILL WET",
    environment: "forest",
    timeOfDay: 0.62,
    setup: (s) =>
      s.position === "chasing"
        ? "The road tips down into the forest and you can see the group ahead through the switchbacks — maybe thirty seconds. It rained under these trees an hour ago and the surface is greasy in the shade. This descent is your way back. Or your way out."
        : "The road drops into the forest, six switchbacks stacked into the shade. It rained here an hour ago and the braking zones are greasy. Gaps open on descents like this — in both directions.",
    teaches:
      "Descents reward the smooth, not the brave. Exit speed out of ten corners beats heroics into two.",
    options: [
      {
        id: "send-it",
        label: "Brake late, trust the tyres",
        detail: "Take every corner on the edge. Make time the scary way.",
        cost: 1,
        axes: { nous: 3, match: 2, self: 2 },
        traits: { attack: 1 },
        outcome: (s) => ({
          text:
            (s.position === "chasing"
              ? "You close the gap — and twice you very nearly close your season instead, the rear stepping out on painted lines, a wall arriving faster than planned. "
              : "You open a small gap — and twice nearly donate your collarbone to the scenery doing it. ") +
            "Every corner exit is a sprint to repay the over-braking that fear of the last moment bought. Fast, yes. Expensive and unrepeatable.",
          delta: { burn: 1, ...(s.position === "chasing" ? { position: "bunch" as const, slot: "back" as const } : {}) },
        }),
      },
      {
        id: "smooth",
        label: "Slow in, fast out",
        detail: "Brake early and straight, carry speed where it compounds.",
        cost: 0,
        axes: { nous: 9, match: 8, self: 8 },
        traits: { discipline: 1 },
        outcome: (s) => ({
          text:
            (s.position === "chasing"
              ? "You ride the descent like a metronome — braking done before the lean, eyes through the exit, on the power early — and the group comes back to you corner by corner. You latch on at the bottom "
              : "You ride every corner the same boring, repeatable way — braking done early, eyes on the exit, power on first — and come off the mountain at the front of the group ") +
            "with a heart rate twenty beats lower than the heroes. The time was always in the exits.",
          delta: s.position === "chasing" ? { position: "bunch", slot: "mid" } : { slot: "front" },
        }),
      },
      {
        id: "follow-local",
        label: "Follow the local's lines",
        detail: "The rider in the regional kit knows these corners. Borrow his eyes.",
        cost: 0,
        axes: { nous: 7, match: 7, self: 5 },
        traits: { conserve: 1 },
        outcome: (s) => ({
          text:
            "You glue yourself to the rider in the regional champion's kit and copy everything — his braking points, his line through the off-camber left, the corner he inexplicably takes wide that turns out to hide gravel. " +
            (s.position === "chasing"
              ? "He tows you back to the group by the valley floor. "
              : "You arrive at the bottom in position, for free. ") +
            "Borrowed knowledge, full price value.",
          delta: s.position === "chasing" ? { position: "bunch", slot: "mid" } : { slot: "mid" },
        }),
      },
    ],
    expert: {
      prompt: `We put this exact situation to ${EXPERT_NAME_PLACEHOLDER} on the podcast.`,
      quote: EXPERT_QUOTE_PLACEHOLDER,
      attribution: EXPERT_NAME_PLACEHOLDER,
    },
  },

  // ── 6 · THE FINAL CLIMB ────────────────────────────────────────
  {
    id: "final-climb",
    act: 6,
    km: 95,
    title: "The Final Climb",
    kicker: "KM 95 · 4K AT 7% — THE RACE, DECIDED HERE",
    environment: "forest",
    timeOfDay: 0.75,
    onEnter: (s) => {
      if (!s.fuel && !s.bonked) {
        return {
          state: {
            ...s,
            bonked: true,
            matches: Math.max(0, s.matches - 1),
          },
          notice:
            "It arrives quietly, the way it always does — a hollowness behind the knees, numbers that won't come up, sweat going cold. The gel you skipped at kilometre 70 was for this exact moment. The bonk is here, and it brought the bill.",
        };
      }
      return { state: s };
    },
    setup: (s) => {
      const base =
        "The road pitches up into the trees and the surge comes immediately — five riders go off the front like the race ends at the top. It doesn't. There's 8k of valley after the summit.";
      if (s.bonked) {
        return (
          base +
          " You, meanwhile, are negotiating with a body that has stopped taking your calls."
        );
      }
      return base + " Your power meter is asking you a very simple question.";
    },
    teaches:
      "Know your numbers — the surge is a question about their fitness, your threshold is an answer about yours. Masters racing is won by the rider who refuses the flattering invitation.",
    options: [
      {
        id: "follow-surge",
        label: "Follow the surge",
        detail: "Five lengths of pain to hold the wheel. It might ease at the top.",
        cost: 2,
        axes: { nous: 3, match: 2, self: 2 },
        traits: { attack: 1 },
        availability: (s) =>
          s.bonked
            ? {
                available: false,
                reason:
                  "Your body answers before you can — there's nothing behind the pedals. The gel you skipped 25k ago makes this decision for you.",
              }
            : s.matches < 2
              ? {
                  available: false,
                  reason: "You reach for the matches. The box is empty.",
                }
              : { available: true },
        outcome: () => ({
          text: "You hold the wheel for three minutes that cost you two matches and most of your vocabulary. The surge finally eases near the summit — you're there, in the front group, having paid the full tourist price for the seat. Whatever the finale asks, you'll be answering in small change.",
          delta: { burn: 2, position: "bunch", slot: "front" },
        }),
      },
      {
        id: "threshold",
        label: "Ride your number",
        detail: "Let them go. Hold threshold. The climb is 4k — do the maths.",
        cost: 1,
        axes: { nous: 9, match: 9, self: 9 },
        traits: { discipline: 1 },
        outcome: (s) => ({
          text: s.bonked
            ? "You set the highest pace a glycogen-starved body will allow and watch the race ride away in slow motion. Riders come back to you anyway — the surge victims, cracked and weaving. You pass three of them before the summit. On empty, pacing isn't a tactic, it's a survival protocol — and it's the only reason you're still in this race at all."
            : "You let them go and settle one watt under the number you know you can hold. It feels like surrender for ninety seconds. Then the elastic stops stretching — and over the top, riding your own pace through the wreckage of their surge, you come back to the front group as the road flattens. You climbed slower and arrived better.",
          delta: s.bonked
            ? { burn: 1, position: "chasing", slot: "back" }
            : { burn: 1, position: "bunch", slot: "mid" },
        }),
      },
      {
        id: "save-everything",
        label: "Sit up, regroup, save it all",
        detail: "Concede the climb. Bet everything on a regroup in the valley.",
        cost: 0,
        axes: { nous: 4, match: 5, self: 5 },
        traits: { conserve: 1 },
        outcome: (s) => ({
          text: s.bonked
            ? "You climb at the only pace available — dignity-saving, race-losing — in a grupetto of the similarly broken. The valley regroup helps, but the front of the race is gone. You'll finish this race. That's the sentence in full."
            : "You climb steady in the second group, eating and drinking while the front of the race tears itself apart. In the valley the groups merge back to twenty — exactly the regroup you bet on. You've got matches nobody else has. Now you need the legs of a gambler to be right twice.",
          delta: s.bonked
            ? { position: "dropped", slot: "back" }
            : { position: "bunch", slot: "back" },
        }),
      },
    ],
    expert: {
      prompt: `We put this exact situation to ${EXPERT_NAME_PLACEHOLDER} on the podcast.`,
      quote: EXPERT_QUOTE_PLACEHOLDER,
      attribution: EXPERT_NAME_PLACEHOLDER,
    },
  },

  // ── 7 · THE FINALE ─────────────────────────────────────────────
  {
    id: "finale",
    act: 7,
    km: 117,
    title: "The Finale",
    kicker: "3KM TO GO · THE TOWN ARRIVES",
    environment: "town",
    timeOfDay: 0.95,
    setup: (s) => {
      if (s.position === "dropped") {
        return "The barriers and the noise arrive for somebody else's sprint. You roll into the finale with the gruppetto, the race long since decided up the road — but there's a group sprint for 25th and pride is a real currency. Three kilometres. What's left in the box?";
      }
      const trust =
        s.groupTrust > 0
          ? " The riders you worked with all day are still around you — and they're giving you space, which is worth more than it sounds."
          : s.groupTrust < 0
            ? " Nobody in this group owes you anything, and the way they're boxing you in suggests they remember why."
            : "";
      return (
        "Three kilometres. The road narrows into the town and the group compresses like a held breath — touching wheels, shouting, everyone trying to occupy the same ten metres of tarmac. There are three ways to win from here. Only one of them doesn't need luck." +
        trust
      );
    },
    teaches:
      "Sprints are won at 3k, not at 200 metres. By the time the sprint starts, the result is mostly already decided — the question is only who decided it.",
    options: [
      {
        id: "long-attack",
        label: "Go at 2.8k, after the roundabout",
        detail: "The one that doesn't need luck. Just legs, timing, and total commitment.",
        cost: 2,
        axes: { nous: 9, match: 7, self: 7 },
        traits: { attack: 1, discipline: 1 },
        availability: (s) =>
          s.matches < 2
            ? {
                available: false,
                reason:
                  "The move is right there — and the matches to make it are scattered along 100 kilometres of road behind you.",
              }
            : { available: true },
        outcome: (s) => ({
          text:
            s.matches >= 3
              ? "You go through the roundabout third wheel and launch out of the exit while everyone's still reaching for gears. Ten lengths, instantly. Behind you the group does what groups do at 2.8k — hesitates, negotiates, waits for someone else. By the time the chase organises, the gap is a decision they can't unmake. You take the last 200 metres alone, in the noise, with time to sit up."
              : "You launch out of the roundabout and the gap opens — eight lengths, holding. For two kilometres you're winning the race. Then the spent legs send their regrets: the group's organised chase swallows you at 250 to go, and you roll across in the wheels, having lost the race in the most honest way available. The move was right. The budget wasn't.",
          delta: { burn: 2 },
          axesBonus: s.matches >= 3 ? { match: 2 } : {},
        }),
      },
      {
        id: "lead-out-surf",
        label: "Fight for fifth wheel, launch at 600",
        detail: "The long sprint. Beat the chaos by starting before it.",
        cost: 2,
        axes: { nous: 6, match: 5, self: 5 },
        traits: { attack: 1 },
        availability: (s) =>
          s.matches < 2
            ? {
                available: false,
                reason: "Fifth wheel is free. The 600-metre effort costs two matches you don't have.",
              }
            : { available: true },
        outcome: (s) => ({
          text:
            (s.groupTrust > 0
              ? "A rider you worked with all day flicks an elbow and gives you his wheel into the last corner — trust, paying out at the exact moment it matters. "
              : "") +
            "You hit the front at 600 with the long sprint, the one that breaks the fast-twitch guys by making them start early. It's brave and it's half-right: two riders come over the top in the last fifty metres, but you beat the chaos, the crashes, and everyone who waited. The podium photographer learns your name.",
          delta: { burn: 2, slot: "front" },
        }),
      },
      {
        id: "wheels-200",
        label: "Hold wheels, sprint at 200",
        detail: "The classic. Also the lottery — you'll need the gaps to open.",
        cost: 1,
        axes: { nous: 4, match: 4, self: 4 },
        traits: { conserve: 1 },
        // Always available — the lottery is the one door that never
        // shuts, even on an empty box. The outcome just gets honest.
        availability: () => ({ available: true }),
        outcome: (s) =>
          s.matches < 1
            ? {
                text: "You hold wheels because holding wheels is all that's left — the box is empty and everyone within ten metres can tell. When the sprint opens at 200 you stand up out of habit, produce a number that would embarrass a club run, and roll across in the wheels you were lucky to keep. The race was decided hours ago, one small spend at a time.",
                delta: {},
              }
            : {
                text:
                  (s.groupTrust < 0
                    ? "The group remembers your day's diplomacy and shuts every door. "
                    : "") +
                  "You surf wheels into the last corner and wait for the gaps. At 200 to go you've got the legs and nowhere to put them — a wall of riders, a closing door on the left, a brake-check from a hero on the right. You launch late into a half-gap and take what the traffic allows. Somewhere at 3k to go, there was a version of this finale you controlled. This isn't it.",
                delta: { burn: 1 },
              },
      },
    ],
    expert: {
      prompt: `We put this exact situation to ${EXPERT_NAME_PLACEHOLDER} on the podcast.`,
      quote: EXPERT_QUOTE_PLACEHOLDER,
      attribution: EXPERT_NAME_PLACEHOLDER,
    },
  },
];

/** Scenario index (0-based) after which the email gate appears. */
export const GATE_AFTER_INDEX = 2;
