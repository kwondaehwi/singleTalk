import { Injectable } from '@nestjs/common';
import { BaseFailMsgResDto, BaseFailResDto, BaseSuccessResDto } from 'src/commons/response.dto';
import { Like } from 'src/likes/entities/like.entity';
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

    async getComments(userIdx: number, postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const comments = await queryRunner.manager
                .createQueryBuilder(Comment, 'comment')
                .select(['comment.commentIdx', 'comment.postingIdx','comment.content', 'comment.isAnonymous', 'comment.isDeleted'])
                .leftJoinAndSelect('comment.user', 'user')
                .leftJoinAndSelect('comment.replies', 'replies')
                .leftJoinAndSelect('replies.user', 'repliesUser')
                .leftJoinAndMapMany('comment.likes', Like, 'likes', 'comment.commentIdx = likes.parentIdx and likes.type = "comment"')
                .leftJoinAndMapMany('replies.likes', Like, 'replyLikes', 'replies.replyIdx = likes.parentIdx and likes.type = "reply"')
                .where('comment.postingIdx = :postingIdx', {postingIdx})
                .getMany();


                const responses = [];
                comments.map(comment => {
                    const response = {};
                    response['commentIdx'] = comment.commentIdx;
                    response['postingIdx'] = comment.postingIdx;
                    response['userIdx'] = comment.user.userIdx;
                    response['userNickname'] = comment.user.nickname;
                    response['content'] = comment.content;
                    response['isAnonymous'] = comment.isAnonymous;
                    response['joyfulCnt'] = 0;
                    response['replyCnt'] = 0;
                    response['isJoyful'] = false;
                    comment.userIdx === userIdx ? response['isOwner'] = true : response['isOwner'] = false;
                    response['isDelete'] = comment.isDeleted;
                    
                    const likeArr = comment['likes'];
                    const replyArr = comment.replies;
                    const answers = [];
                    replyArr.map(reply => {
                        const replyRes = {};
                        replyRes['replyIdx'] = reply.replyIdx;
                        replyRes['commentIdx'] = reply.commentIdx;
                        replyRes['userIdx'] = reply.user.userIdx;
                        replyRes['userNickname'] = reply.user.nickname;
                        replyRes['content'] = reply.content;
                        replyRes['isDeleted'] = reply.isDeleted;
                        replyRes['isAnonymous'] = reply.isAnonymous;
                        reply.userIdx === userIdx ? replyRes['isOwner'] = true : replyRes['isOwner'] = false;
                        answers.push(replyRes);
                    })
                    response['answers'] = answers;
                    const joyfuls = likeArr.filter(like => like.category === "joyful");
                    joyfuls.map(joyful => joyful.userIdx === userIdx ? response['isJoyful'] = true : response['isJoyful'] = false)
                    response['joyfulCnt'] = joyfuls.length;
                    response['replyCnt'] = comment.replies.length;
                    
                    responses.push(response);
                });
            await queryRunner.commitTransaction();
            return new CommentResDto(responses);
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
                    return new BaseFailMsgResDto("해당 유저의 댓글이 아닙니다.");
                }
                comment.isDeleted = true;
                await queryRunner.manager.save(comment);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            } else if(type === "reply"){
                const reply = await queryRunner.manager.findOne(Reply, {
                    where: {
                        replyIdx: commentIdx,
                    }
                });
                if(reply.userIdx !== userIdx){
                    return new BaseFailMsgResDto("해당 유저의 대댓글이 아닙니다.");
                }
                reply.isDeleted = true;
                await queryRunner.manager.save(reply);
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            }
            return new BaseFailMsgResDto("타입이 맞지 않습니다.");
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
