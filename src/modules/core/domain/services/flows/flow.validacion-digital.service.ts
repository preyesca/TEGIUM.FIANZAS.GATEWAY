import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { FlowValidacionDigitalRepository } from 'src/modules/core/persistence/repository/flows/flow.validacion-digital.repository';
import { FlowValidacionDigitalArchivoDto, FlowValidacionDigitalDto } from '../../helpers/dto/flows/flow.validacion-digital.dto';
import {CoreFolioReportService} from "../core.folio-report.service";

@Controller()
export class FlowValidacionDigitalService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly flowValidacionDigitalRepository: FlowValidacionDigitalRepository,
    private readonly coreFolioReportService: CoreFolioReportService,

  ) { }

  //FIXME: RMQServices_Core.VALIDACION_DIGITAL.create
  async create(payload: {
    body: FlowValidacionDigitalDto;
    lang: string;
  }): Promise<ResponseDto> {

    let listArchivo: Array<FlowValidacionDigitalArchivoDto> = []

    for (const file of payload.body.archivos) {

      const archivo: FlowValidacionDigitalArchivoDto = {
        correcto: file.correcto ?? false,
        documento: new Types.ObjectId(file.documento),
        expediente: new Types.ObjectId(file.expediente),
        motivo: file.motivo
      }

      if (file.fechaVigencia)
        archivo.fechaVigencia = file.fechaVigencia

      listArchivo.push(archivo);
    }

    payload.body.folio = new Types.ObjectId(payload.body.folio);
    payload.body.archivos = listArchivo;


    const find: any = await this.flowValidacionDigitalRepository.findOne(payload.body.folio.toString());

    if (find) {
      await this.flowValidacionDigitalRepository.update(find._id, payload.body);
    } else {
      await this.flowValidacionDigitalRepository.create(payload.body);
    }

    await this.coreFolioReportService.updateFlowValidacionDocumental(
        payload.body.folio.toString(),
    );
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      '',
    );
  }

  //FIXME: RMQServices_Core.VALIDACION_DIGITAL.getCatalogosToCreate
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

  //FIXME: RMQServices_Core.VALIDACION_DIGITAL.findOneToEdit
  async findOneToEdit(payload: {
    id: string;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const dataValidacion = await this.flowValidacionDigitalRepository.findOne(
      payload.id,
    );

    return DefaultResponse.sendOk('', dataValidacion);
  }

  //FIXME: RMQServices_Core.VALIDACION_DIGITAL.update
  async update(payload: {
    id: any;
    data: FlowValidacionDigitalDto;
    lang: string;
  }): Promise<ResponseDto> {

    let listArchivo: Array<FlowValidacionDigitalArchivoDto> = []

    for (const file of payload.data.archivos) {

      const archivo: FlowValidacionDigitalArchivoDto = {
        correcto: file.correcto ?? false,
        documento: new Types.ObjectId(file.documento),
        expediente: new Types.ObjectId(file.expediente),
        motivo: file.motivo
      }

      if (file.fechaVigencia)
        archivo.fechaVigencia = file.fechaVigencia

      listArchivo.push(archivo);
    }

    payload.data.folio = new Types.ObjectId(payload.data.folio);
    payload.data.archivos = listArchivo;

    const updated = await this.flowValidacionDigitalRepository.update(
      payload.id.id,
      payload.data,
    );
    await this.coreFolioReportService.updateFlowValidacionDocumental(
        payload.data.folio.toString(),
    );
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }
}
