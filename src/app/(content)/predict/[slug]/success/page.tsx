import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";
import { getPredictionBySlug } from "@/lib/race-predictor/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ session_id?: string }>;
}

export const metadata = {
  title: "Race Report — payment received | Roadman Cycling",
};

export default async function SuccessPage({ params }: PageProps) {
  const { slug } = await params;
  const prediction = await getPredictionBySlug(slug).catch(() => null);

  return (
    <>
      <Header />
      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm uppercase tracking-wide mb-3">
              Payment received
            </p>
            <h1 className="font-display text-4xl md:text-5xl uppercase tracking-wide text-off-white mb-4">
              Your Race Report is on the way
            </h1>
            <p className="text-off-white/80 text-lg max-w-xl mx-auto">
              We&apos;re generating your full report now — pacing plan, climb-by-climb
              breakdown, fuelling targets, and equipment scenarios. The secure
              link will land in your inbox in under a minute.
            </p>
          </Container>
        </Section>

        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            <div className="bg-white/[0.03] border border-coral/30 rounded-lg p-6 mb-6">
              <h2 className="font-display text-xl text-coral uppercase tracking-wide mb-3">
                What happens next
              </h2>
              <ol className="text-off-white/85 space-y-3 list-decimal list-inside">
                <li>
                  Stripe confirms the payment to our system (instant).
                </li>
                <li>
                  Our generator builds your Race Report from the prediction we
                  ran (5–30 seconds).
                </li>
                <li>
                  Your delivery email lands with a secure link to the report —
                  bookmark it, you can come back any time.
                </li>
              </ol>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-lg p-6 mb-6">
              <h2 className="font-display text-xl text-off-white uppercase tracking-wide mb-3">
                While you wait
              </h2>
              <p className="text-off-white/80 mb-4">
                The Race Report tells you how to pace your event. The next step
                is the work that gets you ready for it. The Roadman{" "}
                <strong className="text-off-white">Not Done Yet</strong>{" "}
                community is where amateur racers train alongside Anthony,
                with weekly live calls, Vekta-driven plans, and the same
                expert access this report draws on.
              </p>
              <Link
                href="/community"
                className="inline-block bg-coral text-charcoal font-display uppercase tracking-wide px-5 py-3 rounded text-sm hover:bg-coral-hover transition"
              >
                See the community →
              </Link>
            </div>

            {prediction && (
              <div className="text-center">
                <Link
                  href={`/predict/${prediction.slug}`}
                  className="text-off-white/60 underline text-sm"
                >
                  Back to your free prediction
                </Link>
              </div>
            )}

            <div className="mt-8 text-off-white/50 text-xs text-center">
              Didn&apos;t receive your email after 5 minutes? Check spam, then email{" "}
              <a
                href="mailto:support@roadmancycling.com"
                className="text-coral underline"
              >
                support@roadmancycling.com
              </a>{" "}
              with your prediction slug — we&apos;ll re-send.
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
