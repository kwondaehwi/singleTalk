import { IsBoolean, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateCommentDto {

  @IsOptional()
  @IsNumber()
  postingIdx: number | null;
  @IsOptional()
  @IsNumber()
  commentIdx: number | null;
  @IsString()
  content: string;
  @IsBoolean()
  isAnonymous: boolean;
}