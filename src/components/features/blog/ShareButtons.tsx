"use client";

import { useState, useCallback } from "react";
import { track } from "@/lib/analytics/events";

interface ShareButtonsProps {
  title: string;
  slug: string;
  className?: string;
}

type ShareChannel = "twitter" | "facebook" | "email" | "copy" | "other";

// X (Twitter), WhatsApp, LinkedIn, Facebook — coerce all of them onto the
// share_clicked channel union. We don't expand the union for every
// network; "other" is the catch-all so the funnel chart stays readable.
function classifyChannel(label: string): ShareChannel {
  if (label.includes("X") || label.toLowerCase().includes("twitter")) return "twitter";
  if (label.toLowerCase().includes("facebook")) return "facebook";
  if (label.toLowerCase().includes("email")) return "email";
  return "other";
}

export function ShareButtons({ title, slug, className = "" }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const url = `https://roadmancycling.com/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopyLink = async () => {
    track("share_clicked", { channel: "copy", url });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = useCallback(async () => {
    track("share_clicked", { channel: "other" as ShareChannel, url });
    try {
      await navigator.share({ title, url });
    } catch {
      // User cancelled or share failed — no-op
    }
  }, [title, url]);

  const shareLinks = [
    {
      label: "Share on X",
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&via=Roadman_Podcast`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <nav aria-label="Share this article" className={`flex items-center gap-3 ${className}`}>
      <span className="text-xs text-foreground-subtle uppercase tracking-widest font-heading" aria-hidden="true">
        Share
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          aria-label={link.label}
          onClick={() => track("share_clicked", { channel: classifyChannel(link.label), url })}
          className="
            hidden sm:inline-flex items-center justify-center w-11 h-11
            bg-white/5 border border-white/10 rounded-lg
            text-foreground-muted
            hover:bg-white/10 hover:border-white/20 hover:text-off-white
            transition-all
          "
          style={{ transitionDuration: "var(--duration-fast)" }}
        >
          {link.icon}
        </a>
      ))}
      {/* Mobile: native Web Share API button (replaces individual share links) */}
      <button
        onClick={handleNativeShare}
        title="Share this article"
        aria-label="Share this article"
        className="
          sm:hidden inline-flex items-center justify-center w-11 h-11
          bg-white/5 border border-white/10 rounded-lg
          text-foreground-muted cursor-pointer
          hover:bg-white/10 hover:border-white/20 hover:text-off-white
          transition-all
        "
        style={{ transitionDuration: "var(--duration-fast)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
      <button
        onClick={handleCopyLink}
        title={copied ? "Copied!" : "Copy link"}
        aria-label={copied ? "Link copied" : "Copy link"}
        aria-live="polite"
        className="
          inline-flex items-center justify-center w-9 h-9
          bg-white/5 border border-white/10 rounded-lg
          text-foreground-muted cursor-pointer
          hover:bg-white/10 hover:border-white/20 hover:text-off-white
          transition-all
        "
        style={{ transitionDuration: "var(--duration-fast)" }}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-green-400" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        )}
      </button>
    </nav>
  );
}
