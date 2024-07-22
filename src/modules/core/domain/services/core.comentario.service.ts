import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { CoreComentarioRepository } from '../../persistence/repository/core.comentario.repository';
import {
  CoreActividadesDetalleDto,
  CoreComentarioActividadDto,
  CoreComentarioDto,
} from '../helpers/dto/core.comentario.dto';
import { EComentario } from '../helpers/enum/core.comentario';
import {CoreFolioReportService} from "./core.folio-report.service";

@Controller()
export class CoreComentarioService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly coreComentarioRepository: CoreComentarioRepository,
    private readonly coreFolioReportService: CoreFolioReportService,

  ) { }

  async create(payload: {
    data: CoreComentarioDto;
    lang: string;
  }): Promise<ResponseDto> {
    const find = await this.coreComentarioRepository.findByFolioActividad(
      payload.data.folio.toString(),
    );

    payload.data.bitacora = payload.data.bitacora
      ? new Types.ObjectId(payload.data.bitacora)
      : null;

    payload.data.folio = new Types.ObjectId(payload.data.folio);

    if (find.length === 0) {
      const formatActividades: CoreComentarioActividadDto = {
        folio: payload.data.folio,
        actividades: [
          {
            bitacora: payload.data.bitacora ?? null,
            comentarios: payload.data.comentarios,
            actividad: payload.data.actividad,
            fecha: new Date(),
          },
        ],
      };
      const response = await this.coreComentarioRepository.create(
        formatActividades,
      );
      await this.coreFolioReportService.updateComentario(payload.data.folio.toString());

      return DefaultResponse.sendOk(
        this.i18n.translate('all.MESSAGES.ERROR.SAVED', {
          lang: payload.lang,
        }),
        response,
      );
    }

    const nuevoRegistro: CoreActividadesDetalleDto = {
      bitacora: payload.data.bitacora ?? null,
      comentarios: payload.data.comentarios,
      actividad: payload.data.actividad,
      fecha: new Date(),
    };

    let response = await this.coreComentarioRepository.updateNewObjet(
      payload.data.folio,
      nuevoRegistro,
    );

    if (payload.data.bitacora) {
      response = await this.coreComentarioRepository.updateNull(
        payload.data.folio,
        payload.data.bitacora,
      );
    }

    return DefaultResponse.sendOk(
      this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      response,
    );
  }

  async findAll(payload: {
    folio: string;
    actividad?: number;
    lang?: string;
  }): Promise<ResponseDto> {
    const data = await this.coreComentarioRepository.findByFolioActividad(
      payload.folio,
    );

    if (data.length === 0)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: payload.lang,
        }),
      );

    data[0].actividades.sort((a: any, b: any) => b.fecha - a.fecha);

    return DefaultResponse.sendOk('', data);
  }

  async findOne(payload: { folio: string; actividad: string; lang: string }) {
    let data = await this.coreComentarioRepository.findOne(
      payload.folio,
      parseInt(payload.actividad, 10),
    );

    if (data.length > 0)
      if (data[0] && data[0].actividades.comentarios === EComentario.BITACORA_TRANSICION ||
        [EComentario.SIN_COMENTARIOS, EComentario.AVANZADO_DESDE_PORTAL].includes(data[0].actividades.comentarios))
        data = [];

    return DefaultResponse.sendOk('', data);
  }

  async update(payload: { data: any; idFolio: string; lang: string }) {
    const updated = await this.coreComentarioRepository.update(
      payload.data.folio,
      payload.data.actividades.comentarios,
    );
    await this.coreFolioReportService.updateComentario(payload.data.folio);
    return { success: true, message: '', data: updated };
  }
}
