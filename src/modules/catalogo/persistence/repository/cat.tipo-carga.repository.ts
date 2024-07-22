import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatTipoCarga,
  CatTipoCargaDocument,
} from '../database/cat.tipo-carga.schema';

@Injectable()
export class CatTipoCargaRepository {
  constructor(
    @InjectModel(CatTipoCarga.name)
    private readonly tipoCargaModel: Model<CatTipoCargaDocument>,
  ) {}

  async select(): Promise<CatTipoCarga[]> {
    return await this.tipoCargaModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatTipoCarga> {
    return await this.tipoCargaModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatTipoCarga> {
    return await this.tipoCargaModel.findOne({ clave }).exec();
  }

  async findOneByDescripcion(descripcion: string): Promise<CatTipoCarga> {
    return await this.tipoCargaModel
      .findOne({ descripcion: descripcion })
      .exec();
  }
}
