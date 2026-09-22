"use client";

import { useState, useEffect, useRef } from "react";
import { useTextStore } from "@/stores/textStore";
import styles from "./NameInput.module.scss";

// ========================
// NameInput — inline text input for the player's name
// Appears mid-narration after "You are Detective "
// ========================

export default function NameInput() {
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setPlayerName, advance } = useTextStore();

  // Auto-focus the input when it appears
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (name.trim() === "") return;
    const capitalized = name
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
    setPlayerName(capitalized);
    setSubmitted(true);
    advance();
  };

  if (submitted) {
    return <span className={styles.name}>{name.trim()}.</span>;
  }

  return (
    <span className={styles.inputWrapper}>
      <input
        ref={inputRef}
        className={styles.input}
        type="text"
        value={name}
        onChange={(e) => {
          const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, "");
          setName(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
        }}
        placeholder="enter your name"
        maxLength={19}
      />
      {name.trim() && (
        <button className={styles.submitBtn} onClick={handleSubmit}>
          ➜
        </button>
      )}
    </span>
  );
}
