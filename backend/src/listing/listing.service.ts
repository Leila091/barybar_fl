import { Injectable, Inject, NotFoundException, ForbiddenException, Logger, BadRequestException, Get, Query} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CategoryService } from '../listing/category/category.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';


@Injectable()
export class ListingService {
    private readonly logger = new Logger(ListingService.name);

    constructor(
        @Inject('PG_POOL') private readonly db: Pool,
        private readonly categoryService: CategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) {
        this.logger.log('Подключение к базе данных установлено');
        this.db.query('SET client_encoding = \'UTF8\'');
    }

    // Получение всех объявлений пользователя (включая черновики)
    async getListingsByUser(userId: number) {
        this.logger.log(`Запрос на получение объявлений пользователя с ID: ${userId}`);
        const query = 'SELECT id, title, description, price, "categoryId", "userId", status, "bookingStatus", location, "startDate", "endDate", photos FROM listings WHERE "userId" = $1';
        console.log('SQL-запрос:', query, [userId]); // Логируем запрос и параметры
        const result = await this.db.query(query, [userId]);
        this.logger.log(`Найдено объявлений: ${result.rows.length}`);
        return result.rows;
    }


    async getAllListings(filters: {
        minPrice?: number;
        maxPrice?: number;
        location?: string;
        categoryId?: number;
        status?: string;
    }) {
        try {
            let query = `
            SELECT l.*, c.name AS category_name
            FROM listings l
            JOIN category c ON l."categoryId"::integer = c.id
            WHERE 1=1
        `;
            const params: any[] = [];
            let paramIndex = 1;

            if (filters.status) {
                query += ` AND l.status = $${paramIndex}`;
                params.push(filters.status);
                paramIndex++;
            }

            if (filters.minPrice) {
                query += ` AND l.price >= $${paramIndex}`;
                params.push(filters.minPrice);
                paramIndex++;
            }

            if (filters.maxPrice) {
                query += ` AND l.price <= $${paramIndex}`;
                params.push(filters.maxPrice);
                paramIndex++;
            }

            if (filters.location) {
                query += ` AND l.location ILIKE $${paramIndex}`;
                params.push(`%${filters.location}%`);
                paramIndex++;
            }

            if (filters.categoryId) {
                query += ` AND l."categoryId"::integer = $${paramIndex}`;
                params.push(filters.categoryId);
                paramIndex++;
            }

            query += ' ORDER BY l."created_at" DESC';

            const result = await this.db.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Ошибка в getAllListings:', error);
            throw error;
        }
    }

    // Создание нового объявления (автоматически устанавливается статус "draft" и "bookingStatus" как "available")
    async createListing(dto: CreateListingDto, userId: number) {
        const { title, description, price, categoryId, location, startDate, endDate, photos, priceType } = dto;

        // Устанавливаем статус "draft" и "bookingStatus" как "available" по умолчанию
        const status = 'draft';
        const bookingStatus = 'available';

        const result = await this.db.query(
            `INSERT INTO listings
             (title, description, price, "categoryId", "userId", status, "bookingStatus", location, "startDate", "endDate", photos, "priceType")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING *`,
            [
                title,
                description,
                price,
                categoryId,
                userId,
                status,
                bookingStatus,
                location,
                startDate,
                endDate,
                photos,
                priceType, // Сохраняем выбранный тип цены
            ]
        );

        return result.rows[0];
    }


    // Получение объявления по ID (черновики видны только создателю)
    async getListingById(id: number, userId: number | null) {
        console.log(`🔍 Поиск объявления с ID: ${id}, пользователь: ${userId}`);

        // Проверяем, существует ли объявление
        const exists = await this.db.query('SELECT id FROM listings WHERE id = $1', [id]);
        if (!exists.rows.length) {
            console.error(`❌ Объявление с ID ${id} не найдено`);
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }

        // Получаем объявление
        const result = await this.db.query(
            'SELECT id, title, description, price, "categoryId", "userId", status, "bookingStatus", location, "startDate", "endDate", photos FROM listings WHERE id = $1',
            [id]
        );

        if (!result.rows.length) {
            console.error(`❌ Объявление с ID ${id} недоступно`);
            throw new NotFoundException('Объявление недоступно');
        }

        const listing = result.rows[0];

        // Устанавливаем bookingStatus по умолчанию, если он отсутствует
        if (!listing.bookingStatus) {
            listing.bookingStatus = "available"; // Значение по умолчанию
        }

        // Если пользователь не является владельцем, скрываем статус и bookingStatus
        if (listing.userId !== userId) {
            delete listing.status;
            delete listing.bookingStatus;
        }

        console.log(`✅ Объявление с ID ${id} найдено`);
        return listing;
    }

