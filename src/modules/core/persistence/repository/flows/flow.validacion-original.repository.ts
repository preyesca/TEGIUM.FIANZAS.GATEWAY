import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { FlowValidacionFirmaDto } from 'src/modules/core/domain/helpers/dto/flows/flow.validacion-firma.dto';
import { FlowValidacionOriginalesCreateDto } from 'src/modules/core/domain/helpers/dto/flows/flow.validacion-original.dto';
import { FlowValidacionOriginalDocument, FlowValidacionOriginal } from '../../database/flows/flow.validacion-original.schema';

@Injectable()
export class FlowValidacionOriginalRepository {

  constructor(
    @InjectModel(FlowValidacionOriginal.name)
    private readonly flowValidacionOriginalDocumentModel: ModelExt<FlowValidacionOriginalDocument>,
  ) {}

  async create(data: FlowValidacionOriginalesCreateDto) {
    const created = new this.flowValidacionOriginalDocumentModel(data);
    return await created.save();
  }

  async findOne(id: string) {
    return await this.flowValidacionOriginalDocumentModel.findOne({ folio: new Types.ObjectId(id) }).exec();
  }

  async update(id: Types.ObjectId, data: FlowValidacionOriginalesCreateDto) {
    return await this.flowValidacionOriginalDocumentModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async findByFolioActividad(folio: string, actividad: number) {
    return await this.flowValidacionOriginalDocumentModel
      .find({ folio: new Types.ObjectId(folio), actividad })
      .exec();
  }
}
