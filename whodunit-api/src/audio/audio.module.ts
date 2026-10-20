import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audio } from './entities/audio.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Audio])],
})
export class AudioModule {}
