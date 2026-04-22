"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/ui";
import { Container, Section } from "@/components/layout";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventBlockData {
  name: string;
  dates: string;
  startDate: string;
  endDate: string;
  description: string;
  episodeCount: number;
  newsletterCount: number;
  premiumMultiplier: number;
  totalSlots: number;
  availableSlots: number;
  selfServe: boolean;
}

interface BookingFlowProps {
  eventBlocks: EventBlockData[];
}

// Step 1 selection types
type Tab = "moment" | "duration";

interface DurationOption {
  months: number;
  label: string;
  tagline: string;
  discount: number;
  badge: string | null;
}

interface SlotType {
  id: string;
  name: string;
  baseRate: number;
  description: string;
  popular?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DURATION_OPTIONS: DurationOption[] = [
  { months: 1, label: "1 MONTH", tagline: "Test the water", discount: 0, badge: null },
  { months: 3, label: "3 MONTHS", tagline: "Proper presence", discount: 0.1, badge: "SAVE 10%" },
  { months: 6, label: "6 MONTHS", tagline: "Serious commitment", discount: 0.2, badge: "SAVE 20%" },
  { months: 12, label: "12 MONTHS", tagline: "Annual partner", discount: 0.3, badge: "SAVE 30%" },
  { months: -1, label: "MULTI-YEAR", tagline: "Let's talk", discount: 0.35, badge: "SAVE 35%" },
];

const SLOT_TYPES: SlotType[] = [
  { id: "pre-roll", name: "Pre-roll", baseRate: 650, description: "First thing listeners hear. Premium position." },
  { id: "mid-roll", name: "Mid-roll", baseRate: 500, description: "Peak attention. Lowest skip rate.", popular: true },
  { id: "end-roll", name: "End-roll", baseRate: 250, description: "Frequency play. Lower cost, consistent presence." },
  { id: "newsletter", name: "Newsletter", baseRate: 500, description: "65,000 inboxes. 65% open rate. Direct to inbox." },
];

const EPISODES_PER_MONTH = 13; // 3/week × 4.33 weeks
const NEWSLETTERS_PER_MONTH = 4.33; // 1/week × 4.33 weeks

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadge(available: number, total: number) {
  const pct = total > 0 ? available / total : 0;
  if (pct > 0.5)
    return { label: "AVAILABLE", bgClass: "bg-green-500/20", dotClass: "bg-green-400" };
  if (pct > 0)
    return { label: "FILLING FAST", bgClass: "bg-amber-500/20", dotClass: "bg-amber-400" };
  return { label: "SOLD OUT", bgClass: "bg-red-500/20", dotClass: "bg-red-400" };
}

// Animation variants
const stepReveal = {
  hidden: { opacity: 0, y: 30, height: 0 },
  visible: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    height: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Reusable glass card wrapper */
function GlassCard({
  children,
  selected = false,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative text-left rounded-lg overflow-hidden p-6
        glass-card card-shimmer cursor-pointer
        transition-all duration-300 ease-out
        hover:border-white/15 hover:-translate-y-0.5
        ${selected ? "!border-coral shadow-[var(--shadow-glow-coral)]" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

/** Step header with number badge */
function StepHeader({
  step,
  label,
  active,
  onClick,
}: {
  step: number;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-3 mb-8 transition-opacity duration-300 cursor-pointer
        ${active ? "opacity-100" : "opacity-60 hover:opacity-80"}
      `}
    >
      <span
        className={`
          flex items-center justify-center w-10 h-10 rounded-full font-heading text-lg
          ${active ? "bg-coral text-off-white" : "bg-white/10 text-foreground-muted"}
        `}
      >
        {step}
      </span>
      <h3 className="font-heading text-subsection text-off-white">{label}</h3>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Tab A — Pick a Moment (Event Blocks)
// ---------------------------------------------------------------------------

function EventBlockCards({
  events,
  selected,
  onSelect,
}: {
  events: EventBlockData[];
  selected: EventBlockData | null;
  onSelect: (event: EventBlockData) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {events.map((event) => {
        const badge = getStatusBadge(event.availableSlots, event.totalSlots);
        const isSoldOut = event.availableSlots === 0;
        const isSelected = selected?.name === event.name;

        return (
          <GlassCard
            key={event.name}
            selected={isSelected}
            onClick={() => !isSoldOut && onSelect(event)}
            className={isSoldOut ? "opacity-50 cursor-not-allowed" : ""}
          >
            {/* Status badge */}
            <div className="flex justify-end mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-off-white ${badge.bgClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dotClass} pulse-glow`} />
                {badge.label}
              </span>
            </div>

            <h4 className="font-heading text-[28px] leading-tight text-off-white mb-1">
              {event.name}
            </h4>
            <p className="text-foreground-muted text-sm mb-3">{event.dates}</p>
            <p className="text-foreground-subtle text-sm leading-relaxed mb-4">
              {event.description}
            </p>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-coral font-medium">{event.availableSlots}</span>
              <span className="text-foreground-muted">
                of {event.totalSlots} positions open
              </span>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1: Tab B — Pick a Duration
// ---------------------------------------------------------------------------

function DurationCards({
  selected,
  onSelect,
}: {
  selected: DurationOption | null;
  onSelect: (option: DurationOption) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {DURATION_OPTIONS.map((option) => {
        const isSelected = selected?.months === option.months;

        return (
          <GlassCard
            key={option.months}
            selected={isSelected}
            onClick={() => onSelect(option)}
          >
            {/* Discount badge */}
            {option.badge && (
              <div className="flex justify-end mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-coral/20 text-coral">
                  {option.badge}
                </span>
              </div>
            )}
            {!option.badge && <div className="mb-3 h-[26px]" />}

            <h4 className="font-heading text-[28px] leading-tight text-off-white mb-2">
              {option.label}
            </h4>
            <p className="text-foreground-muted text-sm">{option.tagline}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2: Choose Your Slot
// ---------------------------------------------------------------------------

interface PricingInfo {
  perUnit: number;
  total: number;
  unitCount: number;
  unitLabel: string;
  discountOrPremiumNote: string;
}

function calculatePricing(
  slot: SlotType,
  step1Selection: { type: "event"; event: EventBlockData } | { type: "duration"; duration: DurationOption }
): PricingInfo {
  const isNewsletter = slot.id === "newsletter";

  if (step1Selection.type === "event") {
    const { event } = step1Selection;
    const unitCount = isNewsletter ? event.newsletterCount : event.episodeCount;
    const perUnit = Math.round(slot.baseRate * event.premiumMultiplier);
    const total = perUnit * unitCount;
    const premiumPct = Math.round((event.premiumMultiplier - 1) * 100);
    const discountOrPremiumNote =
      premiumPct > 0 ? `+${premiumPct}% event premium` : "Flat rate";

    return {
      perUnit,
      total,
      unitCount,
      unitLabel: isNewsletter ? "sends" : "episodes",
      discountOrPremiumNote,
    };
  }

  // Duration path
  const { duration } = step1Selection;
  const unitCount = isNewsletter
    ? Math.round(NEWSLETTERS_PER_MONTH * duration.months)
    : Math.round(EPISODES_PER_MONTH * duration.months);
  const perUnit = Math.round(slot.baseRate * (1 - duration.discount));
  const total = perUnit * unitCount;
  const discountOrPremiumNote =
    duration.discount > 0 ? `${Math.round(duration.discount * 100)}% off` : "Standard rate";

  return {
    perUnit,
    total,
    unitCount,
    unitLabel: isNewsletter ? "sends" : "episodes",
    discountOrPremiumNote,
  };
}

function SlotTypeCards({
  step1Selection,
  selectedSlot,
  onSelect,
}: {
  step1Selection: { type: "event"; event: EventBlockData } | { type: "duration"; duration: DurationOption };
  selectedSlot: SlotType | null;
  onSelect: (slot: SlotType) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {SLOT_TYPES.map((slot) => {
        const pricing = calculatePricing(slot, step1Selection);
        const isSelected = selectedSlot?.id === slot.id;

        return (
          <GlassCard
            key={slot.id}
            selected={isSelected}
            onClick={() => onSelect(slot)}
            className="flex flex-col"
          >
            {/* Popular badge */}
            {slot.popular && (
              <div className="flex justify-end mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-coral/20 text-coral">
                  MOST POPULAR
                </span>
              </div>
            )}
            {!slot.popular && <div className="mb-3 h-[26px]" />}

            <h4 className="font-heading text-[28px] leading-tight text-off-white mb-1">
              {slot.name}
            </h4>
            <p className="text-foreground-subtle text-sm mb-4 leading-relaxed">
              {slot.description}
            </p>

            {/* Pricing */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-off-white font-heading text-2xl">
                  {formatCurrency(pricing.perUnit)}
                </span>
                <span className="text-foreground-muted text-sm">
                  /{pricing.unitLabel === "sends" ? "send" : "ep"}
                </span>
              </div>
              <p className="text-foreground-subtle text-xs mb-2">
                {pricing.discountOrPremiumNote}
              </p>
              <p className="text-coral font-medium text-sm">
                {pricing.unitCount} {pricing.unitLabel} = {formatCurrency(pricing.total)}
              </p>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3: Your Assets
// ---------------------------------------------------------------------------

function AssetForm({
  step1Selection,
  selectedSlot,
  pricing,
}: {
  step1Selection: { type: "event"; event: EventBlockData } | { type: "duration"; duration: DurationOption };
  selectedSlot: SlotType;
  pricing: PricingInfo;
}) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [adCopy, setAdCopy] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine if this is self-serve (Stripe) or form submission
  const isSelfServe = useMemo(() => {
    if (step1Selection.type === "event") {
      return step1Selection.event.selfServe;
    }
    const months = step1Selection.duration.months;
    return months === 1 || months === 3;
  }, [step1Selection]);

  // Show contact fields for long deals
  const showContactFields = !isSelfServe;

  // Summary line
  const summaryLabel = useMemo(() => {
    const slotName = selectedSlot.name;
    const periodName =
      step1Selection.type === "event"
        ? step1Selection.event.name
        : step1Selection.duration.label.toLowerCase();
    return `${slotName} \u00d7 ${periodName} \u2014 ${pricing.unitCount} ${pricing.unitLabel} @ ${formatCurrency(pricing.perUnit)}/${pricing.unitLabel === "sends" ? "send" : "ep"}`;
  }, [selectedSlot, step1Selection, pricing]);

  // File handling
  const handleFile = useCallback((file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/png", "image/svg+xml", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      setSubmitError("Logo must be PNG, SVG, or JPG.");
      return;
    }
    if (file.size > maxSize) {
      setSubmitError("Logo must be under 5MB.");
      return;
    }
    setSubmitError(null);
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Submission
  const handleSubmit = useCallback(async () => {
    // Basic validation
    if (!websiteUrl) {
      setSubmitError("Drop us your website URL.");
      return;
    }
    try {
      new URL(websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`);
    } catch {
      setSubmitError("That URL doesn't look right. Try again.");
      return;
    }
    if (showContactFields && (!contactName || !contactEmail)) {
      setSubmitError("We need your name and email to get back to you.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build payload
      let logoDataUrl: string | null = null;
      if (logoFile) {
        logoDataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(logoFile);
        });
      }

      const payload: Record<string, unknown> = {
        slotType: selectedSlot.id,
        totalAmount: pricing.total,
        perUnitRate: pricing.perUnit,
        unitCount: pricing.unitCount,
        websiteUrl: websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`,
        adCopy,
        logoDataUrl,
      };

      if (step1Selection.type === "event") {
        payload.eventBlock = step1Selection.event.name;
        payload.startDate = step1Selection.event.startDate;
        payload.endDate = step1Selection.event.endDate;
      } else {
        payload.duration = step1Selection.duration.months;
      }

      if (showContactFields) {
        payload.contactName = contactName;
        payload.contactEmail = contactEmail;
      }

      const endpoint = isSelfServe ? "/api/sponsor/spotlight" : "/api/sponsor/apply";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Try again.");
      }

      if (isSelfServe) {
        // Stripe redirect
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    websiteUrl,
    showContactFields,
    contactName,
    contactEmail,
    logoFile,
    selectedSlot,
    pricing,
    step1Selection,
    adCopy,
    isSelfServe,
  ]);

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-[36px] text-off-white mb-3">SORTED.</h3>
        <p className="text-foreground-muted text-lg max-w-md mx-auto">
          We&apos;ve got everything we need. Someone from the team will be in touch within 48 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary bar */}
      <div className="bg-white/5 rounded-lg px-6 py-4 border border-white/10">
        <p className="text-foreground-muted text-sm">
          {summaryLabel} ={" "}
          <span className="text-off-white font-bold text-lg">
            {formatCurrency(pricing.total)}
          </span>
        </p>
      </div>

      {/* Logo upload */}
      <div>
        <label className="block text-off-white font-medium text-sm mb-2">
          Logo or graphic
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={`
            relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer
            transition-colors duration-200
            ${isDragging ? "border-coral bg-coral/5" : "border-white/20 hover:border-white/40"}
            ${logoPreview ? "border-solid border-coral/40" : ""}
          `}
        >
          {logoPreview ? (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-16 h-16 object-contain rounded bg-white/10 p-1"
              />
              <div className="text-left">
                <p className="text-off-white text-sm font-medium">
                  {logoFile?.name}
                </p>
                <p className="text-foreground-subtle text-xs">
                  {logoFile ? `${(logoFile.size / 1024).toFixed(0)}KB` : ""} &mdash; click to replace
                </p>
              </div>
            </div>
          ) : (
            <>
              <svg
                className="w-8 h-8 mx-auto mb-2 text-foreground-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <p className="text-foreground-muted text-sm">
                Drag and drop or click to upload
              </p>
              <p className="text-foreground-subtle text-xs mt-1">
                PNG, SVG, or JPG. Max 5MB.
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.svg,.jpg,.jpeg"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>
        <p className="text-foreground-subtle text-xs mt-2">
          Your logo for show notes and newsletter placement
        </p>
      </div>

      {/* Website URL */}
      <div>
        <label htmlFor="website-url" className="block text-off-white font-medium text-sm mb-2">
          Website URL
        </label>
        <input
          id="website-url"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourbrand.com"
          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
        />
        <p className="text-foreground-subtle text-xs mt-2">
          Where should we send listeners?
        </p>
      </div>

      {/* Ad copy */}
      <div>
        <label htmlFor="ad-copy" className="block text-off-white font-medium text-sm mb-2">
          Ad copy
        </label>
        <textarea
          id="ad-copy"
          value={adCopy}
          onChange={(e) => setAdCopy(e.target.value.slice(0, 500))}
          placeholder="What do you want Anthony to say?"
          rows={4}
          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors resize-none"
        />
        <div className="flex justify-between mt-2">
          <p className="text-foreground-subtle text-xs">
            Keep it tight — he&apos;ll script the read himself.
          </p>
          <p className={`text-xs ${adCopy.length >= 480 ? "text-coral" : "text-foreground-subtle"}`}>
            {adCopy.length}/500
          </p>
        </div>
      </div>

      {/* Contact fields for long deals */}
      <AnimatePresence>
        {showContactFields && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <label htmlFor="contact-name" className="block text-off-white font-medium text-sm mb-2">
                Your name
              </label>
              <input
                id="contact-name"
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
              />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-off-white font-medium text-sm mb-2">
                Your email
              </label>
              <input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="jane@yourbrand.com"
                className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {submitError && (
        <p className="text-coral text-sm bg-coral/10 rounded-lg px-4 py-3">{submitError}</p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="
          w-full font-heading tracking-wider uppercase rounded-lg
          transition-all cursor-pointer active:scale-[0.97] active:duration-75
          bg-coral hover:bg-coral-hover text-off-white
          shadow-[var(--shadow-glow-coral)] hover:shadow-[0_0_30px_rgba(241,99,99,0.4)]
          px-8 py-5 text-lg disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {isSubmitting
          ? "PROCESSING..."
          : isSelfServe
            ? `PAY AND BOOK \u2014 ${formatCurrency(pricing.total)}`
            : "SUBMIT \u2014 WE\u2019LL BE IN TOUCH WITHIN 48 HOURS"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-year Contact Form
// ---------------------------------------------------------------------------

function MultiYearForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brand, setBrand] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!name || !email || !brand) {
      setError("Fill in your name, email, and brand at minimum.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/sponsor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: "multi-year",
          contactName: name,
          contactEmail: email,
          brandName: brand,
          message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Something went wrong. Try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, brand, message]);

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-[36px] text-off-white mb-3">CONVERSATION STARTED.</h3>
        <p className="text-foreground-muted text-lg max-w-md mx-auto">
          Anthony or Sarah will be in touch within 48 hours. No media kit fluff — just a straight conversation about what makes sense.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center mb-8">
        <h3 className="font-heading text-[32px] text-off-white mb-2">
          MULTI-YEAR PARTNERSHIP
        </h3>
        <p className="text-foreground-muted">
          This is a conversation, not a checkout. Tell us what you&apos;re thinking and we&apos;ll build the deal together.
        </p>
      </div>

      <div>
        <label htmlFor="my-name" className="block text-off-white font-medium text-sm mb-2">
          Your name
        </label>
        <input
          id="my-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
        />
      </div>

      <div>
        <label htmlFor="my-email" className="block text-off-white font-medium text-sm mb-2">
          Your email
        </label>
        <input
          id="my-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@yourbrand.com"
          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
        />
      </div>

      <div>
        <label htmlFor="my-brand" className="block text-off-white font-medium text-sm mb-2">
          Brand name
        </label>
        <input
          id="my-brand"
          type="text"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="Acme Cycling Co."
          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors"
        />
      </div>

      <div>
        <label htmlFor="my-message" className="block text-off-white font-medium text-sm mb-2">
          Tell us what you&apos;re thinking
        </label>
        <textarea
          id="my-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Budget, timeline, what you want out of this..."
          rows={4}
          className="w-full bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral focus:ring-1 focus:ring-coral transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-coral text-sm bg-coral/10 rounded-lg px-4 py-3">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="
          w-full font-heading tracking-wider uppercase rounded-lg
          transition-all cursor-pointer active:scale-[0.97] active:duration-75
          bg-coral hover:bg-coral-hover text-off-white
          shadow-[var(--shadow-glow-coral)] hover:shadow-[0_0_30px_rgba(241,99,99,0.4)]
          px-8 py-5 text-lg disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {isSubmitting ? "SENDING..." : "START THE CONVERSATION"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main BookingFlow Component
// ---------------------------------------------------------------------------

export default function BookingFlow({ eventBlocks }: BookingFlowProps) {
  // State
  const [activeTab, setActiveTab] = useState<Tab>("moment");
  const [selectedEvent, setSelectedEvent] = useState<EventBlockData | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotType | null>(null);
  const [activeStep, setActiveStep] = useState(1);

  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Derived state
  const isMultiYear = selectedDuration?.months === -1;

  const step1Selection = useMemo(() => {
    if (activeTab === "moment" && selectedEvent) {
      return { type: "event" as const, event: selectedEvent };
    }
    if (activeTab === "duration" && selectedDuration && !isMultiYear) {
      return { type: "duration" as const, duration: selectedDuration };
    }
    return null;
  }, [activeTab, selectedEvent, selectedDuration, isMultiYear]);

  const currentPricing = useMemo(() => {
    if (!step1Selection || !selectedSlot) return null;
    return calculatePricing(selectedSlot, step1Selection);
  }, [step1Selection, selectedSlot]);

  // Scroll into view helpers
  const scrollToRef = useCallback((ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  // Step 1 selection handlers
  const handleEventSelect = useCallback(
    (event: EventBlockData) => {
      setSelectedEvent(event);
      setSelectedDuration(null);
      setSelectedSlot(null);
      setActiveStep(2);
      scrollToRef(step2Ref);
    },
    [scrollToRef]
  );

  const handleDurationSelect = useCallback(
    (option: DurationOption) => {
      setSelectedDuration(option);
      setSelectedEvent(null);
      setSelectedSlot(null);
      if (option.months === -1) {
        // Multi-year: skip to contact form (rendered inline, no step 2/3)
        setActiveStep(2);
        scrollToRef(step2Ref);
      } else {
        setActiveStep(2);
        scrollToRef(step2Ref);
      }
    },
    [scrollToRef]
  );

  const handleSlotSelect = useCallback(
    (slot: SlotType) => {
      setSelectedSlot(slot);
      setActiveStep(3);
      scrollToRef(step3Ref);
    },
    [scrollToRef]
  );

  // Step re-activation
  const reactivateStep = useCallback(
    (step: number) => {
      if (step < activeStep) {
        setActiveStep(step);
        if (step <= 1) {
          setSelectedSlot(null);
        }
      }
    },
    [activeStep]
  );

  // Tab switching
  const handleTabSwitch = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
      setSelectedEvent(null);
      setSelectedDuration(null);
      setSelectedSlot(null);
      setActiveStep(1);
    },
    []
  );

  return (
    <div id="booking-flow" className="space-y-12">
      {/* ================================================================
          STEP 1: Choose Your Campaign
          ================================================================ */}
      <div className={`transition-opacity duration-300 ${activeStep > 1 ? "opacity-60" : "opacity-100"}`}>
        <StepHeader
          step={1}
          label="CHOOSE YOUR CAMPAIGN"
          active={activeStep >= 1}
          onClick={() => reactivateStep(1)}
        />

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-b border-white/10">
          <button
            type="button"
            onClick={() => handleTabSwitch("moment")}
            className={`
              relative px-6 py-3 font-heading text-lg tracking-wider uppercase cursor-pointer
              transition-colors duration-200
              ${activeTab === "moment" ? "text-off-white" : "text-foreground-muted hover:text-off-white"}
            `}
          >
            PICK A MOMENT
            {activeTab === "moment" && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-coral"
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch("duration")}
            className={`
              relative px-6 py-3 font-heading text-lg tracking-wider uppercase cursor-pointer
              transition-colors duration-200
              ${activeTab === "duration" ? "text-off-white" : "text-foreground-muted hover:text-off-white"}
            `}
          >
            PICK A DURATION
            {activeTab === "duration" && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-coral"
              />
            )}
          </button>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {activeTab === "moment" ? (
            <motion.div
              key="moment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
            >
              <EventBlockCards
                events={eventBlocks}
                selected={selectedEvent}
                onSelect={handleEventSelect}
              />
            </motion.div>
          ) : (
            <motion.div
              key="duration"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <DurationCards
                selected={selectedDuration}
                onSelect={handleDurationSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================================================================
          STEP 2: Choose Your Slot (or Multi-year form)
          ================================================================ */}
      <AnimatePresence>
        {activeStep >= 2 && (
          <motion.div
            ref={step2Ref}
            key="step2"
            variants={stepReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`transition-opacity duration-300 ${activeStep > 2 ? "opacity-60" : "opacity-100"}`}
          >
            {isMultiYear ? (
              <MultiYearForm />
            ) : step1Selection ? (
              <>
                <StepHeader
                  step={2}
                  label="CHOOSE YOUR SLOT"
                  active={activeStep >= 2}
                  onClick={() => reactivateStep(2)}
                />
                <SlotTypeCards
                  step1Selection={step1Selection}
                  selectedSlot={selectedSlot}
                  onSelect={handleSlotSelect}
                />
              </>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
          STEP 3: Your Assets
          ================================================================ */}
      <AnimatePresence>
        {activeStep >= 3 && step1Selection && selectedSlot && currentPricing && (
          <motion.div
            ref={step3Ref}
            key="step3"
            variants={stepReveal}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <StepHeader
              step={3}
              label="YOUR ASSETS"
              active={activeStep >= 3}
            />
            <AssetForm
              step1Selection={step1Selection}
              selectedSlot={selectedSlot}
              pricing={currentPricing}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FAQ Section (trimmed to 4 questions per spec)
// ---------------------------------------------------------------------------

const FAQ_DATA = [
  {
    question: "What\u2019s the turnaround from brief to live?",
    answer:
      "Minimum two weeks from signed agreement to first placement. That gives us time to receive your brief, script the read, get your sign-off, and slot it into the production schedule. For event-specific blocks, we work backwards from the event start date \u2014 if you\u2019re booking the Tour de France block, you want to be confirmed at least four weeks out. Rush slots exist if something comes up and you need to move fast.",
  },
  {
    question: "Can I see audience data before committing?",
    answer:
      "Yes. Full audience report is available on request \u2014 demographics, household income, purchase intent, geographic split, device breakdown, the works. We don\u2019t put every number on the page because some of it requires context. Fill in the form above and we\u2019ll send it over. No commitment required to see the data.",
  },
  {
    question: "Do you have category restrictions?",
    answer:
      "A few. We don\u2019t work with brands whose core business is at odds with the sport \u2014 so no fast food, no tobacco, nothing that would make Anthony cringe to read out loud. We do apply a one-brand-per-category rule for long-term partners, and we\u2019ll flag if a category is already taken before you go through the booking process. If you\u2019re not sure whether your brand fits, ask.",
  },
  {
    question: "What does success look like?",
    answer:
      "Depends on what you\u2019re tracking, and we\u2019ll ask you that upfront. Some brands track promo code redemptions. Some track site traffic from show notes. Some want the association with the audience and know their sales cycle is long. We\u2019ll agree what we\u2019re measuring before anything goes live, and we\u2019ll send you the numbers when it\u2019s done. Honest conversation upfront means no awkward one afterwards.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="font-heading text-xl md:text-2xl text-off-white group-hover:text-coral transition-colors pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-coral text-2xl flex-shrink-0"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            className="overflow-hidden"
          >
            <p className="text-foreground-muted leading-relaxed pb-6 max-w-3xl">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="faq">
      <Container width="narrow">
        <ScrollReveal>
          <h2 className="font-heading text-[clamp(2.5rem,5vw,4.5rem)] text-center mb-12">
            THE QUESTIONS EVERYONE ASKS FIRST
          </h2>
        </ScrollReveal>
        <div>
          {FAQ_DATA.map((item, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <FAQItem
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
