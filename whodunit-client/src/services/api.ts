import type {
  AuthResponse,
  Case,
  Scene,
  Suspect,
  DialogueNode,
  EvidenceValidation,
  GameState,
  SceneWithDetails,
  ScriptedEvent,
  Audio,
  Player,
} from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// ========================
// Core Fetch Wrapper
// ========================

let accessToken: string | null = null;

export function setToken(token: string | null) {
  accessToken = token;
}

export function getToken(): string | null {
  return accessToken;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.message || `Request failed: ${response.statusText}`,
    );
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ========================
// Auth
// ========================

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.access_token);
  return data;
}

export async function getMe(): Promise<Player> {
  return request<Player>("/auth/me");
}

// ========================
// Cases
// ========================

export async function getCase(caseId: string): Promise<Case> {
  return request<Case>(`/cases/${caseId}`);
}

// ========================
// Scenes
// ========================

export async function getScene(
  sceneId: string,
  gameStateId: string,
): Promise<SceneWithDetails> {
  return request<SceneWithDetails>(
    `/scenes/${sceneId}?gameStateId=${gameStateId}`,
  );
}

export async function getScenesByCase(caseId: string): Promise<Scene[]> {
  return request<Scene[]>(`/scenes/case/${caseId}`);
}

// ========================
// Suspects
// ========================

export async function getSuspects(caseId: string): Promise<Suspect[]> {
  return request<Suspect[]>(`/suspects/case/${caseId}`);
}

// ========================
// Dialogue
// ========================

export async function getDialogue(
  suspectId: string,
  gameStateId: string,
): Promise<DialogueNode[]> {
  return request<DialogueNode[]>(
    `/dialogue/${suspectId}?gameStateId=${gameStateId}`,
  );
}

// ========================
// Evidence
// ========================

export async function validateEvidence(
  clueId1: string,
  clueId2: string,
  gameStateId: string,
): Promise<EvidenceValidation> {
  return request<EvidenceValidation>("/evidence/validate", {
    method: "POST",
    body: JSON.stringify({
      clue_id_1: clueId1,
      clue_id_2: clueId2,
      game_state_id: gameStateId,
    }),
  });
}

// ========================
// Game State
// ========================

export async function createGameState(caseId: string): Promise<GameState> {
  return request<GameState>("/game-state", {
    method: "POST",
    body: JSON.stringify({ case_id: caseId }),
  });
}

export async function loadGameState(gameStateId: string): Promise<GameState> {
  return request<GameState>(`/game-state/${gameStateId}`);
}

export async function updateGameState(
  gameStateId: string,
  updates: Partial<
    Pick<
      GameState,
      "current_act" | "current_scene_id" | "accusations_made" | "status"
    >
  >,
): Promise<GameState> {
  return request<GameState>(`/game-state/${gameStateId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function addClueFound(
  gameStateId: string,
  clueId: string,
): Promise<GameState> {
  return request<GameState>(`/game-state/${gameStateId}/clues`, {
    method: "POST",
    body: JSON.stringify({ clue_id: clueId }),
  });
}

export async function addSceneVisited(
  gameStateId: string,
  sceneId: string,
): Promise<GameState> {
  return request<GameState>(`/game-state/${gameStateId}/scenes`, {
    method: "POST",
    body: JSON.stringify({ scene_id: sceneId }),
  });
}

export async function addConnectionMade(
  gameStateId: string,
  connectionId: string,
): Promise<GameState> {
  return request<GameState>(`/game-state/${gameStateId}/connections`, {
    method: "POST",
    body: JSON.stringify({ connection_id: connectionId }),
  });
}

export async function addDialogueCompleted(
  gameStateId: string,
  dialogueId: string,
): Promise<GameState> {
  return request<GameState>(`/game-state/${gameStateId}/dialogues`, {
    method: "POST",
    body: JSON.stringify({ dialogue_id: dialogueId }),
  });
}

// ========================
// Scripted Events
// ========================

export async function getScriptedEvents(
  caseId: string,
  act: number,
): Promise<ScriptedEvent[]> {
  return request<ScriptedEvent[]>(`/scripted-events/case/${caseId}?act=${act}`);
}

// ========================
// Audio
// ========================

export async function getAudio(caseId: string): Promise<Audio[]> {
  return request<Audio[]>(`/audio/case/${caseId}`);
}
