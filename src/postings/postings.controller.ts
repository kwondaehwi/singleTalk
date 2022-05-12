import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreatePostingDto } from './dto/create-posting.dto';
import { PostingsService } from './postings.service';

@Controller('postings')
export class PostingsController {
    constructor(
        private readonly postingsService: PostingsService,
    ){}

    @Post()
    async create(@Body() createPostingDto: CreatePostingDto, @Res() res){
        res.send(await this.postingsService.create(createPostingDto));
    }
}
