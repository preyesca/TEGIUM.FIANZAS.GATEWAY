import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';

export class AuthRefreshTokenRequestDto {
  @ApiProperty()
  @IsNotEmpty({
    message: i18nValidationMessage<I18nTranslations>(
      'all.VALIDATIONS.FIELD.REQUIRED',
    ),
  })
  refreshToken: string;
}
