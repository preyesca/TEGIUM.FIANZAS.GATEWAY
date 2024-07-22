import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatNegocioDocument = HydratedDocument<CatNegocio>;

@Schema({
  collection: SchemaPrefix.setCAT('negocios'),
  timestamps: false,
  versionKey: false,
})
export class CatNegocio {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatNegocioSchema = SchemaFactory.createForClass(CatNegocio);
