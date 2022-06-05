import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UsersService } from 'src/users/users.service';
import { CreatePostingDto } from './dto/create-posting.dto';
import { UpdatePostingDto } from './dto/update-posting.dto';
import { PostingsService } from './postings.service';

@Controller('postings')
export class PostingsController {
    constructor(
        private readonly postingsService: PostingsService,
        private readonly usersService: UsersService,
    ){}

    @Get()
    async getPostings(
        @Req() req: Request,
        @Query('category') category: string,
        @Query('sort') sort: string,
        @Query('type') type: string, 
        @Res() res) {
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.postingsService.getPostings(userIdx, category, sort, type));
    }

    @UseGuards(JwtAuthGuard)
    @Get('mypage')
    async getMyPostings(
        @Req() req,
        @Query('type') type: string,
        @Res() res
    ){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.postingsService.getMyPostings(userIdx, type));
    }

    @UseGuards(JwtAuthGuard)
    @Get('scrap')
    async getScrapedPostings(
        @Req() req,
        @Query('type') type: string,
        @Res() res
    ){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.postingsService.getScrapedPostings(userIdx, type));
    }

    @UseGuards(JwtAuthGuard)
    @Get(':postingIdx')
    async getPosting(
        @Req() req,
        @Param('postingIdx') postingIdx: number,
        @Res() res
    ){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.postingsService.getPosting(userIdx, postingIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Req() req, @Body() createPostingDto: CreatePostingDto, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.postingsService.create(createPostingDto, userIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Post('like/:parentIdx')
    async like(@Req() req, @Param('parentIdx') parentIdx: number, @Query('category') category: string, @Query('type') type: string, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.postingsService.like(userIdx, parentIdx, category, type));
    }

    @Put(':postingIdx')
    async update(
        @Param('postingIdx') postingIdx: number,
        @Body() updatePostingDto: UpdatePostingDto, 
        @Res() res
    ){
        res.send(await this.postingsService.update(updatePostingDto, postingIdx));
    }

    @Delete(':postingIdx')
    async delete(@Param('postingIdx') postingIdx: number, @Res() res){
        res.send(await this.postingsService.delete(postingIdx));
    }
}
