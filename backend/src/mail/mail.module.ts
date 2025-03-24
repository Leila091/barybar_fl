// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
    providers: [MailService],
    exports: [MailService], // Экспортируем сервис, чтобы использовать его в других модулях
})
export class MailModule {}