import { IsEmail, IsNotEmpty, MinLength, Matches, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsPhoneNumber('KZ', { message: 'Неверный формат номера' }) // Казахстанский номер
  phone: string;
}
