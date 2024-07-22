import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AuthSesionUsuarioRepository } from '../../persistence/repository/auth.sesion-usuario.repository';

@Controller()
export class AuthSesionUsuarioService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly authSesionUsuarioRepository: AuthSesionUsuarioRepository,
  ) { }

  async create(payload: { id: string; lang: string }) {
    return await this.authSesionUsuarioRepository.create(
      new Types.ObjectId(payload.id),
    );
  }

  async findOne(payload: { usuario: string; lang: string }) {
    return await this.authSesionUsuarioRepository.findOne(payload.usuario);
  }

  async signOff(payload: { usuario: string; lang: string }): Promise<ResponseDto> {

    const _session = await this.authSesionUsuarioRepository.findOne(payload.usuario);

    const updated = await this.authSesionUsuarioRepository.signOff(_session._id.toString());

    if (!updated)
      //JOEL
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );

    //JOEL
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES', {
        lang: payload.lang,
      }),
    );
  }

  async updateFechaLogin(usuario: string, lang: string) {
    const _session = await this.authSesionUsuarioRepository.findOne(usuario);
    
    const updated = await this.authSesionUsuarioRepository.updateFechaLogin(_session._id.toString());

    if (!updated)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: lang,
        }),
      );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES', {
        lang: lang,
      }),
    );


  }
}
