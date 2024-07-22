import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { encrypt } from 'src/app/utils/generator/password.generator';
import { AdmUsuarioDto } from '../../domain/dto/adm.usuario.dto';
import { AdmUsuario, AdmUsuarioDocument } from '../database/adm.usuario.schema';

@Injectable()
export class AdmUsuarioRepository {
  constructor(
    @InjectModel(AdmUsuario.name)
    private readonly admUsuarioModel: ModelExt<AdmUsuarioDocument>,
  ) {}

  async create(createDto: AdmUsuarioDto): Promise<AdmUsuario> {
    const created = new this.admUsuarioModel(createDto);
    return await created.save();
  }

  async activateAccount(
    id: string,
    password: string,
    estatus: number,
  ): Promise<AdmUsuario> {
    return await this.admUsuarioModel
      .findByIdAndUpdate(id, {
        contrasena: encrypt(password),
        estatus,
      })
      .exec();
  }

  async findAll(): Promise<any> {
    return await this.admUsuarioModel.paginate(
      { activo: true },
      { select: '-contrasena', limit: 100 },
    );
  }

  async paginateAll(
    proyecto: string | undefined,
    paginate: IPaginateParams,
  ): Promise<any> {
    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    let agregateData: any[] = [
      {
        $match: {
          $or: [
            { nombre: { $regex: paginate.search, $options: 'i' } },
            { primerApellido: { $regex: paginate.search, $options: 'i' } },
            { segundoApellido: { $regex: paginate.search, $options: 'i' } },
            { correoElectronico: { $regex: paginate.search, $options: 'i' } },
          ],
          $and: [{ activo: true }],
        },
      },
      {
        $project: {
          contrasena: 0,
          proyecto: 0,
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

    // if (proyecto) {
    //   filter['proyectos.proyecto'] = new Types.ObjectId(proyecto);
    // }

    const agregate = this.admUsuarioModel.aggregate(agregateData, {
      collation: { locale: 'en' },
    });

    return await this.admUsuarioModel.aggregatePaginate(agregate, options);
  }

  async findOne(id: string): Promise<AdmUsuario> {
    return await this.admUsuarioModel.findById(id).select('-contrasena').exec();
  }

  async findName(id: string): Promise<AdmUsuario> {
    return await this.admUsuarioModel.findById(id).select('nombre').exec();
  }

  async findByEmailAddress(emailAddress: string): Promise<AdmUsuario> {
    return await this.admUsuarioModel
      .findOne({ correoElectronico: emailAddress })
      .exec();
  }

  async update(id: string, updateDto: AdmUsuarioDto): Promise<AdmUsuario> {
    return await this.admUsuarioModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
  }

  async updatePassword(id: string, password: string) {
    return await this.admUsuarioModel
      .findByIdAndUpdate(id, {
        contrasena: encrypt(password),
      })
      .exec();
  }

  async selectIn(ids: string[]): Promise<AdmUsuario[]> {
    return await this.admUsuarioModel.find({ _id: { $in: ids } }).exec();
  }

  async updateIntentos(id: string, intento: number) {
    if (intento == 3) {
      return await this.admUsuarioModel
        .findByIdAndUpdate(
          id,
          {
            intentos: intento,
            estatus: 3,
          },
          { new: true },
        )
        .exec();
    }

    return await this.admUsuarioModel
      .findByIdAndUpdate(
        id,
        {
          intentos: intento,
        },
        { new: true },
      )
      .exec();
  }

  async findManyByPerfilProyecto(
    proyecto: string,
    perfil: number,
  ): Promise<any> {
    const matchQuery: any[] = [
      {
        $match: {
          'proyectos.proyecto': { $eq: new Types.ObjectId(proyecto) },
          'proyectos.perfiles': {
            $elemMatch: {
              $eq: perfil,
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          id: '$_id',
          nombreCompleto: {
            $concat: [
              '$nombre',
              ' ',
              '$primerApellido',
              ' ',
              '$segundoApellido',
            ],
          },
          correoElectronico: 1,
        },
      },
    ];
    return await this.admUsuarioModel.aggregate(matchQuery);
  }

  async selectManyIn(ids: string[]): Promise<AdmUsuario[]> {
    const objIds = ids.map((id) => new Types.ObjectId(id));

    return await this.admUsuarioModel
      .aggregate([
        { $match: { _id: { $in: objIds } } },
        {
          $project: {
            _id: 0,
            id: '$_id',
            nombre: {
              $concat: [
                '$nombre',
                ' ',
                '$primerApellido',
                ' ',
                '$segundoApellido',
              ],
            },
          },
        },
      ])
      .exec();
  }
}
