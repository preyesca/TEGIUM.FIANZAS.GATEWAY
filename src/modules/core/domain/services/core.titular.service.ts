import { Controller } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { WorkflowActividadRepository } from 'src/modules/workflow/persistence/repository/workflow.actividad.repository';
import { CoreTitular } from '../../persistence/database/core.titular.schema';
import { CoreFolioRepository } from '../../persistence/repository/core.folio.repository';
import { CoreTitularRepository } from '../../persistence/repository/core.titular.repository';

@Controller()
export class CoreTitularService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly coreTitularRepository: CoreTitularRepository,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly flowWorkflowRepository: WorkflowActividadRepository,
  ) {}

  //FIXME: RMQServices_Core.TITULAR.findAllByPais
  async findAllTitularesByProyecto(payload: {
    proyecto: string;
  }): Promise<CoreTitular[]> {
    return await this.coreTitularRepository.findAllTitularesByProyecto(
      payload.proyecto,
    );
  }

  //FIXME RMQServices_Core.TITULAR.findAll
  async findAll(): Promise<ResponseDto> {
    const data = await this.coreTitularRepository.findAll();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME_ RMQServices_Core.TITULAR.findOne
  async findOne(payload: {
    titular: string;
    lang: string;
  }): Promise<CoreTitular> {
    return await this.coreTitularRepository.findOne(payload.titular);
  }

  //FIXME: RMQServices_Core.TITULAR.findByProyectoSolicitudes
  async findByProyectoSolicitudes(payload: {
    paginate: any;
    session: SessionTokenDto;
    lang: string;
  }) {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    const workflowResult =
      await this.flowWorkflowRepository.findSolicitudByProyecto(
        payload.paginate,
        payload.session,
      );

    if (!workflowResult?.docs)
      return DefaultResponse.sendOk(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
        [],
      );

    const foliosMultisistema = [
      ...new Set(
        workflowResult?.docs.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];

    const foliosAgregate = await this.coreFolioRepository.selectInByFolioFilter(
      foliosMultisistema,
      payload.paginate,
      payload.session.proyecto,
    );

    let titulares: any[] = [];
    workflowResult?.docs.forEach((element: any) => {
      const folio = foliosAgregate.find(
        (p) => p.folioMultisistema === element.folioMultisistema,
      );
      const existe = titulares.find((y) => y.numeroCliente === folio.titular.numeroCliente);
      if(!existe) {  
        titulares.push({
          numeroCliente: folio.titular.numeroCliente,
          cliente: folio.titular.nombre,
          cliente_id: folio.titular._id,
        });
      }
    });

    workflowResult.docs = titulares;
    return DefaultResponse.sendOk('', workflowResult );
  }
}
