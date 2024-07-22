import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatTipoPersonaDocument = HydratedDocument<CatTipoPersona>;

@Schema({
  collection: SchemaPrefix.setCAT('tipos-persona'),
  timestamps: false,
  versionKey: false,
})
export class CatTipoPersona {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  pais: number;

  @Prop({ default: true })
  activo: boolean;
}

export const CatTipoPersonaSchema =
  SchemaFactory.createForClass(CatTipoPersona);
