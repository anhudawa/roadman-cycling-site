import { JsonLd } from "./JsonLd";

interface Step {
  name: string;
  text: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: Step[];
  totalTime?: string; // ISO 8601 duration, e.g. "PT5M"
}

/**
 * HowTo structured data for Google rich results.
 * Perfect for calculator pages and step-by-step guides.
 */
export function HowToSchema({ name, description, steps, totalTime }: HowToSchemaProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "HowTo",
        name,
        description,
        ...(totalTime && { totalTime }),
        step: steps.map((step, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: step.name,
          text: step.text,
        })),
      }}
    />
  );
}
