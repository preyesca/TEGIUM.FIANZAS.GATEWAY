import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type CatTipoMovimientoDocument = HydratedDocument<CatTipoMovimiento>;

@Schema({
  collection: SchemaPrefix.setCAT('tipos-movimiento'),
  timestamps: false,
  versionKey: false,
})
export class CatTipoMovimiento {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  clave: number;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: true })
  activo: boolean;
}

export const CatTipoMovimientoSchema =
  SchemaFactory.createForClass(CatTipoMovimiento);
