import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posting } from 'src/postings/entities/posting.entity';
import { User } from './entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          User,
          Posting
        ]),
      ],
})
export class UsersModule {}
