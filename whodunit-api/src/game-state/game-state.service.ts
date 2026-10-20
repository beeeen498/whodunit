import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameState } from './entities/game-state.entity.js';

@Injectable()
export class GameStateService {
  constructor(
    @InjectRepository(GameState)
    private readonly gsRepo: Repository<GameState>,
  ) {}

  // ── Start a new game ───────────────────────────────────
  async create(playerId: string, caseId: string) {
    // Check if player already has an in-progress game for this case
    const existing = await this.gsRepo.findOne({
      where: { player_id: playerId, case_id: caseId, status: 'in_progress' },
    });

    if (existing) {
      return existing; // resume instead of duplicating
    }

    const gs = this.gsRepo.create({
      player_id: playerId,
      case_id: caseId,
      current_act: 1,
      clues_found: [],
      connections_made: [],
      dialogues_completed: [],
      scenes_visited: [],
      accusations_made: 0,
      status: 'in_progress',
    });

    return this.gsRepo.save(gs);
  }

  // ── Load my progress for a case ────────────────────────
  async findMy(playerId: string, caseId: string) {
    const gs = await this.gsRepo.findOne({
      where: { player_id: playerId, case_id: caseId, status: 'in_progress' },
    });

    if (!gs) {
      throw new NotFoundException('No saved game found for this case');
    }

    return gs;
  }

  // ── Update game state (auto-save on every action) ──────
  async update(
    id: string,
    playerId: string,
    updates: Partial<Pick<GameState,
      | 'current_act'
      | 'current_scene_id'
      | 'clues_found'
      | 'connections_made'
      | 'dialogues_completed'
      | 'scenes_visited'
      | 'accusations_made'
      | 'status'
    >>,
  ) {
    const gs = await this.gsRepo.findOne({ where: { id } });

    if (!gs) {
      throw new NotFoundException('Game state not found');
    }

    if (gs.player_id !== playerId) {
      throw new ForbiddenException('This is not your save');
    }

    Object.assign(gs, updates);
    return this.gsRepo.save(gs);
  }

  // ── Helper: add a single clue to clues_found ───────────
  async addClue(id: string, playerId: string, clueId: string) {
    const gs = await this.gsRepo.findOne({ where: { id } });

    if (!gs) throw new NotFoundException('Game state not found');
    if (gs.player_id !== playerId) throw new ForbiddenException('This is not your save');

    if (!gs.clues_found.includes(clueId)) {
      gs.clues_found = [...gs.clues_found, clueId];
      return this.gsRepo.save(gs);
    }

    return gs; // already found, no-op
  }

  // ── Helper: add a scene to scenes_visited ──────────────
  async visitScene(id: string, playerId: string, sceneId: string) {
    const gs = await this.gsRepo.findOne({ where: { id } });

    if (!gs) throw new NotFoundException('Game state not found');
    if (gs.player_id !== playerId) throw new ForbiddenException('This is not your save');

    if (!gs.scenes_visited.includes(sceneId)) {
      gs.scenes_visited = [...gs.scenes_visited, sceneId];
    }
    gs.current_scene_id = sceneId;
    return this.gsRepo.save(gs);
  }

  // ── Helper: add an evidence connection ─────────────────
  async addConnection(id: string, playerId: string, connectionId: string) {
    const gs = await this.gsRepo.findOne({ where: { id } });

    if (!gs) throw new NotFoundException('Game state not found');
    if (gs.player_id !== playerId) throw new ForbiddenException('This is not your save');

    if (!gs.connections_made.includes(connectionId)) {
      gs.connections_made = [...gs.connections_made, connectionId];
      return this.gsRepo.save(gs);
    }

    return gs;
  }
}
