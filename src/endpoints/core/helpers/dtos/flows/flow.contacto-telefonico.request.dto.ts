import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import mongoose from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FlowContactoTelefonicoRequestDto {
  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('El campo debe ser un número entero'),
  })
  tipoLlamada: number;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('El campo debe ser un número entero'),
  })
  estatus: number;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  folio: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  observaciones: string;
}

export class FlowInformacionTelefonicaRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  folio: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  telefono: string;

  @IsArray({
    message: i18nValidationMessage('general.VALIDACIONES.ARRAY_STRING'),
  })
  extensiones: string[];
}

export class FlowInformacionContactoRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  folio: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  nombre: string;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('El campo debe ser un número entero'),
  })
  tipo: number;

  @IsArray({
    message: i18nValidationMessage('general.VALIDACIONES.ARRAY_STRING'),
  })
  correos: string[];
}

export class FlowContactoTelefonicoComentarioRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  comentario: string;
}