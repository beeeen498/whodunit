import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clue } from './entities/clue.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Clue])],
})
export class CluesModule {}
