"use client";

import { useEffect, useState } from "react";
import type { Clue } from "@/types";
import { useUIStore } from "@/stores/uiStore";
import { useGameStore } from "@/stores/gameStore";
import ClueThumb from "@/components/game/ClueThumb/ClueThumb";
import ClueModal from "@/components/game/ClueModal/ClueModal";
import styles from "./CaseFile.module.scss";

// ========================
// CaseFile — the case folder over the scene.
// Two tabs: Clues and People.
// Opens from the ActionBar buttons.
// ========================

export default function CaseFile() {
  const { activePanel, openPanel, closePanel } = useUIStore();
  const { foundClues, loadFoundClues } = useGameStore();

  // The clue open in the big popup (null = none)
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);

  const isOpen = activePanel === "clues" || activePanel === "people";

  // ========================
  // Each time the folder opens, load the latest found clues
  // ========================
  useEffect(() => {
    if (isOpen) loadFoundClues();
  }, [isOpen, loadFoundClues]);

  if (!isOpen) return null;

  // ========================
  // Clues tab: everything except statements
  // (statements show under the person in People)
  // ========================
  const clueCards = foundClues.filter((c) => c.type !== "statement");

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
          {/* ======================== CLUES TAB ======================== */}
          {activePanel === "clues" &&
            (clueCards.length === 0 ? (
              <p className={styles.empty}>No clues yet.</p>
            ) : (
              <div className={styles.grid}>
                {clueCards.map((clue, i) => (
                  <ClueThumb
                    key={clue.id}
                    clue={clue}
                    index={i}
                    onClick={() => setSelectedClue(clue)}
                  />
                ))}
              </div>
            ))}

          {/* ======================== PEOPLE TAB ======================== */}
          {activePanel === "people" && (
            <p className={styles.empty}>People go here</p>
          )}
        </div>

        {/* ---- Big popup for the clicked clue ----
            Inside the folder, so clicking it doesn't close the folder */}
        {selectedClue && (
          <ClueModal
            clue={selectedClue}
            onClose={() => setSelectedClue(null)}
          />
        )}
      </div>
    </div>
  );
}
