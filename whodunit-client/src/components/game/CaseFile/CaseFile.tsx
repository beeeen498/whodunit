"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useGameStore } from "@/stores/gameStore";
import styles from "./CaseFile.module.scss";

// ========================
// CaseFile — the case folder over the scene.
// Two tabs: Clues and People.
// Opens from the ActionBar buttons.
// ========================

export default function CaseFile() {
  const { activePanel, openPanel, closePanel } = useUIStore();
  const { foundClues, loadFoundClues } = useGameStore();

  const isOpen = activePanel === "clues" || activePanel === "people";

  // ========================
  // Each time the folder opens, load the latest found clues
  // ========================
  useEffect(() => {
    if (isOpen) loadFoundClues();
  }, [isOpen, loadFoundClues]);

  if (!isOpen) return null;

  return (
    // ---- Dark background: click it to close ----
    <div className={styles.backdrop} onClick={closePanel}>
      {/* stopPropagation = clicks inside the folder don't close it */}
      <div className={styles.folder} onClick={(e) => e.stopPropagation()}>
        {/* ---- Paper tabs on top of the folder ---- */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activePanel === "clues" ? styles.activeTab : ""
            }`}
            onClick={() => openPanel("clues")}
          >
            Clues
          </button>

          <button
            className={`${styles.tab} ${
              activePanel === "people" ? styles.activeTab : ""
            }`}
            onClick={() => openPanel("people")}
          >
            People
          </button>

          <button className={styles.close} onClick={closePanel}>
            Close ✕
          </button>
        </div>

        {/* ---- Inside the folder ---- */}
        <div className={styles.content}>
          {/* For now, just a count, to test the endpoint */}
          {activePanel === "clues" && (
            <p className={styles.placeholder}>
              {foundClues.length} clues found
            </p>
          )}

          {activePanel === "people" && (
            <p className={styles.placeholder}>People go here</p>
          )}
        </div>
      </div>
    </div>
  );
}
