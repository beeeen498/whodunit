"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import TextPanel from "@/components/game/TextPanel/TextPanel";
import Hotspot from "../Hotspot/Hotspot";
import OfficeIntro from "@/components/sequences/OfficeIntro/OfficeIntro";
import MapView from "@/components/game/MapView/MapView";
import CabaretArrival from "@/components/sequences/CabaretArrival/CabaretArrival";
import DressingRoomScene from "@/components/sequences/DressingRoomScene/DressingRoomScene";
import styles from "./SceneViewer.module.scss";

export default function SceneViewer() {
  const { scenes, currentScene, currentConnections, loadScene, visitScene } =
    useGameStore();
  const { addLines, clear, activeLine, playerName } = useTextStore();
  const [gameStarted, setGameStarted] = useState(false);

  // Load starting scene after player clicks to begin
  useEffect(() => {
    if (!gameStarted) return;
    if (scenes.length > 0 && !currentScene) {
      const startScene = scenes.find((s) => s.name === "Detective's Office");
      if (startScene) {
        loadScene(startScene.id);
        visitScene(startScene.id);
      }
    }
  }, [scenes, currentScene, gameStarted, loadScene, visitScene]);

  // Feed narration for non-sequence scenes
  useEffect(() => {
    if (!gameStarted || !currentScene) return;
    if (currentScene.name === "Detective's Office") return;
    if (currentScene.name === "The Blue Moon Cabaret") return;
    if (currentScene.name === "Dressing Room") return; // add this line

    clear();
    addLines([{ text: currentScene.description || "", speaker: "narrator" }]);
  }, [currentScene, gameStarted, addLines, clear]);

  // Start screen
  if (!gameStarted) {
    return (
      <div className={styles.viewer} style={{ flex: 1 }}>
        <div
          className={styles.startScreen}
          onClick={() => setGameStarted(true)}
        >
          <p className={styles.startText}>Click anywhere to begin</p>
        </div>
      </div>
    );
  }

  if (!currentScene) return null;

  // Build exit data
  const exits = currentConnections.map((conn) => {
    const targetScene = scenes.find((s) => s.id === conn.scene_id_to);
    return {
      ...conn,
      targetName: targetScene?.name || "Unknown",
      targetLocked: targetScene?.is_locked || false,
    };
  });

  const isOffice = currentScene.name === "Detective's Office";
  const isCabaret = currentScene.name === "The Blue Moon Cabaret";
  const isDressingRoom = currentScene.name === "Dressing Room";

  return (
    <div
      className={`${styles.viewer} ${currentScene.type === "map" ? styles.mapMode : ""}`}
    >
      <div className={styles.sceneContent}>
        {currentScene.type === "map" ? (
          <MapView exits={exits} />
        ) : currentScene.image_url ? (
          <div
            className={styles.sceneImage}
            onClick={(e) => {
              if (e.shiftKey) {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (
                  ((e.clientX - rect.left) / rect.width) *
                  100
                ).toFixed(1);
                const y = (
                  ((e.clientY - rect.top) / rect.height) *
                  100
                ).toFixed(1);
                console.log(`x: ${x}, y: ${y}`);
              }
            }}
          >
            <img
              src={currentScene.image_url}
              alt={currentScene.name}
              className={styles.image}
            />

            <div className={styles.vignette} />

            {/* Scene sequence — renders overlays, characters, hotspots */}
            {isOffice && (
              <OfficeIntro exits={exits} gameStarted={gameStarted} />
            )}

            {isCabaret && <CabaretArrival exits={exits} />}

            {isDressingRoom && <DressingRoomScene />}

            {/* Default exits for scenes without a sequence */}
            {!isOffice &&
              !isCabaret &&
              !isDressingRoom && // add this line
              !activeLine &&
              exits.map((exit) => (
                <Hotspot
                  key={exit.id}
                  connectionId={exit.id}
                  targetSceneId={exit.scene_id_to}
                  label={exit.label || exit.targetName}
                  x={exit.x}
                  y={exit.y}
                  locked={exit.targetLocked}
                />
              ))}
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

      <TextPanel />
    </div>
  );
}
