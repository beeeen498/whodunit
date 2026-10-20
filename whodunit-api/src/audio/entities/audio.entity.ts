import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';

@Entity('audio')
export class Audio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  scene_id: string;

  @Column({ default: true })
  loop: boolean;
}
