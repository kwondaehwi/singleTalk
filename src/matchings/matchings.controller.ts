import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UsersService } from 'src/users/users.service';
import { CreateMatchingDto } from './dto/create-matching.dto';
import { DeleteUserMatchingDto, UpdateMatchingDto } from './dto/update-matching.dto';
import { MatchingsService } from './matchings.service';

@Controller('matchings')
export class MatchingsController {
    constructor(
        private readonly matchingsService: MatchingsService,
        private readonly usersService: UsersService,
    ){}

    @UseGuards(JwtAuthGuard)
    @Get()
    async getAllMatchings(@Req()req, @Query('title') title: string,  @Query('isDone') isDone: boolean, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.getAllMatchings(userIdx, title, isDone));
    }

    @UseGuards(JwtAuthGuard)
    @Get(':matchingIdx')
    async getMatching(@Req()req, @Param('matchingIdx') matchingIdx: number , @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.getMatching(userIdx, matchingIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Get(':matchingIdx/room')
    async matchingUsersList(@Req()req, @Param('matchingIdx') matchingIdx: number , @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.matchingUsersList(userIdx, matchingIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Req() req, @Body() createMatchingDto: CreateMatchingDto, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.create(createMatchingDto, userIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Post(':matchingIdx/join')
    async joinMatching(@Req() req, @Param('matchingIdx') matchingIdx: number, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.joinMatching(userIdx, matchingIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Post(':matchingIdx/done')
    async makeDone(@Req() req, @Param('matchingIdx') matchingIdx:number, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.makeDone(userIdx, matchingIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Post(':matchingIdx/out')
    async deleteUserMatching(@Req() req, @Param('matchingIdx') matchingIdx:number, @Body() deleteUserMatchingDto: DeleteUserMatchingDto, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.deleteUserMatching(userIdx, matchingIdx, deleteUserMatchingDto));
    }

    @UseGuards(JwtAuthGuard)
    @Put(':matchingIdx')
    async updateMatching(@Req()req, @Param('matchingIdx') matchingIdx: number , @Body() updateMatchingDto: UpdateMatchingDto, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.updateMatching(userIdx, updateMatchingDto, matchingIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':matchingIdx')
    async delete(@Req() req, @Param('matchingIdx') matchingIdx: number, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.matchingsService.delete(userIdx, matchingIdx));
    }
}
