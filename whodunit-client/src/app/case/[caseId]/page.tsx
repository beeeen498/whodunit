"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useGameStore } from "@/stores/gameStore";
import Header from "@/components/game/Header/Header";
import SceneViewer from "@/components/game/SceneViewer/SceneViewer";
import ActionBar from "@/app/(game)/ActionBar/ActionBar";
import styles from "./page.module.scss";

// ========================
// Game Page — main game screen
// Loads case data and renders the game layout
// ========================

export default function GamePage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { caseData, loading, error, initGame } = useGameStore();

  // Load case data when the page mounts
  useEffect(() => {
    if (caseId) {
      initGame(caseId);
    }
  }, [caseId, initGame]);

  // Loading screen
  if (loading && !caseData) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.loadingText}>Opening case file...</p>
      </div>
    );
  }

  // Error screen
  if (error) {
    return (
      <div className={styles.loadingScreen}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.gameContainer}>
      <Header />

      {/* Scene viewer will go here */}
      <main className={styles.sceneArea}>
        <SceneViewer />

        {/* Action bar */}
        <ActionBar />
      </main>
    </div>
  );
}
