import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse<T> {
  code?: string;
  message?: T | string | null;
}

export class WebResponseDto<T> {
  @ApiProperty({ type: () => Object, nullable: true })
  status?: string;
  data?: T;
  @ApiProperty({ type: () => Object, nullable: true })
  errors?: ErrorResponse<T>;

  constructor() {
    this.status = 'success';
    this.errors = {
      code: null,
      message: null,
    };
  }
}
