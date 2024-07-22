import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { CoreActividadesDetalleDto, CoreComentarioActividadDto } from '../../domain/helpers/dto/core.comentario.dto';
import {
  CoreComentario,
  CoreComentarioDocument,
} from '../database/core.comentario.schema';
import { EComentario } from '../../domain/helpers/enum/core.comentario';

@Injectable()
export class CoreComentarioRepository {
  constructor(
    @InjectModel(CoreComentario.name)
    private readonly coreComentarioModel: ModelExt<CoreComentarioDocument>,
  ) { }

  async create(data: CoreComentarioActividadDto) {
    const created = new this.coreComentarioModel(data);
    return await created.save();
  }

  async findByFolioActividad(folio: string): Promise<CoreComentario[]> {
    return await this.coreComentarioModel.find({ folio: new Types.ObjectId(folio) }).exec();
  }

  async findOne(folio: string, actividad: number): Promise<any> {
    return await this.coreComentarioModel.aggregate([
      {
        $match: {
          folio: new Types.ObjectId(folio),
          'actividades.actividad': actividad,
        },
      },
      {
        $unwind: '$actividades',
      },
      {
        $match: {
          'actividades.actividad': actividad,
        },
      },
      {
        $sort: {
          'actividades.fecha': -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $project: {
          _id: 1,
          folio: 1,
          actividades: '$actividades',
        },
      },
    ]);
  }

  async updateNewObjet(folio: Types.ObjectId, newRegister: CoreActividadesDetalleDto) {
    const documento = await this.coreComentarioModel
      .findOne({ folio: new Types.ObjectId(folio) })
      .exec();
    const indiceUltimaActividad = Math.max(documento.actividades.length - 1, 0);

    await this.coreComentarioModel.updateOne(
      { _id: new Types.ObjectId(documento._id) },
      {
        $push: {
          actividades: {
            $each: [newRegister],
            $position: indiceUltimaActividad + 1,
          },
        },
      },
    );

    return await this.coreComentarioModel
      .findOne({ folio: new Types.ObjectId(folio) })
      .exec();
  } //addNewActividad

  async updateNull(folio: Types.ObjectId, bitacora: Types.ObjectId) {
    const folioObjectId = new Types.ObjectId(folio);

    await this.coreComentarioModel.updateMany(
      { folio: folioObjectId, 'actividades.bitacora': null },
      { $set: { 'actividades.$[element].bitacora': bitacora } },
      { arrayFilters: [{ 'element.bitacora': null }] },
    );

    return await this.coreComentarioModel.findOne({ folio: folioObjectId }).exec();
  } //addBitacoraToNull

  async findOneFolioActividad(folio: string, actividad: number) {
    let comentarios: string = ''
    const data = await this.coreComentarioModel.findOne({ folio: new Types.ObjectId(folio) })

    if (data.actividades != null) {
      const actividades = data.actividades
        .filter((elemento) => !elemento.comentarios.includes(EComentario.BITACORA_TRANSICION)
          && elemento.actividad === actividad)
        .sort((a: any, b: any) => a.fecha - b.fecha)
        .pop();

      if (actividades) comentarios = actividades.comentarios;
    }
    return {
      _id: 0,
      comentarios
    }
  }

  async update(folio: string, comentario: string) {
    const folioObjectId = new Types.ObjectId(folio);
    await this.coreComentarioModel.updateMany(
      { folio: folioObjectId, 'actividades.bitacora': null },
      { $set: { 'actividades.$[element].comentarios': comentario } },
      { arrayFilters: [{ 'element.bitacora': null }] },
    );

    return await this.coreComentarioModel.findOne({ folio: folioObjectId }).exec();
  }


}
