// Persona classification shared by the Skool webhook and the Ted welcome
// generator. Lives outside the route file so it's unit-testable in isolation.

export type Persona = "plateau" | "comeback" | "event-prep" | "listener";

export const PERSONA_KEYWORDS: Record<Persona, string[]> = {
  plateau: [
    "plateau", "stuck", "not improving", "stagnant", "same level",
    "can't improve", "hit a wall", "no progress", "flatlined", "stalled",
    "not getting faster", "lost motivation", "going nowhere",
  ],
  comeback: [
    "comeback", "coming back", "returning", "injury", "time off",
    "getting back", "break from cycling", "haven't ridden", "used to ride",
    "restart", "back into", "off the bike", "rehab", "recovery from",
  ],
  "event-prep": [
    "event", "race", "sportive", "gran fondo", "training plan",
    "preparing for", "first race", "goal event", "target event",
    "etape", "ironman", "triathlon", "century", "audax", "ultra",
    "competition", "time trial",
  ],
  // listener is the default $— no keywords needed
  listener: [],
};

export function classifyPersona(answers: string[]): Persona {
  const combined = answers.join(" ").toLowerCase();

  let best: Persona = "listener";
  let bestScore = 0;

  for (const [persona, keywords] of Object.entries(PERSONA_KEYWORDS)) {
    if (persona === "listener") continue;
    let score = 0;
    for (const keyword of keywords) {
      if (combined.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = persona as Persona;
    }
  }

  return best;
}
