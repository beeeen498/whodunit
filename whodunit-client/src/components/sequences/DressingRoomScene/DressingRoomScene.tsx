"use client";

import { useEffect, useRef, useState } from "react";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import { CHARACTERS } from "@/constants/characters";
import { useGameStore } from "@/stores/gameStore";
import BodyPanel from "@/components/game/BodyPanel/BodyPanel";
import styles from "./DressingRoomScene.module.scss";

// The three questions the player can ask Harold
type HaroldQuestionId = "who" | "how" | "heard";

export default function DressingRoomScene() {
  const { addLines, clear, activeLine, playerName } = useTextStore();
  const [hoveredSuspect, setHoveredSuspect] = useState<string | null>(null);
  const [bodyHovered, setBodyHovered] = useState(false);
  const [agnesAway, setAgnesAway] = useState(false);
  const [walterAway, setWalterAway] = useState(false);
  const [activeSuspectConversation, setActiveSuspectConversation] = useState<
    string | null
  >(null);
  const [talkedTo, setTalkedTo] = useState<Set<string>>(new Set());

  // True once Harold has walked in (he fades in when this turns true)
  const [haroldHere, setHaroldHere] = useState(false);

  // Which of Harold's questions the player already asked
  // (a ref, so the buttons always see the latest list)
  const haroldAsked = useRef<Set<HaroldQuestionId>>(new Set());

  const {
    dressingStep,
    setDressingStep,
    focusCharacter,
    focusedCharacter,
    bodyPanelOpen,
    setBodyPanelOpen,
  } = useUIStore();

  // ========================
  // Auto-focus: highlight whoever is speaking
  // ========================
  useEffect(() => {
    if (!activeLine?.speaker) return;

    const speaker = activeLine.speaker.toLowerCase();
    if (speaker.includes("walter")) focusCharacter("walter");
    else if (speaker.includes("agnes")) focusCharacter("agnes");
    else if (speaker.includes("tom")) focusCharacter("tom");
    else if (speaker.includes("harold")) focusCharacter("harold");
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

    setTalkedTo(new Set());
    setWalterAway(false);
    setHaroldHere(false);

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
        text: "Walter, lock all the doors. No one comes in, no one goes out.",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
      {
        text: "...Right away.",
        speaker: CHARACTERS.walter.name,
        color: CHARACTERS.walter.color,
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
  // Walter leaves (to lock the doors) right after he says
  // "...Right away." He stays away until the talk step starts.
  // ========================
  useEffect(() => {
    if (dressingStep !== "lie") return;

    const { history } = useTextStore.getState();
    if (history.some((l) => l.text?.includes("Right away"))) {
      setWalterAway(true);
    }
  }, [activeLine, dressingStep]);

  // ========================
  // Walter comes back once the detective's first talk line
  // ("Until the police get here...") is finished
  // ========================
  useEffect(() => {
    if (dressingStep !== "talk") return;
    if (activeLine) return; // still talking

    const { history } = useTextStore.getState();
    if (history.some((l) => l.text?.includes("Until the police get here"))) {
      setWalterAway(false);
    }
  }, [activeLine, dressingStep]);

  // ========================
  // Trigger: Harold comes in when everything is done.
  // The player checked the body, talked to all three suspects,
  // closed the panel, and the detective finished his last line.
  // ========================
  useEffect(() => {
    if (dressingStep !== "talk") return;
    if (bodyPanelOpen) return;
    if (talkedTo.size < 3) return;
    if (activeSuspectConversation) return;
    if (activeLine) return;
    if (useTextStore.getState().queue.length > 0) return;

    const { currentClues, gameState } = useGameStore.getState();
    const panelClues = currentClues.filter((c) => c.x != null && c.y != null);
    const cluesDone =
      panelClues.length > 0 &&
      panelClues.every((c) => gameState?.clues_found.includes(c.id));
    if (!cluesDone) return;

    // A short pause, so Harold doesn't come in on top of the last line
    const timer = setTimeout(() => setDressingStep("harold"), 1000);
    return () => clearTimeout(timer);
  }, [
    dressingStep,
    bodyPanelOpen,
    talkedTo,
    activeSuspectConversation,
    activeLine,
  ]);

  // ========================
  // Step: HAROLD
  // We hear him first, off-screen. Then he comes in
  // and the player questions him.
  // ========================
  useEffect(() => {
    if (dressingStep !== "harold") return;

    clear();
    setHaroldHere(false);
    haroldAsked.current = new Set();

    addLines([
      {
        text: "Agnes? Agnes, are you here? Where the hell did everyone go?!",
        speaker: CHARACTERS.harold.name,
        color: CHARACTERS.harold.color,
      },
      {
        text: "Oh my God! What happened here?!",
        speaker: CHARACTERS.harold.name,
        color: CHARACTERS.harold.color,
      },
      haroldMenu(["who", "how"]),
    ]);
  }, [dressingStep]);

  // ========================
  // Harold fades in when his second line starts
  // ========================
  useEffect(() => {
    if (dressingStep !== "harold") return;

    if (activeLine?.text?.includes("Oh my God! What happened here")) {
      setHaroldHere(true);
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
  // Harold's questions
  // label    = the button the player sees
  // question = what the detective says out loud
  // answer   = what Harold says back
  // ========================
  const haroldQuestions: Record<
    HaroldQuestionId,
    { label: string; question: string; answer: string }
  > = {
    who: {
      label: "Ask who he is",
      question: "Who are you?",
      answer: "Harold. Agnes's husband. What happened here?",
    },
    how: {
      label: "Ask how he got in",
      question: "How did you get in? Walter locked the doors.",
      answer:
        "I was in the bathroom when the lights went out. When I came out, nobody was here.",
    },
    heard: {
      label: "Ask about the screams",
      question:
        "So you were here, but you heard nothing? Didn't hear the screams?",
      answer:
        "I lost part of my hearing in the war. And have you been in that bathroom? Rain pouring down, that damn jukebox blasting. The Germans could drop a bomb in the middle of the club and you wouldn't hear a thing.",
    },
  };

  // A menu for the text panel: one button per question
  const haroldMenu = (ids: HaroldQuestionId[]) => ({
    text: "",
    type: "choice" as const,
    options: ids.map((id) => ({ label: haroldQuestions[id].label, value: id })),
    onChoose: (value: string) => askHarold(value as HaroldQuestionId),
  });

  // The player picked a question: the detective asks, Harold answers,
  // then either the next menu shows or the confrontation starts
  const askHarold = (id: HaroldQuestionId) => {
    const q = haroldQuestions[id];
    haroldAsked.current.add(id);

    const detective = `Detective ${playerName}`;

    const lines = [
      {
        text: q.question,
        speaker: detective,
        color: CHARACTERS.detective.color,
      },
      {
        text: q.answer,
        speaker: CHARACTERS.harold.name,
        color: CHARACTERS.harold.color,
      },
    ];

    // After the last question: Harold gets angry, the detective answers
    const confrontation = [
      {
        text: "A woman is murdered, and the one man who heard nothing is the one nobody saw.",
        speaker: detective,
        color: CHARACTERS.detective.color,
      },
      {
        text: "What are you saying? That I did this? What proof do you have? You can't put me in that room!",
        speaker: CHARACTERS.harold.name,
        color: CHARACTERS.harold.color,
      },
      {
        text: "I never said you were in that room. But you told me you were in the club when the lights went out. The doors were locked right after we found her. You couldn't have come in after that. You were already inside.",
        speaker: detective,
        color: CHARACTERS.detective.color,
      },
      {
        text: `He was in the building the whole time, and no one saw him. Unlucky, or hiding something?`,
        speaker: CHARACTERS.narrator.name,
      },
    ];

    if (id === "heard") {
      addLines([...lines, ...confrontation]);
      return;
    }

    // Round 1: show whichever of the two questions is still unasked.
    // When both are done, round 2 starts.
    const firstRound: HaroldQuestionId[] = ["who", "how"];
    const left = firstRound.filter((x) => !haroldAsked.current.has(x));
    const nextMenu: HaroldQuestionId[] = left.length > 0 ? left : ["heard"];

    addLines([...lines, haroldMenu(nextMenu)]);
  };

  // ========================
  // A suspect conversation ends when their "thought" line is
  // the last line that finished. Then we unlock the other
  // suspects and remember who we talked to. When it's the third
  // suspect, the detective says a wrap-up line.
  // ========================
  useEffect(() => {
    if (!activeSuspectConversation) return;

    const { activeLine: current, queue, history } = useTextStore.getState();
    if (current || queue.length > 0) return; // still talking

    const statement = suspectStatements[activeSuspectConversation];
    if (!statement) return;

    const lastLine = history[history.length - 1];
    if (!lastLine?.text?.includes(statement.thought)) return;

    const finished = activeSuspectConversation;
    setActiveSuspectConversation(null);
    focusCharacter(null);

    const updated = new Set(talkedTo).add(finished);
    setTalkedTo(updated);

    // Only the first time we talk to this suspect, and only on the third
    if (talkedTo.has(finished) || updated.size !== 3) return;

    // Did the player already find every clue on the body?
    const { currentClues, gameState } = useGameStore.getState();
    const panelClues = currentClues.filter((c) => c.x != null && c.y != null);
    const cluesDone =
      panelClues.length > 0 &&
      panelClues.every((c) => gameState?.clues_found.includes(c.id));

    addLines([
      {
        text: cluesDone
          ? "I've seen everything I need to. Let's move on."
          : "Ok, I talked to all of them. I don't think I'll get more information right now. Maybe checking the victim will shed more light on what happened.",
        speaker: `Detective ${playerName}`,
        color: CHARACTERS.detective.color,
      },
    ]);
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
      {["narration", "order", "choice", "lie", "harold"].includes(
        dressingStep,
      ) && (
        <>
          <img
            src={CHARACTERS.walter.fullBody}
            alt={CHARACTERS.walter.name}
            className={`character ${styles.raised} ${styles.characterLeft} ${
              walterAway ? "fadeOut" : `fadeIn ${getCharacterState("walter")}`
            }`}
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

      {/* ---- HAROLD (fades in when he walks in) ---- */}
      {dressingStep === "harold" && (
        <img
          src={CHARACTERS.harold.fullBody}
          alt={CHARACTERS.harold.name}
          className={`character ${styles.raised} ${styles.characterFar} ${
            haroldHere ? `fadeIn ${getCharacterState("harold")}` : "fadeOut"
          }`}
        />
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
        onClick={() => {
          // Only during the talk step, and not in the middle of
          // a conversation with a suspect
          if (dressingStep !== "talk" || activeSuspectConversation) return;

          setBodyPanelOpen(true);

          // Reset the text area, then the narrator starts on its own
          clear();
          addLines([
            {
              text: "On the cold, hard floor of the dressing room lies Clara, face down. One bullet wound at the back of her head. It's clear to you that she was shot from the back. She probably never saw her killer.",
              speaker: CHARACTERS.narrator.name,
            },
          ]);
        }}
      />

      {/* ---- FULL BODY SPRITES (talk step, clickable) ---- */}
      {dressingStep === "talk" && (
        <>
          <img
            src={CHARACTERS.walter.fullBody}
            alt={CHARACTERS.walter.name}
            className={`character ${styles.raised} ${styles.characterLeft} ${
              walterAway
                ? "fadeOut"
                : `fadeIn ${
                    activeSuspectConversation
                      ? activeSuspectConversation === "walter"
                        ? "speaking"
                        : "dimmed"
                      : `clickable ${hoveredSuspect === "walter" ? "hoverGlow" : ""}`
                  }`
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

      {/* ---- BODY PANEL (full-screen investigation) ---- */}
      {bodyPanelOpen && <BodyPanel suspectsTalkedTo={talkedTo.size === 3} />}
    </>
  );
}
