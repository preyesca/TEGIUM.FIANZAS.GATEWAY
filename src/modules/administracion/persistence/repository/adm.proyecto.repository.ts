import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EEstatusGeneral } from 'src/app/common/enum/catalogo/estatus-general.enum';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { AdmProyectoDto } from '../../domain/dto/adm.proyecto.dto';
import {
  AdmProyecto,
  AdmProyectoDocument,
} from '../database/adm.proyecto.schema';

@Injectable()
export class AdmProyectoRepository {
  constructor(
    @InjectModel(AdmProyecto.name)
    private readonly proyectoModel: ModelExt<AdmProyectoDocument>,
  ) {}

  async create(data: AdmProyectoDto) {
    const created = new this.proyectoModel(data);
    return await created.save();
  }

  async getAll(): Promise<AdmProyecto[]> {
    return await this.proyectoModel
      .find({ estatus: EEstatusGeneral.ACTIVO })
      .exec();
  }

  async paginate(paginate: IPaginateParams) {
    let agregateData: any[] = [
      {
        $lookup: {
          from: 'adm.aseguradoras',
          localField: 'aseguradora',
          foreignField: '_id',
          as: 'AseguradoraObj',
        },
      },
    ];

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      let fieldFilter = '';

      if (paginate.order === 'aseguradora') {
        fieldFilter = 'AseguradoraObj.nombreComercial';
      } else {
        fieldFilter = paginate.order;
      }

      agregateData.push({
        $sort: {
          [fieldFilter]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    const agregate = this.proyectoModel.aggregate(agregateData, {
      collation: { locale: 'en' },
    });
    return await this.proyectoModel.aggregatePaginate(agregate, options);
  }

  async findAllCodigosByPais(pais: number): Promise<AdmProyecto[]> {
    return await this.proyectoModel.find({ pais }).select('_id codigo').exec();
  }

  async findOne(id: string): Promise<AdmProyecto> {
    return await this.proyectoModel
      .findById(id)
      //.populate('aseguradora', 'nombreComercial razonSocial')
      .exec();
  }

  async findById(id: Types.ObjectId) {
    return await this.proyectoModel.findById(id).exec();
  }

  //Para aseguradora enviar el aseguradora._id.toString()
  async exists(
    pais: number,
    ramo: number,
    proceso: number,
    negocio: number,
    aseguradora: string,
    portal: string,
  ): Promise<any> {
    return await this.proyectoModel
      .findOne({
        pais,
        ramo,
        proceso,
        negocio,
        aseguradora: new Types.ObjectId(aseguradora),
        portal,
      })
      .exec();
  }

  async existsCode(codigo: string): Promise<any> {
    return await this.proyectoModel.findOne({ codigo: codigo }).exec();
  }

  async update(id: number, data: AdmProyectoDto) {
    return this.proyectoModel.findByIdAndUpdate(id, data, { new: true });
  }

  async selectIn(ids: string[]): Promise<AdmProyecto[]> {
    return await this.proyectoModel.find({ _id: { $in: ids } }).exec();
  }
  async selectByPais(idPais: number): Promise<AdmProyecto[]> {
    return await this.proyectoModel.find({ pais: idPais }).exec();
  }
}
