import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreatePostingDto {

  @IsString()
  boardType: string;
  @IsString()
  category: string;
  @IsNumber()
  userIdx: number;
  @IsString()
  title: string;
  @IsString()
  content: string;
  @IsBoolean()
  isAnonymous: boolean;
}