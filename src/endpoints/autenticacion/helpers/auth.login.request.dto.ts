import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';

export class AuthLoginRequestDto {
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

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'all.VALIDATIONS.FIELD.REQUIRED',
    ),
  })
  password: string;
}
