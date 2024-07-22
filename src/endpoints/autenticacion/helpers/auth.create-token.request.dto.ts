import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';

export class AuthCreateTokenRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'all.VALIDATIONS.FIELD.REQUIRED',
    ),
  })
  usuario: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'all.VALIDATIONS.FIELD.REQUIRED',
    ),
  })
  proyecto: string;

  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'all.VALIDATIONS.FIELD.REQUIRED',
    ),
  })
  rol: string;
}
