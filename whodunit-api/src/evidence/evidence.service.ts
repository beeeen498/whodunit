import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvidenceConnection } from './entities/evidence-connection.entity.js';

@Injectable()
export class EvidenceService {
  constructor(
    @InjectRepository(EvidenceConnection)
    private readonly ecRepo: Repository<EvidenceConnection>,
  ) {}

  // Player drags clue A onto clue B on the evidence board.
  // Check if that connection exists (in either order).
  async validate(caseId: string, clueId1: string, clueId2: string) {
    const connection = await this.ecRepo.findOne({
      where: [
        { case_id: caseId, clue_id_1: clueId1, clue_id_2: clueId2 },
        { case_id: caseId, clue_id_1: clueId2, clue_id_2: clueId1 },
      ],
    });

    if (!connection) {
      return { valid: false, message: 'These clues don\'t seem connected.' };
    }

    return {
      valid: connection.is_valid,
      connection_id: connection.id,
      realization_text: connection.realization_text,
      unlock_type: connection.unlock_type,
      unlock_id: connection.unlock_id,
    };
  }
}
