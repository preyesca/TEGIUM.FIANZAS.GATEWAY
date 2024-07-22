import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatTipoLlamada,
  CatTipoLlamadaDocument,
} from '../database/cat.tipo-llamada.schema';

@Injectable()
export class CatTipoLlamadaRepository {
  constructor(
    @InjectModel(CatTipoLlamada.name)
    private readonly catTipoLlamadaModel: Model<CatTipoLlamadaDocument>,
  ) {}

  async findOne(id: string): Promise<CatTipoLlamada> {
    return await this.catTipoLlamadaModel.findById(id).exec();
  }

  async select(): Promise<CatTipoLlamada[]> {
    return await this.catTipoLlamadaModel.find({ activo: true }).exec();
  }

  async selectIn(data): Promise<CatTipoLlamada[]> {
    return await this.catTipoLlamadaModel.find({ _id: { $in: data } }).exec();
  }

  async selectInByClave(data: any): Promise<CatTipoLlamada[]> {
    return await this.catTipoLlamadaModel.find({ clave: { $in: data } }).exec();
  }

  async findOneByClave(clave: number): Promise<CatTipoLlamada> {
    return await this.catTipoLlamadaModel.findOne({ clave }).exec();
  }
}
