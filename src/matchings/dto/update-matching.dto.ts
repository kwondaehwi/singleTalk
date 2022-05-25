import { IsNumber, IsString } from 'class-validator';

export class UpdateMatchingDto {
  @IsString()
  title: string;
  @IsString()
  contents: string;
  @IsString()
  link: string;
  @IsNumber()
  people: number;
}

export class DeleteUserMatchingDto {

    @IsNumber()
    userIdx: number;
  }