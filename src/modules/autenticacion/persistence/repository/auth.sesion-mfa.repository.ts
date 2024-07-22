import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthSesionMfaDto } from '../../domain/dto/auth.sesion-mfa.dto';
import {
  AuthSesionMfa,
  AuthSesionMfaDocument,
} from '../database/auth.sesion-mfa.schema';

@Injectable()
export class AuthSesionMfaRepository {
  constructor(
    @InjectModel(AuthSesionMfa.name)
    private readonly authSesionMfaModel: Model<AuthSesionMfaDocument>,
  ) {}

  async create(data: AuthSesionMfaDto): Promise<AuthSesionMfa> {
    const sesionMfa = await this.findOneByEmail(data.correo);
    data.codigo = Math.floor(100 + Math.random() * 900);

    const created = new this.authSesionMfaModel({
      usuarioId: data.usuarioId
        ? new Types.ObjectId(data.usuarioId)
        : undefined,
      codigo: data.codigo,
      correo: data.correo,
      fechaExpiracion: new Date(Date.now() + 60 * 1000 * 5),
    });

    if (sesionMfa) {
      return await this.authSesionMfaModel
        .findOneAndUpdate(
          { correo: data.correo },
          {
            $set: {
              codigo: created.codigo,
              fechaExpiracion: created.fechaExpiracion,
              correo: data.correo,
              estatus: 1,
            },
          },
          { new: true },
        )
        .exec();
    }
    return await created.save();
  }

  async findOneByUsuario(usuarioId: string): Promise<AuthSesionMfa> {
    return await this.authSesionMfaModel
      .findOne({ usuarioId: new Types.ObjectId(usuarioId) })
      .exec();
  }

  async findOneByEmail(correo: string): Promise<AuthSesionMfa> {
    return await this.authSesionMfaModel.findOne({ correo }).exec();
  }

  async confirm(data: AuthSesionMfaDto): Promise<AuthSesionMfa> {
    const sesionMfa = await this.findOneByEmail(data.correo);
    if (sesionMfa.codigo === data.codigo && sesionMfa.estatus === 1) {
      return await this.authSesionMfaModel
        .findOneAndUpdate(
          { correo: data.correo },
          {
            $set: {
              estatus: 0,
            },
          },
          { new: true },
        )
        .exec();
    }
    return undefined;
  }
}
