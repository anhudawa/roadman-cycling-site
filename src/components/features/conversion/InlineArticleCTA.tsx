"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
import { EmailCapture } from "./EmailCapture";
import type { ContentPillar } from "@/types";

/**
 * Pillar-aware inline email CTA that injects itself after the 3rd paragraph
 * of a blog article. Uses a portal to mount inside the prose container
 * without breaking the server-rendered MDX content.
 */

const PILLAR_CTA: Record<ContentPillar, { heading: string; subheading: string }> = {
  coaching: {
    heading: "GET TRAINING TIPS THAT ACTUALLY WORK",
    subheading: "Evidence-based training insights from the podcast $€” delivered every Saturday morning.",
  },
  nutrition: {
    heading: "GET SMARTER ABOUT FUELLING",
    subheading: "Nutrition science translated into what to eat, when, and why. Every Saturday.",
  },
  strength: {
    heading: "STRENGTH TIPS FOR CYCLISTS",
    subheading: "S&C advice built for riders, not gym bros. One email every Saturday.",
  },
  recovery: {
    heading: "RECOVER SMARTER, RIDE STRONGER",
    subheading: "Sleep, stress, and recovery protocols from the world's best coaches. Every Saturday.",
  },
  community: {
    heading: "MORE FROM THE WORLD OF CYCLING",
    subheading: "The culture, the craft, and the unwritten rules. The Saturday Spin Newsletter, every week.",
  },
};

interface InlineArticleCTAProps {
  pillar: ContentPillar;
  source: string;
  /** CSS selector for the prose container to inject into */
  containerSelector?: string;
  /** Which paragraph to insert after (0-indexed). Defaults to 2 (after 3rd paragraph). */
  afterParagraph?: number;
}

export function InlineArticleCTA({
  pillar,
  source,
  containerSelector = ".prose-roadman",
  afterParagraph = 2,
}: InlineArticleCTAProps) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const injectedRef = useRef(false);

  useEffect(() => {
    if (injectedRef.current) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Find direct child paragraphs (skip paragraphs inside blockquotes, lists, etc.)
    const paragraphs = Array.from(container.querySelectorAll(":scope > p"));

    // Need enough paragraphs to justify an inline CTA
    if (paragraphs.length < afterParagraph + 2) return;

    const targetParagraph = paragraphs[afterParagraph];
    if (!targetParagraph) return;

    // Create a mount point
    const wrapper = document.createElement("div");
    wrapper.setAttribute("data-inline-cta", "true");
    wrapper.className = "my-10 not-prose";

    // Insert after the target paragraph
    targetParagraph.after(wrapper);
    setMountNode(wrapper);
    injectedRef.current = true;
  }, [containerSelector, afterParagraph]);

  const cta = PILLAR_CTA[pillar] || PILLAR_CTA.coaching;

  if (!mountNode) return null;

  return createPortal(
    <EmailCapture
      variant="inline"
      heading={cta.heading}
      subheading={cta.subheading}
      source={source}
      buttonText="SUBSCRIBE"
    />,
    mountNode
  );
}
