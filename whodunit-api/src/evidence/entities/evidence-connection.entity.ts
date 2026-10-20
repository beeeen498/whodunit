import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';

@Entity('evidence_connections')
export class EvidenceConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @Column()
  clue_id_1: string;

  @Column()
  clue_id_2: string;

  @Column({ default: false })
  is_valid: boolean;

  @Column({ default: 'none' })
  unlock_type: string;

  @Column({ nullable: true })
  unlock_id: string;

  @Column('text', { nullable: true })
  realization_text: string;
}
