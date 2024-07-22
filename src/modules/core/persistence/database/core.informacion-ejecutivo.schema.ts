import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from 'src/modules/administracion/persistence/database/adm.proyecto.schema';

export type CoreInformacionEjecutivoDocument =
  HydratedDocument<CoreInformacionEjecutivo>;

@Schema({
  collection: SchemaPrefix.setCORE('informacion-ejecutivo'),
  timestamps: false,
  versionKey: false,
})
export class CoreInformacionEjecutivo {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: false, unique: true })
  numero: string;

  @Prop({ required: false })
  nombre: string;
}

export const CoreInformacionEjecutivoSchema = SchemaFactory.createForClass(
  CoreInformacionEjecutivo,
);
