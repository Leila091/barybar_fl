import { IsString, IsEmail, MinLength, Matches, IsNotEmpty } from "class-validator";

export class SignUpDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @IsString()
    @MinLength(6)
    @IsNotEmpty()
    confirmPassword: string;
}
