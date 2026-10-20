import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scene } from './entities/scene.entity.js';
import { SceneConnection } from './entities/scene-connection.entity.js';
import { Clue } from '../clues/entities/clue.entity.js';
import { ScenesService } from './scenes.service.js';
import { ScenesController } from './scenes.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Scene, SceneConnection, Clue])],
  controllers: [ScenesController],
  providers: [ScenesService],
  exports: [ScenesService],
})
export class ScenesModule {}
