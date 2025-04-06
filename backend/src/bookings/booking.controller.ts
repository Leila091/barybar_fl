import { Controller, Post, Body, UseGuards, Req, Get, Query } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "../bookings/dto/create-booking";

@Controller("bookings")
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post()
    @UseGuards(AuthGuard('jwt'))
    async createBooking(
        @Body() createBookingDto: CreateBookingDto,
        @Req() req,
    ) {
        const userId = req.user.userId;
        return this.bookingService.createBooking(createBookingDto, userId);
    }

    @Get()
    async getAllBookings() {
        return this.bookingService.getAllBookings();
    }

    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    async getUserBookings(
        @Req() req,
        @Query('type') type: 'active' | 'completed'
    ) {
        const userId = req.user.userId;
        return this.bookingService.getUserBookings(userId, type || 'active');
    }
}