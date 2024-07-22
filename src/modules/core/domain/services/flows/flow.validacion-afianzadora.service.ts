import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
 
import { FlowValidacionAfianzadoraRepository } from 'src/modules/core/persistence/repository/flows/flow.validacion-afianzadora.repository';
import { FlowValidacionAfianzadoraArchivosDto, FlowValidacionAfianzadoraDto } from '../../helpers/dto/flows/flow.validacion-afianzadora.dto';

@Controller()
export class FlowValidacionAfianzadoraService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly flowValidacionAfianzadoraRepository: FlowValidacionAfianzadoraRepository,
  ) {}

  // RMQServices_Core.VALIDACION_AFIANZADORA.create
  async create(
    payload: { body: FlowValidacionAfianzadoraDto; lang: string },
  ): Promise<ResponseDto> {
  
    payload.body.folio = new Types.ObjectId(payload.body.folio);

    const created = await this.flowValidacionAfianzadoraRepository.create(payload.body);

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  // RMQServices_Core.VALIDACION_AFIANZADORA.getCatalogosToCreate
  async getCatalogosToCreate(
    payload: { session: SessionTokenDto; lang: string },
  ): Promise<ResponseDto> {
    if (!TokenValidator.isValid(payload.session))
      return DefaultResponse.sendUnauthorized(
        this.i18n.translate('server.JWTOKEN.ERROR.USUARIO', {
          lang: payload.lang,
        }),
      );

    return DefaultResponse.sendOk('', []);
  }

  // RMQServices_Core.VALIDACION_AFIANZADORA.findOneToEdit
  async findOneToEdit(
    payload: { id: string; session: SessionTokenDto; lang: string },
  ): Promise<ResponseDto> {

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

    const dataValidacion = await this.flowValidacionAfianzadoraRepository.findOne(payload.id);

    return DefaultResponse.sendOk('', dataValidacion);
  }

  // RMQServices_Core.VALIDACION_AFIANZADORA.update
  async update(
    payload: { id: any; data: FlowValidacionAfianzadoraDto; lang: string },
  ) {
    let listArchivo: Array<FlowValidacionAfianzadoraArchivosDto> = [];
    payload.id.id = new Types.ObjectId(payload.id.id)
    payload.data.folio = new Types.ObjectId(payload.data.folio)

    if (payload.data.archivos) {
      payload.data.archivos.forEach(archivo => {
        const newArchivo: FlowValidacionAfianzadoraArchivosDto = {
          correcto: archivo.correcto ?? false,
          documento: new Types.ObjectId(archivo.documento),
          expediente: new Types.ObjectId(archivo.expediente),
          motivo: archivo.motivo,
        }
        listArchivo.push(newArchivo);
      });
      payload.data.archivos = listArchivo;
    }

    const updated = await this.flowValidacionAfianzadoraRepository.update(
      payload.id.id,
      payload.data,
    );

    return DefaultResponse.sendOk(this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'), updated);
  }

}
