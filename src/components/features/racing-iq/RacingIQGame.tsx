"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advance,
  applyDecision,
  createInitialState,
  enterScenario,
  resolveOptions,
} from "@/lib/racing-iq/engine";
import { GATE_AFTER_INDEX, SCENARIOS } from "@/lib/racing-iq/scenarios";
import { scoreGame } from "@/lib/racing-iq/scoring";
import type { GameResult, GameState, Scenario } from "@/lib/racing-iq/types";
import { racingIqAnalytics } from "@/lib/racing-iq/analytics";
import { RaceAudio } from "./audio";
import { RaceWorld } from "./world/RaceWorld";
import type { WorldMoment } from "./world/scene";
import { BroadcastHud } from "./BroadcastHud";
import { DecisionPanel } from "./DecisionPanel";
import { OutcomeCard } from "./OutcomeCard";
import { EmailGate } from "./EmailGate";
import { LoadingSequence } from "./LoadingSequence";
import { ResultScreen } from "./ResultScreen";

type Phase =
  | "loading"
  | "intro"
  | "riding"
  | "decision"
  | "outcome"
  | "gate"
  | "result";

const TOTAL_KM = 120;
const RIDE_MS = 5200;
const RIDE_MS_REDUCED = 1400;

/** How the world stages each scenario. */
function momentFor(scenario: Scenario, state: GameState): WorldMoment {
  const base = {
    environment: scenario.environment,
    timeOfDay: scenario.timeOfDay,
    position: state.position,
  } as const;
  switch (scenario.id) {
    case "early-break":
      // The break dangles up the road — staged as a forward group.
      return { ...base, position: "chasing", formation: "bunch", speed: 11 };
    case "pull-through":
      return { ...base, formation: "paceline", speed: 12.5 };
    case "crosswind":
      return { ...base, formation: "echelon", speed: 14.5, wind: true };
    case "fuel-call":
      return { ...base, formation: "bunch", speed: 9.5 };
    case "descent":
      return { ...base, formation: "descent", speed: 23, grade: -7, wet: true };
    case "final-climb":
      return { ...base, formation: "climb", speed: 5.5, grade: 7 };
    case "finale":
      return { ...base, formation: "sprint", speed: 16.5, crowd: true };
    default:
      return { ...base, formation: "bunch", speed: 11 };
  }
}

const INTRO_MOMENT: WorldMoment = {
  environment: "valley",
  timeOfDay: 0.04,
  formation: "bunch",
  position: "bunch",
  speed: 10,
};

const RESULT_MOMENT: WorldMoment = {
  environment: "town",
  timeOfDay: 1,
  formation: "bunch",
  position: "bunch",
  speed: 6,
  crowd: true,
};

