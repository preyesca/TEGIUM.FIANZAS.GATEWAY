import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { CatTipoPersonaRepository } from 'src/modules/catalogo/persistence/repository/cat.tipo-persona.repository';
import { CoreFolioRepository } from 'src/modules/core/persistence/repository/core.folio.repository';
import { FlowListaNegraRepository } from 'src/modules/core/persistence/repository/flows/flow.lista-negra.repository';
import { WorkflowActividadRepository } from 'src/modules/workflow/persistence/repository/workflow.actividad.repository';
import {
  FlowCreateFoliosAutorizadosDto,
  FlowFoliosAutorizadosDto,
} from '../../helpers/dto/flows/flow.lista-negra.dto';

@Controller()
export class FlowListaNegraService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly catTipoPersonaRepository: CatTipoPersonaRepository,
    private readonly flowActividadRepository: WorkflowActividadRepository,
    private readonly flowListaNegroRepository: FlowListaNegraRepository,
  ) {}

  // RMQServices_Core.LISTA_NEGRA.findAll
  async findAll(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }) {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.JWTOKEN.ERROR.USUARIO', {
          lang: payload.lang,
        }),
      );

    let foliosMultisistemaPaginated = [];

    if (payload.paginateParams.search != '') {
      const foliosData = await this.coreFolioRepository.selectByProyecto(
        payload.paginateParams,
        payload.session.proyecto,
      );

      foliosMultisistemaPaginated = [
        ...new Set(
          foliosData?.map(({ folioMultisistema }) => folioMultisistema),
        ),
      ];
    }

    const workflowResult = await this.flowActividadRepository.findAllListaNegra(
      payload.paginateParams,
      payload.session,
      foliosMultisistemaPaginated,
    );

    if (!workflowResult) return DefaultResponse.sendOk('', []);

    const foliosMultisistema = [
      ...new Set(
        workflowResult?.docs.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];

    const foliosAgregate = await this.coreFolioRepository.selectInByFolioFilter(
      foliosMultisistema,
      payload.paginateParams,
      payload.session.proyecto,
    );

    workflowResult.docs = workflowResult.docs.filter(
      (x: any) =>
        foliosAgregate.find(
          (f) => f.folioMultisistema === x.folioMultisistema,
        ) !== undefined,
    );

    const listTipoPersonaClave = [
      ...new Set(
        foliosAgregate.map((item) => item.titular.tipoPersona.toString()),
      ),
    ];

    const listFoliosId = [
      ...new Set(foliosAgregate.map(({ _id }) => _id.toString())),
    ];

    const listFoliosOrderByFecha =
      await this.flowListaNegroRepository.selectFolios(listFoliosId);

    const listFolios = [];

    listFoliosOrderByFecha.map((item) => {
      listFolios.push({
        folio: item.folio.toString(),
        autorizado: item.result[item.result.length - 1].autorizado,
      });
    });

    const tipoPersonaCatalogo =
      await this.catTipoPersonaRepository.selectInByClave(listTipoPersonaClave);

    const listSetFolios = foliosAgregate.map((x) => {
      const tipoPersona = tipoPersonaCatalogo?.find(
        (r: any) => r.clave === x.titular.tipoPersona,
      );

      return {
        id: x._id,
        folioMultisistema: x.folioMultisistema,
        folioCliente: x.folioCliente,
        tipoPersona: tipoPersona?.descripcion,
        pais: x.pais,
        cliente: x.titular.nombre,
      };
    });

    workflowResult.docs = workflowResult.docs.map((x) => {
      const folioFilter = listSetFolios.find(
        (r) =>
          r.folioMultisistema.toString() === x.folioMultisistema.toString(),
      );

      return {
        folio: folioFilter.id,
        folioCodigo: folioFilter.folioCliente,
        tipoPersona: folioFilter.tipoPersona,
        pais: folioFilter.pais,
        nombre: folioFilter.cliente,
        changeAutorizar: listFolios.find(
          (x) => x.folio === folioFilter.id.toString(),
        )?.autorizado,
      };
    });

    return DefaultResponse.sendOk('', workflowResult);
  }

  // RMQServices_Core.LISTA_NEGRA.create
  async create(payload: {
    body: FlowFoliosAutorizadosDto;
    session: SessionTokenDto;
    lang: string;
  }) {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.JWTOKEN.ERROR.USUARIO', {
          lang: payload.lang,
        }),
      );

    for (const folio of payload.body.folios) {
      const historial = [
        {
          usuario: new Types.ObjectId(payload.session.usuario),
          autorizado: folio.autorizado,
          fecha: new Date(),
        },
      ];

      const existFolio = await this.flowListaNegroRepository.findOne(
        folio.folio.toString(),
      );
      const create: FlowCreateFoliosAutorizadosDto = {
        folio: new Types.ObjectId(folio.folio),
        folioCliente: folio.folioCliente,
        historial: historial,
      };

      if (!existFolio) {
        await this.flowListaNegroRepository.create(create);
      } else {
        await this.flowListaNegroRepository.update(
          folio.folio.toString(),
          historial[0],
        );
      }
    }

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      '',
    );
  }

  // RMQServices_Core.LISTA_NEGRA.findOne
  async findOne(payload: { id: string; lang: string }) {
    let resultFolio = [];
    const findFolio =
      await this.flowListaNegroRepository.findOneFolioOrderByFecha(payload.id);

    if (findFolio.length > 0) {
      findFolio.map((item) => {
        resultFolio.push({
          autorizado: item.result[item.result.length - 1].autorizado,
        });
      });
    } else {
      resultFolio.push({ autorizado: false });
    }

    return DefaultResponse.sendOk('', resultFolio);
  }
}
