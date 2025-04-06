import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name); // Добавляем Logger
    private resend: Resend;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (!apiKey) {
            throw new Error('Resend API key is missing. Check your .env file.');
        }
        this.resend = new Resend(apiKey);
    }

    async sendVerificationEmail(to: string, code: string) {
        const from = this.configService.get<string>('RESEND_FROM_EMAIL');
        if (!from) {
            throw new Error('Resend "from" email is missing. Check your .env file.');
        }

        try {
            const data = await this.resend.emails.send({
                from,
                to,
                subject: 'Your Verification Code',
                html: `<p>Your verification code is: <strong>${code}</strong></p>`,
            });
            this.logger.log(`Письмо с кодом подтверждения отправлено на почту: ${to}`);
            return data;
        } catch (error) {
            this.logger.error(`Ошибка при отправке письма на почту: ${to}`, error);
            throw new Error('Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(to: string, code: string) {
        const from = this.configService.get<string>('RESEND_FROM_EMAIL');
        if (!from) {
            throw new Error('Resend "from" email is missing. Check your .env file.');
        }

        try {
            const data = await this.resend.emails.send({
                from,
                to,
                subject: 'Password Reset Request',
                html: `<p>Your password reset code is: <strong>${code}</strong></p>`,
            });
            this.logger.log(`Письмо с кодом сброса пароля отправлено на почту: ${to}`);
            return data;
        } catch (error) {
            this.logger.error(`Ошибка при отправке письма на почту: ${to}`, error);
            throw new Error('Failed to send password reset email');
        }
    }
}