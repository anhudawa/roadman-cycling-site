"use client";

import { useEffect, useRef, useState } from "react";
import { NDY_APPLICATION_OFFER as offer } from "@/lib/ndy/application-offer";

export function ApplicationNextSteps() {
  const [token, setToken] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState<"join" | "questions" | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const questionInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const [, value] = window.location.hash.slice(1).split("/");
    if (value && /^[a-f0-9]{64}$/.test(value)) setToken(value);
  }, []);
  useEffect(() => {
    if (token && window.location.hash.startsWith("#questions/")) questionInput.current?.focus();
  }, [token]);

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

  return <div className="mt-10 space-y-6">
    <section className="rounded-xl border border-coral/40 bg-white/[0.04] p-6 sm:p-8">
      <h2 className="font-heading text-2xl">I’M READY TO JOIN</h2>
      <p className="mt-3 text-base leading-7 text-foreground-muted">Not Done Yet coaching is <strong className="text-off-white">{offer.price}</strong>. Review the programme and select the $195 monthly coaching option on Skool.</p>
      {token ? <button type="button" disabled={Boolean(busy)} onClick={() => void act("join")} className="mt-6 min-h-12 w-full rounded-md bg-coral px-5 py-3 font-semibold text-deep-purple disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral">
        {busy === "join" ? "Opening Skool…" : "Join coaching — $195 USD/month"}
      </button> : <a href={offer.checkoutUrl} rel="noreferrer" className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-coral px-5 py-3 text-center font-semibold text-deep-purple">Join coaching — $195 USD/month</a>}
      <a className="mt-4 inline-block whitespace-nowrap text-sm text-coral underline underline-offset-4" href={offer.aboutUrl} target="_blank" rel="noreferrer">Read about Not Done Yet on Skool</a>
    </section>
    <section className="rounded-xl border border-white/15 p-6 sm:p-8">
      <h2 className="font-heading text-2xl">I HAVE A QUESTION</h2>
      {saved ? <p role="status" className="mt-4 text-base leading-7">Your question is saved for Sarah against your application. She’ll reply by email.</p> : token ? <form onSubmit={(event) => { event.preventDefault(); void act("questions"); }}>
        <label htmlFor="ndy-question" className="mt-4 block text-base text-foreground-muted">What would you like to know before joining?</label>
        <textarea ref={questionInput} id="ndy-question" required minLength={3} maxLength={2000} rows={4} value={question} onChange={(event) => setQuestion(event.target.value)}
          className="mt-3 w-full rounded-md border border-white/20 bg-white/5 p-3 text-base leading-6 focus:border-coral focus:outline-none focus:ring-1 focus:ring-coral" />
        <button type="submit" disabled={Boolean(busy)} className="mt-4 min-h-12 w-full rounded-md border border-coral px-5 py-3 font-semibold text-coral disabled:opacity-50">{busy === "questions" ? "Saving your question…" : "Send my question to Sarah"}</button>
        <p className="mt-3 text-sm leading-6 text-foreground-muted">Sarah will receive your question with a link to your application.</p>
      </form> : <p className="mt-4 text-base leading-7 text-foreground-muted">Open the personal link in your application email to send a question linked to your application.</p>}
      <p className="mt-4 break-words text-sm leading-6 text-foreground-muted">You can also email <a className="text-coral underline" href={`mailto:${offer.sarahEmail}`}>{offer.sarahEmail}</a>.</p>
    </section>
    {error && <p role="alert" className="rounded-md border border-red-400/40 p-4 text-base text-red-200">{error}</p>}
  </div>;
}
