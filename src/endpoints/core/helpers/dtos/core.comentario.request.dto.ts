import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CoreComentarioRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  folio: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  bitacora: mongoose.Types.ObjectId;;

  @ApiProperty()
  comentarios: string;

  @ApiProperty()
  actividad: number;
}

export class ComentarioDetalleDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  _id: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  comentario: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  @IsNumber()
  actividad: number;
}
