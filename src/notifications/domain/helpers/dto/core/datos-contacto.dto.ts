import { ApiProperty } from '@nestjs/swagger';
import { FnzMailOptionsDTO } from '../mail.dto';

export class FnzDatosContactoDTO {
  @ApiProperty({ required: true })
  mailOptions: FnzMailOptionsDTO; // Fixed

  @ApiProperty({ required: true })
  nombreAsegurado: string;

  @ApiProperty({ required: true })
  telefonoAsegurado: string;

  @ApiProperty({ required: true })
  usuario: string;
  
  @ApiProperty({ required: true })
  numeroCliente: string;
}
