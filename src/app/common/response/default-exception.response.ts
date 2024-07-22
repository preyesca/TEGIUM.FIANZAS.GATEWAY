import { HttpException, HttpStatus } from '@nestjs/common';

export class DefaultResponseException extends HttpException {
  constructor(message: string, data: any, statusCode: HttpStatus) {
    super(
      {
        message,
        data,
        statusCode
      },
      statusCode,
    );
  }
}
