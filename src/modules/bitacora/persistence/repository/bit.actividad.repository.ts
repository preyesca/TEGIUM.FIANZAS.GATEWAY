import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { BitActividadDto } from '../../domain/dto/bit.actividad.dto';
import {
  BitActividad,
  BitActividadDocument,
} from '../database/bit.actividad.schema';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';

@Injectable()
export class BitActividadRepository {
  constructor(
    @InjectModel(BitActividad.name)
    private actividadModel: ModelExt<BitActividadDocument>,
  ) {}

  async selectAll(paginate: any) {
    return await this.actividadModel.paginate({}, paginate);
  }

  async create(data: BitActividadDto) {
    const created = new this.actividadModel(data);
    return await created.save();
  }

  async selectByFolio(idFolio: string, paginate: any) {
    return await this.actividadModel.paginate(
      { folio: new Types.ObjectId(idFolio) },
      paginate,
    );
  }

  async selectByFolioForDetalle(idFolio: Types.ObjectId, paginate: IPaginateParams) {

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };
    
    let agregateData: any[] = [
      {
        $match: {
          $or: [
            { folio: { $eq:idFolio} },
          ],
        },
      },
    ];

    if (paginate.order && paginate.sort) {
      options.sort = {
        [paginate.order]: paginate.sort,
      };
    }

    const agregate = this.actividadModel.aggregate(agregateData, {
      collation: { locale: 'en' },
    });

    return await this.actividadModel.aggregatePaginate(
      agregate,
      options,
    );
  }

  async selectLastStatusByFolio(folio: string): Promise<BitActividad> {
    return await this.actividadModel
      .findOne({ folio: new Types.ObjectId(folio), actividad: { $ne: 9 } })
      .sort({ fecha: -1 })
      .select('estatusBitacora')
      .exec();
  }

  async findOne(id: string): Promise<BitActividad> {
    return await this.actividadModel.findById(id).exec();
  }

  async selectInByFoliosBandeja(folios: string[]) {
    const array: Types.ObjectId[] = [];

    folios.forEach((element) => {
      array.push(new Types.ObjectId(element));
    });

    return await this.actividadModel.aggregate([
      {
        $match: { folio: { $in: array } },
      },
      {
        $sort: { fecha: 1 },
      },
      {
        $group: {
          _id: {
            folio: '$folio',
          },
          actividades: {
            $last: '$$ROOT',
          },
        },
      },
      { $unset: '_id' },
    ]);
  }
}
