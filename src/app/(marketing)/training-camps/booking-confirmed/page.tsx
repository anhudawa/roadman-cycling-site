import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";
import { CAMPS } from "@/lib/camps/camps";

export const metadata: Metadata = {
  title: "Booking confirmed — Roadman Training Camps",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ camp?: string; session_id?: string }>;
}

export default async function CampBookingConfirmedPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const campParam = (params.camp ?? "").toLowerCase();
  const isBoth = campParam === "both";
  const isRoad = campParam === "road";
  const isGravel = campParam === "gravel";

  const headline = isBoth
    ? "BOTH CAMPS — LOCKED IN."
    : isRoad
      ? "GIRONA ROAD — LOCKED IN."
      : isGravel
        ? "GIRONA GRAVEL — LOCKED IN."
        : "YOU'RE IN.";

  const dateLine = isBoth
    ? `${CAMPS.road.startDate} → ${CAMPS.gravel.endDate} · Can Sagnari, Girona`
    : isRoad
      ? `${CAMPS.road.startDate} → ${CAMPS.road.endDate} · Can Sagnari, Girona`
      : isGravel
        ? `${CAMPS.gravel.startDate} → ${CAMPS.gravel.endDate} · Can Sagnari, Girona`
        : "Roadman Training Camps · Girona 2026";

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain fullHeight>
          <Container className="text-center pt-24 pb-16 md:pt-20 md:pb-0">
            <p className="text-coral font-heading text-5xl md:text-6xl mb-5 md:mb-6 leading-none">
              &#10003;
            </p>
            <h1
              className="font-heading text-off-white mb-3 md:mb-4 leading-[0.95]"
              style={{ fontSize: "clamp(2.5rem, 11vw, 6rem)" }}
            >
              {headline}
            </h1>
            <p className="text-foreground-subtle text-[11px] md:text-xs tracking-[0.2em] uppercase mb-6 md:mb-8">
              {dateLine}
            </p>
            <p className="text-foreground-muted text-lg md:text-xl max-w-xl mx-auto mb-5 md:mb-6 leading-relaxed">
              Payment received. A confirmation email is on its way with your
              room assignment, kit list, and what to do before you fly out.
            </p>
            <p className="text-foreground-muted text-[15px] md:text-base max-w-xl mx-auto mb-8 md:mb-10 leading-relaxed">
              If anything looks off — flight times, dietary changes, mate
              joining you — just reply to that email. Anthony will see it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center">
              <Button href="/training-camps" size="lg">
                Back to camps overview
              </Button>
              <Button href="/community/clubhouse" variant="ghost" size="lg">
                Join the Clubhouse
              </Button>
            </div>
            <p className="text-foreground-subtle text-xs mt-10 md:mt-12 leading-relaxed">
              Questions in the meantime? Email{" "}
              <Link
                href="mailto:anthony@roadmancycling.com"
                className="text-coral hover:underline break-all sm:break-normal"
              >
                anthony@roadmancycling.com
              </Link>
              .
            </p>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
