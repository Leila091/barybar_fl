import { Injectable, Inject, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { Buffer } from 'buffer';
import { Pool } from 'pg';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { MailService } from '../mail/mail.service';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
      private userService: UsersService,
      private jwtService: JwtService,
      @Inject('PG_POOL') private readonly db: Pool,
      private mailService: MailService,
  ) {}

  async signUp({ email, password, confirmPassword, firstName, lastName, phone }: CreateUserDto) {
    this.logger.log(`Начало регистрации для пользователя: ${email}`);

    // Проверка совпадения паролей
    if (password !== confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }

    // Нормализация номера телефона
    const normalizedPhone = this.normalizePhoneNumber(phone);

    const client = await this.db.connect();
    try {
      await client.query('BEGIN');

      // Проверка уникальности email и телефона
      const existingUser = await client.query(
          'SELECT id FROM users WHERE email = $1 OR phone = $2',
          [email, normalizedPhone]
      );

      if (existingUser.rows.length > 0) {
        throw new ConflictException('Email или номер телефона уже используются');
      }

      // Генерация и сохранение кода подтверждения
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      await client.query(
          'INSERT INTO verification_codes (email, code) VALUES ($1, $2)',
          [email, code]
      );

      // Хеширование пароля
      const salt = randomBytes(8).toString('hex');
      const hash = (await scrypt(password, salt, 32)) as Buffer;
      const hashedPassword = `${salt}.${hash.toString('hex')}`;

      // Сохранение пользователя
      const result = await client.query(
          `INSERT INTO users (email, password, first_name, last_name, phone, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, phone`,
          [email, hashedPassword, firstName, lastName, normalizedPhone, false]
      );

      await client.query('COMMIT');

      // Отправка письма с кодом подтверждения
      await this.mailService.sendVerificationEmail(email, code);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Ошибка регистрации: ${error.message}`, error.stack);
      throw error;
    } finally {
      client.release();
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    if (!user?.password) return null;

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) return null;

    const { password: _, ...result } = user;
    return result;
  }

  async signIn(user: { id: number; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const userData = await this.db.query(
        'SELECT id, first_name, last_name, email, phone FROM users WHERE id = $1',
        [user.id]
    );

    return {
      access_token: this.jwtService.sign(payload),
      user: userData.rows[0],
    };
  }

  private normalizePhoneNumber(phone: string): string {
    // Удаляем все нецифровые символы
    return phone.replace(/\D/g, '');
  }
}