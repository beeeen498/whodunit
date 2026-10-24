import { Controller, Get, Query } from '@nestjs/common';
import { CluesService } from './clues.service.js';

@Controller('clues')
export class CluesController {
  constructor(private readonly cluesService: CluesService) {}

  // ========================
  // GET /clues/found?ids=uuid1,uuid2,uuid3
  // The frontend sends the player's found clue ids,
  // and gets the full clues back (name, text, image...).
  // ========================
  @Get('found')
  findFound(@Query('ids') idsRaw?: string) {
    // "a,b,c" → ["a", "b", "c"], and skip empty bits
    const ids = idsRaw ? idsRaw.split(',').filter(Boolean) : [];
    return this.cluesService.findByIds(ids);
  }
}
