import { IsString, IsNumber, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
export enum PriceType {
  FIXED = 'fixed',
  PER_UNIT = 'per_unit',
  PER_DAY = 'per_day',
}

export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsEnum(PriceType)
  priceType: PriceType;

  @IsNumber()
  categoryId: number;

  @Transform(({ value }) => (value && value.name ? value.name : value))  // Преобразуем объект location в строку
  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsArray()
  photos?: string[];
}