import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";

export const metadata: Metadata = {
  title: "Terms of Service — Roadman Cycling",
  description:
    "Terms and conditions for using Roadman Cycling's website, newsletter, podcast, and paid community. Governed by the laws of Ireland.",
  alternates: {
    canonical: "https://roadmancycling.com/terms",
  },
};

export default function TermsOfServicePage() {
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
              TERMS OF SERVICE
            </h1>
            <p className="text-foreground-muted text-center">
              Last updated: April 2026
            </p>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="max-w-3xl mx-auto space-y-12 text-foreground-muted leading-relaxed">
              {/* Acceptance of Terms */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  ACCEPTANCE OF TERMS
                </h2>
                <p>
                  By accessing or using the Roadman Cycling website
                  (roadmancycling.com), subscribing to our newsletter, listening
                  to our podcast, or joining our community, you agree to be bound
                  by these Terms of Service. If you do not agree to these terms,
                  please do not use our services.
                </p>
              </div>

              {/* Description of Services */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  DESCRIPTION OF SERVICES
                </h2>
                <p className="mb-4">
                  Roadman Cycling provides the following services:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    <span className="text-off-white font-medium">
                      Free content
                    </span>{" "}
                    — blog articles, the Roadman Cycling Podcast, training tools,
                    and the weekly Saturday Spin Newsletter.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Paid community
                    </span>{" "}
                    — the Not Done Yet coaching community hosted on Skool,
                    offering structured training programmes, community
                    interaction, and exclusive content.
                  </li>
                </ul>
              </div>

              {/* User Accounts & Membership */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  USER ACCOUNTS &amp; MEMBERSHIP
                </h2>
                <p>
                  Access to the Not Done Yet community requires a Skool account
                  and an active paid subscription. You are responsible for
                  maintaining the confidentiality of your account credentials and
                  for all activity that occurs under your account. Membership is
                  personal and non-transferable.
                </p>
                <p className="mt-3">
                  You agree to provide accurate, current, and complete
                  information when creating your account, and to update that
                  information as necessary.
                </p>
              </div>

              {/* Intellectual Property */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  INTELLECTUAL PROPERTY
                </h2>
                <p>
                  All content on roadmancycling.com — including but not limited
                  to articles, podcast episodes, images, videos, graphics,
                  training plans, tools, and brand assets — is owned by Roadman
                  Cycling or licensed to us and is protected by copyright and
                  intellectual property laws.
                </p>
                <p className="mt-3">
                  You may consume our content for personal, non-commercial use.
                  You may not reproduce, distribute, modify, create derivative
                  works of, publicly display, or commercially exploit any of our
                  content without prior written permission from Roadman Cycling.
                </p>
              </div>

              {/* User Conduct */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  USER CONDUCT
                </h2>
                <p className="mb-4">
                  When using our services, including our community platforms, you
                  agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-3">
                  <li>
                    Post spam, unsolicited advertising, or promotional content.
                  </li>
                  <li>
                    Engage in harassment, bullying, hate speech, or abusive
                    behaviour towards other members or staff.
                  </li>
                  <li>
                    Share, redistribute, or resell paid community content without
                    authorisation.
                  </li>
                  <li>
                    Impersonate any person or entity, or misrepresent your
                    affiliation with any person or entity.
                  </li>
                  <li>
                    Use automated systems (bots, scrapers, etc.) to access or
                    collect data from our site or services.
                  </li>
                  <li>
                    Attempt to gain unauthorised access to any part of our
                    systems or other users&apos; accounts.
                  </li>
                </ul>
              </div>

              {/* Payment & Refunds */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  PAYMENT &amp; REFUNDS
                </h2>
                <p>
                  The Not Done Yet community operates on a recurring subscription
                  model, billed through Skool with payments processed by Stripe.
                  Subscription fees are charged at the start of each billing
                  period.
                </p>
                <p className="mt-3">
                  In accordance with the EU Consumer Rights Directive, you have a{" "}
                  <span className="text-off-white font-medium">
                    14-day cooling-off period
                  </span>{" "}
                  from the date of your initial subscription purchase during
                  which you may cancel for a full refund, no questions asked.
                </p>
                <p className="mt-3">
                  After the 14-day cooling-off period, you may cancel your
                  subscription at any time. Cancellation will take effect at the
                  end of your current billing period and no further charges will
                  be made. Refunds are not provided for partial billing periods
                  after the cooling-off period.
                </p>
              </div>

              {/* Newsletter */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  NEWSLETTER
                </h2>
                <p>
                  By subscribing to the Saturday Spin Newsletter, you consent to
                  receiving a weekly email every Saturday with cycling
                  performance insights, content highlights, and occasional
                  updates about Roadman Cycling products and services.
                </p>
                <p className="mt-3">
                  You can unsubscribe at any time by clicking the unsubscribe
                  link included at the bottom of every newsletter email. Your
                  email will be removed from our active mailing list promptly
                  after unsubscription.
                </p>
              </div>

              {/* Limitation of Liability */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  LIMITATION OF LIABILITY
                </h2>
                <p>
                  All content provided by Roadman Cycling — including podcast
                  episodes, blog articles, training tools, and community
                  discussions — is for{" "}
                  <span className="text-off-white font-medium">
                    educational and informational purposes only
                  </span>
                  . It does not constitute medical advice, professional coaching
                  prescriptions, or personalised training plans.
                </p>
                <p className="mt-3">
                  You should always consult with a qualified healthcare
                  professional or certified coach before making changes to your
                  training, nutrition, or health regimen. Roadman Cycling is not
                  liable for any injury, loss, or damage arising from your use of
                  our content or services.
                </p>
                <p className="mt-3">
                  To the fullest extent permitted by law, Roadman Cycling
                  excludes all liability for indirect, incidental, special, or
                  consequential damages arising from your use of our site or
                  services.
                </p>
              </div>

              {/* Termination */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  TERMINATION
                </h2>
                <p>
                  We reserve the right to suspend or terminate your access to any
                  of our services — including the Not Done Yet community — at our
                  discretion, if we reasonably believe you have violated these
                  Terms of Service. In cases of termination for cause, no refund
                  will be issued for any remaining subscription period.
                </p>
              </div>

              {/* Governing Law */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  GOVERNING LAW
                </h2>
                <p>
                  These Terms of Service are governed by and construed in
                  accordance with the laws of Ireland. Any disputes arising from
                  or in connection with these terms shall be subject to the
                  exclusive jurisdiction of the courts of Ireland.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  CONTACT
                </h2>
                <p>
                  If you have any questions about these Terms of Service, please
                  visit our{" "}
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
