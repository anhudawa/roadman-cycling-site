"use client";

import { useEffect, useState } from "react";
import type { CampConfig } from "@/lib/camps/camps";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Both Camps bundle pricing — kept in sync with the API route in
 * src/app/api/camps/book/route.ts. €1,700 instead of 2 × €995 = €1,990.
 */
const BUNDLE_PRICE = 1700;
const BUNDLE_SAVINGS = 995 * 2 - BUNDLE_PRICE; // €290
const SINGLE_SUPPLEMENT_BOTH = 150 * 2; // €300, one per camp

interface CapacityState {
  total: number;
  taken: number;
  remaining: number;
}

interface Props {
  /** When set, the form is locked to that camp and the camp picker hides. */
  defaultCamp?: "road" | "gravel";
  camps: { road: CampConfig; gravel: CampConfig };
}

interface FormState {
  camp: "road" | "gravel" | "both";
  name: string;
  email: string;
  phone: string;
  singleRoom: boolean;
  dietary: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medical: string;
  heardFrom: string;
  insuranceConfirmed: boolean;
}

const initial: FormState = {
  camp: "road",
  name: "",
  email: "",
  phone: "",
  singleRoom: false,
  dietary: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  medical: "",
  heardFrom: "",
  insuranceConfirmed: false,
};

const fieldClass =
  "w-full px-4 py-3.5 rounded-lg bg-white/[0.04] border border-white/15 text-off-white text-base placeholder:text-foreground-subtle focus:border-coral/60 focus:outline-none focus:ring-1 focus:ring-coral/30 transition-colors";

const labelClass =
  "block font-heading text-foreground-muted text-[11px] md:text-xs tracking-[0.2em] uppercase mb-2";

function formatEur(amount: number): string {
  return amount.toLocaleString("en-IE");
}

