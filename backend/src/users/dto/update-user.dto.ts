import { IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('KZ', { message: 'Неверный формат номера' })
  phone?: string;

  @IsOptional()
  avatar?: string;
}