import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import mongoose from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ExpArchivoRequestDto {
  aseguradora?: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  titular: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  documento: mongoose.Types.ObjectId;

  @ApiProperty()
  nombreOriginal: string;

  @ApiProperty()
  nombreDocumento: string;

  @ApiProperty()
  nombreCorto: string;

  @ApiProperty()
  version: number;

  @ApiProperty()
  url: string;

  @ApiProperty()
  usuarioAlta: mongoose.Types.ObjectId;

  @ApiProperty()
  fechaHoraAlta: Date;

  @ApiProperty()
  fechaHoraVigencia: Date;

  @ApiProperty()
  eliminado: boolean;

  @ApiProperty()
  usuarioElimina: mongoose.Types.ObjectId;

  @ApiProperty()
  fechaHoraElimina: Date;

  @ApiProperty()
  archivo: string;

  @ApiProperty()
  mimetype: string;

  @ApiProperty()
  clave: string;

  @ApiProperty()
  archivoSize: number;

  @ApiProperty()
  contentType: string;
}
