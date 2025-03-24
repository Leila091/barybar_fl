import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';



@Injectable()
export class CategoryService {
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

    async getAllCategories() {
        const result = await this.pool.query('SELECT * FROM category ORDER BY id');
        return result.rows;
    }

    async getCategoryById(id: number) {
        const result = await this.pool.query('SELECT * FROM category WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
}