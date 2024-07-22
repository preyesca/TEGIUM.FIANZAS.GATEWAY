import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { AdmConfiguracionFirmaCotejoDto } from '../../domain/dto/adm.configuracion-firma-cotejo.dto';
import {
  AdmConfiguracionFirmaCotejo,
  AdmConfiguracionFirmaCotejoDocument,
} from '../database/adm.configuracion-firma-cotejo.schema';

@Injectable()
export class AdmConfiguracionFirmaCotejoRepository {
  constructor(
    @InjectModel(AdmConfiguracionFirmaCotejo.name)
    private readonly admConfiguracionFirmaCotejoModel: ModelExt<AdmConfiguracionFirmaCotejoDocument>,
  ) {}

  async selectByProyecto(
    proyecto: string,
  ): Promise<AdmConfiguracionFirmaCotejo> {
    return await this.admConfiguracionFirmaCotejoModel
      .findOne({ proyecto: new Types.ObjectId(proyecto) })
      .exec();
  }

  async selectPaginate(paginate: IPaginateParams) {
    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    let agregateData: any = [
      {
        $lookup: {
          from: 'adm.proyectos',
          localField: 'proyecto',
          foreignField: '_id',
          as: 'ProyectoOBJ',
        },
      },
    ];

    if (paginate.order && paginate.sort) {
      let fieldFilter = 'ProyectoOBJ.codigo';
      agregateData.push({
        $sort: {
          [fieldFilter]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    agregateData.push({
      $match: {
        $or: [
          { 'ProyectoOBJ.codigo': { $regex: paginate.search, $options: 'i' } },
        ],
      },
    });

    const agregate = this.admConfiguracionFirmaCotejoModel.aggregate(
      agregateData,
      {
        collation: { locale: 'en' },
      },
    );
    return await this.admConfiguracionFirmaCotejoModel.aggregatePaginate(
      agregate,
      options,
    );
  }

  async selectById(id: string): Promise<AdmConfiguracionFirmaCotejo[]> {
    return await this.admConfiguracionFirmaCotejoModel.find({ _id: id }).exec();
  }

  async selectAll(): Promise<AdmConfiguracionFirmaCotejo[]> {
    return await this.admConfiguracionFirmaCotejoModel.find({}).exec();
  }

  async findEjecutivoByClave(
    proyecto,
    clave,
  ): Promise<AdmConfiguracionFirmaCotejo> {
    return await this.admConfiguracionFirmaCotejoModel
      .findOne({
        proyecto: new Types.ObjectId(proyecto),
        'ejecutivos.clave': clave,
      })
      .exec();
  }

  async create(data: AdmConfiguracionFirmaCotejoDto): Promise<any> {
    const rspta = new this.admConfiguracionFirmaCotejoModel(data);
    return await rspta.save();
  }

  async update(id: Types.ObjectId, data) {
    return await this.admConfiguracionFirmaCotejoModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async existsByProyectoFirmaCotejo(
    proyecto: Types.ObjectId,
  ): Promise<AdmConfiguracionFirmaCotejo> {
    return await this.admConfiguracionFirmaCotejoModel
      .findOne({ proyecto })
      .exec();
  }
}
