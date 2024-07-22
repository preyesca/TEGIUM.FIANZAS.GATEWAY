import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import {
  FlowCreateFoliosAutorizadosDto,
  FlowHistorialDto,
} from 'src/modules/core/domain/helpers/dto/flows/flow.lista-negra.dto';
import {
  FlowListaNegra,
  FlowListaNegraDocument,
} from '../../database/flows/flow-lista-negra.schema';

@Injectable()
export class FlowListaNegraRepository {
  constructor(
    @InjectModel(FlowListaNegra.name)
    private readonly model: ModelExt<FlowListaNegraDocument>,
  ) {}

  async create(data: FlowCreateFoliosAutorizadosDto) {
    const created = new this.model(data);
    return await created.save();
  }

  async findOne(id: string) {
    return await this.model.findOne({ folio: new Types.ObjectId(id) }).exec();
  }

  async update(id: string, data: FlowHistorialDto) {
    return await this.model
      .updateOne(
        { folio: new Types.ObjectId(id) },
        {
          $addToSet: {
            historial: {
              usuario: new Types.ObjectId(data.usuario),
              autorizado: data.autorizado,
              fecha: data.fecha,
            },
          },
        },
      )
      .exec();
  }

  async selectFolios(data: string[]) {
    const array: Types.ObjectId[] = [];

    data.forEach((element) => {
      array.push(new Types.ObjectId(element));
    });

    return await this.model.aggregate([
      {
        $match: { folio: { $in: array } },
      },
      {
        $project: {
          folio: 1,
          result: {
            $sortArray: {
              input: '$historial',
              sortBy: { fecha: 1 },
            },
          },
        },
      },
    ]);
  }

  async findOneFolioOrderByFecha(folio: string) {
    return await this.model.aggregate([
      {
        $match: { folio: new Types.ObjectId(folio) },
      },
      {
        $project: {
          folio: 1,
          result: {
            $sortArray: {
              input: '$historial',
              sortBy: { fecha: 1 },
            },
          },
        },
      },
    ]);
  }
}
