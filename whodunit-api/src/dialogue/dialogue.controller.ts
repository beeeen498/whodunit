import { Controller, Get, Param, Query } from '@nestjs/common';
import { DialogueService } from './dialogue.service.js';

@Controller('dialogue')
export class DialogueController {
  constructor(private readonly dialogueService: DialogueService) {}

  // GET /dialogue/:suspectId?clues_found=a,b&connections_made=c,d&dialogues_completed=e,f
  @Get(':suspectId')
  findForSuspect(
    @Param('suspectId') suspectId: string,
    @Query('clues_found') cluesRaw?: string,
    @Query('connections_made') connectionsRaw?: string,
    @Query('dialogues_completed') dialoguesRaw?: string,
  ) {
    const cluesFound = cluesRaw ? cluesRaw.split(',') : [];
    const connectionsMade = connectionsRaw ? connectionsRaw.split(',') : [];
    const dialoguesCompleted = dialoguesRaw ? dialoguesRaw.split(',') : [];

    return this.dialogueService.findForSuspect(
      suspectId,
      cluesFound,
      connectionsMade,
      dialoguesCompleted,
    );
  }
}
