import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';
import { Payload } from './jwt.payload';	// 다음에서 곧장 생성할 예정

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
      private readonly usersService: UsersService,
  ) {
    super({
        jwtFromRequest: ExtractJwt.fromExtractors([
            (request) => {
                return request.cookies.Authentication;
            },
        ]),
        passReqToCallback: true,
        secretOrKey: 'secret',
    });
  }

  async validate(req, payload: Payload) {
    if(!req){
      return {msg:"토큰이 없습니다"}
    }
    const token = req.cookies.Authentication;
    return await this.usersService.getUserIfTokenMatches(token, payload.userIdx);

  }
}