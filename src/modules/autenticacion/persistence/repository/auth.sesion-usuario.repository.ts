import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import {
  AuthSesionUsuario,
  AuthSesionUsuarioDocument,
} from '../database/auth.sesion-usuario.schema';

@Injectable()
export class AuthSesionUsuarioRepository {
  constructor(
    @InjectModel(AuthSesionUsuario.name)
    private readonly usuarioSesionModel: ModelExt<AuthSesionUsuarioDocument>,
  ) {}

  async create(usuario: Types.ObjectId): Promise<AuthSesionUsuario> {
    const created = new this.usuarioSesionModel({ usuario });
    return await created.save();
  }

  async findOne(usuario: string): Promise<AuthSesionUsuario> {
    return await this.usuarioSesionModel
      .findOne({ usuario: new Types.ObjectId(usuario), fechaFin: null })
      .exec();
  }

  async signOff(id: string): Promise<AuthSesionUsuario> {
    return await this.usuarioSesionModel
      .findByIdAndUpdate(id, { fechaFin: new Date() }, { new: true })
      .exec();
  }


  async updateFechaLogin(id: string): Promise<AuthSesionUsuario> {
    return await this.usuarioSesionModel
      .findByIdAndUpdate(id, { fechaLogin: new Date() }, { new: true })
      .exec();
  }

  selectActive(): Promise<AuthSesionUsuario[]> {
    return this.usuarioSesionModel.find({ fechaFin: null }).exec()
  }
}
