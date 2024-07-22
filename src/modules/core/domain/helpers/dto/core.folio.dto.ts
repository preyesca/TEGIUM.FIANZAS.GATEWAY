import { Types } from 'mongoose';
import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsOptional} from "class-validator";
import {i18nValidationMessage} from "nestjs-i18n";

export class CoreFolioDto {
  folioMultisistema: number;
  folioCliente: string;
  comentario?: string;
  fecha?: Date;
  proyecto: Types.ObjectId;
  tipoCarga: number;
  usuario: Types.ObjectId;
  tipoMovimiento: number;
  giro: number;
  oficina: number;
  titular: Types.ObjectId;
  ejecutivo: Types.ObjectId;
}

export class CoreFolioCreateDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  numeroCliente: string;

  @ApiProperty()
  @IsOptional()
  comentario: string;
}
