"use client";

import { useEffect, useRef, useState } from "react";
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

// Pause (in ms) between the narrator finishing and the body polaroid
const POPUP_DELAY = 600;

// Pause (in ms) between closing a polaroid and the detective speaking
const SPEAK_DELAY = 400;

export default function BodyPanel() {
  const { setBodyPanelOpen } = useUIStore();
  const { currentClues, gameState, discoverClue } = useGameStore();
  const { addLines, playerName, activeLine } = useTextStore();

  // ========================
  // Refs and state for the magnifying glass cursor
  // ========================
  const panelRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [hoveredClueId, setHoveredClueId] = useState<string | null>(null);

  // ========================
  // Clue popup state
  // pendingBodyClue = the Body Position clue, waiting for the
  //                   narrator to finish before it shows
  // selectedClue    = the polaroid on the screen right now
  // clueToSpeak     = a newly found clue whose detective line
  //                   plays when the polaroid is closed
  // ========================
  const [pendingBodyClue, setPendingBodyClue] = useState<Clue | null>(null);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const clueToSpeak = useRef<Clue | null>(null);

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
  // When the panel opens, the Body Position clue is added to the
  // clues and waits for the narrator to finish (first time only)
  // ========================
  useEffect(() => {
    const bodyClue = currentClues.find((c) => c.name === "Body Position");
    if (!bodyClue) return;

    const alreadyFound = useGameStore
      .getState()
      .gameState?.clues_found.includes(bodyClue.id);
    if (alreadyFound) return;

    discoverClue(bodyClue.id);
    setPendingBodyClue(bodyClue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========================
  // Show the Body Position polaroid only when nobody is
  // talking anymore. This runs every time the text changes.
  // ========================
  useEffect(() => {
    if (!pendingBodyClue) return;
    if (activeLine) return; // still talking
    if (useTextStore.getState().queue.length > 0) return; // more lines coming

    const timer = setTimeout(() => {
      setCursorVisible(false);
      setSelectedClue(pendingBodyClue);
      setPendingBodyClue(null);
    }, POPUP_DELAY);

    return () => clearTimeout(timer);
  }, [pendingBodyClue, activeLine]);

  // ========================
  // Clicking a clue: the polaroid appears.
  // If the clue is new, it is added to the found list and
  // saved in clueToSpeak. The detective talks when it closes.
  // ========================
  const handleClueClick = (clue: Clue) => {
    // Ignore clicks while the body polaroid is waiting or a polaroid is open
    if (pendingBodyClue || selectedClue) return;

    setHoveredClueId(null);
    setCursorVisible(false);
    setSelectedClue(clue);

    if (foundIds.includes(clue.id)) return;

    discoverClue(clue.id);
    clueToSpeak.current = clue;
  };

  // ========================
  // Closing the polaroid (X button): after a short pause the
  // detective says his line about the clue, if it's a new one.
  // ========================
  const handleModalClose = () => {
    setSelectedClue(null);

    const clue = clueToSpeak.current;
    clueToSpeak.current = null;
    if (!clue?.detail_text) return;

    setTimeout(() => {
      // If an older line is still waiting for Continue,
      // move it to the history first, so the new line starts right away
      const { activeLine: current, queue, advance } = useTextStore.getState();
      if (current && queue.length === 0) advance();

      addLines([
        {
          text: clue.detail_text!,
          speaker: `Detective ${playerName}`,
          color: CHARACTERS.detective.color,
        },
      ]);
    }, SPEAK_DELAY);
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
          onClose={handleModalClose}
        />
      )}
    </>
  );
}
