// ========================
// Entity Types
// ========================

export interface Player {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Case {
  id: string;
  title: string;
  setting: string;
  time_period: string;
  style_theme: string;
  music_url: string | null;
  ambient_url: string | null;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Scene {
  id: string;
  case_id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  type: string; // 'internal' | 'external'
  is_locked: boolean;
  unlock_clue_id: string | null;
  total_clues: number;
}

export interface SceneConnection {
  id: string;
  scene_id_from: string;
  scene_id_to: string;
  label: string | null;
  is_locked: boolean;
  unlock_clue_id: string | null;
  x: number;
  y: number;
}

export interface Clue {
  id: string;
  case_id: string;
  name: string;
  description: string;
  detail_text: string | null;
  scene_id: string | null;
  suspect_id: string | null;
  required_clue_id: string | null;
  type: string; // 'physical' | 'dialogue' | 'document' | 'observation'
}

export interface Suspect {
  id: string;
  case_id: string;
  name: string;
  role: string;
  portrait_url: string | null;
  portrait_stressed_url: string | null;
  description: string | null;
  location_during_crime: string | null;
  stated_alibi: string | null;
  // is_guilty is never sent to frontend
}

export interface DialogueNode {
  id: string;
  case_id: string;
  suspect_id: string;
  question_text: string;
  response_text: string;
  detective_thought: string | null;
  required_clue_id: string | null;
  required_connection_id: string | null;
  previous_node_id: string | null;
  unlocks_clue_id: string | null;
  category: string; // 'alibi' | 'motive' | 'evidence' | 'background'
  response_options: ResponseOption[] | null;
}

export interface ResponseOption {
  text: string;
  next_node_id: string;
  required_clue_id: string | null;
}

export interface EvidenceConnection {
  id: string;
  case_id: string;
  clue_id_1: string;
  clue_id_2: string;
  is_valid: boolean;
  unlock_type: string; // 'dialogue' | 'realization' | 'scene' | 'none'
  unlock_id: string | null;
  realization_text: string | null;
}

export interface GameState {
  id: string;
  player_id: string;
  case_id: string;
  current_act: number;
  current_scene_id: string | null;
  clues_found: string[];
  connections_made: string[];
  dialogues_completed: string[];
  scenes_visited: string[];
  accusations_made: number;
  start_time: string;
  last_played: string;
  status: string; // 'in_progress' | 'solved' | 'failed'
}

export interface ScriptedEvent {
  id: string;
  case_id: string;
  act: number;
  trigger_type: string;
  trigger_id: string | null;
  event_type: string; // 'cutscene' | 'confrontation' | 'accusation_phase'
  sequence_order: number;
  content: EventSlide[];
}

export interface EventSlide {
  image_url: string;
  text: string;
  speaker: string | null;
  effect: string | null; // 'fade' | 'iris' | 'shake'
}

export interface Audio {
  id: string;
  case_id: string;
  type: string; // 'music' | 'ambient' | 'sfx'
  name: string;
  url: string;
  scene_id: string | null;
  loop: boolean;
}

// ========================
// API Response Types
// ========================

export interface AuthResponse {
  access_token: string;
}

export interface SceneWithDetails extends Scene {
  clues: Clue[];
  connections: SceneConnection[];
}

export interface EvidenceValidation {
  is_valid: boolean;
  unlock_type: string;
  unlock_id: string | null;
  realization_text: string | null;
}
