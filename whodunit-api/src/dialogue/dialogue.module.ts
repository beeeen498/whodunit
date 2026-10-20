import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DialogueNode } from './entities/dialogue-node.entity.js';
import { DialogueService } from './dialogue.service.js';
import { DialogueController } from './dialogue.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([DialogueNode])],
  controllers: [DialogueController],
  providers: [DialogueService],
  exports: [DialogueService],
})
export class DialogueModule {}
