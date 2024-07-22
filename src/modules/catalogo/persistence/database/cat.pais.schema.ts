import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatPaisDocument = HydratedDocument<CatPais>;

@Schema({
  collection: SchemaPrefix.setCAT('paises'),
  timestamps: false,
  versionKey: false,
})
export class CatPais {
  _id: Types.ObjectId;

  @Prop({ type: Number, required: true, unique: true })
  clave: number;

  @Prop({ type: String, required: true })
  descripcion: string;

  @Prop({ type: String, required: true })
  zonaHoraria: string;

  @Prop({ type: String, required: true })
  abreviatura: string;

  @Prop({ type: String, required: false })
  icon: string;

  @Prop({ type: Boolean, default: true })
  activo: boolean;
}

export const CatPaisSchema = SchemaFactory.createForClass(CatPais);
