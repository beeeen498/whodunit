import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suspect } from './entities/suspect.entity.js';
import { SuspectsService } from './suspects.service.js';
import { SuspectsController } from './suspects.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Suspect])],
  controllers: [SuspectsController],
  providers: [SuspectsService],
  exports: [SuspectsService],
})
export class SuspectsModule {}
