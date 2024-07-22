import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { FlowFirmaEjecutivoArchivo } from './flow.firma-ejecutivo-archivo.schema';

export type FlowFirmaEjecutivoDocument = HydratedDocument<FlowFirmaEjecutivo>;

@Schema({
  collection: SchemaPrefix.setFLUJO('firma-ejecutivo'),
  timestamps: false,
  versionKey: false,
})
export class FlowFirmaEjecutivo {
  @Prop({ required: true })
  folio: Types.ObjectId;

  @Prop({ required: false })
  archivoFic?: Types.ObjectId;

  @Prop({ required: false })
  archivoAnexo?: Types.ObjectId;
 
  @Prop({ required: true })
  archivos: Array<FlowFirmaEjecutivoArchivo>;
}

export const FlowFirmaEjecutivoSchema =
  SchemaFactory.createForClass(FlowFirmaEjecutivo);
