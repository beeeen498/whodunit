"use client";

import { useEffect, useState } from "react";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import { CHARACTERS } from "@/constants/characters";
import styles from "./DressingRoomScene.module.scss";

export default function DressingRoomScene() {
  const { addLines, clear, activeLine, playerName } = useTextStore();
  const [agnesAway, setAgnesAway] = useState(false);
  const { dressingStep, setDressingStep, focusCharacter, focusedCharacter } =
    useUIStore();

  // ========================
  // Auto-focus: highlight whoever is speaking
  // ========================
  useEffect(() => {
    if (!activeLine?.speaker) return;

    const speaker = activeLine.speaker.toLowerCase();
    if (speaker.includes("walter")) focusCharacter("walter");
    else if (speaker.includes("agnes")) focusCharacter("agnes");
    else if (speaker.includes("tom")) focusCharacter("tom");
    else focusCharacter(null); // detective or narrator lines — nobody highlighted
  }, [activeLine]);

  // ========================
  // Step: NARRATION
  // Player enters, sees the body, Tom/Walter/Agnes react
  // ========================
  useEffect(() => {
    if (dressingStep !== "narration") return;

    clear();

    addLines([
      {
        text: "The dressing room. Drawers pulled open, costumes torn from the rack. This is Clara's doing. A singer who performed here regularly. She'd been tearing the place apart looking for that bracelet. Tom, Walter, and Agnes are standing in silence around her dead body on the floor. She's been shot, once, in the back of the head. The blood hasn't dried yet. This happened recently.",
        speaker: CHARACTERS.narrator.name,
      },
      {
        text: "I can't believe it...",
        speaker: CHARACTERS.walter.name,
        color: CHARACTERS.walter.color,
      },
      {
        text: "What just happened?",
        speaker: CHARACTERS.agnes.name,
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

    addLines([
      {
        text: "...",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
      {
        text: "No one touches anything. Don't move anything.",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
      {
        text: "Tom, call the police. Now.",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
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
  }, [dressingStep, playerName]);

  // ========================
  // Agnes leaves the moment her "I'll do it" line
  // finishes — doesn't wait for the rest of the step
  // ========================
  useEffect(() => {
    if (dressingStep !== "order") return;

    const { history } = useTextStore.getState();
    if (history.some((l) => l.text?.includes("I'll do it."))) {
      setAgnesAway(true);
    }
  }, [activeLine, dressingStep]);

  // ========================
  // Step: CHOICE
  // Player picks calm or aggressive response to Walter
  // ========================
  useEffect(() => {
    if (dressingStep !== "choice") return;

    addLines([
      {
        text: "",
        type: "choice",
        options: [
          { label: "Explain calmly — we have to call them", value: "calm" },
          { label: "Push back hard — a woman is dead", value: "aggressive" },
        ],
        onChoose: (value) => handleChoice(value as "calm" | "aggressive"),
      },
    ]);
  }, [dressingStep]);

  const handleChoice = (response: "calm" | "aggressive") => {
    addLines([
      response === "calm"
        ? {
            text: "Walter, a woman is dead. We have to call them. There's no way around this.",
            speaker: `Detective ${playerName}`,
            color: CHARACTERS.detective.color,
          }
        : {
            text: "A woman is lying dead on the floor, and you're worried about your business?! Call them. Now.",
            speaker: `Detective ${playerName}`,
            color: CHARACTERS.detective.color,
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
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
      {
        text: "As of now, everyone in this building is a suspect in a murder.",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
    ]);
  }, [dressingStep]);

  // ========================
  // Agnes reappears exactly when her own line
  // starts playing in the "lie" step
  // ========================
  useEffect(() => {
    if (dressingStep !== "lie") return;
    if (activeLine?.text?.includes("I can't get through")) {
      setAgnesAway(false);
    }
  }, [activeLine, dressingStep]);

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
      <div className={`overlay ${focusedCharacter ? "focused" : ""}`} />

      {/* ---- PORTRAIT SPRITES ---- */}
      {/* All three visible, none focused, during "order" —
          reads as the detective addressing the whole room */}
      {["narration", "order", "choice", "lie"].includes(dressingStep) && (
        <>
          <img
            src={CHARACTERS.walter.portrait}
            alt={CHARACTERS.walter.name}
            className={`character ${styles.characterLeft} ${
              focusedCharacter === "walter"
                ? "speaking"
                : focusedCharacter
                  ? "dimmed"
                  : ""
            }`}
          />

          <img
            src={CHARACTERS.agnes.portrait}
            alt={CHARACTERS.agnes.name}
            className={`character ${styles.characterCenter} ${
              agnesAway
                ? "fadeOut"
                : `fadeIn ${
                    focusedCharacter === "agnes"
                      ? "speaking"
                      : focusedCharacter
                        ? "dimmed"
                        : ""
                  }`
            }`}
          />

          <img
            src={CHARACTERS.tom.portrait}
            alt={CHARACTERS.tom.name}
            className={`character ${styles.characterRight} ${
              focusedCharacter === "tom"
                ? "speaking"
                : focusedCharacter
                  ? "dimmed"
                  : ""
            }`}
          />
        </>
      )}
      {/* ---- Suspect talk + body hotspot go here (next session) ---- */}
    </>
  );
}
