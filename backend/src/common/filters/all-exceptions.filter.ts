// backend/src/common/filters/all-exceptions.filter.ts
    import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
    import { Request, Response } from 'express';

    @Catch()
    export class AllExceptionsFilter implements ExceptionFilter {
      catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const errorResponse = {
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
          message: (exception instanceof HttpException) ? exception.getResponse() : 'Internal server error',
        };

        console.error('Error:', exception);

      }
    }