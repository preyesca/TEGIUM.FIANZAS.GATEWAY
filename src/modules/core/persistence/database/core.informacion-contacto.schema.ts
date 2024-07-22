import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { CoreFolio } from './core.folio.schema';

export type CoreInformacionContactoDocument =
  HydratedDocument<CoreInformacionContacto>;

@Schema({
  collection: SchemaPrefix.setCORE('informacion-contacto'),
  timestamps: false,
  versionKey: false,
})
export class CoreInformacionContacto {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolio.name })
  folio: Types.ObjectId;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  tipo: number;

  @Prop({ required: false })
  correos: [String];
}

export const CoreInformacionContactoSchema = SchemaFactory.createForClass(
  CoreInformacionContacto,
);
