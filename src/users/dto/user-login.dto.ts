import { IsString } from "class-validator";

export class UserLoginDto{
    @IsString()
    userID : string;
    @IsString()
    password : string;
}