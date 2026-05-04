"use client";

import { useEffect, useState } from "react";
import type { CampConfig } from "@/lib/camps/camps";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
};

const fieldClass =
  "w-full px-4 py-3 rounded-lg bg-white/[0.04] border border-white/15 text-off-white placeholder:text-foreground-subtle focus:border-coral/60 focus:outline-none focus:ring-1 focus:ring-coral/30 transition-colors";

const labelClass =
  "block font-heading text-foreground-muted text-xs tracking-[0.2em] uppercase mb-2";

export function BookingForm({ defaultCamp, camps }: Props) {
  const [form, setForm] = useState<FormState>({
    ...initial,
    camp: defaultCamp ?? "road",
  });
  const [capacity, setCapacity] = useState<Record<"road" | "gravel", CapacityState> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCancelledNotice(false);
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!EMAIL_REGEX.test(form.email.trim())) {
      setError("That email looks off — double-check and try again.");
      return;
    }
    if (!form.emergencyContactName.trim() || !form.emergencyContactPhone.trim()) {
      setError("Emergency contact name and phone are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/camps/book", {
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
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        checkoutUrl?: string;
      };
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.message || data.error || "Could not start checkout.");
      }
      // Hand off to Stripe Checkout. The user comes back via success_url
      // (booking-confirmed) or cancel_url (this page with ?cancelled=1).
      window.location.href = data.checkoutUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setSubmitting(false);
    }
  }

  const roadSoldOut =
    capacity?.road && capacity.road.remaining <= 0 ? true : false;
  const gravelSoldOut =
    capacity?.gravel && capacity.gravel.remaining <= 0 ? true : false;

  const selectedSoldOut =
    (form.camp === "road" && roadSoldOut) ||
    (form.camp === "gravel" && gravelSoldOut) ||
    (form.camp === "both" && roadSoldOut && gravelSoldOut);

  function capacityNote(slug: "road" | "gravel"): string {
    const c = capacity?.[slug];
    if (!c) return "";
    if (c.remaining <= 0) return "SOLD OUT";
    if (c.remaining <= 4) return `Only ${c.remaining} of ${c.total} spots left`;
    return `${c.remaining} of ${c.total} spots left`;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                (opt === "both" && roadSoldOut && gravelSoldOut);
              const label =
                opt === "road"
                  ? "Road · 13–17 Oct"
                  : opt === "gravel"
                    ? "Gravel · 18–22 Oct"
                    : "Both back-to-back";
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => !isSold && set("camp", opt)}
                  disabled={isSold}
                  className={`px-4 py-3 rounded-lg border text-left transition-all ${
                    form.camp === opt
                      ? "border-coral/70 bg-coral/10"
                      : "border-white/10 bg-white/[0.03] hover:border-coral/40"
                  } ${isSold ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  <span className="font-heading text-base text-off-white block">
                    {label}
                  </span>
                  {opt !== "both" && (
                    <span
                      className={`text-xs tracking-[0.15em] uppercase ${
                        isSold ? "text-coral" : "text-foreground-subtle"
                      }`}
                    >
                      {capacityNote(opt)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cb-name" className={labelClass}>
            Full name
          </label>
          <input
            id="cb-name"
            type="text"
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
          className="mt-1 h-4 w-4 accent-coral"
        />
        <span className="block">
          <span className="block font-heading text-off-white text-sm tracking-wide uppercase mb-1">
            Single-room supplement &middot; +€150
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

      <div className="rounded-lg border border-coral/30 bg-coral/[0.04] p-4 text-sm text-foreground-muted leading-relaxed">
        <p className="text-off-white font-heading text-sm tracking-[0.15em] uppercase mb-2">
          Before you check out
        </p>
        <p className="mb-1">
          Full payment of{" "}
          <strong className="text-off-white">
            €{form.camp === "both" ? "1,990" : "995"}
          </strong>
          {form.singleRoom && (
            <>
              {" "}+{" "}
              <strong className="text-off-white">
                €{form.camp === "both" ? "300" : "150"}
              </strong>{" "}
              single-room supplement
            </>
          )}{" "}
          is required to lock the spot. We don&apos;t offer refunds — if something
          comes up, you can transfer the spot to a mate.
        </p>
        <p>
          Hit the button and we&apos;ll send you straight to Stripe to pay
          securely. Confirmation lands in your inbox the moment payment clears.
        </p>
      </div>

      {cancelledNotice && (
        <p
          className="text-amber-300 text-sm"
          role="status"
          aria-live="polite"
        >
          Payment cancelled — your details are still saved here. Hit the button
          again when you&apos;re ready and we&apos;ll send you back to Stripe.
        </p>
      )}

      {error && (
        <p className="text-coral text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || selectedSoldOut}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-heading tracking-[0.15em] uppercase text-off-white bg-coral hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_10px_30px_-12px_rgba(241,99,99,0.55)]"
      >
        {selectedSoldOut
          ? "Sold out"
          : submitting
            ? "Redirecting to Stripe…"
            : "Reserve my spot · Pay now"}
      </button>
    </form>
  );
}
