import styles from "./GlitchHero.module.css";

/**
 * Animated hero block — pure CSS, no JS, no external libs. Six z-stacked
 * layers: ambient glow, portrait w/ radial mask, red + cyan glitch shards,
 * three clip-path'd slice strips, and a vignette, plus overlay text.
 *
 * All motion is in GlitchHero.module.css via @keyframes — server-renders
 * fine and respects prefers-reduced-motion automatically.
 */
export function GlitchHero() {
  return (
    <section className={styles.hero} aria-label="Roadman Cycling">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.portrait} aria-hidden="true" />

      <div className={`${styles.shard} ${styles.shardRed}`} aria-hidden="true" />
      <div className={`${styles.shard} ${styles.shardCyan}`} aria-hidden="true" />

      <div className={`${styles.slice} ${styles.sliceA}`} aria-hidden="true" />
      <div className={`${styles.slice} ${styles.sliceB}`} aria-hidden="true" />
      <div className={`${styles.slice} ${styles.sliceC}`} aria-hidden="true" />

      <div className={styles.vignette} aria-hidden="true" />

      <div className={styles.overlay}>
        <div>
          <span className={styles.live}>
            <span className={styles.dot} aria-hidden="true" />
            Roadman &middot; Live
          </span>
        </div>

        <div /> {/* grid spacer */}

        <div className={styles.footer}>
          <h1 className={styles.headline}>
            Ride the
            <span className={styles.accent}>signal.</span>
          </h1>
          <span className={styles.brand}>Roadman Cycling</span>
        </div>
      </div>
    </section>
  );
}