    // Обновление объявления (только для создателя)
    async updateListing(id: number, dto: UpdateListingDto, userId: number) {
        const existing = await this.db.query(
            'SELECT "userId", status, "bookingStatus", photos FROM listings WHERE id = $1',
            [id]
        );

        if (!existing.rows.length) {
            throw new NotFoundException(`Listing with ID ${id} not found`);
        }
        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('You cannot edit this listing');
        }

        // Parse photos as an array if it's stored as a string
        let updatedPhotos = existing.rows[0].photos;
        if (typeof updatedPhotos === 'string') {
            try {
                updatedPhotos = JSON.parse(updatedPhotos);
            } catch {
                updatedPhotos = []; // Default to an empty array if parsing fails
            }
        }

        // Ensure updatedPhotos is an array
        if (!Array.isArray(updatedPhotos)) {
            updatedPhotos = [];
        }

        // Remove deleted photos
        if ((dto.deletedPhotos?.length ?? 0) > 0) {
            updatedPhotos = updatedPhotos.filter(photo => !dto.deletedPhotos!.includes(photo));

            // Delete files from Cloudinary
            try {
                await this.cloudinaryService.deleteFiles(dto.deletedPhotos ?? []);
            } catch (error) {
                this.logger.error('Error deleting files from Cloudinary', error);
            }
        }

        // Add new photos
        if (dto.photos) {
            updatedPhotos = [...updatedPhotos, ...dto.photos];
        }

        // Prepare update data
        const updateData: Record<string, any> = {};
        const validFields = ['title', 'description', 'price', 'priceType', 'quantity',
            'location', 'startDate', 'endDate', 'categoryId', 'status', 'bookingStatus', 'photos'];

        for (const field of validFields) {
            if (dto[field] !== undefined && dto[field] !== null && dto[field] !== '') {
                updateData[field] = field === 'photos' ? updatedPhotos : dto[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('No data to update');
        }

        const setClause = Object.keys(updateData)
            .map((key, index) => `"${key}" = $${index + 1}`)
            .join(', ');

        const values = Object.values(updateData);
        values.push(id);

        const query = `UPDATE listings SET ${setClause} WHERE id = $${values.length} RETURNING *`;
        const result = await this.db.query(query, values);

        return result.rows[0];
    }

    // Удаление объявления (только для создателя)
    async deleteListing(id: number, userId: number) {
        const existing = await this.db.query('SELECT "userId" FROM listings WHERE id = $1', [id]);
        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }
        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('Вы не можете удалить это объявление');
        }

