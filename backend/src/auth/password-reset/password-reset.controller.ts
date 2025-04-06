import { Controller, Post, Body, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';

@Controller('auth/password-reset')
export class PasswordResetController {
    constructor(private readonly passwordResetService: PasswordResetService) {}

    @Post('request')
    @HttpCode(HttpStatus.ACCEPTED)
    async requestReset(@Body('email') email: string) {
        console.log('Password reset request received for:', email);
        await this.passwordResetService.createResetToken(email);
        return { message: 'If an account exists with this email, a reset link has been sent' };
    }

    @Post('reset')
    async resetPassword(
        @Body('token') token: string,
        @Body('newPassword') newPassword: string,
    ) {
        const success = await this.passwordResetService.resetPassword(token, newPassword);
        return {
            success,
            message: success ? 'Password changed successfully' : 'Invalid or expired token',
        };
    }

    @Get('validate-token')
    async validateToken(@Query('token') token: string) {
        const { isValid, email } = await this.passwordResetService.validateToken(token);
        return { isValid, email };
    }
}