import { create } from "zustand";
import type {
  GameState,
  Case,
  Scene,
  SceneConnection,
  Clue,
  Suspect,
  DialogueNode,
  Audio,
  ScriptedEvent,
} from "@/types";
import * as api from "@/services/api";

// ========================
// Types
// ========================

interface GameStore {
  // Core data
  caseData: Case | null;
  gameState: GameState | null;
  scenes: Scene[];
  suspects: Suspect[];
  audioTracks: Audio[];
  scriptedEvents: ScriptedEvent[];

  // Current scene
  currentScene: Scene | null;
  currentClues: Clue[];
  currentConnections: SceneConnection[];

  // Dialogue
  currentDialogue: DialogueNode[];
  activeSuspect: Suspect | null;

  // Loading
  loading: boolean;
  error: string | null;

  // Actions
  initGame: (caseId: string) => Promise<void>;
  loadScene: (sceneId: string) => Promise<void>;
  discoverClue: (clueId: string) => Promise<void>;
  visitScene: (sceneId: string) => Promise<void>;
  makeConnection: (connectionId: string) => Promise<void>;
  startDialogue: (suspect: Suspect) => Promise<void>;
  completeDialogue: (dialogueId: string) => Promise<void>;
  validateEvidence: (
    clueId1: string,
    clueId2: string,
  ) => Promise<api.ApiError | null>;
  updateAct: (act: number) => Promise<void>;
  reset: () => void;
}

// ========================
// Initial state
// ========================

const initialState = {
  caseData: null,
  gameState: null,
  scenes: [],
  suspects: [],
  audioTracks: [],
  scriptedEvents: [],
  currentScene: null,
  currentClues: [],
  currentConnections: [],
  currentDialogue: [],
  activeSuspect: null,
  loading: false,
  error: null,
};

// ========================
// Store
// ========================

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  // Load case data and set up local guest state
  initGame: async (caseId: string) => {
    set({ loading: true, error: null });
    try {
      const caseData = await api.getCase(caseId);
      const suspects = await api.getSuspects(caseId);
      const scenes = await api.getScenesByCase(caseId);

      // These endpoints might not exist yet — don't fail the whole game
      const audioTracks = await api.getAudio(caseId).catch(() => []);
      const scriptedEvents = await api
        .getScriptedEvents(caseId, 1)
        .catch(() => []);

      const localGameState: GameState = {
        id: "guest",
        player_id: "guest",
        case_id: caseId,
        current_act: 1,
        current_scene_id: null,
        clues_found: [],
        connections_made: [],
        dialogues_completed: [],
        scenes_visited: [],
        accusations_made: 0,
        start_time: new Date().toISOString(),
        last_played: new Date().toISOString(),
        status: "in_progress",
      };

      set({
        caseData,
        gameState: localGameState,
        suspects,
        scenes,
        audioTracks,
        scriptedEvents,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  // Fetch scene details and set as current
  loadScene: async (sceneId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    set({ loading: true });
    try {
      const scene = await api.getScene(sceneId, gameState.id);
      set({
        currentScene: scene,
        currentClues: scene.clues,
        currentConnections: scene.connections,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  // Add a clue to the found list
  discoverClue: async (clueId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        clues_found: [...gameState.clues_found, clueId],
      },
    });
  },

  // Mark a scene as visited
  visitScene: async (sceneId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        scenes_visited: [...gameState.scenes_visited, sceneId],
      },
    });
  },

  // Add an evidence connection
  makeConnection: async (connectionId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        connections_made: [...gameState.connections_made, connectionId],
      },
    });
  },

  // Load dialogue for a suspect
  startDialogue: async (suspect: Suspect) => {
    const { gameState } = get();
    if (!gameState) return;

    try {
      const dialogue = await api.getDialogue(suspect.id, gameState.id);
      set({ activeSuspect: suspect, currentDialogue: dialogue });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  // Mark a dialogue node as completed
  completeDialogue: async (dialogueId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    set({
      gameState: {
        ...gameState,
        dialogues_completed: [...gameState.dialogues_completed, dialogueId],
      },
    });
  },

  // Check if two clues form a valid connection
  validateEvidence: async (clueId1: string, clueId2: string) => {
    const { gameState } = get();
    if (!gameState) return null;

    try {
      const result = await api.validateEvidence(clueId1, clueId2, gameState.id);
      if (result.is_valid) {
        const updated = {
          ...gameState,
          connections_made: [
            ...gameState.connections_made,
            result.unlock_id || "",
          ],
        };
        set({ gameState: updated });
      }
      return null;
    } catch (err) {
      return err as api.ApiError;
    }
  },

  // Move to the next act
  updateAct: async (act: number) => {
    const { gameState, caseData } = get();
    if (!gameState || !caseData) return;

    try {
      const scriptedEvents = await api.getScriptedEvents(caseData.id, act);
      set({
        gameState: { ...gameState, current_act: act },
        scriptedEvents,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  // Reset everything
  reset: () => set(initialState),
}));
