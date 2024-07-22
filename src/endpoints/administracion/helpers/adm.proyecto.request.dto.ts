import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsNotEmpty, Min } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdmProyectoRequestDto {
  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  pais: number;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ID_MONGO'),
  })
  aseguradora: Types.ObjectId;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  estatus: number;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  proceso: number;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  negocio: number;

  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  ramo: number;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  ceco: string;

  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  portal: string;

  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  codigo: string;
}
