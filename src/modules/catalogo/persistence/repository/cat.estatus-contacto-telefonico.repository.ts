import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatEstatusContactoTelefonico,
  CatEstatusContactoTelefonicoDocument,
} from '../database/cat.estatus-contacto-telefonico.schema';

@Injectable()
export class CatEstatusContactoTelefonicoRepository {
  constructor(
    @InjectModel(CatEstatusContactoTelefonico.name)
    private readonly catEstatusContactoTelefonicoModel: Model<CatEstatusContactoTelefonicoDocument>,
  ) {}

  async findOne(id: string): Promise<CatEstatusContactoTelefonico> {
    return await this.catEstatusContactoTelefonicoModel.findById(id).exec();
  }

  async select(): Promise<CatEstatusContactoTelefonico[]> {
    return await this.catEstatusContactoTelefonicoModel
      .find({ activo: true })
      .exec();
  }

  async findOneByClave(clave: number): Promise<CatEstatusContactoTelefonico> {
    return await this.catEstatusContactoTelefonicoModel
      .findOne({ clave })
      .exec();
  }

  async selectIn(data): Promise<CatEstatusContactoTelefonico[]> {
    return await this.catEstatusContactoTelefonicoModel
      .find({ _id: { $in: data } })
      .exec();
  }

  async selectInByClave(data): Promise<CatEstatusContactoTelefonico[]> {
    return await this.catEstatusContactoTelefonicoModel
      .find({ clave: { $in: data } })
      .exec();
  }
}
