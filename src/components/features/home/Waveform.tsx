import styles from "./PodcastHero.module.css";

/**
 * Pure-CSS animated waveform. Renders 32 bars with staggered
 * scaleY animations so it reads as a podcast signal pulsing in
 * place. Server-rendered, respects `prefers-reduced-motion`.
 */
export function Waveform() {
  return (
    <div className={styles.waveform} aria-hidden="true">
      {Array.from({ length: 32 }).map((_, i) => (
        <span key={i} className={styles.bar} />
      ))}
    </div>
  );
}
