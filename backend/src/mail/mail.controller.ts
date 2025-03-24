// src/mail/mail.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';

@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) {}

    @Post('send')
    async sendEmail(@Body() emailData: { to: string; code: string }) {
        const { to, code } = emailData;
        await this.mailService.sendVerificationEmail(to, code); // Используем sendVerificationEmail
        return 'Email sent successfully';
    }
}