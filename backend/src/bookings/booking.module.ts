import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { DatabaseModule } from "../database/database.module";
import { BookingManagementService } from "./booking-management.service";
import { BookingManagementController } from "./booking-management.controller";

@Module({
    providers: [BookingService, BookingManagementService],
    controllers: [BookingController, BookingManagementController],
    imports: [DatabaseModule],
})
export class BookingModule {}