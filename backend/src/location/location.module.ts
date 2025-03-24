import { Module, forwardRef } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { DatabaseModule } from '../database/database.module';
import { ListingModule } from '../listing/listing.module';

@Module({
    imports: [
        DatabaseModule,
        forwardRef(() => ListingModule), // ✅ Разрываем циклическую зависимость
    ],
    controllers: [LocationController],
    providers: [LocationService],
    exports: [LocationService],
})
export class LocationModule {}
