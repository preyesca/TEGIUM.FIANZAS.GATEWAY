import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CatTipoMovimiento,
  CatTipoMovimientoDocument,
} from '../database/cat.tipo-movimiento.schema';

@Injectable()
export class CatTipoMovimientoRepository {
  constructor(
    @InjectModel(CatTipoMovimiento.name)
    private readonly tipoMovimientoModel: Model<CatTipoMovimientoDocument>,
  ) {}

  async select(): Promise<CatTipoMovimiento[]> {
    return await this.tipoMovimientoModel.find({ activo: true }).exec();
  }

  async findOne(id: string): Promise<CatTipoMovimiento> {
    return await this.tipoMovimientoModel.findById(id).exec();
  }

  async findOneByClave(clave: number): Promise<CatTipoMovimiento> {
    return await this.tipoMovimientoModel.findOne({ clave }).exec();
  }

  async findOneByDescripcion(descripcion: string): Promise<CatTipoMovimiento> {
    return await this.tipoMovimientoModel.findOne({ descripcion: { $regex: new RegExp('^' + descripcion + '$', 'i') } }).exec();
  }
}
