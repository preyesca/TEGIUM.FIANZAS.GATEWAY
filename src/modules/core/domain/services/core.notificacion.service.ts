import { Injectable, Logger } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { EKycActividad } from 'src/app/common/enum/kyc/kyc.actividad.enum';
import { IMailOptionAttachment, IMailOptions } from 'src/app/common/interfaces/mail.dto';
import { NotificationConsts } from 'src/app/services/helpers/consts/notification.const';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmConfiguracionAseguradoraService } from 'src/modules/administracion/domain/services/adm.configuracion-aseguradora.service';
import { AdmConfiguracionDocumentalService } from 'src/modules/administracion/domain/services/adm.configuracion-documental.service';
import { AdmProyectoConfiguracionService } from 'src/modules/administracion/domain/services/adm.proyecto-configuracion.service';
import { AdmProyectoService } from 'src/modules/administracion/domain/services/adm.proyecto.service';
import { AdmUsuarioService } from 'src/modules/administracion/domain/services/adm.usuario.service';
import { BitNotificacionService } from 'src/modules/bitacora/domain/services/bit.notificacion.service';
import { CatMotivoRechazoService } from 'src/modules/catalogo/domain/services/cat.motivo-rechazo.service';
import { ExpArchivoService } from 'src/modules/expediente/domain/services/exp.archivo.service';
import { CoreComentarioRepository } from '../../persistence/repository/core.comentario.repository';
import { CoreFolioRepository } from '../../persistence/repository/core.folio.repository';
import { CoreInformacionContactoRepository } from '../../persistence/repository/core.informacion-contacto.repository';
import { CorePolizaRepository } from '../../persistence/repository/core.poliza.repository';
import { CoreTelefonoContactoRepository } from '../../persistence/repository/core.telefono-contacto.repository';
import { FlowRecoleccionFisicosRepository } from '../../persistence/repository/flows/flow.recoleccion-fisicos.repository';
import { FlowValidacionDigitalRepository } from '../../persistence/repository/flows/flow.validacion-digital.repository';
import { FlowValidacionOriginalRepository } from '../../persistence/repository/flows/flow.validacion-original.repository';
import { AttachmentDto } from '../helpers/dto/core.notificacion.dto';
import { ECoreMimeTypes } from '../helpers/enum/core.mime-type.enum';
import { EBitNotificacionType } from 'src/app/common/enum/notificaciones.enum';
import { AdmDocumentoRepository } from 'src/modules/administracion/persistence/repository/adm.documento.repository';
import { TaskNotificacionReminderDto } from 'src/notifications/domain/helpers/dto/core/task-actividad-reminder.dto';
import { EProceso } from 'src/app/common/enum/catalogo/proceso.enum';

@Injectable()
export class CoreNotificacionService {
  private readonly _logger = new Logger(CoreNotificacionService.name);
  private readonly _sep: string = process.env.MSH_REPOSITORY_SEPARATOR ?? '\\';
  private readonly _notificacionesCC: String[] =
    process.env.MSH_NOTIFICATIONS_CORREO_COPIA.split(';');

  constructor(
    private i18nService: I18nService<I18nTranslations>,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly coreInformacionContactoRepository: CoreInformacionContactoRepository,
    private readonly coreComentarioRepository: CoreComentarioRepository,
    private readonly corePolizaRepository: CorePolizaRepository,
    private readonly admProyectoService: AdmProyectoService,
    private readonly bitNotificacionService: BitNotificacionService,
    private readonly admUsuarioService: AdmUsuarioService,
    private readonly expArchivoService: ExpArchivoService,
    private readonly catMotivoRechazoService: CatMotivoRechazoService,
    private readonly admProyectoConfiguracionService: AdmProyectoConfiguracionService,
    private readonly admConfiguracionDocumentalService: AdmConfiguracionDocumentalService,
    private readonly admConfiguracionAseguradoraService: AdmConfiguracionAseguradoraService,
    private readonly coreTelefonoContactoRepository: CoreTelefonoContactoRepository,
    private readonly flowValidacionDigitalRepository: FlowValidacionDigitalRepository,
    private readonly recoleccionService: FlowRecoleccionFisicosRepository,
    private readonly validacionOriginalesService: FlowValidacionOriginalRepository,
    private readonly admDocumentoRepository: AdmDocumentoRepository
  ) { }

