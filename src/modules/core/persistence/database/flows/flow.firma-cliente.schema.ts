import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { FlowFirmaClienteArchivo } from './flow.firma-cliente-archivo.schema';

export type FlowFirmaClienteDocument = HydratedDocument<FlowFirmaCliente>;

@Schema({
  collection: SchemaPrefix.setFLUJO('firma-cliente'),
  timestamps: false,
  versionKey: false,
})
export class FlowFirmaCliente {
  @Prop({ required: true })
  folio: Types.ObjectId;

  @Prop({ required: false })
  archivoFic?:  mongoose.Types.ObjectId ;

  @Prop({ required: false })
  archivoAnexo?:  mongoose.Types.ObjectId ;

  @Prop({ required: true })
  archivos: Array<FlowFirmaClienteArchivo>;
}

export const FlowFirmaClienteSchema =
  SchemaFactory.createForClass(FlowFirmaCliente);
