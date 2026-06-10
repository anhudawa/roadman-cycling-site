/**
 * Minimal tween runner for the race world. We deliberately don't ship
 * GSAP — the camera choreography needs maybe six easing curves and a
 * ticker, and the 60fps-on-mobile floor is easier to hold with less JS.
 */

export type Ease = (t: number) => number;

export const easeLinear: Ease = (t) => t;
export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutQuint: Ease = (t) => 1 - Math.pow(1 - t, 5);
export const easeInOutSine: Ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
/** Slow, cinematic settle — for camera arrivals. */
export const easeOutExpo: Ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export interface TweenSpec {
  duration: number; // seconds
  delay?: number;
  ease?: Ease;
  onUpdate: (t: number) => void;
  onComplete?: () => void;
}

interface ActiveTween extends TweenSpec {
  elapsed: number;
  done: boolean;
}

export class Tweens {
  private active: ActiveTween[] = [];

  add(spec: TweenSpec): ActiveTween {
    const tween: ActiveTween = { ease: easeInOutCubic, delay: 0, ...spec, elapsed: 0, done: false };
    this.active.push(tween);
    return tween;
  }

  /** Advance all tweens by dt seconds (unscaled — camera moves keep
   * running while the world itself is frozen). */
  update(dt: number): void {
    for (const tween of this.active) {
      tween.elapsed += dt;
      const local = tween.elapsed - (tween.delay ?? 0);
      if (local <= 0) continue;
      const t = Math.min(1, local / tween.duration);
      tween.onUpdate((tween.ease ?? easeInOutCubic)(t));
      if (t >= 1) {
        tween.done = true;
        tween.onComplete?.();
      }
    }
    this.active = this.active.filter((t) => !t.done);
  }

  cancelAll(): void {
    this.active = [];
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Frame-rate independent exponential smoothing factor. */
export function damp(rate: number, dt: number): number {
  return 1 - Math.exp(-rate * dt);
}
