"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NDY_APPLICATION_OFFER as offer } from "@/lib/ndy/application-offer";
import {
  APPLICATION_CHECKING_MESSAGE,
  APPLICATION_DECISION_HAPTIC_PATTERN,
  readApplicationDecision,
  triggerApplicationHaptic,
  type ApplicationDecisionView,
} from "./application-review";

export function ApplicationNextSteps() {
  const [token, setToken] = useState("");
  const [decision, setDecision] = useState<ApplicationDecisionView>("checking");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState<"join" | "questions" | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const questionInput = useRef<HTMLTextAreaElement>(null);

  // The token lives in the fragment so it never reaches an access log or a
  // referrer header, which also means the server cannot read it while
  // rendering. The page therefore starts closed and asks the server for the
  // decision; it never infers one from the token's presence.
  useEffect(() => {
    const [, value] = window.location.hash.slice(1).split("/");
    const candidate = value && /^[a-f0-9]{64}$/.test(value) ? value : "";
    setToken(candidate);
    if (!candidate) { setDecision("invalid"); return; }
    const controller = new AbortController();
    void (async () => {
      try {
        const res = await fetch("/api/cohort/application-status", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: candidate }), signal: controller.signal,
        });
        const data = await res.json() as { state?: unknown };
        // A non-OK response is never an approval, whatever it carries.
        const next = res.ok ? readApplicationDecision(data.state) : "pending";
        setDecision(next);
        if (next === "approved") triggerApplicationHaptic(APPLICATION_DECISION_HAPTIC_PATTERN);
      } catch (err) {
        // An aborted check must leave the page as it was, not fall back to a
        // decision for an application we never finished looking up.
        if ((err as Error)?.name !== "AbortError") setDecision("pending");
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (decision !== "checking" && token && window.location.hash.startsWith("#questions/")) questionInput.current?.focus();
  }, [decision, token]);

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

  const errorNotice = error
    ? <p role="alert" className="rounded-md border border-red-400/40 p-4 text-base text-red-200">{error}</p>
    : null;

  // Sarah is reachable at every stage, so an applicant waiting on a decision
  // still has a way through. Only an application we can tie to a live token
  // can post into her queue; everyone else gets her email address.
  const talkToSarah = (blurb: string) => <section className="rounded-xl border border-white/15 p-6 sm:p-8">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">Questions in the meantime?</p>
    <h2 className="mt-3 font-heading text-2xl">TALK TO SARAH</h2>
    <p className="mt-3 text-base leading-7 text-foreground-muted">{blurb}</p>
    {saved ? <p role="status" className="mt-4 text-base leading-7">Your question is saved for Sarah. She’ll reply by email.</p> : token ? <form onSubmit={(event) => { event.preventDefault(); void act("questions"); }}>
      <label htmlFor="ndy-question" className="mt-5 block text-base text-foreground-muted">What would you like Sarah to help with?</label>
      <textarea ref={questionInput} id="ndy-question" required minLength={3} maxLength={2000} rows={4} value={question} onChange={(event) => setQuestion(event.target.value)}
        className="mt-3 w-full rounded-md border border-white/20 bg-white/5 p-3 text-base leading-6 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral" />
      <button type="submit" disabled={Boolean(busy)} className="mt-4 min-h-12 w-full rounded-md border border-coral px-5 py-3 font-semibold text-coral disabled:opacity-50">{busy === "questions" ? "Sending your message…" : "Send Sarah a message"}</button>
      <p className="mt-3 text-sm leading-6 text-foreground-muted">Your message will be saved in Sarah’s review queue with your application. Anthony receives the alert email.</p>
    </form> : <p className="mt-4 text-base leading-7 text-foreground-muted">Open the personal link in your application email to send a question linked to your application.</p>}
    <p className="mt-4 break-words text-sm leading-6 text-foreground-muted">Or email Sarah directly at <a className="text-coral underline" href={`mailto:${offer.sarahEmail}`}>{offer.sarahEmail}</a>.</p>
  </section>;

  const signOff = <footer className="border-t border-white/10 pt-7 text-base leading-7 text-foreground-muted">
    <p>Looking forward to working with you.</p>
    <p className="mt-2 font-semibold text-off-white">Anthony</p>
  </footer>;

  if (decision === "checking") {
    return <section aria-labelledby="application-review-heading" className="mt-10 flex min-h-[30rem] items-center">
      <div className="w-full rounded-2xl border border-coral/35 bg-white/[0.04] p-6 text-center shadow-2xl shadow-black/15 sm:p-10">
        <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-coral/30 bg-coral/10">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-coral/25 border-t-coral motion-reduce:animate-none" />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.24em] text-coral">Application review</p>
        <h1 id="application-review-heading" className="mt-3 font-heading text-4xl sm:text-5xl">ONE MOMENT</h1>
        <p role="status" aria-live="polite" aria-atomic="true" className="mx-auto mt-5 min-h-14 max-w-md text-lg leading-7 text-off-white">{APPLICATION_CHECKING_MESSAGE}</p>
      </div>
    </section>;
  }

  if (decision !== "approved") {
    // Fail closed. No decision, no Skool link, no checkout — a direct visit to
    // this page cannot talk anyone into paying for an unreviewed application.
    const unmatched = decision === "invalid";
    return <div className="mt-10 space-y-6">
      <header className="pb-3">
        <div aria-hidden="true" className="flex h-14 w-14 items-center justify-center rounded-full border border-coral/35 bg-coral/10 text-2xl text-coral">⏳</div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-coral">Application review</p>
        <h1 className="mt-3 font-heading text-4xl sm:text-5xl">{unmatched ? "CHECK YOUR LINK" : "UNDER REVIEW"}</h1>
        {unmatched ? <>
          <p className="mt-5 text-xl leading-8 text-off-white">We can’t match this page to an application.</p>
          <p className="mt-3 max-w-xl text-base leading-7 text-foreground-muted">If you’ve already applied, open the personal link in your application email to see where yours is up to. If you haven’t applied yet, you can start now.</p>
          <Link href="/apply" className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md border border-coral px-5 py-3 font-semibold text-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral">Apply to Not Done Yet</Link>
        </> : <>
          <p className="mt-5 text-xl leading-8 text-off-white">Thanks — your application is with Anthony.</p>
          <p className="mt-3 max-w-xl text-base leading-7 text-foreground-muted">Every application is read personally rather than scored automatically, so places go to riders the programme actually suits. You’ll get an email as soon as yours has been reviewed — there’s nothing else you need to do.</p>
        </>}
      </header>
      {talkToSarah(unmatched
        ? "Sarah can find your application, check its progress, or answer anything about the programme."
        : "Sarah can answer anything about the programme, the time commitment or your start date while you wait.")}
      {signOff}
      {errorNotice}
    </div>;
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
      <button type="button" disabled={Boolean(busy)} onClick={() => void act("join")} className="mt-6 min-h-12 w-full rounded-md bg-coral px-5 py-3 font-semibold text-deep-purple disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral">
        {busy === "join" ? "Opening Skool…" : "Get started in Skool"}
      </button>
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

    {talkToSarah("Sarah can hold your place, arrange a later start, or answer any questions you have about the programme.")}
    {signOff}
    {errorNotice}
  </div>;
}
