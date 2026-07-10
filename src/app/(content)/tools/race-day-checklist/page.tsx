"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header, Footer, Section, Container } from "@/components/layout";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface ChecklistItem {
  id: string;
  label: string;
  custom?: boolean;
}

interface Phase {
  id: string;
  title: string;
  items: ChecklistItem[];
}

const PHASES: Phase[] = [
  {
    id: "48h",
    title: "48 HOURS BEFORE",
    items: [
      { id: "48h-bike-serviced", label: "Bike serviced and clean" },
      {
        id: "48h-tyres",
        label: "Tyres checked (pressure, sidewalls, sealant if tubeless)",
      },
      { id: "48h-chain", label: "Chain lubed" },
      { id: "48h-brakes", label: "Brakes checked" },
      {
        id: "48h-spares",
        label: "Spare tube/CO2/pump packed",
      },
      {
        id: "48h-nutrition",
        label: "Race nutrition purchased and portioned",
      },
      {
        id: "48h-kit",
        label: "Kit laid out (jersey, bibs, socks, gloves, glasses)",
      },
      { id: "48h-weather", label: "Weather checked, layers planned" },
      { id: "48h-route", label: "Route studied, key climbs noted" },
      {
        id: "48h-registration",
        label: "Race number/registration confirmed",
      },
    ],
  },
  {
    id: "night",
    title: "NIGHT BEFORE",
    items: [
      {
        id: "night-dinner",
        label: "Carb-rich dinner eaten (3 hours before bed)",
      },
      {
        id: "night-bottles",
        label: "Bottles prepared (electrolyte mix)",
      },
      { id: "night-gels", label: "Gels/bars in jersey pockets" },
      { id: "night-phone", label: "Phone charged" },
      {
        id: "night-head-unit",
        label: "Head unit charged and route loaded",
      },
      {
        id: "night-alarm",
        label: "Alarm set (3 hours before start)",
      },
      { id: "night-bag", label: "Kit bag packed by the door" },
    ],
  },
  {
    id: "morning",
    title: "RACE MORNING",
    items: [
      {
        id: "morning-breakfast",
        label: "Breakfast eaten (2-3 hours before start)",
      },
      {
        id: "morning-caffeine",
        label: "Caffeine taken (if using — 30-60 min before)",
      },
      { id: "morning-chamois", label: "Chamois cream applied" },
      {
        id: "morning-tyres",
        label: "Tyres checked (final pressure)",
      },
      {
        id: "morning-head-unit",
        label: "Head unit on, recording",
      },
      {
        id: "morning-emergency",
        label: "Emergency contact info on person",
      },
      {
        id: "morning-warmup",
        label: "Start line warm-up (10 min easy spinning)",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Checkmark SVG                                                      */
/* ------------------------------------------------------------------ */

function CheckmarkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M2.5 7.5L5.5 10.5L11.5 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function RaceDayChecklistPage() {
  const [activePhase, setActivePhase] = useState("48h");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<Record<string, ChecklistItem[]>>({
    "48h": [],
    night: [],
    morning: [],
  });
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState("");

  /* All items across every phase, including custom */
  const getAllItems = useCallback((): ChecklistItem[] => {
    const all: ChecklistItem[] = [];
    for (const phase of PHASES) {
      all.push(...phase.items);
      all.push(...(customItems[phase.id] || []));
    }
    return all;
  }, [customItems]);

  const totalItems = getAllItems().length;
  const checkedCount = checked.size;
  const progressPercent = totalItems > 0 ? (checkedCount / totalItems) * 100 : 0;
  const allComplete = totalItems > 0 && checkedCount === totalItems;

  /* Toggle a checkbox */
  const toggleItem = useCallback((id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /* Add a custom item */
  const addCustomItem = useCallback(
    (phaseId: string) => {
      const text = newItemText.trim();
      if (!text) return;
      const id = `custom-${phaseId}-${Date.now()}`;
      setCustomItems((prev) => ({
        ...prev,
        [phaseId]: [...(prev[phaseId] || []), { id, label: text, custom: true }],
      }));
      setNewItemText("");
      setAddingTo(null);
    },
    [newItemText]
  );

  /* Get items for a phase (base + custom) */
  const getPhaseItems = useCallback(
    (phaseId: string): ChecklistItem[] => {
      const phase = PHASES.find((p) => p.id === phaseId);
      if (!phase) return [];
      return [...phase.items, ...(customItems[phaseId] || [])];
    },
    [customItems]
  );

  const currentPhase = PHASES.find((p) => p.id === activePhase)!;
  const currentItems = getPhaseItems(activePhase);

  return (
    <>
      <Header />
      <main id="main-content">
        {/* Hero */}
        <Section background="deep-purple" grain className="pt-32 pb-12">
          <Container width="narrow" className="text-center">
            <p className="text-coral text-sm font-body font-medium uppercase tracking-widest mb-4">
              Free Race Day Tool
            </p>
            <h1
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              RACE DAY CHECKLIST
            </h1>
            <p className="text-foreground-muted text-lg">
              Everything you need, nothing you forget. Check off each item as you
              prepare &mdash; from 48 hours out to the start line.
            </p>

            {/* Print button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="mt-6 inline-flex items-center gap-2 text-sm font-heading tracking-wider uppercase text-foreground-muted hover:text-off-white border border-white/10 hover:border-white/20 rounded-md px-4 py-2 transition-all cursor-pointer"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M4 6V1h8v5M4 12H2.5A1.5 1.5 0 011 10.5v-4A1.5 1.5 0 012.5 5h11A1.5 1.5 0 0115 6.5v4a1.5 1.5 0 01-1.5 1.5H12M4 9h8v6H4V9z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Print Checklist
            </button>
          </Container>
        </Section>

        {/* Main checklist */}
        <Section background="charcoal" className="!py-12">
          <Container width="narrow">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-foreground-muted text-sm font-heading tracking-wider">
                  {checkedCount} OF {totalItems} COMPLETE
                </span>
                <span className="text-foreground-subtle text-sm">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: "#F16363" }}
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Completion message */}
            <AnimatePresence>
              {allComplete && (
                <motion.div
                  className="mb-8 bg-background-elevated rounded-xl border border-white/5 p-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <p
                    className="font-heading text-4xl md:text-5xl mb-2"
                    style={{ color: "#22C55E" }}
                  >
                    YOU&apos;RE READY.
                  </p>
                  <p
                    className="font-heading text-xl md:text-2xl tracking-widest"
                    style={{ color: "#22C55E" }}
                  >
                    GO SMASH IT.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase tabs */}
            <div className="flex gap-2 mb-6" role="tablist" aria-label="Checklist phases">
              {PHASES.map((phase) => {
                const isActive = activePhase === phase.id;
                const phaseItems = getPhaseItems(phase.id);
                const phaseChecked = phaseItems.filter((item) =>
                  checked.has(item.id)
                ).length;
                const phaseComplete = phaseItems.length > 0 && phaseChecked === phaseItems.length;

                return (
                  <button
                    key={phase.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${phase.id}`}
                    onClick={() => setActivePhase(phase.id)}
                    className={`flex-1 py-3 px-2 rounded-lg font-heading text-xs sm:text-sm tracking-wider transition-colors cursor-pointer ${
                      isActive
                        ? "bg-coral text-off-white"
                        : "bg-white/5 text-foreground-muted hover:bg-white/10"
                    }`}
                  >
                    <span className="block">{phase.title}</span>
                    {phaseComplete && (
                      <span className="block text-xs mt-1 opacity-70">&check;</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Phase content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePhase}
                id={`panel-${activePhase}`}
                role="tabpanel"
                aria-labelledby={activePhase}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="bg-background-elevated rounded-xl border border-white/5 p-6">
                  <h2 className="font-heading text-xl text-off-white mb-5">
                    {currentPhase.title}
                  </h2>

                  <div className="space-y-3">
                    {currentItems.map((item) => {
                      const isChecked = checked.has(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="checkbox"
                          aria-checked={isChecked}
                          onClick={() => toggleItem(item.id)}
                          className="flex items-center gap-4 w-full text-left group cursor-pointer"
                        >
                          {/* Custom checkbox */}
                          <div className="relative flex-shrink-0">
                            <motion.div
                              className="w-6 h-6 rounded border-2 flex items-center justify-center"
                              animate={{
                                backgroundColor: isChecked
                                  ? "#F16363"
                                  : "rgba(255,255,255,0)",
                                borderColor: isChecked
                                  ? "#F16363"
                                  : "rgba(255,255,255,0.2)",
                              }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                              <AnimatePresence>
                                {isChecked && (
                                  <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 20,
                                    }}
                                  >
                                    <CheckmarkIcon />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </div>

                          {/* Item label */}
                          <span
                            className={`text-sm transition-all duration-200 ${
                              isChecked
                                ? "line-through opacity-50 text-foreground-muted"
                                : "text-foreground-muted group-hover:text-off-white"
                            }`}
                          >
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom item */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <AnimatePresence mode="wait">
                      {addingTo === activePhase ? (
                        <motion.div
                          key="input"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addCustomItem(activePhase);
                              if (e.key === "Escape") {
                                setAddingTo(null);
                                setNewItemText("");
                              }
                            }}
                            placeholder="Add a custom item..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white placeholder:text-foreground-subtle focus:outline-none focus:border-coral/40 transition-colors"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => addCustomItem(activePhase)}
                            className="px-4 py-2 bg-coral text-off-white text-sm font-heading tracking-wider rounded-lg hover:bg-coral/90 transition-colors cursor-pointer"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingTo(null);
                              setNewItemText("");
                            }}
                            className="px-3 py-2 text-foreground-muted hover:text-off-white text-sm transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="add-btn"
                          type="button"
                          onClick={() => setAddingTo(activePhase)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2 text-sm text-foreground-subtle hover:text-foreground-muted transition-colors cursor-pointer"
                        >
                          <span className="w-6 h-6 rounded border border-dashed border-white/10 flex items-center justify-center text-xs">
                            +
                          </span>
                          Add custom item
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Related tools */}
            <motion.div
              className="mt-8 rounded-xl border border-white/10 p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <h3 className="font-heading text-lg text-off-white mb-3">RELATED TOOLS</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/tools/fuelling"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    In-Ride Fuelling Calculator &mdash; carbs and fluid per hour
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/tyre-pressure"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    Tyre Pressure Calculator &mdash; optimal PSI for race day
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tools/training-readiness"
                    className="text-coral hover:text-coral/80 text-sm transition-colors"
                  >
                    Training Readiness Check &mdash; should you train today?
                  </Link>
                </li>
              </ul>
            </motion.div>
          </Container>
        </Section>

        {/* CTA */}
        <Section background="charcoal" className="!pt-0 !pb-12">
          <Container width="narrow">
            <motion.div
              className="mt-8 rounded-2xl border border-coral/30 bg-gradient-to-br from-coral/10 via-deep-purple/40 to-charcoal p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.4 }}
            >
              <p className="font-heading text-off-white text-lg md:text-xl mb-2">
                NEVER WING RACE DAY AGAIN
              </p>
              <p className="text-foreground-muted text-sm mb-5 max-w-md mx-auto">
                Join 1,000+ cyclists who prepare like professionals. Race-day
                protocols, training advice, and a community that gets it.
              </p>
              <a
                href="https://www.skool.com/roadmancycling"
                className="inline-flex items-center justify-center gap-2 font-heading tracking-wider uppercase rounded-md bg-coral text-off-white hover:bg-coral/90 px-6 py-3 text-sm transition-all"
                data-track="tool_race_day_checklist_skool"
              >
                Join the Community
              </a>
            </motion.div>
          </Container>
        </Section>

        {/* Methodology */}
        <Section background="deep-purple" grain>
          <Container width="narrow">
            <h2
              className="font-heading text-off-white mb-4"
              style={{ fontSize: "var(--text-section)" }}
            >
              HOW TO USE THIS
            </h2>
            <div className="text-foreground-muted text-sm leading-relaxed space-y-3">
              <p>
                <strong className="text-off-white">Start 48 hours out.</strong>{" "}
                Work through each phase as the timing arrives. Check items off as
                you complete them. Add any personal items you need &mdash; spare
                cleats, race food you swear by, a lucky charm. The progress bar
                tracks your preparation across all three phases so you can see at
                a glance how ready you are.
              </p>
              <p>
                <strong className="text-off-white">Race morning.</strong> By the
                time you reach the start line, every item should be ticked. No
                scrambling. No second-guessing. You have done the work &mdash;
                now go race.
              </p>
              <p>
                <strong className="text-off-white">Disclaimer:</strong> This is a
                preparation checklist for informational purposes only. It does not
                replace professional coaching advice or event-specific
                requirements. Always check your event&apos;s mandatory equipment list
                and regulations.
              </p>
              <p className="text-xs text-foreground-subtle">
                Last updated: July 2026 &middot; Tool version 1.0
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}
