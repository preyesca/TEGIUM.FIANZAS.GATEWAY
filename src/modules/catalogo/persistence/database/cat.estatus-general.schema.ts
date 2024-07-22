import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatEstatusGeneralDocument = HydratedDocument<CatEstatusGeneral>;

@Schema({
  collection: SchemaPrefix.setCAT('estatus-generales'),
  timestamps: false,
  versionKey: false,
})
export class CatEstatusGeneral {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatEstatusGeneralSchema =
  SchemaFactory.createForClass(CatEstatusGeneral);
