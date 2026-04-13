import { type ContentPillar, CONTENT_PILLARS } from "@/types";

interface AnswerCapsuleProps {
  text: string;
  pillar: ContentPillar;
}

export function AnswerCapsule({ text, pillar }: AnswerCapsuleProps) {
  const { color } = CONTENT_PILLARS[pillar];

  return (
    <div
      className="rounded-lg p-5 mb-8"
      style={{
        borderLeft: `3px solid ${color}`,
        backgroundColor: `color-mix(in srgb, ${color} 5%, var(--color-charcoal))`,
      }}
    >
      <p className="text-off-white text-base leading-relaxed font-body m-0">
        {text}
      </p>
    </div>
  );
}