        const result = await this.db.query('DELETE FROM listings WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    // Получение объявлений по категории (по умолчанию только опубликованные)
    async getListingsByCategory(categoryId: number, filters?: {
        locationId?: number;
        minPrice?: number;
        maxPrice?: number;
        sortBy?: string;
        status?: string;
    }): Promise<any[]> {
        try {
            console.log('Getting listings for category:', categoryId);
            console.log('With filters:', filters);

            // Основной запрос без JOIN с location, так как location хранится как текст
            let query = `
                SELECT
                    l.*,
                    c.name as category_name
                FROM listings l
                         JOIN category c ON l."categoryId"::integer = c.id
                WHERE l."categoryId"::integer = $1 AND l.status = $2
            `;

            const queryParams: any[] = [categoryId, filters?.status || 'published'];
            let paramIndex = 3;

            // Если нужна фильтрация по locationId, используем текстовое сравнение
            if (filters?.locationId) {
                // Сначала получаем название локации по ID
                const location = await this.db.query(
                    'SELECT name FROM location WHERE id = $1',
                    [filters.locationId]
                );

                if (location.rows.length) {
                    query += ` AND l.location = $${paramIndex}`;
                    queryParams.push(location.rows[0].name);
                    paramIndex++;
                }
            }

            if (filters?.minPrice) {
                query += ` AND l.price >= $${paramIndex}`;
                queryParams.push(filters.minPrice);
                paramIndex++;
            }

            if (filters?.maxPrice) {
                query += ` AND l.price <= $${paramIndex}`;
                queryParams.push(filters.maxPrice);
                paramIndex++;
            }

            // Сортировка
            if (filters?.sortBy) {
                switch (filters.sortBy) {
                    case 'price_asc':
                        query += ' ORDER BY l.price ASC';
                        break;
                    case 'price_desc':
                        query += ' ORDER BY l.price DESC';
                        break;
                    case 'date_asc':
                        query += ' ORDER BY l."startDate" ASC';
                        break;
                    case 'date_desc':
                    default:
                        query += ' ORDER BY l."startDate" DESC';
                        break;
                }
            } else {
                query += ' ORDER BY l."startDate" DESC';
            }

            console.log('Executing query:', query);
            console.log('With params:', queryParams);

            const result = await this.db.query(query, queryParams);

            // Дополнительно получаем данные о локации, если они нужны
            if (result.rows.length) {
                for (const listing of result.rows) {
                    const locationInfo = await this.db.query(
                        'SELECT * FROM location WHERE name = $1',
                        [listing.location]
                    );
                    listing.location_info = locationInfo.rows[0] || null;
                }
            }

            console.log('Query result:', result.rows);
            return result.rows;
        } catch (error) {
            console.error('Error in getListingsByCategory:', error);
            throw error;
        }
    }
    // Архивирование объявления (только для создателя)
    async archiveListing(id: number, userId: number) {
        const existing = await this.db.query('SELECT "userId" FROM listings WHERE id = $1', [id]);
        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }
        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('Вы не можете архивировать это объявление');
        }

