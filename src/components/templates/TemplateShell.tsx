import { type ReactNode } from "react";
import { Section, Container } from "@/components/layout";
import { Badge, ScrollReveal } from "@/components/ui";
import { type ContentPillar } from "@/types";

interface TemplateShellProps {
  /** The H1 displayed in the hero */
  title: string;
  /** Optional eyebrow line above the H1, e.g. "QUESTION" / "COMPARISON" */
  eyebrow?: string;
  /** Pillar — drives the badge colour. Optional, omit to skip the badge. */
  pillar?: ContentPillar;
  /** Optional tagline / subtitle under the H1 */
  subtitle?: string;
  /** Hero contents rendered below the title (e.g. AnswerCapsule). */
  heroExtras?: ReactNode;
  /** The body sections — sections render their own backgrounds. */
  children: ReactNode;
  className?: string;
}

/**
 * Common hero + body shell for the 5 page templates. Centralises the
 * hero treatment (deep-purple grain, eyebrow, badge, H1, subtitle,
 * optional extras) so each template only has to focus on its body
 * sections.
 *
 * Body sections should still come from the templates themselves so
 * they can use Section/Container with their own backgrounds. The shell
 * just renders the hero and a slot.
 */
export function TemplateShell({
  title,
  eyebrow,
  pillar,
  subtitle,
  heroExtras,
  children,
  className = "",
}: TemplateShellProps) {
  return (
    <main id="main-content" className={className}>
      <Section background="deep-purple" grain className="pt-32 pb-14">
        <Container width="narrow">
          <ScrollReveal direction="up" eager>
            {(eyebrow || pillar) && (
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {pillar && <Badge pillar={pillar} size="md" />}
                {eyebrow && (
                  <span className="font-heading text-coral text-xs tracking-[0.3em] uppercase">
                    {eyebrow}
                  </span>
                )}
              </div>
            )}
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-hero)" }}
            >
              {title.toUpperCase()}
            </h1>
            {subtitle && (
              <p className="text-foreground-muted text-lg leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
            {heroExtras && <div className="mt-6">{heroExtras}</div>}
          </ScrollReveal>
        </Container>
      </Section>

      {children}
    </main>
  );
}
