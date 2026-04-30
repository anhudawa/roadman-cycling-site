"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { WrappedData } from "@/lib/season-wrapped/types";
import {
  biggestMonth,
  cardMeta,
  climbingMetaphor,
  distanceMetaphor,
  longestRideHeadline,
  notDoneYetHeadline,
  personalityHeadline,
  powerStory,
  streakHeadline,
} from "@/lib/season-wrapped/cards";
import {
  formatHours,
  formatKm,
  formatM,
  formatPercentile,
} from "@/lib/season-wrapped/format";
import { CountUp } from "./CountUp";
import { MonthBars } from "./MonthBars";
import { PowerLine } from "./PowerLine";

interface CardProps {
  data: WrappedData;
  trigger: number;
}

const REVEAL = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

function Eyebrow({ children, step }: { children: React.ReactNode; step: { step: number; total: number } }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <p className="font-display text-coral text-[11px] uppercase tracking-[0.32em]">
        {children}
      </p>
      <p className="font-display text-off-white/70 text-[10px] uppercase tracking-[0.22em]">
        {step.step.toString().padStart(2, "0")} / {step.total.toString().padStart(2, "0")}
      </p>
    </div>
  );
}

/* ── Card 1: Year Total ─────────────────────────────────────────── */

export function YearTotalCard({ data, trigger }: CardProps) {
  const meta = cardMeta("year_total");
  const km = Math.round(data.totals.distanceM / 1000);
  const firstName = data.rider.firstName ?? "You";
  return (
    <CardShell>
      <Eyebrow step={meta}>{firstName}&apos;s year on the bike</Eyebrow>
      <motion.div className="mt-4" {...REVEAL} transition={{ delay: 0.1 }}>
        <p
          className="font-display text-off-white leading-[0.85]"
          style={{
            fontSize: "clamp(5rem, 22vw, 14rem)",
            letterSpacing: "-0.04em",
          }}
        >
          <CountUp to={km} trigger={trigger} />
        </p>
        <p className="mt-2 font-display text-coral text-2xl md:text-3xl uppercase tracking-[0.18em]">
          Kilometres
        </p>
      </motion.div>
      <motion.p
        className="mt-6 max-w-md text-off-white/85 text-base md:text-lg"
        {...REVEAL}
        transition={{ delay: 0.6 }}
      >
        {distanceMetaphor(data.totals.distanceM)}
      </motion.p>
      <motion.div
        className="mt-6 grid grid-cols-3 gap-2 max-w-md"
        {...REVEAL}
        transition={{ delay: 0.85 }}
      >
        <Stat label="Rides" value={data.totals.rides.toString()} />
        <Stat label="Hours" value={formatHours(data.totals.timeS)} />
        <Stat label="Vs others" value={formatPercentile(data.percentile.distance)} />
      </motion.div>
    </CardShell>
  );
}

/* ── Card 2: Climbing ───────────────────────────────────────────── */

export function ClimbingCard({ data, trigger }: CardProps) {
  const meta = cardMeta("climbing");
  const c = climbingMetaphor(data.totals.elevationM);
  return (
    <CardShell>
      <Eyebrow step={meta}>Climbing machine</Eyebrow>
      <motion.div className="mt-4" {...REVEAL} transition={{ delay: 0.1 }}>
        <p
          className="font-display text-off-white leading-[0.85]"
          style={{
            fontSize: "clamp(4.5rem, 16vw, 11rem)",
            letterSpacing: "-0.03em",
          }}
        >
          {c.headline}
        </p>
        <p className="mt-2 font-display text-coral text-2xl md:text-3xl uppercase tracking-[0.16em]">
          <CountUp to={Math.round(data.totals.elevationM)} trigger={trigger} suffix=" m up" />
        </p>
      </motion.div>
      <motion.p
        className="mt-6 max-w-md text-off-white/85 text-base md:text-lg"
        {...REVEAL}
        transition={{ delay: 0.6 }}
      >
        {c.detail}
      </motion.p>
      <motion.p
        className="mt-2 max-w-md text-off-white/55 text-sm"
        {...REVEAL}
        transition={{ delay: 0.85 }}
      >
        {formatPercentile(data.percentile.elevation)} of riders by total elevation gain.
      </motion.p>
    </CardShell>
  );
}

/* ── Card 3: Biggest Month ─────────────────────────────────────── */

