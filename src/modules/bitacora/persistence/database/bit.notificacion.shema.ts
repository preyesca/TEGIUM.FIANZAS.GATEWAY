import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmProyecto } from 'src/modules/administracion/persistence/database/adm.proyecto.schema';
import { AdmUsuario } from 'src/modules/administracion/persistence/database/adm.usuario.schema';
import { CatPerfil } from 'src/modules/catalogo/persistence/database/cat.perfil.schema';

export type BitNotificacionDocument = HydratedDocument<BitNotificacion>;

@Schema({
  collection: SchemaPrefix.setBITACORA('notificaciones'),
  timestamps: false,
  versionKey: false,
})
export class BitNotificacion {
  _id: Types.ObjectId;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: AdmUsuario.name,
    default: null,
  })
  usuario: Types.ObjectId | null;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: AdmProyecto.name,
    default: null,
  })
  proyecto: Types.ObjectId | null;

  @Prop({
    required: false,
    type: Types.ObjectId,
    ref: CatPerfil.name,
    default: null,
  })
  rol: Types.ObjectId | null;

  @Prop({
    required: false,
    default: null,
  })
  numeroCliente: string | null;

  @Prop({
    required: false,
    default: null,
  })
  correo: string | null;

  @Prop()
  url: string;

  @Prop({ required: true })
  body: mongoose.Schema.Types.Mixed;

  @Prop({ required: false, default: Date.now })
  fechaCreacion: Date;

  @Prop({ required: false, default: false })
  enviado: boolean;

  @Prop({ required: false, default: null })
  fechaEnvio: Date | null;
}

export const BitNotificacionSchema =
  SchemaFactory.createForClass(BitNotificacion);
