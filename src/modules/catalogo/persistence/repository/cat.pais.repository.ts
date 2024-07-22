import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatPais, CatPaisDocument } from '../database/cat.pais.schema';

@Injectable()
export class CatPaisRepository {
  constructor(
    @InjectModel(CatPais.name)
    private readonly catPaisModel: Model<CatPaisDocument>,
  ) {}

  async select(): Promise<CatPais[]> {
    return await this.catPaisModel.find({ activo: true }).exec();
  }

  async selectIn(data: string[]): Promise<CatPais[]> {
    return await this.catPaisModel.find({ _id: { $in: data } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatPais[]> {
    return await this.catPaisModel.find({ clave: { $in: claves } }).exec();
  }

  async findOne(id: string): Promise<CatPais> {
    return await this.catPaisModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatPais> {
    return await this.catPaisModel.findOne({ clave }).exec();
  }
}
