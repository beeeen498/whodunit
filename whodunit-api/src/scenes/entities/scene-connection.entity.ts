import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Scene } from './scene.entity.js';

@Entity('scene_connections')
export class SceneConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Scene)
  @JoinColumn({ name: 'scene_id_from' })
  scene_from: Scene;

  @Column()
  scene_id_from: string;

  @ManyToOne(() => Scene)
  @JoinColumn({ name: 'scene_id_to' })
  scene_to: Scene;

  @Column()
  scene_id_to: string;

  @Column({ nullable: true })
  label: string;

  @Column({ default: false })
  is_locked: boolean;

  @Column({ nullable: true })
  unlock_clue_id: string;

  @Column({ type: 'float', default: 50 })
  x: number;

  @Column({ type: 'float', default: 50 })
  y: number;
}
