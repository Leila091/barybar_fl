import { Injectable, Logger, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Pool } from 'pg';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class VerificationService {
    private readonly logger = new Logger(VerificationService.name);

    constructor(
        @Inject('PG_POOL') private readonly db: Pool,
        private readonly mailService: MailService,
    ) {}

    // Метод для отправки кода подтверждения
    async sendVerificationCode(email: string): Promise<{ message: string }> {
        const code = this.generateRandomCode();
        this.logger.log(`Генерация кода ${code} для ${email}`);

        try {
            await this.db.query(
                `INSERT INTO verification_codes (email, code)
                 VALUES ($1, $2)
                     ON CONFLICT (email) DO UPDATE
                                                SET code = $2, created_at = NOW()`,
                [email, code]
            );

            await this.mailService.sendVerificationEmail(email, code);
            return { message: 'Код подтверждения отправлен на email' };
        } catch (error) {
            this.logger.error(`Ошибка при отправке кода для ${email}`, error.stack);
            throw new ConflictException('Не удалось отправить код подтверждения');
        }
    }

    // Метод для проверки кода подтверждения
    async verifyCode(email: string, code: string): Promise<{ message: string }> {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            const { rows } = await client.query(
                `SELECT code FROM verification_codes 
                 WHERE email = $1 AND created_at > NOW() - INTERVAL '1 hour'
                 ORDER BY created_at DESC LIMIT 1`,
                [email]
            );

            if (!rows.length || rows[0].code !== code) {
                throw new NotFoundException('Неверный или просроченный код');
            }

            await client.query(
                `UPDATE users SET is_verified = true 
                 WHERE email = $1 AND is_verified = false`,
                [email]
            );

            await client.query('COMMIT');
            return { message: 'Email успешно подтвержден' };
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error(`Ошибка верификации для ${email}`, error.stack);
            throw error;
        } finally {
            client.release();
        }
    }

    // Метод для восстановления пароля
    async initiatePasswordReset(email: string): Promise<{ message: string }> {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1 час

        try {
            // Проверяем существование пользователя
            const user = await this.db.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (!user.rows.length) {
                return { message: 'Если email существует, инструкции отправлены' };
            }

            // Сохраняем токен
            await this.db.query(
                `INSERT INTO password_reset_tokens (user_id, token, expires_at)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (user_id) DO UPDATE
                 SET token = $2, expires_at = $3`,
                [user.rows[0].id, token, expiresAt]
            );

            // Отправляем email
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
            await this.mailService.sendPasswordResetEmail(email, resetLink);

            return { message: 'Ссылка для сброса пароля отправлена на email' };
        } catch (error) {
            this.logger.error(`Ошибка восстановления пароля для ${email}`, error.stack);
            throw new ConflictException('Не удалось инициировать сброс пароля');
        }
    }

    // Метод для сброса пароля
    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            // Проверяем токен
            const tokenResult = await client.query(
                `SELECT user_id FROM password_reset_tokens
                 WHERE token = $1 AND expires_at > NOW()`,
                [token]
            );

            if (!tokenResult.rows.length) {
                return { success: false };
            }

            const userId = tokenResult.rows[0].user_id;

            // Хешируем новый пароль
            const hashedPassword = await this.hashPassword(newPassword);

            // Обновляем пароль
            await client.query(
                'UPDATE users SET password = $1 WHERE id = $2',
                [hashedPassword, userId]
            );

            // Удаляем использованный токен
            await client.query(
                'DELETE FROM password_reset_tokens WHERE user_id = $1',
                [userId]
            );

            await client.query('COMMIT');
            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Ошибка сброса пароля', error.stack);
            throw error;
        } finally {
            client.release();
        }
    }

    // Вспомогательные методы
    private generateRandomCode(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
    }
}