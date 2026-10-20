import {
  IsOptional,
  IsNumber,
  IsUUID,
  IsArray,
  IsString,
} from 'class-validator';

export class UpdateGameStateDto {
  @IsOptional()
  @IsNumber()
  current_act?: number;

  @IsOptional()
  @IsUUID()
  current_scene_id?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clues_found?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  connections_made?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dialogues_completed?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scenes_visited?: string[];

  @IsOptional()
  @IsNumber()
  accusations_made?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
