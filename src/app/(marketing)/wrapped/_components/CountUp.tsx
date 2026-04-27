"use client";

import { useEffect, useState } from "react";

interface Props {
  to: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Re-trigger when the key changes — used to restart on card change. */
  trigger?: string | number;
}

/**
 * Big-number counter that eases up from zero. Used by the Wrapped cards
 * for the headline stat reveals.
 *
 * Re-runs whenever `trigger` changes — typically the parent's card index.
 * The effect deliberately resets to 0 each run so the same card seen
 * twice still feels alive.
 */
export function CountUp({
  to,
  duration = 1400,
  className = "",
  prefix = "",
  suffix = "",
  trigger,
}: Props) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- animation reset on prop change
    setValue(0);
    const start = performance.now();
    const target = Math.max(0, Math.round(to));
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, trigger]);

  return (
    <span
      className={className}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {prefix}
      {value.toLocaleString("en-GB")}
      {suffix}
    </span>
  );
}
