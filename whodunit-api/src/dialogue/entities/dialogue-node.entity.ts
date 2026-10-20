import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Case } from '../../cases/entities/case.entity.js';
import { Suspect } from '../../suspects/entities/suspect.entity.js';

@Entity('dialogue_nodes')
export class DialogueNode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Case)
  @JoinColumn({ name: 'case_id' })
  case: Case;

  @Column()
  case_id: string;

  @ManyToOne(() => Suspect)
  @JoinColumn({ name: 'suspect_id' })
  suspect: Suspect;

  @Column()
  suspect_id: string;

  @Column('text')
  question_text: string;

  @Column('text')
  response_text: string;

  @Column('text', { nullable: true })
  detective_thought: string;

  @Column({ nullable: true })
  required_clue_id: string;

  @Column({ nullable: true })
  required_connection_id: string;

  @Column({ nullable: true })
  previous_node_id: string;

  @Column({ nullable: true })
  unlocks_clue_id: string;

  @Column({ default: 'background' })
  category: string;

  @Column('jsonb', { nullable: true })
  response_options: object;
}
