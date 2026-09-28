"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTextStore } from "@/stores/textStore";
import TypewriterText from "@/components/game/TypewriterText/TypewriterText";
import NameInput from "@/components/game/NameInput/NameInput";
import type { TypewriterHandle } from "@/components/game/TypewriterText/TypewriterText";
import styles from "./TextPanel.module.scss";

export default function TextPanel() {
  const { history, activeLine, advance, finishTyping, playerName } =
    useTextStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const typewriterRef = useRef<TypewriterHandle>(null);
  const [typingDone, setTypingDone] = useState(false);
  const lastLineRef = useRef<string | null>(null);
  const [canClick, setCanClick] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, activeLine, typingDone]);

  // When a new line appears, reset states and delay button
  useEffect(() => {
    if (!activeLine) return;

    setTypingDone(false);
    setCanClick(false);

    const timer = setTimeout(() => setCanClick(true), 1000);
    return () => clearTimeout(timer);
  }, [activeLine?.text]);

  const handleFinish = useCallback(() => {
    finishTyping();
    setTypingDone(true);
  }, [finishTyping]);

  const handleButtonClick = () => {
    if (!typingDone) {
      typewriterRef.current?.skip();
    } else {
      advance();
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.textArea}>
        {history.map((line, i) => (
          <div key={i} className={styles.line}>
            {line.speaker && (
              <span
                className={styles.speaker}
                style={line.color ? { color: line.color } : undefined}
              >
                {line.speaker}
              </span>
            )}
            {line.type === "name-input" ? (
              <p className={styles.lineText}>
                You are Detective <strong>{playerName}</strong>.
              </p>
            ) : (
              <p className={styles.lineText}>{line.text}</p>
            )}
          </div>
        ))}

        {activeLine && (
          <div className={styles.line}>
            {activeLine.speaker && (
              <span
                className={styles.speaker}
                style={
                  activeLine.color ? { color: activeLine.color } : undefined
                }
              >
                {activeLine.speaker}
              </span>
            )}
            {activeLine.type === "name-input" ? (
              <p className={styles.lineText}>
                You are Detective <NameInput />
              </p>
            ) : activeLine.type === "choice" ? (
              <div className="choiceOptions">
                {activeLine.options?.map((opt) => (
                  <button
                    key={opt.value}
                    className="choiceOptionBtn"
                    onClick={() => {
                      activeLine.onChoose?.(opt.value);
                      advance();
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <TypewriterText
                ref={typewriterRef}
                text={activeLine.text}
                onFinish={handleFinish}
              />
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {activeLine &&
        activeLine.type !== "name-input" &&
        activeLine.type !== "choice" && (
          <button
            className={`${styles.continueButton} ${canClick ? styles.active : ""}`}
            onClick={canClick ? handleButtonClick : undefined}
          >
            {!typingDone ? "Skip ▸" : "Continue ▸"}
          </button>
        )}
    </div>
  );
}
