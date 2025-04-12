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
            useFactory: async (configService: ConfigService) => {
                const pool = new Pool({
                    host: configService.get<string>('DB_HOST', 'localhost'),
                    port: configService.get<number>('DB_PORT', 5432),
                    user: configService.get<string>('DB_USER', 'postgres'),
                    password: configService.get<string>('DB_PASSWORD', '123456'),
                    database: configService.get<string>('DB_NAME', 'barybar_dev_new'),
                    client_encoding: 'UTF8'
                });

                // Устанавливаем кодировку для всех соединений в пуле
                pool.on('connect', async (client) => {
                    try {
                        await client.query('SET client_encoding = \'UTF8\'');
                        await client.query('SET standard_conforming_strings = on');
                        console.log('✅ Database encoding set to UTF8');
                    } catch (error) {
                        console.error('❌ Error setting database encoding:', error);
                    }
                });

                // Проверяем соединение и кодировку при инициализации
                try {
                    const client = await pool.connect();
                    const result = await client.query('SHOW client_encoding');
                    console.log('🔍 Current database encoding:', result.rows[0].client_encoding);
                    client.release();
                } catch (error) {
                    console.error('❌ Error checking database encoding:', error);
                }

                console.log('🔍 PG_POOL initialized with:', {
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    user: configService.get<string>('DB_USER'),
                    database: configService.get<string>('DB_NAME'),
                    password: configService.get<string>('DB_PASSWORD') ? '✅ Loaded' : '❌ Not loaded',
                    client_encoding: 'UTF8'
                });

                return pool;
            },
        },
    ],
    exports: ['PG_POOL'],
})
export class DatabaseModule {}
