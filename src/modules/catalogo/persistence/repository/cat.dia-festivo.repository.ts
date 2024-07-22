import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatDiaFestivo, CatDiaFestivoDocument } from '../database/cat.dia-festivo.schema';

@Injectable()
export class CatDiaFestivoRepository {
  constructor(
    @InjectModel(CatDiaFestivo.name)
    private readonly catDiaFestivoModel: Model<CatDiaFestivoDocument>,
  ) {}

  async select(): Promise<Array<CatDiaFestivo>> {
    return await this.catDiaFestivoModel.find({ activo: true }).exec();
  }
  
}
