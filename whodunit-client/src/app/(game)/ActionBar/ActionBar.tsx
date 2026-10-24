"use client";

import { useUIStore } from "@/stores/uiStore";
import { useAudioStore } from "@/stores/audioStore";
import { useGameStore } from "@/stores/gameStore";
import styles from "./ActionBar.module.scss";

// ========================
// ActionBar — bottom bar with game actions
// and audio controls
// ========================

export default function ActionBar() {
  const { isMuted, toggleMute } = useAudioStore();
  const { activePanel, togglePanel } = useUIStore();
  // Is there something the player hasn't looked at yet?
  const { hasNewClues, hasNewPeople } = useGameStore();

  return (
    <div className={styles.bar}>
      {/* Left — game action buttons */}
      {/* Both open the case file, each on its own tab */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionButton} ${
            activePanel === "clues" ? styles.active : ""
          }`}
          onClick={() => togglePanel("clues")}
        >
          Clues
          {/* Small dot: a new clue was added to the case file */}
          {hasNewClues && <span className={styles.newDot} />}
        </button>

        <button
          className={`${styles.actionButton} ${
            activePanel === "people" ? styles.active : ""
          }`}
          onClick={() => togglePanel("people")}
        >
          People
          {/* Small dot: something new was added about a person */}
          {hasNewPeople && <span className={styles.newDot} />}
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
