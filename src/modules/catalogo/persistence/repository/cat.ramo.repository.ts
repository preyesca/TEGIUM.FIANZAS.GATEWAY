import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatRamo, CatRamoDocument } from '../database/cat.ramo.schema';

@Injectable()
export class CatRamoRepository {
  constructor(
    @InjectModel(CatRamo.name)
    private readonly catRamoModel: Model<CatRamoDocument>,
  ) {}

  async select(): Promise<CatRamo[]> {
    return await this.catRamoModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatRamo> {
    return await this.catRamoModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatRamo> {
    return await this.catRamoModel.findOne({ clave }).exec();
  }

  async selectIn(ids: string[]): Promise<CatRamo[]> {
    return await this.catRamoModel.find({ _id: { $in: ids } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatRamo[]> {
    return await this.catRamoModel.find({ clave: { $in: claves } }).exec();
  }
}
