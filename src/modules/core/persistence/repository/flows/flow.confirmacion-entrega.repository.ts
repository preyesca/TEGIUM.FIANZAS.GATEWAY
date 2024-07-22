import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { FlowConfirmacionEntregaDto } from 'src/modules/core/domain/helpers/dto/flows/flow.confirmacion-entrega.dto';
import {
  FlowConfirmacionEntrega,
  FlowConfirmacionEntregaDocument,
} from '../../database/flows/flow.confirmacion-entrega.schema';

@Injectable()
export class FlowConfirmacionEntregaRepository {
  constructor(
    @InjectModel(FlowConfirmacionEntrega.name)
    private readonly model: ModelExt<FlowConfirmacionEntregaDocument>,
  ) {} 

  async create(data: FlowConfirmacionEntregaDto) {
    const created = new this.model(data);
    return await created.save();
  }

  async findByFolioActividad(folio: string, actividad: number) {
    return await this.model
      .find({ folio: new Types.ObjectId(folio), actividad })
      .exec();
  }

  async findOne(id: string): Promise<FlowConfirmacionEntrega> {
    return await this.model.findOne({ folio: new Types.ObjectId(id) }).exec();
  }

  async update(id: string, data: FlowConfirmacionEntregaDto) {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
