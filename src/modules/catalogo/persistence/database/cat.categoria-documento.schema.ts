import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatCategoriaDocumentoDocument =
  HydratedDocument<CatCategoriaDocumento>;

@Schema({
  collection: SchemaPrefix.setCAT('categorias-documento'),
  timestamps: false,
  versionKey: false,
})
export class CatCategoriaDocumento {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatCategoriaDocumentoSchema = SchemaFactory.createForClass(
  CatCategoriaDocumento,
);
