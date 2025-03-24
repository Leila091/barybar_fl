import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule], // Импортируем DatabaseModule, если он используется в UsersService
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Экспортируем UsersService, если он используется в других модулях
})
export class UsersModule {}