import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  trailingSlash: false,
  // MDX-heavy podcast and blog pages (especially ones with long
  // transcripts) routinely brush against the 60s default on Vercel's
  // CPU-constrained build workers. Most recover on retry; ep-40 hit
  // the wall on all three attempts and failed the production deploy.
  // 180s gives the long-transcript pages enough headroom without
  // hiding a real perf regression elsewhere.
  staticPageGenerationTimeout: 180,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "maap-product-images.b-cdn.net",
      },
      {
        protocol: "https",
        hostname: "static.biketiresdirect.com",
      },
      {
        protocol: "https",
        hostname: "content.competitivecyclist.com",
      },
      {
        protocol: "https",
        hostname: "eu.zwift.com",
      },
      {
        protocol: "https",
        hostname: "muc-off.com",
      },
      {
        protocol: "https",
        hostname: "eu.muc-off.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
  },
  experimental: {
    // Tree-shake named exports from heavy libraries. recharts and date-fns
    // ship large barrel files — without this, importing one named export
    // pulls the whole module into the route's client chunk. lucide-react
    // sees a similar effect with icon barrel imports.
    optimizePackageImports: [
      "framer-motion",
      "recharts",
      "date-fns",
      "lucide-react",
    ],
  },
  async redirects() {
    const COACHING_SUBDOMAIN = [
      { type: "host" as const, value: "coaching.roadmancycling.com" },
    ];
    const WWW_HOST = [
      { type: "host" as const, value: "www.roadmancycling.com" },
    ];
    return [
      // ==========================================================
      // www.roadmancycling.com → roadmancycling.com (apex)
      // ----------------------------------------------------------
      // Canonical host is the apex. Any www. request 308s to the
      // matching apex path so we don't split link equity or appear
      // as duplicate URLs in search.
      // ==========================================================
      {
        source: "/:path*",
        has: WWW_HOST,
        destination: "https://roadmancycling.com/:path*",
        permanent: true,
      },
      // ==========================================================
      // coaching.roadmancycling.com subdomain retirement
      // ----------------------------------------------------------
      // Legacy ClickFunnels subdomain. DNS already points at Vercel
      // but the subdomain is not currently attached to this project,
      // so every path returns a Vercel DEPLOYMENT_NOT_FOUND 404.
      // Once the subdomain is added as a domain on this project,
      // these host-aware rules consolidate all legacy traffic onto
      // the apex. Must come BEFORE the generic apex redirects below.
      // ==========================================================
      // Blog URLs: preserve path (apex has the canonical versions)
      {
        source: "/blog/:slug*",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/blog/:slug*",
        permanent: true,
      },
      // 14-Day Kickstart Challenge — retired product; closest match is /apply
      {
        source: "/14day",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/apply",
        permanent: true,
      },
      // "It works" testimonials page → coaching landing (has testimonials inline)
      {
        source: "/itworks",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
      // ClickFunnels opt-in pages (pattern: /optin-<anything>).
      // Path-to-regexp v8 (Next.js 16+) rejects `:rest*` without a
      // slash prefix — the `-` separator doesn't count. Using an
      // inline regex `(.*)` to match any suffix instead.
      {
        source: "/optin-:rest(.*)",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/apply",
        permanent: true,
      },
      // ClickFunnels raw template slugs (pattern: /roadmancc<anything>)
      {
        source: "/roadmancc:rest(.*)",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
      // Subdomain root
      {
        source: "/",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
      // ==========================================================
      // Existing apex-domain redirects begin here.
      // These have no host filter and will ALSO fire for subdomain
      // traffic when the path matches — which is the desired
      // fall-through behaviour for slugs like /members, /strong,
      // /self-coaching-system etc. that may have been used on
      // both hosts historically.
      // ==========================================================
      // Redirect old ClickFunnels paths to new site equivalents
      {
        source: "/members",
        destination: "/community/clubhouse",
        permanent: true,
      },
      {
        source: "/2026",
        destination: "/apply",
        permanent: false,
      },
      {
        source: "/strong",
        destination: "/strength-training",
        permanent: true,
      },
      {
        source: "/self-coaching-system",
        destination: "/community/not-done-yet",
        permanent: true,
      },
      {
        source: "/application-funnel-6",
        destination: "/community/not-done-yet",
        permanent: true,
      },

      // Old site structure → new equivalents
      { source: "/shop", destination: "/tools", permanent: true },
      { source: "/store", destination: "/tools", permanent: true },
      { source: "/products", destination: "/tools", permanent: true },
      // Consolidated after the 25 Aug 2026 GSC review: this prevention and
      // treatment article duplicated the stronger cycling-knee-pain owner.
      // The canonical guide now contains the useful evidence and safety
      // boundaries from both pages.
      {
        source: "/blog/cycling-knee-pain-prevention-treatment-guide",
        destination: "/blog/cycling-knee-pain-causes-fixes",
        permanent: true,
      },
      // ClickFunnels "Roadman Toolkit" pillar-suffix variants. The bare
      // /toolkit + /the-toolkit redirects live further down with the other
      // ClickFunnels P1 rules; these catch the per-pillar lead magnets
      // (/toolkit-nutrition, /toolkit-recovery, etc.), deep paths, and
      // the prefixed variants Anthony used on Instagram/Skool.
      { source: "/toolkit-:rest(.*)", destination: "/tools", permanent: true },
      { source: "/toolkit/:slug*", destination: "/tools", permanent: true },
      { source: "/roadman-toolkit", destination: "/tools", permanent: true },
      { source: "/free-toolkit", destination: "/tools", permanent: true },
      { source: "/join", destination: "/apply", permanent: true },
      { source: "/signup", destination: "/apply", permanent: true },
      { source: "/sign-up", destination: "/apply", permanent: true },
      { source: "/register", destination: "/apply", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/about-me", destination: "/about", permanent: true },
      { source: "/services", destination: "/coaching", permanent: true },
      { source: "/pricing", destination: "/coaching", permanent: true },
      { source: "/prices", destination: "/coaching", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/club", destination: "/community/club", permanent: true },
      { source: "/free-trial", destination: "/apply", permanent: true },
      { source: "/trial", destination: "/apply", permanent: true },
      { source: "/coaching-application", destination: "/apply", permanent: true },
      { source: "/apply-now", destination: "/apply", permanent: true },
      // Plateau Diagnostic CTAs historically pointed at /ndy/fit (a
      // conversational qualifier page that was never built). Route any
      // surviving links — old emails, cached HTML, third-party shares —
      // to /coaching, the canonical NDY sales page. Must come BEFORE
      // the bare /ndy rule below; Next matches in declaration order.
      { source: "/ndy/fit", destination: "/coaching", permanent: true },
      { source: "/ndy", destination: "/community/not-done-yet", permanent: true },
      { source: "/not-done-yet", destination: "/community/not-done-yet", permanent: true },
      { source: "/episodes", destination: "/podcast", permanent: true },
      { source: "/listen", destination: "/podcast", permanent: true },
      { source: "/calculators", destination: "/tools", permanent: true },
      { source: "/ftp-calculator", destination: "/tools/ftp-zones", permanent: true },
      { source: "/ftp", destination: "/tools/ftp-zones", permanent: true },
      { source: "/tyre-pressure", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/tire-pressure", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/race-weight", destination: "/tools/race-weight", permanent: true },
      { source: "/fuelling", destination: "/tools/fuelling", permanent: true },
      { source: "/fueling", destination: "/tools/fuelling", permanent: true },
      { source: "/energy-availability", destination: "/tools/energy-availability", permanent: true },
      // Stale CTA defaults that pointed at /tools/<slug> for content that
      // actually lives under /compare or /diagnostic. The CTA components
      // have been updated, but the redirect catches any cached HTML,
      // outbound emails, or external backlinks still pointing at the
      // old paths.
      { source: "/tools/coach-or-app", destination: "/compare/coach-vs-app", permanent: true },
      { source: "/tools/plateau-diagnostic", destination: "/plateau", permanent: true },
      // Old Beehiiv email links used a `-calculator` suffix that was
      // never the real route. Catch them so opens from archived
      // newsletters land on the live tool.
      { source: "/tools/ftp-zones-calculator", destination: "/tools/ftp-zones", permanent: true },
      { source: "/tools/race-weight-calculator", destination: "/tools/race-weight", permanent: true },
      { source: "/tools/tyre-pressure-calculator", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/press", destination: "/about/press", permanent: true },
      { source: "/media", destination: "/about/press", permanent: true },
      { source: "/sponsors", destination: "/partners", permanent: true },
      { source: "/sponsorship", destination: "/partners", permanent: true },
      { source: "/coaching-ireland", destination: "/coaching/ireland", permanent: true },
      { source: "/coaching-uk", destination: "/coaching/uk", permanent: true },
      { source: "/coaching-usa", destination: "/coaching/usa", permanent: true },
      { source: "/triathlon", destination: "/coaching/triathletes", permanent: true },
      { source: "/triathlon-coaching", destination: "/coaching/triathletes", permanent: true },
      // Coaching segment slug consolidation — moved to shorter, keyword-clean
      // URLs (Apr 2026). Old slugs preserved as 301s to keep external links
      // and search index references working without losing equity.
      { source: "/coaching/triathlon", destination: "/coaching/triathletes", permanent: true },
      { source: "/coaching/masters-cyclists", destination: "/coaching/masters", permanent: true },
      { source: "/coaching/sportive-riders", destination: "/coaching/sportives", permanent: true },
      { source: "/coaching/gravel-racers", destination: "/coaching/gravel", permanent: true },
      { source: "/plans", destination: "/training-plans", permanent: true },
      { source: "/training-plan", destination: "/training-plans", permanent: true },
      { source: "/community/skool", destination: "/community/clubhouse", permanent: true },
      { source: "/skool", destination: "/community/clubhouse", permanent: true },
      // ClickFunnels "Clubhouse" suffix + deep-path variants. The bare
      // /clubhouse, /the-clubhouse, and /free-clubhouse rules live further
      // down with the other ClickFunnels P1 rules; these catch the
      // suffixed variants (/clubhouse-join, /clubhouse/about, etc.) and
      // the /roadman-clubhouse / /free-community aliases.
      { source: "/clubhouse-:rest(.*)", destination: "/community/clubhouse", permanent: true },
      { source: "/clubhouse/:slug*", destination: "/community/clubhouse", permanent: true },
      { source: "/roadman-clubhouse", destination: "/community/clubhouse", permanent: true },
      { source: "/free-community", destination: "/community/clubhouse", permanent: true },
      { source: "/blog/i-lost-7kg-eating-more-cycling", destination: "/blog/cycling-weight-loss-fuel-for-the-work-required", permanent: true },
      { source: "/blog/cycling-periodisation-training", destination: "/blog/cycling-periodisation-plan-guide", permanent: true },
      // Legacy product URL — strength-training course used to live under /products
      { source: "/products/strength-training", destination: "/strength-training", permanent: true },
      // Renamed/typo blog slugs surfaced in body links
      { source: "/blog/british-cycling-toxic-culture-toxic-sports-culture", destination: "/blog/british-cycling-toxic-culture-win-at-all-costs", permanent: true },
      { source: "/blog/why-cyclists-cant-lose-weight-five-causes", destination: "/blog/cycling-weight-loss-mistakes", permanent: true },
      // Sportive plan body links → existing event guides under /event/*
      { source: "/blog/marmotte-training-plan-cyclists", destination: "/event/marmotte-training-plan", permanent: true },
      { source: "/blog/la-marmotte-training-plan", destination: "/event/marmotte-training-plan", permanent: true },
      { source: "/blog/maratona-dles-dolomites-training-plan", destination: "/event/maratona-dolomites-training-plan", permanent: true },
      { source: "/blog/mallorca-312-training-plan", destination: "/event/mallorca-312-training-plan", permanent: true },
      // ClickFunnels funnel pages — P0 redirects (revenue + backlinks)
      { source: "/2026-optin", destination: "/apply", permanent: true },
      { source: "/application", destination: "/apply", permanent: true },
      { source: "/strength", destination: "/strength-training", permanent: true },
      { source: "/work-with-anthony", destination: "/coaching", permanent: true },
      { source: "/one-on-one-coaching", destination: "/coaching", permanent: true },
      { source: "/one-on-one-call", destination: "/coaching", permanent: true },
      { source: "/roadman-club-membership", destination: "/community/club", permanent: true },
      { source: "/roadman-cookbook-bundle", destination: "/tools", permanent: true },

      // ClickFunnels funnel pages — P1 redirects
      { source: "/tyre-pressure-2", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/tyre-pressure-2-copy", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/optin", destination: "/apply", permanent: true },
      { source: "/getstrong", destination: "/strength-training", permanent: true },
      { source: "/s-c-plan", destination: "/strength-training", permanent: true },

      // Bare-slug ClickFunnels lead-magnet paths. The audit found these
      // returning 404 — they were the canonical short URLs Anthony shared
      // in the podcast, on Instagram, and on the Skool community for
      // years. Every 404 here leaks accumulated link equity.
      //
      // /toolkit was the free calculators lead magnet → /tools
      // /clubhouse was the free Skool community → /community/clubhouse
      { source: "/toolkit", destination: "/tools", permanent: true },
      { source: "/the-toolkit", destination: "/tools", permanent: true },
      { source: "/clubhouse", destination: "/community/clubhouse", permanent: true },
      { source: "/the-clubhouse", destination: "/community/clubhouse", permanent: true },
      { source: "/free-clubhouse", destination: "/community/clubhouse", permanent: true },

      // Episode count slug update — old URL had 1300, corrected to 1400
      {
        source: "/blog/common-training-mistakes-from-1300-podcast-episodes",
        destination: "/blog/common-training-mistakes-from-1400-podcast-episodes",
        permanent: true,
      },
      // Consolidated duplicate blog posts — keep canonical, 301 the dupes
      {
        source: "/blog/best-cycling-podcasts-for-2026-edition",
        destination: "/blog/best-cycling-podcasts-2026",
        permanent: true,
      },
      // Indoor-trainer search ownership (Aug 2026). Two later buying guides
      // duplicated the maintained current-model guide, while the generated
      // "best" route repeated the same head term with stale products. Preserve
      // those URLs and consolidate model-selection signals into one owner. The
      // separate rollers comparison keeps its distinct category intent.
      {
        source: "/blog/cycling-indoor-trainer-buying-guide",
        destination: "/blog/best-indoor-smart-trainers-2026",
        permanent: true,
      },
      {
        source: "/best/best-turbo-trainers-2026",
        destination: "/blog/best-indoor-smart-trainers-2026",
        permanent: true,
      },
      {
        source: "/blog/cycling-turbo-vs-rollers-vs-smart-trainer-guide",
        destination: "/blog/indoor-trainer-vs-rollers",
        permanent: true,
      },
      // Power-meter search ownership (Aug 2026). Three buying explainers and
      // one generated best-of route competed for the same model-selection
      // intent. Preserve every retired URL while concentrating that intent in
      // the current, sourced buyer guide. The power-meter/trainer comparison
      // remains separate because it owns a distinct first-purchase decision.
      {
        source: "/blog/cycling-power-meter-guide",
        destination: "/blog/power-meter-buying-guide-cyclists",
        permanent: true,
      },
      {
        source: "/blog/cycling-power-meter-buying-guide",
        destination: "/blog/power-meter-buying-guide-cyclists",
        permanent: true,
      },
      {
        source: "/best/best-power-meters-amateur-cyclists",
        destination: "/blog/power-meter-buying-guide-cyclists",
        permanent: true,
      },
      // FTP-by-age consolidation (Aug 2026). Search Console showed the
      // maintained annual report earning 66 clicks / 3,695 impressions while
      // these later near-duplicates had 5 clicks or fewer and one was unknown
      // to Google. Preserve every old URL while concentrating benchmark intent
      // and link equity in the maintained report.
      {
        source: "/blog/good-ftp-for-my-age",
        destination: "/blog/age-group-ftp-benchmarks-2026",
        permanent: true,
      },
      {
        source: "/blog/cycling-what-is-a-good-ftp-by-age-guide",
        destination: "/blog/age-group-ftp-benchmarks-2026",
        permanent: true,
      },
      {
        source: "/blog/masters-ftp-benchmarks-cycling-guide",
        destination: "/blog/age-group-ftp-benchmarks-2026",
        permanent: true,
      },
      // General cycling-cadence consolidation (Aug 2026). Search Console
      // showed the established general guide at 239 clicks / 33,311
      // impressions over three months. The two July near-duplicates recorded
      // 23 / 4,280 and 10 / 2,040 respectively, shared 0.86–0.92 cosine body
      // similarity, and targeted the same optimal-RPM questions. Preserve both
      // URLs while concentrating general cadence intent in the incumbent.
      {
        source: "/blog/cycling-cadence-optimal-rpm-guide",
        destination: "/blog/cycling-cadence-optimal-guide",
        permanent: true,
      },
      {
        source: "/blog/cycling-cadence-finding-your-optimal-rpm-guide",
        destination: "/blog/cycling-cadence-optimal-guide",
        permanent: true,
      },
      // Cycling-over-50 consolidation (Aug 2026). Search Console showed the
      // established January guide at 78 clicks / 3,290 impressions over three
      // months versus 4 clicks / 411 impressions for the July near-duplicate.
      // The useful evidence and source material now live on the incumbent URL.
      {
        source: "/blog/cycling-over-50-evidence-based-training-guide",
        destination: "/blog/cycling-over-50-training",
        permanent: true,
      },
      // VO2max diagnostic consolidation (Aug 2026). Search Console showed the
      // established March diagnostic at 38 clicks / 6,920 impressions over 28
      // days versus 27 clicks / 3,930 impressions for the later 65%-similar
      // "seven reasons" article. Measurement, interval and masters guides keep
      // their distinct intent; the true diagnostic duplicate resolves here.
      {
        source: "/blog/vo2max-training-cyclists-seven-reasons",
        destination: "/blog/vo2max-cycling-fixable-reasons-low",
        permanent: true,
      },
      // Carbs-per-hour cannibalisation fix — two posts targeted the same
      // "carbs per hour cycling" query. The longer, expert-cited
      // carbohydrate-per-hour-cyclists is canonical; the "fuel like a pro"
      // variant 301s here so the two stop splitting link equity.
      {
        source: "/blog/cycling-carbs-per-hour-fuel-like-a-pro",
        destination: "/blog/carbohydrate-per-hour-cyclists",
        permanent: true,
      },
      // FTP coach consensus consolidation — the 25-coaches piece is the
      // broader, more citable canonical. The narrower World Tour-only post
      // 301s here so internal links and external backlinks consolidate.
      {
        source: "/blog/what-worldtour-coaches-agree-on-ftp",
        destination: "/blog/what-25-top-coaches-agree-on-about-ftp",
        permanent: true,
      },
      {
        source: "/blog/cycling-coach-near-me-why-location-doesnt-matter",
        destination: "/blog/cycling-coach-near-me-why-location-doesnt-matter-2026",
        permanent: true,
      },
      {
        source: "/blog/online-cycling-coach-cost",
        destination: "/blog/how-much-does-online-cycling-coach-cost-2026",
        permanent: true,
      },
      {
        source: "/blog/cycling-coaching-cost-guide",
        destination: "/blog/how-much-does-online-cycling-coach-cost-2026",
        permanent: true,
      },
      {
        source: "/blog/trainerroad-vs-coaching",
        destination: "/blog/trainerroad-vs-online-cycling-coach",
        permanent: true,
      },

      // Today's Plan has shut down as a product — the old comparison
      // page is now framed as TrainingPeaks vs Vekta at a new slug.
      {
        source: "/compare/trainingpeaks-vs-todays-plan",
        destination: "/compare/trainingpeaks-vs-vekta",
        permanent: true,
      },

      // ==========================================================
      // Legacy ClickFunnels paths flagged as live 404s in the
      // 2026-06 SEO audit. Each accumulated inbound links during the
      // ClickFunnels era, so every 404 leaks authority. Map to the
      // closest canonical equivalent (308). Notes:
      //  - /join is already handled above (→ /apply).
      //  - /order and /thankyou are dead transactional pages and go
      //    to 410 Gone in the rewrites block below, matching the
      //    other order-form / thank-you rules — not a 301.
      // ==========================================================
      { source: "/podcast-page", destination: "/podcast", permanent: true },
      { source: "/home-page", destination: "/", permanent: true },
      // Membership = the Not Done Yet community
      { source: "/membership", destination: "/community/not-done-yet", permanent: true },
      // 14-Day Kickstart Challenge funnel (same retired product as /14day → /apply)
      { source: "/challenge", destination: "/apply", permanent: true },
      // Sales webinar funnel — sold 1:1 coaching → coaching sales page
      { source: "/webinar", destination: "/coaching", permanent: true },
      // Bare free lead-magnet entry — the free calculator toolkit
      { source: "/free", destination: "/tools", permanent: true },
      // "Start here" entry funnel → coaching application
      { source: "/start", destination: "/apply", permanent: true },

      // ClickFunnels orphan landing pages — P2 redirects
      { source: "/tyre-pressure-2-page--64de3", destination: "/tools/tyre-pressure", permanent: true },
      { source: "/toolkit2-page", destination: "/tools", permanent: true },
      { source: "/optin-page", destination: "/apply", permanent: true },
      { source: "/application-page", destination: "/apply", permanent: true },
      { source: "/copy-of-the-perfect-squeeze-page-d3318--8234c", destination: "/tools", permanent: true },

      // ==========================================================
      // Legacy WordPress-style category & tag URLs → topic hubs
      // ----------------------------------------------------------
      // The previous site grouped posts under /blog/<category>. Those
      // URLs are still being surfaced in search. Each maps to the
      // corresponding /topics/<hub> page (the canonical taxonomy hub
      // on the current site). Catch-all `/blog/category/*` and
      // `/blog/tag/*` archives fall back to the blog index.
      // Real article slugs (e.g. /blog/cycling-training-plan-guide)
      // are unaffected — these are exact-match literal paths.
      // ==========================================================
      { source: "/blog/training", destination: "/topics/cycling-training-plans", permanent: true },
      { source: "/blog/nutrition", destination: "/topics/cycling-nutrition", permanent: true },
      { source: "/blog/recovery", destination: "/topics/cycling-recovery", permanent: true },
      { source: "/blog/strength", destination: "/topics/cycling-strength-conditioning", permanent: true },
      { source: "/blog/strength-training", destination: "/topics/cycling-strength-conditioning", permanent: true },
      { source: "/blog/coaching", destination: "/topics/cycling-coaching", permanent: true },
      { source: "/blog/weight-loss", destination: "/topics/cycling-weight-loss", permanent: true },
      { source: "/blog/beginners", destination: "/topics/cycling-beginners", permanent: true },
      { source: "/blog/beginner", destination: "/topics/cycling-beginners", permanent: true },
      { source: "/blog/triathlon", destination: "/topics/triathlon-cycling", permanent: true },
      { source: "/blog/mtb", destination: "/topics/mountain-biking", permanent: true },
      { source: "/blog/mountain-biking", destination: "/topics/mountain-biking", permanent: true },
      { source: "/blog/ftp", destination: "/topics/ftp-training", permanent: true },
      { source: "/blog/ftp-training", destination: "/topics/ftp-training", permanent: true },
      { source: "/blog/category/:slug*", destination: "/blog", permanent: true },
      { source: "/blog/tag/:slug*", destination: "/blog", permanent: true },

      // ==========================================================
      // Scaled-content consolidation (see docs/scaled-content-audit.md)
      // ----------------------------------------------------------
      // 301s that collapse query cannibalisation found in the audit.
      // The destination page is the canonical survivor; the redirected
      // slugs were removed from their data sources (questions.ts /
      // problems.ts) so they no longer build or appear in the sitemap.
      //
      // (a) Answer ↔ Question duplicates — both were Q&A answer pages on
      // the same query. The richer, citation-optimised /answers entry is
      // kept; the thinner /question twin redirects to it.
      // ==========================================================
      { source: "/question/ftp-vs-heart-rate-training", destination: "/answers/train-by-ftp-or-heart-rate", permanent: true },
      { source: "/question/how-often-test-ftp", destination: "/answers/how-often-test-ftp", permanent: true },
      { source: "/question/how-much-protein-cyclists-need", destination: "/answers/how-much-protein-do-cyclists-need", permanent: true },
      { source: "/question/what-is-good-ftp-for-amateur", destination: "/answers/what-is-a-good-ftp", permanent: true },
      { source: "/question/lose-weight-without-losing-power-cycling", destination: "/answers/lose-weight-without-losing-power", permanent: true },
      { source: "/question/cycling-durability-training", destination: "/answers/what-is-durability-cycling", permanent: true },
      // (b) FTP-plateau /problem cluster — consolidated onto the canonical
      // plateau diagnostic (/problem/stuck-on-plateau). The broad
      // "not getting faster" page is kept as a distinct angle; the two
      // long-tail FTP-plateau variants fold into the canonical page.
      { source: "/problem/flat-ftp", destination: "/problem/stuck-on-plateau", permanent: true },
      { source: "/problem/ftp-stuck-250-watts", destination: "/problem/stuck-on-plateau", permanent: true },

      // Retired podcast-era campaigns still linked from the episode archive.
      // Preserve their accumulated authority by consolidating each intent into
      // the current canonical owner rather than serving an internal 404.
      { source: "/14day", destination: "/training-plans", permanent: true },
      { source: "/8week", destination: "/training-plans", permanent: true },
      { source: "/roadmancc52487793", destination: "/community", permanent: true },
      { source: "/web-class", destination: "/coaching", permanent: true },

      // ==========================================================
      // coaching.roadmancycling.com subdomain catch-all
      // ----------------------------------------------------------
      // This fires only when the host is coaching.roadmancycling.com
      // AND no earlier rule matched. Any orphan ClickFunnels URL that
      // we haven't explicitly listed above goes to /coaching rather
      // than a broken Vercel 404.
      // ==========================================================
      {
        source: "/:path*",
        has: COACHING_SUBDOMAIN,
        destination: "https://roadmancycling.com/coaching",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        // /sitemap.xml is the canonical URL crawlers (and our own llms.txt /
        // llms-full.txt) reference. Next.js 16's generateSitemaps() emits
        // /sitemap/0.xml … /sitemap/N.xml but does NOT auto-emit an index at
        // /sitemap.xml, and adding a route handler at that path collides with
        // the metadata-file convention. The rewrite serves the existing
        // /sitemap-index.xml handler under the canonical /sitemap.xml URL.
        { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
        // /facts.json is the canonical public brand-facts URL that llms.txt
        // advertises to AI crawlers. The handler lives at /api/facts.json, but
        // /api/* is robots-disallowed, so serve it under the clean,
        // crawler-allowed /facts.json path (same pattern as /sitemap.xml above).
        { source: "/facts.json", destination: "/api/facts.json" },
        // ClickFunnels dead URLs → 410 Gone (thank-you pages, checkout forms,
        // template demos, archived funnels). Rewrite to /api/gone which returns 410.
        { source: "/thank-you-1", destination: "/api/gone" },
        { source: "/thank-you", destination: "/api/gone" },
        { source: "/thank-you-minimal", destination: "/api/gone" },
        { source: "/thank-you--1dbf8", destination: "/api/gone" },
        { source: "/thank-you-page--7d9f9", destination: "/api/gone" },
        { source: "/thank-you-page--87843", destination: "/api/gone" },
        { source: "/application-thank-you", destination: "/api/gone" },
        { source: "/s-c-order-form", destination: "/api/gone" },
        { source: "/s-c-order-confirmed", destination: "/api/gone" },
        // Bare ClickFunnels checkout/thank-you slugs (SEO audit, 2026-06).
        // Dead transactional pages — 410 Gone, consistent with the
        // order-form and thank-you rules above.
        { source: "/order", destination: "/api/gone" },
        { source: "/thankyou", destination: "/api/gone" },
        { source: "/confirmation--5562c", destination: "/api/gone" },
        { source: "/anthony-walsh", destination: "/api/gone" },
        { source: "/grow-with-the-flow-order-form", destination: "/api/gone" },
        { source: "/gwtf-strategy-session-optin", destination: "/api/gone" },
        { source: "/creator-theme---product", destination: "/api/gone" },
        { source: "/my-example-page", destination: "/api/gone" },
        { source: "/course-theme---product", destination: "/api/gone" },
        { source: "/oto-page--958bb--25bd3", destination: "/api/gone" },
        { source: "/2-step-book-page-page", destination: "/api/gone" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    // Content-Security-Policy in Report-Only mode for non-embed routes.
    // Next.js's runtime + framer-motion + recharts + Vercel Analytics
    // + GA + Stripe Checkout + Beehiiv embed all use inline styles
    // and a few inline scripts (JSON-LD, Next bootstrap), so a strict
    // enforcing CSP would break the site without nonce-aware
    // refactoring. Shipping in Report-Only first lets us collect
    // violation reports and tighten without an outage.
    //
    // When ready to enforce: switch the header key to
    // `Content-Security-Policy` and remove `report-only`.
    const CSP_REPORT_ONLY = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "img-src 'self' data: blob: https://i.ytimg.com https://i.scdn.co https://cdn.sanity.io https://*.vercel-blob.com https://*.public.blob.vercel-storage.com https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net",
      "media-src 'self' https://*.vercel-blob.com https://*.public.blob.vercel-storage.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      // 'unsafe-inline' for styles is unavoidable with framer-motion +
      // recharts inline style attributes; same for Tailwind-injected styles.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Scripts: 'self' for our own bundles, 'unsafe-inline' for the
      // small Next.js bootstrap + JSON-LD blocks (no nonce yet — see
      // comment above), plus Stripe, GA, GTM, Vercel Analytics.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://*.vercel-insights.com https://va.vercel-scripts.com",
      "connect-src 'self' https://*.upstash.io https://api.stripe.com https://*.vercel-insights.com https://www.google-analytics.com https://*.googleapis.com https://embeds.beehiiv.com https://*.public.blob.vercel-storage.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://embeds.beehiiv.com https://www.youtube.com https://www.youtube-nocookie.com https://open.spotify.com",
      "worker-src 'self' blob:",
      "upgrade-insecure-requests",
    ].join("; ");

    // Permissions-Policy — disable powerful browser APIs we don't use.
    // We DO use payment via Stripe Checkout (separate origin), so
    // payment is left allowed for self.
    const PERMISSIONS_POLICY = [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=(self)",
      "picture-in-picture=(self)",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "sync-xhr=()",
      "usb=()",
      "xr-spatial-tracking=()",
    ].join(", ");

    return [
      // Next.js generates fingerprinted Open Graph image URLs such as
      // /blog/<slug>/opengraph-image-<hash>. They are social-share assets,
      // not search landing pages. GSC was classifying more than a thousand
      // of these binary URLs as "Crawled - currently not indexed".
      {
        source: "/:path*/opengraph-image:hash(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      // Public feeds remain crawlable for apps and AI agents, while the
      // response header prevents raw JSON/XML documents becoming search
      // results or polluting GSC's HTML indexing reports.
      {
        source: "/feeds/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      // Default security headers — applied to every path EXCEPT the public
      // /embed routes, which need to be framable on third-party sites.
      // path-to-regexp v8 supports regex constraints via :name(pattern); the
      // negative lookahead skips anything beginning with `embed/` or `embed`.
      {
        source: "/:path((?!embed(?:/|$)).*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: PERMISSIONS_POLICY,
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: CSP_REPORT_ONLY,
          },
        ],
      },
      // Embed routes: framable from any origin. Keep nosniff/HSTS but
      // omit X-Frame-Options and use CSP frame-ancestors to advertise intent
      // to modern browsers. Covers /embed and /embed/<anything>.
      {
        source: "/embed/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
      {
        source: "/embed",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
