"use client";

import { useGameStore } from "@/stores/gameStore";
import styles from "./Hotspot.module.scss";

// ========================
// ExitHotspot — clickable point on the scene image
// Positioned with percentage-based x/y
// ========================

interface HotspotProps {
  connectionId: string;
  targetSceneId: string;
  label: string;
  x: number;
  y: number;
  locked: boolean;
  onClick?: () => void;
}

export default function Hotspot({
  targetSceneId,
  label,
  x,
  y,
  locked,
  onClick,
}: HotspotProps) {
  const { loadScene, visitScene } = useGameStore();

  const handleClick = async () => {
    if (locked) return;
    if (onClick) {
      onClick();
      return;
    }
    await loadScene(targetSceneId);
    await visitScene(targetSceneId);
  };

  return (
    <button
      className={`${styles.hotspot} ${locked ? styles.locked : ""}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={handleClick}
      disabled={locked}
    >
      <span className={styles.pulse} />
      <span className={styles.label}>{label}</span>
      {locked && <span className={styles.lock}>🔒</span>}
    </button>
  );
}
