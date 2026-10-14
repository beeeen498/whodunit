"use client";

import { createElement, useEffect, useState } from "react";
import styles from "./ClueModal.module.scss";

interface ModelViewerProps {
  src: string;
  alt: string;
}

export default function ModelViewer({ src, alt }: ModelViewerProps) {
  const [ready, setReady] = useState(false);

  // ========================
  // The library needs the browser, so we load it here,
  // after the component is on the screen (not on the server).
  // ========================
  useEffect(() => {
    let cancelled = false;

    import("@google/model-viewer").then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <p className={styles.loading}>Loading model...</p>;
  }

  // The "camera-controls" attribute is what lets the player
  // drag to spin the model. "auto-rotate" turns it slowly until
  // the player touches it.
  return createElement("model-viewer", {
    src,
    alt,
    "camera-controls": "",
    "auto-rotate": "",
    "disable-zoom": "",
    "touch-action": "pan-y",
    style: { width: "100%", height: "100%" },
  });
}
