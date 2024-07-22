import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdmPermisoPerfilDto } from '../../domain/dto/adm.permiso-perfil.dto';
import {
  AdmPermisoPerfil,
  AdmPermisoPerfilDocument,
} from '../database/adm.permiso-perfil.schema';

@Injectable()
export class AdmPermisoPerfilRepository {
  constructor(
    @InjectModel(AdmPermisoPerfil.name)
    private readonly admPermisoPerfilModel: Model<AdmPermisoPerfilDocument>,
  ) {}

  async createMany(permisos: AdmPermisoPerfilDto[]) {
    return await this.admPermisoPerfilModel.insertMany(permisos);
  }

  async findByPerfil(
    proyecto: string,
    perfil: number,
  ): Promise<AdmPermisoPerfil> {
    return await this.admPermisoPerfilModel.findOne({
      perfil,
      proyecto: new Types.ObjectId(proyecto),
    });
  }
}
