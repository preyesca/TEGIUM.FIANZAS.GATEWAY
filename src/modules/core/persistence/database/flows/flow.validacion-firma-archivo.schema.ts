import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type FlowValidacionFirmaArchivoDocument =
  HydratedDocument<FlowValidacionFirmaArchivo>;

export class FlowValidacionFirmaArchivo {

  @Prop({ required: true })
  expediente: Types.ObjectId;

  @Prop({ required: true })
  documento: Types.ObjectId;

  @Prop({ required: true, default: false })
  correcto: boolean;

  @Prop({ required: false })
  motivo?: mongoose.Types.ObjectId;

}

export const FlowValidacionFirmaArchivoSchema = SchemaFactory.createForClass(
  FlowValidacionFirmaArchivo,
);
