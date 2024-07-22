import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatEstatusActividad,
  CatEstatusActividadDocument,
} from '../database/cat.estatus-actividad.schema';

@Injectable()
export class CatEstatusActividadRepository {
  constructor(
    @InjectModel(CatEstatusActividad.name)
    private readonly estatusActividadModel: Model<CatEstatusActividadDocument>,
  ) {}

  async select(): Promise<CatEstatusActividad[]> {
    return await this.estatusActividadModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatEstatusActividad> {
    return await this.estatusActividadModel.findById(id).exec();
  }

  async selectIn(data): Promise<CatEstatusActividad[]> {
    return await this.estatusActividadModel.find({ _id: { $in: data } }).exec();
  }

  async selectInByClave(data: number[]): Promise<CatEstatusActividad[]> {
    return await this.estatusActividadModel
      .find({ clave: { $in: data } })
      .exec();
  }
}
