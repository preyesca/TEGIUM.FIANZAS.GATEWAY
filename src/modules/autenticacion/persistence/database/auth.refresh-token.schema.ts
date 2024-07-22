import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type AuthRefreshTokenDocument = HydratedDocument<AuthRefreshToken>;

@Schema({
  collection: SchemaPrefix.setAUTH('refresh-tokens'),
  timestamps: false,
  versionKey: false,
})
export class AuthRefreshToken {
  @Prop({ required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  proyecto: Types.ObjectId;

  @Prop({ required: true })
  rol: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  fechaHoraCreacion: Date;

  @Prop({ required: true })
  fechaHoraExpiracion: Date;

  @Prop({ required: true, default: true })
  activo: boolean;
}

export const AuthRefreshTokenSchema =
  SchemaFactory.createForClass(AuthRefreshToken);
