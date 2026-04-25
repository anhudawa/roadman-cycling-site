import type { Metadata } from "next";
import Link from "next/link";
import { Header, Footer, Section, Container } from "@/components/layout";

export const metadata: Metadata = {
  title: "Cookie Policy $€” Roadman Cycling",
  description:
    "How Roadman Cycling uses cookies, analytics tracking, A/B testing, and third-party marketing cookies. Learn how to manage your cookie preferences.",
  alternates: {
    canonical: "https://roadmancycling.com/cookies",
  },
};

const cookieTable = [
  {
    name: "roadman_session_id",
    provider: "Roadman Cycling",
    purpose: "Analytics session tracking (stored in sessionStorage)",
    duration: "Browser session",
  },
  {
    name: "ab_variant",
    provider: "Roadman Cycling",
    purpose: "A/B test variant assignment for the current experiment",
    duration: "30 days",
  },
  {
    name: "roadman_ab_*",
    provider: "Roadman Cycling",
    purpose: "Per-experiment A/B test variant assignment",
    duration: "90 days",
  },
  {
    name: "_fbp",
    provider: "Meta / Facebook",
    purpose:
      "Identifies browsers for advertising attribution and targeting",
    duration: "90 days",
  },
  {
    name: "_fbc",
    provider: "Meta / Facebook",
    purpose:
      "Stores click identifiers from Facebook ad clicks for conversion tracking",
    duration: "90 days",
  },
  {
    name: "__vercel_live_token",
    provider: "Vercel",
    purpose: "Hosting platform session management",
    duration: "Browser session",
  },
];

