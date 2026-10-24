import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clue } from './entities/clue.entity.js';
import { CluesService } from './clues.service.js';
import { CluesController } from './clues.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Clue])],
  // ---- New: the address and the database logic ----
  controllers: [CluesController],
  providers: [CluesService],
})
export class CluesModule {}
