import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatProceso, CatProcesoDocument } from '../database/cat.proceso.schema';

@Injectable()
export class CatProcesoRepository {
  constructor(
    @InjectModel(CatProceso.name)
    private readonly catProcesoModel: Model<CatProcesoDocument>,
  ) {}

  async select(): Promise<CatProceso[]> {
    return await this.catProcesoModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatProceso> {
    return await this.catProcesoModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatProceso> {
    return await this.catProcesoModel.findOne({ clave }).exec();
  }

  async selectIn(ids: string[]): Promise<CatProceso[]> {
    return await this.catProcesoModel.find({ _id: { $in: ids } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatProceso[]> {
    return await this.catProcesoModel.find({ clave: { $in: claves } }).exec();
  }
}
