import { InjectModel } from '@nestjs/mongoose';
import { CoreFolio, CoreFolioDocument } from '../database/core.folio.schema';
import { ModelExt } from '../../../../app/utils/extensions/model.extension';
import { Injectable } from '@nestjs/common';
import REPORTE_SEGUIMIENTO from '../query/reporte-seguimiento.query';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment-timezone';
import { ReporteSeguimientoType } from '../../domain/helpers/interfaces/reporte-seguimiento.interface';
import { ReporteSeguimiento } from '../../domain/model/reporte-seguimiento.model';

@Injectable()
export class CoreReportRepository {
  constructor(
    @InjectModel(CoreFolio.name)
    private readonly coreFolioModel: ModelExt<CoreFolioDocument>,
    private readonly configService: ConfigService,
  ) {}

  async reportSeguimiento(fechaStart: string, fechaFin: string) {
    const timezone = this.configService.get<string>('MSH_TIME_ZONE');
    const fechaInicial = moment
      .tz(fechaStart.substring(0, 10), timezone)
      .startOf('day');

    const fechaFinal = moment
      .tz(fechaFin.substring(0, 10), timezone)
      .endOf('day');

    const result: ReporteSeguimientoType[] = await this.coreFolioModel
      .aggregate([
        {
          $match: {
            fechaAlta: {
              $gte: new Date(`${fechaInicial.toISOString()}`),
              $lt: new Date(`${fechaFinal.toISOString()}`),
            },
          },
        },
        ...REPORTE_SEGUIMIENTO,
      ])
      .exec();

    return result.map((v) => {
      const reporte = new ReporteSeguimiento(v);
      return reporte.getDataToExcel();
    });
  }
}
