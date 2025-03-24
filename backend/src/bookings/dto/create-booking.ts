import { IsInt, IsDateString, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateBookingDto {
    @IsInt()
    listingId: number;

    @IsDateString()
    startDate: string; // Формат: 'YYYY-MM-DD'

    @IsDateString()
    endDate: string; // ❌ УБРАН ЛИШНИЙ СИМВОЛ `/`

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    comment?: string;
}
