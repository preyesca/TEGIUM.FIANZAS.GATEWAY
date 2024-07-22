import { ApiProperty } from "@nestjs/swagger";
import { FnzMailOptionsDTO } from "../mail.dto";

export class FnzFisicosEnviadosDTO {
    @ApiProperty({ required: true })
    mailOptions: FnzMailOptionsDTO; // Fixed
  
    @ApiProperty({ required: true })
    numeroIdentificador: string;
  
    @ApiProperty({ required: true })
    nombreAsegurado: string;
  
    @ApiProperty({ required: true })
    observaciones: string;

    @ApiProperty({ required: true })
    numeroCliente: string;

    @ApiProperty({ required: false })
    claveGuia: string;
  }
  