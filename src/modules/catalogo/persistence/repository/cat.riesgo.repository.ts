import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatRiesgo, CatRiesgoDocument } from '../database/cat.riesgo.schema';

@Injectable()
export class CatRiesgoRepository {
  constructor(
    @InjectModel(CatRiesgo.name)
    private readonly riesgoModel: Model<CatRiesgoDocument>,
  ) {}

  async select(): Promise<CatRiesgo[]> {
    return await this.riesgoModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatRiesgo> {
    return await this.riesgoModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatRiesgo> {
    return await this.riesgoModel.findOne({ clave }).exec();
  }

  async findOneByDescription(descripcion: string): Promise<CatRiesgo> {
    return await this.riesgoModel
      .findOne({ descripcion: new RegExp(descripcion, 'i') })
      .exec();
  }

  async selectIn(ids: string[]): Promise<CatRiesgo[]> {
    return await this.riesgoModel.find({ _id: { $in: ids } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatRiesgo[]> {
    return await this.riesgoModel.find({ clave: { $in: claves } }).exec();
  }
}
