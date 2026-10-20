import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DialogueNode } from './entities/dialogue-node.entity.js';

@Injectable()
export class DialogueService {
  constructor(
    @InjectRepository(DialogueNode)
    private readonly dnRepo: Repository<DialogueNode>,
  ) {}

  // Load all available dialogue for a suspect, filtered by
  // what the player has found and connected so far.
  // A question is available if:
  //   - no required_clue_id, OR the clue has been found
  //   - no required_connection_id, OR the connection has been made
  //   - no previous_node_id, OR that dialogue has been completed
  async findForSuspect(
    suspectId: string,
    cluesFound: string[] = [],
    connectionsMade: string[] = [],
    dialoguesCompleted: string[] = [],
  ) {
    const allNodes = await this.dnRepo.find({
      where: { suspect_id: suspectId },
    });

    return allNodes.filter((node) => {
      // Check clue prerequisite
      if (node.required_clue_id && !cluesFound.includes(node.required_clue_id)) {
        return false;
      }

      // Check evidence connection prerequisite
      if (node.required_connection_id && !connectionsMade.includes(node.required_connection_id)) {
        return false;
      }

      // Check previous dialogue prerequisite
      if (node.previous_node_id && !dialoguesCompleted.includes(node.previous_node_id)) {
        return false;
      }

      return true;
    });
  }
}
