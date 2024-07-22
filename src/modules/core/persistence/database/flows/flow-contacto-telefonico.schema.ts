import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmUsuario } from 'src/modules/administracion/persistence/database/adm.usuario.schema';
import { CoreFolio } from '../core.folio.schema';

export type FlowContactoTelefonicoDocument =
  HydratedDocument<FlowContactoTelefonico>;

@Schema({
  collection: SchemaPrefix.setFLUJO('contacto-telefonico'),
  timestamps: false,
  versionKey: false,
})
export class FlowContactoTelefonico {
  @Prop({ required: true })
  tipoLlamada: number;

  @Prop({ required: true })
  estatus: number;

  @Prop({ required: true })
  fechaProximaLlamada: Date;

  @Prop({ required: true })
  observaciones: string;

  @Prop({ required: true, default: Date.now })
  fechaContacto: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmUsuario.name })
  usuario: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreFolio.name })
  folio: Types.ObjectId;
}

export const FlowContactoTelefonicoSchema = SchemaFactory.createForClass(
  FlowContactoTelefonico,
);
