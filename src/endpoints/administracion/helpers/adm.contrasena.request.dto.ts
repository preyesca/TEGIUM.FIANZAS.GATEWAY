import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class AdmContrasenaRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage('all.VALIDATIONS.FIELD.REQUIRED'),
  })
  contrasena: string;
}
