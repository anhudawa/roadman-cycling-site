"use client";

import { useEffect, useState, useRef } from "react";
import { Section, Container } from "@/components/layout";
import { Button, ScrollReveal, GradientText, FloatingParticles } from "@/components/ui";

interface RecurringEvent {
  day: string;
  dayIndex: number; // 0 = Monday
  time: string;
  hours: number;
  minutes: number;
  title: string;
  subtitle: string;
  description: string;
  location?: string;
  locationDetail?: string;
  mapUrl?: string;
  cta?: string;
  ctaHref?: string;
  external?: boolean;
  type: "call" | "ride";
  color: "purple" | "coral";
}

const weeklyEvents: RecurringEvent[] = [
  {
    day: "MONDAY",
    dayIndex: 0,
    time: "7:30 PM",
    hours: 19,
    minutes: 30,
    title: "LIVE COACHING CALL",
    subtitle: "Not Done Yet Members",
    description:
      "Weekly live Q&A and coaching session with Anthony Walsh. Bring your questions on training, nutrition, race prep — anything. This is where the five-pillar system comes alive.",
    type: "call",
    color: "purple",
    cta: "Join Not Done Yet",
    ctaHref: "https://skool.com/roadmancycling",
    external: true,
  },
  {
    day: "THURSDAY",
    dayIndex: 3,
    time: "6:30 PM",
    hours: 18,
    minutes: 30,
    title: "THURSDAY CHOP",
    subtitle: "Open Group Ride",
    description:
      "The midweek hit-out. Fast-paced group ride through Phoenix Park. All abilities welcome — the group naturally splits. First couple of rides are on us, then join the club.",
    location: "Popes Cross, Phoenix Park",
    locationDetail: "Dublin",
    mapUrl: "https://maps.google.com/?q=Popes+Cross+Phoenix+Park+Dublin",
    type: "ride",
    color: "coral",
    cta: "Join Roadman CC — $75/year",
    ctaHref: "https://skool.com/roadmancycling",
    external: true,
  },
  {
    day: "SATURDAY",
    dayIndex: 5,
    time: "9:30 AM",
    hours: 9,
    minutes: 30,
    title: "SATURDAY SPIN",
    subtitle: "Community Group Ride",
    description:
      "The weekend social. Steady pace, good conversation, coffee stop. The ride that built the community. Come along for a spin — if you like it, join the club.",
    location: "360 Cycles, Clontarf",
    locationDetail: "Dublin",
    mapUrl: "https://maps.google.com/?q=360+Cycles+Clontarf+Dublin",
    type: "ride",
    color: "coral",
    cta: "Join Roadman CC — $75/year",
    ctaHref: "https://skool.com/roadmancycling",
    external: true,
  },
];

