import { Types } from 'mongoose';

export class AdmConfiguracionFirmaCotejoDto {
  _id: Types.ObjectId = new Types.ObjectId();
  proyecto: Types.ObjectId;
  ejecutivos: AdmEjecutivo[];
}

export class AdmEjecutivo {
  _id: Types.ObjectId = new Types.ObjectId();
  clave: number;
  nombre: string;
  firma: string;
  path: string;
  contentType: string;
  originalName: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AddConfigFirmaCotejoDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  proyecto: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  clave: number;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  nombre: string;

  firma: string;

  path: string;

  @ApiProperty()
  contentType: string;

  @ApiProperty()
  originalName: string;
}
