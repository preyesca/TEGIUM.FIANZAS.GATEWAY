import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import * as functionsDate from 'src/app/utils/moment/date.moment';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { AdmUsuarioRepository } from 'src/modules/administracion/persistence/repository/adm.usuario.repository';
import { CatEstatusContactoTelefonicoRepository } from 'src/modules/catalogo/persistence/repository/cat.estatus-contacto-telefonico.repository';
import { CatTipoLlamadaRepository } from 'src/modules/catalogo/persistence/repository/cat.tipo-llamada.repository';
import { CoreFolioRepository } from 'src/modules/core/persistence/repository/core.folio.repository';
import { CoreInformacionContactoRepository } from 'src/modules/core/persistence/repository/core.informacion-contacto.repository';
import { CoreTelefonoContactoRepository } from 'src/modules/core/persistence/repository/core.telefono-contacto.repository';

import { FlowContactoTelefonicoRepository } from 'src/modules/core/persistence/repository/flows/flow.contacto-telefonico.repository';
import { CoreInformacionContactoDto } from '../../helpers/dto/core.informacion-contacto.dto';
import { FlowContactoTelefonicoUpdateDto } from '../../helpers/dto/flows/flow.contacto-telefonico-update.dto';
import {
  FlowContactoTelefonicoDto,
  FlowInformacionTelefonicaDto,
} from '../../helpers/dto/flows/flow.contacto-telefonico.dto';
import { CoreComentarioService } from '../core.comentario.service';
import { WorkflowRepository } from 'src/modules/workflow/persistence/repository/workflow.repository';
import { WorkflowActividadRepository } from 'src/modules/workflow/persistence/repository/workflow.actividad.repository';
import { BitActividadRepository } from 'src/modules/bitacora/persistence/repository/bit.actividad.repository';
import { EstatusBitacoraConsts } from 'src/app/common/consts/core/estatus-bitacora.consts';
import { EEstatusActividad } from 'src/app/common/enum/estatus-actividad.enum';
import { EComentario } from '../../helpers/enum/core.comentario';
import {CoreFolioReportService} from "../core.folio-report.service";

