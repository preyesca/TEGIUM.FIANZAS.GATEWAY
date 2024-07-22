import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, Types } from 'mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import {
  AdmConfiguracionDocumentalDetalleDto,
  AdmConfiguracionDocumentalDto,
} from '../../domain/dto/adm.configuracion-documental.dto';
import {
  AdmConfiguracionDocumental,
  AdmConfiguracionDocumentalDocument,
} from '../database/adm.configuracion-documental.schema';

@Injectable()
export class AdmConfiguracionDocumentalRepository {
  constructor(
    @InjectModel(AdmConfiguracionDocumental.name)
    private readonly admConfigDocumentalDocument: ModelExt<AdmConfiguracionDocumentalDocument>,
  ) {}

  async create(data: AdmConfiguracionDocumentalDto) {
    const created = new this.admConfigDocumentalDocument(data);
    return await created.save();
  }

  async exists(
    pais: Number,
    proyecto: Types.ObjectId,
    aseguradora: Types.ObjectId,
    tipoPersona: Number,
    giro: Number,
  ): Promise<any> {
    return await this.admConfigDocumentalDocument
      .findOne({ pais, proyecto, aseguradora, tipoPersona, giro })
      .exec();
  }

  async paginate(paginate: IPaginateParams): Promise<any> {
    
    let options: IPaginateParams = {
      limit: paginate.limit,
      page: paginate.page,
      search: '',
      order: null,
      sort: null,
    };
  
    let agregateData: PipelineStage[] = [
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
      let fieldSort = '';
  
      if (paginate.order === 'aseguradora') {
        fieldSort = 'AseguradoraOBJ.nombreComercial';
      } else if (paginate.order === 'proyecto') {
        fieldSort = 'ProyectoOBJ.codigo';
      } else {
        fieldSort = paginate.order;
      }
  
      agregateData.push({
        $sort: {
          [fieldSort]: paginate.sort === 'asc' ? 1 : -1,
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
        ],
      },
    });
  
    const agregate = this.admConfigDocumentalDocument.aggregate(agregateData, {
      collation: { locale: 'en' },
    });
  
    return await this.admConfigDocumentalDocument.aggregatePaginate(
      agregate,
      options,
    );
  }

  async createDetails(data: AdmConfiguracionDocumentalDetalleDto[]) {
    return await this.admConfigDocumentalDocument.insertMany(data);
  }

  async findAll() {
    return await this.admConfigDocumentalDocument.paginate({}, { limit: 100 });
  }

  async selectByPais(pais: number): Promise<AdmConfiguracionDocumental[]> {
    return await this.admConfigDocumentalDocument
      .find({ pais, activo: true })
      .exec();
  }

  async update(id: string, data: AdmConfiguracionDocumentalDto) {
    return this.admConfigDocumentalDocument.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async checkExist(pais: string, categoria: string, documento: string) {
    const regexPais = new RegExp(pais, 'i');
    const regexCategoria = new RegExp(categoria, 'i');
    const regexDocumento = new RegExp(documento, 'i');

    return await this.admConfigDocumentalDocument
      .find({
        pais: regexPais,
        categoria: regexCategoria,
        documento: regexDocumento,
      })
      .exec();
  }

  async findOne(id: string): Promise<AdmConfiguracionDocumental> {
    return await this.admConfigDocumentalDocument
      .findOne({ _id: new Types.ObjectId(id) })
      .exec();
  }

  async findCargaDocumentalMasiva(
    pais: number,
    aseguradora: Types.ObjectId,
    proyecto: Types.ObjectId,
    tipoPersona: number
  ): Promise<AdmConfiguracionDocumental> {
    return await this.admConfigDocumentalDocument
    .findOne({ pais, aseguradora, proyecto, tipoPersona })
    .exec();
  }

  async findCargaDocumentalUploadLayout(
    pais: number,
    aseguradora: Types.ObjectId,
    proyecto: Types.ObjectId,
    tipoPersona: number,
  ): Promise<AdmConfiguracionDocumental> {
    return await this.admConfigDocumentalDocument
      .findOne({ pais, aseguradora, proyecto, tipoPersona })
      .exec();
  }

  async selectIn(data: any): Promise<AdmConfiguracionDocumental[]> {
    return await this.admConfigDocumentalDocument
      .find({ _id: { $in: data } })
      .exec();
  }
}
