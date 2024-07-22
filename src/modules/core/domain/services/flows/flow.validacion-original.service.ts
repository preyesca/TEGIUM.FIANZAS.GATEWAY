import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { FlowValidacionOriginalRepository } from 'src/modules/core/persistence/repository/flows/flow.validacion-original.repository';
import { FlowValidacionOriginalesArchivoDto, FlowValidacionOriginalesCreateDto } from '../../helpers/dto/flows/flow.validacion-original.dto';

@Controller()
export class FlowValidacionOriginalService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly flowValidacionOriginalRepository: FlowValidacionOriginalRepository,
  ) { }

  //FIXME: RMQServices_Core.VALIDACION_ORIGINALES.create
  async create(payload: {
    body: FlowValidacionOriginalesCreateDto;
    lang: string;
  }): Promise<ResponseDto> {

    let listArchivo: Array<FlowValidacionOriginalesArchivoDto> = []

    for (const file of payload.body.archivos) {

      const archivo: FlowValidacionOriginalesArchivoDto = {
        correcto: file.correcto ?? false,
        documento: new Types.ObjectId(file.documento),
        expediente: new Types.ObjectId(file.expediente),
        motivo: file.motivo
      }
      listArchivo.push(archivo);
    }

    payload.body.folio = new Types.ObjectId(payload.body.folio);
    payload.body.archivos = listArchivo;

    const find: any = await this.flowValidacionOriginalRepository.findOne(payload.body.folio.toString());

    if (find) {
      await this.flowValidacionOriginalRepository.update(find._id, payload.body);
    } else {
      await this.flowValidacionOriginalRepository.create(payload.body);
    }

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      '',
    );
  }

  //RMQServices_Core.VALIDACION_ORIGINALES.getCatalogosToCreate
  async getCatalogosToCreate(payload: {
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.JWTOKEN.ERROR.USUARIO', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk('', []);
  }

  // RMQServices_Core.VALIDACION_ORIGINALES.findOneToEdit
  async findOneToEdit(payload: {
    id: string;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.JWTOKEN.ERROR.USUARIO', {
          lang: payload.lang,
        }),
      );

    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const dataValidacion = await this.flowValidacionOriginalRepository.findOne(
      payload.id,
    );

    return DefaultResponse.sendOk('', dataValidacion);
  }

  // RMQServices_Core.VALIDACION_ORIGINALES.update
  async update(payload: {
    id: any;
    data: FlowValidacionOriginalesCreateDto;
    lang: string;
  }) {
    let listArchivo: Array<FlowValidacionOriginalesArchivoDto> = []

    for (const file of payload.data.archivos) {

      const archivo: FlowValidacionOriginalesArchivoDto = {
        correcto: file.correcto ?? false,
        documento: new Types.ObjectId(file.documento),
        expediente: new Types.ObjectId(file.expediente),
        motivo: file.motivo
      }
      listArchivo.push(archivo);
    }

    payload.data.folio = new Types.ObjectId(payload.data.folio);
    payload.data.archivos = listArchivo;
    
    const updated = await this.flowValidacionOriginalRepository.update(
      payload.id.id,
      payload.data,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }
}
