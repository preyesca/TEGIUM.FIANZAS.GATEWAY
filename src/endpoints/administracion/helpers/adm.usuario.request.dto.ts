import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { AdmUsuarioProyectoRequestDto } from './adm.usuario-proyecto.request.dto';

export class AdmUsuarioRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  @Matches(/^[a-zA-Z áÁéÉíÍóÓúÚñÑ]+$/, {
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.FORMAT'),
  })
  nombre: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  @Matches(/^[a-zA-Z áÁéÉíÍóÓúÚñÑ]+$/, {
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.FORMAT'),
  })
  primerApellido: string;

  @ApiProperty()
  @IsOptional()
  @Matches(/^[a-zA-Z áÁéÉíÍóÓúÚñÑ]+$/, {
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.FORMAT'),
  })
  segundoApellido: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('all.VALIDATIONS.FIELD.EMAIL'),
    },
  )
  correoElectronico: string;

  @ApiProperty({ type: AdmUsuarioProyectoRequestDto, isArray: true })
  @ValidateNested({ each: true }) // Valida cada elemento del arreglo
  @Type(() => AdmUsuarioProyectoRequestDto) // Usa el Dto de Proyecto para validar
  proyectos: AdmUsuarioProyectoRequestDto[]; // Un arreglo de objetos ProyectoDto
}

export class AdmUsuarioUpdateRequestDto extends AdmUsuarioRequestDto {
  @ApiProperty()
  @IsInt({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.NUMERIC'),
  })
  @Min(1, {
    message: i18nValidationMessage('catalogos.VALIDATIONS.MIN_VALUE_CLAVE'),
  })
  estatus: number;
}
