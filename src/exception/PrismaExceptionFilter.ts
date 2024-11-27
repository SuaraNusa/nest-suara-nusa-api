import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { WebResponseDto } from '../model/web.response.dto';

@Catch(Prisma.PrismaClientKnownRequestError)
export default class PrismaExceptionFilter
  implements ExceptionFilter<Prisma.PrismaClientKnownRequestError>
{
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const webResponse: WebResponseDto<string> = new WebResponseDto();
    let statusCode = 400;
    switch (exception.code) {
      case 'P2002':
        webResponse.errors.code = 'P2002';
        webResponse.errors.message = `Duplicate field value: ${exception.meta.target as string}`;
        response.status(400).json(webResponse);
        break;
      case 'P2003':
        webResponse.errors.code = 'P2003';
        webResponse.errors.message = `Foreign key constraint failed: ${exception.meta.target as string}`;
        break;
      default:
        // handling all other errors
        webResponse.errors.message = `Something went wrong: ${exception.message}`;
        statusCode = 500;
    }
    throw new HttpException(webResponse.errors.message, statusCode);
  }
}
