import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export class Historial {

  @Prop({ required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  autorizado: boolean;
  
}

export type FlowListaNegraDocument =
  HydratedDocument<FlowListaNegra>;

@Schema({
  collection: SchemaPrefix.setFLUJO('folios-autorizados'),
  timestamps: false,
  versionKey: false,
})
export class FlowListaNegra {

  @Prop({ required: true })
  folio: Types.ObjectId;

  @Prop({ required: true })
  folioCliente: string;

  @Prop({ required: true })
  historial: [Historial];
}

export const FlowListaNegraSchema =
  SchemaFactory.createForClass(FlowListaNegra);
