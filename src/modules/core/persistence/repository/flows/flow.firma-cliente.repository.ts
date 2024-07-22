import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { FlowFirmaClienteDto } from 'src/modules/core/domain/helpers/dto/flows/flow.firma-cliente.dto';
import {
  FlowFirmaCliente,
  FlowFirmaClienteDocument,
} from '../../database/flows/flow.firma-cliente.schema';

@Injectable()
export class FlowFirmaClienteRepository {
  constructor(
    @InjectModel(FlowFirmaCliente.name)
    private readonly model: ModelExt<FlowFirmaClienteDocument>,
  ) { }

  async create(data: FlowFirmaClienteDto) {
    const created = new this.model(data);
    return await created.save();
  }

  async findByFolioActividad(folio: string, actividad: number) {
    return await this.model
      .find({ folio: new Types.ObjectId(folio), actividad })
      .exec();
  }

  async findOne(id: string) {
    return await this.model
      .findOne({ folio: new Types.ObjectId(id) })
      .exec();
  }

  async update(id: string, data: FlowFirmaClienteDto) {
    return await this.model
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }
}
