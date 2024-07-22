import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatTipoCargaDocument = HydratedDocument<CatTipoCarga>;

@Schema({
  collection: SchemaPrefix.setCAT('tipos-carga'),
  timestamps: false,
  versionKey: false,
})
export class CatTipoCarga {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatTipoCargaSchema = SchemaFactory.createForClass(CatTipoCarga);
