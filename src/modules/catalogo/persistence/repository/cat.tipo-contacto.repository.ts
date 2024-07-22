import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatTipoContacto,
  CatTipoContactoDocument,
} from '../database/cat.tipo-contacto.schema';

@Injectable()
export class CatTipoContactoRepository {
  constructor(
    @InjectModel(CatTipoContacto.name)
    private readonly catTipoContactoModel: Model<CatTipoContactoDocument>,
  ) {}

  async select(): Promise<CatTipoContacto[]> {
    return await this.catTipoContactoModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatTipoContacto> {
    return await this.catTipoContactoModel.findById(id).exec();
  }

  async findOneByDescription(descripcion: string): Promise<CatTipoContacto> {
    return await this.catTipoContactoModel.findOne({ descripcion: { $regex: new RegExp('^' + descripcion + '$', 'i') } }).exec();
  }
}
