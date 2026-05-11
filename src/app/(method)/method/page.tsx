import type { Metadata } from "next";
import { Hero } from "./_components/sales/Hero";
import { ProblemSection } from "./_components/sales/ProblemSection";
import { WhatIfSection } from "./_components/sales/WhatIfSection";
import { MethodOverview } from "./_components/sales/MethodOverview";
import { WhatYouGet } from "./_components/sales/WhatYouGet";
import { WhoThisIsFor } from "./_components/sales/WhoThisIsFor";
import { SocialProof } from "./_components/sales/SocialProof";
import { Pricing } from "./_components/sales/Pricing";
import { FAQ } from "./_components/sales/FAQ";
import { AnthonyNote } from "./_components/sales/AnthonyNote";
import { FinalCTA } from "./_components/sales/FinalCTA";

export const metadata: Metadata = {
  title: "The Roadman Method — A 12-Week System for Cyclists Who Are Stuck",
  description:
    "Twelve weeks. Five pillars. One system. Built on 300+ conversations with World Tour coaches, sports scientists and pro cyclists. From $297 — lifetime access.",
  openGraph: {
    title: "The Roadman Method",
    description:
      "A 12-week signature course for serious amateur cyclists. Built on 300+ podcast episodes with the people who actually move performance forward.",
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
      <Hero />
      <ProblemSection />
      <WhatIfSection />
      <MethodOverview />
      <WhatYouGet />
      <WhoThisIsFor />
      <SocialProof />
      <Pricing />
      <FAQ />
      <AnthonyNote />
      <FinalCTA />
    </>
  );
}
