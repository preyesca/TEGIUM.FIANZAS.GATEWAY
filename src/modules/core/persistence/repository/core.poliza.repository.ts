import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CorePolizaDto } from '../../domain/helpers/dto/core.poliza.dto';
import { CorePoliza, CorePolizaDocument } from '../database/core.poliza.schema';

@Injectable()
export class CorePolizaRepository {
  constructor(
    @InjectModel(CorePoliza.name)
    private readonly corePolizaModel: Model<CorePolizaDocument>,
  ) {}

  async create(createDto: CorePolizaDto): Promise<CorePoliza> {
    const created = new this.corePolizaModel(createDto);
    return await created.save();
  }

  async selectAllByFolios(
    folios: Array<Types.ObjectId>,
  ): Promise<Array<CorePoliza>> {
    return await this.corePolizaModel.find({ folio: { $in: folios } }).exec();
  }

  async selectInByFolio(data: any) {
    const array: Types.ObjectId[] = [];

    data.forEach((element) => {
      array.push(new Types.ObjectId(element));
    });

    const query: any[] = [
      {
        $match: {
          folio: { $in: array },
        },
      },
      {
        $project: {
          aseguradora: 1,
          riesgo: 1,
          folio: 1,
          unidad: 1,
        },
      },
    ];
    return await this.corePolizaModel.aggregate(query);
  }

  async findOneByFolio(folio: string): Promise<CorePoliza> {
    return await this.corePolizaModel
      .findOne({ folio: new Types.ObjectId(folio) })
      .exec();
  }
}
