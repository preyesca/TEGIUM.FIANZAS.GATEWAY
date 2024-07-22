import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatEstatusActividadDocument = HydratedDocument<CatEstatusActividad>;

@Schema({
  collection: SchemaPrefix.setCAT('estatus-actividades'),
  timestamps: false,
  versionKey: false,
})
export class CatEstatusActividad {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatEstatusActividadSchema =
  SchemaFactory.createForClass(CatEstatusActividad);
