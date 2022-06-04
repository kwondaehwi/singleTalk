import { Injectable } from '@nestjs/common';
import { match } from 'assert';
import { BaseSuccessResDto } from 'src/commons/response.dto';
import { User } from 'src/users/entities/user.entity';
import { Connection } from 'typeorm';
import { CreateMatchingDto } from './dto/create-matching.dto';
import { MatchingResDto } from './dto/matching-res.dto';
import { DeleteUserMatchingDto, UpdateMatchingDto } from './dto/update-matching.dto';
import { Matching, UserMatching } from './entities/matching.entity';

@Injectable()
export class MatchingsService {
    constructor(
        private connection: Connection,
    ){}

    async getAllMatchings(userIdx: number, title: string, isDone: boolean){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            if(!title){
                const matchings = await queryRunner.manager
                .createQueryBuilder(Matching, 'matching')
                .select()
                .leftJoinAndSelect('matching.userMatchings', 'userMatchings')
                .leftJoinAndSelect('matching.user', 'user')
                .where('matching.Done = :isDone', {isDone})
                .orderBy('matching.createdAt', 'DESC')
                .getMany();

                matchings.map(matching => {
                    matching['nowPeople'] = matching.userMatchings.length;
                })
                console.log(matchings);
                await queryRunner.commitTransaction();
                return new MatchingResDto(matchings);    
            }
            title = '%' + title + '%';
            console.log(title);
            const matchings = await queryRunner.manager
                .createQueryBuilder(Matching, 'matching')
                .select()
                .leftJoinAndSelect('matching.userMatchings', 'userMatchings')
                .leftJoinAndSelect('matching.user', 'user')
                .where('matching.Done = :isDone and matching.title like :title', {isDone, title})
                .orderBy('matching.createdAt', 'DESC')
                .getMany();

            matchings.map(matching => {
                matching['nowPeople'] = matching.userMatchings.length;
            })
            console.log(matchings);
            await queryRunner.commitTransaction();
            return new MatchingResDto(matchings);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async getMatching(userIdx: number, matchingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matching = await queryRunner.manager
                .createQueryBuilder(Matching, 'matching')
                .select()
                .leftJoinAndSelect('matching.userMatchings', 'userMatchings')
                .leftJoinAndSelect('matching.user', 'user')
                .where('matching.matchingIdx = :matchingIdx', {matchingIdx})
                .getOne();

            matching['isOwner'] = false;
            if(matching.userIdx === userIdx) matching['isOwner'] = true;
            matching['isJoin'] = false;
            if(matching.userMatchings){
                matching.userMatchings.map(userMatching => {
                    if(userMatching.userIdx === userIdx) matching['isJoin'] = true;
                });
            }
            console.log(matching);
            await queryRunner.commitTransaction();
            return new MatchingResDto(matching);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async getMyMatchings(userIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchings = await queryRunner.manager
                .createQueryBuilder(Matching, 'matching')
                .select()
                .leftJoinAndSelect('matching.userMatchings', 'userMatchings')
                .leftJoinAndSelect('matching.user', 'user')
                .where('matching.userIdx = :userIdx', {userIdx})
                .orderBy('matching.createdAt', 'DESC')
                .getMany();

            matchings.map(matching => {
                matching['nowPeople'] = matching.userMatchings.length;
            })
            console.log(matchings);
            await queryRunner.commitTransaction();
            return new MatchingResDto(matchings);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async matchingUsersList(userIdx, matchingIdx){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matching = await queryRunner.manager
                .createQueryBuilder(Matching, 'matching')
                .select()
                .leftJoinAndSelect('matching.userMatchings', 'userMatchings')
                .leftJoinAndSelect('matching.user', 'user')
                .leftJoinAndSelect('userMatchings.user', 'UMuser')
                .where('matching.matchingIdx = :matchingIdx', {matchingIdx})
                .orderBy('matching.createdAt', 'DESC')
                .getOne();

            const result = [];
            if(matching.userIdx !== userIdx){
                return {result: false, msg: "해당유저의 매칭 게시글이 아닙니다."};
            }
            matching.userMatchings.map(userMatching => {
                result.push({userID: userMatching.user.userIdx, userNickName: userMatching.user.nickname})
            })
            console.log(result);
            await queryRunner.commitTransaction();
            return new MatchingResDto(result);
        } catch(e) {
            console.log(e)
        } finally {
            await queryRunner.release();
        }
    }

    async create(createMatchingDto: CreateMatchingDto, userIdx: number){
        const {title, contents, link, people} = createMatchingDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userIdx,
                }
            });
            const matching = new Matching(title, contents,user,link,people);
            await queryRunner.manager.save(matching);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async joinMatching(userIdx: number, matchingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userMatchingToBeDeleted = await queryRunner.manager.findOne(UserMatching, {
                where: {
                    userIdx,
                    matchingIdx
                }
            });
            if(userMatchingToBeDeleted !== undefined){
                await queryRunner.manager.delete(UserMatching, {
                    userIdx,
                    matchingIdx,
                });
                await queryRunner.commitTransaction();
                return new BaseSuccessResDto();
            }
            const user = await queryRunner.manager.findOne(User, {
                where: {
                    userIdx,
                }
            });
            const matching = await queryRunner.manager.findOne(Matching, {
                relations: [
                    'userMatchings'
                ],
                where: {
                    matchingIdx,
                }
            }); 
            if(matching.userIdx === userIdx){
                return {result: false, msg: "자신이 생성한 매칭 게시글 입니다."}
            }
            if(matching.userMatchings.length >= matching.maxPeople){
                return {result: false, msg: "인원 초과입니다."}
            }
            const userMatching = new UserMatching(user, matching);
            await queryRunner.manager.save(userMatching);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async makeDone(userIdx, matchingIdx){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matching = await queryRunner.manager.findOne(Matching, {
                where: {
                    matchingIdx,
                }
            });
            if(matching.userIdx !== userIdx){
                return {result: false, msg: "해당유저의 매칭 게시글이 아닙니다."};
            }
            matching.Done === false ? matching.Done = true : matching.Done = false;
            await queryRunner.manager.save(matching);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async deleteUserMatching(userIdx: number, matchingIdx: number, deleteUserMatchingDto: DeleteUserMatchingDto){
        const {userIdx : userIdxToDelete} = deleteUserMatchingDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const userMatching = await queryRunner.manager.findOne(UserMatching, {
                relations: [
                    'matching',
                ],
                where: {
                    matchingIdx,
                }
            });
            if(userMatching.matching.userIdx !== userIdx){
                return {result: false, msg: "해당유저의 매칭 게시글이 아닙니다."};
            }
            await queryRunner.manager.delete(UserMatching, {userIdx: userIdxToDelete});
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async updateMatching(userIdx: number, updateMatchingDto: UpdateMatchingDto, matchingIdx: number){
        const {title, contents, link, people} = updateMatchingDto;
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matching = await queryRunner.manager.findOne(Matching, {
                where: {
                    matchingIdx,
                }
            });
            if(matching.userIdx !== userIdx){
                return {result: false, msg: "해당유저의 매칭 게시글이 아닙니다."};
            }
            matching.title = title;
            matching.content = contents;
            matching.link = link;
            matching.maxPeople = people;
            await queryRunner.manager.save(matching);
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async delete(userIdx: number, matchingIdx: number){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matching = await queryRunner.manager.findOne(Matching, {
                where: {
                    matchingIdx,
                }
            })
            if(matching.userIdx !== userIdx){
                return {result: false, msg: "해당유저의 매칭 게시글이 아닙니다."};
            }
            await queryRunner.manager.delete(Matching, {
                matchingIdx,
                userIdx
            });
            await queryRunner.commitTransaction();
            return new BaseSuccessResDto();
        } catch(e) {
            console.log(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async removeUserFromMatching(userIdx, myUserIdx, matchingIdx){
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matching = await queryRunner.manager.findOne(Matching, {
                where: {
                    matchingIdx,
                }
            })
            if(matching.userIdx !== myUserIdx){
                return {result: false, msg: "해당유저의 매칭 게시글이 아닙니다."};
            }
            await queryRunner.manager.delete(UserMatching, {
                matchingIdx,
                userIdx
            });
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
