import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatReporte, CatReporteDocument } from '../database/cat.reporte.schema';

@Injectable()
export class CatReporteRepository {
  constructor(
      @InjectModel(CatReporte.name)
      private readonly reporteModel: Model<CatReporteDocument>,
  ) {}

  async select(): Promise<CatReporte[]> {
    return await this.reporteModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatReporte> {
    return await this.reporteModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatReporte> {
    return await this.reporteModel.findOne({ clave }).exec();
  }

  async findOneByDescription(descripcion: string): Promise<CatReporte> {
    return await this.reporteModel
        .findOne({ descripcion: new RegExp(descripcion, 'i') })
        .exec();
  }

  async selectIn(ids: string[]): Promise<CatReporte[]> {
    return await this.reporteModel.find({ _id: { $in: ids } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatReporte[]> {
    return await this.reporteModel.find({ clave: { $in: claves } }).exec();
  }
}
