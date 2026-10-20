import { Controller, Post, Body } from '@nestjs/common';
import { EvidenceService } from './evidence.service.js';
import { ValidateConnectionDto } from './dto/validate-connection.dto.js';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  // POST /evidence/validate
  // Player connects two clues on the evidence board
  @Post('validate')
  validate(@Body() dto: ValidateConnectionDto) {
    return this.evidenceService.validate(
      dto.case_id,
      dto.clue_id_1,
      dto.clue_id_2,
    );
  }
}
