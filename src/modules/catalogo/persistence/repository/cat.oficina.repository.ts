import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatOficina, CatOficinaDocument } from '../database/cat.oficina.schema';

@Injectable()
export class CatOficinaRepository {
  constructor(
    @InjectModel(CatOficina.name)
    private readonly catOficinaModel: Model<CatOficinaDocument>,
  ) {}

  async select(): Promise<CatOficina[]> {
    return await this.catOficinaModel.find({ activo: true }).exec();
  }

  async selectIn(data: string[]): Promise<CatOficina[]> {
    return await this.catOficinaModel.find({ _id: { $in: data } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatOficina[]> {
    return await this.catOficinaModel.find({ clave: { $in: claves } }).exec();
  }

  async findOne(id: string): Promise<CatOficina> {
    return await this.catOficinaModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatOficina> {
    return await this.catOficinaModel.findOne({ clave }).exec();
  }

  async findOneByDescripcion(descripcion: string): Promise<CatOficina> {
    return await this.catOficinaModel.findOne({ descripcion }).exec();
  }
}
