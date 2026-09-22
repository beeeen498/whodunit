"use client";

import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useAudioStore } from "@/stores/audioStore";
import styles from "./TypewriterText.module.scss";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  onFinish: () => void;
}

export interface TypewriterHandle {
  skip: () => void;
}

const TypewriterText = forwardRef<TypewriterHandle, TypewriterTextProps>(
  ({ text, speed = 35, onFinish }, ref) => {
    const [displayedText, setDisplayedText] = useState("");
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const skippedRef = useRef(false);
    const finishedRef = useRef(false);
    const onFinishRef = useRef(onFinish);
    onFinishRef.current = onFinish;

    // Typewriter sound effects consts
    const isMuted = useAudioStore((state) => state.isMuted);
    const isMutedRef = useRef(isMuted);
    isMutedRef.current = isMuted;
    const audiosRef = useRef<HTMLAudioElement[]>([]);
    const SOUND_EVERY = 4;

    // Setting the sound effects
    useEffect(() => {
      audiosRef.current = [
        new Audio("/assets/audio/sfx/typewriter-key-1.wav"),
        new Audio("/assets/audio/sfx/typewriter-key-2.wav"),
        new Audio("/assets/audio/sfx/typewriter-key-3.wav"),
        new Audio("/assets/audio/sfx/typewriter-key-4.wav"),
        new Audio("/assets/audio/sfx/typewriter-key-5.wav"),
        new Audio("/assets/audio/sfx/typewriter-key-6.wav"),
        new Audio("/assets/audio/sfx/typewriter-key-7.wav"),
      ];
      audiosRef.current.forEach((a) => (a.volume = 0.15));
    }, []);

    useImperativeHandle(ref, () => ({
      skip: () => {
        if (finishedRef.current) return;
        skippedRef.current = true;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setDisplayedText(text);
        finishedRef.current = true;
        onFinishRef.current();
      },
    }));

    useEffect(() => {
      setDisplayedText("");
      finishedRef.current = false;
      skippedRef.current = false;
      let index = 0;

      intervalRef.current = setInterval(() => {
        if (skippedRef.current) {
          clearInterval(intervalRef.current!);
          return;
        }

        index += 1;
        if (index >= text.length) {
          setDisplayedText(text);
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          finishedRef.current = true;
          onFinishRef.current();
          return;
        }
        setDisplayedText(text.slice(0, index));

        // Typewriter click — every N characters
        if (
          audiosRef.current.length > 0 &&
          !isMutedRef.current &&
          index % SOUND_EVERY === 0
        ) {
          const sound =
            audiosRef.current[
              Math.floor(Math.random() * audiosRef.current.length)
            ];
          sound.currentTime = 0;
          sound.play().catch(() => {});
        }
      }, speed);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [text, speed]);

    return (
      <p className={styles.text}>
        {displayedText}
        {!finishedRef.current && <span className={styles.cursor}>|</span>}
      </p>
    );
  },
);

TypewriterText.displayName = "TypewriterText";
export default TypewriterText;
