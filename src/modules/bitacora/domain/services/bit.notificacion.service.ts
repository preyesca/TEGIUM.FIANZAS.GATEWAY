import { Controller, Logger } from '@nestjs/common';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { NotificationService } from 'src/app/services/shared/notification.service';
import { BitNotificacionRepository } from '../../persistence/repository/bit.notificacion.repository';
import { I18nContext } from 'nestjs-i18n';
import { EBitNotificacionType } from 'src/app/common/enum/notificaciones.enum';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { NotifyAuthenticationService } from 'src/notifications/domain/services/authentication/notify.authentication.service';
import { NotifyAuthActivarCuentaDto } from 'src/notifications/domain/services/authentication/helpers/dtos/auth.activar-cuenta.dto';
import { ObjectId, Types, isValidObjectId } from 'mongoose';
import { NotifyMarshCoreService } from '../../../../notifications/domain/services/marsh/notify.marsh-core.service';

@Controller()
export class BitNotificacionService {
  private readonly _logger = new Logger(BitNotificacionService.name);


  constructor(
    private readonly notificationService: NotificationService,
    private readonly bitNotificacionRepository: BitNotificacionRepository,
    private readonly notifyAuthenticationService: NotifyAuthenticationService,
    private readonly notifyMarshCoreService: NotifyMarshCoreService

  ) { }

  /**
   * Método que sirve para crear una notificación y enviar la solicitud al API de notificaciones
   * @param i18n I18nContext
   * @param type Tipo de notificación (EBitNotificacionType)
   * @param session Sesión actual (Web o Portal) o **null** si es una petición anónima
   * @param bodyObject (Optional) Objeto con los atributos que necesita la petición (Body).
   */
  async createAndSend(
    i18n: I18nContext,
    type: EBitNotificacionType,
    session: SessionTokenDto | null | undefined,
    bodyObject?: any,
  ): Promise<void> {
    const idNotificacion = await this.bitNotificacionRepository.create(
      session,
      type,
      bodyObject,
    );

    const response = await this.sendMailAndGetResponse(i18n, type, bodyObject);

    await this.bitNotificacionRepository.sent(
      new Types.ObjectId(idNotificacion),
      session?.usuario,
      {
        message: response.message,
        success: response.success,
      },
    );

    this._logger.verbose(
      `Notificación (${idNotificacion}): ${response.message}.`,
    );
  }

  private async sendMailAndGetResponse(
    i18n: I18nContext,
    type: EBitNotificacionType,
    bodyObject: any,
  ): Promise<ResponseDto> {


    switch (type) {
      case EBitNotificacionType.MARSH_NOTIFICACION_ACTIVAR_CUENTA:
        return await this.notifyAuthenticationService.activarCuenta(
          i18n,
          <NotifyAuthActivarCuentaDto>bodyObject,
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_CODIGO_MFA:
        return await this.notifyAuthenticationService.codigoVerificacionMfa(
          i18n,
          bodyObject,
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_RECUPERAR_PASSWORD:
        return await this.notifyAuthenticationService.recuperarContrasena(
          i18n,
          bodyObject,
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_ESTATUS_CARGA_MASIVA:
        return await this.notifyMarshCoreService.estatusCargaMasiva(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_SOLICITUD_FIRMA_ASEGURADO:
        return await this.notifyMarshCoreService.solicitudFirmaAsegurado(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_DATOS_CONTACTO:
        return await this.notifyMarshCoreService.datosContacto(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_NO_CONTINUA_PROCESO:
        return await this.notifyMarshCoreService.noContinuaProceso(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_FORMATOS_FIRMADOS:
        return await this.notifyMarshCoreService.formatosFirmados(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_SOLICITUD:
        return await this.notifyMarshCoreService.solicitud(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_REVISION_DOCUMENTAL:
        return await this.notifyMarshCoreService.revisionDocumental(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_RECEPCION_DE_DOCUMENTOS:
        return await this.notifyMarshCoreService.recepcionDocumentos(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_SOLICITUD_FIRMA_EJECUTIVO:
        return await this.notifyMarshCoreService.solicitudFirmaEjecutivo(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_RECOLECCION_FISICOS:
        return await this.notifyMarshCoreService.recoleccionFisicos(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_REVISION_DE_FORMATOS:
        return await this.notifyMarshCoreService.revisionDeFormatos(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_FIRMA_DE_DOCUMENTOS:
        return await this.notifyMarshCoreService.firmaDeDocumentos(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_FISICOS_ENVIADOS:
        return await this.notifyMarshCoreService.fisicosEnviados(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_REVISION_DOCUMENTACION_FISICA:
        return await this.notifyMarshCoreService.revisionDocumentacionFisica(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_GENERACION_FORMATOS:
        console.log("Este es el ejemplo de archivo adjunto....");
        return await this.notifyMarshCoreService.generacionDeFormatos(
          bodyObject,
          i18n
        );
      case EBitNotificacionType.MARSH_NOTIFICACION_CONFIRMACION_ENTREGA:
        return await this.notifyMarshCoreService.formatoEntregado(
          bodyObject,
          i18n
        );
      default:
        throw new Error(
          `Se produjo un error al intentar enviar la notificación '${type}'.`,
        );
    }
  }
}
