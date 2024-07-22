import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatGiro, CatGiroDocument } from '../database/cat.giro.schema';

@Injectable()
export class CatGiroRepository {
  constructor(
    @InjectModel(CatGiro.name)
    private readonly catGiroModel: Model<CatGiroDocument>,
  ) {}

  async select(): Promise<Array<CatGiro>> {
    return await this.catGiroModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatGiro> {
    return await this.catGiroModel.findById(id).exec();
  }

  async selectIn(data): Promise<Array<CatGiro>> {
    return await this.catGiroModel.find({ _id: { $in: data } }).exec();
  }

  async findOneByDescripcion(descripcion: string): Promise<CatGiro> {
    return await this.catGiroModel.findOne({ descripcion: { $regex: new RegExp('^' + descripcion + '$', 'i') } }).exec();
  }

  async findOneByClave(clave: number): Promise<CatGiro> {
    return await this.catGiroModel.findOne({ clave }).exec();
  }

  async selectInByClave(claves: number[]): Promise<Array<CatGiro>> {
    return await this.catGiroModel.find({ clave: { $in: claves } }).exec();
  }
}
