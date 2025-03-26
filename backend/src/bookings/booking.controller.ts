import { Controller, Post, Body, UseGuards, Req, Get } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "../bookings/dto/create-booking";

@Controller("bookings") // Убедитесь, что путь правильный
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createBooking(
        @Body() createBookingDto: CreateBookingDto,
        @Req() req,
    ) {
        const userId = req.user.userId;

        console.log("\ud83d\udccc Данные, полученные в контроллере:", createBookingDto);
        console.log("\ud83d\udccc ID пользователя:", userId);

        return this.bookingService.createBooking(createBookingDto, userId);
    }

    @Get()
    async getAllBookings() {
        return this.bookingService.getAllBookings();
    }

    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    async getUserBookings(@Req() req) {
        const userId = req.user.userId;
        return this.bookingService.getUserBookings(userId);
    }



}