import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreatePostingDto {

  @IsNumber()
  boardIdx: number;

  @IsNumber()
  userIdx: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsBoolean()
  isAnonymous: boolean;
}