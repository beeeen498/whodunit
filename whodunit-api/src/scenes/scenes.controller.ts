import { Controller, Get, Param, Query } from '@nestjs/common';
import { ScenesService } from './scenes.service.js';

@Controller('scenes')
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  // GET /scenes/case/:caseId
  // Returns all scenes for a case (names, locked status, etc.)
  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.scenesService.findByCase(caseId);
  }

  // GET /scenes/:id?clues_found=uuid1,uuid2,uuid3
  // clues_found is optional — pass the player's found clues
  // so the response filters conditional clues correctly
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Query('clues_found') cluesFoundRaw?: string,
  ) {
    const cluesFound = cluesFoundRaw ? cluesFoundRaw.split(',') : [];

    return this.scenesService.findOne(id, cluesFound);
  }
}
