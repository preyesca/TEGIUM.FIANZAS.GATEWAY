import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatUnidadDocument = HydratedDocument<CatUnidad>;

@Schema({
  collection: SchemaPrefix.setCAT('unidades'),
  timestamps: false,
  versionKey: false,
})
export class CatUnidad {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatUnidadSchema = SchemaFactory.createForClass(CatUnidad);