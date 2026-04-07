import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Race Weight Calculator — Peak Cycling Weight",
  description:
    "Calculate your target race weight based on body composition and event type. Free cycling tool based on competitive cyclist reference ranges.",
  keywords: ["race weight calculator", "cycling race weight", "cycling body composition", "power to weight cycling"],
  alternates: { canonical: "https://roadmancycling.com/tools/race-weight" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HowToSchema
        name="How to Calculate Race Weight"
        description="Calculate your target race weight range for peak cycling performance based on body composition, gender, and event type rather than BMI."
        totalTime="PT3M"
        steps={[
          { name: "Enter your body measurements", text: "Input your height in centimetres, current weight in kilograms, and estimated body fat percentage. A smart scale or caliper test gives the most accurate body fat reading." },
          { name: "Select your gender and event type", text: "Choose your gender and target event (road race, gran fondo, hill climb, time trial, or gravel). Each event type has different optimal body fat ranges based on sports science literature." },
          { name: "Review your target weight range", text: "The calculator outputs a target weight range and body fat percentage based on your lean mass and event-specific reference ranges from Jeukendrup and Gleeson research." },
          { name: "Follow the recommended timeline", text: "The calculator estimates weeks to reach your target at a safe rate of 0.5% body weight per week. Focus on protein adequacy (1.6-2.2g/kg) and fuelling key sessions rather than crash dieting." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "Race Weight Calculator", item: "https://roadmancycling.com/tools/race-weight" },
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
              name: "What is ideal race weight for cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ideal race weight for cycling is the body weight at which you achieve the best power-to-weight ratio without compromising health or performance. It is determined by body composition — specifically lean mass and body fat percentage — rather than a BMI chart. For competitive male cyclists, target body fat typically ranges from 7-15% depending on the event; for female cyclists, 14-25%. A hill climb specialist will aim leaner than a gran fondo rider.",
              },
            },
            {
              "@type": "Question",
              name: "How does weight affect cycling performance?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Weight directly affects your power-to-weight ratio (W/kg), which determines how fast you climb and accelerate. On flat terrain the effect is smaller, but on gradients above 5% every kilogram matters significantly. Losing 1kg of body fat while maintaining power is equivalent to gaining roughly 3-5 watts of FTP in terms of climbing speed. However, losing weight too aggressively can reduce muscle mass, power output, and immune function.",
              },
            },
            {
              "@type": "Question",
              name: "How do I calculate my cycling power-to-weight ratio?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Divide your FTP (Functional Threshold Power) in watts by your body weight in kilograms. For example, a rider with a 260W FTP weighing 75kg has a W/kg of 3.47. Competitive amateur road racers typically need 3.5-4.5 W/kg, while professional riders are often above 5.5 W/kg. You can improve your ratio by increasing FTP through training, reducing excess body fat, or both.",
              },
            },
            {
              "@type": "Question",
              name: "How fast should I lose weight for cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The safe and sustainable rate is a maximum of 0.5% of your body weight per week — roughly 0.3-0.5kg per week for most cyclists. Faster weight loss risks muscle loss, reduced power output, hormonal disruption, and increased illness risk. Focus on food quality and protein adequacy (1.6-2.2g/kg/day) rather than severe calorie restriction, and always fuel your key training sessions properly.",
              },
            },
            {
              "@type": "Question",
              name: "What body fat percentage do professional cyclists have?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Male professional cyclists typically race at 6-10% body fat, while female professionals are usually 12-18%. However, these figures are maintained only during peak racing season under professional medical supervision. Amateur cyclists should not target professional body fat levels — the health risks outweigh the marginal performance gains. A competitive amateur male at 10-14% or female at 18-24% is in an excellent range.",
              },
            },
            {
              "@type": "Question",
              name: "Is BMI useful for cyclists?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "BMI is a poor metric for cyclists because it does not distinguish between muscle and fat. A muscular cyclist with low body fat can have the same BMI as a sedentary person with high body fat. Body composition — your ratio of lean mass to fat mass — is far more relevant. Tools like DEXA scans, bioelectrical impedance scales, or caliper tests give a more useful picture of your physique for cycling performance.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
