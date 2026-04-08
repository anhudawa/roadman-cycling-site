"use client";

import { useState, type FormEvent } from "react";

interface EmailCaptureProps {
  variant?: "inline" | "banner" | "minimal";
  heading?: string;
  subheading?: string;
  buttonText?: string;
  source?: string;
  className?: string;
}

export function EmailCapture({
  variant = "inline",
  heading = "THE SATURDAY SPIN NEWSLETTER",
  subheading = "One email every Saturday. What the best coaches and scientists said this week — translated into stuff you can actually use on the bike.",
  buttonText = "SUBSCRIBE",
  source = "website",
  className = "",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!consent) {
      setStatus("error");
      setMessage("Please agree to receive our newsletter.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, consent: true }),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("You're in. Check your inbox.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Try again.");
    }
  };

  if (variant === "minimal") {
    return (
      <div className={className}>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            aria-label="Email address"
            placeholder="Your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            className="
              flex-1 bg-white/5 border border-white/10 rounded-md px-3 py-2
              text-sm text-off-white placeholder:text-foreground-subtle
              focus:border-coral focus:outline-none transition-colors
            "
            style={{ transitionDuration: "var(--duration-fast)" }}
            disabled={status === "loading"}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="
              font-heading text-sm tracking-wider
              bg-coral hover:bg-coral-hover disabled:opacity-50
              text-off-white px-4 py-2 rounded-md
              transition-colors shrink-0 cursor-pointer
            "
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            {status === "loading" ? "..." : buttonText}
          </button>
        </form>
        <label className="flex items-start gap-1.5 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              if (status === "error") setStatus("idle");
            }}
            className="accent-coral mt-0.5 w-3.5 h-3.5 shrink-0 cursor-pointer"
          />
          <span className="text-xs text-foreground-muted leading-tight">
            I agree to receive The Saturday Spin Newsletter and accept the{" "}
            <a href="/privacy" className="text-coral hover:underline">Privacy Policy</a>
          </span>
        </label>
        {status === "success" && (
          <span className="text-xs text-green-400 mt-1 block">{message}</span>
        )}
        {status === "error" && (
          <p className="text-red-400 text-xs mt-1" role="alert">{message}</p>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={`bg-coral py-16 md:py-20 ${className}`}>
        <div className="mx-auto max-w-[1200px] px-5 md:px-8 text-center">
          <h2
            className="font-heading text-off-white mb-4"
            style={{ fontSize: "var(--text-section)" }}
          >
            {heading}
          </h2>
          {subheading && (
            <p className="text-off-white max-w-lg mx-auto mb-8">
              {subheading}
            </p>
          )}

          {status === "success" ? (
            <p className="font-heading text-xl text-off-white">{message}</p>
          ) : (
            <>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              >
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "idle") setStatus("idle");
                  }}
                  className="
                    flex-1 bg-white/20 border border-white/30 rounded-md px-4 py-3
                    text-off-white placeholder:text-off-white/70
                    focus:border-white focus:outline-none transition-colors
                  "
                  style={{ transitionDuration: "var(--duration-fast)" }}
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="
                    font-heading tracking-wider
                    bg-charcoal hover:bg-deep-purple disabled:opacity-50
                    text-off-white px-8 py-3 rounded-md
                    transition-colors shrink-0 cursor-pointer
                  "
                  style={{ transitionDuration: "var(--duration-fast)" }}
                >
                  {status === "loading" ? "SUBSCRIBING..." : buttonText}
                </button>
              </form>
              <label className="flex items-center gap-2 mt-3 max-w-md mx-auto cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (status === "error") setStatus("idle");
                  }}
                  className="accent-coral w-4 h-4 shrink-0 cursor-pointer"
                />
                <span className="text-sm text-off-white/80 text-left">
                  I agree to receive The Saturday Spin Newsletter and accept the{" "}
                  <a href="/privacy" className="underline hover:text-off-white">Privacy Policy</a>
                </span>
              </label>
              {status === "error" && (
                <p className="text-off-white text-sm mt-3" role="alert">{message}</p>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Default: inline
  return (
    <div
      className={`bg-background-elevated rounded-xl border border-white/5 p-8 ${className}`}
    >
      <h3 className="font-heading text-2xl text-off-white mb-2">{heading}</h3>
      {subheading && (
        <p className="text-foreground-muted mb-6">{subheading}</p>
      )}

      {status === "success" ? (
        <p className="text-green-400 font-medium">{message}</p>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
                className="
                  flex-1 bg-white/5 border border-white/10 rounded-md px-4 py-3
                  text-off-white placeholder:text-foreground-subtle
                  focus:border-coral focus:outline-none transition-colors
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
                disabled={status === "loading"}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="
                  font-heading tracking-wider
                  bg-coral hover:bg-coral-hover disabled:opacity-50
                  text-off-white px-8 py-3 rounded-md
                  transition-colors shrink-0 cursor-pointer
                "
                style={{ transitionDuration: "var(--duration-fast)" }}
              >
                {status === "loading" ? "..." : buttonText}
              </button>
            </div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked);
                  if (status === "error") setStatus("idle");
                }}
                className="accent-coral mt-0.5 w-4 h-4 shrink-0 cursor-pointer"
              />
              <span className="text-sm text-foreground-muted">
                I agree to receive The Saturday Spin Newsletter and accept the{" "}
                <a href="/privacy" className="text-coral hover:underline">Privacy Policy</a>
              </span>
            </label>
          </form>
          {status === "error" && (
            <p className="text-red-400 text-sm mt-2" role="alert">{message}</p>
          )}
        </>
      )}
    </div>
  );
}
