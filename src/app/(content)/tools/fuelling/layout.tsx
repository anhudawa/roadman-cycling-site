import type { Metadata } from "next";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { JsonLd } from "@/components/seo/JsonLd";
import { SoftwareApplicationSchema } from "@/components/seo/SoftwareApplicationSchema";

export const metadata: Metadata = {
  title: "In-Ride Fuelling Calculator — Carbs Per Hour for Cycling",
  description:
    "Calculate exactly how many carbs and how much fluid you need per hour while cycling. Based on ride duration, intensity, and body weight.",
  keywords: ["cycling fuelling calculator", "carbs per hour cycling", "cycling nutrition calculator", "in ride nutrition"],
  alternates: { canonical: "https://roadmancycling.com/tools/fuelling" },
  openGraph: {
    title: "In-Ride Fuelling Calculator — Carbs Per Hour for Cycling",
    description:
      "Calculate exactly how many carbs and how much fluid you need per hour while cycling. Based on ride duration, intensity, and body weight.",
    type: "website",
    url: "https://roadmancycling.com/tools/fuelling",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SoftwareApplicationSchema
        name="Cycling In-Ride Fuelling Calculator"
        description="Calculate carbs per hour, fluid needs, and sodium requirements for any cycling session based on ride duration, intensity, and body weight."
        url="https://roadmancycling.com/tools/fuelling"
        features={[
          "Carbs-per-hour based on duration and intensity",
          "Fluid-loss estimates by conditions",
          "Sodium targets for long rides",
          "Race-specific fuelling presets",
        ]}
      />
      <HowToSchema
        name="How to Calculate In-Ride Fuelling"
        description="Calculate your optimal carbohydrate intake, fluid requirements, and sodium needs per hour for cycling based on ride duration, intensity, and body weight."
        totalTime="PT2M"
        steps={[
          { name: "Enter ride duration", text: "Input your planned ride duration in minutes. Fuelling needs scale significantly with duration — rides under 60 minutes need minimal fuelling, while rides over 3 hours require a structured plan." },
          { name: "Select ride intensity", text: "Choose your ride intensity level: easy (Zone 2), moderate (Zone 3), hard (Zone 4-5), or race effort. Higher intensity increases carbohydrate oxidation rates and fluid loss." },
          { name: "Enter your body weight", text: "Input your body weight in kilograms. Fluid requirements are calculated relative to body weight at 6-10ml/kg/hr depending on intensity." },
          { name: "Follow your fuelling plan", text: "The calculator outputs carbs per hour, fluid per hour, total carbs, and sodium recommendations. For rides over 90 minutes, use dual-source carbs (glucose and fructose at 1:0.8 ratio) to absorb up to 120g per hour." },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://roadmancycling.com" },
            { "@type": "ListItem", position: 2, name: "Tools", item: "https://roadmancycling.com/tools" },
            { "@type": "ListItem", position: 3, name: "In-Ride Fuelling Calculator", item: "https://roadmancycling.com/tools/fuelling" },
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
              name: "How many carbs do I need per hour while cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Carbohydrate needs depend on ride intensity and duration. For easy Zone 2 rides, 30-60g per hour is sufficient. For high-intensity efforts and racing, aim for 60-90g per hour, or up to 120g per hour if you have trained your gut and use a dual-source carbohydrate mix (glucose and fructose at a 1:0.8 ratio). Rides under 60 minutes generally do not require carbohydrate intake.",
              },
            },
            {
              "@type": "Question",
              name: "What should I eat before a bike ride?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Eat a carbohydrate-rich meal 2-3 hours before riding — for example, porridge with banana, toast with jam, or rice with a light protein source. Aim for 1-3g of carbs per kilogram of body weight. Avoid high-fat and high-fibre foods close to ride time as they slow digestion. If you only have 30-60 minutes, a small snack like a banana or energy bar is enough.",
              },
            },
            {
              "@type": "Question",
              name: "What is the glucose to fructose ratio for cycling nutrition?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The optimal ratio is 1:0.8 (glucose to fructose), based on Professor Asker Jeukendrup's dual-transporter research. Glucose and fructose use different intestinal transporters (SGLT1 and GLUT5), so combining them allows your gut to absorb more total carbohydrate per hour — up to 120g/hr with a trained gut versus roughly 60g/hr from glucose alone. Most modern cycling nutrition products use this ratio.",
              },
            },
            {
              "@type": "Question",
              name: "How much water should I drink while cycling?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A general guideline is 500-750ml per hour in mild conditions, increasing to 750-1000ml per hour in hot or humid weather. A more precise approach is to weigh yourself before and after a ride — each kilogram lost represents roughly 1 litre of fluid deficit. Add electrolytes (particularly sodium at 300-600mg per 500ml) to improve fluid absorption and replace sweat losses.",
              },
            },
            {
              "@type": "Question",
              name: "What is gut training for cycling and how do I do it?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Gut training is the process of gradually increasing the amount of carbohydrate you consume during exercise so your intestines adapt to absorb more. Start at 40-60g per hour and increase by 10-15g per week during training rides. Within 4-6 weeks, most cyclists can tolerate 80-100g per hour. Practice with the same products you plan to use in races. A trained gut can absorb up to 120g per hour using dual-source carbohydrates.",
              },
            },
            {
              "@type": "Question",
              name: "Do I need to eat on rides under 90 minutes?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For easy rides under 60-90 minutes, you generally do not need to eat — your muscle glycogen stores are sufficient. However, if the ride includes high-intensity intervals or you are doing multiple sessions in a day, having 30-40g of carbs per hour can help maintain performance. For races or hard group rides under 90 minutes, a carbohydrate mouth rinse or small intake can still provide a performance benefit through central nervous system signalling.",
              },
            },
          ],
        }}
      />
      {children}
    </>
  );
}