export function BookingForm({ defaultCamp, camps }: Props) {
  const [form, setForm] = useState<FormState>({
    ...initial,
    camp: defaultCamp ?? "road",
  });
  const [capacity, setCapacity] = useState<Record<"road" | "gravel", CapacityState> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState<
    "validation" | "soldOut" | "paymentUnavailable" | "network" | "generic"
  >("generic");
  const [cancelledNotice, setCancelledNotice] = useState(false);

  useEffect(() => {
    let aborted = false;
    fetch("/api/camps/book")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (aborted || !data?.capacity) return;
        setCapacity(data.capacity);
      })
      .catch(() => {
        // Capacity probe is best-effort. Form will still attempt to
        // submit and the API does the authoritative check.
      });
    return () => {
      aborted = true;
    };
  }, []);

  // If the rider clicked "cancel" on Stripe Checkout, the cancel_url
  // routes them back here with ?cancelled=1. Surface that as a friendly
  // notice so they know we kept their details and they can retry.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") {
      setCancelledNotice(true);
    }
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  function showError(
    kind:
      | "validation"
      | "soldOut"
      | "paymentUnavailable"
      | "network"
      | "generic",
    message: string,
  ) {
    setErrorKind(kind);
    setError(message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Belt-and-braces double-click guard. The button is also disabled while
    // submitting, but a touch + keyboard combo or fast double-tap can race
    // before React flushes the disabled attribute.
    if (submitting) return;
    setError("");
    setErrorKind("generic");
    setCancelledNotice(false);
    if (!form.name.trim() || !form.email.trim()) {
      showError("validation", "Name and email are required.");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      showError("validation", "That email looks off — double-check and try again.");
      return;
    }
    if (!form.emergencyContactName.trim() || !form.emergencyContactPhone.trim()) {
      showError("validation", "Emergency contact name and phone are required.");
      return;
    }
    if (!form.insuranceConfirmed) {
      showError("validation", "Please confirm you have travel insurance for the trip.");
      return;
    }
    setSubmitting(true);
    let res: Response;
    try {
      res = await fetch("/api/camps/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camp: form.camp,
          name: form.name,
          email: form.email,
          phone: form.phone,
          singleRoom: form.singleRoom,
          dietary: form.dietary,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
          medical: form.medical,
          heardFrom: form.heardFrom,
        }),
      });
    } catch {
      // fetch only rejects on network failure / DNS / abort.
      showError(
        "network",
        "Network error, please try again — your details are still saved here.",
      );
      setSubmitting(false);
      return;
    }
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      checkoutUrl?: string;
    };
    if (res.ok && data.checkoutUrl) {
      // Hand off to Stripe Checkout. The user comes back via success_url
      // (booking-confirmed) or cancel_url (this page with ?cancelled=1).
      // Keep `submitting` true so the button stays disabled during the
      // browser-level redirect.
      window.location.href = data.checkoutUrl;
      return;
    }
    if (res.status === 409 && data.error === "soldOut") {
      showError(
        "soldOut",
        data.message ?? "This camp is sold out — drop us a line and we'll add you to the waitlist.",
      );
      // Refresh capacity so the picker reflects reality.
      fetch("/api/camps/book")
        .then((r) => (r.ok ? r.json() : null))
        .then((cap) => {
          if (cap?.capacity) setCapacity(cap.capacity);
        })
        .catch(() => {});
      setSubmitting(false);
      return;
    }
    if (res.status >= 500 || res.status === 502) {
      showError(
        "paymentUnavailable",
        "Payment is unavailable right now — please try again in a moment.",
      );
      setSubmitting(false);
      return;
    }
    if (res.status === 400) {
      showError(
        "validation",
        data.message || data.error || "Please check the form and try again.",
      );
      setSubmitting(false);
      return;
    }
    showError(
      "generic",
      data.message || data.error || "Could not start checkout.",
    );
    setSubmitting(false);
  }

  const roadSoldOut =
    capacity?.road && capacity.road.remaining <= 0 ? true : false;
  const gravelSoldOut =
    capacity?.gravel && capacity.gravel.remaining <= 0 ? true : false;

  const selectedSoldOut =
    (form.camp === "road" && roadSoldOut) ||
    (form.camp === "gravel" && gravelSoldOut) ||
    (form.camp === "both" && (roadSoldOut || gravelSoldOut));

  function capacityNote(slug: "road" | "gravel"): string {
    const c = capacity?.[slug];
    if (!c) return "";
    if (c.remaining <= 0) return "SOLD OUT";
    if (c.remaining <= 4) return `Only ${c.remaining} of ${c.total} spots left`;
    return `${c.remaining} of ${c.total} spots left`;
  }

  // Total shown in the "before you check out" banner. Bundle pricing kicks
  // in when "both" is selected; otherwise it's the per-camp price.
  const baseTotal =
    form.camp === "both" ? BUNDLE_PRICE : camps[form.camp].pricePerPerson;
  const supplementTotal = form.singleRoom
    ? form.camp === "both"
      ? SINGLE_SUPPLEMENT_BOTH
      : camps[form.camp].singleSupplement
    : 0;
  const grandTotal = baseTotal + supplementTotal;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
      {!defaultCamp && (
        <div>
          <label className={labelClass} htmlFor="camp-select">
            Which camp?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["road", "gravel", "both"] as const).map((opt) => {
              const isSold =
                (opt === "road" && roadSoldOut) ||
                (opt === "gravel" && gravelSoldOut) ||
                (opt === "both" && (roadSoldOut || gravelSoldOut));
              const label =
                opt === "road"
                  ? "Road · 10–15 Oct"
                  : opt === "gravel"
                    ? "Gravel · 16–21 Oct"
                    : "Both Camps · €1,700";
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !isSold && set("camp", opt)}
                  disabled={isSold}
                  className={`px-4 py-4 sm:py-3 rounded-lg border text-left transition-all ${
                    form.camp === opt
                      ? "border-coral/70 bg-coral/10"
                      : "border-white/10 bg-white/[0.03] hover:border-coral/40"
                  } ${isSold ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className="font-heading text-base text-off-white block">
                    {label}
                  </span>
                  <span
                    className={`text-xs tracking-[0.15em] uppercase ${
                      isSold ? "text-coral" : "text-foreground-subtle"
                    }`}
                  >
                    {opt === "both"
                      ? `Save €${BUNDLE_SAVINGS}`
                      : capacityNote(opt)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-4">
        <div>
          <label htmlFor="cb-name" className={labelClass}>
            Full name
          </label>
          <input
            id="cb-name"
            type="text"
            autoComplete="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <div>
          <label htmlFor="cb-email" className={labelClass}>
            Email
          </label>
          <input
            id="cb-email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <div>
          <label htmlFor="cb-phone" className={labelClass}>
            Phone (incl. country code)
          </label>
          <input
            id="cb-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+44 …"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="cb-heard" className={labelClass}>
            How did you hear about us?
          </label>
          <input
            id="cb-heard"
            type="text"
            placeholder="Podcast, Instagram, mate …"
            value={form.heardFrom}
            onChange={(e) => set("heardFrom", e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <label
        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
          form.singleRoom
            ? "border-coral/60 bg-coral/5"
            : "border-white/10 bg-white/[0.02] hover:border-coral/30"
        }`}
      >
        <input
          type="checkbox"
          checked={form.singleRoom}
          onChange={(e) => set("singleRoom", e.target.checked)}
          className="mt-1 h-5 w-5 accent-coral shrink-0"
        />
        <span className="block">
          <span className="block font-heading text-off-white text-sm tracking-wide uppercase mb-1">
            Single-room supplement &middot; +€
            {form.camp === "both" ? SINGLE_SUPPLEMENT_BOTH : 150}
            {form.camp === "both" && " (€150 per camp)"}
          </span>
          <span className="block text-foreground-muted text-sm leading-relaxed">
            Your own room for the trip. Otherwise we&apos;ll pair you up with another rider in a shared room.
          </span>
        </span>
      </label>

      <div>
        <label htmlFor="cb-dietary" className={labelClass}>
          Dietary requirements / allergies
        </label>
        <textarea
          id="cb-dietary"
          rows={2}
          value={form.dietary}
          onChange={(e) => set("dietary", e.target.value)}
          placeholder="Vegetarian, gluten-free, nut allergy …"
          className={`${fieldClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cb-ec-name" className={labelClass}>
            Emergency contact name
          </label>
          <input
            id="cb-ec-name"
            type="text"
            autoComplete="name"
            value={form.emergencyContactName}
            onChange={(e) => set("emergencyContactName", e.target.value)}
            className={fieldClass}
            required
          />
        </div>
        <div>
          <label htmlFor="cb-ec-phone" className={labelClass}>
            Emergency contact phone
          </label>
          <input
            id="cb-ec-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={form.emergencyContactPhone}
            onChange={(e) => set("emergencyContactPhone", e.target.value)}
            className={fieldClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="cb-medical" className={labelClass}>
          Medical conditions we should know about
        </label>
        <textarea
          id="cb-medical"
          rows={2}
          value={form.medical}
          onChange={(e) => set("medical", e.target.value)}
          placeholder="Asthma, diabetes, recent injury, medication …"
          className={`${fieldClass} resize-none`}
        />
      </div>

      <label
        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
          form.insuranceConfirmed
            ? "border-coral/60 bg-coral/5"
            : "border-white/10 bg-white/[0.02] hover:border-coral/30"
        }`}
      >
        <input
          type="checkbox"
          checked={form.insuranceConfirmed}
          onChange={(e) => set("insuranceConfirmed", e.target.checked)}
          className="mt-1 h-5 w-5 accent-coral shrink-0"
          required
        />
        <span className="block">
          <span className="block font-heading text-off-white text-sm tracking-wide uppercase mb-1">
            Travel insurance &middot; required
          </span>
          <span className="block text-foreground-muted text-sm leading-relaxed">
            I confirm I&apos;ll have travel insurance in place for the trip,
            covering cycling, medical, and trip cancellation.
          </span>
        </span>
      </label>

      <div className="rounded-lg border border-coral/30 bg-coral/[0.04] p-4 sm:p-5 leading-relaxed">
        <p className="text-off-white font-heading text-xs sm:text-sm tracking-[0.15em] uppercase mb-3">
          Before you check out
        </p>
        <div className="flex items-baseline justify-between gap-3 pb-3 mb-3 border-b border-coral/15">
          <span className="text-foreground-muted text-sm">Total today</span>
          <span className="font-heading text-off-white text-2xl sm:text-3xl leading-none">
            €{formatEur(grandTotal)}
          </span>
        </div>
        <p className="text-foreground-muted text-[13px] sm:text-sm mb-2">
          {form.camp === "both" && (
            <>Both Camps bundle — saves €{BUNDLE_SAVINGS} vs booking separately. </>
          )}
          {form.singleRoom && form.camp !== "both" && (
            <>Includes €{camps[form.camp].singleSupplement} single-room supplement. </>
          )}
          {form.singleRoom && form.camp === "both" && (
            <>Includes €{SINGLE_SUPPLEMENT_BOTH} single-room supplement, both weeks. </>
          )}
          {!form.singleRoom && form.camp !== "both" && (
            <>Shared room — we&apos;ll pair you with another rider. </>
          )}
        </p>
        <p className="text-foreground-muted text-[13px] sm:text-sm">
          Hit the button and we&apos;ll send you straight to Stripe to pay
          securely. Confirmation lands in your inbox the moment payment clears.
          No refunds — if you can&apos;t make it, you can transfer the spot
          to a mate.
        </p>
      </div>

      {cancelledNotice && (
        <p
          className="text-amber-300 text-sm leading-relaxed"
          role="status"
          aria-live="polite"
        >
          Payment cancelled — your details are still saved here. Hit the button
          again when you&apos;re ready and we&apos;ll send you back to Stripe.
        </p>
      )}

      {error && (
        <div
          className={`rounded-lg border p-4 text-sm leading-relaxed ${
            errorKind === "soldOut"
              ? "border-amber-400/40 bg-amber-400/5 text-amber-200"
              : errorKind === "paymentUnavailable"
                ? "border-amber-400/40 bg-amber-400/5 text-amber-200"
                : errorKind === "network"
                  ? "border-white/15 bg-white/[0.04] text-foreground-muted"
                  : "border-coral/40 bg-coral/[0.06] text-coral"
          }`}
          role="alert"
          aria-live="assertive"
          data-error-kind={errorKind}
        >
          <p className="font-heading text-[11px] tracking-[0.2em] uppercase mb-1">
            {errorKind === "soldOut"
              ? "Sold out"
              : errorKind === "paymentUnavailable"
                ? "Payment unavailable"
                : errorKind === "network"
                  ? "Network error"
                  : errorKind === "validation"
                    ? "Check the form"
                    : "Something went wrong"}
          </p>
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || selectedSoldOut}
        aria-busy={submitting}
        aria-disabled={submitting || selectedSoldOut}
        data-state={
          selectedSoldOut ? "sold-out" : submitting ? "submitting" : "idle"
        }
        className="w-full inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 rounded-lg font-heading tracking-[0.15em] uppercase text-off-white text-sm sm:text-base bg-coral hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
      >
        {submitting && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeOpacity="0.3"
              strokeWidth="3"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
        <span>
          {selectedSoldOut
            ? "Sold out"
            : submitting
              ? "Redirecting to Stripe…"
              : "Reserve my spot · Pay now"}
        </span>
      </button>
    </form>
  );
}
