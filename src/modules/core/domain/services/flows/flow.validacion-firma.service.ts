import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { FlowValidacionFirmaRepository } from 'src/modules/core/persistence/repository/flows/flow.validacion-firma.repository';
import { FlowValidacionFirmaArchivoDto, FlowValidacionFirmaDto } from '../../helpers/dto/flows/flow.validacion-firma.dto';

@Controller()
export class FlowValidacionFirmaService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly validacionFirmasService: FlowValidacionFirmaRepository,
  ) { }

  //FIXME: RMQServices_Core.VALIDACION_FIRMAS.create
  async create(payload: {
    body: FlowValidacionFirmaDto;
    lang: string;
  }): Promise<ResponseDto> {

    let listArchivo: Array<FlowValidacionFirmaArchivoDto> = []

    for (const file of payload.body.archivos) {

      const archivo: FlowValidacionFirmaArchivoDto = {
        correcto: file.correcto ?? false,
        documento: new Types.ObjectId(file.documento),
        expediente: new Types.ObjectId(file.expediente),
        motivo: file.motivo
      }
      listArchivo.push(archivo);
    }

    payload.body.folio = new Types.ObjectId(payload.body.folio);
    payload.body.archivos = listArchivo;

    const find: any = await this.validacionFirmasService.findOne(payload.body.folio.toString());

    if (find) {
      await this.validacionFirmasService.update(find._id, payload.body);
    } else {
      await this.validacionFirmasService.create(payload.body);
    }

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      '',
    );
  }

  //FIXME: RMQServices_Core.VALIDACION_FIRMAS.getCatalogosToCreate
  async getCatalogosToCreate(payload: {
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.STATUS_CODE.401', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk('', []);
  }

  //FIXME: RMQServices_Core.VALIDACION_FIRMAS.findOneToEdit
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

    const dataValidacion = await this.validacionFirmasService.findOne(
      payload.id,
    );

    return DefaultResponse.sendOk('', dataValidacion);
  }

  //FIXME: RMQServices_Core.VALIDACION_FIRMAS.update
  async update(payload: {
    id: any;
    data: FlowValidacionFirmaDto;
    lang: string;
  }): Promise<ResponseDto> {

    let listArchivo: Array<FlowValidacionFirmaArchivoDto> = []

    for (const file of payload.data.archivos) {

      const archivo: FlowValidacionFirmaArchivoDto = {
        correcto: file.correcto ?? false,
        documento: new Types.ObjectId(file.documento),
        expediente: new Types.ObjectId(file.expediente),
        motivo: file.motivo
      }
      listArchivo.push(archivo);
    }

    payload.data.folio = new Types.ObjectId(payload.data.folio);
    payload.data.archivos = listArchivo;

    const updated = await this.validacionFirmasService.update(
      payload.id.id,
      payload.data,
    );

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }
}
