import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Suspect } from './entities/suspect.entity.js';

@Injectable()
export class SuspectsService {
  constructor(
    @InjectRepository(Suspect)
    private readonly suspectRepo: Repository<Suspect>,
  ) {}

  async findByCase(caseId: string) {
    // is_guilty has select: false on the entity,
    // so TypeORM automatically strips it from results
    return this.suspectRepo.find({
      where: { case_id: caseId },
    });
  }
}
