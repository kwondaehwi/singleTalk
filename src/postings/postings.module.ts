import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Posting } from './entities/posting.entity';
import { PostingsController } from './postings.controller';
import { PostingsService } from './postings.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          Posting,
          User
        ]),
      ],
    controllers: [PostingsController],
    providers: [PostingsService],
})
export class PostingsModule {}
