import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CoreInformacionEjecutivoDto } from '../../domain/helpers/dto/core.informacion-ejecutivo.dto';
import {
  CoreInformacionEjecutivo,
  CoreInformacionEjecutivoDocument,
} from '../database/core.informacion-ejecutivo.schema';

@Injectable()
export class CoreInformacionEjecutivoRepository {
  constructor(
    @InjectModel(CoreInformacionEjecutivo.name)
    private readonly coreInformacionEjecutivoModel: Model<CoreInformacionEjecutivoDocument>,
  ) {}

  async create(
    createDto: CoreInformacionEjecutivoDto,
  ): Promise<CoreInformacionEjecutivo> {
    const created = new this.coreInformacionEjecutivoModel(createDto);
    return await created.save();
  }

  async findOne(id: string): Promise<CoreInformacionEjecutivo> {
    return await this.coreInformacionEjecutivoModel.findById(id).exec();
  }

  async findOneByNumero(numero: string): Promise<CoreInformacionEjecutivo> {
    return await this.coreInformacionEjecutivoModel.findOne({ numero }).exec();
  }

  async update(id: string, data: CoreInformacionEjecutivoDto) {
    return this.coreInformacionEjecutivoModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }
}
