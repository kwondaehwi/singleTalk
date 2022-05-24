import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { MatchingsController } from './matchings.controller';
import { MatchingsService } from './matchings.service';

@Module({
  imports: [
        TypeOrmModule.forFeature([

        ]),
        JwtModule.register({
          secret: 'secret',
          signOptions: { expiresIn: '1y' },
      }),
      ],
  controllers: [MatchingsController],
  providers: [MatchingsService, UsersService]
})
export class MatchingsModule {}
