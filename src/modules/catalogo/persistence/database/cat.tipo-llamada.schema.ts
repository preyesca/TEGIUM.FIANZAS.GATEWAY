import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatTipoLlamadaDocument = HydratedDocument<CatTipoLlamada>;

@Schema({
  collection: SchemaPrefix.setCAT('tipos-llamada'),
  timestamps: false,
  versionKey: false,
})
export class CatTipoLlamada {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatTipoLlamadaSchema =
  SchemaFactory.createForClass(CatTipoLlamada);
