import { Injectable } from '@nestjs/common';
import { Board } from 'src/boards/entities/board.entity';
import { BaseFailResDto, BaseSuccessResDto } from 'src/commons/response.dto';
import { Like } from 'src/likes/entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import { Connection } from 'typeorm';
import { CreatePostingDto } from './dto/create-posting.dto';
import { PostingResDto } from './dto/posting-res.dto';
import { UpdatePostingDto } from './dto/update-posting.dto';
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
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx','posting.createdAt', 'posting.updatedAt'])
                .addSelect(['user.nickname'])
                .leftJoin('posting.user', 'user')
                .leftJoin('posting.board', 'board')
                .where('board.type = :type', {type})
                .groupBy('posting.postingIdx')
                .getMany()

                return new PostingResDto(postings);
            } else{
                const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx','posting.createdAt', 'posting.updatedAt'])
                .addSelect(['user.nickname'])
                .addSelect(['COUNT(usefuls.postingIdx) as usefulCount'])
                .leftJoin('posting.user', 'user')
                .leftJoin('posting.board', 'board')
                .leftJoin('posting.usefuls', 'usefuls')
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

    async getMyPostings(userIdx: number, type: string){
        const queryRunner = this.connection.createQueryRunner();
        try {
            const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content','posting.createdAt', 'posting.updatedAt'])
                .addSelect(['user.nickname', 'user.userID'])
                .leftJoin('posting.user', 'user')
                .leftJoin('posting.board', 'board')
                .where('posting.userIdx = :userIdx and board.type = :type', {userIdx, type})
                .getMany();

            console.log(postings)
            return new PostingResDto(postings);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async getPosting(userIdx: number, postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        try {
            const posting = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content','posting.userIdx','posting.createdAt', 'posting.updatedAt'])
                .addSelect(['user.nickname', 'user.userID'])
                .addSelect(['likes.userIdx', 'likes.type'])
                .leftJoin('posting.user', 'user')
                .leftJoin('posting.likes', 'likes')
                .where('posting.postingIdx = :postingIdx', {postingIdx})
                .getOne();

            console.log(posting)
            return new PostingResDto(posting);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async create(createPostingDto: CreatePostingDto, userIdx: number){
        const {boardType, category, title, content, isAnonymous} = createPostingDto;
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

    async update(updatePostingDto: UpdatePostingDto, postingIdx:number){
        const { title, content, category, isAnonymous, boardType} = updatePostingDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const posting = await queryRunner.manager.findOne(Posting, {
                where: {
                    postingIdx,
                }
            });
            const board = await queryRunner.manager.findOne(Board, {
                where: {
                    type: boardType,
                    category: category,
                }
            })
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

    async delete(postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await queryRunner.manager.delete(Posting, postingIdx);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async like(userIdx: number, parentIdx: number, category: string, type: string){
        if(type !== "joyful" && type !== "useful" && type !== "scrap"){
            return new BaseFailResDto('타입이 올바르지 않습니다. (joyful or useful or scrap)');
        }
        if(category !== "reply" && category !== "comment" && category !== "posting"){
            return new BaseFailResDto('카테고리가 올바르지 않습니다. (joyful or useful or scrap)');
        }
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const like = await queryRunner.manager.findOne(Like, {
                where: {
                    userIdx,
                    parentIdx,
                    type,
                    category
                }
            });
            if (like){
                await queryRunner.manager.delete(Like, like);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            } else {
                const like = new Like();
                const user = await queryRunner.manager.findOne(User, {
                    where:{
                        userIdx,
                    }
                });
                like.user = user;
                like.parentIdx = parentIdx;
                like.category = category;
                like.type = type;
                await queryRunner.manager.save(like);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            }
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
            return new BaseFailResDto('false');
        } finally {
            await queryRunner.release();
        }
    }
}
