import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';
import { Scene } from '../../scenes/entities/scene.entity.js';

@Entity('clues')
export class Clue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  detail_text: string;

  @ManyToOne(() => Scene)
  @JoinColumn({ name: 'scene_id' })
  scene: Scene;

  @Column({ nullable: true })
  scene_id: string;

  @Column({ nullable: true })
  suspect_id: string;

  @Column({ nullable: true })
  required_clue_id: string;

  @Column({ default: 'physical' })
  type: string;

  // ========================
  // Position on the inspection image (in percent)
  // Empty for clues that don't use the body panel
  // ========================
  @Column('float', { nullable: true })
  x: number;

  @Column('float', { nullable: true })
  y: number;

  // ========================
  // What kind of popup this clue opens, and its file
  // type examples: 'image', 'model'
  // ========================
  @Column({ nullable: true })
  inspect_type: string;

  @Column({ nullable: true })
  inspect_url: string;
}
