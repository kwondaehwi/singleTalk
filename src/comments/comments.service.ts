import { Injectable } from '@nestjs/common';
import { BaseFailResDto, BaseSuccessResDto } from 'src/commons/response.dto';
import { Posting } from 'src/postings/entities/posting.entity';
import { User } from 'src/users/entities/user.entity';
import { Connection } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, Reply } from './entities/comment.entity';

@Injectable()
export class CommentsService {
    constructor(
        private connection: Connection,
    ){}

    async createComment(userIdx: number, createCommentDto: CreateCommentDto){
        const { postingIdx, commentIdx, content, isAnonymous } = createCommentDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try{
            if (postingIdx !== null){
                const comment = new Comment();
                const posting = await queryRunner.manager.findOne(Posting, {
                    where: {
                        postingIdx,
                    }
                });
                const user = await queryRunner.manager.findOne(User, {
                    where: {
                        userIdx,
                    }
                })
                comment.posting = posting;
                comment.content = content;
                comment.isAnonymous = isAnonymous;
                comment.user = user;
                await queryRunner.manager.save(comment);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            } else {
                const reply = new Reply();
                const comment = await queryRunner.manager.findOne(Comment, {
                    where: {
                        commentIdx,
                    }
                });
                const user = await queryRunner.manager.findOne(User, {
                    where: {
                        userIdx,
                    }
                })
                reply.comment = comment;
                comment.content = content;
                comment.isAnonymous = isAnonymous;
                comment.user = user;
                await queryRunner.manager.save(reply);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            }
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async deleteComment(userIdx: number, parentIdx: number, type: String){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userIdx,
                }
            })
            if(!user){
                return new BaseFailResDto("해당 유저의 댓글이 아닙니다.");
            }
            if(type === "posting"){
                const comment = await queryRunner.manager.findOne(Comment, {
                    where: {
                        postingIdx: parentIdx,
                    }
                });
                await queryRunner.manager.delete(Comment, comment);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            } else if(type === "comment"){
                const reply = await queryRunner.manager.findOne(Reply, {
                    where: {
                        commentIdx: parentIdx,
                    }
                });
                await queryRunner.manager.delete(Reply, reply);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            }
            return new BaseFailResDto("타입이 맞지 않습니다.");
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
