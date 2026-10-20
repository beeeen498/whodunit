import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GameStateService } from './game-state.service.js';
import { CreateGameStateDto } from './dto/create-game-state.dto.js';
import { UpdateGameStateDto } from './dto/update-game-state.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard) // every route here requires login
@Controller('game-state')
export class GameStateController {
  constructor(private readonly gsService: GameStateService) {}

  // Start a new game (or resume existing one)
  @Post()
  create(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateGameStateDto,
  ) {
    return this.gsService.create(req.user.id, dto.case_id);
  }

  // Load my progress for a specific case
  @Get('my/:caseId')
  findMy(
    @Request() req: { user: { id: string } },
    @Param('caseId') caseId: string,
  ) {
    return this.gsService.findMy(req.user.id, caseId);
  }

  // Full update (auto-save)
  @Patch(':id')
  update(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateGameStateDto,
  ) {
    return this.gsService.update(id, req.user.id, dto);
  }

  // Shortcut: found a clue
  @Post(':id/clue/:clueId')
  addClue(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('clueId') clueId: string,
  ) {
    return this.gsService.addClue(id, req.user.id, clueId);
  }

  // Shortcut: visited a scene
  @Post(':id/visit/:sceneId')
  visitScene(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('sceneId') sceneId: string,
  ) {
    return this.gsService.visitScene(id, req.user.id, sceneId);
  }

  // Shortcut: made an evidence connection
  @Post(':id/connection/:connectionId')
  addConnection(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Param('connectionId') connectionId: string,
  ) {
    return this.gsService.addConnection(id, req.user.id, connectionId);
  }
}
