import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { EEstatusActividad } from 'src/app/common/enum/estatus-actividad.enum';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmUsuarioRepository } from 'src/modules/administracion/persistence/repository/adm.usuario.repository';
import { BitActividadRepository } from 'src/modules/bitacora/persistence/repository/bit.actividad.repository';
import { CatActividadRepository } from 'src/modules/catalogo/persistence/repository/cat.actividad.repository';
import { CatEstatusActividadRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-actividad.repository';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';
import { WorkflowActividadRepository } from '../../persistence/repository/workflow.actividad.repository';
import { WorkflowConsultarRepository } from '../../persistence/repository/workflow.consultar.repository';

@Controller()
export class WorkflowActividadService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly workflowActividadRepository: WorkflowActividadRepository,
    private readonly workflowConsultarRepository: WorkflowConsultarRepository,
    private readonly catActividadRepository: CatActividadRepository,
    private readonly catEstatusActividadRepository: CatEstatusActividadRepository,
    private readonly admUsuarioRepository: AdmUsuarioRepository,
    private readonly catPerfilRepository: CatPerfilRepository,
    private readonly bitActividadRepository: BitActividadRepository,
  ) { }

  async updateToBandejaProgramada(payload: {
    folioMultisistema: number;
    actividad: number;
    lang: string;
    session: SessionTokenDto;
  }) {
    const actividad = await this.workflowActividadRepository.findOne(
      payload.folioMultisistema,
      payload.actividad,
      payload.session,
    );
    if (!actividad)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );

    await this.workflowActividadRepository.update(
      actividad._id,
      EEstatusActividad.PROGRAMADA,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      '',
    );
  }

  async updateToBandejaFinalizada(payload: {
    folioMultisistema: number;
    actividad: number;
    folio: string;
    lang: string;
    session: SessionTokenDto;
  }) {
    let actividadesToCancelar = [];
    const folioActividades =
      await this.workflowConsultarRepository.findActividadesToCancelarByFolio(
        payload.folioMultisistema,
        payload.session.proyecto,
      );
    const actividad = await this.workflowActividadRepository.findOne(
      payload.folioMultisistema,
      payload.actividad,
      payload.session,
    );

    if (!actividad)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );

    actividadesToCancelar.push(actividad);

    if (folioActividades.length > 0)
      actividadesToCancelar.push(folioActividades[0]);

    await this.workflowActividadRepository.cancelar(
      actividadesToCancelar,
      payload.session.usuario,
    );

    for (let index = 0; index < actividadesToCancelar.length; index++) {
      await this.bitActividadRepository.create({
        folio: new Types.ObjectId(payload.folio),
        actividad: actividadesToCancelar[index].actividad,
        usuario: new Types.ObjectId(payload.session.usuario),
        estatusBitacora: EEstatusActividad.CANCELADA.toString(),
        comentario: '',
      });
    }

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      '',
    );
  }

  async workflow(payload: {
    folioMultisistema: number;
    actividad: number;
    lang: string;
    session: SessionTokenDto;
  }) {
    const actividad =
      await this.workflowActividadRepository.selectByFolioActividad(
        payload.folioMultisistema,
        payload.actividad,
        payload.session,
      );
    return DefaultResponse.sendOk('', actividad);
  }

  async findUltimaActividadAndEstatus(payload: {
    folioMultisistema: number;
    session: SessionTokenDto;
  }) {
    const actividad =
      await this.workflowActividadRepository.findUltimaActividadAndEstatus(
        payload.folioMultisistema,
        payload.session,
      );
    return DefaultResponse.sendOk('', actividad);
  }

  async findContactoTelefonicoAndContactoAseguradora(payload: {
    folioMultisistema: number;
    session: SessionTokenDto;
  }) {
    const actividad =
      await this.workflowActividadRepository.findContactoTelefonicoAndContactoAseguradora(
        payload.folioMultisistema,
        payload.session,
      );
    return DefaultResponse.sendOk('', actividad);
  }

  async findUltimaActividadByFolio(payload: { folioMultisistema: number[] }) {
    const actividad =
      await this.workflowActividadRepository.findUltimaActividadByFolio(
        payload.folioMultisistema,
      );
    return DefaultResponse.sendOk('', actividad);
  }

  async findSolicitudByProyecto(payload: {
    paginate: any;
    session: SessionTokenDto;
  }) {
    const actividad =
      await this.workflowActividadRepository.findSolicitudByProyecto(
        payload.paginate,
        payload.session,
      );
    return DefaultResponse.sendOk('', actividad);
  }

  async findUltimaActividadByFolioPortal(payload: {
    folioMultisistema: number[];
  }) {
    const actividad =
      await this.workflowActividadRepository.findUltimaActividadByFolioPortal(
        payload.folioMultisistema,
      );
    return DefaultResponse.sendOk('', actividad);
  }

  async actividadesByFolioPaginated(data: any) {
    const objectIdProyecto = new Types.ObjectId(data.proyecto);
    if (!Types.ObjectId.isValid(objectIdProyecto))
      return DefaultResponse.sendNotFound(
        'El id del proyecto no es valido',
        null,
      );

    const workflowActividades =
      await this.workflowConsultarRepository.findActividadesByFolioPaginated(
        data.folio,
        objectIdProyecto,
        data.paginate,
      );
    if (!workflowActividades)
      return DefaultResponse.sendOk(
        'No se encontraron actividades',
        workflowActividades,
      );

    const actividadesFiltro: any = [
      ...new Set(workflowActividades.docs.map(({ actividad }) => actividad)),
    ];

    const estatusFiltro: any = [
      ...new Set(workflowActividades.docs.map(({ estatus }) => estatus)),
    ];

    const usuarioFiltro: any = [
      ...new Set(workflowActividades.docs.map(({ usuario }) => usuario)),
    ];

    const rolFiltro: any = [
      ...new Set(workflowActividades.docs.map(({ rol }) => rol)),
    ];

    const actividades = await this.catActividadRepository.selectInByClave(
      actividadesFiltro,
    );
    const estatusList =
      await this.catEstatusActividadRepository.selectInByClave(estatusFiltro);
    const usuarios = await this.admUsuarioRepository.selectIn(usuarioFiltro);
    const roles = await this.catPerfilRepository.selectInByClave(rolFiltro);

    const modifiedDocs = workflowActividades.docs.map((workflowActividad) => {
      const actividad = actividades.find(
        (x) => x.clave === workflowActividad.actividad,
      );
      const estatus = estatusList.find(
        (x) => x.clave === workflowActividad.estatus,
      );
      const user = usuarios.find(
        (user: any) =>
          user._id.toString() ===
          (workflowActividad.usuario instanceof Types.ObjectId
            ? workflowActividad.usuario.toString()
            : workflowActividad.usuario),
      );

      const nombre = user?.nombre ?? '';
      const primerApellido = user?.primerApellido ?? '';
      const segundoApellido = user?.segundoApellido ?? '';
      const nombreCompleto = [nombre, primerApellido, segundoApellido]
        .filter(Boolean)
        .join(' ');
      const rol = roles.find((x) => x.clave === workflowActividad.rol);
      if (actividad) {
        return {
          _id: workflowActividad._id,
          proyecto: workflowActividad.proyecto,
          folio: workflowActividad.folioMultisistema,
          actividad: actividad.descripcion,
          estatus: estatus.descripcion,
          estatusClave: estatus.clave,
          usuario: nombreCompleto,
          rol: rol.descripcion,
          fechaAlta: workflowActividad.fechaAlta,
          fechaInicial: workflowActividad.fechaInicial,
          fechaFinal: workflowActividad.fechaFinal,
        };
      } else {
        return workflowActividad;
      }
    });

    const modifiedResponse = DefaultResponse.sendOk('Actividades encontradas', {
      docs: modifiedDocs,
      totalDocs: workflowActividades.totalDocs,
      limit: workflowActividades.limit,
      totalPages: workflowActividades.totalPages,
      page: workflowActividades.page,
      pagingCounter: workflowActividades.pagingCounter,
      hasPrevPage: workflowActividades.hasPrevPage,
      hasNextPage: workflowActividades.hasNextPage,
      prevPage: workflowActividades.prevPage,
      nextPage: workflowActividades.nextPage,
    });
    return modifiedResponse;
  }

  async listaNegra(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    folioMultisistemaList: number[];
  }) {
    const actividad = await this.workflowActividadRepository.findAllListaNegra(
      payload.paginateParams,
      payload.session,
      payload.folioMultisistemaList,
    );
    return DefaultResponse.sendOk('', actividad);
  }
}
