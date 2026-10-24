import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Clue } from './entities/clue.entity.js';

@Injectable()
export class CluesService {
  constructor(
    @InjectRepository(Clue)
    private readonly clueRepo: Repository<Clue>,
  ) {}

  // ========================
  // Get the full clues for a list of ids.
  // Returns them in the same order as the ids,
  // which is the order the player found them.
  // ========================
  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];

    // ---- Load all the clues in one database call ----
    // In(ids) = "where id is one of these"
    const clues = await this.clueRepo.find({ where: { id: In(ids) } });

    // ---- Put them back in discovery order ----
    // The database returns them in any order, so for each id
    // we find its clue. Ids with no clue are dropped.
    return ids
      .map((id) => clues.find((c) => c.id === id))
      .filter((c) => c !== undefined);
  }
}
