import { Controller } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { ERefreshTokenStatus } from 'src/app/common/enum/auth/refresh-token-status.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AuthRefreshTokenRepository } from '../../persistence/repository/auth.refresh-token.repository';
import {
  AuthRefreshTokenDto,
  IRefreshTokenResponse,
} from '../dto/auth.refresh-token.dto';

@Controller()
export class AuthRefreshTokenService {
  constructor(
    private readonly authRefreshTokenRepository: AuthRefreshTokenRepository,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  //FIXME: RMQServices_Administracion.REFRESH_TOKEN.create
  async create(body: AuthRefreshTokenDto) {
    const created = await this.authRefreshTokenRepository.create(body);
    return created?._id;
  }

  //FIXME: RMQServices_Administracion.REFRESH_TOKEN.findOne
  async findOne(payload: {
    refreshToken: string;
    lang: string;
  }): Promise<ResponseDto> {
    const rtFound: any = await this.authRefreshTokenRepository.findOne(
      payload.refreshToken,
    );

    if (!rtFound)
      return DefaultResponse.sendOk('', {
        status: ERefreshTokenStatus.RF_NOT_EXISTS,
      });

    if (rtFound.fechaHoraExpiracion < new Date()) {
      await this.authRefreshTokenRepository.updateExpiration(rtFound._id);
      return DefaultResponse.sendOk('', {
        status: ERefreshTokenStatus.RF_EXPIRED,
      });
    }

    return DefaultResponse.sendOk('', {
      status: ERefreshTokenStatus.OK,
      proyecto: rtFound.proyecto.toString(),
      usuario: rtFound.usuario.toString(),
      rol: rtFound.rol.toString(),
    } as IRefreshTokenResponse);
  }
}
