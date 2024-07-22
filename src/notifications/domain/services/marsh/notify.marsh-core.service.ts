import { Injectable, } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { join } from 'path';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { NotifyMailService } from '../notify.mail.service';
import { FnzEstatusCargaMasivaDTO } from '../../helpers/dto/core/estatus-carga-masiva.dto';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { FnzTemplatesConsts } from '../../helpers/consts/fnz.templates.consts';
import { FnzDatosContactoDTO } from '../../helpers/dto/core/datos-contacto.dto';
import { FnzFormatosEntregadosDTO } from '../../helpers/dto/core/formatos-entregados.dto';
import { FnzFirmaDeDocumentosDTO } from '../../helpers/dto/core/generacion-formatos.dto';
import { FnzNoContinuaProcesoDTO } from '../../helpers/dto/core/no-continua-proceso.dto';
import { FnzFisicosEnviadosDTO } from '../../helpers/dto/core/recoleccion-de-fisicos.dto';
import { FnzRecoleccionFisicosDTO } from '../../helpers/dto/core/recoleccion-fisicos.dto';
import { FnzRevisionDocumentalDTO } from '../../helpers/dto/core/revision-documental.dto';
import { FnzSolicitudFirmaAseguradoDTO } from '../../helpers/dto/core/solicitud-firma-asegurado.dto';
import { FnzSolicitudFirmaEjecutivoDTO } from '../../helpers/dto/core/solicitud-firma-ejecutivo.dto';
import { FnzSolicitudDTO } from '../../helpers/dto/core/solicitud.dto';
import { FnzRevisionDeFormatosDTO } from '../../helpers/dto/core/validacion-de-firmas.dto';
import { FnzRevisionDocumentacionFisicaDTO } from '../../helpers/dto/core/validacion-de-originales.dto';
import { FnzGeneracionDeFormatosDTO } from '../../helpers/dto/core/validacion-documental.dto';

@Injectable()
export class NotifyMarshCoreService {
  private readonly TEMPLATE_DIRECTORY: string = join('fianzas', 'core');

  constructor(
    private notifyMailService: NotifyMailService,
    private i18n: I18nService<I18nTranslations>,
  ) { }