export default function RacingIQGame() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [state, setState] = useState<GameState>(createInitialState);
  const [notice, setNotice] = useState<string | undefined>();
  const [outcomeText, setOutcomeText] = useState("");
  const [result, setResult] = useState<GameResult | null>(null);
  const [worldReady, setWorldReady] = useState(false);
  const [minLoadDone, setMinLoadDone] = useState(false);
  const [muted, setMuted] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const [knownEmail, setKnownEmail] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const audioRef = useRef<RaceAudio | null>(null);
  const rideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scenario = SCENARIOS[Math.min(state.scenarioIndex, SCENARIOS.length - 1)];
  // The result counts as frozen too: the world cuts to the iso shot,
  // desaturates and dims, which keeps the verdict legible over it.
  const frozen =
    phase === "decision" || phase === "outcome" || phase === "gate" || phase === "result";

  // Reduced motion preference, read once.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  // Mute persistence.
  useEffect(() => {
    setMuted(localStorage.getItem("riq-muted") === "1");
  }, []);
  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem("riq-muted", next ? "1" : "0");
      audioRef.current?.setMuted(next);
      return next;
    });
  }, []);

  // Minimum loader time so the route profile gets its moment.
  useEffect(() => {
    const t = setTimeout(() => setMinLoadDone(true), reducedMotion ? 400 : 2800);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  useEffect(() => {
    if (phase === "loading" && worldReady && minLoadDone) setPhase("intro");
  }, [phase, worldReady, minLoadDone]);

  // Audio follows the game.
  useEffect(() => {
    audioRef.current?.setMatchesLeft(state.matches);
  }, [state.matches]);

  useEffect(() => () => audioRef.current?.dispose(), []);

  const worldMoment = useMemo<WorldMoment>(() => {
    if (phase === "loading" || phase === "intro") return INTRO_MOMENT;
    if (phase === "result") return RESULT_MOMENT;
    return momentFor(scenario, state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, scenario, state.position]);

  useEffect(() => {
    audioRef.current?.setCrowd(!!worldMoment.crowd);
    audioRef.current?.setIntensity(Math.min(1, worldMoment.speed / 20));
  }, [worldMoment]);

  const beginScenario = useCallback(
    (nextState: GameState) => {
      const s = SCENARIOS[nextState.scenarioIndex];
      const entered = enterScenario(s, nextState);
      setState(entered.state);
      setNotice(entered.notice);
      setPhase("riding");
      racingIqAnalytics.scenarioStarted(s.id, nextState.scenarioIndex);
      if (rideTimer.current) clearTimeout(rideTimer.current);
      rideTimer.current = setTimeout(
        () => {
          audioRef.current?.uiOpen();
          setPhase("decision");
        },
        reducedMotion ? RIDE_MS_REDUCED : RIDE_MS
      );
    },
    [reducedMotion]
  );
  useEffect(() => () => {
    if (rideTimer.current) clearTimeout(rideTimer.current);
  }, []);

  const start = useCallback(() => {
    const audio = audioRef.current ?? new RaceAudio();
    audioRef.current = audio;
    audio.init();
    audio.setMuted(muted);
    beginScenario(createInitialState());
  }, [beginScenario, muted]);

  const decide = useCallback(
    (optionId: string) => {
      audioRef.current?.uiConfirm();
      const resolution = applyDecision(scenario, optionId, state);
      setState(resolution.state);
      setOutcomeText(resolution.outcome.text);
      setPulseKey((k) => k + 1);
      setPhase("outcome");
      racingIqAnalytics.decisionMade(scenario.id, optionId, resolution.state.matches);
    },
    [scenario, state]
  );

  const continueRace = useCallback(() => {
    if (state.scenarioIndex === GATE_AFTER_INDEX && !emailCaptured) {
      setPhase("gate");
      racingIqAnalytics.gateShown();
      return;
    }
    const next = advance(state);
    if (next.scenarioIndex >= SCENARIOS.length) {
      setResult(scoreGame(next, SCENARIOS));
      setPhase("result");
      return;
    }
    beginScenario(next);
  }, [state, emailCaptured, beginScenario]);

  const onGateDone = useCallback(
    (captured: boolean, email: string | null) => {
      setEmailCaptured(captured);
      setKnownEmail(email);
      const next = advance(state);
      beginScenario(next);
    },
    [state, beginScenario]
  );

  const replay = useCallback(() => {
    setResult(null);
    setOutcomeText("");
    setNotice(undefined);
    beginScenario(createInitialState());
  }, [beginScenario]);

  const resolvedOptions = useMemo(
    () => resolveOptions(scenario, state),
    [scenario, state]
  );

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-deep-purple">
      <RaceWorld
        moment={worldMoment}
        frozen={frozen}
        freezeShot={phase === "result" ? "wide" : "iso"}
        pulseKey={pulseKey}
        reducedMotion={reducedMotion}
        onReady={() => setWorldReady(true)}
      />

      {/* Letterbox bars — broadcast freeze framing */}
      <div
        aria-hidden="true"
        className="riq-letterbox pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-black/85 sm:h-16"
        style={{ transform: frozen ? "translateY(0)" : "translateY(-100%)" }}
      />
      <div
        aria-hidden="true"
        className="riq-letterbox pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-black/85 sm:h-16"
        style={{ transform: frozen ? "translateY(0)" : "translateY(100%)" }}
      />
      {/* Vignette, always on — night-mode broadcast feel */}
      <div aria-hidden="true" className="riq-vignette pointer-events-none absolute inset-0 z-[5]" />

      {phase !== "loading" && phase !== "intro" && phase !== "result" && (
        <BroadcastHud
          km={scenario.km}
          totalKm={TOTAL_KM}
          kicker={phase === "riding" ? scenario.kicker : null}
          matches={state.matches}
          muted={muted}
          onToggleMute={toggleMute}
          onBurn={() => audioRef.current?.matchStrike()}
        />
      )}

      {phase === "intro" && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-4">
          <div className="riq-fade-in max-w-xl text-center">
            <p className="font-heading text-sm tracking-[0.45em] text-coral">
              ROADMAN CYCLING PRESENTS
            </p>
            <h1 className="mt-2 font-heading text-7xl uppercase leading-none tracking-wide text-off-white sm:text-8xl">
              Racing IQ
            </h1>
            <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-off-white/80">
              One race. Seven decisions. Five matches in the box. Most
              riders lose this race 40k before the finish — let’s see
              where you lose it.
            </p>
            <button
              type="button"
              onClick={start}
              className="mt-8 bg-coral px-10 py-4 font-heading text-xl uppercase tracking-[0.25em] text-off-white shadow-glow-coral transition-colors hover:bg-coral-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral"
            >
              Roll out
            </button>
            <p className="mt-4 text-xs tracking-wide text-off-white/40">
              8 minutes · sound on recommended
            </p>
          </div>
        </div>
      )}

      {phase === "decision" && (
        <DecisionPanel
          scenario={scenario}
          setup={scenario.setup(state)}
          notice={notice}
          options={resolvedOptions}
          onDecide={decide}
          onFocusOption={() => audioRef.current?.uiFocus()}
        />
      )}

      {phase === "outcome" && (
        <OutcomeCard
          scenario={scenario}
          outcomeText={outcomeText}
          onContinue={continueRace}
          continueLabel={
            state.scenarioIndex >= SCENARIOS.length - 1
              ? "See the verdict"
              : "Back to the race"
          }
        />
      )}

      {phase === "gate" && <EmailGate onDone={onGateDone} />}

      {phase === "result" && result && (
        <ResultScreen
          result={result}
          matchesLeft={state.matches}
          emailCaptured={emailCaptured}
          knownEmail={knownEmail}
          onReplay={replay}
        />
      )}

      <LoadingSequence done={phase !== "loading"} />
    </div>
  );
}
