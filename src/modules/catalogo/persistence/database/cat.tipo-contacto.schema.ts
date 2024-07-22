import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatTipoContactoDocument = HydratedDocument<CatTipoContacto>;

@Schema({
  collection: SchemaPrefix.setCAT('tipos-contacto'),
  timestamps: false,
  versionKey: false,
})
export class CatTipoContacto {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatTipoContactoSchema =
  SchemaFactory.createForClass(CatTipoContacto);
