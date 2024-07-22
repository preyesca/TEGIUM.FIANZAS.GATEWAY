import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatUnidad, CatUnidadDocument } from '../database/cat.unidad.schema';

@Injectable()
export class CatUnidadRepository {
  constructor(
    @InjectModel(CatUnidad.name)
    private readonly unidadModel: Model<CatUnidadDocument>,
  ) {}

  async select(): Promise<CatUnidad[]> {
    return await this.unidadModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatUnidad> {
    return await this.unidadModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatUnidad> {
    return await this.unidadModel.findOne({ clave }).exec();
  }

  async findOneByDescription(descripcion: string): Promise<CatUnidad> {
    return await this.unidadModel
      .findOne({ descripcion: new RegExp(descripcion, 'i') })
      .exec();
  }

  async selectIn(ids: string[]): Promise<CatUnidad[]> {
    return await this.unidadModel.find({ _id: { $in: ids } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatUnidad[]> {
    return await this.unidadModel.find({ clave: { $in: claves } }).exec();
  }
}
