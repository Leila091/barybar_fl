import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule], // Добавляем ConfigModule для работы с .env
    providers: [UploadService],
    exports: [UploadService], // Экспортируем, чтобы использовать в других модулях
})
export class UploadModule {}