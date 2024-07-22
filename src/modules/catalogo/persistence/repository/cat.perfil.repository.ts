import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatPerfil, CatPerfilDocument } from '../database/cat.perfil.schema';

@Injectable()
export class CatPerfilRepository {
  constructor(
    @InjectModel(CatPerfil.name)
    private readonly catPerfilModel: Model<CatPerfilDocument>,
  ) {}

  async select(): Promise<CatPerfil[]> {
    return await this.catPerfilModel
      .find({ activo: true })
      .sort({ descripcion: 1 })
      .exec();
  }

  async getAll(): Promise<CatPerfil[]> {
    return await this.catPerfilModel
      .find({ activo: true })
      .sort({ descripcion: 1 })
      .exec();
  }

  async selectIn(data: string[]): Promise<CatPerfil[]> {
    return await this.catPerfilModel.find({ _id: { $in: data } }).exec();
  }

  async selectInByClave(claves: number[]): Promise<CatPerfil[]> {
    return await this.catPerfilModel.find({ clave: { $in: claves } }).exec();
  }

  async findOne(id: string): Promise<CatPerfil> {
    return await this.catPerfilModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatPerfil> {
    return await this.catPerfilModel.findOne({ clave }).exec();
  }
}
