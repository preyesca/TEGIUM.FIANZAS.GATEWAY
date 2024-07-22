import { ApiProperty } from '@nestjs/swagger';
import { FnzMailOptionsDTO } from '../mail.dto';

export class FnzGeneracionDeFormatosDTO {
  @ApiProperty({ required: true })
  mailOptions: FnzMailOptionsDTO; // Fixed

  @ApiProperty({ required: true })
  numeroIdentificador: string;

  @ApiProperty({ required: true })
  nombreAsegurado: string;

  @ApiProperty({ required: true })
  aseguradora: string;

  @ApiProperty({ required: true })
  observaciones: string;
}
