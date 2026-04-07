import { Header, Footer, Section, Container } from "@/components/layout";
import { GuestGridSkeleton } from "@/components/ui";

export default function GuestsLoading() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero skeleton */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <div className="skeleton skeleton-heading w-48 mx-auto mb-4" style={{ height: "3rem" }} />
            <div className="skeleton skeleton-text w-80 max-w-full mx-auto" />
          </Container>
        </Section>

        {/* Guest Grid skeleton */}
        <Section background="charcoal">
          <Container>
            <GuestGridSkeleton />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
