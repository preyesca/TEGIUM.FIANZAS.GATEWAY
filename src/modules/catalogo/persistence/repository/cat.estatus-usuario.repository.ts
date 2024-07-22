import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatEstatusUsuario,
  CatEstatusUsuarioDocument,
} from '../database/cat.estatus-usuario.schema';

@Injectable()
export class CatEstatusUsuarioRepository {
  constructor(
    @InjectModel(CatEstatusUsuario.name)
    private readonly catEstatusUsuarioModel: Model<CatEstatusUsuarioDocument>,
  ) {}

  async select(): Promise<CatEstatusUsuario[]> {
    return await this.catEstatusUsuarioModel.find({ activo: true }).exec();
  }

  async selectIn(data: string[]): Promise<CatEstatusUsuario[]> {
    return await this.catEstatusUsuarioModel
      .find({ _id: { $in: data } })
      .exec();
  }

  async selectInByClave(claves: number[]): Promise<CatEstatusUsuario[]> {
    return await this.catEstatusUsuarioModel
      .find({ clave: { $in: claves } })
      .exec();
  }

  async findOne(id: string): Promise<CatEstatusUsuario> {
    return await this.catEstatusUsuarioModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatEstatusUsuario> {
    return await this.catEstatusUsuarioModel.findOne({ clave }).exec();
  }

  async findOneByDescripcion(descripcion: string): Promise<CatEstatusUsuario> {
    return await this.catEstatusUsuarioModel.findOne({ descripcion }).exec();
  }
}
