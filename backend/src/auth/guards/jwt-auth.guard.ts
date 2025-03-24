import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../../interceptors/public.interceptor";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // Проверяем, является ли маршрут публичным
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Если маршрут публичный, пропускаем аутентификацию
        if (isPublic) {
            return true;
        }

        // Получаем токен из cookies
        const request = context.switchToHttp().getRequest();
        const token = request.cookies['token'];

        // Если токен есть, добавляем его в заголовки
        if (token) {
            request.headers.authorization = `Bearer ${token}`;
        }

        // Вызываем стандартную логику AuthGuard
        return super.canActivate(context);
    }
}