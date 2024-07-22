import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from './adm.proyecto.schema';

export type AdmProyectoFolioDocument = HydratedDocument<AdmProyectoFolio>;

@Schema({
  collection: SchemaPrefix.setADM('proyectos-folio'),
  timestamps: false,
  versionKey: false,
})
export class AdmProyectoFolio {
  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  folio: number;
}

export const AdmProyectoFolioSchema =
  SchemaFactory.createForClass(AdmProyectoFolio);
