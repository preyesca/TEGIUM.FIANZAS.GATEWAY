import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatReporteDocument = HydratedDocument<CatReporte>;

@Schema({
  collection: SchemaPrefix.setCAT('reportes'),
  timestamps: false,
  versionKey: false,
})
export class CatReporte {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatReporteSchema = SchemaFactory.createForClass(CatReporte);
