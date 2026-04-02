import { Header, Footer, Section, Container } from "@/components/layout";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <Section background="deep-purple" grain fullHeight>
          <Container className="text-center pt-20">
            <p className="font-heading text-[8rem] md:text-[12rem] text-coral leading-none mb-4">
              404
            </p>
            <h1 className="font-heading text-3xl md:text-5xl text-off-white mb-6">
              WRONG TURN
            </h1>
            <p className="text-foreground-muted text-lg max-w-md mx-auto mb-10">
              This page doesn&apos;t exist. Maybe the route changed, or you took
              a detour. Either way, let&apos;s get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/" size="lg">
                Back to Home
              </Button>
              <Button href="/podcast" variant="ghost" size="lg">
                Browse the Archive
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
