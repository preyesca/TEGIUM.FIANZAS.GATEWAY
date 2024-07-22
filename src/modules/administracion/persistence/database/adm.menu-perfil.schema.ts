import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from './adm.proyecto.schema';

export type AdmMenuPerfilDocument = HydratedDocument<AdmMenuPerfil>;

@Schema({
  collection: SchemaPrefix.setADM('menus-perfil'),
  timestamps: false,
  versionKey: false,
})
export class AdmMenuPerfil {
  @Prop({ type: Types.ObjectId, ref: AdmProyecto.name, default: null })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  perfil: number;

  @Prop({ required: true })
  pathInicial: string;

  @Prop({ required: true })
  modulos: Array<AdmModulo>;
}

export class AdmModulo {
  descripcion: string;
  menus: Array<AdmMenu>;
  orden: number;
}

export class AdmMenu {
  descripcion: string;
  icono: string;
  path: string;
  submenus: Array<AdmSubMenu>;
  orden: number;
}

export class AdmSubMenu {
  descripcion: string;
  path: string;
  orden: number;
}

export const AdmMenuPerfilSchema = SchemaFactory.createForClass(AdmMenuPerfil);