/* ── Countdown to next event ── */
function getNextEvent(): { event: RecurringEvent; msUntil: number } {
  const now = new Date();
  const currentDay = (now.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let bestEvent: RecurringEvent | null = null;
  let bestMs = Infinity;

  for (const event of weeklyEvents) {
    const eventMinutes = event.hours * 60 + event.minutes;
    let daysAhead = event.dayIndex - currentDay;

    if (daysAhead < 0 || (daysAhead === 0 && currentMinutes >= eventMinutes)) {
      daysAhead += 7;
    }

    const msAhead =
      daysAhead * 86400000 +
      (eventMinutes - currentMinutes) * 60000 -
      (now.getSeconds() * 1000 + now.getMilliseconds());

    if (msAhead < bestMs) {
      bestMs = msAhead;
      bestEvent = event;
    }
  }

  return { event: bestEvent!, msUntil: bestMs };
}

function useCountdown() {
  const [next, setNext] = useState(() => getNextEvent());

  useEffect(() => {
    const interval = setInterval(() => setNext(getNextEvent()), 1000);
    return () => clearInterval(interval);
  }, []);

  const totalSeconds = Math.max(0, Math.floor(next.msUntil / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { event: next.event, days, hours, minutes, seconds };
}

/* ── Animated countdown digit ── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  const prevRef = useRef(value);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      setAnimate(true);
      prevRef.current = value;
      const t = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg bg-deep-purple/80 border border-purple/20 flex items-center justify-center overflow-hidden">
        <span
          className={`font-heading text-3xl md:text-4xl text-off-white transition-transform duration-300 ${
            animate ? "countdown-flip" : ""
          }`}
        >
          {String(value).padStart(2, "0")}
        </span>
        {/* Shine line */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent h-1/2" />
      </div>
      <span className="text-[10px] md:text-xs text-foreground-subtle font-heading tracking-widest mt-2">
        {label}
      </span>
    </div>
  );
}

/* ── Animated timeline connector ── */
function TimelineConnector() {
  return (
    <div className="hidden md:flex absolute left-[3.25rem] top-0 bottom-0 w-px">
      <div className="w-full h-full bg-gradient-to-b from-purple/40 via-coral/20 to-coral/40 timeline-pulse" />
    </div>
  );
}

/* ── Timeline dot ── */
function TimelineDot({ color, active }: { color: "purple" | "coral"; active: boolean }) {
  return (
    <div className="hidden md:flex absolute left-[2.5rem] top-8 z-10">
      <div
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          color === "purple"
            ? "border-[#A855F7] bg-deep-purple"
            : "border-coral bg-deep-purple"
        }`}
      >
        <div
          className={`w-2 h-2 rounded-full ${
            active
              ? color === "purple"
                ? "bg-[#A855F7] pulse-glow"
                : "bg-coral pulse-glow"
              : color === "purple"
              ? "bg-[#A855F7]/60"
              : "bg-coral/60"
          }`}
        />
      </div>
    </div>
  );
}

/* ── Radial week visualisation ── */
function WeekWheel({ nextEventDay }: { nextEventDay: string }) {
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const eventDays: Record<string, { label: string; color: string }> = {
    MON: { label: "COACH", color: "#A855F7" },
    THU: { label: "CHOP", color: "#F16363" },
    SAT: { label: "SPIN", color: "#F16363" },
  };

  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto">
      {/* Outer ring */}
      <svg className="w-full h-full" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4C1273" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#F16363" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4C1273" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />
      </svg>

      {/* Day nodes */}
      {days.map((day, i) => {
        const angle = (i / 7) * Math.PI * 2 - Math.PI / 2;
        const radius = 170;
        const x = 200 + Math.cos(angle) * radius;
        const y = 200 + Math.sin(angle) * radius;
        const event = eventDays[day];
        const isNext = day === nextEventDay.slice(0, 3);

        return (
          <div
            key={day}
            className="absolute flex flex-col items-center"
            style={{
              left: `${(x / 400) * 100}%`,
              top: `${(y / 400) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {event ? (
              <div
                className={`relative flex flex-col items-center justify-center w-14 h-14 md:w-18 md:h-18 rounded-full border-2 transition-all duration-500 ${
                  isNext ? "scale-110" : ""
                }`}
                style={{
                  borderColor: event.color,
                  background: `radial-gradient(circle, ${event.color}20 0%, transparent 70%)`,
                  boxShadow: isNext ? `0 0 24px ${event.color}40` : "none",
                }}
              >
                <span
                  className="font-heading text-[10px] md:text-xs tracking-wider"
                  style={{ color: event.color }}
                >
                  {day}
                </span>
                <span className="font-heading text-[8px] md:text-[10px] text-off-white">
                  {event.label}
                </span>
                {isNext && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ borderColor: event.color, border: "1px solid" }}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10">
                <span className="font-heading text-[9px] md:text-[10px] text-foreground-subtle tracking-wider">
                  {day}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="font-heading text-xs md:text-sm text-coral tracking-widest block">
            YOUR
          </span>
          <span className="font-heading text-2xl md:text-3xl text-off-white block leading-none">
            WEEK
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Event Card ── */
function EventCard({
  event,
  index,
  isNext,
}: {
  event: RecurringEvent;
  index: number;
  isNext: boolean;
}) {
  const colorClasses =
    event.color === "purple"
      ? {
          border: "border-[#A855F7]/30 hover:border-[#A855F7]/60",
          glow: "hover:shadow-[0_0_40px_rgba(168,85,247,0.15)]",
          accent: "text-[#A855F7]",
          bg: "from-[#A855F7]/8 to-transparent",
          dot: "bg-[#A855F7]",
          badge: "bg-[#A855F7]/20 text-[#A855F7]",
        }
      : {
          border: "border-coral/30 hover:border-coral/60",
          glow: "hover:shadow-[0_0_40px_rgba(241,99,99,0.15)]",
          accent: "text-coral",
          bg: "from-coral/8 to-transparent",
          dot: "bg-coral",
          badge: "bg-coral/20 text-coral",
        };

  return (
    <ScrollReveal direction="up" delay={index * 0.12}>
      <div className="relative md:pl-20">
        <TimelineDot color={event.color} active={isNext} />

        <div
          className={`group relative rounded-2xl border ${colorClasses.border} ${colorClasses.glow} bg-background-elevated/40 backdrop-blur-md overflow-hidden transition-all duration-500`}
        >
          {/* Top accent line */}
          <div
            className={`h-px w-full ${
              event.color === "purple"
                ? "bg-gradient-to-r from-transparent via-purple/60 to-transparent"
                : "bg-gradient-to-r from-transparent via-coral/60 to-transparent"
            }`}
          />

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Time block */}
              <div className="shrink-0">
                <div
                  className={`inline-flex flex-col items-center px-5 py-4 rounded-xl border ${
                    event.color === "purple"
                      ? "border-[#A855F7]/20 bg-[#A855F7]/5"
                      : "border-coral/20 bg-coral/5"
                  }`}
                >
                  <span className={`font-heading text-sm ${colorClasses.accent} tracking-wider`}>
                    {event.day}
                  </span>
                  <span className="font-heading text-3xl md:text-4xl text-off-white leading-none mt-1">
                    {event.time.split(" ")[0]}
                  </span>
                  <span className="text-xs text-foreground-subtle uppercase mt-1">
                    {event.time.split(" ")[1]}
                  </span>
                </div>
                {isNext && (
                  <div className="mt-2 text-center">
                    <span className={`text-[10px] font-heading tracking-widest ${colorClasses.accent} animate-pulse`}>
                      UP NEXT
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  {event.type === "call" ? (
                    <svg className={`w-5 h-5 ${colorClasses.accent}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ) : (
                    <svg className={`w-5 h-5 ${colorClasses.accent}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                    </svg>
                  )}
                  <h3 className="font-heading text-2xl md:text-3xl text-off-white leading-none">
                    {event.title}
                  </h3>
                </div>

                <span className={`inline-block text-xs font-heading tracking-wider px-3 py-1 rounded-full mb-4 ${colorClasses.badge}`}>
                  {event.subtitle.toUpperCase()}
                </span>

                <p className="text-foreground-muted text-sm leading-relaxed mb-5 max-w-xl">
                  {event.description}
                </p>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 mb-5">
                    <svg
                      className="w-4 h-4 text-foreground-subtle shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {event.mapUrl ? (
                      <a
                        href={event.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground-muted hover:text-coral transition-colors group/map"
                      >
                        {event.location}, {event.locationDetail}
                        <span className="text-foreground-subtle ml-1 group-hover/map:text-coral transition-colors">
                          &rarr; Map
                        </span>
                      </a>
                    ) : (
                      <span className="text-sm text-foreground-muted">
                        {event.location}
                      </span>
                    )}
                  </div>
                )}

                {/* CTA */}
                {event.cta && event.ctaHref && (
                  <Button
                    href={event.ctaHref}
                    external={event.external}
                    variant="ghost"
                    size="sm"
                  >
                    {event.cta} &rarr;
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Hover gradient */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-br ${colorClasses.bg}`}
          />
        </div>
      </div>
    </ScrollReveal>
  );
}

/* ── Main Client Component ── */
export function EventsClient() {
  const { event: nextEvent, days, hours, minutes, seconds } = useCountdown();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Hero with particles */}
      <Section background="deep-purple" grain className="pt-32 pb-20 relative overflow-hidden">
        <FloatingParticles count={15} color="rgba(76, 18, 115, 0.2)" />
        <div className="aurora-container" aria-hidden="true">
          <div className="aurora-band aurora-band-1" />
          <div className="aurora-band aurora-band-2" />
        </div>

        <Container className="text-center relative z-10">
          <ScrollReveal direction="up">
            <p className="text-coral font-heading text-lg mb-4 tracking-widest">
              EVERY WEEK &middot; RAIN OR SHINE
            </p>
            <h1
              className="font-heading text-off-white mb-6"
              style={{ fontSize: "var(--text-hero)" }}
            >
              <GradientText as="span">THE CALENDAR</GradientText>
            </h1>
            <p className="text-foreground-muted text-xl max-w-2xl mx-auto mb-12">
              A coaching call to sharpen the mind. A midweek ride to sharpen
              the legs. A weekend spin to keep the soul in it. This is how
              a community trains.
            </p>
          </ScrollReveal>

          {/* Countdown to next event */}
          {mounted && (
            <ScrollReveal direction="up" delay={0.2}>
              <div className="inline-flex flex-col items-center">
                <p className="text-foreground-subtle text-sm font-heading tracking-widest mb-4">
                  NEXT UP &mdash;{" "}
                  <span className={nextEvent.color === "purple" ? "text-[#A855F7]" : "text-coral"}>
                    {nextEvent.title}
                  </span>
                </p>
                <div className="flex gap-3 md:gap-4">
                  {days > 0 && <CountdownUnit value={days} label="DAYS" />}
                  <CountdownUnit value={hours} label="HOURS" />
                  <CountdownUnit value={minutes} label="MINS" />
                  <CountdownUnit value={seconds} label="SECS" />
                </div>
              </div>
            </ScrollReveal>
          )}
        </Container>
      </Section>

      {/* Gradient divider */}
      <div className="gradient-divider" />

      {/* Weekly Schedule with timeline */}
      <Section background="charcoal">
        <Container>
          <ScrollReveal direction="up" className="text-center mb-16">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              WEEKLY SCHEDULE
            </h2>
            <p className="text-foreground-muted max-w-lg mx-auto">
              Same time. Same place. Every week. Consistency is the system.
            </p>
          </ScrollReveal>

          <div className="relative max-w-3xl mx-auto">
            <TimelineConnector />
            <div className="space-y-8">
              {weeklyEvents.map((event, i) => (
                <EventCard
                  key={event.day}
                  event={event}
                  index={i}
                  isNext={mounted && nextEvent.day === event.day}
                />
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Gradient divider */}
      <div className="gradient-divider" />

      {/* Radial week visualisation */}
      <Section background="deep-purple" grain className="relative overflow-hidden">
        <FloatingParticles count={8} color="rgba(241, 99, 99, 0.1)" />
        <Container>
          <ScrollReveal direction="up" className="text-center mb-8">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              YOUR WEEK WITH ROADMAN
            </h2>
            <p className="text-foreground-muted max-w-md mx-auto">
              Three community touchpoints. Four days to train the plan.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.15}>
            {mounted && <WeekWheel nextEventDay={nextEvent.day} />}
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.25}>
            <p className="text-center text-foreground-subtle text-sm mt-6 max-w-sm mx-auto italic">
              &ldquo;The rhythm is the system. Show up three times a week
              and the rest takes care of itself.&rdquo;
            </p>
          </ScrollReveal>
        </Container>
      </Section>

      {/* CTA */}
      <Section background="charcoal">
        <Container width="narrow">
          <ScrollReveal direction="up">
            <div className="relative text-center rounded-2xl overflow-hidden">
              {/* Glass background */}
              <div className="absolute inset-0 bg-deep-purple/40 backdrop-blur-sm border border-purple/20 rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple/10 via-transparent to-coral/5 rounded-2xl" />

              <div className="relative z-10 p-10 md:p-14">
                <h2 className="font-heading text-4xl md:text-5xl text-off-white mb-4">
                  SHOW UP. CLIP IN.
                </h2>
                <p className="text-foreground-muted mb-8 max-w-md mx-auto text-lg">
                  The group rides are free and open to everyone. The coaching
                  call is for Not Done Yet members.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    href="https://skool.com/roadmancycling"
                    external
                    size="lg"
                  >
                    Join Not Done Yet
                  </Button>
                  <Button href="/community/clubhouse" variant="ghost" size="lg">
                    Join Free Community
                  </Button>
                </div>
                <p className="text-foreground-subtle text-xs mt-6">
                  7-day free trial &middot; Cancel anytime &middot; No contracts
                </p>
              </div>
            </div>
          </ScrollReveal>
        </Container>
      </Section>
    </>
  );
}
