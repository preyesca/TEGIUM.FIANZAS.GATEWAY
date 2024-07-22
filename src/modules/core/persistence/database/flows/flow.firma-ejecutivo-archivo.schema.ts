import { Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type FlowFirmaEjecutivoArchivoDocument =
  HydratedDocument<FlowFirmaEjecutivoArchivo>;

export class FlowFirmaEjecutivoArchivo {
  @Prop({ required: true })
  documento: Types.ObjectId;

  @Prop({ required: true, default: false })
  correcto: boolean;

  @Prop({ required: false })
  motivo?: mongoose.Types.ObjectId;

  @Prop({ required: true })
  usuarioAlta: Types.ObjectId;

  @Prop({ default: Date.now, required: true })
  fechaHoraAlta: Date;
}

export const FlowFirmaEjecutivoArchivoSchema = SchemaFactory.createForClass(
  FlowFirmaEjecutivoArchivo,
);
