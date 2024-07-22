import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatActividadDocument = HydratedDocument<CatActividad>;

@Schema({
  collection: SchemaPrefix.setCAT('actividades'),
  timestamps: false,
  versionKey: false,
})
export class CatActividad {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatActividadSchema = SchemaFactory.createForClass(CatActividad);
