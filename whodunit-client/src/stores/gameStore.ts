import { create } from 'zustand';
import type { GameState, Case, Scene, SceneConnection, Clue, Suspect, DialogueNode, Audio, ScriptedEvent } from '@/types';
import * as api from '@/services/api';

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
  validateEvidence: (clueId1: string, clueId2: string) => Promise<api.ApiError | null>;
  updateAct: (act: number) => Promise<void>;
  reset: () => void;
}

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

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  initGame: async (caseId: string) => {
    set({ loading: true, error: null });
    try {
      const [caseData, gameState, suspects, audioTracks] = await Promise.all([
        api.getCase(caseId),
        api.createGameState(caseId),
        api.getSuspects(caseId),
        api.getAudio(caseId),
      ]);

      const scriptedEvents = await api.getScriptedEvents(caseId, 1);

      set({
        caseData,
        gameState,
        suspects,
        audioTracks,
        scriptedEvents,
        loading: false,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

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

  discoverClue: async (clueId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    try {
      const updated = await api.addClueFound(gameState.id, clueId);
      set({ gameState: updated });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  visitScene: async (sceneId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    try {
      const updated = await api.addSceneVisited(gameState.id, sceneId);
      set({ gameState: updated });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  makeConnection: async (connectionId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    try {
      const updated = await api.addConnectionMade(gameState.id, connectionId);
      set({ gameState: updated });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

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

  completeDialogue: async (dialogueId: string) => {
    const { gameState } = get();
    if (!gameState) return;

    try {
      const updated = await api.addDialogueCompleted(gameState.id, dialogueId);
      set({ gameState: updated });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  validateEvidence: async (clueId1: string, clueId2: string) => {
    const { gameState } = get();
    if (!gameState) return null;

    try {
      const result = await api.validateEvidence(clueId1, clueId2, gameState.id);
      if (result.is_valid) {
        // Refresh game state to get updated connections
        const updated = await api.loadGameState(gameState.id);
        set({ gameState: updated });
      }
      return null;
    } catch (err) {
      return err as api.ApiError;
    }
  },

  updateAct: async (act: number) => {
    const { gameState, caseData } = get();
    if (!gameState || !caseData) return;

    try {
      const updated = await api.updateGameState(gameState.id, { current_act: act });
      const scriptedEvents = await api.getScriptedEvents(caseData.id, act);
      set({ gameState: updated, scriptedEvents });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  reset: () => set(initialState),
}));
