import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', // Указываем, что email используется как username
    });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log("🔍 Проверка пользователя:", email); // Логируем входные данные

    const user = await this.authService.validateUser(email, password);

    if (!user) {
      console.log("❌ Ошибка авторизации: Неверный email или пароль"); // Логируем ошибку
      throw new UnauthorizedException('Неверный email или пароль');
    }

    console.log("✅ Пользователь найден:", user.email); // Логируем успешную аутентификацию
    return user;
  }

}