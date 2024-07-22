import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { AdmConfiguracionAseguradoraDto } from '../../domain/dto/adm.configuracion-aseguradora.dto';
import {
  AdmConfiguracionAseguradora,
  AdmConfiguracionAseguradoraDocument,
} from '../database/adm.configuracion-aseguradora.schema';

@Injectable()
export class AdmConfiguracionAseguradoraRepository {
  constructor(
    @InjectModel(AdmConfiguracionAseguradora.name)
    private readonly admConfigAseguradoraDocument: ModelExt<AdmConfiguracionAseguradoraDocument>,
  ) {}

  async create(data: AdmConfiguracionAseguradoraDto) {
    const created = new this.admConfigAseguradoraDocument(data);
    return await created.save();
  }

  async paginate(paginate: IPaginateParams) {
    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    let agregateData: any[] = [
      {
        $lookup: {
          from: 'adm.aseguradoras',
          localField: 'aseguradora',
          foreignField: '_id',
          as: 'AseguradoraOBJ',
        },
      },
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
      let fieldFilter = '';

      if (paginate.order === 'aseguradora') {
        fieldFilter = 'AseguradoraOBJ.nombreComercial';
      }

      if (paginate.order === 'proyecto') {
        fieldFilter = 'ProyectoOBJ.codigo';
      }

      agregateData.push({
        $sort: {
          [fieldFilter]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    agregateData.push({
      $match: {
        $or: [
          {
            'AseguradoraOBJ.nombreComercial': {
              $regex: paginate.search,
              $options: 'i',
            },
          },
          { 'ProyectoOBJ.codigo': { $regex: paginate.search, $options: 'i' } },
        ],
      },
    });

    const agregate = this.admConfigAseguradoraDocument.aggregate(agregateData, {
      collation: { locale: 'en' },
    });
    return await this.admConfigAseguradoraDocument.aggregatePaginate(
      agregate,
      options,
    );
  }

  async findAll() {
    return await this.admConfigAseguradoraDocument.paginate(
      {},
      { limit: 2000 },
    );
  }

  async update(id: string, data: AdmConfiguracionAseguradoraDto) {
    return this.admConfigAseguradoraDocument.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async findOne(id: string): Promise<AdmConfiguracionAseguradora> {
    return await this.admConfigAseguradoraDocument.findOne({ _id: id }).exec();
  }

  async findOneByAseguradora(id: string): Promise<AdmConfiguracionAseguradora> {
    return await this.admConfigAseguradoraDocument
      .findOne({ aseguradora: new Types.ObjectId(id) })
      .exec();
  }

  async exists(
    pais: number,
    proyecto: Types.ObjectId,
    aseguradora: Types.ObjectId,
    oficinas: any,
  ): Promise<AdmConfiguracionAseguradora> {
    return await this.admConfigAseguradoraDocument
      .findOne({ pais, proyecto, aseguradora, oficinas })
      .exec();
  }

  async existsByPaisProyectoAseguradora(
    pais: number,
    proyecto: Types.ObjectId,
    aseguradora: Types.ObjectId,
  ): Promise<AdmConfiguracionAseguradora> {
    return await this.admConfigAseguradoraDocument
      .findOne({ pais, proyecto, aseguradora })
      .exec();
  }
}
