import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import mongoose from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';


export class FlowValidacionAfianzadoraArchivosDto{
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  documento: mongoose.Types.ObjectId;

  @ApiProperty()
  @IsOptional()
  correcto: boolean;

  @ApiProperty()
  @IsInt({ message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE') })
  @Min(1, { message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE') })
  motivo: number;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  usuarioAlta: mongoose.Types.ObjectId;

  @ApiProperty()
  fechaHoraAlta: Date;

}
