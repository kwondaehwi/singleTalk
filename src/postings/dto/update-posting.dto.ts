import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class UpdatePostingDto {

  @IsString()
  title: string;
  @IsString()
  content: string;
  @IsString()
  category: string;
  @IsBoolean()
  isAnonymous: boolean;
  @IsString()
  boardType: string;
}