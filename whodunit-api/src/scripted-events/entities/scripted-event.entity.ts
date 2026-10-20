import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';

@Entity('scripted_events')
export class ScriptedEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @Column()
  act: number;

  @Column()
  trigger_type: string;

  @Column({ nullable: true })
  trigger_id: string;

  @Column({ default: 'cutscene' })
  event_type: string;

  @Column({ default: 1 })
  sequence_order: number;

  @Column('jsonb')
  content: object;
}
