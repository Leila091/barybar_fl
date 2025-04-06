import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env
config();

async function seed() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        // Читаем SQL файл
        const sqlPath = path.join(__dirname, 'seed.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Выполняем SQL запросы
        await pool.query(sql);
        console.log('✅ Тестовые данные успешно добавлены');
    } catch (error) {
        console.error('❌ Ошибка при добавлении тестовых данных:', error);
    } finally {
        await pool.end();
    }
}

seed(); 