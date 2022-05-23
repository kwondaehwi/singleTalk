import { ConsoleLogger, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BaseFailMsgResDto, BaseSuccessResDto } from 'src/commons/response.dto';
import { Connection } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMyProfileDto, UpdateMyRegionDto } from './dto/update-user.dto';
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
        const {userID, password, nickname, region} = createUserDto;
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
                user.region = region;
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
            console.log(password);
            console.log(user.password);
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
        const queryRunner = this.connection.createQueryRunner();
        try{
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userIdx,
                }
            });
            const response = {};
            response['userNickname'] =user.nickname;
            response['introduce'] = user.introduce;
            return new UserResDto(response);
        } catch(error) {
            console.log(error);
        } finally{
            await queryRunner.release();
        }
    }

    async getMyRegion(userIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        try{
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userIdx,
                }
            });
            const response = {};
            response['region'] =user.region;
            return new UserResDto(response);
        } catch(error) {
            console.log(error);
        } finally{
            await queryRunner.release();
        }
    }

    async updateMyProfile(userIdx: number, updateMyProfileDto: UpdateMyProfileDto){
        const {userNickname, introduce, location} = updateMyProfileDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try{
            const user = await queryRunner.manager.findOne(User, {
                where:{
                    userIdx,
                }
            });
            user.nickname = userNickname;
            user.introduce = introduce;
            user.region = location;
            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        }catch(e){
            await queryRunner.rollbackTransaction();
        }finally{
            await queryRunner.release();
        }
    }

    async updateMyRegion(userIdx: number, updateMyRegionDto: UpdateMyRegionDto){
        const {region} = updateMyRegionDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try{
            const user = await queryRunner.manager.findOne(User, {
                where:{
                    userIdx,
                }
            });
            user.region = region;
            await queryRunner.manager.save(user);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        }catch(e){
            await queryRunner.rollbackTransaction();
        }finally{
            await queryRunner.release();
        }
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
