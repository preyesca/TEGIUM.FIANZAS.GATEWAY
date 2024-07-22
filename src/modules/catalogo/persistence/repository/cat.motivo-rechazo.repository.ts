import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatMotivoRechazo,
  CatMotivoRechazoDocument,
} from '../database/cat.motivo-rechazo.schema';

@Injectable()
export class CatMotivoRechazoRepository {
  constructor(
    @InjectModel(CatMotivoRechazo.name)
    private readonly catMotivoRechazoModel: Model<CatMotivoRechazoDocument>,
  ) {}

  async select(): Promise<CatMotivoRechazo[]> {
    return await this.catMotivoRechazoModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatMotivoRechazo> {
    return await this.catMotivoRechazoModel.findById(id).exec();
  }

  async selectIn(data) {
    return await this.catMotivoRechazoModel.find({ _id: { $in: data } }).exec();
  }

  async selectInByClave(claves: number[]) {
    return await this.catMotivoRechazoModel
      .find({ clave: { $in: claves } })
      .exec();
  }
}
