import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmAseguradora } from './adm.aseguradora.schema';
import { AdmDocumento } from './adm.documento.schema';
import { AdmProyecto } from './adm.proyecto.schema';

export type AdmConfiguracionDocumentalDocument =
  HydratedDocument<AdmConfiguracionDocumental>;

export class AdmConfiguracionDocumentalDetalle {
  @Prop({ required: true })
  configuracion: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmDocumento.name })
  documento: Types.ObjectId;

  @Prop({ required: true, default: false })
  visible: boolean;

  @Prop({ required: true, default: true })
  obligatorio: boolean;

  @Prop({ required: true, default: true })
  ocr: boolean;

  @Prop({ required: true, default: true })
  vigencia: boolean;

  @Prop({ required: true })
  motivosRechazo: [{ motivo: Number }];
}

@Schema({
  collection: SchemaPrefix.setADM('configuracion-documental'),
  timestamps: false,
  versionKey: false,
})
export class AdmConfiguracionDocumental {
  _id: Types.ObjectId;
  
  @Prop({ required: true })
  pais: number;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmAseguradora.name })
  aseguradora: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  tipoPersona: number;

  @Prop({ required: true })
  giro: number;

  @Prop({ required: true })
  estatus: number;

  @Prop({ required: true })
  documento: AdmConfiguracionDocumentalDetalle[];
}

export const AdmConfiguracionDocumentalSchema = SchemaFactory.createForClass(
  AdmConfiguracionDocumental,
);
