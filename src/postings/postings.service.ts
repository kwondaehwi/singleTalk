import { Injectable } from '@nestjs/common';
import { Board } from 'src/boards/entities/board.entity';
import { User } from 'src/users/entities/user.entity';
import { Connection } from 'typeorm';
import { CreatePostingDto } from './dto/create-posting.dto';
import { Posting } from './entities/posting.entity';

@Injectable()
export class PostingsService {
    constructor(
        private connection: Connection
    ){}

    async create(createPostingDto: CreatePostingDto){
        const {boardIdx, userIdx, title, content, isAnonymous} = createPostingDto;
        const queryRunner = this.connection.createQueryRunner();
        
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const posting = new Posting();
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userIdx,
                }
            });
            const board = await queryRunner.manager.findOne(Board, {
                where: {
                    boardIdx,
                }
            })
            posting.user = user;
            posting.board = board;
            posting.content = content;
            posting.title = title;
            posting.isAnonymous = isAnonymous;
            await queryRunner.manager.save(posting);
            await queryRunner.commitTransaction();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
