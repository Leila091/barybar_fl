import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ListingModule } from './listing/listing.module';
import { LocationModule } from './location/location.module';
import { UploadModule } from './api/upload/upload.module';
import { CategoryModule } from './listing/category/category.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { BookingController } from './bookings/booking.controller'; // Импортируем контроллер
import { BookingService } from './bookings/booking.service';
import {BookingModule} from "./bookings/booking.module";
import {BookingManagementController} from "./bookings/booking-management.controller";
import {BookingManagementService} from "./bookings/booking-management.service"; // Импортируем сервис

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env.development',
            isGlobal: true,
        }),
        DatabaseModule,
        ListingModule,
        AuthModule, // AuthModule уже включает VerificationService
        UsersModule,
        LocationModule,
        UploadModule,
        CategoryModule,
        UsersModule,
        MailModule,
        BookingModule,
    ],
    controllers: [BookingController, BookingManagementController], // Регистрируем контроллер
    providers: [BookingService, BookingManagementService], // Регистрируем сервис
})
export class AppModule {
    private readonly logger = new Logger(AppModule.name);

    constructor(private readonly configService: ConfigService) {
        this.logger.log('\ud83d\udcaa AppModule запущен!');

        // Логируем переменные окружения через ConfigService
        this.logger.log('\ud83d\udd0d Загруженные переменные окружения:');
        this.logger.log('DB_HOST:', this.configService.get<string>('DB_HOST'));
        this.logger.log('DB_PORT:', this.configService.get<string>('DB_PORT'));
        this.logger.log('DB_USER:', this.configService.get<string>('DB_USER'));
        this.logger.log(
            'DB_PASSWORD:',
            this.configService.get<string>('DB_PASSWORD') ? '\u2705 Загружено' : '\u274c Не загружено',
        );
        this.logger.log('DB_NAME:', this.configService.get<string>('DB_NAME'));
    }
}