import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'PG_CONNECTION',
            useFactory: async (configService: ConfigService) => {
                const dbConfig = {
                    host: configService.get<string>('DB_HOST'),
                    port: parseInt(configService.get<string>('DB_PORT') ?? '5432', 10),
                    user: configService.get<string>('DB_USER'),
                    password: configService.get<string>('DB_PASSWORD'),
                    database: configService.get<string>('DB_NAME'),
                };

                console.log('🛠️ Database Config:', dbConfig);

                const pool = new Pool(dbConfig);
                return pool;
            },
            inject: [ConfigService],
        },
    ],
    exports: ['PG_CONNECTION'],
})
export class DatabaseModule {}