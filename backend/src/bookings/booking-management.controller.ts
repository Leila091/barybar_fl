import { Controller, Patch, Param, UseGuards, Req, Logger } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { BookingManagementService } from "./booking-management.service";

@Controller("booking-management")
export class BookingManagementController {
    private readonly logger = new Logger(BookingManagementController.name);

    constructor(private readonly bookingManagementService: BookingManagementService) {}

    @Patch(':id/confirm')
    @UseGuards(AuthGuard('jwt'))
    async confirmBooking(@Param('id') bookingId: number, @Req() req) {
        this.logger.log(`Confirming booking with ID ${bookingId}`);
        const ownerId = req.user.userId;
        return this.bookingManagementService.confirmBooking(bookingId, ownerId);
    }

    @Patch(':id/reject')
    @UseGuards(AuthGuard('jwt'))
    async rejectBooking(@Param('id') bookingId: number, @Req() req) {
        this.logger.log(`Rejecting booking with ID ${bookingId}`);
        const ownerId = req.user.userId;
        return this.bookingManagementService.rejectBooking(bookingId, ownerId);
    }

    @Patch(':id/cancel-by-owner')
    @UseGuards(AuthGuard('jwt'))
    async cancelBookingByOwner(@Param('id') bookingId: number, @Req() req) {
        this.logger.log(`Canceling booking by owner with ID ${bookingId}`);
        const ownerId = req.user.userId;
        return this.bookingManagementService.cancelBookingByOwner(bookingId, ownerId);
    }

    @Patch(':id/cancel-by-renter')
    @UseGuards(AuthGuard('jwt'))
    async cancelBookingByRenter(@Param('id') bookingId: number, @Req() req) {
        this.logger.log(`Received request to cancel booking ${bookingId} by renter`);
        this.logger.log(`Full URL: ${req.url}`); // Добавьте это
        const renterId = req.user.userId;
        return this.bookingManagementService.cancelBookingByRenter(bookingId, renterId);
    }
}