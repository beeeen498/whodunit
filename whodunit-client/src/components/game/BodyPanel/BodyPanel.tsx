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

// Pause (in ms) between closing a polaroid and the lines starting
const SPEAK_DELAY = 400;

// How long (in ms) the characters take to fade out when a reaction ends
const FADE_OUT_TIME = 800;

// ========================
// What other characters say right after a clue's polaroid closes.
// The key is the clue's name in the database.
// ========================
const CLUE_REACTIONS: Record<
  string,
  { speaker: string; text: string; color?: string }[]
> = {
  "Club Key": [
    {
      speaker: CHARACTERS.walter.name,
      color: CHARACTERS.walter.color,
      text: "It's the key to the club! I've been looking for it! What is it doing here?",
    },
    {
      speaker: CHARACTERS.tom.name,
      color: CHARACTERS.tom.color,
      text: "I gave it to her.",
    },
    {
      speaker: CHARACTERS.walter.name,
      color: CHARACTERS.walter.color,
      text: "You did what?! We'll talk about this later!",
    },
  ],
};

// ========================
// Extra clues added once a clue's reactions have happened.
// These clues have no spot on the image. They only go to the clues.
// ========================
const CLUE_UNLOCKS: Record<string, string[]> = {
  "Club Key": ["Tom Gave Clara a Key", "The Owner Seems Upset"],
};

// ========================
// The phases of a reaction (characters talking in the panel)
// off     = nothing is happening
// pending = polaroid just closed, scene is darkening, lines not started
// on      = the characters are talking
// leaving = the conversation ended, characters are fading out
// ========================
type ReactionPhase = "off" | "pending" | "on" | "leaving";

interface BodyPanelProps {
  suspectsTalkedTo: boolean; // did the player already talk to all three?
}

