import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { join } from 'path';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { NotifyMailService } from '../notify.mail.service';
import { NotifyAuthActivarCuentaDto } from './helpers/dtos/auth.activar-cuenta.dto';
import { NotifyAuthCodigoVerificacionMfaDto } from './helpers/dtos/auth.codigo-verificacion-mfa.dto';
import { NotifyAuthRecuperarContrasenaDto } from './helpers/dtos/auth.recuperar-contrasena.dto';
import { FnzTemplatesConsts } from '../../helpers/consts/fnz.templates.consts';

@Injectable()
export class NotifyAuthenticationService {
  private readonly _templateRoot: string = 'authentication';

  constructor(
    private i18nService: I18nService<I18nTranslations>,
    private notifyMailService: NotifyMailService,
  ) { }

  async activarCuenta(
    i18n: I18nContext,
    body: NotifyAuthActivarCuentaDto,
  ): Promise<ResponseDto> {
    const replacement = {
      nombreUsuario: body.nombreUsuario,
      idUsuario: body._id.toString(),
    };

    const template: string = join(
      this._templateRoot,
      FnzTemplatesConsts.AUTHENTICATION.activarCuenta,
    );

    const subject = this.i18nService.translate(
      'notificaciones.ACTIVACION_CUENTA.ASUNTO',
      {
        lang: i18n.lang,
      },
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async recuperarContrasena(
    i18n: I18nContext,
    body: NotifyAuthRecuperarContrasenaDto,
  ): Promise<ResponseDto> {
    const replacement = {
      nombreUsuario: body.nombreUsuario,
      password: body.password,
    };

    const template: string = join(
      this._templateRoot,
      FnzTemplatesConsts.AUTHENTICATION.recuperarContrasena,
    );

    const subject = this.i18nService.translate(
      'notificaciones.RECOVER_PASSWORD.ASUNTO',
      {
        lang: i18n.lang,
      },
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async codigoVerificacionMfa(
    i18n: I18nContext,
    body: NotifyAuthCodigoVerificacionMfaDto,
  ): Promise<ResponseDto> {
    const replacement = {
      nombreUsuario: body.nombreUsuario,
      codigoAutenticacion: body.codigo,
    };

    body.mailOptions = { to: [body.correoElectronico] };

    const subject = this.i18nService.translate(
      'notificaciones.CODIGO_VERIFICACION_MFA.ASUNTO',
      {
        lang: i18n.lang,
      },
    );

    const template: string = join(
      this._templateRoot,
      FnzTemplatesConsts.AUTHENTICATION.codigoVerificacionMfa,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }
}
