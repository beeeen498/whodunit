"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { FaXmark } from "react-icons/fa6";
import type { Clue } from "@/types";
import ModelViewer from "./ModelViewer";
import styles from "./ClueModal.module.scss";

interface ClueModalProps {
  clue: Clue;
  imageUrl: string;
  ratio: number; // width / height of the body image
  onClose: () => void;
}

// How much the crop is zoomed in
const ZOOM = 3;

const clamp = (n: number) => Math.min(1, Math.max(0, n));

// Turns a clue's x or y (in percent) into a background-position
// that puts that spot in the middle of the photo.
// Clues near an edge stop at the edge.
const focusPercent = (value: number | null) =>
  value == null ? 50 : clamp(((value / 100) * ZOOM - 0.5) / (ZOOM - 1)) * 100;

export default function ClueModal({
  clue,
  imageUrl,
  ratio,
  onClose,
}: ClueModalProps) {
  const hasSpot = clue.x != null && clue.y != null;

  // Becomes true when the player touches the 3D model
  const [touched, setTouched] = useState(false);

  // ========================
  // What does this clue show?
  // model -> 3D model the player can spin
  // image -> the clue's own picture
  // neither -> a zoomed crop of the body image
  // ========================
  const isModel = clue.inspect_type === "model" && !!clue.inspect_url;
  const isImage = !isModel && !!clue.inspect_url;

  let photoStyle: CSSProperties;

  if (isModel) {
    photoStyle = { aspectRatio: "4 / 3" };
  } else if (isImage) {
    photoStyle = {
      aspectRatio: "4 / 3",
      backgroundImage: `url(${clue.inspect_url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  } else {
    photoStyle = {
      aspectRatio: ratio,
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: `${hasSpot ? ZOOM * 100 : 100}%`,
      backgroundPosition: `${focusPercent(clue.x)}% ${focusPercent(clue.y)}%`,
    };
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.polaroid}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <FaXmark />
        </button>

        <h3 className={styles.title}>{clue.name}</h3>

        <div
          className={styles.photo}
          style={photoStyle}
          onPointerDownCapture={() => setTouched(true)}
        >
          {isModel && <ModelViewer src={clue.inspect_url!} alt={clue.name} />}
        </div>

        {isModel && !touched && <p className={styles.hint}>Drag to rotate</p>}
        
        <p className={styles.description}>{clue.description}</p>
      </div>
    </div>
  );
}
