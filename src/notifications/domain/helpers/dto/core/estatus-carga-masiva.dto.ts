import { ApiProperty } from '@nestjs/swagger';
import { FnzMailOptionsDTO } from '../mail.dto';

export class FnzEstatusCargaMasivaDTO {
  @ApiProperty({ required: true })
  mailOptions: FnzMailOptionsDTO;  // Fixed

  @ApiProperty({ required: true })
  nombreUsuario: string;

  @ApiProperty({ required: true })
  fechaInicioCarga: string;

  @ApiProperty({ required: true })
  filename: string;
}
