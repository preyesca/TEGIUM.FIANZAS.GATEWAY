import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { FlowValidacionAfianzadoraDocument } from '../../database/flows/flow.validacion-afianzadora-archivos.schema';
import { FlowValidacionAfianzadora } from '../../database/flows/flow.validacion-afianzadora.schema';
import { FlowValidacionAfianzadoraDto } from 'src/modules/core/domain/helpers/dto/flows/flow.validacion-afianzadora.dto';

@Injectable()
export class FlowValidacionAfianzadoraRepository {

  constructor(
    @InjectModel(FlowValidacionAfianzadora.name)
    private readonly flowValidacionAfianzadoraDocumentModel: ModelExt<FlowValidacionAfianzadoraDocument>,
  ) {}

  async create(data: FlowValidacionAfianzadoraDto) {
    const created = new this.flowValidacionAfianzadoraDocumentModel(data);
    return await created.save();
  }

  async findByFolioActividad(folio: string, actividad: number) {
    return await this.flowValidacionAfianzadoraDocumentModel.find({ folio: new Types.ObjectId(folio), actividad }).exec();
  }

  async findOne(id: string) {
    return await this.flowValidacionAfianzadoraDocumentModel.findOne({ folio :new Types.ObjectId(id)}).exec();
  }

  async update(id: string, data: FlowValidacionAfianzadoraDto) {
    return await this.flowValidacionAfianzadoraDocumentModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

}
