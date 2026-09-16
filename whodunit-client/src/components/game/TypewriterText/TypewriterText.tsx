"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./TypewriterText.module.scss";

// ========================
// TypewriterText — prints text letter by letter
// ========================

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  onFinish: () => void;
}

export default function TypewriterText({
  text,
  speed = 35,
  onFinish,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;

      if (indexRef.current >= text.length) {
        setDisplayedText(text);
        clearInterval(interval);
        onFinish();
        return;
      }

      setDisplayedText(text.slice(0, indexRef.current));
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onFinish]);

  return (
    <p className={styles.text}>
      {displayedText}
      <span className={styles.cursor}>|</span>
    </p>
  );
}
