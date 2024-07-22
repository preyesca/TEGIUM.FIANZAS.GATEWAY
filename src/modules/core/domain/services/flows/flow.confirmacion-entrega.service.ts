import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { FlowConfirmacionEntregaRepository } from 'src/modules/core/persistence/repository/flows/flow.confirmacion-entrega.repository';
import { FlowConfirmacionEntregaDto } from '../../helpers/dto/flows/flow.confirmacion-entrega.dto';

@Controller()
export class FlowConfirmacionEntregaService {
  constructor(
    private readonly flowConfirmacionEntregaRepository: FlowConfirmacionEntregaRepository,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  //REVIEW: RMQServices_Core.CONFIRMACION_ENTREGA.create
  async create(payload: {
    body: FlowConfirmacionEntregaDto;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    const { body, lang } = payload;

    body.folio = new Types.ObjectId(body.folio);

    if (body.archivos) {

      if (body.archivos[0].expediente) {
        body.archivos[0].expediente = new Types.ObjectId(body.archivos[0].expediente)
      }

      if (body.archivos[0].usuarioAlta) {
        body.archivos[0].usuarioAlta = new Types.ObjectId(body.archivos[0].usuarioAlta)
      }

    }
    const created = await this.flowConfirmacionEntregaRepository.create(body);

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang,
      }),
      created,
    );
  }

  //FIXME: RMQServices_Core.CONFIRMACION_ENTREGA.findOneToEdit
  async findOneToEdit(payload: {
    id: string;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const dataValidacion = await this.flowConfirmacionEntregaRepository.findOne(
      payload.id,
    );

    return DefaultResponse.sendOk('', dataValidacion);
  }

  //FIXME: RMQServices_Core.CONFIRMACION_ENTREGA.update
  async update(payload: {
    id: any;
    data: FlowConfirmacionEntregaDto;
    lang: string;
  }) {
    const { data } = payload;

    payload.id.id = new Types.ObjectId(payload.id.id);
    payload.data.folio = new Types.ObjectId(payload.data.folio);

    if (data.archivos) {

      if (data.archivos[0].expediente) {
        data.archivos[0].expediente = new Types.ObjectId(data.archivos[0].expediente)
      }

      if (data.archivos[0].usuarioAlta) {
        data.archivos[0].usuarioAlta = new Types.ObjectId(data.archivos[0].usuarioAlta)
      }

    }
    const updated = await this.flowConfirmacionEntregaRepository.update(
      payload.id.id,
      payload.data,
    );
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }
}
