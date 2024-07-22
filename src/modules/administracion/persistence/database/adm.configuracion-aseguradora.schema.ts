import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export class OficinaCorreo {
  @Prop({ required: false, type: Number, default: undefined })
  oficina: number | undefined;

  @Prop({ required: true })
  correos: [String];
}

export type AdmConfiguracionAseguradoraDocument =
  HydratedDocument<AdmConfiguracionAseguradora>;

@Schema({
  collection: SchemaPrefix.setADM('configuracion-aseguradora'),
  timestamps: false,
  versionKey: false,
})
export class AdmConfiguracionAseguradora {
  @Prop({ required: true })
  pais: number;

  @Prop({ required: true, type: Types.ObjectId })
  aseguradora: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  oficinas: [OficinaCorreo];
}

export const AdmConfiguracionAseguradoraSchema = SchemaFactory.createForClass(
  AdmConfiguracionAseguradora,
);
