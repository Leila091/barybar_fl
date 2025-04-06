import { Module } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { PasswordResetController } from './password-reset.controller';
import { DatabaseModule } from '../../database/database.module';
import { MailModule } from '../../mail/mail.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        DatabaseModule, // Import DatabaseModule to provide PG_CONNECTION
        MailModule,     // Import MailModule
        ConfigModule,   // Import ConfigModule for ConfigService
    ],
    providers: [PasswordResetService],
    controllers: [PasswordResetController],
    exports: [PasswordResetService], // Export PasswordResetService if needed in other modules
})
export class PasswordResetModule {}