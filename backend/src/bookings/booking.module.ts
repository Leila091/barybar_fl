import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { DatabaseModule } from "../database/database.module";
import { BookingManagementService } from "./booking-management.service";
import { BookingManagementController } from "./booking-management.controller";
import { ReviewController } from "../Review/review.controller";
import { ReviewService } from "../Review/review.service";
import { ListingService } from "../listing/listing.service"; // Если нужен для зависимостей

@Module({
    imports: [
        DatabaseModule, // Импортируем модуль с провайдером PG_POOL
        // Другие необходимые модули
    ],
    providers: [
        BookingService,
        BookingManagementService,
        ReviewService,
        // Если ReviewService зависит от других сервисов, их тоже нужно добавить
        {
            provide: 'REVIEW_REPOSITORY', // Пример кастомного провайдера, если используется
            useValue: {}, // или useFactory/useClass
        },
    ],
    controllers: [
        BookingController,
        BookingManagementController,
        ReviewController,
    ],
    exports: [
        BookingService, // Если нужно использовать в других модулях
        ReviewService,
    ],
})
export class BookingModule {}