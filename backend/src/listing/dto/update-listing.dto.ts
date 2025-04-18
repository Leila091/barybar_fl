import { IsOptional, IsString, IsNumber, IsDateString, IsArray, IsIn, IsEnum} from 'class-validator';
import { Transform } from 'class-transformer';
import { PriceType } from './create-listing.dto';

export class UpdateListingDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value)) // Преобразуем строку в число
    price?: number;

    @IsOptional()
    @IsEnum(PriceType)
    priceType?: PriceType;

    @IsOptional()
    @IsNumber()
    @Transform(({ value }) => (typeof value === 'string' ? parseFloat(value) : value))
    quantity?: number;

    @IsOptional()
    @Transform(({ value }) => (value && value.name ? value.name : value))  // Преобразуем объект location в строку
    @IsString()
    location?: string;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsNumber()
    categoryId?: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsArray()
    photos?: string[];

    @IsOptional()
    @IsIn(['available', 'booked', 'pending'])
    bookingStatus?: string;

    @IsOptional()
    @IsArray()
    deletedPhotos?: string[];
}
