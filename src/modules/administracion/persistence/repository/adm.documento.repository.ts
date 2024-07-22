import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { AdmDocumentoDto } from '../../domain/dto/adm.documento.dto';
import {
  AdmDocumento,
  AdmDocumentoDocument,
} from '../database/adm.documento.schema';

@Injectable()
export class AdmDocumentoRepository {
  constructor(
    @InjectModel(AdmDocumento.name)
    private readonly admDocumentoModel: ModelExt<AdmDocumentoDocument>,
  ) {}

  async create(data: AdmDocumentoDto) {
    const created = new this.admDocumentoModel(data);
    return await created.save();
  }

  async selectAll(paginate: IPaginateParams, categoriasDocumentos: any[] = []) {
    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    let agregateData: any[] = [
      {
        $match: {
          $or: [
            { nombre: { $regex: paginate.search, $options: 'i' } },
            { categoria: { $in: categoriasDocumentos } },
          ],
        },
      },
    ];

    if (paginate.order && paginate.sort) {
      agregateData.push({
        $sort: {
          [paginate.order]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    const agregate = this.admDocumentoModel.aggregate(agregateData, {
      collation: { locale: 'en' },
    });
    return await this.admDocumentoModel.aggregatePaginate(agregate, options);
  }

  async getAll(): Promise<AdmDocumento[]> {
    return await this.admDocumentoModel.find().exec();
  }

  async selectByPais(idPais: number): Promise<AdmDocumento[]> {
    return await this.admDocumentoModel
      .find({ pais: idPais, activo: true })
      .exec();
  }

  async selectAllOptionSelect() {
    return await this.admDocumentoModel.find().select(["nombre", "clave"]).exec();
  }

  async update(id: string, data: AdmDocumentoDto) {
    return this.admDocumentoModel.findByIdAndUpdate(id, data, { new: true });
  }

  async checkExist(
    pais: number,
    categoria: number,
    estatus: number,
    nombre: string,
  ) {
    let regexString = '^' + nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$';

    return await this.admDocumentoModel
      .find({ pais, categoria, estatus, nombre: new RegExp(regexString, 'i') })
      .exec();
  }

  async findOne(id: string): Promise<AdmDocumento> {
    return await this.admDocumentoModel.findById(id).lean();
  }
  async selectIn(data): Promise<AdmDocumento[]> {
    return await this.admDocumentoModel.find({ _id: { $in: data } }).exec();
  }

  async findAllDocumentosByPais(idPais: number): Promise<AdmDocumento[]> {
    return await this.admDocumentoModel.find({ pais: idPais }).exec();
  }

  async findByClave(clave: string): Promise<AdmDocumento> {
    return await this.admDocumentoModel.findOne({ clave }).exec();
  }
}
