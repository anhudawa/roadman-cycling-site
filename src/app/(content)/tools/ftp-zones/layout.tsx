import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "FTP Zone Calculator — Free Cycling Power Zone Tool",
  description:
    "Calculate your 7 cycling power zones from your FTP instantly. Free tool based on the training methodology discussed with Professor Seiler and World Tour coaches.",
  keywords: ["FTP zone calculator", "cycling power zones", "FTP calculator", "training zones cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/ftp-zones" },
  openGraph: {
    title: "FTP Zone Calculator — Free Cycling Power Zone Tool",
    description:
      "Calculate your 7 cycling power zones from your FTP instantly. Free tool based on the training methodology discussed with Professor Seiler and World Tour coaches.",
    type: "website",
    url: "https://roadmancycling.com/tools/ftp-zones",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Roadman Cycling" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="FTP Zone Calculator"
        description="Calculate your 7 cycling power zones from your Functional Threshold Power (FTP) instantly. Free browser-based calculator."
        url="https://roadmancycling.com/tools/ftp-zones"
        features={[
          "7-zone Coggan power zone model",
          "Instant wattage ranges from any FTP value",
          "Visual zone distribution chart",
          "Copy-to-clipboard results",
        ]}
      />
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is FTP in cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "FTP stands for Functional Threshold Power. It represents the highest average power you can sustain for approximately one hour and is measured in watts. FTP is the single most important metric in cycling training because your seven power training zones are all calculated as percentages of it.",
              },
            },
            {
              "@type": "Question",
              name: "How do I calculate my FTP?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The most common method is a 20-minute all-out test: ride as hard as you can sustain for 20 minutes on a power meter or smart trainer, then multiply your average power by 0.95. For example, if your 20-minute average is 260W, your estimated FTP is 247W. Ramp tests and full 60-minute tests are alternatives, but the 20-minute protocol offers the best balance of accuracy and practicality.",
              },
            },
            {
              "@type": "Question",
              name: "What is a good FTP for a beginner cyclist?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For a beginner male cyclist, an FTP of 150-200W is typical; for a beginner female cyclist, 100-160W is common. However, absolute watts matter less than watts per kilogram (W/kg). A beginner might be around 1.5-2.5 W/kg, while a competitive amateur typically reaches 3.5-4.5 W/kg. Focus on your own progression rather than comparing raw numbers.",
              },
            },
            {
              "@type": "Question",
              name: "How often should I test my FTP?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Test your FTP every 6-8 weeks, ideally at the end of a training block and after a rest day. Testing more frequently causes unnecessary fatigue without meaningful data, since FTP changes gradually. Many modern smart trainers and platforms like Zwift and TrainerRoad also estimate FTP passively from your ride data.",
              },
            },
            {
              "@type": "Question",
              name: "What are the 7 cycling power zones?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The 7 standard cycling power zones are: Zone 1 (Active Recovery, below 55% FTP), Zone 2 (Endurance, 56-75% FTP), Zone 3 (Tempo, 76-90% FTP), Zone 4 (Threshold, 91-105% FTP), Zone 5 (VO2max, 106-120% FTP), Zone 6 (Anaerobic Capacity, 121-150% FTP), and Zone 7 (Neuromuscular, 150%+ FTP). This model was developed by Dr Andrew Coggan and is used by most training platforms.",
              },
            },
            {
              "@type": "Question",
              name: "What is W/kg and why does it matter in cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "W/kg (watts per kilogram) is your power-to-weight ratio — your FTP divided by your body weight. It is the best predictor of climbing and overall cycling performance. For example, a 70kg rider with a 280W FTP has a ratio of 4.0 W/kg. Improving your W/kg through increasing power, reducing excess body fat, or both is the most effective way to get faster on the bike.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
