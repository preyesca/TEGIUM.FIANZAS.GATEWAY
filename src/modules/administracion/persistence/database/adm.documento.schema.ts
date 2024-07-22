import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type AdmDocumentoDocument = HydratedDocument<AdmDocumento>;

@Schema({
  collection: SchemaPrefix.setADM('documentos'),
  timestamps: false,
  versionKey: false,
})
export class AdmDocumento {
  @Prop({ required: true })
  pais: number;

  @Prop({ required: true })
  categoria: number;

  @Prop({ required: true })
  estatus: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: false })
  nombreBase: string;

  @Prop()
  clave!: string;

  @Prop({ default: true })
  activo: boolean;
}

export const AdmDocumentoSchema = SchemaFactory.createForClass(AdmDocumento);
