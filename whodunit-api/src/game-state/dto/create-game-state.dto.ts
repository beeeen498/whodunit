import { IsString, IsUUID } from 'class-validator';

export class CreateGameStateDto {
  @IsUUID()
  case_id: string;
}
