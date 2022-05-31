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

    async getComments(postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const comments = await queryRunner.manager
                .createQueryBuilder(Comment, 'comment')
                .select(['comment.commentIdx', 'comment.postingIdx','comment.content'])
                .addSelect(['user.nickname', 'user.userIdx'])
                .addSelect(['replies.replyIdx', 'replies.commentIdx', 'replies.content'])
                .addSelect(['repliesUser.nickname', 'repliesUser.userIdx'])
                .addSelect(['likes.likeIdx', 'likes.userIdx', 'likes.type', 'likes.category'])
                .leftJoin('comment.user', 'user')
                .leftJoin('comment.replies', 'replies')
                .leftJoin('replies.user', 'repliesUser')
                .leftJoinAndMapMany('comment.likes', Like, 'likes', 'comment.commentIdx = likes.parentIdx')
                .where('comment.postingIdx = :postingIdx', {postingIdx})
                .getMany();


                // const responses = [];
                // comments.map(comment => {
                //     const response = {};
                //     response['commentIdx'] = comment.commentIdx;
                //     response['postingIdx'] = comment.postingIdx;
                //     response['userIdx'] = comment.user.userIdx;
                //     response['userNickname'] = comment.user.nickname;
                //     response['content'] = comment.content;
                //     response['isAnonymous'] = comment.isAnonymous;
                //     response['joyfulCnt'] = 0;
                //     response['replyCnt'] = 0;
                //     response['isJoyful'] = false;
                //     response['isOwner'] = false;
                //     response['isDelete'] = false;
                    
                //     const likeArr = posting['likes'];
                //     const joyfuls = likeArr.filter(like => like.category === "joyful");
                //     joyfuls.map(joyful => joyful.userIdx === userIdx ? response['isJoyful'] = true : response['isJoyful'] = false)
                    
                //     const usefuls = likeArr.filter(like => like.category === "useful");
                //     usefuls.map(useful => useful.userIdx === userIdx ? response['isUseful'] = true : response['isUseful'] = false)
                    
                //     const scraps = likeArr.filter(like => like.category === "scrap");
                //     scraps.map(scrap => scrap.userIdx === userIdx ? response['isScrap'] = true : response['isScrap'] = false)
                    
                //     response['usefulCnt'] = usefuls.length;
                //     response['joyfulCnt'] = joyfuls.length;
                //     response['scrapCnt'] = scraps.length;
                //     response['commentCnt'] = posting.comments.length;
                    
                //     responses.push(response);
                // })

            console.log(comments);
            await queryRunner.commitTransaction();
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
