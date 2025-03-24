import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class LocationService {
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT ?? '5432', 10),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
    }

    async getAllLocations() {
        const { rows } = await this.pool.query('SELECT * FROM location'); // 👈 используем "location"
        return rows;
    }

    async getLocationById(id: number) {
        const { rows } = await this.pool.query('SELECT * FROM location WHERE id = $1', [id]);
        return rows[0] || null;
    }

    async createLocation(name: string, type: string, region: string) {
        const { rows } = await this.pool.query(
            'INSERT INTO location (name, type, region) VALUES ($1, $2, $3) RETURNING *',
            [name, type, region]
        );
        return rows[0];
    }
}