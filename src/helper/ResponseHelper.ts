import { applyDecorators, Type } from '@nestjs/common';
import { WebResponseDto } from '../model/web.response.dto';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';

export const ApiOkResponseCustom = <GenericResponseDto extends Type<unknown>>(
  genericResponseDto: GenericResponseDto,
) =>
  applyDecorators(
    ApiExtraModels(WebResponseDto, genericResponseDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(WebResponseDto) },
          {
            properties: {
              result: {
                type: 'object',
                properties: {
                  data: { $ref: getSchemaPath(genericResponseDto) },
                },
              },
            },
          },
        ],
      },
    }),
  );

export const ApiErrorResponseStringCustom = (
  description: string,
  statusCode?: number,
) =>
  applyDecorators(
    ApiResponse({
      status: statusCode,
      schema: {
        allOf: [
          { $ref: getSchemaPath(WebResponseDto) },
          {
            properties: {
              errors: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' }, // Pastikan ini adalah string
                },
              },
            },
          },
        ],
      },
      description,
    }),
  );
