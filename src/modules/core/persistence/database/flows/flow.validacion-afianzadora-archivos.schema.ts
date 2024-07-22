import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FlowValidacionAfianzadoraDocument = 
HydratedDocument<FlowValidacionAfianzadoraArchivos>;

export class FlowValidacionAfianzadoraArchivos {
  @Prop({ required: true })
  expediente: Types.ObjectId;

  @Prop({ required: true })
  documento: Types.ObjectId;

  @Prop({ required: true, default: false })
  correcto: boolean;

  @Prop({ required: false })
  motivo?:number
}

export const FlowValidacionAfianzadoraArchivosSchema =
  SchemaFactory.createForClass(FlowValidacionAfianzadoraArchivos
    );
