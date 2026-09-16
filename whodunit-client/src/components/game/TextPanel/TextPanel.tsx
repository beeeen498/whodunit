"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTextStore } from "@/stores/textStore";
import TypewriterText from "@/components/game/TypewriterText/TypewriterText";
import styles from "./TextPanel.module.scss";

// ========================
// TextPanel — scrollable typewriter text area
// Shows history + active typing line + continue button
// ========================

export default function TextPanel() {
  const { history, activeLine, isTyping, advance, finishTyping } =
    useTextStore();

  // Auto-scroll to bottom when new text appears
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, activeLine, isTyping]);

  // Memoize so TypewriterText doesn't re-render
  const handleFinish = useCallback(() => {
    finishTyping();
  }, [finishTyping]);

  return (
    <div className={styles.panel}>
      {/* Scrollable text area */}
      <div className={styles.textArea}>
        {/* Already printed lines */}
        {history.map((line, i) => (
          <div key={i} className={styles.line}>
            {line.speaker && (
              <span className={styles.speaker}>{line.speaker}</span>
            )}
            <p className={styles.lineText}>{line.text}</p>
          </div>
        ))}

        {/* Currently typing line */}
        {activeLine && (
          <div className={styles.line}>
            {activeLine.speaker && (
              <span className={styles.speaker}>{activeLine.speaker}</span>
            )}
            <TypewriterText text={activeLine.text} onFinish={handleFinish} />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Continue button — shows when typing is done
          and more lines are queued */}
      {activeLine && !isTyping && (
        <button className={styles.continueButton} onClick={advance}>
          Continue ▸
        </button>
      )}
    </div>
  );
}
