import { ApiProperty } from '@nestjs/swagger';

export class Paging {
  @ApiProperty()
  size: number;

  @ApiProperty()
  totalPage: number;

  @ApiProperty()
  currentPage: number;

  constructor() {
    this.size = null;
    this.totalPage = null;
    this.currentPage = null;
  }
}

export class ErrorResponse<T> {
  code?: string;
  message?: T | string | null;
}

export class WebResponseDto<T> {
  @ApiProperty({ type: () => Object, nullable: true })
  result?: {
    data?: T | null;
    message?: string | null;
  };

  @ApiProperty({ type: () => Object, nullable: true })
  errors?: ErrorResponse<T>;

  @ApiProperty({ type: () => Paging, nullable: true })
  paging?: Paging | null;

  constructor() {
    this.result = {
      data: null,
      message: null,
    };
    this.errors = {
      code: null,
      message: null,
    };
    this.paging = new Paging();
  }
}
