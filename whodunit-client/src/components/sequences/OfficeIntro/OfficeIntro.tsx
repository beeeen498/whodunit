"use client";

import { useEffect } from "react";
import { useGameStore } from "@/stores/gameStore";
import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import { CHARACTERS } from "@/constants/characters";
import Hotspot from "@/components/game/Hotspot/Hotspot";
import TelegramOverlay from "@/components/overlays/TelegramOverlay/TelegramOverlay";
import styles from "./OfficeIntro.module.scss";

interface OfficeIntroProps {
  exits: {
    id: string;
    scene_id_to: string;
    label: string | null;
    x: number;
    y: number;
    targetName: string;
    targetLocked: boolean;
  }[];
  gameStarted: boolean;
}

export default function OfficeIntro({ exits, gameStarted }: OfficeIntroProps) {
  const { currentScene } = useGameStore();
  const { addLines, clear, activeLine, playerName, history } = useTextStore();
  const { officeStep, setOfficeStep, focusCharacter, focusedCharacter } =
    useUIStore();

  // Feed opening narration
  useEffect(() => {
    if (!gameStarted || !currentScene) return;

    clear();
    addLines([
      {
        text: "9:45 PM. Tuesday, January 14th, 1929. Chicago. The rain hasn't stopped in three days.",
        speaker: "narrator",
      },
      { text: "", speaker: "narrator", type: "name-input" },
      {
        text: "You sit at your desk. The office smells like cheap coffee and cigarettes. Your filing cabinet is full of closed cases.",
        speaker: "narrator",
      },
      { text: "Suddenly, a knock at the door.", speaker: "narrator" },
    ]);
  }, [currentScene, gameStarted, addLines, clear]);

  // Advance to door step when narration ends
  useEffect(() => {
    if (officeStep !== "narration") return;

    const { activeLine, queue } = useTextStore.getState();
    if (!activeLine && queue.length === 0 && playerName) {
      setOfficeStep("door");
    }
  }, [activeLine, officeStep, playerName, setOfficeStep]);

  // Door click — plays creak, shows messenger
  const handleDoorClick = () => {
    const doorAudio = new Audio("/assets/audio/sfx/opening-door.mp3");
    doorAudio.volume = 0.4;
    doorAudio.play().catch(() => {});

    focusCharacter("messenger");
    setOfficeStep("messenger");

    setTimeout(() => {
      addLines([
        {
          text: `Telegram for Detective ${playerName}. From the operator downtown.`,
          speaker: CHARACTERS.messenger.name,
          color: CHARACTERS.messenger.color,
        },
      ]);
    }, 1500);
  };

  return (
    <>
      {/* Dark overlay for character focus */}
      <div
        className={`${styles.overlay} ${focusedCharacter ? styles.focused : ""}`}
      />

      {/* Messenger image */}
      {(officeStep === "messenger" || officeStep === "telegram") && (
        <img
          src={CHARACTERS.messenger.portrait}
          alt="Telegram messenger"
          className={styles.messenger}
        />
      )}

      {/* Player's name on the door */}
      <div className={styles.doorPlate}>
        <span className={styles.doorTitle}>Detective</span>
        {playerName && (
          <span
            className={styles.doorName}
            style={{
              fontSize:
                playerName.length > 10
                  ? `${Math.max(0.4, 0.9 - (playerName.length - 10) * 0.06)}rem`
                  : "0.9rem",
            }}
          >
            {playerName}
          </span>
        )}
      </div>

      {/* Door hotspot */}
      {officeStep === "door" && (
        <Hotspot
          key="door"
          connectionId="door"
          targetSceneId=""
          label="Open the door"
          x={49.3}
          y={31.2}
          locked={false}
          onClick={handleDoorClick}
        />
      )}

      {/* Telegram hotspot */}
      {officeStep === "messenger" &&
        !activeLine &&
        history.some((l) => l.speaker === "messenger") && (
          <Hotspot
            key="telegram"
            connectionId="telegram"
            targetSceneId=""
            label="Take the telegram"
            x={42.2}
            y={73.9}
            locked={false}
            onClick={() => setOfficeStep("telegram")}
          />
        )}

      {/* Exit hotspots — after sequence is done */}
      {officeStep === "done" &&
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

      {/* Telegram overlay */}
      {officeStep === "telegram" && <TelegramOverlay />}
    </>
  );
}
