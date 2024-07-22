import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatRiesgoDocument = HydratedDocument<CatRiesgo>;

@Schema({
  collection: SchemaPrefix.setCAT('riesgos'),
  timestamps: false,
  versionKey: false,
})
export class CatRiesgo {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatRiesgoSchema = SchemaFactory.createForClass(CatRiesgo);
