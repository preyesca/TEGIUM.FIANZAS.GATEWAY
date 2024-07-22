import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import mongoose from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FlowValidacionDigitalRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage(''),
  })
  folio: mongoose.Types.ObjectId;

  @ApiProperty()
  archivos: Array<FlowValidacionDigitalArchivoDto>;
}

export class FlowValidacionDigitalArchivoDto {
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  documento: mongoose.Types.ObjectId;;

  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  expediente: mongoose.Types.ObjectId;;

  @ApiProperty()
  @IsOptional()
  correcto: boolean;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  @Min(1, {
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  motivo: number;

}
