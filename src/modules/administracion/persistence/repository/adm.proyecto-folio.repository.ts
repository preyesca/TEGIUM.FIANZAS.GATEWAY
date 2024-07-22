import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AdmProyectoFolio,
  AdmProyectoFolioDocument,
} from '../database/adm.proyecto-folio.schema';

@Injectable()
export class AdmProyectoFolioRepository {
  constructor(
    @InjectModel(AdmProyectoFolio.name)
    private readonly admProyectoFolioModel: Model<AdmProyectoFolioDocument>,
  ) {}

  async findOneByProyecto(proyectoId: string): Promise<AdmProyectoFolio> {
    const proyecto = new Types.ObjectId(proyectoId);

    const found = await this.admProyectoFolioModel.findOne({ proyecto }).exec();

    if (found) {
      found.folio = found.folio + 1;
      await found.save();
      return found;
    }

    const created = new this.admProyectoFolioModel({ proyecto, folio: 1 });
    return await created.save();
  }
}
