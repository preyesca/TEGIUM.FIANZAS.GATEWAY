import { ApiProperty } from '@nestjs/swagger';
import { FnzMailOptionsDTO } from '../mail.dto';

export class FnzRecoleccionFisicosDTO {
  @ApiProperty({ required: true })
  mailOptions: FnzMailOptionsDTO; // Fixed

  @ApiProperty({ required: true })
  numeroCliente: string;

  @ApiProperty({ required: true })
  nombreAsegurado: string;

  @ApiProperty({ required: true })
  nombreClienteComercial: string;

  @ApiProperty({ required: true })
  aseguradora: string;

  @ApiProperty({ required: true })
  razonSocial: string;

  @ApiProperty({ required: true })
  nombreComercial: string;
  
  @ApiProperty({ required: true })
  correos: Array<string>;

  enlaceAsegurado: string;
}
