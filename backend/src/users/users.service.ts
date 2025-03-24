import { Injectable, Inject, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

  async findOneByEmail(email: string) {
    const { rows } = await this.pool.query(
        'SELECT id, email, password, first_name, last_name, phone FROM users WHERE email = $1',
        [email]
    );
    return rows[0] || null;
  }

  async findById(id: number) {
    const { rows } = await this.pool.query(
        `SELECT id, email, first_name as "firstName", last_name as "lastName",
              phone, is_verified as "isVerified", avatar
       FROM users WHERE id = $1`,
        [id]
    );
    if (!rows[0]) {
      throw new NotFoundException('User not found');
    }
    return rows[0];
  }


  async update(id: number, updateData: UpdateUserDto) {
    const updates: string[] = [];
    const values: (string | boolean | number | null)[] = [];
    let counter = 1;

    const fieldMap: Record<string, string> = {
      firstName: 'first_name',
      lastName: 'last_name',
      isVerified: 'is_verified'
    };

    for (const [key, value] of Object.entries(updateData)) {
      if (value !== undefined) {
        const dbField = fieldMap[key] || key;
        updates.push(`${dbField} = $${counter}`);
        values.push(value);
        counter++;
      }
    }

    if (updates.length === 0) {
      throw new BadRequestException('No data to update');
    }

    values.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${counter} RETURNING *`;

    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }


  async create(createUserDto: CreateUserDto) {
    const { email, password, confirmPassword, firstName, lastName, phone } = createUserDto;

    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.length < 10) {
      throw new BadRequestException('Invalid phone number format');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const { rows } = await this.pool.query(
          `INSERT INTO users (email, password, first_name, last_name, phone, is_verified)
           VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, first_name, last_name, phone`,
          [email, hashedPassword, firstName, lastName, normalizedPhone, false]
      );
      return rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email or phone already in use');
      }
      throw error;
    }
  }
}