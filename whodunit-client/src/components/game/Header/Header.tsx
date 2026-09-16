'use client';

import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import styles from './Header.module.scss';

// ========================
// Header — slim top bar on the game screen
// Shows title, current scene, and login option
// ========================

export default function Header() {
  const { caseData, currentScene } = useGameStore();

  return (
    <header className={styles.header}>
      {/* Left — game title, links back to home */}
      <Link href="/" className={styles.logo}>
        Whodunit
      </Link>

      {/* Center — current scene name */}
      <div className={styles.sceneInfo}>
        {currentScene ? (
          <span className={styles.sceneName}>{currentScene.name}</span>
        ) : (
          <span className={styles.caseTitle}>{caseData?.title}</span>
        )}
      </div>

      {/* Right — log in to save progress */}
      <button className={styles.loginButton}>
        Save Progress
      </button>
    </header>
  );
}
