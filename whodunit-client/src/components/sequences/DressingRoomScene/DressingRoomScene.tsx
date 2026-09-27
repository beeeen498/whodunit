"use client";

import { useEffect } from "react";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import { CHARACTERS } from "@/constants/characters";
import styles from "./DressingRoomScene.module.scss";

export default function DressingRoomScene() {
  const { addLines, clear, activeLine } = useTextStore();
  const { dressingStep, setDressingStep, focusCharacter, focusedCharacter } =
    useUIStore();

  // ========================
  // Step: NARRATION
  // Player enters, sees the body, Tom/Walter/Agnes react
  // ========================
  useEffect(() => {
    if (dressingStep !== "narration") return;

    clear();
    focusCharacter(null);

    addLines([
      {
        text: "The dressing room. Tom, Walter, and Agnes are already here, standing in silence around a body on the floor. It's Clara — a singer who performs here regularly. She's been shot, once, in the back of the head. The blood hasn't dried yet. This happened recently.",
        speaker: CHARACTERS.narrator.name,
      },
      {
        text: "I can't believe it...",
        speaker: CHARACTERS.walter.name,
        color: CHARACTERS.walter.color,
      },
      {
        text: "What just happened?",
        speaker: "Agnes (cleaner)",
        color: CHARACTERS.agnes.color,
      },
    ]);
  }, [dressingStep]);

  // ========================
  // Step: ORDER
  // Detective's private beat, then takes charge of the room
  // ========================
  useEffect(() => {
    if (dressingStep !== "order") return;

    focusCharacter(null);

    addLines([
      {
        text: "...",
        speaker: "Detective",
      },
      {
        text: "No one touches anything. Don't move anything.",
        speaker: "Detective",
      },
      {
        text: "Call the police. Now.",
        speaker: "Detective",
      },
      {
        text: "I'll do it.",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
      {
        text: "Calling the police here? Everyone will know someone was murdered here. It'll destroy whatever business I've got left. I'm barely staying afloat as it is. Don't bring them here.",
        speaker: CHARACTERS.walter.name,
        color: CHARACTERS.walter.color,
      },
    ]);
  }, [dressingStep]);

  // ========================
  // Step: CHOICE
  // Player picks calm or aggressive response to Walter
  // ========================
  // No addLines here — the choice buttons render below,
  // and whichever one is clicked adds its own line.

  const handleChoice = (response: "calm" | "aggressive") => {
    addLines([
      response === "calm"
        ? {
            text: "Walter, a woman is dead. We have to call them. There's no way around this.",
            speaker: "Detective",
          }
        : {
            text: "A woman is lying dead on the floor, and you're worried about your business?! Call them. Now.",
            speaker: "Detective",
          },
    ]);
    setDressingStep("lie");
  };

  // ========================
  // Step: LIE
  // Agnes returns with the fuse lie, detective shuts down any exit
  // ========================
  useEffect(() => {
    if (dressingStep !== "lie") return;

    addLines([
      {
        text: "I can't get through. The shortage must've knocked out the fuse in your office too — the phone's dead.",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
      {
        text: "There's a phone booth a few blocks down. I can go.",
        speaker: CHARACTERS.agnes.name,
        color: CHARACTERS.agnes.color,
      },
      {
        text: "No one leaves.",
        speaker: "Detective",
      },
      {
        text: "As of now, everyone in this building is a suspect in a murder.",
        speaker: "Detective",
      },
    ]);
  }, [dressingStep]);

  // ========================
  // Auto-advance: watches for text completion
  // and moves to the next step
  // ========================
  useEffect(() => {
    if (activeLine) return;
    const { queue, history } = useTextStore.getState();
    if (queue.length > 0) return;
    if (history.length === 0) return;

    switch (dressingStep) {
      // Narration done → detective takes charge
      case "narration":
        if (history.some((l) => l.text?.includes("What just happened?"))) {
          setDressingStep("order");
        }
        break;

      // Order done → wait for player's dialogue choice
      case "order":
        if (history.some((l) => l.text?.includes("Don't bring them here."))) {
          setDressingStep("choice");
        }
        break;

      // "lie" step ends with "everyone is a suspect" —
      // next step (talk) is built in a later session, so
      // for now we just stop advancing here.
      case "lie":
        // Intentionally left without a next step yet.
        break;
    }
  }, [activeLine, dressingStep]);

  // ========================
  // Render
  // ========================
  return (
    <>
      {/* Dark overlay behind characters, same pattern as CabaretArrival */}
      <div
        className={`${styles.overlay} ${
          focusedCharacter ? styles.focused : ""
        }`}
      />

      {/* ---- PORTRAIT SPRITES ---- */}
      {/* All three visible, none focused, during "order" —
          reads as the detective addressing the whole room */}
      {["narration", "order", "choice", "lie"].includes(dressingStep) && (
        <>
          <img
            src={CHARACTERS.walter.portrait}
            alt={CHARACTERS.walter.name}
            className={`${styles.character} ${styles.characterLeft} ${
              focusedCharacter === "owner"
                ? styles.speaking
                : focusedCharacter
                  ? styles.dimmed
                  : ""
            }`}
          />
          <img
            src={CHARACTERS.agnes.portrait}
            alt={CHARACTERS.agnes.name}
            className={`${styles.character} ${styles.characterCenter} ${
              focusedCharacter === "agnes"
                ? styles.speaking
                : focusedCharacter
                  ? styles.dimmed
                  : ""
            }`}
          />
          <img
            src={CHARACTERS.tom.portrait}
            alt={CHARACTERS.tom.name}
            className={`${styles.character} ${styles.characterRight} ${
              focusedCharacter === "tom"
                ? styles.speaking
                : focusedCharacter
                  ? styles.dimmed
                  : ""
            }`}
          />
        </>
      )}

      {/* ---- PLAYER DIALOGUE CHOICE ---- */}
      {dressingStep === "choice" && !activeLine && (
        <div className={styles.choiceButtons}>
          <button
            className={styles.choiceBtn}
            onClick={() => handleChoice("calm")}
          >
            Explain calmly — we have to call them
          </button>
          <button
            className={styles.choiceBtn}
            onClick={() => handleChoice("aggressive")}
          >
            Push back hard — a woman is dead
          </button>
        </div>
      )}

      {/* ---- Suspect talk + body hotspot go here (next session) ---- */}
    </>
  );
}
