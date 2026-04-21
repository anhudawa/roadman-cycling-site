import styles from "./GlitchHero.module.css";

/**
 * GlitchHero — pure-CSS animated portrait background. Six layers:
 * ambient radial glow, radial-masked portrait, red + cyan glitch
 * shards, three clip-path'd slice strips, vignette. All motion is
 * keyframe-driven so it server-renders and respects prefers-reduced-
 * motion.
 *
 * Designed to sit inside HeroSection (or any similar container) as
 * the visual backdrop — the component itself renders no overlay text
 * or CTAs. Headline, subtext, and buttons are the parent's job.
 */
export function GlitchHero() {
  return (
    <div className={styles.hero} aria-hidden="true">
      <div className={styles.glow} />
      <div className={styles.portrait} />

      <div className={`${styles.shard} ${styles.shardRed}`} />
      <div className={`${styles.shard} ${styles.shardCyan}`} />

      <div className={`${styles.slice} ${styles.sliceA}`} />
      <div className={`${styles.slice} ${styles.sliceB}`} />
      <div className={`${styles.slice} ${styles.sliceC}`} />

      <div className={styles.vignette} />
    </div>
  );
}