  async solicitudFirmaAsegurado(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, comentario] = await this.getInformacionEmail(
      workflow,
    );
    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    let correosBody = '';
    infoContacto.correos.map((element: any) => {
      correosBody += '<li>' + element + '</li>';
    });

    const proyectoResult = await this.admProyectoService.findOne({
      id: folio.proyecto,
      lang: workflow.lang,
    });

    const proyecto = proyectoResult.data;

    const bodyNotificacion = {
      mailOptions: {
        to: correos,
      } as IMailOptions,
      nombreAsegurado: folio.titular.nombre,
      numeroCliente: folio.titular.numeroCliente,
      correos: correosBody,
      //observaciones: comentario.comentarios,
      enlaceAsegurado: proyecto.data.portal,
      lang: workflow.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_SOLICITUD_FIRMA_ASEGURADO,
      session,
      bodyNotificacion
    );
  }

  async datosContacto(i18n: I18nContext, session: SessionTokenDto, bearer: string, workflow: any) {
    const [folio, infoContacto, , , telefonoContacto] = await this.getInformacionEmail(
      workflow,
    );

    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const { data: usuario } = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: workflow.lang,
    });

    const bodyNotificacion = {
      mailOptions: {
        to: usuario.correoElectronico,
        cc: correos
      } as IMailOptions,
      nombreAsegurado: folio.titular.nombre,
      telefonoAsegurado: telefonoContacto.telefono,
      numeroCliente: folio.titular.numeroCliente,
      usuario: `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
        }`,
      lang: workflow.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_DATOS_CONTACTO,
      session,
      bodyNotificacion
    );
  }

  async noContinuaProceso(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto] = await this.getInformacionEmail(workflow);
    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const { data: usuario } = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: workflow.lang,
    });

    const bodyNotificacion = {
      mailOptions: {
        to: usuario.correoElectronico,
        cc: correos
      } as IMailOptions,
      nombreAsegurado: folio.titular.nombre,
      folioTramite: folio.folioCliente,
      numeroCliente: folio.titular.numeroCliente,
      usuario: `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
        }`,
      lang: workflow.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_NO_CONTINUA_PROCESO,
      session,
      bodyNotificacion
    );
  }

  async formatosFirmados(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(workflow);
    const correos = [...new Set(infoContacto.correos.map((value) => value))];
    const data: any = await this.expArchivoService.findTitular({
      session,
      pais: 0,
      aseguradora: poliza.aseguradora.toString(),
      proyecto: folio.proyecto.toString(),
      titular: folio.titular._id.toString(),
      lang: workflow.lang,
    });

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { nombreComercial, oficinas } = aseguradora.data;
    const correosAfianzadora = oficinas.find(
      (element: any) => element.oficina === folio.oficina,
    ).correos;
    const archivosCotejados = data.data.filter(
      (files: any) => files.cotejado != null,
    );

    let adjuntos: Array<AttachmentDto> = [];

    archivosCotejados.forEach((file: any) => {
      adjuntos.push(this.getFile(file, folio.titular.numeroCliente));
    });

    let bodyNotificacion = {
      mailOptions: {
        to: correosAfianzadora,
        cc: correos,
        attachments: adjuntos
      },
      nombreAsegurado: folio.titular.nombre,
      numeroCliente: folio.titular.numeroCliente,
      aseguradora: nombreComercial,
      lang: workflow.lang,
    };

    const maximumAllowedSizeInMB =
      +process.env.MSH_NOTIFICATIONS_MAXIMUM_SIZE_IN_MB || 25;

    const pesoTotalAdjuntar = adjuntos.reduce(
      (acumulator, currentValue) =>
        acumulator + currentValue.fileSizeInMegabytes,
      0,
    );

    if (pesoTotalAdjuntar < maximumAllowedSizeInMB) {
      this.bitNotificacionService.createAndSend(
        i18n,
        EBitNotificacionType.MARSH_NOTIFICACION_FORMATOS_FIRMADOS,
        session,
        bodyNotificacion
      );
      return;
    }

    let totalCorreos = 1;
    let pesoTotalMB = 0;

    for (const file in adjuntos.sort(
      (a, b) => a.fileSizeInMegabytes - b.fileSizeInMegabytes,
    )) {
      pesoTotalMB += adjuntos[file].fileSizeInMegabytes;

      if (pesoTotalMB > maximumAllowedSizeInMB) {
        totalCorreos += 1;
        pesoTotalMB = 0;
      }
    }

    const getDataInit = () => Array.from(new Array(totalCorreos), () => []);
    let attachmentsListSendEmail: Array<Array<AttachmentDto>> = getDataInit();

    for (let i = 0; i < getDataInit().length; i++) {
      let totalPesoEnMegabytesAttachment = 0;
      const archivosAdjuntar = adjuntos
        .sort((a, b) => a.fileSizeInMegabytes - b.fileSizeInMegabytes)
        .filter((file) => file.adjuntado == false);

      for (const file in archivosAdjuntar) {
        totalPesoEnMegabytesAttachment +=
          archivosAdjuntar[file].fileSizeInMegabytes;

        if (totalPesoEnMegabytesAttachment < maximumAllowedSizeInMB) {
          archivosAdjuntar[file].adjuntado = true;
          attachmentsListSendEmail[i].push(archivosAdjuntar[file]);
        } else {
          if (
            archivosAdjuntar[file].fileSizeInMegabytes > maximumAllowedSizeInMB
          )
            break;
        }
      }
    }

    attachmentsListSendEmail = attachmentsListSendEmail.filter(
      (x) => x.length > 0,
    );

    for (const file in attachmentsListSendEmail) {
      bodyNotificacion.mailOptions = {
        to: correosAfianzadora,
        attachments: attachmentsListSendEmail[file],
        cc: correos
      };

      this.bitNotificacionService.createAndSend(
        i18n,
        EBitNotificacionType.MARSH_NOTIFICACION_FORMATOS_FIRMADOS,
        session,
        bodyNotificacion
      );
    }
  }

  getFile(fileAttach: any, numeroCliente: string): AttachmentDto {
    const peso = fileAttach.cotejado.size / (1024.0 * 1024.0);
    const type = fileAttach.cotejado.path.split('.').pop();
    const fileName = fileAttach.cotejado.path.split('/').pop();
    const mimeType = '.' + type;
    return {
      value: `${fileAttach.cotejado.path}`,
      filename: fileAttach.filename,
      valueType: 'path',
      contentType: ECoreMimeTypes[mimeType],
      fileSizeInMegabytes: Math.round(peso * 100) / 100,
      adjuntado: false,
    };
  }

  async solicitud(i18n: I18nContext, session: SessionTokenDto, bearer: string, workflow: any, taskReminder: TaskNotificacionReminderDto = null
  ) {
    const [folio, infoContacto, comentario, poliza] =
      await this.getInformacionEmail(workflow);

    const { data: usuario } = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: workflow.lang,
    });

    const configuracion =
      await this.admProyectoConfiguracionService.findOneByProyecto({
        proyecto: folio.proyecto,
        lang: workflow.lang,
      });

    const responseConfiguracion =
      await this.admConfiguracionDocumentalService.getConfiguracionDocumental({
        aseguradora: poliza.aseguradora.toString(),
        proyecto: folio.proyecto.toString(),
        titular: folio.titular._id.toString(),
        lang: workflow.lang,
      });

    const arrayConfiguracion = responseConfiguracion.data.documento;

    const { data } = await this.expArchivoService.GetConfiguracionMasiva({
      session: '',
      pais: 0,
      aseguradora: poliza.aseguradora.toString(),
      proyecto: folio.proyecto.toString(),
      titular: folio.titular._id.toString(),
      lang: workflow.lang,
    });

    let documentos: string[] = [];
    arrayConfiguracion.map((element: any) => {
      let documento = data.filter(
        (doc: any) => doc.clave == element.clave && element.categoria == 1,
      )[0];
      if (documento != undefined) {
        documentos.push(documento.nombre);
      }
    });

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { razonSocial, nombreComercial } = aseguradora.data;
    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    let clienteProyecto = '';
    let proyectoComercial = '';
    if (configuracion.length > 0) {
      clienteProyecto = configuracion[0].nombreCliente;
      proyectoComercial = configuracion[0].nombreComercial;
    }

    const proyecto = await this.admProyectoService.findOne({
      id: folio.proyecto,
      lang: workflow.lang,
    });

    const link = `${EProceso[2]}${this._sep}documentos-email${this._sep}Guia_de_usuario_fianzas.pdf`;
    
    const files = {
      value: link,
      valueType: 'path',
      filename: 'Guia_de_usuario_fianzas.pdf',
      contentType: '',
      url: link
    }

    const bodyNotificacion = {
      mailOptions: {
        to: correos,
        cc: this._notificacionesCC,
        attachments: [files]
      },
      numeroCliente: folio.titular.numeroCliente,
      nombreAsegurado: infoContacto.nombre,
      nombreClienteComercial: folio.titular.nombre,
      aseguradora: poliza.aseguradora,
      razonSocial: razonSocial,
      nombreComercial: nombreComercial,
      correos: infoContacto.correos,
      documentos: documentos,
      proyectoClienteComercial: proyectoComercial,
      proyectoCliente: clienteProyecto,
      enlaceAsegurado: proyecto.data.portal,
      usuario: `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
        }`.trimEnd(),
      lang: workflow.lang,
      taskNotificacionReminder: taskReminder
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_SOLICITUD,
      session,
      bodyNotificacion
    );
  }

  async getInformacionEmail(workflow: any) {
    return await Promise.all([
      this.coreFolioRepository.findOnePopulate(workflow.folio),
      this.coreInformacionContactoRepository.findOneByFolio(workflow.folio),
      this.coreComentarioRepository.findOneFolioActividad(
        workflow.folio,
        workflow.actividadInicial,
      ),
      this.corePolizaRepository.findOneByFolio(workflow.folio),
      this.coreTelefonoContactoRepository.findOneByFolio(workflow.folio),
    ]);
  }

  async confirmacionEntrega(i18n: I18nContext, session: SessionTokenDto, bearer: string, workflow: any) {

    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(workflow);

    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const response: any =
      await this.expArchivoService.findByTitularAndTypeDocument(
        {
          session,
          pais: 0,
          aseguradora: poliza.aseguradora.toString(),
          proyecto: folio.proyecto.toString(),
          titular: folio.titular._id.toString(),
          lang: i18n.lang,
          idDocument: workflow.idDocumento
        }
      );

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: i18n.lang,
    });


    const { nombreComercial } = aseguradora.data;
    const usuario = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: i18n.lang,
    });


    const arrayCorreosDestinatarios = [
      usuario.data.correoElectronico];

    const analistaIngreso = `${usuario.data.nombre} ${usuario.data.primerApellido
      } ${usuario.data.segundoApellido ?? ''}`.trimEnd();

    const files: Array<IMailOptionAttachment> = response.data.map(
      (elem) =>
        <IMailOptionAttachment>{
          value: elem.url,
          valueType: 'path',
          filename: elem.filename,
          contentType: elem.contentType,
        },
    );

    const bodyNotificacion: any = {
      mailOptions: <IMailOptions>{
        to: arrayCorreosDestinatarios,
        cc: correos.concat(this._notificacionesCC),
        attachments: files,
      },
      nombreAsegurado: folio.titular.nombre,
      folioTramite: folio.titular.numeroCliente,
      aseguradora: nombreComercial,
      analistaIngreso,
    };


    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_CONFIRMACION_ENTREGA,
      session,
      bodyNotificacion
    );
  }

  async revision(i18n: I18nContext, session: SessionTokenDto, bearer: string, workflow: any, taskReminder: TaskNotificacionReminderDto = null) {
    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(
      workflow,
    );

    const { data: usuario } = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: workflow.lang,
    });

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const validacionDigital =
      await this.flowValidacionDigitalRepository.findOne(folio._id);
    const documentos = await this.crearMensajeDocumentosRechazados(
      validacionDigital.archivos,
    );
    const observaciones = await this.getComentarios(
      folio._id,
      EKycActividad.VALIDACION_DIGITAL,
    );
    const { razonSocial, nombreComercial } = aseguradora.data;
    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const proyecto = await this.admProyectoService.findOne({
      id: folio.proyecto,
      lang: workflow.lang,
    });

    const bodyNotificacion = {
      mailOptions: {
        to: correos,
        cc: correos,
      } as IMailOptions,
      nombreAsegurado: infoContacto.nombre,
      numeroCliente: folio.titular.numeroCliente,
      nombreClienteComercial: folio.titular.nombre,
      aseguradora: poliza.aseguradora,
      razonSocial: razonSocial,
      nombreComercial: nombreComercial,
      correos: infoContacto.correos,
      usuario: `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
        }`,
      observaciones: observaciones.comentarios,
      documentos: documentos,
      enlaceAsegurado: proyecto.data.portal,
      lang: workflow.lang,
      taskNotificacionReminder: taskReminder
    };

    const notificacion =
      bearer == ''
        ? NotificationConsts.CORE.VALIDACION_DOCUMENTAL
          .revisionDocumental_portal
        : NotificationConsts.CORE.VALIDACION_DOCUMENTAL.revisionDocumental;

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_REVISION_DOCUMENTAL,
      session,
      bodyNotificacion
    );
  }

  async recepcionDocumentos(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(
      workflow,
    );

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { nombreComercial } = aseguradora.data;
    const correos = [...new Set(infoContacto.correos.map((value) => value))];
    const bodyNotificacion = {
      mailOptions: {
        to: correos,
        cc: correos
      } as IMailOptions,
      nombreAsegurado: folio.titular.nombre,
      numeroCliente: folio.titular.numeroCliente,
      aseguradora: nombreComercial,
      lang: workflow.lang,
    };

    const notificacion =
      bearer == ''
        ? NotificationConsts.CORE.CONTACTO_ASEGURADORA
          .recepcion_documentos_portal
        : NotificationConsts.CORE.CONTACTO_ASEGURADORA.recepcion_documentos;

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_RECEPCION_DE_DOCUMENTOS,
      session,
      bodyNotificacion
    );
  }

  async solicitudfirmaEjecutivo(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(
      workflow,
    );

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { razonSocial } = aseguradora.data;
    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const bodyNotificacion = {
      mailOptions: {
        to: correos,
        cc: correos
      } as IMailOptions,
      nombreAsegurado: infoContacto.nombre,
      numeroCliente: folio.titular.numeroCliente,
      aseguradora: razonSocial,
      lang: workflow.lang,
    };

    const notificacion =
      bearer == ''
        ? NotificationConsts.CORE.FIRMA_DOCUMENTAL
          .solicitudFirmaEjecutivo_Portal
        : NotificationConsts.CORE.FIRMA_DOCUMENTAL.solicitudFirmaEjecutivo;

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_SOLICITUD_FIRMA_EJECUTIVO,
      session,
      bodyNotificacion
    );
  }

  async recoleccionFisicos(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(
      workflow,
    );

    const { data: usuario } = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: workflow.lang,
    });

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { razonSocial, nombreComercial, oficinas } = aseguradora.data;
    const correosAfianzadora = oficinas.find(
      (element: any) => element.oficina === folio.oficina,
    ).correos;
    const correos = [...new Set(infoContacto.correos.map((value) => value))];
    const proyectoResult = await this.admProyectoService.findOne({
      id: folio.proyecto,
      lang: workflow.lang,
    });
    const bodyNotificacion = {
      mailOptions: {
        to: correos,
        cc: this._notificacionesCC.concat(correos),
      } as IMailOptions,
      nombreAsegurado: infoContacto.nombre,
      numeroCliente: folio.titular.numeroCliente,
      aseguradora: razonSocial,
      nombreComercial: nombreComercial,
      correos: infoContacto.correos,
      usuario: `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
        }`,
      enlaceAsegurado: proyectoResult.data.portal,
      lang: workflow.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_RECOLECCION_FISICOS,
      session,
      bodyNotificacion
    );
  }

  async revisionFormatos(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, comentario, poliza] = await this.getInformacionEmail(
      workflow,
    );

    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { nombreComercial, oficinas } = aseguradora.data;
    const correosAfianzadora = oficinas.find(
      (element: any) => element.oficina === folio.oficina,
    ).correos;

    const bodyNotificacion = {
      mailOptions: {
        to: correosAfianzadora,
        cc: correos
      } as IMailOptions,
      nombreAsegurado: folio.titular.nombre,
      numeroIdentificador: folio.titular.numeroCliente,
      aseguradora: nombreComercial,
      lang: workflow.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_REVISION_DE_FORMATOS,
      session,
      bodyNotificacion
    );
  }

  async firmaDocumentos(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, comentario] = await this.getInformacionEmail(
      workflow,
    );
    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    let correosBody = '';
    infoContacto.correos.map((element: any) => {
      correosBody += '<li>' + element + '</li>';
    });

    const proyecto = await this.admProyectoService.findOne({
      id: folio.proyecto,
      lang: workflow.lang,
    });

    const bodyNotificacion = {
      mailOptions: {
        to: correos,
        cc: correos
      } as IMailOptions,
      nombreAsegurado: folio.titular.nombre,
      numeroCliente: folio.titular.numeroCliente,
      correos: correosBody,
      enlaceAsegurado: proyecto.data.portal,
      lang: workflow.lang,
    };

    const notificacion =
      bearer == ''
        ? NotificationConsts.CORE.PORTAL.firmaDocumentos
        : NotificationConsts.CORE.GENERACION_FORMATOS.firmaDocumentos;

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_FIRMA_DE_DOCUMENTOS,
      session,
      bodyNotificacion
    );
  }

  async fisicosEnviados(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(
      workflow,
    );

    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const file = await this.recoleccionService.findOne(folio._id);

    const { data } = await this.expArchivoService.selectOne(file.archivo);

    //  const files = { value: data.url,
    //   valueType: 'path', filename: data.nombreCorto, contentType: data.nombreCorto.split(".")[1] };

    const files = {
      value: data.url,
      valueType: 'path',
      filename: data.nombreCorto,
      contentType: data.nombreCorto.split('.')[1],
      url: data.url,
    };

    const { data: usuario } = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: workflow.lang,
    });

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { razonSocial, nombreComercial, oficinas } = aseguradora.data;
    const correosAfianzadora = oficinas.find(
      (element: any) => element.oficina === folio.oficina,
    ).correos;
    const observaciones = await this.getComentarios(
      workflow.folio,
      EKycActividad.RECOLECCION_FISICOS,
    );

    const bodyNotificacion = {
      mailOptions: {
        to: correosAfianzadora,
        cc: correos,
        attachments: [files],
      },
      nombreAsegurado: folio.titular.nombre,
      numeroCliente: folio.titular.numeroCliente,
      observaciones: observaciones.comentarios,
      claveGuia: file.claveGuia ?? '--',
      aseguradora: razonSocial,
      nombreComercial: nombreComercial,
      correos: infoContacto.correos,
      usuario: `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
        }`,
      lang: workflow.lang,
    };

    const notificacion =
      bearer == ''
        ? NotificationConsts.CORE.RECOLECCION_FISICOS.fisicos_enviados_portal
        : NotificationConsts.CORE.RECOLECCION_FISICOS.fisicos_enviados;

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_FISICOS_ENVIADOS,
      session,
      bodyNotificacion
    );
  }

  async revisionDocumentacionFisica(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    let mensaje = '';
    const [folio, infoContacto, , poliza] = await this.getInformacionEmail(
      workflow,
    );

    const { data: usuario } = await this.admUsuarioService.findOne({
      id: folio.usuario,
      lang: workflow.lang,
    });

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    const { razonSocial, nombreComercial, oficinas } = aseguradora.data;
    const correosAfianzadora: String[] = oficinas.find(
      (element: any) => element.oficina === folio.oficina,
    ).correos;
    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const validacionOriginales = await this.validacionOriginalesService.findOne(
      folio._id,
    );
    const documentos = await this.crearMensajeDocumentosRechazados(
      validacionOriginales.archivos,
    );
    const observaciones = await this.getComentarios(
      folio._id,
      EKycActividad.VALIDACION_ORIGINALES,
    );

    const bodyNotificacion = {
      mailOptions: {
        to: correos,
        cc: correosAfianzadora.concat(correos),
      } as IMailOptions,
      nombreAsegurado: infoContacto.nombre,
      numeroIdentificador: folio.titular.numeroCliente,
      observaciones: observaciones.comentarios,
      documentos: documentos,
      aseguradora: razonSocial,
      nombreComercial: nombreComercial,
      correos: infoContacto.correos,
      usuario: `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido ?? ''
        }`,
      lang: workflow.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_REVISION_DOCUMENTACION_FISICA,
      session,
      bodyNotificacion
    );
  }

  async generacionDeFormatos(
    i18n: I18nContext,
    session: SessionTokenDto,
    bearer: string,
    workflow: any,
  ) {
    const [folio, infoContacto, comentario, poliza] = await this.getInformacionEmail(
      workflow,
    );


    const correos = [...new Set(infoContacto.correos.map((value) => value))];

    const aseguradora = await this.admConfiguracionAseguradoraService.findOne({
      id: poliza.aseguradora.toString(),
      lang: workflow.lang,
    });

    let attachments: any = [];
    await Promise.all(
      workflow.documentos.map(async (documento) => {
        const { data } = await this.expArchivoService.selectOne(documento);

        let file = {
          value: data.url,
          valueType: 'path',
          filename: data.nombreCorto,
          contentType: '',
          url: data.url,
        };
        if (data != null) {
          attachments.push(file);
        }
      }),
    );

    const { nombreComercial, oficinas } = aseguradora.data;
    const correosAfianzadora = oficinas.find(
      (element: any) => element.oficina === folio.oficina,
    ).correos;

    const bodyNotificacion = {
      mailOptions: {
        to: correosAfianzadora,
        cc: correos,
        attachments: attachments,
      } as IMailOptions,
      nombreAsegurado: folio.titular.nombre,
      numeroIdentificador: folio.titular.numeroCliente,
      aseguradora: nombreComercial,
      lang: workflow.lang,
    };

    this.bitNotificacionService.createAndSend(
      i18n,
      EBitNotificacionType.MARSH_NOTIFICACION_GENERACION_FORMATOS,
      session,
      bodyNotificacion
    );
  }

  async getComentarios(folio: string, actividad: number) {
    return await this.coreComentarioRepository.findOneFolioActividad(folio, actividad);
  }

  async crearMensajeDocumentosRechazados(archivos: any) {
    const catalogo = await this.catMotivoRechazoService.select();
    const catDocumentos = await this.admDocumentoRepository.getAll();
    const documentos = [];
    archivos.forEach((element: any) => {
      if (element.motivo > 0) {
        let motivo = catalogo.data.find(
          (motivo) => motivo.clave === element.motivo,
        );

        const documento = catDocumentos.find(
          (x: any) => x._id.toString() == element.documento,
        );

        documentos.push(`${documento.nombre}: ${motivo?.descripcion}`);
      }
    });
    return documentos;
  }
}