        const result = await this.db.query(
            'UPDATE listings SET status = $1 WHERE id = $2 RETURNING *',
            ['archived', id]
        );
        return result.rows[0];
    }

    // Публикация объявления (только для создателя)
    async publishListing(id: number, userId: number) {
        const existing = await this.db.query('SELECT "userId", status FROM listings WHERE id = $1', [id]);
        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }
        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('Вы не можете публиковать это объявление');
        }

        const result = await this.db.query(
            'UPDATE listings SET status = $1 WHERE id = $2 RETURNING *',
            ['published', id]
        );
        return result.rows[0];
    }

    // Получение объявлений по локации
    async getListingsByLocation(locationId: number) {
        const result = await this.db.query(
            'SELECT id, title, description, price, "categoryId", "userId", status, "bookingStatus", location, "start_date", "end_date", photos FROM listings WHERE "locationId" = $1',
            [locationId]
        );
        return result.rows;
    }

    // Обновление статуса бронирования объявления
    async updateBookingStatus(id: number, bookingStatus: string, userId: number) {
        const existing = await this.db.query('SELECT "userId" FROM listings WHERE id = $1', [id]);
        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }
        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('Вы не можете обновить статус бронирования этого объявления');
        }

        const result = await this.db.query(
            'UPDATE listings SET "bookingStatus" = $1 WHERE id = $2 RETURNING *',
            [bookingStatus, id]
        );
        return result.rows[0];
    }

    // Бронирование объявления
    async bookListing(id: number, userId: number, bookedDates: string[]) {
        const existing = await this.db.query('SELECT "userId", "start_date", "end_date", "bookingStatus" FROM listings WHERE id = $1', [id]);
        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }

        const listing = existing.rows[0];

        // Проверяем, что пользователь не бронирует своё же объявление
        if (listing.userId === userId) {
            throw new ForbiddenException('Вы не можете бронировать своё объявление');
        }

        // Проверяем, что объявление опубликовано
        if (listing.status !== 'published') {
            throw new ForbiddenException('Это объявление недоступно для бронирования');
        }

        // Проверяем, что все даты доступны для бронирования
        const allDatesAreBooked = this.checkIfAllDatesAreBooked(listing.start_date, listing.end_date, bookedDates);

        // Обновляем статус бронирования
        const newBookingStatus = allDatesAreBooked ? 'booked' : 'available';

        const result = await this.db.query(
            'UPDATE listings SET "bookingStatus" = $1 WHERE id = $2 RETURNING *',
            [newBookingStatus, id]
        );

        return result.rows[0];
    }

    // Вспомогательная функция для проверки, забронированы ли все даты
    private checkIfAllDatesAreBooked(startDate: string, endDate: string, bookedDates: string[]): boolean {
        // Преобразуем даты в массив всех доступных дат
        const allDates = this.generateDateRange(startDate, endDate);

        // Проверяем, что все даты из allDates есть в bookedDates
        return allDates.every(date => bookedDates.includes(date));
    }

    // Вспомогательная функция для генерации диапазона дат
    private generateDateRange(startDate: string, endDate: string): string[] {
        const dates: string[] = []; // Явно указываем тип массива
        let currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
            dates.push(currentDate.toISOString().split('T')[0]); // Формат YYYY-MM-DD
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return dates;
    }


    async searchByTitle(query: string) {
        const result = await this.db.query(
            `SELECT * FROM listings WHERE title ILIKE $1`,
            [`%${query}%`]
        );
        return result.rows;
    }

    async getLatestListings() {
        this.logger.log('Запрос на получение последних объявлений');
        const query = `
            SELECT 
                id, 
                title, 
                description, 
                price, 
                "categoryId", 
                "userId", 
                status, 
                "bookingStatus", 
                location, 
                "startDate", 
                "endDate", 
                photos,
                "created_at"
            FROM listings 
            WHERE status = 'published'
            ORDER BY "created_at" DESC
            LIMIT 10
        `;

        const result = await this.db.query(query);
        this.logger.log(`Найдено последних объявлений: ${result.rows.length}`);
        return result.rows;
    }



    // Восстановление объявления (только для создателя)

    async restoreArchivedListing(
        id: number,
        dto: { status: string },
        userId: number
    ) {
        // 1. Проверяем существование и владельца
        const existing = await this.db.query(
            'SELECT "userId", status FROM listings WHERE id = $1',
            [id]
        );

        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }

        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('Вы не можете восстановить это объявление');
        }

        // 2. Проверяем, что статус был 'archived'
        if (existing.rows[0].status !== 'archived') {
            throw new BadRequestException('Можно восстановить только архивные объявления');
        }

        // 3. Прямое обновление статуса в БД
        const result = await this.db.query(
            'UPDATE listings SET status = $1 WHERE id = $2 RETURNING *',
            [dto.status, id]
        );

        return result.rows[0];
    }

    async checkCanRestore(id: number, userId: number) {
        const listing = await this.getListingById(id, userId);
        if (!listing) throw new NotFoundException('Объявление не найдено');
        if (listing.userId !== userId) throw new ForbiddenException('Нет прав на восстановление');
        if (listing.status !== 'archived') throw new BadRequestException('Только архивные объявления можно восстановить');
    }

    async directStatusUpdate(id: number, newStatus: string) {
        const result = await this.db.query(
            'UPDATE listings SET status = $1 WHERE id = $2 RETURNING *',
            [newStatus, id]
        );
        return result.rows[0];
    }

    async restoreListing(id: number, userId: number) {
        // Check if the listing exists and belongs to the user
        const existing = await this.db.query('SELECT "userId", status FROM listings WHERE id = $1', [id]);
        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }
        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('Вы не можете восстановить это объявление');
        }

        // Ensure the listing is archived
        if (existing.rows[0].status !== 'archived') {
            throw new BadRequestException('Можно восстановить только архивные объявления');
        }

        // Update the status to 'draft' or another appropriate status
        const result = await this.db.query(
            'UPDATE listings SET status = $1 WHERE id = $2 RETURNING *',
            ['draft', id]
        );

        return {
            success: true,
            message: 'Объявление успешно восстановлено',
            data: result.rows[0],
        };
    }
}
