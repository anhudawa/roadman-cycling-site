import { Suspense } from "react";
import { Header, Footer, Section, Container } from "@/components/layout";
import { listVerifiedCourses } from "@/lib/race-predictor/store";
import { PredictForm } from "./_components/PredictForm";
import type { CourseCardItem } from "./_components/CourseCard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Race Predictor | Roadman Cycling",
  description:
    "Physics-grade time prediction for your event. Free first insight; full pacing plan, fuelling and equipment scenarios in the $29 Race Report.",
};

export default async function PredictPage() {
  const rows = await listVerifiedCourses().catch(() => []);
  const courses: CourseCardItem[] = rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    country: r.country,
    region: r.region,
    distanceM: r.distanceM,
    elevationGainM: r.elevationGainM,
    courseData: r.courseData,
    eventDates: r.eventDates,
  }));

  return (
    <>
      <Header />
      <main id="main-content">
        {/* HERO — aurora bg, gradient headline, value props */}
        <Section
          background="deep-purple"
          grain
          className="pt-32 pb-12 section-glow-coral"
        >
          <div className="aurora-container" aria-hidden>
            <div className="aurora-band aurora-band-1" />
            <div className="aurora-band aurora-band-2" />
            <div className="aurora-band aurora-band-3" />
          </div>
          <Container className="relative">
            <div className="max-w-3xl">
              <p className="text-coral text-xs uppercase tracking-[0.3em] mb-4">
                Race Predictor
              </p>
              <h1 className="font-display text-5xl md:text-7xl uppercase tracking-tight text-off-white leading-[0.95] mb-5">
                Stop guessing.
                <br />
                <span className="text-gradient-animated">Race the clock</span>{" "}
                instead.
              </h1>
              <p className="text-off-white/80 text-lg max-w-2xl mb-6">
                Physics-grade time prediction built on the same principles
                Anthony hears from World Tour coaches. Your power. Your kit.
                Your event. The number that matters — with the work needed to
                hit it.
              </p>
              <ul className="grid sm:grid-cols-3 gap-3 max-w-2xl">
                <Pillar
                  label="Free first insight"
                  text="Predict any course in seconds"
                />
                <Pillar
                  label="$29 Race Report"
                  text="Per-km plan, fuelling, equipment"
                />
                <Pillar
                  label="Real physics"
                  text="W' balance, NP, yaw-aware aero"
                />
              </ul>
            </div>
          </Container>
        </Section>

        {/* FORM */}
        <Section background="charcoal" className="!py-10">
          <Container width="narrow">
            <Suspense fallback={<FormSkeleton />}>
              <PredictForm courses={courses} />
            </Suspense>
          </Container>
        </Section>

        {/* CREDIBILITY STRIP */}
        <Section background="deep-purple" className="!py-10">
          <Container width="narrow">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple/30 to-deep-purple/40 p-6 md:p-8">
              <p className="text-coral text-xs uppercase tracking-[0.3em] mb-3">
                Why this works
              </p>
              <h2 className="font-display text-3xl md:text-4xl uppercase tracking-tight text-off-white mb-5">
                Not a calculator.
                <br />
                <span className="text-coral">A simulation engine.</span>
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <Credibility
                  title="Per-segment physics"
                  body="Power balance solved per ~100m segment with smoothed gradients, climb detection and surface-aware Crr."
                />
                <Credibility
                  title="Yaw-aware aero"
                  body="Wind direction folded into yaw angle; CdA varies by position and apparent wind."
                />
                <Credibility
                  title="Durability built in"
                  body="W' balance tracker keeps the plan within reach — no fantasy power for hour 4."
                />
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </>
  );
}

function Pillar({ label, text }: { label: string; text: string }) {
  return (
    <li className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
      <p className="text-coral text-[10px] uppercase tracking-[0.2em] mb-1.5">
        {label}
      </p>
      <p className="text-sm text-off-white/85 leading-snug">{text}</p>
    </li>
  );
}

function Credibility({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-display text-base uppercase tracking-wide text-off-white mb-2">
        {title}
      </p>
      <p className="text-sm text-off-white/70 leading-relaxed">{body}</p>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-16 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
      <div className="skeleton h-32 rounded-2xl" />
      <div className="skeleton h-48 rounded-2xl" />
    </div>
  );
}
