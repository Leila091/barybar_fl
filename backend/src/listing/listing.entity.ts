import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { IsString, IsOptional, IsIn, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';


export enum PriceType {
    FIXED = 'fixed',
    PER_UNIT = 'per_unit',
    PER_DAY = 'per_day',
}

@Entity()
export class Listing {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    price: number;

    @Column({ nullable: true })
    @IsOptional()
    quantity?: number;

    @Column()
    categoryId: number;

    @Column()
    @IsString()
    @Transform(({ value }) => (value && value.name ? value.name : value))  // Преобразуем объект location в строку
    location: string;


    @Column({ default: 'draft' })
    userStatus: string;

    @Column({ default: 'available' })
    @IsOptional()
    @IsIn(['available', 'booked', 'pending'])
    bookingStatus: string;

    @Column()
    startDate: string;

    @Column()
    endDate: string;

    @Column('simple-array')
    photos: string[];

    @ManyToOne(() => User, (user) => user.listings)
    user: User;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: PriceType,
        default: PriceType.FIXED,
    })
    priceType: PriceType;

    @IsOptional()
    @IsArray()
    deletedPhotos?: string[];
}