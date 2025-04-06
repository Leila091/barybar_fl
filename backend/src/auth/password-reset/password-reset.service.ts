import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import * as crypto from 'crypto';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordResetService {
    private readonly logger = new Logger(PasswordResetService.name);

    constructor(
        @Inject('PG_POOL') private readonly pool: Pool,
        private readonly mailService: MailService,
        private readonly configService: ConfigService,
    ) {}

    async createResetToken(email: string): Promise<void> {
        try {
            // 1. Check if user exists
            this.logger.log(`Attempting password reset for email: ${email}`);
            const user = await this.pool.query(
                'SELECT id, email, phone FROM users WHERE email = $1',
                [email],
            );

            if (!user.rows.length) {
                this.logger.warn(`Password reset requested for non-existent email: ${email}`);
                return; // Security: don't reveal if user doesn't exist
            }

            // 2. Generate token
            const token = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour

            // 3. Save token to database
            await this.pool.query(
                `INSERT INTO password_reset_tokens (user_id, token, expires_at)
                 VALUES ($1, $2, $3)
                     ON CONFLICT (user_id) DO UPDATE
                                                  SET token = $2, expires_at = $3, created_at = NOW()`,
                [user.rows[0].id, token, expiresAt],
            );

            // 4. Send email
            const frontendUrl = this.configService.get<string>('FRONTEND_URL');
            if (!frontendUrl) {
                console.log('FRONTEND_URL:', this.configService.get<string>('FRONTEND_URL'));

                throw new Error('FRONTEND_URL is not configured');
            }

            const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
            this.logger.log(`Sending password reset email to: ${email}`);

            await this.mailService.sendPasswordResetEmail(email, resetLink);

            // 5. Send SMS
            const phone = user.rows[0].phone;
            if (phone) {
                const smsService = this.configService.get<string>('SMS_SERVICE');
                if (!smsService) {
                    throw new Error('SMS_SERVICE is not configured');
                }

                // Логика отправки SMS
                await this.sendSms(phone, `Your password reset link: ${resetLink}`);
                this.logger.log(`Password reset SMS sent to: ${phone}`);
            }
        } catch (error) {
            this.logger.error(`Error in createResetToken for email ${email}: ${error.message}`);
            throw error;
        }
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        try {
            this.logger.log(`Attempting password reset with token: ${token.substring(0, 6)}...`);

            // 1. Find valid token
            const result = await this.pool.query(
                `SELECT user_id FROM password_reset_tokens
                 WHERE token = $1 AND expires_at > NOW()`,
                [token],
            );

            if (!result.rows.length) {
                this.logger.warn(`Invalid or expired token used: ${token.substring(0, 6)}...`);
                return false;
            }

            const userId = result.rows[0].user_id;

            // 2. Hash new password
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512').toString('hex');
            const hashedPassword = `${salt}.${hash}`;

            // 3. Update password
            await this.pool.query(
                'UPDATE users SET password = $1 WHERE id = $2',
                [hashedPassword, userId],
            );

            // 4. Delete token
            await this.pool.query(
                'DELETE FROM password_reset_tokens WHERE user_id = $1',
                [userId],
            );

            this.logger.log(`Password successfully reset for user ID: ${userId}`);
            return true;
        } catch (error) {
            this.logger.error(`Error resetting password: ${error.message}`);
            throw error;
        }
    }

    async validateToken(token: string): Promise<{ isValid: boolean; email?: string }> {
        try {
            this.logger.debug(`Validating token: ${token.substring(0, 6)}...`);
            const result = await this.pool.query(
                `SELECT u.email
                 FROM password_reset_tokens prt
                          JOIN users u ON prt.user_id = u.id
                 WHERE prt.token = $1 AND prt.expires_at > NOW()`,
                [token],
            );

            const isValid = result.rows.length > 0;
            this.logger.debug(`Token validation result: ${isValid}`);

            return {
                isValid,
                email: result.rows[0]?.email,
            };
        } catch (error) {
            this.logger.error(`Error validating token: ${error.message}`);
            throw error;
        }
    }

    private async sendSms(phone: string, message: string): Promise<void> {
        // Логика отправки SMS
        // Например, используя Twilio или другой сервис
        console.log(`Sending SMS to ${phone}: ${message}`);
    }
}