import { config } from "dotenv";
import { subscribeToBeehiiv } from "@/lib/integrations/beehiiv";

/**
 * One-shot setup for the Plateau Diagnostic's Beehiiv integration.
 *
 * What it does:
 *   1. Verifies BEEHIIV_API_KEY + BEEHIIV_PUBLICATION_ID are set.
 *   2. Subscribes a seed address with all six plateau tags attached.
 *      Beehiiv auto-creates tags on first use, so this is how we
 *      get them into the publication's tag list without hand-
 *      clicking through the admin UI.
 *   3. Prints the full 5-email nurture sequence from spec §13 so you
 *      can paste it into Beehiiv's automations UI in one pass.
 *
 * What it doesn't do (Beehiiv API limitation):
 *   - Create the automation itself. Beehiiv's public API doesn't
 *     expose automation endpoints — the sequence has to be built in
 *     the admin UI with the printed copy as the source.
 *
 *   Usage:
 *     npm run seed:beehiiv:plateau -- --email=seed@example.com
 *
 *   Add --dry-run to see exactly what would be sent without hitting
 *   Beehiiv.
 */

config({ path: ".env.local" });

const TAGS = [
  "plateau-diagnostic",
  "profile-underRecovered",
  "profile-polarisation",
  "profile-strengthGap",
  "profile-fuelingDeficit",
  "multi-system",
  "retake",
] as const;

function parseArgs(): { email: string | null; dryRun: boolean } {
  let email: string | null = null;
  let dryRun = false;
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") dryRun = true;
    else if (arg.startsWith("--email=")) email = arg.slice("--email=".length);
  }
  return { email, dryRun };
}

function printSequence() {
  // §13 verbatim so Anthony can paste without re-typing. Keeping this
  // in-script rather than in a markdown file means `seed:beehiiv`
  // always prints the canonical copy, even if docs drift.
  console.log(`
─────────────────────────────────────────────────────────────────
BEEHIIV AUTOMATION — build this in the admin UI

  Trigger:      Tag "plateau-diagnostic" applied
  Audience:     All subscribers
  Delay basis:  Tag-applied timestamp

Use the Beehiiv merge tag for the profile — the subscribe call
stores the display label as a custom field called
\`diagnostic_profile\` (e.g. "Under-recovered"). Reference it in
subject/body as: {{ subscriber.custom_fields.diagnostic_profile }}
─────────────────────────────────────────────────────────────────

EMAIL 1 — Day 0 (send within 5 minutes of tag-applied)

Subject: Your diagnosis: {{ subscriber.custom_fields.diagnostic_profile }}

Morning.

Your full diagnosis is on the link below. Takes about three
minutes to read properly.

[Your diagnosis →]({{ subscriber.custom_fields.diagnostic_slug }})

One thing before you click. The profile you got — {{ subscriber.custom_fields.diagnostic_profile }} — is the most common result for riders between 35 and 55 who've been stuck for a year or more. You're not an outlier. The fix is known. The question now is whether you run it alone or with someone looking at your actual training.

That's in the breakdown. Have a read.

Anthony

PS — Save the link. Some riders come back to this a few weeks in, once the denial wears off.

─────────────────────────────────────────────────────────────────

EMAIL 2 — Day 1

Subject: The thing I didn't put in your diagnosis

I wrote your diagnosis yesterday. Here's the bit I left out.

{{ subscriber.custom_fields.diagnostic_profile }} looks like a training problem. It almost never is.

If you're Under-recovered, more training won't fix it. If you're stuck in the grey zone, a new plan won't fix it — because you'll ride the new plan in the grey zone too. If it's a Strength Gap, more hours on the bike will actively make it worse. And if it's a Fueling Deficit, no training intervention in the world can outwork a body that doesn't have enough carbs to build adaptation.

This is what most riders miss.

The fix isn't a plan. The fix is a system — training, recovery, strength, nutrition — managed together, by someone who can see what you can't.

Not Done Yet is that system. Plans via Vekta, weekly live calls, masterclasses, a community of serious cyclists in the same spot you are. Built for exactly the profile you got yesterday.

[See if it's right for you →](https://roadmancycling.com/ndy/fit)

Anthony

─────────────────────────────────────────────────────────────────

EMAIL 3 — Day 3

Subject: "I can figure this out myself"

Most riders who do the diagnostic close the tab and think the same thing.

"I've got the diagnosis. I know what to do. I can run it myself."

Maybe you can. Some do.

Here's what I've learned after 1,300 podcast episodes and five years of coaching. The riders who actually break plateaus aren't the ones with the best information. They're the ones with the shortest feedback loop.

A plan on a screen can't tell you to skip the session because your HRV dropped. A YouTube video can't catch the pattern in your last four weeks before it compounds into another eight weeks of the same plateau. Another cycling forum thread can't call you on a Tuesday and tell you to eat more.

That's what Not Done Yet is. That's what your diagnosis pointed you toward yesterday.

[Have a look →](https://roadmancycling.com/ndy/fit)

Or keep running it alone. Some riders break through that way. Most don't.

Anthony

─────────────────────────────────────────────────────────────────

EMAIL 4 — Day 5

Subject: A specific thing about {{ subscriber.custom_fields.diagnostic_profile }}

Quick one.

If your diagnosis was Under-recovered or Fueling Deficit, I'd rather jump on a 15-minute call with you than sell you a membership.

Those two profiles don't need more content. They need someone looking at your full picture and telling you what to cut, not what to add. I'll do that for free. Fifteen minutes. No pitch at the end — if NDY's right, I'll say so. If it's not, I'll point you somewhere else.

[Book a slot →]({{ NEXT_PUBLIC_CAL_BOOKING_URL }})

If you were Polarisation or Strength Gap, the NDY system handles both cleanly. Have a proper look at the qualifier page.

[roadmancycling.com/ndy/fit](https://roadmancycling.com/ndy/fit)

Either way — don't spend another six months plateaued because you didn't act on the diagnosis.

Anthony

─────────────────────────────────────────────────────────────────

EMAIL 5 — Day 7

Subject: Last one from me on this

One week ago you took the diagnostic because something wasn't working.

If you've already acted — ignore this. Go ride.

If you haven't, a question. What are you planning to do differently in the next four weeks?

Because if the answer is "the same thing," the FTP isn't going to move. Plateaus don't break themselves. I've watched too many serious cyclists lose another year to this.

You've got three options.

One — run the fix yourself. Print the diagnosis, stick to it, don't cheat. A small number of riders make it work.

Two — book a 15-minute call with me. Free. Fifteen minutes. I'll tell you what I'd do if it were my training.

[Book a call →]({{ NEXT_PUBLIC_CAL_BOOKING_URL }})

Three — join NDY. System, plans, community, oversight. Built for exactly the profile you got.

[See if NDY fits →](https://roadmancycling.com/ndy/fit)

Either way — pick one. This week.

Anthony

PS — I won't email you about this again. From here you'll go into the regular Roadman Cycling list, weekly podcast and content. Glad to have you.

─────────────────────────────────────────────────────────────────
`);
}

