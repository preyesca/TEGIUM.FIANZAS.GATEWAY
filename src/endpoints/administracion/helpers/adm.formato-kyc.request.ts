import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';
import { Types } from 'mongoose';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdmFormatoKycRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ID_MONGO'),
  })
  proyecto: Types.ObjectId;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ID_MONGO'),
  })
  documento: string;

  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ID_MONGO'),
  })
  aseguradora: Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  tipoPersona: string;

  @ApiProperty()
  pais: number;

  @ApiProperty()
  @IsOptional()
  nombre: string;

  @ApiProperty()
  @IsOptional()
  nombreOriginal: string;

  @ApiProperty()
  @IsOptional()
  path: string;
}

export class AdmFormatoKycDeleteRequestDto {
  @ApiProperty()
  @IsMongoId({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.ID_MONGO'),
  })
  _id: Types.ObjectId;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  idAseguradora: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  idProyecto: string;
}
