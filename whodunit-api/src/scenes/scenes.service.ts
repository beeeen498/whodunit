import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Scene } from './entities/scene.entity.js';
import { SceneConnection } from './entities/scene-connection.entity.js';
import { Clue } from '../clues/entities/clue.entity.js';

@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(Scene)
    private readonly sceneRepo: Repository<Scene>,

    @InjectRepository(SceneConnection)
    private readonly connRepo: Repository<SceneConnection>,

    @InjectRepository(Clue)
    private readonly clueRepo: Repository<Clue>,
  ) {}

  async findOne(id: string, cluesFound: string[] = []) {
    const scene = await this.sceneRepo.findOne({ where: { id } });

    if (!scene) {
      throw new NotFoundException(`Scene ${id} not found`);
    }

    // Get all connections FROM this scene (the doors)
    const connections = await this.connRepo.find({
      where: { scene_id_from: id },
    });

    // Get clues in this scene that the player can see.
    // A clue is visible if:
    //   - it has no required_clue_id (always visible), OR
    //   - its required_clue_id is in the player's clues_found array
    const allClues = await this.clueRepo.find({
      where: { scene_id: id },
    });

    const visibleClues = allClues.filter(
      (clue) =>
        !clue.required_clue_id || cluesFound.includes(clue.required_clue_id),
    );

    return {
      ...scene,
      connections,
      clues: visibleClues,
      total_clues: scene.total_clues,
      found_here: cluesFound.filter((id) => allClues.some((c) => c.id === id))
        .length,
    };
  }

  // Returns all scenes for a case — used by the frontend
  // to know which scenes exist and build the map
  async findByCase(caseId: string) {
    return this.sceneRepo.find({
      where: { case_id: caseId },
    });
  }
}
