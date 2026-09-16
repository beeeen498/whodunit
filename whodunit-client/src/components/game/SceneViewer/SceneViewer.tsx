"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import TextPanel from "@/components/game/TextPanel/TextPanel";
import styles from "./SceneViewer.module.scss";

// ========================
// SceneViewer — the main game area
// Left: scene image (66%), Right: text panel (33%)
// ========================

export default function SceneViewer() {
  const { scenes, currentScene, currentConnections, loadScene, visitScene } =
    useGameStore();
  const { addLines, clear } = useTextStore();

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

  // Clears old text when entering a new scene,and feeds the scene description as a narrator line that types out.
  useEffect(() => {
    if (currentScene) {
      clear();
      addLines([{ text: currentScene.description || "", speaker: "narrator" }]);
    }
  }, [currentScene, addLines, clear]);

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
      <TextPanel />
    </div>
  );
}
