import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import {
  FlowFirmaEjecutivo,
  FlowFirmaEjecutivoDocument,
} from '../../database/flows/flow.firma-ejecutivo.schema';
import { FlowFirmaEjecutivoDto } from 'src/modules/core/domain/helpers/dto/flows/flow.firma-ejecutivo.dto';

@Injectable()
export class FlowFirmaEjecutivoRepository {
  constructor(
    @InjectModel(FlowFirmaEjecutivo.name)
    private readonly model: ModelExt<FlowFirmaEjecutivoDocument>,
  ) {}

  async create(data: FlowFirmaEjecutivoDto) {
    const created = new this.model(data);
    return await created.save();
  }

  async findByFolioActividad(folio: string, actividad: number) {
    return await this.model
      .find({ folio: new Types.ObjectId(folio), actividad })
      .exec();
  }

  async findOne(id: string) {
    return await this.model.findOne({ folio: new Types.ObjectId(id) }).exec();
  }

  async update(id: string, data: FlowFirmaEjecutivoDto) {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
