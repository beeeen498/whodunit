import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';
import { Scene } from '../../scenes/entities/scene.entity.js';

@Entity('game_states')
export class GameState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  player_id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @Column({ default: 1 })
  current_act: number;

  @ManyToOne(() => Scene)
  @JoinColumn({ name: 'current_scene_id' })
  current_scene: Scene;

  @Column({ nullable: true })
  current_scene_id: string;

  @Column('jsonb', { default: [] })
  clues_found: string[];

  @Column('jsonb', { default: [] })
  connections_made: string[];

  @Column('jsonb', { default: [] })
  dialogues_completed: string[];

  @Column('jsonb', { default: [] })
  scenes_visited: string[];

  @Column({ default: 0 })
  accusations_made: number;

  @CreateDateColumn()
  start_time: Date;

  @UpdateDateColumn()
  last_played: Date;

  @Column({ default: 'in_progress' })
  status: string;
}
