import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdmAseguradoraRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  nombreComercial: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  razonSocial: string;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  pais: number;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  estatus: number;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.BOLEANO'),
  })
  altaProyecto: boolean;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.BOLEANO'),
  })
  documentos: boolean;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  oficinas: number[];
}
