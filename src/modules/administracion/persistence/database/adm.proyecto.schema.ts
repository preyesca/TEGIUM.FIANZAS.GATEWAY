import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmAseguradora } from './adm.aseguradora.schema';

export type AdmProyectoDocument = HydratedDocument<AdmProyecto>;

@Schema({
  collection: SchemaPrefix.setADM('proyectos'),
  timestamps: false,
  versionKey: false,
})
export class AdmProyecto {
  _id: Types.ObjectId;

  @Prop({ required: true })
  pais: number;

  @Prop({ required: true })
  ramo: number;

  @Prop({ required: true })
  proceso: number;

  @Prop({ required: true })
  negocio: number;

  @Prop({ required: true })
  ceco: string;

  @Prop({ required: true })
  estatus: number;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmAseguradora.name })
  aseguradora: Types.ObjectId;

  @Prop({ required: true })
  codigo: string;

  @Prop({ required: false })
  portal: string;
}

export const AdmProyectoSchema = SchemaFactory.createForClass(AdmProyecto);
