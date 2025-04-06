import { Injectable, Inject, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
    constructor(@Inject('PG_POOL') private readonly pool: Pool) {}

    async createReview(dto: CreateReviewDto, userId: number) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // Проверяем бронирование
            const bookingCheck = await client.query(
                `SELECT id, user_id, listing_id, status 
                 FROM bookings 
                 WHERE id = $1`,
                [dto.bookingId]
            );

            if (!bookingCheck.rows.length) {
                throw new NotFoundException('Бронирование не найдено');
            }

            const booking = bookingCheck.rows[0];

            if (booking.status !== 'completed') {
                throw new ForbiddenException('Можно оставить отзыв только для завершенного бронирования');
            }

            if (booking.user_id !== userId) {
                throw new ForbiddenException('Вы не можете оставить отзыв для этого бронирования');
            }

            // Проверяем существование отзыва
            const reviewCheck = await client.query(
                `SELECT id FROM reviews WHERE booking_id = $1`,
                [dto.bookingId]
            );

            if (reviewCheck.rows.length > 0) {
                throw new ConflictException('Отзыв уже оставлен для этого бронирования');
            }

            // Создаем отзыв
            const result = await client.query(
                `INSERT INTO reviews (
                    booking_id,
                    listing_id,
                    user_id,
                    rating,
                    comment
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [
                    dto.bookingId,
                    booking.listing_id,
                    userId,
                    dto.rating,
                    dto.comment || null
                ]
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

    async getReviewsByListing(listingId: number) {
        const query = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at as "createdAt",
                u.first_name || ' ' || u.last_name as "userName"
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.listing_id = $1
            ORDER BY r.created_at DESC`;

        const result = await this.pool.query(query, [listingId]);
        return result.rows;
    }
}