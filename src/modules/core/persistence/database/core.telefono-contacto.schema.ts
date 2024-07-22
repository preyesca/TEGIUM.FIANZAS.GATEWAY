import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { CoreFolio } from './core.folio.schema';

export type CoreTelefonoContactoDocument =
  HydratedDocument<CoreTelefonoContacto>;

@Schema({
  collection: SchemaPrefix.setCORE('telefono-contacto'),
  timestamps: false,
  versionKey: false,
})
export class CoreTelefonoContacto {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolio.name })
  folio: Types.ObjectId;

  @Prop({ required: false })
  telefono: string;

  @Prop({ required: false })
  extensiones: string[];
}

export const CoreTelefonoContactoSchema =
  SchemaFactory.createForClass(CoreTelefonoContacto);
