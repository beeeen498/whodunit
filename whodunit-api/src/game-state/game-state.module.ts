import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module.js';
import { GameState } from './entities/game-state.entity.js';
import { GameStateService } from './game-state.service.js';
import { GameStateController } from './game-state.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([GameState]), AuthModule],
  controllers: [GameStateController],
  providers: [GameStateService],
  exports: [GameStateService],
})
export class GameStateModule {}
