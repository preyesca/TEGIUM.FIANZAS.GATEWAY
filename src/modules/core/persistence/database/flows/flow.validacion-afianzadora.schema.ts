import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { FlowValidacionAfianzadoraArchivos } from './flow.validacion-afianzadora-archivos.schema';

export type FlowValidacionAfianzadoraDocument = HydratedDocument<FlowValidacionAfianzadora>;

@Schema({
  collection: SchemaPrefix.setFLUJO('flujo-validacion-afianzadora'),
  timestamps: false,
  versionKey: false,
})
export class FlowValidacionAfianzadora {
  @Prop({ required: true })
    folio: Types.ObjectId;

    @Prop({ required: true })
    archivos: Array<FlowValidacionAfianzadoraArchivos>;
}

export const FlowValidacionAfianzadoraSchema =
  SchemaFactory.createForClass(FlowValidacionAfianzadora);
