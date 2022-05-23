import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  userID: string;

  @IsString()
  password: string;

  @IsString()
  nickname: string;

  @IsString()
  region: string;
}