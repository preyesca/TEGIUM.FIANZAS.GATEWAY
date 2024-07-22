import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AdmProyectoConfiguracion,
  AdmProyectoConfiguracionDocument,
} from '../database/adm.proyecto-configuracion.schema';

@Injectable()
export class AdmProyectoConfiguracionRepository {
  constructor(
    @InjectModel(AdmProyectoConfiguracion.name)
    private readonly admProyectoConfiguracionModel: Model<AdmProyectoConfiguracionDocument>,
  ) {}

  async findOneByProyecto(proyecto: string): Promise<any> {
    return await this.admProyectoConfiguracionModel
      .find({
        proyecto: new Types.ObjectId(proyecto),
      })
      .exec();
  }

  async create(data: any) {
    const created = new this.admProyectoConfiguracionModel(data);
    return await created.save();
  }

  async update(id: number, data: any) {
    return this.admProyectoConfiguracionModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
}