@Controller()
export class FlowContactoTelefonicoService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly flowContactoTelefonicoRepository: FlowContactoTelefonicoRepository,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly coreFolioReportService: CoreFolioReportService,
    private readonly coreTelefonoContactoRepository: CoreTelefonoContactoRepository,
    private readonly coreInformacionContactoRepository: CoreInformacionContactoRepository,
    private readonly catEstatusContactoTelefonicoRepository: CatEstatusContactoTelefonicoRepository,
    private readonly catTipoLlamadaRepository: CatTipoLlamadaRepository,
    private readonly admUsuarioRepository: AdmUsuarioRepository,
    private readonly comentarioRepository: CoreComentarioService,
    private readonly workflowRepository: WorkflowRepository,
    private readonly flowWorklowRepository: WorkflowActividadRepository,
    private readonly bitacoraRepository: BitActividadRepository,
  ) { }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.findOneInformacionContacto
  async findOneInformacionContacto(payload: {
    id: string;
    lang: string;
  }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const contacto =
      await this.coreInformacionContactoRepository.findOneByFolio(payload.id);

    if (!contacto)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.INFORMACION_CONTACTO', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk('', contacto);
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.updateToBandejaProgramada,
  async updateToBandejaProgramada(payload: {
    folio: number;
    actividad: number;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {

    const informacionExistente =
      await this.workflowRepository.findByProyectoFolio(
        payload.session.proyecto,
        payload.folio.toString(),
      );

    let actividadActual: any = informacionExistente.find(
      (x) =>
        x.actividad == payload.actividad && x.fechaFinal == null,
    );

    if (!actividadActual) {
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );
    }

    const updated = await this.flowWorklowRepository.update(
      actividadActual._id,
      EEstatusActividad.PROGRAMADA,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
      updated,
    );
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.finalizaActividad
  async finalizaActividad(payload: {
    folioMultisistema: number;
    folio: string;
    actividad: number;
    comentario: string;
    session: SessionTokenDto;
    lang: string;
  }) {

    const informacionExistente =
      await this.workflowRepository.findByProyectoFolio(
        payload.session.proyecto,
        payload.folioMultisistema.toString(),
      );

    let actividades: any = informacionExistente.filter((x) => x.fechaFinal == null);

    if (actividades.length == 0) {
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );
    }

    await this.flowWorklowRepository.cancelar(
      actividades,
      payload.session.usuario,
    );

    for (let index = 0; index < actividades.length; index++) {

      const bitacora = await this.bitacoraRepository.create({
        folio: new Types.ObjectId(payload.folio),
        actividad: actividades[index].actividad,
        usuario: new Types.ObjectId(payload.session.usuario),
        estatusBitacora: EstatusBitacoraConsts.CANCELADO,
        comentario: '',
      });

      await this.comentarioRepository.create({
        data: {
          folio: new Types.ObjectId(payload.folio),
          bitacora: null,
          comentarios: payload.comentario,
          actividad: actividades[index].actividad,
        },
        lang: ''
      });

      await this.comentarioRepository.create({
        data: {
          folio: new Types.ObjectId(payload.folio),
          bitacora: bitacora._id,
          comentarios: EComentario.BITACORA_TRANSICION,
          actividad: actividades[index].actividad,
        },
        lang: ''
      });

    }

    await this.comentarioRepository.create({
      data: {
        folio: new Types.ObjectId(payload.folio),
        bitacora: null,
        comentarios: payload.comentario,
        actividad: actividades[0].actividad,
      },
      lang: ''
    });

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
      '',
    );
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.avanzarActividad
  async avanzarActividad(workflow: any): Promise<ResponseDto> {
    const workflowResult = <any>{}; //TEMP

    // const workflowResult = await lastValueFrom(
    //   this._clienteProxyWorkflow.send(
    //     RMQServices_WorkFlow.FLUJO.avanzar,
    //     workflow,
    //   ),
    // );

    if (!workflowResult.success) return workflowResult;
    return DefaultResponse.sendOk('', workflowResult);
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.createInformacionTelefonica,
  async createInformacionTelefonica(payload: {
    body: FlowInformacionTelefonicaDto;
    lang: string;
  }) {
    let data: FlowInformacionTelefonicaDto = {
      folio: new Types.ObjectId(payload.body.folio),
      telefono: payload.body.telefono,
      extensiones: payload.body.extensiones,
    };

    if (payload.body.id == '0') {
      const created = await this.coreTelefonoContactoRepository.create(data);
      return DefaultResponse.sendOk(
        this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
          lang: payload.lang,
        }),
        created,
      );
    }

    const updated = await this.coreTelefonoContactoRepository.update(
      payload.body.id,
      data,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
      updated,
    );
  }

  //
  //   RMQServices_Core.CONTACTO_TELEFONICO.updateInformacionContacto,
  // )
  async updateformacionContacto(payload: {
    id: string;
    body: CoreInformacionContactoDto;
    lang: string;
  }) {
    const contacto = await this.coreInformacionContactoRepository.findOne(
      payload.id,
    );

    if (!contacto)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.INFORMACION_CONTACTO', {
          lang: payload.lang,
        }),
      );

    const data: CoreInformacionContactoDto = {
      folio: new Types.ObjectId(payload.body.folio),
      correos: payload.body.correos,
      nombre: payload.body.nombre,
      tipo: payload.body.tipo,
    };

    const updated = await this.coreInformacionContactoRepository.update(
      payload.id,
      data,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
      updated,
    );
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.delete
  async delete(payload: { id: string; lang: string }): Promise<ResponseDto> {
    await this.coreTelefonoContactoRepository.delete(payload.id);

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.DELETED', {
        lang: payload.lang,
      }),
    );
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.findTelefonoCorrespondencia
  async findTelefonoCorrespondencia(payload: {
    id: string;
    lang: string;
  }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const telefonoCorrespondencia =
      await this.coreTelefonoContactoRepository.selectByFolio(payload.id);

    if (!telefonoCorrespondencia)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'core.VALIDATIONS.NOT_FOUND.TELEFONO_CORRESPONDENCIA',
          {
            lang: payload.lang,
          },
        ),
      );

    return DefaultResponse.sendOk('', telefonoCorrespondencia);
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.create
  async create(payload: {
    body: FlowContactoTelefonicoDto;
    session: SessionTokenDto;
    lang: string;
  }) {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    const folio = await this.coreFolioRepository.findOne(
      payload.body.folio.toString(),
    );

    if (!folio)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.FOLIO', {
          lang: payload.lang,
        }),
      );

    if (
      !(await this.catTipoLlamadaRepository.findOneByClave(
        payload.body.tipoLlamada,
      ))
    )
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.TIPO_LLAMADA', {
          lang: payload.lang,
        }),
      );

    const estatusContactoTelefonico =
      await this.catEstatusContactoTelefonicoRepository.findOneByClave(
        payload.body.estatus,
      );

    if (!estatusContactoTelefonico)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_CONTACTO_TELEFONICO',
          {
            lang: payload.lang,
          },
        ),
      );

    const getFechaProximaLlamada = functionsDate.getFechaProximaLlamada(
      estatusContactoTelefonico,
    );

    const contactoTelefonico: any = {
      tipoLlamada: payload.body.tipoLlamada,
      estatus: payload.body.estatus,
      observaciones: payload.body.observaciones,
      usuario: new Types.ObjectId(payload.session.usuario),
      folio: new Types.ObjectId(payload.body.folio),
      fechaProximaLlamada: getFechaProximaLlamada,
    };

    const created = await this.flowContactoTelefonicoRepository.create(
      contactoTelefonico,
    );
    await this.coreFolioReportService.updateContactoTelefonico(
        payload.body.folio.toString(),
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.findAll
  async findAll(payload: {
    paginateParams: IPaginateParams;
    folio: string;
    lang: string;
  }) {

    const contactoTelefonico =
      await this.flowContactoTelefonicoRepository.findAll(
        payload.folio,
        payload.paginateParams,
      );

    if (contactoTelefonico.docs.length == 0) {

      return DefaultResponse.sendOk(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
        [],
      );
    }

    const tipoLlamadaFiltro = [
      ...new Set(contactoTelefonico.docs.map(({ tipoLlamada }) => tipoLlamada)),
    ];

    const estatusLlamadaFiltro = [
      ...new Set(contactoTelefonico.docs.map(({ estatus }) => estatus)),
    ];

    const usuarioFiltro: any = [
      ...new Set(
        contactoTelefonico.docs.map(({ usuario }) => usuario.toString()),
      ),
    ];


    const [tiposLlamada, estatusContactos, usuarios]: [any, any, any] =
      await Promise.all([
        this.catTipoLlamadaRepository.selectInByClave(tipoLlamadaFiltro),
        this.catEstatusContactoTelefonicoRepository.selectInByClave(
          estatusLlamadaFiltro,
        ),
        this.admUsuarioRepository.selectIn(usuarioFiltro),
      ]);

    contactoTelefonico.docs = contactoTelefonico.docs.map((x) => {
      const { nombre, primerApellido } = usuarios.find(
        (u) => u._id.toString() == x.usuario.toString(),
      );
      const descripcion = tiposLlamada.find(
        (t) => t.clave == x.tipoLlamada,
      )?.descripcion;
      const estatus = estatusContactos.find(
        (t) => t.clave == x.estatus,
      )?.descripcion;

      return {
        fechaContacto: x.fechaContacto,
        usuario: `${nombre} ${primerApellido}`,
        tipoLlamada: descripcion,
        fechaProximaLlamada: x.fechaProximaLlamada,
        estatus,
        observaciones: x.observaciones,
      };
    });


    return DefaultResponse.sendOk('', contactoTelefonico);
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.findOne
  async findOne(payload: { id: string; lang: string }) {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const contactoTelefonico: any =
      await this.flowContactoTelefonicoRepository.findOne(payload.id);

    if (!contactoTelefonico)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.CONTACTO_TELEFONICO', {
          lang: payload.lang,
        }),
      );

    const [tipoLlamada, estatus, usuario] = await Promise.all([
      this.catTipoLlamadaRepository.findOneByClave(
        contactoTelefonico.tipoLlamada,
      ),
      this.catEstatusContactoTelefonicoRepository.findOneByClave(
        contactoTelefonico.estatus,
      ),
      this.admUsuarioRepository.findOne(contactoTelefonico.usuario.toString()),
    ]);

    contactoTelefonico.tipoLlamada = tipoLlamada.descripcion;
    contactoTelefonico.estatus = estatus.descripcion;
    contactoTelefonico.usuario =
      `${usuario.nombre} ${usuario.primerApellido} ${usuario.segundoApellido}`.trimEnd();

    return DefaultResponse.sendOk('', contactoTelefonico);
  }

  //FIXME: MessagePattern(RMQServices_Core.CONTACTO_TELEFONICO.update
  async update(payload: {
    id: string;
    data: FlowContactoTelefonicoUpdateDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    if (
      !(await this.catTipoLlamadaRepository.findOne(
        payload.data.tipoLlamada.toString(),
      ))
    )
      return DefaultResponse.sendNotFound(
        this.i18n.translate('catalogos.VALIDATIONS.NOT_FOUND.TIPO_LLAMADA', {
          lang: payload.lang,
        }),
      );

    const estatusContactoTelefonico =
      await this.catEstatusContactoTelefonicoRepository.findOne(
        payload.data.estatus.toString(),
      );

    if (!estatusContactoTelefonico)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_CONTACTO_TELEFONICO',
          {
            lang: payload.lang,
          },
        ),
      );

    const contactoTelefonico =
      await this.flowContactoTelefonicoRepository.findOne(payload.id);

    if (!contactoTelefonico)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.CONTACTO_TELEFONICO', {
          lang: payload.lang,
        }),
      );

    payload.data.fechaProximaLlamada = functionsDate.getFechaProximaLlamada(
      estatusContactoTelefonico,
    );

    const data = await this.flowContactoTelefonicoRepository.update(
      payload.id,
      payload.data,
    );
    await this.coreFolioReportService.updateContactoTelefonico(
        data.folio.toString(),
    );
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
        lang: payload.lang,
      }),
    );
  }

  //FIXME: RMQServices_Core.CONTACTO_TELEFONICO.findOneFechaByEstatus
  async selectFechaProximaLlamadaByEstatus(payload: {
    clave: number;
    lang: string;
  }) {
    const estatusContactoTelefonico =
      await this.catEstatusContactoTelefonicoRepository.findOneByClave(
        payload.clave,
      );

    if (!estatusContactoTelefonico)
      return DefaultResponse.sendNotFound(
        this.i18n.translate(
          'catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_CONTACTO_TELEFONICO',
          {
            lang: payload.lang,
          },
        ),
      );

    const fechaProximaLlamada = functionsDate.getFechaProximaLlamada(
      estatusContactoTelefonico,
    );

    return DefaultResponse.sendOk('', { fechaProximaLlamada });
  }
}
