"use client";

import Link from "next/link";
import styles from "./Hero.module.scss";

// ========================
// Hero — full-screen noir landing
// ========================

export default function Hero() {
  return (
    <main className={styles.hero}>
      {/* Fog overlay for atmosphere */}
      <div className={styles.fog} />

      {/* Center content */}
      <div className={styles.content}>
        <h1 className={styles.title}>Whodunit</h1>
        <p className={styles.tagline}>
          Every suspect has a secret. Every clue has a cost.
        </p>

        {/* Call to action */}
        <div className={styles.actions}>
          <Link href="/login" className={styles.playButton}>
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
