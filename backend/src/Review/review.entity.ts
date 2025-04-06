// review.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Listing } from '../listing/listing.entity';
import { User } from '../users/user.entity';
import { Booking } from '../bookings/booking.entity';

@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => Booking, booking => booking.reviews)
    booking: Booking;

    @ManyToOne(() => Listing)
    listing: Listing;

    @ManyToOne(() => User)
    user: User;
}