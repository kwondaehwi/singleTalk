import { Body, Controller, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMyProfileDto, UpdateMyRegionDto } from './dto/update-user.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ){}

    @Get('auth/check')
    async userCheck(@Req() req: Request, @Res() res){
        if(!req.cookies.Authentication){
            return res.send({result: false});
        }
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.usersService.userCheck(userIdx, req.cookies.Authentication));
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-page')
    async geyMyInfo(@Req() req: Request, @Res() res){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.usersService.getMyInfo(userIdx));
    }

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
                maxAge: 604800 * 1000,
                sameSite: "Lax",
            })
            res.send({result: true});
        }else {
            res.send({result: false});
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
    @Get('my-page/region')
    async geyMyRegion(@Req() req: Request, @Res() res){
        const { userIdx } = this.usersService.decodeToken(req.cookies.Authentication);
        res.send(await this.usersService.getMyRegion(userIdx));
    }

    @UseGuards(JwtAuthGuard)
    @Put('my-page')
    async updateMyProfile(@Req() req, @Body() updateMyProfileDto: UpdateMyProfileDto, @Res() res: Response){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.usersService.updateMyProfile(userIdx, updateMyProfileDto));
    }

    @UseGuards(JwtAuthGuard)
    @Put('my-page/region')
    async updateMyRegion(@Req() req, @Body() updateMyRegionDto: UpdateMyRegionDto, @Res() res: Response){
        if(!req) res.send({result: "로그인 해주세요."})
        const userIdx = req.user.userIdx;
        res.send(await this.usersService.updateMyRegion(userIdx, updateMyRegionDto));
    }
}
