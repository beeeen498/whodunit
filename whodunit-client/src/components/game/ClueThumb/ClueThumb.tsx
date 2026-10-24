"use client";

import type { CSSProperties } from "react";
import type { Clue } from "@/types";
import styles from "./ClueThumb.module.scss";

interface ClueThumbProps {
  clue: Clue;
  index: number; // place in the list, used for the tilt
  onClick: () => void;
}

// ========================
// Small tilts, in degrees.
// Each polaroid takes one, based on its place in the list,
// so the same clue always has the same tilt.
// ========================
const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1];

export default function ClueThumb({ clue, index, onClick }: ClueThumbProps) {
  const tilt = TILTS[index % TILTS.length];

  return (
    <button
      className={styles.polaroid}
      style={{ "--tilt": `${tilt}deg` } as CSSProperties}
      onClick={onClick}
    >
      {/* ---- The photo: the clue's picture, or dark if none yet ---- */}
      <div className={styles.photo}>
        {clue.image_url && <img src={clue.image_url} alt={clue.name} />}
      </div>

      {/* ---- The name, written under the photo ---- */}
      <span className={styles.caption}>{clue.name}</span>
    </button>
  );
}
