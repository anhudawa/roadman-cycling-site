import { JsonLd } from "@/components/seo/JsonLd";
import { BRAND, ENTITY_IDS, FOUNDER, SITE_ORIGIN } from "@/lib/brand-facts";
import { METHOD_MODULES } from "@/lib/method/modules";

/**
 * Course + CourseInstance structured data for The Roadman Method.
 *
 * Rendered on the public /method sales page (members are redirected to
 * /method/dashboard by the route layout, so this page is what crawlers
 * and prospects see). Models the 12-week course per Google's Course
 * structured-data guidance:
 *
 *   Required:    Course.name
 *   Recommended: description, provider, offers, hasCourseInstance
 *   CourseInstance: courseMode (required) + courseSchedule/courseWorkload
 *
 * provider and instructor reference the canonical Organization and Person
 * nodes by @id (emitted site-wide via OrganizationJsonLd) while still
 * carrying name + url inline so the nodes resolve even if a crawler only
 * fetches this page.
 */

const COURSE_ID = `${SITE_ORIGIN}/method#course`;
const PRICE = "297";
const CURRENCY = "USD";

const COURSE_DESCRIPTION =
  "The Roadman Method is a 12-week structured training course for serious amateur and masters cyclists. Across five pillars — coaching, nutrition, strength, recovery and the craft of riding — it turns 1,400+ Roadman Cycling Podcast conversations with World Tour coaches and sport scientists into a self-coaching system you run week by week. Hosted by Anthony Walsh, with lifetime access and weekly module unlocks.";

const provider = {
  "@type": "Organization",
  "@id": ENTITY_IDS.organization,
  name: BRAND.name,
  url: SITE_ORIGIN,
} as const;

const instructor = {
  "@type": "Person",
  "@id": ENTITY_IDS.person,
  name: FOUNDER.name,
  url: FOUNDER.url,
} as const;

const offers = {
  "@type": "Offer",
  category: "Paid",
  price: PRICE,
  priceCurrency: CURRENCY,
  availability: "https://schema.org/InStock",
  url: `${SITE_ORIGIN}/method`,
} as const;

export function MethodCourseJsonLd() {
  // One syllabus item per module — a sub-Course node Google reads as the
  // course's parts. Each carries the canonical module URL, its title, and
  // the subtitle as a short description.
  const hasPart = METHOD_MODULES.map((m) => ({
    "@type": "Course",
    name: `Week ${m.weekIndex}: ${m.title}`,
    description: m.subtitle,
    url: `${SITE_ORIGIN}/method/modules/${m.slug}`,
    provider,
  }));

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Course",
        "@id": COURSE_ID,
        name: "The Roadman Method",
        description: COURSE_DESCRIPTION,
        url: `${SITE_ORIGIN}/method`,
        provider,
        instructor,
        educationalLevel: "Intermediate to Advanced",
        inLanguage: "en",
        timeRequired: "P12W",
        teaches: [
          "Polarised cycling training",
          "Periodisation and season planning",
          "Performance nutrition and race weight",
          "Strength and conditioning for cyclists",
          "Recovery and adaptation",
          "Self-coaching",
        ],
        about: [
          { "@type": "Thing", name: "Masters cycling" },
          { "@type": "Thing", name: "Cycling training methodology" },
        ],
        offers,
        hasPart,
        hasCourseInstance: {
          "@type": "CourseInstance",
          name: "The Roadman Method — online, self-paced",
          description:
            "Self-paced online delivery with a new module unlocking each week across 12 weeks.",
          courseMode: "online",
          courseWorkload: "PT6H",
          courseSchedule: {
            "@type": "Schedule",
            repeatFrequency: "P1W",
            repeatCount: 12,
            duration: "PT6H",
          },
          location: {
            "@type": "VirtualLocation",
            url: `${SITE_ORIGIN}/method`,
          },
          instructor,
          offers,
        },
      }}
    />
  );
}
