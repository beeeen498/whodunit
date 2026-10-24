"use client";

import { useState } from "react";
import type { Clue } from "@/types";
import { useGameStore } from "@/stores/gameStore";
import ClueThumb from "@/components/game/ClueThumb/ClueThumb";
import styles from "./PeopleTab.module.scss";

interface PeopleTabProps {
  onClueClick: (clue: Clue) => void; // opens the big popup (in CaseFile)
}

// ========================
// The label under each name
// ========================
const STATUS_LABEL: Record<string, string> = {
  victim: "Victim",
  suspect: "Suspect",
  police: "Police",
};

export default function PeopleTab({ onClueClick }: PeopleTabProps) {
  const { suspects, foundClues } = useGameStore();

  // The person shown on the right (null = the first one)
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ========================
  // Who shows: people with at least one found clue about them.
  // Sorted by when the player first learned about them.
  // firstSeen = the place of their first clue in the found list
  // (-1 = nothing found about them yet)
  // ========================
  const firstSeen = (personId: string) =>
    foundClues.findIndex((c) => c.suspect_id === personId);

  const people = suspects
    .filter((p) => firstSeen(p.id) !== -1)
    .sort((a, b) => firstSeen(a.id) - firstSeen(b.id));

  const selected = people.find((p) => p.id === selectedId) ?? people[0];

  // ---- Nobody yet ----
  if (!selected) {
    return <p className={styles.empty}>No one on file yet.</p>;
  }

  // ========================
  // Everything about the selected person
  // ========================
  const theirStatements = foundClues.filter(
    (c) => c.suspect_id === selected.id && c.type === "statement",
  );
  const theirClues = foundClues.filter(
    (c) => c.suspect_id === selected.id && c.type !== "statement",
  );

  return (
    <div className={styles.people}>
      {/* ======================== LEFT: the list ======================== */}
      <ul className={styles.list}>
        {people.map((p) => (
          <li key={p.id}>
            <button
              className={`${styles.person} ${
                p.id === selected.id ? styles.selected : ""
              }`}
              onClick={() => setSelectedId(p.id)}
            >
              <div className={styles.thumb}>
                {p.portrait_url && <img src={p.portrait_url} alt="" />}
              </div>
              <div className={styles.personText}>
                <span className={styles.name}>{p.name}</span>
                <span className={styles.status}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* ======================== RIGHT: their file ======================== */}
      <div className={styles.file}>
        {/* ---- Header: portrait, name, role, profile ---- */}
        <div className={styles.header}>
          <div className={styles.portrait}>
            {selected.portrait_url && (
              <img src={selected.portrait_url} alt={selected.name} />
            )}
          </div>

          <div className={styles.headerText}>
            <h3 className={styles.fileName}>{selected.name}</h3>
            <p className={styles.role}>
              {selected.role} ·{" "}
              {STATUS_LABEL[selected.status] ?? selected.status}
            </p>
            {selected.profile && (
              <p className={styles.profile}>{selected.profile}</p>
            )}
          </div>
        </div>

        {/* ---- What they said ---- */}
        {theirStatements.length > 0 && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Statements</h4>
            <ul className={styles.statements}>
              {theirStatements.map((s) => (
                <li key={s.id} className={styles.statement}>
                  {s.description}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ---- Clues about them ---- */}
        {theirClues.length > 0 && (
          <section className={styles.section}>
            <h4 className={styles.sectionTitle}>Clues</h4>
            <div className={styles.clueGrid}>
              {theirClues.map((clue, i) => (
                <ClueThumb
                  key={clue.id}
                  clue={clue}
                  index={i}
                  onClick={() => onClueClick(clue)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
