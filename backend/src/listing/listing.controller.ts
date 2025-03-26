import {
    Controller,
    Get,
    Post,
    Body,
    Request,
    UseGuards,
    Param,
    Patch,
    Req,
    BadRequestException,
    NotFoundException,
    ForbiddenException,
    UseInterceptors,
    UploadedFiles,
    ParseIntPipe,
    InternalServerErrorException,
    HttpCode,
    HttpStatus,
    Logger,
    Query,// Добавлен импорт Logger
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ListingService } from './listing.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { AuthGuard } from '@nestjs/passport';
import { CategoryService } from '../listing/category/category.service';
import { LocationService } from '../location/location.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('listings')
export class ListingController {
    private readonly logger = new Logger(ListingController.name); // Логгер вынесен в начало класса

    constructor(
        private readonly locationService: LocationService,
        private readonly listingService: ListingService,
        private readonly categoryService: CategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    async createListing(@Body() createListingDto: CreateListingDto, @Request() req) {
        this.logger.log('Пользователь из запроса:', req.user); // Логируем весь объект пользователя
        const userId = req.user.userId; // Извлекаем userId из токена
        this.logger.log(`Запрос на создание объявления от пользователя: ${userId}`);

        // Логируем сам объект createListingDto
        this.logger.log('Данные, полученные в запросе:', createListingDto);

        const categoryId = Number(createListingDto.categoryId);
        if (isNaN(categoryId)) {
            throw new BadRequestException('Некорректный ID категории');
        }

        const category = await this.categoryService.getCategoryById(categoryId);
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        return this.listingService.createListing(createListingDto, userId);
    }


    @Get('my-listings')
    @UseGuards(AuthGuard('jwt'))
    async getMyListings(@Request() req) {
        this.logger.log(`Запрос на получение объявлений пользователя: ${req.user.userId}`);
        console.log('Пользователь из запроса:', req.user); // Логируем весь объект пользователя
        const listings = await this.listingService.getListingsByUser(req.user.userId); // Используем req.user.userId
        console.log('Результат запроса:', listings); // Логируем результат
        return listings;
    }


    // @Get(':id')
    // async getListingById(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Req() req,
    // ) {
    //     const userId = req.user?.id || null;
    //     this.logger.log(`Запрос на объявление с ID: ${id}, пользователь: ${userId}`);
    //
    //     return this.listingService.getListingById(id, userId);
    // }


    // @Get(':id')
    // async getListingById(
    //     @Param('id', new ParseIntPipe({ errorHttpStatusCode: 400 })) id: number,
    //     @Req() req,
    // ) {
    //     const userId = req.user?.id || null;
    //     this.logger.log(`Запрос на объявление с ID: ${id}, пользователь: ${userId}`);
    //     return this.listingService.getListingById(id, userId);
    // }



    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async updateListing(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateListingDto: UpdateListingDto,
        @Request() req,
    ) {
        const userId = req.user.userId; // Используем req.user.userId
        this.logger.log(`Запрос на обновление объявления с ID: ${id}, пользователь: ${userId}`);

        // Проверяем, что объявление существует и не в статусе "архив"
        const existing = await this.listingService.getListingById(id, userId);
        if (existing.status === 'archived') {
            throw new ForbiddenException('Редактирование архивных объявлений запрещено');
        }

        // Если categoryId передан, проверяем, что категория существует
        if (updateListingDto.categoryId) {
            const category = await this.categoryService.getCategoryById(updateListingDto.categoryId);
            if (!category) {
                throw new NotFoundException('Категория не найдена');
            }
        }

        // Обновляем объявление
        const updated = await this.listingService.updateListing(id, updateListingDto, userId);

        if (!updated) {
            throw new NotFoundException("Объявление не найдено или у вас нет прав на его редактирование");
        }

        return {
            success: true,
            message: 'Объявление успешно обновлено',
            data: updated,
        };
    }

    @Get('category/:id')
    async getListingsByCategory(@Param('id', ParseIntPipe) id: number) {
        this.logger.log(`Запрос на объявления по категории с ID: ${id}`);
        return this.listingService.getListingsByCategory(id, 'published');
    }

    @Patch(':id/publish')
    @UseGuards(AuthGuard('jwt'))
    async publishListing(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId; // Используем req.user.userId
        this.logger.log(`Запрос на публикацию объявления с ID: ${id}, пользователь: ${userId}`);
        return this.listingService.publishListing(id, userId);
    }

    @Patch(':id/archive')
    @UseGuards(AuthGuard('jwt'))
    async archiveListing(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId; // Используем req.user.userId
        this.logger.log(`Запрос на архивирование объявления с ID: ${id}, пользователь: ${userId}`);
        return this.listingService.archiveListing(id, userId);
    }

    @Post('upload-photos')
    @UseInterceptors(FilesInterceptor('files'))
    async uploadPhotos(@UploadedFiles() files: Express.Multer.File[]) {
        this.logger.log('Запрос на загрузку фотографий');

        if (!files || files.length === 0) {
            throw new BadRequestException('Файлы не были загружены');
        }

        try {
            const uploadResults = await Promise.all(
                files.map((file) => this.cloudinaryService.uploadFile(file)),
            );

            return { urls: uploadResults.map((result) => result.secure_url) };
        } catch (error) {
            this.logger.error('Ошибка при загрузке файлов', error.stack);
            throw new InternalServerErrorException('Ошибка при загрузке файлов');
        }
    }

    @Get('search') // ⬅️ Сначала обработчик поиска
    async searchListings(@Query('q') query: string) {
        if (!query) return [];
        this.logger.log(`🔍 Поиск объявлений: ${query}`);
        return this.listingService.searchByTitle(query);
    }

    @Get(':id') // ⬅️ Потом обработчик получения по ID
    async getListingById(@Param('id', ParseIntPipe) id: number, @Req() req) {
        this.logger.log(`📌 Запрос объявления с ID: ${id}`);
        return this.listingService.getListingById(id, req.user?.id || null);
    }


}