import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity.js';

@Injectable()
export class CasesService {
  constructor(
    @InjectRepository(Case)
    private readonly caseRepo: Repository<Case>,
  ) {}

  async findOne(id: string) {
    const found = await this.caseRepo.findOne({
      where: { id },
    });

    if (!found) {
      throw new NotFoundException(`Case ${id} not found`);
    }

    return found;
  }
}
