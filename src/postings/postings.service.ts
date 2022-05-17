import { Injectable } from '@nestjs/common';
import { pseudoRandomBytes } from 'crypto';
import { Board } from 'src/boards/entities/board.entity';
import { BaseFailResDto, BaseSuccessResDto } from 'src/commons/response.dto';
import { Joyful } from 'src/joyfuls/entities/joyful.entity';
import { Useful } from 'src/usefuls/entities/useful.entity';
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

    async getPosting(postingIdx: number, userIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        try {
            const posting = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content','posting.userIdx','posting.createdAt', 'posting.updatedAt'])
                .addSelect(['user.nickname', 'user.userID'])
                .addSelect(['usefuls.userIdx'])
                .addSelect(['joyfuls.userIdx'])
                .leftJoin('posting.user', 'user')
                .leftJoin('posting.usefuls', 'usefuls')
                .leftJoin('posting.joyfuls', 'joyfuls')
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
            const posting = await queryRunner.manager.findOne(Posting, {
                where: {
                    postingIdx,
                }
            });
            await queryRunner.manager.delete(Posting, posting);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async useful(userIdx: number, postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const useful = await queryRunner.manager.findOne(Useful, {
                where: {
                    userIdx,
                    postingIdx,
                }
            });
            if (useful){
                await queryRunner.manager.delete(Useful, useful);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            } else {
                const useful = new Useful();
                const posting = await queryRunner.manager.findOne(Posting, {
                    where: {
                        postingIdx,
                    }
                });
                const user = await queryRunner.manager.findOne(User, {
                    where:{
                        userIdx,
                    }
                });
                useful.user = user;
                useful.posting = posting;
                await queryRunner.manager.save(useful);
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

    async joyful(userIdx: number, postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const joyful = await queryRunner.manager.findOne(Joyful, {
                where: {
                    userIdx,
                    postingIdx,
                }
            });
            if (joyful){
                await queryRunner.manager.delete(Joyful, joyful);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            } else {
                const joyful = new Joyful();
                const posting = await queryRunner.manager.findOne(Posting, {
                    where: {
                        postingIdx,
                    }
                });
                const user = await queryRunner.manager.findOne(User, {
                    where:{
                        userIdx,
                    }
                });
                joyful.user = user;
                joyful.posting = posting;
                await queryRunner.manager.save(joyful);
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
