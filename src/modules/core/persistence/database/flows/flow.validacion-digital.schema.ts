import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { FlowValidacionDigitalArchivo } from './flow.validacion-digital-archivo.schema';

export type FlowValidacionDigitalDocument =
  HydratedDocument<FlowValidacionDigital>;

@Schema({
  collection: SchemaPrefix.setFLUJO('validacion-documental'),
  timestamps: false,
  versionKey: false,
})
export class FlowValidacionDigital {
  @Prop({ required: true })
  folio: Types.ObjectId;

  @Prop({ required: false })
  archivoFic?: Types.ObjectId;

  @Prop({ required: false })
  archivoAnexo?: Types.ObjectId;

  @Prop({ required: true })
  archivos: Array<FlowValidacionDigitalArchivo>;
}

export const FlowValidacionDigitalSchema = SchemaFactory.createForClass(
  FlowValidacionDigital,
);
