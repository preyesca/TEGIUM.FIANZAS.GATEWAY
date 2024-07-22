import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatActividad,
  CatActividadDocument,
} from '../database/cat.actividad.schema';

@Injectable()
export class CatActividadRepository {
  constructor(
    @InjectModel(CatActividad.name)
    private readonly catActividadModel: Model<CatActividadDocument>,
  ) {}

  async select(): Promise<CatActividad[]> {
    return await this.catActividadModel.find({ activo: true }).exec();
  }

  async selectIn(data: string[]): Promise<Array<CatActividad>> {
    return await this.catActividadModel.find({ _id: { $in: data } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<Array<CatActividad>> {
    return await this.catActividadModel.find({ clave: { $in: claves } }).exec();
  }

  async findOne(id: string): Promise<CatActividad> {
    return await this.catActividadModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatActividad> {
    return await this.catActividadModel.findOne({ clave }).exec();
  }

  async findOneByDescripcion(descripcion: string): Promise<CatActividad> {
    return await this.catActividadModel
      .findOne({ descripcion: descripcion })
      .exec();
  }
}
