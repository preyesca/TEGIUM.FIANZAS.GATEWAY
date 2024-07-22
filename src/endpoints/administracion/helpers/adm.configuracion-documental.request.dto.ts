import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdmConfiguracionDocumentalRequestDto {
  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  @Min(1, {
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  pais: number;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  aseguradora: string;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('general.VALIDACIONES.MONGO_ID'),
  })
  proyecto: string;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  @Min(1, {
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  tipoPersona: number;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  @Min(1, {
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  giro: number;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  @Min(1, {
    message: i18nValidationMessage('general.VALIDACIONES.CATALOGO_CLAVE'),
  })
  estatus: number;

  @ApiProperty()
  documento: [];
}
