import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatEstatusUsuarioDocument = HydratedDocument<CatEstatusUsuario>;

@Schema({
  collection: SchemaPrefix.setCAT('estatus-usuario'),
  timestamps: false,
  versionKey: false,
})
export class CatEstatusUsuario {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatEstatusUsuarioSchema =
  SchemaFactory.createForClass(CatEstatusUsuario);
