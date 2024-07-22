import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from './adm.proyecto.schema';

export type AdmConfiguracionFirmaCotejoDocument =
  HydratedDocument<AdmConfiguracionFirmaCotejo>;

@Schema({
  collection: SchemaPrefix.setADM('configuracion-firma-cotejo'),
  timestamps: false,
  versionKey: false,
})
export class AdmConfiguracionFirmaCotejo {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  ejecutivos: AdmEjecutivo[];
}

export class AdmEjecutivo {
  //@Prop({ default: new Types.ObjectId() })
  _id: Types.ObjectId;
  clave: number;
  nombre: string;
  firma: string;
  path: string;
  contentType: string;
  originalName: string;
}

export const AdmConfiguracionFirmaCotejoSchema = SchemaFactory.createForClass(
  AdmConfiguracionFirmaCotejo,
);
