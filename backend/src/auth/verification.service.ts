import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { MailService } from '../mail/mail.service';

@Injectable()
export class VerificationService {
    private readonly logger = new Logger(VerificationService.name);

    constructor(
        @Inject('PG_POOL') private readonly db: Pool, // Внедряем Pool для работы с базой данных
        private mailService: MailService,
    ) {}

    async sendVerificationCode(email: string) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        this.logger.log(`Сгенерирован код: ${code} для пользователя: ${email}`);

        try {
            await this.db.query(
                `INSERT INTO verification_codes (email, code) VALUES ($1, $2)`,
                [email, code]
            );
            this.logger.log(`Код подтверждения сохранен в базе данных для пользователя: ${email}`);
        } catch (error) {
            this.logger.error(`Ошибка при сохранении кода подтверждения для пользователя: ${email}`, error);
            throw new Error('Failed to save verification code');
        }

        try {
            await this.mailService.sendVerificationEmail(email, code);
            this.logger.log(`Код подтверждения отправлен на почту: ${email}`);
            return { message: 'Verification code sent to your email.' };
        } catch (error) {
            this.logger.error(`Ошибка при отправке кода подтверждения на почту: ${email}`, error);
            throw new Error('Failed to send verification email');
        }
    }

    async verifyCode(email: string, code: string) {
        const client = await this.db.connect();
        try {
            await client.query('BEGIN'); // Начало транзакции

            // Получаем сохраненный код
            const result = await client.query(
                `SELECT code FROM verification_codes WHERE email = $1 ORDER BY created_at DESC LIMIT 1`,
                [email],
            );

            const savedCode = result.rows[0]?.code;
            this.logger.log(`Сохраненный код: ${savedCode}, Введенный код: ${code}`);

            if (!savedCode || savedCode !== code) {
                throw new NotFoundException('Invalid verification code.');
            }

            // Обновляем статус пользователя
            await client.query(
                `UPDATE users SET is_verified = true WHERE email = $1`,
                [email],
            );
            this.logger.log(`Статус is_verified обновлен для пользователя: ${email}`);

            await client.query('COMMIT'); // Завершение транзакции
            return { message: 'Email verified successfully.' };
        } catch (error) {
            await client.query('ROLLBACK'); // Откат транзакции в случае ошибки
            this.logger.error(`Ошибка при проверке кода для пользователя: ${email}`, error);
            throw error;
        } finally {
            client.release(); // Освобождение клиента
        }
    }
}