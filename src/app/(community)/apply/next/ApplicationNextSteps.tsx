"use client";

import { useEffect, useRef, useState } from "react";
import { NDY_APPLICATION_OFFER as offer } from "@/lib/ndy/application-offer";
import {
  APPLICATION_DECISION_HAPTIC_PATTERN,
  APPLICATION_REVIEW_HAPTIC_MS,
  APPLICATION_REVIEW_STEPS,
  APPLICATION_REVIEW_STEP_MS,
  triggerApplicationHaptic,
} from "./application-review";

export function ApplicationNextSteps() {
  const [token, setToken] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState<"join" | "questions" | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [reviewStep, setReviewStep] = useState(0);
  const [reviewComplete, setReviewComplete] = useState(false);
  const questionInput = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const [, value] = window.location.hash.slice(1).split("/");
    if (value && /^[a-f0-9]{64}$/.test(value)) setToken(value);
  }, []);

  useEffect(() => {
    const timers = APPLICATION_REVIEW_STEPS.slice(1).map((_, index) => window.setTimeout(
      () => {
        setReviewStep(index + 1);
        triggerApplicationHaptic(APPLICATION_REVIEW_HAPTIC_MS);
      },
      (index + 1) * APPLICATION_REVIEW_STEP_MS,
    ));
    const completionTimer = window.setTimeout(
      () => {
        setReviewComplete(true);
        triggerApplicationHaptic(APPLICATION_DECISION_HAPTIC_PATTERN);
      },
      APPLICATION_REVIEW_STEPS.length * APPLICATION_REVIEW_STEP_MS,
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(completionTimer);
    };
  }, []);

  useEffect(() => {
    if (reviewComplete && token && window.location.hash.startsWith("#questions/")) questionInput.current?.focus();
  }, [reviewComplete, token]);

  async function act(action: "join" | "questions") {
    if (busy) return;
    setBusy(action); setError("");
    try {
      const res = await fetch("/api/cohort/next", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action, ...(action === "questions" ? { question } : {}) }),
      });
      const data = await res.json() as { error?: string; checkoutUrl?: string };
      if (!res.ok) throw new Error(data.error ?? "Please try again.");
      if (action === "join") {
        if (data.checkoutUrl !== offer.checkoutUrl) throw new Error("Please open the programme page below to join.");
        window.location.assign(data.checkoutUrl);
      } else setSaved(true);
    } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(null); }
  }

  if (!reviewComplete) {
    const progress = ((reviewStep + 1) / APPLICATION_REVIEW_STEPS.length) * 100;
    return <section aria-labelledby="application-review-heading" className="mt-10 flex min-h-[30rem] items-center">
      <div className="w-full rounded-2xl border border-coral/35 bg-white/[0.04] p-6 text-center shadow-2xl shadow-black/15 sm:p-10">
        <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-coral/30 bg-coral/10">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-coral/25 border-t-coral motion-reduce:animate-none" />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-coral">Application review</p>
        <h1 id="application-review-heading" className="mt-3 font-heading text-4xl sm:text-5xl">ONE MOMENT</h1>
        <p role="status" aria-live="polite" aria-atomic="true" className="mx-auto mt-5 min-h-14 max-w-md text-lg leading-7 text-off-white">
          <span key={reviewStep} className="block w-full animate-pulse motion-reduce:animate-none">{APPLICATION_REVIEW_STEPS[reviewStep]}</span>
        </p>
        <div aria-hidden="true" className="mx-auto mt-6 h-1.5 max-w-sm overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-coral transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-5 text-sm text-foreground-muted">This should only take a few seconds.</p>
      </div>
    </section>;
  }

  return <div className="mt-10 space-y-6">
    <header className="pb-3">
      <div aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full border border-coral/35 bg-coral/10 text-2xl text-coral">✓</div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-coral">Application approved</p>
      <h1 className="mt-3 font-heading text-4xl sm:text-5xl">CONGRATULATIONS</h1>
      <p className="mt-5 text-xl leading-8 text-off-white">Your application has been approved.</p>
      <p className="mt-3 max-w-xl text-base leading-7 text-foreground-muted">If you’re ready to get going, you can start right now.</p>
    </header>

    <section className="rounded-xl border border-coral/40 bg-white/[0.04] p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral font-heading text-lg text-deep-purple">1</span>
        <div>
          <h2 className="font-heading text-2xl">JOIN NOT DONE YET</h2>
          <p className="mt-3 text-base leading-7 text-foreground-muted">Start your seven-day free trial in Skool. You won’t be charged until the trial ends. After that, coaching is <strong className="text-off-white">{offer.price}</strong>, plus applicable taxes.</p>
        </div>
      </div>
      {token ? <button type="button" disabled={Boolean(busy)} onClick={() => void act("join")} className="mt-6 min-h-12 w-full rounded-md bg-coral px-5 py-3 font-semibold text-deep-purple disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral">
        {busy === "join" ? "Opening Skool…" : "Get started in Skool"}
      </button> : <a href={offer.checkoutUrl} rel="noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-coral px-5 py-3 text-center font-semibold text-deep-purple">Start my 7-day free trial</a>}
      <a className="mt-3 inline-block whitespace-nowrap text-sm text-coral underline underline-offset-4" href={offer.aboutUrl} target="_blank" rel="noreferrer">See what’s included</a>
    </section>

    <section className="rounded-xl border border-white/15 p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-coral/50 font-heading text-lg text-coral">2</span>
        <div>
          <h2 className="font-heading text-2xl">BOOK YOUR ONBOARDING CALL</h2>
          <p className="mt-3 text-base leading-7 text-foreground-muted">Once you’re inside Skool, we’ll reach out to book a time for your onboarding call and help you get set up.</p>
        </div>
      </div>
    </section>

    <section className="rounded-xl border border-white/15 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">Not ready to start today?</p>
      <h2 className="mt-3 font-heading text-2xl">TALK TO SARAH</h2>
      <p className="mt-3 text-base leading-7 text-foreground-muted">Sarah can hold your place, arrange a later start, or answer any questions you have about the programme.</p>
      {saved ? <p role="status" className="mt-4 text-base leading-7">Your question is saved for Sarah. She’ll reply by email.</p> : token ? <form onSubmit={(event) => { event.preventDefault(); void act("questions"); }}>
        <label htmlFor="ndy-question" className="mt-5 block text-base text-foreground-muted">What would you like Sarah to help with?</label>
        <textarea ref={questionInput} id="ndy-question" required minLength={3} maxLength={2000} rows={4} value={question} onChange={(event) => setQuestion(event.target.value)}
          className="mt-3 w-full rounded-md border border-white/20 bg-white/5 p-3 text-base leading-6 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral" />
        <button type="submit" disabled={Boolean(busy)} className="mt-4 min-h-12 w-full rounded-md border border-coral px-5 py-3 font-semibold text-coral disabled:opacity-50">{busy === "questions" ? "Sending your message…" : "Send Sarah a message"}</button>
        <p className="mt-3 text-sm leading-6 text-foreground-muted">Your message will be saved in Sarah’s review queue with your application. Anthony receives the alert email.</p>
      </form> : <p className="mt-4 text-base leading-7 text-foreground-muted">Open the personal link in your application email to send a question linked to your application.</p>}
      <p className="mt-4 break-words text-sm leading-6 text-foreground-muted">Or email Sarah directly at <a className="text-coral underline" href={`mailto:${offer.sarahEmail}`}>{offer.sarahEmail}</a>.</p>
    </section>

    <footer className="border-t border-white/10 pt-7 text-base leading-7 text-foreground-muted">
      <p>Looking forward to working with you.</p>
      <p className="mt-2 font-semibold text-off-white">Anthony</p>
    </footer>
    {error && <p role="alert" className="rounded-md border border-red-400/40 p-4 text-base text-red-200">{error}</p>}
  </div>;
}
