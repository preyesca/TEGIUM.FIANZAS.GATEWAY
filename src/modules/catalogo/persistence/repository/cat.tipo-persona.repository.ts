import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatTipoPersona,
  CatTipoPersonaDocument,
} from '../database/cat.tipo-persona.schema';

@Injectable()
export class CatTipoPersonaRepository {
  constructor(
    @InjectModel(CatTipoPersona.name)
    private readonly catTipoPersonaModel: Model<CatTipoPersonaDocument>,
  ) {}

  async findOne(id: string): Promise<CatTipoPersona> {
    return await this.catTipoPersonaModel
      .findById(id)
      .populate('pais', 'clave descripcion')
      .exec();
  }

  async findOneByDescription(descripcion: string): Promise<CatTipoPersona> {
    return await this.catTipoPersonaModel.findOne({ descripcion: { $regex: new RegExp('^' + descripcion + '$', 'i') } }).exec();
  }

  async select(): Promise<CatTipoPersona[]> {
    return await this.catTipoPersonaModel.find({ activo: true }).exec();
  }

  async selectIn(data: any): Promise<CatTipoPersona[]> {
    return await this.catTipoPersonaModel.find({ _id: { $in: data } }).exec();
  }

  async findOneByClave(clave: number): Promise<CatTipoPersona> {
    return await this.catTipoPersonaModel.findOne({ clave }).exec();
  }
  async selectInByClave(claves: number[]): Promise<CatTipoPersona[]> {
    return await this.catTipoPersonaModel
      .find({ clave: { $in: claves } })
      .exec();
  }
}
