import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { FlowValidacionDigitalDto } from 'src/modules/core/domain/helpers/dto/flows/flow.validacion-digital.dto';
import {
  FlowValidacionDigital,
  FlowValidacionDigitalDocument,
} from '../../database/flows/flow.validacion-digital.schema';

@Injectable()
export class FlowValidacionDigitalRepository {
  constructor(
    @InjectModel(FlowValidacionDigital.name)
    private readonly flowValidacionDigitalModel: ModelExt<FlowValidacionDigitalDocument>,
  ) {}

  async create(data: FlowValidacionDigitalDto) {
    const created = new this.flowValidacionDigitalModel(data);
    return await created.save();
  }

  async findByFolioActividad(
    folio: string,
    actividad: number,
  ): Promise<FlowValidacionDigital[]> {
    return await this.flowValidacionDigitalModel
      .find({ folio: new Types.ObjectId(folio), actividad })
      .exec();
  }

  async findByFolio(
    folio: string,
  ): Promise<FlowValidacionDigital[]> {
    return await this.flowValidacionDigitalModel
      .find({ folio: new Types.ObjectId(folio) })
      .exec();
  }

  async findOne(id: string): Promise<FlowValidacionDigital> {
    return await this.flowValidacionDigitalModel
      .findOne({ folio: new Types.ObjectId(id) })
      .exec();
  }

  async update(id: string, data: FlowValidacionDigitalDto) {
    return await this.flowValidacionDigitalModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }
}
