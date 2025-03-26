import { Injectable, Inject, NotFoundException, ForbiddenException, Logger, BadRequestException, Get, Query} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CategoryService } from '../listing/category/category.service';


@Injectable()
export class ListingService {
    private readonly logger = new Logger(ListingService.name);

    constructor(
        @Inject('PG_POOL') private readonly db: Pool,
        private readonly categoryService: CategoryService,
    ) {
        this.logger.log('Подключение к базе данных установлено');
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
        // Проверяем, существует ли объявление и принадлежит ли оно пользователю
        const existing = await this.db.query('SELECT "userId", status, "bookingStatus" FROM listings WHERE id = $1', [id]);
        if (!existing.rows.length) {
            throw new NotFoundException(`Объявление с ID ${id} не найдено`);
        }
        if (existing.rows[0].userId !== userId) {
            throw new ForbiddenException('Вы не можете редактировать это объявление');
        }

        // Проверяем, что объявление не в статусе "архив"
        if (existing.rows[0].status === 'archived') {
            throw new ForbiddenException('Редактирование архивных объявлений запрещено');
        }

        // Проверяем, что categoryId является числом
        if (dto.categoryId && isNaN(dto.categoryId)) {
            throw new BadRequestException('Некорректный ID категории');
        }

        // Если categoryId передан, проверяем, что категория существует
        if (dto.categoryId) {
            const category = await this.categoryService.getCategoryById(dto.categoryId);
            if (!category) {
                throw new NotFoundException('Категория не найдена');
            }
        }

        // Подготавливаем данные для обновления
        const updateData: Record<string, any> = {}; // Указываем тип для updateData
        const validFields = ['title', 'description', 'price', 'location', 'startDate', 'endDate', 'categoryId', 'status', 'bookingStatus', 'photos'];

        // Добавляем в updateData только те поля, которые переданы в dto и не равны undefined
        for (const field of validFields) {
            if (dto[field] !== undefined && dto[field] !== null && dto[field] !== '') {
                updateData[field] = dto[field];
            }
        }

        // Если updateData пустой, ничего не обновляем
        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('Нет данных для обновления');
        }

        // Если статус не передан, сохраняем текущий статус
        if (dto.status === undefined) {
            updateData.status = existing.rows[0].status;
        }

        // Если bookingStatus не передан, сохраняем текущий bookingStatus
        if (dto.bookingStatus === undefined) {
            updateData.bookingStatus = existing.rows[0].bookingStatus;
        }

        // Формируем SQL-запрос
        const setClause = Object.keys(updateData)
            .map((key, index) => `"${key}" = $${index + 1}`)
            .join(', ');

        const values = Object.values(updateData);
        values.push(id); // Добавляем id в конец массива значений

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
    async getListingsByCategory(categoryId: number, status: string = 'published') {
        const result = await this.db.query(
            'SELECT id, title, description, price, "categoryId", "userId", status, "bookingStatus", location, "startDate", "endDate", photos FROM listings WHERE "categoryId" = $1 AND status = $2',
            [categoryId, status]
        );
        return result.rows;
    }

    // Получение всех опубликованных объявлений
    async getPublishedListings() {
        const result = await this.db.query(
            'SELECT id, title, description, price, "categoryId", "userId", status, "bookingStatus", location, "start_date", "end_date", photos FROM listings WHERE status = $1',
            ['published']
        );
        return result.rows;
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

}