export function BiggestMonthCard({ data }: CardProps) {
  const meta = cardMeta("biggest_month");
  const top = biggestMonth(data);
  return (
    <CardShell>
      <Eyebrow step={meta}>Your biggest month</Eyebrow>
      <motion.div className="mt-4" {...REVEAL} transition={{ delay: 0.1 }}>
        <p
          className="font-display text-off-white leading-[0.85]"
          style={{
            fontSize: "clamp(4.5rem, 14vw, 9rem)",
            letterSpacing: "-0.02em",
          }}
        >
          {top.monthName}
        </p>
        <p className="mt-2 font-display text-coral text-xl md:text-2xl uppercase tracking-[0.16em]">
          {top.distanceKm.toLocaleString("en-GB")} km · {top.elevationM.toLocaleString("en-GB")} m
        </p>
      </motion.div>
      <motion.p
        className="mt-5 max-w-md text-off-white/85 text-base"
        {...REVEAL}
        transition={{ delay: 0.5 }}
      >
        {top.blurb}
      </motion.p>
      <motion.div
        className="mt-6 max-w-xl"
        {...REVEAL}
        transition={{ delay: 0.7 }}
      >
        <MonthBars monthly={data.monthly} highlightMonth={top.monthIndex} />
      </motion.div>
    </CardShell>
  );
}

/* ── Card 4: The Long One ─────────────────────────────────────── */

export function LongOneCard({ data, trigger }: CardProps) {
  const meta = cardMeta("long_one");
  const { headline, detail } = longestRideHeadline(data);
  const km = Math.round(data.longestRide.distanceM / 1000);
  return (
    <CardShell>
      <Eyebrow step={meta}>The long one</Eyebrow>
      <motion.div className="mt-4" {...REVEAL} transition={{ delay: 0.1 }}>
        <p
          className="font-display text-off-white leading-[0.85] break-words"
          style={{
            fontSize: data.longestRide.name
              ? "clamp(3rem, 10vw, 6.5rem)"
              : "clamp(5rem, 22vw, 14rem)",
            letterSpacing: "-0.02em",
          }}
        >
          {data.longestRide.name ? headline : <CountUp to={km} trigger={trigger} suffix=" km" />}
        </p>
        {data.longestRide.name && (
          <p className="mt-2 font-display text-coral text-2xl md:text-3xl uppercase tracking-[0.16em]">
            {km} km · {formatM(data.longestRide.elevationM)} m
          </p>
        )}
      </motion.div>
      <motion.p
        className="mt-6 max-w-md text-off-white/85 text-base md:text-lg"
        {...REVEAL}
        transition={{ delay: 0.6 }}
      >
        {detail}
      </motion.p>
    </CardShell>
  );
}

/* ── Card 5: Power Story ─────────────────────────────────────── */

export function PowerStoryCard({ data, trigger }: CardProps) {
  const meta = cardMeta("power_story");
  const story = powerStory(data);
  return (
    <CardShell>
      <Eyebrow step={meta}>Power story</Eyebrow>
      <motion.div className="mt-4" {...REVEAL} transition={{ delay: 0.1 }}>
        <p
          className={`font-display leading-[0.85] ${
            story.delta < 0 ? "text-off-white/85" : "text-off-white"
          }`}
          style={{
            fontSize: "clamp(5rem, 20vw, 13rem)",
            letterSpacing: "-0.04em",
          }}
        >
          {story.delta >= 0 ? "+" : ""}
          <CountUp to={Math.abs(story.delta)} trigger={trigger} />
          <span className="text-coral">W</span>
        </p>
        <p className="mt-2 font-display text-coral text-2xl md:text-3xl uppercase tracking-[0.16em]">
          {story.startW}W → {story.endW}W
        </p>
      </motion.div>
      <motion.p
        className="mt-6 max-w-md text-off-white/85 text-base md:text-lg"
        {...REVEAL}
        transition={{ delay: 0.5 }}
      >
        {story.detail}
      </motion.p>
      {data.ftp.history && data.ftp.history.length >= 2 && (
        <motion.div
          className="mt-6 max-w-xl"
          {...REVEAL}
          transition={{ delay: 0.7 }}
        >
          <PowerLine
            start={data.ftp.start}
            end={data.ftp.end}
            history={data.ftp.history}
          />
        </motion.div>
      )}
    </CardShell>
  );
}

/* ── Card 6: Personality ─────────────────────────────────────── */

