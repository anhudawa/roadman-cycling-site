import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "FTP Zone Calculator — Free Cycling Power Zone Tool",
  description:
    "Calculate your 7 cycling power zones from your FTP instantly. Free tool based on the training methodology discussed with Professor Seiler and World Tour coaches.",
  keywords: ["FTP zone calculator", "cycling power zones", "FTP calculator", "training zones cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/ftp-zones" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HowToSchema
        name="How to Calculate FTP Training Zones"
        description="Calculate your 7 cycling power training zones from your Functional Threshold Power (FTP) value using the standard percentage-based zone model."
        totalTime="PT2M"
        steps={[
          { name: "Determine your FTP", text: "Complete a 20-minute all-out test on a power meter or smart trainer. Multiply your average power by 0.95 to estimate your FTP (Functional Threshold Power)." },
          { name: "Enter your FTP in watts", text: "Input your FTP value into the calculator. Typical amateur FTP ranges from 150W to 350W depending on fitness level, body weight, and training history." },
          { name: "Review your 7 power zones", text: "The calculator outputs Zone 1 (Active Recovery) through Zone 7 (Neuromuscular) with wattage ranges. Each zone targets different energy systems and physiological adaptations." },
          { name: "Apply the 80/20 rule", text: "Spend approximately 80% of training time in Zones 1-2 and 20% in Zone 4 and above. This polarised approach is backed by Professor Seiler's research on elite endurance athletes." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "FTP Zone Calculator", item: "https://roadmancycling.com/tools/ftp-zones" },
          ],
        }}
      />
      {children}
    </>
  );
}
