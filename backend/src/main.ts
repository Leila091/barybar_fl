import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware для обработки JSON и URL-encoded данных
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Глобальный фильтр для обработки исключений
  app.useGlobalFilters(new AllExceptionsFilter());

  // Настройка CORS
  app.enableCors({
    origin: "http://localhost:3000", // Разрешить запросы с фронтенда
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Разрешенные HTTP-методы
    credentials: true, // Разрешить передачу кук и заголовков авторизации
  });

  // Глобальный префикс для всех маршрутов
  app.setGlobalPrefix('api');

  // Глобальный пайп для валидации
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Запуск сервера
  await app.listen(3001);
  Logger.log("🚀 Бэкенд запущен на http://localhost:3001");

  // Отладочная информация
  console.log("🔍 CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("🔍 CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
  console.log("🔍 CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);
}

bootstrap();