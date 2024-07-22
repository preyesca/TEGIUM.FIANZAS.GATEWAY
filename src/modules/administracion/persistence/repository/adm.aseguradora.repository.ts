import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { Utilities } from 'src/app/utils/utilities';
import { AdmAseguradoraDto } from '../../domain/dto/adm.aseguradora.dto';
import {
  AdmAseguradora,
  AdmAseguradoraDocument,
} from '../database/adm.aseguradora.schema';

@Injectable()
export class AdmAseguradoraRepository {
  constructor(
    @InjectModel(AdmAseguradora.name)
    private readonly admAseguradoraDocument: ModelExt<AdmAseguradoraDocument>,
  ) {}

  async create(data: AdmAseguradoraDto) {
    const created = new this.admAseguradoraDocument(data);
    return await created.save();
  }

  async getAll(): Promise<Array<AdmAseguradora>> {
    return await this.admAseguradoraDocument.find().exec();
  }

  async selectAll(paginate: any) {
    return await this.admAseguradoraDocument.paginate({}, paginate);
  }

  async paginateAll(paginate: IPaginateParams) {
    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    let agregateData: any[] = [
      {
        $match: {
          $or: [
            { nombreComercial: { $regex: paginate.search, $options: 'i' } },
          ],
        },
      },
    ];

    if (paginate.order && paginate.sort) {
      options.sort = {
        [paginate.order]: paginate.sort,
      };
    }

    const agregate = this.admAseguradoraDocument.aggregate(agregateData, {
      collation: { locale: 'en' },
    });

    return await this.admAseguradoraDocument.aggregatePaginate(
      agregate,
      options,
    );
  }

  async selectAllOptionSelect() {
    return await this.admAseguradoraDocument
      .find()
      .select('razonSocial')
      .exec();
  }

  async findOne(id: string): Promise<AdmAseguradora> {
    return await this.admAseguradoraDocument.findById(id).exec();
  }

  async findOneAndGetNombreComercialById(id: string): Promise<AdmAseguradora> {
    return await this.admAseguradoraDocument
      .findById(id)
      .select('nombreComercial')
      .exec();
  }

  async selectByPais(idPais: number): Promise<Array<AdmAseguradora>> {
    return await this.admAseguradoraDocument.find({ pais: idPais }).exec();
  }

  async update(id: string, data: AdmAseguradoraDto) {
    return this.admAseguradoraDocument.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async checkExist(pais: number, nombreComercial: string, razonSocial: string) {
    const nombreComercialInput = Utilities.replaceText(nombreComercial);
    const razonSocialInput = Utilities.replaceText(razonSocial);

    const findAseguradoras = await this.admAseguradoraDocument
      .find({ pais })
      .exec();

    const updateAseguradoras = findAseguradoras.map((x) => {
      x.razonSocial = Utilities.replaceText(x.razonSocial);
      x.nombreComercial = Utilities.replaceText(x.nombreComercial);
      return x;
    });

    return (
      updateAseguradoras.filter(
        (x) =>
          x.razonSocial === razonSocialInput &&
          x.nombreComercial === nombreComercialInput,
      ).length > 0
    );
  }

  async selectIn(ids: string[]): Promise<Array<AdmAseguradora>> {
    return await this.admAseguradoraDocument.find({ _id: { $in: ids } }).exec();
  }

  async existsOneByRazonSocial(razonSocial: string): Promise<AdmAseguradora> {
    return await this.admAseguradoraDocument
      .findOne({ razonSocial })
      .select('_id')
      .exec();
  }

  async existsOneByNombreComercial(
    nombreComercial: string,
  ): Promise<AdmAseguradora> {
  
    const escapedNombreComercial = nombreComercial.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = new RegExp(`^${escapedNombreComercial}$`, 'i');

    return await this.admAseguradoraDocument
      .findOne({
        nombreComercial: {
          $regex: regexPattern,
        },
      })
      .select('_id')
      .exec();
  }

  async containsOficinaByClave(id: string, oficina: number): Promise<boolean> {
    const aseguradora = await this.admAseguradoraDocument
      .findById(id)
      .select('oficinas')
      .exec();
    return aseguradora ? aseguradora.oficinas.includes(oficina) : false;
  }
}
