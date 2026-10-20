import { Controller, Get, Param } from '@nestjs/common';
import { SuspectsService } from './suspects.service.js';

@Controller('suspects')
export class SuspectsController {
  constructor(private readonly suspectsService: SuspectsService) {}

  // GET /suspects/case/:caseId
  @Get('case/:caseId')
  findByCase(@Param('caseId') caseId: string) {
    return this.suspectsService.findByCase(caseId);
  }
}
