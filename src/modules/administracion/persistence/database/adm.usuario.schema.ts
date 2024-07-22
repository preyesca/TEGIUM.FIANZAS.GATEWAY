import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from './adm.proyecto.schema';

export type AdmUsuarioDocument = HydratedDocument<AdmUsuario>;

@Schema({
  collection: SchemaPrefix.setADM('usuarios'),
  timestamps: false,
  versionKey: false,
})
export class AdmUsuario {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  primerApellido: string;

  @Prop({ required: false })
  segundoApellido: string;

  @Prop({ required: true, unique: true })
  correoElectronico: string;

  @Prop({ required: false })
  contrasena: string;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyectos: [];

  @Prop({ required: true })
  estatus: number;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ required: false, default: Date.now })
  fechaCreacion: Date;

  @Prop({ default: 0 })
  intentos: number;
}

export const AdmUsuarioSchema = SchemaFactory.createForClass(AdmUsuario);
