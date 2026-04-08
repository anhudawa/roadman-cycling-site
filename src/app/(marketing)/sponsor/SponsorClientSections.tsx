"use client";

import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Card, ScrollReveal, AnimatedCounter, Button } from "@/components/ui";
import { Container, Section } from "@/components/layout";
import type { Event, EventWithInventory } from "@/lib/inventory";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EventCardData {
  id: string;
  eventName: string;
  startDate: string;
  endDate: string;
  premiumTier: string;
  coveragePlan: string | null;
  status: string;
  totalSlots: number;
  availableSlots: number;
  minRate: number;
}

// ---------------------------------------------------------------------------
// 2. Events Calendar
// ---------------------------------------------------------------------------

function getStatusBadge(available: number, total: number) {
  const pct = total > 0 ? available / total : 0;
  if (pct > 0.5) return { label: "AVAILABLE", color: "bg-green-500", dot: "bg-green-400" };
  if (pct > 0) return { label: "FILLING FAST", color: "bg-amber-500", dot: "bg-amber-400" };
  return { label: "SOLD OUT", color: "bg-red-500", dot: "bg-red-400" };
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-GB", opts)} – ${e.toLocaleDateString("en-GB", { ...opts, year: "numeric" })}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function EventCard({ event }: { event: EventCardData }) {
  const badge = getStatusBadge(event.availableSlots, event.totalSlots);

  return (
    <Card glass className="w-[340px] flex-shrink-0 p-6 flex flex-col gap-4">
      {/* Status badge */}
      <div className="flex justify-end">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-off-white ${badge.color}/20`}>
          <span className={`w-2 h-2 rounded-full ${badge.dot} pulse-glow`} />
          {badge.label}
        </span>
      </div>

      {/* Event name */}
      <h3 className="font-heading text-[32px] leading-tight text-off-white">
        {event.eventName}
      </h3>

      {/* Dates */}
      <p className="text-foreground-muted text-sm">
        {formatDateRange(event.startDate, event.endDate)}
      </p>

      {/* Coverage plan */}
      {event.coveragePlan && (
        <p className="text-foreground-subtle text-sm line-clamp-4 leading-relaxed">
          {event.coveragePlan}
        </p>
      )}

      {/* Inventory count */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-coral font-medium">{event.availableSlots}</span>
        <span className="text-foreground-muted">of {event.totalSlots} slots remaining</span>
      </div>

      {/* Pricing */}
      {event.minRate > 0 && (
        <p className="text-foreground-muted text-sm">
          From <span className="text-off-white font-medium">{formatCurrency(event.minRate)}</span>/slot
        </p>
      )}

      {/* CTA */}
      <div className="mt-auto pt-2">
        <Button
          href="#booking"
          variant={event.availableSlots > 0 ? "primary" : "ghost"}
          size="sm"
          className="w-full"
        >
          {event.availableSlots > 0 ? "BOOK THIS EVENT" : "JOIN WAITLIST"}
        </Button>
      </div>
    </Card>
  );
}

export function EventsCalendar({ events }: { events: EventCardData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <Section background="deep-purple" id="events" className="!py-0">
      <div className="py-[var(--spacing-section)]">
        <Container>
          <ScrollReveal>
            <p className="text-coral font-heading text-sm tracking-widest mb-4">
              THE NEXT 12 MONTHS
            </p>
            <h2 className="font-heading text-section mb-6">
              WHERE YOUR BRAND LIVES IN 2026
            </h2>
            <p className="text-foreground-muted text-body-lg max-w-3xl mb-12 leading-relaxed">
              Every major race. Every Roadman original. Twelve months of inventory
              laid out in front of you. Green means it&apos;s yours. Amber means
              move fast. Red means you missed it.
            </p>
          </ScrollReveal>
        </Container>

        {/* Horizontal scroll on desktop, vertical stack on mobile */}
        <div className="lg:hidden px-5 md:px-8 flex flex-col gap-6">
          {events.map((event, i) => (
            <ScrollReveal key={event.id} delay={i * 0.05}>
              <EventCard event={event} />
            </ScrollReveal>
          ))}
        </div>

        <div className="hidden lg:block overflow-hidden">
          <motion.div
            ref={scrollRef}
            className="flex gap-6 px-8 pb-8 overflow-x-auto scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ scrollSnapAlign: "start" }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// 6. FAQ Accordion
// ---------------------------------------------------------------------------

const FAQ_DATA = [
  {
    question: "How is pricing determined?",
    answer:
      "Straight answer: format, placement, and timing. A mid-roll in a standard episode costs less than a mid-roll in a Tour de France dispatch episode because the audience for the latter is three times the size and already hyped. Event-specific inventory is priced per block based on the reach of that coverage window. The rate card gives you the floor \u2014 actual pricing for event slots is listed on the calendar above. No hidden fees, no \u201ccall us for pricing\u201d nonsense. What you see is what you pay.",
  },
  {
    question: "What\u2019s the turnaround from brief to live?",
    answer:
      "Minimum two weeks from signed agreement to first placement. That gives us time to receive your brief, script the read, get your sign-off, and slot it into the production schedule. For event-specific blocks, we work backwards from the event start date \u2014 if you\u2019re booking the Tour de France block, you want to be confirmed at least four weeks out. Rush slots exist if something comes up and you need to move fast. Flag it in the enquiry form and we\u2019ll tell you honestly whether we can make it work.",
  },
  {
    question: "Can I see audience data before committing?",
    answer:
      "Yes. Full audience report is available on request \u2014 demographics, household income, purchase intent, geographic split, device breakdown, the works. We don\u2019t put every number on the page because some of it requires context to be useful and we\u2019d rather talk you through it. Fill in the form below and we\u2019ll send it over. No commitment required to see the data.",
  },
  {
    question: "Do you have category restrictions?",
    answer:
      "A few. We don\u2019t work with brands whose core business is at odds with the sport \u2014 so no fast food, no tobacco, nothing that would make Anthony cringe to read out loud. Beyond that, we do apply a one-brand-per-category rule for Title Partners, and we\u2019ll flag if a category is already taken for a specific quarter before you go through the booking process. If you\u2019re not sure whether your brand fits, ask. Worst we can say is no.",
  },
  {
    question: "Can I test before committing to a quarter?",
    answer:
      "That\u2019s exactly what Spotlight is for. One placement, proper execution, real numbers sent back to you afterwards. If it works, you move to a Quarter. If it doesn\u2019t \u2014 which is rare, but happens \u2014 you\u2019ve spent \u00a3500 and found out quickly. We\u2019d rather you do a Spotlight first and then commit to three months than skip the test, do a full quarter, and not be happy. Spotlight is at the top of the page. Book one.",
  },
  {
    question: "What does success look like?",
    answer:
      "That depends on what you\u2019re tracking, and we\u2019ll ask you that at the start. Some brands are tracking promo code redemptions. Some are tracking site traffic from the link in show notes. Some just want the association with the audience \u2014 they know their sales cycle is long and they\u2019re playing a longer game. We\u2019ll agree what we\u2019re measuring before anything goes live, and we\u2019ll send you the numbers when it\u2019s done. We don\u2019t hide behind \u201cbrand awareness\u201d when a brand wants to see clicks. We also don\u2019t pretend every campaign produces a direct-attribution sale, because that\u2019s not always how this works. Honest conversation upfront means no awkward one afterwards.",
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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

// ---------------------------------------------------------------------------
// 7. Recommendation Quiz
// ---------------------------------------------------------------------------

const QUIZ_QUESTIONS = [
  {
    question: "What\u2019s the honest reason you\u2019re here?",
    options: [
      "We want to test whether podcast sponsorship works for us before spending serious money",
      "We have a budget set aside and we need consistent brand presence over a quarter",
      "We\u2019re looking for a proper long-term partnership and we want to be the brand associated with Roadman",
      "We have a specific event we want to be attached to",
    ],
  },
  {
    question: "What\u2019s your approximate budget for this?",
    options: [
      "Under \u00a32,000",
      "\u00a32,000\u2013\u00a315,000",
      "\u00a315,000\u2013\u00a330,000+",
      "We have a specific event budget and it depends on the slot",
    ],
  },
  {
    question: "How quickly do you need this live?",
    options: [
      "This week or next \u2014 we have something specific to promote",
      "We\u2019re planning a quarter out, no rush",
      "We\u2019re thinking about next year and want to get ahead of it",
      "We\u2019re flexible \u2014 we just want the right slot, not the fastest one",
    ],
  },
  {
    question: "Has your brand ever sponsored a podcast or sport-adjacent media before?",
    options: [
      "No \u2014 this would be the first time",
      "Yes, and it worked \u2014 we want to do more of it",
      "Yes, and it didn\u2019t work \u2014 but we think Roadman\u2019s audience is different",
      "We\u2019re a returning Roadman partner",
    ],
  },
];

type QuizResult = "spotlight" | "quarter" | "annual" | "events";

function computeQuizResult(answers: number[]): QuizResult {
  // Count letter frequencies: 0=A, 1=B, 2=C, 3=D
  const counts = [0, 0, 0, 0];
  answers.forEach((a) => counts[a]++);

  // Q1=D (index 3) or mostly D's -> Events
  if (answers[0] === 3 || counts[3] >= 2) return "events";
  // Mostly C's or Q2=C and (Q4=B or Q4=D) -> Annual
  if (counts[2] >= 2 || (answers[1] === 2 && (answers[3] === 1 || answers[3] === 3)))
    return "annual";
  // Mostly B's or Q2=B or Q2=C -> Quarter
  if (counts[1] >= 2 || answers[1] === 1 || answers[1] === 2) return "quarter";
  // Default / Mostly A's / Q2=A -> Spotlight
  return "spotlight";
}

const QUIZ_RESULTS: Record<
  QuizResult,
  { heading: string; body: string; cta: string; href: string }
> = {
  spotlight: {
    heading: "SPOTLIGHT",
    body: "Start with a single placement. Low risk, real data, proper execution.",
    cta: "BOOK A SPOTLIGHT",
    href: "#spotlight-booking",
  },
  quarter: {
    heading: "QUARTER",
    body: "Three months gives the audience time to actually learn who you are. This is the format that works.",
    cta: "CHECK AVAILABILITY",
    href: "#quarter-booking",
  },
  annual: {
    heading: "ANNUAL TITLE PARTNER",
    body: "You\u2019re thinking like a long-term partner. There are three slots. Apply below.",
    cta: "APPLY FOR PARTNERSHIP",
    href: "#annual-booking",
  },
  events: {
    heading: "EVENTS CALENDAR",
    body: "You\u2019ve got something specific in mind. Go back to the calendar above and book the slot.",
    cta: "VIEW EVENTS",
    href: "#events",
  },
};

export function RecommendationQuiz() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizResult | null>(null);

  function handleAnswer(optionIndex: number) {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (newAnswers.length === QUIZ_QUESTIONS.length) {
      setResult(computeQuizResult(newAnswers));
    } else {
      setCurrentQ(currentQ + 1);
    }
  }

  function resetQuiz() {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
  }

  function closeQuiz() {
    setIsOpen(false);
    setTimeout(resetQuiz, 300);
  }

  return (
    <>
      <Section background="deep-purple" id="quiz">
        <Container className="text-center">
          <ScrollReveal>
            <h2 className="font-heading text-[clamp(2rem,5vw,4rem)] mb-6">
              NOT SURE WHICH IS RIGHT FOR YOU?
            </h2>
            <p className="text-foreground-muted text-body-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Four questions. Thirty seconds. Anthony effectively asks you these
              anyway on the first call &mdash; this just saves us both some time.
              Answer honestly and we&apos;ll point you at the right tier.
            </p>
            <Button onClick={() => setIsOpen(true)} size="lg">
              LET&apos;S FIND OUT
            </Button>
          </ScrollReveal>
        </Container>
      </Section>

      {/* Quiz Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-charcoal/90 backdrop-blur-md"
              onClick={closeQuiz}
            />

            {/* Modal */}
            <motion.div
              className="relative w-full max-w-xl bg-background-elevated border border-white/10 rounded-xl p-8 md:p-10 z-10"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Close button */}
              <button
                onClick={closeQuiz}
                className="absolute top-4 right-4 text-foreground-muted hover:text-off-white transition-colors cursor-pointer"
                aria-label="Close quiz"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {result ? (
                /* Result */
                <div className="text-center">
                  <p className="text-coral font-heading text-sm tracking-widest mb-2">
                    OUR RECOMMENDATION
                  </p>
                  <h3 className="font-heading text-[48px] mb-4">
                    {QUIZ_RESULTS[result].heading}
                  </h3>
                  <p className="text-foreground-muted text-lg mb-8 leading-relaxed">
                    {QUIZ_RESULTS[result].body}
                  </p>
                  <div className="flex flex-col gap-3">
                    <a
                      href={QUIZ_RESULTS[result].href}
                      onClick={closeQuiz}
                      className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md transition-all cursor-pointer active:scale-[0.97] active:duration-75 bg-coral hover:bg-coral-hover text-off-white shadow-[var(--shadow-glow-coral)] hover:shadow-[0_0_30px_rgba(241,99,99,0.4)] px-8 md:px-10 py-4 text-lg"
                    >
                      {QUIZ_RESULTS[result].cta}
                    </a>
                    <button
                      onClick={resetQuiz}
                      className="text-foreground-muted text-sm hover:text-off-white transition-colors cursor-pointer"
                    >
                      Retake quiz
                    </button>
                  </div>
                </div>
              ) : (
                /* Question */
                <div>
                  {/* Progress */}
                  <div className="flex gap-2 mb-8">
                    {QUIZ_QUESTIONS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= currentQ ? "bg-coral" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-foreground-subtle text-sm mb-2">
                    Question {currentQ + 1} of {QUIZ_QUESTIONS.length}
                  </p>
                  <h3 className="font-heading text-2xl md:text-3xl mb-8">
                    {QUIZ_QUESTIONS[currentQ].question}
                  </h3>

                  <div className="flex flex-col gap-3">
                    {QUIZ_QUESTIONS[currentQ].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        className="text-left p-4 rounded-lg border border-white/10 hover:border-coral/50 hover:bg-coral/5 transition-all text-foreground-muted hover:text-off-white cursor-pointer"
                      >
                        <span className="text-coral font-heading mr-3">
                          {String.fromCharCode(65 + i)})
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ---------------------------------------------------------------------------
// 8. Booking Flows
// ---------------------------------------------------------------------------

// 8a. Spotlight Booking
export function SpotlightBooking() {
  const [step, setStep] = useState<"select" | "brief" | "processing">("select");
  const [selectedType, setSelectedType] = useState<string>("podcast_endroll");
  const [formData, setFormData] = useState({
    brandName: "",
    productService: "",
    keyMessage: "",
    showNotesUrl: "",
    wordsToAvoid: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slotTypes = [
    { id: "podcast_endroll", label: "End-Roll", price: "\u00a3500" },
    { id: "podcast_midroll", label: "Mid-Roll", price: "\u00a31,200" },
    { id: "newsletter_classified", label: "Newsletter Classified", price: "\u00a3400" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/sponsor/spotlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotType: selectedType,
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div id="spotlight-booking" className="scroll-mt-24">
      <h3 className="font-heading text-2xl mb-6 text-coral">BOOK A SPOTLIGHT</h3>

      {step === "select" && (
        <div>
          <p className="text-foreground-muted mb-6">
            Choose your placement type:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {slotTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedType === type.id
                    ? "border-coral bg-coral/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <p className="font-heading text-lg text-off-white">{type.label}</p>
                <p className="text-coral font-medium">{type.price}</p>
              </button>
            ))}
          </div>
          <Button onClick={() => setStep("brief")} size="md">
            CONTINUE TO BRIEF
          </Button>
        </div>
      )}

      {step === "brief" && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-foreground-muted leading-relaxed">
            Keep the brief tight. Anthony scripts the read himself &mdash; you&apos;re
            telling him what to say, not writing the script for him. The shorter and
            clearer this is, the better the result.
          </p>

          <div>
            <label className="block text-sm text-foreground-muted mb-2">Brand name *</label>
            <input
              type="text"
              required
              value={formData.brandName}
              onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground-muted mb-2">Product / Service *</label>
            <input
              type="text"
              required
              value={formData.productService}
              onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground-muted mb-2">
              Key message (200 chars) *
            </label>
            <textarea
              required
              maxLength={200}
              rows={3}
              value={formData.keyMessage}
              onChange={(e) => setFormData({ ...formData, keyMessage: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors resize-none"
            />
            <p className="text-foreground-subtle text-xs mt-1">
              {formData.keyMessage.length}/200
            </p>
          </div>

          <div>
            <label className="block text-sm text-foreground-muted mb-2">Show notes URL</label>
            <input
              type="url"
              value={formData.showNotesUrl}
              onChange={(e) => setFormData({ ...formData, showNotesUrl: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors"
              placeholder="https://"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground-muted mb-2">
              Words to avoid (optional)
            </label>
            <input
              type="text"
              value={formData.wordsToAvoid}
              onChange={(e) => setFormData({ ...formData, wordsToAvoid: e.target.value })}
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => setStep("select")}
              variant="ghost"
              size="md"
            >
              BACK
            </Button>
            <Button type="submit" size="md" disabled={isSubmitting}>
              {isSubmitting ? "PROCESSING..." : "PROCEED TO CHECKOUT"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

// 8b. Quarter Pre-Screener
export function QuarterBooking() {
  const [submitted, setSubmitted] = useState(false);
  const [budget, setBudget] = useState("");
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [launchMonth, setLaunchMonth] = useState("");
  const [showCalendly, setShowCalendly] = useState(false);
  const [redirectToSpotlight, setRedirectToSpotlight] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    if (budget === "under_2k" || budget === "2k_6k") {
      setRedirectToSpotlight(true);
    } else {
      setShowCalendly(true);
      // Notify the team about the qualified quarter enquiry (fire-and-forget)
      fetch("/api/sponsor/quarter-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, budget, launchMonth }),
      }).catch(() => {});
    }
  }

  // Generate next 6 months + Flexible
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      options.push({
        value: d.toISOString().slice(0, 7),
        label: d.toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      });
    }
    options.push({ value: "flexible", label: "Flexible" });
    return options;
  }, []);

  if (redirectToSpotlight) {
    return (
      <div id="quarter-booking" className="scroll-mt-24">
        <h3 className="font-heading text-2xl mb-6 text-coral">QUARTER BOOKING</h3>
        <Card glass className="p-8">
          <p className="text-foreground-muted leading-relaxed mb-6">
            Look, the Quarter starts at &pound;6k and we can&apos;t flex that. But a
            Spotlight at &pound;500 is a proper entry point &mdash; one placement,
            real numbers, no commitment. Start there and see how it goes.
          </p>
          <Button href="#spotlight-booking" size="md">
            BOOK A SPOTLIGHT INSTEAD
          </Button>
        </Card>
      </div>
    );
  }

  if (showCalendly) {
    return (
      <div id="quarter-booking" className="scroll-mt-24">
        <h3 className="font-heading text-2xl mb-6 text-coral">BOOK A CALL</h3>
        <Card glass className="p-8">
          <p className="text-foreground-muted mb-6">
            Great. Let&apos;s get a call in the diary.
          </p>
          {/* Calendly embed placeholder — replace CALENDLY_URL with actual Calendly link */}
          <div className="bg-charcoal rounded-lg p-8 text-center border border-white/10">
            <p className="text-foreground-muted mb-4">
              Calendly booking widget loads here.
            </p>
            <p className="text-foreground-subtle text-sm">
              Brand: {brandName} | Launch: {launchMonth}
            </p>
            {/* TODO: Replace with actual Calendly embed */}
            <a
              href={`https://calendly.com/roadmancycling/quarter-call?name=${encodeURIComponent(brandName)}&a1=${encodeURIComponent(launchMonth)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-coral hover:underline"
            >
              Open Calendly in new tab
            </a>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div id="quarter-booking" className="scroll-mt-24">
      <h3 className="font-heading text-2xl mb-6 text-coral">CHECK AVAILABILITY</h3>
      <p className="text-foreground-muted leading-relaxed mb-6">
        Three questions before we get a call in the diary. Honest answers only &mdash;
        if the Quarter isn&apos;t right for you, we&apos;ll tell you and point you at
        something that is.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm text-foreground-muted mb-2">Brand name + Website URL *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Brand name"
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors"
            />
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-foreground-muted mb-2">Approximate budget *</label>
          <select
            required
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Select budget range</option>
            <option value="under_2k">Under &pound;2,000</option>
            <option value="2k_6k">&pound;2,000 &ndash; &pound;5,999</option>
            <option value="6k_12k">&pound;6,000 &ndash; &pound;12,000</option>
            <option value="12k_20k">&pound;12,000 &ndash; &pound;20,000</option>
            <option value="20k_plus">&pound;20,000+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-foreground-muted mb-2">Target launch month *</label>
          <select
            required
            value={launchMonth}
            onChange={(e) => setLaunchMonth(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">Select month</option>
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" size="md">
          CHECK AVAILABILITY
        </Button>
      </form>
    </div>
  );
}

// 8c. Annual Application Form
export function AnnualApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    brandName: "",
    website: "",
    contactNameTitle: "",
    contactEmail: "",
    brandDescription: "",
    targetCustomer: "",
    outcome: "",
    budgetRange: "",
    previousExperience: "",
    categoryNotes: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/sponsor/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div id="annual-booking" className="scroll-mt-24">
        <Card glass className="p-8 text-center">
          <h3 className="font-heading text-3xl mb-4">APPLICATION RECEIVED</h3>
          <p className="text-foreground-muted leading-relaxed max-w-xl mx-auto">
            Anthony reads these himself and responds within 48 hours &mdash; usually
            faster. If you don&apos;t hear back in two working days, check your spam
            filter and then email{" "}
            <a href="mailto:partnerships@roadmancycling.com" className="text-coral hover:underline">
              partnerships@roadmancycling.com
            </a>{" "}
            directly.
          </p>
        </Card>
      </div>
    );
  }

  const inputClass =
    "w-full bg-charcoal border border-white/10 rounded-lg px-4 py-3 text-off-white focus:border-coral focus:outline-none transition-colors";

  return (
    <div id="annual-booking" className="scroll-mt-24">
      <h3 className="font-heading text-2xl mb-4 text-coral">APPLY FOR PARTNERSHIP</h3>
      <p className="text-foreground-muted leading-relaxed mb-8">
        Three brands a year. That&apos;s the rule and it won&apos;t change. If
        you&apos;re applying, tell us who you are and what you&apos;re actually
        trying to achieve. This goes directly to Anthony. He reads them himself.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Brand name */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">1. Brand name *</label>
          <input type="text" required value={form.brandName} onChange={(e) => updateField("brandName", e.target.value)} className={inputClass} />
        </div>

        {/* 2. Website */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">2. Website *</label>
          <input type="url" required value={form.website} onChange={(e) => updateField("website", e.target.value)} className={inputClass} placeholder="https://" />
        </div>

        {/* 3. Contact */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">3. Primary contact name and title *</label>
          <input type="text" required value={form.contactNameTitle} onChange={(e) => updateField("contactNameTitle", e.target.value)} className={inputClass} />
        </div>

        {/* 4. Email */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">4. Contact email *</label>
          <input type="email" required value={form.contactEmail} onChange={(e) => updateField("contactEmail", e.target.value)} className={inputClass} />
        </div>

        {/* 5. Brand description */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">
            5. Describe your brand in two sentences *
          </label>
          <p className="text-foreground-subtle text-xs mb-2">Not your marketing copy. What you actually do and who buys it.</p>
          <textarea required maxLength={300} rows={3} value={form.brandDescription} onChange={(e) => updateField("brandDescription", e.target.value)} className={`${inputClass} resize-none`} />
          <p className="text-foreground-subtle text-xs mt-1">{form.brandDescription.length}/300</p>
        </div>

        {/* 6. Target customer */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">
            6. Who is your target customer and why do you think they overlap with the Roadman audience? *
          </label>
          <textarea required maxLength={500} rows={4} value={form.targetCustomer} onChange={(e) => updateField("targetCustomer", e.target.value)} className={`${inputClass} resize-none`} />
          <p className="text-foreground-subtle text-xs mt-1">{form.targetCustomer.length}/500</p>
        </div>

        {/* 7. Outcome */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">
            7. What&apos;s the outcome you&apos;re looking for from a year-long partnership? *
          </label>
          <p className="text-foreground-subtle text-xs mb-2">Be specific. &quot;Brand awareness&quot; is not specific.</p>
          <textarea required maxLength={500} rows={4} value={form.outcome} onChange={(e) => updateField("outcome", e.target.value)} className={`${inputClass} resize-none`} />
          <p className="text-foreground-subtle text-xs mt-1">{form.outcome.length}/500</p>
        </div>

        {/* 8. Budget */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">8. Budget range *</label>
          <select required value={form.budgetRange} onChange={(e) => updateField("budgetRange", e.target.value)} className={`${inputClass} cursor-pointer`}>
            <option value="">Select budget range</option>
            <option value="96k">&pound;96k/yr (&pound;8k/mo)</option>
            <option value="120k_180k">&pound;120k &ndash; &pound;180k/yr</option>
            <option value="180k_plus">&pound;180k+/yr</option>
            <option value="discuss">Let&apos;s discuss</option>
          </select>
        </div>

        {/* 9. Previous experience */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">
            9. Previous podcast/sport sponsorship experience &mdash; what worked, what didn&apos;t? *
          </label>
          <textarea required maxLength={500} rows={4} value={form.previousExperience} onChange={(e) => updateField("previousExperience", e.target.value)} className={`${inputClass} resize-none`} />
          <p className="text-foreground-subtle text-xs mt-1">{form.previousExperience.length}/500</p>
        </div>

        {/* 10. Category notes */}
        <div>
          <label className="block text-sm text-foreground-muted mb-2">
            10. Anything about your category or business we should know?
          </label>
          <p className="text-foreground-subtle text-xs mb-2">Category exclusivity, competitor restrictions, timing constraints &mdash; flag it here.</p>
          <textarea maxLength={300} rows={3} value={form.categoryNotes} onChange={(e) => updateField("categoryNotes", e.target.value)} className={`${inputClass} resize-none`} />
          <p className="text-foreground-subtle text-xs mt-1">{form.categoryNotes.length}/300</p>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? "SUBMITTING..." : "SUBMIT APPLICATION"}
        </Button>
      </form>
    </div>
  );
}
