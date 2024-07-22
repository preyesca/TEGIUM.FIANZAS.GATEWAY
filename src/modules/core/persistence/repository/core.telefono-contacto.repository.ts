import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { CoreTelefonoContactoDto } from '../../domain/helpers/dto/core.telefono-contacto.dto';
import {
  CoreTelefonoContacto,
  CoreTelefonoContactoDocument,
} from '../database/core.telefono-contacto.schema';

@Injectable()
export class CoreTelefonoContactoRepository {
  constructor(
    @InjectModel(CoreTelefonoContacto.name)
    private readonly telefonoContactoModel: ModelExt<CoreTelefonoContactoDocument>,
  ) {}

  async create(
    createDto: CoreTelefonoContactoDto,
  ): Promise<CoreTelefonoContacto> {
    const created = new this.telefonoContactoModel(createDto);
    return await created.save();
  }

  async createMany(
    createDto: Array<CoreTelefonoContactoDto>,
  ): Promise<CoreTelefonoContacto[]> {
    return await this.telefonoContactoModel.insertMany(createDto);
  }

  async finOne(id: string): Promise<CoreTelefonoContacto> {
    return await this.telefonoContactoModel.findById(id).exec();
  }

  async update(
    id: string,
    updateDto: CoreTelefonoContactoDto,
  ): Promise<CoreTelefonoContacto> {
    return await this.telefonoContactoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async deleteMany(folio: string) {
    return await this.telefonoContactoModel.deleteMany({ folio }).exec();
  }

  async delete(id: string) {
    return await this.telefonoContactoModel.findByIdAndDelete(id).exec();
  }

  async selectByFolio(id: string): Promise<CoreTelefonoContacto[]> {
    return await this.telefonoContactoModel
      .find({ folio: new Types.ObjectId(id) })
      .exec();
  }

  async findOneByFolio(id: string): Promise<CoreTelefonoContacto> {
    return await this.telefonoContactoModel
      .findOne({ folio: new Types.ObjectId(id) })
      .exec();
  }
}