export default function CookiePolicyPage() {
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
              COOKIE POLICY
            </h1>
            <p className="text-foreground-muted text-center">
              Last updated: April 2026
            </p>
          </Container>
        </Section>

        <Section background="charcoal">
          <Container width="narrow">
            <div className="max-w-3xl mx-auto space-y-12 text-foreground-muted leading-relaxed">
              {/* What Are Cookies */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  WHAT ARE COOKIES
                </h2>
                <p>
                  Cookies are small text files that websites place on your device
                  when you visit them. They are widely used to make websites work
                  efficiently, provide analytics information, and enable certain
                  features. Some cookies are essential for the site to function,
                  while others help us understand how visitors use the site or
                  serve relevant advertising.
                </p>
              </div>

              {/* Essential Cookies */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  ESSENTIAL COOKIES
                </h2>
                <p>
                  These cookies are necessary for the basic operation of our
                  website. They enable core functionality such as session
                  management, security, and accessibility features. The site
                  cannot function properly without these cookies, and they cannot
                  be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  ANALYTICS COOKIES
                </h2>
                <p>
                  We use a custom-built analytics tracker to understand how
                  visitors interact with our site. This tracker uses{" "}
                  <code className="text-coral text-sm">
                    roadman_session_id
                  </code>{" "}
                  stored in your browser&apos;s sessionStorage (which is
                  automatically cleared when you close your browser tab) to group
                  page views into sessions.
                </p>
                <p className="mt-3">
                  Our analytics collect the following data points:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Page views and navigation patterns</li>
                  <li>Scroll depth (how far down a page you read)</li>
                  <li>Time spent on each page</li>
                  <li>Referrer information (where you came from)</li>
                  <li>Device type and browser information</li>
                </ul>
                <p className="mt-3">
                  This data is used in aggregate to improve our content and site
                  experience. It is not used to personally identify individual
                  visitors.
                </p>
              </div>

              {/* A/B Testing Cookies */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  A/B TESTING COOKIES
                </h2>
                <p>
                  We run experiments to test different versions of pages, layouts,
                  and features. When you are included in an experiment, a cookie
                  is set to ensure you see the same variant consistently
                  throughout the experiment.
                </p>
                <ul className="list-disc pl-6 space-y-3 mt-4">
                  <li>
                    <code className="text-coral text-sm">ab_variant</code> $€” a
                    general A/B test cookie that stores your assigned variant.
                    Expires after 30 days.
                  </li>
                  <li>
                    <code className="text-coral text-sm">roadman_ab_*</code> $€”
                    per-experiment cookies (where * is the experiment name) that
                    track your variant assignment for specific tests. Each
                    expires after 90 days.
                  </li>
                </ul>
              </div>

              {/* Marketing Cookies */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  MARKETING COOKIES
                </h2>
                <p>
                  We use the Meta (Facebook) Pixel to measure the effectiveness
                  of our advertising campaigns and to build audiences for
                  targeted advertising on Facebook and Instagram.
                </p>
                <p className="mt-3">The Meta Pixel sets the following cookies:</p>
                <ul className="list-disc pl-6 space-y-3 mt-4">
                  <li>
                    <code className="text-coral text-sm">_fbp</code> $€” used by
                    Meta to identify your browser across visits for advertising
                    attribution. Expires after 90 days.
                  </li>
                  <li>
                    <code className="text-coral text-sm">_fbc</code> $€” stores
                    the click identifier when you arrive at our site from a
                    Facebook ad, enabling conversion tracking. Expires after 90
                    days.
                  </li>
                </ul>
                <p className="mt-3">
                  These cookies are set by Meta and are subject to{" "}
                  <a
                    href="https://www.facebook.com/privacy/policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-coral hover:underline"
                  >
                    Meta&apos;s Privacy Policy
                  </a>
                  .
                </p>
              </div>

              {/* Cookie Table */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  COOKIE REFERENCE TABLE
                </h2>
                <div className="overflow-x-auto -mx-4 px-4">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left text-off-white font-heading py-3 pr-4 tracking-wider text-xs">
                          COOKIE
                        </th>
                        <th className="text-left text-off-white font-heading py-3 pr-4 tracking-wider text-xs">
                          PROVIDER
                        </th>
                        <th className="text-left text-off-white font-heading py-3 pr-4 tracking-wider text-xs">
                          PURPOSE
                        </th>
                        <th className="text-left text-off-white font-heading py-3 tracking-wider text-xs">
                          DURATION
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cookieTable.map((cookie) => (
                        <tr
                          key={cookie.name}
                          className="border-b border-white/5"
                        >
                          <td className="py-3 pr-4 align-top">
                            <code className="text-coral text-xs">
                              {cookie.name}
                            </code>
                          </td>
                          <td className="py-3 pr-4 align-top text-xs">
                            {cookie.provider}
                          </td>
                          <td className="py-3 pr-4 align-top text-xs">
                            {cookie.purpose}
                          </td>
                          <td className="py-3 align-top text-xs whitespace-nowrap">
                            {cookie.duration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* How to Manage Cookies */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  HOW TO MANAGE COOKIES
                </h2>
                <p>
                  You can control and manage cookies in several ways:
                </p>
                <ul className="list-disc pl-6 space-y-3 mt-4">
                  <li>
                    <span className="text-off-white font-medium">
                      Cookie consent banner
                    </span>{" "}
                    $€” when you first visit our site, you can choose which
                    categories of cookies to accept or decline through our cookie
                    consent banner.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Browser settings
                    </span>{" "}
                    $€” most browsers allow you to block or delete cookies through
                    their settings. Note that blocking all cookies may affect the
                    functionality of our site and other websites you visit.
                  </li>
                  <li>
                    <span className="text-off-white font-medium">
                      Third-party opt-outs
                    </span>{" "}
                    $€” you can opt out of Meta advertising tracking through your{" "}
                    <a
                      href="https://www.facebook.com/settings/?tab=ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-coral hover:underline"
                    >
                      Facebook Ad Settings
                    </a>
                    .
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h2 className="font-heading text-off-white text-2xl mb-4 tracking-wider">
                  CONTACT
                </h2>
                <p>
                  If you have any questions about our use of cookies, please
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
