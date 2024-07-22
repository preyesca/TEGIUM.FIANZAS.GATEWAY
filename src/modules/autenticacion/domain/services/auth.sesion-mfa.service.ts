import { Controller } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { NotificationConsts } from 'src/app/services/helpers/consts/notification.const';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { BitNotificacionService } from 'src/modules/bitacora/domain/services/bit.notificacion.service';
import { AuthSesionMfaRepository } from '../../persistence/repository/auth.sesion-mfa.repository';
import { AuthSesionMfaDto } from '../dto/auth.sesion-mfa.dto';
import { EBitNotificacionType } from 'src/app/common/enum/notificaciones.enum';

@Controller()
export class AuthSesionMfaService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly authSesionMfaRepository: AuthSesionMfaRepository,
    private readonly bitNotificacionService: BitNotificacionService,
  ) { }

  //FIXME: RMQServices_Administracion.SESION_MFA.create
  async create(body: AuthSesionMfaDto, i18n: I18nContext): Promise<ResponseDto> {
    const created = await this.authSesionMfaRepository.create(body);

    const bodyNotification = {
      nombreUsuario: body.nombreUsuario,
      codigo: created.codigo,
      correoElectronico: created.correo,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_CODIGO_MFA,
      null,
      bodyNotification,
    );

    return DefaultResponse.sendOk('', created);
  }

  //FIXME: MQServices_Administracion.SESION_MFA.confirm
  async confirm(body: AuthSesionMfaDto): Promise<ResponseDto> {
    const confirm = await this.authSesionMfaRepository.confirm(body);

    if (!confirm)
      return DefaultResponse.sendConflict('El código es incorrecto', confirm);

    if (confirm.fechaExpiracion.getTime() <= Date.now())
      return DefaultResponse.sendNotFound('El código ha expirado', confirm);

    return DefaultResponse.sendOk('', confirm);
  }
}
