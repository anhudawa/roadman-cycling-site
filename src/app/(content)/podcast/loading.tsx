import { Header, Footer, Section, Container } from "@/components/layout";
import { PodcastSearchSkeleton } from "@/components/ui";

export default function PodcastLoading() {
  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero skeleton */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container className="text-center">
            <div className="skeleton skeleton-heading w-64 mx-auto mb-4" />
            <div className="skeleton skeleton-text w-96 max-w-full mx-auto mb-2" />
            <div className="skeleton skeleton-text w-48 mx-auto" />
          </Container>
        </Section>

        {/* Search + Episodes skeleton */}
        <Section background="charcoal">
          <Container>
            <PodcastSearchSkeleton />
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
