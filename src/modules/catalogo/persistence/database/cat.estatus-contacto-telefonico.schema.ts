import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatEstatusContactoTelefonicoDocument =
  HydratedDocument<CatEstatusContactoTelefonico>;

@Schema({
  collection: SchemaPrefix.setCAT('estatus-contacto-telefonico'),
  timestamps: false,
  versionKey: false,
})
export class CatEstatusContactoTelefonico {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatEstatusContactoTelefonicoSchema = SchemaFactory.createForClass(
  CatEstatusContactoTelefonico,
);
