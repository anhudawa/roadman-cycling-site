"use client";

import type { AskCta } from "@/app/(marketing)/ask/use-ask-stream";

interface CtaCardProps {
  cta: AskCta;
  sessionId?: string | null;
  messageId?: string | null;
}

export function CtaCard({ cta, sessionId, messageId }: CtaCardProps) {
  if (cta.key === "none") return null;

  const isExternal = cta.href.startsWith("http");
  const onClick = () => {
    try {
      fetch("/api/ask/cta-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionId ?? undefined,
          messageId: messageId ?? undefined,
          ctaKey: cta.key,
          href: cta.href,
        }),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // analytics should never block the click
    }
  };

  return (
    <div className="rounded-xl border border-coral/30 bg-coral/[0.06] p-5 mt-4">
      <p className="font-heading text-coral tracking-widest text-xs uppercase mb-2">
        Next step
      </p>
      <h4 className="font-heading text-off-white text-lg mb-1">{cta.title}</h4>
      <p className="text-foreground-muted text-sm mb-4 leading-relaxed">
        {cta.body}
      </p>
      <a
        href={cta.href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        onClick={onClick}
        className="inline-block font-heading tracking-wider uppercase bg-coral hover:bg-coral-hover text-off-white text-sm px-5 py-2.5 rounded-md transition-colors"
      >
        Go there
      </a>
    </div>
  );
}
