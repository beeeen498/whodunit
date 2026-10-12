"use client";

import type { MouseEvent } from "react";
import { useUIStore } from "@/stores/uiStore";
import styles from "./BodyPanel.module.scss";

export default function BodyPanel() {
  const { setBodyPanelOpen } = useUIStore();

  // ========================
  // Dev helper: shift+click logs x/y in percent,
  // the same way the scene images do. We use it to find
  // where each clue sits on the image.
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
      <div className={styles.imageWrapper} onClick={handleImageClick}>
        <img
          src="/assets/images/scenes/singer-body.png"
          alt="Clara's body, seen from above"
          className={styles.image}
        />
      </div>

      {/* Temporary close button. Later the panel will only
          close after all the clues are found. */}
      <button
        className={styles.closeBtn}
        onClick={() => setBodyPanelOpen(false)}
      >
        Close
      </button>
    </div>
  );
}
