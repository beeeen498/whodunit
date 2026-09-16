"use client";

import { useUIStore } from "@/stores/uiStore";
import { useAudioStore } from "@/stores/audioStore";
import styles from "./ActionBar.module.scss";

// ========================
// ActionBar — bottom bar with game actions
// and audio controls
// ========================

export default function ActionBar() {
  const { activePanel, togglePanel } = useUIStore();
  const { isMuted, toggleMute } = useAudioStore();

  return (
    <div className={styles.bar}>
      {/* Left — game action buttons */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${
            activePanel === "inventory" ? styles.active : ""
          }`}
          onClick={() => togglePanel("inventory")}
        >
          Clues
        </button>

        <button
          className={`${styles.actionButton} ${
            activePanel === "evidence" ? styles.active : ""
          }`}
          onClick={() => togglePanel("evidence")}
        >
          Evidence
        </button>

        <button
          className={`${styles.actionButton} ${
            activePanel === "suspects" ? styles.active : ""
          }`}
          onClick={() => togglePanel("suspects")}
        >
          Suspects
        </button>
      </div>

      {/* Right — audio controls */}
      <div className={styles.audio}>
        <button className={styles.audioButton} onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