async function main() {
  const { email, dryRun } = parseArgs();

  if (!process.env.BEEHIIV_API_KEY || !process.env.BEEHIIV_PUBLICATION_ID) {
    throw new Error(
      "BEEHIIV_API_KEY and/or BEEHIIV_PUBLICATION_ID not set. Add them to .env.local."
    );
  }
  if (!email) {
    throw new Error(
      "Pass --email=seed@example.com so we can subscribe it with all 6 plateau tags attached.\n" +
        "Beehiiv auto-creates tags on first use; this call does the create."
    );
  }

  console.log(`Publication: ${process.env.BEEHIIV_PUBLICATION_ID}`);
  console.log(`Seed email:  ${email}`);
  console.log(`Tags:        ${TAGS.join(", ")}`);
  console.log(`Mode:        ${dryRun ? "DRY-RUN (no Beehiiv call)" : "LIVE"}`);

  if (dryRun) {
    console.log("\n[dry-run] would subscribe the seed email with the tags above.");
  } else {
    console.log("\nSubscribing seed address to force-create tags …");
    const result = await subscribeToBeehiiv({
      email,
      tags: [...TAGS],
      sendWelcomeEmail: false,
      customFields: {
        diagnostic_profile: "Seed — safe to delete",
        diagnostic_slug: "seed",
      },
      utm: { source: "seed-script", medium: "cli", campaign: "plateau-setup" },
    });
    if (!result.subscriberId) {
      throw new Error(
        "Beehiiv did not return a subscriber id. Check BEEHIIV_API_KEY and the publication id."
      );
    }
    console.log(`  ✓ subscriber id: ${result.subscriberId}`);
    console.log(
      "  → check Beehiiv → Audience → Tags; all 6 should now appear. You can delete the seed subscriber afterwards."
    );
  }

  printSequence();
  console.log(
    "Done. Now build the automation in Beehiiv (Audience → Automations → New) using the trigger + emails above."
  );
}

main().catch((err) => {
  console.error("\n✗ Seed failed:");
  console.error(err);
  process.exit(1);
});
