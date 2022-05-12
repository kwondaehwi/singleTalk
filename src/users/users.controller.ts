import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ){}

    @Post()
    async create(@Body() createUserDto: CreateUserDto, @Res() res){
        res.send(await this.usersService.create(createUserDto));
    }

    @Post('login')
    async login(@Body() userLoginDto: UserLoginDto, @Res() res){
        const access = await this.usersService.login(userLoginDto);
        if (access !== undefined){
            res.cookie('Authentication', access, {
                httpOnly: true,
                maxAge: 1800 * 1000,
                sameSite: "none",
            })
            res.send({result: true});
        }
    }

    @Get('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: Request, @Res() res: Response) {
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        await this.usersService.removeRefreshToken(userIdx);
        res.clearCookie('Authentication',{
            domain: ".localhost"
        });
        res.send({
            msg: 'logout',
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('test')
    authTest(){
        return { success: true }
    }
}
