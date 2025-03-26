import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import 'dotenv/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware for handling JSON and URL-encoded data
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: 'Authorization, Content-Type'
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Start the server
  await app.listen(3001);
  Logger.log("🚀 Backend is running at http://localhost:3001");

  // Debug information
  console.log("🔍 CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("🔍 CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY);
  console.log("🔍 CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET);
}

bootstrap();