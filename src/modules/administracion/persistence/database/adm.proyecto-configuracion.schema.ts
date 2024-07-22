import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from './adm.proyecto.schema';

export type AdmProyectoConfiguracionDocument =
  HydratedDocument<AdmProyectoConfiguracion>;

@Schema({
  collection: SchemaPrefix.setADM('proyectos-configuracion'),
  timestamps: false,
  versionKey: false,
})
export class AdmProyectoConfiguracion {
  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: false })
  nombreComercial: String;

  @Prop({ required: false })
  nombreCliente: String;
}

export const AdmProyectoConfiguracionSchema = SchemaFactory.createForClass(
  AdmProyectoConfiguracion,
);
