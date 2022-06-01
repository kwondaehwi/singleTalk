import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { UsersService } from 'src/users/users.service';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
    constructor(
        private readonly commentsService: CommentsService,
        private readonly usersService: UsersService,
    ){}

    @UseGuards(JwtAuthGuard)
    @Get(':postingIdx')
    async getComments(@Req() req, @Param('postingIdx') postingIdx, @Res() res){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.commentsService.getComments(userIdx, postingIdx));
    }

    @Post('')
    async createComment(@Req() req: Request, @Body() createCommentDto: CreateCommentDto, @Res() res){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.commentsService.createComment(userIdx, createCommentDto));
    }

    @Delete(':commentIdx')
    async deleteComment(@Req() req: Request, @Param('commentIdx') commentIdx: number, @Query('type') type: string, @Res() res){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.commentsService.deleteComment(userIdx, commentIdx, type));
    }
}
