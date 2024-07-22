import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CoreInformacionContactoDto } from '../../domain/helpers/dto/core.informacion-contacto.dto';
import {
  CoreInformacionContacto,
  CoreInformacionContactoDocument,
} from '../database/core.informacion-contacto.schema';

@Injectable()
export class CoreInformacionContactoRepository {
  constructor(
    @InjectModel(CoreInformacionContacto.name)
    private readonly coreInformacionContactoModel: Model<CoreInformacionContactoDocument>,
  ) {}

  async create(
    createDto: CoreInformacionContactoDto,
  ): Promise<CoreInformacionContacto> {
    const created = new this.coreInformacionContactoModel(createDto);
    return await created.save();
  }

  async findOne(id: string): Promise<CoreInformacionContacto> {
    return await this.coreInformacionContactoModel.findById(id).exec();
  }

  async findManyByFolios(
    folios: Array<Types.ObjectId>,
  ): Promise<Array<CoreInformacionContacto>> {
    return await this.coreInformacionContactoModel
      .find({ folio: { $in: folios } })
      .select(['correos', 'nombre'])
      .exec();
  }

  async findOneByFolio(folio: string): Promise<CoreInformacionContacto> {
    return await this.coreInformacionContactoModel
      .findOne({
        folio: new Types.ObjectId(folio),
      })
      .exec();
  }

  async update(
    id: string,
    updateDto: CoreInformacionContactoDto,
  ): Promise<CoreInformacionContacto> {
    return await this.coreInformacionContactoModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }
}
