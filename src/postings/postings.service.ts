import { Injectable } from '@nestjs/common';
import { Board } from 'src/boards/entities/board.entity';
import { BaseFailMsgResDto, BaseFailResDto, BaseSuccessResDto } from 'src/commons/response.dto';
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

    async getPostings(userIdx:number, category: string, sort: string, type: string){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if (category == "all"){
                const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx','posting.createdAt', 'posting.updatedAt', 'posting.isAnonymous'])
                .addSelect(['likes.userIdx', 'likes.parentIdx', 'likes.category'])
                .leftJoinAndSelect('posting.comments', 'comments')
                .leftJoinAndSelect('posting.user', 'user')
                .leftJoinAndSelect('posting.board', 'board')
                .leftJoinAndMapMany('posting.likes', Like, 'likes', 'posting.postingIdx = likes.parentIdx and likes.type = "posting"')
                .where('board.type = :type', {type})
                .orderBy('posting.createdAt', 'DESC')
                .getMany()

                const responses = [];
                postings.map(posting => {
                    const response = {};
                    response['postingIdx'] = posting.postingIdx;
                    response['title'] = posting.title;
                    response['userID'] = posting.user.userID;
                    response['userIdx'] = posting.user.userIdx;
                    response['userNickname'] = posting.user.nickname;
                    response['content'] = posting.content;
                    response['isAnonymous'] = posting.isAnonymous;
                    response['updatedAt'] = posting.updatedAt;
                    response['createdAt'] = posting.createdAt;
                    response['usefulCnt'] = 0;
                    response['joyfulCnt'] = 0;
                    response['scrapCnt'] = 0;
                    response['commentCnt'] = 0;
                    response['isUseful'] = false;
                    response['isJoyful'] = false;
                    response['isScrap'] = false;
                    
                    const likeArr = posting['likes'];
                    const joyfuls = likeArr.filter(like => like.category === "joyful");
                    joyfuls.map(joyful => joyful.userIdx === userIdx ? response['isJoyful'] = true : response['isJoyful'] = false)
                    
                    const usefuls = likeArr.filter(like => like.category === "useful");
                    usefuls.map(useful => useful.userIdx === userIdx ? response['isUseful'] = true : response['isUseful'] = false)
                    
                    const scraps = likeArr.filter(like => like.category === "scrap");
                    scraps.map(scrap => scrap.userIdx === userIdx ? response['isScrap'] = true : response['isScrap'] = false)
                    
                    response['usefulCnt'] = usefuls.length;
                    response['joyfulCnt'] = joyfuls.length;
                    response['scrapCnt'] = scraps.length;
                    response['commentCnt'] = posting.comments.length;
                    
                    responses.push(response);
                })
                let result = [];
                if(sort === "joyful"){
                    result = responses.sort(function(a, b) { 
                        return a.joyfulCnt > b.joyfulCnt ? -1 : a.joyfulCnt > b.joyfulCnt ? 1 : 0;
                    });
                } else if (sort === "useful") {
                    result = responses.sort(function(a, b) { 
                        return a.usefulCnt > b.usefulCnt ? -1 : a.usefulCnt > b.usefulCnt ? 1 : 0;
                    });
                } else {
                    result = responses;
                }
                await queryRunner.commitTransaction();
                return new PostingResDto(result);
            } else{
                const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx','posting.createdAt', 'posting.updatedAt', 'posting.isAnonymous'])
                .addSelect(['likes.userIdx', 'likes.parentIdx', 'likes.category'])
                .leftJoinAndSelect('posting.comments', 'comments')
                .leftJoinAndSelect('posting.user', 'user')
                .leftJoinAndSelect('posting.board', 'board')
                .leftJoinAndMapMany('posting.likes', Like, 'likes', 'posting.postingIdx = likes.parentIdx and likes.type = "posting"')
                .where('board.type = :type and board.category = :category', {type, category})
                .orderBy('posting.createdAt', 'DESC')
                .getMany()

                const responses = [];
                postings.map(posting => {
                    const response = {};
                    response['postingIdx'] = posting.postingIdx;
                    response['title'] = posting.title;
                    response['userID'] = posting.user.userID;
                    response['userIdx'] = posting.user.userIdx;
                    response['userNickname'] = posting.user.nickname;
                    response['content'] = posting.content;
                    response['isAnonymous'] = posting.isAnonymous;
                    response['updatedAt'] = posting.updatedAt;
                    response['createdAt'] = posting.createdAt;
                    response['usefulCnt'] = 0;
                    response['joyfulCnt'] = 0;
                    response['scrapCnt'] = 0;
                    response['commentCnt'] = 0;
                    response['isUseful'] = false;
                    response['isJoyful'] = false;
                    response['isScrap'] = false;
                    
                    const likeArr = posting['likes'];
                    const joyfuls = likeArr.filter(like => like.category === "joyful");
                    joyfuls.map(joyful => joyful.userIdx === userIdx ? response['isJoyful'] = true : response['isJoyful'] = false)
                    
                    const usefuls = likeArr.filter(like => like.category === "useful");
                    usefuls.map(useful => useful.userIdx === userIdx ? response['isUseful'] = true : response['isUseful'] = false)
                    
                    const scraps = likeArr.filter(like => like.category === "scrap");
                    scraps.map(scrap => scrap.userIdx === userIdx ? response['isScrap'] = true : response['isScrap'] = false)
                    
                    response['usefulCnt'] = usefuls.length;
                    response['joyfulCnt'] = joyfuls.length;
                    response['scrapCnt'] = scraps.length;
                    response['commentCnt'] = posting.comments.length;
                    
                    responses.push(response);
                })
                let result = [];
                if(sort === "joyful"){
                    result = responses.sort(function(a, b) { 
                        return a.joyfulCnt > b.joyfulCnt ? -1 : a.joyfulCnt > b.joyfulCnt ? 1 : 0;
                    });
                } else if (sort === "useful") {
                    result = responses.sort(function(a, b) { 
                        return a.usefulCnt > b.usefulCnt ? -1 : a.usefulCnt > b.usefulCnt ? 1 : 0;
                    });
                } else {
                    result = responses;
                }
                await queryRunner.commitTransaction();
                return new PostingResDto(result);
            }
        } catch(e) {
            console.log(e);
        } finally {
            await queryRunner.release();
        }
    }

    async getMyPostings(userIdx: number, type: string){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx','posting.createdAt', 'posting.updatedAt', 'posting.isAnonymous'])
                .addSelect(['likes.userIdx', 'likes.parentIdx', 'likes.category'])
                .leftJoinAndSelect('posting.comments', 'comments')
                .leftJoinAndSelect('posting.user', 'user')
                .leftJoinAndSelect('posting.board', 'board')
                .leftJoinAndMapMany('posting.likes', Like, 'likes', 'posting.postingIdx = likes.parentIdx and likes.type = "posting"')
                .where('posting.userIdx = :userIdx and board.type = :type', {userIdx, type})
                .orderBy('posting.createdAt', 'DESC')
                .getMany();

                const responses = [];
                postings.map(posting => {
                    const response = {};
                    response['postingIdx'] = posting.postingIdx;
                    response['title'] = posting.title;
                    response['userID'] = posting.user.userID;
                    response['userIdx'] = posting.user.userIdx;
                    response['userNickname'] = posting.user.nickname;
                    response['content'] = posting.content;
                    response['isAnonymous'] = posting.isAnonymous;
                    response['updatedAt'] = posting.updatedAt;
                    response['createdAt'] = posting.createdAt;
                    response['usefulCnt'] = 0;
                    response['joyfulCnt'] = 0;
                    response['scrapCnt'] = 0;
                    response['commentCnt'] = 0;
                    response['isUseful'] = false;
                    response['isJoyful'] = false;
                    response['isScrap'] = false;
                    
                    const likeArr = posting['likes'];
                    const joyfuls = likeArr.filter(like => like.category === "joyful");
                    joyfuls.map(joyful => joyful.userIdx === userIdx ? response['isJoyful'] = true : response['isJoyful'] = false)
                    
                    const usefuls = likeArr.filter(like => like.category === "useful");
                    usefuls.map(useful => useful.userIdx === userIdx ? response['isUseful'] = true : response['isUseful'] = false)
                    
                    const scraps = likeArr.filter(like => like.category === "scrap");
                    scraps.map(scrap => scrap.userIdx === userIdx ? response['isScrap'] = true : response['isScrap'] = false)
                    
                    response['usefulCnt'] = usefuls.length;
                    response['joyfulCnt'] = joyfuls.length;
                    response['scrapCnt'] = scraps.length;
                    response['commentCnt'] = posting.comments.length;
                    
                    responses.push(response);
                })

            console.log(responses);
            await queryRunner.commitTransaction();
            return new PostingResDto(responses);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async getScrapedPostings(userIdx: number, type: string){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const postings = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx','posting.createdAt', 'posting.updatedAt', 'posting.isAnonymous'])
                .addSelect(['likes.userIdx', 'likes.parentIdx', 'likes.category'])
                .leftJoinAndSelect('posting.comments', 'comments')
                .leftJoinAndSelect('posting.user', 'user')
                .leftJoinAndSelect('posting.board', 'board')
                .leftJoinAndMapMany('posting.likes', Like, 'likes', 'posting.postingIdx = likes.parentIdx and likes.type = "posting"')
                .where('board.type = :type', {type})
                .orderBy('posting.createdAt', 'DESC')
                .getMany();

                const responses = [];
                postings.map(posting => {
                    const response = {};
                    response['postingIdx'] = posting.postingIdx;
                    response['title'] = posting.title;
                    response['userID'] = posting.user.userID;
                    response['userIdx'] = posting.user.userIdx;
                    response['userNickname'] = posting.user.nickname;
                    response['content'] = posting.content;
                    response['isAnonymous'] = posting.isAnonymous;
                    response['updatedAt'] = posting.updatedAt;
                    response['createdAt'] = posting.createdAt;
                    response['usefulCnt'] = 0;
                    response['joyfulCnt'] = 0;
                    response['scrapCnt'] = 0;
                    response['commentCnt'] = 0;
                    response['isUseful'] = false;
                    response['isJoyful'] = false;
                    response['isScrap'] = false;
                    
                    const likeArr = posting['likes'];
                    const joyfuls = likeArr.filter(like => like.category === "joyful");
                    joyfuls.map(joyful => joyful.userIdx === userIdx ? response['isJoyful'] = true : response['isJoyful'] = false)
                    
                    const usefuls = likeArr.filter(like => like.category === "useful");
                    usefuls.map(useful => useful.userIdx === userIdx ? response['isUseful'] = true : response['isUseful'] = false)
                    
                    const scraps = likeArr.filter(like => like.category === "scrap");
                    scraps.map(scrap => scrap.userIdx === userIdx ? response['isScrap'] = true : response['isScrap'] = false)
                    
                    response['usefulCnt'] = usefuls.length;
                    response['joyfulCnt'] = joyfuls.length;
                    response['scrapCnt'] = scraps.length;
                    response['commentCnt'] = posting.comments.length;

                    if(response['isScrap'] === true){
                        responses.push(response);
                    }
                })

            console.log(responses);
            await queryRunner.commitTransaction();
            return new PostingResDto(responses);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async getPosting(userIdx: number, postingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const posting = await queryRunner.manager
                .createQueryBuilder(Posting, 'posting')
                .select(['posting.postingIdx', 'posting.title', 'posting.content', 'posting.userIdx','posting.createdAt', 'posting.updatedAt', 'posting.isAnonymous'])
                .addSelect(['likes.userIdx', 'likes.parentIdx', 'likes.category'])
                .leftJoinAndSelect('posting.comments', 'comments')
                .leftJoinAndSelect('posting.user', 'user')
                .leftJoinAndSelect('posting.board', 'board')
                .leftJoinAndMapMany('posting.likes', Like, 'likes', 'posting.postingIdx = likes.parentIdx and likes.type = "posting"')
                .where('posting.postingIdx = :postingIdx', {postingIdx})
                .getOne();

                const response = {};
                response['postingIdx'] = posting.postingIdx;
                response['title'] = posting.title;
                response['userID'] = posting.user.userID;
                response['userIdx'] = posting.user.userIdx;
                response['userNickname'] = posting.user.nickname;
                response['content'] = posting.content;
                response['isAnonymous'] = posting.isAnonymous;
                response['category'] = posting.board.category;
                response['updatedAt'] = posting.updatedAt;
                response['createdAt'] = posting.createdAt;
                response['usefulCnt'] = 0;
                response['joyfulCnt'] = 0;
                response['scrapCnt'] = 0;
                response['commentCnt'] = 0;
                response['isUseful'] = false;
                response['isJoyful'] = false;
                response['isScrap'] = false;
                    
                const likeArr = posting['likes'];
                const joyfuls = likeArr.filter(like => like.category === "joyful");
                joyfuls.map(joyful => joyful.userIdx === userIdx ? response['isJoyful'] = true : response['isJoyful'] = false);
                    
                const usefuls = likeArr.filter(like => like.category === "useful");
                usefuls.map(useful => useful.userIdx === userIdx ? response['isUseful'] = true : response['isUseful'] = false);
                    
                const scraps = likeArr.filter(like => like.category === "scrap");
                scraps.map(scrap => scrap.userIdx === userIdx ? response['isScrap'] = true : response['isScrap'] = false);

                posting.userIdx === userIdx ? response['isOwner'] = true : response['isOwner'] = false;
                    
                response['usefulCnt'] = usefuls.length;
                response['joyfulCnt'] = joyfuls.length;
                response['scrapCnt'] = scraps.length;
                response['commentCnt'] = posting.comments.length;

            console.log(response);
            await queryRunner.commitTransaction();
            return new PostingResDto(response);
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
        if(category !== "joyful" && category !== "useful" && category !== "scrap"){
            return new BaseFailMsgResDto('타입이 올바르지 않습니다. (joyful or useful or scrap)');
        }
        if(type !== "reply" && type !== "comment" && type !== "posting"){
            return new BaseFailMsgResDto('카테고리가 올바르지 않습니다. (joyful or useful or scrap)');
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
            return new BaseFailMsgResDto('삭제 실패');
        } finally {
            await queryRunner.release();
        }
    }
}
