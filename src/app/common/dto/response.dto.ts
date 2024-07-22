import { HttpStatus } from '@nestjs/common';

export class ResponseDto {
  success: boolean;
  message: string;
  data: any;
  statusCode: HttpStatus;
}
