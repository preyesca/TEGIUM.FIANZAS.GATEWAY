import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatEstatusGeneracionFormato,
  CatEstatusGeneracionFormatoDocument,
} from '../database/cat.estatus-generacion-formato.schema';

@Injectable()
export class CatEstatusGeneracionFormatosRepository {
  constructor(
    @InjectModel(CatEstatusGeneracionFormato.name)
    private readonly estatusGeneracionFormatos: Model<CatEstatusGeneracionFormatoDocument>,
  ) {}

  async select(): Promise<CatEstatusGeneracionFormato[]> {
    return await this.estatusGeneracionFormatos.find({ activo: true }).exec();
  }

  async selectIn(data: string[]): Promise<CatEstatusGeneracionFormato[]> {
    return await this.estatusGeneracionFormatos
      .find({ _id: { $in: data } })
      .exec();
  }

  async selectInByClave(
    claves: number[],
  ): Promise<CatEstatusGeneracionFormato[]> {
    return await this.estatusGeneracionFormatos
      .find({ clave: { $in: claves } })
      .exec();
  }

  async findOne(id: string): Promise<CatEstatusGeneracionFormato> {
    return await this.estatusGeneracionFormatos.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatEstatusGeneracionFormato> {
    return await this.estatusGeneracionFormatos.findOne({ clave }).exec();
  }

  async findOneByDescripcion(
    descripcion: string,
  ): Promise<CatEstatusGeneracionFormato> {
    return await this.estatusGeneracionFormatos
      .findOne({ descripcion: descripcion })
      .exec();
  }
}
