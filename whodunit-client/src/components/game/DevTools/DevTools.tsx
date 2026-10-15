"use client";

import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import styles from "./DevTools.module.scss";

export default function DevTools() {
  if (process.env.NODE_ENV !== "development") return null;

  const { currentScene, scenes, loadScene, visitScene, resetClues } =
    useGameStore();
  const { clear } = useTextStore();
  const {
    setOfficeStep,
    setCabaretStep,
    setDressingStep,
    focusCharacter,
    setBodyPanelOpen,
  } = useUIStore();

  // ========================
  // Scene jumping
  // ========================

  const handleSceneJump = (sceneId: string) => {
    clear();
    focusCharacter(null);
    loadScene(sceneId);
    visitScene(sceneId);
  };

  // ========================
  // Office sequence controls
  // ========================

  const handleResetOffice = () => {
    setOfficeStep("narration");
    const office = scenes.find((s) => s.name === "Detective's Office");
    if (office) {
      clear();
      focusCharacter(null);
      loadScene(office.id);
      visitScene(office.id);
    }
  };

  // ========================
  // Cabaret sequence controls
  // ========================

  const handleResetCabaret = () => {
    setCabaretStep("arrival");
    const Cabaret = scenes.find((s) => s.name === "The Blue Moon Cabaret");
    if (Cabaret) {
      clear();
      focusCharacter(null);
      loadScene(Cabaret.id);
      visitScene(Cabaret.id);
    }
  };

  // ========================
  // Dressing Room sequence controls
  // ========================

  const handleResetDressing = () => {
    resetClues();
    setDressingStep("narration");
    const dressingRoom = scenes.find((s) => s.name === "Dressing Room");
    if (dressingRoom) {
      clear();
      focusCharacter(null);
      loadScene(dressingRoom.id);
      visitScene(dressingRoom.id);
    }
  };

  // Which scene are we in?
  const isOffice = currentScene?.name === "Detective's Office";
  const isCabaret = currentScene?.name === "The Blue Moon Cabaret";
  const isDressingRoom = currentScene?.name === "Dressing Room";

  return (
    <div className={styles.devTools}>
      <span className={styles.label}>DEV</span>

      {/* ---- Scene Selector ---- */}
      <select
        className={styles.select}
        value={currentScene?.id || ""}
        onChange={(e) => handleSceneJump(e.target.value)}
      >
        {scenes.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* ---- Office Controls ---- */}
      {isOffice && (
        <>
          <button className={styles.btn} onClick={handleResetOffice}>
            Reset Office
          </button>
          <button className={styles.btn} onClick={() => setOfficeStep("door")}>
            → Door
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setOfficeStep("messenger");
              focusCharacter("messenger");
            }}
          >
            → Messenger
          </button>
          <button className={styles.btn} onClick={() => setOfficeStep("done")}>
            → Done
          </button>
        </>
      )}

      {/* ---- Cabaret Controls ---- */}
      {isCabaret && (
        <>
          <button className={styles.btn} onClick={handleResetCabaret}>
            Reset Cabaret
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setCabaretStep("narration");
              focusCharacter(null);
            }}
          >
            → Narration
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setCabaretStep("arrival");
              focusCharacter("owner");
            }}
          >
            → Arrival
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setCabaretStep("agnes-exit");
              focusCharacter("agnes");
            }}
          >
            → Agnes Exit
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setCabaretStep("owner-talk");
              focusCharacter("owner");
            }}
          >
            → Owner Talk
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setCabaretStep("blackout");
              focusCharacter(null);
            }}
          >
            → Blackout
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setCabaretStep("discovery");
              focusCharacter(null);
            }}
          >
            → Discovery
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setCabaretStep("done");
              focusCharacter(null);
            }}
          >
            → Done
          </button>
        </>
      )}

      {/* ---- Dressing Room Controls ---- */}
      {isDressingRoom && (
        <>
          <button className={styles.btn} onClick={handleResetDressing}>
            Reset Dressing Room
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("narration");
              focusCharacter(null);
            }}
          >
            → Narration
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("order");
              focusCharacter(null);
            }}
          >
            → Order
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("choice");
              focusCharacter(null);
            }}
          >
            → Choice
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("lie");
              focusCharacter("agnes");
            }}
          >
            → Lie
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("talk");
              focusCharacter(null);
            }}
          >
            → Talk
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("investigating");
              focusCharacter(null);
            }}
          >
            → Investigating
          </button>

          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("harold");
              focusCharacter(null);
            }}
          >
            → Harold
          </button>
          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("wrapup");
              focusCharacter(null);
            }}
          >
            → Wrap-up
          </button>

          <button
            className={styles.btn}
            onClick={() => {
              clear();
              setDressingStep("done");
              focusCharacter(null);
            }}
          >
            → Done
          </button>

          <button
            className={styles.btn}
            onClick={() => setBodyPanelOpen(false)}
          >
            Close Panel
          </button>
        </>
      )}
    </div>
  );
}
