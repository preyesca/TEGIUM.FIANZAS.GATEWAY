import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ERol } from 'src/app/common/enum/catalogo/perfil.enum';
import { EEstatusActividad } from 'src/app/common/enum/estatus-actividad.enum';
import { EKycActividad } from 'src/app/common/enum/kyc/kyc.actividad.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { BitActividadRepository } from 'src/modules/bitacora/persistence/repository/bit.actividad.repository';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';
import { CoreFolioRepository } from 'src/modules/core/persistence/repository/core.folio.repository';
import { WorkflowRepository } from '../../persistence/repository/workflow.repository';
import { WorkflowAvanzarDto } from '../dto/workflow.avanzar.dto';
import { CoreComentarioService } from 'src/modules/core/domain/services/core.comentario.service';
import { EComentario } from 'src/modules/core/domain/helpers/enum/core.comentario';
import {CoreFolioReportService} from "../../../core/domain/services/core.folio-report.service";

@Controller()
export class WorkflowService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly workflowRepository: WorkflowRepository,
    private readonly catPerfilRepository: CatPerfilRepository,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly bitActividadRepository: BitActividadRepository,
    private readonly comentarioRepository: CoreComentarioService,
    private readonly coreFolioReportService:CoreFolioReportService


  ) { }

  async iniciar(data: WorkflowAvanzarDto) {
    const folio = await this.coreFolioRepository.findOne(
      data.workflow.folio.toString(),
    );

    if (!folio) return folio;

    //Validamos si existe una actividad ya registrada retorna la actividad de solicitud
    const informacionExistente =
      await this.workflowRepository.findByProyectoFolio(
        data.session.proyecto,
        folio.folioMultisistema.toString(),
      );

    if (informacionExistente.length > 0)
      return DefaultResponse.sendOk(
        this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', { lang: data.lang }),
        informacionExistente.find(
          (x) => x.actividad === EKycActividad.SOLICITUD,
        ),
      );

    //Inserta la actividad de Nuevo Folio
    const actividadNuevoFolio = await this.getInfoActividad(
      data,
      EKycActividad.NUEVO_FOLIO,
    );
    await this.workflowRepository.create(actividadNuevoFolio);

    const actividadSolicitud = await this.getInfoActividad(
      data,
      EKycActividad.SOLICITUD,
    );

    await this.workflowRepository.create(actividadSolicitud);

    return DefaultResponse.sendOk(
      '',
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', { lang: data.lang }),
    );
  }

  async avanzar(data: WorkflowAvanzarDto) {
    let { clave: rol } = await this.catPerfilRepository.findOne(
      data.session.rol,
    );

    //Obtiene la informacion del folio
    const folio = await this.coreFolioRepository.findOne(
      data.workflow.folio.toString(),
    );

    //Obtenemos la información de las actividades
    const informacionExistente =
      await this.workflowRepository.findByProyectoFolio(
        data.session.proyecto,
        folio.folioMultisistema.toString(),
      );

    if (informacionExistente.length == 0)
      return {
        success: false,
        message: 'INFORMACION_NO_EXISTENTE',
        data: null,
      };

    let actividadActual: any = informacionExistente.find(
      (x) =>
        x.actividad == data.workflow.actividadInicial && x.fechaFinal == null,
    );

    if (!actividadActual)
      return {
        success: false,
        message: 'INFORMACION_NO_EXISTENTE o ACTIVIDAD_YA_AVANZADA',
        data: null,
      };

    await this.workflowRepository.finalizaActividad(
      actividadActual._id,
      data.session.usuario,
      data.session.proyecto,
      folio.folioMultisistema,
      rol,
    );

    if (data.workflow.actividadInicial == EKycActividad.FIN) {
      return {
        success: true,
        message: 'INFORMACION GUARDADA',
        data: null,
      };
    }

    const infoActividad = await this.getInfoActividad(
      data,
      data.workflow.actividadFinal,
    );
    const actividadNuevoActividad = await this.workflowRepository.create(
      infoActividad,
    );

    if (data.workflow.actividadInicial == EKycActividad.SOLICITUD) {
      const infoActividad = await this.getInfoActividad(
        data,
        EKycActividad.CONTACTO_TELEFONICO,
      );

      await this.workflowRepository.create(infoActividad);

      if (data.workflow.actividadInicial === EKycActividad.SOLICITUD) {
        await this.bitActividadRepository.create({
          folio: new Types.ObjectId(data.workflow.folio),
          actividad: data.workflow.actividadInicial,
          usuario: new Types.ObjectId(data.session.usuario),
          estatusBitacora: data.workflow.actividad,
          comentario: '',
        });
      }
    }

    if (data.workflow.actividadInicial != EKycActividad.CONTACTO_ASEGURADORA) {

      const bitacora = await this.bitActividadRepository.create({
        folio: new Types.ObjectId(data.workflow.folio),
        actividad: data.workflow.actividadFinal,
        usuario: new Types.ObjectId(data.session.usuario),
        estatusBitacora: data.workflow.actividad,
        comentario: '',
      });

      await this.comentarioRepository.create({
        data: {
          folio: new Types.ObjectId(data.workflow.folio),
          bitacora: bitacora._id,
          comentarios: EComentario.BITACORA_TRANSICION,
          actividad: data.workflow.actividadFinal,
        },
        lang: '',
      });
    }

    if (data.workflow.actividadInicial == EKycActividad.CONTACTO_ASEGURADORA) {

      const infoActividad = await this.getInfoActividad(data, EKycActividad.CONTACTO_TELEFONICO);

      await this.workflowRepository.create(infoActividad);

      if (data.workflow.actividadFinal == EKycActividad.VALIDACION_DIGITAL) {
        const infoActividad = await this.getInfoActividad(
          data,
          EKycActividad.VALIDACION_DIGITAL,
        );

        const actividad = await this.workflowRepository.create(infoActividad);

        await this.comentarioRepository.create({
          data: {
            folio: new Types.ObjectId(data.workflow.folio),
            comentarios: EComentario.SIN_COMENTARIOS,
            actividad: data.workflow.actividadFinal,
          },
          lang: '',
        });

        const bitacora = await this.bitActividadRepository.create({
          folio: new Types.ObjectId(data.workflow.folio),
          actividad: EKycActividad.VALIDACION_DIGITAL,
          usuario: new Types.ObjectId(data.session.usuario),
          estatusBitacora: 'PENDIENTE DE DOCUMENTACION',
          comentario: '',
        });

        await this.comentarioRepository.create({
          data: {
            folio: new Types.ObjectId(data.workflow.folio),
            bitacora: bitacora._id,
            comentarios: EComentario.BITACORA_TRANSICION,
            actividad: data.workflow.actividadFinal,
          },
          lang: '',
        });

        await this.workflowRepository.finalizaActividad(
          actividad._id,
          data.session.usuario,
          data.session.proyecto,
          folio.folioMultisistema,
        );
      }

      if (data.workflow.actividadFinal == EKycActividad.CARGA_DOCUMENTAL) {

        await this.comentarioRepository.create({
          data: {
            folio: new Types.ObjectId(data.workflow.folio),
            comentarios: EComentario.SIN_COMENTARIOS,
            actividad: data.workflow.actividadFinal,
          },
          lang: '',
        });

        const bitacora = await this.bitActividadRepository.create({
          folio: new Types.ObjectId(data.workflow.folio),
          actividad: EKycActividad.CARGA_DOCUMENTAL,
          usuario: new Types.ObjectId(data.session.usuario),
          estatusBitacora: data.workflow.actividad,
          comentario: '',
        });

        await this.comentarioRepository.create({
          data: {
            folio: new Types.ObjectId(data.workflow.folio),
            bitacora: bitacora._id,
            comentarios: EComentario.BITACORA_TRANSICION,
            actividad: data.workflow.actividadFinal,
          },
          lang: '',
        });
      }

    }

    if (data.workflow.actividadFinal == EKycActividad.CONTACTO_ASEGURADORA) {
      await this.comentarioRepository.create({
        data: {
          folio: new Types.ObjectId(data.workflow.folio),
          comentarios: data.workflow.comentarios,
          actividad: data.workflow.actividadFinal,
        },
        lang: '',
      });
    }

	await this.coreFolioReportService.updateWorkflow(data.workflow.folio.toString())

    return {
      success: true,
      message: 'INFORMACION_GUARDADA',
      data: actividadNuevoActividad,
    };
  }

  async iniciarPortal(data: WorkflowAvanzarDto) {
    //Obtiene la informacion del folio
    const folio = await this.coreFolioRepository.findOne(
      data.workflow.folio.toString(),
    );

    //Obtenemos la información de las actividades
    const informacionExistente = await this.workflowRepository.findByFolio(
      folio.folioMultisistema.toString(),
    );

    if (informacionExistente.length == 0)
      return DefaultResponse.sendBadRequest('INFORMACION_NO_EXISTENTE', null);

    let actividadActual: any = informacionExistente.find(
      (x) =>
        x.actividad == data.workflow.actividadInicial && x.fechaFinal == null,
    );

    if (!actividadActual)
      // return { success: false, message: this.i18n.translate('general.INFORMACION_NO_EXISTENTE', { lang: data.lang }), data: null }
      return {
        success: false,
        message: 'INFORMACION_NO_EXISTENTE',
        data: null,
      };

    await this.workflowRepository.finalizaActividad(
      actividadActual._id,
      null,
      folio.proyecto._id.toString(),
      folio.folioMultisistema,
    );

    if (data.workflow.actividadInicial == EKycActividad.FIN) {
      return {
        success: true,
        // message: this.i18n.translate('general.INFORMACION_GUARDADA', { lang: data.lang }),
        message: 'INFORMACION_GUARDADA',
        data: null,
      };
    }

    let date: Date = new Date();

    let rol =
      data.workflow.actividadFinal < EKycActividad.VALIDACION_DIGITAL
        ? ERol.ANALISTA_INGRESO
        : ERol.EJECUTIVO_MESA;

    const infoActividad = {
      proyecto: new Types.ObjectId(folio.proyecto._id),
      folioMultisistema: folio.folioMultisistema,
      actividad: data.workflow.actividadFinal,
      estatus: data.workflow.reproceso
        ? EEstatusActividad.EN_REPROCESO
        : EEstatusActividad.NUEVA,
      usuario: null, //data.workflow.actividadFinal === 0 ? data.session.usuario : null,
      rol: data.workflow.actividadFinal === 0 ? ERol.EJECUTIVO_MESA : rol,
      fechaAlta: date,
      fechaInicial: null,
      fechaFinal: null,
      reproceso: null,
    };

    const actividadNuevoActividad = await this.workflowRepository.create(
      infoActividad,
    );

    if (data.workflow.actividadInicial == EKycActividad.SOLICITUD) {
      const infoActividad = {
        proyecto: new Types.ObjectId(folio.proyecto._id),
        folioMultisistema: folio.folioMultisistema,
        actividad: EKycActividad.CONTACTO_TELEFONICO,
        estatus: EEstatusActividad.NUEVA,
        usuario: null,
        rol: rol,
        fechaAlta: date,
        fechaInicial: null,
        fechaFinal: null,
        reproceso: null,
      };
      await this.workflowRepository.create(infoActividad);
    }
    await this.coreFolioReportService.updateWorkflow(data.workflow.folio.toString())


    return {
      success: true,
      // message: this.i18n.translate('general.INFORMACION_GUARDADA', { lang: data.lang }),
      message: 'INFORMACION_GUARDADA',
      data: actividadNuevoActividad,
    };
  }

  async completar(data: WorkflowAvanzarDto) {
    const folio = await this.coreFolioRepository.findOne(
      data.workflow.folio.toString(),
    );

    const informacionExistente =
      await this.workflowRepository.findByProyectoFolio(
        data.session.proyecto,
        folio.folioMultisistema.toString(),
      );

    if (informacionExistente.length == 0)
      // return { success: false, message: this.i18n.translate('general.INFORMACION_NO_EXISTENTE', { lang: data.lang }), data: null }
      return {
        success: false,
        message: 'INFORMACION_NO_EXISTENTE',
        data: null,
      };

    let actividadActual: any = informacionExistente.find(
      (x) =>
        x.actividad == data.workflow.actividadInicial && x.fechaFinal == null,
    );

    if (!actividadActual)
      // return { success: false, message: this.i18n.translate('general.INFORMACION_NO_EXISTENTE', { lang: data.lang }), data: null }
      return {
        success: false,
        message: 'INFORMACION_NO_EXISTENTE',
        data: null,
      };

    await this.workflowRepository.finalizaActividad(
      actividadActual._id,
      data.session.usuario,
      data.session.proyecto,
      folio.folioMultisistema.toString(),
    );
    await this.coreFolioReportService.updateWorkflow(data.workflow.folio.toString())


    return {
      success: true,
      // message: this.i18n.translate('general.INFORMACION_GUARDADA', { lang: data.lang }),
      message: 'INFORMACION_GUARDADA',
      data: null,
    };
  }

  async getInfoActividad(data: any, actividadFind: any) {
    const folio = await this.coreFolioRepository.findOne(data.workflow.folio);
    const rol = await this.catPerfilRepository.findOne(data.session.rol);

    let date: Date = new Date();
    let proyecto = new Types.ObjectId(data.session.proyecto);
    let folioMultisistema = folio.folioMultisistema;
    let usuario = new Types.ObjectId(data.session.usuario);

    const actividades = [
      {
        proyecto,
        folioMultisistema,
        actividad: EKycActividad.NUEVO_FOLIO,
        estatus: EEstatusActividad.COMPLETADA,
        usuario,
        rol: rol.clave, //who upload the file exel first
        fechaAlta: date,
        fechaInicial: date,
        fechaFinal: date,
        reproceso: null,
      },
      {
        proyecto,
        folioMultisistema,
        actividad: EKycActividad.SOLICITUD,
        estatus: EEstatusActividad.NUEVA,
        usuario: null,
        rol: rol.clave, //who advance the solicitud
        fechaAlta: date,
        fechaInicial: null,
        fechaFinal: null,
        reproceso: null,
      },
      {
        proyecto,
        folioMultisistema,
        actividad: data.workflow.actividadFinal,
        estatus: data.workflow.reproceso
          ? EEstatusActividad.EN_REPROCESO
          : EEstatusActividad.NUEVA,
        usuario: null,
        rol:
          data.workflow.actividadFinal === 0 ? ERol.EJECUTIVO_MESA : rol.clave,
        fechaAlta: date,
        fechaInicial: null,
        fechaFinal: null,
        reproceso: null,
      },
      {
        proyecto,
        folioMultisistema,
        actividad: EKycActividad.CONTACTO_TELEFONICO,
        estatus: EEstatusActividad.NUEVA,
        usuario: null,
        rol: rol.clave,
        fechaAlta: date,
        fechaInicial: null,
        fechaFinal: null,
        reproceso: null,
      },
      {
        proyecto,
        folioMultisistema,
        actividad: EKycActividad.CARGA_DOCUMENTAL,
        estatus: EEstatusActividad.NUEVA,
        usuario: null,
        rol: ERol.EJECUTIVO_MESA, //because analista of table don't have credentials
        fechaAlta: date,
        fechaInicial: null,
        fechaFinal: null,
        reproceso: null,
      },
    ];

    return actividades.find((x) => x.actividad == actividadFind);
  }
}
