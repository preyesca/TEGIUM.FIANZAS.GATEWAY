import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  ArrayUnique,
  IsInt,
  IsMongoId,
  Min,
} from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdmUsuarioProyectoRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ID_MONGO'),
  })
  proyecto: Types.ObjectId;
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  pais: number;
  @IsInt({
    each: true,
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    each: true,
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  @ArrayMinSize(1, {
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ARRAY'),
  })
  @ArrayUnique((value) => value, {
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ARRAY_UNIQUE'),
  })
  perfiles: number[];
}
