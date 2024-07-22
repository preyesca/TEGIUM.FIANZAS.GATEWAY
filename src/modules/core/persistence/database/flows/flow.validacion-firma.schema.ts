import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { FlowValidacionFirmaArchivo } from './flow.validacion-firma-archivo.schema';

export type FlowValidacionFirmaDocument = HydratedDocument<FlowValidacionFirma>;

@Schema({
  collection: SchemaPrefix.setFLUJO('validacion-firmas'),
  timestamps: false,
  versionKey: false,
})
export class FlowValidacionFirma {
  @Prop({ required: true })
  folio: Types.ObjectId;

  @Prop({ required: true })
  archivos: Array<FlowValidacionFirmaArchivo>;
}

export const FlowValidacionFirmaSchema =
  SchemaFactory.createForClass(FlowValidacionFirma);
