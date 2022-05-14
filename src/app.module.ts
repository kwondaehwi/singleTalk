import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostingsModule } from './postings/postings.module';
import { BoardsModule } from './boards/boards.module';
import { MatchingsModule } from './matchings/matchings.module';
import { validationSchema } from './config/validationSchema';
import { AuthModule } from './auth/auth.module';
import { UsefulsModule } from './usefuls/usefuls.module';
import { JoyfulsModule } from './joyfuls/joyfuls.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: validationSchema,
      envFilePath: [`${__dirname}/../env/.${process.env.NODE_ENV}.env`],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DATABASE_HOST'),
        port: config.get('DATABASE_PORT'),
        username: config.get('DATABASE_USERNAME'),
        password: config.get('DATABASE_PASSWORD'),
        database: config.get('DATABASE_DATABASE'),
        entities: ["dist/**/*.entity{.ts,.js}"],
        // synchronize: Boolean(config.get('DATABASE_SYNCHRONIZE')),
        synchronize: true,
        logging: true,
      }),
    }),
    UsersModule,
    PostingsModule,
    BoardsModule,
    MatchingsModule,
    AuthModule,
    UsefulsModule,
    JoyfulsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
