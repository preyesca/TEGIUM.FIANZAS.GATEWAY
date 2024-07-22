import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { FlowContactoTelefonicoUpdateDto } from 'src/modules/core/domain/helpers/dto/flows/flow.contacto-telefonico-update.dto';
import { FlowContactoTelefonicoDto } from 'src/modules/core/domain/helpers/dto/flows/flow.contacto-telefonico.dto';
import {
  FlowContactoTelefonico,
  FlowContactoTelefonicoDocument,
} from '../../database/flows/flow-contacto-telefonico.schema';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';

@Injectable()
export class FlowContactoTelefonicoRepository {
  constructor(
    @InjectModel(FlowContactoTelefonico.name)
    private readonly contactoTelefonicoModel: ModelExt<FlowContactoTelefonicoDocument>,
  ) { }

  async create(
    createDto: FlowContactoTelefonicoDto,
  ): Promise<FlowContactoTelefonico> {
    const created = new this.contactoTelefonicoModel(createDto);
    return await created.save();
  }

  async findAll(folio: string, paginate: IPaginateParams) {

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    }

    let agregateData: any[] =
      [
        {
          $match: {
            folio: { $eq: new Types.ObjectId(folio) },
          }
        }
      ]

    if (paginate.order && paginate.sort) {
      options.sort = {
        [paginate.order]: paginate.sort,
      };
    }

    const agregate = this.contactoTelefonicoModel.aggregate(agregateData, { collation: { locale: "en" } });
    return await this.contactoTelefonicoModel.aggregatePaginate(agregate, options);
  }

  async findOne(id: string): Promise<FlowContactoTelefonico> {
    return await this.contactoTelefonicoModel
      .findById(id)
      .select('-folio')
      .exec();
  }

  async update(id: string, data: FlowContactoTelefonicoUpdateDto): Promise<FlowContactoTelefonico> {
    return this.contactoTelefonicoModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
}
