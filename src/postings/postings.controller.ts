import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { CreatePostingDto } from './dto/create-posting.dto';
import { PostingsService } from './postings.service';

@Controller('postings')
export class PostingsController {
    constructor(
        private readonly postingsService: PostingsService,
    ){}

    @Get()
    async getPostings(
        @Query('category') category: string,
        @Query('sort') sort: string,
        @Query('type') type: string, 
        @Res() res) {
        res.send(await this.postingsService.getPostings(category, sort, type));
    }

    @Post()
    async create(@Body() createPostingDto: CreatePostingDto, @Res() res){
        res.send(await this.postingsService.create(createPostingDto));
    }
}
