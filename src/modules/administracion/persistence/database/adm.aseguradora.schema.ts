import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type AdmAseguradoraDocument = HydratedDocument<AdmAseguradora>;

@Schema({
  collection: SchemaPrefix.setADM('aseguradoras'),
  timestamps: false,
  versionKey: false,
})
export class AdmAseguradora {
  @Prop({ required: true })
  nombreComercial: string;

  @Prop({ required: true })
  razonSocial: string;

  @Prop({ required: true })
  pais: number;

  @Prop({ required: true, type: Array<Number>, default: undefined })
  oficinas: Array<number>;

  @Prop({ required: true })
  estatus: number;

  @Prop({ required: true, default: false })
  altaProyecto: boolean;

  @Prop({ required: true, default: true })
  documentos: boolean;

  _id: Types.ObjectId
}

export const AdmAseguradoraSchema =
  SchemaFactory.createForClass(AdmAseguradora);
