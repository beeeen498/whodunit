"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import { CHARACTERS } from "@/constants/characters";
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
  const [tomGone, setTomGone] = useState(false);
  const { cabaretStep, setCabaretStep, focusCharacter, focusedCharacter } =
    useUIStore();

  // ========================
  // Local state
  // ========================

  // Sub-phases within the discovery step
  const [discoveryPhase, setDiscoveryPhase] = useState(0);

  // CSS blackout toggle
  const [isBlackout, setIsBlackout] = useState(false);

  // Agnes leaving animation — true after she says
  // "throw out the trash", triggers fade-out CSS
  const [agnesLeaving, setAgnesLeaving] = useState(false);

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
        text: "The Blue Moon Cabaret. Seems like they're closing for the evening. Ten years ago, this place used to be packed to the gills. But since the prohibition laws, they, like many other places, struggle to stay afloat. Nonetheless, no shadow of misfortune has fallen on its doorstep — not yet.",
        speaker: CHARACTERS.narrator.name,
      },
    ]);
  }, [cabaretStep, currentScene]);

  // ========================
  // Step: ARRIVAL
  // Walter and Agnes are talking when the player walks in
  // ========================
  useEffect(() => {
    if (cabaretStep !== "arrival" || !currentScene) return;

    clear();
    focusCharacter("walter");

    addLines([
      {
        text: "I heard a woman yelling... there are noises coming from the dressing room.",
        speaker: "Walter (owner)",
        color: CHARACTERS.walter.color,
      },
      {
        text: "It was Clara.",
        speaker: "Agnes (cleaner)",
        color: CHARACTERS.agnes.color,
      },
      {
        text: "Clara? She's not performing tonight - it's her night off.",
        speaker: CHARACTERS.walter.name,
        color: CHARACTERS.walter.color,
      },
      {
        text: "She's searching for her bracelet. Hasn't been able to find it since yesterday.",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
      {
        text: "And why was she yelling?",
        speaker: CHARACTERS.walter.name,
        color: CHARACTERS.walter.color,
      },
      {
        text: "No idea... I was cleaning the bathroom when it happened. But I think it's better if we let her be.",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
    ]);
  }, [cabaretStep, currentScene]);

  // ========================
  // Step: AGNES EXIT
  // Agnes notices the player and announces she's leaving
  // ========================
  useEffect(() => {
    if (cabaretStep !== "agnes-exit") return;

    setAgnesLeaving(false);
    focusCharacter("agnes");

    addLines([
      {
        text: "Oh...",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
      {
        text: "We have a late guest.",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
      {
        text: "I'm going to throw out the trash.",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
    ]);
  }, [cabaretStep]);

  // ========================
  // Step: OWNER TALK
  // Owner is now alone with the player
  // ========================
  useEffect(() => {
    if (cabaretStep !== "owner-talk") return;

    focusCharacter("walter");

    addLines([
      {
        text: `D-Detective ${playerName}! What are you doing here? We haven't seen you since... we haven't seen you here in quite some time.`,
        speaker: CHARACTERS.walter.name,
        color: CHARACTERS.walter.color,
      },
      {
        text: "Well, I got a—",
        speaker: playerName || "Detective",
      },
    ]);
  }, [cabaretStep, playerName]);

  // ========================
  // Step: BLACKOUT
  // Text and characters are already hidden by this point.
  // Bartender speaks in the dark after a pause.
  // ========================
  useEffect(() => {
    if (cabaretStep !== "blackout") return;
    setTomGone(true);

    // 2 second pause in total darkness before bartender speaks
    setTimeout(() => {
      addLines([
        {
          text: "Damn fuse blew again, Walter. Third day in a row at the same time.",
          speaker: "Tom (bartender)",
          color: CHARACTERS.tom.color,
        },
        {
          text: "I'm telling you, it's that heater in the basement that you can't turn off. It sucks all the power.",
          speaker: "Tom",
          color: CHARACTERS.tom.color,
        },
        {
          text: `Just go flip the fuse back, Tom...`,
          speaker: CHARACTERS.walter.name,
          color: CHARACTERS.walter.color,
        },
        {
          text: "Fine.",
          speaker: CHARACTERS.tom.name,
          color: CHARACTERS.tom.color,
        },
      ]);
    }, 2000);
  }, [cabaretStep]);

  // ========================
  // Step: DISCOVERY
  // Lights come back. Sequence of reactions.
  // ========================
  useEffect(() => {
    if (cabaretStep !== "discovery") return;

    setIsBlackout(false);
    setAgnesLeaving(false);
    setDiscoveryPhase(0);
    focusCharacter(null);
    clear();

    // 1s delay before tom screams (off-screen, no sprite)
    setTimeout(() => {
      addLines([
        {
          text: "AHHH!",
          speaker: CHARACTERS.tom.name,
          color: CHARACTERS.tom.color,
        },
      ]);
    }, 2000);
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
        if (history.some((l) => l.text?.includes("not yet"))) {
          setCabaretStep("arrival");
        }
        break;

      // Arrival done → agnes notices player
      case "arrival":
        if (history.some((l) => l.text?.includes("we let her be."))) {
          setCabaretStep("agnes-exit");
        }
        break;

      // Agnes said goodbye → fade her out, then move to owner
      case "agnes-exit":
        if (history.some((l) => l.text?.includes("throw out the trash"))) {
          // Start agnes fade-out animation
          setAgnesLeaving(true);
          // Wait for animation to finish, then advance
          setTimeout(() => setCabaretStep("owner-talk"), 1200);
        }
        break;

      // Player got interrupted → blackout
      // First: clear text + start blackout overlay together
      // Then after everything is dark: change step
      case "owner-talk":
        if (history.some((l) => l.text?.includes("Well, I got a"))) {
          // Everything goes dark together
          setTimeout(() => {
            clear();
            setIsBlackout(true);
            focusCharacter(null);
          }, 800);
          // After the blackout fade completes, switch step
          setTimeout(() => {
            setCabaretStep("blackout");
          }, 2200);
        }
        break;

      // Bartender said he'll fix fuse → lights come back
      case "blackout":
        if (history.some((l) => l.text === "Fine.")) {
          setTimeout(() => setCabaretStep("discovery"), 1500);
        }
        break;

      // Discovery sub-phases
      case "discovery":
        // Phase 0 → 1: tom screamed, owner reacts
        if (discoveryPhase === 0 && history.some((l) => l.text === "AHHH!")) {
          setDiscoveryPhase(1);
          focusCharacter("walter");
          addLines([
            {
              text: `What is it, ${CHARACTERS.tom.name}?!`,
              speaker: CHARACTERS.walter.name,
              color: CHARACTERS.walter.color,
            },
          ]);
        }
        // Phase 1 → 2: owner runs off, screams off-screen
        else if (
          discoveryPhase === 1 &&
          history.some((l) => l.text?.includes("What is it"))
        ) {
          setDiscoveryPhase(2);
          // Owner fades out, then screams after the fade
          setTimeout(() => {
            focusCharacter(null);
            addLines([
              {
                text: "Oh my God!",
                speaker: CHARACTERS.walter.name,
                color: CHARACTERS.walter.color,
              },
            ]);
          }, 1500);
        }
        // Phase 2 → 3: agnes enters
        else if (
          discoveryPhase === 2 &&
          history.some((l) => l.text === "Oh my God!")
        ) {
          setDiscoveryPhase(3);
          setTimeout(() => {
            focusCharacter("agnes");
            addLines([
              {
                text: "I was outside when I heard people yelling. What happened?",
                speaker: CHARACTERS.agnes.name,
                color: CHARACTERS.agnes.color,
              },
            ]);
          }, 1000);
        }
        // Phase 3 → 4: agnes runs off, screams
        else if (
          discoveryPhase === 3 &&
          history.some((l) => l.text?.includes("I was outside"))
        ) {
          setDiscoveryPhase(4);
          // Agnes fades out, then screams
          setTimeout(() => {
            focusCharacter(null);
            addLines([
              {
                text: "No... Clara!",
                speaker: CHARACTERS.agnes.name,
                color: CHARACTERS.agnes.color,
              },
            ]);
          }, 1500);
        }
        // Phase 4 → done
        else if (
          discoveryPhase === 4 &&
          history.some((l) => l.text === "No... Clara!")
        ) {
          setDiscoveryPhase(5);
          setTimeout(() => setCabaretStep("done"), 1500);
        }
        break;
    }
  }, [activeLine, cabaretStep, discoveryPhase]);

  // ========================
  // Auto-focus: highlight whoever is speaking
  // ========================
  useEffect(() => {
    if (!activeLine?.speaker) return;
    if (cabaretStep === "blackout") return;
    if (cabaretStep === "narration") return;

    const speaker = activeLine.speaker.toLowerCase();
    if (speaker.includes("walter")) focusCharacter("walter");
    else if (speaker.includes("agnes")) focusCharacter("agnes");
    else if (speaker.includes("tom")) focusCharacter("tom");
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
            src={CHARACTERS.walter.fullBody}
            alt={CHARACTERS.walter.name}
            className="character dimmed"
            style={{ left: "30.5%" }}
          />

          <img
            src={CHARACTERS.agnes.fullBody}
            alt={CHARACTERS.agnes.name}
            className="character dimmed"
            style={{ left: "45.5%" }}
          />
        </>
      )}

      {/* ---- PORTRAIT SPRITES (dialogue steps) ---- */}

      {/* Owner — visible from arrival through owner-talk,
          and during discovery phases 1-2 (fades out in phase 2).
          Also stays visible during blackout so he fades WITH
          the scene, not before it. */}
      {(["arrival", "agnes-exit", "owner-talk", "blackout"].includes(
        cabaretStep,
      ) ||
        (cabaretStep === "discovery" && discoveryPhase <= 2)) && (
        <img
          src={CHARACTERS.walter.portrait}
          alt={CHARACTERS.walter.name}
          className={`${styles.character} ${styles.characterLeft} ${
            focusedCharacter === "walter"
              ? styles.speaking
              : focusedCharacter
                ? styles.dimmed
                : ""
          } ${
            cabaretStep === "discovery" && discoveryPhase === 2
              ? styles.fadeOut
              : ""
          }`}
        />
      )}

      {/* Agnes — visible during arrival and agnes-exit
          (fades out when leaving for trash).
          Fades in during discovery phase 3, fades out in phase 4. */}
      {(["arrival", "agnes-exit"].includes(cabaretStep) ||
        (cabaretStep === "discovery" &&
          discoveryPhase >= 3 &&
          discoveryPhase <= 5)) && (
        <img
          src={CHARACTERS.agnes.portrait}
          alt={CHARACTERS.agnes.name}
          className={`${styles.character} ${
            cabaretStep === "discovery"
              ? styles.characterCenter
              : styles.characterRight
          } ${
            focusedCharacter === "agnes"
              ? styles.speaking
              : focusedCharacter
                ? styles.dimmed
                : ""
          } ${agnesLeaving ? styles.fadeOut : ""} ${
            cabaretStep === "discovery" && discoveryPhase === 3
              ? styles.fadeIn
              : ""
          } ${
            cabaretStep === "discovery" &&
            (discoveryPhase === 4 || discoveryPhase === 5)
              ? styles.fadeOut
              : ""
          }`}
        />
      )}

      {/* ---- HOTSPOTS ---- */}

      {/* Exit hotspot — only dressing room after sequence is done */}
      {cabaretStep === "done" &&
        !activeLine &&
        exits
          .filter((exit) => exit.label === "Go to the dressing room")
          .map((exit) => (
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
