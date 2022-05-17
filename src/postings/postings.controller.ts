import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res } from '@nestjs/common';
import { Request } from 'express';
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
        @Query('category') category: string,
        @Query('sort') sort: string,
        @Query('type') type: string, 
        @Res() res) {
        res.send(await this.postingsService.getPostings(category, sort, type));
    }

    @Get('mypage/:userIdx')
    async getMyPostings(
        @Param('userIdx') userIdx: number, 
        @Query('type') type: string,
        @Res() res
    ){
        res.send(await this.postingsService.getMyPostings(userIdx, type));
    }

    @Get('/:postingIdx')
    async getPosting(
        @Req() req: Request,
        @Param('postingIdx') postingIdx: number,
        @Res() res
    ){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.postingsService.getPosting(postingIdx, userIdx));
    }

    @Post()
    async create(@Body() createPostingDto: CreatePostingDto, @Res() res){
        res.send(await this.postingsService.create(createPostingDto));
    }

    @Post(':postingIdx/useful')
    async useful(@Req() req: Request, @Param('postingIdx') postingIdx: number, @Res() res){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.postingsService.useful(userIdx, postingIdx));
    }

    @Post(':postingIdx/joyful')
    async joyful(@Req() req: Request, @Param('postingIdx') postingIdx: number, @Res() res){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.postingsService.joyful(userIdx, postingIdx));
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
