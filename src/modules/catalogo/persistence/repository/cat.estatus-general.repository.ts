import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatEstatusGeneral,
  CatEstatusGeneralDocument,
} from '../database/cat.estatus-general.schema';

@Injectable()
export class CatEstatusGeneralRepository {
  constructor(
    @InjectModel(CatEstatusGeneral.name)
    private readonly model: Model<CatEstatusGeneralDocument>,
  ) {}

  async select(): Promise<CatEstatusGeneral[]> {
    return await this.model.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatEstatusGeneral> {
    return await this.model.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatEstatusGeneral> {
    return await this.model.findOne({ clave }).exec();
  }

  async selectIn(ids: string[]): Promise<CatEstatusGeneral[]> {
    return await this.model.find({ _id: { $in: ids } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatEstatusGeneral[]> {
    return await this.model.find({ clave: { $in: claves } }).exec();
  }
}
