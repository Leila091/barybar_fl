import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { LocationService } from './location.service';
import { ListingService } from '../listing/listing.service';

@Controller('location')
export class LocationController {
    constructor(
        private readonly locationService: LocationService,
        private readonly listingService: ListingService
    ) {}

    @Get()
    async getAll() {
        return this.locationService.getAllLocations();
    }

    @Get(':id/listings')
    async getListingsByLocation(@Param('id') id: string) {
        const locationId = Number(id);
        if (isNaN(locationId)) {
            throw new NotFoundException(`Некорректный ID локации: ${id}`);
        }

        const listings = await this.listingService.getListingsByLocation(locationId);
        return listings;
    }
}
