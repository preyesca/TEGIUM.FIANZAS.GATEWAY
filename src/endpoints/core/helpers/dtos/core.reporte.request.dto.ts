import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CoreReporteRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('general.VALIDACIONES.FECHA'),
  })
  fechaInicio: Date;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  @Type(() => Date)
  @IsDate({
    message: i18nValidationMessage('general.VALIDACIONES.FECHA'),
  })
  fechaFin: Date;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  @IsEmail(undefined, {
    each: true,
    message: i18nValidationMessage('general.VALIDACIONES.EMAIL'),
  })
  @IsArray({
    message: i18nValidationMessage('general.VALIDACIONES.ARRAY'),
  })
  // @ArrayNotEmpty({
  //   message: i18nValidationMessage('general.VALIDACIONES.ARRAY_NOT_EMPTY'),
  // })
  destinatarios: string[];

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('general.VALIDACIONES.CAMPO_REQUERIDO'),
  })
  @IsNumber(undefined, {
    message: i18nValidationMessage('general.VALIDACIONES.NUMBER'),
  })
  tipoReporte: number;
}
