import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { EKycActividad } from 'src/app/common/enum/kyc/kyc.actividad.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmUsuarioRepository } from 'src/modules/administracion/persistence/repository/adm.usuario.repository';
import { CatActividadRepository } from 'src/modules/catalogo/persistence/repository/cat.actividad.repository';
import { CatEstatusActividadRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-actividad.repository';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';
import { WorkflowConsultarRepository } from '../../persistence/repository/workflow.consultar.repository';

@Controller()
export class WorkflowConsultaService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly workflowConsultarRepository: WorkflowConsultarRepository,
    private readonly catActividadRepository: CatActividadRepository,
    private readonly catEstatusActividadRepository: CatEstatusActividadRepository,
    private readonly admUsuarioRepository: AdmUsuarioRepository,
    private readonly catPerfilRepository: CatPerfilRepository,
  ) {}

  async actividadbyid(data: any) {
    //Validamos si existe una actividad ya registrada retorna la actividad de solicitud
    const actividad = await this.workflowConsultarRepository.findByIdActividad(
      data.idActividad,
    );
    if (actividad.length == 0)
      return {
        success: true,
        // message: this.i18n.translate('general.INFORMACION_NO_EXISTENTE', { lang: data.lang }),
        message: 'INFORMACION_NO_EXISTENTE',
        data: actividad.find((x) => x.actividad == EKycActividad.SOLICITUD),
      };

    return {
      success: true,
      // message: this.i18n.translate('general.INFORMACION_GUARDADA', { lang: data.lang }),
      message: 'INFORMACION_GUARDADA',
      data: actividad,
    };
  }

  async actividadbyFolio(data: any) {
    //REVIEW
    const actividad = await this.workflowConsultarRepository.findByFolio(
      data.folio,
      data.actividad,
      data.proyecto,
    );
    data.proyecto = new Types.ObjectId(data.proyecto);
    if (actividad.length == 0)
      return {
        success: true,
        // message: this.i18n.translate('general.INFORMACION_NO_EXISTENTE', { lang: data.lang }),
        message: 'INFORMACION_NO_EXISTENTE',
        data: actividad.find((x) => x.actividad == EKycActividad.SOLICITUD),
      };
    return {
      success: true,
      data: actividad,
    };
  }

  async actividadesByFolio(data: any): Promise<ResponseDto> {
    const actividades =
      await this.workflowConsultarRepository.findActividadesByFolio(
        data.folio,
        data.proyecto,
      );

    if (!actividades)
      return DefaultResponse.sendNotFound(
        '',
        this.i18n.translate('workflow.VALIDATIONS.NOT_FOUND.ACTIVIDADES', {
          lang: 'es',
        }),
      ); //REVIEW

    return DefaultResponse.sendOk('', actividades);
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
}
