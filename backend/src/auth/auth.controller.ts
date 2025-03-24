// src/auth/auth.controller.ts
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { VerificationService } from './verification.service'; // Импортируем VerificationService

@Controller('auth')  // Путь '/auth'
export class AuthController {
  constructor(
      private authService: AuthService,
      private verificationService: VerificationService, // Внедряем VerificationService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signIn(@Request() req) {
    return this.authService.signIn(req.user);
  }

  @Post('sign-up')
  async signUp(@Body() body: CreateUserDto) {
    return this.authService.signUp(body);
  }

  @Post('verify')
  async verifyCode(@Body('email') email: string, @Body('code') code: string) {
    return this.verificationService.verifyCode(email, code);
  }
}