import { type ContentPillar, CONTENT_PILLARS } from "@/types";

interface BadgeProps {
  pillar: ContentPillar;
  size?: "sm" | "md";
}

export function Badge({ pillar, size = "sm" }: BadgeProps) {
  const { label, color } = CONTENT_PILLARS[pillar];

  return (
    <span
      className={`
        inline-flex items-center font-body font-medium rounded-full
        ${size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1"}
      `}
      style={{
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        color: color,
        border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
