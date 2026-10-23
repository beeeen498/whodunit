import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';

@Entity('suspects')
export class Suspect {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @Column()
  name: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  portrait_url: string;

  @Column({ nullable: true })
  portrait_stressed_url: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: false, select: false })
  is_guilty: boolean;

  @Column('text', { nullable: true })
  location_during_crime: string;

  @Column('text', { nullable: true })
  stated_alibi: string;

  // ========================
  // What the player sees in the People tab
  // profile = short public note (no spoilers)
  // status  = 'suspect' | 'victim' | 'police'
  // ========================
  @Column('text', { nullable: true })
  profile: string;

  @Column({ default: 'suspect' })
  status: string;
}
