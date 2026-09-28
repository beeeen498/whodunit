import { create } from "zustand";

// ========================
// Types
// ========================

interface TextLine {
  text: string;
  speaker?: string; // "narrator", suspect name, etc.
  type?: "text" | "name-input" | "choice";
  color?: string;
  options?: { label: string; value: string }[];
  onChoose?: (value: string) => void;
}

interface TextStore {
  // Lines waiting to be typed
  queue: TextLine[];

  // Lines already displayed
  history: TextLine[];

  // The line currently being typed
  activeLine: TextLine | null;

  // Is the current line still typing?
  isTyping: boolean;

  // Actions
  addLines: (lines: TextLine[]) => void;
  advance: () => void;
  finishTyping: () => void;
  clear: () => void;

  // Skipping the typing effect
  skipRequested: boolean;
  requestSkip: () => void;

  // The name the player adds at the start of the game
  playerName: string | null;
  setPlayerName: (name: string) => void;
}

// ========================
// Store
// ========================

export const useTextStore = create<TextStore>((set, get) => ({
  queue: [],
  history: [],
  activeLine: null,
  isTyping: false,
  skipRequested: false,
  playerName: null,

  // Add new lines to the queue and start
  // typing the first one if nothing is active
  addLines: (lines) => {
    const { activeLine } = get();

    if (!activeLine && lines.length > 0) {
      // Nothing is typing — start the first line
      const [first, ...rest] = lines;
      set({
        activeLine: first,
        queue: rest,
        isTyping: true,
      });
    } else {
      // Something is already typing — just queue these
      set({ queue: [...get().queue, ...lines] });
    }
  },

  // Called when the player clicks "Continue"
  // Moves the active line to history and
  // starts the next one from the queue
  advance: () => {
    const { activeLine, queue, history } = get();

    if (!activeLine) return;

    const newHistory = [...history, activeLine];

    if (queue.length > 0) {
      // More lines — start the next one
      const [next, ...rest] = queue;
      set({
        history: newHistory,
        activeLine: next,
        queue: rest,
        isTyping: true,
      });
    } else {
      // No more lines — done
      set({
        history: newHistory,
        activeLine: null,
        queue: [],
        isTyping: false,
      });
    }
  },

  // Called when the typewriter finishes a line
  finishTyping: () => set({ isTyping: false, skipRequested: false }),

  // Clear everything — on scene change,
  // conversation end, act end
  clear: () =>
    set({
      queue: [],
      history: [],
      activeLine: null,
      isTyping: false,
    }),

  // Sets skipRequested to true again to allow skiiping the next line
  requestSkip: () => set({ skipRequested: true }),

  // Sets the players name
  setPlayerName: (name) => set({ playerName: name }),
}));
