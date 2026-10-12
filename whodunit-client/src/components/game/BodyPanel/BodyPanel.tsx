"use client";

import { useState } from "react";
import type { CSSProperties, MouseEvent, SyntheticEvent } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useUIStore } from "@/stores/uiStore";
import styles from "./BodyPanel.module.scss";

export default function BodyPanel() {
  const { setBodyPanelOpen } = useUIStore();
  const { currentClues, gameState } = useGameStore();

  // ========================
  // Image shape (width / height)
  // We read it when the image loads, so the wrapper can
  // fit the image inside the scene area exactly.
  // 16 / 9 is only a starting guess until the image loads.
  // ========================
  const [ratio, setRatio] = useState(16 / 9);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setRatio(naturalWidth / naturalHeight);
  };

  // ========================
  // Clues that have a spot on this image.
  // Clues without an x and y never show in this panel.
  // ========================
  const panelClues = currentClues.filter((c) => c.x != null && c.y != null);
  const foundIds = gameState?.clues_found ?? [];

  const allCluesFound =
    panelClues.length > 0 && panelClues.every((c) => foundIds.includes(c.id));

  // ========================
  // Dev helper: shift+click logs x/y in percent,
  // the same way the scene images do.
  // ========================
  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!e.shiftKey) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
    console.log(`x: ${x}, y: ${y}`);
  };

  return (
    <div className={styles.panel}>
      {/* The wrapper is exactly the size of the image,
          so the percentages stay correct on any screen */}
      <div
        className={styles.imageWrapper}
        style={{ "--ratio": ratio } as CSSProperties}
        onClick={handleImageClick}
      >
        <img
          src="/assets/images/scenes/singer-body.png"
          alt="Clara's body, seen from above"
          className={styles.image}
          onLoad={handleImageLoad}
        />
      </div>

      {/* Close button: only after every clue on this image is found */}
      {allCluesFound && (
        <button
          className={styles.closeBtn}
          onClick={() => setBodyPanelOpen(false)}
        >
          Close
        </button>
      )}
    </div>
  );
}
