import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';
import { AdmUsuario } from 'src/modules/administracion/persistence/database/adm.usuario.schema';

export type AuthSesionUsuarioDocument = HydratedDocument<AuthSesionUsuario>;

@Schema({
  collection: SchemaPrefix.setAUTH('sesiones-usuario'),
  timestamps: false,
  versionKey: false,
})
export class AuthSesionUsuario {
  _id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: AdmUsuario.name })
  usuario: Types.ObjectId;

  @Prop({ type: Date, default: Date.now })
  fechaInicio: Date;

  @Prop({ type: Date, default: null })
  fechaFin: Date;

  @Prop({ type: Date, default: null })
  fechaLogin: Date;
}

export const AuthSesionUsuarioSchema =
  SchemaFactory.createForClass(AuthSesionUsuario);
