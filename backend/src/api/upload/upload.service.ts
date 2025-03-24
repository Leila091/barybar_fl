import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadService {
    async saveFile(file: Express.Multer.File): Promise<string> {
        try {
            const buffer = Buffer.from(file.buffer);
            const uploadDir = path.join(process.cwd(), 'public/uploads');

            // Проверяем, существует ли директория, и создаем её, если не существует
            await fs.mkdir(uploadDir, { recursive: true });

            const uploadPath = path.join(uploadDir, file.originalname);

            // Записываем файл асинхронно
            await fs.writeFile(uploadPath, buffer);

            return `/uploads/${file.originalname}`;
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    }
}