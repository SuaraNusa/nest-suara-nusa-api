import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let status: HttpStatus;
    let message: string | object;

    // Cek jika exception adalah ZodError
    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST; // Misalnya, 400 untuk ZodError
      message = exception.issues[0].message; // Ambil issues dari ZodError
    } else if (exception instanceof HttpException) {
      // Cek jika exception adalah HttpException
      status = exception.getStatus();
      message = exception.getResponse();
    } else {
      // Default, jika bukan ZodError atau HttpException
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }
    // Menangani response
    response.status(status).json({
      status: status >= 200 && status < 400 ? 'success' : 'error',
      data: null,
      errors: message,
    });
  }
}
