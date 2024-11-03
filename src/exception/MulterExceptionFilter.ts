import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import multer, { MulterError } from 'multer';
import { WebResponseDto } from '../model/web.response.dto';
import { Response } from 'express';

@Catch(MulterError)
export default class MulterExceptionFilter
  implements ExceptionFilter<MulterError>
{
  catch(exception: multer.MulterError, host: ArgumentsHost): any {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const webResponse: WebResponseDto<string> = new WebResponseDto<string>();
    webResponse.errors.message = exception.message;
    response.status(500).json(webResponse);
  }
}
