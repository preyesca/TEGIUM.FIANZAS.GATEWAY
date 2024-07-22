import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CoreTitularDto } from '../../domain/helpers/dto/core.titular.dto';
import {
  CoreTitular,
  CoreTitularDocument,
} from '../database/core.titular.schema';

@Injectable()
export class CoreTitularRepository {
  constructor(
    @InjectModel(CoreTitular.name)
    private readonly coreTitularModel: Model<CoreTitularDocument>,
  ) {}

  async create(createDto: CoreTitularDto): Promise<CoreTitular> {
    const created = new this.coreTitularModel(createDto);
    return await created.save();
  }

  async findOne(id: string): Promise<CoreTitular> {
    return await this.coreTitularModel.findById(id).exec();
  }

  async findOneByNumeroCliente(numeroCliente: string): Promise<CoreTitular> {
    return await this.coreTitularModel.findOne({ numeroCliente }).exec();
  }

  async update(id: string, updateDto: CoreTitularDto): Promise<CoreTitular> {
    return await this.coreTitularModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async findAllTitularesByProyecto(
    proyecto: string,
  ): Promise<CoreTitular[]> {
    return await this.coreTitularModel
      .find({ proyecto: new Types.ObjectId(proyecto) })
      .exec();
  }

  async findAll(): Promise<CoreTitular[]> {
    return await this.coreTitularModel.find().exec();
  }

  async selectInById(data: any): Promise<CoreTitular[]> {
    return await this.coreTitularModel.find({ _id: { $in: data } }).exec();
  }
}
