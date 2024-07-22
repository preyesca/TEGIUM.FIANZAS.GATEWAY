import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { ExpArchivoDto } from '../../domain/helpers/dto/exp.archivo.dto';
import { ExpArchivo, ExpArchivoDocument } from '../database/exp.archivo.schema';

@Injectable()
export class ExpArchivoRepository {
  constructor(
    @InjectModel(ExpArchivo.name)
    private readonly expArchivoModel: ModelExt<ExpArchivoDocument>,
  ) { }

  async create(data: ExpArchivoDto) {
    const created = new this.expArchivoModel(data);
    return await created.save();
  }

  async findAll() {
    return await this.expArchivoModel.paginate({}, { limit: 100 });
  }

  async selectByDetalle(proyecto: string, tipoPersona: string) {
    return await this.expArchivoModel
      .find({ proyecto: proyecto, tipoPersona: tipoPersona })
      .exec();
  }

  async delete(id: string) {
    return this.expArchivoModel.updateMany(
      { _id: new Types.ObjectId(id) },
      { $set: { eliminado: true } },
    );
  }

  async checkExist(pais: string, categoria: string, documento: string) {
    const regexPais = new RegExp(pais, 'i');
    const regexCategoria = new RegExp(categoria, 'i');
    const regexDocumento = new RegExp(documento, 'i');

    return await this.expArchivoModel
      .find({
        pais: regexPais,
        categoria: regexCategoria,
        documento: regexDocumento,
      })
      .exec();
  }

  async checkVersion(
    aseguradora: Types.ObjectId,
    titular: Types.ObjectId,
    documento: Types.ObjectId,
  ): Promise<ExpArchivo> {
    return await this.expArchivoModel
      .findOne({
        aseguradora: aseguradora,
        titular: titular,
        documento: documento,
      })
      .exec();
  }

  async findOne(id: string): Promise<ExpArchivo> {
    return await this.expArchivoModel
      .findOne({ _id: new Types.ObjectId(id) })
      .exec();
  }

  async select_in(data) {
    return await this.expArchivoModel.find({ _id: { $in: data } }).exec();
  }

  async selectByTitular(titular: string) {
    return await this.expArchivoModel
      .find({
        titular: new Types.ObjectId(titular),
        eliminado: false
      })
      .exec();
  }

  async selectByTitularPaginated(titular: string, paginate) {
    let matchQuery: any[] = [
      {
        $match: {
          titular: { $eq: new Types.ObjectId(titular) },
          eliminado: { $eq: false },
        },
      },
    ];

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      options.sort = {
        [paginate.order]: paginate.sort,
      };
    }

    const agregate = this.expArchivoModel.aggregate(matchQuery);
    const findTitular = await this.expArchivoModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!findTitular || findTitular.docs.length == 0) return null;

    return findTitular;
  }

  async selectByTitularPaginatedCotejo(titular: string) {
    return await this.expArchivoModel
      .find({
        titular: new Types.ObjectId(titular),
        eliminado: false,
      })
      .sort({ fechaHoraAlta: 1 })
      .exec();
  }

  async selectByTitularAndTypeDocument(titular: string, documento?: string) {
    return await this.expArchivoModel
      .find({
        titular: new Types.ObjectId(titular),
        documento: new Types.ObjectId(documento),
      })
      .exec();
  }

  async update(id: Types.ObjectId, data: any) {
    return await this.expArchivoModel.findOneAndUpdate(id, data, { new: true });
  }

  async getDocumentosByTitular(titular) {
    return await this.expArchivoModel.find({
      titular: new Types.ObjectId(titular),
      eliminado: false,
    });
  }
}
