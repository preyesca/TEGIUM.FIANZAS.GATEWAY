import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { CoreFolioDto } from '../../domain/helpers/dto/core.folio.dto';
import { CoreFolio, CoreFolioDocument } from '../database/core.folio.schema';

@Injectable()
export class CoreFolioRepository {
  constructor(
    @InjectModel(CoreFolio.name)
    private readonly coreFolioModel: ModelExt<CoreFolioDocument>,
  ) { }

  async create(createDto: CoreFolioDto): Promise<CoreFolio> {
    const created = new this.coreFolioModel(createDto);
    return await created.save();
  }

  async findOne(id: string): Promise<CoreFolio> {
    return await this.coreFolioModel.findById(id).exec();
  }

  async findOneExists(id: string): Promise<CoreFolio> {
    return await this.coreFolioModel
      .findById(id)
      .select('folioMultisistema')
      .exec();
  }

  async findAllByTitular(titular: string): Promise<Array<CoreFolio>> {
    return await this.coreFolioModel
      .find({
        titular: new Types.ObjectId(titular),
      })
      .exec();
  }

  async findAll(paginate: any) {
    return await this.coreFolioModel.paginate({}, paginate);
  }

  async selectInByFolioFilter(data: any, param: any, proyecto: string) {
    const proyectoFilter = new Types.ObjectId(proyecto);

    const query: any[] = [
      {
        $match: {
          $and: [
            {
              folioMultisistema: { $in: data },
              proyecto: { $eq: proyectoFilter },
            },
          ],
        },
      },
      {
        $project: {
          folioMultisistema: 1,
          titular: 1,
          folioCliente: 1,
          proyecto: 1,
        },
      },
      {
        $lookup: {
          from: 'core.titulares',
          localField: 'titular',
          foreignField: '_id',
          pipeline: [
            {
              $project: { nombre: 1, numeroCliente: 1 },
            },
          ],
          as: 'titular',
        },
      },
      {
        $unwind: {
          path: '$titular',
          preserveNullAndEmptyArrays: false,
        },
      },
    ];

    if (param.search) {
      query.push({
        $match: {
          $or: [
            { folioCliente: { $regex: param.search, $options: 'm' } },
            { 'titular.nombre': { $regex: param.search, $options: 'i' } },
            { 'titular.numeroCliente': { $regex: param.search, $options: 'i' } },
          ],
        },
      });
    }

    return this.coreFolioModel.aggregate(query);
  }

  async selectByProyecto(param: any, proyecto: string) {

    try {

      const proyectoFilter = new Types.ObjectId(proyecto);

      const query: any[] = [
        {
          $match: {
            $and: [
              {
                proyecto: { $eq: proyectoFilter },
              },
            ],
          },
        },
        {
          $project: {
            folioMultisistema: 1,
            titular: 1,
            folioCliente: 1,
            proyecto: 1,
          },
        },
        {
          $lookup: {
            from: 'core.titulares',
            localField: 'titular',
            foreignField: '_id',
            pipeline: [
              {
                $project: { nombre: 1 },
              },
            ],
            as: 'titular',
          },
        },
        {
          $unwind: {
            path: '$titular',
            preserveNullAndEmptyArrays: false,
          },
        },
      ];

      if (param.search) {
        query.push({
          $match: {
            $or: [
              { folioCliente: { $regex: param.search, $options: 'm' } },
              { 'titular.nombre': { $regex: param.search, $options: 'i' } },
            ],
          },
        });
      }

      return await this.coreFolioModel.aggregate(query);
      
    } catch (error) {
      return [];
    }

  }

  async findOnePopulate(id: string): Promise<any> {
    return await this.coreFolioModel
      .findOne({ _id: id })
      .populate('titular', { 'nombre': 1, 'numeroCliente': 1 })
      .populate('ejecutivo', { 'numero': 1, 'nombre': 1 })
      .exec();
  }

  async findPortalAseguradoByTitular(titular: string): Promise<any> {
    return await this.coreFolioModel
      .find({
        titular: new Types.ObjectId(titular),
      })
      .exec();
  }

  async findOneByFolioMultisistema(folioMultisistema: number): Promise<CoreFolio> {
    return await this.coreFolioModel.
      findOne({ folioMultisistema })
      .exec();
  }

  async selectFolioReportByIdFolio(folio: string) {
    return await this.coreFolioModel
        .aggregate([
          {
            $match: {
              _id: new Types.ObjectId(folio),
            },
          },
          {
            $lookup: {
              from: 'adm.proyectos',
              localField: 'proyecto',
              foreignField: '_id',
              as: 'proyecto',
            },
          },
          {
            $unwind: '$proyecto',
          },
          {
            $lookup: {
              from: 'core.titulares',
              localField: 'titular',
              foreignField: '_id',
              as: 'titular',
            },
          },
          {
            $unwind: '$titular',
          },
          {
            $lookup: {
              from: 'core.informacion-ejecutivo',
              localField: 'ejecutivo',
              foreignField: '_id',
              as: 'ejecutivo',
            },
          },
          {
            $unwind: '$ejecutivo',
          },
          {
            $lookup: {
              from: 'adm.usuarios',
              localField: 'usuario',
              foreignField: '_id',
              as: 'usuario',
            },
          },
          {
            $unwind: '$usuario',
          },
          {
            $lookup: {
              from: 'cat.tipos-carga',
              localField: 'tipoCarga',
              foreignField: 'clave',
              as: 'tipoCarga',
            },
          },
          {
            $unwind: '$tipoCarga',
          },
          {
            $lookup: {
              from: 'cat.giros',
              localField: 'giro',
              foreignField: 'clave',
              as: 'giro',
            },
          },
          {
            $unwind: '$giro',
          },
          {
            $lookup: {
              from: 'cat.tipos-movimiento',
              localField: 'tipoMovimiento',
              foreignField: 'clave',
              as: 'tipoMovimiento',
            },
          },
          {
            $unwind: '$tipoMovimiento',
          },
          {
            $lookup: {
              from: 'core.polizas',
              localField: '_id',
              foreignField: 'folio',
              as: 'poliza',
            },
          },
          {
            $unwind: '$poliza',
          },
          {
            $lookup: {
              from: 'adm.aseguradoras',
              localField: 'poliza.aseguradora',
              foreignField: '_id',
              as: 'aseguradora',
            },
          },
          {
            $unwind: '$aseguradora',
          },
          {
            $lookup: {
              from: 'cat.riesgos',
              localField: 'poliza.riesgo',
              foreignField: 'clave',
              as: 'riesgo',
            },
          },
          {
            $unwind: '$riesgo',
          },
          {
            $lookup: {
              from: 'cat.unidades',
              localField: 'poliza.unidad',
              foreignField: 'clave',
              as: 'unidad',
            },
          },
          {
            $unwind: '$unidad',
          },
          {
            $project: {
              _id: 1,
              folioMultisistema: 1,
              folioCliente: 1,
              proyecto: 1,
              titular: 1,
              ejecutivo: 1,
              tipoCarga: 1,
              usuario: 1,
              tipoMovimiento: 1,
              giro: 1,
              pais: 1,
              fechaAlta: 1,
              poliza: {
                _id: '$poliza._id',
                fechaVigencia: '$poliza.fechaVigencia',
                riesgo: '$riesgo',
                unidad: '$unidad',
                aseguradora: '$aseguradora',
              },
            },
          },
        ])
        .exec();
  }


}
