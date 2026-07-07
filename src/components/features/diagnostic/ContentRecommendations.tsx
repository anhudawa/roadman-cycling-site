import Link from "next/link";
import { Container, Section } from "@/components/layout";
import { ScrollReveal } from "@/components/ui";
import { getContentRecommendation, type QuizOutcomeId } from "@/lib/quiz-content-map";

/**
 * Renders the "keep reading" links for a rider's diagnostic outcome —
 * see `src/lib/quiz-content-map.ts` for the outcome → link mapping.
 * Sits between "THE FIX" and the testimonial/product pitch on the
 * results page: the rider just got their three steps, this gives them
 * somewhere to go deeper before the sales content starts.
 */
export function ContentRecommendations({
  outcome,
  background = "deep-purple",
}: {
  outcome: QuizOutcomeId;
  /** Section background — pass whichever alternates correctly with the
   *  sections immediately before/after in the parent page. */
  background?: "charcoal" | "deep-purple";
}) {
  const rec = getContentRecommendation(outcome);
  if (rec.links.length === 0) return null;

  return (
    <Section background={background} grain={background === "deep-purple"}>
      <Container width="narrow">
        <ScrollReveal direction="up">
          <h2 className="font-heading text-off-white text-xl md:text-2xl mb-5">
            {rec.heading}
          </h2>
          <ul className="space-y-3">
            {rec.links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-2 text-coral hover:text-coral/80 text-sm md:text-base transition-colors"
                >
                  {link.label} <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
