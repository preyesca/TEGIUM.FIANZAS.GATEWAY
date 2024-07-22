import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FlowConfirmacionEntregaArchivoDocument =
  HydratedDocument<FlowConfirmacionEntregaArchivo>;

export class FlowConfirmacionEntregaArchivo {

  @Prop({ required: true })
  expediente: Types.ObjectId;

  @Prop({ required: true })
  usuarioAlta: Types.ObjectId;

  @Prop({ default: Date.now, required: true })
  fechaHoraAlta: Date;
}

export const FlowConfirmacionEntregaArchivoSchema =
  SchemaFactory.createForClass(FlowConfirmacionEntregaArchivo);