  async estatusCargaMasiva(
    body: FnzEstatusCargaMasivaDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      nombreUsuario: body.nombreUsuario,
      filename: body.filename,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate('notificaciones.CORE.FOLIO.ASUNTO', {
      lang: i18n.lang,
    })} • ${body.fechaInicioCarga}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.estatusCargaMasiva,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async formatosFirmados(
    body: FnzFormatosEntregadosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      aseguradora: body.aseguradora,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.FORMATOS_FIRMADOS.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.formatosFirmados,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async solicitudFirmaAsegurado(
    body: FnzSolicitudFirmaAseguradoDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      observaciones: body.observaciones,
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      correos: body.correos,
      appUrl: process.env.APP_URL,
      appUrlPortal: body.enlaceAsegurado,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.SOLICITUD_FIRMA_ASEGURADO.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.solicitudFirmaAsegurado,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async formatoEntregado(
    body: FnzFormatosEntregadosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      aseguradora: body.aseguradora,
      folioTramite: body.folioTramite,
      analistaIngreso: body.analistaIngreso,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.FORMATO_ENTREGADO.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.folioTramite} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.formatosEntregados,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async solicitud(
    body: FnzSolicitudDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      observaciones: body.observaciones,
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      nombreClienteComercial: body.nombreClienteComercial,
      aseguradora: body.aseguradora,
      razonSocial: body.razonSocial,
      nombreComercial: body.nombreComercial,
      proyectoClienteComercial: body.proyectoClienteComercial,
      proyectoCliente: body.proyectoCliente,
      correos: body.correos,
      documentos: body.documentos,
      appUrl: process.env.APP_URL,
      appUrlPortal: body.enlaceAsegurado,
    };

    let subject = '';

    if (body.taskNotificacionReminder) {

      subject = `${this.i18n.translate(
        'notificaciones.TASK.RECORDATORIO.ASUNTO',
        {
          lang: i18n.lang,
        },
      )} ${body.taskNotificacionReminder.count} : ${this.i18n.translate(
        'notificaciones.CORE.SOLICITUD.ASUNTO',
        {
          lang: i18n.lang,
        },
      )}`;

    } else {

      subject = `${this.i18n.translate(
        'notificaciones.CORE.SOLICITUD.ASUNTO',
        {
          lang: i18n.lang,
        },
      )}`;

    }

    subject = `${subject} • ${body.numeroCliente} - ${body.nombreComercial}`

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.solicitud,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async revisionDocumental(
    body: FnzRevisionDocumentalDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      nombreClienteComercial: body.nombreClienteComercial,
      aseguradora: body.aseguradora,
      razonSocial: body.razonSocial,
      nombreComercial: body.nombreComercial,
      correos: body.correos,
      observaciones: body.observaciones,
      documentos: body.documentos,
      appUrl: process.env.APP_URL,
      appUrlPortal: body.enlaceAsegurado,
    };

    let subject = '';

    if (body.taskNotificacionReminder) {

      subject = `${this.i18n.translate(
        'notificaciones.TASK.RECORDATORIO.ASUNTO',
        {
          lang: i18n.lang,
        }
      )} ${body.taskNotificacionReminder.count} : ${this.i18n.translate(
        'notificaciones.CORE.REVISION_DOCUMENTAL.ASUNTO',
        {
          lang: i18n.lang,
        }
      )}`;

    } else {
      subject = `${this.i18n.translate(
        'notificaciones.CORE.REVISION_DOCUMENTAL.ASUNTO',
        {
          lang: i18n.lang,
        },
      )}`;
    }

    subject = `${subject} • ${body.numeroCliente} - ${body.nombreAsegurado}`

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.revisionDocumental,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async datosContacto(
    body: FnzDatosContactoDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      nombreAsegurado: body.nombreAsegurado,
      telefonoAsegurado: body.telefonoAsegurado,
      usuario: body.usuario,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.DATOS_CONTACTO.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.datosContacto,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async noContinuaProceso(
    body: FnzNoContinuaProcesoDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      nombreAsegurado: body.nombreAsegurado,
      folioTramite: body.folioTramite,
      usuario: body.usuario,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.NO_CONTINUA_PROCESO.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.noContinuaProceso,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async firmaDeDocumentos(
    body: FnzFirmaDeDocumentosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      correos: body.correos,
      appUrl: process.env.APP_URL,
      appUrlPortal: body.enlaceAsegurado,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.FIRMA_DE_DOCUMENTOS.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.firmaDeDocumentos,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async fisicosEnviados(
    body: FnzFisicosEnviadosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      observaciones: body.observaciones,
      appUrl: process.env.APP_URL,
      claveGuia: body.claveGuia
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.FISICOS_ENVIADOS.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.fisicosEnviados,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async revisionDocumentacionFisica(
    body: FnzRevisionDocumentacionFisicaDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      nombreAsegurado: body.nombreAsegurado,
      observaciones: body.observaciones,
      documentos: body.documentos,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.REVISION_DOCUMENTACION_FISICA.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroIdentificador} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.revisionDocumentacionFisica,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async solicitudFirmaEjecutivo(
    body: FnzSolicitudFirmaEjecutivoDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      aseguradora: body.aseguradora,
      razonSocial: body.razonSocial,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.SOLICITUD_FIRMA_EJECUTIVO.ASUNTO',
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.solicitudFirmaEjecutivo,
    );
    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async recoleccionFisicos(
    body: FnzRecoleccionFisicosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      numeroCliente: body.numeroCliente,
      nombreAsegurado: body.nombreAsegurado,
      nombreClienteComercial: body.nombreClienteComercial,
      aseguradora: body.aseguradora,
      razonSocial: body.razonSocial,
      nombreComercial: body.nombreComercial,
      correos: body.correos,
      appUrl: process.env.APP_URL,
      appUrlPortal: body.enlaceAsegurado,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.RECOLECCION_FISICOS.ASUNTO',
    )} • ${body.numeroCliente} - ${body.nombreComercial}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.recoleccionFisicos,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async revisionDeFormatos(
    body: FnzRevisionDeFormatosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      aseguradora: body.aseguradora,
      observaciones: body.observaciones,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.REVISION_DE_FORMATOS.ASUNTO',
    )} • ${body.numeroIdentificador} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.revisionDeFormatos,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async generacionDeFormatos(
    body: FnzGeneracionDeFormatosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      aseguradora: body.aseguradora,
      numeroCliente: body.numeroIdentificador,
      nombreAsegurado: body.nombreAsegurado,
      observaciones: body.observaciones,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.CORE.GENERACION_DE_FORMATOSV2.ASUNTO',
    )} • ${body.numeroIdentificador} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.generacionDeFormatos,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }

  async recepcionDocumentos(
    body: FnzFormatosEntregadosDTO,
    i18n: I18nContext,
  ): Promise<ResponseDto> {
    const replacement = {
      numeroCliente: body.numeroCliente,
      nombreContacto: body.nombreAsegurado,
      aseguradora: body.aseguradora,
      appUrl: process.env.APP_URL,
    };

    const subject = `${this.i18n.translate(
      'notificaciones.PORTAL.RECEPCION_DOCUMENTOS.ASUNTO',
      {
        lang: i18n.lang,
      },
    )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

    const template = join(
      this.TEMPLATE_DIRECTORY,
      FnzTemplatesConsts.CORE.recepcionDocumentos,
    );

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }
}
