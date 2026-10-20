import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';

@Entity('scenes')
export class Scene {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image_url: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 'internal' })
  type: string;

  @Column({ default: false })
  is_locked: boolean;

  @Column({ nullable: true })
  unlock_clue_id: string;

  @Column({ default: 0 })
  total_clues: number;
}
