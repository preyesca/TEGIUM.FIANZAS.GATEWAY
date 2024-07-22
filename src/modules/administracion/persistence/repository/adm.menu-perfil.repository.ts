import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdmMenuPerfilDto } from '../../domain/dto/adm.menu-perfil.dto';
import {
  AdmMenuPerfil,
  AdmMenuPerfilDocument,
} from '../database/adm.menu-perfil.schema';

@Injectable()
export class AdmMenuPerfilRepository {
  constructor(
    @InjectModel(AdmMenuPerfil.name)
    private readonly admMenuPerfilModel: Model<AdmMenuPerfilDocument>,
  ) {}

  async findByPerfil(proyecto: string, perfil: number): Promise<AdmMenuPerfil> {
    return await this.admMenuPerfilModel.findOne({
      perfil,
      proyecto: new Types.ObjectId(proyecto),
    });
  }

  async createMany(menus: AdmMenuPerfilDto[]) {
    return await this.admMenuPerfilModel.insertMany(menus);
  }
}
