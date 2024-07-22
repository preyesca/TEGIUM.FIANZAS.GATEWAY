import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { FlowFirmaEjecutivoRepository } from '../../../persistence/repository/flows/flow.firma-ejecutivo.repository';
import { FlowFirmaEjecutivoDto } from '../../helpers/dto/flows/flow.firma-ejecutivo.dto';

@Controller()
export class FlowFirmaEjecutivoService {
  constructor(
    private readonly firmaEjecutivoService: FlowFirmaEjecutivoRepository,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  async create(payload: {
    body: FlowFirmaEjecutivoDto;
    lang: string;
  }): Promise<ResponseDto> {
    payload.body.folio = new Types.ObjectId(payload.body.folio);
    const created = await this.firmaEjecutivoService.create(payload.body);

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  async getCatalogosToCreate(payload: {
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.JWTOKEN.ERROR', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk('', []);
  }

  async findOneToEdit(payload: {
    id: string;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.JWTOKEN.ERROR', {
          lang: payload.lang,
        }),
      );

    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const dataValidacion = await this.firmaEjecutivoService.findOne(payload.id);

    return DefaultResponse.sendOk('', dataValidacion);
  }

  async update(payload: {
    id: any;
    data: FlowFirmaEjecutivoDto;
    lang: string;
  }) {
    payload.id.id = new Types.ObjectId(payload.id.id);
    payload.data.folio = new Types.ObjectId(payload.data.folio);
    const updated = await this.firmaEjecutivoService.update(
      payload.id.id,
      payload.data,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }
}
