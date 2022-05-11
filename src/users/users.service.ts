import { Injectable } from '@nestjs/common';
import { BaseFailMsgResDto } from 'src/commons/response.dto';
import { Connection } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        private connection: Connection,
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
}
