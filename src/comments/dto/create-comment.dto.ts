import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {

  @IsNumber()
  postingIdx: number | null;
  @IsNumber()
  commentIdx: number | null;
  @IsString()
  content: string;
  @IsBoolean()
  isAnonymous: boolean;
}