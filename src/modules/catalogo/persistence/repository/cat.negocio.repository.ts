import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatNegocio, CatNegocioDocument } from '../database/cat.negocio.schema';

@Injectable()
export class CatNegocioRepository {
  constructor(
    @InjectModel(CatNegocio.name)
    private readonly catNegocioModel: Model<CatNegocioDocument>,
  ) {}

  async select(): Promise<CatNegocio[]> {
    return await this.catNegocioModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatNegocio> {
    return await this.catNegocioModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatNegocio> {
    return await this.catNegocioModel.findOne({ clave }).exec();
  }

  async selectIn(ids: string[]): Promise<CatNegocio[]> {
    return await this.catNegocioModel.find({ _id: { $in: ids } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatNegocio[]> {
    return await this.catNegocioModel.find({ clave: { $in: claves } }).exec();
  }
}
