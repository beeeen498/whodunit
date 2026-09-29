"use client";

import { useEffect, useState } from "react";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import { CHARACTERS } from "@/constants/characters";
import styles from "./DressingRoomScene.module.scss";

export default function DressingRoomScene() {
  const { addLines, clear, activeLine, playerName } = useTextStore();
  const [hoveredSuspect, setHoveredSuspect] = useState<string | null>(null);
  const [bodyHovered, setBodyHovered] = useState(false);
  const [agnesAway, setAgnesAway] = useState(false);
  const [activeSuspectConversation, setActiveSuspectConversation] = useState<
    string | null
  >(null);
  const [talkedTo, setTalkedTo] = useState<Set<string>>(new Set());
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
  // Helper: decide a character's highlight state
  // ========================
  const getCharacterState = (id: string) => {
    if (focusedCharacter === id) return "speaking";
    if (focusedCharacter || activeLine?.speaker === CHARACTERS.narrator.name) {
      return "dimmed";
    }
    return "";
  };

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
        text: "Of course.",
        speaker: CHARACTERS.tom.name,
        color: CHARACTERS.tom.color,
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
            text: "A woman is lying dead on the floor, and you're worried about your business?! She already went to call them - don't you dare stop her.",
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
        text: "I couldn't make a call. The shortage must've knocked out the fuse in your office too — the phone's dead.",
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
    if (activeLine?.text?.includes("I couldn't make a call")) {
      setAgnesAway(false);
    }
  }, [activeLine, dressingStep]);

  // ========================
  // Step: TALK
  // Player can click Tom/Walter/Agnes for their short
  // statements, in any order, replayable
  // ========================
  useEffect(() => {
    if (dressingStep !== "talk") return;

    clear();
    focusCharacter(null);

    addLines([
      {
        text: "Until the police get here, I should talk to everyone and take a proper look around.",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
    ]);
  }, [dressingStep, playerName]);

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

      // Lie done → move to talk
      case "lie":
        if (history.some((l) => l.text?.includes("suspect in a murder"))) {
          setDressingStep("talk");
        }
        break;
    }
  }, [activeLine, dressingStep]);

  // ========================
  // Step: Suspects statements
  // ========================
  const suspectStatements: Record<
    string,
    {
      question: string;
      text: string;
      color: string;
      name: string;
      thought: string;
    }
  > = {
    walter: {
      question: "Walter, tell me exactly what you saw.",
      name: CHARACTERS.walter.name,
      text: "I was with you in the main hall when the power went out, and then I heard Tom yelling.",
      color: CHARACTERS.walter.color,
      thought:
        "He was with you the whole time. But he doesn't want police anywhere near this place. Is that just business, or is he hiding something?",
    },
    agnes: {
      question: "Agnes, what were you doing during all this?",
      name: CHARACTERS.agnes.name,
      text: "I was outside. I heard yelling and came back in.",
      color: CHARACTERS.agnes.color,
      thought: "If neither of the men did it... could it have been her?",
    },
    tom: {
      question: "Tom, walk me through what happened.",
      name: CHARACTERS.tom.name,
      text: "I have no idea what happened. I went to fix the fuse - it's right outside this room. When the lights came back, she was already like that.",
      color: CHARACTERS.tom.color,
      thought:
        "He was right outside, alone, in the dark, fixing that fuse. If he'd slipped in and out, no one would have seen a thing. But if he did it... why scream and drag everyone's attention straight to himself?",
    },
  };

  const handleTalk = (id: string) => {
    if (activeSuspectConversation) return;

    const statement = suspectStatements[id];
    if (!statement) return;

    setActiveSuspectConversation(id);
    focusCharacter(id);

    addLines([
      {
        text: statement.question,
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
      {
        text: statement.text,
        speaker: statement.name,
        color: statement.color,
      },
      {
        text: statement.thought,
        speaker: CHARACTERS.narrator.name,
      },
    ]);
  };

  // ========================
  // A suspect conversation ends once their "thought" line
  // is the one that just finished — unlock talking to others
  // ========================
  useEffect(() => {
    if (!activeSuspectConversation) return;
    const { history } = useTextStore.getState();

    const statement = suspectStatements[activeSuspectConversation];
    if (!statement) return;

    if (history.some((l) => l.text?.includes(statement.thought))) {
      const finished = activeSuspectConversation;
      setActiveSuspectConversation(null);
      focusCharacter(null);

      setTalkedTo((prev) => new Set(prev).add(finished));

      // Point 5: once all three have been talked to, add a wrap-up line
      if (talkedTo.size + 1 === 3) {
        addLines([
          {
            text: "Ok, I talked to all of them. I don't think I'll get more information right now. Maybe checking the victim will shed more light on what happened.",
            speaker: `Detective ${playerName}`,
            color: CHARACTERS.detective.color,
          },
        ]);
      }
    }
  }, [activeLine, activeSuspectConversation]);

  // ========================
  // Render
  // ========================
  return (
    <>
      {/* Dark overlay behind characters, same pattern as CabaretArrival */}
      <div
        className={`overlay ${
          activeLine?.speaker === CHARACTERS.narrator.name ||
          (dressingStep === "talk" && !activeSuspectConversation)
            ? "hidden"
            : ""
        }`}
      />

      {/* ---- PORTRAIT SPRITES ---- */}
      {/* All three visible, none focused, during "order" —
          reads as the detective addressing the whole room */}
      {["narration", "order", "choice", "lie"].includes(dressingStep) && (
        <>
          <img
            src={CHARACTERS.walter.fullBody}
            alt={CHARACTERS.walter.name}
            className={`character ${styles.raised} ${styles.characterLeft} ${getCharacterState("walter")}`}
          />

          <img
            src={CHARACTERS.agnes.fullBody}
            alt={CHARACTERS.agnes.name}
            className={`character ${styles.raised} ${styles.characterCenter} ${
              agnesAway ? "fadeOut" : `fadeIn ${getCharacterState("agnes")}`
            }`}
          />

          <img
            src={CHARACTERS.tom.fullBody}
            alt={CHARACTERS.tom.name}
            className={`character ${styles.raised} ${styles.characterRight} ${getCharacterState("tom")}`}
          />
        </>
      )}

      {/* ---- CORPSE SPRITE ---- */}
      <img
        src="/assets/images/characters/singer-body-full.png"
        alt="Clara's body"
        className={`character ${styles.corpse} ${
          dressingStep === "talk"
            ? `clickable ${bodyHovered ? "hoverGlow" : ""}`
            : ""
        }`}
        onMouseEnter={() => dressingStep === "talk" && setBodyHovered(true)}
        onMouseLeave={() => setBodyHovered(false)}
      />

      {/* ---- FULL BODY SPRITES (talk step, clickable) ---- */}
      {dressingStep === "talk" && (
        <>
          <img
            src={CHARACTERS.walter.fullBody}
            alt={CHARACTERS.walter.name}
            className={`character ${styles.raised} ${styles.characterLeft} ${
              activeSuspectConversation
                ? activeSuspectConversation === "walter"
                  ? "speaking"
                  : "dimmed"
                : `clickable ${styles.raised} ${hoveredSuspect === "walter" ? "hoverGlow" : ""}`
            }`}
            onMouseEnter={() =>
              !activeSuspectConversation && setHoveredSuspect("walter")
            }
            onMouseLeave={() => setHoveredSuspect(null)}
            onClick={() => handleTalk("walter")}
          />

          <img
            src={CHARACTERS.agnes.fullBody}
            alt={CHARACTERS.agnes.name}
            className={`character ${styles.raised} ${styles.characterCenter} ${
              activeSuspectConversation
                ? activeSuspectConversation === "agnes"
                  ? "speaking"
                  : "dimmed"
                : `clickable ${hoveredSuspect === "agnes" ? "hoverGlow" : ""}`
            }`}
            onMouseEnter={() =>
              !activeSuspectConversation && setHoveredSuspect("agnes")
            }
            onMouseLeave={() => setHoveredSuspect(null)}
            onClick={() => handleTalk("agnes")}
          />

          <img
            src={CHARACTERS.tom.fullBody}
            alt={CHARACTERS.tom.name}
            className={`character ${styles.raised} ${styles.characterRight} ${
              activeSuspectConversation
                ? activeSuspectConversation === "tom"
                  ? "speaking"
                  : "dimmed"
                : `clickable ${styles.raised} ${hoveredSuspect === "tom" ? "hoverGlow" : ""}`
            }`}
            onMouseEnter={() =>
              !activeSuspectConversation && setHoveredSuspect("tom")
            }
            onMouseLeave={() => setHoveredSuspect(null)}
            onClick={() => handleTalk("tom")}
          />
        </>
      )}

      {/* ---- Body hotspot goes here (next session) ---- */}
    </>
  );
}
