import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScriptedEvent } from './entities/scripted-event.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([ScriptedEvent])],
})
export class ScriptedEventsModule {}
