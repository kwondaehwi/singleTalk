import { IsString } from 'class-validator';

export class UpdateMyProfileDto {
  @IsString()
  userNickname: string;

  @IsString()
  introduce: string;
}

export class UpdateMyRegionDto {

    @IsString()
    region: string;
  }