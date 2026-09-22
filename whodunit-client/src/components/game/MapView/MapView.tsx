"use client";

import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import styles from "./MapView.module.scss";

interface MapViewProps {
  exits: {
    id: string;
    scene_id_to: string;
    label: string | null;
    x: number;
    y: number;
    targetName: string;
    targetLocked: boolean;
  }[];
}

export default function MapView({ exits }: MapViewProps) {
  const { loadScene, visitScene, scenes } = useGameStore();
  const { clear } = useTextStore();

  const handleNavigate = async (sceneId: string, locked: boolean) => {
    if (locked) return;
    clear();
    await loadScene(sceneId);
    await visitScene(sceneId);
  };

  const availableExits = exits.filter((exit) => !exit.targetLocked);

  return (
    <div className={styles.mapContainer}>
      {/* Rain overlay */}
      <div className={styles.rain} />
      <div className={styles.rainFog} />

      {/* Content */}
      <div className={styles.content}>
        <h2 className={styles.title}>Chicago</h2>
        <p className={styles.subtitle}>Where to, detective?</p>

        <div className={styles.locations}>
          {availableExits.map((exit) => {
            const scene = scenes.find((s) => s.id === exit.scene_id_to);
            return (
              <button
                key={exit.id}
                className={`${styles.polaroid} ${exit.targetLocked ? styles.locked : ""}`}
                onClick={() =>
                  handleNavigate(exit.scene_id_to, exit.targetLocked)
                }
                disabled={exit.targetLocked}
              >
                {/* Photo area */}
                <div className={styles.photo}>
                  {scene?.image_url ? (
                    <img
                      src={scene.image_url}
                      alt={exit.targetName}
                      className={styles.photoImage}
                    />
                  ) : (
                    <div className={styles.photoPlaceholder} />
                  )}
                  {exit.targetLocked && (
                    <div className={styles.lockedOverlay}>
                      <span>🔒</span>
                    </div>
                  )}
                </div>

                {/* Handwritten label */}
                <span className={styles.label}>
                  {exit.label || exit.targetName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
