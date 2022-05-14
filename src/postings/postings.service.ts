import { Injectable } from '@nestjs/common';
import { pseudoRandomBytes } from 'crypto';
import { Board } from 'src/boards/entities/board.entity';
import { BaseSuccessResDto } from 'src/commons/response.dto';
import { User } from 'src/users/entities/user.entity';
import { Connection } from 'typeorm';
import { CreatePostingDto } from './dto/create-posting.dto';
import { PostingResDto } from './dto/posting-res.dto';
import { Posting } from './entities/posting.entity';

@Injectable()
export class PostingsService {
    constructor(
        private connection: Connection
    ){}

    async getPostings(category: string, sort: string, type: string){
        const queryRunner = this.connection.createQueryRunner();

        try {
            if (category == "all"){
                const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx'])
                .addSelect(['user.nickname'])
                .leftJoin('posting.user', 'user')
                .leftJoin('posting.board', 'board')
                .where('board.type = :type', {type})
                .getMany()

                return new PostingResDto(postings);
            } else{
                const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx'])
                .addSelect(['user.nickname'])
                .leftJoin('posting.user', 'user')
                .leftJoin('posting.board', 'board')
                .where('board.type = :type and board.category = :category', {type, category})
                .getMany()

                return new PostingResDto(postings);
            }
        } catch(e) {
            console.log(e);
        } finally {
            await queryRunner.release();
        }
    }

    async create(createPostingDto: CreatePostingDto){
        const {boardType, category, userIdx, title, content, isAnonymous} = createPostingDto;
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
                    type: boardType,
                    category: category,
                }
            })
            posting.user = user;
            posting.board = board;
            posting.content = content;
            posting.title = title;
            posting.isAnonymous = isAnonymous;
            await queryRunner.manager.save(posting);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
