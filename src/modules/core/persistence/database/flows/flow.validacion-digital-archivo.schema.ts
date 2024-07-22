import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type FlowValidacionDigitalArchivoDocument =
  HydratedDocument<FlowValidacionDigitalArchivo>;

export class FlowValidacionDigitalArchivo {
  @Prop({ required: true })
  expediente: Types.ObjectId;

  @Prop({ required: true })
  documento: Types.ObjectId;

  @Prop({ required: true, default: false })
  correcto: boolean;

  @Prop({ required: false })
  motivo?:number
}

export const FlowValidacionDigitalArchivoSchema = SchemaFactory.createForClass(
  FlowValidacionDigitalArchivo,
);
