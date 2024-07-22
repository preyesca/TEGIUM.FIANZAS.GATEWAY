import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type AuthSesionMfaDocument = HydratedDocument<AuthSesionMfa>;

@Schema({
  collection: SchemaPrefix.setAUTH('sesiones-mfa'),
  timestamps: true,
  versionKey: false,
})
export class AuthSesionMfa {
  @Prop({ required: false })
  usuarioId: Types.ObjectId;

  @Prop({ required: true })
  codigo: number;

  @Prop({ required: true })
  fechaExpiracion: Date;

  @Prop({ required: true })
  correo: string;

  @Prop({ required: true, default: 1 })
  estatus: number;
}

export const AuthSesionMfaSchema = SchemaFactory.createForClass(AuthSesionMfa);
