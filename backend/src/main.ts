import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Global filters and validation
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }));

  // Enhanced CORS settings
  app.enableCors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
    allowedHeaders: 'Authorization, Content-Type, X-Requested-With, Accept'
  });

  // Set global prefix for all API routes
  app.setGlobalPrefix('api');

  // Log registered routes (debug)
  const server = app.getHttpServer();
  const router = server._events.request._router;

  if (router) {
    const routes = router.stack
        .map(layer => {
          if (layer.route) {
            return {
              path: layer.route.path,
              method: layer.route.stack[0].method
            };
          }
        })
        .filter(item => item !== undefined);

    Logger.debug('Registered routes:');
    console.table(routes);
  }

  // Start the server
  await app.listen(3001);
  Logger.log("🚀 Backend is running at http://localhost:3001/api");

  // Environment variables debug
  Logger.debug("🔍 Environment Variables:");
  console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
  console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY?.substring(0, 4) + '...');
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("JWT_SECRET:", process.env.JWT_SECRET ? '***' : 'Not set');

  // Error handling
  process.on('uncaughtException', (err) => {
    Logger.error('🚨 Uncaught Exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    Logger.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

bootstrap();