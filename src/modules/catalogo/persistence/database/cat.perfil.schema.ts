import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatPerfilDocument = HydratedDocument<CatPerfil>;

@Schema({
  collection: SchemaPrefix.setCAT('perfiles'),
  timestamps: false,
  versionKey: false,
})
export class CatPerfil {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}
export const CatPerfilSchema = SchemaFactory.createForClass(CatPerfil);
