'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  durationMs?: number;
  format?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => n.toLocaleString('en-GB');

export function CounterAnimated({ value, durationMs = 900, format = defaultFormat, className }: Props) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const progress = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <span className={className}>{format(display)}</span>;
}
