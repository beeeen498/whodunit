"use client";

import { useRef, useState } from "react";
import type { CSSProperties, MouseEvent, SyntheticEvent } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import type { Clue } from "@/types";
import { CHARACTERS } from "@/constants/characters";
import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import ClueModal from "@/components/game/ClueModal/ClueModal";
import styles from "./BodyPanel.module.scss";

const BODY_IMAGE = "/assets/images/scenes/singer-body.png";

export default function BodyPanel() {
  const { setBodyPanelOpen } = useUIStore();
  const { currentClues, gameState, discoverClue } = useGameStore();
  const { addLines, playerName } = useTextStore();

  // ========================
  // Refs and state for the magnifying glass cursor
  // ========================
  const panelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [hoveredClueId, setHoveredClueId] = useState<string | null>(null);

  // The clue whose polaroid is open (null = no popup)
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);

  // ========================
  // Image shape (width / height)
  // We read it when the image loads, so the wrapper can
  // fit the image inside the scene area exactly.
  // ========================
  const [ratio, setRatio] = useState(16 / 9);

  const handleImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setRatio(naturalWidth / naturalHeight);
  };

  // ========================
  // Clues that have a spot on this image.
  // Clues without an x and y never show in this panel.
  // ========================
  const panelClues = currentClues.filter((c) => c.x != null && c.y != null);
  const foundIds = gameState?.clues_found ?? [];

  const allCluesFound =
    panelClues.length > 0 && panelClues.every((c) => foundIds.includes(c.id));

  // ========================
  // Clicking a clue: open the polaroid, add the clue to the
  // found list, and the detective says his line.
  // The line and the "found" step only happen the first time.
  // ========================
  const handleClueClick = (clue: Clue) => {
    setHoveredClueId(null);
    setCursorVisible(false);
    setSelectedClue(clue);

    if (foundIds.includes(clue.id)) return;

    discoverClue(clue.id);

    if (clue.detail_text) {
      addLines([
        {
          text: clue.detail_text,
          speaker: `Detective ${playerName}`,
          color: CHARACTERS.detective.color,
        },
      ]);
    }
  };

  // ========================
  // Move the magnifying glass with the mouse.
  // We change its style directly (no state), so it stays smooth.
  // The 16px offset puts the middle of the lens on the pointer.
  // ========================
  const handlePanelMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    const cursor = cursorRef.current;
    if (!panel || !cursor) return;

    const rect = panel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cursor.style.transform = `translate(${x - 16}px, ${y - 16}px)`;

    if (!cursorVisible) setCursorVisible(true);
  };

  // ========================
  // Dev helper: shift+click logs x/y in percent,
  // the same way the scene images do.
  // ========================
  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!e.shiftKey) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
    console.log(`x: ${x}, y: ${y}`);
  };

  return (
    <>
      <div
        ref={panelRef}
        className={styles.panel}
        onMouseMove={handlePanelMouseMove}
        onMouseLeave={() => setCursorVisible(false)}
      >
        {/* The wrapper is exactly the size of the image,
            so the percentages stay correct on any screen */}
        <div
          className={styles.imageWrapper}
          style={{ "--ratio": ratio } as CSSProperties}
          onClick={handleImageClick}
        >
          <img
            src={BODY_IMAGE}
            alt="Clara's body, seen from above"
            className={styles.image}
            onLoad={handleImageLoad}
          />

          {/* ---- CLUE HOTSPOTS ---- */}
          {panelClues.map((clue) => (
            <button
              key={clue.id}
              className={styles.hotspot}
              style={{ left: `${clue.x}%`, top: `${clue.y}%` }}
              aria-label="Examine"
              onMouseEnter={() => setHoveredClueId(clue.id)}
              onMouseLeave={() => setHoveredClueId(null)}
              onClick={() => handleClueClick(clue)}
            />
          ))}
        </div>

        {/* Close button: only after every clue on this image is found */}
        {allCluesFound && (
          <button
            className={styles.closeBtn}
            onClick={() => setBodyPanelOpen(false)}
          >
            Close
          </button>
        )}

        {/* ---- MAGNIFYING GLASS CURSOR ---- */}
        <div
          ref={cursorRef}
          className={`${styles.cursor} ${cursorVisible ? styles.visible : ""} ${
            hoveredClueId ? styles.active : ""
          }`}
        >
          <FaMagnifyingGlass />
        </div>
      </div>

      {/* ---- CLUE POLAROID ---- */}
      {selectedClue && (
        <ClueModal
          clue={selectedClue}
          imageUrl={BODY_IMAGE}
          ratio={ratio}
          onClose={() => setSelectedClue(null)}
        />
      )}
    </>
  );
}
