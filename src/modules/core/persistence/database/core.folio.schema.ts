import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from 'src/modules/administracion/persistence/database/adm.proyecto.schema';
import { AdmUsuario } from 'src/modules/administracion/persistence/database/adm.usuario.schema';
import { CoreInformacionEjecutivo } from './core.informacion-ejecutivo.schema';
import { CoreTitular } from './core.titular.schema';

export type CoreFolioDocument = HydratedDocument<CoreFolio>;

@Schema({
  collection: SchemaPrefix.setCORE('folios'),
  timestamps: false,
  versionKey: false,
})
export class CoreFolio {
  _id: Types.ObjectId;

  @Prop({ required: true })
  folioMultisistema: number;

  @Prop({ required: true })
  folioCliente: string;

  @Prop({ required: false })
  comentario: string;

  @Prop({ default: Date.now })
  fechaAlta: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmProyecto.name })
  proyecto: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: CoreTitular.name })
  titular: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: CoreInformacionEjecutivo.name,
  })
  ejecutivo: Types.ObjectId;

  @Prop({ required: true })
  tipoCarga: number;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmUsuario.name })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  tipoMovimiento: number;

  @Prop({ required: true })
  giro: number;

  @Prop({ required: true })
  oficina: number;
}

export const CoreFolioSchema = SchemaFactory.createForClass(CoreFolio);
