import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatMotivoRechazoDocument = HydratedDocument<CatMotivoRechazo>;

@Schema({
  collection: SchemaPrefix.setCAT('motivos-rechazo'),
  timestamps: false,
  versionKey: false,
})
export class CatMotivoRechazo {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}
export const CatMotivoRechazoSchema =
  SchemaFactory.createForClass(CatMotivoRechazo);
