import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Call booked — Plateau Diagnostic | Roadman Cycling",
  robots: { index: false, follow: false },
};

/**
 * /plateau/booked — Cal.com redirect-on-success page.
 *
 * After a rider books their 15-minute Plateau Diagnostic call via Cal,
 * they land here. The page confirms the booking, sets expectations for
 * the call, and routes them back into the site (podcast, community, blog).
 */
export default function PlateauBookedPage() {
  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" className="pt-32 md:pt-40 pb-20">
          <Container className="max-w-2xl text-center">
            {/* Confirmation */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/15 mb-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-coral"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 className="font-heading text-off-white text-4xl md:text-5xl tracking-tight mb-4">
              YOU&apos;RE BOOKED.
            </h1>

            <p className="text-foreground-muted text-base md:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
              Check your inbox for the calendar invite. Anthony will call you at
              the time you selected — fifteen minutes, no fluff, no hard sell.
              Just your diagnostic results and what to do about them this week.
            </p>

            <div className="border-t border-white/10 pt-10">
              <h2 className="font-heading text-off-white text-lg tracking-wide mb-6">
                WHILE YOU WAIT
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  href="/podcast"
                  variant="ghost"
                  className="w-full"
                >
                  Latest Episode
                </Button>
                <Button
                  href="/community/clubhouse"
                  variant="ghost"
                  className="w-full"
                >
                  Join the Clubhouse
                </Button>
                <Button
                  href="/blog"
                  variant="ghost"
                  className="w-full"
                >
                  Read the Blog
                </Button>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
