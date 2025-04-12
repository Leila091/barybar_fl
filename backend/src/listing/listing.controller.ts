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
    Query,
    HttpException,
    Delete
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
    private readonly logger = new Logger(ListingController.name);

    constructor(
        private readonly locationService: LocationService,
        private readonly listingService: ListingService,
        private readonly categoryService: CategoryService,
        private readonly cloudinaryService: CloudinaryService,
    ) {}

    @Get()
    async getAllListings(
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('location') location?: string,
        @Query('categoryId') categoryId?: string,
        @Query('status') status?: string
    ): Promise<any[]> {
        try {
            const filters = {
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                location,
                categoryId: categoryId ? parseInt(categoryId) : undefined,
                status: status || 'published',
            };

            this.logger.log('Фильтры всех объявлений:', filters);

            return await this.listingService.getAllListings(filters);
        } catch (error) {
            console.error('Ошибка при получении всех объявлений:', error);
            throw new HttpException('Не удалось получить объявления', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Post('create')
    @UseGuards(AuthGuard('jwt'))
    async createListing(@Body() createListingDto: CreateListingDto, @Request() req) {
        this.logger.log('Пользователь из запроса:', req.user);
        const userId = req.user.userId;
        this.logger.log(`Запрос на создание объявления от пользователя: ${userId}`);
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
        console.log('Пользователь из запроса:', req.user);
        const listings = await this.listingService.getListingsByUser(req.user.userId);
        console.log('Результат запроса:', listings);
        return listings;
    }

    @Get('search')
    async searchListings(@Query('q') query: string) {
        if (!query) return [];
        this.logger.log(`🔍 Поиск объявлений: ${query}`);
        return this.listingService.searchByTitle(query);
    }

    @Get('latest')
    async getLatestListings() {
        this.logger.log('Запрос на получение последних объявлений');
        return this.listingService.getLatestListings();
    }

    @Get('category/:id')
    async getListingsByCategory(
        @Param('id') id: string,
        @Query('locationId') locationId?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('sortBy') sortBy?: 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc',
        @Query('status') status?: string
    ): Promise<any[]> {
        try {
            const filters = {
                locationId: locationId ? parseInt(locationId) : undefined,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                sortBy,
                status: status || 'published'
            };

            console.log('Filters:', filters);

            const listings = await this.listingService.getListingsByCategory(parseInt(id), filters);
            return listings;
        } catch (error) {
            console.error('Error in getListingsByCategory:', error);
            throw new HttpException(
                'Failed to fetch listings',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get(':id')
    async getListingById(@Param('id', ParseIntPipe) id: number, @Req() req) {
        this.logger.log(`📌 Запрос объявления с ID: ${id}`);
        return this.listingService.getListingById(id, req.user?.id || null);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async updateListing(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateListingDto: UpdateListingDto,
        @Request() req,
    ) {
        const userId = req.user.userId;
        this.logger.log(`Запрос на обновление объявления с ID: ${id}, пользователь: ${userId}`);

        // const existing = await this.listingService.getListingById(id, userId);
        // if (existing.status === 'archived') {
        //     throw new ForbiddenException('Редактирование архивных объявлений запрещено');
        // }

        if (updateListingDto.categoryId) {
            const category = await this.categoryService.getCategoryById(updateListingDto.categoryId);
            if (!category) {
                throw new NotFoundException('Категория не найдена');
            }
        }

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

    @Patch(':id/publish')
    @UseGuards(AuthGuard('jwt'))
    async publishListing(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId;
        this.logger.log(`Запрос на публикацию объявления с ID: ${id}, пользователь: ${userId}`);
        return this.listingService.publishListing(id, userId);
    }

    @Patch(':id/archive')
    @UseGuards(AuthGuard('jwt'))
    async archiveListing(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId;
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

    // Удаление объявления
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    async deleteListing(@Param('id', ParseIntPipe) id: number, @Request() req) {
        const userId = req.user.userId;
        this.logger.log(`Запрос на удаление объявления с ID: ${id}, пользователь: ${userId}`);

        const existing = await this.listingService.getListingById(id, userId);
        if (!existing) {
            throw new NotFoundException('Объявление не найдено');
        }

        if (existing.userId !== userId) {
            throw new ForbiddenException('Вы не можете удалить это объявление');
        }

        const deleted = await this.listingService.deleteListing(id, userId);
        if (!deleted) {
            throw new InternalServerErrorException('Не удалось удалить объявление');
        }

        return {
            success: true,
            message: 'Объявление успешно удалено',
        };
    }

// Восстановление объявления
    @Patch(':id/restore')
    @UseGuards(AuthGuard('jwt'))
    async restoreListing(
        @Param('id', ParseIntPipe) id: number,
        @Request() req
    ) {
        const userId = req.user.userId;
        this.logger.log(`Запрос на восстановление объявления с ID: ${id}, пользователь: ${userId}`);

        // Check if the listing can be restored
        await this.listingService.checkCanRestore(id, userId);

        // Restore the listing by updating its status
        const updatedListing = await this.listingService.directStatusUpdate(id, 'published');

        return {
            success: true,
            message: 'Объявление успешно восстановлено',
            data: updatedListing,
        };
    }
}