import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FlowConfirmacionEntregaArchivoRequestDto {

  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  expediente: Types.ObjectId;

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

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  usuarioAlta: Types.ObjectId;

  @ApiProperty()
  fechaHoraAlta: Date;
}
