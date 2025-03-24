import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';



dotenv.config(); // Явная загрузка переменных окружения

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true })],
    providers: [
        {
            provide: 'PG_POOL',
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const pool = new Pool({
                    host: configService.get<string>('DB_HOST', 'localhost'),
                    port: configService.get<number>('DB_PORT', 5432),
                    user: configService.get<string>('DB_USER', 'postgres'),
                    password: configService.get<string>('DB_PASSWORD', '123456'),
                    database: configService.get<string>('DB_NAME', 'barybar_dev'),
                });
                console.log('🔍 PG_POOL initialized with:', {
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    user: configService.get<string>('DB_USER'),
                    database: configService.get<string>('DB_NAME'),
                    password: configService.get<string>('DB_PASSWORD') ? '✅ Loaded' : '❌ Not loaded',
                });
                return pool;
            },
        },
    ],
    exports: ['PG_POOL'],
})
export class DatabaseModule {}