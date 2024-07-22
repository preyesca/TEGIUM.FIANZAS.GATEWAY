import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { TokenValidator } from 'src/app/utils/validators/token.validator';
import { FlowFirmaClienteRepository } from '../../../persistence/repository/flows/flow.firma-cliente.repository';
import { FlowFirmaClienteArchivosDto, FlowFirmaClienteDto } from '../../helpers/dto/flows/flow.firma-cliente.dto';

@Controller()
export class FlowFirmaClienteService {
  constructor(
    private readonly firmaClienteService: FlowFirmaClienteRepository,
    private i18n: I18nService<I18nTranslations>,
  ) {}

  async create(payload: {
    body: FlowFirmaClienteDto;
    lang: string;
  }): Promise<ResponseDto> {
 
    payload.body.folio = new Types.ObjectId(payload.body.folio);

    if (!payload.body.archivoFic) {
      payload.body.archivoFic = null
    } else {
      payload.body.archivoFic = new Types.ObjectId(payload.body.archivoFic);
    }

    if (!payload.body.archivoAnexo) {
      payload.body.archivoAnexo = null
    } else {
      payload.body.archivoAnexo = new Types.ObjectId(payload.body.archivoAnexo);
    }

    const created = await this.firmaClienteService.create(payload.body);

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

    const dataValidacion = await this.firmaClienteService.findOne(payload.id);

    return DefaultResponse.sendOk('', dataValidacion);
  }

  async update(payload: { id: any; data: FlowFirmaClienteDto; lang: string }) {
    payload.id.id = new Types.ObjectId(payload.id.id);
    payload.data.folio = new Types.ObjectId(payload.data.folio);


    let listArchivo: Array<FlowFirmaClienteArchivosDto> = [];

    if (!payload.data.archivoFic) {
      payload.data.archivoFic = null
    } else {
      payload.data.archivoFic = new Types.ObjectId(payload.data.archivoFic);
    }

    if (!payload.data.archivoAnexo) {
      payload.data.archivoAnexo = null
    } else {
      payload.data.archivoAnexo = new Types.ObjectId(payload.data.archivoAnexo);
    }

    if (payload.data.archivos) {
      payload.data.archivos.forEach(archivo => {
        const newArchivo: FlowFirmaClienteArchivosDto = {
          correcto: archivo.correcto ?? false,
          documento: new Types.ObjectId(archivo.documento),
          expediente: new Types.ObjectId(archivo.expediente),
          motivo: archivo.motivo,
        }
        listArchivo.push(newArchivo);
      });
      payload.data.archivos = listArchivo;
    }


    const updated = await this.firmaClienteService.update(
      payload.id.id,
      payload.data,
    );
    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }
}
