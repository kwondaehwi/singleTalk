import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ){}

    @Post()
    async create(@Body() createUserDto: CreateUserDto, @Res() res){
        res.send(await this.usersService.create(createUserDto));
    }
}
