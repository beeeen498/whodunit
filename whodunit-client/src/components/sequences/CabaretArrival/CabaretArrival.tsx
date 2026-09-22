"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import Hotspot from "@/components/game/Hotspot/Hotspot";
import styles from "./CabaretArrival.module.scss";

// ========================
// Types
// ========================

interface CabaretArrivalProps {
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

export default function CabaretArrival({ exits }: CabaretArrivalProps) {
  const { currentScene } = useGameStore();
  const { addLines, clear, activeLine, playerName } = useTextStore();
  const { cabaretStep, setCabaretStep, focusCharacter, focusedCharacter } =
    useUIStore();

  // ========================
  // Local state
  // ========================

  // Sub-phases within the discovery step
  // 0 = tom yells, 1 = owner reacts & runs, 2 = agnes returns
  const [discoveryPhase, setDiscoveryPhase] = useState(0);

  // CSS blackout toggle
  const [isBlackout, setIsBlackout] = useState(false);

  // ========================
  // Step: NARRATION
  // Full-body view of the cabaret. Narrator sets the scene.
  // ========================
  useEffect(() => {
    if (cabaretStep !== "narration" || !currentScene) return;

    clear();
    focusCharacter(null);

    addLines([
      {
        text: "The Blue Moon Cabaret. Seems like they're closing for the evening. Ten years ago, this place used to be packed to the gills. But since the prohibition laws, they, like many other places, struggle to stay afloat. Nonetheless, it doesn't seem like any tragedy has happened yet.",
        speaker: "narrator",
      },
    ]);
  }, [cabaretStep, currentScene]);

  // ========================
  // Step: ARRIVAL
  // Owner and Agnes are talking when the player walks in
  // ========================
  useEffect(() => {
    if (cabaretStep !== "arrival" || !currentScene) return;

    clear();
    focusCharacter("owner");

    addLines([
      {
        text: "I heard a woman yelling... there are noises coming from the dressing room.",
        speaker: "Walter",
        color: "#c4a882",
      },
      {
        text: "It was the singer.",
        speaker: "Agnes",
        color: "#8b9dad",
      },
      {
        text: "The singer? What is she doing here? It's her night off.",
        speaker: "Walter",
        color: "#c4a882",
      },
      {
        text: "She's searching for her bracelet.",
        speaker: "Agnes",
        color: "#8b9dad",
      },
    ]);
  }, [cabaretStep, currentScene]);

  // ========================
  // Step: AGNES EXIT
  // Agnes notices the player and announces she's leaving
  // ========================
  useEffect(() => {
    if (cabaretStep !== "agnes-exit") return;

    focusCharacter("agnes");

    addLines([
      {
        text: "We have a late guest.",
        speaker: "Agnes",
        color: "#8b9dad",
      },
      {
        text: "I'm going to throw out the trash.",
        speaker: "Agnes",
        color: "#8b9dad",
      },
    ]);
  }, [cabaretStep]);

  // ========================
  // Step: OWNER TALK
  // Owner is now alone with the player
  // ========================
  useEffect(() => {
    if (cabaretStep !== "owner-talk") return;

    focusCharacter("owner");

    addLines([
      {
        text: `D-Detective ${playerName}! What are you doing here? We haven't seen you since... we haven't seen you here in quite some time.`,
        speaker: "Walter",
        color: "#c4a882",
      },
      {
        text: "Well, I got a—",
        speaker: playerName || "Detective",
      },
    ]);
  }, [cabaretStep, playerName]);

  // ========================
  // Step: BLACKOUT
  // Lights go out. Pause in darkness. Bartender speaks.
  // ========================
  useEffect(() => {
    if (cabaretStep !== "blackout") return;

    setIsBlackout(true);
    focusCharacter(null);
    clear();

    // 2 second pause in total darkness before bartender speaks
    setTimeout(() => {
      addLines([
        {
          text: "I'll go turn on the fuse.",
          speaker: "Tom",
          color: "#a0b0a0",
        },
      ]);
    }, 2000);
  }, [cabaretStep]);

  // ========================
  // Step: DISCOVERY
  // Lights come back. Bartender yells. Then sub-phases
  // handle the owner running and agnes returning.
  // ========================
  useEffect(() => {
    if (cabaretStep !== "discovery") return;

    setIsBlackout(false);
    setDiscoveryPhase(0);
    focusCharacter("tom");
    clear();

    // Short pause as lights flicker back on
    setTimeout(() => {
      addLines([
        {
          text: "AHHH!",
          speaker: "Tom",
          color: "#a0b0a0",
        },
      ]);
    }, 500);
  }, [cabaretStep]);

  // ========================
  // Auto-advance: watches for text completion
  // and moves to the next step
  // ========================
  useEffect(() => {
    // Don't advance while text is still active or queued
    if (activeLine) return;
    const { queue, history } = useTextStore.getState();
    if (queue.length > 0) return;

    // Don't advance on empty history (step just started,
    // addLines hasn't fired yet)
    if (history.length === 0) return;

    switch (cabaretStep) {
      // Narration done → characters start talking
      case "narration":
        if (history.some((l) => l.text?.includes("tragedy"))) {
          setCabaretStep("arrival");
        }
        break;

      // Arrival done → agnes notices player
      case "arrival":
        if (
          history.some((l) => l.text?.includes("searching for her bracelet"))
        ) {
          setCabaretStep("agnes-exit");
        }
        break;

      // Agnes said goodbye → owner speaks alone
      case "agnes-exit":
        if (history.some((l) => l.text?.includes("throw out the trash"))) {
          // Delay so agnes fade-out animation plays
          setTimeout(() => setCabaretStep("owner-talk"), 1200);
        }
        break;

      // Player got interrupted → blackout
      case "owner-talk":
        if (history.some((l) => l.text?.includes("Well, I got a"))) {
          setTimeout(() => setCabaretStep("blackout"), 800);
        }
        break;

      // Bartender said he'll fix fuse → lights come back
      case "blackout":
        if (history.some((l) => l.speaker === "Tom")) {
          setTimeout(() => setCabaretStep("discovery"), 1500);
        }
        break;

      // Discovery has 3 sub-phases
      case "discovery":
        if (discoveryPhase === 0 && history.some((l) => l.text === "AHHH!")) {
          // Phase 1: owner reacts
          setDiscoveryPhase(1);
          focusCharacter("owner");
          addLines([
            {
              text: "What is it, Tom?!",
              speaker: "Walter",
              color: "#c4a882",
            },
          ]);
        } else if (
          discoveryPhase === 1 &&
          history.some((l) => l.text?.includes("What is it"))
        ) {
          // Phase 2: owner runs off, agnes comes back
          setDiscoveryPhase(2);
          setTimeout(() => {
            focusCharacter("agnes");
            addLines([
              {
                text: "I was outside when I heard people yelling. What happened?",
                speaker: "Agnes",
                color: "#8b9dad",
              },
            ]);
          }, 1500);
        } else if (
          discoveryPhase === 2 &&
          history.some((l) => l.text?.includes("I was outside"))
        ) {
          // Sequence complete
          focusCharacter(null);
          setCabaretStep("done");
        }
        break;
    }
  }, [activeLine, cabaretStep, discoveryPhase]);

  // ========================
  // Auto-focus: highlight whoever is speaking
  // ========================
  useEffect(() => {
    if (!activeLine?.speaker) return;
    // No character focus during blackout
    if (cabaretStep === "blackout") return;
    // No character focus during narration
    if (cabaretStep === "narration") return;

    const speaker = activeLine.speaker.toLowerCase();
    if (speaker === "walter") focusCharacter("owner");
    else if (speaker === "agnes") focusCharacter("agnes");
    else if (speaker === "tom") focusCharacter("tom");
  }, [activeLine, cabaretStep]);

  // ========================
  // Render
  // ========================
  return (
    <>
      {/* Dark overlay behind characters — NOT during narration
          so we see the full cabaret scene */}
      <div
        className={`${styles.overlay} ${
          focusedCharacter && cabaretStep !== "narration" ? styles.focused : ""
        }`}
      />

      {/* Blackout — covers entire scene when lights go out */}
      <div
        className={`${styles.blackout} ${isBlackout ? styles.active : ""}`}
      />

      {/* ---- FULL BODY SPRITES (narration step) ---- */}
      {cabaretStep === "narration" && (
        <>
          <img
            src="/assets/images/characters/owner-full-body.png"
            alt="Walter Goss"
            className={`${styles.fullBody} ${styles.fullBodyLeft}`}
          />
          <img
            src="/assets/images/characters/wife-full-body.png"
            alt="Agnes Mott"
            className={`${styles.fullBody} ${styles.fullBodyRight}`}
          />
        </>
      )}

      {/* ---- PORTRAIT SPRITES (dialogue steps) ---- */}

      {/* Owner — visible from arrival through owner-talk,
          and during discovery phases 0-1 (before he runs off) */}
      {(["arrival", "agnes-exit", "owner-talk"].includes(cabaretStep) ||
        (cabaretStep === "discovery" && discoveryPhase <= 1)) &&
        !isBlackout && (
          <img
            src="/assets/images/characters/owner-portrait.png"
            alt="Walter Goss"
            className={`${styles.character} ${styles.characterLeft} ${
              focusedCharacter === "owner" ? styles.speaking : styles.dimmed
            } ${
              cabaretStep === "discovery" && discoveryPhase === 1
                ? styles.fadeOut
                : ""
            }`}
          />
        )}

      {/* Agnes — visible during arrival and agnes-exit,
          then returns in discovery phase 2 */}
      {(["arrival", "agnes-exit"].includes(cabaretStep) ||
        (cabaretStep === "discovery" && discoveryPhase >= 2)) &&
        !isBlackout && (
          <img
            src="/assets/images/characters/wife-portrait.png"
            alt="Agnes Mott"
            className={`${styles.character} ${
              cabaretStep === "discovery"
                ? styles.characterCenter
                : styles.characterRight
            } ${
              focusedCharacter === "agnes" ? styles.speaking : styles.dimmed
            } ${
              cabaretStep === "discovery" && discoveryPhase === 2
                ? styles.fadeIn
                : ""
            }`}
          />
        )}

      {/* Tom (bartender) — visible during discovery phase 0 */}
      {cabaretStep === "discovery" && discoveryPhase === 0 && (
        <img
          src="/assets/images/characters/tom-portrait.png"
          alt="Tom Webber"
          className={`${styles.character} ${styles.characterCenter} ${
            focusedCharacter === "tom" ? styles.speaking : styles.dimmed
          }`}
        />
      )}

      {/* ---- HOTSPOTS ---- */}

      {/* Exit hotspot — only after the full sequence is done */}
      {cabaretStep === "done" &&
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
    </>
  );
}
