"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import styles from "./SceneViewer.module.scss";

// ========================
// SceneViewer — the main game area
// Left: scene image (66%), Right: text panel (33%)
// ========================

export default function SceneViewer() {
  const { scenes, currentScene, currentConnections, loadScene, visitScene } =
    useGameStore();

  // On first load, pick the starting scene
  // (Detective's Office) and load it
  useEffect(() => {
    if (scenes.length > 0 && !currentScene) {
      const startScene = scenes.find((s) => s.name === "Detective's Office");

      if (startScene) {
        loadScene(startScene.id);
        visitScene(startScene.id);
      }
    }
  }, [scenes, currentScene, loadScene, visitScene]);

  // Nothing loaded yet
  if (!currentScene) return null;

  // Find scene names for each connection
  // so exits show "Main Bar" instead of a UUID
  const exits = currentConnections.map((conn) => {
    const targetScene = scenes.find((s) => s.id === conn.scene_id_to);
    return {
      ...conn,
      targetName: targetScene?.name || "Unknown",
      targetLocked: targetScene?.is_locked || false,
    };
  });

  // Navigate to another scene
  const handleNavigate = async (sceneId: string) => {
    await loadScene(sceneId);
    await visitScene(sceneId);
  };

  return (
    <div className={styles.viewer}>
      {/* Left — scene image (66%) */}
      <div className={styles.sceneContent}>
        {currentScene.image_url ? (
          <div className={styles.sceneImage}>
            <img
              src={currentScene.image_url}
              alt={currentScene.name}
              className={styles.image}
            />
          </div>
        ) : (
          <div className={styles.scenePlaceholder}>
            <div className={styles.vignette} />
            <div className={styles.placeholderInfo}>
              <h2 className={styles.sceneName}>{currentScene.name}</h2>
            </div>
          </div>
        )}
      </div>

      {/* Right — text panel (33%) */}
      <div className={styles.textPanel}>
        {/* Scene description */}
        <div className={styles.description}>
          <h3 className={styles.descriptionTitle}>{currentScene.name}</h3>
          <p className={styles.descriptionText}>{currentScene.description}</p>
        </div>

        {/* Navigation exits */}
        {exits.length > 0 && (
          <div className={styles.exits}>
            {exits.map((exit) => (
              <button
                key={exit.id}
                className={`${styles.exitButton} ${
                  exit.targetLocked ? styles.locked : ""
                }`}
                onClick={() =>
                  !exit.targetLocked && handleNavigate(exit.scene_id_to)
                }
                disabled={exit.targetLocked}
              >
                <span className={styles.exitLabel}>
                  {exit.label || exit.targetName}
                </span>
                {exit.targetLocked && (
                  <span className={styles.lockIcon}>🔒</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
