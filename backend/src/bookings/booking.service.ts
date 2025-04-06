import { Injectable, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateBookingDto } from '../bookings/dto/create-booking';

@Injectable()
export class BookingService {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    async createBooking(dto: CreateBookingDto, userId: number) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const { listingId, startDate, endDate, comment } = dto;

            const listingCheck = await client.query(
                'SELECT id, "startDate" as "startDate", "endDate" as "endDate" FROM listings WHERE id = $1',
                [listingId]
            );

            if (!listingCheck.rows.length) {
                throw new NotFoundException('Объявление не найдено');
            }

            const listing = listingCheck.rows[0];

            if (!this.checkDatesAvailability(listing.startDate, listing.endDate, startDate, endDate)) {
                throw new ConflictException('Выбранные даты выходят за пределы доступного периода');
            }

            const availabilityCheck = await client.query(
                `SELECT id FROM bookings
                 WHERE listing_id = $1
                   AND (
                     (start_date <= $2 AND end_date >= $2) OR
                     (start_date <= $3 AND end_date >= $3) OR
                     (start_date >= $2 AND end_date <= $3)
                     )`,
                [listingId, startDate, endDate]
            );

            if (availabilityCheck.rows.length > 0) {
                throw new ConflictException('Выбранные даты уже заняты');
            }

            const user = await client.query(
                'SELECT first_name, last_name, email, phone FROM users WHERE id = $1',
                [userId]
            );

            if (!user.rows.length) {
                throw new NotFoundException('Пользователь не найден');
            }

            const { first_name, last_name, email, phone } = user.rows[0];
            const fullName = `${first_name} ${last_name}`;

            const result = await client.query(
                `INSERT INTO bookings (
                    listing_id,
                    user_id,
                    start_date,
                    end_date,
                    full_name,
                    phone,
                    email,
                    comment,
                    status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                     RETURNING *`,
                [
                    listingId,
                    userId,
                    startDate,
                    endDate,
                    fullName,
                    phone,
                    email,
                    comment || null,
                    'confirmed'
                ]
            );

            await client.query(
                `UPDATE listings SET "bookingStatus" = 'booked' WHERE id = $1`,
                [listingId]
            );

            await client.query('COMMIT');
            return result.rows[0];
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getUserBookings(userId: number, type: 'active' | 'completed' = 'active') {
        const query = `
            SELECT
                b.id,
                b.listing_id as "listingId",
                l.title,
                b.start_date as "startDate",
                b.end_date as "endDate",
                b.status,
                l.location,
                l.price,
                CASE 
                    WHEN l.photos IS NULL OR l.photos = '' THEN NULL
                    WHEN l.photos LIKE '{%}%' THEN (l.photos::text[])[1]
                    ELSE l.photos
                END as "mainPhoto",
                EXISTS (
                    SELECT 1
                    FROM reviews r
                    WHERE r.booking_id = b.id
                ) as "hasReview",
                (
                    SELECT json_build_object(
                        'id', r.id,
                        'rating', r.rating,
                        'comment', r.comment,
                        'createdAt', r.created_at
                    )
                    FROM reviews r
                    WHERE r.booking_id = b.id
                ) as "review"
            FROM bookings b
            JOIN listings l ON b.listing_id = l.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC`;

        console.log('Fetching bookings for user:', userId);
        const result = await this.pool.query(query, [userId]);
        console.log('Found bookings:', result.rows);
        return result.rows;
    }

    async getAllBookings() {
        const query = `
            SELECT
                b.id,
                b.start_date as "startDate",
                b.end_date as "endDate",
                b.status,
                b.created_at as "createdAt",
                l.id as "listingId",
                l.title,
                l.price,
                CASE 
                    WHEN l.photos IS NULL OR l.photos = '' THEN NULL
                    WHEN l.photos LIKE '{%}%' THEN (l.photos::text[])[1]
                    ELSE l.photos
                END as "mainPhoto",
                l.location,
                (SELECT COUNT(*) FROM reviews WHERE booking_id = b.id) as "hasReview",
                (
                    SELECT json_build_object(
                        'id', r.id,
                        'rating', r.rating,
                        'comment', r.comment,
                        'createdAt', r.created_at
                    )
                    FROM reviews r
                    WHERE r.booking_id = b.id
                ) as "review"
            FROM bookings b
            JOIN listings l ON b.listing_id = l.id
            ORDER BY b.created_at DESC`;

        const result = await this.pool.query(query);
        return result.rows;
    }

    async cancelBooking(bookingId: number, userId: number) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const bookingCheck = await client.query(
                `SELECT id, user_id, listing_id FROM bookings WHERE id = $1`,
                [bookingId]
            );

            if (!bookingCheck.rows.length) {
                throw new NotFoundException('Бронирование не найдено');
            }

            const booking = bookingCheck.rows[0];

            const listingCheck = await client.query(
                `SELECT user_id FROM listings WHERE id = $1`,
                [booking.listing_id]
            );

            if (!listingCheck.rows.length) {
                throw new NotFoundException('Объявление не найдено');
            }

            const ownerId = listingCheck.rows[0].user_id;

            if (booking.user_id !== userId && ownerId !== userId) {
                throw new ConflictException('Вы не можете отменить это бронирование');
            }

            await client.query(
                `UPDATE bookings SET status = 'canceled' WHERE id = $1`,
                [bookingId]
            );

            await client.query(
                `UPDATE listings SET "bookingStatus" = 'available' WHERE id = $1`,
                [booking.listing_id]
            );

            await client.query('COMMIT');
            return { message: 'Бронирование отменено' };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async completeExpiredBookings() {
        const query = `
            UPDATE bookings 
            SET status = 'completed'
            WHERE end_date < NOW() 
            AND status = 'confirmed'
            RETURNING *`;
        const result = await this.pool.query(query);
        return result.rows;
    }

    private checkDatesAvailability(
        listingStart: string | Date,
        listingEnd: string | Date,
        bookingStart: string | Date,
        bookingEnd: string | Date
    ): boolean {
        const listingStartDate = new Date(listingStart);
        const listingEndDate = new Date(listingEnd);
        const bookingStartDate = new Date(bookingStart);
        const bookingEndDate = new Date(bookingEnd);

        return (
            bookingStartDate >= listingStartDate &&
            bookingEndDate <= listingEndDate
        );
    }
}