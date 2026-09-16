"use client";

import Link from "next/link";
import styles from "./Hero.module.scss";

// ========================
// Hero — noir landing screen
// ========================

export default function Hero() {
  return (
    <main className={styles.hero}>
      {/* Layered atmosphere effects */}
      <div className={styles.venetianBlinds} />
      <div className={styles.filmGrain} />
      <div className={styles.vignette} />
      <div className={styles.smoke} />

      {/* Center content — sits above all overlays */}
      <div className={styles.content}>
        <h1 className={styles.title}>Whodunit</h1>
        <div className={styles.divider} />
        <p className={styles.tagline}>
          Every suspect lies. Every clue tells the truth.
        </p>

        {/* Call to action */}
        <div className={styles.actions}>
          <Link
            href="/case/2779d84d-2119-4e22-9a64-cff05ac48f36"
            className={styles.playButton}
          >
            Begin Investigation
          </Link>
        </div>
      </div>

      {/* Bottom credit */}
      <footer className={styles.footer}>
        <p>A noir detective mystery</p>
      </footer>
    </main>
  );
}
