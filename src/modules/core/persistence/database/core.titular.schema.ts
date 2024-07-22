import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from 'src/modules/administracion/persistence/database/adm.proyecto.schema';

export type CoreTitularDocument = HydratedDocument<CoreTitular>;

@Schema({
  collection: SchemaPrefix.setCORE('titulares'),
  timestamps: false,
  versionKey: false,
})
export class CoreTitular {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: true, unique: true })
  numeroCliente: string;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: false })
  primerApellido: string;

  @Prop({ required: false })
  segundoApellido: string;

  @Prop({ required: true })
  tipoPersona: number;
}

export const CoreTitularSchema = SchemaFactory.createForClass(CoreTitular);
