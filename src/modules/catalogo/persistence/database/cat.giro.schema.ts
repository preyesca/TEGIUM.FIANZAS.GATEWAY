import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatGiroDocument = HydratedDocument<CatGiro>;

@Schema({
  collection: SchemaPrefix.setCAT('giros'),
  timestamps: false,
  versionKey: false,
})
export class CatGiro {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatGiroSchema = SchemaFactory.createForClass(CatGiro);
