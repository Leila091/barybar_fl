import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Извлекаем токен из заголовка Authorization
      ignoreExpiration: false, // Не игнорируем срок действия токена
      secretOrKey: jwtConstants.secret, // Секретный ключ для проверки токена
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload); // Лог для отладки

    // Проверяем, что у нас есть обязательные поля в payload
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException();
    }

    return { userId: payload.sub, email: payload.email }; // payload.sub должен содержать userId
  }
}
