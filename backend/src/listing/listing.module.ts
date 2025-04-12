import { Module, forwardRef } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CategoryModule } from '../listing/category/category.module';
import { DatabaseModule } from '../database/database.module';
import { LocationModule } from '../location/location.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; // Импортируем CloudinaryModule
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
    imports: [
        DatabaseModule,
        CategoryModule,
        forwardRef(() => LocationModule), // ✅ Разрываем циклическую зависимость
        CloudinaryModule, // Импортируем CloudinaryModule
        MulterModule.register({
            storage: memoryStorage(),
        }),
    ],
    controllers: [ListingController],
    providers: [ListingService, CloudinaryService],
    exports: [ListingService],
})
export class ListingModule {}