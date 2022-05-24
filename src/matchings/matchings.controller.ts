import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { CreateMatchingDto } from './dto/create-matching.dto';
import { MatchingsService } from './matchings.service';

@Controller('matchings')
export class MatchingsController {
    constructor(
        private readonly matchingsService: MatchingsService,
        private readonly usersService: UsersService,
    ){}

    @Post()
    async create(@Req() req: Request, @Body() createMatchingDto: CreateMatchingDto, @Res() res){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.matchingsService.create(createMatchingDto, userIdx));
    }
}
