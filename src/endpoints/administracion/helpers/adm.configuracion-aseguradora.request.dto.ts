import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsMongoId, Min } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdmOficinaCorreoRequestDto {
  oficina?: number;
  correos: Array<string>;
}

export class AdmConfiguracionAseguradoraRequestDto {
  @ApiProperty()
  @IsInt({ message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC') })
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
  @IsMongoId({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ID_MONGO'),
  })
  proyecto: Types.ObjectId;

  @ApiProperty({ type: AdmOficinaCorreoRequestDto, isArray: true })
  @Type(() => AdmOficinaCorreoRequestDto)
  oficinas: AdmOficinaCorreoRequestDto[];
}
