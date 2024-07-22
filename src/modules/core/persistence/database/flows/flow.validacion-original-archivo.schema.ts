import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type FlowValidacionOriginalesArchivoDocument =
  HydratedDocument<FlowValidacionOriginalArchivos>;

export class FlowValidacionOriginalArchivos {
  @Prop({ required: true })
  documento: Types.ObjectId;

  @Prop({ required: true })
  expediente: Types.ObjectId;

  @Prop({ required: true, default: false })
  correcto: boolean;

  @Prop({ required: false })
  motivo?: mongoose.Types.ObjectId;

}

export const FlowValidacionOriginalArchivoSchema =
  SchemaFactory.createForClass(FlowValidacionOriginalArchivos);