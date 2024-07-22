import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CoreComentarioDetalleDocument =
  HydratedDocument<CoreComentarioDetalle>;

export class CoreComentarioDetalle {
  _id: Types.ObjectId;

  @Prop({ required: false })
  bitacora: Types.ObjectId;

  @Prop({ required: true })
  comentarios: string;

  @Prop({ required: true })
  actividad: number;

  @Prop({ default: Date.now, required: true })
  fecha: Date;
}

export const CoreComentarioDetalleSchema = SchemaFactory.createForClass(
  CoreComentarioDetalle,
);
