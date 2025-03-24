// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.module'; // Подключаем MailModule
import { VerificationService } from './verification.service'; // Подключаем VerificationService

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    MailModule, // Подключаем MailModule
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
    PassportModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    VerificationService, // Добавляем VerificationService в providers
  ],
  controllers: [AuthController],
  exports: [VerificationService], // Экспортируем VerificationService, если он нужен в других модулях
})
export class AuthModule {}