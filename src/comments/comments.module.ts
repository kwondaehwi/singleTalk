import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret',
      signOptions: { expiresIn: '1y' },
  }),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, UsersService]
})
export class CommentsModule {}
