import { create } from "zustand";

// ========================
// Types
// ========================

type Panel = "none" | "inventory" | "evidence" | "suspects" | "map";
type Modal =
  | "none"
  | "clue"
  | "dialogue"
  | "cutscene"
  | "accusation"
  | "settings";

// Cabaret arrival sequence steps
type CabaretStep =
  | "narration" // full-body view of all characters, narrator sets the scene
  | "arrival" // owner + agnes discuss the yelling
  | "agnes-exit" // agnes notices player, says she's leaving
  | "owner-talk" // owner greets the detective
  | "blackout" // lights out, bartender speaks in darkness
  | "discovery" // lights on, bartender yells, owner runs, agnes returns
  | "done"; // hotspot to dressing room

// Dressing room discovery sequence steps
type DressingStep =
  | "narration" // body found, Tom/Walter/Agnes react
  | "order" // "don't touch anything," Agnes volunteers, Walter's outburst
  | "choice" // player picks calm or aggressive response
  | "lie" // Agnes's fuse lie, "no one leaves"
  | "talk" // suspect statements + Harold enters
  | "investigating" // body hotspot active, clue search open
  | "done"; // all 7 clues found, exit unlocked

interface UIStore {
  // Panels & modals
  activePanel: Panel;
  activeModal: Modal;
  modalData: unknown;

  // Transitions
  isTransitioning: boolean;
  transitionType: "fade" | "iris" | "slide";

  // Notifications
  notification: string | null;

  // Actions
  openPanel: (panel: Panel) => void;
  closePanel: () => void;
  togglePanel: (panel: Panel) => void;
  openModal: (modal: Modal, data?: unknown) => void;
  closeModal: () => void;
  startTransition: (type?: "fade" | "iris" | "slide") => void;
  endTransition: () => void;
  showNotification: (message: string, duration?: number) => void;
  clearNotification: () => void;

  // Characters
  focusedCharacter: string | null;
  focusCharacter: (id: string | null) => void;

  // Office intro sequence
  officeStep: "narration" | "door" | "messenger" | "telegram" | "done";
  setOfficeStep: (
    step: "narration" | "door" | "messenger" | "telegram" | "done",
  ) => void;

  // Cabaret arrival sequence
  cabaretStep: CabaretStep;
  setCabaretStep: (step: CabaretStep) => void;

  // Dressing room discovery sequence
  dressingStep: DressingStep;
  setDressingStep: (step: DressingStep) => void;
}

// ========================
// Store
// ========================

export const useUIStore = create<UIStore>((set, get) => ({
  activePanel: "none",
  activeModal: "none",
  modalData: null,
  isTransitioning: false,
  transitionType: "fade",
  notification: null,
  focusedCharacter: null,

  // Sequence steps
  officeStep: "narration",
  cabaretStep: "narration",
  dressingStep: "narration",

  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: "none" }),
  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? "none" : panel });
  },

  openModal: (modal, data = null) =>
    set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: "none", modalData: null }),

  startTransition: (type = "fade") =>
    set({ isTransitioning: true, transitionType: type }),
  endTransition: () => set({ isTransitioning: false }),

  showNotification: (message, duration = 3000) => {
    set({ notification: message });
    setTimeout(() => set({ notification: null }), duration);
  },
  clearNotification: () => set({ notification: null }),

  focusCharacter: (id) => set({ focusedCharacter: id }),

  setOfficeStep: (step) => set({ officeStep: step }),
  setCabaretStep: (step) => set({ cabaretStep: step }),

  setDressingStep: (step) => set({ dressingStep: step }),
}));