export default function BodyPanel({ suspectsTalkedTo }: BodyPanelProps) {
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
  // clueToSpeak     = a newly found clue whose lines play
  //                   when the polaroid is closed
  // completesAllClues = true when that clue is the last one
  // ========================
  const [pendingBodyClue, setPendingBodyClue] = useState<Clue | null>(null);
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const clueToSpeak = useRef<Clue | null>(null);
  const completesAllClues = useRef(false);

  // ========================
  // Reaction state: Walter and Tom talking in the panel
  // cast = which of them are on the screen
  // reactionHeard = true once one of them has spoken
  // ========================
  const [reaction, setReaction] = useState<ReactionPhase>("off");
  const [cast, setCast] = useState({ walter: false, tom: false });
  const reactionHeard = useRef(false);

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
  // Who is speaking right now, and each character's look:
  // the speaker is in focus, the other one is dimmed
  // ========================
  const speakingId =
    activeLine?.speaker === CHARACTERS.walter.name
      ? "walter"
      : activeLine?.speaker === CHARACTERS.tom.name
        ? "tom"
        : null;

  const getCharacterState = (id: string) => {
    if (speakingId === id) return "speaking";
    if (speakingId) return "dimmed";
    return "";
  };

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
  // Reaction: follows the text.
  // Walter or Tom speaking -> that character fades in (and stays).
  // Anyone else speaking, or no text at all, after one of them
  // has spoken -> the conversation is over, everyone leaves.
  // ========================
  useEffect(() => {
    if (reaction !== "on") return;

    const speaker = activeLine?.speaker;

    if (speaker === CHARACTERS.walter.name) {
      reactionHeard.current = true;
      setCast((c) => ({ ...c, walter: true }));
    } else if (speaker === CHARACTERS.tom.name) {
      reactionHeard.current = true;
      setCast((c) => ({ ...c, tom: true }));
    } else if (reactionHeard.current) {
      setReaction("leaving");
    }
  }, [activeLine, reaction]);

  // ========================
  // Reaction: after the fade out, go back to normal
  // ========================
  useEffect(() => {
    if (reaction !== "leaving") return;

    const timer = setTimeout(() => {
      setReaction("off");
      setCast({ walter: false, tom: false });
      reactionHeard.current = false;
    }, FADE_OUT_TIME);

    return () => clearTimeout(timer);
  }, [reaction]);

  // ========================
  // Clicking a clue: the polaroid appears.
  // If the clue is new, it is added to the found list and
  // saved in clueToSpeak. The lines play when the polaroid closes.
  // ========================
  const handleClueClick = (clue: Clue) => {
    // Ignore clicks while something is waiting, open, or talking
    if (pendingBodyClue || selectedClue || reaction !== "off") return;

    setHoveredClueId(null);
    setCursorVisible(false);
    setSelectedClue(clue);

    if (foundIds.includes(clue.id)) return;

    discoverClue(clue.id);
    clueToSpeak.current = clue;

    // Will every clue on the image be found once this one is added?
    const foundAfter = [...foundIds, clue.id];
    completesAllClues.current = panelClues.every((c) =>
      foundAfter.includes(c.id),
    );
  };

  // ========================
  // Closing the polaroid (X button): after a short pause the
  // lines play, if it's a new clue. In order:
  // 1. the detective's line about the clue
  // 2. the reactions of the other characters
  // 3. if it was the last clue, the line that says there's nothing more
  // ========================
  const handleModalClose = () => {
    setSelectedClue(null);

    const clue = clueToSpeak.current;
    const completed = completesAllClues.current;
    clueToSpeak.current = null;
    completesAllClues.current = false;
    if (!clue) return; // clue was already found, nothing to say

    const reactions = CLUE_REACTIONS[clue.name] ?? [];
    const lines: { text: string; speaker: string; color?: string }[] = [];

    if (clue.detail_text) {
      lines.push({
        text: clue.detail_text,
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      });
    }

    lines.push(...reactions);

    if (completed) {
      lines.push({
        text: suspectsTalkedTo
          ? "I've seen everything I need to. Let's move on."
          : "Found all of the clues. Now to talk with the suspects.",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      });
    }

    // Add the extra clues that come with this one
    (CLUE_UNLOCKS[clue.name] ?? []).forEach((name) => {
      const extra = currentClues.find((c) => c.name === name);
      if (extra) discoverClue(extra.id);
    });

    // The scene darkens right away, so it is dark when the characters show up
    if (reactions.length > 0) setReaction("pending");

    if (lines.length === 0) return;

    setTimeout(() => {
      // If an older line is still waiting for Continue,
      // move it to the history first, so the new lines start right away
      const { activeLine: current, queue, advance } = useTextStore.getState();
      if (current && queue.length === 0) advance();

      addLines(lines);

      // Only now do we start following the text
      if (reactions.length > 0) setReaction("on");
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

  const reacting = reaction !== "off";

  return (
    <>
      <div
        ref={panelRef}
        className={`${styles.panel} ${reacting ? styles.reacting : ""}`}
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

        {/* ---- REACTION: dark overlay and the characters ---- */}
        {reacting && (
          <>
            <div
              className={`overlay ${reaction === "leaving" ? "hidden" : ""}`}
            />

            {/* Each one starts invisible and fades in when
                their first line starts */}
            <img
              src={CHARACTERS.walter.portrait}
              alt={CHARACTERS.walter.name}
              className={`character ${styles.reactionLeft} ${
                reaction === "on" && cast.walter
                  ? `fadeIn ${getCharacterState("walter")}`
                  : "fadeOut"
              }`}
            />
            <img
              src={CHARACTERS.tom.portrait}
              alt={CHARACTERS.tom.name}
              className={`character ${styles.reactionRight} ${
                reaction === "on" && cast.tom
                  ? `fadeIn ${getCharacterState("tom")}`
                  : "fadeOut"
              }`}
            />
          </>
        )}

        {/* Close button: only after every clue on this image is found,
            and not while the characters are talking */}
        {allCluesFound && !reacting && (
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
          className={`${styles.cursor} ${
            cursorVisible && !reacting ? styles.visible : ""
          } ${hoveredClueId ? styles.active : ""}`}
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
