import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Posting } from './entities/posting.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          Posting,
          User
        ]),
      ],
})
export class PostingsModule {}
