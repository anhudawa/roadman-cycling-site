import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Game terms",
  description: "Roadman Fantasy Tour — game rules, prize terms, and data handling.",
};

/**
 * T&Cs page required by Section 9. Prize specifics are placeholders
 * pending Anthony's sign-off (Section 4.6) — the structure and the
 * compliance-critical statements (free entry, skill-based, no cash
 * prizes, 16+, GDPR) are final.
 */
export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-heading text-5xl tracking-wide">GAME TERMS</h1>
      <div className="prose-sm mt-8 space-y-6 leading-relaxed text-off-white/80">
        <section>
          <h2 className="font-heading text-2xl tracking-wide text-off-white">Free to play</h2>
          <p className="mt-2">
            Roadman Fantasy Tour is free to enter. There is no entry fee, no in-game purchase, and
            no cash prize. Results depend on skill and judgement in selecting riders against
            published sporting results. No purchase is necessary at any point.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl tracking-wide text-off-white">Who can play</h2>
          <p className="mt-2">
            You must be 16 or older (the age of digital consent in Ireland). One team per person.
            The game is operated by Roadman Cycling, Ireland.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl tracking-wide text-off-white">Scoring and results</h2>
          <p className="mt-2">
            Points are awarded from official race results only. Where the race jury corrects a
            result (relegation, disqualification, reinstatement), scores are recomputed and
            standings update — including retrospectively. The published scoring tables in the game
            are the rules of record; ties break on highest single-stage score, then earliest team
            creation.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl tracking-wide text-off-white">Prizes</h2>
          <p className="mt-2">
            <strong className="text-off-white">Grand prize (1st in the global league):</strong> one
            place at a Roadman Cycling training camp in Girona, Spain — accommodation, coaching,
            and the camp programme included. Flights and airport transfers are{" "}
            <strong className="text-off-white">not</strong> included: the winner makes their own
            way to Girona. The place is for a scheduled camp date agreed with Roadman, is personal
            to the winner, can&apos;t be transferred or exchanged, and has no cash alternative.
            Camp participation is subject to the camp&apos;s own booking conditions, including
            being fit to ride.
          </p>
          <p className="mt-2">
            Any further prizes (weekly podiums and others) are announced before Stage 1 and listed
            on this page. Winners are contacted at the email on their account within 7 days of the
            final standings publishing; if a winner doesn&apos;t respond within 14 days, the prize
            rolls to the next eligible player.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl tracking-wide text-off-white">Your data</h2>
          <p className="mt-2">
            We collect your email, first name, country, and team picks to run the game, and — with
            your explicit consent at signup — send you the daily stage email and Roadman updates.
            Unsubscribing stops the emails without deleting your team. You can request deletion of
            your account at any time; your personal details are erased and your team is anonymised
            so league standings stay intact. Full details in the{" "}
            <Link href="/privacy" className="text-jersey-yellow underline">
              privacy policy
            </Link>
            .
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl tracking-wide text-off-white">Not affiliated</h2>
          <p className="mt-2">
            Roadman Fantasy Tour is an independent game by Roadman Cycling. It is not affiliated
            with, endorsed by, or connected to Amaury Sport Organisation or the Tour de France.
            Rider names and results are used as facts of public sporting record.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl tracking-wide text-off-white">Fair play</h2>
          <p className="mt-2">
            Multiple accounts, scripted entries, or anything that spoils it for the rest of the
            peloton gets removed without appeal. Be sound.
          </p>
        </section>
      </div>
    </div>
  );
}
