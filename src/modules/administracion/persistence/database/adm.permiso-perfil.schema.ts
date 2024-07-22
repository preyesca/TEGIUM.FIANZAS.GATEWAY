import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from './adm.proyecto.schema';

export type AdmPermisoPerfilDocument = HydratedDocument<AdmPermisoPerfil>;

@Schema({
  collection: SchemaPrefix.setADM('permisos-perfil'),
  timestamps: false,
  versionKey: false,
})
export class AdmPermisoPerfil {
  @Prop({ type: Types.ObjectId, ref: AdmProyecto.name, default: null })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  perfil: number;

  @Prop({ required: true })
  permisos: Array<AdmPermiso>;
}
export const AdmPermisoPerfilSchema =
  SchemaFactory.createForClass(AdmPermisoPerfil);

export class AdmPermiso {
  descripcion: string;
  permiso: string;
}
