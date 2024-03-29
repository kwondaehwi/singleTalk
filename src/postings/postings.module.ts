import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from 'src/boards/entities/board.entity';
import { Like } from 'src/likes/entities/like.entity';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Posting } from './entities/posting.entity';
import { PostingsController } from './postings.controller';
import { PostingsService } from './postings.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          Posting,
          User,
          Board,
          Like,
        ]),
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '1y' },
      }),
      ],
    controllers: [PostingsController],
    providers: [PostingsService, UsersService],
})
export class PostingsModule {}
