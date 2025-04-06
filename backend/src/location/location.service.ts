import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class LocationService {
    private pool: Pool;
    private defaultLocations = [
        { id: 1, name: 'Алматы', type: 'city', region: 'Алматинская область' },
        { id: 2, name: 'Атырау', type: 'city', region: 'Атырауская область' },
        { id: 3, name: 'Восточно-Казахстанская область', type: 'region', region: 'ВКО' },
        { id: 4, name: 'Жамбылская область', type: 'region', region: 'Жамбылская область' },
        { id: 5, name: 'Карагандинская область', type: 'region', region: 'Карагандинская область' },
        { id: 6, name: 'Костанайская область', type: 'region', region: 'Костанайская область' },
        { id: 7, name: 'Кызылординская область', type: 'region', region: 'Кызылординская область' },
        { id: 8, name: 'Мангистауская область', type: 'region', region: 'Мангистауская область' },
        { id: 9, name: 'Павлодарская область', type: 'region', region: 'Павлодарская область' },
        { id: 10, name: 'Северо-Казахстанская область', type: 'region', region: 'СКО' },
        { id: 11, name: 'Туркестанская область', type: 'region', region: 'Туркестанская область' },
        { id: 12, name: 'Шымкент', type: 'city', region: 'Туркестанская область' },
        { id: 13, name: 'Нур-Султан', type: 'city', region: 'Акмолинская область' },
        { id: 14, name: 'Алматы', type: 'city', region: 'Алматинская область' }
    ];

    constructor() {
        try {
            this.pool = new Pool({
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT ?? '5432', 10),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            });
        } catch (error) {
            console.error('Failed to initialize database pool:', error);
        }
    }

    async getAllLocations() {
        try {
            if (!this.pool) {
                return this.defaultLocations;
            }
            const { rows } = await this.pool.query('SELECT * FROM location');
            return rows.length > 0 ? rows : this.defaultLocations;
        } catch (error) {
            console.error('Error fetching locations from database:', error);
            return this.defaultLocations;
        }
    }

    async getLocationById(id: number) {
        try {
            if (!this.pool) {
                return this.defaultLocations.find(loc => loc.id === id) || null;
            }
            const { rows } = await this.pool.query('SELECT * FROM location WHERE id = $1', [id]);
            return rows[0] || this.defaultLocations.find(loc => loc.id === id) || null;
        } catch (error) {
            console.error('Error fetching location by id:', error);
            return this.defaultLocations.find(loc => loc.id === id) || null;
        }
    }

    async createLocation(name: string, type: string, region: string) {
        try {
            if (!this.pool) {
                throw new Error('Database connection not available');
            }
            const { rows } = await this.pool.query(
                'INSERT INTO location (name, type, region) VALUES ($1, $2, $3) RETURNING *',
                [name, type, region]
            );
            return rows[0];
        } catch (error) {
            console.error('Error creating location:', error);
            throw error;
        }
    }
}