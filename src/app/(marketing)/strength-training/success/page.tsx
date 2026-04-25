import type { Metadata } from "next";
import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function StrengthTrainingSuccess() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain fullHeight>
          <Container className="text-center pt-20">
            <p className="text-coral font-heading text-6xl mb-6">&#10003;</p>
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              YOU&apos;RE IN
            </h1>
            <p className="text-foreground-muted text-xl max-w-lg mx-auto mb-10">
              The Strength Training for Cyclists course is yours. Check your
              email for access details. Time to get stronger on and off the bike.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/community/clubhouse" size="lg">
                Join the Clubhouse $— Free
              </Button>
              <Button href="/blog" variant="ghost" size="lg">
                Read the Blog
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
