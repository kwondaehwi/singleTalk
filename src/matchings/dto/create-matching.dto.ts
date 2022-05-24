import { IsNumber, IsString } from 'class-validator';

export class CreateMatchingDto {
  @IsString()
  title: string;
  @IsString()
  contents: string;
  @IsString()
  link: string;
  @IsNumber()
  people: number;
}