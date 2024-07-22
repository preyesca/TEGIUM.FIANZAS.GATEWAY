import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumberString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';

export class AuthLoginAseguradoRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'all.VALIDATIONS.FIELD.REQUIRED',
    ),
  })
  @IsNumberString(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'all.VALIDATIONS.FIELD.NUMERIC',
      ),
    },
  )
  numeroCliente: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'all.VALIDATIONS.FIELD.REQUIRED',
    ),
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage<I18nTranslations>(
        'all.VALIDATIONS.FIELD.EMAIL',
      ),
    },
  )
  correoElectronico: string;
}
