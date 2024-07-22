import { ApiProperty } from '@nestjs/swagger';
import { FnzMailOptionsDTO } from '../mail.dto';

export class FnzRecepcionDocumentoDTO {
  @ApiProperty({ required: true })
  mailOptions: FnzMailOptionsDTO;

  @ApiProperty({ required: true })
  numeroCliente: string;

  @ApiProperty({ required: true })
  nombreAseguradora: string;

  @ApiProperty({ required: true })
  nombreContacto: string;
}
