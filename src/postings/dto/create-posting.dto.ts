import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreatePostingDto {

  @IsString()
  boardType: "region" | "global";
  @IsString()
  category: string;
  @IsString()
  title: string;
  @IsString()
  content: string;
  @IsBoolean()
  isAnonymous: boolean;
}