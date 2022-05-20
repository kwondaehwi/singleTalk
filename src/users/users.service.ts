import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseFailMsgResDto } from 'src/commons/response.dto';
import { Connection } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserResDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        private connection: Connection,
        private jwtService: JwtService,
    ){}

    async create(createUserDto: CreateUserDto){
        const {userID, password, nickname} = createUserDto;
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userID: userID
                }
            })
            if(user){
                return new UserResDto(false);
            }else{
                const user = new User();
                user.userID = userID;
                user.password = password;
                user.nickname = nickname;
                await queryRunner.manager.save(user);
                await queryRunner.commitTransaction();
                return new UserResDto(true);
            }
        } catch(e) {
            console.log(e)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async login(userLoginDto: UserLoginDto){
        const { userID, password} = userLoginDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try{
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userID,
                }
            });
            if(user.password == password){
                const payload = { userIdx: user.userIdx };
                const token =  this.jwtService.sign(payload);
                user.currentToken = token;
                queryRunner.manager.save(user);
                await queryRunner.commitTransaction();
                return token;
            }
            throw new UnauthorizedException('인증되지 않은 사용자입니다.');
        }catch(e){
            console.log(e);
        }finally{
            await queryRunner.release();
        }
    }

    async getMyInfo(userIdx: number){
        
    }

    async userCheck(userIdx: number, token: string){
        const user = await this.getUserIfTokenMatches(token, userIdx);
        if(user){
            return {result: true};
        } else {
            return {result: false};
        }
    }

    async getUserIfTokenMatches(token : string, userIdx : number){
        const queryRunner = this.connection.createQueryRunner();

        try{
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userIdx: userIdx,
                }
            });
            if (token == user.currentToken) {
                return user;
            } else {
                return null;
            }
        } catch(error) {
            console.log(error);
        } finally{
            await queryRunner.release();
        }
    }

    decodeToken(accessToken: string) {
        const decodedAccessToken: any = this.jwtService.decode(accessToken);
        return decodedAccessToken;
    }

    async removeRefreshToken(userIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try{
            const user = await queryRunner.manager.findOne(User, {
                where:{
                    userIdx,
                }
            });
            user.currentToken = null;
            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
        }catch(e){
            await queryRunner.rollbackTransaction();
        }finally{
            await queryRunner.release();
        }
    }
}
