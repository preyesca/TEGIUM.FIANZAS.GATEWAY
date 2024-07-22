import { ApiProperty } from '@nestjs/swagger';
import { FnzMailOptionsDTO } from '../mail.dto';

export class FnzSolicitudFirmaAseguradoDTO {
  @ApiProperty({ required: true })
  mailOptions: FnzMailOptionsDTO; // Fixed

  @ApiProperty({ required: true })
  observaciones: string;

  @ApiProperty({ required: true })
  numeroCliente: string;

  @ApiProperty({ required: true })
  nombreAsegurado: string;

  @ApiProperty({ required: true })
  correos: Array<string>;

  enlaceAsegurado: string;
}
