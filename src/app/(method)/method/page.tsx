import type { Metadata } from "next";
import { MethodCourseJsonLd } from "./_components/MethodCourseJsonLd";
import { Hero } from "./_components/sales/Hero";
import { ProblemSection } from "./_components/sales/ProblemSection";
import { WhatIfSection } from "./_components/sales/WhatIfSection";
import { MethodOverview } from "./_components/sales/MethodOverview";
import { WhatYouGet } from "./_components/sales/WhatYouGet";
import { WhoThisIsFor } from "./_components/sales/WhoThisIsFor";
import { SocialProof } from "./_components/sales/SocialProof";
import { Pricing } from "./_components/sales/Pricing";
import { Guarantee } from "./_components/sales/Guarantee";
import { FAQ } from "./_components/sales/FAQ";
import { AnthonyNote } from "./_components/sales/AnthonyNote";
import { FinalCTA } from "./_components/sales/FinalCTA";

export const metadata: Metadata = {
  title: "The Roadman Method — 12-Week Course for Stuck Cyclists",
  description:
    "Twelve weeks. Five pillars. One system. Built on 1,400+ conversations with World Tour coaches, sport scientists and pro cyclists. From $297, lifetime access.",
  alternates: { canonical: "/method" },
  openGraph: {
    title: "The Roadman Method — 12-Week Course for Stuck Cyclists",
    description:
      "A 12-week course for serious amateur cyclists. Built on 1,400+ podcast conversations with the people who actually move performance forward.",
    type: "website",
  },
};

/**
 * /method — public sales page for The Roadman Method.
 *
 * Long-form VSL-style layout. Members are redirected to /method/dashboard
 * by the route layout, so this page only ever renders for prospects.
 */
export default function MethodSalesPage() {
  return (
    <>
      <MethodCourseJsonLd />
      <Hero />
      <ProblemSection />
      <WhatIfSection />
      <MethodOverview />
      <WhatYouGet />
      <WhoThisIsFor />
      <SocialProof />
      <Pricing />
      <Guarantee />
      <FAQ />
      <AnthonyNote />
      <FinalCTA />
    </>
  );
}
