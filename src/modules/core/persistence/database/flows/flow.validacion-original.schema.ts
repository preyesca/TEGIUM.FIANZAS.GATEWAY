import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { FlowValidacionOriginalArchivos } from './flow.validacion-original-archivo.schema';

export type FlowValidacionOriginalDocument = HydratedDocument<FlowValidacionOriginal>;

@Schema({
  collection: SchemaPrefix.setFLUJO('validacion-originales'),
  timestamps: false,
  versionKey: false,
})
export class FlowValidacionOriginal {
  @Prop({ required: true })
  folio: Types.ObjectId;

  @Prop({ required: true })
  archivos: Array<FlowValidacionOriginalArchivos>;
}

export const FlowValidacionOriginalSchema =
  SchemaFactory.createForClass(FlowValidacionOriginal);
