"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PDF_URL = "/downloads/faster-after-40-report.pdf";

export default function FA40NewsletterLanding() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(PDF_URL);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanEmail = email.trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const params = new URLSearchParams(window.location.search);
    const source = params.get("source")?.trim() || "named_pdf";
    const utmSource = params.get("utm_source")?.trim();
    const utmMedium = params.get("utm_medium")?.trim();
    const utmCampaign = params.get("utm_campaign")?.trim();

    try {
      const response = await fetch("/api/faster-after-40", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          ...(firstName.trim() ? { firstName: firstName.trim() } : {}),
          source,
          ...(utmSource ? { utm_source: utmSource } : {}),
          ...(utmMedium ? { utm_medium: utmMedium } : {}),
          ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Try again.");
      }

      setDownloadUrl(data.downloadUrl || PDF_URL);
      setStatus("success");
      setMessage("You're in. Your report is ready below.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong. Try again.");
    }
  };

  return (
    <main className="min-h-screen bg-deep-purple text-off-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5 md:px-8">
          <Link
            href="/"
            className="font-heading text-sm uppercase tracking-[0.18em] text-off-white/70 hover:text-off-white"
          >
            Roadman Cycling
          </Link>
          <Link
            href="/newsletter"
            className="text-sm text-coral hover:text-coral-hover"
          >
            The Saturday Spin
          </Link>
        </div>
      </header>

      <section className="border-b border-white/10 bg-deep-purple px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 font-heading text-sm uppercase tracking-[0.18em] text-coral">
            Free cycling report
          </p>
          <h1 className="font-heading text-5xl uppercase leading-[0.95] tracking-tight md:text-7xl">
            Faster After 40
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-off-white/70 md:text-xl">
            A practical Roadman Cycling report for riders who want to keep
            training with intent as they get older — covering training,
            fuelling, strength, recovery, and the habits that support better riding.
          </p>

          <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-left md:p-8">
            {status === "success" ? (
              <div className="text-center">
                <p className="font-heading text-2xl uppercase text-off-white">
                  Report ready
                </p>
                <p className="mt-3 text-sm leading-relaxed text-off-white/65">
                  {message} You&apos;re also subscribed to The Saturday Spin — one useful training letter every Saturday.
                </p>
                <a
                  href={downloadUrl}
                  download
                  className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-coral px-6 py-4 font-heading tracking-wider text-off-white transition-colors hover:bg-coral-hover"
                >
                  DOWNLOAD THE REPORT
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                <label className="block">
                  <span className="sr-only">First name</span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name (optional)"
                    autoComplete="given-name"
                    className="w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-off-white placeholder:text-off-white/35 focus:border-coral focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="sr-only">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (status === "error") setStatus("idle");
                    }}
                    placeholder="Email address"
                    autoComplete="email"
                    required
                    className="w-full rounded-md border border-white/10 bg-white/[0.06] px-4 py-3 text-off-white placeholder:text-off-white/35 focus:border-coral focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full rounded-md bg-coral px-6 py-4 font-heading tracking-wider text-off-white transition-colors hover:bg-coral-hover disabled:opacity-60"
                >
                  {status === "loading" ? "SENDING…" : "GET THE FREE REPORT"}
                </button>
                {status === "error" && (
                  <p className="text-center text-sm text-coral" role="alert">
                    {message}
                  </p>
                )}
                <p className="pt-2 text-center text-xs leading-relaxed text-off-white/45">
                  Get the report and join The Saturday Spin. One useful training letter every Saturday. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      <section className="bg-charcoal px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-heading text-3xl uppercase md:text-4xl">
            What the report covers
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              ["Training", "How to think about intensity, structure, and making limited training time count."],
              ["Fuelling", "How fuelling and body-composition goals interact with performance and recovery."],
              ["Strength", "Why off-bike strength work belongs in a long-term cycling plan."],
              ["Recovery", "How sleep, life stress, and recovery affect whether training becomes adaptation."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
                <h3 className="font-heading text-xl uppercase text-coral">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-off-white/65">{copy}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-relaxed text-off-white/50">
            The report is educational content from Roadman Cycling. It is not personalised coaching or medical advice.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 text-center md:px-8 md:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="font-heading text-sm uppercase tracking-[0.16em] text-coral">
            After the report
          </p>
          <h2 className="mt-3 font-heading text-3xl uppercase md:text-4xl">
            Keep the useful part coming
          </h2>
          <p className="mt-5 text-base leading-relaxed text-off-white/65">
            The Saturday Spin is one training letter every Saturday: one idea,
            why it matters, and something you can use on the bike that week.
          </p>
          <Link
            href="/newsletter?source=named_pdf"
            className="mt-7 inline-flex items-center justify-center rounded-md border border-coral px-6 py-3 font-heading text-sm tracking-wider text-coral hover:bg-coral hover:text-off-white"
          >
            ABOUT THE SATURDAY SPIN
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-8 text-center text-xs text-off-white/40 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span>© 2026 Roadman Cycling</span>
          <Link href="/privacy" className="hover:text-off-white">Privacy</Link>
          <Link href="/terms" className="hover:text-off-white">Terms</Link>
        </div>
      </footer>
    </main>
  );
}
