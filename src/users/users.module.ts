import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { Posting } from 'src/postings/entities/posting.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
          User,
          Posting
        ]),
        AuthModule,
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '1y' },
      }),
      ],
    controllers: [UsersController],
    providers: [UsersService, JwtStrategy],
})
export class UsersModule {}
