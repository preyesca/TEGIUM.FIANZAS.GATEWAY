import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatRamoDocument = HydratedDocument<CatRamo>;

@Schema({
  collection: SchemaPrefix.setCAT('ramos'),
  timestamps: false,
  versionKey: false,
})
export class CatRamo {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatRamoSchema = SchemaFactory.createForClass(CatRamo);
