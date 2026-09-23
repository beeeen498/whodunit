"use client";

import { useTextStore } from "@/stores/textStore";
import { useUIStore } from "@/stores/uiStore";
import styles from "./TelegramOverlay.module.scss";

export default function TelegramOverlay() {
  const { playerName } = useTextStore();
  const { setOfficeStep, focusCharacter } = useUIStore();
  const { addLines } = useTextStore();

  const handleClose = () => {
    focusCharacter(null);
    setOfficeStep("done");
    addLines([
      {
        text: '"Come quickly"... No time to waste.',
        speaker: "narrator",
      },
    ]);
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.telegram} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.company}>WESTERN UNION</span>
          <span className={styles.type}>TELEGRAM</span>
        </div>

        <div className={styles.body}>
          <p className={styles.date}>JAN 14 1929 9:23 PM</p>
          <p className={styles.to}>TO: DETECTIVE {playerName?.toUpperCase()}</p>
          <p className={styles.message}>
            COME TO THE BLUE MOON CABARET STOP
            <br />
            SOMETHING BAD IS ABOUT TO HAPPEN STOP
            <br />
            COME QUICKLY STOP
          </p>
          <p className={styles.from}>— DOWNTOWN OPERATOR</p>
        </div>

        <button className={styles.closeBtn} onClick={handleClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
