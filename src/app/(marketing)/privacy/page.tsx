import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";

export const metadata: Metadata = {
  title: "Privacy Policy — Roadman Cycling",
  description:
    "How Roadman Cycling collects, uses, and protects your personal data. GDPR-compliant privacy policy covering newsletter signups, analytics, and third-party services.",
  alternates: {
    canonical: "https://roadmancycling.com/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      <main id="main-content">
        <Section background="deep-purple" grain className="pt-32 pb-16">
          <Container>
            <h1
              className="font-heading text-off-white mb-4 text-center"
              style={{ fontSize: "var(--text-hero)" }}
            >
              PRIVACY POLICY
            </h1>
            <p className="text-foreground-muted text-center">
              Last updated: April 2026
            </p>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="max-w-3xl mx-auto space-y-12 text-foreground-muted leading-relaxed">
              {/* Who We Are */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  WHO WE ARE
                </h2>
                <p>
                  Roadman Cycling is an Irish cycling media and education brand.
                  We produce the Roadman Cycling Podcast, publish written content
                  about cycling performance and training, operate the Saturday
                  Spin Newsletter, and run the Not Done Yet paid community for
                  serious cyclists.
                </p>
                <p className="mt-3">
                  Our website is{" "}
                  <span className="text-off-white">roadmancycling.com</span>.
                  When we refer to &quot;we&quot;, &quot;us&quot;, or
                  &quot;our&quot; in this policy, we mean Roadman Cycling.
                </p>
              </div>

              {/* What Data We Collect */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  WHAT DATA WE COLLECT
                </h2>
                <p className="mb-4">
                  We collect the following categories of personal data:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="text-off-white font-medium">
                      Email addresses
                    </span>{" "}
                    — provided when you sign up for the Saturday Spin Newsletter
                    or other email communications.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Analytics data
                    </span>{" "}
                    — page views, scroll depth, time on page, and navigation
                    patterns collected through our custom analytics tracker.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Device and browser information
                    </span>{" "}
                    — browser type, operating system, screen resolution, and
                    device type collected automatically when you visit our site.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Referrer data
                    </span>{" "}
                    — the website or source that directed you to our site.
                  </li>
                </ul>
              </div>

              {/* How We Use Your Data */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  HOW WE USE YOUR DATA
                </h2>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="text-off-white font-medium">
                      Newsletter delivery
                    </span>{" "}
                    — your email address is used to send you the Saturday Spin
                    Newsletter and occasional updates about Roadman Cycling
                    content and offerings, delivered via Beehiiv.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Site analytics
                    </span>{" "}
                    — we use analytics data to understand how visitors interact
                    with our site, identify popular content, and improve the user
                    experience.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Conversion tracking
                    </span>{" "}
                    — we track conversions (such as newsletter signups) to
                    measure the effectiveness of our content and marketing
                    efforts.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      A/B testing
                    </span>{" "}
                    — we run experiments to test different versions of pages and
                    features, using cookies to ensure you see a consistent
                    experience during each experiment.
                  </li>
                </ul>
              </div>

              {/* Third-Party Services */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  THIRD-PARTY SERVICES
                </h2>
                <p className="mb-4">
                  We share data with the following third-party service providers,
                  each of whom has their own privacy policy:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="text-off-white font-medium">
                      Beehiiv
                    </span>{" "}
                    — email newsletter platform. Your email address is stored and
                    processed by Beehiiv to deliver the Saturday Spin Newsletter.
                    Beehiiv may collect open rates and click data on our behalf.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Meta / Facebook Pixel
                    </span>{" "}
                    — advertising and conversion tracking. The Meta Pixel
                    collects data about your visit to help us measure advertising
                    effectiveness and build audiences for targeted advertising on
                    Facebook and Instagram.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">Vercel</span>{" "}
                    — website hosting and analytics. Our site is hosted on Vercel,
                    which may collect standard server logs including IP addresses,
                    request timestamps, and page URLs.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">Stripe</span>{" "}
                    — payment processing. If you purchase a subscription to our
                    Skool community (Not Done Yet), payment is processed by
                    Stripe. We do not store your full payment card details on our
                    servers.
                  </li>
                </ul>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  COOKIES
                </h2>
                <p className="mb-4">
                  We use cookies and similar technologies on our site. These
                  include:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="text-off-white font-medium">
                      Session cookies
                    </span>{" "}
                    — essential cookies for site functionality that expire when
                    you close your browser.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Analytics cookies
                    </span>{" "}
                    — our custom analytics tracker uses sessionStorage
                    (roadman_session_id) to track page views, scroll depth, and
                    time on page.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      A/B testing cookies
                    </span>{" "}
                    — <code className="text-coral text-sm">ab_variant</code>{" "}
                    (30-day duration) and{" "}
                    <code className="text-coral text-sm">roadman_ab_*</code>{" "}
                    (90-day duration per experiment) cookies are used to assign
                    and remember your test group for ongoing experiments.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Meta Pixel cookies
                    </span>{" "}
                    — including <code className="text-coral text-sm">_fbp</code>{" "}
                    and <code className="text-coral text-sm">_fbc</code> cookies
                    set by Meta for advertising attribution and tracking.
                  </li>
                </ul>
                <p className="mt-4">
                  For full details, see our{" "}
                  <Link href="/cookies" className="text-coral hover:underline">
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Your Rights Under GDPR */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  YOUR RIGHTS UNDER GDPR
                </h2>
                <p className="mb-4">
                  If you are located in the European Economic Area (EEA) or the
                  United Kingdom, you have the following rights under the General
                  Data Protection Regulation (GDPR):
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="text-off-white font-medium">
                      Right of access
                    </span>{" "}
                    — you can request a copy of the personal data we hold about
                    you.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Right to rectification
                    </span>{" "}
                    — you can ask us to correct any inaccurate or incomplete
                    personal data.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Right to erasure
                    </span>{" "}
                    — you can request that we delete your personal data, subject
                    to certain legal exceptions.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Right to data portability
                    </span>{" "}
                    — you can request your data in a structured,
                    commonly-used, machine-readable format.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Right to object
                    </span>{" "}
                    — you can object to the processing of your personal data for
                    direct marketing or other purposes.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Right to withdraw consent
                    </span>{" "}
                    — where processing is based on consent, you can withdraw that
                    consent at any time. For newsletter subscriptions, you can
                    unsubscribe at any time using the link in every email.
                  </li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please{" "}
                  <Link href="/contact" className="text-coral hover:underline">
                    contact us
                  </Link>
                  .
                </p>
              </div>

              {/* Data Retention */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  DATA RETENTION
                </h2>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="text-off-white font-medium">
                      Email addresses
                    </span>{" "}
                    — retained until you unsubscribe from our newsletter. Upon
                    unsubscription, your email is removed from our active mailing
                    list. Beehiiv may retain suppression records to honour your
                    unsubscribe request.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Analytics data
                    </span>{" "}
                    — retained for 12 months, after which it is aggregated or
                    deleted.
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  CONTACT
                </h2>
                <p>
                  If you have any questions about this privacy policy or how we
                  handle your data, please visit our{" "}
                  <Link href="/contact" className="text-coral hover:underline">
                    contact page
                  </Link>{" "}
                  to get in touch.
                </p>
              </div>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </>
  );
}
