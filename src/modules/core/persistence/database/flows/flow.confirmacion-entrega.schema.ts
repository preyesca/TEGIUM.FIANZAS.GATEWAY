import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { FlowConfirmacionEntregaArchivo } from './flow.confirmacion-entrega-archivo.schema';

export type FlowConfirmacionEntregaDocument = HydratedDocument<FlowConfirmacionEntrega>;

@Schema({
  collection: SchemaPrefix.setFLUJO('confirmacion-entrega'),
  timestamps: false,
  versionKey: false,
})
export class FlowConfirmacionEntrega {
  @Prop({ required: true })
  folio: Types.ObjectId;

  @Prop({ required: true })
  entregado: boolean;

  @Prop({ required: true })
  archivos: Array<FlowConfirmacionEntregaArchivo>;
}

export const FlowConfirmacionEntregaSchema = 
  SchemaFactory.createForClass(FlowConfirmacionEntrega);
