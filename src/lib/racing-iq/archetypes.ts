import type { ArchetypeDef } from "./types";

/**
 * The six rider archetypes. Names and roast copy are working drafts —
 * Anthony approves final wording (open question #1 in the brief).
 */
export const ARCHETYPES: Record<string, ArchetypeDef> = {
  diesel: {
    id: "diesel",
    name: "The Diesel",
    roast: "You have one pace. Luckily for you, it's a good one.",
    strength:
      "An engine that doesn't care how long the race is, and the patience to let other people lose it first.",
    weakness:
      "When the elastic snaps at race speed, you're still doing your number — perfectly paced, slowly distanced.",
  },
  puncheur: {
    id: "puncheur",
    name: "The Puncheur Who Thinks He's a Sprinter",
    roast: "You've won the 30-second power graph and lost the race. Repeatedly.",
    strength:
      "Real snap — when the road kicks up and the move goes, you can actually answer.",
    weakness:
      "You keep saving it all for a bunch sprint you have no business contesting, instead of the late move you'd actually win from.",
  },
  wheelsucker: {
    id: "wheelsucker",
    name: "The Wheelsucker",
    roast: "Aerodynamically, the smartest rider in the race. Socially, on thin ice.",
    strength:
      "You arrive at the finale fresher than anyone — energy management by way of other people's energy.",
    weakness:
      "A race run entirely in the wheels has no Plan A. When it's your turn to make the move, the legs are there and the habit isn't.",
  },
  kamikaze: {
    id: "kamikaze",
    name: "The Kamikaze",
    roast: "Magnificent. Doomed. The commissaires know you by your first name.",
    strength:
      "Total commitment — you make races happen while everyone else is negotiating.",
    weakness:
      "Five matches, all struck by kilometre 60, usually as a bundle. The brave move and the right move are sometimes the same thing. Sometimes.",
  },
  calculator: {
    id: "calculator",
    name: "The Calculator",
    roast: "You've never wasted a watt. You've also never made anyone panic.",
    strength:
      "Ruthless efficiency — every match spent where it bought something, every trap on the route sheet spotted a kilometre early.",
    weakness:
      "Racing's margins live just past the edge of the spreadsheet. The day the maths says 'almost' and you don't go anyway, the race goes without you.",
  },
  captain: {
    id: "captain",
    name: "The Road Captain",
    roast: "You read the race perfectly. For everyone else's benefit, mostly.",
    strength:
      "You see the race two moves ahead — splits forming, freeloaders skipping turns, the finale taking shape at kilometre 80.",
    weakness:
      "All that race-craft in service of the group. At some point the right call is the selfish one, and you keep not making it.",
  },
};