export function PersonalityCard({ data }: CardProps) {
  const meta = cardMeta("personality");
  const p = personalityHeadline(data.personality.archetype);
  return (
    <CardShell>
      <Eyebrow step={meta}>Riding personality</Eyebrow>
      <motion.p
        className="mt-4 font-display text-coral text-[11px] uppercase tracking-[0.3em]"
        {...REVEAL}
        transition={{ delay: 0.1 }}
      >
        {p.spiritEyebrow} · {data.personality.spiritRider}
      </motion.p>
      <motion.div className="mt-2" {...REVEAL} transition={{ delay: 0.3 }}>
        <p
          className="font-display text-off-white leading-[0.85]"
          style={{
            fontSize: "clamp(4.5rem, 16vw, 11rem)",
            letterSpacing: "-0.03em",
          }}
        >
          {p.headline}
        </p>
      </motion.div>
      <motion.p
        className="mt-6 max-w-xl text-off-white/85 text-base md:text-lg leading-relaxed"
        {...REVEAL}
        transition={{ delay: 0.7 }}
      >
        {data.personality.body}
      </motion.p>
    </CardShell>
  );
}

/* ── Card 7: Streak ─────────────────────────────────────────── */

export function StreakCard({ data, trigger }: CardProps) {
  const meta = cardMeta("streak");
  const { detail } = streakHeadline(data);
  return (
    <CardShell>
      <Eyebrow step={meta}>Your streak</Eyebrow>
      <motion.div className="mt-4" {...REVEAL} transition={{ delay: 0.1 }}>
        <p
          className="font-display text-off-white leading-[0.85]"
          style={{
            fontSize: "clamp(5rem, 22vw, 14rem)",
            letterSpacing: "-0.04em",
          }}
        >
          <CountUp to={data.streak.longestWeeksUnbroken} trigger={trigger} />
        </p>
        <p className="mt-2 font-display text-coral text-2xl md:text-3xl uppercase tracking-[0.16em]">
          Weeks unbroken
        </p>
      </motion.div>
      <motion.p
        className="mt-6 max-w-md text-off-white/85 text-base md:text-lg"
        {...REVEAL}
        transition={{ delay: 0.6 }}
      >
        {detail}
      </motion.p>
      <motion.div
        className="mt-5 grid grid-cols-2 gap-2 max-w-sm"
        {...REVEAL}
        transition={{ delay: 0.8 }}
      >
        <Stat label="Days riding" value={data.streak.daysRidden.toString()} />
        <Stat label="Weeks active" value={`${data.streak.weeksRidden}/52`} />
      </motion.div>
    </CardShell>
  );
}

/* ── Card 8: Not Done Yet ────────────────────────────────────── */

export function NotDoneYetCard({ data }: CardProps) {
  const meta = cardMeta("not_done_yet");
  const c = notDoneYetHeadline(data);
  return (
    <CardShell>
      <Eyebrow step={meta}>{data.year + 1} is loading</Eyebrow>
      <motion.div className="mt-4" {...REVEAL} transition={{ delay: 0.1 }}>
        <p
          className="font-display text-off-white leading-[0.85]"
          style={{
            fontSize: "clamp(4.5rem, 16vw, 10rem)",
            letterSpacing: "-0.03em",
          }}
        >
          Not done
        </p>
        <p
          className="font-display text-coral leading-[0.85]"
          style={{
            fontSize: "clamp(4.5rem, 16vw, 10rem)",
            letterSpacing: "-0.03em",
          }}
        >
          yet.
        </p>
      </motion.div>
      <motion.p
        className="mt-6 max-w-xl text-off-white/85 text-base md:text-lg leading-relaxed"
        {...REVEAL}
        transition={{ delay: 0.5 }}
      >
        {c.detail}
      </motion.p>
      <motion.div
        className="mt-7 flex flex-wrap items-center gap-3"
        {...REVEAL}
        transition={{ delay: 0.8 }}
      >
        <Link
          href="/community/not-done-yet"
          data-track="wrapped_ndy_cta"
          className="inline-flex items-center gap-2 rounded-md bg-coral px-6 py-3 font-display text-base uppercase tracking-[0.18em] text-charcoal hover:bg-coral-hover transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-8px_rgba(241,99,99,0.65)]"
        >
          {c.cta}
          <span aria-hidden>→</span>
        </Link>
        <Link
          href="/community/clubhouse"
          className="font-display text-sm uppercase tracking-[0.18em] text-off-white/70 hover:text-off-white transition py-3"
        >
          Free Clubhouse first ↗
        </Link>
      </motion.div>
    </CardShell>
  );
}

/* ── Shared shell + small stat tile ──────────────────────────── */

function CardShell({ children }: { children: React.ReactNode }) {
  return <div className="w-full">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2">
      <p className="font-display text-[10px] uppercase tracking-[0.22em] text-off-white/55 leading-none">
        {label}
      </p>
      <p
        className="mt-1 font-display text-lg text-off-white leading-none"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
    </div>
  );
}
