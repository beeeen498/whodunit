import { IsUUID } from 'class-validator';

export class ValidateConnectionDto {
  @IsUUID()
  case_id: string;

  @IsUUID()
  clue_id_1: string;

  @IsUUID()
  clue_id_2: string;
}
