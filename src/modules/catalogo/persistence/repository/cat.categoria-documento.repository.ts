import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatCategoriaDocumento,
  CatCategoriaDocumentoDocument,
} from 'src/modules/catalogo/persistence/database/cat.categoria-documento.schema';

@Injectable()
export class CatCategoriaDocumentoRepository {
  constructor(
    @InjectModel(CatCategoriaDocumento.name)
    private readonly catCategoriaDocumentoModel: Model<CatCategoriaDocumentoDocument>,
  ) {}

  async select(): Promise<CatCategoriaDocumento[]> {
    return await this.catCategoriaDocumentoModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatCategoriaDocumento> {
    return await this.catCategoriaDocumentoModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatCategoriaDocumento> {
    return await this.catCategoriaDocumentoModel.findOne({ clave }).exec();
  }

  async selectIn(data): Promise<CatCategoriaDocumento[]> {
    return await this.catCategoriaDocumentoModel
      .find({ _id: { $in: data } })
      .exec();
  }

  async selectInByClave(claves: number[]): Promise<CatCategoriaDocumento[]> {
    return await this.catCategoriaDocumentoModel
      .find({ clave: { $in: claves } })
      .exec();
  }
}
