import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

const envPath = path.resolve(__dirname, '../../.env');
console.log(`🟢 Проверяем путь: ${envPath}`);

// Проверяем, существует ли файл
if (!fs.existsSync(envPath)) {
    console.error("❌ Файл .env НЕ НАЙДЕН!");
} else {
    console.log("✅ Файл .env.development найден!");
}

// Загружаем переменные окружения
dotenv.config({ path: envPath });

console.log("📌 Загруженные переменные:");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME || "❌ НЕ НАЙДЕНО");
console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY || "❌ НЕ НАЙДЕНО");
console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Найдено" : "❌ НЕ НАЙДЕНО");

// Проверяем, загружены ли переменные
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error("❌ Cloudinary config missing! Проверь .env файл.");
    process.exit(1); // Останавливаем приложение, если конфигурация отсутствует
}

// Настройка Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };