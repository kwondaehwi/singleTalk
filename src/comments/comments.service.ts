import { Injectable } from '@nestjs/common';
import { BaseFailResDto, BaseSuccessResDto } from 'src/commons/response.dto';
import { Posting } from 'src/postings/entities/posting.entity';
import { User } from 'src/users/entities/user.entity';
import { Connection } from 'typeorm';
import { CommentResDto } from './dto/comment-res.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment, Reply } from './entities/comment.entity';

@Injectable()
export class CommentsService {
    constructor(
        private connection: Connection,
    ){}

    async getComments(postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        try {
            const comments = await queryRunner.manager
                .createQueryBuilder(Comment, 'comment')
                .select(['comment.commentIdx', 'comment.postingIdx','comment.content'])
                .addSelect(['user.nickname', 'user.userIdx'])
                .addSelect(['replies.replyIdx', 'replies.commentIdx', 'replies.content'])
                .addSelect(['repliesUser.nickname', 'repliesUser.userIdx'])
                .leftJoin('comment.user', 'user')
                .leftJoin('comment.replies', 'replies')
                .leftJoin('replies.user', 'repliesUser')
                .where('comment.postingIdx = :postingIdx', {postingIdx})
                .getMany();

            console.log(comments)
            return new CommentResDto(comments);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

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
                reply.content = content;
                reply.isAnonymous = isAnonymous;
                reply.user = user;
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

    async deleteComment(userIdx: number, commentIdx: number, type: String){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if(type === "comment"){
                const comment = await queryRunner.manager.findOne(Comment, {
                    where: {
                        commentIdx: commentIdx,
                    }
                });
                if(comment.userIdx !== userIdx){
                    return new BaseFailResDto("해당 유저의 댓글이 아닙니다.");
                }
                await queryRunner.manager.delete(Comment, commentIdx);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            } else if(type === "reply"){
                const reply = await queryRunner.manager.findOne(Reply, {
                    where: {
                        replyIdx: commentIdx,
                    }
                });
                if(reply.userIdx !== userIdx){
                    return new BaseFailResDto("해당 유저의 대댓글이 아닙니다.");
                }
                await queryRunner.manager.delete(Reply, {replyIdx: commentIdx});
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
