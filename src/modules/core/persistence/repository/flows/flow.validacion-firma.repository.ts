import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { FlowValidacionFirmaDto } from 'src/modules/core/domain/helpers/dto/flows/flow.validacion-firma.dto';
import {
  FlowValidacionFirma,
  FlowValidacionFirmaDocument,
} from '../../database/flows/flow.validacion-firma.schema';

@Injectable()
export class FlowValidacionFirmaRepository {
  constructor(
    @InjectModel(FlowValidacionFirma.name)
    private readonly flowValidacionFirmaDocumentModel: ModelExt<FlowValidacionFirmaDocument>,
  ) {}

  async create(data: FlowValidacionFirmaDto) {
    const created = new this.flowValidacionFirmaDocumentModel(data);
    return await created.save();
  }

  async findByFolioActividad(
    folio: string,
    actividad: number,
  ): Promise<FlowValidacionFirma[]> {
    return await this.flowValidacionFirmaDocumentModel
      .find({ folio: new Types.ObjectId(folio), actividad })
      .exec();
  }

  async findOne(id: string): Promise<FlowValidacionFirma> {
    return await this.flowValidacionFirmaDocumentModel
      .findOne({ folio: new Types.ObjectId(id) })
      .exec();
  }

  async update(id: string, data: FlowValidacionFirmaDto) {
    return await this.flowValidacionFirmaDocumentModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }
}
