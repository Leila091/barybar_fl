import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class BookingManagementService {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    async confirmBooking(bookingId: number, ownerId: number) {
        const result = await this.pool.query(
            `UPDATE bookings SET status = 'confirmed' WHERE id = $1 AND listing_id IN (SELECT id FROM listings WHERE user_id = $2) RETURNING *`,
            [bookingId, ownerId]
        );

        if (!result.rows.length) {
            throw new NotFoundException('Booking not found or you are not the owner');
        }

        return result.rows[0];
    }

    async rejectBooking(bookingId: number, ownerId: number) {
        const result = await this.pool.query(
            `UPDATE bookings SET status = 'rejected' WHERE id = $1 AND listing_id IN (SELECT id FROM listings WHERE user_id = $2) RETURNING *`,
            [bookingId, ownerId]
        );

        if (!result.rows.length) {
            throw new NotFoundException('Booking not found or you are not the owner');
        }

        return result.rows[0];
    }

    async cancelBookingByOwner(bookingId: number, ownerId: number) {
        const result = await this.pool.query(
            `UPDATE bookings SET status = 'canceled' WHERE id = $1 AND listing_id IN (SELECT id FROM listings WHERE user_id = $2) RETURNING *`,
            [bookingId, ownerId]
        );

        if (!result.rows.length) {
            throw new NotFoundException('Booking not found or you are not the owner');
        }

        return result.rows[0];
    }

    async cancelBookingByRenter(bookingId: number, renterId: number) {
        const result = await this.pool.query(
            `UPDATE bookings SET status = 'canceled' WHERE id = $1 AND user_id = $2 RETURNING *`,
            [bookingId, renterId]
        );

        if (!result.rows.length) {
            throw new NotFoundException('Booking not found or you are not the renter');
        }

        return result.rows[0];
    }
}