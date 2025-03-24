import { Module } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { BookingController } from "./booking.controller";
import { DatabaseModule } from "../database/database.module";

@Module({
    providers: [BookingService],
    controllers: [BookingController],
    imports: [DatabaseModule],
})
export class BookingModule {}