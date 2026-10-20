import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvidenceConnection } from './entities/evidence-connection.entity.js';
import { EvidenceService } from './evidence.service.js';
import { EvidenceController } from './evidence.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([EvidenceConnection])],
  controllers: [EvidenceController],
  providers: [EvidenceService],
  exports: [EvidenceService],
})
export class EvidenceModule {}
