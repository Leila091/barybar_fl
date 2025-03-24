import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Module({
    providers: [CloudinaryService],
    exports: [CloudinaryService], // Экспортируйте CloudinaryService
})
export class CloudinaryModule {}